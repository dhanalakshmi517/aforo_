import React, { useState } from 'react';
import './DataHeader.css';
import IngestionToggle from '../DataIngestion/Dataingestioncomponents/Ingestiontoggle';

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
  /** Optional extra divider at the far right, after notifications */
  showTrailingDivider?: boolean;
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
  onToggleChange,
  showTrailingDivider,
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
          <IngestionToggle
            value={current === 'left' ? 'manual' : 'realtime'}
            onChange={(v) => setToggle(v === 'manual' ? 'left' : 'right')}
            leftLabel={toggleLeftLabel}
            rightLabel={toggleRightLabel}
          />
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

        {/* Optional divider before the icon buttons (settings + notifications) */}
        {showTrailingDivider && (
          <div className="header-divider" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" width="2" height="34" viewBox="0 0 2 34" fill="none">
              <path d="M1 0.5V33.5" stroke="#E9E9EE" strokeLinecap="round"/>
            </svg>
          </div>
        )}

        {/* Settings */}
        <button className="rp-settings-btn" aria-label="Settings" onClick={onSettingsClick}>
         <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none">
  <path d="M7.43935 1.2871C7.47149 1.11505 7.56278 0.959662 7.69742 0.847839C7.83207 0.736017 8.00158 0.674805 8.1766 0.674805C8.35162 0.674805 8.52113 0.736017 8.65578 0.847839C8.79042 0.959662 8.88172 1.11505 8.91385 1.2871L9.7021 5.4556C9.75808 5.75196 9.90211 6.02456 10.1154 6.23783C10.3286 6.45109 10.6012 6.59512 10.8976 6.6511L15.0661 7.43935C15.2381 7.47149 15.3935 7.56278 15.5054 7.69742C15.6172 7.83207 15.6784 8.00158 15.6784 8.1766C15.6784 8.35162 15.6172 8.52113 15.5054 8.65578C15.3935 8.79042 15.2381 8.88172 15.0661 8.91385L10.8976 9.7021C10.6012 9.75808 10.3286 9.90211 10.1154 10.1154C9.90211 10.3286 9.75808 10.6012 9.7021 10.8976L8.91385 15.0661C8.88172 15.2381 8.79042 15.3935 8.65578 15.5054C8.52113 15.6172 8.35162 15.6784 8.1766 15.6784C8.00158 15.6784 7.83207 15.6172 7.69742 15.5054C7.56278 15.3935 7.47149 15.2381 7.43935 15.0661L6.6511 10.8976C6.59512 10.6012 6.45109 10.3286 6.23783 10.1154C6.02456 9.90211 5.75196 9.75808 5.4556 9.7021L1.2871 8.91385C1.11505 8.88172 0.959662 8.79042 0.847839 8.65578C0.736017 8.52113 0.674805 8.35162 0.674805 8.1766C0.674805 8.00158 0.736017 7.83207 0.847839 7.69742C0.959662 7.56278 1.11505 7.47149 1.2871 7.43935L5.4556 6.6511C5.75196 6.59512 6.02456 6.45109 6.23783 6.23783C6.45109 6.02456 6.59512 5.75196 6.6511 5.4556L7.43935 1.2871Z" stroke="#25303D" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"/>
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
