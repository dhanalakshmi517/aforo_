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
  /** error message to display */
  error?: string;
  /** callback to set error */
  onError?: (error: string) => void;
}

const isTruthyUrl = (v: unknown): v is string =>
  typeof v === 'string' && v.trim() !== '' && v !== 'null' && v !== 'undefined';

const LogoUploader: React.FC<LogoUploaderProps> = ({
  logo,
  logoUrl,
  onChange,
  onEdit,
  onRemove,
  error,
  onError,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [imgError, setImgError] = useState(false);

  const openPicker = () => {
    // Clear any previous errors when user tries to select a new file
    onError?.('');
    inputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;

    // Validate file format - only png/jpg/jpeg/webp allowed
    const allowedFormats = ['image/png', 'image/jpeg', 'image/webp'];
    const isValidFormat = allowedFormats.includes(file.type);

    if (!isValidFormat) {
      const errorMsg = 'Only image files (png/jpg/jpeg/webp) are allowed.';
      onError?.(errorMsg);
      return;
    }

    // Clear any previous errors
    onError?.('');
    setImgError(false);
    onChange(file);
    onEdit?.();
  };

  // Treat only a valid non-empty URL as "has image" - don't factor in imgError
  // This ensures Edit/Remove buttons remain visible even if image fails to load (CORS)
  const validUrl = isTruthyUrl(logoUrl) ? logoUrl : null;
  const hasImage = !!logo || !!validUrl;



  const previewSrc = useMemo(() => {
    if (logo) return URL.createObjectURL(logo);
    return validUrl ?? '';
  }, [logo, validUrl]);

  // ─────────── ADD STATE ───────────
  if (!hasImage) {
    return (
      <div>
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
        {error && (
          <div style={{ color: '#E34935', fontSize: '12px', marginTop: '8px', fontFamily: 'var(--font-family-primary)' }}>
            {error}
          </div>
        )}
      </div>
    );
  }

  // ─────────── PREVIEW STATE ───────────
  // Use backgroundImage like Customers.tsx - more reliable for blob URLs
  return (
    <div className="logo-uploader is-preview-state" onClick={openPicker} role="button" tabIndex={0}>
      <div
        className="logo-preview-container"
        style={{
          width: '56px',
          height: '56px',
          minWidth: '56px',
          minHeight: '56px',
          borderRadius: '50%',
          overflow: 'hidden',
          flexShrink: 0,
          backgroundColor: '#F8F7FA',
          backgroundImage: previewSrc ? `url(${previewSrc})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
        aria-label="Company logo preview"
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
