import * as React from 'react';
import { useMemo, useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import TopBar from '../../componenetsss/TopBar';
import EditPopup from '../../componenetsss/EditPopUp';
import { InputField, TextareaField, SelectField } from '../../componenetsss/Inputs';
import PrimaryButton from '../../componenetsss/PrimaryButton';
import SecondaryButton from '../../componenetsss/SecondaryButton';

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
  { id: 1, title: 'Plan Details', desc: 'Define the basic information and structure of your plan.' },
  { id: 2, title: 'Select Billable Metric', desc: 'Select or define a Billable Metric' },
  { id: 3, title: 'Pricing Model Setup', desc: 'Configure how pricing will work for this plan.' },
  { id: 4, title: 'Extras', desc: 'Add optional features or benefits to enhance your plan.' },
  { id: 5, title: 'Review & Confirm', desc: 'Check and finalize details.' },
];

const EditRatePlan: React.FC<EditRatePlanProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const raw = (location.state || {}) as any;
  const ratePlanId: number | undefined = raw?.plan?.ratePlanId ?? raw.ratePlanId;

  const initial = useMemo(() => {
    const p = raw?.plan ?? raw ?? {};
    return {
      ratePlanName:
        p.ratePlanName ??
        raw.ratePlanName ??
        '',
      description:
        p.description ??
        raw.description ??
        '',
      billingFrequency:
        p.billingFrequency ??
        raw.billingFrequency ??
        '',
      productName:
        p.productName ??
        p.product?.productName ??
        raw.productName ??
        raw.product?.productName ??
        '',
      paymentType:
        p.paymentType ??
        raw.paymentType ??
        '',
    };
  }, [raw]);

  const exitToList = () =>
    onClose ? onClose() : navigate('/get-started/rate-plans');

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

  const [loading, setLoading] = useState(false);

  const [ratePlanName, setRatePlanName] = useState<string>(
    initial.ratePlanName,
  );
  const [description, setDescription] = useState<string>(initial.description);
  const [billingFrequency, setBillingFrequency] = useState<string>(
    initial.billingFrequency,
  );
  const [selectedProductName, setSelectedProductName] = useState<string>(
    initial.productName,
  );
  const [paymentType, setPaymentType] = useState<string>(initial.paymentType);

  const [products, setProducts] = useState<
    Array<{ productId: number; productName: string }>
  >([]);
  const [productError, setProductError] = useState<string>('');
  const [selectedMetricId, setSelectedMetricId] = useState<number | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [draftData, setDraftData] = useState<any>(null);

  // CHANGE DETECTION
  const originalDataRef = useRef<typeof initial | null>(null);

  const hasPendingChanges = () => {
    const orig = originalDataRef.current;
    if (!orig) return false;

    const currentData = {
      ratePlanName,
      description,
      billingFrequency,
      productName: selectedProductName,
      paymentType,
    };

    return JSON.stringify(orig) !== JSON.stringify(currentData);
  };

  // Save-as-draft modal
  const [showSaveModal, setShowSaveModal] = useState(false);

  // child savers
  const [savePricingFn, setSavePricingFn] =
    useState<null | (() => Promise<void>)>(null);
  const [saveExtrasFn, setSaveExtrasFn] =
    useState<null | (() => Promise<void>)>(null);

  useEffect(() => {
    document.body.classList.add('edit-product-page');

    (async () => {
      try {
        const prods = await fetchProducts();
        setProducts(
          prods.map((p: any) => ({
            productId: Number(p.productId),
            productName: p.productName,
          })),
        );
      } catch {
        setProductError('Failed to load products');
      }
    })();

    const loadPlan = async () => {
      if (!ratePlanId) return;
      try {
        const plan = await fetchRatePlanWithDetails(ratePlanId);
        setRatePlanName(plan.ratePlanName || '');
        setDescription(plan.description || '');
        setBillingFrequency(plan.billingFrequency || '');
        setPaymentType(plan.paymentType || '');
        setSelectedProductName(
          plan.productName || plan.product?.productName || '',
        );
        if (plan.billableMetricId)
          setSelectedMetricId(Number(plan.billableMetricId));
        setDraftData(plan);

        originalDataRef.current = {
          ratePlanName: plan.ratePlanName || '',
          description: plan.description || '',
          billingFrequency: plan.billingFrequency || '',
          productName: plan.productName || plan.product?.productName || '',
          paymentType: plan.paymentType || '',
        };

        // Store plan details in session storage for EditReview
        if (plan.ratePlanName) setRatePlanData('PLAN_NAME', plan.ratePlanName);
        if (plan.description) setRatePlanData('PLAN_DESCRIPTION', plan.description);
        if (plan.billingFrequency) setRatePlanData('BILLING_FREQUENCY', plan.billingFrequency);
        if (plan.productName || plan.product?.productName) {
          setRatePlanData('PRODUCT_NAME', plan.productName || plan.product?.productName || '');
        }

        // PRICING MODEL HINTS IN LOCALSTORAGE
        if (plan.flatFeeAmount)
          localStorage.setItem('pricingModel', 'Flat Fee');
        else if (plan.volumePricing)
          localStorage.setItem('pricingModel', 'Volume-Based');
        else if (plan.tieredPricing)
          localStorage.setItem('pricingModel', 'Tiered Pricing');
        else if (plan.stairStepPricing)
          localStorage.setItem('pricingModel', 'Stairstep');
        else if (plan.perUnitAmount)
          localStorage.setItem('pricingModel', 'Usage-Based');

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
          localStorage.setItem(
            'volumeOverage',
            String(plan.volumePricing.overageUnitRate || ''),
          );
          localStorage.setItem(
            'volumeGrace',
            String(plan.volumePricing.graceBuffer || ''),
          );
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
          localStorage.setItem(
            'tieredOverage',
            String(plan.tieredPricing.overageUnitRate || ''),
          );
          localStorage.setItem(
            'tieredGrace',
            String(plan.tieredPricing.graceBuffer || ''),
          );
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
          localStorage.setItem(
            'stairOverage',
            String(plan.stairStepPricing.overageUnitRate || ''),
          );
          localStorage.setItem(
            'stairGrace',
            String(plan.stairStepPricing.graceBuffer || ''),
          );
        }
        if (plan.perUnitAmount)
          localStorage.setItem('usagePerUnit', String(plan.perUnitAmount));

        if (plan.setupFee) {
          localStorage.setItem('setupFee', String(plan.setupFee.setupFee));
          localStorage.setItem(
            'setupApplicationTiming',
            String(plan.setupFee.applicationTiming),
          );
          localStorage.setItem(
            'setupInvoiceDesc',
            plan.setupFee.invoiceDescription || '',
          );
        }
        if (plan.minimumCommitment) {
          localStorage.setItem(
            'minUsage',
            String(plan.minimumCommitment.minimumUsage || ''),
          );
          localStorage.setItem(
            'minCharge',
            String(plan.minimumCommitment.minimumCharge || ''),
          );
        }
        if (plan.discount) {
          localStorage.setItem('discountType', plan.discount.discountType);
          localStorage.setItem(
            'percentageDiscount',
            String(plan.discount.percentageDiscount || ''),
          );
          localStorage.setItem(
            'flatDiscountAmount',
            String(plan.discount.flatDiscountAmount || ''),
          );
          localStorage.setItem(
            'eligibility',
            plan.discount.eligibility || '',
          );
          localStorage.setItem('discountStart', plan.discount.startDate || '');
          localStorage.setItem('discountEnd', plan.discount.endDate || '');
        }
        if (plan.freemium) {
          localStorage.setItem('freemiumType', plan.freemium.freemiumType);
          localStorage.setItem(
            'freeUnits',
            String(plan.freemium.freeUnits || ''),
          );
          localStorage.setItem(
            'freeTrialDuration',
            String(plan.freemium.freeTrialDuration || ''),
          );
          localStorage.setItem('freeStart', plan.freemium.startDate || '');
          localStorage.setItem('freeEnd', plan.freemium.endDate || '');
        }
      } catch (e) {
        console.error('Failed to fetch detailed plan', e);
        try {
          const basicPlan = await fetchRatePlan(ratePlanId);
          setRatePlanName(basicPlan.ratePlanName || '');
          setDescription(basicPlan.description || '');
          setBillingFrequency(basicPlan.billingFrequency || '');
          setPaymentType(basicPlan.paymentType || '');
          setSelectedProductName(
            basicPlan.productName || basicPlan.product?.productName || '',
          );
        } catch (fallbackError) {
          console.error('Failed to fetch basic plan data:', fallbackError);
        }
      }
    };

    loadPlan();

    return () => {
      document.body.classList.remove('edit-product-page');
    };
  }, [ratePlanId]);

  const goToStep = (index: number) => setCurrentStep(index);

  const validateDetails = (): boolean => {
    const e: Record<string, string> = {};
    if (!ratePlanName.trim()) e.ratePlanName = 'This is a required field';
    if (!billingFrequency)
      e.billingFrequency = 'This is a required field';
    if (!selectedProductName)
      e.selectedProductName = 'This is a required field';
    if (!paymentType) e.paymentType = 'This is a required field';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const persistPlan = async (isDraft: boolean): Promise<boolean> => {
    if (!ratePlanId) return true;
    try {
      setLoading(true);
      let productId: number | undefined;
      if (selectedProductName && !productError) {
        const p = products.find(
          pr => pr.productName === selectedProductName,
        );
        productId = p?.productId ? Number(p.productId) : undefined;
      }

      const payload: Partial<RatePlanRequest> & { status?: string } = {
        ratePlanName,
        description,
        billingFrequency: billingFrequency as any,
        paymentType: paymentType as any,
        productId: productId || undefined,
        billableMetricId: selectedMetricId || undefined,
      };

      Object.keys(payload).forEach(key => {
        if (payload[key as keyof typeof payload] === undefined) {
          delete payload[key as keyof typeof payload];
        }
      });

      if (isDraft) payload.status = 'DRAFT';

      console.log('EditRatePlan - API Payload:', payload);
      await updateRatePlan(ratePlanId, payload);
      return true;
    } catch (err: any) {
      alert(err?.message || 'Failed to save rate plan');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleNextStep = async () => {
    if (activeTab === 'details') {
      if (!validateDetails()) return;
      goToStep(1);
      return;
    }

    if (activeTab === 'billable') {
      goToStep(2);
      return;
    }

    if (activeTab === 'pricing') {
      if (savePricingFn) {
        try {
          setLoading(true);
          await savePricingFn();
          if (ratePlanId) {
            try {
              const freshData = await fetchRatePlanWithDetails(ratePlanId);
              setDraftData(freshData);
              console.log(
                'EditRatePlan - Refreshed draft data after pricing save:',
                freshData,
              );
            } catch (e) {
              console.warn(
                'Failed to refresh data after pricing save:',
                e,
              );
            }
          }
        } catch (e: any) {
          console.error('Failed to save pricing:', e);
          setLoading(false);
          return;
        }
      }
      setLoading(false);
      goToStep(3);
      return;
    }

    if (activeTab === 'extras') {
      if (saveExtrasFn) {
        try {
          setLoading(true);
          await saveExtrasFn();
          if (ratePlanId) {
            try {
              const freshData = await fetchRatePlanWithDetails(ratePlanId);
              setDraftData(freshData);
              console.log(
                'EditRatePlan - Refreshed draft data after extras save:',
                freshData,
              );
            } catch (e) {
              console.warn(
                'Failed to refresh data after extras save:',
                e,
              );
            }
          }
        } catch (e: any) {
          console.error('Failed to save extras:', e);
          setLoading(false);
          return;
        }
      }
      setLoading(false);
      goToStep(4);
      return;
    }

    if (activeTab === 'review') {
      const ok = await persistPlan(false);
      if (ok) navigate('/get-started/rate-plans');
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      goToStep(currentStep - 1);
    } else {
      setShowSaveModal(true);
    }
  };

  // sidebar step click – same behaviour as your multi-step skeleton
  const handleSidebarStepClick = async (targetIndex: number) => {
    if (targetIndex === currentStep) return;

    try {
      if (activeTab === 'details') {
        if (!validateDetails()) {
          setCurrentStep(0);
          return;
        }
      } else if (activeTab === 'pricing') {
        if (savePricingFn) {
          setLoading(true);
          await savePricingFn();
          if (ratePlanId) {
            try {
              const freshData = await fetchRatePlanWithDetails(ratePlanId);
              setDraftData(freshData);
              console.log(
                'EditRatePlan - Refreshed draft data after pricing save (sidebar):',
                freshData,
              );
            } catch (e) {
              console.warn(
                'Failed to refresh data after pricing save:',
                e,
              );
            }
          }
          setLoading(false);
        }
      } else if (activeTab === 'extras') {
        if (saveExtrasFn) {
          setLoading(true);
          await saveExtrasFn();
          if (ratePlanId) {
            try {
              const freshData = await fetchRatePlanWithDetails(ratePlanId);
              setDraftData(freshData);
              console.log(
                'EditRatePlan - Refreshed draft data after extras save (sidebar):',
                freshData,
              );
            } catch (e) {
              console.warn(
                'Failed to refresh data after extras save:',
                e,
              );
            }
          }
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

  const handleSaveDraft = async () => {
    if (activeTab === 'details' && !validateDetails()) return;

    const ok = await persistPlan(true);

    if (ok) {
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
    }

    setShowSaveModal(false);
    exitToList();
  };

  const handleDelete = async () => {
    if (!ratePlanId) return;
    try {
      setLoading(true);
      await deleteRatePlan(ratePlanId);
      setShowSaveModal(false);
      exitToList();
    } catch (e: any) {
      alert(e?.message || 'Failed to delete rate plan');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (activeTab) {
      case 'details':
        return (
          <div className="editrate-np-section">
            <div className="editrate-np-form-row">
              <div className="editrate-np-form-group">
                <label className="editrate-np-label">Rate Plan Name</label>
                <InputField
                  value={ratePlanName}
                  onChange={setRatePlanName}
                  placeholder="e.g., Pro Plan, Enterprise Plan"
                  error={errors.ratePlanName}
                />
              </div>
              <div className="editrate-np-form-group">
                <label className="editrate-np-label">Billing Frequency</label>
                <SelectField
                  value={billingFrequency}
                  onChange={setBillingFrequency}
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
                <label className="editrate-np-label">Select Product</label>
                <SelectField
                  value={selectedProductName}
                  onChange={setSelectedProductName}
                  placeholder={
                    productError
                      ? 'Failed to load products'
                      : 'Select Product'
                  }
                  options={
                    productError
                      ? []
                      : products.map(p => ({
                        label: p.productName,
                        value: p.productName,
                      }))
                  }
                  error={errors.selectedProductName}
                />
              </div>

              <div className="editrate-np-form-group">
                <label className="editrate-np-label">Payment Type</label>
                <SelectField
                  value={paymentType}
                  onChange={setPaymentType}
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
      case 'billable':
        return (
          <div className="editrate-np-section">
            <div className="editrate-np-configuration-tab">
              <EditBillable
                productName={selectedProductName}
                selectedMetricId={selectedMetricId}
                onSelectMetric={setSelectedMetricId}
              />
            </div>
          </div>
        );
      case 'pricing':
        return (
          <div className="editrate-np-section">
            <div className="edit-np-configuration-tab">
              <EditPricing
                key={`pricing-${draftData?.lastUpdated || Date.now()}`}
                ratePlanId={ratePlanId}
                draftData={draftData}
                registerSavePricing={fn => setSavePricingFn(() => fn)}
              />
            </div>
          </div>
        );
      case 'extras':
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
      case 'review':
        return (
          <div className="editrate-np-section">
            <div className="editrate-np-review-container">
              <EditReview />
            </div>
          </div>
        );
      default:
        return <p>Coming soon...</p>;
    }
  };

  return (
    <>
      <TopBar
        title={
          ratePlanName?.trim()
            ? `Edit "${ratePlanName}"`
            : 'Edit Rate Plan'
        }
        onBack={() => {
          const hasChanges = hasPendingChanges();
          if (hasChanges) {
            setShowSaveModal(true);
          } else {
            exitToList();
          }
        }}
      />

      {/* same skeleton structure as EditSubscription: viewport -> card -> grid -> rail + main */}
      <div className="editrate-np-viewport">
        <div className="editrate-np-card">
          <div className="editrate-np-grid">
            {/* LEFT rail */}
            <aside className="editrate-np-rail">
              <nav className="editrate-np-steps">
                {steps.map((step, index) => {
                  const isActive = index === currentStep;
                  const isCompleted = index < currentStep;
                  return (
                    <button
                      key={step.id}
                      type="button"
                      className={[
                        'editrate-np-step',
                        isActive ? 'active' : '',
                        isCompleted ? 'completed' : '',
                      ]
                        .join(' ')
                        .trim()}
                      onClick={() => handleSidebarStepClick(index)}
                    >
                      <span className="editrate-np-step__title">
                        {step.title}
                      </span>
                    </button>
                  );
                })}
              </nav>
            </aside>

            {/* MAIN area – matches EditSubscription skeleton: main -> main__inner -> body -> form */}
            <main className="editrate-np-main">
              <div className="editrate-np-main__inner">
                <div className="editrate-np-body">
                  <form
                    className="editrate-np-form"
                    onSubmit={e => e.preventDefault()}
                  >
                    <div className="editrate-np-form-section">
                      {renderStepContent()}
                    </div>

                    {/* FOOTER actions – aligned like EditSubscription */}
                    <div className="editrate-np-form-footer">
                      <div className="editrate-np-btn-group editrate-np-btn-group--back">
                        {currentStep > 0 && (
                          <SecondaryButton
                            type="button"
                            onClick={handlePreviousStep}
                            disabled={loading}
                          >
                            Back
                          </SecondaryButton>
                        )}
                      </div>

                      <div className="editrate-np-btn-group editrate-np-btn-group--next">
                        <PrimaryButton
                          type="button"
                          onClick={handleNextStep}
                          disabled={loading}
                        >
                          {loading
                            ? 'Saving...'
                            : activeTab === 'review'
                              ? 'Save Changes'
                              : 'Save & Next'}
                        </PrimaryButton>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
              {/* if you have skeleton rules in CSS, they’ll hook here */}
              <div className="af-skel-rule af-skel-rule--bottom" />
            </main>
          </div>
        </div>
      </div>

      <EditPopup
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onDismiss={() => setShowSaveModal(false)}
        onSave={handleSaveDraft}
      />

      {/* Optional: delete handler is defined; hook it into any UI you have (menu, button, etc.) */}
      {/* Example: <DangerButton onClick={handleDelete}>Delete Plan</DangerButton> */}
    </>
  );
};

export default EditRatePlan;
