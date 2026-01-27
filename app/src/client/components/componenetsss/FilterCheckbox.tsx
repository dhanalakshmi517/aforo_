import * as React from "react";
import "./FilterCheckbox.css";

type FilterCheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
};

const FilterCheckbox: React.FC<FilterCheckboxProps> = ({
  checked,
  onChange,
  disabled = false,
  className = "",
}) => {
  return (
    <label
      className={[
        "filter-checkbox",
        checked ? "is-checked" : "",
        disabled ? "is-disabled" : "",
        className,
      ].join(" ")}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />

      <span className="checkbox-icon">
        {checked ? <CheckedIcon /> : <DefaultIcon />}
      </span>
    </label>
  );
};

export default FilterCheckbox;

/* ---------- SVGs ---------- */

const DefaultIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path
      d="M4 12C4 8.22876 4 6.34314 5.17158 5.17158C6.34314 4 8.22876 4 12 4C15.7712 4 17.6569 4 18.8284 5.17158C20 6.34314 20 8.22876 20 12C20 15.7712 20 17.6569 18.8284 18.8284C17.6569 20 15.7712 20 12 20C8.22876 20 6.34314 20 5.17158 18.8284C4 17.6569 4 15.7712 4 12Z"
      stroke="#A6B9C9"
      strokeWidth="1.2"
    />
  </svg>
);

const CheckedIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M8 16C4.22876 16 2.34314 16 1.17158 14.8284C0 13.6569 0 11.7712 0 8C0 4.22876 0 2.34314 1.17158 1.17158C2.34314 0 4.22876 0 8 0C11.7712 0 13.6569 0 14.8284 1.17158C16 2.34314 16 4.22876 16 8C16 11.7712 16 13.6569 14.8284 14.8284C13.6569 16 11.7712 16 8 16ZM11.2242 5.57574C11.4586 5.81005 11.4586 6.18995 11.2242 6.42424L7.22424 10.4242C6.98992 10.6586 6.61008 10.6586 6.37574 10.4242L4.77574 8.82424C4.54142 8.58992 4.54142 8.21008 4.77574 7.97576C5.01005 7.74144 5.38995 7.74144 5.62426 7.97576L6.8 9.15144L10.3758 5.57574C10.6101 5.34142 10.9899 5.34142 11.2242 5.57574Z"
      fill="#F2F9FD"
    />
  </svg>
);
