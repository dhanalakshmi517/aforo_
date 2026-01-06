// UploadField.tsx
import * as React from "react";
import "./UploadField.css";

type Props = {
  value?: File | null;
  placeholder?: string; // "Upload file..."
  buttonText?: string; // "Upload"
  accept?: string;
  disabled?: boolean;
  onChange?: (file: File | null) => void;
  className?: string;
};

export default function UploadField({
  value = null,
  placeholder = "Upload file...",
  buttonText = "Upload",
  accept,
  disabled = false,
  onChange,
  className = "",
}: Props) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const openPicker = () => {
    if (disabled) return;
    inputRef.current?.click();
  };

  const onPick: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files?.[0] ?? null;
    onChange?.(f);

    // allow picking same file again
    e.currentTarget.value = "";
  };

  return (
    <div className={`ufWrap ${disabled ? "ufWrap--disabled" : ""} ${className}`}>
      <input
        ref={inputRef}
        className="ufInputHidden"
        type="file"
        accept={accept}
        disabled={disabled}
        onChange={onPick}
      />

      <div className={`ufLeftText ${value ? "ufLeftText--filled" : ""}`}>
        {value ? value.name : placeholder}
      </div>

      <button
        type="button"
        className="ufBtn"
        onClick={openPicker}
        disabled={disabled}
      >
        <span className="ufBtnIcon" aria-hidden="true">
          <PlusIcon />
        </span>
        <span className="ufBtnText">{buttonText}</span>
      </button>
    </div>
  );
}

function PlusIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 20 20"
      fill="none"
    >
      <path
        d="M10 4.1665V15.8332M4.16675 9.99984H15.8334"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
