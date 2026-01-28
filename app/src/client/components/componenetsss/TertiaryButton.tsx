import * as React from "react";
import "./TertiaryButton.css";

type Props = {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;

  /** ✅ NEW: explicit icons */
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;

  /** ✅ Optional gap between icon and label (default 8px) */
  iconGap?: number;

  /** ✅ Backward compatible */
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
};

export default function TertiaryButton({
  children,
  onClick,
  type = "button",
  disabled = false,
  fullWidth = false,
  className = "",

  leftIcon,
  rightIcon,
  iconGap = 8,

  icon,
  iconPosition = "left",
}: Props) {
  const computedLeftIcon = leftIcon ?? (iconPosition === "left" ? icon : null);
  const computedRightIcon = rightIcon ?? (iconPosition === "right" ? icon : null);

  return (
    <button
      type={type}
      className={["aft-tertiary-btn", fullWidth ? "is-full" : "", className].join(" ").trim()}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      style={
        {
          ["--aft-btn-icon-gap" as any]: `${iconGap}px`,
        } as React.CSSProperties
      }
    >
      {computedLeftIcon && (
        <span className="aft-btn-icon aft-btn-icon--left" aria-hidden="true">
          {computedLeftIcon}
        </span>
      )}

      <span className="aft-btn-label">{children}</span>

      {computedRightIcon && (
        <span className="aft-btn-icon aft-btn-icon--right" aria-hidden="true">
          {computedRightIcon}
        </span>
      )}
    </button>
  );
}
