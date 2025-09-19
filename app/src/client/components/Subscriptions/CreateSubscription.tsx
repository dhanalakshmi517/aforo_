import React, { useState, useEffect } from 'react';
import SubReview from './SubReview';
import { Api, Product, RatePlan, Customer } from './api';
import './CreateSubscription.new.css';
import { InputField, TextareaField, SelectField } from '../Components/InputFields';
import TopBar from '../TopBar/TopBar';
import { Subscription as SubscriptionType } from './api';

interface CreateSubscriptionProps {
  onClose: () => void;
  onCreateSuccess: (sub: SubscriptionType) => void;
}

type StepId = 1 | 2;

const steps: Array<{ id: StepId; title: string; desc: string }> = [
  {
    id: 1,
    title: 'Subscription Details',
    desc: "Set up the core information like plan type, and pricing model for this subscription.",
  },
  {
    id: 2,
    title: 'Review & Confirm',
    desc: "Review the final pricing and details based on the information you've entered.",
  },
];

const CreateSubscription: React.FC<CreateSubscriptionProps> = ({ onClose, onCreateSuccess }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [ratePlans, setRatePlans] = useState<RatePlan[]>([]);

  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [selectedCustomerName, setSelectedCustomerName] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [selectedProductName, setSelectedProductName] = useState('');
  const [selectedRatePlanId, setSelectedRatePlanId] = useState<number | null>(null);
  const [selectedRatePlanName, setSelectedRatePlanName] = useState('');
  const [paymentType, setPaymentType] = useState<'PREPAID' | 'POSTPAID' | ''>('');
  const [planDescription, setPlanDescription] = useState('');

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [savingDraft, setSavingDraft] = useState(false);
  const [subscriptionId, setSubscriptionId] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // helpers
  const stepCount = steps.length;
  const currentStep = steps[currentStepIndex];

  const clearError = (field: string) => {
    setErrors((prev) => {
      const { [field]: _gone, ...rest } = prev;
      return rest;
    });
  };

  // Load selectable data
  useEffect(() => {
    (async () => {
      try {
        const [productsData, ratePlansData, customersData] = await Promise.all([
          Api.getProducts(),
          Api.getRatePlans(),
          Api.getCustomers(),
        ]);
        setProducts(productsData ?? []);
        setRatePlans(ratePlansData ?? []);
        setCustomers(customersData ?? []);
      } catch (e) {
        console.error('Failed to load subscription dependencies.', e);
      }
    })();
  }, []);

  const validateStep0 = (): boolean => {
    const e: Record<string, string> = {};
    if (!selectedCustomerId) e.customerId = 'This field is required';
    if (!selectedProductId) e.productId = 'This field is required';
    if (!selectedRatePlanId) e.ratePlanId = 'This field is required';
    if (!paymentType) e.paymentType = 'This field is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const saveDraft = async () => {
    if (savingDraft) return;
    setSavingDraft(true);
    try {
      const payload = {
        customerId: selectedCustomerId || 0,
        productId: selectedProductId || 0,
        ratePlanId: selectedRatePlanId || 0,
        paymentType: (paymentType || 'PREPAID') as 'PREPAID' | 'POSTPAID',
        adminNotes: planDescription,
        status: 'DRAFT',
      } as any;

      let resp: SubscriptionType;
      if (subscriptionId) {
        resp = await Api.updateSubscriptionDraft(subscriptionId, payload);
      } else {
        resp = await Api.createSubscriptionDraft(payload);
        setSubscriptionId(resp.subscriptionId);
      }
      setSubmissionStatus('success');
    } catch (e) {
      console.error('Failed to save draft', e);
      setSubmissionStatus('error');
    } finally {
      setSavingDraft(false);
    }
  };

  const handleNext = async () => {
    const lastIndex = stepCount - 1;

    if (currentStepIndex < lastIndex) {
      if (!validateStep0()) return;
      setCurrentStepIndex((i) => i + 1);
      return;
    }

    // Final submit
    try {
      const payload = {
        customerId: selectedCustomerId || 0,
        productId: selectedProductId || 0,
        ratePlanId: selectedRatePlanId || 0,
        paymentType: (paymentType || 'PREPAID') as 'PREPAID' | 'POSTPAID',
        adminNotes: planDescription,
      };
      const resp: SubscriptionType = await Api.createSubscription(payload);
      setSubmissionStatus('success');
      onCreateSuccess(resp);
      onClose();
    } catch (e) {
      console.error('Failed to create subscription', e);
      setSubmissionStatus('error');
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) setCurrentStepIndex((i) => i - 1);
    else onClose();
  };

  const gotoStep = (index: number) => setCurrentStepIndex(index);

  const canSaveNext =
    !!selectedCustomerId &&
    !!selectedProductId &&
    !!selectedRatePlanId &&
    (paymentType === 'PREPAID' || paymentType === 'POSTPAID');

  // ---------- Renderers ----------
  const renderStep0 = () => (
    <>
      <div className="np-grid">
        <SelectField
          label="Customer"
          value={selectedCustomerId?.toString() || ''}
          onChange={(val) => {
            const id = Number(val);
            setSelectedCustomerId(id);
            clearError('customerId');
            const cust = customers.find((c) => c.customerId === id);
            setSelectedCustomerName(cust?.customerName || '');
          }}
          error={errors.customerId}
          options={customers.map((c) => ({ label: c.customerName, value: c.customerId.toString() }))}
        />

        <SelectField
          label="Product"
          value={selectedProductId?.toString() || ''}
          onChange={(val) => {
            const id = Number(val);
            setSelectedProductId(id);
            clearError('productId');
            const prod = products.find((p) => p.productId === id);
            setSelectedProductName(prod?.productName || '');
            // reset rate plan when product changes
            setSelectedRatePlanId(null);
            setSelectedRatePlanName('');
          }}
          error={errors.productId}
          options={products.map((p) => ({ label: p.productName, value: p.productId.toString() }))}
        />

        <div className="np-inline-note">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <g clipPath="url(#clip0_7837_33153)">
              <path d="M6 8V6M6 4H6.005M11 6C11 8.76142 8.76142 11 6 11C3.23858 11 1 8.76142 1 6C1 3.23858 3.23858 1 6 1C8.76142 1 11 3.23858 11 6Z" stroke="#1D7AFC" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </g>
            <defs>
              <clipPath id="clip0_7837_33153">
                <rect width="12" height="12" fill="white"/>
              </clipPath>
            </defs>
          </svg>
          <span>Select a product to view its associated rate plans.</span>
        </div>

        <SelectField
          label="Rate Plan"
          value={selectedRatePlanId?.toString() || ''}
          onChange={(val) => {
            const id = Number(val);
            setSelectedRatePlanId(id);
            clearError('ratePlanId');
            const rp = ratePlans.find((r) => r.ratePlanId === id);
            setSelectedRatePlanName(rp?.ratePlanName || '');
          }}
          error={errors.ratePlanId}
          options={ratePlans.map((rp) => ({ label: rp.ratePlanName, value: rp.ratePlanId.toString() }))}
        />

        <div className="np-inline-note">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <g clipPath="url(#clip0_7837_33153)">
              <path d="M6 8V6M6 4H6.005M11 6C11 8.76142 8.76142 11 6 11C3.23858 11 1 8.76142 1 6C1 3.23858 3.23858 1 6 1C8.76142 1 11 3.23858 11 6Z" stroke="#1D7AFC" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </g>
            <defs>
              <clipPath id="clip0_7837_33153">
                <rect width="12" height="12" fill="white"/>
              </clipPath>
            </defs>
          </svg>
          <span>Pick a rate plan for the selected product. Changing the product resets this selection.</span>
        </div>

        <SelectField
          label="Payment Type"
          value={paymentType}
          onChange={(val) => {
            setPaymentType(val as 'PREPAID' | 'POSTPAID');
            clearError('paymentType');
          }}
          error={errors.paymentType}
          options={[
            { label: 'Post-Paid', value: 'POSTPAID' },
            { label: 'Pre-Paid', value: 'PREPAID' },
          ]}
        />

        <TextareaField
          label="Admin Notes"
          placeholder="Enter admin notes"
          value={planDescription}
          onChange={setPlanDescription}
        />
      </div>
    </>
  );

  const renderStep1 = () => (
    <SubReview
      customerName={selectedCustomerName || ''}
      productName={selectedProductName || ''}
      ratePlan={selectedRatePlanName || ''}
      paymentMethod={paymentType || 'Invoice (Net Terms)'}
      adminNotes={planDescription}
    />
  );

  return (
    <>
      <TopBar
        title="Create New Subscription"
        cancel={{
          label: 'Cancel',
          onClick: () => setShowCancelModal(true),
        }}
        save={{
          label: 'Save as Draft',
          saving: savingDraft,
          saved: submissionStatus === 'success',
          onClick: saveDraft,
        }}
      />

      <div className="np-viewport">
        <div className="np-card">
          <div className="np-grid">
            {/* LEFT: steps rail */}
            <aside className="np-rail">
              <nav className="np-steps">
                {steps.map((step, i) => {
                  const isActive = i === currentStepIndex;
                  const isCompleted = i < currentStepIndex;
                  const showConnector = i < steps.length - 1;
                  return (
                    <button
                      key={step.id}
                      type="button"
                      className={['np-step', isActive ? 'active' : '', isCompleted ? 'completed' : ''].join(' ').trim()}
                      onClick={() => gotoStep(i)}
                    >
                      {/* bullet + connector */}
                      <span className="np-step__bullet" aria-hidden="true">
                        <span className="np-step__icon">
                          {isCompleted ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                              <circle cx="12" cy="12" r="11.5" fill="var(--color-primary-800)" stroke="var(--color-primary-800)" />
                              <path d="M7 12l3 3 6-6" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                              <circle cx="12" cy="12" r="11" stroke="#C3C2D0" strokeWidth="2" />
                              <circle cx="12" cy="12" r="6" fill="#C3C2D0" />
                            </svg>
                          )}
                        </span>
                        {showConnector && <span className="np-step__connector" />}
                      </span>

                      {/* text column */}
                      <span className="np-step__text">
                        <span className="np-step__title">{step.title}</span>
                        <span className="np-step__desc">{step.desc}</span>
                      </span>
                    </button>
                  );
                })}
              </nav>
            </aside>

            {/* MAIN */}
            <main className="np-main">
              <div className="np-main__inner">
                <div className="np-body">
                  <form className="np-form" onSubmit={(e) => e.preventDefault()}>
                    <div className="np-form-section">
                      <section>
                        <div className="np-section-header">
                          <h3 className="np-section-title">
                            {currentStep.id === 1 ? 'SUBSCRIPTION DETAILS' : 'REVIEW & CONFIRM'}
                          </h3>
                        </div>

                        {currentStep.id === 1 ? renderStep0() : renderStep1()}
                      </section>
                    </div>

                    {/* Footer actions */}
                    <div className="np-form-footer">
                      {currentStep.id === 1 && (
                        <>
                          {errors.form && <div className="np-error-message">{errors.form}</div>}
                          <div className="np-btn-group np-btn-group--next">
                            <button
                              type="button"
                              className="np-btn np-btn--primary"
                              onClick={handleNext}
                              disabled={!canSaveNext}
                              title={
                                !canSaveNext
                                  ? 'Select customer, product, rate plan and payment type'
                                  : 'Save & Next'
                              }
                            >
                              Save & Next
                            </button>
                          </div>
                        </>
                      )}

                      {currentStep.id === 2 && (
                        <>
                          <div className="np-btn-group np-btn-group--back">
                            <button type="button" className="np-btn np-btn--ghost" onClick={handleBack}>
                              Back
                            </button>
                          </div>
                          <div className="np-btn-group np-btn-group--next">
                            <button
                              type="button"
                              className="np-btn np-btn--primary"
                              onClick={handleNext}
                              title="Create Purchase"
                            >
                              Create Purchase
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
        </div>
      </div>

      {/* Cancel / Discard modal (same behavior; classnames already in use in your project) */}
      {showCancelModal && (
        <div className="delete-modal-overlay">
          <div className="delete-modal-content">
            <div className="delete-modal-body">
              <h5>
                Are you sure you want to discard
                <br /> this plan?
              </h5>
              <p>Your progress will not be saved.</p>
            </div>
            <div className="delete-modal-footer">
              <button className="delete-modal-cancel" onClick={() => setShowCancelModal(false)}>
                Back
              </button>
              <button className="delete-modal-confirm" onClick={onClose}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateSubscription;
