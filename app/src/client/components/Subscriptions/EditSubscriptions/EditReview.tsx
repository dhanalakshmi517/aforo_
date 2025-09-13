import React from 'react';
// import './SubReview.css'; // You can rename this to EditReview.css if preferred

interface EditReviewProps {
  customerName: string;
  productName: string;
  ratePlan: string;
  paymentMethod: string;
  basePrice: number;
  quantity: number;
}

const EditReview: React.FC<EditReviewProps> = ({
  customerName,
  productName,
  ratePlan,
  paymentMethod,
  basePrice,
  quantity,
}) => {
  const total = basePrice * quantity;

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
        </tbody>
      </table>
      <p className="disclaimer-text">
        You're about to create a new subscription. Please review your entries before proceeding.
      </p>
    </div>
  );
};

export default EditReview;
