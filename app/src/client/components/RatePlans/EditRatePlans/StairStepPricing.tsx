import React from 'react';
import './StairStepPricing.css';

interface Step {
  from: number;
  to: number;
  price: number;
}

interface StairStepPricingProps {
  steps: Step[];
  onAddStep: () => void;
  onDeleteStep?: (index: number) => void;
  onChange: (index: number, field: keyof Step, value: string) => void;
  noUpperLimit: boolean;
  setNoUpperLimit: (val: boolean) => void;
}

const StairStepPricing: React.FC<StairStepPricingProps> = ({
  steps,
  onAddStep,
  onDeleteStep,
  onChange,
  noUpperLimit,
  setNoUpperLimit
}) => {
  const handleNoUpperLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNoUpperLimit(e.target.checked);
  };

  return (
    <div className="tiered-pricing-container">
      <h5>Stair-Step Pricing</h5>
      <p className="description">
      The consumer pays a flat-single price for all units, determined by the stair they fall into.      </p>

      <div className="tiered-header">
        <span>Usage Range</span>
        <span></span>
        <span>Flat-Stair Cost</span>
        <span></span>
      </div>

      <div className="tiered-pricing-columns">
        {steps.map((step, index) => (
          <div key={index} className="tier-row">
            <div className="tier-inputs">
              <input
                type="number"
                value={step.from}
                onChange={(e) => onChange(index, 'from', e.target.value)}
                placeholder="Start"
                className="tier-input from-input"
              />
              <input
                type="number"
                value={step.to}
                onChange={(e) => onChange(index, 'to', e.target.value)}
                placeholder="End"
                className="tier-input to-input"
                disabled={noUpperLimit && index === steps.length - 1}
              />
              <input
                type="text"
                value={`$${step.price}`}
                onChange={(e) =>
                  onChange(index, 'price', e.target.value.replace('$', ''))
                }
                placeholder="Price"
                className="tier-input price-input wide-margin"
              />
            </div>

            {onDeleteStep && (
              <button
                className="delete-btn"
                onClick={() => onDeleteStep(index)}
                title="Delete step"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path
                    d="M2 4.00016H14M12.6667 4.00016V13.3335C12.6667 14.0002 12 14.6668 11.3333 14.6668H4.66667C4 14.6668 3.33333 14.0002 3.33333 13.3335V4.00016M5.33333 4.00016V2.66683C5.33333 2.00016 6 1.3335 6.66667 1.3335H9.33333C10 1.3335 10.6667 2.00016 10.6667 2.66683V4.00016M6.66667 7.3335V11.3335M9.33333 7.3335V11.3335"
                    stroke="#E34935"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="tier-actions">
        <div className="stair-step-actions">
          <label className="no-upper-limit-checkbox">
            <input
              type="checkbox"
              checked={noUpperLimit}
              onChange={handleNoUpperLimitChange}
            />
            No upper limit for this step
          </label>
          <button onClick={onAddStep} className="add-step-btn">
            + Add Step
          </button>
        </div>
      </div>
    </div>
  );
};

export default StairStepPricing;
