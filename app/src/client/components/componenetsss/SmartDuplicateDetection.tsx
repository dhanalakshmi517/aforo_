import React from 'react';
import { Checkbox } from './Checkbox';
import './SmartDuplicateDetection.css';

interface SmartDuplicateDetectionProps {
  onClose?: () => void;
  onCheckboxChange?: (checked: boolean) => void;
  checked?: boolean;
}

const SmartDuplicateDetection: React.FC<SmartDuplicateDetectionProps> = ({
  onClose,
  onCheckboxChange,
  checked = false,
}) => {
  return (
    <div className="info-box">
      <div className="info-header">
        <div className="info-title">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
  <g clip-path="url(#clip0_15971_29362)">
    <path d="M10.0001 13.3337V10.0003M10.0001 6.66699H10.0084M18.3334 10.0003C18.3334 14.6027 14.6025 18.3337 10.0001 18.3337C5.39771 18.3337 1.66675 14.6027 1.66675 10.0003C1.66675 5.39795 5.39771 1.66699 10.0001 1.66699C14.6025 1.66699 18.3334 5.39795 18.3334 10.0003Z" stroke="#034A7D" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
  <defs>
    <clipPath id="clip0_15971_29362">
      <rect width="20" height="20" fill="white"/>
    </clipPath>
  </defs>
</svg>
          <span>Smart duplicate detection</span>
        </div>
        <button className="close-btn" onClick={onClose}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
  <path d="M15 5L5 15M5 5L15 15" stroke="#373B40" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
        </button>
      </div>

      <p className="info-text">
        Don’t worry about re-uploads. If an Usage Event already exists, we’ll detect it automatically
        and process it only once.
      </p>

      <div className="checkbox-section">
        <label className="checkbox-label">
          <Checkbox
            checked={checked}
            onChange={(checked) => onCheckboxChange?.(checked)}
            size={16}
          />
          <span>Don't show this again</span>
        </label>
      </div>
    </div>
  );
};

export default SmartDuplicateDetection;
