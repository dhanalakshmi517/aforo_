import React, { useState, useEffect } from 'react';
import SubReview from './SubReview';
import { Api, Product, RatePlan, Customer } from './api';
import './CreateSubscription.new.css';
import { InputField, TextareaField, SelectField } from '../Components/InputFields';
import TopBar from '../TopBar/TopBar';
import { Subscription as SubscriptionType } from './api';
import ConfirmDeleteModal from '../componenetsss/ConfirmDeleteModal';
import SaveDraft from '../componenetsss/SaveDraft';

interface CreateSubscriptionProps {
  onClose: () => void;
  onCreateSuccess: (sub: SubscriptionType) => void;
  onRefresh?: () => void;
  draftData?: SubscriptionType;
}

const steps = [
  { title: 'Purchase Details', desc: 'Provide purchase-related details' },
  { title: 'Review & Confirm', desc: 'Check and finalize details' },
];

const CreateSubscription: React.FC<CreateSubscriptionProps> = ({
  onClose,
  onCreateSuccess,
  onRefresh,
  draftData
}) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [selectedCustomerName, setSelectedCustomerName] = useState('');
  const [planDescription, setPlanDescription] = useState('');
  const [billingFrequency, setBillingFrequency] = useState('');
  const [selectedProductName, setSelectedProductName] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [ratePlans, setRatePlans] = useState<RatePlan[]>([]);
  const [selectedRatePlanName, setSelectedRatePlanName] = useState('');
  const [selectedRatePlanId, setSelectedRatePlanId] = useState<number | null>(null);
  const [paymentType, setPaymentType] = useState<'PREPAID' | 'POSTPAID' | ''>('');

  const [currentStep, setCurrentStep] = useState(0);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSaveDraftModal, setShowSaveDraftModal] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [savingDraft, setSavingDraft] = useState(false);
  const [subscriptionId, setSubscriptionId] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const sectionHeading = steps[currentStep].title;

  const clearError = (field: string) => {
    setErrors(prev => {
      const { [field]: _remove, ...rest } = prev;
      return rest;
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsData, ratePlansData, customersData] = await Promise.all([
          Api.getProducts(),
          Api.getRatePlans(),
          Api.getCustomers(),
        ]);
        setProducts(productsData ?? []);
        setRatePlans(ratePlansData ?? []);
        setCustomers(customersData ?? []);
      } catch (error) {
        console.error('Failed to load subscription dependencies.', error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (draftData) {
      setSelectedCustomerId(draftData.customerId);
      setSelectedProductId(draftData.productId);
      setSelectedRatePlanId(draftData.ratePlanId);
      setPaymentType(draftData.paymentType as 'PREPAID' | 'POSTPAID');
      setPlanDescription(draftData.adminNotes || '');
      setSubscriptionId(draftData.subscriptionId);

      if (customers.length > 0) {
        const customer = customers.find(c => c.customerId === draftData.customerId);
        setSelectedCustomerName(customer?.customerName || '');
      }
      if (products.length > 0) {
        const product = products.find(p => p.productId === draftData.productId);
        setSelectedProductName(product?.productName || '');
      }
      if (ratePlans.length > 0) {
        const ratePlan = ratePlans.find(rp => rp.ratePlanId === draftData.ratePlanId);
        setSelectedRatePlanName(ratePlan?.ratePlanName || '');
      }
    }
  }, [draftData, customers, products, ratePlans]);

  const validateStep0 = (): boolean => {
    const e: Record<string, string> = {};
    if (!selectedCustomerId) e.customerId = 'This is required field';
    if (!selectedProductId) e.productId = 'This is required field';
    if (!selectedRatePlanId) e.ratePlanId = 'This is required field';
    if (!paymentType) e.paymentType = 'This is required field';
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
        paymentType: paymentType || 'PREPAID',
        adminNotes: planDescription,
        status: 'DRAFT',
        isDraft: true,
      } as any;
      console.log('Saving DRAFT subscription with payload:', payload);
      let resp: SubscriptionType;
      if (subscriptionId) {
        resp = await Api.updateSubscriptionDraft(subscriptionId, payload as any);
      } else {
        resp = await Api.createSubscriptionDraft(payload as any);
        setSubscriptionId(resp.subscriptionId);
      }
      console.log('Draft save response:', resp);
      setSubmissionStatus('success');
    } catch (e) {
      console.error('Failed to save draft', e);
      setSubmissionStatus('error');
    } finally {
      setSavingDraft(false);
    }
  };

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      if (!validateStep0()) return;
      
      // Create draft subscription when moving to Review & Confirm step
      if (!subscriptionId) {
        try {
          const payload = {
            customerId: selectedCustomerId || 0,
            productId: selectedProductId || 0,
            ratePlanId: selectedRatePlanId || 0,
            paymentType: (paymentType || 'PREPAID') as 'PREPAID' | 'POSTPAID',
            adminNotes: planDescription,
            status: 'DRAFT',
            isDraft: true,
          };
          console.log('Creating DRAFT subscription for review:', payload);
          const resp = await Api.createSubscriptionDraft(payload as any);
          console.log('Draft creation response:', resp);
          setSubscriptionId(resp.subscriptionId);
        } catch (e) {
          console.error('Failed to create draft subscription', e);
          return;
        }
      }
      
      setCurrentStep(prev => prev + 1);
      return;
    }

    // Final step - Create Purchase (confirm the draft)
    try {
      let resp: SubscriptionType;
      
      if (subscriptionId) {
        // Confirm the draft subscription to make it active
        console.log('Confirming draft subscription:', subscriptionId);
        resp = await Api.confirmSubscription(subscriptionId);
        console.log('Confirmation response:', resp);
      } else {
        // Fallback: create active subscription directly (shouldn't happen with new flow)
        const payload = {
          customerId: selectedCustomerId || 0,
          productId: selectedProductId || 0,
          ratePlanId: selectedRatePlanId || 0,
          paymentType: (paymentType || 'PREPAID') as 'PREPAID' | 'POSTPAID',
          adminNotes: planDescription,
          status: 'ACTIVE',
          isDraft: false,
        };
        console.log('Creating new ACTIVE subscription with payload:', payload);
        resp = await Api.createSubscription(payload);
        console.log('Creation response:', resp);
      }
      
      setSubmissionStatus('success');
      onCreateSuccess(resp);
      onClose();
    } catch (e) {
      console.error('Failed to create subscription', e);
      setSubmissionStatus('error');
    }
  };

  const handleHeaderBack = () => setShowSaveDraftModal(true);
  
  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
    else onClose();
  };

  const handleDelete = async () => {
    if (!subscriptionId) {
      console.error('No subscription ID to delete');
      return;
    }
    try {
      await Api.deleteSubscription(subscriptionId);
      setShowDeleteModal(false);
      if (onRefresh) onRefresh();
      onClose();
    } catch (error) {
      console.error('Failed to delete subscription', error);
    }
  };

  // SaveDraft modal (back arrow) — delete flow
  const handleSaveDraft_NoDelete = async () => {
    try {
      if (subscriptionId != null) {
        await Api.deleteSubscription(subscriptionId);
      }
      setShowSaveDraftModal(false);
      if (onRefresh) onRefresh();
      onClose();
    } catch (error) {
      console.error('Failed to delete subscription', error);
    }
  };

  // SaveDraft modal (back arrow) — SAVE AS DRAFT flow
  const handleSaveDraft_Save = async () => {
    await saveDraft();
    setShowSaveDraftModal(false);
    onClose();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <>
            <div className="sub-create-form">
              <SelectField
                label="Customer"
                value={selectedCustomerId?.toString() || ''}
                onChange={(val) => {
                  const id = Number(val);
                  setSelectedCustomerId(id);
                  clearError('customerId');
                  const cust = customers.find(c => c.customerId === id);
                  setSelectedCustomerName(cust?.customerName || '');
                }}
                onFocus={() => clearError('customerId')}
                error={errors.customerId}
                options={customers.map(c => ({ label: c.customerName, value: c.customerId.toString() }))}
              />
            </div>

            <div className="sub-create-form">
              <SelectField
                label="Product"
                value={selectedProductId?.toString() || ''}
                onChange={(val) => {
                  const id = Number(val);
                  setSelectedProductId(id);
                  clearError('productId');
                  const prod = products.find(p => p.productId === id);
                  setSelectedProductName(prod?.productName || '');
                  setSelectedRatePlanName('');
                  setSelectedRatePlanId(null);
                }}
                onFocus={() => clearError('productId')}
                error={errors.productId}
                options={products.map(p => ({ label: p.productName, value: p.productId.toString() }))}
              />
            </div>

            <div className="product-note">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
                <g clipPath="url(#clip0_7837_33153)">
                  <path d="M6 8V6M6 4H6.005M11 6C11 8.76142 8.76142 11 6 11C3.23858 11 1 8.76142 1 6C1 3.23858 3.23858 1 6 1C8.76142 1 11 3.23858 11 6Z" stroke="#1D7AFC" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </g>
                <defs><clipPath id="clip0_7837_33153"><rect width="12" height="12" fill="white"/></clipPath></defs>
              </svg>
              <span>Select a product to view its associated rate plans.</span>
            </div>

            <div className="sub-create-form">
              <SelectField
                label="Rate Plan"
                value={selectedRatePlanId?.toString() || ''}
                onChange={(val) => {
                  const id = Number(val);
                  setSelectedRatePlanId(id);
                  clearError('ratePlanId');
                  const rp = ratePlans.find(r => r.ratePlanId === id);
                  setSelectedRatePlanName(rp?.ratePlanName || '');
                }}
                onFocus={() => clearError('ratePlanId')}
                error={errors.ratePlanId}
                options={ratePlans.map(rp => ({ label: rp.ratePlanName, value: rp.ratePlanId.toString() }))}
              />
            </div>

            <div className="rateplan-note">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
                <g clipPath="url(#clip0_7837_33153)">
                  <path d="M6 8V6M6 4H6.005M11 6C11 8.76142 8.76142 11 6 11C3.23858 11 1 8.76142 1 6C1 3.23858 3.23858 1 6 1C8.76142 1 11 3.23858 11 6Z" stroke="#1D7AFC" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </g>
                <defs><clipPath id="clip0_7837_33153"><rect width="12" height="12" fill="white"/></clipPath></defs>
              </svg>
              <span>Select a rate plan associated with the chosen product. Changing the product will reset this selection.</span>
            </div>

            <div className="sub-create-form">
              <SelectField
                label="Payment Type"
                value={paymentType}
                onChange={(val) => { setPaymentType(val as 'PREPAID' | 'POSTPAID'); clearError('paymentType'); }}
                onFocus={() => clearError('paymentType')}
                error={errors.paymentType}
                options={[
                  { label: 'Post-Paid', value: 'POSTPAID' },
                  { label: 'Pre-Paid', value: 'PREPAID' }
                ]}
              />
            </div>

            <div className="sub-create-form">
              <TextareaField
                label="Admin Notes"
                placeholder="Enter admin notes"
                value={planDescription}
                onChange={setPlanDescription}
                onFocus={() => clearError('adminNotes')}
                error={errors.adminNotes}
              />
            </div>
          </>
        );
      case 1:
        return (
          <SubReview
            customerName={selectedCustomerName || ''}
            productName={selectedProductName || ''}
            ratePlan={selectedRatePlanName || ''}
            paymentMethod={paymentType || 'Invoice (Net Terms)'}
            adminNotes={planDescription}
          />
        );
      default:
        return <p>Coming soon...</p>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* ✅ FIX: pass onBack so TopBar renders the back button */}
      <TopBar
        title="Create New Purchase"
        onBack={handleHeaderBack}
        cancel={{
          label: subscriptionId ? 'Delete' : 'Cancel',
          onClick: subscriptionId ? () => setShowDeleteModal(true) : () => setShowCancelModal(true)
        }}
        save={{ label: 'Save as Draft', saving: savingDraft, saved: submissionStatus === 'success', onClick: saveDraft }}
      />

      <div className="sub-create-price-plan" style={{ padding: '24px 64px', flex: 1 }}>
        <div className="sub-usage-metric-wrapper" style={{ width: '100%', maxWidth: '100%' }}>
          <aside
            className="sub-sidebars"
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: 0,
              width: '300px',
              backgroundColor: 'var(--color-neutral-100)',
              padding: '30px 20px',
              borderRight: '1.5px solid var(--color-neutral-200)',
              overflow: 'hidden',
              zIndex: 1,
            }}
          >
            {steps.map((step, index) => {
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              return (
                <div
                  key={index}
                  className={`sub-step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                  onClick={() => setCurrentStep(index)}
                >
                  <div className="sub-marker">
                    <span className="outer"><span className="inner" /></span>
                  </div>
                  <div className="sub-step-text">
                    <span className="sub-step-title">{step.title}</span>
                    <span className="sub-step-desc">{step.desc}</span>
                  </div>
                </div>
              );
            })}
          </aside>

          <div
            className="form-section"
            style={{
              marginLeft: '300px',
              width: 'calc(100% - 300px)',
              height: '100%',
              overflow: 'hidden',
              padding: '32px 40px',
              position: 'relative',
            }}
          >
            <div className="sub-section-header">
              <h3 className="sub-section-title">{sectionHeading.toUpperCase()}</h3>
            </div>

            <div className="form-card">{renderStepContent()}</div>

            <div className="button-group">
              {currentStep > 0 && (
                <button className="back" onClick={handleBack}>Back</button>
              )}
              <button
                className="save-next"
                onClick={handleNext}
                title={currentStep < steps.length - 1 ? 'Save & Next' : 'Create Purchase'}
              >
                {currentStep < steps.length - 1 ? 'Save & Next' : 'Create Purchase'}
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
                <button className="delete-modal-cancel" onClick={() => setShowCancelModal(false)}>Back</button>
                <button className="delete-modal-confirm" onClick={onClose}>Confirm</button>
              </div>
            </div>
          </div>
        )}

        <ConfirmDeleteModal
          isOpen={showDeleteModal}
          productName={`Subscription ${subscriptionId || ''}`}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
        />

        <SaveDraft
          isOpen={showSaveDraftModal}
          onClose={handleSaveDraft_NoDelete}   // "No, Delete"
          onSave={handleSaveDraft_Save}        // "Yes, Save as Draft"
        />
      </div>
    </div>
  );
};

export default CreateSubscription;
