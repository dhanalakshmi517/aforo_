import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
// import EditBillable from './EditBillable';
 import EditPricing from './EditPricing';
import EditExtras from './EditExtras';
import EditReview from './EditReview';
import './EditRatePlan.css';

const steps = ['Plan Details', 'Pricing Model Setup', 'Extras', 'Review & Confirm'];

interface EditRatePlanProps {
  onClose?: () => void;
}

const EditRatePlan: React.FC<EditRatePlanProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const ratePlanNameFromState = (location.state as { ratePlanName?: string })?.ratePlanName || '';

  const close = () => {
    if (onClose) {
      onClose();
    } else {
      navigate('/get-started/rate-plans');
    }
  };
  const [selectedProductName, setSelectedProductName] = useState<string>('');
  const [currentStep, setCurrentStep] = useState(0);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    } else {
      close();
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <>
            <div className="create-form">
              <label>Rate Plan Name</label>
              <input type="text" placeholder="Placeholder" />
            </div>
            <div className="create-form">
              <label>Rate Plan Description</label>
              <textarea placeholder="Placeholder Placeholder Placeholder" />
            </div>
            <div className="form-row">
              <div className="create-form">
                <label>Billing Frequency</label>
                <select>
                  <option>--select--</option>
                </select>
              </div>
              <div className="create-form">
                <label>Select Product</label>
                <select
                  value={selectedProductName}
                  onChange={(e) =>
                    setSelectedProductName(e.target.options[e.target.selectedIndex].text)
                  }
                >
                  <option value="">--select--</option>
                  <option>Product A</option>
                  <option>Product B</option>
                  <option>Product C</option>
                </select>
              </div>
            </div>
          </>
        );
      // case 1:
      //   return <EditBillable productName={selectedProductName} />;
      case 1:
        return <EditPricing />;
      case 2:
        return <EditExtras noUpperLimit={false} />;
      case 3:
        return <EditReview />;
      default:
        return <p>Coming soon...</p>;
    }
  };

  return (
    <div className="create-price-plan">
      <div className="edit-header">
        <button className="back-btn" onClick={handleBack}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" className="back-arrow">
            <path d="M9.99935 15.8337L4.16602 10.0003M4.16602 10.0003L9.99935 4.16699M4.16602 10.0003H15.8327" stroke="#706C72" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h2>Edit “{ratePlanNameFromState}”</h2>
        <div className="edit-header-actions">
          <button className="btn cancel" onClick={close}>Cancel</button>
          <button className="btn save-draft">Save Draft</button>
        </div>
      </div>
      <div className="edit-usage-metric-wrapper">
        <aside className="edit-sidebars">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`edit-step-item ${index === currentStep ? 'active' : ''}`}
              onClick={() => setCurrentStep(index)}
            >
              <div className="step-text">{step}</div>
            </div>
          ))}
        </aside>

        <div className="edit-form-section">
          <div className="edit-form-card">{renderStepContent()}</div>
          <div className="edit-button-group">
            <button className="btn back" onClick={handleBack} disabled={currentStep === 0}>
              Back
            </button>
            <button
              className="btn save-next"
              onClick={handleNext}
              disabled={currentStep === steps.length - 1}
            >
              Save & Next
            </button>
          </div>
        </div>
      </div>

      {showCancelModal && (
        <div className="delete-modal-overlay">
          <div className="delete-modal-content">
            <div className="delete-modal-body">
              <h5>
                Are you sure you want to discard
                <br /> this metric?
              </h5>
              <p>Your progress will not be saved.</p>
            </div>
            <div className="delete-modal-footer">
              <button className="delete-modal-cancel" onClick={() => setShowCancelModal(false)}>
                Back
              </button>
              <button className="delete-modal-confirm" onClick={close}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditRatePlan;