import React from "react";
import "./DeleteButton.css";

export type DeleteButtonProps = {
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  label?: string; // default: "Delete"
  title?: string;
  type?: "button" | "submit" | "reset";
  variant?: "soft" | "solid"; // soft = light pill (default), solid = filled red
};

const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
  >
    <path
      d="M3 6h18M9 6V4.8c0-.96 0-1.44.187-1.803a1.8 1.8 0 0 1 .81-.81C10.36 2 10.84 2 11.8 2h.4c.96 0 1.44 0 1.803.187.35.163.647.46.81.81C15 3.36 15 3.84 15 4.8V6m-8 0l1.2 14.4c.08.96.12 1.44.34 1.803.2.329.5.59.86.744C9.71 23 10.19 23 11.16 23h1.68c.97 0 1.45 0 1.76-.053.36-.154.66-.415.86-.744.22-.363.26-.843.34-1.803L17 6M10 10v7M14 10v7"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const cx = (...c: Array<string | false | undefined>) => c.filter(Boolean).join(" ");

const DeleteButton: React.FC<DeleteButtonProps> = ({
  onClick,
  disabled,
  className,
  label = "Delete",
  title,
  type = "button",
  variant = "soft",
}) => {
  return (
    <button
      type={type}
      title={title ?? label}
      className={cx(
        "af-del-btn",
        variant === "solid" && "af-del-btn--solid",
        disabled && "af-del-btn--disabled",
        className
      )}
      onClick={onClick}
      disabled={disabled}
    >
      <TrashIcon className="af-del-btn__icon" />
      <span className="af-del-btn__text">{label}</span>
    </button>
  );
};

export default DeleteButton;
