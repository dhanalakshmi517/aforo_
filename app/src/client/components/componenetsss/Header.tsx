import React, { useRef, useState } from 'react';
import NewProductButton from "../componenetsss/NewProductButton";
import Filter from "../componenetsss/Filter";
import Spark from "../componenetsss/Spark";
import Bell from "../componenetsss/Bell";
import SearchInput from "../componenetsss/SearchInput";
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
  searchDisabled?: boolean;
  filterDisabled?: boolean;
  showIntegrations?: boolean;
  showSearch?: boolean;
  showDivider?: boolean;
  filterButtonRef?: React.RefObject<HTMLButtonElement | null>;
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
  searchDisabled = false,
  filterDisabled = false,
  showIntegrations = true,
  showSearch = true,
  showDivider = true,
  filterButtonRef
}) => {
  const [isFilterSelected, setIsFilterSelected] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClear = () => {
    if (searchDisabled || !onSearchTermChange) return;
    onSearchTermChange('');
    requestAnimationFrame(() => inputRef.current?.focus());
  };

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
        {showSearch && (
          <SearchInput
            value={searchTerm || ''}
            onChange={(v) => onSearchTermChange?.(v)}
            onClear={handleClear}
            state={
              searchDisabled
                ? 'disabled'
                : searchTerm && searchTerm.length > 0
                ? 'filled'
                : 'default'
            }
            className="rp-header-search-input"
          />
        )}

        {onFilterClick && (
          <Filter
            state={filterDisabled ? 'disabled' : isFilterSelected ? 'active' : 'default'}
            onClick={handleFilterClick}
            ariaLabel="Open filters"
            buttonRef={filterButtonRef}
          />
        )}

        {showDivider && onFilterClick && showPrimary && (
          <div className="header-divider" aria-hidden="true">
            <svg width="1" height="13" viewBox="0 0 1 13">
              <path d="M0.5 0.5V12.5" stroke="#D9DFE8" strokeLinecap="round" />
            </svg>
          </div>
        )}

        {showPrimary && (
          <div className="ph-primary-action">
            <NewProductButton
              disabled={false}
              onCreate={onPrimaryClick}
            />
          </div>
        )}

        {showDivider && (
          <div className="header-divider" aria-hidden="true">
            <svg width="1" height="13" viewBox="0 0 1 13">
              <path d="M0.5 0.5V12.5" stroke="#D9DFE8" strokeLinecap="round" />
            </svg>
          </div>
        )}

        <Spark state="default" onClick={onSettingsClick} ariaLabel="Settings" />
        <Bell state="default" onClick={onNotificationsClick || (() => {})} ariaLabel="Notifications" />
      </div>
    </div>
  );
};

export default Header;
