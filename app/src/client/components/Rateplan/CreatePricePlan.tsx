import * as React from "react";
import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import {
  createRatePlan,
  updateRatePlan,
  confirmRatePlan,
  fetchProducts,
  fetchRatePlanWithDetails,
  Product,
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

import { InputField, TextareaField, SelectField } from "../componenetsss/Inputs";
import PrimaryButton from "../componenetsss/PrimaryButton";
import SecondaryButton from "../componenetsss/SecondaryButton";

import "./CreatePricePlan.css";
import "../Products/NewProducts/NewProduct.css";

type ActiveTab = "details" | "billable" | "pricing" | "extras" | "review";

interface CreatePricePlanProps {
  onClose: () => void;
  registerSaveDraft?: (fn: () => Promise<boolean>) => void; // returns whether draft actually saved
  draftData?: any; // Draft data from backend for pre-filling
  onFieldChange?: () => void; // Called when any field changes to reset saved state
}

const steps = [
  { id: 1, title: "Plan Details", desc: "Define the basic information and structure of your plan." },
  { id: 2, title: "Select Billable Metric", desc: "Select or define a Billable Metric" },
  { id: 3, title: "Pricing Model Setup", desc: "Configure how pricing will work for this plan." },
  { id: 4, title: "Extras", desc: "Add optional features or benefits to enhance your plan." },
  { id: 5, title: "Review & confirm", desc: "Check and Finalize details." },
];

const CreatePricePlan = React.forwardRef<
  { back: () => boolean; getRatePlanId: () => number | null; validateBeforeBack: () => boolean },
  CreatePricePlanProps
>(({ onClose, registerSaveDraft, draftData, onFieldChange }, ref) => {
  const navigate = useNavigate();
  const location = useLocation();

  const resumeDraftId: number | null = (location.state as any)?.resumeDraftId ?? null;
  const isResuming = Boolean(resumeDraftId);

  const pricingRef = useRef<PricingHandle>(null);
  const extrasRef = useRef<ExtrasHandle>(null);

  const [currentStep, setCurrentStep] = useState<number>(() => {
    const saved = Number(getRatePlanData("WIZARD_STEP"));
    return Number.isFinite(saved) && saved >= 0 && saved < steps.length ? saved : 0;
  });

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

  const [draftPricingData, setDraftPricingData] = useState<any>(null);
  const [draftExtrasData, setDraftExtrasData] = useState<any>(null);

  // Keep draft data persistent across step navigation
  const [persistentDraftData, setPersistentDraftData] = useState<any>(null);
  const [currentStepData, setCurrentStepData] = useState<any>(null);
  const [isFreshCreation, setIsFreshCreation] = useState<boolean>(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Lock logic - similar to CreateCustomer
  const isStep0Filled = React.useMemo(() => {
    return Boolean(
      planName.trim() &&
      billingFrequency &&
      selectedProductName &&
      paymentMethod
    );
  }, [planName, billingFrequency, selectedProductName, paymentMethod]);

  const isStep1Filled = React.useMemo(() => {
    return selectedMetricId !== null;
  }, [selectedMetricId]);

  const isStep2Filled = React.useMemo(() => {
    const pricingModel = getRatePlanData('PRICING_MODEL');
    return Boolean(pricingModel);
  }, [currentStep]); // Re-evaluate when step changes

  // Determine if each step is locked
  const isStep1Locked = !isStep0Filled;
  const isStep2Locked = !isStep0Filled || !isStep1Filled;
  const isStep3Locked = !isStep0Filled || !isStep1Filled || !isStep2Filled;
  const isStep4Locked = !isStep0Filled || !isStep1Filled || !isStep2Filled;

  const LockBadge = () => (
    <span
      style={{
        borderRadius: '8px',
        background: '#E9E9EE',
        display: 'flex',
        padding: '6px',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '5px',
        marginLeft: '8px'
      }}
      aria-label="Locked"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M4.66667 7.33334V4.66668C4.66667 3.78262 5.01786 2.93478 5.64298 2.30965C6.2681 1.68453 7.11595 1.33334 8 1.33334C8.88406 1.33334 9.7319 1.68453 10.357 2.30965C10.9821 2.93478 11.3333 3.78262 11.3333 4.66668V7.33334M3.33333 7.33334H12.6667C13.403 7.33334 14 7.9303 14 8.66668V13.3333C14 14.0697 13.403 14.6667 12.6667 14.6667H3.33333C2.59695 14.6667 2 14.0697 2 13.3333V8.66668C2 7.9303 2.59695 7.33334 3.33333 7.33334Z" stroke="#75797E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );

  // helper: clear a single error key when value becomes valid
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

  // Check if any values have been changed from initial state
  const hasChanges = () => {
    return (
      planName.trim() !== '' ||
      planDescription.trim() !== '' ||
      billingFrequency !== '' ||
      selectedProductName !== '' ||
      paymentMethod !== ''
    );
  };

  useEffect(() => {
    document.body.classList.add("create-product-page");

    const hasExistingSessionData =
      getRatePlanData('WIZARD_STEP') ||
      getRatePlanData('PRICING_MODEL') ||
      getRatePlanData('BILLABLE_METRIC_NAME');

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
      } catch {
        setProductError("Failed to load products");
      }
    })();

    return () => {
      document.body.classList.remove("create-product-page");
      clearCurrentSession();
    };
  }, [isResuming, draftData]);

  useEffect(() => {
    setRatePlanData("WIZARD_STEP", currentStep.toString());
    localStorage.setItem("ratePlanWizardStep", String(currentStep));
    return () => {
      localStorage.removeItem("ratePlanWizardStep");
    };
  }, [currentStep]);

  useEffect(() => {
    if (draftData) {
      // Don't clear session storage when loading draft data for existing session
      // Only clear if this is a completely fresh draft load (not navigation within wizard)
      const currentStep = Number(getRatePlanData("WIZARD_STEP"));
      if (!currentStep || currentStep === 0) {
        clearAllRatePlanData();
      }
      hydrateFormData(draftData);
    } else if (isResuming && resumeDraftId) {
      (async () => {
        try {
          const plan = await fetchRatePlanWithDetails(resumeDraftId);
          hydrateFormData(plan);
        } catch (e) {
          console.error("❌ Failed to hydrate draft", e);
        }
      })();
    } else {
      clearAllRatePlanData();
    }
  }, [draftData, isResuming, resumeDraftId]);

  // Fetch current data when navigating to Pricing step (step 2), Extras step (step 3), or Review step (step 4)
  useEffect(() => {
    const fetchCurrentDataForStep = async () => {
      if ((currentStep === 2 || currentStep === 3 || currentStep === 4) && ratePlanId && !persistentDraftData) {
        try {
          console.log('🔄 Fetching current plan data for step:', currentStep);
          const currentPlan = await fetchRatePlanWithDetails(ratePlanId);
          console.log('📊 Fetched plan data:', currentPlan);
          setCurrentStepData(currentPlan);

          // Update pricing and extras data to ensure components receive fresh data
          if (currentStep === 2) {
            setDraftPricingData(currentPlan);
          }
          if (currentStep === 3) {
            setDraftExtrasData(currentPlan);
          }

          // ✅ For Review step (step 4), ensure ALL pricing data is in session storage
          if (currentStep === 4) {
            const sessionPricingModel = getRatePlanData('PRICING_MODEL');

            // Always populate pricing data from backend if we have it
            if (currentPlan?.pricingModelName) {
              console.log('📝 CreatePricePlan: Hydrating pricing data for Review:', currentPlan.pricingModelName);

              // Set pricing model
              if (!sessionPricingModel) {
                setRatePlanData('PRICING_MODEL', currentPlan.pricingModelName);
              }

              // Hydrate pricing data based on model type
              if (currentPlan.pricingModelName === 'Flat Fee' && currentPlan.flatFeePricing) {
                setRatePlanData('FLAT_FEE_AMOUNT', String(currentPlan.flatFeePricing.flatFeeAmount || ''));
                setRatePlanData('FLAT_FEE_API_CALLS', String(currentPlan.flatFeePricing.numberOfApiCalls || ''));
                setRatePlanData('FLAT_FEE_OVERAGE', String(currentPlan.flatFeePricing.overageUnitRate || ''));
                setRatePlanData('FLAT_FEE_GRACE', String(currentPlan.flatFeePricing.graceBuffer || ''));
              } else if (currentPlan.pricingModelName === 'Usage-Based' && currentPlan.usageBasedPricing) {
                setRatePlanData('USAGE_PER_UNIT_AMOUNT', String(currentPlan.usageBasedPricing.perUnitAmount || ''));
              } else if (currentPlan.pricingModelName === 'Tiered Pricing' && currentPlan.tieredPricing) {
                const tiers = (currentPlan.tieredPricing.tiers || []).map((t: any) => ({
                  from: t.startRange,
                  to: t.endRange,
                  price: t.unitPrice,
                  isUnlimited: !t.endRange
                }));
                setRatePlanData('TIERED_TIERS', JSON.stringify(tiers));
                setRatePlanData('TIERED_OVERAGE', String(currentPlan.tieredPricing.overageUnitRate || ''));
                setRatePlanData('TIERED_GRACE', String(currentPlan.tieredPricing.graceBuffer || ''));
              } else if (currentPlan.pricingModelName === 'Volume-Based' && currentPlan.volumePricing) {
                const tiers = (currentPlan.volumePricing.tiers || []).map((t: any) => ({
                  from: t.usageStart,
                  to: t.usageEnd,
                  price: t.unitPrice,
                  isUnlimited: !t.usageEnd
                }));
                setRatePlanData('VOLUME_TIERS', JSON.stringify(tiers));
                setRatePlanData('VOLUME_OVERAGE', String(currentPlan.volumePricing.overageUnitRate || ''));
                setRatePlanData('VOLUME_GRACE', String(currentPlan.volumePricing.graceBuffer || ''));
              } else if (currentPlan.pricingModelName === 'Stairstep' && currentPlan.stairStepPricing) {
                const tiers = (currentPlan.stairStepPricing.tiers || []).map((t: any) => ({
                  from: t.usageStart,
                  to: t.usageEnd,
                  cost: t.flatCost,
                  isUnlimited: !t.usageEnd
                }));
                setRatePlanData('STAIR_TIERS', JSON.stringify(tiers));
                setRatePlanData('STAIR_OVERAGE', String(currentPlan.stairStepPricing.overageUnitRate || ''));
                setRatePlanData('STAIR_GRACE', String(currentPlan.stairStepPricing.graceBuffer || ''));
              }

              console.log('✅ Pricing data hydrated for Review step');
            }
          }
        } catch (error) {
          console.error('❌ Failed to fetch current plan data for step:', error);
        }
      } else if (currentStep < 2) {
        setCurrentStepData(null);
      }
    };
    fetchCurrentDataForStep();
  }, [currentStep, ratePlanId, persistentDraftData]);

  const hydrateFormData = (plan: any) => {
    setRatePlanId(plan.ratePlanId);
    setPlanName(plan.ratePlanName ?? "");
    setPlanDescription(plan.description ?? "");
    setBillingFrequency(plan.billingFrequency ?? "");
    setSelectedProductName(plan.productName ?? plan.product?.productName ?? "");
    setPaymentMethod(plan.paymentType ?? "");
    if (plan.billableMetricId) setSelectedMetricId(Number(plan.billableMetricId));

    setDraftPricingData(plan);
    setDraftExtrasData(plan);
    setPersistentDraftData(plan);
  };

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
      // ✅ Only show popup if there are actual changes, not when fields are empty
      validateBeforeBack: () => {
        if (currentStep !== 0) return true;

        // If no changes have been made (all fields empty), don't show popup
        if (!hasChanges()) {
          return false;
        }

        return true;
      },
    }),
    [currentStep, ratePlanId, planName, planDescription, billingFrequency, selectedProductName, paymentMethod, hasChanges]
  );

  const sectionHeading = steps[currentStep].title;

  const validateStep0 = (): boolean => {
    const e: Record<string, string> = {};
    if (!planName.trim()) e.planName = "This is required field";
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
      const noUpperLimit = getRatePlanData("VOLUME_NO_UPPER_LIMIT") === "true";
      if (volumeTiers.length === 0) e.volumeTiers = "At least one volume tier is required";
      if (!noUpperLimit && (!overage || Number(overage) <= 0)) {
        e.volumeOverage = "Overage unit rate is required when no unlimited tier";
      }
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

  // Allow navigation to any step (no blocking), but steps may be locked
  const canNavigateTo = async (targetIndex: number): Promise<boolean> => {
    // Always allow backward navigation
    if (targetIndex <= currentStep) return true;

    // For forward navigation, create rate plan if needed (step 2+)
    if (targetIndex >= 2 && isStep0Filled && isStep1Filled) {
      const ok = await ensureRatePlanCreated();
      if (!ok) return false;
    }

    return true;
  };

  // Allow sidebar navigation without validation blocking
  const onStepClick = async (index: number) => {
    if (index === currentStep) return;

    // Allow navigation (creates plan if needed)
    const ok = await canNavigateTo(index);
    if (!ok) return;

    // Try to persist current step data (best effort, don't block navigation)
    try {
      if (currentStep === 2 && pricingRef.current && ratePlanId) {
        // Save pricing without validation blocking
        setSaving(true);
        await pricingRef.current.save();
        setSaving(false);
      } else if (currentStep === 3 && extrasRef.current && ratePlanId) {
        // Save extras
        setSaving(true);
        await extrasRef.current.saveAll(ratePlanId);
        setSaving(false);
      }
    } catch (e) {
      console.error("Sidebar navigation save failed:", e);
      setSaving(false);
      return; // stay put on failure
    }

    setCurrentStep(index);
  };

  // ===== Validation: Check if any meaningful data has been entered =====
  const hasAnyMeaningfulData = useCallback((): boolean => {
    // Check basic fields
    if (planName.trim()) return true;
    if (planDescription.trim()) return true;
    if (selectedProductName && products.find(p => p.productName === selectedProductName)) return true;
    if (billingFrequency) return true;
    if (paymentMethod) return true;
    if (selectedMetricId !== null) return true;

    // Check session storage for pricing data
    const pricingModel = getRatePlanData('PRICING_MODEL');
    if (pricingModel) return true;

    // Check session storage for extras data
    const setupFee = getRatePlanData('SETUP_FEE');
    if (setupFee && Number(setupFee) > 0) return true;

    const discountType = getRatePlanData('DISCOUNT_TYPE');
    if (discountType) return true;

    const freemiumType = getRatePlanData('FREEMIUM_TYPE');
    if (freemiumType) return true;

    const minUsage = getRatePlanData('MINIMUM_USAGE');
    const minCharge = getRatePlanData('MINIMUM_CHARGE');
    if (minUsage || minCharge) return true;

    return false;
  }, [planName, planDescription, selectedProductName, products, billingFrequency, paymentMethod, selectedMetricId]);

  // ===== Save-as-Draft: always try to persist pricing (best-effort) =====
  const saveDraft = useCallback(async (): Promise<boolean> => {
    // ✅ Validate: don't create empty drafts
    if (!hasAnyMeaningfulData()) {
      console.warn('⚠️ Cannot save empty draft - no data entered');
      return false; // Indicate save was blocked
    }

    setHasSavedAsDraft(true);
    setRatePlanData("CURRENT_STEP", currentStep.toString());

    try {
      setDraftSaving(true);
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

      // ✅ PRICING (best effort)
      try {
        if (currentId && pricingRef.current) {
          await pricingRef.current.save();
        } else if (currentId) {
          const savedModel = getRatePlanData('PRICING_MODEL');
          if (savedModel) {
            const { saveFlatFeePricing, saveUsageBasedPricing, saveTieredPricing, saveVolumePricing, saveStairStepPricing } = await import('./api');

            if (savedModel === 'Flat Fee') {
              const savedAmount = getRatePlanData('FLAT_FEE_AMOUNT');
              const savedCalls = getRatePlanData('FLAT_FEE_API_CALLS');
              const savedOverage = getRatePlanData('FLAT_FEE_OVERAGE');
              const savedGrace = getRatePlanData('FLAT_FEE_GRACE');

              if (savedAmount || savedCalls || savedOverage) {
                const payload = {
                  flatFeeAmount: Number(savedAmount) || 0,
                  numberOfApiCalls: Number(savedCalls) || 0,
                  overageUnitRate: Number(savedOverage) || 0,
                  graceBuffer: Number(savedGrace) || 0
                };
                await saveFlatFeePricing(currentId, payload);
              }
            } else if (savedModel === 'Usage-Based') {
              const savedPerUnit = getRatePlanData('USAGE_PER_UNIT_AMOUNT');
              if (savedPerUnit) {
                const payload = { perUnitAmount: Number(savedPerUnit) || 0 };
                await saveUsageBasedPricing(currentId, payload);
              }
            } else if (savedModel === 'Volume-Based') {
              const savedTiers = getRatePlanData('VOLUME_TIERS');
              const savedOverage = getRatePlanData('VOLUME_OVERAGE');
              const savedGrace = getRatePlanData('VOLUME_GRACE');

              if (savedTiers) {
                try {
                  const parsedTiers = JSON.parse(savedTiers);
                  const payload = {
                    tiers: parsedTiers.map((t: any) => ({
                      usageStart: t.from ?? 0,
                      usageEnd: t.isUnlimited || !t.to ? null : t.to,
                      unitPrice: t.price ?? 0
                    })),
                    overageUnitRate: Number(savedOverage) || 0,
                    graceBuffer: Number(savedGrace) || 0
                  };
                  await saveVolumePricing(currentId, payload);
                } catch (e) {
                  console.error('Failed to parse volume tiers for draft save:', e);
                }
              }
            } else if (savedModel === 'Tiered Pricing') {
              const savedTiers = getRatePlanData('TIERED_TIERS');
              const savedOverage = getRatePlanData('TIERED_OVERAGE');
              const savedGrace = getRatePlanData('TIERED_GRACE');

              if (savedTiers) {
                try {
                  const parsedTiers = JSON.parse(savedTiers);
                  const payload = {
                    tiers: parsedTiers.map((t: any) => ({
                      startRange: t.from ?? 0,
                      endRange: t.isUnlimited || !t.to ? null : t.to,
                      unitPrice: t.price ?? 0
                    })),
                    overageUnitRate: Number(savedOverage) || 0,
                    graceBuffer: Number(savedGrace) || 0
                  };
                  await saveTieredPricing(currentId, payload);
                } catch (e) {
                  console.error('Failed to parse tiered tiers for draft save:', e);
                }
              }
            } else if (savedModel === 'Stairstep') {
              const savedTiers = getRatePlanData('STAIR_TIERS');
              const savedOverage = getRatePlanData('STAIR_OVERAGE');
              const savedGrace = getRatePlanData('STAIR_GRACE');

              if (savedTiers) {
                try {
                  const parsedTiers = JSON.parse(savedTiers);
                  const payload = {
                    tiers: parsedTiers.map((t: any) => ({
                      usageStart: t.from ?? 0,
                      usageEnd: t.isUnlimited || !t.to ? null : t.to,
                      flatCost: t.cost ?? 0
                    })),
                    overageUnitRate: Number(savedOverage) || 0,
                    graceBuffer: Number(savedGrace) || 0
                  };
                  await saveStairStepPricing(currentId, payload);
                } catch (e) {
                  console.error('Failed to parse stair tiers for draft save:', e);
                }
              }
            }
          }
        }
      } catch (pricingErr) {
        console.warn("Pricing draft save warning:", pricingErr);
      }

      // ✅ EXTRAS (best effort)
      try {
        if (currentId && extrasRef.current) {
          await extrasRef.current.saveAll(currentId);
        } else if (currentId) {
          const {
            saveSetupFee,
            saveDiscounts,
            saveFreemiums,
            saveMinimumCommitment
          } = await import("./api");

          // Setup Fee
          const setupFee = Number(getRatePlanData("SETUP_FEE") || 0);
          const setupTiming = Number(getRatePlanData("SETUP_APPLICATION_TIMING") || 0);
          const setupDesc = getRatePlanData("SETUP_INVOICE_DESC") || "";
          if (setupFee > 0) {
            await saveSetupFee(currentId, {
              setupFee,
              applicationTiming: setupTiming,
              invoiceDescription: setupDesc,
            });
          }

          // Discounts
          const discountType = (getRatePlanData("DISCOUNT_TYPE") || "") as "PERCENTAGE" | "FLAT" | "";
          const percent = Number(getRatePlanData("DISCOUNT_PERCENT") || 0);
          const flat = Number(getRatePlanData("DISCOUNT_FLAT") || 0);
          const eligibility = getRatePlanData("ELIGIBILITY") || "";
          const dStart = getRatePlanData("DISCOUNT_START") || "";
          const dEnd = getRatePlanData("DISCOUNT_END") || "";
          const hasDiscount =
            (discountType === "PERCENTAGE" && percent > 0) ||
            (discountType === "FLAT" && flat > 0) ||
            !!eligibility || !!dStart || !!dEnd;

          if (hasDiscount) {
            await saveDiscounts(currentId, {
              discountType: discountType || (percent > 0 ? "PERCENTAGE" : "FLAT"),
              percentageDiscountStr: String(percent),
              flatDiscountAmountStr: String(flat),
              eligibility,
              startDate: dStart,
              endDate: dEnd,
              percentageDiscount: percent,
              flatDiscountAmount: flat,
            } as any);
          }

          // Freemium
          const uiFreeType = (getRatePlanData("FREEMIUM_TYPE") || "") as
            | "FREE_UNITS"
            | "FREE_TRIAL_DURATION"
            | "FREE_UNITS_PER_DURATION"
            | "";
          const freeUnits = Number(getRatePlanData("FREEMIUM_UNITS") || 0);
          const freeTrialDuration = Number(getRatePlanData("FREE_TRIAL_DURATION") || 0);
          const fStart = getRatePlanData("FREEMIUM_START") || "";
          const fEnd = getRatePlanData("FREEMIUM_END") || "";

          const mapUiToApi = (ui: string) =>
            ui === "FREE_TRIAL_DURATION" ? "FREE_TRIAL_DURATION"
              : ui === "FREE_UNITS_PER_DURATION" ? "FREE_UNITS_PER_DURATION"
                : ui === "UNITS_PER_DURATION" ? "FREE_UNITS_PER_DURATION"
                  : ui === "FREE_TRIAL" ? "FREE_TRIAL_DURATION"
                    : "FREE_UNITS";

          const apiFreeType = mapUiToApi(uiFreeType);
          if (freeUnits > 0 || freeTrialDuration > 0 || fStart || fEnd) {
            const fp: any = { freemiumType: apiFreeType, freeUnits: 0, freeTrialDuration: 0, startDate: fStart, endDate: fEnd };
            if (apiFreeType === "FREE_UNITS") fp.freeUnits = freeUnits;
            else if (apiFreeType === "FREE_TRIAL_DURATION") fp.freeTrialDuration = freeTrialDuration;
            else { fp.freeUnits = freeUnits; fp.freeTrialDuration = freeTrialDuration; }
            await saveFreemiums(currentId, fp);
          }

          // Minimum Commitment
          const minUsage = Number(getRatePlanData("MINIMUM_USAGE") || 0);
          const minCharge = Number(getRatePlanData("MINIMUM_CHARGE") || 0);
          if (minUsage > 0 || minCharge > 0) {
            await saveMinimumCommitment(currentId, {
              minimumUsage: minUsage,
              minimumCharge: minCharge,
            });
          }
        }
      } catch (extrasErr) {
        console.warn("Extras draft save warning:", extrasErr);
      }

      return true; // saved
    } catch (e) {
      console.error("Failed to save draft", e);
      return false;
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
    hasAnyMeaningfulData,
  ]);

  useEffect(() => {
    if (registerSaveDraft) registerSaveDraft(saveDraft);
  }, [registerSaveDraft, saveDraft]);

  const handleNext = async () => {
    // Final submit from Review: persist Pricing + Extras before confirming
    if (currentStep === steps.length - 1) {
      if (!ratePlanId) return;
      try {
        if (pricingRef.current) {
          const v = validatePricingStep();
          if (!v.isValid) {
            setErrors(v.errors);
            setCurrentStep(2);
            return;
          }
          setSaving(true);
          const ok = await pricingRef.current.save();
          setSaving(false);
          if (!ok) {
            setCurrentStep(2);
            return;
          }
        }
        if (extrasRef.current) {
          setSaving(true);
          await extrasRef.current.saveAll(ratePlanId);
          setSaving(false);
        }

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

  // Back from footer/back on step 0
  const handleBack = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
    else {
      validateStep0(); // surface inline errors if any
      onClose();
    }
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
                onChange={(v: string) => {
                  setPlanName(v);
                  clearErrorIfValid("planName", v.trim().length > 0);
                  onFieldChange?.();
                }}
                error={errors.planName}
              />
              <SelectField
                label="Billing Frequency"
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
              <SelectField
                label="Select Product"
                value={selectedProductName}
                onChange={(v: string) => {
                  setSelectedProductName(v);
                  clearErrorIfValid("selectedProductName", !!v);
                  onFieldChange?.();
                }}
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
          </>
        );
      case 1:
        return (
          <>
            <Billable
              productName={selectedProductName}
              selectedMetricId={selectedMetricId}
              onSelectMetric={(id) => {
                setSelectedMetricId(id);
                clearErrorIfValid("billableMetric", id !== null);
                onFieldChange?.();
              }}
              locked={isStep1Locked}
            />
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
            key={`pricing-${ratePlanId}-${draftPricingData ? JSON.stringify(draftPricingData).substring(0, 50) : 'no-data'}`}
            ref={pricingRef}
            ratePlanId={ratePlanId}
            validationErrors={errors}
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
                      className={["rate-np-step", isActive ? "active" : "", isCompleted ? "completed" : ""]
                        .join(" ")
                        .trim()}
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
                        <div className="rate-np-section-header" style={{ display: 'flex', alignItems: 'center' }}>
                          <h3 className="rate-np-section-title">{sectionHeading.toUpperCase()}</h3>
                          {((currentStep === 1 && isStep1Locked) ||
                            (currentStep === 2 && isStep2Locked) ||
                            (currentStep === 3 && isStep3Locked) ||
                            (currentStep === 4 && isStep4Locked)) && <LockBadge />}
                        </div>
                        {renderStepContent()}
                      </section>
                    </div>

                    {/* Footer actions */}
                    <div className="rate-np-form-footer" style={{ position: 'relative' }}>
                      {((currentStep === 1 && isStep1Locked) ||
                        (currentStep === 2 && isStep2Locked) ||
                        (currentStep === 3 && isStep3Locked) ||
                        (currentStep === 4 && isStep4Locked)) ? (
                        // Show hint when step is locked
                        <div
                          className="rate-np-footer-hint"
                          style={{
                            position: 'absolute',
                            left: '0',
                            bottom: '12px',
                            paddingLeft: '24px',
                            color: '#8C8F96',
                            fontSize: 14,
                            pointerEvents: 'none',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          Fill the previous steps to unlock this step
                        </div>
                      ) : (
                        // Show normal buttons when unlocked
                        <>
                          <div className="rate-np-btn-group rate-np-btn-group--back">
                            {currentStep > 0 && (
                              <SecondaryButton type="button" onClick={handleBack}>
                                Back
                              </SecondaryButton>
                            )}
                          </div>

                          <div className="rate-np-btn-group rate-np-btn-group--next">
                            <PrimaryButton
                              type="button"
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
        </div>
      </div>
    </>
  );
});

export default React.memo(CreatePricePlan);
