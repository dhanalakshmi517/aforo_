import * as React from "react";
import "./Primarybutton.css";

type Props = {
  children: React.ReactNode;          // button text
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  fullWidth?: boolean;                // optional 100% width
  className?: string;
};

export default function PrimaryButton({
  children,
  onClick,
  type = "button",
  disabled = false,
  fullWidth = false,
  className = "",
}: Props) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Enter" && !disabled && onClick) {
      e.preventDefault();
      onClick(e as any);
    }
  };

  return (
    <button
      type={type}
      className={["af-primary-btn", fullWidth ? "is-full" : "", className].join(" ").trim()}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
    >
      <span className="af-btn-label">{children}</span>
    </button>
  );
}
