import * as React from "react";
import "./SearchInput.css";

export type SearchState =
  | "default"
  | "hover"
  | "focus"
  | "typing"
  | "filled"
  | "disabled";

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
    className={`sif-icon sif-icon--${tone}`}
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

const ClearIcon = ({ onClick }: { onClick: () => void }) => (
  <button
    type="button"
    className="sif-clear"
    onClick={onClick}
    aria-label="Clear search"
  >
   <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 10" fill="none">
  <path d="M8.75 0.75L0.75 8.75M0.75 0.75L8.75 8.75" stroke="#19222D" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
  </button>
);

const SearchInput: React.FC<Props> = ({
  state = "default",
  value = "",
  placeholder = "Search",
  onChange,
  onClear,
  className = "",
}) => {
  const [isFocused, setIsFocused] = React.useState(false);
  const isDisabled = state === "disabled";
  const hasValue = value.length > 0;

  // Use focused state if input is focused, otherwise use provided state
  // But if not focused and has value, use "default" to show black border
  const effectiveState = isFocused ? "focus" : (hasValue && !isFocused) ? "default" : state;

  const iconTone: "muted" | "dark" | "disabled" =
    isDisabled ? "disabled" : effectiveState === "default" ? "muted" : "dark";

  return (
    <div
      className={[
        "sif",
        `sif--${effectiveState}`,
        isDisabled ? "sif--disabled" : "",
        className,
      ].join(" ")}
    >
      <SearchIcon tone={iconTone} />

      <div className="sif-input-wrap">
        <input
          className="sif-input"
          value={value}
          placeholder={placeholder}
          disabled={isDisabled}
          onChange={(e) => onChange?.(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />

        {hasValue && !isDisabled && (
          <ClearIcon
            onClick={() => {
              onChange?.("");
              onClear?.();
            }}
          />
        )}
      </div>
    </div>
  );
};

export default SearchInput;
