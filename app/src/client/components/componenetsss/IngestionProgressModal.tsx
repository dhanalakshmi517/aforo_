import React from "react";
import "./IngestionProgressModal.css";
// ⬇️ Use YOUR progress bar component here
// Adjust the import path if needed.
import ProgressBar from "../componenetsss/ProgressBar";

type Props = {
  open: boolean;
  /** Main line (e.g., "Importing and processing files.") */
  title?: string;
  /** Second line (e.g., "Please wait…") */
  subtitle?: string;
  /** 0..100 */
  percent: number;
  /** Small text shown under the bar on the left (e.g., "54 sec left…") */
  leftHint?: string;
  /** Small text shown under the bar on the right (e.g., "10 / 100 files") */
  rightHint?: string;
  /** Optional cancel handler (shows a small link if provided) */
  onCancel?: () => void;
};

const IngestionProgressModal: React.FC<Props> = ({
  open,
  title = "Importing and processing files.",
  subtitle = "Please wait…",
  percent,
  leftHint,
  rightHint,
  onCancel,
}) => {
  if (!open) return null;

  return (
    <div className="ipm-overlay" role="dialog" aria-modal="true" aria-label="Ingestion progress">
      <div className="ipm-modal">
        <div className="ipm-head">
          <div className="ipm-title">{title}</div>
          <div className="ipm-subtitle">{subtitle}</div>
        </div>

        <div className="ipm-progress">
          {/* If your ProgressBar prop is different, change 'value' below */}
          <ProgressBar current={percent} total={100} />
          <div className="ipm-progress-row">
            <span className="ipm-hint-left">{leftHint}</span>
            <span className="ipm-hint-right">{rightHint}</span>
          </div>
        </div>

        {onCancel && (
          <div className="ipm-actions">
            <button className="ipm-cancel" onClick={onCancel}>
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default IngestionProgressModal;
