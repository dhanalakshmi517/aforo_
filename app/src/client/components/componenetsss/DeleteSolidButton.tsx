import React from "react";
import "./DeleteSolidButton.css";

export type DeleteSolidButtonProps = {
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  label?: string;               // default: "Delete"
  title?: string;
  type?: "button" | "submit" | "reset";
  size?: "sm" | "md" | "lg";    // default: "md"
  className?: string;
};

const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    width="16" height="16" viewBox="0 0 24 24" fill="none"
  >
    <path
      d="M3 6h18M9 6V4.8c0-1 .81-1.8 1.8-1.8h2.4c.99 0 1.8.81 1.8 1.8V6M8 6l1.1 13.8c.08.96.12 1.44.34 1.8.2.33.5.59.86.74.31.06.79.06 1.78.06h1.84c.99 0 1.47 0 1.78-.06.36-.15.66-.41.86-.74.22-.36.26-.84.34-1.8L16 6M10 10v7M14 10v7"
      stroke="currentColor" strokeWidth="1.7"
      strokeLinecap="round" strokeLinejoin="round"
    />
  </svg>
);

const SpinnerArc: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg"
       width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 3a9 9 0 0 1 9 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const cx = (...c: Array<string | false | undefined>) => c.filter(Boolean).join(" ");

const DeleteSolidButton: React.FC<DeleteSolidButtonProps> = ({
  onClick,
  disabled,
  loading,
  label = "Delete",
  title,
  type = "button",
  size = "md",
  className
}) => {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      title={title ?? (loading ? "Deleting…" : label)}
      className={cx("af-del-solid", `af-del-solid--${size}`, isDisabled && "is-disabled", loading && "is-loading", className)}
      onClick={onClick}
      disabled={isDisabled}
      aria-busy={loading || undefined}
    >
      {loading ? (
        <>
          <SpinnerArc className="af-del-solid__spinner" />
          <span className="af-del-solid__text">Deleting...</span>
        </>
      ) : (
        <>
          <TrashIcon className="af-del-solid__icon" />
          <span className="af-del-solid__text">{label}</span>
        </>
      )}
    </button>
  );
};

export default DeleteSolidButton;
