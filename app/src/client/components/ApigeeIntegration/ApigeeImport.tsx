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

  // Check if all filtered products are selected
  const allSelected = filteredProducts.length > 0 &&
    filteredProducts.every((p) => selectedNames.includes(p.name));

  const handleBackClick = () => {
    setShowLeaveModal(true);
  };

  const handleKeepSelecting = () => {
    setShowLeaveModal(false);
  };

  const handleLeavePage = () => {
    setShowLeaveModal(false);
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
    // Toggle: if all are selected, deselect all; otherwise select all
    if (allSelected) {
      setSelectedNames([]);
    } else {
      const allVisibleNames = filteredProducts.map((p) => p.name);
      setSelectedNames(allVisibleNames);
    }
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

      const importedCount =
        typeof (res as any)?.importedCount === 'number'
          ? (res as any).importedCount
          : selectedNames.length;

      // Navigate to Imported Products page (screen 4)
      navigate('/get-started/integrations/apigee/imported-products', {
        state: { importedCount },
      });
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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="72"
            height="16"
            viewBox="0 0 72 16"
            fill="none"
          >
            <path
              d="M4.7352 15.9735C2.41273 15.9735 0.676514 14.6657 0.676514 12.4785C0.676514 9.90797 3.13428 8.91585 6.76455 8.78056L8.25274 8.73546V8.37469C8.25274 7.38256 7.53119 6.72866 6.33613 6.72866C5.11852 6.72866 4.48717 7.36002 4.28424 8.26195H0.969641C1.24022 5.87183 3.22447 4.02287 6.33613 4.02287C9.24486 4.02287 11.3869 5.44341 11.3869 8.35214V13.651C11.3869 14.35 11.432 15.3196 11.4997 15.5901V15.6352H8.29783C8.27528 15.3647 8.27528 14.9813 8.27528 14.5078C7.53119 15.3421 6.33613 15.9735 4.7352 15.9735ZM5.63714 13.4706C7.17042 13.4706 8.25274 12.3657 8.25274 11.0805V10.607L7.32826 10.6521C5.20872 10.7874 4.10385 11.2609 4.10385 12.253C4.10385 12.9971 4.75775 13.4706 5.63714 13.4706Z"
              fill="url(#paint0_linear_12866_2370)"
            />
            <path
              d="M16.8742 15.6352H13.5145V6.9767H11.4626V4.3611H13.5596V2.48959C13.5596 0.775918 14.3262 0.00927734 16.0399 0.00927734H19.3545V2.71507H17.5281C16.9418 2.71507 16.7614 2.89546 16.7614 3.43662V4.3611H19.3545V6.9767H16.8742V15.6352Z"
              fill="url(#paint1_linear_12866_2370)"
            />
            <path
              d="M24.691 15.996C21.2636 15.996 18.6029 13.4481 18.6029 9.99817C18.6029 6.52573 21.2636 4.00032 24.691 4.00032C28.0957 4.00032 30.779 6.52573 30.779 9.99817C30.779 13.4481 28.0957 15.996 24.691 15.996ZM24.691 12.8843C26.2242 12.8843 27.284 11.6216 27.284 9.99817C27.284 8.32959 26.2242 7.11199 24.691 7.11199C23.1351 7.11199 22.0754 8.32959 22.0754 9.99817C22.0754 11.6216 23.1351 12.8843 24.691 12.8843Z"
              fill="url(#paint2_linear_12866_2370)"
            />
            <path
              d="M38.6095 4.15816H38.7673V7.85608C38.4742 7.81098 38.2487 7.78843 37.9556 7.78843C36.3321 7.78843 34.7086 8.53253 34.7086 10.8099V15.6352H31.2813V4.3611H34.6184V6.2777C35.4527 4.94735 36.986 4.15816 38.6095 4.15816Z"
              fill="url(#paint3_linear_12866_2370)"
            />
            <path
              d="M44.1147 15.996C40.6874 15.996 38.0267 13.4481 38.0267 9.99817C38.0267 6.52573 40.6874 4.00032 44.1147 4.00032C47.5195 4.00032 50.2027 6.52573 50.2027 9.99817C50.2027 13.4481 47.5195 15.996 44.1147 15.996ZM44.1147 12.8843C45.648 12.8843 46.7078 11.6216 46.7078 9.99817C46.7078 8.32959 45.648 7.11199 44.1147 7.11199C42.5589 7.11199 41.4991 8.32959 41.4991 9.99817C41.4991 11.6216 42.5589 12.8843 44.1147 12.8843Z"
              fill="url(#paint4_linear_12866_2370)"
            />
            <path
              d="M54.651 15.6352H50.5247V11.7344H54.651V15.6352Z"
              fill="url(#paint5_linear_12866_2370)"
            />
            <path
              d="M59.0429 15.9735C56.7204 15.9735 54.9842 14.6657 54.9842 12.4785C54.9842 9.90797 57.442 8.91585 61.0722 8.78056L62.5604 8.73546V8.37469C62.5604 7.38256 61.8389 6.72866 60.6438 6.72866C59.4262 6.72866 58.7949 7.36002 58.5919 8.26195H55.2773C55.5479 5.87183 57.5322 4.02287 60.6438 4.02287C63.5525 4.02287 65.6946 5.44341 65.6946 8.35214V13.651C65.6946 14.35 65.7397 15.3196 65.8074 15.5901V15.6352H62.6055C62.583 15.3647 62.583 14.9813 62.583 14.5078C61.8389 15.3421 60.6438 15.9735 59.0429 15.9735ZM59.9448 13.4706C61.4781 13.4706 62.5604 12.3657 62.5604 11.0805V10.607L61.6359 10.6521C59.5164 10.7874 58.4115 11.2609 58.4115 12.253C58.4115 12.9971 59.0654 13.4706 59.9448 13.4706Z"
              fill="url(#paint6_linear_12866_2370)"
            />
            <path
              d="M70.2091 3.09839H66.7818V0.0769213H70.2091V3.09839ZM70.2091 15.6352H66.7818V4.3611H70.2091V15.6352Z"
              fill="url(#paint7_linear_12866_2370)"
            />
            <defs>
              <linearGradient
                id="paint0_linear_12866_2370"
                x1="66.9015"
                y1="15.996"
                x2="49.9334"
                y2="37.785"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#0262A1" />
                <stop offset="1" stopColor="#00365A" />
              </linearGradient>
              <linearGradient
                id="paint1_linear_12866_2370"
                x1="66.9015"
                y1="15.996"
                x2="49.9334"
                y2="37.785"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#0262A1" />
                <stop offset="1" stopColor="#00365A" />
              </linearGradient>
              <linearGradient
                id="paint2_linear_12866_2370"
                x1="66.9015"
                y1="15.996"
                x2="49.9334"
                y2="37.785"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#0262A1" />
                <stop offset="1" stopColor="#00365A" />
              </linearGradient>
              <linearGradient
                id="paint3_linear_12866_2370"
                x1="66.9015"
                y1="15.996"
                x2="49.9334"
                y2="37.785"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#0262A1" />
                <stop offset="1" stopColor="#00365A" />
              </linearGradient>
              <linearGradient
                id="paint4_linear_12866_2370"
                x1="66.9015"
                y1="15.996"
                x2="49.9334"
                y2="37.785"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#0262A1" />
                <stop offset="1" stopColor="#00365A" />
              </linearGradient>
              <linearGradient
                id="paint5_linear_12866_2370"
                x1="66.9015"
                y1="15.996"
                x2="49.9334"
                y2="37.785"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#0262A1" />
                <stop offset="1" stopColor="#00365A" />
              </linearGradient>
              <linearGradient
                id="paint6_linear_12866_2370"
                x1="66.9015"
                y1="15.996"
                x2="49.9334"
                y2="37.785"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#0262A1" />
                <stop offset="1" stopColor="#00365A" />
              </linearGradient>
              <linearGradient
                id="paint7_linear_12866_2370"
                x1="66.9015"
                y1="15.996"
                x2="49.9334"
                y2="37.785"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#0262A1" />
                <stop offset="1" stopColor="#00365A" />
              </linearGradient>
            </defs>
          </svg>
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
                  {allSelected ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M4 12C4 8.22876 4 6.34314 5.17158 5.17158C6.34314 4 8.22876 4 12 4C15.7712 4 17.6569 4 18.8284 5.17158C20 6.34314 20 8.22876 20 12C20 15.7712 20 17.6569 18.8284 18.8284C17.6569 20 15.7712 20 12 20C8.22876 20 6.34314 20 5.17158 18.8284C4 17.6569 4 15.7712 4 12Z"
                        fill="#0262A1"
                        stroke="#0262A1"
                        strokeWidth="1.2"
                      />
                      <path
                        d="M9 12L11 14L15 10"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
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
                  )}
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
                      className={`product-card ${isSelected ? 'product-card-selected' : ''
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
