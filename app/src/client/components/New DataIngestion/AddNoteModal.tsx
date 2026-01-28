import * as React from "react";
import "./AddNoteModal.css";

import SecondaryButton from "../componenetsss/SecondaryButton";
import PrimaryButton from "../componenetsss/PrimaryButton";

type Props = {
  open: boolean;
  fileName: string;

  value: string;
  onChange: (v: string) => void;

  onClose: () => void;

  /** secondary action */
  onApplyToAllFiles: () => void;

  /** primary action */
  onAddNote: () => void;

  isAddDisabled?: boolean;
  isApplyDisabled?: boolean;

  className?: string;
};

export default function AddNoteModal({
  open,
  fileName,
  value,
  onChange,
  onClose,
  onApplyToAllFiles,
  onAddNote,
  isAddDisabled = false,
  isApplyDisabled = false,
  className = "",
}: Props) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="afNoteOverlay" role="dialog" aria-modal="true">
      <div className="afNoteScrim" onMouseDown={onClose} />

      <div className={`afNoteModal ${className}`} onMouseDown={(e) => e.stopPropagation()}>
        <div className="afNoteHeader">
          <div className="afNoteTitle">Add Notes</div>

          <button type="button" className="afNoteClose" aria-label="Close" onClick={onClose}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="afNoteFileName">{fileName}</div>

        <textarea
          className="afNoteTextarea"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder=""
          spellCheck={false}
        />

        <div className="afNoteFooter">
          <SecondaryButton
            type="button"
            onClick={onApplyToAllFiles}
            disabled={isApplyDisabled}
                        className="af-NoteBtnPrimary"

          >
            Apply Note to All Files
          </SecondaryButton>

          <PrimaryButton
            type="button"
            className="af-NoteBtnPrimary"
            onClick={onAddNote}
            disabled={isAddDisabled}
          >
            Add Note
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
