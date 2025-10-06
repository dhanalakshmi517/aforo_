import * as React from 'react';
import { useEffect, useMemo, useState, useCallback } from 'react';
import TopBar from '../../componenetsss/TopBar';
import EditModal from '../../componenetsss/EditModal';
import EditPopUp from '../../componenetsss/EditPopUp';
import { SelectField, TextareaField } from '../../componenetsss/Inputs';
import { useToast } from '../../componenetsss/ToastProvider';
import PrimaryButton from '../../componenetsss/PrimaryButton';
import SecondaryButton from '../../componenetsss/SecondaryButton';
import EditReview from './EditReview';
import './EditSubscription.css';
import { Api, Product, RatePlan, Customer, Subscription as SubscriptionType } from '../api';

type ActiveTab = 'details' | 'review';

interface EditSubscriptionProps {
  onClose: () => void;
  /** pass the existing subscription here when opening edit */
  initial?: SubscriptionType | null;
  onRefresh?: () => void;
}

const steps = [
  { id: 1, title: 'Subscription Details' },
  { id: 2, title: 'Review & Confirm' }
];

const EditSubscription: React.FC<EditSubscriptionProps> = ({ onClose, initial, onRefresh }) => {
  const { showToast } = useToast();
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
  const [activeTab, setActiveTab] = useState<ActiveTab>('details');

  const [showSaveDraftModal, setShowSaveDraftModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [hasChanges, setHasChanges] = useState(false);

  // Update hasChanges when any form field changes
  useEffect(() => {
    if (initial) {
      const formChanged = 
        selectedCustomerId !== initial.customerId ||
        selectedProductId !== initial.productId ||
        selectedRatePlanId !== initial.ratePlanId ||
        paymentType !== initial.paymentType ||
        planDescription !== (initial.adminNotes || '');
      
      setHasChanges(formChanged);
    } else {
      // For new subscriptions, check if any field has a value
      const anyFieldFilled = 
        selectedCustomerId !== null ||
        selectedProductId !== null ||
        selectedRatePlanId !== null ||
        paymentType !== '' ||
        planDescription !== '';
      
      setHasChanges(anyFieldFilled);
    }
  }, [
    selectedCustomerId, 
    selectedProductId, 
    selectedRatePlanId, 
    paymentType, 
    planDescription, 
    initial
  ]);

  // Load dropdowns
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

  // Prefill from initial
  useEffect(() => {
    if (!initial) return;
    setSelectedCustomerId(initial.customerId ?? null);
    setSelectedProductId(initial.productId ?? null);
    setSelectedRatePlanId(initial.ratePlanId ?? null);
    setPaymentType(initial.paymentType || '');
    setPlanDescription(initial.adminNotes || '');
  }, [initial]);

  // Hydrate names
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

  // Helpers to mirror EditProduct structure
  const goToStep = (index: number) => {
    setCurrentStep(index);
    setActiveTab(index === 0 ? 'details' : 'review');
  };

  const canSubmit = useMemo(() => {
    // Minimal validation for details step
    return Boolean(
      (selectedCustomerId ?? null) &&
      (selectedProductId ?? null) &&
      (selectedRatePlanId ?? null) &&
      paymentType
    );
  }, [selectedCustomerId, selectedProductId, selectedRatePlanId, paymentType]);

  const saveChanges = async (): Promise<boolean> => {
    if (!initial?.subscriptionId) return false;
    try {
      const payload = {
        customerId: selectedCustomerId ?? initial.customerId,
        productId: selectedProductId ?? initial.productId,
        ratePlanId: selectedRatePlanId ?? initial.ratePlanId,
        paymentType: paymentType || initial.paymentType,
        adminNotes: planDescription,
        status: 'ACTIVE' as const
      };
      await Api.updateSubscription(initial.subscriptionId, payload as any);
      if (onRefresh) onRefresh();
      return true;
    } catch (e) {
      console.error('Failed to save changes', e);
      return false;
    }
  };

  const handleNextStep = async () => {
    if (activeTab === 'details') {
      // move to review if valid
      if (!canSubmit) return;
      goToStep(1);
      return;
    }
    // review -> save changes
    const ok = await saveChanges();
    if (ok) onClose();
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      goToStep(currentStep - 1);
    }
  };

  const saveDraft = async (options: { skipToast?: boolean } = {}): Promise<boolean> => {
    const { skipToast = false } = options;
    if (savingDraft || !initial?.subscriptionId) return false;
    setSavingDraft(true);
    try {
      // Save all form field changes without modifying the status
      const payload = {
        customerId: selectedCustomerId ?? initial.customerId,
        productId: selectedProductId ?? initial.productId,
        ratePlanId: selectedRatePlanId ?? initial.ratePlanId,
        paymentType: paymentType || initial.paymentType,
        adminNotes: planDescription
        // Don't include status to keep it unchanged
      };
      await Api.updateSubscriptionDraft(initial.subscriptionId, payload as any);
      setSubmissionStatus('success');
      
      if (!skipToast) {
        showToast({
          kind: 'success',
          title: 'Draft Saved',
          message: 'Your changes have been saved as a draft.'
        });
      }
      return true;
    } catch (e) {
      console.error('Failed to save draft', e);
      setSubmissionStatus('error');
      
      if (!skipToast) {
        showToast({
          kind: 'error',
          title: 'Save Failed',
          message: 'Failed to save draft. Please try again.'
        });
      }
      return false;
    } finally {
      setSavingDraft(false);
    }
  };

  // Handle back button click - show save draft modal
  const handleHeaderBack = useCallback(() => {
    setShowExitModal(true);
  }, []);

  // Save draft and close
  const handleSaveDraft = async (): Promise<boolean> => {
    const saved = await saveDraft({ skipToast: true });
    if (saved) {
      showToast({
        kind: 'success',
        title: 'Changes saved',
        message: 'Your changes have been saved successfully.'
      });
      onClose();
      return true;
    }
    return false;
  };

  // Handle exit without saving - used by the cancel button in the popup
  const handleExitWithoutSaving = useCallback(() => {
    setShowExitModal(false);
    onClose();
  }, [onClose]);

  return (
    <>
      {/* Header matches EditProduct pattern */}
      <TopBar title={'Edit Subscription'} onBack={handleHeaderBack} />

      <div className="edit-np-viewport">
        <div className="edit-np-card">
          <div className="edit-np-grid">
            {/* Sidebar / Steps */}
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
                    >
                      <div className="edit-np-step__title">{step.title}</div>
                    </div>
                  );
                })}
              </div>
            </aside>

            {/* Main Content */}
            <div className="edit-np-content">
              <div className="edit-np-form">
                {/* ---------- DETAILS ---------- */}
                {activeTab === 'details' && (
                  <div className="edit-np-section">
                    <div className="edit-np-form-row">
                      <div className="edit-np-form-group">
                        <SelectField
                          label="Customer"
                          value={selectedCustomerId?.toString() || ''}
                          onChange={(value) => {
                            const id = Number(value);
                            setSelectedCustomerId(id);
                            const cust = customers.find(c => c.customerId === id);
                            setSelectedCustomerName(cust?.customerName || '');
                          }}
                          options={[
                            { label: 'Select Customer', value: '' },
                            ...customers.map(c => ({
                              label: c.customerName,
                              value: c.customerId.toString()
                            }))
                          ]}
                        />
                      </div>
                    </div>

                    <div className="edit-np-form-row">
                      <div className="edit-np-form-group">
                        <SelectField
                          label="Product"
                          value={selectedProductId?.toString() || ''}
                          onChange={(value) => {
                            const id = Number(value);
                            setSelectedProductId(id);
                            const prod = products.find(p => p.productId === id);
                            setSelectedProductName(prod?.productName || '');
                            setSelectedRatePlanId(null);
                            setSelectedRatePlanName('');
                          }}
                          options={[
                            { label: 'Select Product', value: '' },
                            ...products.map(p => ({
                              label: p.productName,
                              value: p.productId.toString()
                            }))
                          ]}
                        />
                      </div>

                      <div className="edit-np-form-group">
                        <SelectField
                          label="Rate Plan"
                          value={selectedRatePlanId?.toString() || ''}
                          onChange={(value) => {
                            const id = Number(value);
                            setSelectedRatePlanId(id);
                            const rp = ratePlans.find(r => r.ratePlanId === id);
                            setSelectedRatePlanName(rp?.ratePlanName || '');
                          }}
                          options={[
                            { label: 'Select Rate Plan', value: '' },
                            ...ratePlans
                              .filter(rp => (selectedProductId ? rp.productId === selectedProductId : true))
                              .map(rp => ({
                                label: rp.ratePlanName,
                                value: rp.ratePlanId.toString()
                              }))
                          ]}
                          disabled={!selectedProductId}
                        />
                      </div>
                    </div>

                    <div className="edit-np-form-row">
                      <div className="edit-np-form-group">
                        <SelectField
                          label="Payment Type"
                          value={paymentType}
                          onChange={setPaymentType}
                          options={[
                            { label: 'Select Payment Type', value: '' },
                            { label: 'Prepaid', value: 'PREPAID' },
                            { label: 'Postpaid', value: 'POSTPAID' }
                          ]}
                        />
                      </div>
                    </div>

                    <div className="edit-np-form-group">
                      <TextareaField
                        label="Admin Notes"
                        placeholder="Enter admin notes"
                        value={planDescription}
                        onChange={setPlanDescription}
                        rows={4}
                      />
                    </div>
                  </div>
                )}

                {/* ---------- REVIEW ---------- */}
                {activeTab === 'review' && (
                  <div className="edit-np-section">
                    <div className="edit-np-review-container">
                      <EditReview
                        customerName={selectedCustomerName}
                        productName={selectedProductName}
                        ratePlanName={selectedRatePlanName}
                        paymentType={paymentType}
                        onBack={handlePreviousStep}
                        onConfirm={handleNextStep}
                        confirmLabel="Save Draft"
                        confirmLoading={savingDraft}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Buttons (match EditProduct layout) */}
              <div className="edit-np-form-footer">
                <div className="edit-np-btn-group edit-np-btn-group--back">
                  {activeTab !== 'details' && (
                    <SecondaryButton
                      type="button"
                      onClick={handlePreviousStep}
                    >
                      Back
                    </SecondaryButton>
                  )}
                </div>

                <div className="edit-np-btn-group edit-np-btn-group--next">
                  {activeTab === 'details' ? (
                    <PrimaryButton
                      type="button"
                      onClick={handleNextStep}
                      disabled={!canSubmit}
                    >
                     save & Next
                    </PrimaryButton>
                  ) : (
                    <PrimaryButton
                      type="button"
                      onClick={handleSaveDraft}
                    >
                      Confirm changes
                    </PrimaryButton>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="af-skel-rule af-skel-rule--bottom" />
        </div>
      </div>

      {/* Edit Popup for exit confirmation */}
      <EditPopUp
        isOpen={showExitModal}
        onClose={() => {
          setShowExitModal(false);
          onClose();
        }}
        onDismiss={() => {
          // Only close the popup, not the form
          setShowExitModal(false);
        }}
        onSave={async () => {
          const saved = await handleSaveDraft();
          if (saved) {
            setShowExitModal(false);
            onClose();
          }
        }}
      />
    </>
  );
};

export default EditSubscription;
