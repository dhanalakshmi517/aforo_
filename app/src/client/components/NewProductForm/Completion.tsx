import React from 'react';
import styles from './Completion.module.css';

interface CompletionProps {
  onSubmit: () => void;
  onClose: () => void;
}

const Completion: React.FC<CompletionProps> = ({ onSubmit, onClose }) => {
  return (
    <div className={styles.container}>
      <h3>Review and Submit</h3>
      <div className={styles.reviewSection}>
        <p>Please review your product details before submitting.</p>
      </div>
      <div className={styles.buttonGroup}>
        <button onClick={onClose} className={styles.buttonSecondary}>Cancel</button>
        <button onClick={onSubmit} className={styles.buttonPrimary}>Submit</button>
      </div>
    </div>
  );
};

export default Completion;
