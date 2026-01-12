// InfoInlineNote.tsx
import * as React from "react";
import "./InfoInlineNote.css";

type Props = {
  text: string;
  className?: string;
  /** default: 456 (px) */
  textWidthPx?: number;
};

export default function InfoInlineNote({
  text,
  className = "",
  textWidthPx = 456,
}: Props) {
  const uid = React.useId();
  const clipId = `infoNoteClip-${uid}`;

  return (
    <div className={`infoNote ${className}`} role="note">
      <span className="infoNote__icon" aria-hidden="true">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
        >
          <g clipPath={`url(#${clipId})`}>
            <path
              d="M6 8V6M6 4H6.005M11 6C11 8.76142 8.76142 11 6 11C3.23858 11 1 8.76142 1 6C1 3.23858 3.23858 1 6 1C8.76142 1 11 3.23858 11 6Z"
              stroke="#1D7AFC"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
          <defs>
            <clipPath id={clipId}>
              <rect width="12" height="12" fill="white" />
            </clipPath>
          </defs>
        </svg>
      </span>

      <p className="infoNote__text" style={{ maxWidth: textWidthPx }}>
        {text}
      </p>
    </div>
  );
}
