// CreateSubscription.tsx
import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import TopBar from "../componenetsss/TopBar";
import CreateFormShell from "../componenetsss/CreateFormShell";
import { TextareaField, DropdownField } from "../componenetsss/Inputs";
import ConfirmDeleteModal from "../componenetsss/ConfirmDeleteModal";
import SaveDraft from "../componenetsss/SaveDraft";
import { useToast } from "../componenetsss/ToastProvider";
import PrimaryButton from "../componenetsss/PrimaryButton";
import SecondaryButton from "../componenetsss/SecondaryButton";
import ProductCreatedSuccess from "../componenetsss/ProductCreatedSuccess";
import InfoInlineNote from "../componenetsss/InfoInlineNote";
import ReviewComponent, { ReviewRow } from "../componenetsss/ReviewComponent";

import {
  Api,
  Product,
  RatePlan,
  Customer,
  Subscription as SubscriptionType,
} from "./api";

import "../componenetsss/SkeletonForm.css";
import "./CreateSubscription.css";

type StepKey = "details" | "review";
type PaymentKind = "PREPAID" | "POSTPAID";

const steps = [
  {
    id: 1,
    key: "details" as StepKey,
    title: "Purchase Details",
    desc: "Provide purchase-related details.",
  },
  {
    id: 2,
    key: "review" as StepKey,
    title: "Review & Confirm",
    desc: "Check and finalize details.",
  },
];

interface CreateSubscriptionProps {
  onClose: () => void;
  onCreateSuccess: (sub: SubscriptionType) => void;
  onRefresh?: () => void;

