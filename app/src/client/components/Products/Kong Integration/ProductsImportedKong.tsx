// ProductsImportedKong.tsx
import * as React from "react";
import "./ProductsImportedKong.css";
import ImportedKongIcon from "./importedkong.svg";

// ✅ use your existing top bar
import ConnectionBar from "./ConnectionBar";
import SecondaryButton from "../../componenetsss/SecondaryButton";
import PrimaryButton from "../../componenetsss/PrimaryButton";

type Props = {
  importedCount?: number;
  onBack?: () => void;
  onManageConnection?: () => void;
  onViewHistory?: () => void;
  onImportMore?: () => void;
};

export default function ProductsImportedKong({
  importedCount = 10,
  onBack,
  onManageConnection,
  onViewHistory,
  onImportMore,
}: Props) {
  return (
    <div className="pik-page">
      <div className="pik-topbar">
        <ConnectionBar
          title="Kong Integration"
          onBack={onBack}
          rightActionLabel="Manage Connection"
          onRightAction={onManageConnection}
        />
      </div>

      <div className="pik-content">
        <div className="pik-card">
          <div className="pik-center">
            <div className="pik-heroIcon" aria-hidden="true">
              <img src={ImportedKongIcon} alt="" />
            </div>

            <div className="pik-title">
              {importedCount} Products Imported From Kong
            </div>

            <div className="pik-sub">
              Real-time ingestion is now active for these products. Continue setting
              up billable metrics and rate plans.
            </div>

            <div className="pik-actions">
              <PrimaryButton
                onClick={onImportMore}
                className="pik-primaryBtn"
              >
                Import More Products
              </PrimaryButton>
              <SecondaryButton
                onClick={onViewHistory}
                className="pik-secondaryBtn"
              >
                View History
              </SecondaryButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
