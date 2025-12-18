// Header.tsx
import React, { useState } from 'react';
import './Header.css';
import NewProductButton from './NewProductButton';
import Filter from './Filter';
import Spark from './Spark';
import Bell from './Bell';
import SearchInput from './SearchInput';

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
  showIntegrations?: boolean;
  filterButtonRef?: React.RefObject<HTMLButtonElement>;
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
  filterDisabled = false,
  showIntegrations = true,
  filterButtonRef
}) => {
  const [isFilterSelected, setIsFilterSelected] = useState(false);
  

  let filterBtnCls = 'pr-filter-btn';
  if (isFilterSelected) filterBtnCls += ' is-selected';
  if (filterDisabled) filterBtnCls += ' is-disabled';

  const handleFilterClick = () => {
    if (filterDisabled) return;
    setIsFilterSelected(v => !v);
    onFilterClick?.();
  };

  return (
    <div className="pr-plan-header">
      <h2>{title}</h2>
      {statusLabel && <span className="pr-status-pill">{statusLabel}</span>}

      <div className="pr-header-actions">
        {/* Search */}
        {showSearch && (
          <SearchInput
            value={searchTerm || ''}
            onChange={(v) => onSearchTermChange?.(v)}
            onClear={() => onSearchTermChange?.('')}
            state={
              searchDisabled
                ? 'disabled'
                : searchTerm && searchTerm.length > 0
                ? 'filled'
                : 'default'
            }
            className="pr-header-search-input"
          />
        )}

        {/* Filter */}
        {onFilterClick && (
          <Filter
            state={filterDisabled ? 'disabled' : isFilterSelected ? 'active' : 'default'}
            onClick={handleFilterClick}
            ariaLabel="Open filters"
            buttonRef={filterButtonRef}
          />
        )}

        {/* Divider AFTER Filter (left side) */}
        {onFilterClick && showPrimary && (
          <div className="pr-header-divider" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" width="2" height="34" viewBox="0 0 2 34" fill="none">
              <path d="M1 0.5V33.5" stroke="#E9E9EE" strokeLinecap="round"/>
            </svg>
          </div>
        )}

        {/* New primary action */}
        {showPrimary && (
          <NewProductButton 
            disabled={false}
            onCreate={onPrimaryClick}
          />
        )}

        {/* Divider AFTER the New button (right side) */}
        

       
        {/* {showIntegrations && (
          <button className="pr-integrations-btn" aria-label="Integrations" onClick={onSettingsClick}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
              <g clipPath="url(#clip0_13285_2368)">
                <path d="M7.5 16.5V5.25C7.5 5.05109 7.42098 4.86032 7.28033 4.71967C7.13968 4.57902 6.94891 4.5 6.75 4.5H3C2.60218 4.5 2.22064 4.65803 1.93934 4.93934C1.65804 5.22064 1.5 5.60217 1.5 6V15C1.5 15.3978 1.65804 15.7794 1.93934 16.0607C2.22064 16.342 2.60218 16.5 3 16.5H12C12.3978 16.5 12.7794 16.342 13.0607 16.0607C13.342 15.7794 13.5 15.3978 13.5 15V11.25C13.5 11.0511 13.421 10.8603 13.2803 10.7197C13.1397 10.579 12.9489 10.5 12.75 10.5H1.5M11.25 1.5H15.75C16.1642 1.5 16.5 1.83579 16.5 2.25V6.75C16.5 7.16421 16.1642 7.5 15.75 7.5H11.25C10.8358 7.5 10.5 7.16421 10.5 6.75V2.25C10.5 1.83579 10.8358 1.5 11.25 1.5Z" stroke="#25303D" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round"/>
              </g>
              <defs>
                <clipPath id="clip0_13285_2368">
                  <rect width="18" height="18" fill="white"/>
                </clipPath>
              </defs>
            </svg>
          </button>
        )} */}
          <div className="pr-header-divider" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" width="2" height="34" viewBox="0 0 2 34" fill="none">
              <path d="M1 0.5V33.5" stroke="#E9E9EE" strokeLinecap="round"/>
            </svg>
          </div>

        {/* Settings / Spark */}
        <Spark
          state="default"
          onClick={onSettingsClick}
          ariaLabel="Settings"
        />

        {/* Notifications / Bell */}
        <Bell
          state="default"
          onClick={onNotificationsClick || (() => {})}
          ariaLabel="Notifications"
        />
      </div>
    </div>
  );
};

export default Header;