  draftSubscriptionId?: number;
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
  const activeTab: StepKey = steps[currentStep].key;

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
  // Icons (same vibe as your CreateCustomer)
  // ─────────────────────────────────────────────────────────────
  const StepLockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 26 26" fill="none">
      <path
        d="M10.03 11.895V9.67503C10.03 8.93905 10.3224 8.23322 10.8428 7.71281C11.3632 7.1924 12.069 6.90004 12.805 6.90004C13.541 6.90004 14.2468 7.1924 14.7672 7.71281C15.2876 8.23322 15.58 8.93905 15.58 9.67503V11.895M25 13C25 19.6274 19.6274 25 13 25C6.37258 25 1 19.6274 1 13C1 6.37258 6.37258 1 13 1C19.6274 1 25 6.37258 25 13ZM8.92003 11.895H16.69C17.303 11.895 17.8 12.392 17.8 13.005V16.89C17.8 17.503 17.303 18 16.69 18H8.92003C8.307 18 7.81003 17.503 7.81003 16.89V13.005C7.81003 12.392 8.307 11.895 8.92003 11.895Z"
        stroke="#BAC4D5"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const CompletedIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M9.50024 16.6662C9.89077 17.0567 10.5239 17.0567 10.9145 16.6662L18.0341 9.54661C18.4017 9.17902 18.4017 8.58304 18.0341 8.21546C17.6665 7.84787 17.0705 7.84787 16.7029 8.21546L10.9145 14.0039C10.5239 14.3944 9.89077 14.3944 9.50024 14.0039L7.27291 11.7766C6.90533 11.409 6.30935 11.409 5.94176 11.7766C5.57418 12.1442 5.57418 12.7402 5.94176 13.1077L9.50024 16.6662ZM12.0022 24.0001C10.3425 24.0001 8.78242 23.6851 7.32204 23.0552C5.86163 22.4253 4.59129 21.5705 3.51102 20.4907C2.43072 19.4109 1.57549 18.1411 0.945316 16.6813C0.315145 15.2216 6.02322e-05 13.6619 6.02322e-05 12.0022C6.02322e-05 10.3425 0.315009 8.78242 0.944905 7.32204C1.5748 5.86163 2.42965 4.5913 3.50944 3.51102C4.58925 2.43072 5.85903 1.57549 7.31878 0.945317C8.77851 0.315147 10.3382 6.02322e-05 11.9979 6.02322e-05C13.6577 6.02322e-05 15.2177 0.31501 16.6781 0.944906C18.1385 1.5748 19.4088 2.42965 20.4891 3.50944C21.5694 4.58925 22.4246 5.85903 23.0548 7.31879C23.685 8.77852 24.0001 10.3382 24.0001 11.9979C24.0001 13.6577 23.6851 15.2177 23.0552 16.6781C22.4253 18.1385 21.5705 19.4088 20.4907 20.4891C19.4109 21.5694 18.1411 22.4246 16.6813 23.0548C15.2216 23.685 13.6619 24.0001 12.0022 24.0001Z"
        fill="#034A7D"
      />
    </svg>
  );

  const ActiveRingIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="11" stroke="#C3C2D0" strokeWidth="2" />
      <circle cx="12" cy="12" r="6" fill="#C3C2D0" />
    </svg>
  );

  // ─────────────────────────────────────────────────────────────
  // Page behavior (same as your create screens)
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
  // Hydrate draft
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!activeSubscriptionId) return;
    if (draftData) return;

    (async () => {
      try {
        const fn =
          (Api as any).getSubscription ||
          (Api as any).getSubscriptionById ||
          (Api as any).getDraftSubscription;

        if (!fn) return;

        const data = await fn(activeSubscriptionId);
        if (!data) return;

        setSubscriptionId((data as any).subscriptionId ?? null);
        if ((data as any).customerId != null) setSelectedCustomerId((data as any).customerId);
        if ((data as any).productId != null) setSelectedProductId((data as any).productId);
        if ((data as any).ratePlanId != null) setSelectedRatePlanId((data as any).ratePlanId);

        const pt = (data as any).paymentType;
        if (pt === "PREPAID" || pt === "POSTPAID") setPaymentType(pt);

        if ((data as any).adminNotes) setAdminNotes((data as any).adminNotes);

        if (!initialFormState) {
          setInitialFormState({
            selectedCustomerId: (data as any).customerId ?? null,
            selectedProductId: (data as any).productId ?? null,
            selectedRatePlanId: (data as any).ratePlanId ?? null,
            paymentType: pt === "PREPAID" || pt === "POSTPAID" ? pt : "",
            adminNotes: (data as any).adminNotes || "",
          });
        }
      } catch (e) {
        console.error("Failed to hydrate subscription draft", e);
      }
    })();
  }, [activeSubscriptionId, draftData, initialFormState]);

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
        adminNotes: (draftData as any).adminNotes || "",
      });
    }
  }, [draftData, initialFormState]);

  // names from IDs
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

  // reset "Saved!" when user edits
  useEffect(() => {
    if (isDraftSaved) setIsDraftSaved(false);
  }, [selectedCustomerId, selectedProductId, selectedRatePlanId, paymentType, adminNotes]);

  useEffect(() => {
    if (!isDraftSaved) return;
    const timer = setTimeout(() => setIsDraftSaved(false), 2000);
    return () => clearTimeout(timer);
  }, [isDraftSaved]);

  // ─────────────────────────────────────────────────────────────
  // Lock logic (same philosophy as CreateCustomer)
  // ─────────────────────────────────────────────────────────────
  const hasAnyRequiredInput = useMemo(() => {
    return Boolean(
      selectedCustomerId ||
        selectedProductId ||
        selectedRatePlanId ||
        paymentType ||
        adminNotes.trim()
    );
  }, [selectedCustomerId, selectedProductId, selectedRatePlanId, paymentType, adminNotes]);

  const isStep0Completed = useMemo(() => {
    return Boolean(
      selectedCustomerId &&
        selectedProductId &&
        selectedRatePlanId &&
        (paymentType === "PREPAID" || paymentType === "POSTPAID")
    );
  }, [selectedCustomerId, selectedProductId, selectedRatePlanId, paymentType]);

  const isReviewLocked = !isStep0Completed;

  const hasUserMadeChanges = useMemo(() => {
    if (!initialFormState) return hasAnyRequiredInput;

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
    hasAnyRequiredInput,
  ]);

  useEffect(() => {
    if (hasUserMadeChanges && !hasEverBeenEnabled) setHasEverBeenEnabled(true);
  }, [hasUserMadeChanges, hasEverBeenEnabled]);

  const topActionsDisabled = !hasEverBeenEnabled;

  // ─────────────────────────────────────────────────────────────
  // Validation
  // ─────────────────────────────────────────────────────────────
  const validateStep = (s: number): boolean => {
    if (s !== 0) return true;

    const n: Record<string, string> = {};
    if (!selectedCustomerId) n.customerId = "Customer is required";
    if (!selectedProductId) n.productId = "Product is required";
    if (!selectedRatePlanId) n.ratePlanId = "Rate Plan is required";
    if (!(paymentType === "PREPAID" || paymentType === "POSTPAID"))
      n.paymentType = "Payment Type is required";

    setErrors(n);
    return Object.keys(n).length === 0;
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
  // Step navigation (with lock + validation)
  // ─────────────────────────────────────────────────────────────
  const gotoStep = (index: number) => setCurrentStep(index);

  const handleStepClick = async (index: number) => {
    if (index === currentStep) return;

    // back navigation always allowed
    if (index < currentStep) {
      gotoStep(index);
      return;
    }

    // prevent clicking locked review
    if (index === 1 && isReviewLocked) return;

    // when going to review, validate details and save (call API)
    if (index === 1) {
      const ok = validateStep(0);
      if (!ok) {
        gotoStep(0);
        return;
      }
      
      // Call API when navigating via sidebar
      const saved = await saveBeforeNext();
      if (!saved) return;
    }

    gotoStep(index);
  };

  // ─────────────────────────────────────────────────────────────
  // TopBar back
  // ─────────────────────────────────────────────────────────────
  const handleTopbarBack = () => {
    if (hasAnyRequiredInput || subscriptionId) setShowSavePrompt(true);
    else navigate("/get-started/subscriptions");
  };

  // ─────────────────────────────────────────────────────────────
  // Draft payload + save
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
    const ok = validateStep(0);
    if (!ok) return false;

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

  // discard behavior - delete draft then close
  const deleteAndClose = async () => {
    if (subscriptionId) {
      try {
        await Api.deleteSubscription(subscriptionId);
      } catch (error) {
        console.error("Failed to delete draft subscription:", error);
      }
    }
    onClose();
  };

  // ─────────────────────────────────────────────────────────────
  // Final submit
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

  const handleNext = async () => {
    if (activeTab === "details") {
      const ok = await saveBeforeNext();
      if (!ok) return;
      setCurrentStep(1);
      return;
    }
    if (activeTab === "review") {
      await handleFinalSubmit();
    }
  };

  const handleGoAllPurchases = () => {
    navigate("/get-started/subscriptions");
    onClose();
  };

  // ─────────────────────────────────────────────────────────────
  // Render blocks (same content you had)
  // ─────────────────────────────────────────────────────────────
  const renderDetails = () => (
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
        placeholder="Product"
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
        placeholder="Rate Plan"
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
        placeholder="Payment Type"
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

  const renderReview = () => {
    const rows: ReviewRow[] = [
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
        <ReviewComponent title="PURCHASE DETAILS" rows={rows} />
      </section>
    );
  };

  // ─────────────────────────────────────────────────────────────
  // Success Screen
  // ─────────────────────────────────────────────────────────────
  if (showSuccess) {
    return (
      <ProductCreatedSuccess
        productName={selectedCustomerName || "Purchase"}
        titleOverride={`“${selectedCustomerName || "Purchase"}” Purchase Created Successfully`}
        primaryLabelOverride="Go to All Purchases"
        onPrimaryClick={handleGoAllPurchases}
      />
    );
  }

  // ─────────────────────────────────────────────────────────────
  // Main UI (CreateFormShell like CreateCustomer)
  // ─────────────────────────────────────────────────────────────
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
          onClick: handleSaveDraft,
          label: isDraftSaved ? "Saved!" : "Save as Draft",
          saved: isDraftSaved,
          saving: isDraftSaving,
          labelWhenSaved: "Saved as Draft",
          disabled: topActionsDisabled,
        }}
      />
      <CreateFormShell
        rail={
          <nav className="met-np-steps">
            {steps.map((step, i) => {
              // Icon logic: Ring icon until step is completed AND user has moved past it
              const showRingIcon =
                (i === 0 && (currentStep === 0 || !isStep0Completed)) ||
                (i === 1 && currentStep === 1);

              // Title styling: Only current step shows active color
              const isActiveStep = i === currentStep;

              // Step 0 completed (checkmark) only after moving past it
              const isCompleted = i === 0 && Boolean(isStep0Completed) && currentStep > 0;

              // Step 1 locked until on Step 1
              const isLocked = i === 1 && currentStep === 0;

              const showConnector = i < steps.length - 1;

              return (
                <button
                  key={step.id}
                  type="button"
                  className={[
                    "met-np-step",
                    isActiveStep ? "active" : "",
                    isCompleted ? "completed" : "",
                    isLocked ? "locked" : "",
                  ].join(" ").trim()}
                  onClick={() => void handleStepClick(i)}
                  disabled={i === 1 && isReviewLocked}
                >
                  <span className="met-np-step__bullet" aria-hidden="true">
                    <span className="met-np-step__icon">
                      {showRingIcon ? (
                        <ActiveRingIcon />
                      ) : isCompleted ? (
                        <CompletedIcon />
                      ) : (
                        <StepLockIcon />
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
        }
        title={activeTab === "details" ? "PURCHASE DETAILS" : "REVIEW & CONFIRM"}
        locked={activeTab === "review" ? isReviewLocked : false}
        footerLeft={
          activeTab === "details" ? null : isReviewLocked ? null : (
            <SecondaryButton type="button" onClick={() => setCurrentStep(0)} disabled={saving}>
              Back
            </SecondaryButton>
          )
        }
        footerHint={
          activeTab === "review" && isReviewLocked
            ? "Complete the previous steps to unlock this step"
            : undefined
        }
        footerRight={
          activeTab === "details" ? (
            <PrimaryButton type="button" onClick={handleNext} disabled={saving}>
              {saving ? "Saving..." : "Save & Next"}
            </PrimaryButton>
          ) : isReviewLocked ? null : (
            <PrimaryButton type="button" onClick={handleNext} disabled={saving}>
              {saving ? "Submitting..." : "Create Purchase"}
            </PrimaryButton>
          )
        }
      >
        <form className="met-np-form" onSubmit={(e) => e.preventDefault()}>
          <div className="met-np-form-section">
            {activeTab === "details" && <section>{renderDetails()}</section>}
            {activeTab === "review" && <section>{renderReview()}</section>}
          </div>

          {/* FOOTER AREA INSIDE SHELL (only for inline errors / hint overlay) */}
          <div className="met-np-form-footer" style={{ position: "relative" }}>
            {errors.form && <div className="met-met-np-error-message">{errors.form}</div>}

            {activeTab === "review" && isReviewLocked && (
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
                Complete the previous steps to unlock this step
              </div>
            )}
          </div>
        </form>
      </CreateFormShell>

      {/* Save Draft prompt */}
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

      {/* Discard modal */}
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
  );
}