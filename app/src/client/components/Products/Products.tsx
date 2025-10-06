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
import { getProducts, createProduct as createProductApi, deleteProduct as deleteProductApi } from './api';
import ConfirmDeleteModal from '../componenetsss/ConfirmDeleteModal';

// Function to get a random background color for metric cards
const getRandomBackgroundColor = (index: number) => {
  const colors = [
    '#F0F9FF', // Light blue
    '#F0FDF4', // Light green
    '#F5F3FF', // Light purple
    '#FFFBEB', // Light amber
    '#FEF2F2'  // Light red
  ];
  return colors[index % colors.length];
};

// Function to get a random border color for metric cards
const getRandomBorderColor = (index: number) => {
  const colors = [
    '#E0F2FE', // Border blue
    '#DCFCE7', // Border green
    '#EDE9FE', // Border purple
    '#FEF3C7', // Border amber
    '#FECACA'  // Border red
  ];
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
  // Prevent browser scroll for Products page
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);
  const location = useLocation();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch products with billable metrics included in the response
  const fetchProducts = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const products = await getProducts();
      console.log('Fetched products:', products); // Debug log
      
      // Process products and map billableMetrics to metrics
      const productsWithMetrics = products.map((product, index) => {
        console.log(`=== Product ${index + 1}: ${product.productName} ===`);
        console.log('Full product object:', product);
        console.log('Has billableMetrics property:', 'billableMetrics' in product);
        console.log('billableMetrics value:', (product as any).billableMetrics);
        console.log('billableMetrics length:', (product as any).billableMetrics?.length || 0);
        console.log('==========================================');
        
        // Map billableMetrics to metrics for component compatibility
        const productWithMetrics = {
          ...product,
          metrics: (product as any).billableMetrics || []
        } as Product;
        
        return productWithMetrics;
      });
      
      setProducts(productsWithMetrics);
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
  // products filtered by search term and sorted with drafts at top
  const filteredProducts = products
    .filter(p => p.productName?.toLowerCase().includes(productQuery.toLowerCase()))
    .sort((a, b) => {
      // Sort by status: draft products first, then others
      if (a.status.toLowerCase() === 'draft' && b.status.toLowerCase() !== 'draft') {
        return -1; // a comes before b
      }
      if (a.status.toLowerCase() !== 'draft' && b.status.toLowerCase() === 'draft') {
        return 1; // b comes before a
      }
      // If both are draft or both are not draft, maintain original order
      return 0;
    });
  const [showCreateProduct, setShowCreateProduct] = useState(showNewProductForm);

  // get toast API
  const { showToast } = useToast();

  // Memoize the cancel handler to prevent re-renders
  const handleCreateProductCancel = React.useCallback(() => {
    setShowCreateProduct(false);
    setShowNewProductForm(false);
    setEditingProduct(null);
    // Refresh products list when closing the form to ensure data is up to date
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

  // Sync with parent component's state

  // Sync local state with prop, but only update if different to prevent re-renders
  useEffect(() => {
    console.log('useEffect - showNewProductForm changed:', { showNewProductForm, showCreateProduct });
    if (showCreateProduct !== showNewProductForm) {
      console.log('Updating showCreateProduct to:', showNewProductForm);
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
    return productTypeNames[normalizedType as ProductType] || type;
  };

  const InfoIcon = () => (
    <span 
      className="info-icon-tooltip" 
      title="The unit of usage your customers are billed on, e.g., users, storage, or API calls"
      style={{ marginLeft: 4, cursor: 'help' }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
        <g clipPath="url(#clip0_6157_14454)">
          <path d="M6 8V6M6 4H6.005M11 6C11 8.76142 8.76142 11 6 11C3.23858 11 1 8.76142 1 6C1 3.23858 3.23858 1 6 1C8.76142 1 11 3.23858 11 6Z" stroke="#98959A" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </g>
        <defs>
          <clipPath id="clip0_6157_14454">
            <rect width="12" height="12" fill="white" />
          </clipPath>
        </defs>
      </svg>
    </span>
  );

  // const renderBreadcrumb = () => {
  //   if (!showCreateProduct && !isEditFormOpen) {
  //     return (
  //       <div className={styles.breadcrumb}>
  //         <span className={`${styles.breadcrumbItem} ${styles.active}`}>Products</span>
  //         <div className={styles.breadcrumbRight}>
  //           {/* Bell Icon */}
  //           <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
  //             <path d="M7.55606 16.5003C7.70234 16.7537 7.91274 16.964 8.16609 17.1103C8.41945 17.2566 8.70684 17.3336 8.99939 17.3336C9.29194 17.3336 9.57933 17.2566 9.83269 17.1103C10.086 16.964 10.2964 16.7537 10.4427 16.5003M1.71772 11.772C1.60886 11.8913 1.53702 12.0397 1.51094 12.1991C1.48486 12.3585 1.50566 12.522 1.57081 12.6698C1.63597 12.8176 1.74267 12.9433 1.87794 13.0316C2.0132 13.1198 2.17121 13.1669 2.33272 13.167H15.6661C15.8276 13.167 15.9856 13.1202 16.1209 13.0321C16.2563 12.944 16.3631 12.8184 16.4285 12.6708C16.4938 12.5231 16.5148 12.3596 16.4889 12.2001C16.4631 12.0407 16.3914 11.8923 16.2827 11.7728C15.1744 10.6303 13.9994 9.41616 13.9994 5.66699C13.9994 4.34091 13.4726 3.06914 12.5349 2.13146C11.5972 1.19378 10.3255 0.666992 8.99939 0.666992C7.67331 0.666992 6.40154 1.19378 5.46386 2.13146C4.52618 3.06914 3.99939 4.34091 3.99939 5.66699C3.99939 9.41616 2.82356 10.6303 1.71772 11.772Z" stroke="#706C72" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
  //           </svg>
  //           {/* Gear Icon */}
  //           <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
  //             <path d="M9.18236 0.666992H8.81569C8.37366 0.666992 7.94974 0.842587 7.63718 1.15515C7.32462 1.46771 7.14902 1.89163 7.14902 2.33366V2.48366C7.14872 2.77593 7.07157 3.06298 6.92531 3.31602C6.77904 3.56906 6.56881 3.77919 6.31569 3.92533L5.95736 4.13366C5.70399 4.27994 5.41659 4.35695 5.12402 4.35695C4.83146 4.35695 4.54406 4.27994 4.29069 4.13366L4.16569 4.06699C3.78325 3.84638 3.32889 3.78653 2.90236 3.90058C2.47583 4.01464 2.11198 4.29327 1.89069 4.67533L1.70736 4.99199C1.48674 5.37444 1.42689 5.82879 1.54095 6.25532C1.655 6.68185 1.93364 7.0457 2.31569 7.26699L2.44069 7.35033C2.69259 7.49575 2.90204 7.70457 3.04823 7.95602C3.19443 8.20747 3.27227 8.4928 3.27403 8.78366V9.20866C3.27519 9.50234 3.19873 9.79112 3.05239 10.0457C2.90606 10.3004 2.69503 10.5118 2.44069 10.6587L2.31569 10.7337C1.93364 10.955 1.655 11.3188 1.54095 11.7453C1.42689 12.1719 1.48674 12.6262 1.70736 13.0087L1.89069 13.3253C2.11198 13.7074 2.47583 13.986 2.90236 14.1001C3.32889 14.2141 3.78325 14.1543 4.16569 13.9337L4.29069 13.867C4.54406 13.7207 4.83146 13.6437 5.12402 13.6437C5.41659 13.6437 5.70399 13.7207 5.95736 13.867L6.31569 14.0753C6.56881 14.2215 6.77904 14.4316 6.92531 14.6846C7.07157 14.9377 7.14872 15.2247 7.14902 15.517V15.667C7.14902 16.109 7.32462 16.5329 7.63718 16.8455C7.94974 17.1581 8.37366 17.3337 8.81569 17.3337H9.18236C9.62439 17.3337 10.0483 17.1581 10.3609 16.8455C10.6734 16.5329 10.849 16.109 10.849 15.667V15.517C10.8493 15.2247 10.9265 14.9377 11.0727 14.6846C11.219 14.4316 11.4292 14.2215 11.6824 14.0753L12.0407 13.867C12.2941 13.7207 12.5815 13.6437 12.874 13.6437C13.1666 13.6437 13.454 13.7207 13.7074 13.867L13.8324 13.9337C14.2148 14.1543 14.6692 14.2141 15.0957 14.1001C15.5222 13.986 15.8861 13.7074 16.1074 13.3253L16.2907 13.0003C16.5113 12.6179 16.5712 12.1635 16.4571 11.737C16.343 11.3105 16.0644 10.9466 15.6824 10.7253L15.5574 10.6587C15.303 10.5118 15.092 10.3004 14.9457 10.0457C14.7993 9.79112 14.7229 9.50234 14.724 9.20866V8.79199C14.7229 8.49831 14.7993 8.20953 14.9457 7.9549C15.092 7.70027 15.303 7.48883 15.5574 7.34199L15.6824 7.26699C16.0644 7.0457 16.343 6.68185 16.4571 6.25532C16.5712 5.82879 16.5113 5.37444 16.2907 4.99199L16.1074 4.67533C15.8861 4.29327 15.5222 4.01464 15.0957 3.90058C14.6692 3.78653 14.2148 3.84638 13.8324 4.06699L13.7074 4.13366C13.454 4.27994 13.1666 4.35695 12.874 4.35695C12.5815 4.35695 12.2941 4.27994 12.0407 4.13366L11.6824 3.92533C11.4292 3.77919 11.219 3.56906 11.0727 3.31602C10.9265 3.06298 10.8493 2.77593 10.849 2.48366V2.33366C10.849 1.89163 10.6734 1.46771 10.3609 1.15515C10.0483 0.842587 9.62439 0.666992 9.18236 0.666992Z" stroke="#706C72" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
  //             <path d="M8.99902 11.5003C10.3797 11.5003 11.499 10.381 11.499 9.00033C11.499 7.61961 10.3797 6.50033 8.99902 6.50033C7.61831 6.50033 6.49902 7.61961 6.49902 9.00033C6.49902 10.381 7.61831 11.5003 8.99902 11.5003Z" stroke="#706C72" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
  //           </svg>
  //         </div>
  //       </div>
  //     );
  //   }
  //   return null;
  // };

  // Initial fetch on component mount
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleNewProductSubmit = async (formData: ProductFormData) => {
    setShowNewProductForm(false);
    try {
      await createProductApi(formData);
      // Refresh list so that we always have latest with metrics
      await fetchProducts();
      setShowCreateProduct(false);
      if (setShowNewProductForm) {
        setShowNewProductForm(false);
      }
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
      // Refresh the list after successful delete
      await fetchProducts();
      setShowConfirmDeleteModal(false);
      setDeleteProductId(null);
      // toast success
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

  // Moved ConfirmDeleteModal and Notification components outside the main component to prevent hook issues

  if (error) return <div className="error">Something Went wrong: {error}</div>;

  return (
    <ToastProvider>
      <>

      <div>
        {/* {renderBreadcrumb()} */}
        {showConfirmDeleteModal && (
          <ConfirmDeleteModal
            isOpen={showConfirmDeleteModal}
            productName={deleteProductName}
            onCancel={handleDeleteCancel}
            onConfirm={handleDeleteConfirm}
          />
        )}

        {/* Create Product Form */}
        {showCreateProduct && !isEditFormOpen && (
          <CreateProduct
            onClose={handleCreateProductCancel}
            draftProduct={editingProduct as unknown as DraftProduct}
          />
        )}

        {/* Edit Product Form */}
        {/* Kong Integration popup */}
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
                // Refresh the products list after save
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
              primaryLabel="New Product"
              onPrimaryClick={() => navigate('/get-started/products/new')}
              onFilterClick={() => { }}
              onSettingsClick={() => setShowKongIntegration(true)}
              onNotificationsClick={() => { }}
            />

            <div className="products-table-wrapper">
              <table className="products-table">
                <thead>
                  <tr>
                    <th>Product Name </th>
                    <th>Product Type </th>
                    <th>Billable Metrics <InfoIcon /></th>
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
                            <div className="product-icon" style={{ backgroundColor: getRandomBackgroundColor(parseInt(product.productId) || 0) }}>
                              {product.productName?.substring(0, 2).toUpperCase() || 'PR'}
                            </div>
                            <div className="product-name">
                              {product.productName}
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`product-type-badge--${product.productType?.toLowerCase() || 'default'}`}>
                            {getProductTypeName(product.productType || '')}
                          </span>
                        </td>
                        <td className="metrics-cell">
                          <div className="metrics-wrapper">
                            {product.metrics && product.metrics.length > 0 ? (
                              product.metrics.map((metric, index) => {
                                console.log(`Rendering metric for ${product.productName}:`, {
                                  metricName: metric.metricName,
                                  unitOfMeasure: metric.unitOfMeasure,
                                  fullMetric: metric
                                });
                                const truncatedName = metric.metricName.length > 3 
                                  ? metric.metricName.substring(0, 3) + '...'
                                  : metric.metricName;
                                const truncatedUOM = metric.unitOfMeasure.length > 3 
                                  ? metric.unitOfMeasure.substring(0, 3) + '...'
                                  : metric.unitOfMeasure;
                                
                                return (
                                  <div key={index} className="metric-item" style={{ backgroundColor: getRandomBackgroundColor(index) }}>
                                    <div className="metric-content">
                                      <div className="metric-uom" title={metric.unitOfMeasure}>{truncatedUOM}</div>
                                      <div className="metric-name" title={metric.metricName}>{truncatedName}</div>
                                    </div>
                                  </div>
                                );
                              })
                            ) : (
                              <span className="no-metrics">-</span>
                            )}
                          </div>
                        </td>
                        <td>{/* Status badge */}
                          <span className={`product-status-badge status-${product.status.toLowerCase()}`}>{product.status.charAt(0) + product.status.slice(1).toLowerCase()}</span></td>
                        <td>{product.createdOn ?? 'N/A'}</td>
                        <td className="actions-cell">
                          <div className="product-action-buttons">
                            {product.status.toLowerCase() === 'draft' ? (
                              <button
                                className="product-view-button"
                                onClick={() => {
                                  // Navigate to new product page with draft data
                                  navigate('/get-started/products/new', { state: { draftProduct: product } });
                                }}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                  <path d="M7.99967 1.33325C11.6816 1.33325 14.6663 4.31802 14.6663 7.99992C14.6663 11.6818 11.6816 14.6666 7.99967 14.6666C4.31778 14.6666 1.33301 11.6818 1.33301 7.99992H5.33301H10.6663M10.6663 7.99992L7.99967 10.6666M10.6663 7.99992L7.99967 5.33325" stroke="#025A94" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                                  <path d="M7.00031 12.3334H13.0003M9.91764 1.41473C10.183 1.14934 10.543 1.00024 10.9183 1.00024C11.2936 1.00024 11.6536 1.14934 11.919 1.41473C12.1844 1.68013 12.3335 2.04008 12.3335 2.4154C12.3335 2.79072 12.1844 3.15067 11.919 3.41607L3.91231 11.4234C3.75371 11.582 3.55766 11.698 3.34231 11.7607L1.42764 12.3194C1.37028 12.3361 1.30947 12.3371 1.25158 12.3223C1.1937 12.3075 1.14086 12.2774 1.09861 12.2351C1.05635 12.1929 1.02624 12.140 1.01141 12.0821C0.996575 12.0242 0.997578 11.9634 1.01431 11.9061L1.57298 9.9914C1.63579 9.77629 1.75181 9.58048 1.91031 9.42207L9.91764 1.41473Z" stroke="#1D7AFC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </button>
                            )}
                            <button
                              className="product-delete-button"
                              onClick={() => handleDeleteClick(product.productId, product.productName)}
                              disabled={isDeleting}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="17" height="16" viewBox="0 0 17 16" fill="none">
                                <path d="M2.59961 4.00016H14.5996M13.2663 4.00016V13.3335C13.2663 14.0002 12.5996 14.6668 11.9329 14.6668H5.26628C4.59961 14.6668 3.93294 14.0002 3.93294 13.3335V4.00016M5.93294 4.00016V2.66683C5.93294 2.00016 6.59961 1.3335 7.26628 1.3335H9.93294C10.5996 1.3335 11.2663 2.00016 11.2663 2.66683V4.00016M7.26628 7.3335V11.3335M9.93294 7.3335V11.3335" stroke="#E34935" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  {filteredProducts.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '60px 0', borderBottom: 'none' }}>
                        <div className="products-empty-state">
                          <img src={EmptyBox} alt="No products" style={{ width: 200, height: 200 }} />
                          <p className="products-empty-state-text" style={{ marginTop: 8 }}>No products added yet. Click "New Product" to <br /> create your first product.</p>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                            <PrimaryButton
                              onClick={() => navigate('/get-started/products/new')}
                            >
                              + New Product
                            </PrimaryButton>
                            <TertiaryButton
                              onClick={() => {
                                setShowKongIntegration(true);
                              }}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="15" viewBox="0 0 16 15" fill="none" style={{ marginRight: '8px' }}>
                                <path d="M0.400391 11.2438V14.1384H2.88147L5.1558 11.0371H7.84363L8.67066 10.0033L5.56931 6.48841L3.50174 8.34922H2.67472L0.400391 11.2438Z" fill="url(#paint0_linear_8506_33340)"/>
                                <path d="M5.56931 11.8641L5.1558 12.2776L5.98282 13.5181V14.1384H9.29093L9.49769 13.5181L7.84363 11.8641H5.56931Z" fill="url(#paint1_linear_8506_33340)"/>
                                <path d="M7.43012 3.80057L6.18958 5.86814L12.599 13.3114L12.3923 14.1384H15.0801L15.7004 11.8641L8.87742 3.80057H7.43012Z" fill="url(#paint2_linear_8506_33340)"/>
                                <path d="M8.4639 1.733L7.63688 2.97354L7.84363 3.1803H9.29093L11.9788 6.07489L13.4261 4.83435V4.42084L13.0126 3.59381V2.76679L10.118 0.699219L8.4639 1.733Z" fill="url(#paint3_linear_8506_33340)"/>
                                <defs>
                                  <linearGradient id="paint0_linear_8506_33340" x1="12.8058" y1="3.1803" x2="1.02066" y2="13.5181" gradientUnits="userSpaceOnUse">
                                    <stop stopColor="#14A06C"/>
                                    <stop offset="1" stopColor="#2578D1"/>
                                  </linearGradient>
                                  <linearGradient id="paint1_linear_8506_33340" x1="12.8058" y1="3.1803" x2="1.02066" y2="13.5181" gradientUnits="userSpaceOnUse">
                                    <stop stopColor="#14A06C"/>
                                    <stop offset="1" stopColor="#2578D1"/>
                                  </linearGradient>
                                  <linearGradient id="paint2_linear_8506_33340" x1="12.8058" y1="3.1803" x2="1.02066" y2="13.5181" gradientUnits="userSpaceOnUse">
                                    <stop stopColor="#14A06C"/>
                                    <stop offset="1" stopColor="#2578D1"/>
                                  </linearGradient>
                                  <linearGradient id="paint3_linear_8506_33340" x1="12.8058" y1="3.1803" x2="1.02066" y2="13.5181" gradientUnits="userSpaceOnUse">
                                    <stop stopColor="#14A06C"/>
                                    <stop offset="1" stopColor="#2578D1"/>
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