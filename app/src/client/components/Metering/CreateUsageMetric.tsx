import * as React from "react";
import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import TopBar from "../componenetsss/TopBar";
import { InputField, TextareaField, DropdownField } from "../componenetsss/Inputs";
import ConfirmDeleteModal from "../componenetsss/ConfirmDeleteModal";
import SaveDraft from "../componenetsss/SaveDraft";
import { useToast } from "../componenetsss/ToastProvider";
import PrimaryButton from "../componenetsss/PrimaryButton";
import SecondaryButton from "../componenetsss/SecondaryButton";
import ProductCreatedSuccess from "../componenetsss/ProductCreatedSuccess";
import CreateFormShell from "../componenetsss/CreateFormShell";

import {
  getProducts,
  getUsageMetric,
  Product,
  createBillableMetric,
  updateBillableMetric,
  finalizeBillableMetric,
  deleteUsageMetric,
} from "./api";

import UsageConditionForm from "./UsageConditionForm";
import AggregationFunctionSelect from "./AggregationFunctionSelect";
import AggregationWindowSelect from "./AggregationWindowSelect";
import Review from "./Review";

import "./Usagemetric.css";
import "../componenetsss/SkeletonForm.css";

type ActiveTab = "metric" | "conditions" | "review";

const steps = [
  {
    id: 1,
    title: "Define Metric & Aggregation",
    desc: "Give your metric a name, set its unit, and connect it to the product or event source it will measure.",
  },
  {
    id: 2,
    title: "Usage Conditions",
    desc: "Define how usage is calculated —apply any rules needed for billing.",
  },
  {
    id: 3,
    title: "Review & Confirm",
    desc: "Review your setup to make sure everything is correct before saving the metric.",
  },
];

interface CreateUsageMetricProps {
  onClose: () => void;
  draftMetricId?: number;
}

