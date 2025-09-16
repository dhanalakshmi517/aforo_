import * as React from "react";
import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import SaveDraft from "../componenetsss/SaveDraft";
import ConfirmDeleteModal from "../componenetsss/ConfirmDeleteModal";

import {
  createRatePlan,
  updateRatePlan,
  confirmRatePlan,
  fetchProducts,
  Product,
  RatePlanRequest,
} from "./api";

import {
  initializeSession,
  clearCurrentSession,
  clearOldSessions,
  getRatePlanData,
  setRatePlanData,
} from "./utils/sessionStorage";

import Billable from "./Billable";
import Pricing, { PricingHandle } from "./Pricing";
import Extras, { ExtrasHandle } from "./Extras";
import Review from "./Review";

import { InputField, TextareaField, SelectField } from "../componenetsss/Inputs";

import "./CreatePricePlan.css";
import "../Products/NewProducts/NewProduct.css"; // keep if your alias shim maps .rate-np-* to existing styles

type ActiveTab = "details" | "billable" | "pricing" | "extras" | "review";

interface CreatePricePlanProps {
  onClose: () => void;
  registerSaveDraft?: (fn: () => Promise<void>) => void;
}

const steps = [
  { id: 1, title: "Plan Details", desc: "Define the basic information and structure of your plan." },
  { id: 2, title: "Select Billable Metric", desc: "Select or define a Billable Metric" },
  { id: 3, title: "Pricing Model Setup", desc: "Configure how pricing will work for this plan." },
  { id: 4, title: "Extras", desc: "Add optional features or benefits to enhance your plan." },
  { id: 5, title: "Review & confirm", desc: "Check and Finalize details." },
];

const CreatePricePlan = React.forwardRef<
  { back: () => boolean; getRatePlanId: () => number | null },
  CreatePricePlanProps
