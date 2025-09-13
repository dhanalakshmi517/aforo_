import * as React from 'react';
import { useState, useEffect } from 'react';
import { 
  getProducts, 
  Product, 
  createBillableMetric, 
  updateBillableMetric, 
  BillableMetricPayload, 
  BillableMetricDetails,
  finalizeBillableMetric
} from './api';
import UsageConditionForm from './UsageConditionForm';
import AggregationFunctionSelect from './AggregationFunctionSelect';
import AggregationWindowSelect from './AggregationWindowSelect';
import './Usagemetric.css';
import { InputField, TextareaField, SelectField } from '../Components/InputFields';
import Review from './Review';
import TopBar from '../TopBar/TopBar';

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

const CreateUsageMetric: React.FC<CreateUsageMetricProps> = ({ onClose }: CreateUsageMetricProps) => {
    // form states
    const [metricId, setMetricId] = useState<number | null>(null);
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

    const validateCurrentStep = (step: number): boolean => {
        switch (step) {
            case 0: // Step 1: Basic Info
                if (!metricName.trim()) {
                    alert('Please enter a Metric Name');
                    return false;
                }
                if (!selectedProductId) {
                    alert('Please select a Product');
                    return false;
                }
                if (!unitOfMeasure) {
                    alert('Please select a Unit of Measure');
                    return false;
                }
                if (!aggregationFunction) {
                    alert('Please select an Aggregation Function');
                    return false;
                }
                return true;
            
            case 1: // Step 2: Usage Conditions
                // Add any specific validation for usage conditions if needed
                return true;
                
            case 2: // Step 3: Review
                // Final validation before submission
                if (!metricName.trim() || !selectedProductId || !unitOfMeasure || !aggregationFunction) {
                    alert('Please fill all required fields');
                    return false;
                }
                return true;
                
            default:
                return true;
        }
    };

    // Track previous values for comparison
    const [previousValues, setPreviousValues] = useState<Partial<BillableMetricPayload>>({});

    const saveOrUpdateMetric = async (isDraft: boolean = false) => {
        // Only validate if not a draft save
        if (!isDraft && !validateCurrentStep(currentStep)) {
            return false;
        }
        
        const payload: any = {};
        
        if (metricId) {
            // For updates, include all required fields with their current values
            // This ensures we don't accidentally clear required fields
            if (metricName !== undefined) {
                payload.metricName = metricName;
            }
            if (selectedProductId) {
                payload.productId = Number(selectedProductId);
            }
            if (version !== undefined) {
                payload.version = version;
            }
            if (unitOfMeasure !== undefined) {
                payload.unitOfMeasure = unitOfMeasure;
            }
            if (description !== undefined) {
                payload.description = description;
            }
            if (aggregationFunction) {
                payload.aggregationFunction = aggregationFunction;
            }
            if (aggregationWindow) {
                payload.aggregationWindow = aggregationWindow;
            }
            if (billingCriteria !== undefined) {
                payload.billingCriteria = billingCriteria || '';
            }
            if (usageConditions) {
                payload.usageConditions = usageConditions;
            }
        } else if (isDraft) {
            // For draft saves, only include fields that have values
            if (metricName && metricName.trim() !== '') payload.metricName = metricName;
            if (selectedProductId) payload.productId = Number(selectedProductId);
            if (version && version.trim() !== '') payload.version = version;
            if (unitOfMeasure && unitOfMeasure.trim() !== '') payload.unitOfMeasure = unitOfMeasure;
            if (description && description.trim() !== '') payload.description = description;
            if (aggregationFunction) payload.aggregationFunction = aggregationFunction;
            if (aggregationWindow) payload.aggregationWindow = aggregationWindow;
            if (billingCriteria) payload.billingCriteria = billingCriteria;
            if (usageConditions && usageConditions.length > 0) payload.usageConditions = usageConditions;
        } else {
            // For final save, include all required fields with their current values
            if (metricName.trim() !== '') payload.metricName = metricName;
            if (selectedProductId) payload.productId = Number(selectedProductId);
            if (version.trim() !== '') payload.version = version;
            if (unitOfMeasure.trim() !== '') payload.unitOfMeasure = unitOfMeasure;
            if (description.trim() !== '') payload.description = description;
            if (aggregationFunction) payload.aggregationFunction = aggregationFunction;
            if (aggregationWindow) payload.aggregationWindow = aggregationWindow;
            if (billingCriteria) payload.billingCriteria = billingCriteria;
            if (usageConditions) payload.usageConditions = usageConditions;
        }
        
        console.log('Saving payload:', { metricId, payload }); // For debugging

        try {
            let result;
            if (metricId) {
                // Always use PUT for updates after the first save
                console.log('Updating existing metric with ID:', metricId, 'Changes:', payload);
                const success = await updateBillableMetric(metricId, payload);
                if (!success) throw new Error('Failed to update metric');
                result = { ok: true, id: metricId };
                // Update previous values with the new values
                setPreviousValues(prev => ({
                    ...prev,
                    ...payload
                }));
            } else {
                // Only use POST for the very first save
                if (Object.keys(payload).length === 0) {
                    throw new Error('No fields to save');
                }
                console.log('Creating new metric');
                const createResult = await createBillableMetric(payload);
                console.log('Create metric result:', createResult);
                if (!createResult.ok) throw new Error('Failed to create metric');
                result = createResult;
                // Save the metric ID for future updates
                if (result.id) {
                    console.log('Setting new metric ID:', result.id);
                    setMetricId(result.id);
                    // Update previous values after first save
                    setPreviousValues({
                        metricName,
                        productId: selectedProductId ? Number(selectedProductId) : 0,
                        version,
                        unitOfMeasure,
                        description,
                        aggregationFunction,
                        aggregationWindow,
                        billingCriteria,
                        usageConditions
                    });
                } else {
                    console.warn('No metric ID returned from create operation');
                }
            }

            // Only finalize if not a draft
            if (!isDraft && result.id) {
                const finalized = await finalizeBillableMetric(result.id);
                if (!finalized) {
                    throw new Error('Failed to finalize metric');
                }
            }
            
            return true;
        } catch (error) {
            console.error('Error saving metric:', error);
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            alert(`Failed to save metric: ${errorMessage}`);
            return false;
        }
    };

    const handleNext = async () => {
        if (currentStep < steps.length - 1) {
            // Only validate current step before moving to next
            if (validateCurrentStep(currentStep)) {
                setCurrentStep(prev => prev + 1);
            }
        } else {
            // On final step, validate before saving
            if (validateCurrentStep(currentStep)) {
                const ok = await saveOrUpdateMetric(false);
                if (ok) {
                    onClose();
                }
            }
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep((prev) => prev - 1);
        } else {
            onClose();
        }
    };

    // Handle saving as draft
    const handleSaveDraft = async () => {
        // For drafts, we don't require all fields to be filled
        const success = await saveOrUpdateMetric(true);
        if (success) {
            alert(metricId ? 'Draft updated successfully!' : 'Draft saved successfully!');
            
            // Only reset form if it's a completely new draft (first save)
            if (!metricId) {
                // Don't reset the form fields here - we want to keep the entered values
                // The metricId will be updated by saveOrUpdateMetric
                setCurrentStep(0);
            }
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 0:
                return (
                    <>
                        <div className="form-row">
                            <div className="forms-group">
                                <InputField
                                    label="Metric Name"
                                    placeholder="Metric"
                                    value={metricName}
                                    onChange={setMetricName}
                                />
                            </div>
                            <div className="forms-group">
                                <SelectField
                                    label="Product Name"
                                    placeholder="Select Product"
                                    value={selectedProductId}
                                    onChange={(val: string)=>{
                                        setSelectedProductId(val);
                                        const prod = products.find(p => String(p.productId) === val);
                                        setSelectedProductName(prod ? prod.productName : '');
                                        setSelectedProductType(prod ? prod.productType : '');
                                        setUnitOfMeasure('');
                                    }}
                                    options={products.map(p => ({ label: p.productName, value: String(p.productId) }))}
                                />
                            </div>
                            <div className="forms-group">
                                <InputField
                                    label="Version (optional)"
                                    placeholder="Version"
                                    value={version}
                                    onChange={setVersion}
                                />
                            </div>
                            <div className="forms-group">
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
        <div className="create-usage-metric metfront" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            <TopBar
                title="Create New Usage Metric"
                cancel={{
                    label: "Cancel",
                    onClick: () => setShowCancelModal(true)
                }}
                save={{
                    label: "Save as Draft",
                    onClick: handleSaveDraft
                }}
            />
            <div className="usage-metric-wrapper metfront" style={{ flex: 1 }}>
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
                            {currentStep === steps.length - 1 ? 'Save' : 'Next'}
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
