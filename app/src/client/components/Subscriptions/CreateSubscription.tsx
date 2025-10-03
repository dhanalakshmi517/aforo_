import * as React from "react";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import TopBar from "../componenetsss/TopBar";
import { useToast } from "../componenetsss/ToastProvider";
import SaveDraft from "../componenetsss/SaveDraft";
import ConfirmDeleteModal from "../componenetsss/ConfirmDeleteModal";
import SubReview from "./SubReview";
import "../Products/NewProducts/NewProduct.css";
import "../componenetsss/SkeletonForm.css";

import { InputField, TextareaField, SelectField } from "../componenetsss/Inputs"; // align with NewProduct pattern
import {
  Api,
  Product,
  RatePlan,
  Customer,
  Subscription as SubscriptionType,
} from "./api";

import "./CreateSubscription.css"; // keep your CSS; class names now match np-* layout too

type StepId = 1 | 2;
type PaymentKind = "PREPAID" | "POSTPAID";

const steps: Array<{ id: StepId; title: string; desc: string }> = [
  {
    id: 1,
    title: "Subscription Details",
    desc: "Set up the core information like plan type, and pricing model for this subscription.",
  },
  {
    id: 2,
    title: "Review & Confirm",
    desc: "Review the final pricing and details based on the information you've entered.",
  },
];

interface CreateSubscriptionProps {
  onClose: () => void;
  onCreateSuccess: (sub: SubscriptionType) => void;
  onRefresh?: () => void;
  draftData?: SubscriptionType;
}

