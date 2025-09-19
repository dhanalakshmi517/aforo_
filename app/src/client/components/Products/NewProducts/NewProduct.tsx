import * as React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import TopBar from "../../componenetsss/TopBar";
import { useToast } from "../../componenetsss/ToastProvider";
import { InputField, TextareaField } from "../../componenetsss/Inputs";
import ConfirmDeleteModal from "../../componenetsss/ConfirmDeleteModal";
import { ConfigurationTab } from "./ConfigurationTab";
import ProductReview from "./ProductReview";
import SaveDraft from "../../componenetsss/SaveDraft";
import { createProduct, updateProduct, finalizeProduct, deleteProduct, ProductPayload, listAllProducts, getProducts } from "../api";

import "./NewProduct.css";

type ActiveTab = "general" | "configuration" | "review";

const steps = [
  { id: 1, title: "General Details", desc: "Start with the basics of your product." },
  { id: 2, title: "Configuration",  desc: "Define configuration and parameters." },
  { id: 3, title: "Review & Confirm", desc: "Validate all details before finalizing." },
];

export interface DraftProduct {
  productId?: string;
  productName?: string;
  version?: string;
  internalSkuCode?: string;
  skuCode?: string;
  productDescription?: string;
  status?: string;
  productType?: string;
}

interface NewProductProps {
  onClose: () => void;
  draftProduct?: DraftProduct;
}

