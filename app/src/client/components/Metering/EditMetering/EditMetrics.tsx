// EditMetrics.tsx (NOW USING EditSubscription SHELL + CLASSNAMES — SAME AS EditProduct)

import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

import TopBar from '../../componenetsss/TopBar';
import { InputField, TextareaField, SelectField } from '../../componenetsss/Inputs';
import ConfirmDeleteModal from '../../componenetsss/ConfirmDeleteModal';
import { useToast } from '../../componenetsss/ToastProvider';
import PrimaryButton from '../../componenetsss/PrimaryButton';
import SecondaryButton from '../../componenetsss/SecondaryButton';
import EditPopup from '../../componenetsss/EditPopUp';
import VerticalScrollbar from '../../componenetsss/VerticalScrollbar';
import MetricRow from '../../componenetsss/MetricRow';
import UnsavedChangesModal from '../../componenetsss/UnsavedChangesModal';

import { getProducts, Product, updateBillableMetric, getBillableMetricById } from './api';

import EditUsage from './EditUsage';
import EditAggregationFunction from './EditAggregationFunction';
import EditAggregationWindow from './EditAggregationWindow';
import EditReview from './Review';

import '../../componenetsss/EditSkeletonForm.css';
// NOTE: your old EditMetrics.css (editmet-np-*) won’t match anymore. Keep it only if it has shared styles.

type ActiveTab = 'metric' | 'conditions' | 'review';

interface EditMetricsProps {
  onClose: () => void;
  metricId?: string | number;
}

const steps = [
  { id: 1, title: 'Metric & Aggregation', desc: 'Name, product, UOM and aggregation.' },
  { id: 2, title: 'Usage Conditions', desc: 'Filters and billing criteria.' },
  { id: 3, title: 'Review & Confirm', desc: 'Validate all details before saving.' },
];

