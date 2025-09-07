import React, { useMemo, useState } from 'react';
import { fetchProducts, updateRatePlan, RatePlanRequest, fetchRatePlan } from '../api';
import { useNavigate, useLocation } from 'react-router-dom';
import EditPricing from './EditPricing';
import EditExtras from './EditExtras';
import EditReview from './EditReview';
import './EditRatePlan.css';

const steps = ['Plan Details', 'Pricing Model Setup', 'Extras', 'Review & Confirm'];

interface EditRatePlanProps {
  onClose?: () => void;
}

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
      ratePlanName:
        p.ratePlanName ?? raw.ratePlanName ?? '',
      description:
        p.description ?? raw.description ?? '',
      billingFrequency:
        p.billingFrequency ?? raw.billingFrequency ?? '',
      productName:
        p.productName ?? p.product?.productName ?? raw.productName ?? raw.product?.productName ?? '',
      paymentType:
        p.paymentType ?? raw.paymentType ?? '',
    };
  }, [raw]);

  const close = () => {
    if (onClose) onClose();
    else navigate('/get-started/rate-plans');
  };

  // Controlled form state (pre-filled from initial)
  const [ratePlanName, setRatePlanName] = useState<string>(initial.ratePlanName);
  const [description, setDescription] = useState<string>(initial.description);
  const [billingFrequency, setBillingFrequency] = useState<string>(initial.billingFrequency);
  const [selectedProductName, setSelectedProductName] = useState<string>(initial.productName);
  const [paymentType, setPaymentType] = useState<string>(initial.paymentType);

  // Load existing plan details on mount
  React.useEffect(() => {
    const load = async () => {
      if (!ratePlanId) return;
      try {
        const plan = await fetchRatePlan(ratePlanId);
        setPlanData(plan);
        setRatePlanName(plan.ratePlanName || '');
        setDescription(plan.description || '');
        setBillingFrequency(plan.billingFrequency || '');
        setPaymentType(plan.paymentType || '');
        setSelectedProductName(plan.productName || plan.product?.productName || '');
        // pricing model guess
        if (plan.flatFeeAmount) localStorage.setItem('pricingModel','Flat Fee');
        else if (plan.volumePricing) localStorage.setItem('pricingModel','Volume-Based');
        else if (plan.tieredPricing) localStorage.setItem('pricingModel','Tiered Pricing');
        else if (plan.stairStepPricing) localStorage.setItem('pricingModel','Stairstep');
        else if (plan.perUnitAmount) localStorage.setItem('pricingModel','Usage-Based');
        // Pricing payloads to localStorage so sub-forms show data
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
        // Extras
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
      } catch(e){ console.error('Failed to fetch plan',e); }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ratePlanId]);

  const [currentStep, setCurrentStep] = useState(0);
  const [planData,setPlanData] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const handleNext = async () => {
    // Before moving forward, persist basic info when on first step
    if (currentStep === 0 && ratePlanId) {
      const ok = await persistPlan(false);
      if (!ok) return; // abort navigation on error
    }

    if (currentStep < steps.length - 1) setCurrentStep((prev) => prev + 1);
  };

  const persistPlan = async (isDraft:boolean): Promise<boolean> => {
    if (!ratePlanId) return true; // nothing to save if id missing
    try {
      setSaving(true);
      // map product name to id
      let productId: number | undefined = undefined;
      if (selectedProductName) {
        try {
          const prods = await fetchProducts();
          const p = prods.find(pr => pr.productName === selectedProductName);
          productId = p?.productId ? Number(p.productId) : undefined;
        } catch (e) {
          console.error('Failed to fetch products', e);
        }
      }
      const payload: Partial<Omit<RatePlanRequest,'billableMetricId'>> = {
        ratePlanName,
        description,
        billingFrequency: billingFrequency as any,
        paymentType: paymentType as any,
        productId,
        productName: productId ? undefined : selectedProductName || undefined,
      };
      if (isDraft) {
        (payload as any).status = 'DRAFT';
      }
      await updateRatePlan(ratePlanId, payload);
      return true;
    } catch (err:any) {
      alert(err?.message || 'Failed to save rate plan');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep((prev) => prev - 1);
    else close();
  };

  // Static options (example). We’ll still show whatever is already set even if it isn't in this list.
  const productOptions = ['Product A', 'Product B', 'Product C'];

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <>
            <div className="erp-form-row">
              <label className="erp-field-label">Rate Plan Name</label>
              <input
                className="erp-input erp-w-440"
                type="text"
                value={ratePlanName}
                onChange={(e) => setRatePlanName(e.target.value)}
                placeholder="Rate Plan Name"
              />
            </div>

            <div className="erp-form-row">
              <label className="erp-field-label">Rate Plan Description</label>
              <textarea
                className="erp-textarea erp-w-440"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Placeholder Placeholder Placeholder"
              />
            </div>

            <div className="erp-three-col">
              <div className="erp-form-row">
                <label className="erp-field-label">Billing Frequency</label>
                <select
                  className="erp-select erp-w-440"
                  value={billingFrequency}
                  onChange={(e) => setBillingFrequency(e.target.value)}
                >
                  <option value="">--select--</option>
                  <option value="MONTHLY">Monthly</option>
                  <option value="YEARLY">Yearly</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="DAILY">Daily</option>
                  <option value="HOURLY">Hourly</option>
                </select>
              </div>

              <div className="erp-form-row">
                <label className="erp-field-label">Select Product Name</label>
                <select
                  className="erp-select erp-w-440"
                  value={selectedProductName}
                  onChange={(e) => setSelectedProductName(
                    e.target.options[e.target.selectedIndex].text
                  )}
                >
                  <option value="">--select--</option>

                  {/* Ensure the current product (from the plan) is available even if not in the static list */}
                  {selectedProductName &&
                    !productOptions.includes(selectedProductName) && (
                      <option value={selectedProductName}>{selectedProductName}</option>
                    )}

                  {productOptions.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div className="erp-form-row">
                <label className="erp-field-label">Payment Type</label>
                <select
                  className="erp-select erp-w-440"
                  value={paymentType}
                  onChange={(e) => setPaymentType(e.target.value)}
                >
                  <option value="">--select--</option>
                  <option value="POSTPAID">Post-Paid</option>
                  <option value="PREPAID">Pre-Paid</option>
                </select>
              </div>
            </div>
          </>
        );
      case 1:
        return <EditPricing ratePlanId={ratePlanId} />;
      case 2:
        return <EditExtras ratePlanId={ratePlanId} noUpperLimit={false} />;
      case 3:
        return <EditReview />;
      default:
        return <p>Coming soon...</p>;
    }
  };

  return (
    <div className="erp-page">
      {/* Top bar */}
      <div className="erp-topbar">
        <button className="erp-back-btn" onClick={handleBack} aria-label="Back">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M10 15.833L4.167 10M4.167 10L10 4.167M4.167 10H15.833"
              stroke="#706C72" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
            />
          </svg>
        </button>

        <h2 className="erp-title">Edit “{ratePlanName || initial.ratePlanName || ''}”</h2>

        <div className="erp-top-actions">
          <button className="erp-btn erp-btn-cancel erp-btn-top-cancel" onClick={close}>
            Cancel
          </button>
          <button
            className="erp-btn erp-btn-outline erp-btn-top"
            disabled={saving}
            onClick={async () => {
              await persistPlan(true);
            }}
          >
            {saving ? 'Saving...' : 'Save as Draft'}
          </button>
        </div>
      </div>

      {/* Wrapper (full width, fixed bottom gap) */}
      <div className="erp-wrapper">
        {/* Sidebar */}
        <aside className="erp-side">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`erp-step ${index === currentStep ? 'active' : ''}`}
              onClick={() => setCurrentStep(index)}
              role="button"
            >
              <span className="erp-step-dot" />
              <span className="erp-step-text">{step}</span>
            </div>
          ))}
        </aside>

        {/* Right section */}
        <div className="erp-section">
          <div className="erp-section-header">
            <div className="erp-section-title">{steps[currentStep]}</div>
          </div>

          <div className="erp-form-card">{renderStepContent()}</div>

          {/* Footer actions (sticky inside card) */}
          <div className="erp-actions">
            <button className="erp-btn erp-btn-ghost erp-btn-cta" onClick={handleBack}>
              Back
            </button>
            <button
              className="erp-btn erp-btn-primary erp-btn-cta"
              onClick={async () => {
                if (currentStep === steps.length - 1 && ratePlanId) {
                  const ok = await persistPlan(false);
                  if (ok) navigate('/get-started/rate-plans');
                } else {
                  handleNext();
                }
              }}
            >
              {currentStep === steps.length - 1 && ratePlanId ? 'Update Rate Plan' : 'Save & Next'}
            </button>
          </div>
        </div>
      </div>

      {showCancelModal && (
        <div className="erp-modal-overlay">
          <div className="erp-modal">
            <div className="erp-modal-body">
              <h5>Discard changes?</h5>
              <p>Your progress will not be saved.</p>
            </div>
            <div className="erp-modal-footer">
              <button className="erp-btn erp-btn-ghost" onClick={() => setShowCancelModal(false)}>
                Back
              </button>
              <button className="erp-btn erp-btn-primary" onClick={close}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditRatePlan;
