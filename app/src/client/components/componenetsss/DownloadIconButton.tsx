import React from "react";
import "./DownloadIconButton.css";
import Tooltip from "./Tooltip";

export type DownloadIconButtonProps = {
  onClick?: () => void;
  disabled?: boolean;
  title?: string;
  className?: string;
};

const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M7 1V9M7 9L3.5 5.5M7 9L10.5 5.5M1 13H13"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const DownloadIconButton: React.FC<DownloadIconButtonProps> = ({
  onClick,
  disabled,
  title = "Download",
  className
}) => (
  <Tooltip content={title} position="bottom">
    <button
      type="button"
      className={`af-download-icon ${disabled ? "is-disabled" : ""}${className ? ` ${className}` : ""}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={title}
    >
      <DownloadIcon />
    </button>
  </Tooltip>
);

export default DownloadIconButton;
