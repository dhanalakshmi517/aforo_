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
import Tooltip from '../componenetsss/Tooltip';
import SearchInput from '../componenetsss/SearchInput';
import Checkbox from '../componenetsss/Checkbox';
import VerticalScrollbar from '../componenetsss/VerticalScrollbar';
import FilterChip from '../componenetsss/FilterChip';

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
  source?: string;
  internalSkuCode?: string;
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
  const location = useLocation();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [updatedIcons, setUpdatedIcons] = useState<Record<string, string>>({});
  const [preserveLocalIcons, setPreserveLocalIcons] = useState(false);
  const [selectedProductTypes, setSelectedProductTypes] = useState<string[]>([]);
  const [isProductTypeFilterOpen, setIsProductTypeFilterOpen] = useState(false);
  const productTypeFilterRef = React.useRef<HTMLDivElement | null>(null);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [isSourceFilterOpen, setIsSourceFilterOpen] = useState(false);
  const sourceFilterRef = React.useRef<HTMLDivElement | null>(null);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [isStatusFilterOpen, setIsStatusFilterOpen] = useState(false);
  const statusFilterRef = React.useRef<HTMLDivElement | null>(null);
  const [createdSortOrder, setCreatedSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [isCreatedSortOpen, setIsCreatedSortOpen] = useState(false);
  const createdSortRef = React.useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

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
          if (iconData) {
            console.log(`✅ Using in-memory cached icon for ${product.productId}`);
          }
        }

        // Check localStorage cache (persistent across page refreshes)
        // This is needed because backend doesn't properly return productIcon field
        if (!iconData) {
          try {
            const iconCache = JSON.parse(localStorage.getItem('iconDataCache') || '{}');
            const cachedIconJson = iconCache[product.productId];
            if (cachedIconJson) {
              const parsedCache = parseProductIconField(cachedIconJson);
              iconData = extractIconData(parsedCache, product.productName || 'Product');
              if (iconData) {
                console.log(`✅ Using localStorage cached icon for ${product.productId}:`, iconData);
              }
            }
          } catch (e) {
            console.warn('Failed to read icon cache from localStorage:', e);
          }
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
    // Global text search across key fields, not just product name
    .filter((p) => {
      const q = productQuery.trim().toLowerCase();
      if (!q) return true;

      const name = (p.productName || '').toLowerCase();
      const type = (p.productType || '').toLowerCase();
      const status = (p.status || '').toLowerCase();
      const metricsText = (p.metrics || [])
        .map(m => `${m.metricName || ''} ${m.unitOfMeasure || ''}`)
        .join(' ') // join all metric texts
        .toLowerCase();

      return (
        name.includes(q) ||
        type.includes(q) ||
        status.includes(q) ||
        metricsText.includes(q)
      );
    })
    .filter((p) => {
      if (selectedProductTypes.length === 0) return true;
      const typeKey = (p.productType || '').toLowerCase();
      return selectedProductTypes.includes(typeKey);
    })
    .filter((p) => {
      if (selectedSources.length === 0) return true;
      const srcKey = (p.source || 'MANUAL').toLowerCase();
      return selectedSources.includes(srcKey);
    })
    .filter((p) => {
      if (selectedStatuses.length === 0) return true;
      const statusKey = (p.status || '').toLowerCase();
      return selectedStatuses.includes(statusKey);
    })
    .sort((a, b) => {
      const aStatus = (a.status || '').toLowerCase();
      const bStatus = (b.status || '').toLowerCase();

      // Always keep drafts first
      if (aStatus === 'draft' && bStatus !== 'draft') return -1;
      if (aStatus !== 'draft' && bStatus === 'draft') return 1;

      // Within the same status group, sort by createdOn
      const parseDate = (d?: string) => {
        if (!d) return 0;
        const t = Date.parse(d);
        return Number.isNaN(t) ? 0 : t;
      };

      const aDate = parseDate(a.createdOn);
      const bDate = parseDate(b.createdOn);

      if (aDate === bDate) return 0;
      if (createdSortOrder === 'oldest') {
        return aDate - bDate; // oldest first
      }
      // default: newest first
      return bDate - aDate;
    });

  const [showCreateProduct, setShowCreateProduct] = useState(showNewProductForm);
  const { showToast } = useToast();

  const handleResetProductFilters = () => {
    setSelectedProductTypes([]);
    setSelectedSources([]);
    setSelectedStatuses([]);
  };

  // Close filters when clicking outside their header/filter areas
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (
        productTypeFilterRef.current &&
        target &&
        !productTypeFilterRef.current.contains(target)
      ) {
        setIsProductTypeFilterOpen(false);
      }

      if (sourceFilterRef.current && target && !sourceFilterRef.current.contains(target)) {
        setIsSourceFilterOpen(false);
      }

      if (createdSortRef.current && target && !createdSortRef.current.contains(target)) {
        setIsCreatedSortOpen(false);
      }

      if (statusFilterRef.current && target && !statusFilterRef.current.contains(target)) {
        setIsStatusFilterOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProductTypeFilterOpen, isSourceFilterOpen, isStatusFilterOpen, isCreatedSortOpen]);

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


  // Helper to derive a soft translucent background from icon color
  const getSoftTileBg = (iconData?: ProductIconData | null, opacity: number = 0.15) => {
    // Prefer explicit tileColor; fall back to first gradient stop from outerBg; finally use a neutral
    const base = iconData?.tileColor || (iconData?.outerBg && iconData.outerBg[0]) || '#E3ADEB';

    // 1) If it's a standard hex color (#RRGGBB), convert to rgba with provided opacity
    if (/^#([0-9a-fA-F]{6})$/.test(base)) {
      const r = parseInt(base.slice(1, 3), 16);
      const g = parseInt(base.slice(3, 5), 16);
      const b = parseInt(base.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }

    // 2) If it's rgb/rgba, parse the components and reapply our own alpha
    const rgbMatch = base
      .replace(/\s+/g, '')
      .match(/^rgba?\((\d{1,3}),(\d{1,3}),(\d{1,3})(?:,(\d*(?:\.\d+)?))?\)$/i);
    if (rgbMatch) {
      const r = Number(rgbMatch[1]);
      const g = Number(rgbMatch[2]);
      const b = Number(rgbMatch[3]);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }

    // 3) Any other format: fall back to a neutral soft tint
    return `rgba(227, 173, 235, ${opacity})`;
  };

  // Mini ProductIcon renderer for the table
  const TableProductIcon: React.FC<{ iconData: ProductIconData }> = ({ iconData }) => {
    const tile = iconData.tileColor ?? '#CC9434';

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
            left: 4,
            top: 4,
            width: 34,
            borderRadius: '9px',

            height: 34,
            backgroundColor: tile,
            background: tile,
          }}
        />
        {/* GLASS FOREGROUND TILE */}
        <div
          style={{
            position: 'absolute',
            left: '40%',
            top: '50%',
            transform: 'translate(-50%, -50%) translate(9px, 6px)',
            width: 34,
            height: 34,
            display: 'flex',
            justifyContent: 'center',
            borderRadius: '9px',
            alignItems: 'center',
            border: '0.6px solid #FFF',
            backgroundColor: getSoftTileBg(iconData, 0.10),
            background: getSoftTileBg(iconData, 0.10),
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

  // Refresh products when user returns from NewProduct/EditProduct page
  useEffect(() => {
    console.log('🔄 Location changed, refreshing products list...');
    // Check for pending updates first (icon changes from EditProduct)
    const updateSignal = localStorage.getItem('productUpdated');
    if (updateSignal) {
      console.log('🔄 Found product update signal on location change, refreshing...');
      localStorage.removeItem('productUpdated');
    }
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
          <div className="customers-container">
            <Header
              title="Products"
              searchTerm=""
              onSearchTermChange={() => { }}
              searchDisabled={true}
              filterDisabled={true}
              showPrimary={true}
              showKongButton={false}
              primaryLabel="+ New Product"
              onPrimaryClick={() => navigate('/get-started/products/new')}
              onFilterClick={() => { }}
              onSettingsClick={() => { }}
              onNotificationsClick={() => { }}
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
        <div style={{ width: 'calc(100% - 10px)' }}>
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
            <div className="check-product-container">
              <Header
                title="Products"
                searchTerm={productQuery}
                onSearchTermChange={setProductQuery}
                searchDisabled={products.length === 0}
                filterDisabled={products.length === 0}
                showPrimary={filteredProducts.length > 0}
                showKongButton={products.length > 0}
                primaryLabel="+ Create Product"
                onPrimaryClick={() => navigate('/get-started/products/new')}
                onFilterClick={() => { }}
                onSettingsClick={() => setShowKongIntegration(true)}
                onNotificationsClick={() => { }}

              />

              {(selectedProductTypes.length > 0 ||
                selectedSources.length > 0 ||
                selectedStatuses.length > 0) && (
                <div className="products-active-filters-row">
                  <div className="products-active-filters-chips">
                    {selectedProductTypes.map((t) => (
                      <FilterChip
                        key={t}
                        label={productTypeNames[t as keyof typeof productTypeNames] || t}
                        onRemove={() =>
                          setSelectedProductTypes((prev) => prev.filter((x) => x !== t))
                        }
                      />
                    ))}

                    {selectedSources.map((s) => (
                      <FilterChip
                        key={s}
                        label={s.charAt(0).toUpperCase() + s.slice(1)}
                        onRemove={() =>
                          setSelectedSources((prev) => prev.filter((x) => x !== s))
                        }
                      />
                    ))}

                    {selectedStatuses.map((s) => (
                      <FilterChip
                        key={s}
                        label={s.charAt(0).toUpperCase() + s.slice(1)}
                        onRemove={() =>
                          setSelectedStatuses((prev) => prev.filter((x) => x !== s))
                        }
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    className="products-filters-reset"
                    onClick={handleResetProductFilters}
                  >
                    Clear all
                  </button>
                </div>
              )}

              <div className="customers-table-wrapper">
                <table className="customers-table">
                  <thead>
                    <tr>
                      <th>Product Name</th>
                      <th className="products-th-with-filter">
                        <div
                          ref={productTypeFilterRef}
                          className="products-th-label-with-filter"
                          onMouseEnter={() => setIsProductTypeFilterOpen(true)}
                        >
                          <span>Product Type</span>
                          <button
                            type="button"
                            className={`products-column-filter-trigger ${
                              isProductTypeFilterOpen ? 'is-open' : ''
                            }`}
                            aria-label="Filter by product type"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="11"
                              height="8"
                              viewBox="0 0 11 8"
                              fill="none"
                            >
                              <path
                                d="M0.600098 0.599609H9.6001M2.6001 3.59961H7.6001M4.1001 6.59961H6.1001"
                                stroke="#19222D"
                                strokeWidth="1.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>

                          {isProductTypeFilterOpen && (
                            <div
                              className="products-column-filter-popover"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="products-column-filter-list">
                                {[
                                  ProductType.API,
                                  ProductType.FLATFILE,
                                  ProductType.SQLRESULT,
                                  ProductType.LLMTOKEN,
                                ].map((typeConst) => {
                                  const typeKey = typeConst.toLowerCase();
                                  const label =
                                    productTypeNames[typeConst as keyof typeof productTypeNames] ||
                                    typeConst;
                                  return (
                                    <div
                                      key={typeConst}
                                      className="products-column-filter-list-item"
                                    >
                                      <Checkbox
                                        checked={selectedProductTypes.includes(typeKey)}
                                        onChange={(checked) => {
                                          setSelectedProductTypes((prev) => {
                                            if (checked) {
                                              if (prev.includes(typeKey)) return prev;
                                              return [...prev, typeKey];
                                            }
                                            return prev.filter((x) => x !== typeKey);
                                          });
                                        }}
                                        label={label}
                                      />
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      </th>
                      <th className="products-th-with-filter">
                        <div
                          ref={sourceFilterRef}
                          className="products-th-label-with-filter"
                          onMouseEnter={() => setIsSourceFilterOpen(true)}
                        >
                          <span>Source</span>
                          <button
                            type="button"
                            className={`products-column-filter-trigger ${
                              isSourceFilterOpen ? 'is-open' : ''
                            }`}
                            aria-label="Filter by source"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="11"
                              height="8"
                              viewBox="0 0 11 8"
                              fill="none"
                            >
                              <path
                                d="M0.600098 0.599609H9.6001M2.6001 3.59961H7.6001M4.1001 6.59961H6.1001"
                                stroke="#19222D"
                                strokeWidth="1.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>

                          {isSourceFilterOpen && (
                            <div
                              className="products-column-filter-popover"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="products-column-filter-list">
                                {['manual', 'apigee', 'kong'].map((srcKey) => (
                                  <div
                                    key={srcKey}
                                    className="products-column-filter-list-item"
                                  >
                                    <Checkbox
                                      checked={selectedSources.includes(srcKey)}
                                      onChange={(checked) => {
                                        setSelectedSources((prev) => {
                                          if (checked) {
                                            if (prev.includes(srcKey)) return prev;
                                            return [...prev, srcKey];
                                          }
                                          return prev.filter((x) => x !== srcKey);
                                        });
                                      }}
                                      label={srcKey.charAt(0).toUpperCase() + srcKey.slice(1)}
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </th>
                      <th className="products-th-with-filter">
                        <div
                          ref={statusFilterRef}
                          className="products-th-label-with-filter"
                          onMouseEnter={() => setIsStatusFilterOpen(true)}
                        >
                          <span>Status</span>
                          <button
                            type="button"
                            className={`products-column-filter-trigger ${
                              isStatusFilterOpen ? 'is-open' : ''
                            }`}
                            aria-label="Filter by status"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="11"
                              height="8"
                              viewBox="0 0 11 8"
                              fill="none"
                            >
                              <path
                                d="M0.600098 0.599609H9.6001M2.6001 3.59961H7.6001M4.1001 6.59961H6.1001"
                                stroke="#19222D"
                                strokeWidth="1.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>

                          {isStatusFilterOpen && (
                            <div
                              className="products-column-filter-popover"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="products-column-filter-list">
                                {['active', 'draft'].map((statusKey) => (
                                  <div
                                    key={statusKey}
                                    className="products-column-filter-list-item"
                                  >
                                    <Checkbox
                                      checked={selectedStatuses.includes(statusKey)}
                                      onChange={(checked) => {
                                        setSelectedStatuses((prev) => {
                                          if (checked) {
                                            if (prev.includes(statusKey)) return prev;
                                            return [...prev, statusKey];
                                          }
                                          return prev.filter((x) => x !== statusKey);
                                        });
                                      }}
                                      label={
                                        statusKey.charAt(0).toUpperCase() + statusKey.slice(1)
                                      }
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </th>
                      <th className="products-th-with-filter">
                        <div
                          ref={createdSortRef}
                          className="products-th-label-with-filter"
                          onMouseEnter={() => setIsCreatedSortOpen(true)}
                        >
                          <span>Created On</span>
                          <button
                            type="button"
                            className={`products-column-filter-trigger ${
                              isCreatedSortOpen ? 'is-open' : ''
                            }`}
                            aria-label="Sort by created date"
                          >
                            {/* up/down multi-arrow icon provided */}
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="12"
                              height="12"
                              viewBox="0 0 12 12"
                              fill="none"
                            >
                              <path
                                d="M10.5 8L8.5 10M8.5 10L6.5 8M8.5 10L8.5 2M1.5 4L3.5 2M3.5 2L5.5 4M3.5 2V10"
                                stroke="#25303D"
                                strokeWidth="1.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>

                          {isCreatedSortOpen && (
                            <div
                              className="products-column-filter-popover products-createdon-popover"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                className={`products-sort-option ${
                                  createdSortOrder === 'newest' ? 'is-active' : ''
                                }`}
                                onClick={() => {
                                  setCreatedSortOrder('newest');
                                  setIsCreatedSortOpen(false);
                                }}
                              >
                                <span className="products-sort-option-icon">
                                  {/* down arrow icon (newest first) */}
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="13"
                                    height="13"
                                    viewBox="0 0 13 13"
                                    fill="none"
                                  >
                                    <path
                                      d="M0.600098 6.43294L6.43343 0.599609M6.43343 0.599609L12.2668 6.43294M6.43343 0.599609V12.2663"
                                      stroke="#25303D"
                                      strokeWidth="1.2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                </span>
                                <span className="products-sort-option-label">Newest first</span>
                              </button>

                              <button
                                type="button"
                                className={`products-sort-option ${
                                  createdSortOrder === 'oldest' ? 'is-active' : ''
                                }`}
                                onClick={() => {
                                  setCreatedSortOrder('oldest');
                                  setIsCreatedSortOpen(false);
                                }}
                              >
                                <span className="products-sort-option-icon">
                                  {/* up arrow icon (oldest first) */}
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                  >
                                    <path
                                      d="M11.8333 6V17.6667M11.8333 17.6667L17.6667 11.8333M11.8333 17.6667L6 11.8333"
                                      stroke="#25303D"
                                      strokeWidth="1.2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                </span>
                                <span className="products-sort-option-label">Oldest first</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </th>
                      <th className="actions-cell">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading && products.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '60px 0', borderBottom: 'none' }}>
                          <div className="products-loading-state">
                            <div className="spinner"></div>
                            <p style={{ marginTop: '16px', color: '#666', fontSize: '14px' }}>Loading products...</p>
                          </div>
                        </td>
                      </tr>
                    ) : !isLoading && filteredProducts.length === 0 ? (
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
                    ) : (
                      filteredProducts.map((product) => (
                        <tr key={`${product.productId}-${refreshKey}`}>
                        <td className="product-name-td">
                          <div className="product-name-cell">
                            <div
                              className="product-name-cell__icon"
                              style={{
                                background: '#FFFFFF',
                                borderColor: '#D4D4D8',
                              }}
                            >
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
                                    width: 41,
                                    height: 41,
                                    borderRadius: 8,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    backgroundColor:
                                      getRandomBackgroundColor(parseInt(product.productId) || 0),
                                    border: `1px solid ${getRandomBorderColor(parseInt(product.productId) || 0)
                                      }`
                                  }}
                                >
                                  {product.productName?.substring(0, 2).toUpperCase() || 'PR'}
                                </div>
                              )}
                            </div>

                            <div className="product-name-cell__content">
                              <div className="product-name-text-group">
                                <div className="product-name" title={product.productName}>
                                  {(() => {
                                    const name = product.productName || '';
                                    if (name.length <= 14) return name;
                                    return name.slice(0, 14) + '…';
                                  })()}
                                </div>
                                {product.internalSkuCode && (
                                  <div className="product-sku" title={product.internalSkuCode}>
                                    {product.internalSkuCode}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span
                            className={`product-type-badge--${product.productType?.toLowerCase() || 'default'
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

                        <td className="source-cell">
                          <div className="source-badge">
                            {(() => {
                              const raw = product.source || 'MANUAL';
                              const lower = raw.toLowerCase();
                              return lower.charAt(0).toUpperCase() + lower.slice(1);
                            })()}
                          </div>
                        </td>

                        <td>
                          <Tooltip
                            position="right"
                            content={
                              product.status.toLowerCase() === 'live'
                                ? 'Product is live and available for sale.'
                                : product.status.toLowerCase() === 'draft'
                                  ? 'Product is in draft. Continue setting it up.'
                                  : product.status.charAt(0) + product.status.slice(1).toLowerCase()
                            }
                          >
                            <StatusBadge
                              label={product.status.charAt(0) + product.status.slice(1).toLowerCase()}
                              variant={product.status.toLowerCase() as Variant}
                              size="sm"
                            />
                          </Tooltip>
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
                                  navigate(`/get-started/products/edit/${product.productId}`);
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
                      ))
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
