// IngetsionFileChip.tsx
import * as React from "react";
import "./IngetsionFileChip.css";

type Props = {
  fileName: string;
  widthPx?: number; // default matches your frame
  onClick?: () => void;
  className?: string;
  titlePrefix?: string; // optional, for tooltip title
};

export default function IngetsionFileChip({
  fileName,
  widthPx = 222,
  onClick,
  className = "",
  titlePrefix = "",
}: Props) {
  const Comp: any = onClick ? "button" : "div";

  return (
    <Comp
      className={`ifc-chip ${onClick ? "is-clickable" : ""} ${className}`}
      style={{ width: `${widthPx}px` }}
      onClick={onClick}
      type={onClick ? "button" : undefined}
      title={`${titlePrefix}${fileName}`}
    >
      <span className="ifc-icon" aria-hidden="true">
        <FileIcon />
      </span>

      {/* ✅ fixed-width chip, text truncates */}
      <span className="ifc-text">{fileName}</span>
    </Comp>
  );
}

function FileIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M9.07401 1.2959V3.88849C9.07401 4.23229 9.21059 4.56201 9.45369 4.80511C9.69679 5.04821 10.0265 5.18479 10.3703 5.18479H12.9629M6.48142 5.83294H5.18512M10.3703 8.42553H5.18512M10.3703 11.0181H5.18512M9.72216 1.2959H3.88883C3.54503 1.2959 3.21531 1.43247 2.97221 1.67557C2.7291 1.91868 2.59253 2.2484 2.59253 2.59219V12.9626C2.59253 13.3064 2.7291 13.6361 2.97221 13.8792C3.21531 14.1223 3.54503 14.2589 3.88883 14.2589H11.6666C12.0104 14.2589 12.3401 14.1223 12.5832 13.8792C12.8263 13.6361 12.9629 13.3064 12.9629 12.9626V4.53664L9.72216 1.2959Z"
        stroke="#074470"
        strokeWidth="1.16667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
