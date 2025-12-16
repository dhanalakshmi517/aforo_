import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import TopBar from '../../componenetsss/TopBar';
import { InputField, TextareaField, SelectField } from '../../componenetsss/Inputs';
import ConfirmDeleteModal from '../../componenetsss/ConfirmDeleteModal';
import { useToast } from '../../componenetsss/ToastProvider';
import PrimaryButton from '../../componenetsss/PrimaryButton';
import SecondaryButton from '../../componenetsss/SecondaryButton';
import EditPopup from '../../componenetsss/EditPopUp';
import SaveAsDraftModal from '../../Products/Componenets/SaveAsDraftModel';
import VerticalScrollbar from '../../componenetsss/VerticalScrollbar';
import MetricRow from '../../componenetsss/MetricRow';

import EditBillable from './EditBillable';
import EditPricing from './EditPricing';
import EditExtras from './EditExtras';
import EditReview from './EditReview';

import {
  fetchProducts,
  fetchRatePlan,
  fetchRatePlanWithDetails,
  updateRatePlan,
  deleteRatePlan,
  RatePlanRequest,
} from '../api';

import { setRatePlanData } from '../utils/sessionStorage';

import './EditRatePlan.css';
import '../../Products/EditProductsss/EditProduct.css';

type ActiveTab = 'details' | 'billable' | 'pricing' | 'extras' | 'review';

interface EditRatePlanProps {
  onClose?: () => void;
}

const steps = [
  { id: 1, title: 'Plan Details' },
  { id: 2, title: 'Product & Billable Unit' },
  { id: 3, title: 'Pricing Model Setup' },
  { id: 4, title: 'Extras' },
  { id: 5, title: 'Review & Confirm' },
];

