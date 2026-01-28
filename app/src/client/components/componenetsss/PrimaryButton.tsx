import * as React from "react";
import "./Primarybutton.css";

type Props = {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;

  /** ✅ loading support */
  isLoading?: boolean;

  /**
   * ✅ NEW: explicit icons
   * - Use leftIcon / rightIcon when calling
   */
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;

  /** ✅ Optional gap between icon and label (default 8px) */
  iconGap?: number;

  /**
   * ✅ Backward compatible (your old API)
   * - If you pass `icon`, it will render using `iconPosition`
   */
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
};

export default function PrimaryButton({
  children,
  onClick,
  type = "button",
  disabled = false,
  fullWidth = false,
  className = "",
  isLoading = false,

  leftIcon,
  rightIcon,
  iconGap = 8,

  icon,
  iconPosition = "left",
}: Props) {
  const computedLeftIcon = leftIcon ?? (iconPosition === "left" ? icon : null);
  const computedRightIcon = rightIcon ?? (iconPosition === "right" ? icon : null);

  const isDisabled = disabled || isLoading;

  return (
    <button
      type={type}
      className={[
        "af-primary-btn",
        fullWidth ? "is-full" : "",
        isLoading ? "is-loading" : "",
        className,
      ]
        .join(" ")
        .trim()}
      onClick={isDisabled ? undefined : onClick}
      disabled={isDisabled}
      style={
        {
          ["--af-btn-icon-gap" as any]: `${iconGap}px`,
        } as React.CSSProperties
      }
    >
      {/* Left icon */}
      {computedLeftIcon && (
        <span className="af-btn-icon af-btn-icon--left" aria-hidden="true">
          {computedLeftIcon}
        </span>
      )}

      {/* Label */}
      <span className="af-btn-label">{children}</span>

      {/* Right icon */}
      {computedRightIcon && (
        <span className="af-btn-icon af-btn-icon--right" aria-hidden="true">
          {computedRightIcon}
        </span>
      )}

      {/* Loading spinner overlay (optional) */}
      {isLoading && (
        <span className="af-btn-spinner" aria-hidden="true">
          <span className="af-btn-spinnerRing" />
        </span>
      )}
    </button>
  );
}
