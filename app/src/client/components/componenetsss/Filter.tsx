import * as React from "react";
import "./Filter.css";
import Tooltip from "./Tooltip";

export type FilterState = "default" | "active" | "disabled";

type Props = {
  state?: FilterState;
  onClick?: () => void;
  ariaLabel?: string;
  className?: string;
  buttonRef?: React.RefObject<HTMLButtonElement | null>;
};

const Filter: React.FC<Props> = ({
  state = "default",
  onClick,
  ariaLabel = "Filter",
  className = "",
  buttonRef,
}) => {
  const isDisabled = state === "disabled";
  const isActive = state === "active";

  return (
    <Tooltip content="Filters" position="bottom">
      <button
        ref={buttonRef as React.LegacyRef<HTMLButtonElement>}
        type="button"
        className={`filter-btn ${isActive ? "is-active" : ""} ${
          isDisabled ? "is-disabled" : ""
        } ${className}`.trim()}
        aria-label={ariaLabel}
        aria-pressed={isActive ? true : undefined}
        disabled={isDisabled}
        onClick={isDisabled ? undefined : onClick}
      >
        <svg
          className={`filter-icon ${
            isDisabled ? "filter-icon--disabled" : isActive ? "filter-icon--active" : "filter-icon--default"
          }`}
          xmlns="http://www.w3.org/2000/svg"
          width="15"
          height="11"
          viewBox="0 0 15 11"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M0.675049 0.675049H14.175M3.67505 5.17505H11.175M5.92505 9.67505H8.92505"
            strokeWidth="1.35"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </Tooltip>
  );
}

export default Filter;
