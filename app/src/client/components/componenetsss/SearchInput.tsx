import React, { useState } from "react";
import "./SearchInput.css";

interface SearchInputProps {
  placeholder?: string;
  disabled?: boolean;
  value?: string;
  onChange?: (value: string) => void;
}

const SearchInput: React.FC<SearchInputProps> = ({
  placeholder = "Search",
  disabled = false,
  value = "",
  onChange,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isHover, setIsHover] = useState(false);

  return (
    <div
      className={`search-input-container 
        ${isFocused ? "focused" : ""} 
        ${isHover ? "hover" : ""} 
        ${disabled ? "disabled" : ""}`}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
    >
      <span className="search-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M17.5 17.5L13.8833 13.8833M15.8333 9.16667C15.8333 12.8486 12.8486 15.8333 9.16667 15.8333C5.48477 15.8333 2.5 12.8486 2.5 9.16667C2.5 5.48477 5.48477 2.5 9.16667 2.5C12.8486 2.5 15.8333 5.48477 15.8333 9.16667Z" 
            stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>

      <input
        type="text"
        disabled={disabled}
        value={value}
        placeholder={placeholder}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onChange={(e) => onChange && onChange(e.target.value)}
        className="search-input"
      />
    </div>
  );
};

export default SearchInput;
