import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ProductDashboard.css';
import { ProductStatus, PricingModelType } from './CreateProductForm';
import { getProducts } from '../queries/getProducts';
import { deleteProduct } from '../actions/productActions';

// Product type with additional UI-specific properties
type ProductWithStats = {
  id: string;
  name: string;
  type: string;
  description: string;
  apiEndpoint?: string;
  status: ProductStatus;
  pricingModel: PricingModelType;
  basePrice: number;
  documentation?: string;
  createdAt: Date;
  updatedAt: Date;
  // UI-specific properties that may not be in the backend model
  revenue?: number;
  activeUsers?: number;
};

// Alert utilities
const showSuccessAlert = async (title: string, message: string) => {
  console.log(`SUCCESS: ${title} - ${message}`);
  return { isConfirmed: true };
};

const showErrorAlert = (title: string, message: string) => {
  console.log(`ERROR: ${title} - ${message}`);
  alert(`${title}: ${message}`); // Add an actual alert so it's visible to users
};

const showConfirmDialog = async (title: string, message: string, confirmButtonText?: string, cancelButtonText?: string) => {
  console.log(`CONFIRM: ${title} - ${message}`);
  return { isConfirmed: window.confirm(message) };
};

const showLoadingAlert = (message: string) => {
  console.log(`LOADING: ${message}`);
  // You could add a loading indicator here
};

const closeLoadingAlert = () => {
  console.log('LOADING COMPLETE');
  // You could remove a loading indicator here
};

const ProductDashboard: React.FC = () => {
  const [products, setProducts] = useState<ProductWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    totalUsers: 0,
    monthlyRevenue: '$0'
  });
  const navigate = useNavigate();

  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      showLoadingAlert('Loading products...');
      const productList = await getProducts({});
      console.log('Products fetched:', productList);
      
      // Transform the products to include UI-specific properties
      const productsWithStats = productList.map(product => ({
        ...product,
        // Add calculated values for UI-specific properties
        revenue: Math.round(product.basePrice * 0.8), // Simple revenue calculation
        activeUsers: Math.max(10, Math.floor(product.basePrice / 100)) // Simple user calculation
      }));
      
      setProducts(productsWithStats);
      
      // Calculate stats from the product list
      const activeProducts = productsWithStats.filter(p => p.status === 'PUBLISHED').length;
      const totalRevenue = productsWithStats.reduce((sum, p) => sum + (p.revenue || 0), 0);
      
      setStats({
        totalProducts: productsWithStats.length,
        activeProducts,
        totalUsers: productsWithStats.reduce((sum, p) => sum + (p.activeUsers || 0), 0),
        monthlyRevenue: `$${totalRevenue.toLocaleString()}`
      });
      closeLoadingAlert();
    } catch (error) {
      console.error('Error in fetchProducts:', error);
      setError('Failed to load products. Please try again.');
      showErrorAlert(
        'Error',
        'Failed to load products. Please try again later.'
      );
    } finally {
      setIsLoading(false);
      closeLoadingAlert();
    }
  };

  const handleDelete = async (productId: string) => {
    const result = await showConfirmDialog(
      'Delete Product?',
      'Are you sure you want to delete this product? This action cannot be undone.'
    );

    if (result.isConfirmed) {
      try {
        showLoadingAlert('Deleting product...');
        await deleteProduct({ id: productId }, {});
        closeLoadingAlert();
        await showSuccessAlert('Success!', 'Product deleted successfully');
        fetchProducts(); // Refresh the list
      } catch (error) {
        closeLoadingAlert();
        showErrorAlert(
          'Error',
          'Failed to delete product. Please try again.'
        );
      }
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Product Management</h1>
        <div>
          <button 
            className="refresh-button"
            onClick={fetchProducts}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : '↻ Refresh'}
          </button>
          <button 
            className="add-product-button"
            onClick={() => navigate('/products/add')}
          >
            + Add New Product
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Products</h3>
          <p>{stats.totalProducts}</p>
        </div>
        <div className="stat-card">
          <h3>Active Products</h3>
          <p>{stats.activeProducts}</p>
        </div>
        <div className="stat-card">
          <h3>Total Users</h3>
          <p>{stats.totalUsers}</p>
        </div>
        <div className="stat-card">
          <h3>Monthly Revenue</h3>
          <p>{stats.monthlyRevenue}</p>
        </div>
      </div>

      <div className="products-table">
        {isLoading ? (
          <p>Loading products...</p>
        ) : products.length === 0 ? (
          <p>No products found. Create a new product to get started.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Type</th>
                <th>Status</th>
               
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td>{product.type}</td>
                  <td>{product.status}</td>

                  <td>
                    <button 
                      className="action-button edit"
                      onClick={() => navigate(`/products/edit/${product.id}`)}
                    >
                      Edit
                    </button>
                    <button 
                      className="action-button delete"
                      onClick={() => handleDelete(product.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ProductDashboard;
