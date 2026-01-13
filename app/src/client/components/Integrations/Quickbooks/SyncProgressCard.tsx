import * as React from "react";
import "./SyncProgressCard.css";

type Props = {
  value: number;              // 0..100
  label?: string;             // "Syncing your previous data..."
  etaText?: string;           // "2m left"
  className?: string;
};

export default function SyncProgressCard({
  value,
  label = "Syncing your previous data...",
  etaText = "2m left",
  className = "",
}: Props) {
  const clamped = clamp(value, 0, 100);

  return (
    <div className={`spc-card ${className}`}>
      <div className="spc-label" title={label}>
        {label}
      </div>

      <div
        className="spc-track"
        role="progressbar"
        aria-label={label}
        aria-valuenow={Math.round(clamped)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="spc-fill" style={{ width: `${clamped}%` }} />
      </div>

      <div className="spc-meta">
        <span className="spc-percent">{Math.round(clamped)}%</span>
        <span className="spc-eta">{etaText}</span>
      </div>
    </div>
  );
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}
