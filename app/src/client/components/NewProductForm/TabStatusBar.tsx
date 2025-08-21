import React from 'react';

interface TabStatusBarProps {
  progress: number;
  step: number;
  totalSteps: number;
}

const TabStatusBar: React.FC<TabStatusBarProps> = ({ progress, step, totalSteps }) => {
  const section = ['general', 'metadata', 'config', 'review'][step];
  
  return (
    <div className="tab-status-bar mb-2">
      <div className="progress" style={{ height: '4px' }}>
        <div 
          className={`progress-bar bg-${section}`}
          role="progressbar" 
          style={{ width: `${progress}%` }}
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      <div className="d-flex justify-content-between mt-1 small text-muted">
        <span>{progress === 100 ? 'Complete' : 'In Progress'}</span>
        <span>Step {step + 1} of {totalSteps}</span>
      </div>
    </div>
  );
};

export default TabStatusBar;
