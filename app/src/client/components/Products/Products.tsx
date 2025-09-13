import * as React from 'react';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ProductFormData } from '../../../types/productTypes';
import EditProduct from './EditProductsss/EditProduct';
import { ProductType, EditProductFormProps } from './EditProduct/types';
import CreateProduct from './NewProducts/NewProduct';
import './Products.css';
import { getProducts, createProduct as createProductApi, deleteProduct as deleteProductApi } from './api';
import ConfirmDeleteModal from '../componenetsss/ConfirmDeleteModal';

// Function to get a random background color for metric cards
const getRandomBackgroundColor = (index: number) => {
  const colors = [
    'rgba(234, 212, 174, 0.15)', // Border blue
    'rgba(174, 234, 196, 0.15)', // Border green
    'rgba(175, 233, 227, 0.15)', // Border green
    'rgba(175, 233, 227, 0.15)', // Border purple
    'rgba(235, 220, 173, 0.15)', // Border amber
    'rgba(230, 200, 178, 0.15)',
    'rgba(252, 165, 165, 0.2)'
  ];
  return colors[index % colors.length];
};

// Function to get a random border color for metric cards
const getRandomBorderColor = (index: number) => {
  const colors = [
   'rgba(234, 212, 174, 0.15)', // Border blue
    'rgba(174, 234, 196, 0.15)', // Border green
    'rgba(175, 233, 227, 0.15)', // Border green
    'rgba(175, 233, 227, 0.15)', // Border purple
    'rgba(235, 220, 173, 0.15)', // Border amber
    'rgba(230, 200, 178, 0.15)',
    'rgba(252, 165, 165, 0.2)'
  ];
  return colors[index % colors.length];
};
import styles from './Products.module.css';
import PageToolbar from '../componenetsss/PageToolBar';
import EmptyBox from './Componenets/empty.svg';
import IconButton from '../componenetsss/IconButton';

// Icon components
const SuccessIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
    <path d="M20 6L9 17L4 12" stroke="#23A36D" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ErrorIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
    <path d="M12 8V12M12 16H12.01M7.9 20C9.8 21 12 21.2 14.1 20.75C16.2 20.3 18 19.05 19.3 17.3C20.6 15.55 21.15 13.4 20.98 11.3C20.81 9.15 19.89 7.15 18.37 5.63C16.85 4.11 14.85 3.18 12.71 3.02C10.57 2.85 8.44 3.45 6.71 4.72C4.97 5.98 3.75 7.82 3.25 9.91C2.76 12 3.02 14.19 4 16.1L2 22L7.9 20Z" stroke="#E34935" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

interface NotificationProps {
  message: string;
  type: 'success' | 'error';
  productName: string;
  onClose: () => void;
}
 const Notification: React.FC<NotificationProps> = ({ message, type, productName, onClose }: NotificationProps) => {
  const Icon = type === 'success' ? SuccessIcon : ErrorIcon;
  return (
    <div className={`notification ${type === 'error' ? 'error' : ''}`}>
      <div className="notification-icon">
        <Icon />
      </div>
      <button className="notification-close" onClick={onClose} aria-label="Close">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M12 4L4 12M4 4L12 12" stroke="#373B40" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      <div className="notification-text">
        <h5>{type === 'success' ? 'Product Deleted' : 'Failed to Delete Product'}</h5>
        <p className="notification-details">
          {type === 'success'
            ? `The product "${productName}" was successfully deleted.`
            : `Failed to delete the product "${productName}". Please try again.`}
        </p>
      </div>
    </div>
  );
};

