import React, { useState, useEffect } from 'react';
import TopBar from '../../componenetsss/TopBar';
import { InputField, TextareaField, SelectField } from '../../componenetsss/Inputs';
import ConfirmDeleteModal from '../../componenetsss/ConfirmDeleteModal';
import { useToast } from '../../componenetsss/ToastProvider';
import PrimaryButton from '../../componenetsss/PrimaryButton';
import SecondaryButton from '../../componenetsss/SecondaryButton';
import EditPopup from '../../componenetsss/EditPopUp';
import SaveAsDraftModal from '../../Products/Componenets/SaveAsDraftModel';
import VerticalScrollbar from '../../componenetsss/VerticalScrollbar';

import { getProducts, Product, updateBillableMetric } from './api';
import { getBillableMetricById } from './api';

import EditUsage from './EditUsage';
import EditAggregationFunction from './EditAggregationFunction';
import EditAggregationWindow from './EditAggregationWindow';
import EditReview from './Review';

import './EditMetrics.css'; // uses editmet-np-* classes like EditProduct

type ActiveTab = 'metric' | 'conditions' | 'review';

interface EditMetricsProps {
  onClose: () => void;
  metricId?: string | number;
}

const steps = [
  { id: 1, title: 'Define Metric & Aggregation' },
  { id: 2, title: 'Usage Conditions' },
  { id: 3, title: 'Review & Confirm' },
];

