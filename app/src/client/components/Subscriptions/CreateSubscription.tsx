// CreateSubscription.tsx
import * as React from "react";
import { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import TopBar from "../componenetsss/TopBar";
import { TextareaField, DropdownField } from "../componenetsss/Inputs";
import ConfirmDeleteModal from "../componenetsss/ConfirmDeleteModal";
import SaveDraft from "../componenetsss/SaveDraft";
import { useToast } from "../componenetsss/ToastProvider";
import PrimaryButton from "../componenetsss/PrimaryButton";
import SecondaryButton from "../componenetsss/SecondaryButton";
import ProductCreatedSuccess from "../componenetsss/ProductCreatedSuccess";
import SectionHeader from "../componenetsss/SectionHeader";
import ReviewComponent, { ReviewRow } from "../componenetsss/ReviewComponent";
import InfoInlineNote from "../componenetsss/InfoInlineNote";

import {
  Api,
  Product,
  RatePlan,
  Customer,
  Subscription as SubscriptionType,
} from "./api";

import "../componenetsss/SkeletonForm.css";
import "./CreateSubscription.css";

type ActiveTab = "details" | "review";
type PaymentKind = "PREPAID" | "POSTPAID";

const steps = [
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

  /** optional - same idea as metric: open an existing draft */
  draftSubscriptionId?: number;

  /** optional - parent can pass draft object */
  draftData?: SubscriptionType;
}

export default function CreateSubscription({
  onClose,
  onCreateSuccess,
  onRefresh,
  draftSubscriptionId,
  draftData,
}: CreateSubscriptionProps): React.JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast, dismissToast } = useToast();

  const draftFromState = (location.state as any)?.draftSubscriptionId;
  const activeSubscriptionId = draftFromState || draftSubscriptionId;

  const [currentStep, setCurrentStep] = useState(0);
  const [activeTab, setActiveTab] = useState<ActiveTab>("details");

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSavePrompt, setShowSavePrompt] = useState(false);

  const [isDraftSaving, setIsDraftSaving] = useState(false);
  const [isDraftSaved, setIsDraftSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [hasEverBeenEnabled, setHasEverBeenEnabled] = useState(false);
  const [initialFormState, setInitialFormState] = useState<any>(null);

  // lists
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [ratePlans, setRatePlans] = useState<RatePlan[]>([]);

  // form fields
  const [subscriptionId, setSubscriptionId] = useState<number | null>(null);

  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [selectedCustomerName, setSelectedCustomerName] = useState("");

  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [selectedProductName, setSelectedProductName] = useState("");

  const [selectedRatePlanId, setSelectedRatePlanId] = useState<number | null>(null);
  const [selectedRatePlanName, setSelectedRatePlanName] = useState("");

  const [paymentType, setPaymentType] = useState<PaymentKind | "">("");
  const [adminNotes, setAdminNotes] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});

  // ─────────────────────────────────────────────────────────────
  // Page + back button handling (same as CreateUsageMetric)
  // ─────────────────────────────────────────────────────────────
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

  // ─────────────────────────────────────────────────────────────
  // Load lists
  // ─────────────────────────────────────────────────────────────
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
        console.error("Failed to load purchase dependencies.", e);
        showToast({
          kind: "error",
          title: "Loading Failed",
          message: "Failed to load required data. Please refresh the page to try again.",
        });
      }
    })();
  }, [showToast]);

  // ─────────────────────────────────────────────────────────────
  // Hydrate draft by ID (optional), without breaking builds if api method missing
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!activeSubscriptionId) return;
    if (draftData) return; // prefer provided object

    (async () => {
      try {
        const fn =
          (Api as any).getSubscription ||
          (Api as any).getSubscriptionById ||
          (Api as any).getDraftSubscription;

        if (!fn) return;

        const data = await fn(activeSubscriptionId);

        if (data) {
          setSubscriptionId((data as any).subscriptionId ?? null);
          if ((data as any).customerId != null) setSelectedCustomerId((data as any).customerId);
          if ((data as any).productId != null) setSelectedProductId((data as any).productId);
          if ((data as any).ratePlanId != null) setSelectedRatePlanId((data as any).ratePlanId);

          const pt = (data as any).paymentType;
          if (pt === "PREPAID" || pt === "POSTPAID") setPaymentType(pt);

          if ((data as any).adminNotes) setAdminNotes((data as any).adminNotes);
        }
      } catch (e) {
        console.error("Failed to hydrate subscription draft", e);
      }
    })();
  }, [activeSubscriptionId, draftData]);

  useEffect(() => {
    if (!draftData) return;

    setSubscriptionId((draftData as any).subscriptionId ?? null);

    if ((draftData as any).customerId != null) setSelectedCustomerId((draftData as any).customerId);
    if ((draftData as any).productId != null) setSelectedProductId((draftData as any).productId);
    if ((draftData as any).ratePlanId != null) setSelectedRatePlanId((draftData as any).ratePlanId);

    const pt = (draftData as any).paymentType;
    if (pt === "PREPAID" || pt === "POSTPAID") setPaymentType(pt);

    if ((draftData as any).adminNotes) setAdminNotes((draftData as any).adminNotes);

    if (!initialFormState) {
      setInitialFormState({
        selectedCustomerId: (draftData as any).customerId ?? null,
        selectedProductId: (draftData as any).productId ?? null,
        selectedRatePlanId: (draftData as any).ratePlanId ?? null,
        paymentType: pt === "PREPAID" || pt === "POSTPAID" ? pt : "",
        adminNotes: (draftData as any).adminNotes || ""
      });
    }
  }, [draftData, initialFormState]);

  
  useEffect(() => {
    if (selectedCustomerId && customers.length) {
      const c = customers.find((x) => x.customerId === selectedCustomerId);
      if (c) setSelectedCustomerName(c.customerName || "");
    }
  }, [customers, selectedCustomerId]);

  useEffect(() => {
    if (selectedProductId && products.length) {
      const p = products.find((x) => x.productId === selectedProductId);
      if (p) setSelectedProductName(p.productName || "");
    }
  }, [products, selectedProductId]);

  useEffect(() => {
    if (selectedRatePlanId && ratePlans.length) {
      const rp = ratePlans.find((x) => x.ratePlanId === selectedRatePlanId);
      if (rp) setSelectedRatePlanName(rp.ratePlanName || "");
    }
  }, [ratePlans, selectedRatePlanId]);

  useEffect(() => {
    if (isDraftSaved) setIsDraftSaved(false);
  }, [selectedCustomerId, selectedProductId, selectedRatePlanId, paymentType, adminNotes]);

  useEffect(() => {
    if (isDraftSaved) {
      const timer = setTimeout(() => {
        setIsDraftSaved(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isDraftSaved]);

  
  const hasAnyRequiredInput = useMemo(() => {
    return Boolean(
      selectedCustomerId ||
        selectedProductId ||
        selectedRatePlanId ||
        paymentType ||
        adminNotes.trim()
    );
  }, [selectedCustomerId, selectedProductId, selectedRatePlanId, paymentType, adminNotes]);

  const hasUserMadeChanges = useMemo(() => {
    if (!initialFormState) {
      // No draft loaded, enable buttons if user has input
      return hasAnyRequiredInput;
    }
    // Draft loaded, check if current state differs from initial state
    return (
      selectedCustomerId !== initialFormState.selectedCustomerId ||
      selectedProductId !== initialFormState.selectedProductId ||
      selectedRatePlanId !== initialFormState.selectedRatePlanId ||
      paymentType !== initialFormState.paymentType ||
      adminNotes !== initialFormState.adminNotes
    );
  }, [
    initialFormState,
    selectedCustomerId,
    selectedProductId,
    selectedRatePlanId,
    paymentType,
    adminNotes,
    hasAnyRequiredInput
  ]);

  useEffect(() => {
    if (hasUserMadeChanges && !hasEverBeenEnabled) {
      setHasEverBeenEnabled(true);
    }
  }, [hasUserMadeChanges, hasEverBeenEnabled]);

  const topActionsDisabled = !hasEverBeenEnabled;

  const canGoReview = useMemo(() => {
    return Boolean(
      selectedCustomerId &&
        selectedProductId &&
        selectedRatePlanId &&
        (paymentType === "PREPAID" || paymentType === "POSTPAID")
    );
  }, [selectedCustomerId, selectedProductId, selectedRatePlanId, paymentType]);

  // ─────────────────────────────────────────────────────────────
  // Validation (same pattern as metric validateCurrentStep)
  // ─────────────────────────────────────────────────────────────
  const validateCurrentStep = (step: number): boolean => {
    const step0Errors: Record<string, string> = {};

    if (step === 0) {
      if (!selectedCustomerId) step0Errors.customerId = "Customer is required";
      if (!selectedProductId) step0Errors.productId = "Product is required";
      if (!selectedRatePlanId) step0Errors.ratePlanId = "Rate Plan is required";
      if (!(paymentType === "PREPAID" || paymentType === "POSTPAID"))
        step0Errors.paymentType = "Payment Type is required";

      setErrors(step0Errors);
      return Object.keys(step0Errors).length === 0;
    }

    return true;
  };

  const clearError = (key: string) => {
    setErrors((prev) => {
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  // ─────────────────────────────────────────────────────────────
  // navigation (same philosophy as metric gotoStep)
  // ─────────────────────────────────────────────────────────────
  const gotoStep = (index: number) => {
    if (index < 0 || index > 1) return;

    if (index > currentStep) {
      if (currentStep === 0 && index === 1) {
        const ok = validateCurrentStep(0);
        if (!ok) return;
        if (!canGoReview) return;
      }
    }

    setCurrentStep(index);
    const map: ActiveTab[] = ["details", "review"];
    setActiveTab(map[index] || "details");
  };

  const handleTopbarBack = () => {
    if (hasAnyRequiredInput || subscriptionId) setShowSavePrompt(true);
    else navigate("/get-started/subscriptions");
  };

  // ─────────────────────────────────────────────────────────────
  // draft save (same UX as metric: TopBar shows Saved!)
  // ─────────────────────────────────────────────────────────────
  const buildDraftPayload = () => {
    const payload: any = { status: "DRAFT" };
    if (selectedCustomerId) payload.customerId = selectedCustomerId;
    if (selectedProductId) payload.productId = selectedProductId;
    if (selectedRatePlanId) payload.ratePlanId = selectedRatePlanId;
    if (paymentType === "PREPAID" || paymentType === "POSTPAID") payload.paymentType = paymentType;
    if (adminNotes?.trim()) payload.adminNotes = adminNotes.trim();
    return payload;
  };

  const handleSaveDraft = async () => {
    if (isDraftSaving) return false;

    try {
      setIsDraftSaving(true);
      setIsDraftSaved(false);

      const payload = buildDraftPayload();

      let resp: SubscriptionType;
      if (subscriptionId) {
        resp = await Api.updateSubscriptionDraft(subscriptionId, payload);
      } else {
        resp = await Api.createSubscriptionDraft(payload);
        setSubscriptionId((resp as any).subscriptionId);
      }

      setIsDraftSaved(true);
      return !!resp;
    } catch (e) {
      console.error("Error saving draft:", e);
      return false;
    } finally {
      setIsDraftSaving(false);
    }
  };

  const saveBeforeNext = async () => {
    if (!validateCurrentStep(currentStep)) return false;

    setSaving(true);
    try {
      const payload = buildDraftPayload();

      let resp: SubscriptionType;
      if (subscriptionId) {
        resp = await Api.updateSubscriptionDraft(subscriptionId, payload);
      } else {
        resp = await Api.createSubscriptionDraft(payload);
        setSubscriptionId((resp as any).subscriptionId);
      }

      return !!resp;
    } catch (e) {
      console.error("Failed to save purchase draft:", e);
      setErrors((prev) => ({
        ...prev,
        form: "Failed to save purchase draft. Please try again.",
      }));
      return false;
    } finally {
      setSaving(false);
    }
  };

  // discard behavior - delete draft if it has an ID, then close
  const deleteAndClose = async () => {
    // If we have a subscription ID (draft), delete it using the delete API
    if (subscriptionId) {
      try {
        await Api.deleteSubscription(subscriptionId);
        console.log('Draft subscription deleted successfully');
      } catch (error) {
        console.error('Failed to delete draft subscription:', error);
        // Still close even if delete fails
      }
    }
    onClose();
  };

  // ─────────────────────────────────────────────────────────────
  // final submit
  // ─────────────────────────────────────────────────────────────
  const handleFinalSubmit = async () => {
    if (!subscriptionId) {
      setErrors((prev) => ({ ...prev, form: "No subscription ID found. Please go back and try again." }));
      return;
    }

    const processingToastId = showToast({
      kind: "info",
      title: "Processing",
      message: "Creating purchase...",
      autoDismiss: false,
    });

    setSaving(true);
    try {
      const resp = await Api.confirmSubscription(subscriptionId);

      dismissToast(processingToastId);

      setShowSuccess(true);
      showToast({
        kind: "success",
        title: "Purchase Created",
        message: "Purchase has been created successfully.",
      });

      onCreateSuccess(resp);
      onRefresh?.();
    } catch (e) {
      console.error("Failed to create purchase", e);
      dismissToast(processingToastId);

      setErrors((prev) => ({ ...prev, form: "Failed to create purchase. Please try again." }));
      showToast({
        kind: "error",
        title: "Creation Failed",
        message: "Failed to create purchase. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAndNext = async () => {
    if (activeTab === "details") {
      const ok = await saveBeforeNext();
      if (!ok) return;
      gotoStep(1);
      return;
    }

    if (activeTab === "review") {
      await handleFinalSubmit();
    }
  };

  const handleGoAllPurchases = () => {
    showToast({
      kind: "success",
      title: "Purchase Created Successfully",
      message: "Your purchase has been created successfully.",
    });
    navigate("/get-started/subscriptions");
    onClose();
  };

  // ─────────────────────────────────────────────────────────────
  // Render blocks
  // ─────────────────────────────────────────────────────────────
  const renderStep0 = () => (
    <div className="met-np-grid-2">
                    <DropdownField
        label="Customer Name"
        required
        placeholder="Customer"
        value={selectedCustomerId?.toString() || ""}
        onChange={(val) => {
          const id = Number(val);
          setSelectedCustomerId(id);
          clearError("customerId");
          const cust = customers.find((c) => c.customerId === id);
          setSelectedCustomerName(cust?.customerName || "");
        }}
        error={errors.customerId}
        options={customers.map((c) => ({
          label: c.customerName,
          value: c.customerId.toString(),
        }))}
      />

                    <DropdownField
        label="Product"
        placeholder="product"
        required
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
        options={products.map((p) => ({
          label: p.productName,
          value: p.productId.toString(),
        }))}
      />

                    <DropdownField
        label="Rate Plan"
        placeholder="RatePlan"
        required
        value={selectedRatePlanId?.toString() || ""}
        onChange={(val) => {
          const id = Number(val);
          setSelectedRatePlanId(id);
          clearError("ratePlanId");

          const rp = ratePlans.find((r) => r.ratePlanId === id);
          setSelectedRatePlanName(rp?.ratePlanName || "");
        }}
        error={errors.ratePlanId}
        options={ratePlans
          .filter((rp) => (selectedProductId ? rp.productId === selectedProductId : true))
          .map((rp) => ({
            label: rp.ratePlanName,
            value: rp.ratePlanId.toString(),
          }))}
        disabled={!selectedProductId}
      />
      <InfoInlineNote text="Select a rate plan associated with the chosen product. Changing the product will reset this selection." />

                    <DropdownField
        label="Payment Type"
        required
        placeholder="PaymentType"
        value={paymentType}
        onChange={(val) => {
          if (val === "PREPAID" || val === "POSTPAID" || val === "") {
            setPaymentType(val);
            clearError("paymentType");
          }
        }}
        error={errors.paymentType}
        options={[
          { label: "Post-Paid", value: "POSTPAID" },
          { label: "Pre-Paid", value: "PREPAID" },
        ]}
      />

      <div className="met-np-field">
        <TextareaField
          label="Admin Notes"
          placeholder="Enter admin notes"
          value={adminNotes}
          onChange={setAdminNotes}
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
      { label: "Admin Notes", value: adminNotes || "—" },
    ];

    return (
      <section>
        <ReviewComponent title="PURCHASE DETAILS" rows={reviewRows} />
      </section>
    );
  };

  // ─────────────────────────────────────────────────────────────
  // UI (same as CreateUsageMetric structure + met-np classnames)
  // ─────────────────────────────────────────────────────────────
  return (
    <>
      {showSuccess ? (
        <ProductCreatedSuccess
          productName={selectedCustomerName || "Purchase"}
          titleOverride={`“${selectedCustomerName || "Purchase"}” Purchase Created Successfully`}
          primaryLabelOverride="Go to All Purchases"
          onPrimaryClick={handleGoAllPurchases}
        />
      ) : (
        <>
          <TopBar
            title="Create New Purchase"
            onBack={handleTopbarBack}
            cancel={{
              onClick: () => setShowDeleteConfirm(true),
              disabled: topActionsDisabled,
            }}
            save={{
              onClick: handleSaveDraft,
              label: isDraftSaved ? "Saved!" : "Save as Draft",
              saved: isDraftSaved,
              saving: isDraftSaving,
              labelWhenSaved: "Saved as Draft",
              disabled: topActionsDisabled,
            }}
          />

          <div className="met-np-viewport">
            <div className="met-np-card">
              <div className="met-np-grid">
                <aside className="met-np-rail">
                  <nav className="met-np-steps">
                    {steps.map((step, i) => {
                      const isActive = i === currentStep;
                      // Only mark as completed if user has moved past it AND all required fields are filled
                      const isStep0Completed = selectedCustomerId && selectedProductId && selectedRatePlanId && paymentType;
                      const isCompleted = i < currentStep && (i === 0 ? isStep0Completed : true);
                      const showConnector = i < steps.length - 1;

                      return (
                        <button
                          key={step.id}
                          type="button"
                          className={[
                            "met-np-step",
                            isActive ? "active" : "",
                            isCompleted ? "completed" : "",
                          ]
                            .join(" ")
                            .trim()}
                          onClick={() => gotoStep(i)}
                        >
                          <span className="met-np-step__bullet" aria-hidden="true">
                            <span className="met-np-step__icon">
                              {isCompleted ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                  <circle cx="12" cy="12" r="11.5" fill="var(--color-primary-800)" stroke="var(--color-primary-800)" />
                                  <path d="M7 12l3 3 6-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                  <circle cx="12" cy="12" r="11" stroke="#C3C2D0" strokeWidth="2" />
                                  <circle cx="12" cy="12" r="6" fill="#C3C2D0" />
                                </svg>
                              )}
                            </span>
                            {showConnector && <span className="met-np-step__connector" />}
                          </span>

                          <span className="met-np-step__text">
                            <span className="met-np-step__title">{step.title}</span>
                            <span className="met-np-step__desc">{step.desc}</span>
                          </span>
                        </button>
                      );
                    })}
                  </nav>
                </aside>

                <main className="met-np-main">
                  <div className="af-skel-rule af-skel-rule--top" />
                  <div className="met-np-main__inner">
                    <div className="met-np-body">
                      {activeTab === "details" && (
                        <SectionHeader title="PURCHASE DETAILS" className="met-np-section-header-fixed" />
                      )}
                      {activeTab === "review" && (
                        <SectionHeader title="REVIEW & CONFIRM" className="met-np-section-header-fixed" />
                      )}

                      <form className="met-np-form" onSubmit={(e) => e.preventDefault()}>
                        <div className="met-np-form-section">
                          {activeTab === "details" && <section>{renderStep0()}</section>}
                          {activeTab === "review" && <section>{renderStep1()}</section>}
                        </div>

                        <div className="met-np-form-footer" style={{ position: "relative" }}>
                          {errors.form && <div className="met-met-np-error-message">{errors.form}</div>}

                          {activeTab === "details" && (
                            <div className="met-np-btn-group met-np-btn-group--next">
                              <PrimaryButton onClick={handleSaveAndNext} disabled={saving}>
                                {saving ? "Saving..." : "Save & Next"}
                              </PrimaryButton>
                            </div>
                          )}

                          {activeTab === "review" && (
                            <>
                              {!canGoReview ? (
                                <div
                                  className="met-np-footer-hint"
                                  style={{
                                    position: "absolute",
                                    left: "50%",
                                    bottom: "20px",
                                    transform: "translateX(-50%)",
                                    color: "#8C8F96",
                                    fontSize: 14,
                                    pointerEvents: "none",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  Complete the previous step to unlock this step
                                </div>
                              ) : (
                                <>
                                  <div className="met-np-btn-group met-np-btn-group--back">
                                    <SecondaryButton onClick={() => gotoStep(0)} disabled={saving}>
                                      Back
                                    </SecondaryButton>
                                  </div>
                                  <div className="met-np-btn-group met-np-btn-group--next">
                                    <PrimaryButton onClick={handleFinalSubmit} disabled={saving}>
                                      {saving ? "Submitting..." : "Create Purchase"}
                                    </PrimaryButton>
                                  </div>
                                </>
                              )}
                            </>
                          )}
                        </div>
                      </form>
                    </div>
                  </div>
                </main>
              </div>

              <div className="af-skel-rule af-skel-rule--bottom" />

              <SaveDraft
                isOpen={showSavePrompt}
                onClose={async () => {
                  setShowSavePrompt(false);
                  await deleteAndClose();
                }}
                onSave={async () => {
                  const ok = await handleSaveDraft();
                  showToast({
                    kind: ok ? "success" : "error",
                    title: ok ? "Draft Saved" : "Failed to Save Draft",
                    message: ok ? "Purchase draft saved successfully." : "Unable to save draft. Please try again.",
                  });
                  onClose();
                }}
                onDismiss={() => setShowSavePrompt(false)}
              />
            </div>
          </div>

          <ConfirmDeleteModal
            isOpen={showDeleteConfirm}
            productName={selectedCustomerName || "this purchase"}
            entityType="purchase"
            discardLabel="Keep editing"
            confirmLabel="Discard"
            isDiscardMode={true}
            onConfirm={async () => {
              setShowDeleteConfirm(false);
              await deleteAndClose();
            }}
            onCancel={() => setShowDeleteConfirm(false)}
          />
        </>
      )}
    </>
  );
}
