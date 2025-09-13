import React, { useState, useEffect } from 'react';
import { Api, Product, RatePlan, Customer, Subscription as SubscriptionType } from '../api';
import EditReview from './EditReview';
import './EditSubscription.css';

interface EditSubscriptionProps {
  onClose: () => void;
  /** pass the existing subscription here when opening edit */
  initial?: SubscriptionType | null;
}

const steps = [
  { title: 'Subscription Details' },
  { title: 'Review & Confirm' }
];

const EditSubscription: React.FC<EditSubscriptionProps> = ({ onClose, initial }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [ratePlans, setRatePlans] = useState<RatePlan[]>([]);

  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [selectedCustomerName, setSelectedCustomerName] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [selectedProductName, setSelectedProductName] = useState('');
  const [selectedRatePlanId, setSelectedRatePlanId] = useState<number | null>(null);
  const [selectedRatePlanName, setSelectedRatePlanName] = useState('');
  const [planDescription, setPlanDescription] = useState('');
  const [paymentType, setPaymentType] = useState<string>('');
  const [currentStep, setCurrentStep] = useState(0);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    (async () => {
      try {
        const [cust, prod, rp] = await Promise.all([
          Api.getCustomers(),
          Api.getProducts(),
          Api.getRatePlans(),
        ]);
        setCustomers(cust || []);
        setProducts(prod || []);
        setRatePlans(rp || []);
      } catch (e) {
        console.error('Failed loading dropdown data', e);
      }
    })();
  }, []);

  // prefill from initial
  useEffect(() => {
    if (!initial) return;
    setSelectedCustomerId(initial.customerId ?? null);
    setSelectedProductId(initial.productId ?? null);
    setSelectedRatePlanId(initial.ratePlanId ?? null);
    setPaymentType(initial.paymentType || '');
    setPlanDescription(initial.adminNotes || '');
  }, [initial]);

  // hydrate display names
  useEffect(() => {
    if (selectedCustomerId && customers.length) {
      const cust = customers.find(c => c.customerId === selectedCustomerId);
      if (cust) setSelectedCustomerName(cust.customerName);
    }
  }, [selectedCustomerId, customers]);

  useEffect(() => {
    if (selectedProductId && products.length) {
      const prod = products.find(p => p.productId === selectedProductId);
      if (prod) setSelectedProductName(prod.productName);
    }
  }, [selectedProductId, products]);

  useEffect(() => {
    if (selectedRatePlanId && ratePlans.length) {
      const rp = ratePlans.find(r => r.ratePlanId === selectedRatePlanId);
      if (rp) setSelectedRatePlanName(rp.ratePlanName);
    }
  }, [selectedRatePlanId, ratePlans]);

  const handleNext = () =>
    currentStep < steps.length - 1 && setCurrentStep((s) => s + 1);

  const handleBack = () =>
    currentStep > 0 ? setCurrentStep((s) => s - 1) : onClose();

  const saveDraft = async () => {
    if (savingDraft || !initial?.subscriptionId) return;
    setSavingDraft(true);
    try {
      const payload = {
        customerId: selectedCustomerId ?? initial.customerId,
        productId: selectedProductId ?? initial.productId,
        ratePlanId: selectedRatePlanId ?? initial.ratePlanId,
        paymentType: paymentType || initial.paymentType,
        adminNotes: planDescription,
        status: 'DRAFT'
      };
      await Api.updateSubscriptionDraft(initial.subscriptionId, payload as any);
      setSubmissionStatus('success');
    } catch (e) {
      console.error('Failed to save draft', e);
      setSubmissionStatus('error');
    } finally {
      setSavingDraft(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <>
            <div className="edit-sub-create-form">
              <label>Customer</label>
              <select
                value={selectedCustomerId?.toString() || ''}
                onChange={(e) => {
                  const id = Number(e.target.value);
                  setSelectedCustomerId(id);
                  const cust = customers.find(c => c.customerId === id);
                  setSelectedCustomerName(cust?.customerName || '');
                }}
              >
                <option value="">Select Customer</option>
                {customers.map(c => (
                  <option key={c.customerId} value={c.customerId}>{c.customerName}</option>
                ))}
              </select>
            </div>

            <div className="edit-sub-form-row">
              <div className="edit-sub-create-form">
                <label>Product</label>
                <select
                  value={selectedProductId?.toString() || ''}
                  onChange={(e) => {
                    const id = Number(e.target.value);
                    setSelectedProductId(id);
                    const prod = products.find(p => p.productId === id);
                    setSelectedProductName(prod?.productName || '');
                    setSelectedRatePlanId(null);
                    setSelectedRatePlanName('');
                  }}
                >
                  <option value="">Select Product</option>
                  {products.map(p => (
                    <option key={p.productId} value={p.productId}>{p.productName}</option>
                  ))}
                </select>
              </div>

              <div className="edit-sub-create-form">
                <label>Rate Plan</label>
                <select
                  value={selectedRatePlanId?.toString() || ''}
                  onChange={(e) => {
                    const id = Number(e.target.value);
                    setSelectedRatePlanId(id);
                    const rp = ratePlans.find(r => r.ratePlanId === id);
                    setSelectedRatePlanName(rp?.ratePlanName || '');
                  }}
                >
                  <option value="">Select Rate Plan</option>
                  {ratePlans
                    .filter(rp => (selectedProductId ? rp.productId === selectedProductId : true))
                    .map(rp => (
                      <option key={rp.ratePlanId} value={rp.ratePlanId}>{rp.ratePlanName}</option>
                    ))}
                </select>
              </div>

              <div className="edit-sub-create-form">
                <label>Payment Type</label>
                <select
                  value={paymentType}
                  onChange={(e) => setPaymentType(e.target.value)}
                >
                  <option value="">Select Payment Type</option>
                  <option value="PREPAID">Prepaid</option>
                  <option value="POSTPAID">Postpaid</option>
                </select>
              </div>

              <div className="edit-sub-create-form">
                <label>Admin Notes</label>
                <textarea
                  placeholder="Enter admin notes"
                  value={planDescription}
                  onChange={(e) => setPlanDescription(e.target.value)}
                />
              </div>
            </div>
          </>
        );

      case 1:
        return (
          <EditReview
            customerName={selectedCustomerName || ''}
            productName={selectedProductName || ''}
            ratePlan={selectedRatePlanName || ''}
            paymentMethod={paymentType || ''}
            basePrice={0}
            quantity={1}
          />
        );

      default:
        return <p>Coming soon...</p>;
    }
  };

  return (
    <>
      {/* ===== HEADER ===== */}
      <div className="edit-sub-header-outer">
        <div className="edit-sub-header-bar">
          <div className="back-cluster">
            <button className="back-btn" onClick={handleBack} aria-label="Back">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M10.0003 15.8337L4.16699 10.0003M4.16699 10.0003L10.0003 4.16699M4.16699 10.0003H15.8337"
                  stroke="#909599" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                />
              </svg>
            </button>
            <h1 className="edit-title">Edit “Subscription”</h1>
          </div>

          <div className="edit-sub-header-actions">
            <button className="cancel-btn" onClick={() => setShowCancelModal(true)}>Cancel</button>
            <button className="draft-btn" onClick={saveDraft} disabled={savingDraft}>
              {savingDraft ? 'Saving…' : submissionStatus==='success' ? 'Saved as Draft' : 'Save as Draft'}
            </button>
          </div>
        </div>
      </div>
      {/* ===== /HEADER ===== */}

      {/* ===== BODY ===== */}
      <div className="edit-sub-create-price-plan">
        <div className="edit-sub-usage-metric-wrapper">
          {/* SIDE PROGRESS BAR */}
          <aside className="side-progress" aria-label="Progress">
            {steps.map((s, i) => {
              const isActive = i === currentStep;
              return (
                <button
                  key={s.title}
                  type="button"
                  className={`side-step ${isActive ? 'is-active' : 'is-inactive'}`}
                  onClick={() => setCurrentStep(i)}
                  aria-current={isActive ? 'step' : undefined}
                >
                  <span className="side-step__label">{s.title}</span>
                </button>
              );
            })}
          </aside>

          {/* FORM */}
          <div className="form-section">
            <div className="form-card">
              <h4 className="form-section-heading">{steps[currentStep].title.toUpperCase()}</h4>
              <hr className="form-section-divider" />
              {renderStepContent()}
            </div>

            <div className="button-group">
              <button className="back" onClick={handleBack} disabled={currentStep === 0}>
                Back
              </button>
              <button
                className="save-next"
                onClick={handleNext}
                disabled={currentStep === steps.length - 1}
              >
                Save & Next
              </button>
            </div>
          </div>
        </div>

        {showCancelModal && (
          <div className="delete-modal-overlay">
            <div className="delete-modal-content">
              <div className="delete-modal-body">
                <h5>Are you sure you want to discard<br /> this plan?</h5>
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
      </div>
      {/* ===== /BODY ===== */}
    </>
  );
};

export default EditSubscription;
