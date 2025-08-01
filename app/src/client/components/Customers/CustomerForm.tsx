import React, { useState } from "react";
import "./CustomerForm.css";
import AccountDetailsForm from "./AccountDetailsForm"; // Make sure path is correct

interface Props {
  onClose: () => void;
}

const CustomerForm: React.FC<Props> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

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
                  Save & Next
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
            <h3>REVIEW & CONFIRM</h3>
            <p>Summary and review of entered data will appear here.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="form-header">
        <button className="back-btn" onClick={onClose}>←</button>
        <h2>Create New Customer</h2>
        <div className="form-actions">
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
          <button className="draft-btn">Save as Draft</button>
        </div>
      </div>

      <div className="form-body">
        <div className="form-sidebar">
          <ul className="stepper">
            <li className={currentStep === 0 ? "active" : ""} onClick={() => setCurrentStep(0)}>
              <div className="step-icon">{/* SVG icon */}
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none">
          <circle cx="12" cy="12" r="11.5" stroke="#D6D5D7"/>
          <circle cx="12" cy="12" r="6" fill="#D6D5D7"/>
        </svg>
        <svg xmlns="http://www.w3.org/2000/svg" width="2" height="86" viewBox="0 0 2 86" fill="none">
  <path d="M1 84.7998L1 1.79981" stroke="#D6D5D7" stroke-width="2" stroke-linecap="round"/>
</svg>
        
        

              </div>
              <div className="step-content">
                <span>Customer Details</span>
                <p>Define the basic information and structure of your plan.</p>
              </div>
            </li>
            <li className={currentStep === 1 ? "active" : ""} onClick={() => setCurrentStep(1)}>
              <div className="step-icons">{/* SVG icon */}
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none">
          <circle cx="12" cy="12" r="11.5" stroke="#D6D5D7"/>
          <circle cx="12" cy="12" r="6" fill="#D6D5D7"/>
        </svg>
        <div className="step-line">

        <svg xmlns="http://www.w3.org/2000/svg" width="2" height="86" viewBox="0 0 2 86" fill="none">
  <path d="M1 84.7998L1 1.79981" stroke="#D6D5D7" stroke-width="2" stroke-linecap="round"/>
</svg>
</div>

              </div>
              <div className="step-content">
                <span className="sample">Account Details</span>
                <p>Add optional features or benefits to enhance your plan.</p>
              </div>
            </li>
            <li className={currentStep === 2 ? "active" : ""} onClick={() => setCurrentStep(2)}>
              <div className="step-ics">{/* SVG icon */}
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none">
          <circle cx="12" cy="12" r="11.5" stroke="#D6D5D7"/>
          <circle cx="12" cy="12" r="6" fill="#D6D5D7"/>
          <div className="step-line">

<svg xmlns="http://www.w3.org/2000/svg" width="2" height="86" viewBox="0 0 2 86" fill="none">
<path d="M1 84.7998L1 1.79981" stroke="#D6D5D7" stroke-width="2" stroke-linecap="round"/>
</svg>
</div>
        </svg>

              </div>
              <div className="step-content">
                <span className="samples">Review & Confirm</span>
                <p>Check and finalize details.</p>
              </div>
            </li>
          </ul>
        </div>

        <div className="form-main">
          {renderFormStep()}
        </div>
      </div>
    </div>
  );
};

export default CustomerForm;
