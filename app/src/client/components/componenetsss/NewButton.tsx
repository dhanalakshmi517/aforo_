import React from "react";
import "./NewButton.css";

type NewButtonProps = {
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  ariaLabel?: string;
};

const NewButton: React.FC<NewButtonProps> = ({
  disabled = false,
  onClick,
  ariaLabel = "Add",
}) => {
  return (
    <button
      type="button"
      className="newbtn"
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        className="newbtn__icon"
        aria-hidden="true"
      >
        <path
          d="M4.16602 9.99996H15.8327M9.99935 4.16663V15.8333"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
};

export default NewButton;
