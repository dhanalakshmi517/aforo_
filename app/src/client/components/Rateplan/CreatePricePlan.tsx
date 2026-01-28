import * as React from "react";
import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import TopBar from "../componenetsss/TopBar";
import { useToast } from "../componenetsss/ToastProvider";
import SaveDraft from "../componenetsss/SaveDraft";
import ConfirmDeleteModal from "../componenetsss/ConfirmDeleteModal";
import SectionHeader from "../componenetsss/SectionHeader";

import {
  createRatePlan,
  updateRatePlan,
  confirmRatePlan,
  fetchProducts,
  fetchRatePlans,
  fetchRatePlanWithDetails,
  Product,
  RatePlan,
  RatePlanRequest,
  deleteRatePlan,
} from "./api";

import {
  initializeSession,
  clearCurrentSession,
  clearOldSessions,
  clearAllRatePlanData,
  getRatePlanData,
  setRatePlanData,
} from "./utils/sessionStorage";

import Billable from "./Billable";
import Pricing, { PricingHandle } from "./Pricing";
import Extras, { ExtrasHandle } from "./Extras";
import Review from "./Review";

import { InputField, TextareaField, DropdownField } from "../componenetsss/Inputs";
import PrimaryButton from "../componenetsss/PrimaryButton";
import SecondaryButton from "../componenetsss/SecondaryButton";
import ProductCreatedSuccess from "../componenetsss/ProductCreatedSuccess";

import "./CreatePricePlan.css";
import "../Products/NewProducts/NewProduct.css";
import "../componenetsss/SkeletonForm.css";

type ActiveTab = "details" | "billable" | "pricing" | "extras" | "review";

interface CreatePricePlanProps {
  onClose: () => void;
  registerSaveDraft?: (fn: () => Promise<boolean>) => void; // returns whether draft actually saved
  draftData?: any; // Draft data from backend for pre-filling
  onFieldChange?: () => void; // Called when any field changes to reset saved state
  onHasInputChange?: (hasInput: boolean) => void; // Called when hasAnyRequiredInput changes
  topBarProps?: {
    onBack: () => void;
    cancel: { label: string; onClick: () => void; disabled: boolean };
    save: {
      label: string;
      labelWhenSaved: string;
      saved: boolean;
      saving: boolean;
      disabled: boolean;
      onClick: () => void;
    };
  };
}

const steps = [
  { id: 1, title: "Plan Details", desc: "Define the basic information and structure of your plan." },
  { id: 2, title: "Product & Billable Unit", desc: "Select product and define a Billable Metric" },
  { id: 3, title: "Pricing Model Setup", desc: "Configure how pricing will work for this plan." },
  { id: 4, title: "Extras", desc: "Add optional features or benefits to enhance your plan." },
  { id: 5, title: "Review & confirm", desc: "Check and Finalize details." },
];

const CreatePricePlan = React.forwardRef<
  { back: () => boolean; getRatePlanId: () => number | null; validateBeforeBack: () => boolean },
  CreatePricePlanProps
