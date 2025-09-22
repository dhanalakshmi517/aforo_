import * as React from 'react';
import { useEffect, useState } from 'react';

import TopBar from '../componenetsss/TopBar';
import { InputField, TextareaField, SelectField } from '../componenetsss/Inputs';
import ConfirmDeleteModal from '../componenetsss/ConfirmDeleteModal';
import SaveDraft from '../componenetsss/SaveDraft';
import { useToast } from '../componenetsss/ToastProvider';

import {
  getProducts,
  getUsageMetric,
  Product,
  createBillableMetric,
  updateBillableMetric,
  BillableMetricPayload,
  finalizeBillableMetric,
  deleteUsageMetric
} from './api';

import UsageConditionForm from './UsageConditionForm';
import AggregationFunctionSelect from './AggregationFunctionSelect';
import AggregationWindowSelect from './AggregationWindowSelect';
import Review from './Review';

// Reuse the same CSS shell for np-* classes
import './Usagemetric.css';
import '../componenetsss/SkeletonForm.css';

type ActiveTab = 'metric' | 'conditions' | 'review';

const steps = [
  { id: 1, title: 'Define Metric & Aggregation', desc: 'Give your metric a name, set its unit, and connect it to the product or event source it will measure.' },
  { id: 2, title: 'Usage Conditions',            desc: 'Define how usage is calculated — set thresholds, group data, and apply any rules needed for billing.' },
  { id: 3, title: 'Review & Confirm',            desc: 'Review your setup to make sure everything is correct before saving the metric.' }
];

interface CreateUsageMetricProps { onClose: () => void; draftMetricId?: number; }

