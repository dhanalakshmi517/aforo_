import * as React from "react";
import "./Spark.css";
import Tooltip from "./Tooltip";

export type SparkState = "default" | "active" | "disabled";

type Props = {
  state?: SparkState;
  onClick?: () => void;
  ariaLabel?: string;
  className?: string;
};

const Spark: React.FC<Props> = ({
  state = "default",
  onClick,
  ariaLabel = "Spark",
  className = "",
}) => {
  const isDisabled = state === "disabled";
  const isActive = state === "active";

  return (
    <Tooltip content="AI" position="bottom">
      <button
        type="button"
        className={`spark-btn ${isActive ? "is-active" : ""} ${
          isDisabled ? "is-disabled" : ""
        } ${className}`.trim()}
        aria-label={ariaLabel}
        aria-pressed={isActive ? true : undefined}
        disabled={isDisabled}
        onClick={isDisabled ? undefined : onClick}
      >
        <svg
          className={`spark-icon ${
            isDisabled
              ? "spark-icon--disabled"
              : isActive
              ? "spark-icon--active"
              : "spark-icon--default"
          }`}
          xmlns="http://www.w3.org/2000/svg"
          width="17"
          height="17"
          viewBox="0 0 17 17"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M7.43935 1.2871C7.47149 1.11505 7.56278 0.959662 7.69742 0.847839C7.83207 0.736017 8.00158 0.674805 8.1766 0.674805C8.35162 0.674805 8.52113 0.736017 8.65578 0.847839C8.79042 0.959662 8.88172 1.11505 8.91385 1.2871L9.7021 5.4556C9.75808 5.75196 9.90211 6.02456 10.1154 6.23783C10.3286 6.45109 10.6012 6.59512 10.8976 6.6511L15.0661 7.43935C15.2381 7.47149 15.3935 7.56278 15.5054 7.69742C15.6172 7.83207 15.6784 8.00158 15.6784 8.1766C15.6784 8.35162 15.6172 8.52113 15.5054 8.65578C15.3935 8.79042 15.2381 8.88172 15.0661 8.91385L10.8976 9.7021C10.6012 9.75808 10.3286 9.90211 10.1154 10.1154C9.90211 10.3286 9.75808 10.6012 9.7021 10.8976L8.91385 15.0661C8.88172 15.2381 8.79042 15.3935 8.65578 15.5054C8.52113 15.6172 8.35162 15.6784 8.1766 15.6784C8.00158 15.6784 7.83207 15.6172 7.69742 15.5054C7.56278 15.3935 7.47149 15.2381 7.43935 15.0661L6.6511 10.8976C6.59512 10.6012 6.45109 10.3286 6.23783 10.1154C6.02456 9.90211 5.75196 9.75808 5.4556 9.7021L1.2871 8.91385C1.11505 8.88172 0.959662 8.79042 0.847839 8.65578C0.736017 8.52113 0.674805 8.35162 0.674805 8.1766C0.674805 8.00158 0.736017 7.83207 0.847839 7.69742C0.959662 7.56278 1.11505 7.47149 1.2871 7.43935L5.4556 6.6511C5.75196 6.59512 6.02456 6.45109 6.23783 6.23783C6.45109 6.02456 6.59512 5.75196 6.6511 5.4556L7.43935 1.2871Z"
            strokeWidth="1.35"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </Tooltip>
  );
}

export default Spark;
