import React, { useState } from "react";
import "./CustomerForm.css";
import AccountDetailsForm from "./AccountDetailsForm";

interface Props {
  onClose: () => void;
}

const CustomerForm: React.FC<Props> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState<number>(0);

  const renderFormStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <>
            <h3>CUSTOMER DETAILS</h3>
            <form>
              <div className="form-column">
                <div className="form-group">
                  <label htmlFor="customerName">Customer Name</label>
                  <input id="customerName" type="text" placeholder="Enter name" />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email ID</label>
                  <input id="email" type="email" placeholder="Enter email" />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input id="phone" type="tel" placeholder="Enter phone number" />
                </div>

                <div className="form-group">
                  <label htmlFor="address1">Billing Address Line 1</label>
                  <input id="address1" type="text" placeholder="Address Line 1" />
                </div>

                <div className="form-group">
                  <label htmlFor="address2">Billing Address Line 2</label>
                  <input id="address2" type="text" placeholder="Address Line 2" />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="city">City</label>
                  <input id="city" type="text" placeholder="City" />
                </div>

                <div className="form-group">
                  <label htmlFor="postal">Postal Code</label>
                  <input id="postal" type="text" placeholder="Postal Code" />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="state">State</label>
                <select id="state">
                  <option value="">Select state</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="country">Country</label>
                <select id="country">
                  <option value="">Select country</option>
                </select>
              </div>

              <div className="form-buttons">
                <button type="button" className="back-btn-outline" onClick={onClose}>
                  Back
                </button>
                <button type="button" className="next-btn" onClick={() => setCurrentStep(1)}>
                  Save &amp; Next
                </button>
              </div>
            </form>
          </>
        );
      case 1:
        return <AccountDetailsForm />;
      case 2:
        return (
          <div>
            <h3>REVIEW &amp; CONFIRM</h3>
            <p>Summary and review of entered data will appear here.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="customer-form-wrapper">
      <div className="form-header">
        <h2>Create New Customer</h2>
        <div className="form-actions">
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button className="draft-btn">Save as Draft</button>
        </div>
      </div>

      <div className="form-body">
        <div className="form-sidebar">
          <ul className="stepper">
            <li className={currentStep === 0 ? "active" : ""} onClick={() => setCurrentStep(0)}>
              <span className="step-index">1</span>
              <span>Customer Details</span>
            </li>
            <li className={currentStep === 1 ? "active" : ""} onClick={() => setCurrentStep(1)}>
              <span className="step-index">2</span>
              <span>Account Details</span>
            </li>
            <li className={currentStep === 2 ? "active" : ""} onClick={() => setCurrentStep(2)}>
              <span className="step-index">3</span>
              <span>Review &amp; Confirm</span>
            </li>
          </ul>
        </div>

        <div className="form-main">{renderFormStep()}</div>
      </div>
    </div>
  );
};

export default CustomerForm;