export default function NewProduct({ onClose, draftProduct }: NewProductProps): JSX.Element {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [showSavePrompt, setShowSavePrompt] = useState(false);

  useEffect(() => {
    document.body.classList.add("create-product-page");
    return () => document.body.classList.remove("create-product-page");
  }, []);

  const [currentStep, setCurrentStep] = useState(0);
  const [activeTab, setActiveTab] = useState<ActiveTab>("general");

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDraftSaving, setIsDraftSaving] = useState(false);
  const [isDraftSaved, setIsDraftSaved] = useState(false);

  // Initialize form fields with draft values if available
  const [formData, setFormData] = useState({
    productName: draftProduct?.productName || "",
    version: draftProduct?.version || "",
    skuCode: (draftProduct?.internalSkuCode ?? draftProduct?.skuCode) || "",
    description: draftProduct?.productDescription || "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [configuration, setConfiguration] = useState<Record<string, any>>({
    productType: draftProduct?.productType || '' // Prefill product type if available
  });
  const [createdProductId, setCreatedProductId] = useState<string | null>(draftProduct?.productId || null);
  const [saving, setSaving] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [saveDraftSuccess, setSaveDraftSuccess] = useState(false);
  // store existing products for uniqueness checks
  const [existingProducts, setExistingProducts] = useState<Array<{ productName: string; skuCode: string }>>([]);

  // fetch existing products once
  useEffect(() => {
    (async () => {
      try {
        try {
          let data: any[] = [];
          try {
            data = await listAllProducts();
          } catch {
            // fallback to authenticated endpoint
            try { data = await getProducts(); } catch { data = []; }
          }
          const mapped = data.map(p => ({ productName: p.productName, skuCode: ((p as any).internalSkuCode ?? (p as any).skuCode ?? '') as string }));
          setExistingProducts(mapped);
        } catch (e) { /* already logged */ }
      } catch (e) {
        console.error('Failed to fetch existing products', e);
      }
    })();
  }, []);

  const configRef = React.useRef<any>(null);

  // Generic change handler to update form and clear field error
  const handleFieldChange = (field: keyof typeof formData) => (v: string) => {
    const trimmed = v.trim();
    setFormData({ ...formData, [field]: v });
    // uniqueness check for productName and skuCode
    if (field === 'productName') {
      // Exclude current draft product from uniqueness check
      const duplicate = existingProducts.some(p => 
        (p.productName || '').toLowerCase() === trimmed.toLowerCase() && 
        p.productName !== draftProduct?.productName
      );
      if (duplicate) {
        setErrors(prev => ({ ...prev, productName: 'Must be unique' }));
      } else if (errors.productName === 'Must be unique') {
        const { productName, ...rest } = errors;
        setErrors(rest);
      }
    }
    if (field === 'skuCode') {
      // Exclude current draft product from uniqueness check
      const duplicate = existingProducts.some(p => 
        (p.skuCode || '').toLowerCase() === trimmed.toLowerCase() && 
        p.skuCode !== (draftProduct?.internalSkuCode ?? draftProduct?.skuCode)
      );
      if (duplicate) {
        setErrors(prev => ({ ...prev, skuCode: 'Must be unique' }));
      } else if (errors.skuCode === 'Must be unique') {
        const { skuCode, ...rest } = errors;
        setErrors(rest);
      }
    }
    if (errors[field]) {
      const { [field]: _, ...rest } = errors;
      setErrors(rest);
    }
  };

  const handleFinalSubmit = async () => {
    if (!createdProductId) {
      console.error('No product ID available for finalization');
      return;
    }

    setSaving(true);
    try {
      const response = await finalizeProduct(createdProductId);
      if (response.success) {
        // Show success message and close the form
        console.log('Product created and finalized successfully!');
        onClose();
      } else {
        throw new Error(response.message || 'Failed to finalize product');
      }
    } catch (error: unknown) {
      console.error('Error finalizing product:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      console.error('Failed to finalize product:', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const gotoStep = (index: number) => {
    setCurrentStep(index);
    const firstWord = steps[index].title.split(" ")[0].toLowerCase() as ActiveTab;
    setActiveTab(firstWord);
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((p) => p - 1);
    } else {
      // Just go back if on first step
      onClose();
    }
  };

  // Track the last saved form data to detect changes
  const [lastSavedData, setLastSavedData] = useState<typeof formData | null>(null);

  const saveProduct = async (isDraft: boolean = false) => {
    console.log('Saving product...', { isDraft, formData });
    
    // Only validate required fields if not a draft
    if (!isDraft) {
      const newErrors: Record<string, string> = {};
      // uniqueness checks - exclude current draft product
      const lower = (s:string)=>s.trim().toLowerCase();
      if (formData.productName && existingProducts.some(p=> 
        lower(p.productName||'')===lower(formData.productName) && 
        p.productName !== draftProduct?.productName
      )) {
        newErrors.productName = 'Must be unique';
      }
      if (formData.skuCode && existingProducts.some(p=> 
        lower(p.skuCode||'')===lower(formData.skuCode) && 
        p.skuCode !== (draftProduct?.internalSkuCode ?? draftProduct?.skuCode)
      )) {
        newErrors.skuCode = 'Must be unique';
      }
      if (activeTab === 'general') {
        if (!formData.productName.trim()) {
          newErrors.productName = 'This field is required';
        }
        if (!formData.skuCode.trim()) {
          newErrors.skuCode = 'This field is required';
        }
        
        if (Object.keys(newErrors).length > 0) {
          setErrors(newErrors);
          return false;
        }
      }
    }

    try {
      setSaving(true);
      
      // Create base payload with current form data
      const basePayload: ProductPayload = {
        productName: formData.productName || '',
        internalSkuCode: formData.skuCode || '',
        productDescription: formData.description || '',
        version: formData.version || ''
      };

      if (isDraft || !createdProductId) {
        // For new products or drafts, include all fields
        const payload = {
          ...basePayload,
          ...(isDraft ? { status: 'DRAFT' } : {})
        };
        
        if (createdProductId) {
          // Update existing product as draft
          console.log('Updating product as draft with ID:', createdProductId);
          await updateProduct(createdProductId, payload);
          console.log('Draft updated');
        } else {
          // Create new product (draft or not)
          console.log('Creating new product with payload:', payload);
          const response = await createProduct(payload);
          setCreatedProductId(response.productId);
          console.log('Product created with ID:', response.productId);
        }
      } else {
        // For updates, only include changed fields
        const changes: Partial<ProductPayload> = {};
        
        if (lastSavedData?.productName !== formData.productName) {
          changes.productName = basePayload.productName;
        }
        if (lastSavedData?.skuCode !== formData.skuCode) {
          changes.internalSkuCode = basePayload.internalSkuCode;
        }
        if (lastSavedData?.description !== formData.description) {
          changes.productDescription = basePayload.productDescription;
        }
        if (lastSavedData?.version !== formData.version) {
          changes.version = basePayload.version;
        }
        
        if (Object.keys(changes).length === 0) {
          console.log('No changes to save');
          return true;
        }
        
        console.log('Updating product with changes:', changes);
        await updateProduct(createdProductId, changes);
        console.log('Product updated with changes');
      }
      
      // Update last saved data
      setLastSavedData({ ...formData });
      return true;
    } catch (error) {
      console.error('Failed to save product:', error);
      setErrors(prev => ({
        ...prev,
        form: error instanceof Error ? error.message : 'Failed to save product. Please try again.'
      }));
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDraft = async () => {
    console.log('Save draft clicked');
    if (isDraftSaving) {
      console.log('Save already in progress');
      return false;
    }

    try {
      setIsDraftSaving(true);
      setSaveDraftSuccess(false);

      // Create draft data from current form state
      const draftData = {
        productName: formData.productName,
        version: formData.version,
        internalSkuCode: formData.skuCode, // Map skuCode to internalSkuCode
        productDescription: formData.description,
        status: 'DRAFT' as const
      };

      let savedProduct;
      
      if (createdProductId) {
        // Update existing product
        savedProduct = await updateProduct(createdProductId, draftData);
      } else {
        // Create new product as draft
        savedProduct = await createProduct(draftData);
        setCreatedProductId(savedProduct.productId);
      }

      // If we're on the configuration tab, save the configuration as well
      if (activeTab === 'configuration' && configRef.current) {
        await configRef.current.submit(true);
      }

      console.log('Draft saved successfully');
      setSaveDraftSuccess(true);
      setTimeout(() => setSaveDraftSuccess(false), 3000);
      return true;
    } catch (error) {
      console.error('Error saving draft:', error);
      setSaveDraftSuccess(false);
      return false;
    } finally {
      setIsDraftSaving(false);
    }
  };

  const hasErrors = () => Object.keys(errors).length > 0;

  const handleSaveAndNext = async () => {
    if (hasErrors()) return;
    const success = await saveProduct();
    if (!success) return;

    // Move to the next tab or submit the form if we're on the last tab
    if (activeTab === 'general') {
      const configTabIndex = steps.findIndex(step => step.title.toLowerCase().includes('configuration'));
      if (configTabIndex > -1) {
        gotoStep(configTabIndex);
      }
    } else if (activeTab === 'configuration') {
      try {
        console.log('Starting configuration save...');
        setSaving(true);
        // Trigger the configuration tab's submit handler
        if (configRef.current) {
          console.log('Calling configRef.current.submit()');
          const success = await configRef.current.submit();
          console.log('Submit result:', success);
          if (success) {
            // Only move to review tab if configuration was saved successfully
            console.log('Configuration saved successfully, moving to review tab');
            const reviewTabIndex = steps.findIndex(step => step.title.toLowerCase().includes('review'));
            if (reviewTabIndex > -1) {
              gotoStep(reviewTabIndex);
            }
          } else {
            console.log('Configuration save failed or returned false');
          }
        } else {
          console.error('configRef.current is null');
        }
      } catch (error) {
        console.error('Failed to save configuration:', error);
        setErrors(prev => ({
          ...prev,
          form: error instanceof Error ? error.message : 'Failed to save configuration. Please check your inputs and try again.'
        }));
      } finally {
        setSaving(false);
      }
    } else {
      // For other tabs, just move to the next step
      const currentIndex = steps.findIndex(step => step.title.toLowerCase().includes(activeTab));
      if (currentIndex < steps.length - 1) {
        gotoStep(currentIndex + 1);
      }
    }
  };

  return (
    <>
      <TopBar
        title="Create New Product"
        onBack={() => setShowSavePrompt(true)}
        cancel={{ onClick: () => setShowDeleteConfirm(true) }}
        save={{ 
          onClick: handleSaveDraft, 
          label: isDraftSaved ? "Saved!" : "Save as Draft",
          saved: isDraftSaved,
          saving: isDraftSaving,
          labelWhenSaved: "Saved!"
        }}
      />

      <div className="np-viewport">
        <div className="np-card">
          <div className="np-grid">
            {/* LEFT rail */}
            <aside className="np-rail">
              <nav className="np-steps">
                {steps.map((step, i) => {
                  const isActive = i === currentStep;
                  const isCompleted = i < currentStep;
                  const showConnector = i < steps.length - 1;
                  return (
                    <button
                      key={step.id}
                      type="button"
                      className={[
                        "np-step",
                        isActive ? "active" : "",
                        isCompleted ? "completed" : "",
                      ].join(" ").trim()}
                      onClick={() => gotoStep(i)}
                    >
                      {/* Bullet + connector column */}
                      <span className="np-step__bullet" aria-hidden="true">
                        {/* Circle bullet */}
                        <span className="np-step__icon">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="11" stroke="#C3C2D0" strokeWidth="2" />
                            <circle cx="12" cy="12" r="6" fill="#C3C2D0" />
                          </svg>
                        </span>

                        {/* Vertical connector (hidden on last step) */}
                        {showConnector && <span className="np-step__connector" />}
                      </span>

                      {/* Text column */}
                      <span className="np-step__text">
                        <span className="np-step__title">{step.title}</span>
                        <span className="np-step__desc">{step.desc}</span>
                      </span>
                    </button>
                  );
                })}
              </nav>
            </aside>

            {/* MAIN area */}
            <main className="np-main">
              <div className="np-main__inner">
                <div className="np-body">
                  <form className="np-form" onSubmit={(e) => e.preventDefault()}>
                    <div className="np-form-section">
                      {activeTab === "general" && (
                        <section>
                          <div className="np-section-header">
                            <h3 className="np-section-title">GENERAL DETAILS</h3>
                          </div>

                          <div className="np-grid ">
                            <InputField
                              label="Product Name"
                              value={formData.productName}
                              onChange={handleFieldChange('productName')}
                              error={errors.productName}
                              placeholder="eg. Google Maps API"
                            />
                            <InputField
                              label="Version"
                              value={formData.version}
                              onChange={handleFieldChange('version')}
                              placeholder="eg., 2.3-VOS"
                            />
                            <InputField
                              label="SKU Code"
                              value={formData.skuCode}
                              onChange={handleFieldChange('skuCode')}
                              placeholder="eg. API-WTHR-STD-001"
                              error={errors.skuCode}
                            />
                            <TextareaField
                              label="Description"
                              value={formData.description}
                              onChange={handleFieldChange('description')}
                              placeholder="eg. Mapping service API for location-based apps..."
                            />
                          </div>
                        </section>
                      )}

                      {activeTab === "configuration" && (
                        <section>
                          <div className="np-section-header">
                            <h3 className="np-section-title">CONFIGURATION</h3>
                            {createdProductId && (
                              <div className="text-sm text-gray-500 mt-1">
                              </div>
                            )}
                          </div>
                          <ConfigurationTab
                            onConfigChange={(c) => setConfiguration((prev) => ({ ...prev, ...c }))}
                            onProductTypeChange={(t) => setConfiguration({ productType: t })}
                            ref={configRef}
                            productId={createdProductId || undefined}
                            onSubmit={async (isDraft?: boolean) => {
                              if (!isDraft) {
                                // Only navigate to review for non-draft saves
                                const reviewTabIndex = steps.findIndex(step => step.title.toLowerCase().includes('review'));
                                if (reviewTabIndex > -1) {
                                  gotoStep(reviewTabIndex);
                                }
                              }
                              return true;
                            }}
                            initialProductType={configuration.productType}
                            isSavingDraft={savingDraft}
                          />
                        </section>
                      )}

                      {activeTab === "review" && (
                        <section>
                          <div className="np-section-header">
                            <h3 className="np-section-title">REVIEW & CONFIRM</h3>
                          </div>
                          <ProductReview generalDetails={formData} configuration={configuration} />
                        </section>
                      )}
                    </div>

                    {/* Footer actions on a line */}
                    <div className="np-form-footer">
                      {activeTab === "general" && (
                        <>
                          {errors.form && (
                            <div className="np-error-message">{errors.form}</div>
                          )}
                          <div className="np-btn-group np-btn-group--next">
                          <button
                            type="button"
                            className="np-btn np-btn--primary"
                            onClick={handleSaveAndNext}
                          >
                            Save & Next
                          </button>
                        </div>
                        </>
                      )}

                      {activeTab === "configuration" && (
                        <>
                          <div className="np-btn-group np-btn-group--back">
                            <button
                              type="button"
                              className="np-btn np-btn--ghost"
                              onClick={() => gotoStep(0)}
                            >
                              Back
                            </button>
                          </div>
                          <div className="np-btn-group np-btn-group--next">
                          <button
                            type="button"
                            className="np-btn np-btn--primary"
                            onClick={async () => {
                              try {
                                setSaving(true);
                                if (configRef.current) {
                                  const success = await configRef.current.submit();
                                  if (success) {
                                    gotoStep(2);
                                  }
                                }
                              } catch (error) {
                                console.error('Error saving configuration:', error);
                                setErrors(prev => ({
                                  ...prev,
                                  form: 'Failed to save configuration. Please try again.'
                                }));
                              } finally {
                                setSaving(false);
                              }
                            }}
                            disabled={saving}
                          >
                            {saving ? 'Saving...' : 'Save & Next'}
                          </button>
                        </div>
                        </>
                      )}

                      {activeTab === "review" && (
                        <>
                          <div className="np-btn-group np-btn-group--back">
                            <button
                              type="button"
                              className="np-btn np-btn--ghost"
                              onClick={() => gotoStep(1)}
                            >
                              Back
                            </button>
                          </div>
                          <div className="np-btn-group np-btn-group--next">
                            <button 
                              type="button" 
                              className="np-btn np-btn--primary"
                              onClick={() => {
                                if (!createdProductId) {
                                  console.error('No product ID available for finalization');
                                  return;
                                }
                                setSaving(true);
                                finalizeProduct(createdProductId)
                                  .then(response => {
                                    if (response.success) {
                                      console.log('Product created and finalized successfully!');
                                      onClose();
                                    } else {
                                      throw new Error(response.message || 'Failed to finalize product');
                                    }
                                  })
                                  .catch(error => {
                                    console.error('Error finalizing product:', error);
                                    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
                                    console.error('Failed to finalize product:', errorMessage);
                                  })
                                  .finally(() => {
                                    setSaving(false);
                                  });
                              }}
                              disabled={saving}
                            >
                              {saving ? 'Submitting...' : 'Create Product'}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </form>
                </div>
              </div>
            </main>
          </div>

      {/* Save Draft confirmation modal */}
      <SaveDraft
        isOpen={showSavePrompt}
        onClose={async () => {
          setShowSavePrompt(false);
          let ok = true;
          try {
            if (createdProductId) {
              await deleteProduct(createdProductId);
            }
          } catch (e) {
            console.error('Failed to delete product on discard', e);
            ok = false;
          } finally {
            showToast({
              kind: ok ? 'success' : 'error',
              title: ok ? 'Product Deleted' : 'Delete Failed',
              message: ok ? 'Product deleted successfully.' : 'Unable to delete product. Please try again.'
            });
            onClose();
          }
        }}
        onSave={async () => {
          const ok = await handleSaveDraft();
          showToast({
            kind: ok ? "success" : "error",
            title: ok ? "Product Draft Saved" : "Failed to Save Draft",
            message: ok ? "Product draft saved successfully." : "Unable to save draft. Please try again."
          });
          onClose();
        }}
        onDismiss={() => {
          // Just close the popup, don't close the entire form
          setShowSavePrompt(false);
        }}
      />
      </div>
      </div>

      {/* Delete confirmation modal */}
      <ConfirmDeleteModal
        isOpen={showDeleteConfirm} 
        productName={formData.productName || "this product"}
        onConfirm={async () => {
          let ok = true;
          try {
            if (createdProductId) {
              await deleteProduct(createdProductId);
            }
          } catch (e) {
            console.error('Failed to delete product', e);
            ok = false;
          } finally {
            showToast({
              kind: ok ? 'success' : 'error',
              title: ok ? 'Product Deleted' : 'Delete Failed',
              message: ok ? 'Product deleted successfully.' : 'Unable to delete product. Please try again.'
            });
            setShowDeleteConfirm(false);
            onClose();
          }
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
}


