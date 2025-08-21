import React from 'react';
import styles from './Tabs.module.css';
import TabStatusBar from './TabStatusBar';

interface TabsProps {
  step: number;
  setStep: (step: number) => void;
  progress: Record<string, number>;
  tabs: string[];
}

const Tabs: React.FC<TabsProps> = ({
  tabs,
  step,
  setStep,
  progress,
}) => {
  return (
    <div className={styles.tabsContainer}>
      {tabs.map((label, index) => (
        <div key={label} className="d-flex align-items-center">
          <TabStatusBar 
            progress={progress[['general', 'metadata', 'config', 'review'][index]] || 0} 
            step={index}
            totalSteps={tabs.length}
          />
          <button
            className={`${styles.tabButton} ${step === index ? styles.active : ''}`}
            onClick={() => setStep(index)}
            disabled={step < index}
          >
            {label}
          </button>
          {index < tabs.length - 1 && (
            <div className={styles.tabIndicator}>
              <i className="bi bi-chevron-right"></i>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Tabs;
