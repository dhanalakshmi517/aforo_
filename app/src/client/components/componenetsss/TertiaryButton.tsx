import * as React from "react";
import "./TertiaryButton.css";

type Props = {
  children: React.ReactNode;                 // button text
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  fullWidth?: boolean;                       // optional 100% width
  className?: string;
};

export default function TertiaryButton({
  children,
  onClick,
  type = "button",
  disabled = false,
  fullWidth = false,
  className = "",
}: Props) {
  return (
    <button
      type={type}
      className={["aft-tertiary-btn", fullWidth ? "is-full" : "", className].join(" ").trim()}
      onClick={onClick}
      disabled={disabled}
    >
      <span className="aft-btn-label">{children}</span>
    </button>
  );
}