export default function CreateUsageMetric({
  onClose,
  draftMetricId,
}: CreateUsageMetricProps): React.JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const draftFromState = (location.state as any)?.draftMetricId;
  const activeMetricId = draftFromState || draftMetricId;

  useEffect(() => {
    document.body.classList.add("create-product-page");
    const handleBackButton = (event: PopStateEvent) => {
      event.preventDefault();
      navigate("/get-started/metering");
    };
    window.addEventListener("popstate", handleBackButton);
    window.history.pushState(null, "", window.location.pathname);
    return () => {
      document.body.classList.remove("create-product-page");
      window.removeEventListener("popstate", handleBackButton);
    };
  }, [navigate]);

  const [currentStep, setCurrentStep] = useState(0);
  const [activeTab, setActiveTab] = useState<ActiveTab>("metric");

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSavePrompt, setShowSavePrompt] = useState(false);

  const [isDraftSaving, setIsDraftSaving] = useState(false);
  const [isDraftSaved, setIsDraftSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [hasEverBeenEnabled, setHasEverBeenEnabled] = useState(false);
  const [initialFormState, setInitialFormState] = useState<any>(null);

  // form state
  const [metricId, setMetricId] = useState<number | null>(null);
  const [metricName, setMetricName] = useState("");
  const [version, setVersion] = useState("");
  const [unitOfMeasure, setUnitOfMeasure] = useState("");
  const [description, setDescription] = useState("");
  const [aggregationFunction, setAggregationFunction] = useState("");
  const [aggregationWindow, setAggregationWindow] = useState("");
  const [usageConditions, setUsageConditions] = useState<
    { dimension: string; operator: string; value: string }[]
  >([]);
  const [billingCriteria, setBillingCriteria] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [selectedProductName, setSelectedProductName] = useState<string>("");
  const [selectedProductType, setSelectedProductType] = useState<string>("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [conditionErrors, setConditionErrors] = useState<Record<string, string>>({});

  // load draft/edit metric
  useEffect(() => {
    if (!activeMetricId) return;

    (async () => {
      const data = await getUsageMetric(activeMetricId);
      if (!data) return;

      const loadedState = {
        metricName: (data as any).metricName || "",
        selectedProductId: String((data as any).productId || ""),
        version: (data as any).version || "",
        unitOfMeasure: (data as any).unitOfMeasure || "",
        description: (data as any).description || "",
        aggregationFunction: (data as any).aggregationFunction || "",
        aggregationWindow: (data as any).aggregationWindow || "",
        billingCriteria: (data as any).billingCriteria || "",
        usageConditions: (data as any).usageConditions || [],
      };

      setInitialFormState(loadedState);

      setMetricId((data as any).metricId ?? (data as any).billableMetricId ?? null);
      setMetricName((data as any).metricName || "");

      const productId = (data as any).productId;
      if (productId != null && productId !== "" && !isNaN(Number(productId))) {
        setSelectedProductId(String(productId));
      }

      if ((data as any).productType) setSelectedProductType((data as any).productType);

      setUnitOfMeasure((data as any).unitOfMeasure || "");
      setDescription((data as any).description || "");
      setAggregationFunction((data as any).aggregationFunction || "");
      setAggregationWindow((data as any).aggregationWindow || "");
      setBillingCriteria((data as any).billingCriteria || "");
      setUsageConditions((data as any).usageConditions || []);
      if ((data as any).version) setVersion((data as any).version);
    })();
  }, [activeMetricId]);

  useEffect(() => {
    getProducts().then(setProducts).catch((err) => console.error("Failed to load products", err));
  }, []);

  useEffect(() => {
    if (selectedProductId && products.length) {
      const prod = products.find((p) => String(p.productId) === selectedProductId);
      if (prod) {
        setSelectedProductName(prod.productName);
        setSelectedProductType(prod.productType);
      }
    }
  }, [products, selectedProductId]);

  // reset "Saved!" tag when user types
  useEffect(() => {
    if (isDraftSaved) setIsDraftSaved(false);
  }, [
    metricName,
    selectedProductId,
    version,
    unitOfMeasure,
    description,
    aggregationFunction,
    aggregationWindow,
    billingCriteria,
    usageConditions,
    isDraftSaved,
  ]);

  // Track usageConditions state changes
  useEffect(() => {
    console.log("📊 USAGE CONDITIONS STATE CHANGED:", {
      usageConditions,
      billingCriteria,
      activeTab,
      currentStep,
    });
  }, [usageConditions, billingCriteria, activeTab, currentStep]);

  // used for topbar "enable" logic
  const hasAnyRequiredInput = useMemo(() => {
    const first = usageConditions[0] || { dimension: "", operator: "", value: "" };
    return Boolean(
      metricName.trim() ||
        selectedProductId ||
        version.trim() ||
        description.trim() ||
        unitOfMeasure ||
        aggregationFunction ||
        aggregationWindow ||
        billingCriteria ||
        first.dimension ||
        first.operator ||
        first.value
    );
  }, [
    metricName,
    selectedProductId,
    version,
    description,
    unitOfMeasure,
    aggregationFunction,
    aggregationWindow,
    billingCriteria,
    usageConditions,
  ]);

  // ✅ Step completion / lock rules (aligned with CreateCustomer UX)
  const isStep0Completed = Boolean(metricName.trim() && selectedProductId && unitOfMeasure);
  const isConditionsLocked = !isStep0Completed;

  const isReviewLocked = useMemo(() => {
    if (!isStep0Completed) return true;
    if (!billingCriteria) return true;

    if (billingCriteria === "BILL_BASED_ON_USAGE_CONDITIONS") {
      const first = usageConditions[0] || { dimension: "", operator: "", value: "" };
      if (!first.dimension || !first.operator || !first.value) return true;
    }

    return false;
  }, [isStep0Completed, billingCriteria, usageConditions]);

  const hasUserMadeChanges = useMemo(() => {
    if (!initialFormState) return hasAnyRequiredInput;

    return (
      metricName !== initialFormState.metricName ||
      selectedProductId !== initialFormState.selectedProductId ||
      version !== initialFormState.version ||
      unitOfMeasure !== initialFormState.unitOfMeasure ||
      description !== initialFormState.description ||
      aggregationFunction !== initialFormState.aggregationFunction ||
      aggregationWindow !== initialFormState.aggregationWindow ||
      billingCriteria !== initialFormState.billingCriteria ||
      JSON.stringify(usageConditions) !== JSON.stringify(initialFormState.usageConditions)
    );
  }, [
    initialFormState,
    metricName,
    selectedProductId,
    version,
    unitOfMeasure,
    description,
    aggregationFunction,
    aggregationWindow,
    billingCriteria,
    usageConditions,
    hasAnyRequiredInput,
  ]);

  useEffect(() => {
    if (hasUserMadeChanges && !hasEverBeenEnabled) setHasEverBeenEnabled(true);
  }, [hasUserMadeChanges, hasEverBeenEnabled]);

  const topActionsDisabled = !hasEverBeenEnabled;

  // icons (same family as your CreateCustomer)
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
        d="M9.50024 16.6662C9.89077 17.0567 10.5239 17.0567 10.9145 16.6662L18.0341 9.54661C18.4017 9.17902 18.4017 8.58304 18.0341 8.21546C17.6665 7.84787 17.0705 7.84787 16.7029 8.21546L10.9145 14.0039C10.5239 14.3944 9.89077 14.3944 9.50024 14.0039L7.27291 11.7766C6.90533 11.409 6.30935 11.409 5.94176 11.7766C5.57418 12.1442 5.57418 12.7402 5.94176 13.1077L9.50024 16.6662Z"
        fill="#034A7D"
      />
      <circle cx="12" cy="12" r="11" stroke="#034A7D" strokeWidth="2" />
    </svg>
  );

  const ActiveRingIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="11" stroke="#C3C2D0" strokeWidth="2" />
      <circle cx="12" cy="12" r="6" fill="#C3C2D0" />
    </svg>
  );

  const UnlockedIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 26 26" fill="none">
      <path d="M19 13C19 16.3137 16.3137 19 13 19C9.68629 19 7 16.3137 7 13C7 9.68629 9.68629 7 13 7C16.3137 7 19 9.68629 19 13Z" fill="#BAC4D5"/>
      <path d="M13 1C19.6274 1 25 6.37258 25 13C25 19.6274 19.6274 25 13 25C6.37258 25 1 19.6274 1 13C1 6.37258 6.37258 1 13 1ZM18 13C18 15.7614 15.7614 18 13 18C10.2386 18 8 15.7614 8 13C8 10.2386 10.2386 8 13 8C15.7614 8 18 10.2386 18 13ZM20 13C20 9.13401 16.866 6 13 6C9.13401 6 6 9.13401 6 13C6 16.866 9.13401 20 13 20C16.866 20 20 16.866 20 13Z" stroke="#BAC4D5" strokeWidth="2"/>
    </svg>
  );

  const productOptions = products.map((p) => ({ label: p.productName, value: String(p.productId) }));

  const deleteAndClose = async () => {
    if (!metricId) {
      onClose();
      return;
    }
    try {
      await deleteUsageMetric(metricId);
      showToast({ kind: "success", title: "Metric Deleted", message: "Metric deleted successfully." });
    } catch (e) {
      console.error("Failed to delete metric", e);
      showToast({ kind: "error", title: "Delete Failed", message: "Unable to delete metric. Please try again." });
    } finally {
      onClose();
    }
  };

  const handleTopbarBack = () => {
    if (hasAnyRequiredInput || metricId) setShowSavePrompt(true);
    else navigate("/get-started/metering");
  };

  const setStep = (idx: number) => {
    setCurrentStep(idx);
    const map: ActiveTab[] = ["metric", "conditions", "review"];
    setActiveTab(map[idx] || "metric");
  };

  const validateCurrentStep = (step: number): boolean => {
    const step0Errors: Record<string, string> = {};
    const step1CondErrors: Record<string, string> = {};

    if (step === 0) {
      if (!metricName.trim()) step0Errors.metricName = "Metric name is required";
      if (!selectedProductId) step0Errors.product = "Product is required";
      if (!unitOfMeasure) step0Errors.unitOfMeasure = "Unit of Measure is required";
      setErrors(step0Errors);
      return Object.keys(step0Errors).length === 0;
    }

    if (step === 1) {
      if (billingCriteria === "BILL_BASED_ON_USAGE_CONDITIONS") {
        const first = usageConditions[0] || { dimension: "", operator: "", value: "" };
        if (!first.dimension) step1CondErrors["0.dimension"] = "Dimension is required";
        if (!first.operator) step1CondErrors["0.operator"] = "Operator is required";
        if (!first.value) step1CondErrors["0.value"] = "Value is required";
      }

      const nextErrors = { ...errors };
      if (!billingCriteria) nextErrors.billingCriteria = "Billing criteria is required";
      else if (nextErrors.billingCriteria) delete nextErrors.billingCriteria;

      setErrors(nextErrors);
      setConditionErrors(step1CondErrors);

      return Object.keys(step1CondErrors).length === 0 && !nextErrors.billingCriteria;
    }

    return true;
  };

  const clean = (obj: any) => {
    const out: any = {};
    Object.entries(obj).forEach(([k, v]) => {
      if (v === undefined || v === null) return;
      if (typeof v === "string" && v.trim() === "") return;
      if (Array.isArray(v) && v.length === 0) return;
      out[k] = v;
    });
    return out;
  };

  const buildPayload = (isDraft: boolean) => {
    const shouldIncludeUsageConditions = billingCriteria !== "BILL_EXCLUDING_USAGE_CONDITIONS";

    console.log("🔍 BUILDING PAYLOAD - RAW CONDITIONS:", {
      selectedProductType,
      billingCriteria,
      shouldIncludeUsageConditions,
      usageConditions,
    });

    const validConditions = usageConditions.filter((c) => {
      const isValid = c.dimension?.trim() && c.operator?.trim() && c.value?.trim();
      console.log("🔍 CONDITION VALIDATION:", {
        condition: c,
        dimension: c.dimension,
        operator: c.operator,
        value: c.value,
        isValid,
      });
      return isValid;
    });

    console.log("🔍 VALID CONDITIONS AFTER FILTER:", validConditions);

    if (metricId) {
      const payload: any = {
        metricId,
        metricName: metricName || undefined,
        productId: selectedProductId ? Number(selectedProductId) : undefined,
        unitOfMeasure: unitOfMeasure || undefined,
        aggregationFunction: aggregationFunction || undefined,
        aggregationWindow: aggregationWindow || undefined,
        billingCriteria: billingCriteria || undefined,
        version: version?.trim() || undefined,
        description: description?.trim() ? description.trim() : undefined,
        usageConditions: shouldIncludeUsageConditions ? validConditions : [],
      };
      const cleaned = clean(payload);
      cleaned.usageConditions = payload.usageConditions;
      return cleaned;
    }

    if (isDraft) {
      const payload: any = {
        usageConditions: shouldIncludeUsageConditions ? validConditions : [],
      };
      if (metricName.trim()) payload.metricName = metricName.trim();
      if (selectedProductId) payload.productId = Number(selectedProductId);
      if (version?.trim()) payload.version = version.trim();
      if (unitOfMeasure.trim()) payload.unitOfMeasure = unitOfMeasure.trim();
      if (description.trim()) payload.description = description.trim();
      if (aggregationFunction) payload.aggregationFunction = aggregationFunction;
      if (aggregationWindow) payload.aggregationWindow = aggregationWindow;
      if (billingCriteria) payload.billingCriteria = billingCriteria;
      const cleaned = clean(payload);
      cleaned.usageConditions = payload.usageConditions;
      return cleaned;
    }

    const payload: any = {
      metricName: metricName.trim(),
      productId: Number(selectedProductId),
      unitOfMeasure: unitOfMeasure.trim(),
      usageConditions: shouldIncludeUsageConditions ? validConditions : [],
    };

    if (version?.trim()) payload.version = version.trim();
    if (description?.trim()) payload.description = description.trim();
    if (aggregationFunction) payload.aggregationFunction = aggregationFunction;
    if (aggregationWindow) payload.aggregationWindow = aggregationWindow;
    if (billingCriteria) payload.billingCriteria = billingCriteria;

    const cleaned = clean(payload);
    cleaned.usageConditions = payload.usageConditions;
    return cleaned;
  };

  const saveOrUpdateMetric = async (isDraft = false, skipFinalize = false) => {
    if (!isDraft && !validateCurrentStep(currentStep)) return false;

    const payload = buildPayload(isDraft);
    console.log("📤 PAYLOAD BEING SENT TO BACKEND:", {
      isDraft,
      skipFinalize,
      billingCriteria,
      usageConditions,
      payload,
    });

    try {
      if (metricId) {
        console.log("🔄 UPDATING METRIC:", metricId, "with payload:", payload);
        const success = await updateBillableMetric(metricId, payload);
        console.log("✅ UPDATE RESPONSE:", success);
        if (!success) throw new Error("Failed to update metric");

        if (!isDraft && !skipFinalize) {
          const finalized = await finalizeBillableMetric(metricId);
          if (!finalized) throw new Error("Failed to finalize metric");
          setShowSuccess(true);
        }
        return true;
      } else {
        console.log("➕ CREATING NEW METRIC with payload:", payload);
        const res = await createBillableMetric(payload);
        console.log("✅ CREATE RESPONSE:", res);
        if (!res.ok || !res.id) throw new Error("Failed to create metric");
        setMetricId(res.id);

        if (!isDraft && !skipFinalize) {
          const finalized = await finalizeBillableMetric(res.id);
          if (!finalized) throw new Error("Failed to finalize metric");
          setShowSuccess(true);
        }
        return true;
      }
    } catch (e) {
      console.error("Error saving metric:", e);
      setErrors((prev) => ({ ...prev, form: "Failed to save metric. Please check all required fields." }));
      return false;
    }
  };

  const handleSaveDraft = async () => {
    if (isDraftSaving) return false;

    try {
      setIsDraftSaving(true);
      setIsDraftSaved(false);

      const payload = buildPayload(true);

      let ok;
      if (metricId) {
        ok = await updateBillableMetric(metricId, payload);
      } else {
        const response = await createBillableMetric(payload);
        ok = response.ok;
        if (response.id) setMetricId(response.id);
      }

      if (ok) {
        setIsDraftSaved(true);
        return true;
      }
      return false;
    } catch (e) {
      console.error("Error saving draft:", e);
      return false;
    } finally {
      setIsDraftSaving(false);
    }
  };

  const handleStepClick = async (index: number) => {
    if (index === currentStep) return;

    // allow going back freely
    if (index < currentStep) {
      setStep(index);
      return;
    }

    // Allow navigation to locked conditions step but block review step completely
    if (index === 1 && isConditionsLocked) {
      setStep(1); // Show conditions step in locked state
      return;
    }
    if (index === 2 && isReviewLocked) {
      return; // Block navigation to review step until prerequisites are met
    }

    // validate previous steps before forward jump
    for (let i = 0; i < index; i += 1) {
      const ok = validateCurrentStep(i);
      if (!ok) {
        setStep(i);
        return;
      }
      // when jumping into review, save conditions like "Save & Next"
      if (i === 1 && index === 2) {
        setSaving(true);
        const saved = await saveOrUpdateMetric(false, true);
        setSaving(false);
        if (!saved) return;
      }
    }

    setStep(index);
  };

  const handleNext = async () => {
    if (activeTab === "metric") {
      if (!validateCurrentStep(0)) return;

      console.log("📍 STEP 0 (METRIC) - BEFORE SAVE:", {
        metricName,
        selectedProductId,
        unitOfMeasure,
        usageConditions,
      });

      setSaving(true);
      const ok = await saveOrUpdateMetric(true); // draft save on step 1
      setSaving(false);
      if (!ok) return;

      setStep(1);
      return;
    }

    if (activeTab === "conditions") {
      if (isConditionsLocked) return;
      if (!validateCurrentStep(1)) return;

      console.log("📍 STEP 1 (CONDITIONS) - BEFORE SAVE:", {
        billingCriteria,
        usageConditions,
        metricId,
      });

      // Always save conditions when moving to review step
      console.log("💾 SAVING CONDITIONS TO BACKEND");
      setSaving(true);
      const ok = await saveOrUpdateMetric(false, true); // save but don't finalize
      setSaving(false);
      if (!ok) return;

      setStep(2);
      return;
    }

    if (activeTab === "review") {
      if (isReviewLocked || !metricId) return;

      setSaving(true);
      const finalized = await finalizeBillableMetric(metricId);
      setSaving(false);

      if (finalized) setShowSuccess(true);
      else {
        showToast({
          kind: "error",
          title: "Failed to Create Metric",
          message: "Unable to finalize the metric. Please try again.",
        });
      }
    }
  };

  const handleGoAllMetrics = () => {
    showToast({
      kind: "success",
      title: "Usage Metric Created Successfully",
      message: "Your usage metric has been created successfully.",
    });
    navigate("/get-started/metering");
  };

  const shellTitle =
    activeTab === "metric"
      ? "DEFINE METRIC & AGGREGATION"
      : activeTab === "conditions"
      ? "USAGE CONDITIONS"
      : "REVIEW & CONFIRM";

  const shellLocked = activeTab === "conditions" ? isConditionsLocked : activeTab === "review" ? isReviewLocked : false;

  const footerHint =
    activeTab === "conditions" && isConditionsLocked
      ? "Fill the previous steps to unlock this step"
      : activeTab === "review" && isReviewLocked
      ? "Complete the previous steps to unlock this step"
      : undefined;

  const footerLeft =
    activeTab === "metric"
      ? null
      : activeTab === "conditions"
      ? isConditionsLocked
        ? null
        : (
          <SecondaryButton type="button" onClick={() => setStep(0)}>
            Back
          </SecondaryButton>
        )
      : isReviewLocked
      ? null
      : (
        <SecondaryButton type="button" onClick={() => setStep(1)}>
          Back
        </SecondaryButton>
      );

  const footerRight =
    activeTab === "metric" ? (
      <PrimaryButton type="button" onClick={handleNext} disabled={saving}>
        {saving ? "Saving..." : "Save & Next"}
      </PrimaryButton>
    ) : activeTab === "conditions" ? (
      isConditionsLocked ? null : (
        <PrimaryButton type="button" onClick={handleNext} disabled={saving}>
          {saving ? "Saving..." : "Save & Next"}
        </PrimaryButton>
      )
    ) : isReviewLocked ? null : (
      <PrimaryButton type="button" onClick={handleNext} disabled={saving}>
        {saving ? "Submitting..." : "Create Metric"}
      </PrimaryButton>
    );

  return (
    <>
      {showSuccess ? (
        <ProductCreatedSuccess
          productName={metricName}
          titleOverride={`“${metricName || "Usage Metric"}” Usage Metric Created Successfully`}
          primaryLabelOverride="Go to All Usage Metrics"
          onPrimaryClick={handleGoAllMetrics}
        />
      ) : (
        <>
          <TopBar
            title="Create New Usage Metric"
            onBack={handleTopbarBack}
            cancel={{ onClick: () => setShowDeleteConfirm(true), disabled: topActionsDisabled }}
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
            title={shellTitle}
            locked={shellLocked}
            footerHint={footerHint}
            footerLeft={footerLeft}
            footerRight={footerRight}
            rail={
              <nav className="met-np-steps">
                {steps.map((step, i) => {
                  const isActive = i === currentStep || (i === 0 && !isStep0Completed);

                  const isCompleted =
                    i === 0 ? Boolean(isStep0Completed) && i !== currentStep : i < currentStep;

                  const isLocked =
                    (i === 1 && isConditionsLocked) || (i === 2 && isReviewLocked);

                  const isUnlocked = !isLocked && !isCompleted && !isActive;

                  const showConnector = i < steps.length - 1;

                  return (
                    <button
                      key={step.id}
                      type="button"
                      className={[
                        "met-np-step",
                        isActive ? "active" : "",
                        isCompleted ? "completed" : "",
                        isLocked ? "locked" : "",
                      ].join(" ").trim()}
                      onClick={() => void handleStepClick(i)}
                    >
                      <span className="met-np-step__bullet" aria-hidden="true">
                        <span className="met-np-step__icon">
                          {isActive ? <ActiveRingIcon /> : isCompleted ? <CompletedIcon /> : isUnlocked ? <UnlockedIcon /> : <StepLockIcon />}
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
          >
            <form className="met-np-form" onSubmit={(e) => e.preventDefault()}>
              <div className="met-np-form-section">
                {/* STEP 1 */}
                {activeTab === "metric" && (
                  <section>
                    <div className="met-np-grid-2">
                      <InputField
                        label="Metric Name"
                        value={metricName}
                        onChange={setMetricName}
                        required
                        placeholder="eg. API Calls"
                        error={errors.metricName}
                      />

                      <DropdownField
                        label="Product"
                        value={selectedProductId}
                        required
                        placeholder="Select Product"
                        onChange={(v: string) => {
                          setSelectedProductId(v);
                          const prod = products.find((p) => String(p.productId) === v);
                          setSelectedProductName(prod ? prod.productName : "");
                          setSelectedProductType(prod ? prod.productType : "");
                          setUnitOfMeasure("");
                          if (errors.product) {
                            const { product, ...rest } = errors;
                            setErrors(rest);
                          }
                        }}
                        options={productOptions}
                        error={errors.product}
                        className="select-product"
                      />

                      <InputField label="Version" value={version} onChange={setVersion} placeholder="eg. v2.0" />
                      <TextareaField
                        label="Description"
                        value={description}
                        onChange={setDescription}
                        placeholder="eg. Number of API calls consumed per month"
                      />

                      <div className="met-np-field">
                        {(() => {
                          const map: Record<string, string[]> = {
                            API: ["API_CALL", "REQUEST", "TRANSACTION", "HIT"],
                            FLATFILE: ["FILE", "ROW", "RECORD", "DELIVERY", "MB"],
                            SQLRESULT: ["CELL", "MB", "ROW", "QUERY_EXECUTION"],
                            LLMTOKEN: ["TOKEN", "PROMPT_TOKEN", "COMPLETION_TOKEN"],
                          };
                          const key = selectedProductType?.toUpperCase();
                          const opts = map[key] || null;

                          if (opts) {
                            return (
                              <DropdownField
                                label="Unit of Measure"
                                placeholder="Select unit (eg. calls, GB, hours)"
                                required
                                value={unitOfMeasure}
                                onChange={(v: string) => {
                                  setUnitOfMeasure(v);
                                  if (errors.unitOfMeasure) {
                                    const { unitOfMeasure, ...rest } = errors;
                                    setErrors(rest);
                                  }
                                }}
                                options={opts.map((o) => ({ label: o, value: o }))}
                                error={errors.unitOfMeasure}
                                disabled={!selectedProductId}
                              />
                            );
                          }

                          return (
                            <InputField
                              label="Unit of Measure"
                              placeholder="Unit"
                              required
                              value={unitOfMeasure}
                              onChange={(v: string) => {
                                setUnitOfMeasure(v);
                                if (errors.unitOfMeasure) {
                                  const { unitOfMeasure, ...rest } = errors;
                                  setErrors(rest);
                                }
                              }}
                              error={errors.unitOfMeasure}
                              disabled={!selectedProductId}
                            />
                          );
                        })()}
                      </div>

                      <div className="met-np-field">
                        <AggregationFunctionSelect
                          label="Aggregation Function"
                          productType={selectedProductType}
                          unitOfMeasure={unitOfMeasure}
                          value={aggregationFunction}
                          onChange={(v: string) => {
                            setAggregationFunction(v);
                            setAggregationWindow("");
                          }}
                          error={errors.aggregationFunction}
                          disabled={!unitOfMeasure}
                        />
                      </div>

                      <div className="met-np-field">
                        <AggregationWindowSelect
                          label="Aggregation Window"
                          productType={selectedProductType}
                          unitOfMeasure={unitOfMeasure}
                          value={aggregationWindow}
                          onChange={(v: string) => setAggregationWindow(v)}
                          error={errors.aggregationWindow}
                          disabled={!aggregationFunction}
                        />
                      </div>
                    </div>
                  </section>
                )}

                {/* STEP 2 */}
                {activeTab === "conditions" && (
                  <section>
                    <UsageConditionForm
                      locked={isConditionsLocked}
                      productType={selectedProductType}
                      unitOfMeasure={unitOfMeasure}
                      conditions={usageConditions}
                      setConditions={setUsageConditions}
                      billingCriteria={billingCriteria}
                      onBillingCriteriaChange={setBillingCriteria}
                      errors={conditionErrors}
                      onFieldEdited={(key: string) => {
                        // Handle billingCriteria error clearing
                        if (key === 'billingCriteria' && errors.billingCriteria) {
                          const { billingCriteria, ...rest } = errors;
                          setErrors(rest);
                          return;
                        }
                        // Handle condition field errors
                        setConditionErrors((prev) => {
                          if (!(key in prev)) return prev;
                          const n = { ...prev };
                          delete n[key];
                          return n;
                        })
                      }}
                      billingError={errors.billingCriteria}
                    />
                  </section>
                )}

                {/* STEP 3 */}
                {activeTab === "review" && (
                  <section>
                    <Review
                      metricName={metricName}
                      productName={selectedProductName}
                      description={description}
                      version={version}
                      unitOfMeasure={unitOfMeasure}
                      aggregationFunction={aggregationFunction}
                      aggregationWindow={aggregationWindow}
                      usageConditions={usageConditions}
                      billingCriteria={billingCriteria}
                    />
                  </section>
                )}

                {errors.form && <div className="met-met-np-error-message">{errors.form}</div>}
              </div>
            </form>
          </CreateFormShell>

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
                message: ok ? "Usage metric draft saved successfully." : "Unable to save draft. Please try again.",
              });
              onClose();
            }}
            onDismiss={() => setShowSavePrompt(false)}
          />

          <ConfirmDeleteModal
            isOpen={showDeleteConfirm}
            productName={metricName || "this metric"}
            entityType="metric"
            isDiscardMode={true}
            discardLabel="Keep editing"
            confirmLabel="Discard"
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
