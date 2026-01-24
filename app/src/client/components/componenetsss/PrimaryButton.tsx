import * as React from "react";
import "./Primarybutton.css";

type Props = {
  children: React.ReactNode; // button text
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
  isLoading?: boolean;

  /** ✅ Optional icon support */
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
  icon,
  iconPosition = "left",
}: Props) {
  return (
    <button
      type={type}
      className={[
        "af-primary-btn",
        fullWidth ? "is-full" : "",
        className,
      ]
        .join(" ")
        .trim()}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && iconPosition === "left" && (
        <span className="af-btn-icon af-btn-icon--left">{icon}</span>
      )}

      <span className="af-btn-label">{children}</span>

      {icon && iconPosition === "right" && (
        <span className="af-btn-icon af-btn-icon--right">{icon}</span>
      )}
    </button>
  );
}
