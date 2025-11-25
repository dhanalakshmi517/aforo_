// src/components/Common/GlobalLoadingOverlay.tsx
import React from 'react';
import './GlobalLoadingOverlay.css';

const GlobalLoadingOverlay: React.FC = () => {
  return (
    <div className="global-loader-backdrop">
      <div className="global-loader-content">
        <span className="global-loader-spinner" />
        <span className="global-loader-text">Loading...</span>
      </div>
    </div>
  );
};

export default GlobalLoadingOverlay;
