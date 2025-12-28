import * as React from "react";
import "./DateSortDropdown.css";
import Portal from "./Portal";

export type DateSortValue = "newest" | "oldest";

type Props = {
  value: DateSortValue | null;
  onChange: (v: DateSortValue) => void;
  className?: string;
};

const ArrowDown: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path
      d="M11.8333 6V17.6667M11.8333 17.6667L17.6667 11.8333M11.8333 17.6667L6 11.8333"
      stroke="#25303D"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ArrowUp: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path
      d="M6 11.8333L11.8333 6M11.8333 6L17.6667 11.8333M11.8333 6V17.6667"
      stroke="#25303D"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const DateSortDropdown: React.FC<Props & { anchorTop?: number; anchorLeft?: number }> = ({
  value,
  onChange,
  className = "",
  anchorTop = 0,
  anchorLeft = 0,
}) => {
  return (
    <Portal>
      <div
        className={`ds-root ${className}`.trim()}
        role="menu"
        aria-label="Sort by date"
        style={{
          position: "absolute",
          top: anchorTop,
          left: anchorLeft,
        }}
      >
      <button
        type="button"
        className={`ds-item ${value === "newest" ? "is-selected" : ""}`.trim()}
        role="menuitemradio"
        aria-checked={value === "newest"}
        onClick={() => onChange("newest")}
      >
        <span className="ds-icon" aria-hidden="true">
          <ArrowDown />
        </span>
        <span className="ds-text">Newest first</span>
      </button>

      <button
        type="button"
        className={`ds-item ${value === "oldest" ? "is-selected" : ""}`.trim()}
        role="menuitemradio"
        aria-checked={value === "oldest"}
        onClick={() => onChange("oldest")}
      >
        <span className="ds-icon" aria-hidden="true">
          <ArrowUp />
        </span>
        <span className="ds-text">Oldest first</span>
      </button>
      </div>
    </Portal>
  );
};

export default DateSortDropdown;
