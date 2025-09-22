import React from "react";
import "./EditPopUp.css";

interface EditPopupProps {
  isOpen: boolean;
  onClose: () => void; // invoked by Cancel button
  onSave: () => void;
  onDismiss?: () => void; // invoked by X icon (optional)
}

const EditPopup: React.FC<EditPopupProps> = ({ isOpen, onClose, onSave, onDismiss }) => {
  const handleDismiss = onDismiss ?? onClose;
  if (!isOpen) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-container">
        <button className="popup-close" onClick={handleDismiss} aria-label="Close popup">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
          >
            <path
              d="M11 1L1 11M1 1L11 11"
              stroke="#373B40"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <h3 className="popup-title">Do you want to save changes?</h3>
        <p className="popup-message">
          If you go back now, your progress will be lost. Save these changes to
          continue.
        </p>
        <div className="popup-actions">
          <button className="pop-btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="pop-btn-save" onClick={onSave}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditPopup;