const EditRatePlan: React.FC<EditRatePlanProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const raw = (location.state || {}) as any;
  const ratePlanId: number | undefined = raw?.plan?.ratePlanId ?? raw?.ratePlanId;

  const initial = useMemo(() => {
    const p = raw?.plan ?? raw ?? {};
    return {
      ratePlanName: p.ratePlanName ?? raw?.ratePlanName ?? '',
      description: p.description ?? raw?.description ?? '',
      billingFrequency: p.billingFrequency ?? raw?.billingFrequency ?? '',
      productName:
        p.productName ??
        p.product?.productName ??
        raw?.productName ??
        raw?.product?.productName ??
        '',
      paymentType: p.paymentType ?? raw?.paymentType ?? '',
      billableMetricId: p.billableMetricId ?? raw?.billableMetricId ?? null,
    };
  }, [raw]);

  const exitToList = () => (onClose ? onClose() : navigate('/get-started/rate-plans'));

  // rails / tabs
  const [currentStep, setCurrentStep] = useState(0);
  const activeTab: ActiveTab =
    currentStep === 0
      ? 'details'
      : currentStep === 1
        ? 'billable'
        : currentStep === 2
          ? 'pricing'
          : currentStep === 3
            ? 'extras'
            : 'review';

  // TopBar draft state + modals
  const [draftStatus, setDraftStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSaveDraftModal, setShowSaveDraftModal] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);

  // form state
  const [loading, setLoading] = useState(false);

  const [ratePlanName, setRatePlanName] = useState<string>(initial.ratePlanName);
  const [description, setDescription] = useState<string>(initial.description);
  const [billingFrequency, setBillingFrequency] = useState<string>(initial.billingFrequency);
  const [selectedProductName, setSelectedProductName] = useState<string>(initial.productName);
  const [paymentType, setPaymentType] = useState<string>(initial.paymentType);
  const [selectedMetricId, setSelectedMetricId] = useState<number | null>(
    initial.billableMetricId ? Number(initial.billableMetricId) : null,
  );

  const [products, setProducts] = useState<Array<{ productId: number; productName: string }>>([]);
  const [productError, setProductError] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [draftData, setDraftData] = useState<any>(null);

  // child savers
  const [savePricingFn, setSavePricingFn] = useState<null | (() => Promise<void>)>(null);
  const [saveExtrasFn, setSaveExtrasFn] = useState<null | (() => Promise<void>)>(null);

  // pricing validation
  const [validatePricingFn, setValidatePricingFn] = useState<null | ((setErrors: (e: Record<string, string>) => void) => boolean)>(null);

  // originals for diff-only updates
  const [originalValues, setOriginalValues] = useState<any>({});
  const originalValuesRef = useRef<any>({});
  useEffect(() => {
    originalValuesRef.current = originalValues;
  }, [originalValues]);

  // fetch products
  useEffect(() => {
    document.body.classList.add('edit-product-page');

    fetchProducts()
      .then((prods: any[]) => {
        setProducts(
          (prods || []).map(p => ({
            productId: Number(p.productId),
            productName: p.productName,
          })),
        );
      })
      .catch(() => setProductError('Failed to load products'));

    return () => {
      document.body.classList.remove('edit-product-page');
    };
  }, []);

  // prefill plan details
  useEffect(() => {
    if (!ratePlanId) return;

    (async () => {
      try {
        setLoading(true);
        const plan = await fetchRatePlanWithDetails(ratePlanId);

        const productNameResolved = plan.productName || plan.product?.productName || '';
        const original = {
          ratePlanName: plan.ratePlanName || '',
          description: plan.description || '',
          billingFrequency: plan.billingFrequency || '',
          productName: productNameResolved,
          paymentType: plan.paymentType || '',
          billableMetricId: plan.billableMetricId ? Number(plan.billableMetricId) : null,
        };

        setOriginalValues(original);

        setRatePlanName(original.ratePlanName);
        setDescription(original.description);
        setBillingFrequency(original.billingFrequency);
        setSelectedProductName(original.productName);
        setPaymentType(original.paymentType);
        setSelectedMetricId(original.billableMetricId);

        setDraftData(plan);

        // session storage for review
        if (original.ratePlanName) setRatePlanData('PLAN_NAME', original.ratePlanName);
        if (original.description) setRatePlanData('PLAN_DESCRIPTION', original.description);
        if (original.billingFrequency) setRatePlanData('BILLING_FREQUENCY', original.billingFrequency);
        if (original.productName) setRatePlanData('PRODUCT_NAME', original.productName);

        // billable metric details -> session storage
        if (original.billableMetricId) {
          try {
            const { fetchBillableMetricById } = await import('../api');
            const fullMetric = await fetchBillableMetricById(original.billableMetricId);
            if (fullMetric) {
              setRatePlanData('BILLABLE_METRIC_NAME', fullMetric.metricName);
              if ((fullMetric as any).description) {
                setRatePlanData('BILLABLE_METRIC_DESCRIPTION', (fullMetric as any).description);
              }
              if (fullMetric.unitOfMeasure || fullMetric.uom || fullMetric.uomShort) {
                setRatePlanData(
                  'BILLABLE_METRIC_UNIT',
                  fullMetric.unitOfMeasure || fullMetric.uom || fullMetric.uomShort || '',
                );
              }
              if ((fullMetric as any).aggregationFunction || (fullMetric as any).aggregationType) {
                setRatePlanData(
                  'BILLABLE_METRIC_AGGREGATION',
                  (fullMetric as any).aggregationFunction || (fullMetric as any).aggregationType || '',
                );
              }
            }
          } catch (e) {
            console.error('Failed to fetch billable metric details:', e);
          }
        }

        // pricing model hints for EditPricing/EditExtras (keep your existing behavior)
        if (plan.flatFeeAmount) localStorage.setItem('pricingModel', 'Flat Fee');
        else if (plan.volumePricing) localStorage.setItem('pricingModel', 'Volume-Based');
        else if (plan.tieredPricing) localStorage.setItem('pricingModel', 'Tiered Pricing');
        else if (plan.stairStepPricing) localStorage.setItem('pricingModel', 'Stairstep');
        else if (plan.perUnitAmount) localStorage.setItem('pricingModel', 'Usage-Based');

        if (plan.volumePricing?.tiers) {
          localStorage.setItem(
            'volumeTiers',
            JSON.stringify(
              plan.volumePricing.tiers.map((t: any) => ({
                from: t.usageStart,
                to: t.usageEnd,
                price: t.unitPrice,
              })),
            ),
          );
          localStorage.setItem('volumeOverage', String(plan.volumePricing.overageUnitRate || ''));
          localStorage.setItem('volumeGrace', String(plan.volumePricing.graceBuffer || ''));
        }

        if (plan.tieredPricing?.tiers) {
          localStorage.setItem(
            'tieredTiers',
            JSON.stringify(
              plan.tieredPricing.tiers.map((t: any) => ({
                from: t.startRange,
                to: t.endRange,
                price: t.unitPrice,
              })),
            ),
          );
          localStorage.setItem('tieredOverage', String(plan.tieredPricing.overageUnitRate || ''));
          localStorage.setItem('tieredGrace', String(plan.tieredPricing.graceBuffer || ''));
        }

        if (plan.stairStepPricing?.tiers) {
          localStorage.setItem(
            'stairTiers',
            JSON.stringify(
              plan.stairStepPricing.tiers.map((t: any) => ({
                from: t.usageStart,
                to: t.usageEnd,
                price: t.flatCost,
              })),
            ),
          );
          localStorage.setItem('stairOverage', String(plan.stairStepPricing.overageUnitRate || ''));
          localStorage.setItem('stairGrace', String(plan.stairStepPricing.graceBuffer || ''));
        }

        if (plan.perUnitAmount) localStorage.setItem('usagePerUnit', String(plan.perUnitAmount));

        if (plan.setupFee) {
          localStorage.setItem('setupFee', String(plan.setupFee.setupFee));
          localStorage.setItem('setupApplicationTiming', String(plan.setupFee.applicationTiming));
          localStorage.setItem('setupInvoiceDesc', plan.setupFee.invoiceDescription || '');
        }

        if (plan.minimumCommitment) {
          localStorage.setItem('minUsage', String(plan.minimumCommitment.minimumUsage || ''));
          localStorage.setItem('minCharge', String(plan.minimumCommitment.minimumCharge || ''));
        }

        if (plan.discount) {
          localStorage.setItem('discountType', plan.discount.discountType);
          localStorage.setItem('percentageDiscount', String(plan.discount.percentageDiscount || ''));
          localStorage.setItem('flatDiscountAmount', String(plan.discount.flatDiscountAmount || ''));
          localStorage.setItem('eligibility', plan.discount.eligibility || '');
          localStorage.setItem('discountStart', plan.discount.startDate || '');
          localStorage.setItem('discountEnd', plan.discount.endDate || '');
        }

        if (plan.freemium) {
          localStorage.setItem('freemiumType', plan.freemium.freemiumType);
          localStorage.setItem('freeUnits', String(plan.freemium.freeUnits || ''));
          localStorage.setItem('freeTrialDuration', String(plan.freemium.freeTrialDuration || ''));
          localStorage.setItem('freeStart', plan.freemium.startDate || '');
          localStorage.setItem('freeEnd', plan.freemium.endDate || '');
        }
      } catch (e) {
        console.error('Failed to fetch detailed plan', e);
        try {
          const basicPlan = await fetchRatePlan(ratePlanId);
          const productNameResolved = basicPlan.productName || basicPlan.product?.productName || '';
          const original = {
            ratePlanName: basicPlan.ratePlanName || '',
            description: basicPlan.description || '',
            billingFrequency: basicPlan.billingFrequency || '',
            productName: productNameResolved,
            paymentType: basicPlan.paymentType || '',
            billableMetricId: basicPlan.billableMetricId ? Number(basicPlan.billableMetricId) : null,
          };
          setOriginalValues(original);

          setRatePlanName(original.ratePlanName);
          setDescription(original.description);
          setBillingFrequency(original.billingFrequency);
          setSelectedProductName(original.productName);
          setPaymentType(original.paymentType);
          setSelectedMetricId(original.billableMetricId);
        } catch (fallbackError) {
          console.error('Failed to fetch basic plan data:', fallbackError);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [ratePlanId]);

  // Sync General Step inputs to session for Review display
  useEffect(() => {
    setRatePlanData('PLAN_NAME', ratePlanName);
    setRatePlanData('PLAN_DESCRIPTION', description);
    setRatePlanData('BILLING_FREQUENCY', billingFrequency);
    setRatePlanData('PRODUCT_NAME', selectedProductName);
  }, [ratePlanName, description, billingFrequency, selectedProductName]);

  const gotoStep = (index: number) => setCurrentStep(index);

  const validateStep = (index: number): boolean => {
    const e: Record<string, string> = {};

    if (index === 0) {
      if (!ratePlanName.trim()) e.ratePlanName = 'This is a required field';
      if (!billingFrequency) e.billingFrequency = 'This is a required field';
      if (!paymentType) e.paymentType = 'This is a required field';
    }

    if (index === 1) {
      if (!selectedProductName) e.selectedProductName = 'This is a required field';
      if (selectedMetricId === null) e.selectedMetricId = 'This is a required field';
    }

    if (index === 2) {
      // Validate pricing step using child component's validation
      if (validatePricingFn) {
        const isValid = validatePricingFn(setErrors);
        // Errors are already set by validatePricingFn via setErrors
        if (!isValid) return false;
      }
    }

    if (index === 4) {
      if (!ratePlanName.trim() || !billingFrequency || !selectedProductName || !paymentType) {
        e.form = 'Please fill all required fields';
      }
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // Inline error clearing (matches CreatePricePlan pattern)
  const clearErrorIfValid = (key: string, isValid: boolean) => {
    setErrors((prev) => {
      if (!prev[key]) return prev;
      if (isValid) {
        const { [key]: _omit, ...rest } = prev;
        return rest;
      }
      return prev;
    });
  };

  const resolveSelectedProductId = (): number | undefined => {
    if (!selectedProductName || productError) return undefined;
    const found = products.find(p => p.productName === selectedProductName);
    return found?.productId ? Number(found.productId) : undefined;
  };

  const buildChangedPayload = (opts?: { isDraft?: boolean }) => {
    const orig = originalValuesRef.current || {};
    const payload: Partial<RatePlanRequest> & { status?: string } = {};

    const pushIfChanged = (key: keyof RatePlanRequest, value: any) => {
      if (value !== orig[key]) (payload as any)[key] = value;
    };

    pushIfChanged('ratePlanName', ratePlanName);
    pushIfChanged('description', description);
    pushIfChanged('billingFrequency', billingFrequency as any);
    pushIfChanged('paymentType', paymentType as any);

    const productId = resolveSelectedProductId();
    if (productId && productId !== orig.productId) payload.productId = productId;

    const bmId = selectedMetricId || undefined;
    if (bmId !== orig.billableMetricId) payload.billableMetricId = bmId;

    if (opts?.isDraft) payload.status = 'DRAFT';

    // remove undefined keys
    Object.keys(payload).forEach(k => {
      const key = k as keyof typeof payload;
      if (payload[key] === undefined) delete payload[key];
    });

    return payload;
  };

  const hasChanges = () => {
    if (!ratePlanId) return false;
    const payload = buildChangedPayload();
    return Object.keys(payload).length > 0;
  };

  const refreshDraftData = async () => {
    if (!ratePlanId) return;
    try {
      const freshData = await fetchRatePlanWithDetails(ratePlanId);
      setDraftData(freshData);
    } catch (e) {
      console.warn('Failed to refresh draft data:', e);
    }
  };

  const persistOnlyDetails = async (isDraft: boolean) => {
    if (!ratePlanId) return true;

    const payload = buildChangedPayload({ isDraft });
    if (!Object.keys(payload).length) return true;

    try {
      await updateRatePlan(ratePlanId, payload);
      // Update originals after successful save
      setOriginalValues((prev: any) => ({
        ...prev,
        ratePlanName,
        description,
        billingFrequency,
        paymentType,
        productName: selectedProductName,
        productId: resolveSelectedProductId() || prev.productId,
        billableMetricId: selectedMetricId,
      }));
      return true;
    } catch (err: any) {
      console.error('Update rate plan failed:', err);
      showToast({
        kind: 'error',
        title: 'Failed to Save',
        message: err?.message || 'Could not update rate plan. Please try again.',
      });
      return false;
    }
  };

  const handleSubmitFinal = async () => {
    if (!ratePlanId) {
      exitToList();
      return;
    }
    if (!validateStep(4)) return;

    try {
      setLoading(true);

      // always save current step details diff-only
      const ok = await persistOnlyDetails(false);
      if (!ok) return;

      showToast({
        kind: 'success',
        title: 'Changes Saved',
        message: 'Rate plan updated successfully.',
      });

      exitToList();
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!ratePlanId || draftStatus === 'saving') return;

    try {
      setDraftStatus('saving');

      // Save Details diff-only
      const ok = await persistOnlyDetails(true);
      if (!ok) {
        setDraftStatus('idle');
        return;
      }

      // Save child tabs too (best effort)
      if (savePricingFn) {
        try {
          await savePricingFn();
        } catch (e) {
          console.warn('Pricing draft save warning:', e);
        }
      }
      if (saveExtrasFn) {
        try {
          await saveExtrasFn();
        } catch (e) {
          console.warn('Extras draft save warning:', e);
        }
      }

      setDraftStatus('saved');
      showToast({
        kind: 'success',
        title: 'Draft Saved',
        message: 'Rate plan draft saved successfully.',
      });

      setTimeout(() => setDraftStatus('idle'), 3500);
      exitToList();
    } catch (e) {
      console.error('Save draft failed:', e);
      setDraftStatus('idle');
      showToast({
        kind: 'error',
        title: 'Failed to Save Draft',
        message: 'Unable to save draft. Please try again.',
      });
    }
  };

  const handleBack = () => {
    if (hasChanges()) setShowEditPopup(true);
    else exitToList();
  };

  const handleNext = async () => {
    if (activeTab === 'details') {
      if (!validateStep(0)) return;
      gotoStep(1);
      return;
    }

    if (activeTab === 'billable') {
      if (!validateStep(1)) return;
      gotoStep(2);
      return;
    }

    if (activeTab === 'pricing') {
      // Validate pricing before saving and proceeding
      if (!validateStep(2)) return;

      try {
        if (savePricingFn) {
          setLoading(true);
          await savePricingFn();
          await refreshDraftData();
        }
        gotoStep(3);
      } catch (e) {
        console.error('Failed to save pricing:', e);
      } finally {
        setLoading(false);
      }
      return;
    }

    if (activeTab === 'extras') {
      try {
        if (saveExtrasFn) {
          setLoading(true);
          await saveExtrasFn();
          await refreshDraftData();
        }
        gotoStep(4);
      } catch (e) {
        console.error('Failed to save extras:', e);
      } finally {
        setLoading(false);
      }
      return;
    }

    if (activeTab === 'review') {
      await handleSubmitFinal();
    }
  };

  const handleSidebarStepClick = async (targetIndex: number) => {
    if (targetIndex === currentStep) return;

    // same behavior as Metrics: validate/save current step before jump
    try {
      if (activeTab === 'details') {
        if (!validateStep(0)) {
          setCurrentStep(0);
          return;
        }
      } else if (activeTab === 'pricing') {
        if (savePricingFn) {
          setLoading(true);
          await savePricingFn();
          await refreshDraftData();
          setLoading(false);
        }
      } else if (activeTab === 'extras') {
        if (saveExtrasFn) {
          setLoading(true);
          await saveExtrasFn();
          await refreshDraftData();
          setLoading(false);
        }
      }
    } catch (e) {
      console.error('Sidebar navigation save failed:', e);
      setLoading(false);
      return;
    }

    setCurrentStep(targetIndex);
  };

  const renderDetailsTab = () => (
    <div className="editrate-np-section">
      <div className="editrate-np-form-row">
        <div className="editrate-np-form-group">
          <InputField
            label='Rate Plan Name'
            required
            value={ratePlanName}
            onChange={(v: string) => {
              setRatePlanName(v);
              clearErrorIfValid('ratePlanName', v.trim().length > 0);
            }}
            placeholder="e.g., Pro Plan, Enterprise Plan"
            error={errors.ratePlanName}
          />
        </div>

        <div className="editrate-np-form-group">
          <SelectField
            label='Billing Frequency'
            required
            value={billingFrequency}
            onChange={(v: string) => {
              setBillingFrequency(v);
              clearErrorIfValid('billingFrequency', Boolean(v));
            }}
            placeholder="Select billing cycle"
            options={[
              { label: 'Monthly', value: 'MONTHLY' },
              { label: 'Yearly', value: 'YEARLY' },
              { label: 'Weekly', value: 'WEEKLY' },
              { label: 'Daily', value: 'DAILY' },
              { label: 'Hourly', value: 'HOURLY' },
            ]}
            error={errors.billingFrequency}
          />
        </div>
      </div>

      <div className="editrate-np-form-row">
        <div className="editrate-np-form-group">
          <SelectField
            label='Payment Type'
            required

            value={paymentType}
            onChange={(v: string) => {
              setPaymentType(v);
              clearErrorIfValid('paymentType', Boolean(v));
            }}
            placeholder="Select payment method"
            options={[
              { label: 'Post-Paid', value: 'POSTPAID' },
              { label: 'Pre-Paid', value: 'PREPAID' },
            ]}
            error={errors.paymentType}
          />
        </div>
      </div>

      <div className="editrate-np-form-group">
        <label className="editrate-np-label">Rate Plan Description</label>
        <TextareaField
          value={description}
          onChange={setDescription}
          placeholder="Describe who this plan is for, limits, and benefits..."
        />
      </div>
    </div>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div className="rateplan-loading-state" style={{ padding: '60px 0' }}>
          <div className="spinner"></div>
          <p style={{ marginTop: '16px', color: '#666', fontSize: '14px' }}>Loading...</p>
        </div>
      );
    }

    if (activeTab === 'details') return renderDetailsTab();

    if (activeTab === 'billable') {
      return (
        <div className="editrate-np-section">
          <div className="editrate-np-configuration-tab">
            <EditBillable
              products={products}
              productError={productError}
              selectedProductName={selectedProductName}
              onSelectProduct={(productName) => {
                setSelectedProductName(productName);
                clearErrorIfValid('selectedProductName', Boolean(productName));
                // Reset selected metric when product changes
                setSelectedMetricId(null);
              }}
              selectedMetricId={selectedMetricId}
              onSelectMetric={(metricId) => {
                setSelectedMetricId(metricId);
                clearErrorIfValid('selectedMetricId', metricId !== null);
              }}
            />
          </div>
        </div>
      );
    }

    if (activeTab === 'pricing') {
      return (
        <div className="editrate-np-section">
          <div className="editrate-np-configuration-tab">
            <EditPricing
              key={`pricing-${draftData?.lastUpdated || Date.now()}`}
              ratePlanId={ratePlanId}
              draftData={draftData}
              registerSavePricing={fn => setSavePricingFn(() => fn)}
              registerValidatePricing={fn => setValidatePricingFn(() => fn)}
              validationErrors={errors}
              onClearError={(key) => {
                setErrors((prev) => {
                  const { [key]: _omit, ...rest } = prev;
                  return rest;
                });
              }}
            />
          </div>
        </div>
      );
    }

    if (activeTab === 'extras') {
      return (
        <div className="editrate-np-section">
          <div className="editrate-np-configuration-tab">
            <EditExtras
              key={`extras-${draftData?.lastUpdated || Date.now()}`}
              noUpperLimit={false}
              ratePlanId={ratePlanId}
              draftData={draftData}
              registerSaveExtras={fn => setSaveExtrasFn(() => fn)}
            />
          </div>
        </div>
      );
    }

    return (
      <div className="editrate-np-section">
        <div className="editrate-np-review-container">
          <EditReview />
        </div>
      </div>
    );
  };

  return (
    <>
      <TopBar
        title={ratePlanName?.trim() ? `Edit "${ratePlanName}"` : 'Edit Rate Plan'}
        onBack={handleBack}
      />

      <div className="editrate-np-viewport">
        <div className="editrate-np-card">
          <div className="editrate-np-grid">
            {/* Left rail */}
            <aside className="editrate-np-rail">
              <nav className="editrate-np-steps">
                {steps.map((step, index) => {
                  const isActive = index === currentStep;
                  const isCompleted = index < currentStep;
                  return (
                    <MetricRow
                      key={step.id}
                      title={step.title}
                      state={isActive ? 'active' : 'default'}
                      className={`editrate-np-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`.trim()}
                      onClick={() => handleSidebarStepClick(index)}
                    />
                  );
                })}
              </nav>
            </aside>

            {/* MAIN area – aligned with Metrics skeleton */}
            <main className="editrate-np-main">
              <div className="editrate-np-main__inner">
                <div className="editrate-np-body">
                  <form
                    className="editrate-np-form"
                    onSubmit={e => {
                      e.preventDefault();
                    }}
                  >
                    <div className="editrate-np-form-section">{renderContent()}</div>

                    <div className="af-skel-rule af-skel-rule--bottom" />

                    {/* FOOTER – same alignment pattern */}
                    <div className="editrate-np-form-footer">
                      <div className="editrate-np-btn-group editrate-np-btn-group--back">
                        {activeTab !== 'details' && (
                          <SecondaryButton
                            type="button"
                            onClick={() => gotoStep(Math.max(0, currentStep - 1))}
                            disabled={loading}
                          >
                            Back
                          </SecondaryButton>
                        )}
                      </div>

                      <div className="editrate-np-btn-group editrate-np-btn-group--next">
                        {activeTab !== 'review' ? (
                          <PrimaryButton type="button" onClick={handleNext} disabled={loading}>
                            {loading ? 'Saving...' : 'Next'}
                          </PrimaryButton>
                        ) : (
                          <PrimaryButton type="button" onClick={handleSubmitFinal} disabled={loading}>
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

        <VerticalScrollbar
          height="100%"
          color="#D9DFE8"
          thickness={4}
          className="editrate-np-scrollbar"
        />

        <SaveAsDraftModal
          isOpen={showSaveDraftModal}
          onSave={() => {
            setShowSaveDraftModal(false);
            exitToList();
          }}
          onDelete={() => {
            setShowSaveDraftModal(false);
            setShowDeleteConfirm(true);
          }}
        />

        <ConfirmDeleteModal
          isOpen={showDeleteConfirm}
          productName={ratePlanName || 'this plan'}
          onConfirm={async () => {
            if (!ratePlanId) {
              setShowDeleteConfirm(false);
              exitToList();
              return;
            }
            try {
              setLoading(true);
              await deleteRatePlan(ratePlanId);
              showToast({
                kind: 'success',
                title: 'Deleted',
                message: 'Rate plan deleted successfully.',
              });
              setShowDeleteConfirm(false);
              exitToList();
            } catch (e: any) {
              console.error('Delete failed:', e);
              showToast({
                kind: 'error',
                title: 'Failed to Delete',
                message: e?.message || 'Could not delete rate plan.',
              });
            } finally {
              setLoading(false);
            }
          }}
          onCancel={() => setShowDeleteConfirm(false)}
        />

        <EditPopup
          isOpen={showEditPopup}
          onDismiss={() => setShowEditPopup(false)}
          onClose={() => {
            setShowEditPopup(false);
            exitToList();
          }}
          onSave={async () => {
            await handleSaveDraft();
            setShowEditPopup(false);
          }}
        />
      </div>
    </>
  );
};

export default EditRatePlan;
