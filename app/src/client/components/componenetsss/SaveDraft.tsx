import React from "react";
import "./SaveDraft.css";

interface SaveDraftProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const SaveDraft: React.FC<SaveDraftProps> = ({ isOpen, onClose, onSave }) => {
  if (!isOpen) return null;

  return (
    <div className="save-modal-overlay">
      <div className="save-modal">
        <p className="save-modal-title">Do you want to save this plan as a draft?</p>
        <p className="save-modal-text">
          If you go back now, your progress will be lost. Save it as a draft to
          continue later.
        </p>
        <div className="save-modal-buttons">
          <button className="save-modal-btn save-modal-btn-cancel" onClick={onClose}>
            No, Delete
          </button>
          <button className="save-modal-btn save-modal-btn-save" onClick={onSave}>
            Yes, Save as Draft
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaveDraft;
