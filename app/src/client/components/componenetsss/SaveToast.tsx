import React from "react";
import "./SaveToast.css";

type SaveToastType = "success" | "error";

interface SaveToastProps {
  type: SaveToastType;
  name: string;              // e.g., "Data Set Prod"
  onClose: () => void;
  className?: string;
}

const ErrorIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 21 21" fill="none" aria-hidden>
    <path d="M11 6.00005V10M11 14H11.01M6.9 18C8.80858 18.9791 11.0041 19.2443 13.0909 18.7478C15.1777 18.2514 17.0186 17.0259 18.2818 15.2922C19.545 13.5586 20.1474 11.4308 19.9806 9.29221C19.8137 7.15366 18.8886 5.14502 17.3718 3.62824C15.855 2.11146 13.8464 1.1863 11.7078 1.01946C9.56929 0.852628 7.44147 1.45509 5.70782 2.71829C3.97417 3.98149 2.74869 5.82236 2.25222 7.90916C1.75575 9.99596 2.02094 12.1915 3 14.1L1 20L6.9 18Z" stroke="#ED5142" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SuccessIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="13" viewBox="0 0 18 13" fill="none" aria-hidden>
    <path d="M17 1L6 12L1 7" stroke="#6AB349" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
    <path d="M9 1L1 9M1 1L9 9" stroke="#373B40" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SaveToast: React.FC<SaveToastProps> = ({ type, name, onClose, className }) => {
  const title = type === "error" ? "Failed to Save Changes" : "Changes Saved";
  const message =
    type === "error"
      ? `We couldn’t save the updates to “${name}”. Please try again.`
      : `The updates to “${name}” have been saved successfully.`;

  return (
    <div
      className={`toast-card ${type === "error" ? "toast-error" : "toast-success"} ${className ?? ""}`}
      role="status"
    >
      <div className="toast-icon">{type === "error" ? <ErrorIcon /> : <SuccessIcon />}</div>

      <div className="toast-body">
        <p className="toast-title">{title}</p>
        <p className="toast-message">{message}</p>
      </div>

      <button className="toast-close" onClick={onClose} aria-label="Dismiss">
        <CloseIcon />
      </button>
    </div>
  );
};

export default SaveToast;
