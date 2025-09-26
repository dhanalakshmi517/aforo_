import * as React from 'react';
import './kongpopup.css';

type Props = {
  isOpen: boolean;
  onClose: () => void;                 // close (X), ESC, overlay
  onKeep?: () => void;                 // "Keep Selecting"
  onLeave?: () => void;                // "Leave Page"
  title?: string;
  message?: string;
  keepLabel?: string;
  leaveLabel?: string;
  dismissOnOverlay?: boolean;          // default true
};

export default function KongPopup({
  isOpen,
  onClose,
  onKeep,
  onLeave,
  title = 'Are You Sure Want to Leave This Page?',
  message = "Your selected products won't be imported if you leave now.",
  keepLabel = 'Keep Selecting',
  leaveLabel = 'Leave Page',
  dismissOnOverlay = true,
}: Props) {
  const dialogRef = React.useRef<HTMLDivElement>(null);
  const keepBtnRef = React.useRef<HTMLButtonElement>(null);

  // lock scroll + focus on open
  React.useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // focus first action
    const t = setTimeout(() => keepBtnRef.current?.focus(), 0);

    // ESC to close
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') {
        // simple focus trap
        const root = dialogRef.current;
        if (!root) return;
        const focusables = root.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          last.focus();
          e.preventDefault();
        } else if (!e.shiftKey && document.activeElement === last) {
          first.focus();
          e.preventDefault();
        }
      }
    };
    document.addEventListener('keydown', onKey);

    return () => {
      document.body.style.overflow = prevOverflow;
      clearTimeout(t);
      document.removeEventListener('keydown', onKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="kongpop-overlay"
      role="presentation"
      onMouseDown={(e) => {
        if (!dismissOnOverlay) return;
        // only close if click outside the dialog
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className="kongpop"
        role="dialog"
        aria-modal="true"
        aria-labelledby="kongpop-title"
        aria-describedby="kongpop-desc"
      >
        {/* Close (X) */}
        <button className="kongpop-x" aria-label="Close" onClick={onClose}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6L18 18" stroke="#46505A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <h3 id="kongpop-title" className="kongpop-title">{title}</h3>
        <p id="kongpop-desc" className="kongpop-sub">
          {message}
        </p>

        <div className="kongpop-actions">
          <button
            ref={keepBtnRef}
            className="kp-btn kp-btn--keep"
            onClick={onKeep ?? onClose}
            type="button"
          >
            {keepLabel}
          </button>
          <button
            className="kp-btn kp-btn--leave"
            onClick={onLeave ?? onClose}
            type="button"
          >
            {leaveLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
