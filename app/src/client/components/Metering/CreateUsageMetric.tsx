import React, { useState, useEffect } from 'react';
import { getProducts, Product, createBillableMetric, BillableMetricPayload } from './api';
import UsageConditionForm from './UsageConditionForm';
import AggregationFunctionSelect from './AggregationFunctionSelect';
import AggregationWindowSelect from './AggregationWindowSelect';
import './Usagemetric.css';
import { InputField, TextareaField, SelectField } from '../Components/InputFields';
import Review from './Review';

interface CreateUsageMetricProps {
    onClose: () => void;
}

const steps = [
    {
        title: 'Define Metric & Aggregation',
        desc: 'Give your metric a name, set its unit, and connect it to the product or event source it will measure.'
    },
    {
        title: 'Usage Conditions',
        desc: 'Define how usage is calculated — set thresholds, group data, and apply any rules needed for billing.'
    },
    {
        title: 'Review & Confirm',
        desc: 'Review your setup to make sure everything is correct before saving the metric.'
    }
];

const CreateUsageMetric: React.FC<CreateUsageMetricProps> = ({ onClose }) => {
    // form states
    const [metricName, setMetricName] = useState('');
    const [version, setVersion] = useState('');
    const [unitOfMeasure, setUnitOfMeasure] = useState('');
    const [description, setDescription] = useState('');
    const [aggregationFunction, setAggregationFunction] = useState('');
    const [aggregationWindow, setAggregationWindow] = useState('');
    const [usageConditions, setUsageConditions] = useState<{ dimension: string; operator: string; value: string; }[]>([]);
    const [billingCriteria, setBillingCriteria] = useState('');
    const [currentStep, setCurrentStep] = useState(0);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedProductId, setSelectedProductId] = useState<string>('');
    const [selectedProductName, setSelectedProductName] = useState<string>('');
    const [selectedProductType, setSelectedProductType] = useState<string>('');

    // Fetch products once on mount
    useEffect(() => {
        getProducts()
            .then(setProducts)
            .catch((err: unknown) => console.error('Failed to load products', err));
    }, []);

    const handleNext = async () => {
        // If we're on the Review step and user clicks Save, ensure all required fields are filled then POST metric
        if (currentStep === 2) {
            if (!metricName.trim() || !selectedProductId || !unitOfMeasure) {
                alert('Please fill Metric Name, Product and Unit of Measure');
                return;
            }
            const basePayload: Partial<import('./api').BillableMetricPayload> = {
                metricName,
                productId: Number(selectedProductId),
                version,
                unitOfMeasure,
                description,
                aggregationFunction,
                aggregationWindow,
                billingCriteria,
                usageConditions,
            };
            // remove empty string/undefined or empty array fields
            const payload: import('./api').BillableMetricPayload = Object.fromEntries(
                Object.entries(basePayload).filter(([_, v]) => {
                    if (v === undefined || v === '') return false;
                    if (Array.isArray(v)) return v.length > 0;
                    return true;
                })
            ) as any;
            console.log('Billable Metric payload:', payload);
            const { createBillableMetric, finalizeBillableMetric } = await import('./api');
            const result = await createBillableMetric(payload);
            if (!result.ok) {
                alert('Failed to create metric');
                return;
            }
            // If metricId returned, attempt to finalize
            if (result.id !== undefined) {
                const finalized = await finalizeBillableMetric(result.id);
                if (!finalized) {
                    alert('Metric created but failed to finalize');
                }
            }
            onClose();
            return;
        }

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

    /* --- helper: save current form as draft --- */
    const handleSaveDraft = async () => {
        const cleanConditions = usageConditions.filter(c => c.dimension && c.operator && c.value);

        const base: Partial<BillableMetricPayload> = { 
            metricName,
            productId: selectedProductId ? Number(selectedProductId) : undefined,
            version,
            unitOfMeasure,
            description,
            aggregationFunction,
            aggregationWindow,
            usageConditions: cleanConditions,
        };
        if (billingCriteria) (base as any).billingCriteria = billingCriteria;

        const filtered: any = {};
        Object.entries(base).forEach(([k,v])=>{
            if (v !== '' && v !== undefined && !(Array.isArray(v)&&v.length===0)) filtered[k]=v;
        });
        const payload = filtered as BillableMetricPayload;
        try {
            console.log('POST payload draft', payload);
        const result = await createBillableMetric(payload);
            if (!result.ok) throw new Error('Failed');
            alert('Draft saved');
            onClose();
        } catch (e) {
            console.error(e);
            alert('Failed to save draft');
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 0:
                return (
                    <>
                        <div className="form-row">
                            <div className="forms-groups">
                                <InputField
                                    label="Metric Name"
                                    placeholder="Metric"
                                    value={metricName}
                                    onChange={setMetricName}
                                />
                            </div>
                            <div className="forms-groups">
                                <SelectField
                                    label="Product Name"
                                    placeholder="Select Product"
                                    value={selectedProductId}
                                    onChange={(val)=>{
                                        setSelectedProductId(val);
                                        const prod = products.find(p => String(p.productId) === val);
                                        setSelectedProductName(prod ? prod.productName : '');
                                        setSelectedProductType(prod ? prod.productType : '');
                                        setUnitOfMeasure('');
                                    }}
                                    options={products.map(p => ({ label: p.productName, value: String(p.productId) }))}
                                />
                            </div>
                            <div className="forms-groups">
                                <InputField
                                    label="Version (optional)"
                                    placeholder="Version"
                                    value={version}
                                    onChange={setVersion}
                                />
                            </div>
                            <div className="forms-groups">
                                <TextareaField
                                    label="Description"
                                    placeholder="Enter description"
                                    value={description}
                                    onChange={setDescription}
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="forms-groups">  
                                <label>Unit of Measure</label>
                                {(() => {
                                    const optionsMap: Record<string, string[]> = {
                                        API: ['API_CALL', 'REQUEST', 'TRANSACTION', 'HIT'],
                                        FLATFILE: ['FILE', 'ROW', 'RECORD','DELIVERY','MB'],
                                        SQLRESULT: ['CELL','MB','ROW','QUERY_EXECUTION'],
                                        LLMTOKEN: ['TOKEN', 'PROMPT_TOKEN', 'COMPLETION_TOKEN'],
                                    };
                                    const key = selectedProductType?.toUpperCase();
                                    const opts = optionsMap[key] || null;
                                    if (opts) {
                                        return (
                                            <SelectField
                                                placeholder="Select Unit"
                                                value={unitOfMeasure}
                                                onChange={setUnitOfMeasure}
                                                options={opts.map(o => ({ label: o, value: o }))}
                                            />
                                        );
                                    }
                                    return (
                                        <InputField
                                            placeholder="Unit"
                                            value={unitOfMeasure}
                                            onChange={setUnitOfMeasure}
                                        />
                                    );
                                })()}
                            </div>
                            <div className="forms-groups">
                                <label>Aggregation Function</label>
                                <AggregationFunctionSelect productType={selectedProductType} unitOfMeasure={unitOfMeasure} value={aggregationFunction} onChange={setAggregationFunction} />
                            </div>
                            <div className="forms-groups">
                                <label>Aggregation Window</label>
                                <AggregationWindowSelect productType={selectedProductType} unitOfMeasure={unitOfMeasure} value={aggregationWindow} onChange={setAggregationWindow} />
                            </div>
                        </div>
                    </>
                );
            case 1:
                return <UsageConditionForm productType={selectedProductType} unitOfMeasure={unitOfMeasure} conditions={usageConditions} setConditions={setUsageConditions} billingCriteria={billingCriteria} onBillingCriteriaChange={setBillingCriteria} />;
            case 2:
                return (
                    <Review
                        metricName={metricName}
                        productName={selectedProductName}
                        description={description}
                        version={version}
                        unitOfMeasure={unitOfMeasure}
                        aggregationFunction={aggregationFunction}
                        aggregationWindow={aggregationWindow}
                        usageConditions={usageConditions}
                        billingCriteria={billingCriteria}
                    />
                );
            default:
                return <p>Coming soon...</p>;
        }
    };

    return (
        <div className="create-usage-metric metfront">
            <div className="metric-header">
                <h3 className="metric-title">Create New Usage Metric</h3>
                <div className="metric-actions">
                    <button className="btn cancel" onClick={() => setShowCancelModal(true)}>Cancel</button>
                    <button className="btn save-draft" onClick={handleSaveDraft}>Save as Draft</button>
                </div>
            </div>
            <hr className="sub-header-divider" />
            <div className="usage-metric-wrapper metfront">
                <aside className="sidebars">
                    {steps.map((step, index) => (
                        <div key={index} className={`met-step ${index === currentStep ? 'active' : ''}`} onClick={() => setCurrentStep(index)}>
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
                        <button className="btn save-next" onClick={handleNext}>
                            {currentStep === steps.length - 1 ? 'Save' : 'Save & Next'}
                        </button>
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

export default CreateUsageMetric;
