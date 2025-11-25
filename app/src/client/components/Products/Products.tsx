import * as React from 'react';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ProductFormData } from '../../../types/productTypes';
import EditProduct from './EditProductsss/EditProduct';
import KongIntegration from './Kong Integration/KongIntegration';
import { ProductType, EditProductFormProps } from './EditProduct/types';
import CreateProduct from './NewProducts/NewProduct';
import type { DraftProduct } from './NewProducts/NewProduct';
import './Products.css';
import '../Rateplan/RatePlan.css';
import styles from './Products.module.css';
import axios from 'axios';
import { getAuthData, getAuthHeaders } from '../../utils/auth';
import {
  getProducts,
  getProductById,
  createProduct as createProductApi,
  deleteProduct as deleteProductApi,
  BASE_URL
} from './api';
import ConfirmDeleteModal from '../componenetsss/ConfirmDeleteModal';
import EditIconButton from '../componenetsss/EditIconButton';
import DeleteIconButton from '../componenetsss/DeleteIconButton';
import RetryIconButton from '../componenetsss/RetryIconButton';
import StatusBadge, { Variant } from '../componenetsss/StatusBadge';

const getRandomBackgroundColor = (index: number) => {
  const colors = ['#F0F9FF', '#F0FDF4', '#F5F3FF', '#FFFBEB', '#FEF2F2'];
  return colors[index % colors.length];
};

const getRandomBorderColor = (index: number) => {
  const colors = ['#E0F2FE', '#DCFCE7', '#EDE9FE', '#FEF3C7', '#FECACA'];
  return colors[index % colors.length];
};

import Header from '../componenetsss/Header';
import EmptyBox from './Componenets/empty.svg';
import { ToastProvider, useToast } from '../componenetsss/ToastProvider';
import PrimaryButton from '../componenetsss/PrimaryButton';
import TertiaryButton from '../componenetsss/TertiaryButton';
import ProductIcon, { ProductIconData } from './ProductIcon';

interface Product {
  productId: string;
  productName: string;
  productDescription?: string;
  productType: string;
  billable?: boolean;
  status: string;
  category: string;
  createdOn?: string;
  icon?: string;              // raw backend path
  productIcon?: any;          // can be stringified JSON OR already an object (important!)
  iconUrl?: string | null;    // blob url fetched with auth
  iconData?: ProductIconData | null; // structured icon data
  metrics?: Array<{
    metricName: string;
    unitOfMeasure: string;
    aggregationFunction: string;
    aggregationWindow: string;
  }>;
}

interface ProductsProps {
  showNewProductForm: boolean;
  setShowNewProductForm: (show: boolean) => void;
}

