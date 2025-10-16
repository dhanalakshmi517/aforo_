import * as React from 'react';
import { useMemo, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import TopBar from '../../componenetsss/TopBar';
import SaveDraft from '../../componenetsss/SaveDraft';
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

import './EditRatePlan.css';
import '../../Products/EditProductsss/EditProduct.css';

type ActiveTab = 'details' | 'billable' | 'pricing' | 'extras' | 'review';

interface EditRatePlanProps { onClose?: () => void; }

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
      ratePlanName: p.ratePlanName ?? raw.ratePlanName ?? '',
      description: p.description ?? raw.description ?? '',
      billingFrequency: p.billingFrequency ?? raw.billingFrequency ?? '',
      productName: p.productName ?? p.product?.productName ?? raw.productName ?? raw.product?.productName ?? '',
      paymentType: p.paymentType ?? raw.paymentType ?? '',
    };
  }, [raw]);

  const exitToList = () => (onClose ? onClose() : navigate('/get-started/rate-plans'));

  const [currentStep, setCurrentStep] = useState(0);
  const activeTab: ActiveTab =
    currentStep === 0 ? 'details' :
    currentStep === 1 ? 'billable' :
    currentStep === 2 ? 'pricing'  :
    currentStep === 3 ? 'extras'   : 'review';

  const [loading, setLoading] = useState(false);

  const [ratePlanName, setRatePlanName] = useState<string>(initial.ratePlanName);
  const [description, setDescription] = useState<string>(initial.description);
  const [billingFrequency, setBillingFrequency] = useState<string>(initial.billingFrequency);
  const [selectedProductName, setSelectedProductName] = useState<string>(initial.productName);
  const [paymentType, setPaymentType] = useState<string>(initial.paymentType);

  const [products, setProducts] = useState<Array<{ productId: number; productName: string }>>([]);
  const [productError, setProductError] = useState<string>('');
  const [selectedMetricId, setSelectedMetricId] = useState<number | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [draftData, setDraftData] = useState<any>(null);

  // Save-as-draft modal
  const [showSaveModal, setShowSaveModal] = useState(false);

  // child savers
  const [savePricingFn, setSavePricingFn] = useState<null | (() => Promise<void>)>(null);
  const [saveExtrasFn,  setSaveExtrasFn]  = useState<null | (() => Promise<void>)>(null);

  useEffect(() => {
    document.body.classList.add('edit-product-page');
    (async () => {
      try {
        const prods = await fetchProducts();
        setProducts(prods.map((p: any) => ({ productId: Number(p.productId), productName: p.productName })));
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
        setSelectedProductName(plan.productName || plan.product?.productName || '');
        if (plan.billableMetricId) setSelectedMetricId(Number(plan.billableMetricId));
        setDraftData(plan);

        if (plan.flatFeeAmount) localStorage.setItem('pricingModel','Flat Fee');
        else if (plan.volumePricing) localStorage.setItem('pricingModel','Volume-Based');
        else if (plan.tieredPricing) localStorage.setItem('pricingModel','Tiered Pricing');
        else if (plan.stairStepPricing) localStorage.setItem('pricingModel','Stairstep');
        else if (plan.perUnitAmount) localStorage.setItem('pricingModel','Usage-Based');

        if (plan.volumePricing?.tiers) {
          localStorage.setItem('volumeTiers', JSON.stringify(plan.volumePricing.tiers.map((t:any)=>({from:t.usageStart,to:t.usageEnd,price:t.unitPrice})))); 
          localStorage.setItem('volumeOverage', String(plan.volumePricing.overageUnitRate||'')); 
          localStorage.setItem('volumeGrace', String(plan.volumePricing.graceBuffer||''));
        }
        if (plan.tieredPricing?.tiers) {
          localStorage.setItem('tieredTiers', JSON.stringify(plan.tieredPricing.tiers.map((t:any)=>({from:t.startRange,to:t.endRange,price:t.unitPrice})))); 
          localStorage.setItem('tieredOverage', String(plan.tieredPricing.overageUnitRate||'')); 
          localStorage.setItem('tieredGrace', String(plan.tieredPricing.graceBuffer||''));
        }
        if (plan.stairStepPricing?.tiers) {
          localStorage.setItem('stairTiers', JSON.stringify(plan.stairStepPricing.tiers.map((t:any)=>({from:t.usageStart,to:t.usageEnd,price:t.flatCost})))); 
          localStorage.setItem('stairOverage', String(plan.stairStepPricing.overageUnitRate||'')); 
          localStorage.setItem('stairGrace', String(plan.stairStepPricing.graceBuffer||''));
        }
        if (plan.perUnitAmount) localStorage.setItem('usagePerUnit', String(plan.perUnitAmount));
        if (plan.setupFee) {
          localStorage.setItem('setupFee', String(plan.setupFee.setupFee));
          localStorage.setItem('setupApplicationTiming', String(plan.setupFee.applicationTiming));
          localStorage.setItem('setupInvoiceDesc', plan.setupFee.invoiceDescription||'');
        }
        if (plan.minimumCommitment) {
          localStorage.setItem('minUsage', String(plan.minimumCommitment.minimumUsage||''));
          localStorage.setItem('minCharge', String(plan.minimumCommitment.minimumCharge||''));
        }
        if (plan.discount) {
          localStorage.setItem('discountType', plan.discount.discountType);
          localStorage.setItem('percentageDiscount', String(plan.discount.percentageDiscount||''));
          localStorage.setItem('flatDiscountAmount', String(plan.discount.flatDiscountAmount||''));
          localStorage.setItem('eligibility', plan.discount.eligibility||'');
          localStorage.setItem('discountStart', plan.discount.startDate||'');
          localStorage.setItem('discountEnd', plan.discount.endDate||'');
        }
        if (plan.freemium) {
          localStorage.setItem('freemiumType', plan.freemium.freemiumType);
          localStorage.setItem('freeUnits', String(plan.freemium.freeUnits||''));
          localStorage.setItem('freeTrialDuration', String(plan.freemium.freeTrialDuration||''));
          localStorage.setItem('freeStart', plan.freemium.startDate||'');
          localStorage.setItem('freeEnd', plan.freemium.endDate||'');
        }
      } catch (e) {
        console.error('Failed to fetch plan', e);
        try {
          const basicPlan = await fetchRatePlan(ratePlanId);
          setRatePlanName(basicPlan.ratePlanName || '');
          setDescription(basicPlan.description || '');
          setBillingFrequency(basicPlan.billingFrequency || '');
          setPaymentType(basicPlan.paymentType || '');
          setSelectedProductName(basicPlan.productName || basicPlan.product?.productName || '');
        } catch (fallbackError) {
          console.error('Failed to fetch basic plan data:', fallbackError);
        }
      }
    };
    loadPlan();

    return () => { document.body.classList.remove('edit-product-page'); };
  }, [ratePlanId]);

  const goToStep = (index: number) => setCurrentStep(index);

  const validateDetails = (): boolean => {
    const e: Record<string, string> = {};
    if (!ratePlanName.trim()) e.ratePlanName = 'This is a required field';
    if (!billingFrequency) e.billingFrequency = 'This is a required field';
    if (!selectedProductName) e.selectedProductName = 'This is a required field';
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
        const p = products.find(pr => pr.productName === selectedProductName);
        productId = p?.productId ? Number(p.productId) : undefined;
      }

      const payload: Partial<Omit<RatePlanRequest,'billableMetricId'>> & { status?: string } = {
        ratePlanName,
        description,
        billingFrequency: billingFrequency as any,
        paymentType: paymentType as any,
        productId,
        productName: productId ? undefined : selectedProductName || undefined,
      };
      if (isDraft) payload.status = 'DRAFT';

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
      const ok = await persistPlan(false);
      if (!ok) return;
      goToStep(1);
      return;
    }
    if (activeTab === 'billable') { goToStep(2); return; }

    if (activeTab === 'pricing') {
      if (savePricingFn) {
        try {
          setLoading(true);
          await savePricingFn();
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

    if (activeTab === 'extras')  {
      if (saveExtrasFn) {
        try {
          setLoading(true);
          await saveExtrasFn();
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
    if (currentStep > 0) goToStep(currentStep - 1);
    else setShowSaveModal(true);
  };

  // === NEW: handle sidebar navigation so it also persists current step ===
  const handleSidebarStepClick = async (targetIndex: number) => {
    if (targetIndex === currentStep) return;

    // Persist the step we're LEAVING
    try {
      if (activeTab === 'details') {
        if (!validateDetails()) { setCurrentStep(0); return; }
        const ok = await persistPlan(false);
        if (!ok) return;
      } else if (activeTab === 'pricing') {
        if (savePricingFn) {
          setLoading(true);
          await savePricingFn();
          setLoading(false);
        }
      } else if (activeTab === 'extras') {
        if (saveExtrasFn) {
          setLoading(true);
          await saveExtrasFn();
          setLoading(false);
        }
      }
    } catch (e) {
      console.error('Sidebar navigation save failed:', e);
      setLoading(false);
      return; // stay on current step if a save failed
    }

    setCurrentStep(targetIndex);
  };

  // === Save-as-Draft now also saves PRICING + EXTRAS (best-effort) ===
  const handleSaveDraft = async () => {
    if (activeTab === 'details' && !validateDetails()) return;

    const ok = await persistPlan(true);

    if (ok) {
      if (savePricingFn) {
        try { await savePricingFn(); } catch (e) { console.warn('Pricing draft save warning:', e); }
      }
      if (saveExtrasFn) {
        try { await saveExtrasFn(); } catch (e) { console.warn('Extras draft save warning:', e); }
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
          <div className="edit-np-section">
            <div className="edit-np-form-row">
              <div className="edit-np-form-group">
                <label className="edit-np-label">Rate Plan Name</label>
                <InputField
                  value={ratePlanName}
                  onChange={setRatePlanName}
                  placeholder="e.g., Pro Plan, Enterprise Plan"
                  error={errors.ratePlanName}
                />
              </div>
              <div className="edit-np-form-group">
                <label className="edit-np-label">Billing Frequency</label>
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

            <div className="edit-np-form-row">
              <div className="edit-np-form-group">
                <label className="edit-np-label">Select Product</label>
                <SelectField
                  value={selectedProductName}
                  onChange={setSelectedProductName}
                  placeholder={productError ? 'Failed to load products' : 'Select Product'}
                  options={productError ? [] : products.map((p) => ({ label: p.productName, value: p.productName }))}
                  error={errors.selectedProductName}
                />
              </div>

              <div className="edit-np-form-group">
                <label className="edit-np-label">Payment Type</label>
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

            <div className="edit-np-form-group">
              <label className="edit-np-label">Rate Plan Description</label>
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
          <div className="edit-np-section">
            <div className="edit-np-configuration-tab">
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
          <div className="edit-np-section">
            <div className="edit-np-configuration-tab">
              <EditPricing
                ratePlanId={ratePlanId}
                draftData={draftData}
                registerSavePricing={(fn) => setSavePricingFn(() => fn)}
              />
            </div>
          </div>
        );
      case 'extras':
        return (
          <div className="edit-np-section">
            <div className="edit-np-configuration-tab">
              <EditExtras
                ratePlanId={ratePlanId}
                noUpperLimit={false}
                draftData={draftData}
                registerSaveExtras={(fn) => setSaveExtrasFn(() => fn)}
              />
            </div>
          </div>
        );
      case 'review':
        return (
          <div className="edit-np-section">
            <div className="edit-np-review-container">
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
        title={ratePlanName?.trim() ? `Edit “${ratePlanName}”` : 'Edit Rate Plan'}
        onBack={() => setShowSaveModal(true)}
      />

      <div className="edit-np-viewport">
        <div className="edit-np-card">
          <div className="edit-np-grid">
            <aside className="edit-np-rail">
              <div className="edit-np-steps">
                {steps.map((step, index) => {
                  const isActive = index === currentStep;
                  const isCompleted = index < currentStep;
                  return (
                    <div
                      key={step.id}
                      className={`edit-np-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                      onClick={() => handleSidebarStepClick(index)}
                      role="button"
                    >
                      <div className="edit-np-step__title">{step.title}</div>
                    </div>
                  );
                })}
              </div>
            </aside>

            <div className="edit-np-content">
              <div className="edit-np-form">{renderStepContent()}</div>

              <div className="edit-np-form-footer">
                <div className="edit-np-btn-group edit-np-btn-group--back">
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

                <div className="edit-np-btn-group edit-np-btn-group--next">
                  <PrimaryButton
                    type="button"
                    onClick={handleNextStep}
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : activeTab === 'review' ? 'Update Rate Plan' : 'Next'}
                  </PrimaryButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <SaveDraft
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSaveDraft}
        onDelete={handleDelete}
      />
    </>
  );
};

export default EditRatePlan;
