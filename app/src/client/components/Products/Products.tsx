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
  createProduct as createProductApi,
  deleteProduct as deleteProductApi,
  BASE_URL
} from './api';
import ConfirmDeleteModal from '../componenetsss/ConfirmDeleteModal';

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
  icon?: string; // raw backend path
  productIcon?: string; // JSON string containing structured icon data from API
  iconUrl?: string | null; // blob url fetched with auth
  iconData?: ProductIconData | null; // structured icon data from ProductIconPicker
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
    console.log('🔔 handleIconUpdate called:', { productId, iconData });
    
    if (iconData) {
      console.log('📝 Storing updated icon data for product:', productId, iconData);
      const iconJson = JSON.stringify({ iconData });
      setUpdatedIcons(prev => ({ ...prev, [productId]: iconJson }));
    } else {
      console.log('🗑️ Removing icon data for product:', productId);
      setUpdatedIcons(prev => {
        const newIcons = { ...prev };
        delete newIcons[productId];
        return newIcons;
      });
    }
    
    // Update the products list immediately with the new icon data
    console.log('🔄 Updating products list with new icon data...');
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
    
    // Set flag to preserve local icons during any future fetchProducts calls
    setPreserveLocalIcons(true);
    
    // Reset preserve flag after 5 seconds to allow normal refreshes later
    setTimeout(() => {
      console.log('🔓 Resetting preserve flag - allowing normal refreshes');
      setPreserveLocalIcons(false);
    }, 5000);
    
    // Don't fetch here - let onClose handle the backend refresh with proper delay
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
      // Add cache-busting parameter to force fresh icon fetch
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

  const fetchProducts = React.useCallback(async () => {
    console.log('🔄 fetchProducts called - starting fresh fetch...');
    setIsLoading(true);
    try {
      const products = await getProducts();
      console.log('📦 Raw products from API:', products);
      
      // Check if any products have the productIcon field
      const productsWithIcon = products.filter((p: any) => p.productIcon);
      console.log('🎯 Products with productIcon field:', productsWithIcon.length);
      if (productsWithIcon.length > 0) {
        console.log('📝 Sample productIcon data:', productsWithIcon[0].productIcon);
      }
      
      const productsWithMetricsPromises = products.map(async (product) => {
        console.log('🔍 Processing product:', product.productName, 'ID:', product.productId);
        console.log('🔍 ALL product fields:', Object.keys(product));
        console.log('🔍 Full product object:', product);
        console.log('🖼️ Raw icon field:', product.icon);
        console.log('🎨 Raw productIcon field:', product.productIcon);
        
        // Check for alternative field names
        const altFields = ['product_icon', 'producticon', 'iconData', 'icon_data'];
        altFields.forEach(field => {
          if ((product as any)[field]) {
            console.log(`🔍 Found alternative field ${field}:`, (product as any)[field]);
          }
        });
        
        const iconUrl = await fetchIconWithAuth(product.icon);
        console.log('🌐 Fetched iconUrl:', iconUrl);
        
        // Try to parse structured icon data
        let iconData: ProductIconData | null = null;
        try {
          // First check if we have locally updated icon data - ALWAYS prioritize this
          const localIconData = updatedIcons[product.productId];
          if (localIconData) {
            console.log('🎯 Using locally stored icon data for product:', product.productId);
            const parsed = JSON.parse(localIconData);
            if (parsed.iconData) {
              iconData = parsed.iconData as ProductIconData;
              console.log('✅ Using local iconData - SKIPPING backend data:', iconData);
              // Skip all backend processing for this product - use local data only
            }
          } else if (product.productIcon) {
            console.log('📝 Attempting to parse productIcon JSON...');
            const parsed = JSON.parse(product.productIcon);
            console.log('✅ Parsed productIcon data:', parsed);
            if (parsed.iconData) {
              iconData = parsed.iconData as ProductIconData;
              console.log('🎯 Extracted iconData:', iconData);
            } else {
              console.log('⚠️ No iconData found in parsed object');
            }
          } else {
            console.log('❌ No productIcon field found');
            // Fallback: Try to fetch and parse the actual SVG content
            if (product.icon && iconUrl) {
              console.log('🔧 Attempting to fetch and parse SVG content...');
              try {
                // Fetch the SVG content
                const svgResponse = await fetch(iconUrl);
                const svgText = await svgResponse.text();
                console.log('📄 Fetched SVG content length:', svgText.length);
                
                // Parse the SVG to extract icon data
                const parser = new DOMParser();
                const doc = parser.parseFromString(svgText, 'image/svg+xml');
                
                // Extract the tile color from the rect with specific dimensions (the back tile)
                // Looking for: <rect x="12" y="9" width="29.45" height="25.243" rx="5.7" fill="#0F6DDA"/>
                const rects = doc.querySelectorAll('rect');
                let tileColor = '#0F6DDA'; // default
                for (const rect of rects) {
                  const width = rect.getAttribute('width');
                  const fill = rect.getAttribute('fill');
                  // Find the back tile rect (width="29.45" or similar)
                  if (width && parseFloat(width) > 29 && parseFloat(width) < 30 && fill && fill.startsWith('#')) {
                    tileColor = fill;
                    console.log('🎨 Extracted tile color:', tileColor);
                    break;
                  }
                }
                
                // Extract the icon path
                const pathElement = doc.querySelector('path[fill="#FFFFFF"]');
                let svgPath = 'M12 2L2 7L12 12L22 7L12 2Z'; // default
                let viewBox = '0 0 24 24';
                if (pathElement) {
                  svgPath = pathElement.getAttribute('d') || svgPath;
                  const svgElement = pathElement.closest('svg');
                  if (svgElement) {
                    viewBox = svgElement.getAttribute('viewBox') || viewBox;
                  }
                  console.log('📐 Extracted path and viewBox');
                }
                
                // Extract gradient colors if available
                let outerBg: [string, string] | undefined;
                const gradientElement = doc.querySelector('linearGradient');
                if (gradientElement) {
                  const stops = gradientElement.querySelectorAll('stop');
                  if (stops.length >= 2) {
                    const color1 = stops[0].getAttribute('style')?.match(/stop-color:([^;]+)/)?.[1];
                    const color2 = stops[1].getAttribute('style')?.match(/stop-color:([^;]+)/)?.[1];
                    if (color1 && color2) {
                      outerBg = [color1.trim(), color2.trim()];
                      console.log('🌈 Extracted gradient colors:', outerBg);
                    }
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
                console.log('✅ Reconstructed iconData from SVG:', iconData);
              } catch (err) {
                console.error('❌ Failed to parse SVG:', err);
                // Fallback to default icon
                iconData = {
                  id: `product-${product.productId}`,
                  label: product.productName || 'Product',
                  svgPath: 'M12 2L2 7L12 12L22 7L12 2Z',
                  tileColor: '#0F6DDA',
                  viewBox: '0 0 24 24'
                };
              }
            }
          }
        } catch (e) {
          console.error('💥 Error parsing productIcon JSON:', e);
          // If parsing fails, iconData remains null and we'll fall back to iconUrl or initials
        }
        
        const productWithMetrics = {
          ...product,
          metrics: (product as any).billableMetrics || [],
          iconUrl,
          iconData
        } as Product;
        console.log('🏁 Final product with icon data:', {
          name: productWithMetrics.productName,
          hasIconUrl: !!productWithMetrics.iconUrl,
          hasIconData: !!productWithMetrics.iconData,
          iconData: productWithMetrics.iconData
        });
        return productWithMetrics;
      });

      const resolved = await Promise.all(productsWithMetricsPromises);
      console.log('✅ Setting products state with resolved data:', resolved.length, 'products');
      console.log('🎯 Products with iconData after processing:', resolved.filter(p => p.iconData).length);
      
      // If we have local icon updates and preserve flag is set, merge them back in
      if (preserveLocalIcons && Object.keys(updatedIcons).length > 0) {
        console.log('🔒 Preserving local icon updates during fetchProducts...');
        const mergedProducts = resolved.map(product => {
          const localIconData = updatedIcons[product.productId];
          if (localIconData) {
            console.log('🔄 Restoring local icon for product:', product.productId);
            const parsed = JSON.parse(localIconData);
            return {
              ...product,
              productIcon: localIconData,
              iconData: parsed.iconData
            };
          }
          return product;
        });
        setProducts(mergedProducts);
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
    console.log('🎨 TableProductIcon rendering with iconData:', iconData);
    const tile = iconData.tileColor ?? '#CC9434';
    
    console.log('🎨 TableProductIcon tile color:', tile);
    console.log('🎨 TableProductIcon outerBg:', iconData.outerBg);
    
    const hexToRgba = (hex: string, opacity: number) => {
      // Ensure hex starts with #
      const cleanHex = hex.startsWith('#') ? hex : `#${hex}`;
      if (cleanHex.length !== 7) {
        console.warn('Invalid hex color:', hex, 'using fallback');
        return `rgba(204, 148, 52, ${opacity})`; // fallback color
      }
      
      const r = parseInt(cleanHex.slice(1, 3), 16);
      const g = parseInt(cleanHex.slice(3, 5), 16);
      const b = parseInt(cleanHex.slice(5, 7), 16);
      
      const rgba = `rgba(${r}, ${g}, ${b}, ${opacity})`;
      console.log('🎨 hexToRgba:', cleanHex, '->', rgba);
      return rgba;
    };

    return (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          border: '0.6px solid var(--border-border-2, #D5D4DF)',
          background: hexToRgba(tile, 0.15),
          backgroundColor: '#FFF',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* BACK TILE */}
        <div
          style={{
            position: 'absolute',
            left: 6,
            top: 4,
            width: 16,
            height: 16,
            borderRadius: 3,
            backgroundColor: tile,
            background: tile,
          }}
        />
        {/* GLASS FOREGROUND TILE */}
        <div
          style={{
            width: 18,
            height: 18,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 4,
            border: '0.6px solid #FFF',
            backgroundColor: hexToRgba(tile, 0.10),
            background: hexToRgba(tile, 0.10),
            backdropFilter: 'blur(2px)',
            transform: 'translate(2px, 1px)',
            boxShadow: 'inset 0 1px 4px rgba(255,255,255,0.35)',
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="10"
            height="10"
            viewBox={iconData.viewBox ?? "0 0 18 18"}
            fill="none"
          >
            <path d={iconData.svgPath} fill="#FFFFFF" />
          </svg>
        </div>
      </div>
    );
  };

  const InfoIcon = () => (
    <span
      className="info-icon-tooltip"
      title="The unit of usage your customers are billed on, e.g., users, storage, or API calls"
      style={{ marginLeft: 4, cursor: 'help' }}
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
  );

  useEffect(() => {
    fetchProducts();
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

  const handleDeleteConfirm = async () => {
    if (!deleteProductId) return;
    setIsDeleting(true);
    try {
      await deleteProductApi(deleteProductId);
      await fetchProducts();
      setShowConfirmDeleteModal(false);
      setDeleteProductId(null);
      showToast({
        kind: 'success',
        title: 'Product Deleted',
        message: `The product “${deleteProductName}” was successfully deleted.`
      });
    } catch (err) {
      console.error('Failed to delete product:', err);
      showToast({
        kind: 'error',
        title: 'Failed to Delete',
        message: `Failed to delete the product “${deleteProductName}”. Please try again.`
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (error) return <div className="error">Something Went wrong: {error}</div>;

  return (
    <ToastProvider>
      <>
        <div>
          {showConfirmDeleteModal && (
            <ConfirmDeleteModal
              isOpen={showConfirmDeleteModal}
              productName={deleteProductName}
              onCancel={handleDeleteCancel}
              onConfirm={handleDeleteConfirm}
            />
          )}

          {showCreateProduct && !isEditFormOpen && (
            <CreateProduct
              onClose={handleCreateProductCancel}
              draftProduct={editingProduct as unknown as DraftProduct}
            />
          )}

          {showKongIntegration && (
            <div className="products-form-container">
              <KongIntegration onClose={() => setShowKongIntegration(false)} />
            </div>
          )}

          {isEditFormOpen && (
            <div className="products-form-container">
              <EditProduct
                productId={editingProduct?.productId.toString() || ''}
                onIconUpdate={handleIconUpdate}
                onClose={() => {
                  setIsEditFormOpen(false);
                  setEditingProduct(null);
                  // Force refresh products list to show updated data
                  console.log('🔄 EditProduct closed - checking if refresh needed...');
                  setRefreshKey(prev => prev + 1); // Force component refresh
                  
                  // Only do backend refresh if we don't have local icon updates
                  const hasLocalIconUpdate = editingProduct?.productId && updatedIcons[editingProduct.productId];
                  
                  if (hasLocalIconUpdate) {
                    console.log('✅ Using local icon data - skipping backend refresh to prevent flickering');
                    // Don't fetch from backend - we already have the updated data locally
                  } else {
                    console.log('🔄 No local icon data - doing backend refresh...');
                    setTimeout(async () => {
                      // Try to fetch individual product first to get updated icon data
                      if (editingProduct?.productId) {
                        try {
                          console.log('🔍 Fetching individual product data for updated icon...');
                          // Add cache-busting to ensure fresh data
                          const timestamp = Date.now();
                          const response = await fetch(`${BASE_URL}/products/${editingProduct.productId}?_t=${timestamp}`, {
                            headers: getAuthHeaders()
                          });
                          if (response.ok) {
                            const updatedProduct = await response.json();
                            console.log('📦 Individual product data:', updatedProduct);
                            console.log('🎨 Individual product productIcon field:', updatedProduct.productIcon);
                            
                            // Update the specific product in the list if we got icon data
                            if (updatedProduct.productIcon) {
                              console.log('✅ Got updated productIcon, updating products list...');
                              setProducts(prevProducts => 
                                prevProducts.map(p => 
                                  p.productId === editingProduct.productId.toString() 
                                    ? { ...p, productIcon: updatedProduct.productIcon }
                                    : p
                                )
                              );
                            }
                          }
                        } catch (error) {
                          console.error('❌ Failed to fetch individual product:', error);
                        }
                      }
                      
                      // Always do the full refresh as backup
                      fetchProducts();
                    }, 1000); // Longer delay to ensure backend has fully processed the icon update
                  }
                }}
              />
            </div>
          )}

          {!showCreateProduct && !isEditFormOpen && (
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
                        {/* ===== Product Name cell (spec-accurate) ===== */}
                        <td className="product-name-td">
                          <div className="product-name-cell">
                            <div className="product-name-cell__icon">
                              {(() => {
                                console.log('🎭 Rendering icon for product:', product.productName);
                                console.log('🎨 Has iconData:', !!product.iconData, product.iconData);
                                console.log('🖼️ Has iconUrl:', !!product.iconUrl, product.iconUrl);
                                
                                if (product.iconData) {
                                  console.log('✅ Using TableProductIcon with iconData');
                                  return <TableProductIcon iconData={product.iconData} />;
                                } else if (product.iconUrl) {
                                  console.log('🌐 Using iconUrl fallback');
                                  return (
                                    <div 
                                      className="product-avatar product-avatar--image"
                                      style={{
                                        width: 32,
                                        height: 32,
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
                                        style={{
                                          width: '100%',
                                          height: '100%',
                                          objectFit: 'contain',
                                        }}
                                        onError={(e) => {
                                          const wrapper = e.currentTarget.parentElement as HTMLElement;
                                          if (wrapper) wrapper.classList.remove('product-avatar--image');
                                          e.currentTarget.remove();
                                        }}
                                      />
                                    </div>
                                  );
                                } else {
                                  console.log('🔤 Using initials fallback');
                                  return (
                                    <div
                                      className="product-avatar"
                                      style={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: 8,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '12px',
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
                                  );
                                }
                              })()}
                            </div>

                            <div className="product-name-cell__content">
                              <div className="product-name" title={product.productName}>
                                {product.productName}
                              </div>
                              {/* (optional) you can add tiny chips here later */}
                            </div>
                          </div>
                        </td>

                        <td>
                          <span
                            className={`product-type-badge--${
                              product.productType?.toLowerCase() || 'default'
                            }`}
                          >
                            {getProductTypeName(product.productType || '')}
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
                          <span
                            className={`product-status-badge status-${product.status.toLowerCase()}`}
                          >
                            {product.status.charAt(0) + product.status.slice(1).toLowerCase()}
                          </span>
                        </td>

                        <td>{product.createdOn ?? 'N/A'}</td>

                        <td className="actions-cell">
                          <div className="product-action-buttons">
                            {product.status.toLowerCase() === 'draft' ? (
                              <button
                                className="product-view-button"
                                onClick={() => {
                                  navigate('/get-started/products/new', {
                                    state: { draftProduct: product }
                                  });
                                }}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 16 16"
                                  fill="none"
                                >
                                  <path
                                    d="M7.99967 1.33325C11.6816 1.33325 14.6663 4.31802 14.6663 7.99992C14.6663 11.6818 11.6816 14.6666 7.99967 14.6666C4.31778 14.6666 1.33301 11.6818 1.33301 7.99992H5.33301H10.6663M10.6663 7.99992L7.99967 10.6666M10.6663 7.99992L7.99967 5.33325"
                                    stroke="#025A94"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </button>
                            ) : (
                              <button
                                className="product-edit-button"
                                onClick={() => {
                                  setShowCreateProduct(false);
                                  setShowNewProductForm(false);
                                  setEditingProduct(product);
                                  setIsEditFormOpen(true);
                                }}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="14"
                                  height="14"
                                  viewBox="0 0 14 14"
                                  fill="none"
                                >
                                  <path
                                    d="M7.00031 12.3334H13.0003M9.91764 1.41473C10.183 1.14934 10.543 1.00024 10.9183 1.00024C11.2936 1.00024 11.6536 1.14934 11.919 1.41473C12.1844 1.68013 12.3335 2.04008 12.3335 2.4154C12.3335 2.79072 12.1844 3.15067 11.919 3.41607L3.91231 11.4234C3.75371 11.582 3.55766 11.698 3.34231 11.7607L1.42764 12.3194C1.37028 12.3361 1.30947 12.3371 1.25158 12.3223C1.1937 12.3075 1.14086 12.2774 1.09861 12.2351C1.05635 12.1929 1.02624 12.140 1.01141 12.0821C0.996575 12.0242 0.997578 11.9634 1.01431 11.9061L1.57298 9.9914C1.63579 9.77629 1.75181 9.58048 1.91031 9.42207L9.91764 1.41473Z"
                                    stroke="#1D7AFC"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </button>
                            )}
                            <button
                              className="product-delete-button"
                              onClick={() => handleDeleteClick(product.productId, product.productName)}
                              disabled={isDeleting}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="17"
                                height="16"
                                viewBox="0 0 17 16"
                                fill="none"
                              >
                                <path
                                  d="M2.59961 4.00016H14.5996M13.2663 4.00016V13.3335C13.2663 14.0002 12.5996 14.6668 11.9329 14.6668H5.26628C4.59961 14.6668 3.93294 14.0002 3.93294 13.3335V4.00016M5.93294 4.00016V2.66683C5.93294 2.00016 6.59961 1.3335 7.26628 1.3335H9.93294C10.5996 1.3335 11.2663 2.00016 11.2663 2.66683V4.00016M7.26628 7.3335V11.3335M9.93294 7.3335V11.3335"
                                  stroke="#E34935"
                                  strokeWidth="1.2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredProducts.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          style={{ textAlign: 'center', padding: '60px 0', borderBottom: 'none' }}
                        >
                          <div className="products-empty-state">
                            <img src={EmptyBox} alt="No products" style={{ width: 200, height: 200 }} />
                            <p className="products-empty-state-text" style={{ marginTop: 8 }}>
                              No products added yet. Click "New Product" to <br /> create your first
                              product.
                            </p>
                            <div
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '12px',
                                marginTop: '12px'
                              }}
                            >
                              <PrimaryButton onClick={() => navigate('/get-started/products/new')}>
                                + Create Product
                              </PrimaryButton>
                              <TertiaryButton
                                onClick={() => {
                                  setShowKongIntegration(true);
                                }}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="15"
                                  viewBox="0 0 16 15"
                                  fill="none"
                                  style={{ marginRight: '8px' }}
                                >
                                  <path
                                    d="M0.400391 11.2438V14.1384H2.88147L5.1558 11.0371H7.84363L8.67066 10.0033L5.56931 6.48841L3.50174 8.34922H2.67472L0.400391 11.2438Z"
                                    fill="url(#paint0_linear_8506_33340)"
                                  />
                                  <path
                                    d="M5.56931 11.8641L5.1558 12.2776L5.98282 13.5181V14.1384H9.29093L9.49769 13.5181L7.84363 11.8641H5.56931Z"
                                    fill="url(#paint1_linear_8506_33340)"
                                  />
                                  <path
                                    d="M7.43012 3.80057L6.18958 5.86814L12.599 13.3114L12.3923 14.1384H15.0801L15.7004 11.8641L8.87742 3.80057H7.43012Z"
                                    fill="url(#paint2_linear_8506_33340)"
                                  />
                                  <path
                                    d="M8.4639 1.733L7.63688 2.97354L7.84363 3.1803H9.29093L11.9788 6.07489L13.4261 4.83435V4.42084L13.0126 3.59381V2.76679L10.118 0.699219L8.4639 1.733Z"
                                    fill="url(#paint3_linear_8506_33340)"
                                  />
                                  <defs>
                                    <linearGradient
                                      id="paint0_linear_8506_33340"
                                      x1="12.8058"
                                      y1="3.1803"
                                      x2="1.02066"
                                      y2="13.5181"
                                      gradientUnits="userSpaceOnUse"
                                    >
                                      <stop stopColor="#14A06C" />
                                      <stop offset="1" stopColor="#2578D1" />
                                    </linearGradient>
                                    <linearGradient
                                      id="paint1_linear_8506_33340"
                                      x1="12.8058"
                                      y1="3.1803"
                                      x2="1.02066"
                                      y2="13.5181"
                                      gradientUnits="userSpaceOnUse"
                                    >
                                      <stop stopColor="#14A06C" />
                                      <stop offset="1" stopColor="#2578D1" />
                                    </linearGradient>
                                    <linearGradient
                                      id="paint2_linear_8506_33340"
                                      x1="12.8058"
                                      y1="3.1803"
                                      x2="1.02066"
                                      y2="13.5181"
                                      gradientUnits="userSpaceOnUse"
                                    >
                                      <stop stopColor="#14A06C" />
                                      <stop offset="1" stopColor="#2578D1" />
                                    </linearGradient>
                                    <linearGradient
                                      id="paint3_linear_8506_33340"
                                      x1="12.8058"
                                      y1="3.1803"
                                      x2="1.02066"
                                      y2="13.5181"
                                      gradientUnits="userSpaceOnUse"
                                    >
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
        </div>
      </>
    </ToastProvider>
  );
}
