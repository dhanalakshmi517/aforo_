// src/pages/Apigee/ApigeeImport.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apigeeLogo } from '../../static/images';
import './ApigeeImport.css';
import {
  getApigeeProducts,
  importSelectedApigeeProducts,
  ApigeeProduct,
} from './api';

const ApigeeImport: React.FC = () => {
  const navigate = useNavigate();
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  const [products, setProducts] = useState<ApigeeProduct[]>([]);
  const [search, setSearch] = useState('');
  const [selectedNames, setSelectedNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // === Fetch products on mount ===
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getApigeeProducts();
        setProducts(data || []);
      } catch (err: any) {
        console.error('[ApigeeImport] Failed to fetch products:', err);
        setError(
          err?.response?.data?.message ||
            'Failed to load Apigee products. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // === Derived filtered list ===
  const filteredProducts = products.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      (p.display_name || '').toLowerCase().includes(q)
    );
  });

  const handleBackClick = () => {
    setShowLeaveModal(true);
  };

  const handleKeepSelecting = () => {
    setShowLeaveModal(false);
  };

  const handleLeavePage = () => {
    navigate('/get-started/integrations');
  };

  const handleCloseModal = () => {
    setShowLeaveModal(false);
  };

  // === Selection logic ===
  const toggleSelect = (productName: string) => {
    setSelectedNames((prev) =>
      prev.includes(productName)
        ? prev.filter((n) => n !== productName)
        : [...prev, productName]
    );
  };

  const handleSelectAll = () => {
    const allVisibleNames = filteredProducts.map((p) => p.name);
    setSelectedNames(allVisibleNames);
  };

  const handleClearAll = () => {
    setSelectedNames([]);
  };

  const selectedCount = selectedNames.length;

  // === Import selected products ===
  const handleImportProducts = async () => {
    if (selectedNames.length === 0 || importing) return;

    setImporting(true);
    setError(null);

    try {
      const res = await importSelectedApigeeProducts(selectedNames);
      console.log('[ApigeeImport] Import selected response:', res);

      // Basic UX for now – you can replace with toast/snackbar later
      const importedCount =
        typeof res.importedCount === 'number'
          ? res.importedCount
          : selectedNames.length;

      alert(`Imported ${importedCount} Apigee product(s) successfully.`);

      // You can also navigate to an "Import History" page instead if you want:
      // navigate('/apigee-import-history');
    } catch (err: any) {
      console.error('[ApigeeImport] Failed to import selected products:', err);
      setError(
        err?.response?.data?.message ||
          'Failed to import selected products. Please try again.'
      );
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="apigee-import-page">
      {/* Header */}
      <div className="apigee-header">
        <button className="back-button" onClick={handleBackClick}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
          >
            <path
              d="M10.0001 15.8334L4.16675 10.0001M4.16675 10.0001L10.0001 4.16675M4.16675 10.0001H15.8334"
              stroke="#909599"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <div className="aforo-logo">
          {/* your existing aforo SVG */}
        </div>

        <div className="separator">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="2"
            height="27"
            viewBox="0 0 2 27"
            fill="none"
          >
            <path
              d="M0.633545 0.633545L0.633544 25.9773"
              stroke="#D1D7E0"
              strokeWidth="1.26719"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <div
          className="apigee-logo"
          style={{
            backgroundImage: `url(${apigeeLogo})`,
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            width: '40px',
            height: '40px',
          }}
        ></div>
      </div>

      {/* Main Content Area */}
      <div className="apigee-content">
        {/* Sidebar */}
        <div className="apigee-sidebar">
          <div className="sidebar-section">
            {/* Establish Connection - Completed */}
            <div className="sidebar-item completed">
              <div className="sidebar-icon">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M13.3333 4L6 11.3333L2.66667 8"
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="sidebar-text">
                <h4>Establish Connection</h4>
                <p>Connected</p>
              </div>
            </div>

            {/* Import Apigee Products - Active */}
            <div className="sidebar-item import-active">
              <div className="import-icon-container">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g clipPath="url(#clip0_12866_2701)">
                    <path
                      d="M2.2 4.66668L8 8.00002M8 8.00002L13.8 4.66668M8 8.00002L8 14.6667M14 5.33335C13.9998 5.09953 13.938 4.86989 13.821 4.66746C13.704 4.46503 13.5358 4.29692 13.3333 4.18002L8.66667 1.51335C8.46397 1.39633 8.23405 1.33472 8 1.33472C7.76595 1.33472 7.53603 1.39633 7.33333 1.51335L2.66667 4.18002C2.46417 4.29692 2.29599 4.46503 2.17897 4.66746C2.06196 4.86989 2.00024 5.09953 2 5.33335V10.6667C2.00024 10.9005 2.06196 11.1301 2.17897 11.3326C2.29599 11.535 2.46417 11.7031 2.66667 11.82L7.33333 14.4867C7.53603 14.6037 7.76595 14.6653 8 14.6653C8.23405 14.6653 8.46397 14.6037 8.66667 14.4867L13.3333 11.82C13.5358 11.7031 13.704 11.535 13.821 11.3326C13.938 11.1301 13.9998 10.9005 14 10.6667V5.33335Z"
                      stroke="#FFFFFF"
                      strokeWidth="1.52381"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_12866_2701">
                      <rect width="16" height="16" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
              </div>
              <div className="sidebar-text">
                <h4>Import Apigee Products</h4>
                <p>Import</p>
              </div>
            </div>
          </div>

          <div className="sidebar-footer">
            <button className="import-history-btn">Import History</button>
          </div>
        </div>

        {/* Main Content */}
        <div className="import-main">
          <div className="import-content">
            {/* Title Row */}
            <div className="title-row">
              <h1 className="import-title">Import Apigee Products</h1>

              {/* Search Bar */}
              <div className="search-container">
                <svg
                  className="search-icon"
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path
                    d="M7.33333 12.6667C10.2789 12.6667 12.6667 10.2789 12.6667 7.33333C12.6667 4.38781 10.2789 2 7.33333 2C4.38781 2 2 4.38781 2 7.33333C2 10.2789 4.38781 12.6667 7.33333 12.6667Z"
                    stroke="#6B7280"
                    strokeWidth="1.33333"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M14 14L11.1 11.1"
                    stroke="#6B7280"
                    strokeWidth="1.33333"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Search"
                  className="search-input"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Products Header */}
            <div className="products-row">
              <h2 className="products-count">
                {selectedCount} Products selected
              </h2>

              <div className="action-buttons">
                <button
                  className="select-all-btn"
                  type="button"
                  onClick={handleSelectAll}
                  disabled={filteredProducts.length === 0}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M4 12C4 8.22876 4 6.34314 5.17158 5.17158C6.34314 4 8.22876 4 12 4C15.7712 4 17.6569 4 18.8284 5.17158C20 6.34314 20 8.22876 20 12C20 15.7712 20 17.6569 18.8284 18.8284C17.6569 20 15.7712 20 12 20C8.22876 20 6.34314 20 5.17158 18.8284C4 17.6569 4 15.7712 4 12Z"
                      stroke="#0262A1"
                      strokeWidth="1.2"
                    />
                  </svg>
                  Select All
                </button>

                <button
                  className="clear-all-btn"
                  type="button"
                  onClick={handleClearAll}
                  disabled={selectedCount === 0}
                >
                  Clear All
                </button>
              </div>
            </div>

            {/* Loading / Error States */}
            {loading && <p className="products-loading">Loading products…</p>}
            {error && !loading && (
              <p className="products-error">{error}</p>
            )}
            {!loading && !error && filteredProducts.length === 0 && (
              <p className="products-empty">No products found.</p>
            )}

            {/* Product Cards Grid */}
            <div className="products-grid">
              {!loading &&
                !error &&
                filteredProducts.map((product) => {
                  const isSelected = selectedNames.includes(product.name);
                  return (
                    <div
                      key={product.name}
                      className={`product-card ${
                        isSelected ? 'product-card-selected' : ''
                      }`}
                      onClick={() => toggleSelect(product.name)}
                    >
                      <h3 className="product-name">
                        {product.display_name || product.name}
                      </h3>
                      <p className="product-id">{product.name}</p>
                      <p className="product-description">
                        Quota: {product.quota || 'N/A'}
                      </p>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Main Content Footer */}
          <div className="main-footer">
            <button
              className="import-products-btn"
              onClick={handleImportProducts}
              disabled={selectedCount === 0 || importing}
            >
              {importing ? 'Importing…' : 'Import Products'}
            </button>
          </div>
        </div>
      </div>

      {/* Leave Confirmation Modal */}
      {showLeaveModal && (
        <div className="modal-overlay">
          <div className="leave-modal">
            <button className="modal-close-btn" onClick={handleCloseModal}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M18 6L6 18M6 6L18 18"
                  stroke="#6B7280"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <h2 className="modal-title">
              Are You Sure Want to Leave This Page?
            </h2>

            <p className="modal-description">
              Your selected products won&apos;t be imported if you leave now.
            </p>

            <div className="modal-buttons">
              <button
                className="keep-selecting-btn"
                onClick={handleKeepSelecting}
              >
                Keep Selecting
              </button>

              <button className="leave-page-btn" onClick={handleLeavePage}>
                Leave Page
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApigeeImport;
