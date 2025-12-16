import * as React from "react";
import "./SearchInput.css";

export type SearchState = "default" | "hover" | "focus" | "typing" | "filled" | "disabled";

type Props = {
  state?: SearchState;
  value?: string;
  placeholder?: string;
  onChange?: (v: string) => void;
  onClear?: () => void;
  className?: string;
};

const SearchIcon = ({ tone }: { tone: "muted" | "dark" | "disabled" }) => (
  <svg
    className={`si-icon si-icon--${tone}`}
    xmlns="http://www.w3.org/2000/svg"
    width="17"
    height="17"
    viewBox="0 0 17 17"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M15.75 15.75L12.1333 12.1333M14.0833 7.41667C14.0833 11.0986 11.0986 14.0833 7.41667 14.0833C3.73477 14.0833 0.75 11.0986 0.75 7.41667C0.75 3.73477 3.73477 0.75 7.41667 0.75C11.0986 0.75 14.0833 3.73477 14.0833 7.41667Z"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ClearIcon = ({ tone }: { tone: "dark" | "disabled" }) => (
 <svg xmlns="http://www.w3.org/2000/svg"
     className={`si-clear si-clear--${tone}`}
 width="10" height="10" viewBox="0 0 10 10" fill="none">
  <path d="M8.75 0.75L0.75 8.75M0.75 0.75L8.75 8.75" stroke="#19222D" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
);

const SearchInput: React.FC<Props> = ({
  state = "default",
  value,
  placeholder = "Search",
  onChange,
  onClear,
  className = "",
}) => {
  const isDisabled = state === "disabled";

  const derivedValue =
    value !== undefined ? value : state === "filled" ? "Raghal" : "";

  const iconTone: "muted" | "dark" | "disabled" =
    isDisabled ? "disabled" : state === "default" ? "muted" : "dark";

  return (
    <div
      className={[
        "si",
        `si--${state}`,
        isDisabled ? "si--disabled" : "",
        className,
      ].join(" ")}
    >
      <SearchIcon tone={iconTone} />

      <input
        className="si-input"
        value={derivedValue}
        placeholder={placeholder}
        disabled={isDisabled}
        onChange={(e) => onChange?.(e.target.value)}
      />
    </div>
  );
};

export default SearchInput;
