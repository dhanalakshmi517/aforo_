import React from "react";
import "./SaveAsDraftModel.css";

interface SaveAsDraftModalProps {
  isOpen: boolean;
  onSave: () => void;
  onDelete: () => void;
}

const SaveAsDraftModal: React.FC<SaveAsDraftModalProps> = ({
  isOpen,
  onSave,
  onDelete,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2 className="modal-title">Do you want to save this plan as a draft?</h2>
        <p className="modal-text">
          If you go back now, your progress will be lost. Save it as a draft to
          continue later.
        </p>
        <div className="modal-actions">
          <button className="btn btn-delete" onClick={onDelete}>
            No, Delete
          </button>
          <button className="btn btn-save" onClick={onSave}>
            Yes, Save as Draft
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaveAsDraftModal;