interface DeleteModalProps {
  onCancel: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

const DeleteModal: React.FC<DeleteModalProps> = ({ onCancel, onConfirm, isDeleting }: DeleteModalProps) => (
  <div className="rate-delete-modal-overlay">
    <div className="rate-delete-modal-content">
      <div className="rate-delete-modal-body">
        <h5>Are you sure you want to delete this <br />rate plan?</h5>
        <p>This action cannot be undone.</p>
      </div>
      <div className="rate-delete-modal-footer">
        <button className="rate-delete-modal-cancel" onClick={onCancel}>Back</button>
        <button className="rate-delete-modal-confirm" onClick={onConfirm} disabled={isDeleting}>
          {isDeleting ? 'Deleting...' : 'Confirm'}
        </button>
      </div>
    </div>
  </div>
);

interface Product {
  productId: string;
  productName: string;
  productDescription?: string;
  productType: string;
  billable?: boolean;
  status: string;
  category: string;
  createdOn?: string;
  billableMetrics?: any[];
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

type NotificationType = 'success' | 'error';

interface NotificationState {
  type: NotificationType;
  message: string;
  productName: string;
}

export default function Products({ showNewProductForm, setShowNewProductForm }: ProductsProps) {
  // Prevent browser scroll for Products page
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);
  const location = useLocation();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [deleteProductName, setDeleteProductName] = useState<string>('');
  const [productQuery, setProductQuery] = useState<string>('');
  const [notification, setNotification] = useState<NotificationState | null>(null);
  const [showCreateProduct, setShowCreateProduct] = useState(showNewProductForm);
  
  // Memoize the cancel handler to prevent re-renders
  const handleCreateProductCancel = React.useCallback(() => {
    setShowCreateProduct(false);
    setShowNewProductForm(false);
  }, [setShowNewProductForm]);

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

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 4000); // 4 seconds

