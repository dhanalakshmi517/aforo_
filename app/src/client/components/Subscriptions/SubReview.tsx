import React from 'react';
import './SubReview.css';

interface SubReviewProps {
  customerName: string;
  productName: string;
  ratePlan: string;
  paymentMethod: string;
  adminNotes: string;
  subscriptionId?: number | null;
}

const SubReview: React.FC<SubReviewProps> = ({
  customerName,
  productName,
  ratePlan,
  paymentMethod,
  adminNotes,
  subscriptionId,
}) => {

  return (
    <div className="sub-review-container">
      <table className="sub-review-table">
        <h4 className="sub-review-title">SUBSCRIPTION DETAILS</h4>
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
            <td>{adminNotes || '-'}</td>
          </tr>
          {subscriptionId && (
            <tr>
              <td>Subscription ID</td>
              <td>{subscriptionId}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SubReview;
