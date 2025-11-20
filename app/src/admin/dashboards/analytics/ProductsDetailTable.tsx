import React, { useEffect, useState } from 'react';
import { getProducts, Product } from '../../../../src/client/components/Dashboard/productsApi';
import './ProductDetailTable.css';

interface ExtendedProduct extends Product {
  tags?: string[];
  sku?: string;
  weight?: number;
  dimensions?: {
    width: number;
    height: number;
    depth: number;
  };
  warrantyInformation?: string;
  shippingInformation?: string;
  availabilityStatus?: string;
  reviews?: {
    rating: number;
    comment: string;
    date: string;
    reviewerName: string;
    reviewerEmail: string;
  }[];
  returnPolicy?: string;
  minimumOrderQuantity?: number;
  meta?: {
    createdAt: string;
    updatedAt: string;
    barcode: string;
    qrCode: string;
  };
}

const ProductsDetailTable: React.FC = () => {
  const [products, setProducts] = useState<ExtendedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const productsPerPage = 5;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedProducts = await getProducts();
        setProducts(fetchedProducts as ExtendedProduct[]);
      } catch (err) {
        console.error('Error loading product data:', err);
        setError('Failed to load product data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredProducts = products.filter((product) =>
    product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);

  const getStockClass = (stock: number) => {
    if (stock > 50) return 'pdt-stock-high';
    if (stock > 20) return 'pdt-stock-medium';
    return 'pdt-stock-low';
  };

  const getDiscountClass = (discount: number) => {
    if (discount >= 20) return 'pdt-discount-high';   // big discount → strong green
    if (discount >= 10) return 'pdt-discount-medium'; // medium → orange
    return 'pdt-discount-low';                        // small → muted
  };

  const getRatingClass = (rating: number) => {
    if (rating < 2.5) return 'pdt-rating-low';
    if (rating < 4) return 'pdt-rating-medium';
    return 'pdt-rating-high';
  };

  if (isLoading) {
    return (
      <div className="pdt-card">
        <p>Loading product data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pdt-card">
        <p className="pdt-error">{error}</p>
      </div>
    );
  }

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  return (
    <div className="pdt-card">
      <div className="pdt-header-row">
        <div>
          <h4 className="pdt-title">Product Details</h4>
        </div>
        <div>
          <input
            type="text"
            placeholder="Search by name, category, brand..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="pdt-search-input"
          />
        </div>
      </div>

      <div className="pdt-table-wrapper">
        <table className="pdt-table">
          <thead>
            <tr>
              <th className="pdt-th pdt-th-product">Product</th>
              <th className="pdt-th">Category</th>
              <th className="pdt-th">Price</th>
              <th className="pdt-th">Rating</th>
              <th className="pdt-th">Stock</th>
              <th className="pdt-th">Brand</th>
            </tr>
          </thead>
          <tbody>
            {currentProducts.map((product) => (
              <tr key={product.id}>
                <td className="pdt-td">
                  <div className="pdt-product-cell">
                    <span className="pdt-product-title">{product.title}</span>
                  </div>
                </td>
                <td className="pdt-td">
                  <span className="pdt-text">
                    {product.category
                      .split('-')
                      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                      .join(' ')}
                  </span>
                </td>
                <td className="pdt-td">
                  <span className="pdt-price">{formatPrice(product.price)}</span>
                  {product.discountPercentage > 0 && (
                    <span
                      className={`pdt-discount ${getDiscountClass(
                        product.discountPercentage
                      )}`}
                    >
                      -{product.discountPercentage.toFixed(1)}%
                    </span>
                  )}
                </td>
                <td className="pdt-td">
                  <span className={getRatingClass(product.rating)}>{product.rating.toFixed(1)}</span>
                  <span className="pdt-subtext">
                    {product.reviews ? product.reviews.length : 3} reviews
                  </span>
                </td>
                <td className="pdt-td">
                  <span className={getStockClass(product.stock)}>{product.stock}</span>
                </td>
                <td className="pdt-td">
                  <span className="pdt-text">{product.brand}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="pdt-footer">
        <div className="pdt-footer-text">
          Showing {indexOfFirstProduct + 1} to{' '}
          {Math.min(indexOfLastProduct, filteredProducts.length)} of{' '}
          {filteredProducts.length} entries
        </div>
        <div className="pdt-pagination">
          <button
            onClick={() => currentPage > 1 && paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="pdt-page-btn"
          >
            &lt;
          </button>

          {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => (
            <button
              key={i}
              onClick={() => paginate(i + 1)}
              className={
                currentPage === i + 1
                  ? 'pdt-page-btn pdt-page-btn-active'
                  : 'pdt-page-btn'
              }
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() =>
              currentPage < totalPages && paginate(currentPage + 1)
            }
            disabled={currentPage >= totalPages}
            className="pdt-page-btn"
          >
            &gt;
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductsDetailTable;
