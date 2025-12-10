import React from "react";
import "./SaveDraft.css";

interface SaveDraftProps {
  isOpen: boolean;
  onClose: () => void; // Fallback if onDelete not provided
  onSave: () => void;
  onDelete?: () => void; // Optional explicit delete handler
  onDismiss?: () => void; // Just close popup without any action
  disabled?: boolean; // Disable buttons when no fields are filled
}

const SaveDraft: React.FC<SaveDraftProps> = ({ isOpen, onClose, onSave, onDelete, onDismiss, disabled = false }) => {
  if (!isOpen) return null;

  return (
    <div className="save-modal-overlay">
      <div className="save-modal">
        <button className="save-modal-close" onClick={onDismiss || onClose}>
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M11 1L1 11M1 1L11 11" stroke="#373B40" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <p className="save-modal-title">Do you want to save this plan as a draft?</p>
        <p className="save-modal-text">
          If you go back now, your progress will be lost. Save it as a draft to
          continue later.
        </p>
        <div className="save-modal-buttons">
          <button
            className="save-modal-btn save-modal-btn-cancel"
            onClick={onDelete || onClose}
            disabled={disabled}
          >
            Delete
          </button>
          <button
            className="save-modal-btn save-modal-btn-save"
            onClick={onSave}
            disabled={disabled}
          >
            Save as Draft
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaveDraft;
