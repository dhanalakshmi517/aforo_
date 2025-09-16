import * as React from 'react';
import { useMemo, useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import TopBar from '../../componenetsss/TopBar';
import SaveDraft from '../../componenetsss/SaveDraft';
import ConfirmDeleteModal from '../../componenetsss/ConfirmDeleteModal';

import { InputField, TextareaField, SelectField } from '../../componenetsss/Inputs';

import EditPricing from './EditPricing';
import EditExtras from './EditExtras';
import EditReview from './EditReview';

import {
  fetchProducts,
  fetchRatePlan,
  updateRatePlan,
  RatePlanRequest,
} from '../api';

import './EditRatePlan.css';              // your rate-plan specific styles (optional)
import '../../Products/EditProductsss/EditProduct.css'; // reuse np/edit-np layout styles if needed

type ActiveTab = 'details' | 'pricing' | 'extras' | 'review';

interface EditRatePlanProps {
  onClose?: () => void;
}

const steps = [
  { id: 1, title: 'Plan Details', desc: 'Define the basic information and structure of your plan.' },
  { id: 2, title: 'Pricing Model Setup', desc: 'Configure how pricing will work for this plan.' },
  { id: 3, title: 'Extras', desc: 'Add optional features or benefits to enhance your plan.' },
  { id: 4, title: 'Review & Confirm', desc: 'Check and finalize details.' },
];

const EditRatePlan: React.FC<EditRatePlanProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Accept data in either shape:
  //   location.state = { plan: {...} }  OR  location.state = { ...fields }
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

  const close = () => {
    if (onClose) onClose();
    else navigate('/get-started/rate-plans');
  };

  // ---- Wizard & tab
  const [currentStep, setCurrentStep] = useState(0);
  const activeTab: ActiveTab =
    currentStep === 0 ? 'details' :
    currentStep === 1 ? 'pricing' :
    currentStep === 2 ? 'extras' :
    'review';

  // ---- UI state: modals & saving flags
  const [showSaveDraftModal, setShowSaveDraftModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [draftStatus, setDraftStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [loading, setLoading] = useState(false);

  // ---- Form state
  const [ratePlanName, setRatePlanName] = useState<string>(initial.ratePlanName);
  const [description, setDescription] = useState<string>(initial.description);
  const [billingFrequency, setBillingFrequency] = useState<string>(initial.billingFrequency);
  const [selectedProductName, setSelectedProductName] = useState<string>(initial.productName);
  const [paymentType, setPaymentType] = useState<string>(initial.paymentType);

  // ---- Products for dropdown
  const [products, setProducts] = useState<Array<{ productId: number; productName: string }>>([]);
  const [productError, setProductError] = useState<string>('');

  // ---- Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Prefetch products & plan details
  useEffect(() => {
    document.body.classList.add('edit-product-page'); // reuse page background/layout
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
        const plan = await fetchRatePlan(ratePlanId);
        setRatePlanName(plan.ratePlanName || '');
        setDescription(plan.description || '');
        setBillingFrequency(plan.billingFrequency || '');
        setPaymentType(plan.paymentType || '');
        setSelectedProductName(plan.productName || plan.product?.productName || '');
        // prime localStorage for subforms (same as your original)
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
        if (plan.perUnitAmount) {
          localStorage.setItem('usagePerUnit', String(plan.perUnitAmount));
        }
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
      }
    };
    loadPlan();

    return () => {
      document.body.classList.remove('edit-product-page');
    };
  }, [ratePlanId]);

  const goToStep = (index: number) => setCurrentStep(index);

  // ------ Validation (details step)
  const validateDetails = (): boolean => {
    const e: Record<string, string> = {};
    if (!ratePlanName.trim()) e.ratePlanName = 'This is a required field';
    if (!billingFrequency) e.billingFrequency = 'This is a required field';
    if (!selectedProductName) e.selectedProductName = 'This is a required field';
    if (!paymentType) e.paymentType = 'This is a required field';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ------ Persist top (details) portion
  const persistPlan = async (isDraft: boolean): Promise<boolean> => {
    if (!ratePlanId) return true; // nothing to save if id missing
    try {
      setLoading(true);
      // map product name to id (optional — backend may accept productName as well)
      let productId: number | undefined;
      if (selectedProductName && !productError) {
        const p = products.find(pr => pr.productName === selectedProductName);
        productId = p?.productId ? Number(p.productId) : undefined;
      }

      const payload: Partial<Omit<RatePlanRequest,'billableMetricId'>> = {
        ratePlanName,
        description,
        billingFrequency: billingFrequency as any,
        paymentType: paymentType as any,
        productId,
        productName: productId ? undefined : selectedProductName || undefined,
      };
      if (isDraft) (payload as any).status = 'DRAFT';

      await updateRatePlan(ratePlanId, payload);
      return true;
    } catch (err: any) {
      alert(err?.message || 'Failed to save rate plan');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ------ Save Draft (TopBar)
  const handleSaveDraft = async () => {
    if (draftStatus === 'saving') return;
    if (!validateDetails()) return;

    try {
      setDraftStatus('saving');
      const ok = await persistPlan(true);
      if (!ok) { setDraftStatus('idle'); return; }
      setDraftStatus('saved');
      setTimeout(() => setDraftStatus('idle'), 4000);
    } catch (e) {
      console.error('Save draft failed', e);
      alert('Failed to save draft. Please try again.');
      setDraftStatus('idle');
    }
  };

  // ------ Footer navigation
  const handleNextStep = async () => {
    if (activeTab === 'details') {
      if (!validateDetails()) return;
      const ok = await persistPlan(false);
      if (!ok) return;
      goToStep(1);
      return;
    }
    if (activeTab === 'pricing') {
      // Pricing form (EditPricing) can persist on its own button actions
      goToStep(2);
      return;
    }
    if (activeTab === 'extras') {
      // Extras form (EditExtras) can persist on its own button actions
      goToStep(3);
      return;
    }
    if (activeTab === 'review') {
      // Final save of details (if any pending), then exit
      const ok = await persistPlan(false);
      if (ok) navigate('/get-started/rate-plans');
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) goToStep(currentStep - 1);
    else setShowSaveDraftModal(true);
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
                  options={
                    productError
                      ? []
                      : products.map((p) => ({ label: p.productName, value: p.productName }))
                  }
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

      case 'pricing':
        return (
          <div className="edit-np-section">
            <div className="edit-np-configuration-tab">
              <EditPricing ratePlanId={ratePlanId} />
            </div>
          </div>
        );

      case 'extras':
        return (
          <div className="edit-np-section">
            <div className="edit-np-configuration-tab">
              <EditExtras ratePlanId={ratePlanId} noUpperLimit={false} />
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
        title={ratePlanId ? 'Edit Rate Plan' : 'Create Rate Plan'}
        onBack={() => setShowSaveDraftModal(true)}
        cancel={{
          label: 'Cancel',
          onClick: () => setShowDeleteConfirm(true),
        }}
        save={{
          label: draftStatus === 'saved' ? 'Saved as Draft' : 'Save as Draft',
          labelWhenSaved: 'Saved as Draft',
          saved: draftStatus === 'saved',
          saving: draftStatus === 'saving',
          disabled: loading,
          onClick: handleSaveDraft,
        }}
      />

      <div className="edit-np-viewport">
        <div className="edit-np-card">
          <div className="edit-np-grid">
            {/* Sidebar */}
            <aside className="edit-np-rail">
              <div className="edit-np-steps">
                {steps.map((step, index) => {
                  const isActive = index === currentStep;
                  const isCompleted = index < currentStep;
                  return (
                    <div
                      key={step.id}
                      className={`edit-np-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                      onClick={() => goToStep(index)}
                      role="button"
                    >
                      <div className="edit-np-step__title">{step.title}</div>
                      {/* optional desc: <div className="edit-np-step__desc">{step.desc}</div> */}
                    </div>
                  );
                })}
              </div>
            </aside>

            {/* Main Content */}
            <div className="edit-np-content">
              <div className="edit-np-form">
                {renderStepContent()}
              </div>

              {/* Footer Buttons */}
              <div className="edit-np-form-footer">
                <div className="edit-np-btn-group edit-np-btn-group--back">
                  {currentStep > 0 && (
                    <button
                      type="button"
                      className="np-btn np-btn--ghost"
                      onClick={handlePreviousStep}
                      disabled={loading}
                    >
                      Back
                    </button>
                  )}
                </div>

                <div className="edit-np-btn-group edit-np-btn-group--next">
                  <button
                    type="button"
                    className={`np-btn np-btn--primary ${loading ? 'np-btn--loading' : ''}`}
                    onClick={handleNextStep}
                    disabled={loading}
                  >
                    {loading
                      ? 'Saving...'
                      : activeTab === 'review'
                      ? 'Update Rate Plan'
                      : 'Next'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Save Draft confirmation modal (leave flow) */}
        <SaveDraft
          isOpen={showSaveDraftModal}
          onClose={() => setShowSaveDraftModal(false)}
          onSave={async () => {
            await handleSaveDraft();
            setShowSaveDraftModal(false);
            close();
          }}
        />

        {/* Discard / Cancel confirmation */}
        <ConfirmDeleteModal
          isOpen={showDeleteConfirm}
          productName={ratePlanName || 'this rate plan'}
          onConfirm={close}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      </div>
    </>
  );
};

export default EditRatePlan;
