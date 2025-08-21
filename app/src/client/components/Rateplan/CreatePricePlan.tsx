import React, { useState, useEffect } from 'react';

import Billable from './Billable';
import Pricing, { PricingHandle } from './Pricing';
import Extras from './Extras';
import Review from './Review';
import { fetchProducts, Product, createRatePlan, RatePlanRequest, confirmRatePlan } from './api';

interface CreatePricePlanProps {
    onClose: () => void;
}

import './CreatePricePlan.css';
import { InputField, TextareaField, SelectField } from '../Components/InputFields';

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
    const pricingRef = React.useRef<PricingHandle>(null);
    const [planName, setPlanName] = useState<string>("");
    const [planDescription, setPlanDescription] = useState<string>("");
    const [billingFrequency, setBillingFrequency] = useState<string>("");
    const [selectedProductName, setSelectedProductName] = useState<string>("");
    const [paymentMethod, setPaymentMethod] = useState<string>("");
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedMetricId, setSelectedMetricId] = useState<number | null>(null);
    const [ratePlanId, setRatePlanId] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [productError, setProductError] = useState("");

    useEffect(() => {
        const getProducts = async () => {
            try {
                const data = await fetchProducts();
                setProducts(data as Product[]);
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

    // Validate required fields for step 0 (Plan Details)
    const validateStep0 = (): boolean => {
        if (!planName.trim()) { alert('Rate Plan Name is required'); return false; }
        if (!planDescription.trim()) { alert('Rate Plan Description is required'); return false; }
        if (!billingFrequency) { alert('Billing Frequency is required'); return false; }
        if (!selectedProductName) { alert('Product selection is required'); return false; }
        if (!paymentMethod) { alert('Payment Method is required'); return false; }
        return true;
    };
    const [showCancelModal, setShowCancelModal] = useState(false);

    const handleNext = async () => {
        // On Review & Confirm step, just confirm the rate plan
        if (currentStep === steps.length - 1) {
            if (!ratePlanId) { alert('Rate plan ID missing'); return; }
            try {
                setSaving(true);
                await confirmRatePlan(ratePlanId);
                console.log('Rate plan confirmed');
                onClose();
            } catch (err) {
                console.error('Failed to confirm rate plan', err);
                alert('Failed to confirm rate plan');
            } finally {
                setSaving(false);
            }
            return;
        }
        if (currentStep < steps.length - 1) {
            // Validate step 0 fields before proceeding
            if (currentStep === 0 && !validateStep0()) {
                return; // stay on the same step if validation fails
            }
            // When leaving Pricing step, attempt to save pricing
            if (currentStep === 2) {
                if (pricingRef.current) {
                    setSaving(true);
                    const ok = await pricingRef.current.save();
                    setSaving(false);
                    if (!ok) return; // stay if failure
                }
            }
            // Trigger save when leaving Billable (step 1) before entering Pricing (step 2)
            if (currentStep === 1) {
                // Ensure all required fields present
                if (selectedMetricId === null) {
                    alert('Please select a billable metric.');
                    return;
                }
                const payload: RatePlanRequest = {
                    // ---- payload constructed ----
                    ratePlanName: planName,
                    productName: selectedProductName,
                    description: planDescription,
                    billingFrequency: billingFrequency as any,
                    paymentType: paymentMethod as any,
                    billableMetricId: selectedMetricId
                };
                try {
                    setSaving(true);
                    console.log('Creating rate plan with payload', payload);
                    const created = await createRatePlan(payload);
                        setRatePlanId(created.ratePlanId);
                } catch (err) {
                    console.error('Failed to create rate plan', err, payload);
                    alert('Failed to create rate plan');
                    setSaving(false);
                    return;
                }
                setSaving(false);
            }
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
                            <InputField
                                label="Rate Plan Name *"
                                placeholder="Placeholder"
                                value={planName}
                                onChange={setPlanName}
                            />
                        </div>
                        <div className="create-form">
                            <TextareaField
                                label="Rate Plan Description *"
                                placeholder="Placeholder Placeholder Placeholder"
                                value={planDescription}
                                onChange={setPlanDescription}
                            />
                            
                        </div>
                        <div className="form-row">
                            <div className="create-form">
                                <SelectField
                                    label="Billing Frequency *"
                                    value={billingFrequency}
                                    onChange={setBillingFrequency}
                                    options={[
                                        { label: 'Monthly', value: 'MONTHLY' },
                                        { label: 'Yearly', value: 'YEARLY' },
                                        {label:'daily',value:'DAILY'},
                                        {label:'hourly',value:'HOURLY'},
                                        {label:'weekly',value:'WEEKLY'}



                                    ]}
                                />
                            </div>
                            <div className="create-form">
                                <SelectField
                                    label="Select Product *"
                                    value={selectedProductName}
                                    onChange={setSelectedProductName}
                                    options={[
                                        { label: '--select--', value: '' },
                                        { label: productError, value: '' },
                                        ...products.map((prod) => ({ label: prod.productName, value: prod.productName }))
                                    ]}
                                />
                            </div>
                            <div className="create-form">
                                <SelectField
                                    label="Payment Method *"
                                    value={paymentMethod}
                                    onChange={setPaymentMethod}
                                    options={[
                                        { label: 'Post-Paid', value: 'POSTPAID' },
                                        { label: 'Pre-Paid', value: 'PREPAID' }
                                    ]}
                                />
                            </div>
                        </div>
                       
                    </>
                );
            case 1:
                return <Billable productName={selectedProductName} selectedMetricId={selectedMetricId} onSelectMetric={setSelectedMetricId} />;
            case 2:
                return <Pricing ref={pricingRef} ratePlanId={ratePlanId} />;
            case 3:
                return <Extras ratePlanId={ratePlanId} noUpperLimit={false} />;
            case 4:
                const planDetails = {
                    name: planName,
                    description: planDescription,
                    frequency: billingFrequency,
                    product: selectedProductName,
                    paymentMethod
                };
                return (
                    <Review planDetails={planDetails} />
                );
            default:
                return <p>Coming soon...</p>;
            

            
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
                        <button className="btn save-next" onClick={handleNext} disabled={saving}>Save & Next</button>
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
