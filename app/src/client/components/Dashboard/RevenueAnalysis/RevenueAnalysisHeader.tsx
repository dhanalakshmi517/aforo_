import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./RevenueAnalysisHeader.css";

const RevenueAnalysisHeader: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
 const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClear = () => {
    setSearchQuery("");
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const handleDashboardClick = () => {
    navigate("/get-started/dashboards");
  };

  return (
    <header className="co-header">
      {/* Top row: breadcrumb + icon buttons */}
      <div className="co-header-top">
        <div className="co-breadcrumb">
          <button className="co-back-btn" aria-label="Back to Dashboard">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
            >
              <path
                d="M7.99992 12.6666L3.33325 7.99992M3.33325 7.99992L7.99992 3.33325M3.33325 7.99992H12.6666"
                stroke="#44576F"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <span className="co-breadcrumb-text">
            <button
              className="co-breadcrumb-link"
              onClick={handleDashboardClick}
              aria-label="Go to Dashboards"
            >
              Dashboard
            </button>
            <span className="co-breadcrumb-separator">/</span>
            <span className="co-breadcrumb-current">Revenue Analysis</span>
          </span>
        </div>

        <div className="co-icon-actions">
          <button className="co-icon-btn" aria-label="Settings">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
            >
              <g clipPath="url(#clip0_13763_28191)">
                <path
                  d="M8.26259 2.11034C8.29473 1.9383 8.38602 1.7829 8.52067 1.67108C8.65531 1.55926 8.82482 1.49805 8.99984 1.49805C9.17487 1.49805 9.34438 1.55926 9.47902 1.67108C9.61366 1.7829 9.70496 1.9383 9.73709 2.11034L10.5253 6.27884C10.5813 6.5752 10.7253 6.84781 10.9386 7.06107C11.1519 7.27434 11.4245 7.41836 11.7208 7.47434L15.8893 8.26259C16.0614 8.29473 16.2168 8.38602 16.3286 8.52067C16.4404 8.65531 16.5016 8.82482 16.5016 8.99984C16.5016 9.17487 16.4404 9.34438 16.3286 9.47902C16.2168 9.61366 16.0614 9.70496 15.8893 9.73709L11.7208 10.5253C11.4245 10.5813 11.1519 10.7253 10.9386 10.9386C10.7253 11.1519 10.5813 11.4245 10.5253 11.7208L9.73709 15.8893C9.70496 16.0614 9.61366 16.2168 9.47902 16.3286C9.34438 16.4404 9.17487 16.5016 8.99984 16.5016C8.82482 16.5016 8.65531 16.4404 8.52067 16.3286C8.38602 16.2168 8.29473 16.0614 8.26259 15.8893L7.47434 11.7208C7.41836 11.4245 7.27434 11.1519 7.06107 10.9386C6.84781 10.7253 6.5752 10.5813 6.27884 10.5253L2.11034 9.73709C1.9383 9.70496 1.7829 9.61366 1.67108 9.47902C1.55926 9.34438 1.49805 9.17487 1.49805 8.99984C1.49805 8.82482 1.55926 8.65531 1.67108 8.52067C1.7829 8.38602 1.9383 8.29473 2.11034 8.26259L6.27884 7.47434C6.5752 7.41836 6.84781 7.27434 7.06107 7.06107C7.27434 6.84781 7.41836 6.5752 7.47434 6.27884L8.26259 2.11034Z"
                  stroke="#25303D"
                  strokeWidth="1.35"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
              <defs>
                <clipPath id="clip0_13763_28191">
                  <rect width="18" height="18" fill="white" />
                </clipPath>
              </defs>
            </svg>
          </button>

          <button className="co-icon-btn" aria-label="Notifications">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
            >
              <path
                d="M7.70094 15.7498C7.8326 15.9778 8.02195 16.1671 8.24997 16.2987C8.47799 16.4304 8.73665 16.4997 8.99994 16.4997C9.26323 16.4997 9.52189 16.4304 9.74991 16.2987C9.97793 16.1671 10.1673 15.9778 10.2989 15.7498M2.44644 11.4943C2.34846 11.6016 2.28381 11.7352 2.26033 11.8786C2.23686 12.0221 2.25558 12.1693 2.31422 12.3023C2.37286 12.4353 2.46889 12.5484 2.59063 12.6279C2.71237 12.7073 2.85457 12.7496 2.99994 12.7498H14.9999C15.1453 12.7498 15.2875 12.7076 15.4093 12.6283C15.5312 12.549 15.6273 12.4361 15.6861 12.3031C15.7449 12.1702 15.7638 12.0231 15.7405 11.8796C15.7172 11.7361 15.6528 11.6025 15.5549 11.495C14.5574 10.4668 13.4999 9.37401 13.4999 5.99976C13.4999 4.80628 13.0258 3.66169 12.1819 2.81778C11.338 1.97386 10.1934 1.49976 8.99994 1.49976C7.80647 1.49976 6.66187 1.97386 5.81796 2.81778C4.97405 3.66169 4.49994 4.80628 4.49994 5.99976C4.49994 9.37401 3.44169 10.4668 2.44644 11.4943Z"
                stroke="#25303D"
                strokeWidth="1.35"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Bottom row */}
      <div className="co-header-bottom">
        <h1 className="co-title">Customer overview</h1>

        <div className="co-controls">
          <div className="co-filter-group">
            <button className="co-filter-pill">
              <span>Time</span>
              <span className="co-filter-chevron">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="7" viewBox="0 0 12 7" fill="none">
                  <path
                    d="M0.75 0.75L5.75 5.75L10.75 0.75"
                    stroke="#7B97AE"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </button>

            <button className="co-filter-pill">
              <span>Environment</span>
              <span className="co-filter-chevron">▾</span>
            </button>

            <button className="co-filter-pill">
              <span>All Regions</span>
              <span className="co-filter-chevron">▾</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default RevenueAnalysisHeader;
