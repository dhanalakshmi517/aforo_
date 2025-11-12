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
  | "very high";

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
      {label}
    </span>
  );
};

export default StatusBadge;
export type { Variant };
