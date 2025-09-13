import React, { useRef } from 'react';
import './LogoUploader.css';

interface LogoUploaderProps {
  /** selected file (null if none) */
  logo: File | null;
  logoUrl: string | null; // preview URL (object url or server url)
  onChange: (file: File | null) => void;
  /** if customer already exists supply id so edit/remove can trigger api */
  onEdit?: () => void;
  onRemove?: () => void;
}

const LogoUploader: React.FC<LogoUploaderProps> = ({ logo, logoUrl, onChange, onEdit, onRemove }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSelect = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // basic image type check
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file.');
      return;
    }
    onChange(file);
  };

  if (!logo) {
    // initial add state
    return (
      <div className="logo-uploader" onClick={handleSelect} role="button" tabIndex={0}>
        <div className="logo-avatar-placeholder" aria-hidden="true">
          {/* placeholder svg */}
          <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="0.525" y="0.525" width="54.95" height="54.95" rx="27.475" fill="#F8F7FA" />
            <rect x="0.525" y="0.525" width="54.95" height="54.95" rx="27.475" stroke="#BFBECE" strokeWidth="1.05" />
            <path d="M28 25.2C31.866 25.2 35 22.379 35 18.8996C35 15.4202 31.866 12.5996 28 12.5996C24.134 12.5996 21 15.4202 21 18.8996C21 22.379 24.134 25.2 28 25.2Z" stroke="#909599" strokeWidth="2.1" />
            <path d="M28 43.4C34.1856 43.4 39.2 40.5794 39.2 37.1C39.2 33.6206 34.1856 30.8 28 30.8C21.8144 30.8 16.8 33.6206 16.8 37.1C16.8 40.5794 21.8144 43.4 28 43.4Z" stroke="#909599" strokeWidth="2.1" />
          </svg>
        </div>
        <span className="logo-placeholder-text">Upload Company Logo</span>
        <button type="button" className="logo-add-btn">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2.917 7h8.167M7 2.917v8.167" stroke="#025A94" strokeWidth="0.88" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Add
        </button>
        <input ref={inputRef} type="file" accept="image/*" hidden onChange={handleFileChange} />
      </div>
    );
  }

  // after upload
  return (
    <div className="logo-uploader uploaded">
      <img src={logoUrl || URL.createObjectURL(logo)} alt="Company logo" className="logo-preview" />
      <div className="logo-action-buttons">
        <button type="button" className="logo-edit-btn" onClick={handleSelect}>Edit</button>
        <button type="button" className="logo-remove-btn" onClick={() => { onChange(null); onRemove?.(); }}>Remove</button>
      </div>
      <input ref={inputRef} type="file" accept="image/*" hidden onChange={handleFileChange} />
    </div>
  );
};

export default LogoUploader;
