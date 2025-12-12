import React, { useEffect, useRef, useState } from "react";
import SecondaryButton from "./SecondaryButton";
import "./NoteModal.css";

// File icon component
const FileIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="15" viewBox="0 0 12 15" fill="none">
  <path d="M7.29789 1.11865V3.71124C7.29789 4.05504 7.43446 4.38476 7.67756 4.62786C7.92067 4.87097 8.25039 5.00754 8.59418 5.00754H11.1868M4.7053 5.65569H3.409M8.59418 8.24828H3.409M8.59418 10.8409H3.409M7.94604 1.11865H2.1127C1.7689 1.11865 1.43919 1.25523 1.19608 1.49833C0.95298 1.74143 0.816406 2.07115 0.816406 2.41495V12.7853C0.816406 13.1291 0.95298 13.4588 1.19608 13.7019C1.43919 13.945 1.7689 14.0816 2.1127 14.0816H9.89048C10.2343 14.0816 10.564 13.945 10.8071 13.7019C11.0502 13.4588 11.1868 13.1291 11.1868 12.7853V4.35939L7.94604 1.11865Z" stroke="#00365A" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
</svg>
);

// Plus icon component
const PlusIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 2.5V9.5M2.5 6H9.5" stroke="#0B5FA4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export type NoteModalProps = {
  open: boolean;
  fileName: string;
  initialValue: string;
  onClose: () => void;
  onSave: (value: string) => void;
  onSaveAll: (value: string) => void;
  totalFiles: number;
};

const NoteModal: React.FC<NoteModalProps> = ({
  open,
  fileName,
  initialValue,
  onClose,
  onSave,
  onSaveAll,
  totalFiles,
}) => {
  const [value, setValue] = useState(initialValue);
  const [appliedToAll, setAppliedToAll] = useState(false);
  const [isApplyingAll, setIsApplyingAll] = useState(false);
  const textRef = useRef<HTMLTextAreaElement>(null);

  const hasMultipleFiles = totalFiles > 1;

  useEffect(() => {
    setValue(initialValue);
    setAppliedToAll(false);
    setIsApplyingAll(false);
  }, [initialValue, open]);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // autofocus
  useEffect(() => {
    if (open) setTimeout(() => textRef.current?.focus(), 0);
  }, [open]);

  if (!open) return null;

  return (
    <div className="di-modal-backdrop" role="presentation" onMouseDown={onClose}>
      <div
        className="di-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="notesDialogTitle"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <header className="di-modal-header">
          <div className="di-modal-title-wrap">
            <div className="di-modal-file-icon">
              <FileIcon />
            </div>
            <div>
              <h3 className="di-modal-title" id="notesDialogTitle">File Name</h3>
              <p className="di-modal-filename" title={fileName}>{fileName}</p>
            </div>
          </div>
          <button 
            className="di-modal-x" 
            aria-label="Close" 
            onClick={onClose}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
  <path d="M15 5L5 15M5 5L15 15" stroke="#75797E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
</svg>
          </button>
        </header>

        <div className="di-modal-body">
  <textarea
    ref={textRef}
    className="di-notes-textarea"
    placeholder="Write a short note about this file…"
    value={value}
    onChange={(e) => setValue(e.target.value)}
    rows={5}
  />
  <div className="di-notes-footer-row">
    <SecondaryButton
      onClick={() => {
        if (!hasMultipleFiles || appliedToAll || isApplyingAll) return;
        // start loading state immediately
        setIsApplyingAll(true);
        onSaveAll(value);

        // after a short delay, show success tick + text
        setTimeout(() => {
          setIsApplyingAll(false);
          setAppliedToAll(true);
        }, 1500);

        // Auto-close the modal a few seconds after apply-all click
        setTimeout(() => {
          onClose();
        }, 5000);
      }}
      disabled={!hasMultipleFiles || appliedToAll || isApplyingAll}
      className={(isApplyingAll || appliedToAll) ? "di-notes-applyall-success" : ""}
    >
      {isApplyingAll ? (
        <>
          <span className="di-notes-success-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle
                cx="7"
                cy="7"
                r="5"
                fill="none"
                stroke="#389315"
                strokeWidth="1.5"
                strokeOpacity="0.25"
              />
              <path
                d="M12 7A5 5 0 0 0 7 2"
                fill="none"
                stroke="#389315"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span className="di-notes-success-text">Applying note to all files…</span>
        </>
      ) : appliedToAll ? (
        <>
          <span className="di-notes-success-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="10" viewBox="0 0 13 10" fill="none">
              <path d="M11.6667 1L4.33333 8.33333L1 5" stroke="#389315" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
          <span className="di-notes-success-text">Added note to all files</span>
        </>
      ) : (
        <>
          <PlusIcon />
          <span>Add same note to all files</span>
        </>
      )}
    </SecondaryButton>
    <label className="di-notes-checkbox">
      <input
        type="checkbox"
        checked
        onClick={() => {
          // Apply note to this single file when the checkbox is pressed
          onSave(value);
        }}
      />
    </label>
  </div>
</div>

      </div>
    </div>
  );
};

export default NoteModal;
