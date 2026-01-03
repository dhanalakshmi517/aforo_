// IntegrationHeader.tsx
import React, { useRef, useState } from 'react';
import './IntegrationHeader.css';
import Spark from './Spark';
import Bell from './Bell';
import Notification from './Notification';

export interface IntegrationHeaderProps {
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
}

const IntegrationHeader: React.FC<IntegrationHeaderProps> = ({
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
  showIntegrations = true
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isFilterSelected, setIsFilterSelected] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  let searchCls = 'integration-rp-header-search';
  if (searchTerm) searchCls += ' integration-has-value';
  if (isFocused) searchCls += ' integration-is-active';
  if (searchDisabled) searchCls += ' integration-is-disabled';

  const handleClear = () => {
    if (searchDisabled || !onSearchTermChange) return;
    onSearchTermChange('');
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  let filterBtnCls = 'integration-rp-filter-btn';
  if (isFilterSelected) filterBtnCls += ' integration-is-selected';
  if (filterDisabled) filterBtnCls += ' integration-is-disabled';

  const handleFilterClick = () => {
    if (filterDisabled) return;
    setIsFilterSelected((v) => !v);
    onFilterClick?.();
  };

  return (
    <div className="integration-rate-plan-header">
      <h2>{title}</h2>
      {statusLabel && <span className="integration-status-pill">{statusLabel}</span>}

      <div className="integration-ph-header-actions">
        {/* Search */}
       

       

        {/* Divider AFTER Filter (left side) */}
       


       
        
       
        <Spark
          ariaLabel="Settings"
          onClick={onSettingsClick}
        />

    
        <Bell
          ariaLabel="Notifications"
          onClick={() => {
            setShowNotification(true);
            onNotificationsClick?.();
          }}
        />
      </div>
    </div>
  );
};

export default IntegrationHeader;
