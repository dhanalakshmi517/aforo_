import React from "react";
import "./ProgressBar.css";

interface ProgressBarProps {
  current: number; // uploaded files count
  total: number;   // total files to upload
  timeLeft?: number; // optional seconds left
}

const ProgressBar: React.FC<ProgressBarProps> = ({ current, total, timeLeft }) => {
  const progress = Math.min((current / total) * 100, 100);

  // Determine message based on progress
  const getMessage = () => {
    const percentage = (current / total) * 100;
    
    if (percentage === 100) {
      return `Ingestion complete — all ${total} files succeeded.`;
    } else if (percentage >= 66) {
      return `Processing & importing data… ${current}/${total} processed.`;
    } else if (percentage >= 33) {
      return `Validating structure & content… ${current}/${total} checked.`;
    } else {
      return `Uploading files… ${current}/${total} done.`;
    }
  };

  return (
    <div className="progress-container">
      <p className="prog-status">{getMessage()}</p>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>
      <div className="prog-footer">
        <span>
          {current} / {total} files
        </span>
      </div>
    </div>
  );
};

export default ProgressBar;
