import React, { useState, useEffect } from 'react';
import { getProducts, Product } from './api';
import { getBillableMetricById, BillableMetricDetails } from './api';
import EditUsage from './EditUsage';
import EditAggregationFunction from './EditAggregationFunction';
import EditAggregationWindow from './EditAggregationWindow';
import './EditMetrics.css';
import EditReview from './Review';

interface EditMetricsProps {
    onClose: () => void;
    metricId?: string | number;
}

const steps = ['Define Metric', 'Usage Conditions', 'Review'];

const EditMetrics: React.FC<EditMetricsProps> = ({ onClose, metricId = '' }) => {
    const [metricName, setMetricName] = useState('');
    const [version, setVersion] = useState('');
    const [unitOfMeasure, setUnitOfMeasure] = useState('');
    const [description, setDescription] = useState('');
    const [aggregationFunction, setAggregationFunction] = useState('');
    const [aggregationWindow, setAggregationWindow] = useState('');
    const [billingCriteria, setBillingCriteria] = useState('');
    const [usageConditions, setUsageConditions] = useState<{ dimension: string; operator: string; value: string; }[]>([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedProductId, setSelectedProductId] = useState<string>('');
    const [selectedProductName, setSelectedProductName] = useState<string>('');
    const [selectedProductType, setSelectedProductType] = useState<string>('');

    // Load products list and metric details for prefill
    useEffect(() => {
        getProducts()
            .then(setProducts)
            .catch((err) => console.error('Failed to load products', err));
    }, []);

    // Prefill form when metricId provided
    useEffect(() => {
        if (!metricId) return;
        (async () => {
            const data = await getBillableMetricById(metricId);
            if (!data) return;
            // Basic fields
            setMetricName(data.metricName ?? '');
            setVersion(data.version ?? '');
            setUnitOfMeasure(data.unitOfMeasure ?? '');
            setDescription(data.description ?? '');
            setAggregationFunction(data.aggregationFunction ?? '');
            setAggregationWindow(data.aggregationWindow ?? '');
            setUsageConditions(Array.isArray(data.usageConditions) ? data.usageConditions : []);
            setBillingCriteria(data.billingCriteria ?? '');

            // Product association (may need products list to translate)
            if (data.productId) {
                setSelectedProductId(String(data.productId));
            }
            if (data.productName) {
                setSelectedProductName(data.productName);
            }
        })();
    }, [metricId]);

    // Resolve product details once products are fetched
    useEffect(() => {
        if (selectedProductId && products.length) {
            const prod = products.find(p => String(p.productId) === selectedProductId);
            if (prod) {
                setSelectedProductName(prod.productName);
                setSelectedProductType(prod.productType);
            }
        }
    }, [products, selectedProductId]);

    const handleNext = async () => {
        if (currentStep === 2) {
            // Build payload and PUT to backend
            if (!metricId) {
                onClose();
                return;
            }
            const payload = {
                metricName,
                productId: Number(selectedProductId),
                version,
                unitOfMeasure,
                description,
                aggregationFunction,
                aggregationWindow,
                billingCriteria,
                usageConditions,
            } as import('./api').BillableMetricDetails;
            console.log('Update Billable Metric payload:', payload);
            const ok = await (await import('./api')).updateBillableMetric(metricId, payload as any);
            if (!ok) {
                alert('Failed to update metric');
                return;
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

    const renderStepContent = () => {
        switch (currentStep) {
            case 0:
                return (
                    <>
                        <div className="form-row">
                            <div className="create-form">
                                <label>Metric Name</label>
                                <input type="text" placeholder="Version" value={metricName} onChange={e => setMetricName(e.target.value)} />
                            </div>
                            <div className="create-form">
                                <label>Product Name</label>
                                <select value={selectedProductId} onChange={e => {
                                    const val = e.target.value;
                                    setSelectedProductId(val);
                                    // if user changes product manually, reset dependent fields
                                    setAggregationFunction('');
                                    setAggregationWindow('');
                                    const prod = products.find(p => String(p.productId) === val);
                                    setSelectedProductName(prod ? prod.productName : '');
                                    setSelectedProductType(prod ? prod.productType : '');
                                    setUnitOfMeasure('');
                                }}>
                                    <option value="">--select--</option>
                                    {products.map(p => (
                                        <option key={p.productId} value={String(p.productId)}>{p.productName}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="create-form">
                                <label>Version (optional)</label>
                                <input type="text" placeholder="Version" value={version} onChange={e => setVersion(e.target.value)} />
                            </div>
                            <div className="create-form">
                                <label>Description</label>
                                <textarea placeholder="Placeholder" value={description} onChange={e => setDescription(e.target.value)} />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="create-form">
                                <label>Unit of Measure</label>
                                {(() => {
                                    const optionsMap: Record<string, string[]> = {
                                        API: ['API_CALL', 'REQUEST', 'TRANSACTION', 'HIT'],
                                        FLATFILE: ['FILE', 'ROW', 'RECORD', 'DELIVERY', 'MB'],
                                        SQLRESULT: ['CELL', 'MB', 'ROW', 'QUERY_EXECUTION'],
                                        LLMTOKEN: ['TOKEN', 'PROMPT_TOKEN', 'COMPLETION_TOKEN'],
                                    };
                                    const norm = (str:string)=>str?.toUpperCase().replace(/[^A-Z]/g,'');
                                    const key = norm(selectedProductType||'');
                                    const opts = optionsMap[key] || null;
                                    if (opts) {
                                        return (
                                            <select value={unitOfMeasure} onChange={e => setUnitOfMeasure(e.target.value)}>
                                                <option value="">--select--</option>
                                                {opts.map(o => (
                                                    <option key={o} value={o}>{o}</option>
                                                ))}
                                            </select>
                                        );
                                    }
                                    // Fallback: show a generic dropdown instead of free text for consistency
                                    const genericOpts = ['UNIT'];
                                    return (
                                        <select value={unitOfMeasure} onChange={e => setUnitOfMeasure(e.target.value)}>
                                            <option value="">--select--</option>
                                            {genericOpts.map(o => (
                                                <option key={o} value={o}>{o}</option>
                                            ))}
                                        </select>
                                    );
                                })()}
                            </div>
                            <div className="create-form">
                                <label>Aggregation Function</label>
                                <EditAggregationFunction productType={selectedProductType} unitOfMeasure={unitOfMeasure} value={aggregationFunction} onChange={setAggregationFunction} />
                            </div>
                            <div className="create-form">
                                <label>Aggregation Window</label>
                                <EditAggregationWindow productType={selectedProductType} unitOfMeasure={unitOfMeasure} value={aggregationWindow} onChange={setAggregationWindow} />
                            </div>
                        </div>
                    </>
                );
            case 1:
                return <EditUsage productType={selectedProductType} unitOfMeasure={unitOfMeasure} conditions={usageConditions} setConditions={setUsageConditions} billingCriteria={billingCriteria} onBillingCriteriaChange={setBillingCriteria} />;
            case 2:
                return (
                    <EditReview
                        metricName={metricName}
                        description={description}
                        productName={selectedProductName}
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
        <div className="create-usage-metric">
            <div className="metric-header">
                <h3 className="metric-title">Edit Usage Metric</h3>
                <div className="metric-actions">
                    <button className="btn cancel" onClick={() => setShowCancelModal(true)}>Cancel</button>
                    <button className="btn save-draft">Save as Draft</button>
                </div>
            </div>

            <div className="usage-metric-wrapper">
                <aside className="sidebars">
                    {steps.map((step, index) => (
                        <div key={index} className={`met-step ${index === currentStep ? 'active' : ''}`} onClick={() => setCurrentStep(index)}>
                            <div className="step-title">{step}</div>
                        </div>
                    ))}
                </aside>

                <div className="form-section">
                    <div className="form-card">{renderStepContent()}</div>
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

export default EditMetrics;
