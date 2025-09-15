import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  createRatePlan, 
  updateRatePlan, 
  confirmRatePlan, 
  fetchProducts,
  Product,
  RatePlanRequest
} from './api';
import { initializeSession, clearCurrentSession, clearOldSessions, getRatePlanData, setRatePlanData } from './utils/sessionStorage';
import Billable from './Billable';
import Pricing, { PricingHandle } from './Pricing';
import Extras, { ExtrasHandle } from './Extras';
import Review from './Review';
import { InputField, TextareaField, SelectField } from "../Components/InputFields";
import './CreatePricePlan.css';

interface CreatePricePlanProps {
  onClose: () => void;
  registerSaveDraft?: (fn: () => Promise<void>) => void;
}

const steps = [
  { title: "Plan Details", desc: "Define the basic information and structure of your plan." },
  { title: "Select Billable Metric", desc: "Select or define a Billable Metric" },
  { title: "Pricing Model Setup", desc: "Configure how pricing will work for this plan." },
  { title: "Extras", desc: "Add optional features or benefits to enhance your plan." },
  { title: "Review & confirm", desc: "Check and Finalize details." },
];

const CreatePricePlan = React.forwardRef<{ back: () => boolean; getRatePlanId: () => number | null }, CreatePricePlanProps>(
  ({ onClose, registerSaveDraft }, ref) => {
    const navigate = useNavigate();
    const pricingRef = React.useRef<PricingHandle>(null);
    const extrasRef = React.useRef<ExtrasHandle>(null);

    const [planName, setPlanName] = useState("");
    const [planDescription, setPlanDescription] = useState("");
    const [billingFrequency, setBillingFrequency] = useState("");
    const [selectedProductName, setSelectedProductName] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("");

    const [products, setProducts] = useState<Product[]>([]);
    const [selectedMetricId, setSelectedMetricId] = useState<number | null>(null);
    const [ratePlanId, setRatePlanId] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);
    const [hasSavedAsDraft, setHasSavedAsDraft] = useState(false);
    const [draftSaving, setDraftSaving] = useState(false);
    const [productError, setProductError] = useState("");

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
      // Initialize new session for this rate plan creation
      initializeSession();
      clearOldSessions(); // Clean up old sessions
      
      const getProducts = async () => {
        try {
          setProducts((await fetchProducts()) as Product[]);
        } catch {
          setProductError("Failed to load products");
        }
      };
      getProducts();
      
      // Cleanup session when component unmounts
      return () => {
        clearCurrentSession();
      };
    }, []);

    const [currentStep, setCurrentStep] = useState<number>(() => {
      const saved = Number(getRatePlanData('WIZARD_STEP'));
      return Number.isFinite(saved) && saved >= 0 && saved < steps.length ? saved : 0;
    });

    // Save current step to session storage whenever it changes
    useEffect(() => {
      setRatePlanData('WIZARD_STEP', currentStep.toString());
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
      
      // Get the selected pricing model from session storage
      const selectedPricingModel = getRatePlanData('PRICING_MODEL') || '';
      
      if (!selectedPricingModel) {
        e.pricingModel = "Please select a pricing model";
        return { isValid: false, errors: e };
      }

      // Validate based on selected pricing model - check if fields have been filled
      if (selectedPricingModel === 'Flat Fee') {
        const flatFeeAmount = getRatePlanData('FLAT_FEE_AMOUNT');
        const apiCalls = getRatePlanData('FLAT_FEE_API_CALLS');
        const overageRate = getRatePlanData('FLAT_FEE_OVERAGE');
        
        if (!flatFeeAmount || flatFeeAmount.trim() === '' || Number(flatFeeAmount) <= 0) {
          e.flatFeeAmount = "Flat fee amount is required";
        }
        if (!apiCalls || apiCalls.trim() === '' || Number(apiCalls) <= 0) {
          e.apiCalls = "Number of API calls is required";
        }
        if (!overageRate || overageRate.trim() === '' || Number(overageRate) <= 0) {
          e.overageRate = "Overage unit rate is required";
        }
      } else if (selectedPricingModel === 'Usage-Based') {
        const perUnitAmount = getRatePlanData('USAGE_PER_UNIT_AMOUNT');
        if (!perUnitAmount || perUnitAmount.trim() === '' || Number(perUnitAmount) <= 0) {
          e.perUnitAmount = "Per unit amount is required";
        }
      } else if (selectedPricingModel === 'Tiered Pricing') {
        const tieredTiers = JSON.parse(getRatePlanData('TIERED_TIERS') || '[]');
        const overage = getRatePlanData('TIERED_OVERAGE');
        
        if (tieredTiers.length === 0) {
          e.tieredTiers = "At least one tier is required";
        } else {
          // Validate each tier has required fields
          const hasInvalidTier = tieredTiers.some((tier: any) => 
            !tier.from || tier.from.toString().trim() === '' || 
            !tier.price || tier.price.toString().trim() === '' || 
            (!tier.isUnlimited && (!tier.to || tier.to.toString().trim() === ''))
          );
          if (hasInvalidTier) {
            e.tieredTiers = "All tier fields are required";
          }
        }
        
        const hasUnlimitedTier = tieredTiers.some((tier: any) => tier.isUnlimited);
        if (!hasUnlimitedTier && (!overage || overage.trim() === '' || Number(overage) <= 0)) {
          e.tieredOverage = "Overage charge is required when no unlimited tier";
        }
      } else if (selectedPricingModel === 'Volume-Based') {
        const volumeTiers = JSON.parse(getRatePlanData('VOLUME_TIERS') || '[]');
        const overage = getRatePlanData('VOLUME_OVERAGE');
        
        if (volumeTiers.length === 0) {
          e.volumeTiers = "At least one volume tier is required";
        }
        if (!overage || overage.trim() === '' || Number(overage) <= 0) {
          e.volumeOverage = "Overage unit rate is required";
        }
      } else if (selectedPricingModel === 'Stairstep') {
        const stairTiers = JSON.parse(getRatePlanData('STAIR_TIERS') || '[]');
        const overage = getRatePlanData('STAIR_OVERAGE');
        
        if (stairTiers.length === 0) {
          e.stairTiers = "At least one stair tier is required";
        }
        
        const hasUnlimitedTier = stairTiers.some((tier: any) => tier.isUnlimited);
        if (!hasUnlimitedTier && (!overage || overage.trim() === '' || Number(overage) <= 0)) {
          e.stairOverage = "Overage charge is required when no unlimited tier";
        }
      }

      console.log("🔍 Pricing validation - Model:", selectedPricingModel, "Errors:", e);
      return { isValid: Object.keys(e).length === 0, errors: e };
    };

    const saveDraft = React.useCallback(async () => {
      console.log('💾 Save as Draft clicked');
      
      // Mark that save as draft was used
      setHasSavedAsDraft(true);
      
      // Save current step to session storage
      setRatePlanData('CURRENT_STEP', currentStep.toString());
      
      // Validate current step before saving
      if (currentStep === 0 && !validateStep0()) {
        console.log('❌ Step 0 validation failed, cannot save as draft');
        return;
      }
      
      try {
        setDraftSaving(true);
        console.log(" Save as Draft - Starting save process...");
        
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

        let currentRatePlanId = ratePlanId;
        if (!currentRatePlanId) {
          console.log("📝 API Call: POST /rate-plans - Creating new rate plan...", partial);
          const created = await createRatePlan(partial as any);
          currentRatePlanId = created.ratePlanId;
          setRatePlanId(currentRatePlanId);
          console.log("✅ POST Success - Rate plan created with ID:", currentRatePlanId);
        } else {
          console.log("📝 API Call: PATCH /rate-plans/" + currentRatePlanId + " - Updating existing rate plan...", partial);
          await updateRatePlan(currentRatePlanId, partial as any);
          console.log("✅ PATCH Success - Rate plan updated:", currentRatePlanId);
        }

        // Skip pricing save in Save as Draft to prevent duplicates
        // Pricing will be saved when user clicks "Save & Next" from pricing step
        if (currentRatePlanId && extrasRef.current) {
          console.log("📝 API Call: POST /extras/* - Saving extras (setup fees, discounts, etc.)...");
          try {
            await extrasRef.current.saveAll(currentRatePlanId);
            console.log("✅ POST Success - Extras saved");
          } catch (extrasError) {
            console.warn("⚠️ Extras save failed but continuing (extras may be optional for draft):", extrasError);
          }
        }
        
        console.log(" Save as Draft - Complete!");
      } catch (e) {
        console.error(" Failed to save draft", e);
      } finally {
        setDraftSaving(false);
      }
    }, [
      planName,
      planDescription,
      billingFrequency,
      selectedProductName,
      paymentMethod,
      selectedMetricId,
      ratePlanId,
      products,
      pricingRef,
      extrasRef,
      setDraftSaving,
      setRatePlanId,
      currentStep
    ]);

    useEffect(() => {
      if (registerSaveDraft) {
        registerSaveDraft(saveDraft);
      }
    }, [registerSaveDraft, saveDraft]);

    /** Create the rate plan if prerequisites are present and it's not created yet */
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

    /** Can we navigate to a target step? Auto-handle prerequisites when jumping forward. */
    const canNavigateTo = async (targetIndex: number): Promise<boolean> => {
      if (targetIndex <= currentStep) return true; // always allow going back

      // Step 1 and beyond require step 0 to be valid
      if (targetIndex >= 1 && !validateStep0()) {
        setCurrentStep(0);
        return false;
      }

      // Step 2+ need a selected metric and a created rate plan
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

      // (Optional) you could require Pricing save before step 3 — skipping for now
      return true;
    };

    const onStepClick = async (index: number) => {
      if (index === currentStep) return;
      const ok = await canNavigateTo(index);
      if (ok) setCurrentStep(index);
    };

    const handleNext = async () => {
      if (currentStep === steps.length - 1) {
        if (!ratePlanId) return;
        try {
          setSaving(true);
          // Only confirm (make active) if user never used "Save as Draft"
          if (!hasSavedAsDraft) {
            console.log('✅ Confirming rate plan as ACTIVE (no draft saves used)');
            await confirmRatePlan(ratePlanId);
          } else {
            console.log('📝 Keeping rate plan as DRAFT (save as draft was used)');
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
        
        console.log("🔍 Debug - Current ratePlanId state:", ratePlanId);
        console.log("🔍 Debug - Selected metric ID:", selectedMetricId);
        
        // If we already have a ratePlanId (from Save as Draft), just update it
        if (ratePlanId) {
          console.log("🔄 Save & Next: PATCH /rate-plans/" + ratePlanId + " - Updating existing rate plan with billable metric...");
          console.log("📊 Current ratePlanId:", ratePlanId);
          try {
            setSaving(true);
            const selectedProduct = products.find((p) => p.productName === selectedProductName);
            const updatePayload: Partial<RatePlanRequest> = {
              billableMetricId: selectedMetricId,
            };
            if (selectedProduct) {
              updatePayload.productId = Number(selectedProduct.productId);
            }
            console.log("📝 Update payload:", updatePayload);
            await updateRatePlan(ratePlanId, updatePayload as any);
            console.log("✅ PATCH Success - Rate plan updated with billable metric");
          } catch (e: any) {
            console.error("❌ PATCH Failed - Failed to update rate plan", e);
            console.error("❌ Error details:", e.response?.data);
            setSaving(false);
            return;
          }
          setSaving(false);
        } else {
          // Create new rate plan if it doesn't exist
          const selectedProduct = products.find((p) => p.productName === selectedProductName);
          if (!selectedProduct) {
            setErrors({ selectedProductName: "Invalid product selected" });
            return;
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
            console.log("🔄 Save & Next: POST /rate-plans - Creating new rate plan...", payload);
            const created = await createRatePlan(payload);
            setRatePlanId(created.ratePlanId);
            console.log("✅ POST Success - Rate plan created with ID:", created.ratePlanId);
          } catch (e: any) {
            console.error("❌ POST Failed - Failed to create rate plan", e);
            console.error("❌ Error details:", e.response?.data);
            console.error("❌ Payload that failed:", payload);
            setSaving(false);
            return;
          }
          setSaving(false);
        }
      }

      if (currentStep === 2 && pricingRef.current && ratePlanId) {
        // Validate pricing model selection first
        const pricingValidation = validatePricingStep();
        if (!pricingValidation.isValid) {
          setErrors(pricingValidation.errors);
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

    const handleBack = () => (currentStep > 0 ? setCurrentStep((s) => s - 1) : onClose());

    const sectionHeading = steps[currentStep].title;

    /* Persist step whenever it changes */
    useEffect(() => {
      localStorage.setItem('ratePlanWizardStep', String(currentStep));
    }, [currentStep]);

    // clear persisted step when wizard unmounts (e.g., after closing or navigating away)
    useEffect(() => {
      return () => {
        localStorage.removeItem('ratePlanWizardStep');
      };
    }, []);

    const renderStepContent = () => {
      switch (currentStep) {
        case 0:
          return (
            <>
              <div className="create-form">
                <InputField
                  label="Rate Plan Name"
                  placeholder="e.g., Individual Plan, Pro Plan"
                  value={planName}
                  onChange={setPlanName}
                  error={errors.planName}
                />
              </div>

              <div className="create-form">
                <TextareaField
                  label="Rate Plan Description"
                  placeholder="e.g., Best for solo developers using our API"
                  value={planDescription}
                  onChange={setPlanDescription}
                  error={errors.planDescription}
                />
              </div>

              <div className="form-row">
                <div className="create-form">
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
                </div>

                <div className="create-form">
                  <SelectField
                    label="Select Product"
                    value={selectedProductName}
                    onChange={setSelectedProductName}
                    placeholder="Select Product"
                    options={[
                      ...(productError
                        ? []
                        : products.map((p) => ({
                            label: p.productName,
                            value: p.productName,
                          }))),
                    ]}
                    error={errors.selectedProductName}
                  />
                </div>

                <div className="create-form">
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
                </div>
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
                <div className="inline-error" style={{ marginTop: '10px', color: '#d32f2f', fontSize: '14px' }}>
                  {errors.billableMetric}
                </div>
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
      <div className="create-price-plan align-under-back">
        <div className="price-plan-wrapper">
          {/* Progress / stepper — UNLOCKED (clickable) */}
          <aside className="price-plan-sidebars">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`step-item ${index === currentStep ? "active" : ""}`}
                onClick={() => onStepClick(index)}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onStepClick(index)}
                role="button"
                tabIndex={0}
                aria-current={index === currentStep ? "step" : undefined}
              >
                <div className="icon-wrappers">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="11.5" stroke="#D6D5D7" />
                    <circle cx="12" cy="12" r="6" fill="#D6D5D7" />
                  </svg>
                </div>
                <div className="step-text">
                  <span className="step-title">{step.title}</span>
                  <span className="step-desc">{step.desc}</span>
                </div>
              </div>
            ))}
          </aside>

          <div className="price-plan-section">
            <div className="section-header">
              <div className="section-title">{sectionHeading}</div>
            </div>

            <div className="form-card">{renderStepContent()}</div>

            <div className="button-group">
              <button className="btn back" onClick={handleBack} disabled={currentStep === 0}>
                Back
              </button>
              <button className="btn save-next" onClick={handleNext} disabled={saving}>
                {currentStep === steps.length - 1 ? "Create Rate Plan" : "Save & Next"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

export default React.memo(CreatePricePlan);