const EditMetrics: React.FC<EditMetricsProps> = ({ onClose, metricId = '' }) => {
  const { showToast } = useToast();

  // rails / tabs
  const [currentStep, setCurrentStep] = useState(0);
  const [activeTab, setActiveTab] = useState<ActiveTab>('metric');

  // TopBar draft state
  const [draftStatus, setDraftStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSaveDraftModal, setShowSaveDraftModal] = useState(false);
  // edit popup state
  const [showEditPopup, setShowEditPopup] = useState(false);

  // form state
  const [metricName, setMetricName] = useState('');
  const [version, setVersion] = useState('');
  const [unitOfMeasure, setUnitOfMeasure] = useState('');
  const [description, setDescription] = useState('');
  const [aggregationFunction, setAggregationFunction] = useState('');
  const [aggregationWindow, setAggregationWindow] = useState('');
  const [billingCriteria, setBillingCriteria] = useState('');
  const [usageConditions, setUsageConditions] = useState<
    { dimension: string; operator: string; value: string }[]
  >([]);

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedProductName, setSelectedProductName] = useState<string>('');
  const [selectedProductType, setSelectedProductType] = useState<string>('');

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // originals for diff-only updates
  const [originalValues, setOriginalValues] = React.useState<any>({});

  // fetch products
  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch(err => console.error('Failed to load products', err));
  }, []);

  // prefill metric details
  useEffect(() => {
    if (!metricId) return;
    (async () => {
      try {
        setLoading(true);
        const data = await getBillableMetricById(metricId);
        if (!data) return;

        const original = {
          metricName: data.metricName ?? '',
          version: data.version ?? '',
          unitOfMeasure: data.unitOfMeasure ?? '',
          description: data.description ?? '',
          aggregationFunction: data.aggregationFunction ?? '',
          aggregationWindow: data.aggregationWindow ?? '',
          usageConditions: Array.isArray(data.usageConditions)
            ? data.usageConditions
            : [],
          billingCriteria: data.billingCriteria ?? '',
          productId: data.productId ? String(data.productId) : '',
        };
        setOriginalValues(original);

        setMetricName(original.metricName);
        setVersion(original.version);
        setUnitOfMeasure(original.unitOfMeasure);
        setDescription(original.description);
        setAggregationFunction(original.aggregationFunction);
        setAggregationWindow(original.aggregationWindow);
        setUsageConditions(original.usageConditions);
        setBillingCriteria(original.billingCriteria);

        if (original.productId) setSelectedProductId(original.productId);
        if (data.productName) setSelectedProductName(data.productName);
      } finally {
        setLoading(false);
      }
    })();
  }, [metricId]);

  // resolve product type/name
  useEffect(() => {
    if (selectedProductId && products.length) {
      const prod = products.find(p => String(p.productId) === selectedProductId);
      if (prod) {
        setSelectedProductName(prod.productName);
        setSelectedProductType(prod.productType);
      }
    }
  }, [products, selectedProductId]);

  const gotoStep = (index: number) => {
    setCurrentStep(index);
    setActiveTab(index === 0 ? 'metric' : index === 1 ? 'conditions' : 'review');
  };

  const validateStep = (index: number): boolean => {
    const e: Record<string, string> = {};
    if (index === 0) {
      if (!metricName.trim()) e.metricName = 'Metric name is required';
      if (!selectedProductId) e.product = 'Product is required';
      if (!unitOfMeasure) e.unitOfMeasure = 'Unit of Measure is required';
      // Note: Aggregation Function and Aggregation Window are optional
    }
    if (index === 2) {
      if (!metricName.trim() || !selectedProductId || !unitOfMeasure) {
        e.form = 'Please fill all required fields';
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const buildChangedPayload = () => {
    const payload: any = { metricId: Number(metricId) };
    const pushIfChanged = (key: string, value: any) => {
      if (value !== originalValues[key]) payload[key] = value;
    };

    pushIfChanged('metricName', metricName);
    if (selectedProductId && selectedProductId !== originalValues.productId) {
      payload.productId = Number(selectedProductId);
    }
    pushIfChanged('version', version);
    pushIfChanged('unitOfMeasure', unitOfMeasure);
    pushIfChanged('description', description);
    pushIfChanged('aggregationFunction', aggregationFunction);
    pushIfChanged('aggregationWindow', aggregationWindow);
    pushIfChanged('billingCriteria', billingCriteria);

    const currentConditions = JSON.stringify(usageConditions);
    const originalConditions = JSON.stringify(originalValues.usageConditions || []);
    if (currentConditions !== originalConditions) {
      const valid = usageConditions.filter(c => c.dimension && c.operator && c.value);
      payload.usageConditions = valid.length ? valid : [];
    }

    return payload;
  };

  const handleSubmitFinal = async () => {
    if (!metricId) {
      onClose();
      return;
    }
    if (!validateStep(2)) return;

    try {
      setLoading(true);
      const payload = buildChangedPayload();
      if (Object.keys(payload).length <= 1) {
        onClose();
        return;
      }
      const ok = await updateBillableMetric(Number(metricId), payload);
      if (!ok) throw new Error('Failed to update metric');
      showToast({
        kind: 'success',
        title: 'Changes Saved',
        message: 'Metric updated successfully.',
      });
      onClose();
    } catch (err) {
      console.error('Error updating metric:', err);
      showToast({
        kind: 'error',
        title: 'Failed to Save Changes',
        message: 'Could not update metric. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!metricId || draftStatus === 'saving') return;

    try {
      setDraftStatus('saving');
      const payload = buildChangedPayload();
      if (Object.keys(payload).length <= 1) {
        setDraftStatus('idle');
        onClose();
        return;
      }
      const ok = await updateBillableMetric(Number(metricId), payload);
      if (!ok) throw new Error('Failed to save draft');
      setDraftStatus('saved');
      showToast({
        kind: 'success',
        title: 'Draft Saved',
        message: 'Metric draft saved successfully.',
      });
      setTimeout(() => setDraftStatus('idle'), 3500);
      onClose();
    } catch (err) {
      console.error('Save draft failed:', err);
      showToast({
        kind: 'error',
        title: 'Failed to Save Draft',
        message: 'Unable to save draft. Please try again.',
      });
      setDraftStatus('idle');
    }
  };

  const handleCancel = () => setShowDeleteConfirm(true);

  const hasChanges = () => {
    const payload = buildChangedPayload();
    return Object.keys(payload).length > 1;
  };

  const handleBack = () => {
    if (hasChanges()) {
      setShowEditPopup(true);
    } else {
      onClose();
    }
  };

  const renderMetricTab = () => {
    const uomOptionsMap: Record<string, string[]> = {
      API: ['API_CALL', 'REQUEST', 'TRANSACTION', 'HIT'],
      FLATFILE: ['FILE', 'ROW', 'RECORD', 'DELIVERY', 'MB'],
      SQLRESULT: ['CELL', 'MB', 'ROW', 'QUERY_EXECUTION'],
      LLMTOKEN: ['TOKEN', 'PROMPT_TOKEN', 'COMPLETION_TOKEN'],
    };
    const key = (selectedProductType || '').toUpperCase();
    const uomOptions = (uomOptionsMap[key] || ['UNIT']).map(o => ({
      label: o,
      value: o,
    }));

    return (
      <div className="editmet-np-section">
        <div className="editmet-np-form-row">
          <div className="editmet-np-form-group">
            <label className="editmet-np-label">Metric Name</label>
            <InputField
              value={metricName}
              onChange={setMetricName}
              placeholder="eg. API Calls"
              error={errors.metricName}
            />
          </div>

          <div className="editmet-np-form-group">
            <label className="editmet-np-label">Product</label>
            <SelectField
              placeholder="Select Product"
              value={selectedProductId}
              onChange={(val: string) => {
                setSelectedProductId(val);
                const prod = products.find(p => String(p.productId) === val);
                setSelectedProductName(prod ? prod.productName : '');
                setSelectedProductType(prod ? prod.productType : '');
                // reset dependent fields
                setAggregationFunction('');
                setAggregationWindow('');
                setUnitOfMeasure('');
                if (errors.product) {
                  const { product, ...rest } = errors;
                  setErrors(rest);
                }
              }}
              options={products.map(p => ({
                label: p.productName,
                value: String(p.productId),
              }))}
              error={errors.product}
            />
          </div>
        </div>

        <div className="editmet-np-form-row">
          <div className="editmet-np-form-group">
            <label className="editmet-np-label">Version (optional)</label>
            <InputField value={version} onChange={setVersion} placeholder="eg. v1.0" />
          </div>

          <div className="editmet-np-form-group">
            <label className="editmet-np-label">Description</label>
            <TextareaField
              value={description}
              onChange={setDescription}
              placeholder="Describe what this metric measures..."
            />
          </div>
        </div>

        <div className="editmet-np-form-row">
          <div className="editmet-np-form-group">
            <label className="editmet-np-label">Unit of Measure</label>
            <SelectField
              placeholder="Select Unit"
              value={unitOfMeasure}
              onChange={(v: string) => {
                setUnitOfMeasure(v);
                if (errors.unitOfMeasure) {
                  const { unitOfMeasure, ...rest } = errors;
                  setErrors(rest);
                }
              }}
              options={uomOptions}
              error={errors.unitOfMeasure}
            />
          </div>

          <div className="editmet-np-form-group">
            <label className="editmet-np-label">Aggregation Function (optional)</label>
            <EditAggregationFunction
              productType={selectedProductType}
              unitOfMeasure={unitOfMeasure}
              value={aggregationFunction}
              onChange={(v: string) => {
                setAggregationFunction(v);
                if (errors.aggregationFunction) {
                  const { aggregationFunction, ...rest } = errors;
                  setErrors(rest);
                }
              }}
              optional={true}
            />
          </div>

          <div className="editmet-np-form-group">
            <label className="editmet-np-label">Aggregation Window (optional)</label>
            <EditAggregationWindow
              productType={selectedProductType}
              unitOfMeasure={unitOfMeasure}
              value={aggregationWindow}
              onChange={setAggregationWindow}
              optional={true}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <TopBar title="Edit Usage Metric" onBack={handleBack} />

      <div className="editmet-np-viewport">
        <div className="editmet-np-card">
          <div className="editmet-np-grid">
            {/* Left rail */}
            <aside className="editmet-np-rail">
              <nav className="editmet-np-steps">
                {steps.map((step, index) => {
                  const isActive = index === currentStep;
                  const isCompleted = index < currentStep;
                  return (
                    <button
                      key={step.id}
                      type="button"
                      className={`editmet-np-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''
                        }`.trim()}
                      onClick={() => gotoStep(index)}
                    >
                      <span className="editmet-np-step__title">{step.title}</span>
                    </button>
                  );
                })}
              </nav>
            </aside>

            {/* MAIN area – aligned with EditRatePlan/EditSubscription skeleton */}
            <main className="editmet-np-main">
              <div className="editmet-np-main__inner">
                <div className="editmet-np-body">
                  <form
                    className="editmet-np-form"
                    onSubmit={e => {
                      e.preventDefault();
                    }}
                  >
                    <div className="editmet-np-form-section">
                      {loading ? (
                        <div style={{ padding: 20 }}>Loading...</div>
                      ) : (
                        <>
                          {activeTab === 'metric' && renderMetricTab()}

                          {activeTab === 'conditions' && (
                            <div className="editmet-np-section">
                              <EditUsage
                                productType={selectedProductType}
                                unitOfMeasure={unitOfMeasure}
                                conditions={usageConditions}
                                setConditions={setUsageConditions}
                                billingCriteria={billingCriteria}
                                onBillingCriteriaChange={setBillingCriteria}
                              />
                            </div>
                          )}

                          {activeTab === 'review' && (
                            <div className="prod-np-section">
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
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    <div className="af-skel-rule af-skel-rule--bottom" />

                    {/* FOOTER – same alignment pattern */}
                    <div className="editmet-np-form-footer">
                      <div className="editmet-np-btn-group editmet-np-btn-group--back">
                        {activeTab !== 'metric' && (
                          <SecondaryButton
                            type="button"
                            onClick={() => gotoStep(currentStep - 1)}
                            disabled={loading}
                          >
                            Back
                          </SecondaryButton>
                        )}
                      </div>

                      <div className="editmet-np-btn-group editmet-np-btn-group--next">
                        {activeTab !== 'review' ? (
                          <PrimaryButton
                            type="button"
                            onClick={() => {
                              if (!validateStep(currentStep)) return;
                              gotoStep(currentStep + 1);
                            }}
                            disabled={loading}
                          >
                            {loading ? 'Saving...' : 'Next'}
                          </PrimaryButton>
                        ) : (
                          <PrimaryButton
                            type="button"
                            onClick={handleSubmitFinal}
                            disabled={loading}
                          >
                            {loading ? 'Saving...' : 'Save changes'}
                          </PrimaryButton>
                        )}
                      </div>
                    </div>
                  </form>
                </div>
              </div>

            </main>
          </div>
        </div>

        <VerticalScrollbar height="100%" color="#D9DFE8" thickness={4} className="editmet-np-scrollbar" />

        <SaveAsDraftModal
          isOpen={showSaveDraftModal}
          onSave={() => {
            setShowSaveDraftModal(false);
            onClose();
          }}
          onDelete={() => {
            setShowSaveDraftModal(false);
            onClose();
          }}
        />

        <ConfirmDeleteModal
          isOpen={showDeleteConfirm}
          productName={metricName || 'this metric'}
          onConfirm={() => {
            setShowDeleteConfirm(false);
            onClose();
          }}
          onCancel={() => setShowDeleteConfirm(false)}
        />

        <EditPopup
          isOpen={showEditPopup}
          onDismiss={() => setShowEditPopup(false)}
          onClose={() => {
            setShowEditPopup(false);
            onClose();
          }}
          onSave={async () => {
            await handleSaveDraft();
            onClose();
          }}
        />
      </div>
    </>
  );
};

export default EditMetrics;
