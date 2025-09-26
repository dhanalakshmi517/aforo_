import React, { useMemo } from 'react';
import './ImportProgressModal.css';

export type ImportProgressModalProps = {
  isOpen: boolean;
  /** 0..total processed so far */
  current: number;
  /** total files to process (if unknown, pass 0 or undefined for indeterminate) */
  total?: number;
  /** seconds remaining (optional) */
  etaSeconds?: number;
  /** Optional custom title / message */
  title?: string;        // default: "Importing and processing files."
  subtitle?: string;     // default: "Please wait..."
  /** Optional: show cancel button */
  onCancel?: () => void;
};

const formatEta = (secs?: number) => {
  if (secs == null || Number.isNaN(secs)) return '';
  if (secs < 60) return `${Math.max(0, Math.round(secs))} sec left…`;
  const m = Math.floor(secs / 60);
  const s = Math.round(secs % 60);
  return s ? `${m}m ${s}s left…` : `${m}m left…`;
};

export default function ImportProgressModal({
  isOpen,
  current,
  total,
  etaSeconds,
  title = 'Importing and processing files.',
  subtitle = 'Please wait...',
  onCancel,
}: ImportProgressModalProps) {
  if (!isOpen) return null;

  const isDeterminate = !!total && total > 0;
  const pct = useMemo(() => {
    if (!isDeterminate) return 25; // small looping animation handled in CSS; this is fallback width
    const raw = (current / (total || 1)) * 100;
    return Math.max(0, Math.min(100, raw));
  }, [current, total, isDeterminate]);

  return (
    <div className="ipm-backdrop" role="presentation" aria-hidden="false">
      <div
        className="ipm-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ipm-title"
        aria-describedby="ipm-subtitle"
      >
        <div className="ipm-title" id="ipm-title">{title}</div>
        <div className="ipm-subtitle" id="ipm-subtitle">{subtitle}</div>

        <div className={`ipm-progress ${isDeterminate ? 'is-determinate' : 'is-indeterminate'}`}>
          <div
            className="ipm-bar"
            style={isDeterminate ? { width: `${pct}%` } : undefined}
          />
        </div>

        <div className="ipm-footer">
          <div className="ipm-left">{formatEta(etaSeconds)}</div>
          <div className="ipm-right">
            {isDeterminate ? `${current} / ${total} files` : ''}
          </div>
        </div>

        {onCancel && (
          <button type="button" className="ipm-cancel" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
