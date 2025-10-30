import React from "react";
import DeleteButton from "./DeleteButton";
import PrimaryButton from "./PrimaryButton";
import "./UnsavedChangesModal.css";

interface UnsavedChangesModalProps {
  onDiscard: () => void;
  onKeepEditing: () => void;
  onClose?: () => void;
}

const UnsavedChangesModal: React.FC<UnsavedChangesModalProps> = ({
  onDiscard,
  onKeepEditing,
  onClose,
}) => {
  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <button className="modal-close-btn" onClick={onClose}>
          ×
        </button>

        <h3 className="modal-title">
          Please complete all required fields before leaving this page.
        </h3>

        <p className="modal-subtext">
          If you go back now, your progress will be discarded. Complete all required fields to keep
          your work.
        </p>

        <div className="modal-actions">
          <DeleteButton 
            onClick={onDiscard}
            label="Discard Changes"
            variant="soft"
            customIcon={<></>}
          />
          <PrimaryButton 
            onClick={onKeepEditing}
          >
            Keep Editing
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
};

export default UnsavedChangesModal;
