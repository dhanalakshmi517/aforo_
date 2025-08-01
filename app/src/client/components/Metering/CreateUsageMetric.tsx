import React, { useState } from 'react';
<<<<<<< HEAD
import UsageConditionForm from './UsageConditionForm';

import BillableReview from './BillableReview';
=======
import UsageConditionForm from './UsageUsageConditionForm';
import Billing from './Billing';
import Lifecycle from './LifeCycle';
import Review from './Review';
>>>>>>> main

interface CreateUsageMetricProps {
    onClose: () => void;
}
<<<<<<< HEAD
import './UsageMetric.css';

const steps = [
    {
        title: 'Define Metric & Aggregation',
        desc: 'Give your metric a name, set its unit, and connect it to the product or event source it will measure.'
    },
    {
        title: 'Usage Conditions',
        desc: 'Define how usage is calculated — set thresholds, group data, and apply any rules needed for billing.'
    },
    // {
    //     title: 'Billing & Aggregation',
    //     desc: 'Choose how to count usage, apply thresholds, and group data for billing.'
    // },
    // {
    //     title: 'Lifecycle & Advanced Settings',
    //     desc: 'Control when the metric is active, enable dry runs, and set processing preferences.'
    // },
    {
        title: 'Review & Confirm',
        desc: 'Review your setup to make sure everything is correct before saving the metric.'
=======
import './Usagemetric.css';

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
>>>>>>> main
    }
];

const CreateUsageMetric: React.FC<CreateUsageMetricProps> = ({ onClose }) => {
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
            // optional: close the drawer/wizard when at the first step
            onClose();
        }
    };
    // Helper to render form markup per step
    const renderStepContent = () => {
        switch (currentStep) {
            case 0:
                return (
<<<<<<< HEAD
                    <>
=======
                    <> 
>>>>>>> main
                        <div className="create-form">
                            <label>Metric Name</label>
                            <input type="text" placeholder="Placeholder" />
                        </div>
                        <div className="create-form">
<<<<<<< HEAD
                            <label>Link to Product</label>
                            <input type="text" placeholder="Placeholder" />
                        </div>
                        <div className="create-form">
                            <label>Version</label>
                            <input type="text" placeholder="Placeholder" />
                        </div>
                        <div className="create-form">
=======
>>>>>>> main
                            <label>Description</label>
                            <textarea placeholder="Placeholder Placeholder Placeholder" />
                        </div>
                        <div className="form-row">
                            <div className="create-form">
                                <label>Unit of Measure</label>
                                <select>
                                    <option>--select--</option>
                                </select>
                            </div>
                            <div className="create-form">
<<<<<<< HEAD
                                <label>Aggregation Function</label>
=======
                                <label>Transaction Format (extractor)</label>
>>>>>>> main
                                <select>
                                    <option>--select--</option>
                                    <option>API</option>
                                    <option>LLM</option>
                                    <option>Others</option>
                                </select>
                            </div>
                        </div>
<<<<<<< HEAD
                        {/* <div className="create-form">
                            <label>Data Source / Event Type</label>
                            <input type="text" placeholder="e.g. api_call, item_request" />
                        </div> */}
=======
                        <div className="create-form">
                            <label>Data Source / Event Type</label>
                            <input type="text" placeholder="e.g. api_call, item_request" />
                        </div>
>>>>>>> main
                    </>
                );
            case 1:
                return <UsageConditionForm />;
<<<<<<< HEAD
            // case 2:
            //     return <Billing />;
            // case 3:
            //     return <Lifecycle />;
            case 2:
                return (
                    <BillableReview
                        metricName=""
                        description=""
                        linkProduct=""
                        unit=""
                        aggregationType=""
=======
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
>>>>>>> main
                    />
                );
            default:
                return <p>Coming soon...</p>;
        }
    };

    return (
        <div className="create-usage-metric">
<<<<<<< HEAD
            <div className="top-actionss">
                <h3 className="top-titles">Create New Usage Metric</h3>
=======
            <div className="top-actions">
        <h3 className="top-title">Create New Usage Metric</h3>
>>>>>>> main
                <button className="btn cancel" onClick={() => setShowCancelModal(true)}>Cancel</button>
                <button className="btn save-draft">Save as Draft</button>
            </div>
            <div className="usage-metric-wrapper">
                <aside className="sidebars">
                    {steps.map((step, index) => (
<<<<<<< HEAD
                        <div key={index} className={`met-step ${index === currentStep ? 'active' : ''}`} onClick={() => setCurrentStep(index)}>
=======
                        <div key={index} className={`step-item ${index === currentStep ? 'active' : ''}`} onClick={() => setCurrentStep(index)}>
>>>>>>> main
                            <div className="icon-wrappers">
                                {index < currentStep ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                        <circle cx="12" cy="12" r="11.5" fill="var(--color-primary-800)" stroke="var(--color-primary-800)" />
                                        <path d="M7 12l3 3 6-6" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                        <circle cx="12" cy="12" r="11.5" stroke="#D6D5D7" />
                                        <circle cx="12" cy="12" r="6" fill="#D6D5D7" />
                                    </svg>
                                )}
                                {index < steps.length - 1 && (
<<<<<<< HEAD
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="2"
                                        height="138"
                                        viewBox="0 0 2 140"
                                        fill="none"
                                    >
                                        <path
                                            d="M1 128.8L1 1.8"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            style={{ stroke: index < currentStep ? 'var(--color-primary-800)' : '#BDBBBE' }}
                                        />
                                    </svg>
                                )}

=======
                                    <svg className={`connector step-${index}`} xmlns="http://www.w3.org/2000/svg" width="2" viewBox="0 0 2 111" fill="none">
                                        <path d="M1 110L1 1" stroke={index < currentStep ? 'var(--color-primary-800)' : '#D6D5D7'} strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                )}
>>>>>>> main
                            </div>
                            <div className="step-text">
                                <span className="step-title">{step.title}</span>
                                <span className="step-desc">{step.desc}</span>
                            </div>
                        </div>
                    ))}
                </aside>

                <div className="form-section">
                    <div className="form-card">
                        {renderStepContent()}
                    </div>
                    <div className="button-group">
<<<<<<< HEAD
                        <button className="btn back" onClick={handleBack} disabled={currentStep === 0}>Back</button>
                        <button className="btn save-next" onClick={handleNext} disabled={currentStep === steps.length - 1}>Save & Next</button>
                    </div>

                </div>

=======
                    <button className="btn back" onClick={handleBack} disabled={currentStep === 0}>Back</button>
                     <button className="btn save-next" onClick={handleNext} disabled={currentStep === steps.length - 1}>Save & Next</button>
                </div>

                </div>
               
>>>>>>> main
            </div>
            {showCancelModal && (
                <div className="delete-modal-overlay">
                    <div className="delete-modal-content">
                        <div className="delete-modal-body">
                            <h5>Are you sure you want to discard<br /> this metric?</h5>
                            <p>Your progress will not be saved.</p>
                        </div>
                        <div className="delete-modal-footer">
                            <button className="delete-modal-cancel" onClick={() => setShowCancelModal(false)}>Back</button>
                            <button className="delete-modal-confirm" onClick={onClose}>Confirm</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
<<<<<<< HEAD
    );
=======
     );
>>>>>>> main
};

export default CreateUsageMetric;
