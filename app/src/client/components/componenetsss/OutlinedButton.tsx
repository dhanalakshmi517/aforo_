import React from "react";
import "./OutlinedButton.css";

interface OutlinedButtonProps {
  label: string;
  onClick?: () => void;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

const OutlinedButton: React.FC<OutlinedButtonProps> = ({
  label,
  onClick,
  iconLeft,
  iconRight,
  disabled = false,
  className = "",
}) => {
  return (
    <button
      className={`outlined-btn ${disabled ? "disabled" : ""} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {iconLeft && <span className="icon-left">{iconLeft}</span>}
      {label}
      {iconRight && <span className="icon-right">{iconRight}</span>}
    </button>
  );
};

export default OutlinedButton;
