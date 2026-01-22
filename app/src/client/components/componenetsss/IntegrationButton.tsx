import React from "react";
import "./IntegrationButton.css";

type IntegrationButtonProps = {
  onClick?: () => void;
  title?: string;
};

const IntegrationButton: React.FC<IntegrationButtonProps> = ({
  onClick,
  title = "Integration",
}) => {
  return (
    <button
      className="integration-button"
      onClick={onClick}
      aria-label={title}
      type="button"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        className="integration-button-icon"
      >
        <g clipPath="url(#clip0_16751_29946)">
          <path
            d="M8.33341 18.3337L8.33341 5.83366C8.33341 5.61264 8.24562 5.40068 8.08934 5.2444C7.93306 5.08812 7.72109 5.00033 7.50008 5.00033H3.33341C2.89139 5.00033 2.46746 5.17592 2.1549 5.48848C1.84234 5.80104 1.66675 6.22496 1.66675 6.66699L1.66675 16.667C1.66675 17.109 1.84234 17.5329 2.1549 17.8455C2.46746 18.1581 2.89139 18.3337 3.33341 18.3337H13.3334C13.7754 18.3337 14.1994 18.1581 14.5119 17.8455C14.8245 17.5329 15.0001 17.109 15.0001 16.667V12.5003C15.0001 12.2793 14.9123 12.0674 14.756 11.9111C14.5997 11.7548 14.3878 11.667 14.1667 11.667L1.66675 11.667M12.5001 1.66699L17.5001 1.66699C17.9603 1.66699 18.3334 2.04009 18.3334 2.50033V7.50033C18.3334 7.96056 17.9603 8.33366 17.5001 8.33366L12.5001 8.33366C12.0398 8.33366 11.6667 7.96056 11.6667 7.50033V2.50033C11.6667 2.04009 12.0398 1.66699 12.5001 1.66699Z"
            stroke="#F9FBFD"
            strokeWidth="1.66667"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
        <defs>
          <clipPath id="clip0_16751_29946">
            <rect width="20" height="20" fill="white" />
          </clipPath>
        </defs>
      </svg>
    </button>
  );
};

export default IntegrationButton;
