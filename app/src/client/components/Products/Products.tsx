import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import NewProductForm from '../NewProductForm';
import { ProductFormData } from '../../../types/productTypes';
import EditProductForm from './EditProduct/EditProductForm';
import { ProductType, EditProductFormProps } from './EditProduct/types';
import './Products.css';
import styles from './Products.module.css';

interface Product {
  productId: number;
  productName: string;
  productType: ProductType;
  billable: boolean;
  status: string;
  category: string;
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
  const location = useLocation();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNewProductFormOpen, setIsNewProductFormOpen] = useState(showNewProductForm);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteProductId, setDeleteProductId] = useState<number | null>(null);
  const [deleteProductName, setDeleteProductName] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [notification, setNotification] = useState<NotificationState | null>(null);

  useEffect(() => {
    if (isNewProductFormOpen || isEditFormOpen) {
      document.body.classList.add('hide-sidebar');
    } else {
      document.body.classList.remove('hide-sidebar');
    }
  }, [isNewProductFormOpen, isEditFormOpen]);

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

  const renderBreadcrumb = () => {
    if (!isNewProductFormOpen && !isEditFormOpen) {
      return (
        <div className={styles.breadcrumb}>
          <span className={`${styles.breadcrumbItem} ${styles.active}`}>Products</span>
        </div>
      );
    }
    return null;
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://13.230.194.245:8080/api/products');
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        setProducts(data);
        setError(null);
      } catch (err) {
        setError('Failed to load products');
        console.error('Error fetching products:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleNewProductSubmit = async (formData: ProductFormData) => {
    setShowNewProductForm(false);
    try {
      const response = await fetch('http://13.230.194.245:8080/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to create product');
      }

      const data = await response.json();
      setProducts([...products, data]);
      setIsNewProductFormOpen(false);
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Failed to create product. Please try again.');
    }
  };

  const confirmDelete = async () => {
    if (deleteProductId === null) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`http://13.230.194.245:8080/api/products/${deleteProductId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) throw new Error('Delete failed');

      setProducts(products.filter(p => p.productId !== deleteProductId));
      setNotification({
        type: 'success',
        message: 'Product deleted successfully.',
        productName: deleteProductName
      });
    } catch (err) {
      console.error(err);
      setNotification({
        type: 'error',
        message: 'Failed to delete product. Please try again.',
        productName: deleteProductName
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setDeleteProductId(null);
      setDeleteProductName('');
    }
  };

  const DeleteModal = () => (
    <div className="delete-modal-overlay">
      <div className="delete-modal-content">
        <div className="delete-modal-body">
          <h5>
            Are you sure you want to delete <br />the product?
            <strong>"{deleteProductName}"</strong>
          </h5>
          <p>This action cannot be undone.</p>
        </div>
        <div className="delete-modal-footer">
          <button className="delete-modal-cancel" onClick={() => {
            setShowDeleteModal(false);
            setDeleteProductId(null);
          }}>Cancel</button>
          <button className="delete-modal-confirm" onClick={confirmDelete} disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );

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

  const Notification = ({ message, type, productName }: NotificationState) => {
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
              ? `The product “${productName}” was successfully deleted.`
              : `Failed to delete the product “${productName}”. Please try again.`}
          </p>
        </div>
      </div>
    );
  };

  if (isLoading) return <div className="loading">Loading products...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <>
      {notification && (
        <div className="notification-container">
          <Notification {...notification} />
        </div>
      )}

      <div>
        {renderBreadcrumb()}
        {showDeleteModal && <DeleteModal />}


        <div className="products-container">
          {isEditFormOpen ? (
            <div className="products-form-container">
              <EditProductForm
                productId={editingProduct?.productId.toString() || ''}
                productType={editingProduct?.productType || ProductType.API}
                productName={editingProduct?.productName || ''}
                onClose={() => setIsEditFormOpen(false)}
                onSave={() => {
                  setIsEditFormOpen(false);
                  // You can add any additional save logic here
                }}
                showEditForm={isEditFormOpen}
              />
            </div>
          ) : isNewProductFormOpen ? (
            <div className="products-form-container">
              <NewProductForm onSubmit={handleNewProductSubmit} onClose={() => setIsNewProductFormOpen(false)} />
            </div>
          ) : (
            <div className="products-main-content">
              <div className="products-header" style={{ marginTop: '24px' }}>
                <h2>Products</h2>
                <div className="products-actions">
                  <div className="products-search">
                    <svg className={styles.searchIcon} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M17.5 17.5L13.8833 13.8833M15.8333 9.16667C15.8333 12.8486 12.8486 15.8333 9.16667 15.8333C5.48477 15.8333 2.5 12.8486 2.5 9.16667C2.5 5.48477 5.48477 2.5 9.16667 2.5C12.8486 2.5 15.8333 5.48477 15.8333 9.16667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <input
                      type="search"
                      placeholder="Search among your products..."
                      className={styles.productsSearchInput}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <button className={styles.samButton}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M2.5 5H17.5M5.83333 10H14.1667M8.33333 15H11.6667" stroke="#706C72" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>
                  <button onClick={() => setIsNewProductFormOpen(true)} className={styles.newButton}>
                    + New Product
                  </button>
                </div>
              </div>

              {products.length === 0 ? (
                <p>No products found.</p>
              ) : (
                <table className="products-table">
                  <thead>
                    <tr>
                      <th>ProductID</th>
                      <th>Product Name</th>
                      <th>Product Type</th>
                      <th>Billable</th>
                      <th>Status</th>
                      <th>Category</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products
                      .filter(product => product.productName.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map((product) => (
                      <tr key={product.productId}>
                        <td>{product.productId}</td>
                        <td>{product.productName}</td>
                        <td>
                          <span className={`product-type-badge--${product.productType.toLowerCase()}`}>
                            {getProductTypeName(product.productType)}
                          </span>
                        </td>
                        <td>{product.billable ? 'Yes' : 'No'}</td>
                        <td>{product.status}</td>
                        <td>{product.category}</td>
                        <td>
                          <div className="action-buttons">
                            <button className="edit-button" onClick={() => {
                              setEditingProduct(product);
                              setIsEditFormOpen(true);
                            }}>
                             <svg xmlns="http://www.w3.org/2000/svg" width="17" height="16" viewBox="0 0 17 16" fill="none">
                                <path d="M8.59894 13.3332H14.5989M11.5163 2.41449C11.7817 2.1491 12.1416 2 12.5169 2C12.8923 2 13.2522 2.1491 13.5176 2.41449C13.783 2.67988 13.9321 3.03983 13.9321 3.41516C13.9321 3.79048 13.783 4.15043 13.5176 4.41582L5.51094 12.4232C5.35234 12.5818 5.15629 12.6978 4.94094 12.7605L3.02628 13.3192C2.96891 13.3359 2.9081 13.3369 2.85022 13.3221C2.79233 13.3072 2.73949 13.2771 2.69724 13.2349C2.65499 13.1926 2.62487 13.1398 2.61004 13.0819C2.59521 13.024 2.59621 12.9632 2.61294 12.9058L3.17161 10.9912C3.23442 10.776 3.35044 10.5802 3.50894 10.4218L11.5163 2.41449Z" stroke="#1D7AFC" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
                              </svg>
                            </button>
                            <button
                              className="delete-button"
                              onClick={() => {
                                setDeleteProductId(product.productId);
                                setDeleteProductName(product.productName);
                                setShowDeleteModal(true);
                              }}
                              disabled={isDeleting}
                            >
                              
                              <svg xmlns="http://www.w3.org/2000/svg" width="17" height="16" viewBox="0 0 17 16" fill="none">
                                <path d="M2.59961 4.00016H14.5996M13.2663 4.00016V13.3335C13.2663 14.0002 12.5996 14.6668 11.9329 14.6668H5.26628C4.59961 14.6668 3.93294 14.0002 3.93294 13.3335V4.00016M5.93294 4.00016V2.66683C5.93294 2.00016 6.59961 1.3335 7.26628 1.3335H9.93294C10.5996 1.3335 11.2663 2.00016 11.2663 2.66683V4.00016M7.26628 7.3335V11.3335M9.93294 7.3335V11.3335" stroke="#E34935" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
