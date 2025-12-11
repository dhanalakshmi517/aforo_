import React from "react";
import "./StatusBadge.css";

type Variant =
  | "staged"
  | "under-review"
  | "draft"
  | "active"
  | "archived"
  | "high"
  | "very-high"
  | "violet"
  | "very high"
  // generic outcome statuses
  | "failed" | "success" | "partial" | "uploading";

type Size = "sm" | "md";

interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  label: string;
  variant: Variant;
  size?: Size;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  label,
  variant,
  size = "md",
  className = "",
  ...rest
}) => {
  return (
    <span
      role="status"
      aria-label={label}
      data-variant={variant}
      data-size={size}
      className={`badge ${className}`}
      {...rest}
    >
      {variant === "uploading" && (
        <span className="badge-spinner" aria-hidden>
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="7"
              cy="7"
              r="5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeOpacity="0.25"
            />
            <path
              d="M12 7A5 5 0 0 0 7 2"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </span>
      )}
      {label}
    </span>
  );
};

export default StatusBadge;
export type { Variant };
