import React, { useState } from 'react';
import UsageConditionForm from './UsageConditionForm';
import Billing from './Billing';
import Lifecycle from './LifeCycle';
import Review from './Review';

interface EditMetricsProps {
  onClose: () => void;
}

import './EditMetrics.css';

const steps = [
  {
    title: 'Define Metric',
    desc: 'Give your metric a name, format, and connect it to a data source.'
  },
  {
    title: 'Filter Usage Conditions',
    desc: 'Set rules to include only the events you want to measure.'
  },
  {
    title: 'Billing & Aggregation',
    desc: 'Choose how to count usage, apply thresholds, and group data for billing.'
  },
  {
    title: 'Lifecycle & Advanced Settings',
    desc: 'Control when the metric is active, enable dry runs, and set processing preferences.'
  },
  {
    title: 'Review & Confirm',
    desc: 'Double-check your configuration before saving the metric.'
  }
];

const EditMetrics: React.FC<EditMetricsProps> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <>
            <div className="form-group">
              <label>Metric Name</label>
              <input type="text" placeholder="Placeholder" />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea placeholder="Placeholder Placeholder Placeholder" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Unit of Measure</label>
                <select>
                  <option>--select--</option>
                </select>
              </div>
              <div className="form-group">
                <label>Transaction Format (extractor)</label>
                <select>
                  <option>--select--</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Data Source / Event Type</label>
              <input type="text" placeholder="e.g. api_call, item_request" />
            </div>
          </>
        );
      case 1:
        return <UsageConditionForm />;
      case 2:
        return <Billing />;
      case 3:
        return <Lifecycle />;
      case 4:
        return (
          <Review
            metricName="Sample Metric"
            description="Sample Description"
            linkProduct="Product A"
            defineUnit="Units"
            defineAggregationType="Sum"
          />
        );
      default:
        return <p>Coming soon...</p>;
    }
  };

  return (
    <div className="create-usage-metric">
      <div className="top-actions">
        <h3 className="top-title">Edit Usage Metric</h3>
        <button className="btn cancel" onClick={onClose}>Cancel</button>
        <button className="btn save-draft">Save as Draft</button>
      </div>
      <div className="usage-metric-wrapper">
        <aside className="sidebars">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`step-item ${index === currentStep ? 'active' : ''}`}
              onClick={() => setCurrentStep(index)}
            >
              <div className="icon-wrapper">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="11.5" stroke="#D6D5D7" />
                  <circle cx="12" cy="12" r="6" fill="#D6D5D7" />
                </svg>
                {index < steps.length - 1 && (
                  <svg width="2" height="85" viewBox="0 0 2 85" fill="none">
                    <path d="M1 84L1 1" stroke="#D6D5D7" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                )}
              </div>
              <div className="step-text">
                <span className="step-title">{step.title}</span>
                <span className="step-desc">{step.desc}</span>
              </div>
            </div>
          ))}
        </aside>

        <div className="form-section">
          <div className="form-card">{renderStepContent()}</div>
          <div className="button-group">
            <button
              className="btn back"
              onClick={() => {
                if (currentStep > 0) setCurrentStep(currentStep - 1);
                else onClose();
              }}
            >
              Back
            </button>
            <button
              className="btn save-next"
              onClick={() => {
                if (currentStep < steps.length - 1) {
                  setCurrentStep(currentStep + 1);
                }
              }}
            >
              Save & Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditMetrics;
