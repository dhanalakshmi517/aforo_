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
      const response = await axios.get(resolved, {
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
    setIsLoading(true);
    try {
      const products = await getProducts();
      const productsWithMetricsPromises = products.map(async (product) => {
        const iconUrl = await fetchIconWithAuth((product as any).icon);
        const productWithMetrics = {
          ...product,
          metrics: (product as any).billableMetrics || [],
          iconUrl
        } as Product;
        return productWithMetrics;
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
                onClose={() => {
                  setIsEditFormOpen(false);
                  setEditingProduct(null);
                  fetchProducts();
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
                      <tr key={product.productId}>
                        {/* ===== Product Name cell (spec-accurate) ===== */}
                        <td className="product-name-td">
                          <div className="product-name-cell">
                            <div className="product-name-cell__icon">
                              {product.iconUrl ? (
                                <div className="product-avatar product-avatar--image">
                                  <img
                                    src={product.iconUrl}
                                    alt={`${product.productName} icon`}
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