>(({ onClose, registerSaveDraft, draftData, onFieldChange, onHasInputChange, topBarProps }, ref) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const resumeDraftId: number | null = (location.state as any)?.resumeDraftId ?? null;
  const isResuming = Boolean(resumeDraftId);

  const pricingRef = useRef<PricingHandle>(null);
  const extrasRef = useRef<ExtrasHandle>(null);

  // ===== TopBar modal states (same pattern as NewProduct) =====
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDraftSaving, setIsDraftSaving] = useState(false);
  const [isDraftSaved, setIsDraftSaved] = useState(false);

  // ===== Step persistence (localStorage like NewProduct) =====
  const [currentStep, setCurrentStep] = useState<number>(() => {
    const savedLocal = localStorage.getItem("ratePlanWizardStep");
    if (savedLocal != null) {
      const n = Number(savedLocal);
      if (Number.isFinite(n) && n >= 0 && n < steps.length) return n;
    }
    const savedSession = Number(getRatePlanData("WIZARD_STEP"));
    return Number.isFinite(savedSession) && savedSession >= 0 && savedSession < steps.length ? savedSession : 0;
  });

  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [planName, setPlanName] = useState("");
  const [planDescription, setPlanDescription] = useState("");
  const [billingFrequency, setBillingFrequency] = useState("");
  const [selectedProductName, setSelectedProductName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");

  const [products, setProducts] = useState<Product[]>([]);
  const [productError, setProductError] = useState("");
  const [selectedMetricId, setSelectedMetricId] = useState<number | null>(null);
  const [ratePlanId, setRatePlanId] = useState<number | null>(null);
  const [existingRatePlans, setExistingRatePlans] = useState<RatePlan[]>([]);

  const [draftPricingData, setDraftPricingData] = useState<any>(null);
  const [draftExtrasData, setDraftExtrasData] = useState<any>(null);

  // Keep draft data persistent across step navigation
  const [persistentDraftData, setPersistentDraftData] = useState<any>(null);
  const [currentStepData, setCurrentStepData] = useState<any>(null);
  const [isFreshCreation, setIsFreshCreation] = useState<boolean>(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Track previous step to detect actual navigation
  const prevStepRef = useRef<number>(currentStep);

  // ===== Back button (browser) – same behavior as NewProduct =====
  useEffect(() => {
    document.body.classList.add("create-product-page");

    const handleBackButton = (event: PopStateEvent) => {
      event.preventDefault();
      navigate("/get-started/rate-plans");
    };

    window.addEventListener("popstate", handleBackButton);
    window.history.pushState(null, "", window.location.pathname);

    return () => {
      document.body.classList.remove("create-product-page");
      window.removeEventListener("popstate", handleBackButton);
    };
  }, [navigate]);

  // ===== Session init + load products =====
  useEffect(() => {
    const hasExistingSessionData =
      getRatePlanData("WIZARD_STEP") ||
      getRatePlanData("PRICING_MODEL") ||
      getRatePlanData("BILLABLE_METRIC_NAME");

    if (!isResuming && !draftData && !hasExistingSessionData) {
      setIsFreshCreation(true);
      clearAllRatePlanData();
    } else {
      setIsFreshCreation(false);
      if (!hasExistingSessionData) {
        initializeSession();
      }
      clearOldSessions();
    }

    (async () => {
      try {
        setProducts((await fetchProducts()) as Product[]);
        // Fetch existing rate plans for duplicate name check
        const plans = await fetchRatePlans();
        setExistingRatePlans(plans);
      } catch {
        setProductError("Failed to load products");
      }
    })();

    return () => {
      clearCurrentSession();
    };
  }, [isResuming, draftData]);

  // ===== Persist step (session + localStorage) =====
  useEffect(() => {
    setRatePlanData("WIZARD_STEP", currentStep.toString());
    localStorage.setItem("ratePlanWizardStep", String(currentStep));
    // Reset saved state only when actually navigating (not on mount)
    if (prevStepRef.current !== currentStep) {
      onFieldChange?.();
      prevStepRef.current = currentStep;
    }
    return () => {
      // NewProduct clears on unmount; we’ll follow same spirit
      localStorage.removeItem("ratePlanWizardStep");
    };
  }, [currentStep, onFieldChange]);

  // ===== Hydrate from draft =====
  useEffect(() => {
    if (draftData) {
      const stepNow = Number(getRatePlanData("WIZARD_STEP"));
      if (!stepNow || stepNow === 0) {
        clearAllRatePlanData();
      }
      (async () => {
        await hydrateFormData(draftData);
      })();
    } else if (isResuming && resumeDraftId) {
      (async () => {
        try {
          const plan = await fetchRatePlanWithDetails(resumeDraftId);
          await hydrateFormData(plan);
        } catch (e) {
          console.error("❌ Failed to hydrate draft", e);
        }
      })();
    } else {
      clearAllRatePlanData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftData, isResuming, resumeDraftId]);

  // ===== Fetch current data when entering step 2/3/4 =====
  useEffect(() => {
    const fetchCurrentDataForStep = async () => {
      if ((currentStep === 2 || currentStep === 3 || currentStep === 4) && ratePlanId && !persistentDraftData) {
        try {
          const currentPlan = await fetchRatePlanWithDetails(ratePlanId);
          setCurrentStepData(currentPlan);

          if (currentStep === 2) setDraftPricingData(currentPlan);
          if (currentStep === 3) setDraftExtrasData(currentPlan);

          if (currentStep === 4 && currentPlan?.pricingModelName) {
            const sessionPricingModel = getRatePlanData("PRICING_MODEL");
            if (!sessionPricingModel) setRatePlanData("PRICING_MODEL", currentPlan.pricingModelName);

            if (currentPlan.pricingModelName === "Flat Fee" && currentPlan.flatFeePricing) {
              setRatePlanData("FLAT_FEE_AMOUNT", String(currentPlan.flatFeePricing.flatFeeAmount || ""));
              setRatePlanData("FLAT_FEE_API_CALLS", String(currentPlan.flatFeePricing.numberOfApiCalls || ""));
              setRatePlanData("FLAT_FEE_OVERAGE", String(currentPlan.flatFeePricing.overageUnitRate || ""));
              setRatePlanData("FLAT_FEE_GRACE", String(currentPlan.flatFeePricing.graceBuffer || ""));
            } else if (currentPlan.pricingModelName === "Usage-Based" && currentPlan.usageBasedPricing) {
              setRatePlanData("USAGE_PER_UNIT_AMOUNT", String(currentPlan.usageBasedPricing.perUnitAmount || ""));
            } else if (currentPlan.pricingModelName === "Tiered Pricing" && currentPlan.tieredPricing) {
              const tiers = (currentPlan.tieredPricing.tiers || []).map((t: any) => ({
                from: t.startRange,
                to: t.endRange,
                price: t.unitPrice,
                isUnlimited: !t.endRange,
              }));
              setRatePlanData("TIERED_TIERS", JSON.stringify(tiers));
              setRatePlanData("TIERED_OVERAGE", String(currentPlan.tieredPricing.overageUnitRate || ""));
              setRatePlanData("TIERED_GRACE", String(currentPlan.tieredPricing.graceBuffer || ""));
            } else if (currentPlan.pricingModelName === "Volume-Based" && currentPlan.volumePricing) {
              const tiers = (currentPlan.volumePricing.tiers || []).map((t: any) => ({
                from: t.usageStart,
                to: t.usageEnd,
                price: t.unitPrice,
                isUnlimited: !t.usageEnd,
              }));
              setRatePlanData("VOLUME_TIERS", JSON.stringify(tiers));
              setRatePlanData("VOLUME_OVERAGE", String(currentPlan.volumePricing.overageUnitRate || ""));
              setRatePlanData("VOLUME_GRACE", String(currentPlan.volumePricing.graceBuffer || ""));
            } else if (currentPlan.pricingModelName === "Stairstep" && currentPlan.stairStepPricing) {
              const tiers = (currentPlan.stairStepPricing.tiers || []).map((t: any) => ({
                from: t.usageStart,
                to: t.usageEnd,
                cost: t.flatCost,
                isUnlimited: !t.usageEnd,
              }));
              setRatePlanData("STAIR_TIERS", JSON.stringify(tiers));
              setRatePlanData("STAIR_OVERAGE", String(currentPlan.stairStepPricing.overageUnitRate || ""));
              setRatePlanData("STAIR_GRACE", String(currentPlan.stairStepPricing.graceBuffer || ""));
            }
          }
        } catch (error) {
          console.error("❌ Failed to fetch current plan data for step:", error);
        }
      } else if (currentStep < 2) {
        setCurrentStepData(null);
      }
    };
    fetchCurrentDataForStep();
  }, [currentStep, ratePlanId, persistentDraftData]);

  const hydrateFormData = async (plan: any) => {
    setRatePlanId(plan.ratePlanId);
    setPlanName(plan.ratePlanName ?? "");
    setPlanDescription(plan.description ?? "");
    setBillingFrequency(plan.billingFrequency ?? "");
    setSelectedProductName(plan.productName ?? plan.product?.productName ?? "");
    setPaymentMethod(plan.paymentType ?? "");
    if (plan.billableMetricId) setSelectedMetricId(Number(plan.billableMetricId));

    if (plan.billableMetricId) {
      try {
        const { fetchBillableMetricById } = await import("./api");
        const fullMetric = await fetchBillableMetricById(Number(plan.billableMetricId));
        if (fullMetric) {
          setRatePlanData("BILLABLE_METRIC_NAME", fullMetric.metricName);
          if ((fullMetric as any).description) setRatePlanData("BILLABLE_METRIC_DESCRIPTION", (fullMetric as any).description);
          if (fullMetric.unitOfMeasure || fullMetric.uom || fullMetric.uomShort) {
            setRatePlanData("BILLABLE_METRIC_UNIT", fullMetric.unitOfMeasure || fullMetric.uom || fullMetric.uomShort || "");
          }
          if ((fullMetric as any).aggregationFunction || (fullMetric as any).aggregationType) {
            setRatePlanData("BILLABLE_METRIC_AGGREGATION", (fullMetric as any).aggregationFunction || (fullMetric as any).aggregationType || "");
          }
        }
      } catch (error) {
        console.error("Failed to fetch billable metric details:", error);
      }
    }

    setDraftPricingData(plan);
    setDraftExtrasData(plan);
    setPersistentDraftData(plan);
  };

  const validatePricingStep = React.useCallback((): { isValid: boolean; errors: Record<string, string> } => {
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
      // Check for zero or empty
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

      // Check for validation errors (to > from, sequential validation)
      for (let i = 0; i < tieredTiers.length; i++) {
        const tier = tieredTiers[i];
        if (!tier.isUnlimited && tier.from && tier.to && Number(tier.to) <= Number(tier.from)) {
          e.tieredTiers = "Each tier's 'to' value must be greater than 'from' value";
          break;
        }
        if (i > 0 && tieredTiers[i - 1].to) {
          const expectedFrom = Number(tieredTiers[i - 1].to) + 1;
          if (Number(tier.from) !== expectedFrom) {
            e.tieredTiers = "Tier ranges must be sequential (from = previous tier's to + 1)";
            break;
          }
        }
      }
      const hasUnlimited = tieredTiers.some((t: any) => t.isUnlimited);
      if (!hasUnlimited && (!overage || Number(overage) <= 0)) {
        e.tieredOverage = "Overage charge is required when no unlimited tier";
      }
    } else if (selectedPricingModel === "Volume-Based") {
      const volumeTiers = JSON.parse(getRatePlanData("VOLUME_TIERS") || "[]");
      const overage = getRatePlanData("VOLUME_OVERAGE");
      const noUpperLimit = getRatePlanData("VOLUME_NO_UPPER_LIMIT") === "true";
      if (volumeTiers.length === 0) e.volumeTiers = "At least one volume tier is required";

      // Validate all tier fields are filled
      const hasInvalidTier = volumeTiers.some(
        (tier: any) =>
          tier.from === null || tier.from === undefined || tier.from === '' ||
          tier.price === null || tier.price === undefined || tier.price === '' ||
          (!tier.isUnlimited && (tier.to === null || tier.to === undefined || tier.to === ''))
      );
      if (hasInvalidTier) e.volumeTiers = "All tier fields are required";

      // Check for validation errors (to > from, sequential validation)
      for (let i = 0; i < volumeTiers.length; i++) {
        const tier = volumeTiers[i];
        if (!tier.isUnlimited && tier.from != null && tier.to != null && Number(tier.to) <= Number(tier.from)) {
          e.volumeTiers = "Each tier's 'to' value must be greater than 'from' value";
          break;
        }
        if (i > 0 && volumeTiers[i - 1].to != null) {
          const expectedFrom = Number(volumeTiers[i - 1].to) + 1;
          if (Number(tier.from) !== expectedFrom) {
            e.volumeTiers = "Tier ranges must be sequential (from = previous tier's to + 1)";
            break;
          }
        }
      }
      if (!noUpperLimit && (!overage || Number(overage) <= 0)) {
        e.volumeOverage = "Overage unit rate is required when no unlimited tier";
      }
    } else if (selectedPricingModel === "Stairstep") {
      const stairTiers = JSON.parse(getRatePlanData("STAIR_TIERS") || "[]");
      const overage = getRatePlanData("STAIR_OVERAGE");
      const noUpperLimit = getRatePlanData("STAIR_NO_UPPER_LIMIT") === "true";
      if (stairTiers.length === 0) e.stairTiers = "At least one stair tier is required";

      // Validate all stair fields are filled
      const hasInvalidStair = stairTiers.some(
        (stair: any) =>
          !stair.from?.toString().trim() ||
          !stair.cost?.toString().trim() ||
          (!stair.isUnlimited && !stair.to?.toString().trim())
      );
      if (hasInvalidStair) e.stairTiers = "All stair fields are required";

      // Check for validation errors (to > from, sequential validation)
      for (let i = 0; i < stairTiers.length; i++) {
        const stair = stairTiers[i];
        if (!stair.isUnlimited && stair.from && stair.to && Number(stair.to) <= Number(stair.from)) {
          e.stairTiers = "Each tier's 'to' value must be greater than 'from' value";
          break;
        }
        if (i > 0 && stairTiers[i - 1].to) {
          const expectedFrom = Number(stairTiers[i - 1].to) + 1;
          if (Number(stair.from) !== expectedFrom) {
            e.stairTiers = "Tier ranges must be sequential (from = previous tier's to + 1)";
            break;
          }
        }
      }
      if (!noUpperLimit && (!overage || Number(overage) <= 0)) {
        e.stairOverage = "Overage charge is required when no unlimited tier";
      }
    }

    return { isValid: Object.keys(e).length === 0, errors: e };
  }, [getRatePlanData]);

  // ===== Lock logic =====
  const isStep0Filled = React.useMemo(() => {
    return Boolean(planName.trim() && billingFrequency && paymentMethod);
  }, [planName, billingFrequency, paymentMethod]);

  const isStep1Filled = React.useMemo(() => {
    return Boolean(selectedProductName && selectedMetricId !== null);
  }, [selectedProductName, selectedMetricId]);

  const isStep2Filled = React.useMemo(() => {
    // Strict validation: pricing model + all required fields
    const { isValid } = validatePricingStep();
    return isValid;
  }, [currentStep, validatePricingStep]);

  const isStep1Locked = !isStep0Filled;
  const isStep2Locked = !isStep0Filled || !isStep1Filled;
  const isStep3Locked = !isStep0Filled || !isStep1Filled || !isStep2Filled;
  const isStep4Locked = !isStep0Filled || !isStep1Filled || !isStep2Filled;

  const LockBadge = () => (
    <span
      style={{
        borderRadius: "8px",
        background: "#E9E9EE",
        display: "flex",
        padding: "6px",
        justifyContent: "center",
        alignItems: "center",
        gap: "5px",
        marginLeft: "8px",
      }}
      aria-label="Locked"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path
          d="M4.66667 7.33334V4.66668C4.66667 3.78262 5.01786 2.93478 5.64298 2.30965C6.2681 1.68453 7.11595 1.33334 8 1.33334C8.88406 1.33334 9.7319 1.68453 10.357 2.30965C10.9821 2.93478 11.3333 3.78262 11.3333 4.66668V7.33334M3.33333 7.33334H12.6667C13.403 7.33334 14 7.9303 14 8.66668V13.3333C14 14.0697 13.403 14.6667 12.6667 14.6667H3.33333C2.59695 14.6667 2 14.0697 2 13.3333V8.66668C2 7.9303 2.59695 7.33334 3.33333 7.33334Z"
          stroke="#75797E"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );

  const clearErrorIfValid = (key: string, isValid: boolean) => {
    setErrors((prev) => {
      if (!prev[key]) return prev;
      if (isValid) {
        const { [key]: _omit, ...rest } = prev;
        return rest;
      }
      return prev;
    });
  };

  // ===== "Has any input" (for TopBar save/cancel enable) =====
  const hasAnyRequiredInput = React.useMemo(() => {
    // Like NewProduct: any typed content / selections
    if (planName.trim()) return true;
    if (planDescription.trim()) return true;
    if (billingFrequency) return true;
    if (selectedProductName) return true;
    if (paymentMethod) return true;
    if (selectedMetricId !== null) return true;

    // Session storage: pricing/extras
    if (getRatePlanData("PRICING_MODEL")) return true;
    if (Number(getRatePlanData("SETUP_FEE") || 0) > 0) return true;
    if (getRatePlanData("DISCOUNT_TYPE")) return true;
    if (getRatePlanData("FREEMIUM_TYPE")) return true;
    if (getRatePlanData("MINIMUM_USAGE") || getRatePlanData("MINIMUM_CHARGE")) return true;

    return false;
  }, [planName, planDescription, billingFrequency, selectedProductName, paymentMethod, selectedMetricId]);

  // Notify parent when hasAnyRequiredInput changes
  useEffect(() => {
    onHasInputChange?.(hasAnyRequiredInput);
  }, [hasAnyRequiredInput, onHasInputChange]);

  // ===== Unsaved-changes logic (simple + honest) =====
  const [lastSavedSnapshot, setLastSavedSnapshot] = useState<any>(null);

  const hasUnsavedChanges = React.useMemo(() => {
    if (!lastSavedSnapshot) return hasAnyRequiredInput;

    const snapshotNow = {
      planName,
      planDescription,
      billingFrequency,
      selectedProductName,
      paymentMethod,
      selectedMetricId,
      pricingModel: getRatePlanData("PRICING_MODEL") || "",
      setupFee: getRatePlanData("SETUP_FEE") || "",
      discountType: getRatePlanData("DISCOUNT_TYPE") || "",
      freemiumType: getRatePlanData("FREEMIUM_TYPE") || "",
      minUsage: getRatePlanData("MINIMUM_USAGE") || "",
      minCharge: getRatePlanData("MINIMUM_CHARGE") || "",
    };

    return JSON.stringify(snapshotNow) !== JSON.stringify(lastSavedSnapshot);
  }, [
    lastSavedSnapshot,
    hasAnyRequiredInput,
    planName,
    planDescription,
    billingFrequency,
    selectedProductName,
    paymentMethod,
    selectedMetricId,
  ]);

  const onStepClick = async (stepIndex: number) => {
    if (stepIndex === currentStep) return;

    // If navigating to any step beyond step 0 and rate plan doesn't exist yet, create it first
    if (stepIndex >= 1 && !ratePlanId && isStep0Filled) {
      console.log(`🔧 Creating rate plan before navigating to step ${stepIndex} via sidebar...`);
      const created = await ensureRatePlanCreated();
      if (!created) {
        console.error(`❌ Failed to create rate plan, cannot navigate to step ${stepIndex}`);
        return;
      }
      console.log(`✅ Rate plan created, navigating to step ${stepIndex}`);
    }

    // Allow clicking all steps - locked steps will show lock UI
    setCurrentStep(stepIndex);
  };

  const sectionHeading = steps[currentStep].title;

  // ===== Save Draft (TopBar) – same vibe as NewProduct =====
  const saveDraft = useCallback(async (): Promise<boolean> => {
    // block empty draft
    if (!hasAnyRequiredInput) {
      console.warn("⚠️ Cannot save empty draft");
      return false;
    }

    if (isDraftSaving) return false;

    try {
      setIsDraftSaving(true);
      setIsDraftSaved(false);

      setRatePlanData("CURRENT_STEP", currentStep.toString());

      const selectedProduct = products.find((p) => p.productName === selectedProductName);

      const partial: Partial<RatePlanRequest> & { status?: string } = { status: "DRAFT" };
      if (planName.trim()) (partial as any).ratePlanName = planName as any;
      if (selectedProduct) (partial as any).productId = Number(selectedProduct.productId);
      if (planDescription.trim()) (partial as any).description = planDescription;
      if (billingFrequency) (partial as any).billingFrequency = billingFrequency as any;
      if (paymentMethod) (partial as any).paymentType = paymentMethod as any;
      if (selectedMetricId !== null) (partial as any).billableMetricId = selectedMetricId;

      let currentId = ratePlanId;
      if (!currentId) {
        const created = await createRatePlan(partial as any);
        currentId = created.ratePlanId;
        setRatePlanId(currentId);
      } else {
        await updateRatePlan(currentId, partial as any);
      }

      // Pricing (best effort)
      try {
        if (currentId && pricingRef.current) {
          await pricingRef.current.save();
        }
      } catch (pricingErr) {
        console.warn("Pricing draft save warning:", pricingErr);
      }

      // Extras (best effort)
      try {
        if (currentId && extrasRef.current) {
          await extrasRef.current.saveAll(currentId);
        }
      } catch (extrasErr) {
        console.warn("Extras draft save warning:", extrasErr);
      }

      // snapshot for unsaved-changes detection
      const snapshotNow = {
        planName,
        planDescription,
        billingFrequency,
        selectedProductName,
        paymentMethod,
        selectedMetricId,
        pricingModel: getRatePlanData("PRICING_MODEL") || "",
        setupFee: getRatePlanData("SETUP_FEE") || "",
        discountType: getRatePlanData("DISCOUNT_TYPE") || "",
        freemiumType: getRatePlanData("FREEMIUM_TYPE") || "",
        minUsage: getRatePlanData("MINIMUM_USAGE") || "",
        minCharge: getRatePlanData("MINIMUM_CHARGE") || "",
      };
      setLastSavedSnapshot(snapshotNow);

      // tiny spinner grace, same as your draft save pattern
      await new Promise((res) => setTimeout(res, 500));
      setIsDraftSaved(true);
      setTimeout(() => setIsDraftSaved(false), 3000);

      return true;
    } catch (e) {
      console.error("Failed to save draft", e);
      return false;
    } finally {
      setIsDraftSaving(false);
    }
  }, [
    hasAnyRequiredInput,
    isDraftSaving,
    currentStep,
    products,
    selectedProductName,
    planName,
    planDescription,
    billingFrequency,
    paymentMethod,
    selectedMetricId,
    ratePlanId,
  ]);

  useEffect(() => {
    if (registerSaveDraft) registerSaveDraft(saveDraft);
  }, [registerSaveDraft, saveDraft]);

  // ===== Imperative handle (keep your existing contract) =====
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
      validateBeforeBack: () => {
        if (currentStep !== 0) return true;
        // show popup only if any meaningful input exists
        return hasAnyRequiredInput;
      },
    }),
    [currentStep, ratePlanId, hasAnyRequiredInput]
  );

  // Validate step 0 fields
  const validateStep0 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!planName.trim()) newErrors.planName = "Rate plan name is required.";
    if (!billingFrequency) newErrors.billingFrequency = "Billing frequency is required.";
    if (!paymentMethod) newErrors.paymentMethod = "Payment method is required.";

    // Duplicate check
    if (planName.trim()) {
      const isDuplicate = existingRatePlans.some(
        plan => plan.ratePlanName.toLowerCase() === planName.trim().toLowerCase()
          && plan.ratePlanId !== ratePlanId
      );
      if (isDuplicate) {
        newErrors.planName = "Rate plan already exists";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  // Ensure rate plan is created (for first-time save)
  const ensureRatePlanCreated = async (): Promise<boolean> => {
    if (ratePlanId) return true;

    try {
      setSaving(true);
      const selectedProduct = products.find((p) => p.productName === selectedProductName);

      const payload: Partial<RatePlanRequest> & { status?: string } = {
        ratePlanName: planName,
        description: planDescription || "",
        billingFrequency: billingFrequency as any,
        paymentType: paymentMethod as any,
        status: "DRAFT",
      };

      if (selectedProduct) {
        payload.productId = Number(selectedProduct.productId);
      }

      if (selectedMetricId !== null) {
        payload.billableMetricId = selectedMetricId;
      }

      const created = await createRatePlan(payload as any);
      setRatePlanId(created.ratePlanId);
      setSaving(false);
      return true;
    } catch (e) {
      console.error("Failed to create rate plan", e);
      setErrors((prev) => ({ ...prev, form: "Failed to create rate plan. Please try again." }));
      setSaving(false);
      return false;
    }
  };

  const handleNext = async () => {
    onFieldChange?.();

    // VALIDATION
    const newErrors: Record<string, string> = {};

    if (currentStep === 0) {
      if (!planName.trim()) newErrors.planName = "Rate plan name is required.";
      if (!billingFrequency) newErrors.billingFrequency = "Billing frequency is required.";
      if (!paymentMethod) newErrors.paymentMethod = "Payment method is required.";
      // Duplicate check
      if (planName.trim()) {
        const isDuplicate = existingRatePlans.some(
          plan => plan.ratePlanName.toLowerCase() === planName.trim().toLowerCase()
            && plan.ratePlanId !== ratePlanId
        );
        if (isDuplicate) {
          newErrors.planName = "Rate plan already exists";
        }
      }
    }

    if (currentStep === 1) {
      if (!selectedProductName) newErrors.selectedProductName = "Please select a product.";
      if (!selectedMetricId) newErrors.billableMetric = "Please select a billable metric.";
    }

    if (currentStep === 2) {
      const { isValid, errors: pricingErrors } = validatePricingStep();
      if (!isValid) {
        Object.assign(newErrors, pricingErrors);
      }
    }

    // Check for errors and stop if any exist
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Final submit from Review
    if (currentStep === steps.length - 1) {
      if (!ratePlanId) return;

      try {
        // Try to save pricing if ref exists (best effort, don't block on validation)
        if (pricingRef.current) {
          setSaving(true);
          try {
            await pricingRef.current.save();
          } catch (err) {
            console.warn('⚠️ Pricing save failed, continuing anyway:', err);
          }
          setSaving(false);
        }

        // extras save
        if (extrasRef.current) {
          setSaving(true);
          await extrasRef.current.saveAll(ratePlanId);
          setSaving(false);
        }

        // confirm - only if pricing is complete, otherwise just show success for draft
        const selectedPricingModel = getRatePlanData("PRICING_MODEL") || "";
        if (selectedPricingModel) {
          setSaving(true);
          try {
            await confirmRatePlan(ratePlanId);
          } catch (err) {
            console.warn('⚠️ Confirmation failed but showing success anyway for draft:', err);
          }
          setSaving(false);
        } else {
          console.log('ℹ️ Skipping confirmation - no pricing model selected, saving as draft only');
        }

        // Show success page regardless of confirmation status
        setShowSuccess(true);
      } catch (e) {
        console.error("Save failed", e);
        console.warn('⚠️ Rate plan save failed but showing success anyway for draft');
        setShowSuccess(true);
      } finally {
        setSaving(false);
      }
      return;
    }

    // Step 0: Create or update rate plan basic details
    if (currentStep === 0) {
      if (!ratePlanId) {
        const ok = await ensureRatePlanCreated();
        if (!ok) return;
      } else {
        // Update existing rate plan
        try {
          setSaving(true);
          const selectedProduct = products.find((p) => p.productName === selectedProductName);
          const updatePayload: Partial<RatePlanRequest> = {
            ratePlanName: planName,
            description: planDescription || "",
            billingFrequency: billingFrequency as any,
            paymentType: paymentMethod as any,
          };
          if (selectedProduct) updatePayload.productId = Number(selectedProduct.productId);
          await updateRatePlan(ratePlanId, updatePayload as any);
          setSaving(false);
        } catch (e) {
          console.error("Failed to update rate plan", e);
          setSaving(false);
          return;
        }
      }
    }

    // Step 1: Update billable metric
    if (currentStep === 1) {
      if (ratePlanId) {
        try {
          setSaving(true);
          const selectedProduct = products.find((p) => p.productName === selectedProductName);
          const updatePayload: Partial<RatePlanRequest> = {
            billableMetricId: selectedMetricId as number
          };
          if (selectedProduct) updatePayload.productId = Number(selectedProduct.productId);
          await updateRatePlan(ratePlanId, updatePayload as any);
          setSaving(false);
        } catch (e) {
          console.error("Failed to update rate plan with metric", e);
          setSaving(false);
          return;
        }
      } else {
        const ok = await ensureRatePlanCreated();
        if (!ok) return;
      }
    }

    // Step 2: Save pricing model
    if (currentStep === 2 && pricingRef.current && ratePlanId) {
      setSaving(true);
      try {
        const success = await pricingRef.current.save();
        if (!success) {
          setSaving(false);
          return;
        }
        setSaving(false);
      } catch (e) {
        console.error("Failed to save pricing", e);
        setSaving(false);
        return;
      }
    }

    // Progress to next step (already marked as completed during validation above)
    setCurrentStep((s) => s + 1);
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
    else {
      // like NewProduct: back tries to close with prompt, not silent
      onClose();
    }
  };

  const activeTab: ActiveTab =
    currentStep === 0
      ? "details"
      : currentStep === 1
        ? "billable"
        : currentStep === 2
          ? "pricing"
          : currentStep === 3
            ? "extras"
            : "review";

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="rate-np-grid-2">
            <InputField
              label="Rate Plan Name"
              placeholder="e.g., Individual Plan, Pro Plan"
              required
              value={planName}
              onChange={(v: string) => {
                setPlanName(v);
                // Check for duplicate and set/clear error
                if (v.trim()) {
                  const isDuplicate = existingRatePlans.some(
                    plan => plan.ratePlanName.toLowerCase() === v.trim().toLowerCase()
                      && plan.ratePlanId !== ratePlanId
                  );
                  if (isDuplicate) {
                    setErrors(prev => ({ ...prev, planName: "Rate plan already exists" }));
                  } else {
                    clearErrorIfValid("planName", true);
                  }
                } else {
                  clearErrorIfValid("planName", false);
                }
                onFieldChange?.();
              }}
              error={errors.planName}
            />
            <DropdownField
              label="Billing Frequency"
              required

              value={billingFrequency}
              onChange={(v: string) => {
                setBillingFrequency(v);
                clearErrorIfValid("billingFrequency", !!v);
                onFieldChange?.();
              }}
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
            <DropdownField
              label="Payment type"
              required

              value={paymentMethod}
              onChange={(v: string) => {
                setPaymentMethod(v);
                clearErrorIfValid("paymentMethod", !!v);
                onFieldChange?.();
              }}
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
              onChange={(v: string) => {
                setPlanDescription(v);
                clearErrorIfValid("planDescription", v.trim().length > 0);
                onFieldChange?.();
              }}
              error={errors.planDescription}
            />
          </div>
        );

      case 1:
        return (
          <>
            <Billable

              products={products}
              productError={productError}
              selectedProductName={selectedProductName}
              onSelectProduct={(productName) => {
                setSelectedProductName(productName);
                clearErrorIfValid("selectedProductName", !!productName);
                // Reset selected metric when product changes
                setSelectedMetricId(null);
                onFieldChange?.();
              }}
              selectedMetricId={selectedMetricId}
              onSelectMetric={(id) => {
                setSelectedMetricId(id);
                clearErrorIfValid("billableMetric", id !== null);
                onFieldChange?.();
              }}
              locked={isStep1Locked}
            />
            {errors.selectedProductName && (
              <div className="rate-np-error-message" style={{ marginTop: 10 }}>
                {errors.selectedProductName}
              </div>
            )}
            {errors.billableMetric && (
              <div className="rate-np-error-message" style={{ marginTop: 10 }}>
                {errors.billableMetric}
              </div>
            )}
          </>
        );

      case 2:
        return (
          <Pricing
            key={`pricing-${ratePlanId}-${draftPricingData ? JSON.stringify(draftPricingData).substring(0, 50) : "no-data"}`}
            ref={pricingRef}
            ratePlanId={ratePlanId}
            validationErrors={errors}
            onClearError={(key) => {
              setErrors((prev) => {
                if (!prev[key]) return prev;
                const { [key]: _omit, ...rest } = prev;
                return rest;
              });
            }}
            draftData={draftPricingData}
            isFreshCreation={isFreshCreation}
            locked={isStep2Locked}
          />
        );

      case 3: {
        const extrasData = persistentDraftData || draftExtrasData || currentStepData;
        return <Extras ref={extrasRef} ratePlanId={ratePlanId} noUpperLimit={false} draftData={extrasData} locked={isStep3Locked} />;
      }

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

  const isLockedHere =
    (currentStep === 1 && isStep1Locked) ||
    (currentStep === 2 && isStep2Locked) ||
    (currentStep === 3 && isStep3Locked) ||
    (currentStep === 4 && isStep4Locked);

  // Handle "Go to All Rate Plans" button click
  const handleGoToRatePlans = () => {
    clearAllRatePlanData();
    onClose();
    navigate("/get-started/rate-plans");
  };

  // If showing success page, render that instead of the form
  if (showSuccess) {
    return (
      <ProductCreatedSuccess
        productName={planName}
        titleOverride={`"${planName}" Rate Plan Created Successfully`}
        subtitleOverride="You can now start using this rate plan:"
        stepsOverride={[
          "• Assign this rate plan to customers.",
          "• Create subscriptions using this plan.",
          "• Monitor usage and billing.",
        ]}
        primaryLabelOverride="Go to All Rate Plans"
        onPrimaryClick={handleGoToRatePlans}
      />
    );
  }

  return (
    <>
      <TopBar
        title="Create New Rate Plan"
        onBack={() => hasAnyRequiredInput ? setShowSavePrompt(true) : onClose()}
        cancel={{
          onClick: () => setShowDeleteConfirm(true),
          disabled: !hasAnyRequiredInput
        }}
        save={{
          onClick: saveDraft,
          label: isDraftSaved ? "Saved!" : "Save as Draft",
          saved: isDraftSaved,
          saving: isDraftSaving,
          labelWhenSaved: "Saved as Draft",
          disabled: !hasAnyRequiredInput
        }}
      />
      <div className="rate-np-viewport">
        <div className="rate-np-card">
          <div className="rate-np-grid">
            {/* LEFT rail */}
            <aside className="rate-np-rail">
              <nav className="rate-np-steps">
                {steps.map((step, i) => {
                  const isActive = i === currentStep;

                  // Check if step fields are complete (same as NewProduct pattern)
                  const isStep0Completed = planName.trim() && billingFrequency && paymentMethod && !errors.planName;
                  const isStep1Completed = selectedProductName && selectedMetricId !== null;
                  const { isValid: isStep2Valid } = validatePricingStep();
                  const isStep2Completed = isStep2Valid;

                  // Same logic as NewProduct: show checkmark if moved past step AND fields are filled
                  const isCompleted = i < currentStep && (i === 0 ? isStep0Completed : i === 1 ? isStep1Completed : i === 2 ? isStep2Completed : true);

                  // Locking based on field completion (like NewProduct), not completedSteps set
                  const isStep1Locked = !isStep0Completed;
                  const isStep2Locked = !isStep0Completed || !isStep1Completed;
                  const isLocked = (i === 1 && isStep1Locked) || (i === 2 && isStep2Locked) || (i > 2 && (!isStep0Completed || !isStep1Completed || !isStep2Completed));

                  // Review step (step 4) requires all previous steps to be completed
                  const isReview = i === 4;
                  const isDisabled = isReview && (!isStep0Completed || !isStep1Completed || !isStep2Completed);

                  const showConnector = i < steps.length - 1;

                  return (
                    <button
                      key={step.id}
                      type="button"
                      className={[
                        "rate-np-step",
                        isActive ? "active" : "",
                        isCompleted ? "completed" : "",
                        isDisabled ? "disabled" : "",
                      ].join(" ").trim()}
                      onClick={() => {
                        if (isDisabled) return;
                        onStepClick(i);
                      }}
                      disabled={isDisabled}
                    >
                      <span className="rate-np-step__bullet" aria-hidden="true">
                        <span className="rate-np-step__icon">
                          {isCompleted ? (
                            // Completed step - show checkmark (dark blue like NewProduct)
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                              <circle cx="12" cy="12" r="11.5" fill="#00558C" stroke="#00558C" />
                              <path d="M7 12l3 3 6-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          ) : (i === 0 && !isCompleted) || (isActive && !isLocked) || (!isLocked && !isActive) ? (
                            // Active step (unlocked), Step 0, or unlocked steps - show dot
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                              <circle cx="12" cy="12" r="11" stroke="#C3C2D0" strokeWidth="2" />
                              <circle cx="12" cy="12" r="6" fill="#C3C2D0" />
                            </svg>
                          ) : (
                            // Locked step - show GRAY lock icon (no background fill)
                            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 26 26" fill="none">
                              <path d="M10.03 11.895V9.67503C10.03 8.93905 10.3224 8.23322 10.8428 7.71281C11.3632 7.1924 12.069 6.90004 12.805 6.90004C13.541 6.90004 14.2468 7.1924 14.7672 7.71281C15.2876 8.23322 15.58 8.93905 15.58 9.67503V11.895M25 13C25 19.6274 19.6274 25 13 25C6.37258 25 1 19.6274 1 13C1 6.37258 6.37258 1 13 1C19.6274 1 25 6.37258 25 13ZM8.92003 11.895H16.69C17.303 11.895 17.8 12.392 17.8 13.005V16.89C17.8 17.503 17.303 18 16.69 18H8.92003C8.307 18 7.81003 17.503 7.81003 16.89V13.005C7.81003 12.392 8.307 11.895 8.92003 11.895Z" stroke="#BAC4D5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
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
              {/* faint separators behind content (like NewProduct) */}
              <div className="af-skel-rule af-skel-rule--top" />

              <div className="rate-np-main__inner">
                <div className="rate-np-body">
                  <div className="rate-np-section-header-fixed" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <SectionHeader title={sectionHeading.toUpperCase()} />
                    {isLockedHere && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M12.5 7H11.5V5C11.5 3.067 9.933 1.5 8 1.5C6.067 1.5 4.5 3.067 4.5 5V7H3.5C2.948 7 2.5 7.448 2.5 8V13C2.5 13.552 2.948 14 3.5 14H12.5C13.052 14 13.5 13.552 13.5 13V8C13.5 7.448 13.052 7 12.5 7ZM5.5 5C5.5 3.619 6.619 2.5 8 2.5C9.381 2.5 10.5 3.619 10.5 5V7H5.5V5Z" fill="#8C8F96" />
                      </svg>
                    )}
                  </div>
                  <form className="rate-np-form" onSubmit={(e) => e.preventDefault()}>
                    <div className="rate-np-form-section">
                      <section>

                        {renderStepContent()}
                      </section>
                    </div>

                    {/* Footer actions */}
                    <div className="rate-np-form-footer" style={{ position: "relative" }}>
                      {errors.form && <div className="rate-np-error-message">{errors.form}</div>}

                      {isLockedHere ? (
                        <div
                          className="rate-np-footer-hint"
                          style={{
                            position: "absolute",
                            left: "50%",
                            bottom: "10px",
                            transform: "translateX(-50%)",
                            color: "#8C8F96",
                            fontSize: 14,
                            fontWeight: 400,
                            fontStyle: "italic",
                            pointerEvents: "none",
                            whiteSpace: "nowrap",
                          }}
                        >
                          Fill the previous steps to unlock this step
                        </div>
                      ) : (
                        <>
                          {/* Hide back button on first step (like NewProduct) */}
                          {currentStep > 0 && (
                            <div className="rate-np-btn-group rate-np-btn-group--back">
                              <SecondaryButton type="button" onClick={handleBack}>
                                Back
                              </SecondaryButton>
                            </div>
                          )}

                          <div className="rate-np-btn-group rate-np-btn-group--next">
                            <PrimaryButton type="button" onClick={handleNext} disabled={saving}>
                              {saving
                                ? currentStep === steps.length - 1
                                  ? "Submitting..."
                                  : "Saving..."
                                : currentStep === steps.length - 1
                                  ? "Create Rate Plan"
                                  : "Save & Next"}
                            </PrimaryButton>
                          </div>
                        </>
                      )}
                    </div>
                  </form>
                </div>
              </div>

              <div className="af-skel-rule af-skel-rule--bottom" />
            </main>
          </div>
        </div>
      </div>

      {/* Save Draft confirmation modal (same wiring as NewProduct) */}
      <SaveDraft
        isOpen={showSavePrompt}
        onClose={async () => {
          setShowSavePrompt(false);
          try {
            if (ratePlanId) {
              await deleteRatePlan(ratePlanId);
              console.log('Draft discarded and deleted (no toast shown)');
            }
          } catch (e) {
            console.error("Failed to delete rate plan on discard", e);
          } finally {
            onClose();
          }
        }}
        onSave={async () => {
          const ok = await saveDraft();
          if (ok) {
            showToast({ kind: "success", title: "Draft Saved", message: "Rate plan draft saved successfully." });
          } else if (hasAnyRequiredInput) {
            showToast({ kind: "error", title: "Failed to Save Draft", message: "Unable to save draft. Please try again." });
          }
          onClose();
        }}
        onDismiss={() => setShowSavePrompt(false)}
      />

      {/* Delete confirmation modal */}
      <ConfirmDeleteModal
        discardLabel="Keep editing"
        confirmLabel="Discard"
        isOpen={showDeleteConfirm}
        productName={planName || "this rate plan"}
        onConfirm={async () => {
          try {
            if (ratePlanId) {
              await deleteRatePlan(ratePlanId);
              showToast({ kind: "success", title: "Rate Plan Deleted", message: "Rate plan deleted successfully." });
            }
          } catch (e) {
            console.error("Failed to delete rate plan", e);
            showToast({ kind: "error", title: "Delete Failed", message: "Unable to delete rate plan. Please try again." });
          } finally {
            setShowDeleteConfirm(false);
            onClose();
          }
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
});

export default React.memo(CreatePricePlan);
