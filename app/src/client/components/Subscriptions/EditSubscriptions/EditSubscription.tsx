import * as React from 'react';
import { useEffect, useMemo, useState, useCallback } from 'react';
import TopBar from '../../componenetsss/TopBar';
import EditPopUp from '../../componenetsss/EditPopUp';
import { DropdownField, TextareaField } from '../../componenetsss/Inputs';
import { useToast } from '../../componenetsss/ToastProvider';
import ConfigurationStepShell from '../../componenetsss/ConfigurationStepShell';
import UnsavedChangesModal from '../../componenetsss/UnsavedChangesModal';
import EditReview from './EditReview';
import InfoInlineNote from '../../componenetsss/InfoInlineNote';

import './EditSubscription.css';
import '../../componenetsss/EditSkeletonForm.css';

import {
  Api,
  Product,
  RatePlan,
  Customer,
  Subscription as SubscriptionType,
} from '../api';

type ActiveTab = 'details' | 'review';

interface EditSubscriptionProps {
  onClose: () => void;
  /** pass the existing subscription here when opening edit */
  initial?: SubscriptionType | null;
  onRefresh?: () => void;
}

const steps = [
  { id: 1, title: 'Purchase Details' },
  { id: 2, title: 'Review & Confirm' }
];

const EditSubscription: React.FC<EditSubscriptionProps> = ({
  onClose,
  initial,
  onRefresh,
}) => {
  const { showToast } = useToast();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [ratePlans, setRatePlans] = useState<RatePlan[]>([]);

  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(
    null,
  );
  const [selectedCustomerName, setSelectedCustomerName] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    null,
  );
  const [selectedProductName, setSelectedProductName] = useState('');
  const [selectedRatePlanId, setSelectedRatePlanId] = useState<number | null>(
    null,
  );
  const [selectedRatePlanName, setSelectedRatePlanName] = useState('');
  const [planDescription, setPlanDescription] = useState('');
  const [paymentType, setPaymentType] = useState<string>('');

  const [currentStep, setCurrentStep] = useState(0);
  const [activeTab, setActiveTab] = useState<ActiveTab>('details');

  const [showExitModal, setShowExitModal] = useState(false);
  const [showUnsavedRequiredModal, setShowUnsavedRequiredModal] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<
    'idle' | 'saving' | 'success' | 'error'
  >('idle');
  const [hasChanges, setHasChanges] = useState(false);

  // Detect changes
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
    initial,
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

  // Step nav
  const goToStep = (index: number) => {
    setCurrentStep(index);
    setActiveTab(index === 0 ? 'details' : 'review');
  };

  const canSubmit = useMemo(
    () =>
      Boolean(
        (selectedCustomerId ?? null) &&
        (selectedProductId ?? null) &&
        (selectedRatePlanId ?? null) &&
        paymentType,
      ),
    [selectedCustomerId, selectedProductId, selectedRatePlanId, paymentType],
  );

  const saveChanges = async (): Promise<boolean> => {
    if (!initial?.subscriptionId) return false;
    try {
      const payload = {
        customerId: selectedCustomerId ?? initial.customerId,
        productId: selectedProductId ?? initial.productId,
        ratePlanId: selectedRatePlanId ?? initial.ratePlanId,
        paymentType: paymentType || initial.paymentType,
        adminNotes: planDescription,
        status: 'ACTIVE' as const,
      };
      await Api.updateSubscription(initial.subscriptionId, payload as any);
      onRefresh?.();
      return true;
    } catch (e) {
      console.error('Failed to save changes', e);
      return false;
    }
  };

  const handleNextStep = async () => {
    if (activeTab === 'details') {
      if (!canSubmit) return;
      goToStep(1);
      return;
    }
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
      const payload = {
        customerId: selectedCustomerId ?? initial.customerId,
        productId: selectedProductId ?? initial.productId,
        ratePlanId: selectedRatePlanId ?? initial.ratePlanId,
        paymentType: paymentType || initial.paymentType,
        adminNotes: planDescription,
      };
      await Api.updateSubscriptionDraft(initial.subscriptionId, payload as any);
      setSubmissionStatus('success');

      if (!skipToast) {
        showToast({
          kind: 'success',
          title: 'Draft Saved',
          message: 'Your changes have been saved as a draft.',
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
          message: 'Failed to save draft. Please try again.',
        });
      }
      return false;
    } finally {
      setSavingDraft(false);
    }
  };

  const handleHeaderBack = useCallback(() => {
    // Treat main purchase fields as required for back navigation
    const hasEmptyRequiredFields =
      !selectedCustomerId ||
      !selectedProductId ||
      !selectedRatePlanId ||
      !paymentType;

    if (hasEmptyRequiredFields) {
      setShowUnsavedRequiredModal(true);
      return;
    }

    if (hasChanges) {
      setShowExitModal(true);
    } else {
      onClose();
    }
  }, [hasChanges, onClose, selectedCustomerId, selectedProductId, selectedRatePlanId, paymentType]);

  const handleSaveDraft = async (): Promise<boolean> => {
    const saved = await saveDraft({ skipToast: true });
    if (saved) {
      showToast({
        kind: 'success',
        title: 'Changes saved',
        message: 'Your changes have been saved successfully.',
      });
      // Refresh the subscriptions list with updated data
      onRefresh?.();
      onClose();
      return true;
    }
    return false;
  };

  const handleExitWithoutSaving = useCallback(() => {
    setShowExitModal(false);
    onClose();
  }, [onClose]);

  return (
    <>
      {/* TopBar stays as-is */}
      <TopBar title="Edit Subscription" onBack={handleHeaderBack} />

      {/* === USING ConfigurationStepShell === */}
      <ConfigurationStepShell
        steps={steps.map((step, index) => ({
          id: String(index),
          label: step.title,
        }))}
        activeStepId={String(currentStep)}
        onStepClick={(stepId) => {
          const index = parseInt(stepId, 10);
          goToStep(index);
        }}
        onBack={handlePreviousStep}
        onSave={handleNextStep}
        backLabel="Back"
        saveLabel={activeTab === 'details' ? 'Save & Next' : 'Confirm changes'}
      >
        <form
          className="editsub-np-form"
          onSubmit={e => {
            e.preventDefault();
          }}
        >
          <div className="editsub-np-form-section">
            {/* -------- DETAILS -------- */}
            {activeTab === 'details' && (
              <section>
                <div className="editsub-np-grid">
                  <div className="editsub-np-form-group">
                    <DropdownField
                      label="Customer Name"
                      required
                       placeholder='Customer Name'
                      value={selectedCustomerId?.toString() || ''}
                      onChange={value => {
                        const id = Number(value);
                        setSelectedCustomerId(id || null);
                        const cust = customers.find(
                          c => c.customerId === id,
                        );
                        setSelectedCustomerName(
                          cust?.customerName || '',
                        );
                      }}
                      options={[
                        ...customers.map(c => ({
                          label: c.customerName,
                          value: c.customerId.toString(),
                        })),
                      ]}
                    />
                  </div>

                  <div className="editsub-np-form-group">
                    <DropdownField
                      label="Product"
                      required
                       placeholder='Product'

                      value={selectedProductId?.toString() || ''}
                      onChange={value => {
                        const id = Number(value);
                        const prod = products.find(
                          p => p.productId === id,
                        );
                        setSelectedProductName(
                          prod?.productName || '',
                        );
                        if (id !== selectedProductId) {
                          setSelectedProductId(id || null);
                          setSelectedRatePlanId(null);
                          setSelectedRatePlanName('');
                        } else {
                          setSelectedProductId(id || null);
                        }
                      }}
                      options={[
                        ...products.map(p => ({
                          label: p.productName,
                          value: p.productId.toString(),
                        })),
                      ]}
                    />
                  </div>

                  <div className="editsub-np-form-group">
                    <DropdownField
                      label="Rate Plan"
                      required
                         placeholder='Rate Plan'

                      value={selectedRatePlanId?.toString() || ''}
                      onChange={value => {
                        const id = Number(value);
                        setSelectedRatePlanId(id || null);
                        const rp = ratePlans.find(
                          r => r.ratePlanId === id,
                        );
                        setSelectedRatePlanName(
                          rp?.ratePlanName || '',
                        );
                      }}
                      options={[
                        ...ratePlans
                          .filter(rp =>
                            selectedProductId
                              ? rp.productId === selectedProductId
                              : true,
                          )
                          .map(rp => ({
                            label: rp.ratePlanName,
                            value: rp.ratePlanId.toString(),
                          })),
                      ]}
                      disabled={!selectedProductId}
                    />
                    <InfoInlineNote text="Select a rate plan associated with the chosen product. Changing the product will reset this selection." />
                  </div>

                  <div className="editsub-np-form-group">
                    <DropdownField
                      label="Payment Type"
                      placeholder='Payment Type'
                      required

                      value={paymentType}
                      onChange={setPaymentType}
                      options={[
                        { label: 'Prepaid', value: 'PREPAID' },
                        { label: 'Postpaid', value: 'POSTPAID' },
                      ]}
                    />
                  </div>

                  <div className="editsub-np-form-group">
                    <TextareaField
                      label="Admin Notes"
                      placeholder="Type your note here..."
                      value={planDescription}
                      onChange={setPlanDescription}
                      rows={4}
                    />
                  </div>
                </div>
              </section>
            )}

            {/* -------- REVIEW -------- */}
            {activeTab === 'review' && (
              <section>
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
              </section>
            )}
          </div>
        </form>
      </ConfigurationStepShell>


      {/* Exit confirmation popup */}
      <EditPopUp
        isOpen={showExitModal}
        onClose={handleExitWithoutSaving}
        onDismiss={() => setShowExitModal(false)}
        onSave={async () => {
          const saved = await handleSaveDraft();
          if (saved) {
            setShowExitModal(false);
          }
        }}
      />

      {showUnsavedRequiredModal && (
        <UnsavedChangesModal
          onDiscard={() => {
            setShowUnsavedRequiredModal(false);
            onClose();
          }}
          onKeepEditing={() => setShowUnsavedRequiredModal(false)}
          onClose={() => setShowUnsavedRequiredModal(false)}
        />
      )}
    </>
  );
};

export default EditSubscription;
