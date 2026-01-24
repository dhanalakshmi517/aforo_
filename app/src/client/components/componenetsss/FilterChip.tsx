import * as React from "react";
import "./FilterChip.css";

type Props = {
  label: string;
  onRemove?: () => void;
  disabled?: boolean;
  className?: string;
  ariaLabelRemove?: string;
};

const CloseIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path
      d="M14 6L6 14M6 6L14 14"
      stroke="#19222D"
      strokeWidth="1.1"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const FilterChip: React.FC<Props> = ({
  label,
  onRemove,
  disabled = false,
  className = "",
  ariaLabelRemove = "Remove filter",
}) => {
  return (
    <span
      className={`filterchip ${disabled ? "is-disabled" : ""} ${className}`.trim()}
      role="listitem"
      aria-disabled={disabled || undefined}
      title={label}
    >
      <span className="filterchip__label">{label}</span>

      <button
        type="button"
        className="filterchip__close"
        onClick={disabled ? undefined : onRemove}
        disabled={disabled || !onRemove}
        aria-label={`${ariaLabelRemove}: ${label}`}
      >
        <CloseIcon />
      </button>
    </span>
  );
};

export default FilterChip;
