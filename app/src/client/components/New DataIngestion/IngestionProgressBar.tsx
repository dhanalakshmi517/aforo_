import * as React from "react";
import "./IngestionProgressBar.css";

type Props = {
  /** e.g. "Uploading and processing files. Please wait..." */
  title?: string;

  /** processed so far */
  processedFiles: number;

  /** total files */
  totalFiles: number;

  /** seconds remaining (optional). If not provided, left label can be hidden. */
  etaSeconds?: number | null;

  /** width control (defaults to the Figma-looking 348px). */
  width?: number | string;

  /** when true, show "--" instead of time */
  isEstimating?: boolean;

  className?: string;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function formatEta(sec?: number | null, isEstimating?: boolean) {
  if (isEstimating) return "Estimating...";
  if (sec === null || sec === undefined) return "";
  const s = Math.max(0, Math.floor(sec));

  // Match your screenshot style: "54 sec left.."
  if (s < 60) return `${s} sec left..`;

  const m = Math.floor(s / 60);
  const r = s % 60;
  if (m < 60) return `${m} min ${r} sec left..`;

  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${h} hr ${mm} min left..`;
}

export default function IngestionProgressBar({
  title = "Uploading and processing files. Please wait...",
  processedFiles,
  totalFiles,
  etaSeconds = null,
  width = 348,
  isEstimating = false,
  className = "",
}: Props) {
  const safeTotal = Math.max(0, totalFiles);
  const safeDone = clamp(processedFiles, 0, safeTotal || processedFiles);

  const pct =
    safeTotal <= 0 ? 0 : clamp((safeDone / safeTotal) * 100, 0, 100);

  const etaText = formatEta(etaSeconds, isEstimating);

  return (
    <div
      className={`afIngestProg ${className}`}
      style={{ width: typeof width === "number" ? `${width}px` : width }}
      role="status"
      aria-live="polite"
    >
      <div className="afIngestProgTitle">{title}</div>

      <div className="afIngestProgTrack" aria-label="Upload progress">
        <div
          className="afIngestProgFill"
          style={{ width: `${pct}%` }}
          aria-hidden="true"
        />
      </div>

      <div className="afIngestProgMeta">
        <div className="afIngestProgLeft">{etaText}</div>
        <div className="afIngestProgRight">
          {safeDone} / {safeTotal} files
        </div>
      </div>
    </div>
  );
}