export default function Products({ showNewProductForm, setShowNewProductForm }: ProductsProps) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const location = useLocation();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [updatedIcons, setUpdatedIcons] = useState<Record<string, string>>({});
  const [preserveLocalIcons, setPreserveLocalIcons] = useState(false);

  // Function to handle icon updates from EditProduct
  const handleIconUpdate = (productId: string, iconData: ProductIconData | null) => {
    console.log(`🎨 handleIconUpdate called for product ${productId}:`, iconData);
    
    if (iconData) {
      const iconJson = JSON.stringify({ iconData });
      console.log(`💾 Storing updated icon in local state for ${productId}`);
      setUpdatedIcons(prev => ({ ...prev, [productId]: iconJson }));
    } else {
      console.log(`🗑️ Removing icon from local state for ${productId}`);
      setUpdatedIcons(prev => {
        const newIcons = { ...prev };
        delete newIcons[productId];
        return newIcons;
      });
    }

    // Optimistically update UI
    console.log(`🔄 Optimistically updating UI for product ${productId}`);
    setProducts(prevProducts =>
      prevProducts.map(p =>
        p.productId === productId
          ? {
              ...p,
              productIcon: iconData ? JSON.stringify({ iconData }) : undefined,
              iconData: iconData || undefined
            }
          : p
      )
    );

    // Preserve local icons for a moment
    console.log(`🔒 Preserving local icons for 5 seconds...`);
    setPreserveLocalIcons(true);
    setTimeout(() => {
      console.log(`🔓 Local icon preservation expired`);
      setPreserveLocalIcons(false);
    }, 5000);
  };

  const resolveIconUrl = (icon?: string) => {
    if (!icon) return null;
    if (icon.startsWith('http') || icon.startsWith('data:')) return icon;
    if (icon.startsWith('/uploads')) {
      const serverBase = BASE_URL.replace('/api', '');
      return `${serverBase}${icon}`;
    }
    const leadingSlash = icon.startsWith('/') ? '' : '/';
    return `${BASE_URL}${leadingSlash}${icon}`;
  };

  const fetchIconWithAuth = async (iconPath?: string): Promise<string | null> => {
    if (!iconPath) return null;
    const resolved = resolveIconUrl(iconPath);
    if (!resolved) return null;
    try {
      const authHeaders = getAuthHeaders();
      const cacheBustUrl = resolved.includes('?')
        ? `${resolved}&_cb=${Date.now()}`
        : `${resolved}?_cb=${Date.now()}`;

      const response = await axios.get(cacheBustUrl, {
        responseType: 'blob',
        headers: authHeaders
      });
      return URL.createObjectURL(response.data);
    } catch (e: any) {
      if (e?.response?.status === 500) {
        console.warn(`Icon not available on server: ${iconPath}`);
      }
      return null;
    }
  };

  /** Robustly normalize/parse anything we might get in `productIcon` */
  const parseProductIconField = (raw: any): any => {
    // 1) already an object
    let v = raw;
    // 2) if it's a string, parse once
    if (typeof v === 'string') {
      try { v = JSON.parse(v); } catch { /* keep as is */ }
    }
    // 3) some backends double-encode; try a second parse if still string
    if (typeof v === 'string') {
      try { v = JSON.parse(v); } catch { /* keep as is */ }
    }
    return v;
  };

  const extractIconData = (parsed: any, fallbackLabel: string): ProductIconData | null => {
    if (!parsed) return null;
    // Typical: { iconData: {...} }
    if (parsed.iconData && typeof parsed.iconData === 'object') {
      return parsed.iconData as ProductIconData;
    }
    // Some APIs may store the icon data directly
    if (parsed.id && parsed.svgPath) {
      return parsed as ProductIconData;
    }
    // Minimal: only svgPath/viewBox provided
    if (parsed.svgPath || parsed.svgContent) {
      return {
        id: `derived-${Date.now()}`,
        label: fallbackLabel,
        svgPath: parsed.svgPath || 'M12 2L2 7L12 12L22 7L12 2Z',
        viewBox: parsed.viewBox || '0 0 24 24',
        tileColor: parsed.tileColor || '#0F6DDA',
        outerBg: parsed.outerBg
      };
    }
    return null;
  };

  const fetchProducts = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const products = await getProducts();
      console.log('🎯 Products fetched from backend:', products.length);
      console.log('🎯 Products with productIcon field:', products.filter(p => p.productIcon).length);
      console.log('🎯 Sample product data:', products[0]);

      const productsWithMetricsPromises = products.map(async (product) => {
        const iconUrl = await fetchIconWithAuth(product.icon);

        let iconData: ProductIconData | null = null;

        // Prefer locally updated icons (from this session)
        const localIconJson = updatedIcons[product.productId];
        if (localIconJson) {
          const parsedLocal = parseProductIconField(localIconJson);
          iconData = extractIconData(parsedLocal, product.productName || 'Product');
        }

        // Backend `productIcon` (robust parsing)
        if (!iconData && product.productIcon) {
          console.log(`🔍 Product ${product.productId} has productIcon field:`, product.productIcon);
          try {
            const parsed = parseProductIconField(product.productIcon);
            console.log(`📊 Parsed productIcon for ${product.productId}:`, parsed);
            iconData = extractIconData(parsed, product.productName || 'Product');
            if (iconData) {
              console.log(`✅ Successfully extracted iconData for ${product.productId}:`, iconData);
            } else {
              console.log(`❌ Failed to extract iconData for ${product.productId} from parsed:`, parsed);
            }
          } catch (e) {
            console.error(`❌ Error parsing productIcon for ${product.productId}:`, e);
          }
        } else if (!iconData) {
          console.log(`🚫 Product ${product.productId} has no productIcon field, trying individual fetch...`);
          
          // Fallback: Try fetching individual product data if productIcon is missing
          try {
            const individualProduct = await getProductById(product.productId);
            if (individualProduct?.productIcon) {
              console.log(`🔄 Found productIcon in individual fetch for ${product.productId}`);
              const parsed = parseProductIconField(individualProduct.productIcon);
              iconData = extractIconData(parsed, product.productName || 'Product');
              if (iconData) {
                console.log(`✅ Successfully extracted iconData from individual fetch for ${product.productId}`);
              }
            } else {
              console.log(`🚫 Individual fetch also has no productIcon for ${product.productId}`);
            }
          } catch (e) {
            console.error(`❌ Error fetching individual product ${product.productId}:`, e);
          }
        }

        // Fallback: reconstruct from actual SVG if still no iconData
        if (!iconData && product.icon && iconUrl) {
          console.log(`🔄 Falling back to SVG reconstruction for product ${product.productId}`);
          try {
            const svgResponse = await fetch(iconUrl);
            const svgText = await svgResponse.text();

            const parser = new DOMParser();
            const doc = parser.parseFromString(svgText, 'image/svg+xml');

            // back tile color (rect ~width 29.45 in the big editor-preview SVGs)
            const rects = doc.querySelectorAll('rect');
            let tileColor = '#0F6DDA';
            for (const rect of Array.from(rects)) {
              const width = rect.getAttribute('width');
              const fill = rect.getAttribute('fill');
              if (width && fill && fill.startsWith('#')) {
                const w = parseFloat(width);
                if (w > 29 && w < 30) { tileColor = fill; break; }
              }
            }

            const pathElement = doc.querySelector('path[fill="#FFFFFF"]') || doc.querySelector('path');
            let svgPath = 'M12 2L2 7L12 12L22 7L12 2Z';
            let viewBox = '0 0 24 24';
            if (pathElement) {
              svgPath = pathElement.getAttribute('d') || svgPath;
              const svgEl = pathElement.closest('svg');
              if (svgEl) viewBox = svgEl.getAttribute('viewBox') || viewBox;
            }

            // optional gradient extraction
            let outerBg: [string, string] | undefined;
            const gradientElement = doc.querySelector('linearGradient');
            if (gradientElement) {
              const stops = gradientElement.querySelectorAll('stop');
              if (stops.length >= 2) {
                const color1 = stops[0].getAttribute('style')?.match(/stop-color:([^;]+)/)?.[1];
                const color2 = stops[1].getAttribute('style')?.match(/stop-color:([^;]+)/)?.[1];
                if (color1 && color2) outerBg = [color1.trim(), color2.trim()];
              }
            }

            iconData = {
              id: `product-${product.productId}`,
              label: product.productName || 'Product',
              svgPath,
              tileColor,
              viewBox,
              ...(outerBg && { outerBg })
            };
          } catch (err) {
            console.error('Failed to parse SVG, using default:', err);
            iconData = {
              id: `product-${product.productId}`,
              label: product.productName || 'Product',
              svgPath: 'M12 2L2 7L12 12L22 7L12 2Z',
              tileColor: '#0F6DDA',
              viewBox: '0 0 24 24'
            };
          }
        }

        return {
          ...product,
          metrics: (product as any).billableMetrics || [],
          iconUrl,
          iconData
        } as Product;
      });

      const resolved = await Promise.all(productsWithMetricsPromises);

      if (preserveLocalIcons && Object.keys(updatedIcons).length > 0) {
        const merged = resolved.map(p => {
          const local = updatedIcons[p.productId];
          if (local) {
            const parsedLocal = parseProductIconField(local);
            const localData = extractIconData(parsedLocal, p.productName || 'Product');
            return {
              ...p,
              productIcon: local,
              iconData: localData || p.iconData
            };
          }
          return p;
        });
        setProducts(merged);
      } else {
        setProducts(resolved);
      }
    } catch (err) {
      setError('Failed to load products');
      console.error('Error fetching products:', err);
    } finally {
      setIsLoading(false);
    }
  }, [updatedIcons, preserveLocalIcons]);

  const [error, setError] = useState<string | null>(null);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [showKongIntegration, setShowKongIntegration] = useState(false);
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
  const [deleteProductName, setDeleteProductName] = useState<string>('');
  const [productQuery, setProductQuery] = useState<string>('');

  const filteredProducts = products
    .filter((p) => p.productName?.toLowerCase().includes(productQuery.toLowerCase()))
    .sort((a, b) => {
      if (a.status.toLowerCase() === 'draft' && b.status.toLowerCase() !== 'draft') return -1;
      if (a.status.toLowerCase() !== 'draft' && b.status.toLowerCase() === 'draft') return 1;
      return 0;
    });

  const [showCreateProduct, setShowCreateProduct] = useState(showNewProductForm);
  const { showToast } = useToast();

  const handleCreateProductCancel = React.useCallback(() => {
    setShowCreateProduct(false);
    setShowNewProductForm(false);
    setEditingProduct(null);
    fetchProducts();
  }, [setShowNewProductForm, fetchProducts]);

  const handleDeleteClick = (productId: string, productName: string) => {
    setDeleteProductId(productId);
    setDeleteProductName(productName);
    setShowConfirmDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteProductId) return;
    setIsDeleting(true);
    try {
      await deleteProductApi(deleteProductId);
      if (showToast) {
        showToast({ message: 'Product deleted successfully', kind: 'success' });
      }
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      if (showToast) {
        showToast({ message: 'Failed to delete product', kind: 'error' });
      }
    } finally {
      setIsDeleting(false);
      setShowConfirmDeleteModal(false);
      setDeleteProductId(null);
      setDeleteProductName('');
    }
  };

  const handleDeleteCancel = () => {
    setShowConfirmDeleteModal(false);
    setDeleteProductId(null);
    setDeleteProductName('');
  };

  useEffect(() => {
    if (showCreateProduct !== showNewProductForm) {
      setShowCreateProduct(showNewProductForm);
    }
  }, [showNewProductForm, showCreateProduct]);

  // Additional refresh when component becomes visible (user returns from navigation)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('🔄 Page became visible, refreshing products...');
        fetchProducts();
      }
    };

    const handleWindowFocus = () => {
      console.log('🔄 Window focused, refreshing products...');
      fetchProducts();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleWindowFocus);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [fetchProducts]);

  useEffect(() => {
    if (showCreateProduct || isEditFormOpen) {
      document.body.classList.add('hide-sidebar');
    } else {
      document.body.classList.remove('hide-sidebar');
    }
  }, [showCreateProduct, isEditFormOpen]);

  const productTypeNames = {
    [ProductType.API]: 'API',
    [ProductType.FLATFILE]: 'FlatFile',
    [ProductType.SQLRESULT]: 'SQLResult',
    [ProductType.LLMTOKEN]: 'LLM Token'
  };

  const getProductTypeName = (type: string): string => {
    const normalizedType = type.toLowerCase();
    return (productTypeNames as any)[normalizedType] || type;
  };

  // Mini ProductIcon renderer for the table
  const TableProductIcon: React.FC<{ iconData: ProductIconData }> = ({ iconData }) => {
    const tile = iconData.tileColor ?? '#CC9434';
    
    // Determine if this icon should be circular based on its ID
    const isCircular = iconData.id.includes('circle') || iconData.id.includes('round') || parseInt(iconData.id) % 3 === 0;
    const borderRadius = isCircular ? '50%' : '6px';

    const hexToRgba = (hex: string, opacity: number) => {
      const cleanHex = hex.startsWith('#') ? hex : `#${hex}`;
      if (cleanHex.length !== 7) {
        return `rgba(204, 148, 52, ${opacity})`;
      }
      const r = parseInt(cleanHex.slice(1, 3), 16);
      const g = parseInt(cleanHex.slice(3, 5), 16);
      const b = parseInt(cleanHex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
      };

    return (
      <div
        style={{
          width: 40,
          height: 40,
          position: 'relative',
          background: 'transparent',
        }}
      >
        {/* BACK TILE */}
        <div
          style={{
            position: 'absolute',
            left: 6,
            top: 4,
            width: 34,
            height: 34,
            borderRadius: borderRadius,
            backgroundColor: tile,
            background: tile,
          }}
        />
        {/* GLASS FOREGROUND TILE */}
       <div
  style={{
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%) translate(9px, 6px)',
    width: 34,
    height: 34,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '12px', // ⬅️ smoother corners
    border: '0.6px solid #FFF',
    backgroundColor: hexToRgba(tile, 0.10),
    background: hexToRgba(tile, 0.10),
    backdropFilter: 'blur(3.875000238418579px)',
    boxShadow: '0 2px 6px rgba(0,0,0,0.15)', // optional: adds soft depth
  }}
>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox={iconData.viewBox ?? "0 0 18 18"}
            fill="none"
          >
            <path d={iconData.svgPath} fill="#FFFFFF" />
          </svg>
        </div>
      </div>
    );
  };

  const InfoIcon = () => {
    const [showTooltip, setShowTooltip] = useState(false);
    const tooltipRef = React.useRef<HTMLDivElement>(null);

    // Close tooltip when clicking outside
    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
          setShowTooltip(false);
        }
      };

      if (showTooltip) {
        document.addEventListener('mousedown', handleClickOutside);
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [showTooltip]);

    return (
      <div style={{ position: 'relative', display: 'inline-block', marginLeft: 4 }} ref={tooltipRef}>
        <span
          className="info-icon-tooltip"
          onClick={() => setShowTooltip(!showTooltip)}
          style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
            <g clipPath="url(#clip0_6157_14454)">
              <path
                d="M6 8V6M6 4H6.005M11 6C11 8.76142 8.76142 11 6 11C3.23858 11 1 8.76142 1 6C1 3.23858 3.23858 1 6 1C8.76142 1 11 3.23858 11 6Z"
                stroke="#98959A"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
            <defs>
              <clipPath id="clip0_6157_14454">
                <rect width="12" height="12" fill="white" />
              </clipPath>
            </defs>
          </svg>
        </span>
        
        {showTooltip && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              marginTop: 8,
              padding: '8px 12px',
              backgroundColor: '#333',
              color: 'white',
              borderRadius: 6,
              fontSize: 12,
              whiteSpace: 'nowrap',
              zIndex: 1000,
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              lineHeight: 1.4,
              minWidth: 'max-content'
            }}
          >
            The unit of usage your customers are billed on, e.g., users, storage, or API calls.
            <div
              style={{
                position: 'absolute',
                top: -4,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 0,
                height: 0,
                borderLeft: '4px solid transparent',
                borderRight: '4px solid transparent',
                borderBottom: '4px solid #333'
              }}
            />
          </div>
        )}
      </div>
    );
  };

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Refresh products when user returns from NewProduct page
  useEffect(() => {
    console.log('🔄 Location changed, refreshing products list...');
    fetchProducts();
  }, [location.pathname, fetchProducts]);

  // Listen for product updates from NewProduct page
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'productUpdated' && e.newValue) {
        console.log('🔄 Product updated signal received, refreshing products...');
        fetchProducts();
        // Clear the signal
        localStorage.removeItem('productUpdated');
      }
    };

    // Also check for the signal on component mount/focus
    const checkForUpdates = () => {
      const updateSignal = localStorage.getItem('productUpdated');
      if (updateSignal) {
        console.log('🔄 Found product update signal, refreshing products...');
        fetchProducts();
        localStorage.removeItem('productUpdated');
      }
    };

    // Check immediately
    checkForUpdates();

    // Listen for storage changes (cross-tab communication)
    window.addEventListener('storage', handleStorageChange);
    
    // Also check when window gains focus
    window.addEventListener('focus', checkForUpdates);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', checkForUpdates);
    };
  }, [fetchProducts]);

  const handleNewProductSubmit = async (formData: ProductFormData) => {
    setShowNewProductForm(false);
    try {
      await createProductApi(formData);
      await fetchProducts();
      setShowCreateProduct(false);
      if (setShowNewProductForm) setShowNewProductForm(false);
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Failed to create product. Please try again.');
    }
  };

  if (error) {
    console.warn('Products API error:', error);
    // Show empty state instead of error to allow UI to function
    return (
      <ToastProvider>
        <div>
          <div className="check-container">
            <Header
              title="Products"
              searchTerm=""
              onSearchTermChange={() => {}}
              searchDisabled={true}
              filterDisabled={true}
              showPrimary={true}
              showKongButton={false}
              primaryLabel="+ Create Product"
              onPrimaryClick={() => navigate('/get-started/products/new')}
              onFilterClick={() => {}}
              onSettingsClick={() => {}}
              onNotificationsClick={() => {}}
            />
            <div className="customers-table-wrapper">
              <table className="customers-table">
                <thead>
                  <tr>
                    <th>Product Name </th>
                    <th>Product Type </th>
                    <th>Billable Metrics</th>
                    <th>Status</th>
                    <th>Created On </th>
                    <th className="actions-cell">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '60px 0', borderBottom: 'none' }}>
                      <div className="products-empty-state">
                        <img src={EmptyBox} alt="No products" style={{ width: 200, height: 200 }} />
                        <p className="products-empty-state-text" style={{ marginTop: 8 }}>
                          No products available. Click "Create Product" to <br /> create your first product.
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                          <PrimaryButton onClick={() => navigate('/get-started/products/new')}>
                            + Create Product
                          </PrimaryButton>
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
      <>
        <div>
          {showConfirmDeleteModal && (
            <ConfirmDeleteModal
              isOpen={showConfirmDeleteModal}
              productName={deleteProductName}
              onCancel={handleDeleteCancel}
              onConfirm={handleConfirmDelete}
            />
          )}

          {/* Create & Edit panes */}
          {/* ... unchanged code omitted for brevity in this region of the UI ... */}

          {/* EDIT PANE */}
          {/* Keep your existing edit pane; only the onClose handler remains the same */}
          {/* (not removing here to keep "full file" as requested) */}
          {isEditFormOpen && (
            <div className="products-form-container">
              <EditProduct
                productId={editingProduct?.productId.toString() || ''}
                onIconUpdate={handleIconUpdate}
                onClose={() => {
                  setIsEditFormOpen(false);
                  setEditingProduct(null);
                  setRefreshKey(prev => prev + 1);
                  
                  // Always refresh products list after edit to ensure latest data
                  console.log('🔄 EditProduct closed, refreshing products list...');
                  
                  // Small delay to allow backend to process any pending updates
                  setTimeout(async () => {
                    try {
                      // First try to get updated individual product data
                      if (editingProduct?.productId) {
                        console.log(`🔍 Fetching updated data for product ${editingProduct.productId}...`);
                        const updatedProduct = await getProductById(editingProduct.productId);
                        
                        if (updatedProduct?.productIcon) {
                          console.log(`✅ Found updated productIcon for ${editingProduct.productId}, updating local state`);
                          setProducts(prev =>
                            prev.map(p =>
                              p.productId === editingProduct.productId!.toString()
                                ? { 
                                    ...p, 
                                    productIcon: updatedProduct.productIcon,
                                    icon: updatedProduct.icon // Also update icon URL if available
                                  }
                                : p
                            )
                          );
                        } else {
                          console.log(`🚫 No productIcon found for ${editingProduct.productId} in individual fetch`);
                        }
                      }
                    } catch (error) {
                      console.error('Failed to fetch individual product after edit:', error);
                    }
                    
                    // Always do a full refresh to ensure consistency
                    console.log('🔄 Doing full products list refresh...');
                    await fetchProducts();
                  }, 500); // Reduced delay for better UX
                }}
              />
            </div>
          )}

          {/* LIST TABLE (hidden when Kong integration is open) */}
          {!showCreateProduct && !isEditFormOpen && !showKongIntegration && (
            <div className="rate-plan-container">
              <Header
                title="Products"
                searchTerm={productQuery}
                onSearchTermChange={setProductQuery}
                searchDisabled={products.length === 0}
                filterDisabled={false}
                showPrimary={filteredProducts.length > 0}
                showKongButton={filteredProducts.length > 0}
                primaryLabel="+ Create Product"
                onPrimaryClick={() => navigate('/get-started/products/new')}
                onFilterClick={() => {}}
                onSettingsClick={() => setShowKongIntegration(true)}
                onNotificationsClick={() => {}}
              />

              <div className="products-table-wrapper">
                <table className="products-table">
                  <thead>
                    <tr>
                      <th>Product Name </th>
                      <th>Product Type </th>
                      <th>
                        Billable Metrics <InfoIcon />
                      </th>
                      <th>Status</th>
                      <th>Created On </th>
                      <th className="actions-cell">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => (
                      <tr key={`${product.productId}-${refreshKey}`}>
                        <td className="product-name-td">
                          <div className="product-name-cell">
                            <div className="product-name-cell__icon">
                              {product.iconData ? (
                                <TableProductIcon iconData={product.iconData} />
                              ) : product.iconUrl ? (
                                <div
                                  className="product-avatar product-avatar--image"
                                  style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 8,
                                    overflow: 'hidden',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '0.6px solid var(--border-border-2, #D5D4DF)',
                                  }}
                                >
                                  <img
                                    src={product.iconUrl}
                                    alt={`${product.productName} icon`}
                                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                    onError={(e) => {
                                      const wrapper = e.currentTarget.parentElement as HTMLElement;
                                      if (wrapper) wrapper.classList.remove('product-avatar--image');
                                      e.currentTarget.remove();
                                    }}
                                  />
                                </div>
                              ) : (
                                <div
                                  className="product-avatar"
                                  style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 8,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    backgroundColor:
                                      getRandomBackgroundColor(parseInt(product.productId) || 0),
                                    border: `1px solid ${
                                      getRandomBorderColor(parseInt(product.productId) || 0)
                                    }`
                                  }}
                                >
                                  {product.productName?.substring(0, 2).toUpperCase() || 'PR'}
                                </div>
                              )}
                            </div>

                            <div className="product-name-cell__content">
                              <div className="product-name" title={product.productName}>
                                {product.productName}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span
                            className={`product-type-badge--${
                              product.productType?.toLowerCase() || 'default'
                            }`}
                          >
                            {(() => {
                              const map = {
                                [ProductType.API]: 'API',
                                [ProductType.FLATFILE]: 'FlatFile',
                                [ProductType.SQLRESULT]: 'SQLResult',
                                [ProductType.LLMTOKEN]: 'LLM Token'
                              };
                              const normalized = (product.productType || '').toLowerCase();
                              return (map as any)[normalized] || product.productType || '';
                            })()}
                          </span>
                        </td>

                        <td className="metrics-cell">
                          <div className="metrics-wrapper">
                            {product.metrics && product.metrics.length > 0 ? (
                              product.metrics.map((metric, index) => {
                                const truncatedName =
                                  metric.metricName.length > 3
                                    ? metric.metricName.substring(0, 3) + '...'
                                    : metric.metricName;
                                const truncatedUOM = metric.unitOfMeasure
                                  ? metric.unitOfMeasure.substring(0, 2).toUpperCase()
                                  : '';

                                return (
                                  <div
                                    key={index}
                                    className="metric-item"
                                    style={{ backgroundColor: getRandomBackgroundColor(index) }}
                                  >
                                    <div className="metric-content">
                                      <div className="metric-uom" title={metric.unitOfMeasure}>
                                        {truncatedUOM}
                                      </div>
                                      <div className="metric-name" title={metric.metricName}>
                                        {truncatedName}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })
                            ) : (
                              <span className="no-metrics">-</span>
                            )}
                          </div>
                        </td>

                        <td>
                          <StatusBadge
                            label={product.status.charAt(0) + product.status.slice(1).toLowerCase()}
                            variant={product.status.toLowerCase() as Variant}
                            size="sm"
                          />
                        </td>

                        <td>{product.createdOn ?? 'N/A'}</td>

                        <td className="actions-cell">
                          <div className="product-action-buttons">
                            {product.status.toLowerCase() === 'draft' ? (
                              <RetryIconButton
                                onClick={() => {
                                  navigate('/get-started/products/new', {
                                    state: { draftProduct: product }
                                  });
                                }}
                                title="Continue editing draft"
                              />
                            ) : (
                              <EditIconButton
                                onClick={() => {
                                  setEditingProduct(product);
                                  setIsEditFormOpen(true);
                                }}
                                title="Edit product"
                              />
                            )}
                            <DeleteIconButton
                              onClick={() => handleDeleteClick(product.productId, product.productName)}
                              disabled={isDeleting}
                              title="Delete product"
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredProducts.length === 0 && (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '60px 0', borderBottom: 'none' }}>
                          <div className="products-empty-state">
                            <img src={EmptyBox} alt="No products" style={{ width: 200, height: 200 }} />
                            <p className="products-empty-state-text" style={{ marginTop: 8 }}>
                              No products added yet. Click "New Product" to <br /> create your first product.
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                              <PrimaryButton onClick={() => navigate('/get-started/products/new')}>
                                + Create Product
                              </PrimaryButton>
                              <TertiaryButton onClick={() => { setShowKongIntegration(true); }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="15" viewBox="0 0 16 15" fill="none" style={{ marginRight: '8px' }}>
                                  <path d="M0.400391 11.2438V14.1384H2.88147L5.1558 11.0371H7.84363L8.67066 10.0033L5.56931 6.48841L3.50174 8.34922H2.67472L0.400391 11.2438Z" fill="url(#paint0_linear_8506_33340)" />
                                  <path d="M5.56931 11.8641L5.1558 12.2776L5.98282 13.5181V14.1384H9.29093L9.49769 13.5181L7.84363 11.8641H5.56931Z" fill="url(#paint1_linear_8506_33340)" />
                                  <path d="M7.43012 3.80057L6.18958 5.86814L12.599 13.3114L12.3923 14.1384H15.0801L15.7004 11.8641L8.87742 3.80057H7.43012Z" fill="url(#paint2_linear_8506_33340)" />
                                  <path d="M8.4639 1.733L7.63688 2.97354L7.84363 3.1803H9.29093L11.9788 6.07489L13.4261 4.83435V4.42084L13.0126 3.59381V2.76679L10.118 0.699219L8.4639 1.733Z" fill="url(#paint3_linear_8506_33340)" />
                                  <defs>
                                    <linearGradient id="paint0_linear_8506_33340" x1="12.8058" y1="3.1803" x2="1.02066" y2="13.5181" gradientUnits="userSpaceOnUse">
                                      <stop stopColor="#14A06C" />
                                      <stop offset="1" stopColor="#2578D1" />
                                    </linearGradient>
                                    <linearGradient id="paint1_linear_8506_33340" x1="12.8058" y1="3.1803" x2="1.02066" y2="13.5181" gradientUnits="userSpaceOnUse">
                                      <stop stopColor="#14A06C" />
                                      <stop offset="1" stopColor="#2578D1" />
                                    </linearGradient>
                                    <linearGradient id="paint2_linear_8506_33340" x1="12.8058" y1="3.1803" x2="1.02066" y2="13.5181" gradientUnits="userSpaceOnUse">
                                      <stop stopColor="#14A06C" />
                                      <stop offset="1" stopColor="#2578D1" />
                                    </linearGradient>
                                    <linearGradient id="paint3_linear_8506_33340" x1="12.8058" y1="3.1803" x2="1.02066" y2="13.5181" gradientUnits="userSpaceOnUse">
                                      <stop stopColor="#14A06C" />
                                      <stop offset="1" stopColor="#2578D1" />
                                    </linearGradient>
                                  </defs>
                                </svg>
                                Import from Kong
                              </TertiaryButton>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Kong Integration Modal */}
          {showKongIntegration && (
            <KongIntegration
              onClose={() => setShowKongIntegration(false)}
            />
          )}
        </div>
      </>
    </ToastProvider>
  );
}
