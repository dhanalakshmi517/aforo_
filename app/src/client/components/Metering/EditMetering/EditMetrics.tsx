import React, { useState, useEffect } from 'react';
import TopBar from '../../componenetsss/TopBar';
import { InputField, TextareaField, SelectField } from '../../componenetsss/Inputs';
import ConfirmDeleteModal from '../../componenetsss/ConfirmDeleteModal';
import SaveAsDraftModal from '../../Products/Componenets/SaveAsDraftModel';

import { getProducts, Product, updateBillableMetric } from './api';
import { getBillableMetricById } from './api';

import EditUsage from './EditUsage';
import EditAggregationFunction from './EditAggregationFunction';
import EditAggregationWindow from './EditAggregationWindow';
import EditReview from './Review';

import './EditMetrics.css'; // uses edit-np-* classes like EditProduct

type ActiveTab = 'metric' | 'conditions' | 'review';

interface EditMetricsProps {
  onClose: () => void;
  metricId?: string | number;
}

const steps = [
  { id: 1, title: 'Define Metric & Aggregation' },
  { id: 2, title: 'Usage Conditions' },
  { id: 3, title: 'Review & Confirm' }
];

const EditMetrics: React.FC<EditMetricsProps> = ({ onClose, metricId = '' }) => {
  // rails / tabs
  const [currentStep, setCurrentStep] = useState(0);
  const [activeTab, setActiveTab] = useState<ActiveTab>('metric');

  // TopBar draft state
  const [draftStatus, setDraftStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSaveDraftModal, setShowSaveDraftModal] = useState(false);

  // form state
  const [metricName, setMetricName] = useState('');
  const [version, setVersion] = useState('');
  const [unitOfMeasure, setUnitOfMeasure] = useState('');
  const [description, setDescription] = useState('');
  const [aggregationFunction, setAggregationFunction] = useState('');
  const [aggregationWindow, setAggregationWindow] = useState('');
  const [billingCriteria, setBillingCriteria] = useState('');
  const [usageConditions, setUsageConditions] = useState<{ dimension: string; operator: string; value: string }[]>([]);

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
          usageConditions: Array.isArray(data.usageConditions) ? data.usageConditions : [],
          billingCriteria: data.billingCriteria ?? '',
          productId: data.productId ? String(data.productId) : ''
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
      if (!aggregationFunction) e.aggregationFunction = 'Aggregation Function is required';
    }
    if (index === 2) {
      if (!metricName.trim() || !selectedProductId || !unitOfMeasure || !aggregationFunction) {
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
    if (selectedProductId && selectedProductId !== originalValues.productId) payload.productId = Number(selectedProductId);
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
      onClose();
    } catch (err) {
      console.error('Error updating metric:', err);
      // console error already logged; no user alert
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
      setTimeout(() => setDraftStatus('idle'), 3500);
      onClose();
    } catch (err) {
      console.error('Save draft failed:', err);
      // console error already logged; no user alert
      setDraftStatus('idle');
    }
  };

  const handleCancel = () => setShowDeleteConfirm(true);

  const renderMetricTab = () => {
    const uomOptionsMap: Record<string, string[]> = {
      API: ['API_CALL', 'REQUEST', 'TRANSACTION', 'HIT'],
      FLATFILE: ['FILE', 'ROW', 'RECORD', 'DELIVERY', 'MB'],
      SQLRESULT: ['CELL', 'MB', 'ROW', 'QUERY_EXECUTION'],
      LLMTOKEN: ['TOKEN', 'PROMPT_TOKEN', 'COMPLETION_TOKEN']
    };
    const key = (selectedProductType || '').toUpperCase();
    const uomOptions = (uomOptionsMap[key] || ['UNIT']).map(o => ({ label: o, value: o }));

    return (
      <div className="edit-np-section">
        <div className="edit-np-form-row">
          <div className="edit-np-form-group">
            <label className="edit-np-label">Metric Name</label>
            <InputField
              value={metricName}
              onChange={setMetricName}
              placeholder="eg. API Calls"
              error={errors.metricName}
            />
          </div>

          <div className="edit-np-form-group">
            <label className="edit-np-label">Product</label>
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
              options={products.map(p => ({ label: p.productName, value: String(p.productId) }))}
              error={errors.product}
            />
          </div>
        </div>

        <div className="edit-np-form-row">
          <div className="edit-np-form-group">
            <label className="edit-np-label">Version (optional)</label>
            <InputField
              value={version}
              onChange={setVersion}
              placeholder="eg. v1.0"
            />
          </div>

          <div className="edit-np-form-group">
            <label className="edit-np-label">Description</label>
            <TextareaField
              value={description}
              onChange={setDescription}
              placeholder="Describe what this metric measures..."
            />
          </div>
        </div>

        <div className="edit-np-form-row">
          <div className="edit-np-form-group">
            <label className="edit-np-label">Unit of Measure</label>
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

          <div className="edit-np-form-group">
            <label className="edit-np-label">Aggregation Function</label>
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
            />
            {errors.aggregationFunction && <div className="np-error-message">{errors.aggregationFunction}</div>}
          </div>

          <div className="edit-np-form-group">
            <label className="edit-np-label">Aggregation Window</label>
            <EditAggregationWindow
              productType={selectedProductType}
              unitOfMeasure={unitOfMeasure}
              value={aggregationWindow}
              onChange={setAggregationWindow}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <TopBar
        title="Edit Usage Metric"
        onBack={onClose}
        cancel={{ label: 'Cancel', onClick: handleCancel }}
        save={{
          label: draftStatus === 'saved' ? 'Saved as Draft' : 'Save as Draft',
          labelWhenSaved: 'Saved as Draft',
          saved: draftStatus === 'saved',
          saving: draftStatus === 'saving',
          onClick: handleSaveDraft
        }}
      />

      <div className="edit-np-viewport">
        <div className="edit-np-card">
          <div className="edit-np-grid">
            {/* Left rail */}
            <aside className="edit-np-rail">
              <div className="edit-np-steps">
                {steps.map((step, index) => {
                  const isActive = index === currentStep;
                  const isCompleted = index < currentStep;
                  return (
                    <button
                      key={step.id}
                      type="button"
                      className={`edit-np-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                      onClick={() => gotoStep(index)}
                    >
                      <div className="edit-np-step__title">{step.title}</div>
                    </button>
                  );
                })}
              </div>
            </aside>

            {/* Main content */}
            <div className="edit-np-content">
              <div className="edit-np-form">
                {loading ? (
                  <div style={{ padding: 20 }}>Loading...</div>
                ) : (
                  <>
                    {activeTab === 'metric' && renderMetricTab()}

                    {activeTab === 'conditions' && (
                      <div className="edit-np-section">
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
                      <div className="edit-np-section">
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

                {/* Footer */}
                <div className="edit-np-form-footer">
                  <div className="edit-np-btn-group edit-np-btn-group--back">
                    {activeTab !== 'metric' && (
                      <button
                        type="button"
                        className="np-btn np-btn--ghost"
                        onClick={() => gotoStep(currentStep - 1)}
                        disabled={loading}
                      >
                        Back
                      </button>
                    )}
                  </div>

                  <div className="edit-np-btn-group edit-np-btn-group--next">
                    {activeTab !== 'review' ? (
                      <button
                        type="button"
                        className={`np-btn np-btn--primary ${loading ? 'np-btn--loading' : ''}`}
                        onClick={() => {
                          if (!validateStep(currentStep)) return;
                          gotoStep(currentStep + 1);
                        }}
                        disabled={loading}
                      >
                        {loading ? 'Saving...' : 'Next'}
                      </button>
                    ) : (
                      <button
                        type="button"
                        className={`np-btn np-btn--primary ${loading ? 'np-btn--loading' : ''}`}
                        onClick={handleSubmitFinal}
                        disabled={loading}
                      >
                        {loading ? 'Saving...' : 'Save'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Optional: same modal shell as EditProduct */}
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
        </div>
      </div>
    </>
  );
};

export default EditMetrics;
