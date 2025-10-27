import React from "react";
import "./DeleteIconButton.css";

export type DeleteIconButtonProps = {
  onClick?: () => void;
  disabled?: boolean;
  title?: string; // tooltip + a11y label (default: "Delete")
  className?: string;
};

const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    width="14" height="16" viewBox="0 0 14 16" fill="none" aria-hidden="true"
  >
    <path
      d="M0.630005 3.42996H13.2299M11.8299 3.42996V13.2298C11.8299 13.9298 11.1299 14.6298 10.4299 14.6298H3.42997C2.72998 14.6298 2.02999 13.9298 2.02999 13.2298V3.42996M4.12996 3.42996V2.02998C4.12996 1.32999 4.82996 0.629993 5.52995 0.629993H8.32992C9.02991 0.629993 9.7299 1.32999 9.7299 2.02998V3.42996M5.52995 6.92992V11.1299M8.32992 6.92992V11.1299"
      stroke="currentColor" strokeWidth="1.25999" strokeLinecap="round" strokeLinejoin="round"
    />
  </svg>
);

const DeleteIconButton: React.FC<DeleteIconButtonProps> = ({
  onClick,
  disabled,
  title = "Delete",
  className
}) => (
  <button
    type="button"
    className={`af-del-icon ${disabled ? "is-disabled" : ""}${className ? ` ${className}` : ""}`}
    onClick={onClick}
    disabled={disabled}
    aria-label={title}
    title={title}
  >
    <TrashIcon />
  </button>
);

export default DeleteIconButton;
