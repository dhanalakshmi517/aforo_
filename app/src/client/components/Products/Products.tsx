import * as React from 'react';
import { useEffect, useState, useCallback } from 'react';
import { ProductFormData } from '../../../types/productTypes';
import EditProduct from './EditProductsss/EditProduct';
import { ProductType } from './EditProduct/types';
import CreateProduct from './NewProducts/NewProduct';
import './Products.css';
import { getProducts, createProduct as createProductApi, deleteProduct as deleteProductApi } from './api';
import styles from './Products.module.css';
import EmptyBox from './Componenets/empty.svg';
import PageHeader from '../PageHeader/PageHeader';

/* ---------- Inline icons used in toasts ---------- */
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
}

const Notification: React.FC<NotificationProps> = ({ message, type, productName }) => {
  const Icon = type === 'success' ? SuccessIcon : ErrorIcon;
  return (
    <div className={`notification ${type === 'error' ? 'error' : ''}`}>
      <div className="notification-icon">
        <Icon />
      </div>
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

const DeleteModal: React.FC<DeleteModalProps> = ({ onCancel, onConfirm, isDeleting }) => (
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
  productType: string;
  billable?: boolean;
  status: string;
  category: string;
  createdOn?: string;
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
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [deleteProductName, setDeleteProductName] = useState<string>('');

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [notification, setNotification] = useState<NotificationState | null>(null);
  const [showCreateProduct, setShowCreateProduct] = useState(showNewProductForm);

  const handleCreateProductCancel = useCallback(() => {
    setShowCreateProduct(false);
    setShowNewProductForm(false);
  }, [setShowNewProductForm]);

  /* Toast auto-dismiss */
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => setNotification(null), 4000);
    return () => clearTimeout(timer);
  }, [notification]);

  /* Map product types to display labels */
  const productTypeNames = {
    [ProductType.API]: 'API',
    [ProductType.FLATFILE]: 'FlatFile',
    [ProductType.SQLRESULT]: 'SQLResult',
    [ProductType.LLMTOKEN]: 'LLM Token',
  } as const;

  const getProductTypeName = (type: string): string => {
    const normalized = (type || '').toLowerCase();
    return (productTypeNames as any)[normalized] || type;
  };

  /* Data fetch */
  useEffect(() => {
    const fetchAndSetProducts = async () => {
      try {
        const list = await getProducts();
        setProducts(list);
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

  /* Sync “open create form” with parent prop */
  useEffect(() => {
    if (showCreateProduct !== showNewProductForm) {
      setShowCreateProduct(showNewProductForm);
    }
  }, [showNewProductForm, showCreateProduct]);

  /* Create */
  const handleNewProductSubmit = async (formData: ProductFormData) => {
    setShowNewProductForm(false);
    try {
      const created = await createProductApi(formData);
      setProducts(prev => [...prev, created]);
      setShowCreateProduct(false);
      setShowNewProductForm(false);
    } catch (err) {
      console.error('Error creating product:', err);
      alert('Failed to create product. Please try again.');
    }
  };

  /* Delete */
  const confirmDelete = async () => {
    if (deleteProductId === null) return;
    setIsDeleting(true);
    try {
      await deleteProductApi(deleteProductId);
      setProducts(prev => prev.filter(p => p.productId !== deleteProductId));
      setNotification({ type: 'success', message: 'Product deleted successfully.', productName: deleteProductName });
    } catch (err) {
      console.error(err);
      setNotification({ type: 'error', message: 'Failed to delete product. Please try again.', productName: deleteProductName });
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setDeleteProductId(null);
      setDeleteProductName('');
    }
  };

  if (isLoading) return <div className="loading">Loading products...</div>;
  if (error) return <div className="error">Something Went wrong: {error}</div>;

  const searchDisabled = products.length === 0 && !isLoading && !error;

  return (
    <div className="products-container">
      {/* Toasts */}
      {notification && (
        <div className="notification-container">
          <Notification
            type={notification.type}
            message={notification.message}
            productName={notification.productName}
          />
        </div>
      )}

      {/* Delete modal */}
      {showDeleteModal && (
        <DeleteModal
          onCancel={() => setShowDeleteModal(false)}
          onConfirm={confirmDelete}
          isDeleting={isDeleting}
        />
      )}

      {/* Create form */}
      {showCreateProduct && (
        <CreateProduct onClose={handleCreateProductCancel} onSubmit={handleNewProductSubmit} />
      )}

      {/* Edit form */}
      {isEditFormOpen && (
        <div className="products-form-container">
          <EditProduct
            productId={editingProduct?.productId.toString() || ''}
            onClose={() => {
              setIsEditFormOpen(false);
              setProducts([]); // trigger a refresh upstream if needed
            }}
          />
        </div>
      )}

      {/* Main content (list) */}
      {!showCreateProduct && !isEditFormOpen && (
        <>
          <PageHeader
            title="Products"
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            primaryLabel="New Product"
            onPrimaryClick={() => {
              setShowCreateProduct(true);
              setShowNewProductForm(true);
            }}
            onFilterClick={() => { /* future filter */ }}
            searchDisabled={searchDisabled}
            showPrimary={true}
          />

          <div className="products-table-wrapper">
            <table className="products-table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Product Type</th>
                  <th>Billable Metrics 
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ marginLeft: 4 }}>
                      <path d="M6 8V6M6 4H6.005M11 6C11 8.76142 8.76142 11 6 11C3.23858 11 1 8.76142 1 6C1 3.23858 3.23858 1 6 1C8.76142 1 11 3.23858 11 6Z" stroke="#98959A" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </th>
                  <th>Status</th>
                  <th>Created On</th>
                  <th className="actions-cell">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products
                  .filter(p =>
                    (p?.productName || '')
                      .toLowerCase()
                      .includes((searchTerm || '').toLowerCase())
                  )
                  .map((product) => (
                    <tr key={product.productId}>
                      <td>{product.productName}</td>
                      <td>
                        <span className={`product-type-badge--${(product.productType || 'default').toLowerCase()}`}>
                          {getProductTypeName(product.productType || '')}
                        </span>
                      </td>
                      <td>{/* Billable metrics (optional) */}</td>
                      <td>
                        <span className={`product-status-badge status-${product.status.toLowerCase()}`}>
                          {product.status.charAt(0) + product.status.slice(1).toLowerCase()}
                        </span>
                      </td>
                      <td>{product.createdOn ?? 'N/A'}</td>
                      <td className="actions-cell">
                        <div className="product-action-buttons">
                          <button
                            className="product-edit-button"
                            onClick={() => {
                              setEditingProduct(product);
                              setIsEditFormOpen(true);
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                              <path d="M7.00031 12.3334H13.0003M9.91764 1.41473C10.183 1.14934 10.543 1.00024 10.9183 1.00024C11.2936 1.00024 11.6536 1.14934 11.919 1.41473C12.1844 1.68013 12.3335 2.04008 12.3335 2.4154C12.3335 2.79072 12.1844 3.15067 11.919 3.41607L3.91231 11.4234C3.75371 11.582 3.55766 11.698 3.34231 11.7607L1.42764 12.3194C1.37028 12.3361 1.30947 12.3371 1.25158 12.3223C1.1937 12.3075 1.14086 12.2774 1.09861 12.2351C1.05635 12.1929 1.02624 12.14 1.01141 12.0821C0.996575 12.0242 0.997578 11.9634 1.01431 11.9061L1.57298 9.9914C1.63579 9.77629 1.75181 9.58048 1.91031 9.42207L9.91764 1.41473Z" stroke="#1D7AFC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
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

                {/* Empty state */}
                {products.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '60px 0', borderBottom: 'none' }}>
                      <div className="products-empty-state">
                        <img src={EmptyBox} alt="No products" style={{ width: 200, height: 200 }} />
                        <p className="products-empty-state-text" style={{ marginTop: 8 }}>
                          No products added yet. Click "New Product" to <br/> create your first product.
                        </p>
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
        </>
      )}
    </div>
  );
}
