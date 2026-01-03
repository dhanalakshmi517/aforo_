// RealTimeHeader.tsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./RealTimeHeader.css";
import Spark from "../../componenetsss/Spark";
import Bell from "../../componenetsss/Bell";

const RealTimeHeader: React.FC = () => {
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

  const [isLive, setIsLive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefreshTs, setLastRefreshTs] = useState<number>(
    Date.now() - 3 * 60 * 1000
  );
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (isLive) return;
    const id = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(id);
  }, [isLive]);

  const minutesAgo = Math.max(0, Math.floor((Date.now() - lastRefreshTs) / 60000));

  const onClickRefreshPill = () => {
    if (isLive) {
      setIsLive(false);
      setLastRefreshTs(Date.now());
    } else {
      setIsLoading(true);
      setTimeout(() => {
        setIsLive(true);
        setIsLoading(false);
      }, 2000);
    }
  };

  return (
    <header className="co-header">
      {/* Top row: breadcrumb + icon buttons */}
      <div className="co-header-top">
        <div className="co-breadcrumb">
          <button
            className="co-back-btn"
            aria-label="Back to Dashboard"
            onClick={handleDashboardClick}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
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
            <span className="co-breadcrumb-current">Real-Time Tracking</span>
          </span>
        </div>

        <div className="co-icon-actions">
          <Spark state="default" onClick={() => console.log('Spark clicked')} ariaLabel="AI Spark" />
          <Bell state="default" onClick={() => console.log('Bell clicked')} ariaLabel="Notifications" />
        </div>
      </div>

      {/* Bottom row: title + search + filters */}
      <div className="co-header-bottom">
        <h1 className="co-title">Real-Time Tracking</h1>

        <div className="co-controls">
          {/* Search kept as-is (commented) */}
          {/* ... */}

          <div className="co-filter-group">
            <button
              type="button"
              className={`co-refresh-pill ${isLive ? "is-live" : ""} ${isLoading ? "is-loading" : ""}`}
              onClick={onClickRefreshPill}
              aria-pressed={isLive}
              disabled={isLoading}
            >
              {isLive ? (
                <>
                  <span className="co-refresh-dot" />
                  <span>Live</span>
                </>
              ) : isLoading ? (
                <>
                  <span className="co-refresh-spinner" aria-hidden="true">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <circle
                        cx="7"
                        cy="7"
                        r="6"
                        stroke="#2A455E"
                        strokeWidth="1.5"
                        fill="none"
                        strokeDasharray="6 20"
                      />
                    </svg>
                  </span>
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <span className="co-refresh-clock" aria-hidden="true">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path
                        d="M0.75 6.75C0.75 7.93669 1.10189 9.09673 1.76118 10.0834C2.42047 11.0701 3.35754 11.8392 4.4539 12.2933C5.55026 12.7474 6.75666 12.8662 7.92054 12.6347C9.08443 12.4032 10.1535 11.8318 10.9926 10.9926C11.8318 10.1535 12.4032 9.08443 12.6347 7.92054C12.8662 6.75666 12.7474 5.55026 12.2933 4.4539C11.8392 3.35754 11.0701 2.42047 10.0834 1.76118C9.09673 1.10189 7.93669 0.75 6.75 0.75C5.07263 0.75631 3.46265 1.41082 2.25667 2.57667L0.75 4.08333M0.75 4.08333V0.75M0.75 4.08333H4.08333"
                        stroke="#2A455E"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span>{minutesAgo} min ago</span>
                </>
              )}
            </button>

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
              <span>Customers</span>
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
              <span>All Regions</span>
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
          </div>
        </div>
      </div>
    </header>
  );
};

export default RealTimeHeader;