const EditMetrics: React.FC<EditMetricsProps> = ({ onClose, metricId: propMetricId = '' }) => {
  const { showToast } = useToast();
  const { id: urlMetricId } = useParams<{ id: string }>();

  // Use URL param if available, otherwise use prop
  const metricId = (urlMetricId || propMetricId) as string | number;

  // rails / tabs
  const [currentStep, setCurrentStep] = useState(0);
  const [activeTab, setActiveTab] = useState<ActiveTab>('metric');

  // popup / modals
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSaveDraftModal, setShowSaveDraftModal] = useState(false);
  const [showUnsavedChangesModal, setShowUnsavedChangesModal] = useState(false);

  // form state
  const [metricName, setMetricName] = useState('');
  const [version, setVersion] = useState('');
  const [unitOfMeasure, setUnitOfMeasure] = useState('');
  const [description, setDescription] = useState('');
  const [aggregationFunction, setAggregationFunction] = useState('');
  const [aggregationWindow, setAggregationWindow] = useState('');
  const [billingCriteria, setBillingCriteria] = useState('');
  const [usageConditions, setUsageConditions] = useState<{ dimension: string; operator: string; value: string }[]>(
    [],
  );

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedProductName, setSelectedProductName] = useState<string>('');
  const [selectedProductType, setSelectedProductType] = useState<string>('');

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // originals for diff-only updates
  const originalValuesRef = useRef<any>(null);

  // scroll + custom scrollbar (same as EditProduct)
  const formSectionRef = useRef<HTMLDivElement>(null);
  const [scrollHeight, setScrollHeight] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!formSectionRef.current) return;
      const { scrollTop, scrollHeight, clientHeight } = formSectionRef.current;
      const pct = (scrollTop / Math.max(1, scrollHeight - clientHeight)) * 100;
      setScrollHeight(pct);
    };

    const el = formSectionRef.current;
    if (!el) return;

    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

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
          productId: data.productId ? String(data.productId) : '',
          productName: data.productName ?? '',
        };

        originalValuesRef.current = original;

        setMetricName(original.metricName);
        setVersion(original.version);
        setUnitOfMeasure(original.unitOfMeasure);
        setDescription(original.description);
        setAggregationFunction(original.aggregationFunction);
        setAggregationWindow(original.aggregationWindow);
        setUsageConditions(original.usageConditions);
        setBillingCriteria(original.billingCriteria);

        if (original.productId) setSelectedProductId(original.productId);
        if (original.productName) setSelectedProductName(original.productName);
      } catch (e) {
        console.error('Failed to prefill metric:', e);
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

  const goToStep = (index: number) => {
    setCurrentStep(index);
    setActiveTab(index === 0 ? 'metric' : index === 1 ? 'conditions' : 'review');
  };

  const clearConditionError = (key: string) => {
    setErrors(prev => {
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const validateStep = (index: number): boolean => {
    const e: Record<string, string> = {};

    if (index === 0) {
      if (!metricName.trim()) e.metricName = 'Metric name is required';
      if (!selectedProductId) e.product = 'Product is required';
      if (!unitOfMeasure) e.unitOfMeasure = 'Unit of Measure is required';
    }

    if (index === 1) {
      if (!billingCriteria) e.billingCriteria = 'Billing criteria is required';
      
      // Only validate usage conditions if billing criteria is "Bill based on usage conditions"
      if (billingCriteria === 'BILL_BASED_ON_USAGE_CONDITIONS') {
        // (Optional) if user typed partial condition row, block next:
        const hasPartial = usageConditions.some(c => !!(c.dimension || c.operator || c.value) && !(c.dimension && c.operator && c.value));
        if (hasPartial) e.usageConditions = 'Complete or clear incomplete conditions';
        
        // Check if first condition is complete
        const first = usageConditions[0] || { dimension: '', operator: '', value: '' };
        if (!first.dimension || !first.operator || !first.value) {
          e.usageConditions = 'Dimension, Operator, and Value are required for usage conditions';
        }
      }
    }

    if (index === 2) {
      if (!metricName.trim() || !selectedProductId || !unitOfMeasure || !billingCriteria) {
        e.form = 'Please fill all required fields';
      }
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const buildChangedPayload = () => {
    const original = originalValuesRef.current || {};
    const payload: any = { metricId: Number(metricId) };

    const pushIfChanged = (key: string, value: any) => {
      if (value !== original[key]) payload[key] = value;
    };

    pushIfChanged('metricName', metricName);
    pushIfChanged('version', version);
    pushIfChanged('unitOfMeasure', unitOfMeasure);
    pushIfChanged('description', description);
    pushIfChanged('aggregationFunction', aggregationFunction);
    pushIfChanged('aggregationWindow', aggregationWindow);
    pushIfChanged('billingCriteria', billingCriteria);

    if (selectedProductId && selectedProductId !== original.productId) {
      payload.productId = Number(selectedProductId);
    }

    const currentConditions = JSON.stringify(usageConditions);
    const originalConditions = JSON.stringify(original.usageConditions || []);
    if (currentConditions !== originalConditions) {
      const valid = usageConditions.filter(c => c.dimension && c.operator && c.value);
      payload.usageConditions = valid.length ? valid : [];
    }

    return payload;
  };

  const hasPendingChanges = () => {
    const payload = buildChangedPayload();
    return Object.keys(payload).length > 1;
  };

  const hasEmptyRequiredFields = () => {
    if (activeTab === 'metric') {
      return !metricName.trim() || !selectedProductId || !version.trim() || !unitOfMeasure;
    }
    if (activeTab === 'conditions') {
      return !billingCriteria;
    }
    return false;
  };

  const saveAllChanges = async (): Promise<boolean> => {
    if (!metricId) return false;

    try {
      setLoading(true);

      const payload = buildChangedPayload();
      if (Object.keys(payload).length <= 1) return false; // nothing to save

      const ok = await updateBillableMetric(Number(metricId), payload);
      if (!ok) throw new Error('Failed to update metric');

      // reset original snapshot
      originalValuesRef.current = {
        ...(originalValuesRef.current || {}),
        metricName,
        version,
        unitOfMeasure,
        description,
        aggregationFunction,
        aggregationWindow,
        billingCriteria,
        usageConditions,
        productId: selectedProductId,
        productName: selectedProductName,
      };

      return true;
    } catch (err) {
      console.error('Error saving metric:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleNextStep = async () => {
    if (activeTab === 'metric') {
      if (!validateStep(0)) return;
      goToStep(1);
      return;
    }

    if (activeTab === 'conditions') {
      if (!validateStep(1)) return;
      goToStep(2);
      return;
    }

    if (activeTab === 'review') {
      const changesExist = hasPendingChanges();
      if (!changesExist) {
        onClose();
        return;
      }

      if (!validateStep(2)) return;

      const success = await saveAllChanges();
      if (success) {
        showToast({ kind: 'success', title: 'Changes Saved', message: 'Metric updated successfully.' });
        onClose();
      } else {
        showToast({
          kind: 'error',
          title: 'Failed to Save Changes',
          message: 'Could not update metric. Please try again.',
        });
      }
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) goToStep(currentStep - 1);
  };

  const renderMetricTab = () => {
    const uomOptionsMap: Record<string, string[]> = {
      API: ['API_CALL', 'REQUEST', 'TRANSACTION', 'HIT'],
      FLATFILE: ['FILE', 'ROW', 'RECORD', 'DELIVERY', 'MB'],
      SQLRESULT: ['CELL', 'MB', 'ROW', 'QUERY_EXECUTION'],
      LLMTOKEN: ['TOKEN', 'PROMPT_TOKEN', 'COMPLETION_TOKEN'],
    };

    const key = (selectedProductType || '').toUpperCase();
    const uomOptions = (uomOptionsMap[key] || ['UNIT']).map(o => ({ label: o, value: o }));

    return (
      <div className="edit-np-section">
        <div className="edit-np-form-row">
          <div className="edit-np-form-group">
            <InputField
              label="Metric Name"
              required
              value={metricName}
              onChange={(v: string) => {
                setMetricName(v);
                if (errors.metricName) {
                  const { metricName, ...rest } = errors;
                  setErrors(rest);
                }
              }}
              placeholder="eg. API Calls"
              error={errors.metricName}
            />
          </div>

          <div className="edit-np-form-group">
            <SelectField
              label="Product"
              required
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

                setErrors(prev => {
                  const next = { ...prev };
                  delete next.product;
                  return next;
                });
              }}
              options={products.map(p => ({
                label: p.productName,
                value: String(p.productId),
              }))}
              error={errors.product}
            />
          </div>
        </div>

        <div className="edit-np-form-row">
          <div className="edit-np-form-group">
            <InputField
              label="Version"
              value={version}
              onChange={(v: string) => {
                setVersion(v);
                if (errors.version) {
                  const { version, ...rest } = errors;
                  setErrors(rest);
                }
              }}
              placeholder="eg. v1.0"
              error={errors.version}
            />
          </div>

          <div className="edit-np-form-group">
            <TextareaField
              label="Description"
              value={description}
              onChange={(v: string) => setDescription(v)}
              placeholder="Describe what this metric measures..."
            />
          </div>
        </div>

        <div className="edit-np-form-row">
          <div className="edit-np-form-group">
            <SelectField
              label="UOM"
              required
              placeholder="Select Unit"
              value={unitOfMeasure}
              onChange={(v: string) => {
                setUnitOfMeasure(v);
                setErrors(prev => {
                  const next = { ...prev };
                  delete next.unitOfMeasure;
                  return next;
                });
              }}
              options={uomOptions}
              error={errors.unitOfMeasure}
            />
          </div>

          <div className="edit-np-form-group">
            <EditAggregationFunction
              label="Aggregation Function"
              productType={selectedProductType}
              unitOfMeasure={unitOfMeasure}
              value={aggregationFunction}
              onChange={(v: string) => {
                setAggregationFunction(v);
                setErrors(prev => {
                  const next = { ...prev };
                  delete next.aggregationFunction;
                  return next;
                });
              }}
            />
          </div>

          <div className="edit-np-form-group">
            <EditAggregationWindow
              label="Aggregation Window"
              productType={selectedProductType}
              unitOfMeasure={unitOfMeasure}
              value={aggregationWindow}
              onChange={(v: string) => setAggregationWindow(v)}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <TopBar
        title={metricName ? `Edit ${metricName}` : 'Edit Usage Metric'}
        onBack={() => {
          if (hasEmptyRequiredFields()) {
            setShowUnsavedChangesModal(true);
            return;
          }

          const hasChanges = hasPendingChanges();
          if (hasChanges) setShowSaveDraftModal(true);
          else onClose();
        }}
      />

      {/* === SHELL: EXACTLY LIKE EditProduct / EditSubscription (editsub-np-*) === */}
      <div className="editsub-np-viewport">
        <div className="editsub-np-card">
          <div className="editsub-np-grid">
            {/* Sidebar / rail */}
            <aside className="editsub-np-rail">
              <nav className="editsub-np-steps">
                {steps.map((step, index) => {
                  const isActive = index === currentStep;
                  const isCompleted = index < currentStep;

                  return (
                    <MetricRow
                      key={step.id}
                      title={step.title}
                      state={isActive ? 'active' : 'default'}
                      className={['editsub-np-step', isActive ? 'active' : '', isCompleted ? 'completed' : '']
                        .join(' ')
                        .trim()}
                      onClick={async () => {
                        if (index === currentStep) return;

                        // go back freely
                        if (index < currentStep) {
                          goToStep(index);
                          return;
                        }

                        // forward: validate all steps up to the target step
                        if (index > currentStep) {
                          // Validate all steps from current to target
                          for (let i = currentStep; i < index; i++) {
                            const ok = validateStep(i);
                            if (!ok) return;
                          }
                          goToStep(index);
                          return;
                        }
                      }}
                    />
                  );
                })}
              </nav>
            </aside>

            {/* Main content area */}
            <main className="editsub-np-main">
              <div className="editsub-np-main__inner">
                <div className="editsub-np-body">
                  <form className="editsub-np-form" onSubmit={e => e.preventDefault()}>
                    <div className="editsub-np-form-section" ref={formSectionRef}>
                      {loading ? (
                        <div style={{ padding: 20 }}>Loading...</div>
                      ) : (
                        <>
                          {/* METRIC */}
                          {activeTab === 'metric' && renderMetricTab()}

                          {/* CONDITIONS */}
                          {activeTab === 'conditions' && (
                            <div className="edit-np-section">
                              <EditUsage
                                productType={selectedProductType}
                                unitOfMeasure={unitOfMeasure}
                                conditions={usageConditions}
                                setConditions={setUsageConditions}
                                billingCriteria={billingCriteria}
                                onBillingCriteriaChange={(v: string) => {
                                  setBillingCriteria(v);
                                  if (errors.billingCriteria) {
                                    const { billingCriteria, ...rest } = errors;
                                    setErrors(rest);
                                  }
                                }}
                              />

                              {/* inline errors to match step validation */}
                              {!!errors.usageConditions && (
                                <div style={{ marginTop: 10, fontSize: 12, color: '#B42318' }}>
                                  {errors.usageConditions}
                                </div>
                              )}
                              {!!errors.billingCriteria && (
                                <div style={{ marginTop: 10, fontSize: 12, color: '#B42318' }}>
                                  {errors.billingCriteria}
                                </div>
                              )}
                            </div>
                          )}

                          {/* REVIEW */}
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
                    </div>

                    {/* Custom Scrollbar (same logic as EditProduct) */}
                    {formSectionRef.current &&
                      formSectionRef.current.scrollHeight > formSectionRef.current.clientHeight && (
                        <div
                          style={{
                            position: 'absolute',
                            right: '8px',
                            top: `${scrollHeight}%`,
                            transition: 'top 0.1s ease-out',
                            pointerEvents: 'none',
                          }}
                        >
                          <VerticalScrollbar
                            height={`${
                              (formSectionRef.current.clientHeight / formSectionRef.current.scrollHeight) * 100
                            }%`}
                            color="#C3C2D0"
                            thickness={4}
                            className="editsub-scrollbar-custom"
                          />
                        </div>
                      )}

                    {/* Footer (EditSubscription classnames) */}
                    <div className="editsub-np-form-footer">
                      <div className="editsub-np-btn-group editsub-np-btn-group--back">
                        {activeTab !== 'metric' && (
                          <SecondaryButton type="button" onClick={handlePreviousStep} disabled={loading}>
                            Back
                          </SecondaryButton>
                        )}
                      </div>

                      <div className="editsub-np-btn-group editsub-np-btn-group--next">
                        <PrimaryButton type="button" onClick={handleNextStep} disabled={loading}>
                          {loading ? '' : activeTab === 'review' ? 'Save Changes' : 'Save & Next'}
                        </PrimaryButton>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </main>
          </div>

          {/* match your EditProduct bottom rule placement */}
          <div className="edit-af-skel-rule edit-af-skel-rule--bottom" />
        </div>
      </div>

      {/* Save draft popup (same pattern as EditProduct) */}
      <EditPopup
        isOpen={showSaveDraftModal}
        onClose={() => {
          setShowSaveDraftModal(false);
          onClose();
        }}
        onDismiss={() => setShowSaveDraftModal(false)}
        onSave={async () => {
          setShowSaveDraftModal(false);

          if (!hasPendingChanges()) {
            onClose();
            return;
          }

          const success = await saveAllChanges();
          if (success) {
            showToast({ kind: 'success', title: 'Changes Saved', message: 'Metric updated successfully.' });
            onClose();
          } else {
            showToast({
              kind: 'error',
              title: 'Failed to Save Changes',
              message: 'Could not update metric. Please try again.',
            });
          }
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

      {showUnsavedChangesModal && (
        <UnsavedChangesModal
          onDiscard={() => {
            setShowUnsavedChangesModal(false);
            onClose();
          }}
          onKeepEditing={() => setShowUnsavedChangesModal(false)}
          onClose={() => setShowUnsavedChangesModal(false)}
        />
      )}
    </>
  );
};

export default EditMetrics;
