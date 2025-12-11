// CreateSubscription.tsx
import * as React from "react";
import { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import TopBar from "../componenetsss/TopBar";
import { useToast } from "../componenetsss/ToastProvider";
import SaveDraft from "../componenetsss/SaveDraft";
import ConfirmDeleteModal from "../componenetsss/ConfirmDeleteModal";
import ReviewComponent, { ReviewRow } from "../componenetsss/ReviewComponent";

import "../componenetsss/SkeletonForm.css";
import { InputField, TextareaField, SelectField } from "../componenetsss/Inputs";
import PrimaryButton from "../componenetsss/PrimaryButton";
import SecondaryButton from "../componenetsss/SecondaryButton";
import {
  Api,
  Product,
  RatePlan,
  Customer,
  Subscription as SubscriptionType,
} from "./api";
import '../componenetsss/SkeletonForm.css';

import "./CreateSubscription.css"; // you can copy met-np-* styles here (or reuse Usagemetric.css)

type StepId = 1 | 2;
type PaymentKind = "PREPAID" | "POSTPAID";
type ActiveTab = "details" | "review";

const steps: Array<{ id: StepId; title: string; desc: string }> = [
  {
    id: 1,
    title: "Purchase Details",
    desc: "Provide purchase-related details.",
  },
  {
    id: 2,
    title: "Review & Confirm",
    desc: "Check and finalize details.",
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
  const { showToast, dismissToast } = useToast();
  const [scrollPosition, setScrollPosition] = useState(0);
  const [hasOverflow, setHasOverflow] = useState(false);
  const formSectionRef = React.useRef<HTMLDivElement>(null);

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
  const [paymentType, setPaymentType] = useState<PaymentKind | "">("");
  const [planDescription, setPlanDescription] = useState("");

  const [currentStep, setCurrentStep] = useState(0);
  const [activeTab, setActiveTab] = useState<ActiveTab>("details");

  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [isDraftSaving, setIsDraftSaving] = useState(false);
  const [isDraftSaved, setIsDraftSaved] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<"idle" | "success" | "error">("idle");
  const [subscriptionId, setSubscriptionId] = useState<number | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const currentStepMeta = steps[currentStep];

  // ---------- page + back-button handling ----------
  useEffect(() => {
    document.body.classList.add("create-product-page");

    const handleBackButton = (event: PopStateEvent) => {
      event.preventDefault();
      navigate("/get-started/subscriptions");
    };

    window.addEventListener("popstate", handleBackButton);
    window.history.pushState(null, "", window.location.pathname);

    return () => {
      document.body.classList.remove("create-product-page");
      window.removeEventListener("popstate", handleBackButton);
    };
  }, [navigate]);

  // ---------- hydrate selectable lists ----------
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
          kind: "error",
          title: "Loading Failed",
          message: "Failed to load required data. Please refresh the page to try again.",
        });
      }
    })();
  }, [showToast]);

  // ---------- apply draftData on mount ----------
  useEffect(() => {
    if (draftData) {
      if (draftData.customerId) {
        setSelectedCustomerId(draftData.customerId);
        const customer = customers.find((c) => c.customerId === draftData.customerId);
        if (customer) setSelectedCustomerName(customer.customerName || "");
      }

      if (draftData.productId) {
        setSelectedProductId(draftData.productId);
        const product = products.find((p) => p.productId === draftData.productId);
        if (product) setSelectedProductName(product.productName || "");
      }

      if (draftData.ratePlanId) {
        setSelectedRatePlanId(draftData.ratePlanId);
        const ratePlan = ratePlans.find((rp) => rp.ratePlanId === draftData.ratePlanId);
        if (ratePlan) setSelectedRatePlanName(ratePlan.ratePlanName || "");
      }

      if (draftData.paymentType) {
        const pt =
          draftData.paymentType === "PREPAID" || draftData.paymentType === "POSTPAID"
            ? (draftData.paymentType as PaymentKind)
            : undefined;
        if (pt) setPaymentType(pt);
      }

      if (draftData.adminNotes) setPlanDescription(draftData.adminNotes);
      if (draftData.subscriptionId) setSubscriptionId(draftData.subscriptionId);
    }
  }, [draftData, customers, products, ratePlans]);

  // ---------- hasAnyRequiredInput (for Save/Cancel lock like metric form) ----------
  const hasAnyRequiredInput = useMemo(
    () =>
      Boolean(
        selectedCustomerId ||
        selectedProductId ||
        selectedRatePlanId ||
        paymentType ||
        planDescription.trim()
      ),
    [selectedCustomerId, selectedProductId, selectedRatePlanId, paymentType, planDescription]
  );

  const topActionsDisabled = !hasAnyRequiredInput && !subscriptionId;

  // Validation for step navigation and Save & Next button
  const canSaveNext =
    !!selectedCustomerId &&
    !!selectedProductId &&
    !!selectedRatePlanId &&
    (paymentType === "PREPAID" || paymentType === "POSTPAID");

  // ---------- errors ----------
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
    if (!paymentType || (paymentType !== "PREPAID" && paymentType !== "POSTPAID")) {
      e.paymentType = "This field is required";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ---------- draft save ----------
  const saveDraft = async (): Promise<SubscriptionType | undefined> => {
    if (savingDraft) return;
    setSavingDraft(true);

    try {
      const payload: any = { status: "DRAFT" };

      if (selectedCustomerId) payload.customerId = selectedCustomerId;
      if (selectedProductId) payload.productId = selectedProductId;
      if (selectedRatePlanId) payload.ratePlanId = selectedRatePlanId;
      if (paymentType === "PREPAID" || paymentType === "POSTPAID") {
        payload.paymentType = paymentType;
      }
      if (planDescription) payload.adminNotes = planDescription;

      let resp: SubscriptionType;

      if (subscriptionId) {
        resp = await Api.updateSubscriptionDraft(subscriptionId, payload);
      } else {
        resp = await Api.createSubscriptionDraft(payload);
        setSubscriptionId(resp.subscriptionId);
      }

      setSubmissionStatus("success");
      setIsDraftSaved(true);
      setTimeout(() => setIsDraftSaved(false), 2500);

      return resp;
    } catch (e) {
      const err = e as Error;
      console.error("Failed to save draft:", err);
      showToast({
        kind: "error",
        title: "Save Failed",
        message: err.message || "Failed to save draft. Please try again.",
      });
      setSubmissionStatus("error");
      throw err;
    } finally {
      setSavingDraft(false);
    }
  };

  // ---------- flow actions ----------
  const gotoStep = (index: number) => {
    setCurrentStep(index);
    const map: ActiveTab[] = ["details", "review"];
    setActiveTab(map[index] || "details");
  };

  const handleTopbarBack = () => {
    if (hasAnyRequiredInput || subscriptionId) {
      setShowSavePrompt(true);
    } else {
      navigate("/get-started/subscriptions");
    }
  };

  const handleSaveDraftTop = async () => {
    if (isDraftSaving) return false;
    try {
      setIsDraftSaving(true);
      const result = await saveDraft();
      return !!result;
    } catch {
      return false;
    } finally {
      setIsDraftSaving(false);
    }
  };

  const deleteAndClose = async () => {
    if (!subscriptionId) {
      onClose();
      return;
    }

    try {
      await Api.deleteSubscription(subscriptionId);
      showToast({
        kind: "success",
        title: "Subscription deleted",
        message: "The subscription has been successfully deleted.",
      });
    } catch (error) {
      console.error("Error deleting draft:", error);
      showToast({
        kind: "error",
        title: "Error",
        message: "Failed to delete draft. Please try again.",
      });
    } finally {
      onClose();
    }
  };

  const handleSaveAndNext = async () => {
    if (!validateStep0()) return;

    try {
      const draftSubscription = await saveDraft();
      if (draftSubscription) {
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

    // Show processing toast
    const processingToastId = showToast({
      kind: "info",
      title: "Processing",
      message: "Creating purchase...",
      autoDismiss: false, // Don't auto-dismiss, we'll dismiss it manually
    });

    try {
      // Call confirm API with the saved subscription ID
      const resp = await Api.confirmSubscription(subscriptionId);

      // Dismiss processing toast
      dismissToast(processingToastId);

      // Wait a tiny bit for smooth transition
      await new Promise(resolve => setTimeout(resolve, 300));

      setSubmissionStatus("success");
      showToast({
        kind: "success",
        title: "Purchase Created",
        message: "Purchase has been created successfully.",
      });

      onCreateSuccess(resp);
      onRefresh?.();
      onClose();
    } catch (e) {
      console.error("Failed to create subscription", e);

      // Dismiss processing toast
      dismissToast(processingToastId);

      setSubmissionStatus("error");
      showToast({
        kind: "error",
        title: "Creation Failed",
        message: "Failed to create purchase. Please try again.",
      });
    }
  };

  // ---------- renderers ----------
  const renderStep0 = () => (
    <div className="pur-np-grid-2">
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
        placeholderOption="e.g., Aditya Inc"
        options={customers.map((c) => ({
          label: c.customerName,
          value: c.customerId.toString(),
        }))}
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
          setSelectedRatePlanId(null);
          setSelectedRatePlanName("");
        }}
        error={errors.productId}
        placeholderOption="Select Product"
        options={products.map((p) => ({
          label: p.productName,
          value: p.productId.toString(),
        }))}
      />

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
        placeholderOption="Select Rate Plan"
        options={ratePlans.map((rp) => ({
          label: rp.ratePlanName,
          value: rp.ratePlanId.toString(),
        }))}
        helperText="Select a rate plan associated with the chosen product. Changing the product will reset this selection."
      />

      <SelectField
        label="Payment Type"
        value={paymentType}
        onChange={(val) => {
          if (val === "PREPAID" || val === "POSTPAID" || val === "") {
            setPaymentType(val);
            clearError("paymentType");
          }
        }}
        error={errors.paymentType}
        placeholderOption="Select Payment Type"
        options={[
          { label: "Post-Paid", value: "POSTPAID" },
          { label: "Pre-Paid", value: "PREPAID" },
        ]}
      />

      <div className="pur-np-field">
        <TextareaField
          label="Admin Notes"
          placeholder="Enter admin notes"
          value={planDescription}
          onChange={setPlanDescription}
          optional
        />
      </div>
    </div>
  );

  const renderStep1 = () => {
    const reviewRows: ReviewRow[] = [
      { label: "Customer Name", value: selectedCustomerName || "—" },
      { label: "Product", value: selectedProductName || "—" },
      { label: "Rate Plan", value: selectedRatePlanName || "—" },
      {
        label: "Payment Type",
        value:
          paymentType === "PREPAID"
            ? "Pre-Paid"
            : paymentType === "POSTPAID"
              ? "Post-Paid"
              : "—",
      },
      { label: "Admin Notes", value: planDescription || "—" },
    ];

    return (
      <section>
        <div className="pur-np-section-header">
          <h3 className="pur-np-section-title">REVIEW & CONFIRM</h3>
        </div>
        <ReviewComponent title="PURCHASE DETAILS" rows={reviewRows} />
      </section>
    );
  };

  const LockBadge = () => null; // not needed here, but kept for parity if you ever add locked steps

  return (
    <>
      <TopBar
        title="Create New Purchase"
        onBack={handleTopbarBack}
        cancel={{
          onClick: () => setShowDeleteConfirm(true),
          disabled: topActionsDisabled,
        }}
        save={{
          onClick: handleSaveDraftTop,
          label: isDraftSaved ? "Saved!" : "Save as Draft",
          saved: isDraftSaved,
          saving: isDraftSaving,
          labelWhenSaved: "Saved as Draft",
          disabled: topActionsDisabled,
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

                  // Step 1 (index 0): Always enabled
                  // Step 2 (index 1): Only enabled if all required fields are filled
                  const isDisabled = i === 1 && !canSaveNext;

                  return (
                    <button
                      key={step.id}
                      type="button"
                      className={[
                        "pur-np-step",
                        isActive ? "active" : "",
                        isCompleted ? "completed" : "",
                        isDisabled ? "disabled" : ""
                      ].join(" ").trim()}
                      onClick={() => !isDisabled && gotoStep(i)}
                      disabled={isDisabled}
                      title={isDisabled ? "Please fill all required fields in Purchase Details first" : ""}
                    >
                      <span className="pur-np-step__bullet" aria-hidden="true">
                        <span className="pur-np-step__icon">
                          {isCompleted ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                cx="12"
                                cy="12"
                                r="11.5"
                                fill="var(--color-primary-800)"
                                stroke="var(--color-primary-800)"
                              />
                              <path
                                d="M7 12l3 3 6-6"
                                stroke="#FFFFFF"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                cx="12"
                                cy="12"
                                r="11"
                                stroke="#C3C2D0"
                                strokeWidth="2"
                              />
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
              <div className="af-skel-rule af-skel-rule--top" />
              <div className="pur-np-main__inner">
                <div className="pur-np-body">
                  <form
                    className="pur-np-form"
                    onSubmit={(e) => e.preventDefault()}
                  >
                    <div className="pur-np-form-section">
                      {activeTab === "details" && (
                        <section>
                          <div className="pur-np-section-header">
                            <h3 className="pur-np-section-title">
                              PURCHASE DETAILS
                            </h3>
                          </div>
                          {renderStep0()}
                        </section>
                      )}

                      {activeTab === "review" && renderStep1()}
                    </div>

                    {/* FOOTER */}
                    <div className="pur-np-form-footer" style={{ position: "relative" }}>
                      {errors.form && (
                        <div className="pur-pur-np-error-message">
                          {errors.form}
                        </div>
                      )}

                      {activeTab === "details" && (
                        <div className="pur-np-btn-group pur-np-btn-group--next">
                          <PrimaryButton type="button" onClick={handleSaveAndNext}>
                            Save & Next
                          </PrimaryButton>
                        </div>
                      )}

                      {activeTab === "review" && (
                        <>
                          <div className="pur-np-btn-group pur-np-btn-group--back">
                            <SecondaryButton
                              type="button"
                              onClick={() => gotoStep(0)}
                            >
                              Back
                            </SecondaryButton>
                          </div>
                          <div className="pur-np-btn-group pur-np-btn-group--next">
                            <PrimaryButton
                              type="button"
                              onClick={handleFinalSubmit}
                            >
                              Create Purchase
                            </PrimaryButton>
                          </div>
                        </>
                      )}
                    </div>
                  </form>
                </div>
              </div>
            </main>
          </div>

          <div className="af-skel-rule af-skel-rule--bottom" />

          {/* Save Draft modal – same pattern as metric screen */}
          <SaveDraft
            isOpen={showSavePrompt}
            onClose={async () => {
              setShowSavePrompt(false);
              await deleteAndClose();
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
                console.error("Error saving draft from back button:", error);
              }
            }}
          />
        </div>
      </div>

      {/* Delete / Cancel confirmation */}
      <ConfirmDeleteModal
        isOpen={showDeleteConfirm}
        productName="subscription draft"
        onConfirm={deleteAndClose}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
}
