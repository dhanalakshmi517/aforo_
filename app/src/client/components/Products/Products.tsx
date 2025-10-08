import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
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
import { getAuthData } from '../../utils/auth';
import {
  getProducts,
  createProduct as createProductApi,
  deleteProduct as deleteProductApi,
  BASE_URL
} from './api';
import ConfirmDeleteModal from '../componenetsss/ConfirmDeleteModal';

// Function to get a random background color for metric cards
const getRandomBackgroundColor = (index: number) => {
  const colors = ['#F0F9FF', '#F0FDF4', '#F5F3FF', '#FFFBEB', '#FEF2F2'];
  return colors[index % colors.length];
};

// Function to get a random border color for metric cards
const getRandomBorderColor = (index: number) => {
  const colors = ['#E0F2FE', '#DCFCE7', '#EDE9FE', '#FEF3C7', '#FECACA'];
  return colors[index % colors.length];
};

import Header from '../componenetsss/Header';
import EmptyBox from './Componenets/empty.svg';
import { ToastProvider, useToast } from '../componenetsss/ToastProvider';
import PrimaryButton from '../componenetsss/PrimaryButton';
import TertiaryButton from '../componenetsss/TertiaryButton';

interface Product {
  productId: string;
  productName: string;
  productDescription?: string;
  productType: string;
  billable?: boolean;
  status: string;
  category: string;
  createdOn?: string;
  icon?: string; // raw backend path (relative/absolute)
  iconUrl?: string | null; // blob url fetched with auth
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

// --- helpers to build a safe icon URL ---
const API_ORIGIN = BASE_URL.replace(/\/api\/?$/, ''); // http://host:port

// normalize any backend-provided icon string to a proper absolute URL
const normalizeIconAbsoluteUrl = (icon?: string): string | null => {
  if (!icon) return null;
  if (icon.startsWith('http://') || icon.startsWith('https://') || icon.startsWith('data:')) {
    return icon;
  }

  // ensure path starts with one leading slash
  const clean = `/${icon.replace(/^\/+/, '')}`;

  // make sure it lives under /api if backend serves files there
  const path = clean.startsWith('/api/') ? clean : `/api${clean}`;

  return `${API_ORIGIN}${path}`;
};

export default function Products({ showNewProductForm, setShowNewProductForm }: ProductsProps) {
  // Prevent browser scroll for Products page
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
  const [error, setError] = useState<string | null>(null);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [showKongIntegration, setShowKongIntegration] = useState(false);
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
  const [deleteProductName, setDeleteProductName] = useState<string>('');
  const [productQuery, setProductQuery] = useState<string>('');
  const [showCreateProduct, setShowCreateProduct] = useState(showNewProductForm);

  // track blob URLs so we can revoke them when replaced/unmounted
  const previousBlobUrlsRef = React.useRef<string[]>([]);

  // get toast API
  const { showToast } = useToast();

  // Generate a fallback icon based on product name
  const generateFallbackIcon = (productName: string): string => {
    // Create a simple SVG with initials
    const initials = productName
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
    
    // Use a consistent color based on product name hash
    const hash = productName.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    const colors = [
      ['#F8F7FA', '#E4EEF9', '#CC9434'],
      ['#FFF5F5', '#FED7D7', '#E53E3E'],
      ['#F0FFF4', '#C6F6D5', '#38A169'],
      ['#EBF8FF', '#BEE3F8', '#3182CE'],
      ['#FAF5FF', '#E9D8FD', '#805AD5']
    ];
    
    const colorSet = colors[Math.abs(hash) % colors.length];
    
    const svgContent = `
      <svg xmlns="http://www.w3.org/2000/svg" width="50.6537" height="46.3351" viewBox="0 0 50.6537 46.3351">
        <defs>
          <linearGradient id="bg-fallback" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${colorSet[0]}" />
            <stop offset="100%" style="stop-color:${colorSet[1]}" />
          </linearGradient>
        </defs>
        <rect width="50.6537" height="46.3351" rx="12" fill="url(#bg-fallback)"/>
        <rect x="0.3" y="0.3" width="50.0537" height="45.7351" rx="11.7"
              fill="rgba(1,69,118,0.10)" stroke="#D5D4DF" strokeWidth="0.6"/>
        <rect x="12" y="9" width="29.45" height="25.243" rx="5.7" fill="${colorSet[2]}"/>
        <g transform="translate(10.657,9.385)">
          <rect width="29.339" height="26.571" rx="6"
                fill="rgba(202,171,213,0.10)" stroke="#FFFFFF" strokeWidth="0.6"/>
          <text x="14.67" y="18" text-anchor="middle" fill="#FFFFFF" font-family="Arial, sans-serif" font-size="12" font-weight="bold">
            ${initials}
          </text>
        </g>
      </svg>
    `.trim();
    
    return `data:image/svg+xml;base64,${btoa(svgContent)}`;
  };

  // Try to fetch icon, fallback to generated icon on failure
  const fetchIconWithAuth = async (iconPath?: string, productName?: string): Promise<string | null> => {
    // If no iconPath, generate fallback immediately
    if (!iconPath) {
      return productName ? generateFallbackIcon(productName) : null;
    }

    // If iconPath looks like a data URL, return it directly
    if (iconPath.startsWith('data:')) {
      return iconPath;
    }

    const absolute = normalizeIconAbsoluteUrl(iconPath);
    if (!absolute) {
      return productName ? generateFallbackIcon(productName) : null;
    }

    try {
      const authData = getAuthData();
      const headers: Record<string, string> = {};
      if (authData?.token) headers.Authorization = `Bearer ${authData.token}`;
      if (authData?.organizationId != null) headers['X-Organization-Id'] = String(authData.organizationId);

      const response = await axios.get(absolute, {
        responseType: 'blob',
        headers
      });

      const blobUrl = URL.createObjectURL(response.data);
      previousBlobUrlsRef.current.push(blobUrl);
      return blobUrl;
    } catch (e) {
      // Backend doesn't serve icons or auth failed - use fallback
      console.warn('Icon fetch failed, using fallback for:', absolute);
      return productName ? generateFallbackIcon(productName) : null;
    }
  };

  // Cleanup blob URLs when products change or component unmounts
  useEffect(() => {
    return () => {
      previousBlobUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
      previousBlobUrlsRef.current = [];
    };
  }, []);

  const fetchProducts = React.useCallback(async () => {
    setIsLoading(true);
    // cleanup any earlier blobs before refetch
    previousBlobUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
    previousBlobUrlsRef.current = [];

    try {
      const list = await getProducts();

      const productsWithMetricsPromises = list.map(async (p: any) => {
        const iconUrl = await fetchIconWithAuth(p.icon, p.productName);
        return {
          ...p,
          metrics: p.billableMetrics || [],
          iconUrl // IMPORTANT: we only render this; we never render raw protected URL
        } as Product;
      });

      const resolved = await Promise.all(productsWithMetricsPromises);
      setProducts(resolved);
      setError(null);
    } catch (err) {
      setError('Failed to load products');
      console.error('Error fetching products:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Memoize cancel handler
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
      showToast?.({ message: 'Product deleted successfully', kind: 'success' });
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      showToast?.({ message: 'Failed to delete product', kind: 'error' });
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

  // Sync local state with prop
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
    const normalizedType = type?.toLowerCase() || '';
    return (productTypeNames as any)[normalizedType] || type;
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

  // Initial fetch on component mount
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleNewProductSubmit = async (formData: ProductFormData) => {
    setShowNewProductForm(false);
    try {
      await createProductApi(formData);
      await fetchProducts();
      setShowCreateProduct(false);
      setShowNewProductForm(false);
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Failed to create product. Please try again.');
    }
  };

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => p.productName?.toLowerCase().includes(productQuery.toLowerCase()))
      .sort((a, b) => {
        if (a.status?.toLowerCase() === 'draft' && b.status?.toLowerCase() !== 'draft') return -1;
        if (a.status?.toLowerCase() !== 'draft' && b.status?.toLowerCase() === 'draft') return 1;
        return 0;
      });
  }, [products, productQuery]);

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
              onConfirm={handleConfirmDelete}
            />
          )}

