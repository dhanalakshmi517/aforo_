import * as React from "react";
import "./ResetButton.css";

export type ResetButtonState =
  | "default"
  | "active"
  | "disabled"
  | "loading";

type Props = {
  label?: string;
  state?: ResetButtonState;
  onClick?: () => void;
  className?: string;
  ariaLabel?: string;
};

const ResetIcon: React.FC<{ className?: string }> = ({ className }) => (
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
      d="M1.75 7C1.75 8.03835 2.05791 9.05338 2.63478 9.91674C3.21166 10.7801 4.0316 11.453 4.99091 11.8504C5.95022 12.2477 7.00582 12.3517 8.02422 12.1491C9.04262 11.9466 9.97808 11.4465 10.7123 10.7123C11.4465 9.97808 11.9466 9.04262 12.1491 8.02422C12.3517 7.00582 12.2477 5.95022 11.8504 4.99091C11.453 4.0316 10.7801 3.21166 9.91674 2.63478C9.05338 2.05791 8.03835 1.75 7 1.75C5.53231 1.75552 4.12357 2.32821 3.06833 3.34833L1.75 4.66667M1.75 4.66667V1.75M1.75 4.66667H4.66667"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ResetButton: React.FC<Props> = ({
  label = "Reset",
  state = "default",
  onClick,
  className = "",
  ariaLabel,
}) => {
  const isDisabled = state === "disabled" || state === "loading";
  const isActive = state === "active";
  const isLoading = state === "loading";

  return (
    <button
      type="button"
      className={[
        "rb-btn",
        isActive ? "rb-is-active" : "",
        isDisabled ? "rb-is-disabled" : "",
        isLoading ? "rb-is-loading" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={isDisabled ? undefined : onClick}
      disabled={isDisabled}
      aria-label={ariaLabel ?? label}
      aria-pressed={isActive}
    >
      <span className="rb-iconWrap" aria-hidden="true">
        {isLoading ? <span className="rb-spinner" /> : <ResetIcon className="rb-icon" />}
      </span>
      <span className="rb-text">{label}</span>
    </button>
  );
};

export default ResetButton;
