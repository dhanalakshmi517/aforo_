// ProductsImportedApigee.tsx
import * as React from "react";
import "./ProductsImportedApigee.css";

// ✅ Apigee top bar
import PrimaryButton from '../componenetsss/PrimaryButton';
import SecondaryButton from '../componenetsss/SecondaryButton';
import ApigeeConnection from './ApigeeConnection';
import ApigeeImportedProducts from './ApigeeImportedProductsPage';

type Props = {
  importedCount?: number;
  onBack?: () => void;
  onManageConnection?: () => void;
  onViewHistory?: () => void;
  onImportMore?: () => void;
};

export default function ProductsImportedApigee({
  importedCount = 10,
  onBack,
  onManageConnection,
  onViewHistory,
  onImportMore,
}: Props) {
  const [showHistory, setShowHistory] = React.useState(false);

  const handleViewHistory = () => {
    setShowHistory(true);
  };

  const handleBackFromHistory = () => {
    setShowHistory(false);
  };

  if (showHistory) {
    return <ApigeeImportedProducts onBack={handleBackFromHistory} />;
  }

  return (
    <div className="pia-page">
      <div className="pia-topbar">
        <ApigeeConnection
          title="Apigee Integration"
          onBack={onBack}
          rightActionLabel="Manage Connection"
          onRightAction={onManageConnection}
        />
      </div>

      <div className="pia-content">
        <div className="pia-card">
          <div className="pia-center">
            <div className="pia-heroIcon" aria-hidden="true">
<svg xmlns="http://www.w3.org/2000/svg" width="160" height="137" viewBox="0 0 160 137" fill="none">
  <g filter="url(#filter0_f_15301_100677)">
    <path d="M21.4336 114.767H138.1M62.2669 56.4334L73.9336 68.1L97.2669 44.7667M38.9336 21.4333H120.6C127.044 21.4333 132.267 26.6567 132.267 33.1V79.7667C132.267 86.21 127.044 91.4334 120.6 91.4334H38.9336C32.4903 91.4334 27.2669 86.21 27.2669 79.7667V33.1C27.2669 26.6567 32.4903 21.4333 38.9336 21.4333Z" stroke="url(#paint0_linear_15301_100677)" stroke-width="11.6667" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
  <defs>
    <filter id="filter0_f_15301_100677" x="-0.000391006" y="9.72748e-05" width="159.534" height="136.2" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feFlood flood-opacity="0" result="BackgroundImageFix"/>
      <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
      <feGaussianBlur stdDeviation="7.8" result="effect1_foregroundBlur_15301_100677"/>
    </filter>
    <linearGradient id="paint0_linear_15301_100677" x1="79.7669" y1="21.4333" x2="79.7669" y2="114.767" gradientUnits="userSpaceOnUse">
      <stop stop-color="#389315"/>
      <stop offset="1" stop-color="#C6E5B6"/>
    </linearGradient>
  </defs>
</svg>            </div>

            <div className="pia-title">
              {importedCount} Products Imported From Apigee
            </div>

            <div className="pia-sub">
              Real-time ingestion is now active for these products. Continue setting
              up billable metrics and rate plans.
            </div>

            <div className="pia-actions">
              <PrimaryButton onClick={onImportMore} className="pia-primaryBtn">
                Import More Products
              </PrimaryButton>

              <SecondaryButton onClick={handleViewHistory} className="pia-secondaryBtn">
                View History
              </SecondaryButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