>(({ onClose, registerSaveDraft }, ref) => {
  const navigate = useNavigate();

  const pricingRef = useRef<PricingHandle>(null);
  const extrasRef = useRef<ExtrasHandle>(null);

  const [currentStep, setCurrentStep] = useState<number>(() => {
    const saved = Number(getRatePlanData("WIZARD_STEP"));
    return Number.isFinite(saved) && saved >= 0 && saved < steps.length ? saved : 0;
  });

  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [saving, setSaving] = useState(false);
  const [draftSaving, setDraftSaving] = useState(false);
  const [hasSavedAsDraft, setHasSavedAsDraft] = useState(false);

  const [planName, setPlanName] = useState("");
  const [planDescription, setPlanDescription] = useState("");
  const [billingFrequency, setBillingFrequency] = useState("");
  const [selectedProductName, setSelectedProductName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");

  const [products, setProducts] = useState<Product[]>([]);
  const [productError, setProductError] = useState("");
  const [selectedMetricId, setSelectedMetricId] = useState<number | null>(null);
  const [ratePlanId, setRatePlanId] = useState<number | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    document.body.classList.add("create-product-page");
    initializeSession();
    clearOldSessions();

    (async () => {
      try {
        setProducts((await fetchProducts()) as Product[]);
      } catch {
        setProductError("Failed to load products");
      }
    })();

    return () => {
      document.body.classList.remove("create-product-page");
      clearCurrentSession();
    };
  }, []);

  useEffect(() => {
    setRatePlanData("WIZARD_STEP", currentStep.toString());
    localStorage.setItem("ratePlanWizardStep", String(currentStep));
    return () => {
      localStorage.removeItem("ratePlanWizardStep");
    };
  }, [currentStep]);

  React.useImperativeHandle(
    ref,
    () => ({
      back: () => {
        if (currentStep > 0) {
          setCurrentStep((s) => s - 1);
          return true;
        }
        return false;
      },
      getRatePlanId: () => ratePlanId,
    }),
    [currentStep, ratePlanId]
  );

  const sectionHeading = steps[currentStep].title;

  const validateStep0 = (): boolean => {
    const e: Record<string, string> = {};
    if (!planName.trim()) e.planName = "This is required field";
    if (!planDescription.trim()) e.planDescription = "This is required field";
    if (!billingFrequency) e.billingFrequency = "This is required field";
    if (!selectedProductName) e.selectedProductName = "This is required field";
    if (!paymentMethod) e.paymentMethod = "This is required field";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validatePricingStep = (): { isValid: boolean; errors: Record<string, string> } => {
    const e: Record<string, string> = {};
    const selectedPricingModel = getRatePlanData("PRICING_MODEL") || "";

    if (!selectedPricingModel) {
      e.pricingModel = "Please select a pricing model";
      return { isValid: false, errors: e };
    }

    if (selectedPricingModel === "Flat Fee") {
      const flatFeeAmount = getRatePlanData("FLAT_FEE_AMOUNT");
      const apiCalls = getRatePlanData("FLAT_FEE_API_CALLS");
      const overageRate = getRatePlanData("FLAT_FEE_OVERAGE");
      if (!flatFeeAmount || Number(flatFeeAmount) <= 0) e.flatFeeAmount = "Flat fee amount is required";
      if (!apiCalls || Number(apiCalls) <= 0) e.apiCalls = "Number of API calls is required";
      if (!overageRate || Number(overageRate) <= 0) e.overageRate = "Overage unit rate is required";
    } else if (selectedPricingModel === "Usage-Based") {
      const perUnitAmount = getRatePlanData("USAGE_PER_UNIT_AMOUNT");
      if (!perUnitAmount || Number(perUnitAmount) <= 0) e.perUnitAmount = "Per unit amount is required";
    } else if (selectedPricingModel === "Tiered Pricing") {
      const tieredTiers = JSON.parse(getRatePlanData("TIERED_TIERS") || "[]");
      const overage = getRatePlanData("TIERED_OVERAGE");
      if (tieredTiers.length === 0) e.tieredTiers = "At least one tier is required";
      const hasInvalidTier = tieredTiers.some(
        (tier: any) =>
          !tier.from?.toString().trim() ||
          !tier.price?.toString().trim() ||
          (!tier.isUnlimited && !tier.to?.toString().trim())
      );
      if (hasInvalidTier) e.tieredTiers = "All tier fields are required";
      const hasUnlimited = tieredTiers.some((t: any) => t.isUnlimited);
      if (!hasUnlimited && (!overage || Number(overage) <= 0)) {
        e.tieredOverage = "Overage charge is required when no unlimited tier";
      }
    } else if (selectedPricingModel === "Volume-Based") {
      const volumeTiers = JSON.parse(getRatePlanData("VOLUME_TIERS") || "[]");
      const overage = getRatePlanData("VOLUME_OVERAGE");
      if (volumeTiers.length === 0) e.volumeTiers = "At least one volume tier is required";
      if (!overage || Number(overage) <= 0) e.volumeOverage = "Overage unit rate is required";
    } else if (selectedPricingModel === "Stairstep") {
      const stairTiers = JSON.parse(getRatePlanData("STAIR_TIERS") || "[]");
      const overage = getRatePlanData("STAIR_OVERAGE");
      if (stairTiers.length === 0) e.stairTiers = "At least one stair tier is required";
      const hasUnlimited = stairTiers.some((t: any) => t.isUnlimited);
      if (!hasUnlimited && (!overage || Number(overage) <= 0)) {
        e.stairOverage = "Overage charge is required when no unlimited tier";
      }
    }

    return { isValid: Object.keys(e).length === 0, errors: e };
  };

  const ensureRatePlanCreated = async (): Promise<boolean> => {
    if (ratePlanId) return true;

    const selectedProduct = products.find((p) => p.productName === selectedProductName);
    if (!selectedProduct) {
      setErrors({ selectedProductName: "Invalid product selected" });
      return false;
    }
    if (selectedMetricId === null) {
      setErrors({ billableMetric: "This is required field" });
      return false;
    }
    const payload: RatePlanRequest = {
      ratePlanName: planName,
      productId: Number(selectedProduct.productId),
      description: planDescription,
      billingFrequency: billingFrequency as any,
      paymentType: paymentMethod as any,
      billableMetricId: selectedMetricId,
    };
    try {
      setSaving(true);
      const created = await createRatePlan(payload);
      setRatePlanId(created.ratePlanId);
      return true;
    } catch (e) {
      console.error("Create rate plan failed", e);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const canNavigateTo = async (targetIndex: number): Promise<boolean> => {
    if (targetIndex <= currentStep) return true;

    if (targetIndex >= 1 && !validateStep0()) {
      setCurrentStep(0);
      return false;
    }

    if (targetIndex >= 2) {
      if (selectedMetricId === null) {
        setErrors({ billableMetric: "This is required field" });
        setCurrentStep(1);
        return false;
      }
      const ok = await ensureRatePlanCreated();
      if (!ok) {
        setCurrentStep(1);
        return false;
      }
    }
    return true;
  };

  const onStepClick = async (index: number) => {
    if (index === currentStep) return;
    const ok = await canNavigateTo(index);
    if (ok) setCurrentStep(index);
  };

  const saveDraft = useCallback(async () => {
    setHasSavedAsDraft(true);
    setRatePlanData("CURRENT_STEP", currentStep.toString());

    if (currentStep === 0 && !validateStep0()) return;

    try {
      setDraftSaving(true);
      const selectedProduct = products.find((p) => p.productName === selectedProductName);

      const partial: Partial<RatePlanRequest> = {
        // @ts-ignore backend allows status
        status: "DRAFT",
        ratePlanName: (planName || undefined) as any,
        productId: selectedProduct ? Number(selectedProduct.productId) : undefined,
        description: planDescription || undefined,
        billingFrequency: billingFrequency as any,
        paymentType: paymentMethod as any,
      };
      if (selectedMetricId !== null) (partial as any).billableMetricId = selectedMetricId;

      let currentId = ratePlanId;
      if (!currentId) {
        const created = await createRatePlan(partial as any);
        currentId = created.ratePlanId;
        setRatePlanId(currentId);
      } else {
        await updateRatePlan(currentId, partial as any);
      }

      if (currentId && extrasRef.current) {
        try {
          await extrasRef.current.saveAll(currentId);
        } catch (extrasErr) {
          console.warn("Extras draft save warning:", extrasErr);
        }
      }
    } catch (e) {
      console.error("Failed to save draft", e);
    } finally {
      setDraftSaving(false);
    }
  }, [
    currentStep,
    planName,
    planDescription,
    billingFrequency,
    selectedProductName,
    paymentMethod,
    selectedMetricId,
    ratePlanId,
    products,
  ]);

  useEffect(() => {
    if (registerSaveDraft) registerSaveDraft(saveDraft);
  }, [registerSaveDraft, saveDraft]);

  const handleNext = async () => {
    if (currentStep === steps.length - 1) {
      if (!ratePlanId) return;
      try {
        setSaving(true);
        if (!hasSavedAsDraft) {
          await confirmRatePlan(ratePlanId);
        }
        onClose();
        navigate("/get-started/rate-plans");
      } finally {
        setSaving(false);
      }
      return;
    }

    if (currentStep === 0 && !validateStep0()) return;

    if (currentStep === 1) {
      if (selectedMetricId === null) {
        setErrors({ billableMetric: "This is required field" });
        return;
      }
      if (ratePlanId) {
        try {
          setSaving(true);
          const selectedProduct = products.find((p) => p.productName === selectedProductName);
          const updatePayload: Partial<RatePlanRequest> = { billableMetricId: selectedMetricId };
          if (selectedProduct) updatePayload.productId = Number(selectedProduct.productId);
          await updateRatePlan(ratePlanId, updatePayload as any);
        } catch (e) {
          console.error("Failed to update rate plan with metric", e);
          setSaving(false);
          return;
        }
        setSaving(false);
      } else {
        const ok = await ensureRatePlanCreated();
        if (!ok) return;
      }
    }

    if (currentStep === 2 && pricingRef.current && ratePlanId) {
      const v = validatePricingStep();
      if (!v.isValid) {
        setErrors(v.errors);
        return;
      }
      setSaving(true);
      try {
        const success = await pricingRef.current.save();
        if (!success) {
          setSaving(false);
          return;
        }
      } catch (e) {
        console.error("Failed to save pricing", e);
        setSaving(false);
        return;
      }
      setSaving(false);
    }

    setCurrentStep((s) => s + 1);
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
    else onClose();
  };

  const activeTab: ActiveTab =
    currentStep === 0 ? "details" : currentStep === 1 ? "billable" : currentStep === 2 ? "pricing" : currentStep === 3 ? "extras" : "review";

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <>
            <div className="rate-np-grid-2">
              <InputField
                label="Rate Plan Name"
                placeholder="e.g., Individual Plan, Pro Plan"
                value={planName}
                onChange={setPlanName}
                error={errors.planName}
              />
              <SelectField
                label="Billing Frequency"
                value={billingFrequency}
                onChange={setBillingFrequency}
                placeholder="Select billing cycle"
                options={[
                  { label: "Monthly", value: "MONTHLY" },
                  { label: "Yearly", value: "YEARLY" },
                  { label: "Daily", value: "DAILY" },
                  { label: "Hourly", value: "HOURLY" },
                  { label: "Weekly", value: "WEEKLY" },
                ]}
                error={errors.billingFrequency}
              />
              <SelectField
                label="Select Product"
                value={selectedProductName}
                onChange={setSelectedProductName}
                placeholder="Select Product"
                options={
                  productError
                    ? []
                    : products.map((p) => ({
                        label: p.productName,
                        value: p.productName,
                      }))
                }
                error={errors.selectedProductName}
              />
              <SelectField
                label="Payment type"
                value={paymentMethod}
                onChange={setPaymentMethod}
                placeholder="Select payment method"
                options={[
                  { label: "Post-Paid", value: "POSTPAID" },
                  { label: "Pre-Paid", value: "PREPAID" },
                ]}
                error={errors.paymentMethod}
              />
              <TextareaField
                label="Rate Plan Description"
                placeholder="e.g., Best for solo developers using our API"
                value={planDescription}
                onChange={setPlanDescription}
                error={errors.planDescription}
              />
            </div>
          </>
        );
      case 1:
        return (
          <>
            <Billable
              productName={selectedProductName}
              selectedMetricId={selectedMetricId}
              onSelectMetric={setSelectedMetricId}
            />
            {errors.billableMetric && (
              <div className="rate-np-error-message" style={{ marginTop: 10 }}>{errors.billableMetric}</div>
            )}
          </>
        );
      case 2:
        return <Pricing ref={pricingRef} ratePlanId={ratePlanId} validationErrors={errors} />;
      case 3:
        return <Extras ref={extrasRef} ratePlanId={ratePlanId} noUpperLimit={false} />;
      case 4: {
        const planDetails = {
          name: planName,
          description: planDescription,
          frequency: billingFrequency,
          product: selectedProductName,
          paymentMethod,
        };
        return <Review planDetails={planDetails} />;
      }
      default:
        return <p>Coming soon...</p>;
    }
  };

  return (
    <>
      <div className="rate-np-viewport">
        <div className="rate-np-card">
          <div className="rate-np-grid">
            {/* LEFT rail (stepper) */}
            <aside className="rate-np-rail">
              <nav className="rate-np-steps">
                {steps.map((step, i) => {
                  const isActive = i === currentStep;
                  const isCompleted = i < currentStep;
                  const showConnector = i < steps.length - 1;
                  return (
                    <button
                      key={step.id}
                      type="button"
                      className={["rate-np-step", isActive ? "active" : "", isCompleted ? "completed" : ""].join(" ").trim()}
                      onClick={() => onStepClick(i)}
                    >
                      <span className="rate-np-step__bullet" aria-hidden="true">
                        <span className="rate-np-step__icon">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none">
                            <circle cx="12" cy="12" r="11" stroke="#C3C2D0" strokeWidth="2" />
                            <circle cx="12" cy="12" r="6" fill="#C3C2D0" />
                          </svg>
                        </span>
                        {showConnector && <span className="rate-np-step__connector" />}
                      </span>

                      <span className="rate-np-step__text">
                        <span className="rate-np-step__title">{step.title}</span>
                        <span className="rate-np-step__desc">{step.desc}</span>
                      </span>
                    </button>
                  );
                })}
              </nav>
            </aside>

            {/* MAIN area */}
            <main className="rate-np-main">
              <div className="rate-np-main__inner">
                <div className="rate-np-body">
                  <form className="rate-np-form" onSubmit={(e) => e.preventDefault()}>
                    <div className="rate-np-form-section">
                      <section>
                        <div className="rate-np-section-header">
                          <h3 className="rate-np-section-title">{sectionHeading.toUpperCase()}</h3>
                        </div>
                        {renderStepContent()}
                      </section>
                    </div>

                    {/* Footer actions */}
                    <div className="rate-np-form-footer">
                      <div className="rate-np-btn-group rate-np-btn-group--back">
                        <button type="button" className="rate-np-btn rate-np-btn--ghost" onClick={handleBack} disabled={currentStep === 0}>
                          Back
                        </button>
                      </div>

                      <div className="rate-np-btn-group rate-np-btn-group--next">
                        <button
                          type="button"
                          className="rate-np-btn rate-np-btn--primary"
                          onClick={handleNext}
                          disabled={saving}
                        >
                          {saving
                            ? currentStep === steps.length - 1
                              ? "Submitting..."
                              : "Saving..."
                            : currentStep === steps.length - 1
                            ? "Create Rate Plan"
                            : "Save & Next"}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </main>
          </div>
        </div>

        {/* Save Draft confirmation modal */}
        <SaveDraft
          isOpen={showSavePrompt}
          onClose={() => {
            setShowSavePrompt(false);
            onClose();
          }}
          onSave={async () => {
            await saveDraft();
            onClose();
          }}
        />
      </div>

      {/* Delete confirmation modal */}
      <ConfirmDeleteModal
        isOpen={showDeleteConfirm}
        productName={planName || "this rate plan"}
        onConfirm={() => {
          setShowDeleteConfirm(false);
          onClose();
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
});

export default React.memo(CreatePricePlan);
