// NewProduct.tsx  ✅ now follows CreateUsageMetric structure + SAME classnames pattern (met-np-*)
import * as React from "react";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import TopBar from "../../componenetsss/TopBar";
import { useToast } from "../../componenetsss/ToastProvider";
import { InputField, TextareaField } from "../../componenetsss/Inputs";
import ConfirmDeleteModal from "../../componenetsss/ConfirmDeleteModal";
import { ConfigurationTab, configurationFields } from "./ConfigurationTab";
import ProductReview from "./ProductReview";
import SaveDraft from "../../componenetsss/SaveDraft";
import PrimaryButton from "../../componenetsss/PrimaryButton";
import SecondaryButton from "../../componenetsss/SecondaryButton";
import EditButton from "../../componenetsss/EditButton";
import DeleteButton from "../../componenetsss/DeleteButton";
import SectionHeader from "../../componenetsss/SectionHeader";
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
  listAllProducts,
  getProducts,
} from "../api";

import "./NewProduct.css";
import "../../componenetsss/SkeletonForm.css";

type ActiveTab = "general" | "configuration" | "review";

const steps = [
  { id: 1, title: "General Details", desc: "Start with the basics of your product." },
  { id: 2, title: "Configuration", desc: "Define configuration and parameters." },
  { id: 3, title: "Review & Confirm", desc: "Validate all details before finalizing." },
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

export default function NewProduct({ onClose, draftProduct }: NewProductProps): React.JSX.Element {
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
  const [initialFormState, setInitialFormState] = useState<any>(null);

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

  // existing products for uniqueness check
  const [existingProducts, setExistingProducts] = useState<Array<{ productName: string; skuCode: string }>>([]);

  useEffect(() => {
    (async () => {
      try {
        let data: any[] = [];
        try {
          data = await listAllProducts();
        } catch {
          try {
            data = await getProducts();
          } catch {
            data = [];
          }
        }
        const mapped = data.map((p) => ({
          productName: p.productName,
          skuCode: (((p as any).internalSkuCode ?? (p as any).skuCode ?? "") as string) || "",
        }));
        setExistingProducts(mapped);
      } catch (e) {
        console.error("Failed to fetch existing products", e);
      }
    })();
  }, []);

  const refreshExistingProducts = async () => {
    try {
      let data: any[] = [];
      try {
        data = await listAllProducts();
      } catch {
        try {
          data = await getProducts();
        } catch {
          data = [];
        }
      }
      const mapped = data.map((p) => ({
        productName: p.productName,
        skuCode: (((p as any).internalSkuCode ?? (p as any).skuCode ?? "") as string) || "",
      }));
      setExistingProducts(mapped);
      return mapped;
    } catch (e) {
      console.error("Failed to refresh existing products", e);
      return existingProducts;
    }
  };

  // Load icon from draft/cache
  useEffect(() => {
    let iconLoaded = false;

    // Only load from cache if icon wasn't explicitly removed (productIcon !== null)
    if (activeDraft?.productId && activeDraft?.productIcon !== null) {
      try {
        const iconCache = JSON.parse(localStorage.getItem("iconDataCache") || "{}");
        const cachedIconJson = iconCache[activeDraft.productId];
        if (cachedIconJson) {
          const parsedCache = typeof cachedIconJson === "string" ? JSON.parse(cachedIconJson) : cachedIconJson;
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
  // Only Product Name is required, so we check only that field
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
      return value && String(value).trim() !== '';
    });
  }, [configuration]);

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
      (lastSavedIcon?.id !== selectedIcon?.id) ||
      (lastSavedIcon?.svgPath !== selectedIcon?.svgPath) ||
      (JSON.stringify(lastSavedIcon?.outerBg) !== JSON.stringify(selectedIcon?.outerBg)) ||
      (lastSavedIcon?.tileColor !== selectedIcon?.tileColor);

    return formChanged || iconChanged;
  }, [formData, selectedIcon, lastSavedData, lastSavedIcon, hasAnyRequiredInput]);

  useEffect(() => {
    if (hasUnsavedChanges && !hasEverBeenEnabled) {
      setHasEverBeenEnabled(true);
    }
  }, [hasUnsavedChanges, hasEverBeenEnabled]);

  const topActionsDisabled = !hasEverBeenEnabled || !hasAnyRequiredInput;

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

  const lower = (s: string) => s.trim().toLowerCase();

  const handleFieldChange = (field: keyof typeof formData) => (v: string) => {
    const trimmed = v.trim();
    setFormData((p) => ({ ...p, [field]: v }));

    if (field === "productName") {
      // Clear any product name errors when typing
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

      // Check if the error is about product name already existing
      if (errorMessage.toLowerCase().includes("product") && errorMessage.toLowerCase().includes("already exist")) {
        setErrors((prev) => ({ ...prev, productName: errorMessage }));
      } else {
        setErrors((prev) => ({ ...prev, form: errorMessage }));
      }
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

  const gotoStep = async (index: number, skipValidation: boolean = false) => {
    if (index < 0 || index > 2) return;

    // prevent interactions while icon picker open
    if (isIconPickerOpen) return;

    // Track the effective product ID (may be created during this navigation)
    let effectiveProductId = createdProductId;

    // forward navigation guards - validate when moving to next step
    if (index > currentStep) {
      // When navigating to Configuration or Review, ensure product exists if required fields are filled
      if (index >= 1 && !effectiveProductId && formData.productName.trim()) {
        // Product Name is filled but product not created yet - create it
        const newProductId = await saveProduct(true);
        if (!newProductId) return;
        effectiveProductId = newProductId; // Use the returned ID immediately
      }

      // Skip detailed validation when navigating via sidebar (skipValidation = true)
      if (!skipValidation) {
        // leaving general -> if going to configuration, validate general step
        if (currentStep === 0 && index === 1) {
          // Product Name is required to proceed
          if (!formData.productName.trim()) {
            setErrors((prev) => ({ ...prev, productName: "This field is required" }));
            return;
          }
        }

        // leaving config -> if going to review, validate AND save config to server
        if (currentStep === 1 && index === 2) {
          if (!effectiveProductId || !configuration.productType) return;

          if (configRef.current) {
            const ok = await configRef.current.submit(false, true, effectiveProductId); // validate and save to server
            if (!ok) return;
          }
        }
      }

      // When navigating to Review via sidebar, still need to save config if not already saved
      if (skipValidation && index === 2 && effectiveProductId && configuration.productType) {
        if (configRef.current) {
          const ok = await configRef.current.submit(false, true, effectiveProductId); // save config to server
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
      // Validate required fields on Save & Next click
      if (!formData.productName.trim()) {
        setErrors((prev) => ({ ...prev, productName: "This field is required" }));
        return;
      }
      
      const ok = await saveProduct(true);
      if (!ok) return;
      await gotoStep(1, true); // skipValidation=true since we already validated above
      return;
    }

    if (activeTab === "configuration") {
      if (isConfigurationLocked) return;

      if (configRef.current) {
        const ok = await configRef.current.submit(false, true); // validate and save to server
        if (!ok) return;
      }

      await gotoStep(2, true); // skipValidation=true since we already validated and saved above
      return;
    }
  };

  const handleFinalCreate = async () => {
    if (!createdProductId) return;

    setIsSaving(true);
    try {
      // Configuration was already saved when navigating to Review step
      // Just finalize the product
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
        // Don't show toast here - only show when deleting from Products.tsx
      }
    } catch (e) {
      console.error("Failed to delete product", e);
      showToast({ kind: "error", title: "Delete Failed", message: "Unable to delete product. Please try again." });
    } finally {
      onClose();
    }
  };

  // ✅ SUCCESS SCREEN
  if (showSuccess) {
    return <ProductCreatedSuccess productName={formData.productName} onGoAllProducts={handleGoToAllProducts} />;
  }

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

      <div className="prod-np-viewport">
        <div className="prod-np-card">
          <div className="prod-np-grid">
            {/* LEFT rail */}
            <aside className="prod-np-rail">
              <nav className="prod-np-steps">
                {steps.map((step, i) => {
                  const isActive = i === currentStep;
                  // Only mark as completed if user has moved past it AND all required fields are filled
                  const isStep0Completed = formData.productName.trim();
                  const isStep1Completed = isConfigurationComplete;
                  const isCompleted = i < currentStep && (i === 0 ? isStep0Completed : i === 1 ? isStep1Completed : true);
                  const showConnector = i < steps.length - 1;

                  const isReview = i === 2;
                  const isDisabled = isReview && (!createdProductId || !isConfigurationComplete);
                  const modalLock = isIconPickerOpen;

                  return (
                    <button
                      key={step.id}
                      type="button"
                      className={[
                        "prod-np-step",
                        isActive ? "active" : "",
                        isCompleted ? "completed" : "",
                        isDisabled || modalLock ? "disabled" : "",
                      ]
                        .join(" ")
                        .trim()}
                      onClick={() => {
                        if (isDisabled || modalLock) return;
                        void gotoStep(i, true); // skipValidation=true for sidebar navigation
                      }}
                      disabled={isDisabled || modalLock}
                      title={
                        modalLock
                          ? "Close the icon picker first"
                          : isDisabled
                            ? "Please complete configuration first"
                            : ""
                      }
                    >
                      <span className="prod-np-step__bullet" aria-hidden="true">
                        <span className="prod-np-step__icon">
                          {isCompleted ? (
                            // Completed step - show checkmark
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                              <circle cx="12" cy="12" r="11.5" fill="var(--color-primary-800)" stroke="var(--color-primary-800)" />
                              <path d="M7 12l3 3 6-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          ) : (i === 0 && !isCompleted) || (isActive && !isConfigurationLocked) || (i === 1 && !isConfigurationLocked && !isActive) ? (
                            // Active step (unlocked), General Details, or unlocked Configuration (not active) - show dot
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                              <circle cx="12" cy="12" r="11" stroke="#C3C2D0" strokeWidth="2" />
                              <circle cx="12" cy="12" r="6" fill="#C3C2D0" />
                            </svg>
                          ) : (i === 1 && isConfigurationLocked && isActive) ? (
                            // Configuration is locked AND active - show BLUE-FILLED lock icon
                            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 26 26" fill="none">
                              <circle cx="13" cy="13" r="13" fill="var(--color-primary-800)" />
                              <path d="M10.03 11.895V9.67503C10.03 8.93905 10.3224 8.23322 10.8428 7.71281C11.3632 7.1924 12.069 6.90004 12.805 6.90004C13.541 6.90004 14.2468 7.1924 14.7672 7.71281C15.2876 8.23322 15.58 8.93905 15.58 9.67503V11.895M8.92003 11.895H16.69C17.303 11.895 17.8 12.392 17.8 13.005V16.89C17.8 17.503 17.303 18 16.69 18H8.92003C8.307 18 7.81003 17.503 7.81003 16.89V13.005C7.81003 12.392 8.307 11.895 8.92003 11.895Z" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          ) : (
                            // Locked step (not active) - show GRAY lock icon
                            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 26 26" fill="none">
                              <path d="M10.03 11.895V9.67503C10.03 8.93905 10.3224 8.23322 10.8428 7.71281C11.3632 7.1924 12.069 6.90004 12.805 6.90004C13.541 6.90004 14.2468 7.1924 14.7672 7.71281C15.2876 8.23322 15.58 8.93905 15.58 9.67503V11.895M25 13C25 19.6274 19.6274 25 13 25C6.37258 25 1 19.6274 1 13C1 6.37258 6.37258 1 13 1C19.6274 1 25 6.37258 25 13ZM8.92003 11.895H16.69C17.303 11.895 17.8 12.392 17.8 13.005V16.89C17.8 17.503 17.303 18 16.69 18H8.92003C8.307 18 7.81003 17.503 7.81003 16.89V13.005C7.81003 12.392 8.307 11.895 8.92003 11.895Z" stroke="#BAC4D5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </span>
                        {showConnector && <span className="prod-np-step__connector" />}
                      </span>

                      <span className="prod-np-step__text">
                        <span className="prod-np-step__title">{step.title}</span>
                        <span className="prod-np-step__desc">{step.desc}</span>
                      </span>
                    </button>
                  );
                })}
              </nav>
            </aside>

            {/* MAIN */}
            <main className="prod-np-main">
              <div className="af-skel-rule af-skel-rule--top" />

              <div className="prod-np-main__inner">
                <div className="prod-np-body">
                  {activeTab === "general" && (
                    <SectionHeader title="GENERAL DETAILS" className="prod-np-section-header-fixed" />
                  )}

                  {activeTab === "configuration" && (
                    <div className="prod-np-section-header-fixed" style={{ display: "flex", alignItems: "center" }}>
                      <SectionHeader title="CONFIGURATION" />
                      {isConfigurationLocked && <LockBadge />}
                    </div>
                  )}

                  {activeTab === "review" && (
                    <SectionHeader title="REVIEW & CONFIRM" className="prod-np-section-header-fixed" />
                  )}

                  <form className="prod-np-form" onSubmit={(e) => e.preventDefault()}>
                    <div className="prod-np-form-section">
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
                            {/* Product Icon Field - Add */}
                            {!selectedIcon && (
                              <div className="prod-np-form-group">
                                <label className="if-label">Product Icon</label>
                                <div className="prod-np-icon-field-wrapper">
                                  <div className="prod-np-icon-placeholder">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 56 56" fill="none">
                                      <rect x="0.525" y="0.525" width="54.95" height="54.95" rx="7.475" fill="#F8F7FA" />
                                      <rect x="0.525" y="0.525" width="54.95" height="54.95" rx="7.475" stroke="#BFBECE" strokeWidth="1.05" />
                                      <path d="M28 25.1996C31.866 25.1996 35 22.379 35 18.8996C35 15.4202 31.866 12.5996 28 12.5996C24.134 12.5996 21 15.4202 21 18.8996C21 22.379 24.134 25.1996 28 25.1996Z" stroke="#909599" strokeWidth="2.1" />
                                      <path d="M28.0008 43.4008C34.1864 43.4008 39.2008 40.5802 39.2008 37.1008C39.2008 33.6214 34.1864 30.8008 28.0008 30.8008C21.8152 30.8008 16.8008 33.6214 16.8008 37.1008C16.8008 40.5802 21.8152 43.4008 28.0008 43.4008Z" stroke="#909599" strokeWidth="2.1" />
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

                            {/* Product Icon Field - Selected */}
                            {selectedIcon && (() => {
                              // Helper function to extract color from CSS var() or return as-is
                              const extractDisplayColor = (colorStr: string): string => {
                                if (!colorStr) {
                                  console.log('⚠️ extractDisplayColor: Empty color string, using default #CC9434');
                                  return '#CC9434';
                                }
                                console.log('🔍 extractDisplayColor input:', colorStr);
                                const match = colorStr.match(/var\([^,]+,\s*([^)]+)\)/);
                                const result = match ? match[1].trim() : colorStr;
                                console.log('🔍 extractDisplayColor result:', result);
                                return result;
                              };

                              const outerBg1 = extractDisplayColor(selectedIcon.outerBg?.[0] || '#F8F7FA');
                              const outerBg2 = extractDisplayColor(selectedIcon.outerBg?.[1] || '#E4EEF9');
                              const tileColor = extractDisplayColor(selectedIcon.tileColor || '#CC9434');

                              console.log('🎨 Display colors - outerBg1:', outerBg1, 'outerBg2:', outerBg2, 'tileColor:', tileColor);

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
                                          border: '0.6px solid var(--border-border-2, #D5D4DF)',
                                          background: `
                                          linear-gradient(0deg, rgba(1,69,118,0.10) 0%, rgba(1,69,118,0.10) 100%),
                                          linear-gradient(135deg, ${outerBg1}, ${outerBg2}),
                                          radial-gradient(110% 110% at 85% 85%, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0) 60%)
                                        `,
                                          display: 'flex',
                                          padding: 8,
                                          justifyContent: 'center',
                                          alignItems: 'center',
                                          position: 'relative',
                                          overflow: 'hidden',
                                        }}
                                      >
                                        <div
                                          style={{
                                            position: 'absolute',
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
                                            padding: '1.661px 3.321px',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            gap: 2.214,
                                            flexShrink: 0,
                                            borderRadius: 6,
                                            border: '0.6px solid #FFF',
                                            background: 'rgba(202, 171, 213, 0.10)',
                                            backdropFilter: 'blur(3.875px)',
                                            transform: 'translate(3px, 2px)',
                                            boxShadow: 'inset 0 1px 8px rgba(255,255,255,0.35)',
                                          }}
                                        >
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="18"
                                            height="18"
                                            viewBox={selectedIcon.viewBox ?? "0 0 18 18"}
                                            fill="none"
                                            style={{ flexShrink: 0, aspectRatio: '1 / 1', display: 'block' }}
                                          >
                                            <path d={selectedIcon.svgPath} fill="#FFFFFF" />
                                          </svg>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="prod-np-icon-actions">
                                      <EditButton
                                        onClick={() => setIsIconPickerOpen(true)}
                                        label="Edit"
                                      />
                                      <DeleteButton
                                        onClick={() => {
                                          setSelectedIcon(null);
                                          // Clear cache immediately to prevent icon from reappearing
                                          if (createdProductId || activeDraft?.productId) {
                                            const productId = createdProductId || activeDraft?.productId;
                                            try {
                                              const iconCache = JSON.parse(localStorage.getItem("iconDataCache") || "{}");
                                              delete iconCache[productId];
                                              localStorage.setItem("iconDataCache", JSON.stringify(iconCache));
                                              console.log('🗑️ Cleared icon cache for product', productId);
                                            } catch (e) {
                                              console.warn('Failed to clear icon cache:', e);
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
                              onConfigChange={() => { }}
                              onProductTypeChange={() => { }}
                              isSavingDraft={false}
                              readOnly={true}
                              locked={false}
                            />
                          </div>
                        </section>
                      )}
                    </div>

                    {/* FOOTER ✅ same pattern as CreateUsageMetric */}
                    <div className="prod-np-form-footer" style={{ position: "relative" }}>
                      {errors.form && <div className="prod-np-error-message">{errors.form}</div>}

                      {activeTab === "general" && (
                        <div className="prod-np-btn-group prod-np-btn-group--next">
                          <PrimaryButton type="button" onClick={handleSaveAndNext}>
                            Save & Next
                          </PrimaryButton>
                        </div>
                      )}

                      {activeTab === "configuration" && (
                        <>
                          {isConfigurationLocked ? (
                            <div
                              className="prod-np-footer-hint"
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
                              Fill the previous steps to unlock this step
                            </div>
                          ) : (
                            <>
                              <div className="prod-np-btn-group prod-np-btn-group--back">
                                <SecondaryButton type="button" onClick={() => void gotoStep(0)}>
                                  Back
                                </SecondaryButton>
                              </div>
                              <div className="prod-np-btn-group prod-np-btn-group--next">
                                <PrimaryButton type="button" onClick={handleSaveAndNext} disabled={isSaving}>
                                  Save & Next
                                </PrimaryButton>
                              </div>
                            </>
                          )}
                        </>
                      )}

                      {activeTab === "review" && (
                        <>
                          <div className="prod-np-btn-group prod-np-btn-group--back">
                            <SecondaryButton type="button" onClick={() => void gotoStep(1)}>
                              Back
                            </SecondaryButton>
                          </div>
                          <div className="prod-np-btn-group prod-np-btn-group--next">
                            <PrimaryButton type="button" onClick={handleFinalCreate} disabled={isSaving}>
                              {isSaving ? "Submitting..." : "Create Product"}
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

          {/* Save Draft prompt ✅ same position/style */}
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
                showToast({ kind: "success", title: "Product Draft Saved", message: "Product draft saved successfully." });
              } else if (!ok) {
                showToast({ kind: "error", title: "Failed to Save Draft", message: "Unable to save draft. Please try again." });
              }
              onClose();
            }}
            onDismiss={() => setShowSavePrompt(false)}
          />
        </div>
      </div>

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