export default function CreateUsageMetric({ onClose, draftMetricId }: CreateUsageMetricProps): JSX.Element {
  const { showToast } = useToast();
    // helper to delete metric then close
  const deleteAndClose = async () => {
    let ok = true;
    try {
      if (metricId) {
        await deleteUsageMetric(metricId);
      }
    } catch (e) {
      console.error('Failed to delete metric', e);
      ok = false;
    } finally {
      showToast({
        kind: ok ? 'success' : 'error',
        title: ok ? 'Metric Deleted' : 'Delete Failed',
        message: ok ? 'Metric deleted successfully.' : 'Unable to delete metric. Please try again.'
      });
      onClose();
    }
  };

  // page class
  useEffect(() => {
    document.body.classList.add('create-product-page');
    return () => document.body.classList.remove('create-product-page');
  }, []);

  // UI state mirroring NewProduct
  const [currentStep, setCurrentStep] = useState(0);
  const [activeTab, setActiveTab] = useState<ActiveTab>('metric');

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSavePrompt, setShowSavePrompt] = useState(false);

  const [isDraftSaving, setIsDraftSaving] = useState(false);
  const [isDraftSaved, setIsDraftSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  // form states (unchanged semantics)
  const [metricId, setMetricId] = useState<number | null>(null);
  const [metricName, setMetricName] = useState('');
  const [version, setVersion] = useState('');
  const [unitOfMeasure, setUnitOfMeasure] = useState('');
  const [description, setDescription] = useState('');
  const [aggregationFunction, setAggregationFunction] = useState('');
  const [aggregationWindow, setAggregationWindow] = useState('');
  const [usageConditions, setUsageConditions] = useState<{ dimension: string; operator: string; value: string; }[]>([]);
  const [billingCriteria, setBillingCriteria] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedProductName, setSelectedProductName] = useState<string>('');
  const [selectedProductType, setSelectedProductType] = useState<string>('');

  // simple field errors holder (aligned with NewProduct pattern)
  const [errors, setErrors] = useState<Record<string, string>>({});

  // preload existing metric if draftMetricId
  useEffect(() => {
    if (draftMetricId) {
      (async () => {
        const data = await getUsageMetric(draftMetricId);
        if (data) {
          setMetricId(data.metricId ?? (data as any).billableMetricId ?? null);
          setMetricName(data.metricName || '');
          setSelectedProductId(String(data.productId));
          if ((data as any).productType) setSelectedProductType((data as any).productType);
          setUnitOfMeasure(data.unitOfMeasure || '');
          setDescription(data.description || '');
          setAggregationFunction(data.aggregationFunction || '');
          setAggregationWindow(data.aggregationWindow || '');
          setBillingCriteria(data.billingCriteria || '');
          // usageConditions may be stored elsewhere
        }
      })();
    }
  }, [draftMetricId]);

  // load products
  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch((err) => console.error('Failed to load products', err));
  }, []);

  // once products are loaded, derive product name & type from selectedProductId (needed for UOM options)
  useEffect(() => {
    if (selectedProductId && products.length) {
      const prod = products.find(p => String(p.productId) === selectedProductId);
      if (prod) {
        setSelectedProductName(prod.productName);
        setSelectedProductType(prod.productType);
      }
    }
  }, [products, selectedProductId]);

  // previous values tracker (kept in case you use it later for diffs)
  const [previousValues, setPreviousValues] = useState<Partial<BillableMetricPayload>>({});

  const gotoStep = (index: number) => {
    setCurrentStep(index);
    // map step → tab
    const map: ActiveTab[] = ['metric', 'conditions', 'review'];
    setActiveTab(map[index] || 'metric');
  };

  const validateCurrentStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    if (step === 0) {
      if (!metricName.trim()) newErrors.metricName = 'Metric name is required';
      if (!selectedProductId) newErrors.product = 'Product is required';
      if (!unitOfMeasure) newErrors.unitOfMeasure = 'Unit of Measure is required';
      if (!aggregationFunction) newErrors.aggregationFunction = 'Aggregation Function is required';
    if (!aggregationWindow) newErrors.aggregationWindow = 'Aggregation Window is required';
    }
    if (step === 2) {
      if (!metricName.trim() || !selectedProductId || !unitOfMeasure || !aggregationFunction) {
        newErrors.form = 'Please fill all required fields';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const clean = (obj:any)=>{
    const out:any={};
    Object.entries(obj).forEach(([k,v])=>{
      if (v===undefined||v===null) return;
      if (typeof v=== 'string' && v.trim()==='') return;
      if (Array.isArray(v) && v.length===0) return;
      out[k]=v;
    });
    return out;
  };

  const buildPayload = (isDraft: boolean) => {
    const payload: any = {};
    if (metricId) {
      // PUT-like body with present values
      payload.metricName = metricName ?? '';
      if (selectedProductId) payload.productId = Number(selectedProductId);
      payload.version = version ?? '';
      payload.unitOfMeasure = unitOfMeasure ?? '';
      payload.description = description ?? '';
    if (billingCriteria) payload.billingCriteria = billingCriteria;
    if (usageConditions.length) payload.usageConditions = usageConditions;
      if (aggregationFunction) payload.aggregationFunction = aggregationFunction;
      if (aggregationWindow)  payload.aggregationWindow  = aggregationWindow;
      return clean(payload);
    }

    // New metric: selective for drafts, complete for final
    if (isDraft) {
      if (metricName.trim())         payload.metricName = metricName;
      if (selectedProductId)         payload.productId = Number(selectedProductId);
      if (version.trim())            payload.version = version;
      if (unitOfMeasure.trim())      payload.unitOfMeasure = unitOfMeasure;
      if (description.trim())        payload.description = description;
      if (aggregationFunction)       payload.aggregationFunction = aggregationFunction;
      if (aggregationWindow)         payload.aggregationWindow  = aggregationWindow;
      if (billingCriteria)        payload.billingCriteria = billingCriteria;
      return clean(payload);
    }

    // final save
    payload.metricName = metricName.trim();
    payload.productId = Number(selectedProductId);
    payload.version = version.trim();
    payload.unitOfMeasure = unitOfMeasure.trim();
    payload.description = description.trim();
  if (billingCriteria) payload.billingCriteria = billingCriteria;
  if (usageConditions.length) payload.usageConditions = usageConditions;
    payload.aggregationFunction = aggregationFunction;
    payload.aggregationWindow = aggregationWindow;
    return payload;
  };

  const saveOrUpdateMetric = async (isDraft = false, skipFinalize = false) => {
    if (!isDraft && !validateCurrentStep(currentStep)) return false;

    const payload = buildPayload(isDraft);
    // If updating an existing metric but there are no changes, skip PUT to avoid server 500
    if (metricId && Object.keys(payload).length === 0) {
      // Only finalize if this is not a draft save and caller didn't opt-out
      if (!isDraft && !skipFinalize) {
        console.log('No changes detected, directly finalizing metricId', metricId);
        const finalized = await finalizeBillableMetric(metricId);
        if (!finalized) {
          setErrors(prev => ({ ...prev, form: 'Failed to finalize metric' }));
          return false;
        }
      }
      return true;
    }

    // Creating a new metric but no data – nothing to persist.
    // Silently succeed so the caller can simply close the dialog without showing alerts.
    if (!metricId && Object.keys(payload).length === 0) {
      return true;
    }

    try {
      if (metricId) {
        // update
        console.log('PUT payload → updateBillableMetric', payload);
        const success = await updateBillableMetric(metricId, payload);
        if (!success) throw new Error('Failed to update metric');
        setPreviousValues(prev => ({ ...prev, ...payload }));
        if (!isDraft && !skipFinalize) {
          console.log('Finalize call for metricId', metricId);
          const finalized = await finalizeBillableMetric(metricId);
          if (!finalized) throw new Error('Failed to finalize metric');
        }
        return true;
      } else {
        // create
        console.log('POST payload → createBillableMetric', payload);
        const res = await createBillableMetric(payload);
        if (!res.ok || !res.id) throw new Error('Failed to create metric');
        setMetricId(res.id);
        if (!isDraft && !skipFinalize) {
          console.log('Finalize call for metricId', res.id);
          const finalized = await finalizeBillableMetric(res.id);
          if (!finalized) throw new Error('Failed to finalize metric');
        }
        setPreviousValues({
          metricName,
          productId: selectedProductId ? Number(selectedProductId) : undefined,
          version,
          unitOfMeasure,
          description,
          aggregationFunction,
          aggregationWindow,
          usageConditions
        });
        return true;
      }
    } catch (e) {
      console.error('Error saving metric:', e);
      const msg = e instanceof Error ? e.message : 'Unknown error';
      // silently log backend error without showing inline message
    console.error('Metric save failed:', msg);
      return false;
    }
  };

  // Footer handlers (mirroring NewProduct)
  const handleSaveAndNext = async () => {
    if (!validateCurrentStep(currentStep)) return;
    // not a draft, only validate current
    if (activeTab === 'metric') {
      // Save as draft on the first step (no finalize yet)
      setSaving(true);
      const ok = await saveOrUpdateMetric(true);
      setSaving(false);
      if (!ok) return;
      // move to conditions only if save succeeded
      gotoStep(1);
      return;
    }
    if (activeTab === 'conditions') {
      // Persist all changes so far with a full PUT, but defer finalization until review
      setSaving(true);
      const ok = await saveOrUpdateMetric(false, true); // non-draft, skipFinalize = true
      setSaving(false);
      if (!ok) return;
      gotoStep(2);
      return;
    }
    if (activeTab === 'review') {
      // Finalize metric without re-sending payload
      if (!metricId) return; // safety guard
      setSaving(true);
      console.log('Finalize call for metricId', metricId);
      const finalized = await finalizeBillableMetric(metricId);
      setSaving(false);
      if (finalized) onClose();
      else alert('Finalize failed');
    }
  };

  const handleSaveDraft = async () => {
    if (isDraftSaving) return false;
    try {
      setIsDraftSaving(true);
      setIsDraftSaved(false);
      const ok = await saveOrUpdateMetric(true);
      if (ok) {
        setIsDraftSaved(true);
        setTimeout(() => setIsDraftSaved(false), 2500);
      }
      return ok;
    } finally {
      setIsDraftSaving(false);
    }
  };

  const productOptions = products.map(p => ({ label: p.productName, value: String(p.productId) }));

  return (
    <>
      <TopBar
        title="Create New Usage Metric"
        onBack={() => setShowSavePrompt(true)}
        cancel={{ onClick: () => setShowDeleteConfirm(true) }}
        save={{
          onClick: handleSaveDraft,
          label: isDraftSaved ? 'Saved!' : 'Save as Draft',
          saved: isDraftSaved,
          saving: isDraftSaving,
          labelWhenSaved: 'Saved as Draft'
        }}
      />

      <div className="met-np-viewport">
        <div className="met-np-card">
          <div className="met-np-grid">
            {/* LEFT rail */}
            <aside className="met-np-rail">
              <nav className="met-np-steps">
                {steps.map((step, i) => {
                  const isActive = i === currentStep;
                  const isCompleted = i < currentStep;
                  const showConnector = i < steps.length - 1;
                  return (
                    <button
                      key={step.id}
                      type="button"
                      className={['met-np-step', isActive ? 'active' : '', isCompleted ? 'completed' : ''].join(' ').trim()}
                      onClick={() => gotoStep(i)}
                    >
                      <span className="met-np-step__bullet" aria-hidden="true">
                        <span className="met-np-step__icon">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="11" stroke="#C3C2D0" strokeWidth="2" />
                            <circle cx="12" cy="12" r="6" fill="#C3C2D0" />
                          </svg>
                        </span>
                        {showConnector && <span className="met-np-step__connector" />}
                      </span>
                      <span className="met-np-step__text">
                        <span className="met-np-step__title">{step.title}</span>
                        <span className="met-np-step__desc">{step.desc}</span>
                      </span>
                    </button>
                  );
                })}
              </nav>
            </aside>

            {/* MAIN */}
            <main className="met-np-main">
              {/* faint separators behind content */}
              <div className="af-skel-rule af-skel-rule--top" />
              <div className="met-np-main__inner">
                <div className="met-np-body">
                  <form className="met-np-form" onSubmit={(e) => e.preventDefault()}>
                    <div className="met-np-form-section">
                      {/* TAB: METRIC */}
                      {activeTab === 'metric' && (
                        <section>
                          <div className="met-np-section-header">

                            <h3 className="met-np-section-title">DEFINE METRIC & AGGREGATION</h3>
                          </div>

                          <div className="met-np-grid-2">
                            <InputField
                              label="Metric Name"
                              value={metricName}
                              onChange={setMetricName}
                              placeholder="eg. API Calls"
                              error={errors.metricName}
                            />

                            <SelectField
                              label="Product"
                              placeholder="eg. Maps API"
                              value={selectedProductId}
                              onChange={(v: string) => {
                                setSelectedProductId(v);
                                const prod = products.find(p => String(p.productId) === v);
                                setSelectedProductName(prod ? prod.productName : '');
                                setSelectedProductType(prod ? prod.productType : '');
                                setUnitOfMeasure('');
                                if (errors.product) {
                                  const { product, ...rest } = errors;
                                  setErrors(rest);
                                }
                              }}
                              options={productOptions}
                              error={errors.product}
                            />

                            <InputField
                              label="Version (optional)"
                              value={version}
                              onChange={setVersion}
                              placeholder="eg. v2.0"
                            />

                            <TextareaField
                              label="Description"
                              value={description}
                              onChange={setDescription}
                              placeholder="eg. Number of API calls consumed per month"
                            />

                            {/* UOM */}
                            <div className="met-np-field">
                              <label className="met-np-label">Unit of Measure</label>
                              {(() => {
                                const map: Record<string, string[]> = {
                                  API: ['API_CALL', 'REQUEST', 'TRANSACTION', 'HIT'],
                                  FLATFILE: ['FILE', 'ROW', 'RECORD', 'DELIVERY', 'MB'],
                                  SQLRESULT: ['CELL', 'MB', 'ROW', 'QUERY_EXECUTION'],
                                  LLMTOKEN: ['TOKEN', 'PROMPT_TOKEN', 'COMPLETION_TOKEN']
                                };
                                const key = selectedProductType?.toUpperCase();
                                const opts = map[key] || null;

                                if (opts) {
                                  return (
                                    <>
                                      <SelectField
                                        placeholder="Select unit (eg. calls, GB, hours)"
                                        value={unitOfMeasure}
                                        onChange={(v: string) => {
                                          setUnitOfMeasure(v);
                                          if (errors.unitOfMeasure) {
                                            const { unitOfMeasure, ...rest } = errors;
                                            setErrors(rest);
                                          }
                                        }}
                                        options={opts.map(o => ({ label: o, value: o }))}
                                      />
                                      {errors.unitOfMeasure && (
                                        <div className="met-np-error-message">{errors.unitOfMeasure}</div>
                                      )}
                                    </>
                                  );
                                }

                                return (
                                  <>
                                    <InputField
                                      placeholder="Unit"
                                      value={unitOfMeasure}
                                      onChange={(v: string) => {
                                        setUnitOfMeasure(v);
                                        if (errors.unitOfMeasure) {
                                          const { unitOfMeasure, ...rest } = errors;
                                          setErrors(rest);
                                        }
                                      }}
                                    />
                                    {errors.unitOfMeasure && (
                                      <div className="met-np-error-message">{errors.unitOfMeasure}</div>
                                    )}
                                  </>
                                );
                              })()}
                            </div>

                            {/* Aggregation Function */}
                            <div className="met-np-field">
                              <label className="met-np-label">Aggregation Function<span className="required">*</span></label>
                              <AggregationFunctionSelect
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
                              {errors.aggregationFunction && (
                                <div className="met-np-error-message">{errors.aggregationFunction}</div>
                              )}
                            </div>

                            {/* Aggregation Window */}
                            <div className="met-np-field">
                              <label className="met-np-label">Aggregation Window<span className="required">*</span></label>
                              <AggregationWindowSelect
                                productType={selectedProductType}
                                unitOfMeasure={unitOfMeasure}
                                value={aggregationWindow}
                                onChange={(v:string)=>{
                                  setAggregationWindow(v);
                                  if (errors.aggregationWindow) {
                                    const { aggregationWindow, ...rest } = errors;
                                    setErrors(rest);
                                  }
                                }}
                              />
                              {errors.aggregationWindow && (
                                <div className="met-np-error-message">{errors.aggregationWindow}</div>
                              )}
                            </div>
                          </div>
                        </section>
                      )}

                      {/* TAB: CONDITIONS */}
                      {activeTab === 'conditions' && (
                        <section>
                          <div className="met-np-section-header">
                            <h3 className="met-np-section-title">USAGE CONDITIONS</h3>
                          </div>
                          <UsageConditionForm
                            productType={selectedProductType}
                            unitOfMeasure={unitOfMeasure}
                            conditions={usageConditions}
                            setConditions={setUsageConditions}
                            billingCriteria={billingCriteria}
                            onBillingCriteriaChange={setBillingCriteria}
                          />
                        </section>
                      )}

                      {/* TAB: REVIEW */}
                      {activeTab === 'review' && (
                        <section>
                          <div className="met-np-section-header">
                            <h3 className="met-np-section-title">REVIEW & CONFIRM</h3>
                          </div>
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
                        </section>
                      )}
                    </div>

                    {/* FOOTER (mirrors NewProduct) */}
                    <div className="met-np-form-footer">
                      {errors.form && <div className="met-met-np-error-message">{errors.form}</div>}

                      {activeTab === 'metric' && (
                        <div className="met-np-btn-group met-np-btn-group--next">
                          <button type="button" className="met-np-btn met-np-btn--primary" onClick={handleSaveAndNext}>
                            Save & Next
                          </button>
                        </div>
                      )}

                      {activeTab === 'conditions' && (
                        <>
                          <div className="met-np-btn-group met-np-btn-group--back">
                            <button type="button" className="met-np-btn met-np-btn--ghost" onClick={() => gotoStep(0)}>
                              Back
                            </button>
                          </div>
                          <div className="met-np-btn-group met-np-btn-group--next">
                            <button type="button" className="met-np-btn np-btn--primary" onClick={handleSaveAndNext}>
                              Save & Next
                            </button>
                          </div>
                        </>
                      )}

                      {activeTab === 'review' && (
                        <>
                          <div className="met-np-btn-group met-np-btn-group--back">
                            <button type="button" className="met-np-btn met-np-btn--ghost" onClick={() => gotoStep(1)}>
                              Back
                            </button>
                          </div>
                          <div className="met-np-btn-group met-np-btn-group--next">
                            <button
                              type="button"
                              className="met-np-btn met-np-btn--primary"
                              onClick={async () => {
                                if (!metricId) return;
                                setSaving(true);
                                console.log('Finalize call for metricId', metricId);
                                const finalized = await finalizeBillableMetric(metricId);
                                setSaving(false);
                                if (finalized) onClose();
                                else alert('Finalize failed');
                              }}
                              disabled={saving}
                            >
                              {saving ? 'Submitting...' : 'Create Metric'}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </form>
                </div>
              </div>
            </main>
          </div>

          <div className="af-skel-rule af-skel-rule--bottom" />

          {/* Save Draft confirmation modal (same behavior as NewProduct) */}
          <SaveDraft
            isOpen={showSavePrompt}
            onClose={async () => {
              setShowSavePrompt(false);
              await deleteAndClose();
            }}
            onSave={async () => {
              const ok = await handleSaveDraft();
              showToast({
                kind: ok ? 'success' : 'error',
                title: ok ? 'Draft Saved' : 'Failed to Save Draft',
                message: ok ? 'Usage metric draft saved successfully.' : 'Unable to save draft. Please try again.'
              });
              onClose();
            }}
          />
        </div>
      </div>

      {/* Delete confirmation modal */}
      <ConfirmDeleteModal
        isOpen={showDeleteConfirm}
        productName={metricName || 'this metric'}
        onConfirm={async () => {
          setShowDeleteConfirm(false);
          await deleteAndClose();
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
}