          {/* Create Product Form */}
          {showCreateProduct && !isEditFormOpen && (
            <CreateProduct
              onClose={handleCreateProductCancel}
              draftProduct={editingProduct as unknown as DraftProduct}
            />
          )}

          {/* Kong Integration popup */}
          {showKongIntegration && (
            <div className="products-form-container">
              <KongIntegration onClose={() => setShowKongIntegration(false)} />
            </div>
          )}

          {/* Edit Product Form */}
          {isEditFormOpen && (
            <div className="products-form-container">
              <EditProduct
                productId={editingProduct?.productId.toString() || ''}
                onClose={() => {
                  setIsEditFormOpen(false);
                  setEditingProduct(null);
                  fetchProducts();
                }}
              />
            </div>
          )}

          {/* Main Content */}
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
                      <tr key={product.productId}>
                        <td>
                          <div className="product-name-container">
                            {(() => {
                              // IMPORTANT: Only use the blob URL we fetched with auth
                              const safeIconUrl = product.iconUrl;
                              if (safeIconUrl) {
                                return (
                                  <div className="product-icon product-icon--image">
                                    <img
                                      src={safeIconUrl}
                                      alt={`${product.productName} icon`}
                                      onError={(e) => {
                                        const wrapper = e.currentTarget.parentElement as HTMLElement;
                                        if (wrapper) wrapper.classList.remove('product-icon--image');
                                        e.currentTarget.remove();
                                      }}
                                    />
                                  </div>
                                );
                              }
                              // Fallback to initials tile (NEVER use raw protected URL)
                              return (
                                <div
                                  className="product-icon"
                                  style={{
                                    backgroundColor:
                                      getRandomBackgroundColor(parseInt(product.productId) || 0),
                                    borderColor:
                                      getRandomBorderColor(parseInt(product.productId) || 0)
                                  }}
                                >
                                  {product.productName?.substring(0, 2).toUpperCase() || 'PR'}
                                </div>
                              );
                            })()}

                            <div className="product-name">{product.productName}</div>
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
                                const truncatedUOM =
                                  metric.unitOfMeasure.length > 3
                                    ? metric.unitOfMeasure.substring(0, 3) + '...'
                                    : metric.unitOfMeasure;

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
