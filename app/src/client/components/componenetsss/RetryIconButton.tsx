import React from "react";
import "./RetryIconButton.css";

export type RetryIconButtonProps = {
  onClick?: () => void;
  disabled?: boolean;
  title?: string;   // default: "Retry"
  className?: string;
};

const RetryIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true"
  >
    <path
      d="M7.41667 0.75C11.0986 0.75 14.0833 3.73477 14.0833 7.41667C14.0833 11.0986 11.0986 14.0833 7.41667 14.0833C3.73477 14.0833 0.75 11.0986 0.75 7.41667H4.75H10.0833M10.0833 7.41667L7.41667 10.0833M10.0833 7.41667L7.41667 4.75"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
    />
  </svg>
);

const RetryIconButton: React.FC<RetryIconButtonProps> = ({
  onClick,
  disabled,
  title = "Retry",
  className,
}) => (
  <button
    type="button"
    className={`af-retry-icon ${disabled ? "is-disabled" : ""}${className ? ` ${className}` : ""}`}
    onClick={onClick}
    disabled={disabled}
    aria-label={title}
    title={title}
  >
    <RetryIcon />
  </button>
);

export default RetryIconButton;
