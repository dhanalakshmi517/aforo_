
import * as React from "react";
import "./BackArrowButton.css";

type Size = "sm" | "md";

type Props = {
  onClick?: () => void;
  ariaLabel?: string;
  disabled?: boolean;
  isLoading?: boolean;
  size?: Size;
  className?: string;
};

const BackArrowButton: React.FC<Props> = ({
  onClick,
  ariaLabel = "Back",
  disabled = false,
  isLoading = false,
  size = "sm",
  className = "",
}) => {
  const isDisabled = disabled || isLoading;

  return (
    <button
      type="button"
      className={[
        "backArrowBtn",
        `backArrowBtn--${size}`,
        isLoading ? "is-loading" : "",
        isDisabled ? "is-disabled" : "",
        className,
      ]
        .join(" ")
        .trim()}
      onClick={isDisabled ? undefined : onClick}
      aria-label={ariaLabel}
      aria-disabled={isDisabled}
      disabled={isDisabled}
    >
      {isLoading ? (
        <span className="backArrowBtn__spinner" aria-hidden="true" />
      ) : (
        <svg
          className="backArrowBtn__icon"
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M10.0003 15.8332L4.16699 9.99984M4.16699 9.99984L10.0003 4.1665M4.16699 9.99984H15.8337"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
};

export default BackArrowButton;
