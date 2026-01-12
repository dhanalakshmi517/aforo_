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
import SimpleFilterDropdown from '../componenetsss/SimpleFilterDropdown';
import DateSortDropdown from '../componenetsss/DateSortDropdown';
import MainFilterMenu, { MainFilterKey } from '../componenetsss/MainFilterMenu';
import Header from '../componenetsss/Header';
import ResetButton from '../componenetsss/ResetButton';

const getRandomBackgroundColor = (index: number) => {
  const colors = ['#F0F9FF', '#F0FDF4', '#F5F3FF', '#FFFBEB', '#FEF2F2'];
  return colors[index % colors.length];
};

const getRandomBorderColor = (index: number) => {
  const colors = ['#E0F2FE', '#DCFCE7', '#EDE9FE', '#FEF3C7', '#FECACA'];
  return colors[index % colors.length];
};

import EmptyBox from './Componenets/empty.svg';
import NoFileSvg from '../componenetsss/nofile.svg';
import { ToastProvider, useToast } from '../componenetsss/ToastProvider';
import PrimaryButton from '../componenetsss/PrimaryButton';
import TertiaryButton from '../componenetsss/TertiaryButton';
import ProductIcon, { ProductIconData } from './ProductIcon';
import GlassStackTile from '../componenetsss/GlassStackTile';

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
  const [createdSortOrder, setCreatedSortOrder] = useState<'newest' | 'oldest' | null>(null);
  const [isCreatedSortOpen, setIsCreatedSortOpen] = useState(false);
  const createdSortRef = React.useRef<HTMLDivElement | null>(null);
  const [productTypeFilterPosition, setProductTypeFilterPosition] = useState({ top: 0, left: 0 });
  const [sourceFilterPosition, setSourceFilterPosition] = useState({ top: 0, left: 0 });
  const [statusFilterPosition, setStatusFilterPosition] = useState({ top: 0, left: 0 });
  const [createdSortPosition, setCreatedSortPosition] = useState({ top: 0, left: 0 });
  const [isMainFilterMenuOpen, setIsMainFilterMenuOpen] = useState(false);
  const [mainFilterMenuPosition, setMainFilterMenuPosition] = useState({ top: 0, left: 0 });
  const [activeFilterKey, setActiveFilterKey] = useState<MainFilterKey | null>(null);
  const [mainFilterPanelPosition, setMainFilterPanelPosition] = useState({ top: 0, left: 0 });
  const [isMainFilterPanelOpen, setIsMainFilterPanelOpen] = useState(false);
  const filterButtonRef = React.useRef<HTMLButtonElement | null>(null);

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
      if (createdSortOrder === 'newest') {
        return bDate - aDate; // newest first
      }
      // default: no sorting when null
      return 0;
    });

  const [showCreateProduct, setShowCreateProduct] = useState(showNewProductForm);
  const { showToast } = useToast();

