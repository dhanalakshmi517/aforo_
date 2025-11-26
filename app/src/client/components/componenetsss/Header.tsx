// Header.tsx
import React, { useRef, useState } from 'react';
import './Header.css';

export interface HeaderProps {
  title: string;
  searchTerm?: string;
  onSearchTermChange?: (value: string) => void;
  primaryLabel?: string;
  onPrimaryClick?: () => void;
  onFilterClick?: () => void;
  onSettingsClick?: () => void;
  onNotificationsClick?: () => void;
  statusLabel?: string;
  showPrimary?: boolean;
  showKongButton?: boolean;
  showSearch?: boolean;
  searchDisabled?: boolean;
  filterDisabled?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  title,
  statusLabel,
  searchTerm,
  onSearchTermChange,
  primaryLabel,
  onPrimaryClick,
  onFilterClick,
  onSettingsClick,
  onNotificationsClick,
  showPrimary = true,
  showKongButton = true,
  showSearch = true,
  searchDisabled = false,
  filterDisabled = false
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isFilterSelected, setIsFilterSelected] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  let searchCls = 'rp-header-search';
  if (searchTerm) searchCls += ' has-value';
  if (isFocused) searchCls += ' is-active';
  if (searchDisabled) searchCls += ' is-disabled';

  const handleClear = () => {
    if (searchDisabled || !onSearchTermChange) return;
    onSearchTermChange('');
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  let filterBtnCls = 'rp-filter-btn';
  if (isFilterSelected) filterBtnCls += ' is-selected';
  if (filterDisabled) filterBtnCls += ' is-disabled';

  const handleFilterClick = () => {
    if (filterDisabled) return;
    setIsFilterSelected(v => !v);
    onFilterClick?.();
  };

  return (
    <div className="rate-plan-header">
      <h2>{title}</h2>
      {statusLabel && <span className="status-pill">{statusLabel}</span>}

      <div className="ph-header-actions">
        {/* Search */}
        {showSearch && (
        <div className={searchCls} role="search" aria-disabled={searchDisabled}>
          <span className="rp-search-icon" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M17.5 17.5L13.8833 13.8833M15.8333 9.16667C15.8333 12.8486 12.8486 15.8333 9.16667 15.8333C5.48477 15.8333 2.5 12.8486 2.5 9.16667C2.5 5.48477 5.48477 2.5 9.16667 2.5C12.8486 2.5 15.8333 5.48477 15.8333 9.16667Z" stroke="#909599" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>

          <input
            ref={inputRef}
            className="rp-search-input"
            aria-label={`Search ${title.toLowerCase()}`}
            placeholder="Search"
            value={searchTerm || ''}
            onChange={(e) => onSearchTermChange?.(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={searchDisabled}
          />
          {!searchDisabled && searchTerm && (
            <button
              type="button"
              className="rp-clear-btn"
              onClick={handleClear}
              aria-label="Clear search"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M15 5L5 15M5 5L15 15" stroke="#1A2126" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
        </div>
        )}

        {/* Filter */}
        {onFilterClick && (
          <button
            className={filterBtnCls}
            aria-label="Open filters"
            aria-pressed={isFilterSelected}
            aria-disabled={filterDisabled}
            onClick={handleFilterClick}
            disabled={filterDisabled}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 7h16M7 12h10M10 17h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        )}

        {/* Divider AFTER Filter (left side) */}
        {onFilterClick && showPrimary && (
          <div className="header-divider" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" width="2" height="34" viewBox="0 0 2 34" fill="none">
              <path d="M1 0.5V33.5" stroke="#E9E9EE" strokeLinecap="round"/>
            </svg>
          </div>
        )}

        {/* New primary action */}
        {showPrimary && (
          <button className="new-rate-button" onClick={onPrimaryClick}>
            {/* <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3.33301 8.00004H12.6663M7.99967 3.33337V12.6667" stroke="#F8F7FA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg> */}
            {primaryLabel}
          </button>
        )}

        {/* Divider AFTER the New button (right side) */}
        

        {/* Kong Button */}
        {showKongButton && (
          <button className="rp-kong-btn" aria-label="Import from Kong" onClick={onSettingsClick}>
            <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none">
  <path d="M6.6748 15.6748V4.4248C6.6748 4.22589 6.59579 4.03513 6.45513 3.89447C6.31448 3.75382 6.12372 3.6748 5.9248 3.6748H2.1748C1.77698 3.6748 1.39545 3.83284 1.11414 4.11414C0.83284 4.39545 0.674805 4.77698 0.674805 5.1748V14.1748C0.674805 14.5726 0.83284 14.9542 1.11414 15.2355C1.39545 15.5168 1.77698 15.6748 2.1748 15.6748H11.1748C11.5726 15.6748 11.9542 15.5168 12.2355 15.2355C12.5168 14.9542 12.6748 14.5726 12.6748 14.1748V10.4248C12.6748 10.2259 12.5958 10.0351 12.4551 9.89447C12.3145 9.75382 12.1237 9.6748 11.9248 9.6748H0.674805M10.4248 0.674805H14.9248C15.339 0.674805 15.6748 1.01059 15.6748 1.4248V5.9248C15.6748 6.33902 15.339 6.6748 14.9248 6.6748H10.4248C10.0106 6.6748 9.6748 6.33902 9.6748 5.9248V1.4248C9.6748 1.01059 10.0106 0.674805 10.4248 0.674805Z" stroke="#25303D" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
          </button>
        )}
        {showPrimary && (
          <div className="header-divider" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" width="2" height="34" viewBox="0 0 2 34" fill="none">
              <path d="M1 0.5V33.5" stroke="#E9E9EE" strokeLinecap="round"/>
            </svg>
          </div>
        )}


<button className="rp-settings-btn" aria-label="Settings" onClick={onSettingsClick}>
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
  <path d="M8.26259 2.11034C8.29473 1.9383 8.38602 1.7829 8.52067 1.67108C8.65531 1.55926 8.82482 1.49805 8.99984 1.49805C9.17487 1.49805 9.34438 1.55926 9.47902 1.67108C9.61366 1.7829 9.70496 1.9383 9.73709 2.11034L10.5253 6.27884C10.5813 6.5752 10.7253 6.84781 10.9386 7.06107C11.1519 7.27434 11.4245 7.41836 11.7208 7.47434L15.8893 8.26259C16.0614 8.29473 16.2168 8.38602 16.3286 8.52067C16.4404 8.65531 16.5016 8.82482 16.5016 8.99984C16.5016 9.17487 16.4404 9.34438 16.3286 9.47902C16.2168 9.61366 16.0614 9.70496 15.8893 9.73709L11.7208 10.5253C11.4245 10.5813 11.1519 10.7253 10.9386 10.9386C10.7253 11.1519 10.5813 11.4245 10.5253 11.7208L9.73709 15.8893C9.70496 16.0614 9.61366 16.2168 9.47902 16.3286C9.34438 16.4404 9.17487 16.5016 8.99984 16.5016C8.82482 16.5016 8.65531 16.4404 8.52067 16.3286C8.38602 16.2168 8.29473 16.0614 8.26259 15.8893L7.47434 11.7208C7.41836 11.4245 7.27434 11.1519 7.06107 10.9386C6.84781 10.7253 6.5752 10.5813 6.27884 10.5253L2.11034 9.73709C1.9383 9.70496 1.7829 9.61366 1.67108 9.47902C1.55926 9.34438 1.49805 9.17487 1.49805 8.99984C1.49805 8.82482 1.55926 8.65531 1.67108 8.52067C1.7829 8.38602 1.9383 8.29473 2.11034 8.26259L6.27884 7.47434C6.5752 7.41836 6.84781 7.27434 7.06107 7.06107C7.27434 6.84781 7.41836 6.5752 7.47434 6.27884L8.26259 2.11034Z" stroke="#373B40" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round"/>
</svg>
        </button>
        {/* Notifications */}
        <button className="rp-notification-btn" aria-label="Notifications" onClick={onNotificationsClick || (() => {})}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="18" viewBox="0 0 16 18" fill="none">
            <path d="M6.70045 15.75C6.83211 15.978 7.02146 16.1674 7.24949 16.299C7.47751 16.4306 7.73616 16.4999 7.99945 16.4999C8.26274 16.4999 8.5214 16.4306 8.74942 16.299C8.97744 16.1674 9.16679 15.978 9.29845 15.75M1.44595 11.4945C1.34798 11.6019 1.28332 11.7354 1.25984 11.8789C1.23637 12.0223 1.25509 12.1695 1.31373 12.3025C1.37237 12.4356 1.4684 12.5487 1.59014 12.6281C1.71188 12.7075 1.85409 12.7499 1.99945 12.75H13.9995C14.1448 12.7501 14.287 12.7079 14.4089 12.6286C14.5307 12.5493 14.6268 12.4363 14.6856 12.3034C14.7444 12.1705 14.7633 12.0233 14.74 11.8798C14.7167 11.7364 14.6523 11.6028 14.5545 11.4952C13.557 10.467 12.4995 9.37425 12.4995 6C12.4995 4.80653 12.0253 3.66193 11.1814 2.81802C10.3375 1.97411 9.19293 1.5 7.99945 1.5C6.80598 1.5 5.66139 1.97411 4.81747 2.81802C3.97356 3.66193 3.49945 4.80653 3.49945 6C3.49945 9.37425 2.4412 10.467 1.44595 11.4945Z" stroke="#373B40" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Header;
