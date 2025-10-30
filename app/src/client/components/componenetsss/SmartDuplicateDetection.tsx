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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            className="info-icon"
          >
            <path
              d="M8.93343 12.2663V8.93294M8.93343 5.59961H8.94176M17.2668 8.93294C17.2668 13.5353 13.5358 17.2663 8.93343 17.2663C4.33106 17.2663 0.600098 13.5353 0.600098 8.93294C0.600098 4.33057 4.33106 0.599609 8.93343 0.599609C13.5358 0.599609 17.2668 4.33057 17.2668 8.93294Z"
              stroke="#373B40"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
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