      return () => clearTimeout(timer);
    }
  }, [notification]);


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
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ marginLeft: 4 }}>
      <g clipPath="url(#clip0_6157_14454)">
        <path d="M6 8V6M6 4H6.005M11 6C11 8.76142 8.76142 11 6 11C3.23858 11 1 8.76142 1 6C1 3.23858 3.23858 1 6 1C8.76142 1 11 3.23858 11 6Z" stroke="#98959A" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      </g>
      <defs>
        <clipPath id="clip0_6157_14454">
          <rect width="12" height="12" fill="white"/>
        </clipPath>
      </defs>
    </svg>
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

  useEffect(() => {
    const fetchAndSetProducts = async () => {
      try {
        const list = await getProducts();
        console.log('Products payload:', list);
        // normalize billableMetrics -> metrics for UI
        const normalized = list.map((p: any) => ({
          ...p,
          metrics: (p.billableMetrics || []).map((m: any) => ({
            metricName: m.metricName || '',
            unitOfMeasure: m.unitOfMeasure || ''
          }))
        }));
        setProducts(normalized as any);
        setError(null);
        setError(null);
      } catch (err) {
        setError('Failed to load products');
        console.error('Error fetching products:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndSetProducts();
  }, []);

  const handleNewProductSubmit = async (formData: ProductFormData) => {
    setShowNewProductForm(false);
    try {
      const created = await createProductApi(formData);

      setProducts([...products, created]);
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
      setProducts(products.filter(p => p.productId !== deleteProductId));
      setShowDeleteModal(false);
      setDeleteProductId(null);
      setNotification({
        type: 'success',
        message: 'Product deleted successfully',
        productName: deleteProductName
      });
    } catch (err) {
      console.error('Failed to delete product:', err);
      setNotification({
        type: 'error',
        message: 'Failed to delete product',
        productName: deleteProductName
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Moved DeleteModal and Notification components outside the main component to prevent hook issues

  if (isLoading) return <div className="loading">Loading products...</div>;
  if (error) return <div className="error">Something Went wrong: {error}</div>;

  return (
    <>
      {notification && (
        <div className="notification-container">
          <Notification 
            type={notification.type}
            message={notification.message}
            productName={notification.productName}
            onClose={() => setNotification(null)}
          />
        </div>
      )}

      <div>
        {/* {renderBreadcrumb()} */}
        {showDeleteModal && (
          <ConfirmDeleteModal
            isOpen={showDeleteModal}
            productName={deleteProductName}
            onConfirm={handleDeleteConfirm}
            onCancel={() => setShowDeleteModal(false)}
          />
        )}

        {/* Create Product Form */}
        {showCreateProduct && (
          <CreateProduct 
            onClose={handleCreateProductCancel} 
          />
        )}
          
          {/* Edit Product Form */}
          {isEditFormOpen && (
            <div className="products-form-container">
              <EditProduct
                productId={editingProduct?.productId.toString() || ''}
                onClose={() => {
                  setIsEditFormOpen(false);
                  // Refresh the products list after save by setting a new empty array
                  // This will trigger a re-render and fetch the updated products
                  setProducts([]);
                }}
              />
            </div>
          )}
          
          {/* Main Content */}
          {!showCreateProduct && !isEditFormOpen && (
            <div className="products-main-content">
              <div className="products-header" style={{ marginTop: 4 }}>
                <PageToolbar
                title="Products"
                searchValue={productQuery}
                onSearchChange={setProductQuery}
                searchDisabled={products.length === 0}
                showFilter={true}
                primaryButton={{ text: 'New Product', onClick: () => { setShowCreateProduct(true); setShowNewProductForm(true); } }}
                rightIcons={[{ type: 'bell' }, { type: 'settings' }]}
                />
              </div>
              {/* Products Table */}
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
                    {products
                      .filter(product => 
                        product?.productName?.toLowerCase()?.includes(productQuery?.toLowerCase() || '')
                      )
                      .map((product) => (
                      <tr key={product.productId}>
                        <td>
  <div className="product-name">
    {product.productName}
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
                              product.metrics.map((metric, index) => (
                                <div key={index} className="metric-item" style={{ backgroundColor: getRandomBackgroundColor(index) }}>
                                  <div className="metric-content">
                                    <div className="metric-uom">{metric.unitOfMeasure}</div>
                                    <div className="metric-name">{metric.metricName}</div>
                                  </div>
                                </div>
                              ))
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
                                  setEditingProduct(product);
                                  setIsEditFormOpen(true);
                                }}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                  <path d="M7.99967 1.33325C11.6816 1.33325 14.6663 4.31802 14.6663 7.99992C14.6663 11.6818 11.6816 14.6666 7.99967 14.6666C4.31778 14.6666 1.33301 11.6818 1.33301 7.99992H5.33301H10.6663M10.6663 7.99992L7.99967 10.6666M10.6663 7.99992L7.99967 5.33325" stroke="#025A94" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </button>
                            ) : (
                              <button 
                                className="product-edit-button"
                                onClick={() => {
                                  setEditingProduct(product);
                                  setIsEditFormOpen(true);
                                }}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                                  <path d="M7.00031 12.3334H13.0003M9.91764 1.41473C10.183 1.14934 10.543 1.00024 10.9183 1.00024C11.2936 1.00024 11.6536 1.14934 11.919 1.41473C12.1844 1.68013 12.3335 2.04008 12.3335 2.4154C12.3335 2.79072 12.1844 3.15067 11.919 3.41607L3.91231 11.4234C3.75371 11.582 3.55766 11.698 3.34231 11.7607L1.42764 12.3194C1.37028 12.3361 1.30947 12.3371 1.25158 12.3223C1.1937 12.3075 1.14086 12.2774 1.09861 12.2351C1.05635 12.1929 1.02624 12.140 1.01141 12.0821C0.996575 12.0242 0.997578 11.9634 1.01431 11.9061L1.57298 9.9914C1.63579 9.77629 1.75181 9.58048 1.91031 9.42207L9.91764 1.41473Z" stroke="#1D7AFC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </button>
                            )}
                            <button 
                              className="product-delete-button"
                              onClick={() => {
                                setDeleteProductId(product.productId);
                                setDeleteProductName(product.productName);
                                setShowDeleteModal(true);
                              }}
                              disabled={isDeleting}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="17" height="16" viewBox="0 0 17 16" fill="none">
                                <path d="M2.59961 4.00016H14.5996M13.2663 4.00016V13.3335C13.2663 14.0002 12.5996 14.6668 11.9329 14.6668H5.26628C4.59961 14.6668 3.93294 14.0002 3.93294 13.3335V4.00016M5.93294 4.00016V2.66683C5.93294 2.00016 6.59961 1.3335 7.26628 1.3335H9.93294C10.5996 1.3335 11.2663 2.00016 11.2663 2.66683V4.00016M7.26628 7.3335V11.3335M9.93294 7.3335V11.3335" stroke="#E34935" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {products.length === 0 && (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '60px 0', borderBottom: 'none' }}>
                          <div className="products-empty-state">
                            <img src={EmptyBox} alt="No products" style={{ width: 200, height: 200 }} />
                            <p className="products-empty-state-text" style={{ marginTop: 8 }}>No products added yet. Click "New Product" to <br/> create your first product.</p>
                            <button
                              onClick={() => {
                                setShowCreateProduct(true);
                                setShowNewProductForm(true);
                              }}
                              className={styles.newButton}
                              style={{ marginTop: 12 }}
                            >
                              + New Product
                            </button>
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
  );
}