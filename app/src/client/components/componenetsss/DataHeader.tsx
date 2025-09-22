import React, { useState } from 'react';
import './DataHeader.css';

export interface DataHeaderProps {
  title: string;

  /** Primary CTA */
  primaryLabel: string;
  onPrimaryClick: () => void;
  showPrimary?: boolean;

  /** Optional small status chip next to title */
  statusLabel?: string;

  /** Icon actions */
  onFilterClick?: () => void;
  onSettingsClick?: () => void;
  onNotificationsClick?: () => void;
  filterDisabled?: boolean;

  /** Segmented toggle (replaces search) */
  showToggle?: boolean;                 // ← set true to show the toggle
  toggleLeftLabel?: string;             // default: 'Manual'
  toggleRightLabel?: string;            // default: 'API'
  toggleValue?: 'left' | 'right';       // controlled value
  onToggleChange?: (v: 'left' | 'right') => void;
}

const DataHeader: React.FC<DataHeaderProps> = ({
  title,
  statusLabel,

  primaryLabel,
  onPrimaryClick,
  showPrimary = true,

  onFilterClick,
  onSettingsClick,
  onNotificationsClick,
  filterDisabled = false,

  showToggle = true,
  toggleLeftLabel = 'Manual',
  toggleRightLabel = 'API',
  toggleValue,
  onToggleChange
}) => {
  // allow both controlled & uncontrolled
  const [localToggle, setLocalToggle] = useState<'left' | 'right'>('left');
  const current = toggleValue ?? localToggle;

  const setToggle = (v: 'left' | 'right') => {
    if (toggleValue === undefined) setLocalToggle(v);
    onToggleChange?.(v);
  };

  return (
    <div className="data-header">
      <h2>{title}</h2>
      {statusLabel && <span className="status-pill">{statusLabel}</span>}

      <div className="dh-header-actions">
        {/* Segmented Toggle */}
        {showToggle && (
          <div className="rp-segmented" role="tablist" aria-label="Mode">
            <button
              role="tab"
              aria-selected={current === 'left'}
              className={`rp-segment ${current === 'left' ? 'is-active' : ''}`}
              onClick={() => setToggle('left')}
              type="button"
            >
              {toggleLeftLabel}
            </button>
            <button
              role="tab"
              aria-selected={current === 'right'}
              className={`rp-segment ${current === 'right' ? 'is-active' : ''}`}
              onClick={() => setToggle('right')}
              type="button"
            >
              {toggleRightLabel}
            </button>
          </div>
        )}

        {/* Filter */}
        {onFilterClick && (
          <button
            className={`rp-filter-btn${filterDisabled ? ' is-disabled' : ''}`}
            aria-label="Open filters"
            aria-disabled={filterDisabled}
            onClick={filterDisabled ? undefined : onFilterClick}
            disabled={filterDisabled}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 7h16M7 12h10M10 17h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        )}

        {/* Divider AFTER Filter */}
        {onFilterClick && showPrimary && (
          <div className="header-divider" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" width="2" height="34" viewBox="0 0 2 34" fill="none">
              <path d="M1 0.5V33.5" stroke="#E9E9EE" strokeLinecap="round"/>
            </svg>
          </div>
        )}

        {/* Primary CTA */}
        {showPrimary && (
          <button className="new-rate-button" onClick={onPrimaryClick}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3.333 8H12.667M8 3.333V12.667" stroke="#F8F7FA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {primaryLabel}
          </button>
        )}

        {/* Divider after primary */}
        {showPrimary && (
          <div className="header-divider" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" width="2" height="34" viewBox="0 0 2 34" fill="none">
              <path d="M1 0.5V33.5" stroke="#E9E9EE" strokeLinecap="round"/>
            </svg>
          </div>
        )}

        {/* Settings */}
        <button className="rp-settings-btn" aria-label="Settings" onClick={onSettingsClick}>
          <svg className="rp-settings-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
            <path
              d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Notifications */}
        <button className="rp-notification-btn" aria-label="Notifications" onClick={onNotificationsClick || (() => {})}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default DataHeader;
