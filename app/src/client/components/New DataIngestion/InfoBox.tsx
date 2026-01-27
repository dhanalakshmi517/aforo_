import * as React from "react";
import "./InfoBox.css";
import Checkbox from "../componenetsss/Checkbox";

type Props = {
  /** Unique key used for "Don't show again" persistence */
  storageKey: string;

  title: string;
  message: string;

  /** Default: true */
  defaultOpen?: boolean;

  /** Called when user closes the box (X) */
  onClose?: () => void;

  /** If you want to control visibility yourself */
  isOpen?: boolean;

  className?: string;
};

function safeGet(key: string) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, val: string) {
  try {
    window.localStorage.setItem(key, val);
  } catch {
    // ignore
  }
}

export default function InfoBox({
  storageKey,
  title,
  message,
  defaultOpen = true,
  onClose,
  isOpen,
  className = "",
}: Props) {
  const [internalOpen, setInternalOpen] = React.useState<boolean>(() => {
    const dismissed = safeGet(storageKey) === "dismissed";
    return defaultOpen && !dismissed;
  });

  const [dontShow, setDontShow] = React.useState<boolean>(() => {
    return safeGet(storageKey) === "dismissed";
  });

  const open = typeof isOpen === "boolean" ? isOpen : internalOpen;

  const handleClose = () => {
    if (dontShow) safeSet(storageKey, "dismissed");
    setInternalOpen(false);
    onClose?.();
  };

  const onToggle = (v: boolean) => {
    setDontShow(v);
    if (v) safeSet(storageKey, "dismissed");
    else safeSet(storageKey, "shown");
  };

  if (!open) return null;

  return (
    <div className={`afInfoBox ${className}`} role="note" aria-label={title}>
      <div className="afInfoBoxTop">
        <div className="afInfoBoxTitle">{title}</div>

        <button
          type="button"
          className="afInfoBoxClose"
          aria-label="Close"
          onClick={handleClose}
        >
         <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
  <path d="M14 6L6 14M6 6L14 14" stroke="#25303D" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
        </button>
      </div>

      <div className="afInfoBoxMsg">{message}</div>

      <div className="afInfoBoxCheck">
        <Checkbox
          checked={dontShow}
          onChange={onToggle}
          label="Don't show this again"
        />
      </div>
    </div>
  );
}
