// NewProduct.tsx
import * as React from "react";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import TopBar from "../../componenetsss/TopBar";
import CreateFormShell from "../../componenetsss/CreateFormShell";
import { useToast } from "../../componenetsss/ToastProvider";
import { InputField, TextareaField } from "../../componenetsss/Inputs";
import ConfirmDeleteModal from "../../componenetsss/ConfirmDeleteModal";
import SaveDraft from "../../componenetsss/SaveDraft";
import PrimaryButton from "../../componenetsss/PrimaryButton";
import SecondaryButton from "../../componenetsss/SecondaryButton";

import { ConfigurationTab, configurationFields } from "./ConfigurationTab";
import ProductReview from "./ProductReview";

import EditButton from "../../componenetsss/EditButton";
import DeleteButton from "../../componenetsss/DeleteButton";
import ProductIconPickerModal from "../ProductIconPickerModal";
import { ProductIconData } from "../ProductIcon";
import ProductCreatedSuccess from "../../componenetsss/ProductCreatedSuccess";

import {
  createProduct,
  updateProduct,
  updateProductIcon,
  finalizeProduct,
  deleteProduct,
  ProductPayload,
} from "../api";

import "./NewProduct.css";
import "../../componenetsss/SkeletonForm.css";

type StepKey = "general" | "configuration" | "review";
type ActiveTab = StepKey;

const steps = [
  {
    id: 1,
    key: "general" as StepKey,
    title: "General Details",
    desc: "Start with the basics of your product.",
  },
  {
    id: 2,
    key: "configuration" as StepKey,
    title: "Configuration",
    desc: "Define configuration and parameters.",
  },
  {
    id: 3,
    key: "review" as StepKey,
    title: "Review & Confirm",
    desc: "Validate all details before finalizing.",
  },
];

export interface DraftProduct {
  productId?: string;
  productName?: string;
  version?: string;
  internalSkuCode?: string;
  productDescription?: string;
  status?: string;
  productType?: string;
  productIcon?: string; // JSON string containing icon data
  iconData?: ProductIconData;
}

interface NewProductProps {
  onClose: () => void;
  draftProduct?: DraftProduct;
}

