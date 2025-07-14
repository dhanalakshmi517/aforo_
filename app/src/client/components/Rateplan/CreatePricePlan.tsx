import React, { useState, useEffect } from 'react';
import BillableMetrics from './BillableMetrics';
import Pricing from './Pricing';
import Extras from './Extras';
// import Review from './Review';
import { fetchProducts } from './api';

interface Product {
    productId: string;
    productName: string;
}

interface CreatePricePlanProps {
    onClose: () => void;
}

import './CreatePricePlan.css';

const steps = [
    {
        title: 'Plan Details',
        desc: 'Define the basic information and structure of your plan.'
    },
    {
        title: 'Select Billable Metric',
        desc: 'Select or define a Billable Metric'
    },
    {
        title: 'Pricing Model Setup',
        desc: 'Configure how pricing will work for this plan.'
    },
    {
        title: 'Extras',
        desc: 'Add optional features or benefits to enhance your plan.'
    },
    {
        title: 'Review & Confirm',
        desc: 'Check and Finalize details.'
    }
];

const CreatePricePlan: React.FC<CreatePricePlanProps> = ({ onClose }) => {
    const [selectedProductName, setSelectedProductName] = useState<string>("");
    const [products, setProducts] = useState<Product[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [productError, setProductError] = useState("");

    useEffect(() => {
        const getProducts = async () => {
            try {
                const data = await fetchProducts();
                setProducts(data);
            } catch (err) {
                console.error(err);
                setProductError("Failed to load products");
            } finally {
                setLoadingProducts(false);
            }
        };
        getProducts();
    }, []);

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
            onClose();
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
                                <select value={selectedProductName} onChange={(e)=>setSelectedProductName(e.target.options[e.target.selectedIndex].text)}>
                                    <option value="">--select--</option>
                                    {loadingProducts && <option>Loading...</option>}
                                    {productError && <option disabled>{productError}</option>}
                                    {products.map((prod) => (
                                        <option key={prod.productId} value={prod.productName}>{prod.productName}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                       
                    </>
                );
            case 1:
                return <BillableMetrics productName={selectedProductName} />;
            case 2:
                return <Pricing />;
            case 3:
                return <Extras noUpperLimit={false} />;
            // case 4:
            //     return (
            //         <Review
            //             metricName="Sample Metric"
            //             description="Sample Description"
            //             linkProduct="Product A"
            //             defineUnit="Units"
            //             defineAggregationType="Sum"
            //         />
    //             );
    //         default:
    //             return <p>Coming soon...</p>;
         }
     };

    return (
        <div className="create-price-plan">
            <div className="usage-metric-wrapper">
                <aside className="sidebars">
                    {steps.map((step, index) => (
                        <div key={index} className={`step-item ${index === currentStep ? 'active' : ''}`} onClick={() => setCurrentStep(index)}>
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
                                    <svg className={`connector step-${index}`} xmlns="http://www.w3.org/2000/svg" width="2" viewBox="0 0 2 111" fill="none">
                                        <path d="M1 110L1 1" stroke={index < currentStep ? 'var(--color-primary-800)' : '#D6D5D7'} strokeWidth="2" strokeLinecap="round" />
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
                    <div className="form-card">
                        {renderStepContent()}
                    </div>
                    <div className="button-group">
                        <button className="btn back" onClick={handleBack} disabled={currentStep === 0}>Back</button>
                        <button className="btn save-next" onClick={handleNext} disabled={currentStep === steps.length - 1}>Save & Next</button>
                    </div>
                </div>
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
    );
};

export default CreatePricePlan;
