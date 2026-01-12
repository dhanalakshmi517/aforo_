// CreateUsageMetric.tsx
import * as React from 'react';
import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import TopBar from '../componenetsss/TopBar';
import { InputField, TextareaField, DropdownField } from '../componenetsss/Inputs';
import ConfirmDeleteModal from '../componenetsss/ConfirmDeleteModal';
import SaveDraft from '../componenetsss/SaveDraft';
import { useToast } from '../componenetsss/ToastProvider';
import PrimaryButton from '../componenetsss/PrimaryButton';
import SecondaryButton from '../componenetsss/SecondaryButton';
import ProductCreatedSuccess from '../componenetsss/ProductCreatedSuccess';
import SectionHeader from '../componenetsss/SectionHeader';

import {
  getProducts,
  getUsageMetric,
  Product,
  createBillableMetric,
  updateBillableMetric,
  finalizeBillableMetric,
  deleteUsageMetric
} from './api';

import UsageConditionForm from './UsageConditionForm';
import AggregationFunctionSelect from './AggregationFunctionSelect';
import AggregationWindowSelect from './AggregationWindowSelect';
import Review from './Review';

import './Usagemetric.css';
import '../componenetsss/SkeletonForm.css';

type ActiveTab = 'metric' | 'conditions' | 'review';

const steps = [
  { id: 1, title: 'Define Metric & Aggregation', desc: 'Give your metric a name, set its unit, and connect it to the product or event source it will measure.' },
  { id: 2, title: 'Usage Conditions', desc: 'Define how usage is calculated — set thresholds, group data, and apply any rules needed for billing.' },
  { id: 3, title: 'Review & Confirm', desc: 'Review your setup to make sure everything is correct before saving the metric.' }
];

interface CreateUsageMetricProps { onClose: () => void; draftMetricId?: number; }

