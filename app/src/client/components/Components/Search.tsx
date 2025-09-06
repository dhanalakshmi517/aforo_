import React, { useState } from "react";
import "./Search.css";

interface SearchProps {
  onSearch: (query: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

const Search: React.FC<SearchProps> = ({ onSearch, disabled = false, placeholder = "Search among your rate plans" }) => {
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);

  const handleClear = () => {
    if (disabled) return;
    setValue("");
    onSearch("");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    setValue(e.target.value);
    onSearch(e.target.value);
  };

  return (
    <div
      className={`search-container ${focused ? "focused" : ""} ${
        value ? "typing" : ""
      } ${disabled ? "disabled" : ""}`}
    >
      {/* Search Icon */}
      <span className="search-icon">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
        >
          <path
            d="M17.5 17.5L13.8833 13.8833M15.8333 9.16667C15.8333 12.8486 12.8486 15.8333 9.16667 15.8333C5.48477 15.8333 2.5 12.8486 2.5 9.16667C2.5 5.48477 5.48477 2.5 9.16667 2.5C12.8486 2.5 15.8333 5.48477 15.8333 9.16667Z"
            stroke="#706C72"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>

      {/* Input */}
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        onFocus={() => !disabled && setFocused(true)}
        onBlur={() => setFocused(false)}
        disabled={disabled}
        className="search-input"
      />

      {/* Clear Button */}
      {value && !disabled && (
        <button className="clear-btn" onClick={handleClear}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
          >
            <path
              d="M11 1L1 11M1 1L11 11"
              stroke="#151312"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

export default Search;
