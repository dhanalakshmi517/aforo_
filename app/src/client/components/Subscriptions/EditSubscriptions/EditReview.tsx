import React from 'react';
import './EditReview.css';
import ReviewComponent, { ReviewRow } from '../../componenetsss/ReviewComponent';

interface EditReviewProps {
  customerName: string;
  productName: string;
  ratePlanName: string;
  paymentType: string;
  onBack: () => void;
  onConfirm: () => void;
  confirmLabel?: string;
  confirmLoading?: boolean;
}

const EditReview: React.FC<EditReviewProps> = ({
  customerName,
  productName,
  ratePlanName,
  paymentType,
  onBack,
  onConfirm,
  confirmLabel = 'Save Draft',
  confirmLoading = false,
}) => {
  const subscriptionRows: ReviewRow[] = [
    { label: 'Customer', value: customerName },
    { label: 'Product', value: productName },
    { label: 'Rate Plan', value: ratePlanName },
    { label: 'Payment Type', value: paymentType },
  ];

  return (
    <div className="edit-review-container">
      <ReviewComponent 
        title="SUBSCRIPTION DETAILS"
        rows={subscriptionRows}
      />
      
      {/* <div className="edit-review-actions">
        <button 
          className="edit-review-btn edit-review-btn--secondary"
          onClick={onBack}
          disabled={confirmLoading}
        >
          Back
        </button>
        <button 
          className="edit-review-btn edit-review-btn--primary"
          onClick={onConfirm}
          disabled={confirmLoading}
        >
          {confirmLoading ? 'Saving...' : confirmLabel}
        </button>
      </div> */}
    </div>
  );
};

export default EditReview;