export default function CreateUsageMetric({ onClose, draftMetricId }: CreateUsageMetricProps): React.JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const draftFromState = (location.state as any)?.draftMetricId;
  const activeMetricId = draftFromState || draftMetricId;

  const deleteAndClose = async () => {
    // If this is a draft metric (either new or existing), just discard changes and navigate back
    // without deleting the metric from the database
    if (activeMetricId) {
      // This is an existing draft being edited - just navigate back to preserve the draft
      onClose();
      return;
    }

    if (!metricId) {
      // This is a new metric that was never saved - just navigate back
      onClose();
      return;
    }

    // This is a finalized metric - delete it from database
    try {
      await deleteUsageMetric(metricId);
      showToast({
        kind: 'success',
        title: 'Metric Deleted',
        message: 'Metric deleted successfully.'
      });
    } catch (e) {
      console.error('Failed to delete metric', e);
      showToast({
        kind: 'error',
        title: 'Delete Failed',
        message: 'Unable to delete metric. Please try again.'
      });
    } finally {
      onClose();
    }
  };

  useEffect(() => {
    document.body.classList.add('create-product-page');
    const handleBackButton = (event: PopStateEvent) => {
      event.preventDefault();
      navigate('/get-started/metering');
    };
    window.addEventListener('popstate', handleBackButton);
    window.history.pushState(null, '', window.location.pathname);
    return () => {
      document.body.classList.remove('create-product-page');
      window.removeEventListener('popstate', handleBackButton);
    };
  }, [navigate]);

  const [currentStep, setCurrentStep] = useState(0);
  const [activeTab, setActiveTab] = useState<ActiveTab>('metric');

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSavePrompt, setShowSavePrompt] = useState(false);

  const [isDraftSaving, setIsDraftSaving] = useState(false);
  const [isDraftSaved, setIsDraftSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [hasEverBeenEnabled, setHasEverBeenEnabled] = useState(false);
  const [initialFormState, setInitialFormState] = useState<any>(null);

  // form
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

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [conditionErrors, setConditionErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (activeMetricId) {
      (async () => {
        console.log('Fetching metric with ID:', activeMetricId);
        const data = await getUsageMetric(activeMetricId);
        console.log('API Response:', JSON.stringify(data, null, 2));

        if (data) {
          console.log('Setting form state with data:', {
            metricId: (data as any).metricId ?? (data as any).billableMetricId ?? null,
            metricName: (data as any).metricName || '',
            productId: String((data as any).productId),
            productType: (data as any).productType || '',
            unitOfMeasure: (data as any).unitOfMeasure || '',
            description: (data as any).description || '',
            aggregationFunction: (data as any).aggregationFunction || '',
            aggregationWindow: (data as any).aggregationWindow || '',
            billingCriteria: (data as any).billingCriteria || '',
            usageConditions: (data as any).usageConditions || [],
            version: (data as any).version || ''
          });

          const loadedState = {
            metricName: (data as any).metricName || '',
            selectedProductId: String((data as any).productId || ''),
            version: (data as any).version || '',
            unitOfMeasure: (data as any).unitOfMeasure || '',
            description: (data as any).description || '',
            aggregationFunction: (data as any).aggregationFunction || '',
            aggregationWindow: (data as any).aggregationWindow || '',
            billingCriteria: (data as any).billingCriteria || '',
            usageConditions: (data as any).usageConditions || []
          };
          setInitialFormState(loadedState);

          setMetricId((data as any).metricId ?? (data as any).billableMetricId ?? null);
          setMetricName((data as any).metricName || '');
          // Only set productId if it's a valid value (not null/undefined)
          const productId = (data as any).productId;
          if (productId != null && productId !== '' && !isNaN(Number(productId))) {
            setSelectedProductId(String(productId));
          }
          if ((data as any).productType) setSelectedProductType((data as any).productType);
          setUnitOfMeasure((data as any).unitOfMeasure || '');
          setDescription((data as any).description || '');
          setAggregationFunction((data as any).aggregationFunction || '');
          setAggregationWindow((data as any).aggregationWindow || '');
          setBillingCriteria((data as any).billingCriteria || '');
          const conditions = (data as any).usageConditions || [];
          console.log('Setting usage conditions:', conditions);
          setUsageConditions(conditions);
          if ((data as any).version) setVersion((data as any).version);
        } else {
          console.log('No data received from getUsageMetric');
        }
      })();
    } else {
      console.log('No activeMetricId provided, starting with empty form');
    }
  }, [activeMetricId]);

  useEffect(() => {
    getProducts().then(setProducts).catch((err) => console.error('Failed to load products', err));
  }, []);

  useEffect(() => {
    if (selectedProductId && products.length) {
      const prod = products.find(p => String(p.productId) === selectedProductId);
      if (prod) {
        setSelectedProductName(prod.productName);
        setSelectedProductType(prod.productType);
      }
    }
  }, [products, selectedProductId]);

  // Reset draft saved state when any form field is modified
  useEffect(() => {
    if (isDraftSaved) {
      setIsDraftSaved(false);
    }
  }, [
    metricName,
    selectedProductId,
    version,
    unitOfMeasure,
    description,
    aggregationFunction,
    aggregationWindow,
    billingCriteria,
    usageConditions
  ]);

  // anything typed (or condition row started)?
  const hasAnyRequiredInput = useMemo(() => {
    const first = usageConditions[0] || { dimension: '', operator: '', value: '' };
    return Boolean(
      metricName.trim() ||
      selectedProductId ||
      version.trim() ||
      description.trim() ||
      unitOfMeasure ||
      aggregationFunction ||
      aggregationWindow ||
      billingCriteria ||
      first.dimension || first.operator || first.value
    );
  }, [
    metricName,
    selectedProductId,
    version,
    description,
    unitOfMeasure,
    aggregationFunction,
    aggregationWindow,
    billingCriteria,
    usageConditions
  ]);

  const isConditionsLocked = !hasAnyRequiredInput;

  const hasUserMadeChanges = useMemo(() => {
    if (!initialFormState) {
      // No draft loaded, enable buttons if user has input
      return hasAnyRequiredInput;
    }
    // Draft loaded, check if current state differs from initial state
    return (
      metricName !== initialFormState.metricName ||
      selectedProductId !== initialFormState.selectedProductId ||
      version !== initialFormState.version ||
      unitOfMeasure !== initialFormState.unitOfMeasure ||
      description !== initialFormState.description ||
      aggregationFunction !== initialFormState.aggregationFunction ||
      aggregationWindow !== initialFormState.aggregationWindow ||
      billingCriteria !== initialFormState.billingCriteria ||
      JSON.stringify(usageConditions) !== JSON.stringify(initialFormState.usageConditions)
    );
  }, [
    initialFormState,
    metricName,
    selectedProductId,
    version,
    unitOfMeasure,
    description,
    aggregationFunction,
    aggregationWindow,
    billingCriteria,
    usageConditions,
    hasAnyRequiredInput
  ]);

  useEffect(() => {
    if (hasUserMadeChanges && !hasEverBeenEnabled) {
      setHasEverBeenEnabled(true);
    }
  }, [hasUserMadeChanges, hasEverBeenEnabled]);

  // Lock review step if Usage Conditions step (step 2) is incomplete
  const isReviewLocked = useMemo(() => {
    // Billing criteria is always required
    if (!billingCriteria) return true;

    // Only require usage conditions if billing criteria is "Bill based on usage conditions"
    if (billingCriteria === 'BILL_BASED_ON_USAGE_CONDITIONS') {
      const first = usageConditions[0] || { dimension: '', operator: '', value: '' };
      if (!first.dimension || !first.operator || !first.value) {
        return true; // Lock if conditions are incomplete
      }
    }

    return false; // Unlock if validation passes
  }, [billingCriteria, usageConditions]);

  const handleTopbarBack = () => {
    if (hasAnyRequiredInput || metricId) {
      setShowSavePrompt(true);
    } else {
      navigate('/get-started/metering');
    }
  };

  const gotoStep = (index: number) => {
    if (index < 0 || index > 2) return;

    // Don't navigate if trying to go to the same step
    if (index === currentStep) return;

    // Validate current step before allowing navigation away from it
    if (currentStep === 0) {
      // Validate metric step only if user has filled at least one field
      const hasMetricInput = Boolean(
        metricName.trim() ||
        selectedProductId ||
        version.trim() ||
        description.trim() ||
        unitOfMeasure ||
        aggregationFunction ||
        aggregationWindow
      );
      
      if (hasMetricInput) {
        const isValid = validateCurrentStep(0);
        if (!isValid) return;
      }
    }

    if (currentStep === 1) {
      // Skip validation if conditions step is locked
      if (!isConditionsLocked) {
        const isValid = validateCurrentStep(1);
        if (!isValid) return;
      }
    }

    setCurrentStep(index);
    const map: ActiveTab[] = ['metric', 'conditions', 'review'];
    setActiveTab(map[index] || 'metric');
  };

  const clearConditionError = (key: string) => {
    setConditionErrors(prev => {
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const validateCurrentStep = (step: number): boolean => {
    const step0Errors: Record<string, string> = {};
    const step1CondErrors: Record<string, string> = {};

    if (step === 0) {
      if (!metricName.trim()) step0Errors.metricName = 'Metric name is required';
      if (!selectedProductId) step0Errors.product = 'Product is required';
      if (!unitOfMeasure) step0Errors.unitOfMeasure = 'Unit of Measure is required';
      // Description, Aggregation Function, and Aggregation Window are now optional
      setErrors(step0Errors);
      return Object.keys(step0Errors).length === 0;
    }

    if (step === 1) {
      // Only validate usage conditions if billing criteria is "Bill based on usage conditions"
      if (billingCriteria === 'BILL_BASED_ON_USAGE_CONDITIONS') {
        const first = usageConditions[0] || { dimension: '', operator: '', value: '' };
        if (!first.dimension) step1CondErrors['0.dimension'] = 'Dimension is required';
        if (!first.operator) step1CondErrors['0.operator'] = 'Operator is required';
        if (!first.value) step1CondErrors['0.value'] = 'Value is required';
      }

      const nextErrors = { ...errors };
      if (!billingCriteria) nextErrors.billingCriteria = 'Billing criteria is required';
      else if (nextErrors.billingCriteria) delete nextErrors.billingCriteria;

      setErrors(nextErrors);
      setConditionErrors(step1CondErrors);

      return Object.keys(step1CondErrors).length === 0 && !nextErrors.billingCriteria;
    }

    if (step === 2) {
      if (!metricName.trim() || !selectedProductId || !unitOfMeasure) {
        setErrors({ form: 'Please fill all required fields' });
        return false;
      }
      setErrors({});
      return true;
    }

    return true;
  };

  const clean = (obj: any) => {
    const out: any = {};
    Object.entries(obj).forEach(([k, v]) => {
      if (v === undefined || v === null) return;
      if (typeof v === 'string' && v.trim() === '') return;
      if (Array.isArray(v) && v.length === 0) return;
      out[k] = v;
    });
    return out;
  };

  const buildPayload = (isDraft: boolean) => {
    // When billing excludes usage conditions, don't send any usage conditions
    const shouldIncludeUsageConditions = billingCriteria !== 'BILL_EXCLUDING_USAGE_CONDITIONS';

    // Filter out incomplete conditions (empty dimension, operator, or value)
    const validConditions = usageConditions.filter(c =>
      c.dimension?.trim() && c.operator?.trim() && c.value?.trim()
    );

    if (metricId) {
      const payload: any = {
        metricId,
        metricName: metricName || undefined,
        productId: selectedProductId ? Number(selectedProductId) : undefined,
        unitOfMeasure: unitOfMeasure || undefined,
        aggregationFunction: aggregationFunction || undefined,
        aggregationWindow: aggregationWindow || undefined,
        billingCriteria: billingCriteria || undefined,
        version: version?.trim() || undefined,
        description: description?.trim() ? description.trim() : undefined,
        usageConditions: shouldIncludeUsageConditions && validConditions?.length ? validConditions : [],
      };
      return clean(payload);
    }

    if (isDraft) {
      const payload: any = {
        usageConditions: shouldIncludeUsageConditions && validConditions?.length ? validConditions : []
      };
      if (metricName.trim()) payload.metricName = metricName.trim();
      if (selectedProductId) payload.productId = Number(selectedProductId);
      if (version?.trim()) payload.version = version.trim();
      if (unitOfMeasure.trim()) payload.unitOfMeasure = unitOfMeasure.trim();
      if (description.trim()) payload.description = description.trim();
      if (aggregationFunction) payload.aggregationFunction = aggregationFunction;
      if (aggregationWindow) payload.aggregationWindow = aggregationWindow;
      if (billingCriteria) payload.billingCriteria = billingCriteria;
      return clean(payload);
    }

    // For new metric creation (non-draft), only include fields that have values
    const payload: any = {
      metricName: metricName.trim(),
      productId: Number(selectedProductId),
      unitOfMeasure: unitOfMeasure.trim(),
      usageConditions: shouldIncludeUsageConditions && validConditions?.length ? validConditions : []
    };

    // Only include optional fields if they have values
    if (version?.trim()) payload.version = version.trim();
    if (description?.trim()) payload.description = description.trim();
    if (aggregationFunction) payload.aggregationFunction = aggregationFunction;
    if (aggregationWindow) payload.aggregationWindow = aggregationWindow;
    if (billingCriteria) payload.billingCriteria = billingCriteria;

    return clean(payload);
  };

  const saveOrUpdateMetric = async (isDraft = false, skipFinalize = false) => {
    // Only validate if not a draft save or if it's the final submission
    if (!isDraft && !validateCurrentStep(currentStep)) return false;

    const payload = buildPayload(isDraft);
    console.log('Saving metric with payload:', JSON.stringify(payload, null, 2));

    if (metricId) {
      const nonIdKeys = Object.keys(payload).filter(k => k !== 'metricId');
      if (nonIdKeys.length === 0) {
        // Before finalizing, clean up any null values that might exist
        if (!isDraft && !skipFinalize) {
          // Send an update to explicitly clear null optional fields
          const cleanupPayload: any = { metricId };

          // Only include non-empty values to overwrite nulls
          if (metricName?.trim()) cleanupPayload.metricName = metricName.trim();
          if (selectedProductId) cleanupPayload.productId = Number(selectedProductId);
          if (unitOfMeasure?.trim()) cleanupPayload.unitOfMeasure = unitOfMeasure.trim();
          if (version?.trim()) cleanupPayload.version = version.trim();
          if (description?.trim()) cleanupPayload.description = description.trim();
          if (aggregationFunction?.trim()) cleanupPayload.aggregationFunction = aggregationFunction.trim();
          if (aggregationWindow?.trim()) cleanupPayload.aggregationWindow = aggregationWindow.trim();
          if (billingCriteria?.trim()) cleanupPayload.billingCriteria = billingCriteria.trim();

          const validConditions = usageConditions.filter(c =>
            c.dimension?.trim() && c.operator?.trim() && c.value?.trim()
          );
          if (validConditions.length > 0) {
            cleanupPayload.usageConditions = validConditions;
          }

          // Send cleanup update
          await updateBillableMetric(metricId, cleanupPayload);

          // Now finalize
          const finalized = await finalizeBillableMetric(metricId);
          if (!finalized) {
            setErrors(prev => ({ ...prev, form: 'Failed to finalize metric' }));
            return false;
          }
        }
        return true;
      }
    }

    if (!metricId && Object.keys(payload).length === 0) {
      return true;
    }

    try {
      if (metricId) {
        const success = await updateBillableMetric(metricId, payload);
        if (!success) throw new Error('Failed to update metric');
        if (!isDraft && !skipFinalize) {
          const finalized = await finalizeBillableMetric(metricId);
          if (!finalized) throw new Error('Failed to finalize metric');
          setShowSuccess(true);
        }
        return true;
      } else {
        const res = await createBillableMetric(payload);
        console.log('Create response:', res);
        if (!res.ok || !res.id) throw new Error('Failed to create metric');
        setMetricId(res.id);
        if (!isDraft && !skipFinalize) {
          const finalized = await finalizeBillableMetric(res.id);
          if (!finalized) throw new Error('Failed to finalize metric');
          setShowSuccess(true);
        }
        return true;
      }
    } catch (e) {
      console.error('Error saving metric:', e);
      setErrors(prev => ({ ...prev, form: 'Failed to save metric. Please check all required fields.' }));
      return false;
    }
  };

  const handleSaveAndNext = async () => {
    if (!validateCurrentStep(currentStep)) return;

    if (activeTab === 'metric') {
      setSaving(true);
      const ok = await saveOrUpdateMetric(true);
      setSaving(false);
      if (!ok) return;
      gotoStep(1);
      return;
    }
    if (activeTab === 'conditions') {
      setSaving(true);
      const ok = await saveOrUpdateMetric(false, true);
      setSaving(false);
      if (!ok) return;
      gotoStep(2);
      return;
    }
    if (activeTab === 'review') {
      if (!metricId) return;
      setSaving(true);
      const finalized = await finalizeBillableMetric(metricId);
      setSaving(false);
      if (finalized) {
        setShowSuccess(true);
      } else {
        showToast({
          kind: 'error',
          title: 'Failed to Finalize',
          message: 'Unable to finalize the metric. Please try again.'
        });
      }
    }
  };

  const handleSaveDraft = async () => {
    if (isDraftSaving) return false;
    try {
      setIsDraftSaving(true);
      setIsDraftSaved(false);

      console.log('Saving draft, current metricId:', metricId);
      const payload = buildPayload(true);
      console.log('Draft payload:', JSON.stringify(payload, null, 2));

      let ok;
      if (metricId) {
        console.log('Updating existing draft with ID:', metricId);
        ok = await updateBillableMetric(metricId, payload);
      } else {
        console.log('Creating new draft');
        const response = await createBillableMetric(payload);
        ok = response.ok;
        if (response.id) {
          setMetricId(response.id);
        }
      }

      if (ok) {
        setIsDraftSaved(true);
        return true;
      } else {
        return false;
      }
    } catch (e) {
      console.error('Error saving draft:', e);
      return false;
    } finally {
      setIsDraftSaving(false);
    }
  };

  const productOptions = [
    { label: 'product...', value: '', disabled: true },
    ...products.map(p => ({ label: p.productName, value: String(p.productId) }))
  ];

  const topActionsDisabled = !hasEverBeenEnabled;

  const LockBadge = () => (
    <span
      style={{
        borderRadius: '8px',
        background: '#E9E9EE',
        display: 'flex',
        padding: '6px',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '5px',
        marginLeft: '8px'
      }}
      aria-label="Locked"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M4.66667 7.33334V4.66668C4.66667 3.78262 5.01786 2.93478 5.64298 2.30965C6.2681 1.68453 7.11595 1.33334 8 1.33334C8.88406 1.33334 9.7319 1.68453 10.357 2.30965C10.9821 2.93478 11.3333 3.78262 11.3333 4.66668V7.33334M3.33333 7.33334H12.6667C13.403 7.33334 14 7.9303 14 8.66668V13.3333C14 14.0697 13.403 14.6667 12.6667 14.6667H3.33333C2.59695 14.6667 2 14.0697 2 13.3333V8.66668C2 7.9303 2.59695 7.33334 3.33333 7.33334Z" stroke="#75797E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );

  const handleGoAllMetrics = () => {
    showToast({
      kind: 'success',
      title: 'Usage Metric Created Successfully',
      message: 'Your usage metric has been created successfully.',
    });
    navigate('/get-started/metering');
  };

  return (
    <>
      {showSuccess ? (
        <ProductCreatedSuccess
          productName={metricName}
          titleOverride={`“${metricName || 'Usage Metric'}” Usage Metric Created Successfully`}
         
          primaryLabelOverride="Go to All Usage Metrics"
          onPrimaryClick={handleGoAllMetrics}
        />
      ) : (
        <>
          <TopBar
            title="Create New Usage Metric"
            onBack={handleTopbarBack}
            cancel={{
              onClick: () => setShowDeleteConfirm(true),
              disabled: topActionsDisabled,
            }}
            save={{
              onClick: handleSaveDraft,
              label: isDraftSaved ? 'Saved!' : 'Save as Draft',
              saved: isDraftSaved,
              saving: isDraftSaving,
              labelWhenSaved: 'Saved as Draft',
              disabled: topActionsDisabled
            }}
          />

          <div className="met-np-viewport">
            <div className="met-np-card">
              <div className="met-np-grid">
                <aside className="met-np-rail">
                  <nav className="met-np-steps">
                    {steps.map((step, i) => {
                      const isActive = i === currentStep;
                      // Only mark as completed if user has moved past it AND all required fields are filled
                      const isStep0Completed = metricName.trim() && selectedProductId && unitOfMeasure;
                      const isCompleted = i < currentStep && (i === 0 ? isStep0Completed : true);
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
                              {isCompleted ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                  <circle cx="12" cy="12" r="11.5" fill="var(--color-primary-800)" stroke="var(--color-primary-800)" />
                                  <path d="M7 12l3 3 6-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                  <circle cx="12" cy="12" r="11" stroke="#C3C2D0" strokeWidth="2" />
                                  <circle cx="12" cy="12" r="6" fill="#C3C2D0" />
                                </svg>
                              )}
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

                <main className="met-np-main">
                  <div className="af-skel-rule af-skel-rule--top" />
                  <div className="met-np-main__inner">
                    <div className="met-np-body">
                      {activeTab === 'metric' && (
                        <SectionHeader title="DEFINE METRIC & AGGREGATION" className="met-np-section-header-fixed" />
                      )}
                      {activeTab === 'conditions' && (
                        <div className="met-np-section-header-fixed" style={{ display: 'flex', alignItems: 'center' }}>
                          <SectionHeader title="USAGE CONDITIONS" />
                          {isConditionsLocked && <LockBadge />}
                        </div>
                      )}
                      {activeTab === 'review' && (
                        <div className="met-np-section-header-fixed" style={{ display: 'flex', alignItems: 'center' }}>
                          <SectionHeader title="REVIEW & CONFIRM" />
                          {isReviewLocked && <LockBadge />}
                        </div>
                      )}
                      <form className="met-np-form" onSubmit={(e) => e.preventDefault()}>
                        <div className="met-np-form-section">
                          {/* STEP 1 */}
                          {activeTab === 'metric' && (
                            <section>

                              <div className="met-np-grid-2">
                                {/* fields ... (unchanged) */}
                                <InputField label="Metric Name" value={metricName} onChange={setMetricName}
                                required
                                 placeholder="eg. API Calls" error={errors.metricName} />
                                <DropdownField
                                  label="Product"
                                  value={selectedProductId}
                                  required

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
                                  className="select-product"
                                />
                                <InputField label="Version" value={version} onChange={setVersion} placeholder="eg. v2.0" />
                                <TextareaField label="Description" value={description} onChange={setDescription} placeholder="eg. Number of API calls consumed per month" />

                                <div className="met-np-field">
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
                                        <DropdownField
                                          label="Unit of Measure"
                                          placeholder="Select unit (eg. calls, GB, hours)"
                                          required
                                          value={unitOfMeasure}
                                          onChange={(v: string) => {
                                            setUnitOfMeasure(v);
                                            if (errors.unitOfMeasure) {
                                              const { unitOfMeasure, ...rest } = errors;
                                              setErrors(rest);
                                            }
                                          }}
                                          options={opts.map(o => ({ label: o, value: o }))}
                                          error={errors.unitOfMeasure}
                                          disabled={!selectedProductId}
                                        />
                                      );
                                    }

                                    return (
                                      <InputField
                                        label="Unit of Measure"
                                        placeholder="Unit"
                                        required
                                        value={unitOfMeasure}
                                        onChange={(v: string) => {
                                          setUnitOfMeasure(v);
                                          if (errors.unitOfMeasure) {
                                            const { unitOfMeasure, ...rest } = errors;
                                            setErrors(rest);
                                          }
                                        }}
                                        error={errors.unitOfMeasure}
                                        disabled={!selectedProductId}
                                      />
                                    );
                                  })()}
                                </div>

                                <div className="met-np-field">
                                  <AggregationFunctionSelect
                                    label="Aggregation Function"
                                    productType={selectedProductType}
                                    unitOfMeasure={unitOfMeasure}
                                    value={aggregationFunction}
                                    onChange={(v: string) => {
                                      setAggregationFunction(v);
                                      setAggregationWindow('');
                                      if (errors.aggregationFunction) {
                                        const { aggregationFunction, ...rest } = errors;
                                        setErrors(rest);
                                      }
                                    }}
                                    error={errors.aggregationFunction}
                                    disabled={!unitOfMeasure}
                                  />
                                </div>

                                <div className="met-np-field">
                                  <AggregationWindowSelect
                                    label="Aggregation Window"
                                    productType={selectedProductType}
                                    unitOfMeasure={unitOfMeasure}
                                    value={aggregationWindow}
                                    onChange={(v: string) => {
                                      setAggregationWindow(v);
                                      if (errors.aggregationWindow) {
                                        const { aggregationWindow, ...rest } = errors;
                                        setErrors(rest);
                                      }
                                    }}
                                    error={errors.aggregationWindow}
                                    disabled={!aggregationFunction}
                                  />
                                </div>
                              </div>
                            </section>
                          )}

                          {/* STEP 2: CONDITIONS */}
                          {activeTab === 'conditions' && (
                            <section>

                              <UsageConditionForm
                                locked={isConditionsLocked}
                                productType={selectedProductType}
                                unitOfMeasure={unitOfMeasure}
                                conditions={usageConditions}
                                setConditions={setUsageConditions}
                                billingCriteria={billingCriteria}
                                onBillingCriteriaChange={setBillingCriteria}
                                errors={conditionErrors}
                                onFieldEdited={clearConditionError}
                                billingError={errors.billingCriteria}
                              />
                            </section>
                          )}

                          {/* STEP 3: REVIEW */}
                          {activeTab === 'review' && (
                            <section>
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

                        {/* FOOTER */}
                        <div className="met-np-form-footer" style={{ position: 'relative' }}>
                          {errors.form && <div className="met-met-np-error-message">{errors.form}</div>}

                          {activeTab === 'metric' && (
                            <div className="met-np-btn-group met-np-btn-group--next">
                              <PrimaryButton onClick={handleSaveAndNext}>
                                Save & Next
                              </PrimaryButton>
                            </div>
                          )}

                          {activeTab === 'conditions' && (
                            <>
                              {isConditionsLocked ? (
                                // ONLY the hint when locked (no buttons)
                                <div
                                  className="met-np-footer-hint"
                                  style={{
                                    position: 'absolute',
                                    left: '50%',
                                    bottom: '20px',
                                    transform: 'translateX(-50%)',
                                    color: '#8C8F96',
                                    fontSize: 14,
                                    pointerEvents: 'none',
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  Fill the previous steps to unlock this step
                                </div>
                              ) : (
                                // normal buttons when unlocked
                                <>
                                  <div className="met-np-btn-group met-np-btn-group--back">
                                    <SecondaryButton onClick={() => gotoStep(0)}>
                                      Back
                                    </SecondaryButton>
                                  </div>
                                  <div className="met-np-btn-group met-np-btn-group--next">
                                    <PrimaryButton onClick={handleSaveAndNext}>
                                      Save & Next
                                    </PrimaryButton>
                                  </div>
                                </>
                              )}
                            </>
                          )}

                          {activeTab === 'review' && (
                            <>
                              {isReviewLocked ? (
                                <div
                                  className="met-np-footer-hint"
                                  style={{
                                    position: 'absolute',
                                    left: '50%',
                                    bottom: '20px',
                                    transform: 'translateX(-50%)',
                                    color: '#8C8F96',
                                    fontSize: 14,
                                    pointerEvents: 'none',
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  Complete the previous steps to unlock this step
                                </div>
                              ) : (
                                <>
                                  <div className="met-np-btn-group met-np-btn-group--back">
                                    <SecondaryButton onClick={() => gotoStep(1)}>
                                      Back
                                    </SecondaryButton>
                                  </div>
                                  <div className="met-np-btn-group met-np-btn-group--next">
                                    <PrimaryButton
                                      onClick={async () => {
                                        if (!metricId) return;
                                        setSaving(true);
                                        const finalized = await finalizeBillableMetric(metricId);
                                        setSaving(false);
                                        if (finalized) {
                                          setShowSuccess(true);
                                        } else {
                                          showToast({
                                            kind: 'error',
                                            title: 'Failed to Create Metric',
                                            message: 'Unable to finalize the metric. Please try again.'
                                          });
                                        }
                                      }}
                                      disabled={saving}
                                    >
                                      {saving ? 'Submitting...' : 'Create Metric'}
                                    </PrimaryButton>
                                  </div>
                                </>
                              )}
                            </>
                          )}
                        </div>
                      </form>
                    </div>
                  </div>
                </main>
              </div>

              <div className="af-skel-rule af-skel-rule--bottom" />

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
                onDismiss={() => setShowSavePrompt(false)}
              />
            </div>
          </div>

          <ConfirmDeleteModal
            isOpen={showDeleteConfirm}
            productName={metricName || 'this metric'}
            entityType="metric"
            isDiscardMode={true}
            discardLabel="Keep editing"
            confirmLabel="Discard"
            onConfirm={async () => {
              setShowDeleteConfirm(false);
              await deleteAndClose();
            }}
            onCancel={() => setShowDeleteConfirm(false)}
          />
        </>
      )}
    </>
  );
}
