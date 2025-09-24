import React from 'react';
import './EditReview.css';

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
  return (
    <div className="edit-review-container">
      <h4 className="sub-review-title">SUBSCRIPTION DETAILS</h4>
      <table className="sub-review-table">
        <tbody>
          <tr>
            <td>Customer</td>
            <td>{customerName}</td>
          </tr>
          <tr>
            <td>Product</td>
            <td>{productName}</td>
          </tr>
          <tr>
            <td>Rate Plan</td>
            <td>{ratePlanName}</td>
          </tr>
          <tr>
            <td>Payment Type</td>
            <td>{paymentType}</td>
          </tr>
        </tbody>
      </table>
      
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
