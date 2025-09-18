import React, { useRef, useEffect } from "react";
import "./SaveDraft.css";

interface SaveDraftProps {
  isOpen: boolean;
  onClose: () => void;   // close without action (overlay/X)
  onSave: () => void;    // "Yes, Save as Draft"
  onDelete: () => void;  // "No, Delete"
}

const SaveDraft: React.FC<SaveDraftProps> = ({ isOpen, onClose, onSave, onDelete }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Always declare hooks in the same order; guard inside the effect.
  useEffect(() => {
    if (!isOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  // Overlay click closes if you click outside the modal
  const handleOverlayMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  // After hooks: conditionally render content
  if (!isOpen) return null;

  return (
    <div className="save-modal-overlay" onMouseDown={handleOverlayMouseDown}>
      <div
        className="save-modal"
        ref={modalRef}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* X close */}
        <button className="save-modal-close" aria-label="Close" onClick={onClose}>
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M11 1L1 11M1 1L11 11" stroke="#373B40" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <p className="save-modal-title">Do you want to save this plan as a draft?</p>
        <p className="save-modal-text">
          If you go back now, your progress will be lost. Save it as a draft to continue later.
        </p>

        <div className="save-modal-buttons">
          <button className="save-modal-btn save-modal-btn-cancel" onClick={onDelete}>
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
