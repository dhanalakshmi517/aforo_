import React from "react";
import "./OutlinedButton.css";

interface OutlinedButtonProps {
  label: string;
  onClick?: () => void;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  disabled?: boolean;
}

const OutlinedButton: React.FC<OutlinedButtonProps> = ({
  label,
  onClick,
  iconLeft,
  iconRight,
  disabled = false,
}) => {
  return (
    <button
      className={`outlined-btn ${disabled ? "disabled" : ""}`}
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