export default function NewProduct({
  onClose,
  draftProduct,
}: NewProductProps): React.JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // draft source
  const draftFromState = (location.state as any)?.draftProduct;
  const activeDraft = draftFromState || draftProduct;

  useEffect(() => {
    document.body.classList.add("create-product-page");

    const handleBackButton = (event: PopStateEvent) => {
      event.preventDefault();
      navigate("/get-started/products");
    };

    window.addEventListener("popstate", handleBackButton);
    window.history.pushState(null, "", window.location.pathname);

    return () => {
      document.body.classList.remove("create-product-page");
      window.removeEventListener("popstate", handleBackButton);
      localStorage.removeItem("activeTab");
      localStorage.removeItem("currentStep");
      localStorage.removeItem("configFormData");
      localStorage.removeItem("configProductType");
    };
  }, [navigate]);

  const [currentStep, setCurrentStep] = useState(() => {
    const saved = localStorage.getItem("currentStep");
    return saved ? parseInt(saved, 10) : 0;
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>(() => {
    const saved = localStorage.getItem("activeTab");
    return (saved as ActiveTab) || "general";
  });

  const [isDraftSaving, setIsDraftSaving] = useState(false);
  const [isDraftSaved, setIsDraftSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [hasEverBeenEnabled, setHasEverBeenEnabled] = useState(false);

  // form
  const [formData, setFormData] = useState({
    productName: activeDraft?.productName || "",
    version: activeDraft?.version || "",
    description: activeDraft?.productDescription || "",
  });

  const [selectedIcon, setSelectedIcon] = useState<ProductIconData | null>(null);
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [configuration, setConfiguration] = useState<Record<string, any>>({
    productType: activeDraft?.productType || "",
  });
  const [createdProductId, setCreatedProductId] = useState<string | null>(
    (activeDraft?.productId as any) || null
  );

  const configRef = React.useRef<any>(null);

  // Load icon from draft/cache
  useEffect(() => {
    let iconLoaded = false;

    // Only load from cache if icon wasn't explicitly removed (productIcon !== null)
    if (activeDraft?.productId && activeDraft?.productIcon !== null) {
      try {
        const iconCache = JSON.parse(localStorage.getItem("iconDataCache") || "{}");
        const cachedIconJson = iconCache[activeDraft.productId];
        if (cachedIconJson) {
          const parsedCache =
            typeof cachedIconJson === "string" ? JSON.parse(cachedIconJson) : cachedIconJson;

          if (parsedCache?.iconData) {
            setSelectedIcon(parsedCache.iconData as ProductIconData);
            iconLoaded = true;
          } else if (parsedCache?.id && parsedCache?.svgPath) {
            setSelectedIcon(parsedCache as ProductIconData);
            iconLoaded = true;
          }
        }
      } catch {
        /* ignore */
      }
    } else if (activeDraft?.productId && activeDraft?.productIcon === null) {
      // Icon was removed - clear cache and state
      try {
        const iconCache = JSON.parse(localStorage.getItem("iconDataCache") || "{}");
        delete iconCache[activeDraft.productId];
        localStorage.setItem("iconDataCache", JSON.stringify(iconCache));
        setSelectedIcon(null);
        iconLoaded = true; // Mark as loaded to skip further processing
      } catch {
        /* ignore */
      }
    }

    if (!iconLoaded && activeDraft?.productIcon) {
      try {
        const parsed = JSON.parse(activeDraft.productIcon);
        if (parsed?.iconData) {
          setSelectedIcon(parsed.iconData as ProductIconData);
          iconLoaded = true;
        } else if (parsed?.id && parsed?.svgPath) {
          setSelectedIcon(parsed as ProductIconData);
          iconLoaded = true;
        }
      } catch {
        /* ignore */
      }
    }

    if (!iconLoaded && activeDraft?.iconData) {
      setSelectedIcon(activeDraft.iconData as ProductIconData);
    }
  }, [activeDraft?.productId, activeDraft?.productIcon, activeDraft?.iconData]);

  // last saved snapshot (for unsaved changes prompt)
  const [lastSavedData, setLastSavedData] = useState<typeof formData | null>(() => {
    if (activeDraft) {
      return {
        productName: activeDraft.productName || "",
        version: activeDraft.version || "",
        description: activeDraft.productDescription || "",
      };
    }
    return null;
  });
  const [lastSavedIcon, setLastSavedIcon] = useState<ProductIconData | null>(null);

  useEffect(() => {
    if (activeDraft && !lastSavedIcon && selectedIcon) setLastSavedIcon(selectedIcon);
  }, [activeDraft, lastSavedIcon, selectedIcon]);

  // lock logic - Configuration is locked until required fields in General are filled
  const hasRequiredFieldsFilled = React.useMemo(() => {
    return Boolean(formData.productName.trim());
  }, [formData.productName]);

  const isConfigurationLocked = !hasRequiredFieldsFilled;

  // Helper to check if Configuration required fields are filled
  const isConfigurationComplete = React.useMemo(() => {
    if (!configuration.productType) return false;

    const fields = configurationFields[configuration.productType] || [];

    // Check if all required fields have values
    return fields.every((field: any) => {
      if (!field.required) return true;
      const value = configuration[field.label];
      return value && String(value).trim() !== "";
    });
  }, [configuration]);

  // Review lock
  const isReviewLocked = React.useMemo(() => {
    return !createdProductId || !isConfigurationComplete;
  }, [createdProductId, isConfigurationComplete]);

  // For "Save as Draft" button - check if ANY field is filled
  const hasAnyRequiredInput = React.useMemo(() => {
    return Boolean(
      formData.productName.trim() ||
        formData.version.trim() ||
        formData.description.trim() ||
        selectedIcon
    );
  }, [formData.productName, formData.version, formData.description, selectedIcon]);

  const hasUnsavedChanges = React.useMemo(() => {
    if (!lastSavedData) return hasAnyRequiredInput;

    const formChanged =
      lastSavedData.productName !== formData.productName ||
      lastSavedData.version !== formData.version ||
      lastSavedData.description !== formData.description;

    const iconChanged =
      lastSavedIcon?.id !== selectedIcon?.id ||
      lastSavedIcon?.svgPath !== selectedIcon?.svgPath ||
      JSON.stringify(lastSavedIcon?.outerBg) !== JSON.stringify(selectedIcon?.outerBg) ||
      lastSavedIcon?.tileColor !== selectedIcon?.tileColor;

    return formChanged || iconChanged;
  }, [formData, selectedIcon, lastSavedData, lastSavedIcon, hasAnyRequiredInput]);

  useEffect(() => {
    if (hasUnsavedChanges && !hasEverBeenEnabled) {
      setHasEverBeenEnabled(true);
    }
  }, [hasUnsavedChanges, hasEverBeenEnabled]);

  const topActionsDisabled = !hasEverBeenEnabled || !hasAnyRequiredInput;

  const handleFieldChange =
    (field: keyof typeof formData) =>
    (v: string) => {
      setFormData((p) => ({ ...p, [field]: v }));

      if (field === "productName") {
        if (errors.productName) {
          const { productName, ...rest } = errors;
          setErrors(rest);
        }
      }

      if (errors[field] && field !== "productName") {
        const { [field]: _, ...rest } = errors;
        setErrors(rest);
      }
    };

  const saveProduct = async (isDraft: boolean = false) => {
    if (isSaving) return false;

    // Only validate required fields when NOT saving as draft
    if (!isDraft) {
      const nextErrors: Record<string, string> = {};
      if (!formData.productName.trim()) nextErrors.productName = "This field is required";

      if (Object.keys(nextErrors).length) {
        setErrors((prev) => ({ ...prev, ...nextErrors }));
        return false;
      }
    }

    try {
      setIsSaving(true);

      const basePayload: ProductPayload = {
        productName: formData.productName || "",
        internalSkuCode: "",
        productDescription: formData.description || "",
        version: formData.version || "",
      };

      const payload: any = {
        ...basePayload,
        ...(isDraft ? { status: "DRAFT" } : {}),
        ...(configuration.productType ? { productType: configuration.productType } : {}),
      };

      if (createdProductId) {
        // icon handled in separate endpoint
        if (selectedIcon !== undefined) {
          await updateProductIcon(createdProductId, selectedIcon ? selectedIcon : null);

          // cache for list/edit screens
          const iconCache = JSON.parse(localStorage.getItem("iconDataCache") || "{}");
          if (selectedIcon) iconCache[createdProductId] = JSON.stringify({ iconData: selectedIcon });
          else delete iconCache[createdProductId];
          localStorage.setItem("iconDataCache", JSON.stringify(iconCache));
        }

        await updateProduct(createdProductId, payload);

        localStorage.setItem("productUpdated", Date.now().toString());
        setLastSavedData({ ...formData });
        setLastSavedIcon(selectedIcon);
        return createdProductId;
      } else {
        const resp = await createProduct(payload);
        const newProductId = resp?.productId;
        if (newProductId) {
          setCreatedProductId(newProductId);

          if (selectedIcon) {
            const iconCache = JSON.parse(localStorage.getItem("iconDataCache") || "{}");
            iconCache[newProductId] = JSON.stringify({ iconData: selectedIcon });
            localStorage.setItem("iconDataCache", JSON.stringify(iconCache));
          }

          localStorage.setItem("productUpdated", Date.now().toString());
        }

        setLastSavedData({ ...formData });
        setLastSavedIcon(selectedIcon);
        return newProductId || null;
      }
    } catch (error: any) {
      console.error("Failed to save product:", error);

      let errorMessage = "Failed to save product. Please try again.";
      if (error?.response?.data?.details) errorMessage = error.response.data.details;
      else if (error?.response?.data?.error) errorMessage = error.response.data.error;
      else if (error instanceof Error) errorMessage = error.message;

      setErrors((prev) => ({ ...prev, form: errorMessage }));
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveDraft = async () => {
    if (isDraftSaving) return false;

    try {
      setIsDraftSaving(true);
      setIsDraftSaved(false);

      const productId = await saveProduct(true);
      if (!productId) return false;

      // Ensure createdProductId is set before saving configuration
      if (!createdProductId) {
        setCreatedProductId(productId);
      }

      if (activeTab === "configuration" && configRef.current) {
        await configRef.current.submit(true, true, productId);
      }

      await new Promise((r) => setTimeout(r, 400));
      setIsDraftSaved(true);
      setTimeout(() => setIsDraftSaved(false), 2500);
      return true;
    } catch (e) {
      console.error("Error saving draft:", e);
      return false;
    } finally {
      setIsDraftSaving(false);
    }
  };

  const gotoStep = async (index: number, skipValidation: boolean = false, productIdOverride?: string | number | null) => {
    if (index < 0 || index > 2) return;

    // prevent interactions while icon picker open
    if (isIconPickerOpen) return;

    // Track the effective product ID (may be created during this navigation)
    let effectiveProductId = productIdOverride !== undefined ? productIdOverride : createdProductId;

    // forward navigation guards - validate when moving to next step
    if (index > currentStep) {
      // When navigating to Configuration or Review, ensure product exists if required fields are filled
      if (index >= 1 && !effectiveProductId && formData.productName.trim()) {
        const newProductId = await saveProduct(true);
        if (!newProductId) return;
        effectiveProductId = newProductId;
      }

      // Skip detailed validation when navigating via sidebar (skipValidation = true)
      if (!skipValidation) {
        // leaving general -> if going to configuration, validate general step
        if (currentStep === 0 && index === 1) {
          if (!formData.productName.trim()) {
            setErrors((prev) => ({ ...prev, productName: "This field is required" }));
            return;
          }
        }

        // leaving config -> if going to review, validate AND save config to server
        if (currentStep === 1 && index === 2) {
          if (!effectiveProductId || !configuration.productType) return;

          if (configRef.current) {
            const ok = await configRef.current.submit(false, true, effectiveProductId);
            if (!ok) return;
          }
        }
      }

      // When navigating to Review via sidebar, still need to save config if not already saved
      if (skipValidation && index === 2 && effectiveProductId && configuration.productType) {
        if (configRef.current) {
          const ok = await configRef.current.submit(false, true, effectiveProductId);
          if (!ok) return;
        }
      }
    }

    const tabMap: ActiveTab[] = ["general", "configuration", "review"];
    setCurrentStep(index);
    setActiveTab(tabMap[index]);
    localStorage.setItem("currentStep", String(index));
    localStorage.setItem("activeTab", tabMap[index]);
  };

  const handleSaveAndNext = async () => {
    if (activeTab === "general") {
      if (!formData.productName.trim()) {
        setErrors((prev) => ({ ...prev, productName: "This field is required" }));
        return;
      }

      // Just navigate without saving - API will be called when clicking sidebar
      await gotoStep(1, true, createdProductId);
      return;
    }

    if (activeTab === "configuration") {
      if (isConfigurationLocked) return;

      if (configRef.current) {
        const ok = await configRef.current.submit(false, true);
        if (!ok) return;
      }

      await gotoStep(2, true);
      return;
    }
  };

  const handleFinalCreate = async () => {
    if (!createdProductId) return;

    setIsSaving(true);
    try {
      const resp = await finalizeProduct(createdProductId);
      if (resp?.success) {
        setShowSuccess(true);
      } else {
        throw new Error(resp?.message || "Failed to finalize product");
      }
    } catch (e: any) {
      console.error("Error finalizing product:", e);
      const msg = e instanceof Error ? e.message : "Unknown error";
      setErrors((prev) => ({ ...prev, form: msg }));
      showToast({ kind: "error", title: "Create Failed", message: msg });
    } finally {
      setIsSaving(false);
    }
  };

  const handleGoToAllProducts = () => navigate("/get-started/products");

  const deleteAndClose = async () => {
    try {
      if (createdProductId) {
        await deleteProduct(createdProductId);
      }
    } catch (e) {
      console.error("Failed to delete product", e);
      showToast({
        kind: "error",
        title: "Delete Failed",
        message: "Unable to delete product. Please try again.",
      });
    } finally {
      onClose();
    }
  };

  // ✅ SUCCESS SCREEN
  if (showSuccess) {
    return (
      <ProductCreatedSuccess
        productName={formData.productName}
        onGoAllProducts={handleGoToAllProducts}
      />
    );
  }

  // ---------- Icons (same style as your CreateCustomer rail) ----------
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

  const UnlockedIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 26 26" fill="none">
      <path d="M19 13C19 16.3137 16.3137 19 13 19C9.68629 19 7 16.3137 7 13C7 9.68629 9.68629 7 13 7C16.3137 7 19 9.68629 19 13Z" fill="#BAC4D5" />
      <path
        d="M13 1C19.6274 1 25 6.37258 25 13C25 19.6274 19.6274 25 13 25C6.37258 25 1 19.6274 1 13C1 6.37258 6.37258 1 13 1ZM18 13C18 15.7614 15.7614 18 13 18C10.2386 18 8 15.7614 8 13C8 10.2386 10.2386 8 13 8C15.7614 8 18 10.2386 18 13ZM20 13C20 9.13401 16.866 6 13 6C9.13401 6 6 9.13401 6 13C6 16.866 9.13401 20 13 20C16.866 20 20 16.866 20 13Z"
        stroke="#BAC4D5"
        strokeWidth="2"
      />
    </svg>
  );

  // ---------- CreateFormShell rail ----------
  const rail = (
    <nav className="met-np-steps">
      {steps.map((step, i) => {
        // Completion rules (same logic, just displayed in shell rail)
        const step0Done = Boolean(formData.productName.trim());
        const step1Done = Boolean(isConfigurationComplete);

        const showRingIcon =
          (i === 0 && (currentStep === 0 || !step0Done)) ||
          (i === 1 && currentStep === 1 && step0Done) ||
          (i === 2 && (currentStep === 2 || (currentStep === 1 && step1Done)));

        const isActiveStep = i === currentStep;

        const isCompleted =
          (i === 0 && step0Done && currentStep > 0) ||
          (i === 1 && step1Done && currentStep > 1);

        const isLocked = (i === 1 && isConfigurationLocked) || (i === 2 && isReviewLocked);

        const isUnlocked = !isLocked && !isCompleted && !showRingIcon;

        const showConnector = i < steps.length - 1;

        const modalLock = isIconPickerOpen;
        const disabled = (i === 2 && isReviewLocked) || modalLock;

        return (
          <button
            key={step.id}
            type="button"
            className={[
              "met-np-step",
              isActiveStep ? "active" : "",
              isCompleted ? "completed" : "",
              isLocked ? "locked" : "",
              disabled ? "disabled" : "",
            ]
              .join(" ")
              .trim()}
            onClick={() => {
              if (disabled) return;
              void gotoStep(i, true); // keep same sidebar navigation behavior
            }}
            disabled={disabled}
            title={modalLock ? "Close the icon picker first" : isReviewLocked && i === 2 ? "Please complete configuration first" : ""}
          >
            <span className="met-np-step__bullet" aria-hidden="true">
              <span className="met-np-step__icon">
                {showRingIcon ? (
                  <ActiveRingIcon />
                ) : isCompleted ? (
                  <CompletedIcon />
                ) : isUnlocked ? (
                  <UnlockedIcon />
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
  );

  // Footer buttons (SAME actions, just rendered via CreateFormShell)
  const footerHint =
    (activeTab === "configuration" && isConfigurationLocked) ||
    (activeTab === "review" && isReviewLocked)
      ? "Complete the previous steps to unlock this step"
      : undefined;

  const footerLeft =
    activeTab === "general" ? null : activeTab === "configuration" ? (
      <SecondaryButton type="button" onClick={() => void gotoStep(0)}>
        Back
      </SecondaryButton>
    ) : (
      <SecondaryButton type="button" onClick={() => void gotoStep(1)}>
        Back
      </SecondaryButton>
    );

  const footerRight =
    activeTab === "general" ? (
      <PrimaryButton type="button" onClick={handleSaveAndNext} disabled={isSaving}>
        Save & Next
      </PrimaryButton>
    ) : activeTab === "configuration" ? (
      isConfigurationLocked ? null : (
        <PrimaryButton type="button" onClick={handleSaveAndNext} disabled={isSaving}>
          Save & Next
        </PrimaryButton>
      )
    ) : (
      <PrimaryButton type="button" onClick={handleFinalCreate} disabled={isSaving || isReviewLocked}>
        {isSaving ? "Submitting..." : "Create Product"}
      </PrimaryButton>
    );

  return (
    <>
      <TopBar
        title="Create New Product"
        onBack={() => (hasUnsavedChanges || createdProductId ? setShowSavePrompt(true) : onClose())}
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
        rail={rail}
        title={
          activeTab === "general"
            ? "GENERAL DETAILS"
            : activeTab === "configuration"
            ? "CONFIGURATION"
            : "REVIEW & CONFIRM"
        }
        locked={
          activeTab === "configuration"
            ? isConfigurationLocked
            : activeTab === "review"
            ? isReviewLocked
            : false
        }
        footerLeft={footerLeft}
        footerRight={footerRight}
        footerHint={footerHint}
      >
        <form className="met-np-form" onSubmit={(e) => e.preventDefault()}>
          <div className="met-np-form-section">
            {/* STEP 1: GENERAL */}
            {activeTab === "general" && (
              <section>
                <div className="prod-np-grid-2">
                  <InputField
                    label="Product Name"
                    value={formData.productName}
                    onChange={handleFieldChange("productName")}
                    error={errors.productName}
                    placeholder="eg. Google Maps API"
                    required
                  />

                  <InputField
                    label="Version"
                    value={formData.version}
                    onChange={handleFieldChange("version")}
                    placeholder="eg., 2.3-VOS"
                  />

                  {/* Product Icon Field - Add (DO NOT CHANGE CLASSNAMES) */}
                  {!selectedIcon && (
                    <div className="prod-np-form-group">
                      <label className="if-label">Product Icon</label>
                      <div className="prod-np-icon-field-wrapper">
                        <div className="prod-np-icon-placeholder">
                          <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 56 56" fill="none">
                            <rect x="0.525" y="0.525" width="54.95" height="54.95" rx="7.475" fill="#F8F7FA" />
                            <rect x="0.525" y="0.525" width="54.95" height="54.95" rx="7.475" stroke="#BFBECE" strokeWidth="1.05" />
                            <path
                              d="M28 25.1996C31.866 25.1996 35 22.379 35 18.8996C35 15.4202 31.866 12.5996 28 12.5996C24.134 12.5996 21 15.4202 21 18.8996C21 22.379 24.134 25.1996 28 25.1996Z"
                              stroke="#909599"
                              strokeWidth="2.1"
                            />
                            <path
                              d="M28.0008 43.4008C34.1864 43.4008 39.2008 40.5802 39.2008 37.1008C39.2008 33.6214 34.1864 30.8008 28.0008 30.8008C21.8152 30.8008 16.8008 33.6214 16.8008 37.1008C16.8008 40.5802 21.8152 43.4008 28.0008 43.4008Z"
                              stroke="#909599"
                              strokeWidth="2.1"
                            />
                          </svg>
                        </div>
                        <span className="prod-np-icon-placeholder-text">Add product icon</span>
                        <button
                          type="button"
                          className="prod-np-icon-add-btn"
                          onClick={() => setIsIconPickerOpen(true)}
                        >
                          <span>+ Add</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Product Icon Field - Selected (DO NOT CHANGE CLASSNAMES) */}
                  {selectedIcon &&
                    (() => {
                      const extractDisplayColor = (colorStr: string): string => {
                        if (!colorStr) return "#CC9434";
                        const match = colorStr.match(/var\([^,]+,\s*([^)]+)\)/);
                        return match ? match[1].trim() : colorStr;
                      };

                      const outerBg1 = extractDisplayColor(selectedIcon.outerBg?.[0] || "#F8F7FA");
                      const outerBg2 = extractDisplayColor(selectedIcon.outerBg?.[1] || "#E4EEF9");
                      const tileColor = extractDisplayColor(selectedIcon.tileColor || "#CC9434");

                      return (
                        <div className="prod-np-form-group">
                          <label className="if-label">Product Icon</label>
                          <div className="prod-np-icon-field-wrapper">
                            <div className="prod-np-icon-preview">
                              <div
                                style={{
                                  width: 50.6537,
                                  height: 46.3351,
                                  borderRadius: 12,
                                  border: "0.6px solid var(--border-border-2, #D5D4DF)",
                                  background: `
                                    linear-gradient(0deg, rgba(1,69,118,0.10) 0%, rgba(1,69,118,0.10) 100%),
                                    linear-gradient(135deg, ${outerBg1}, ${outerBg2}),
                                    radial-gradient(110% 110% at 85% 85%, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0) 60%)
                                  `,
                                  display: "flex",
                                  padding: 8,
                                  justifyContent: "center",
                                  alignItems: "center",
                                  position: "relative",
                                  overflow: "hidden",
                                }}
                              >
                                <div
                                  style={{
                                    position: "absolute",
                                    left: 10.5,
                                    top: 8.2,
                                    width: 29.45,
                                    height: 25.243,
                                    borderRadius: 5.7,
                                    background: tileColor,
                                  }}
                                />
                                <div
                                  style={{
                                    width: 29.339,
                                    height: 26.571,
                                    padding: "1.661px 3.321px",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    gap: 2.214,
                                    flexShrink: 0,
                                    borderRadius: 6,
                                    border: "0.6px solid #FFF",
                                    background: "rgba(202, 171, 213, 0.10)",
                                    backdropFilter: "blur(3.875px)",
                                    transform: "translate(3px, 2px)",
                                    boxShadow: "inset 0 1px 8px rgba(255,255,255,0.35)",
                                  }}
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="18"
                                    height="18"
                                    viewBox={selectedIcon.viewBox ?? "0 0 18 18"}
                                    fill="none"
                                    style={{ flexShrink: 0, aspectRatio: "1 / 1", display: "block" }}
                                  >
                                    <path d={selectedIcon.svgPath} fill="#FFFFFF" />
                                  </svg>
                                </div>
                              </div>
                            </div>
                            <div className="prod-np-icon-actions">
                              <EditButton onClick={() => setIsIconPickerOpen(true)} label="Edit" />
                              <DeleteButton
                                onClick={() => {
                                  setSelectedIcon(null);

                                  // Clear cache immediately to prevent icon from reappearing
                                  if (createdProductId || activeDraft?.productId) {
                                    const productId = createdProductId || activeDraft?.productId;
                                    try {
                                      const iconCache = JSON.parse(localStorage.getItem("iconDataCache") || "{}");
                                      delete iconCache[productId as any];
                                      localStorage.setItem("iconDataCache", JSON.stringify(iconCache));
                                    } catch {
                                      /* ignore */
                                    }
                                  }
                                }}
                                label="Remove"
                                variant="soft"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                  <div style={{ gridColumn: "1 / -1" }}>
                    <TextareaField
                      label="Description"
                      value={formData.description}
                      onChange={handleFieldChange("description")}
                      placeholder="eg. Mapping service API for location-based apps..."
                    />
                  </div>
                </div>

                <ProductIconPickerModal
                  isOpen={isIconPickerOpen}
                  onClose={() => setIsIconPickerOpen(false)}
                  onSelect={(icon) => {
                    setSelectedIcon(icon);
                    setIsIconPickerOpen(false);
                    document.activeElement instanceof HTMLElement && document.activeElement.blur();
                  }}
                />
              </section>
            )}

            {/* STEP 2: CONFIGURATION */}
            {activeTab === "configuration" && (
              <section>
                <ConfigurationTab
                  onConfigChange={(c) => setConfiguration((prev) => ({ ...prev, ...c }))}
                  onProductTypeChange={(t) => setConfiguration((prev) => ({ ...prev, productType: t }))}
                  ref={configRef}
                  productId={createdProductId || undefined}
                  onSubmit={async () => true}
                  initialProductType={configuration.productType}
                  isSavingDraft={isSaving}
                  readOnly={false}
                  locked={isConfigurationLocked}
                />
              </section>
            )}

            {/* STEP 3: REVIEW */}
            {activeTab === "review" && (
              <section>
                <ProductReview generalDetails={formData} configuration={configuration} />
                {/* keep ref alive */}
                <div style={{ display: "none" }}>
                  <ConfigurationTab
                    ref={configRef}
                    productId={createdProductId || undefined}
                    initialProductType={configuration.productType}
                    onConfigChange={() => {}}
                    onProductTypeChange={() => {}}
                    isSavingDraft={false}
                    readOnly={true}
                    locked={false}
                  />
                </div>
              </section>
            )}
          </div>

          {/* same “footer message area” pattern as CreateCustomer */}
          <div className="metform-footer" style={{ position: "relative" }}>
            {errors.form && <div className="prod-np-error-message">{errors.form}</div>}
          </div>
        </form>
      </CreateFormShell>

      {/* Save Draft prompt (same behavior) */}
      <SaveDraft
        isOpen={showSavePrompt}
        onClose={async () => {
          setShowSavePrompt(false);
          await deleteAndClose();
        }}
        onSave={async () => {
          const ok = await handleSaveDraft();
          const hasData = formData.productName || formData.version || formData.description;

          if (ok && hasData) {
            showToast({
              kind: "success",
              title: "Product Draft Saved",
              message: "Product draft saved successfully.",
            });
          } else if (!ok) {
            showToast({
              kind: "error",
              title: "Failed to Save Draft",
              message: "Unable to save draft. Please try again.",
            });
          }
          onClose();
        }}
        onDismiss={() => setShowSavePrompt(false)}
      />

      <ConfirmDeleteModal
        isOpen={showDeleteConfirm}
        discardLabel="Keep editing"
        confirmLabel="Discard"
        productName={formData.productName || "Untitled Product"}
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
