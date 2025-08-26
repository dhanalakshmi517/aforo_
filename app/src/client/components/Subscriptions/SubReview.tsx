import React from 'react';
import './SubReview.css';

interface SubReviewProps {
  customerName: string;
  productName: string;
  ratePlan: string;
  paymentMethod: string;
  adminNotes: string;
}

const SubReview: React.FC<SubReviewProps> = ({
  customerName,
  productName,
  ratePlan,
  paymentMethod,
  adminNotes,
}) => {

  return (
    <div className="review-container">
      <h4 className="review-title">SUBSCRIPTION DETAILS</h4>
      <table className="review-table">
        <tbody>
          <tr>
            <td>Customer Name</td>
            <td>{customerName}</td>
          </tr>
          <tr>
            <td>Product</td>
            <td>{productName}</td>
          </tr>
          <tr>
            <td>Rate Plan</td>
            <td>{ratePlan}</td>
          </tr>
          <tr>
            <td>Payment Method</td>
            <td>{paymentMethod}</td>
          </tr>
          <tr>
            <td>Admin Notes</td>
            <td>{adminNotes}</td>
          </tr>
        </tbody>
      </table>
      <p className="disclaimer-text">
        You're about to create a new subscription. Please review your entries before proceeding.
      </p>
    </div>
  );
};

export default SubReview;