// ...
  const handleResetProductFilters = () => {
    setSelectedProductTypes([]);
    setSelectedSources([]);
    setSelectedStatuses([]);
  };

  // Close filters when clicking outside their header/filter areas (ignore portal-root)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) return;

      // Ignore clicks inside the shared portal root
      const portalRoot = document.getElementById('portal-root');
      if (portalRoot && portalRoot.contains(target)) return;

      if (
        productTypeFilterRef.current &&
        !productTypeFilterRef.current.contains(target)
      ) {
        setIsProductTypeFilterOpen(false);
      }

      if (sourceFilterRef.current && !sourceFilterRef.current.contains(target)) {
        setIsSourceFilterOpen(false);
      }

      if (createdSortRef.current && !createdSortRef.current.contains(target)) {
        setIsCreatedSortOpen(false);
      }

      if (statusFilterRef.current && !statusFilterRef.current.contains(target)) {
        setIsStatusFilterOpen(false);
      }

      if (filterButtonRef.current && !filterButtonRef.current.contains(target)) {
        setIsMainFilterMenuOpen(false);
        setIsMainFilterPanelOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
    return (
      <GlassStackTile
        frontIcon={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="17"
            height="17"
            viewBox={iconData.viewBox ?? "0 0 18 18"}
            fill="none"
          >
            <path d={iconData.svgPath} fill="#FFFFFF" />
          </svg>
        }
        backColor={iconData.tileColor}
        size={40}
        offsetY={-3}
      />
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
    return (
      <ToastProvider>
        <div>
          <div className="check-container">
            <Header
              title="Products"
              searchTerm=""
              onSearchTermChange={() => { }}
              searchDisabled={true}
              filterDisabled={true}
              showPrimary={true}
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
          {showCreateProduct && (
            <CreateProduct onClose={handleCreateProductCancel} />
          )}

          {isEditFormOpen && editingProduct && (
            <EditProduct
              productId={editingProduct.productId}
              onClose={() => {
                setIsEditFormOpen(false);
                setEditingProduct(null);
                fetchProducts();
              }}
              onIconUpdate={handleIconUpdate}
            />
          )}

          {/* Kong Integration Modal */}
          {showKongIntegration && (
            <KongIntegration onClose={() => setShowKongIntegration(false)} />
          )}

          {/* LIST TABLE (hidden when Kong integration is open) */}
          {!showCreateProduct && !isEditFormOpen && !showKongIntegration && (
            <div className="check-container">
              <Header
                title="Products"
                searchTerm={productQuery}
                onSearchTermChange={setProductQuery}
                searchDisabled={products.length === 0}
                filterDisabled={products.length === 0}
                showPrimary={filteredProducts.length > 0}
                primaryLabel="+ Create Product"
                onPrimaryClick={() => navigate('/get-started/products/new')}
                onFilterClick={() => {
                  if (filterButtonRef.current) {
                    const rect = filterButtonRef.current.getBoundingClientRect();

                    const menuWidth = 240;
                    const panelWidth = 264;
                    const gap = 12;
                    const margin = 8;

                    let left = rect.left;
                    const minLeft = panelWidth + gap + margin;
                    if (left < minLeft) {
                      left = minLeft;
                    }

                    if (left + menuWidth + margin > window.innerWidth) {
                      left = Math.max(margin, window.innerWidth - menuWidth - margin);
                      if (left < minLeft) {
                        left = minLeft;
                      }
                    }

                    setMainFilterMenuPosition({
                      top: rect.bottom + 8,
                      left,
                    });
                  }
                  const nextOpen = !isMainFilterMenuOpen;
                  setIsMainFilterMenuOpen(nextOpen);
                  if (!nextOpen) {
                    setIsMainFilterPanelOpen(false);
                  }
                }}
                filterButtonRef={filterButtonRef}
                onSettingsClick={() => setShowKongIntegration(true)}
                onNotificationsClick={() => { }}

              />

              {/* Main Filter Menu */}
              {isMainFilterMenuOpen && (
                <MainFilterMenu
                  items={[
                    { key: 'productType', label: 'Product Type' },
                    { key: 'source', label: 'Source' },
                    { key: 'status', label: 'Status' },
                    { key: 'date', label: 'Date' },
                  ]}
                  activeKey={activeFilterKey}
                  onSelect={(key) => {
                    setActiveFilterKey(key);
                  }}
                  onSelectWithRect={(key, rect) => {
                    setActiveFilterKey(key);
                    const panelWidth = 264;
                    const gap = 12;
                    const margin = 8;

                    let left = rect.left - gap - panelWidth;
                    if (left < margin) {
                      const tryRight = rect.right + gap;
                      if (tryRight + panelWidth + margin <= window.innerWidth) {
                        left = tryRight;
                      } else {
                        left = Math.max(margin, window.innerWidth - panelWidth - margin);
                      }
                    }

                    setMainFilterPanelPosition({
                      top: rect.top,
                      left,
                    });
                    setIsMainFilterPanelOpen(true);
                  }}
                  anchorTop={mainFilterMenuPosition.top}
                  anchorLeft={mainFilterMenuPosition.left}
                />
              )}

              {isMainFilterMenuOpen && isMainFilterPanelOpen && activeFilterKey === 'productType' && (
                <SimpleFilterDropdown
                  options={[
                    ProductType.API,
                    ProductType.FLATFILE,
                    ProductType.SQLRESULT,
                    ProductType.LLMTOKEN,
                  ].map((typeConst) => ({
                    id: typeConst.toLowerCase(),
                    label:
                      productTypeNames[typeConst as keyof typeof productTypeNames] ||
                      typeConst,
                  }))}
                  value={selectedProductTypes}
                  onChange={(next) => setSelectedProductTypes(next.map((x) => String(x).toLowerCase()))}
                  anchorTop={mainFilterPanelPosition.top}
                  anchorLeft={mainFilterPanelPosition.left}
                />
              )}

              {isMainFilterMenuOpen && isMainFilterPanelOpen && activeFilterKey === 'source' && (
                <SimpleFilterDropdown
                  options={['manual', 'apigee', 'kong'].map((srcKey) => ({
                    id: srcKey,
                    label: srcKey.charAt(0).toUpperCase() + srcKey.slice(1),
                  }))}
                  value={selectedSources}
                  onChange={(next) => setSelectedSources(next.map((x) => String(x).toLowerCase()))}
                  anchorTop={mainFilterPanelPosition.top}
                  anchorLeft={mainFilterPanelPosition.left}
                />
              )}

              {isMainFilterMenuOpen && isMainFilterPanelOpen && activeFilterKey === 'status' && (
                <SimpleFilterDropdown
                  options={['active', 'draft'].map((statusKey) => ({
                    id: statusKey,
                    label: statusKey.charAt(0).toUpperCase() + statusKey.slice(1),
                  }))}
                  value={selectedStatuses}
                  onChange={(next) => setSelectedStatuses(next.map((x) => String(x).toLowerCase()))}
                  anchorTop={mainFilterPanelPosition.top}
                  anchorLeft={mainFilterPanelPosition.left}
                />
              )}

              {isMainFilterMenuOpen && isMainFilterPanelOpen && activeFilterKey === 'date' && (
                <DateSortDropdown
                  value={createdSortOrder}
                  onChange={(next) => setCreatedSortOrder(next)}
                  anchorTop={mainFilterPanelPosition.top}
                  anchorLeft={mainFilterPanelPosition.left}
                />
              )}

              <div className="customers-table-wrapper">
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
                    <ResetButton
                      label="Reset"
                      onClick={handleResetProductFilters}
                    />
                  </div>
                )}
                <table className="customers-table">
                  <thead>
                    <tr>
                      <th>Product Name</th>
                      <th className="products-th-with-filter">
                        <div
                          ref={productTypeFilterRef}
                          className="products-th-label-with-filter"
                          onMouseEnter={() => {
                            // close others
                            setIsSourceFilterOpen(false);
                            setIsStatusFilterOpen(false);
                            setIsCreatedSortOpen(false);

                            if (productTypeFilterRef.current) {
                              const rect = productTypeFilterRef.current.getBoundingClientRect();
                              setProductTypeFilterPosition({
                                top: rect.bottom + 4,
                                left: rect.left,
                              });
                            }
                            setIsProductTypeFilterOpen(true);
                          }}
                          onMouseLeave={() => {
                            setIsProductTypeFilterOpen(false);
                          }}
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
                              <SimpleFilterDropdown
                                options={[
                                  ProductType.API,
                                  ProductType.FLATFILE,
                                  ProductType.SQLRESULT,
                                  ProductType.LLMTOKEN,
                                ].map((typeConst) => ({
                                  id: typeConst.toLowerCase(),
                                  label:
                                    productTypeNames[typeConst as keyof typeof productTypeNames] ||
                                    typeConst,
                                }))}
                                value={selectedProductTypes}
                                onChange={(next) =>
                                  setSelectedProductTypes(next.map((x) => String(x).toLowerCase()))
                                }
                                anchorTop={productTypeFilterPosition.top}
                                anchorLeft={productTypeFilterPosition.left}
                              />
                            </div>
                          )}
                        </div>
                      </th>
                      <th className="products-th-with-filter">
                        <div
                          ref={sourceFilterRef}
                          className="products-th-label-with-filter"
                          onMouseEnter={() => {
                            // close others
                            setIsProductTypeFilterOpen(false);
                            setIsStatusFilterOpen(false);
                            setIsCreatedSortOpen(false);

                            if (sourceFilterRef.current) {
                              const rect = sourceFilterRef.current.getBoundingClientRect();
                              setSourceFilterPosition({
                                top: rect.bottom + 4,
                                left: rect.left,
                              });
                            }
                            setIsSourceFilterOpen(true);
                          }}
                          onMouseLeave={() => {
                            setIsSourceFilterOpen(false);
                          }}
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
                              <SimpleFilterDropdown
                                options={['manual', 'apigee', 'kong'].map((srcKey) => ({
                                  id: srcKey,
                                  label: srcKey.charAt(0).toUpperCase() + srcKey.slice(1),
                                }))}
                                value={selectedSources}
                                onChange={(next) =>
                                  setSelectedSources(next.map((x) => String(x).toLowerCase()))
                                }
                                anchorTop={sourceFilterPosition.top}
                                anchorLeft={sourceFilterPosition.left}
                              />
                            </div>
                          )}
                        </div>
                      </th>
                      <th className="products-th-with-filter">
                        <div
                          ref={statusFilterRef}
                          className="products-th-label-with-filter"
                          onMouseEnter={() => {
                            // close others
                            setIsProductTypeFilterOpen(false);
                            setIsSourceFilterOpen(false);
                            setIsCreatedSortOpen(false);

                            if (statusFilterRef.current) {
                              const rect = statusFilterRef.current.getBoundingClientRect();
                              setStatusFilterPosition({
                                top: rect.bottom + 4,
                                left: rect.left,
                              });
                            }
                            setIsStatusFilterOpen(true);
                          }}
                          onMouseLeave={() => {
                            setIsStatusFilterOpen(false);
                          }}
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
                              <SimpleFilterDropdown
                                options={['active', 'draft'].map((statusKey) => ({
                                  id: statusKey,
                                  label:
                                    statusKey.charAt(0).toUpperCase() + statusKey.slice(1),
                                }))}
                                value={selectedStatuses}
                                onChange={(next) =>
                                  setSelectedStatuses(next.map((x) => String(x).toLowerCase()))
                                }
                                anchorTop={statusFilterPosition.top}
                                anchorLeft={statusFilterPosition.left}
                              />
                            </div>
                          )}
                        </div>
                      </th>
                      <th className="products-th-with-filter">
                        <div
                          ref={createdSortRef}
                          className="products-th-label-with-filter"
                          onMouseEnter={() => {
                            // close others
                            setIsProductTypeFilterOpen(false);
                            setIsSourceFilterOpen(false);
                            setIsStatusFilterOpen(false);

                            if (createdSortRef.current) {
                              const rect = createdSortRef.current.getBoundingClientRect();
                              setCreatedSortPosition({
                                top: rect.bottom + 4,
                                left: rect.left,
                              });
                            }
                            setIsCreatedSortOpen(true);
                          }}
                          onMouseLeave={() => {
                            setIsCreatedSortOpen(false);
                          }}
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
                              <DateSortDropdown
                                value={createdSortOrder}
                                onChange={(next) => {
                                  setCreatedSortOrder(next);
                                  setIsCreatedSortOpen(false);
                                }}
                                anchorTop={createdSortPosition.top}
                                anchorLeft={createdSortPosition.left}
                              />
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
                    ) : !isLoading && products.length === 0 ? (
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
                              <TertiaryButton onClick={() => navigate('/get-started/products/import')}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15" fill="none">
                                    <path d="M5.83333 13.8333V3.83333C5.83333 3.65652 5.7631 3.48695 5.63807 3.36193C5.51305 3.2369 5.34348 3.16667 5.16667 3.16667H1.83333C1.47971 3.16667 1.14057 3.30714 0.890524 3.55719C0.640476 3.80724 0.5 4.14638 0.5 4.5V12.5C0.5 12.8536 0.640476 13.1928 0.890524 13.4428C1.14057 13.6929 1.47971 13.8333 1.83333 13.8333H9.83333C10.187 13.8333 10.5261 13.6929 10.7761 13.4428C11.0262 13.1928 11.1667 12.8536 11.1667 12.5V9.16667C11.1667 8.98986 11.0964 8.82029 10.9714 8.69526C10.8464 8.57024 10.6768 8.5 10.5 8.5H0.5M9.16667 0.5H13.1667C13.5349 0.5 13.8333 0.798477 13.8333 1.16667V5.16667C13.8333 5.53486 13.5349 5.83333 13.1667 5.83333H9.16667C8.79848 5.83333 8.5 5.53486 8.5 5.16667V1.16667C8.5 0.798477 8.79848 0.5 9.16667 0.5Z" stroke="#034A7D" stroke-linecap="round" stroke-linejoin="round"/>
                                  </svg>
                                  Import Products
                                </span>
                              </TertiaryButton>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : (!isLoading && products.length > 0 && filteredProducts.length === 0) ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '60px 0', borderBottom: 'none' }}>
                          <div className="products-empty-state">
                            <img src={NoFileSvg} alt="No results" style={{ width: 170, height: 170 }} />
                            <p className="products-empty-text" style={{ marginTop: 16 }}>
                              {productQuery.trim() ? (
                                <>
                                  We couldn't find any results for "{productQuery}"
                                  <br />
                                  Nothing wrong, just adjust your search a bit.
                                </>
                              ) : (
                                <>
                                  Oops! No matches found with these filters.
                                  <br />
                                  Nothing wrong here, just adjust your filters a bit.
                                </>
                              )}
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.length > 0 && filteredProducts.map((product) => (
                        <tr key={`${product.productId}-${refreshKey}`}>
                        <td className="product-name-td">
                          <div className="product-name-cell">
                            <div
                              className="product-name-cell__icon"
                              style={{
                                background: '#FFFFFF',
                                border: '0.6px solid #EEF1F6',
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
                                <GlassStackTile
                                  frontIcon={
                                    <span style={{
                                      fontSize: '14px',
                                      fontWeight: 500,
                                      color: '#FFFFFF'
                                    }}>
                                      {product.productName?.substring(0, 2).toUpperCase() || 'PR'}
                                    </span>
                                  }
                                  size={40}
                                  colorIndex={parseInt(product.productId) || 0}
                                />
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
                                  <div className="product-new-sku" title={product.internalSkuCode}>
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
                              return (map as any)[normalized] || product.productType || '-';
                            })()}
                          </span>
                        </td>

                        <td className="source-cell">
                          {(() => {
                            const raw = product.source || 'MANUAL';
                            const lower = raw.toLowerCase();
                            const isManual = lower === 'manual';
                            const displayText = lower.charAt(0).toUpperCase() + lower.slice(1);
                            
                            return (
                              <div 
                                className={`pro-source-badge ${isManual ? 'pro-source-badge--manual' : `pro-source-badge--${lower}`}`}
                              >
                                {displayText}
                              </div>
                            );
                          })()}
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

                        <td>
                          <span className="products-createdon" title={product.createdOn ?? 'N/A'}>
                            {product.createdOn ?? 'N/A'}
                          </span>
                        </td>

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