import React from "react";
import "./RetryIconButton.css";
import Tooltip from "./Tooltip";

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
    width="14" height="13" viewBox="0 0 14 13" fill="none" aria-hidden="true"
  >
    <path
      d="M6.74933 12.0832H12.7493M9.66667 1.16449C9.93206 0.899096 10.292 0.75 10.6673 0.75C11.0427 0.75 11.4026 0.899096 11.668 1.16449C11.9334 1.42988 12.0825 1.78983 12.0825 2.16516C12.0825 2.54048 11.9334 2.90043 11.668 3.16582L3.66133 11.1732C3.50273 11.3318 3.30668 11.4478 3.09133 11.5105L1.17667 12.0692C1.1193 12.0859 1.05849 12.0869 1.00061 12.0721C0.94272 12.0572 0.889885 12.0271 0.847631 11.9849C0.805377 11.9426 0.775259 11.8898 0.760429 11.8319C0.745599 11.774 0.746602 11.7132 0.763333 11.6558L1.322 9.74116C1.38481 9.52605 1.50083 9.33024 1.65933 9.17182L9.66667 1.16449Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const RetryIconButton: React.FC<RetryIconButtonProps> = ({
  onClick,
  disabled,
  title = "Retry",
  className,
}) => (
  <Tooltip content={title} position="bottom">
    <button
      type="button"
      className={`af-retry-icon ${disabled ? "is-disabled" : ""}${className ? ` ${className}` : ""}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={title}
    >
      <RetryIcon />
    </button>
  </Tooltip>
);

export default RetryIconButton;