export default function CreateSubscription({
  onClose,
  onCreateSuccess,
  onRefresh,
  draftData,
}: CreateSubscriptionProps): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  // Handle browser back button and add page class
  useEffect(() => {
    document.body.classList.add("create-product-page");
    
    // Handle browser back button
    const handleBackButton = (event: PopStateEvent) => {
      event.preventDefault();
      navigate('/get-started/subscriptions');
    };
    
    window.addEventListener('popstate', handleBackButton);
    window.history.pushState(null, '', window.location.pathname);
    
    return () => {
      document.body.classList.remove("create-product-page");
      window.removeEventListener('popstate', handleBackButton);
    };
  }, [navigate]);

  // data sources
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [ratePlans, setRatePlans] = useState<RatePlan[]>([]);

  // form fields
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [selectedCustomerName, setSelectedCustomerName] = useState("");
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [selectedProductName, setSelectedProductName] = useState("");
  const [selectedRatePlanId, setSelectedRatePlanId] = useState<number | null>(null);
  const [selectedRatePlanName, setSelectedRatePlanName] = useState("");
  const [paymentType, setPaymentType] = useState<PaymentKind | ''>('');
  const [planDescription, setPlanDescription] = useState("");

  // flow state
  const [currentStep, setCurrentStep] = useState(0); // 0-based like NewProduct

  // Handle draft data when component mounts or draftData changes
  useEffect(() => {
    if (draftData) {
      // Set form fields from draft data
      if (draftData.customerId) {
        setSelectedCustomerId(draftData.customerId);
        // Find and set customer name if available
        const customer = customers.find(c => c.customerId === draftData.customerId);
        if (customer) {
          setSelectedCustomerName(customer.customerName || '');
        }
      }
      
      if (draftData.productId) {
        setSelectedProductId(draftData.productId);
        // Find and set product name if available
        const product = products.find(p => p.productId === draftData.productId);
        if (product) {
          setSelectedProductName(product.productName || '');
        }
      }
      
      if (draftData.ratePlanId) {
        setSelectedRatePlanId(draftData.ratePlanId);
        // Find and set rate plan name if available
        const ratePlan = ratePlans.find(rp => rp.ratePlanId === draftData.ratePlanId);
        if (ratePlan) {
          setSelectedRatePlanName(ratePlan.ratePlanName || '');
        }
      }
      
      if (draftData.paymentType) {
        const paymentType = draftData.paymentType === 'PREPAID' || draftData.paymentType === 'POSTPAID'
          ? draftData.paymentType as PaymentKind
          : undefined;
        if (paymentType) {
          setPaymentType(paymentType);
        }
      }
      
      if (draftData.adminNotes) {
        setPlanDescription(draftData.adminNotes);
      }
      
      // Set subscription ID if it exists
      if (draftData.subscriptionId) {
        setSubscriptionId(draftData.subscriptionId);
      }
    }
  }, [draftData, customers, products, ratePlans]);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // draft/save states
  const [isDraftSaving, setIsDraftSaving] = useState(false);
  const [isDraftSaved, setIsDraftSaved] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false); // inner guard for draft API method
  const [submissionStatus, setSubmissionStatus] = useState<"idle" | "success" | "error">("idle");
  const [subscriptionId, setSubscriptionId] = useState<number | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const currentStepMeta = steps[currentStep];

  // hydrate selectable lists
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
        console.error("Failed to load subscription dependencies.", e);
        showToast({
          kind: 'error',
          title: 'Loading Failed',
          message: 'Failed to load required data. Please refresh the page to try again.'
        });
      }
    })();
  }, [showToast]);

  const clearError = (field: string) => {
    setErrors((prev) => {
      const { [field]: _gone, ...rest } = prev;
      return rest;
    });
  };

  const validateStep0 = (): boolean => {
    const e: Record<string, string> = {};
    if (!selectedCustomerId) e.customerId = "This field is required";
    if (!selectedProductId) e.productId = "This field is required";
    if (!selectedRatePlanId) e.ratePlanId = "This field is required";
    if (!paymentType || (paymentType !== 'PREPAID' && paymentType !== 'POSTPAID')) {
      e.paymentType = "This field is required";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ----- Draft save -----
  const saveDraft = async (): Promise<SubscriptionType | undefined> => {
    if (savingDraft) return;
    setSavingDraft(true);
    
    try {
      // No validations for draft - save whatever fields are available
      const payload: any = {
        status: "DRAFT"
      };
      
      // Only include fields that have values
      if (selectedCustomerId) payload.customerId = selectedCustomerId;
      if (selectedProductId) payload.productId = selectedProductId;
      if (selectedRatePlanId) payload.ratePlanId = selectedRatePlanId;
      if (paymentType === 'PREPAID' || paymentType === 'POSTPAID') {
        payload.paymentType = paymentType;
      }
      if (planDescription) payload.adminNotes = planDescription;
      
      let resp: SubscriptionType;
      
      try {
        // Simple logic: If we have an ID, use PATCH. Otherwise, use POST.
        if (subscriptionId) {
          resp = await Api.updateSubscriptionDraft(subscriptionId, payload);
        } else {
          resp = await Api.createSubscriptionDraft(payload);
          setSubscriptionId(resp.subscriptionId);
        }
        
        setSubmissionStatus("success");
        setIsDraftSaved(true);
        
        // Reset the saved state after 2.5 seconds
        setTimeout(() => {
          console.log('Resetting draft saved state');
          setIsDraftSaved(false);
        }, 2500);
        
        return resp;
      } catch (error) {
        console.error('Error in saveDraft API call:', error);
        throw error;
      }
    } catch (e) {
      const error = e as Error;
      console.error("Failed to save draft:", error);
      
      // Show error to user
      showToast({
        kind: "error",
        title: "Save Failed",
        message: error.message || "Failed to save draft. Please try again.",
      });
      
      setSubmissionStatus("error");
      throw error; // Re-throw to allow error handling in the calling function
    } finally {
      console.log('Save operation completed');
      setSavingDraft(false);
    }
  };

  // ----- Flow actions (match NewProduct patterns) -----
  const gotoStep = (index: number) => setCurrentStep(index);

  const handleBackTop = () => {
    setShowSavePrompt(true);
  };

  const handleSaveDraftAndClose = async () => {
    try {
      setIsDraftSaving(true);
      const result = await saveDraft();
      if (result) {
        // Close the form after successful save
        onClose();
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      showToast({
        kind: 'error',
        title: 'Save Failed',
        message: 'Failed to save draft. Please try again.'
      });
    } finally {
      setIsDraftSaving(false);
    }
  };

  const handleDeleteDraft = async () => {
    if (!subscriptionId) {
      onClose(); // Just close if no subscription ID exists
      return;
    }

    try {
      setShowDeleteConfirm(false);
      await Api.deleteSubscription(subscriptionId);
      showToast({
        kind: 'success',
        title: 'Subscription deleted',
        message: 'The subscription has been successfully deleted.'
      });
      onClose();
    } catch (error) {
      console.error('Error deleting draft:', error);
      showToast({
        kind: 'error',
        title: 'Error',
        message: 'Failed to delete draft. Please try again.'
      });
    }
  };

  const handleSaveDraftTop = async () => {
    try {
      setIsDraftSaving(true);
      const result = await saveDraft();
      // Don't show toast here - it will be shown by the SaveDraft component when saving from back button
      return !!result;
    } catch (error) {
      console.error('Error in handleSaveDraftTop:', error);
      // Error is already handled in saveDraft
      return false;
    } finally {
      setIsDraftSaving(false);
    }
  };

  const handleCancelTop = () => {
    // Always show the delete confirmation modal
    setShowDeleteConfirm(true);
  };

  const canSaveNext =
    !!selectedCustomerId &&
    !!selectedProductId &&
    !!selectedRatePlanId &&
    (paymentType === 'PREPAID' || paymentType === 'POSTPAID');

  const handleSaveAndNext = async () => {
    if (!validateStep0()) return;
    
    try {
      // Save the draft (will use POST or PATCH automatically based on subscriptionId)
      const draftSubscription = await saveDraft();
      
      if (draftSubscription) {
        // Navigate to review step after successful save
        gotoStep(1);
      }
    } catch (e) {
      console.error("Failed to save draft", e);
      setSubmissionStatus("error");
      showToast({
        kind: "error",
        title: "Error",
        message: "Failed to save subscription draft. Please try again.",
      });
    }
  };

  const handleFinalSubmit = async () => {
    if (!subscriptionId) {
      showToast({
        kind: "error",
        title: "Error",
        message: "No subscription ID found. Please go back and try again.",
      });
      return;
    }

    try {
      // Show loading state
      showToast({
        kind: "info",
        title: "Processing",
        message: "Confirming your subscription...",
        autoDismiss: false
      });
      
      // Call confirm API with the saved subscription ID
      const resp = await Api.confirmSubscription(subscriptionId);
      
      setSubmissionStatus("success");
      showToast({
        kind: "success",
        title: "Subscription Confirmed",
        message: "Subscription has been confirmed successfully.",
      });
      
      onCreateSuccess(resp);
      onRefresh?.();
      onClose();
    } catch (e) {
      console.error("Failed to create subscription", e);
      setSubmissionStatus("error");
      showToast({
        kind: "error",
        title: "Confirmation Failed",
        message: "Failed to confirm subscription. Please try again.",
      });
    }
  };

  // ---------- Renderers ----------
  const renderStep0 = () => (
    <div className="pur-np-grid">
      <SelectField
        label="Customer"
        value={selectedCustomerId?.toString() || ""}
        onChange={(val) => {
          const id = Number(val);
          setSelectedCustomerId(id);
          clearError("customerId");
          const cust = customers.find((c) => c.customerId === id);
          setSelectedCustomerName(cust?.customerName || "");
        }}
        error={errors.customerId}
        options={customers.map((c) => ({ label: c.customerName, value: c.customerId.toString() }))}
      />

      <SelectField
        label="Product"
        value={selectedProductId?.toString() || ""}
        onChange={(val) => {
          const id = Number(val);
          setSelectedProductId(id);
          clearError("productId");
          const prod = products.find((p) => p.productId === id);
          setSelectedProductName(prod?.productName || "");
          // reset rate plan when product changes
          setSelectedRatePlanId(null);
          setSelectedRatePlanName("");
        }}
        error={errors.productId}
        options={products.map((p) => ({ label: p.productName, value: p.productId.toString() }))}
      />

      <div className="pur-np-inline-note">
        {/* <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <g clipPath="url(#clip0_cust_info)">
            <path d="M6 8V6M6 4H6.005M11 6C11 8.76142 8.76142 11 6 11C3.23858 11 1 8.76142 1 6C1 3.23858 3.23858 1 6 1C8.76142 1 11 3.23858 11 6Z" stroke="#1D7AFC" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </g>
          <defs><clipPath id="clip0_cust_info"><rect width="12" height="12" fill="white"/></clipPath></defs>
        </svg> */}
        {/* <span>Select a product to view its associated rate plans.</span> */}
      </div>

      <SelectField
        label="Rate Plan"
        value={selectedRatePlanId?.toString() || ""}
        onChange={(val) => {
          const id = Number(val);
          setSelectedRatePlanId(id);
          clearError("ratePlanId");
          const rp = ratePlans.find((r) => r.ratePlanId === id);
          setSelectedRatePlanName(rp?.ratePlanName || "");
        }}
        error={errors.ratePlanId}
        options={ratePlans.map((rp) => ({ label: rp.ratePlanName, value: rp.ratePlanId.toString() }))}
      />

      <div className="pur-np-inline-note">
        {/* <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <g clipPath="url(#clip0_rate_info)">
            <path d="M6 8V6M6 4H6.005M11 6C11 8.76142 8.76142 11 6 11C3.23858 11 1 8.76142 1 6C1 3.23858 3.23858 1 6 1C8.76142 1 11 3.23858 11 6Z" stroke="#1D7AFC" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </g>
          <defs><clipPath id="clip0_rate_info"><rect width="12" height="12" fill="white"/></clipPath></defs>
        </svg> */}
        {/* <span>Pick a rate plan for the selected product. Changing the product resets this selection.</span> */}
      </div>

      <SelectField
        label="Payment Type"
        value={paymentType}
        onChange={(val) => {
          if (val === 'PREPAID' || val === 'POSTPAID' || val === '') {
            setPaymentType(val);
            clearError("paymentType");
          }
        }}
        error={errors.paymentType}
        options={[
          { label: "Select Payment Type", value: "" },
          { label: "Post-Paid", value: "POSTPAID" },
          { label: "Pre-Paid", value: "PREPAID" },
        ]}
      />

      <TextareaField
        label="Admin Notes"
        placeholder="Enter admin notes"
        value={planDescription}
        onChange={setPlanDescription}
      />
    </div>
  );

  const renderStep1 = () => (
    <div className="review-container">
      <SubReview
        customerName={selectedCustomerName || ''}
        productName={selectedProductName || ''}
        ratePlan={selectedRatePlanName || ''}
        paymentMethod={paymentType === 'PREPAID' ? 'Pre-Paid' : paymentType === 'POSTPAID' ? 'Post-Paid' : 'Not specified'}
        adminNotes={planDescription}
        subscriptionId={subscriptionId}
      />
    </div>
  );

  return (
    <>
      <TopBar
        title="Create New Subscription"
        onBack={currentStep === 0 ? handleBackTop : () => gotoStep(0)}
        cancel={{ onClick: handleCancelTop }}
        save={currentStep === 0 ? {
          onClick: handleSaveDraftTop,
          label: isDraftSaved ? "Saved!" : "Save as Draft",
          saved: isDraftSaved,
          saving: isDraftSaving,
          labelWhenSaved: "Saved as Draft",
        } : {
          // onClick: handleFinalSubmit,
          // saved: submissionStatus === 'success',
          // labelWhenSaved: 'Confirmed!'
        }}
      />

      <div className="pur-np-viewport">
        <div className="pur-np-card">
          <div className="pur-np-grid">
            {/* LEFT rail (steps) */}
            <aside className="pur-np-rail">
              <nav className="pur-np-steps">
                {steps.map((step, i) => {
                  const isActive = i === currentStep;
                  const isCompleted = i < currentStep;
                  const showConnector = i < steps.length - 1;
                  return (
                    <button
                      key={step.id}
                      type="button"
                      className={[
                        "pur-np-step",
                        isActive ? "pur-active" : "",
                        isCompleted ? "pur-completed" : "",
                      ].join(" ").trim()}
                      onClick={() => gotoStep(i)}
                    >
                      <span className="pur-np-step__bullet" aria-hidden="true">
                        <span className="pur-np-step__icon">
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
                        {showConnector && <span className="pur-np-step__connector" />}
                      </span>

                      <span className="pur-np-step__text">
                        <span className="pur-np-step__title">{step.title}</span>
                        <span className="pur-np-step__desc">{step.desc}</span>
                      </span>
                    </button>
                  );
                })}
              </nav>
            </aside>

            {/* MAIN area */}
            <main className="pur-np-main">
              {/* faint separators behind content */}
              <div className="af-skel-rule af-skel-rule--top" />
              <div className="pur-np-main__inner">
                <div className="pur-np-body">
                  <form className="pur-np-form" onSubmit={(e) => e.preventDefault()}>
                    <div className="pur-np-form-section">
                      <section>
                        <div className="pur-np-section-header">
                          <h3 className="pur-np-section-title">
                            {currentStepMeta.id === 1 ? "SUBSCRIPTION DETAILS" : "REVIEW & CONFIRM"}
                          </h3>
                        </div>

                        {currentStepMeta.id === 1 ? renderStep0() : renderStep1()}
                      </section>
                    </div>

                    {/* Footer actions (match NewProduct layout) */}
                    <div className="pur-np-form-footer">
                      {currentStepMeta.id === 1 && (
                        <>
                          {errors.form && <div className="pur-np-error-message">{errors.form}</div>}
                          <div className="pur-np-btn-group pur-np-btn-group--next">
                            <button
                              type="button"
                              className="pur-np-btn pur-np-btn--primary"
                              onClick={handleSaveAndNext}
                              title="Save & Next"
                            >
                              Save & Next
                            </button>
                          </div>
                        </>
                      )}

                      {currentStepMeta.id === 2 && (
                        <>
                          <div className="pur-np-btn-group pur-np-btn-group--back">
                            <button
                              type="button"
                              className="pur-np-btn pur-np-btn--ghost"
                              onClick={() => gotoStep(0)}
                            >
                              Back
                            </button>
                          </div>
                          <div className="pur-np-btn-group pur-np-btn-group--next">
                            <button
                              type="button"
                              className="pur-np-btn pur-np-btn--primary"
                              onClick={handleFinalSubmit}
                              title="Create Subscription"
                            >
                              Create Subscription
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

        <div className="af-skel-rule af-skel-rule--bottom" />
      </div>

      {/* Save Draft confirmation modal (same UX as product page) */}
      <SaveDraft
        isOpen={showSavePrompt}
        onClose={async () => {
          setShowSavePrompt(false);
          // on Close without saving draft
          onClose();
        }}
        onSave={async () => {
          try {
            const result = await saveDraft();
            if (result) {
              showToast({
                kind: "success",
                title: "Draft Saved",
                message: "Your changes have been saved as a draft.",
              });
              onClose();
            }
          } catch (error) {
            console.error('Error saving draft from back button:', error);
            // Error is already handled in saveDraft
          }
        }}
        onDismiss={() => setShowSavePrompt(false)}
      />

      {/* Delete / Cancel confirmation */}
      <ConfirmDeleteModal
        isOpen={showDeleteConfirm}
        productName="subscription draft"
        onConfirm={handleDeleteDraft}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
}
