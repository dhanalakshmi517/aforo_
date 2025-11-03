import React, { useMemo, useRef, useState } from 'react';
import './LogoUploader.css';

interface LogoUploaderProps {
  /** selected file (null if none) */
  logo: File | null;
  /** preview URL from server or an object URL */
  logoUrl: string | null;
  /** fires with a new file or null when removing */
  onChange: (file: File | null) => void;
  /** optional hooks if parent wants to react */
  onEdit?: () => void;
  onRemove?: () => void;
}

const isTruthyUrl = (v: unknown): v is string =>
  typeof v === 'string' && v.trim() !== '' && v !== 'null' && v !== 'undefined';

const LogoUploader: React.FC<LogoUploaderProps> = ({
  logo,
  logoUrl,
  onChange,
  onEdit,
  onRemove,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [imgError, setImgError] = useState(false);

  const openPicker = () => inputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    console.log('LogoUploader: File selected:', file);
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file.');
      return;
    }
    setImgError(false);          // reset any previous image error
    console.log('LogoUploader: Calling onChange with file:', file);
    onChange(file);
    onEdit?.();
  };

  // Treat only a valid non-empty URL (and not errored) as “has image”
  const validUrl = isTruthyUrl(logoUrl) ? logoUrl : null;
  const hasImage = !!logo || (!!validUrl && !imgError);
  
  console.log('LogoUploader render:', { logo, logoUrl, validUrl, hasImage, imgError });

  const previewSrc = useMemo(() => {
    if (logo) return URL.createObjectURL(logo);
    return validUrl ?? '';
  }, [logo, validUrl]);

  // ─────────── ADD STATE ───────────
  if (!hasImage) {
    return (
      <div
        className="logo-uploader is-add-state"
        onClick={openPicker}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && openPicker()}
        role="button"
        tabIndex={0}
      >
        <div className="logo-avatar-placeholder" aria-hidden="true">
          {/* 56px avatar placeholder; scaled by CSS */}
          <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="0.525" y="0.525" width="54.95" height="54.95" rx="27.475" fill="#F8F7FA" />
            <rect x="0.525" y="0.525" width="54.95" height="54.95" rx="27.475" stroke="#BFBECE" strokeWidth="1.05" />
            <path d="M28 25.2C31.866 25.2 35 22.379 35 18.8996C35 15.4202 31.866 12.5996 28 12.5996C24.134 12.5996 21 15.4202 21 18.8996C21 22.379 24.134 25.2 28 25.2Z" stroke="#909599" strokeWidth="2.1" />
            <path d="M28 43.4C34.1856 43.4 39.2 40.5794 39.2 37.1C39.2 33.6206 34.1856 30.8 28 30.8C21.8144 30.8 16.8 33.6206 16.8 37.1C16.8 40.5794 21.8144 43.4 28 43.4Z" stroke="#909599" strokeWidth="2.1" />
          </svg>
        </div>

        <span className="logo-placeholder-text">Upload Company Logo</span>

        <button
          type="button"
          className="logo-add-btn"
          onClick={(e) => { e.stopPropagation(); openPicker(); }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2.917 7h8.167M7 2.917v8.167" stroke="#025A94" strokeWidth="0.88" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Add
        </button>

        {/* hide native input defensively */}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          aria-hidden="true"
          tabIndex={-1}
          onChange={handleFileChange}
        />
      </div>
    );
  }

  // ─────────── PREVIEW STATE ───────────
  return (
    <div className="logo-uploader is-preview-state" onClick={openPicker} role="button" tabIndex={0}>
      <img
        src={previewSrc}
        alt="Company logo"
        className="logo-preview"
        onError={() => setImgError(true)}   // if broken -> next render falls back to Add state
      />

      <div className="logo-action-buttons" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="logo-edit-btn" onClick={openPicker}>
          Edit
        </button>
        <button
          type="button"
          className="logo-remove-btn"
          onClick={() => { onChange(null); onRemove?.(); setImgError(false); }}
        >
          Remove
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        aria-hidden="true"
        tabIndex={-1}
        onChange={handleFileChange}
      />
    </div>
  );
};

export default LogoUploader;
