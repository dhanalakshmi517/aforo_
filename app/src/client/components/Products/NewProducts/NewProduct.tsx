import * as React from "react";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import TopBar from "../../componenetsss/TopBar";
import { useToast } from "../../componenetsss/ToastProvider";
import { InputField, TextareaField } from "../../componenetsss/Inputs";
import ConfirmDeleteModal from "../../componenetsss/ConfirmDeleteModal";
import { ConfigurationTab } from "./ConfigurationTab";
import ProductReview from "./ProductReview";
import SaveDraft from "../../componenetsss/SaveDraft";
import PrimaryButton from "../../componenetsss/PrimaryButton";
import SecondaryButton from "../../componenetsss/SecondaryButton";
import { createProduct, updateProduct, updateProductIcon, finalizeProduct, deleteProduct, ProductPayload, listAllProducts, getProducts } from "../api";
import ProductIconPickerModal from "../ProductIconPickerModal";
import { ProductIconData } from "../ProductIcon";

import "./NewProduct.css";
import "../../componenetsss/SkeletonForm.css";

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
  productIcon?: string; // JSON string containing icon data
  iconData?: ProductIconData; // structured icon data when passed directly
}

interface NewProductProps {
  onClose: () => void;
  draftProduct?: DraftProduct;
}

export default function NewProduct({ onClose, draftProduct }: NewProductProps): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  
  // Get draft product from route state if available
  const draftFromState = (location.state as any)?.draftProduct;
  const activeDraft = draftFromState || draftProduct;

  useEffect(() => {
    document.body.classList.add("create-product-page");
    
    // Handle browser back button
    const handleBackButton = (event: PopStateEvent) => {
      // Prevent default back behavior
      event.preventDefault();
      // Navigate to products list
      navigate('/get-started/products');
    };
    
    // Add event listener for popstate (back/forward navigation)
    window.addEventListener('popstate', handleBackButton);
    
    // Push a new entry to the history stack
    window.history.pushState(null, '', window.location.pathname);
    
    return () => {
      document.body.classList.remove("create-product-page");
      window.removeEventListener('popstate', handleBackButton);
      // Clear localStorage on unmount
      localStorage.removeItem('activeTab');
      localStorage.removeItem('currentStep');
      localStorage.removeItem('configFormData');
      localStorage.removeItem('configProductType');
    };
  }, [navigate]);

  const [currentStep, setCurrentStep] = useState(() => {
    const saved = localStorage.getItem('currentStep');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [activeTab, setActiveTab] = useState<ActiveTab>(() => {
    const saved = localStorage.getItem('activeTab');
    return (saved as ActiveTab) || "general";
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDraftSaving, setIsDraftSaving] = useState(false);
  const [isDraftSaved, setIsDraftSaved] = useState(false);

  // Initialize form fields with draft values if available
  const [formData, setFormData] = useState({
    productName: activeDraft?.productName || "",
    version: activeDraft?.version || "",
    skuCode: (activeDraft?.internalSkuCode ?? activeDraft?.skuCode) || "",
    description: activeDraft?.productDescription || "",
  });
  const [selectedIcon, setSelectedIcon] = useState<ProductIconData | null>(null);
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [configuration, setConfiguration] = useState<Record<string, any>>({
    productType: activeDraft?.productType || '' // Prefill product type if available
  });
  const [createdProductId, setCreatedProductId] = useState<string | null>(activeDraft?.productId || null);

  // Load icon from draft product if available
  useEffect(() => {
    if (activeDraft?.productIcon) {
      try {
        console.log('Loading icon from draft:', activeDraft.productIcon);
        const parsedIcon = JSON.parse(activeDraft.productIcon);
        
        // Check if we have the full iconData (new format)
        if (parsedIcon.iconData) {
          console.log('Loading icon from iconData field');
          console.log('🎨 Full iconData structure:', parsedIcon.iconData);
          console.log('🎨 outerBg colors:', parsedIcon.iconData.outerBg);
          console.log('🎨 tileColor:', parsedIcon.iconData.tileColor);
          setSelectedIcon(parsedIcon.iconData as ProductIconData);
          console.log('Icon loaded successfully:', parsedIcon.iconData);
        } 
        // Fallback: check if the parsed data itself is the icon (old format)
        else if (parsedIcon.id) {
          console.log('Loading icon from root level (old format)');
          console.log('🎨 Root level icon structure:', parsedIcon);
          console.log('🎨 outerBg colors:', parsedIcon.outerBg);
          console.log('🎨 tileColor:', parsedIcon.tileColor);
          setSelectedIcon(parsedIcon as ProductIconData);
          console.log('Icon loaded successfully');
        }
        // If only svgContent exists, we can't reconstruct the icon picker data
        else if (parsedIcon.svgContent) {
          console.warn('Icon only has svgContent, cannot load into icon picker. Please re-select icon.');
        }
      } catch (error) {
        console.error('Error parsing icon data:', error);
      }
    }
    // direct iconData field (already structured)
    if (!selectedIcon && activeDraft?.iconData) {
      console.log('Loading icon from direct iconData field');
      setSelectedIcon(activeDraft.iconData as ProductIconData);
    }
  }, [activeDraft?.productIcon, activeDraft?.iconData]);
  const [isSaving, setIsSaving] = useState(false);
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

  // Lock logic - similar to CreateUsageMetric
  const hasAnyRequiredInput = React.useMemo(() => {
    return Boolean(
      formData.productName.trim() ||
      formData.version.trim() ||
      formData.skuCode.trim() ||
      formData.description.trim() ||
      selectedIcon
    );
  }, [
    formData.productName,
    formData.version,
    formData.skuCode,
    formData.description,
    selectedIcon
  ]);

  const isConfigurationLocked = !hasAnyRequiredInput;

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
        <path d="M4.66667 7.33334V4.66668C4.66667 3.78262 5.01786 2.93478 5.64298 2.30965C6.2681 1.68453 7.11595 1.33334 8 1.33334C8.88406 1.33334 9.7319 1.68453 10.357 2.30965C10.9821 2.93478 11.3333 3.78262 11.3333 4.66668V7.33334M3.33333 7.33334H12.6667C13.403 7.33334 14 7.9303 14 8.66668V13.3333C14 14.0697 13.403 14.6667 12.6667 14.6667H3.33333C2.59695 14.6667 2 14.0697 2 13.3333V8.66668C2 7.9303 2.59695 7.33334 3.33333 7.33334Z" stroke="#75797E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </span>
  );

  // Generic change handler to update form and clear field error
  const handleFieldChange = (field: keyof typeof formData) => (v: string) => {
    const trimmed = v.trim();
    setFormData({ ...formData, [field]: v });
    // uniqueness check for productName and skuCode
    if (field === 'productName') {
      // Exclude current draft product from uniqueness check
      const duplicate = existingProducts.some(p => 
        (p.productName || '').toLowerCase() === trimmed.toLowerCase() && 
        p.productName !== activeDraft?.productName
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
        p.skuCode !== (activeDraft?.internalSkuCode ?? activeDraft?.skuCode)
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
    // First ensure configuration is saved
    if (configRef.current) {
      const ok = await configRef.current.submit();
      if (!ok) return; // abort if configuration failed
    }
    if (!createdProductId) {
      console.error('No product ID available for finalization');
      return;
    }

    setIsSaving(true);
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
      setIsSaving(false);
    }
  };

  const gotoStep = async (index: number) => {
      // when jumping forward, make sure we have a product record
  if (index > currentStep) {
    // 1️⃣ From General ➜ Configuration or further: create/update product shell first
    if (currentStep === 0 && !createdProductId) {
      const ok = await saveProduct(true); // creates DRAFT product shell only if not yet created
      if (!ok) return;
    }

    // 2️⃣ From Configuration ➜ Review : validate + persist configuration draft
    if (currentStep === 1 && index === 2) {
      if (configRef.current) {
        const valid = await configRef.current.submit(false, true); // validate + save to backend
        if (!valid) return;
      }
    }
  }

  setCurrentStep(index);
    const firstWord = steps[index].title.split(" ")[0].toLowerCase() as ActiveTab;
    setActiveTab(firstWord);
    // Store in localStorage to persist state
    localStorage.setItem('activeTab', firstWord);
    localStorage.setItem('currentStep', index.toString());
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
    console.log('Saving product...', { isDraft, formData, selectedIcon });
    
    // Only validate required fields if not a draft
    if (!isDraft) {
      const newErrors: Record<string, string> = {};
      // uniqueness checks - exclude current draft product
      const lower = (s:string)=>s.trim().toLowerCase();
      if (formData.productName && existingProducts.some(p=> 
        lower(p.productName||'')===lower(formData.productName) && 
        p.productName !== activeDraft?.productName
      )) {
        newErrors.productName = 'Must be unique';
      }
      if (formData.skuCode && existingProducts.some(p=> 
        lower(p.skuCode||'')===lower(formData.skuCode) && 
        p.skuCode !== (activeDraft?.internalSkuCode ?? activeDraft?.skuCode)
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
      setIsSaving(true);
      
      // Create base payload with current form data
      const basePayload: ProductPayload = {
        productName: formData.productName || '',
        internalSkuCode: formData.skuCode || '',
        productDescription: formData.description || '',
        version: formData.version || ''
      };

      // Helper function to extract color from CSS var() or return as-is
      const extractColor = (colorStr: string): string => {
        if (!colorStr) {
          console.log('⚠️ extractColor: Empty color string, using default #CC9434');
          return '#CC9434'; // default fallback
        }
        console.log('🔍 extractColor input:', colorStr);
        // Match pattern: var(--variable-name, #HEXCODE)
        const match = colorStr.match(/var\([^,]+,\s*([^)]+)\)/);
        const result = match ? match[1].trim() : colorStr;
        console.log('🔍 extractColor result:', result);
        return result;
      };

      // Add icon data if selected - save both SVG and full icon data for reconstruction
      const payloadWithIcon = selectedIcon ? {
        ...basePayload,
        icon: JSON.stringify({
          iconData: selectedIcon,
          svgContent: (() => {/* placeholder */})()
        }),
        productIcon: JSON.stringify({
          // Save the full icon data with extracted colors for proper reconstruction
          iconData: (() => {
            const extractedIconData = {
              ...selectedIcon,
              // Extract actual color values from CSS variables
              outerBg: selectedIcon.outerBg ? [
                extractColor(selectedIcon.outerBg[0]),
                extractColor(selectedIcon.outerBg[1])
              ] : ['#F8F7FA', '#E4EEF9'],
              tileColor: extractColor(selectedIcon.tileColor || '#CC9434')
            };
            console.log('💾 Saving iconData with extracted colors:', extractedIconData);
            console.log('💾 Final outerBg:', extractedIconData.outerBg);
            console.log('💾 Final tileColor:', extractedIconData.tileColor);
            return extractedIconData;
          })(),
          svgContent: (() => {
            console.log('🎨 Creating SVG content for icon:', selectedIcon);
            console.log('🎨 Raw selectedIcon.outerBg:', selectedIcon.outerBg);
            console.log('🎨 Raw selectedIcon.tileColor:', selectedIcon.tileColor);
            const outerRaw = selectedIcon.outerBg ?? ['#F8F7FA', '#E4EEF9'];
            const outer = [extractColor(outerRaw[0]), extractColor(outerRaw[1])];
            const tile = extractColor(selectedIcon.tileColor ?? '#CC9434');
            console.log('🎨 Extracted colors - outer:', outer, 'tile:', tile);
            const viewBox = selectedIcon.viewBox ?? '0 0 18 18';
            return `<svg xmlns="http://www.w3.org/2000/svg" width="50.6537" height="46.3351" viewBox="0 0 50.6537 46.3351">
              <defs>
                <linearGradient id="bg-${selectedIcon.id}" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:${outer[0]}" />
                  <stop offset="100%" style="stop-color:${outer[1]}" />
                </linearGradient>
              </defs>
              <rect width="50.6537" height="46.3351" rx="12" fill="url(#bg-${selectedIcon.id})"/>
              <rect x="0.3" y="0.3" width="50.0537" height="45.7351" rx="11.7"
                    fill="rgba(1,69,118,0.10)" stroke="#D5D4DF" strokeWidth="0.6"/>
              <rect x="12" y="9" width="29.45" height="25.243" rx="5.7" fill="${tile}"/>
              <g transform="translate(10.657,9.385)">
                <rect width="29.339" height="26.571" rx="6"
                      fill="rgba(${parseInt(tile.slice(1, 3), 16)}, ${parseInt(tile.slice(3, 5), 16)}, ${parseInt(tile.slice(5, 7), 16)}, 0.10)" stroke="#FFFFFF" strokeWidth="0.6"/>
                <svg x="5.67" y="4.285" width="18" height="18" viewBox="${viewBox}">
                  <path d="${selectedIcon.svgPath}" fill="#FFFFFF"/>
                </svg>
              </g>
            </svg>`;
          })()
        })
      } : basePayload;

      console.log('💾 Final payload being sent:', payloadWithIcon);

      if (isDraft || !createdProductId) {
        // For new products or drafts, include all fields
        const payload = {
          ...payloadWithIcon,
          ...(isDraft ? { status: 'DRAFT' } : {})
        };
        
        if (createdProductId) {
          // Update existing product as draft
          console.log('Updating product as draft with ID:', createdProductId);
          
          // For draft updates, handle icon separately using the correct endpoint
          const hasIconInPayload = payload.icon || payload.productIcon;
          
          if (hasIconInPayload) {
            console.log('🎨 Updating icon for draft product using updateProductIcon...');
            console.log('🔍 selectedIcon data:', selectedIcon);
            
            if (selectedIcon) {
              // Update with new icon
              await updateProductIcon(createdProductId, selectedIcon);
              console.log('✅ Draft product icon updated successfully');
            } else {
              // Remove icon
              await updateProductIcon(createdProductId, null);
              console.log('✅ Draft product icon removed successfully');
            }
            
            // Update other fields (excluding icon fields)
            const { icon, productIcon, ...payloadWithoutIcon } = payload;
            if (Object.keys(payloadWithoutIcon).length > 0) {
              console.log('📝 Updating other draft product fields...');
              await updateProduct(createdProductId, payloadWithoutIcon);
              console.log('✅ Draft product fields updated successfully');
            }
          } else {
            // No icon changes, just update other fields normally
            console.log('📝 No icon changes, updating draft product fields normally...');
            await updateProduct(createdProductId, payload);
            console.log('✅ Draft product updated successfully');
          }
          
          console.log('Draft updated');
          
          // Signal Products component to refresh
          localStorage.setItem('productUpdated', Date.now().toString());
          console.log('📡 Set product update signal for Products component');
        } else {
          // Create new product (draft or not)
          console.log('Creating new product with payload:', payload);
          console.log('🔍 Payload productIcon field:', payload.productIcon);
          const response = await createProduct(payload);
          setCreatedProductId(response.productId);
          console.log('Product created with ID:', response.productId);
          // cache snapshot
          setLastSavedData({ ...formData });
          console.log('🔍 Created product response:', response);
          
          // Signal Products component to refresh
          localStorage.setItem('productUpdated', Date.now().toString());
          console.log('📡 Set product update signal for Products component');
        }
      } else {
        // For updates, only include changed fields
        const changes: Partial<ProductPayload> & { productIcon?: string } = {};
        
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
        
        // Include icon if it exists - save both SVG and full icon data
        if (selectedIcon) {
          const outerRaw = selectedIcon.outerBg ?? ['#F8F7FA', '#E4EEF9'];
          const outer = [extractColor(outerRaw[0]), extractColor(outerRaw[1])];
          const tile = extractColor(selectedIcon.tileColor ?? '#CC9434');
          const viewBox = selectedIcon.viewBox ?? '0 0 18 18';
          changes.icon = JSON.stringify({
          iconData: selectedIcon,
          svgContent: (()=>{/*placeholder*/})()
        });
        changes.productIcon = JSON.stringify({
            iconData: selectedIcon,
            svgContent: `<svg xmlns="http://www.w3.org/2000/svg" width="50.6537" height="46.3351" viewBox="0 0 50.6537 46.3351">
              <defs>
                <linearGradient id="bg-${selectedIcon.id}" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:${outer[0]}" />
                  <stop offset="100%" style="stop-color:${outer[1]}" />
                </linearGradient>
              </defs>
              <rect width="50.6537" height="46.3351" rx="12" fill="url(#bg-${selectedIcon.id})"/>
              <rect x="0.3" y="0.3" width="50.0537" height="45.7351" rx="11.7"
                    fill="rgba(1,69,118,0.10)" stroke="#D5D4DF" strokeWidth="0.6"/>
              <rect x="12" y="9" width="29.45" height="25.243" rx="5.7" fill="${tile}"/>
              <g transform="translate(10.657,9.385)">
                <rect width="29.339" height="26.571" rx="6"
                      fill="rgba(${parseInt(tile.slice(1, 3), 16)}, ${parseInt(tile.slice(3, 5), 16)}, ${parseInt(tile.slice(5, 7), 16)}, 0.10)" stroke="#FFFFFF" strokeWidth="0.6"/>
                <svg x="5.67" y="4.285" width="18" height="18" viewBox="${viewBox}">
                  <path d="${selectedIcon.svgPath}" fill="#FFFFFF"/>
                </svg>
              </g>
            </svg>`
          });
        }
        
        if (Object.keys(changes).length === 0) {
          console.log('No changes to save');
          return true;
        }
        
        console.log('Updating product with changes:', changes);
        console.log('🔍 Changes productIcon field:', changes.productIcon);
        const updateResponse = await updateProduct(createdProductId, changes);
        console.log('Product updated with changes');
        
        // Signal Products component to refresh
        localStorage.setItem('productUpdated', Date.now().toString());
        console.log('📡 Set product update signal for Products component');

      // cache snapshot to avoid redundant updates
      setLastSavedData({ ...formData });
        console.log('🔍 Update response:', updateResponse);
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
      setIsSaving(false);
    }
  };

  const handleSaveDraft = async () => {
    console.log('Save draft clicked');
    if (isDraftSaving) {
      console.log('Save already in progress');
      return false;
    }

    try {
      setIsSaving(true);
      setIsDraftSaved(false);

      const ok = await saveProduct(true); // uses full payload including icon
      if (!ok) return false;

      // save configuration too if needed
      if (activeTab === 'configuration' && configRef.current) {
        await configRef.current.submit(true);
      }

      console.log('Draft saved successfully');
      // ensure spinner visible
      await new Promise(res=>setTimeout(res,500));
      setIsDraftSaved(true);
      setTimeout(() => setIsDraftSaved(false), 3000);
      return true;
    } catch (error) {
      console.error('Error saving draft:', error);
      setIsDraftSaved(false);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const hasErrors = () => Object.keys(errors).length > 0;

  const handleSaveAndNext = async () => {
    if (hasErrors()) return;
    // On General step we only validate client side and move on – backend draft created later
    let success = true;
    if (activeTab !== 'general') {
      success = await saveProduct(true);
      if (!success) return;
    }

    // Navigate
    if (activeTab === 'general') {
      const configTabIndex = steps.findIndex(step => step.title.toLowerCase().includes('configuration'));
      if (configTabIndex > -1) {
        gotoStep(configTabIndex);
      }
    } else if (activeTab === 'configuration') {
      // Validate configuration fields; do not hit backend yet
      if (configRef.current) {
        const ok = await configRef.current.submit(false, false); // client-side validation only
        if (!ok) return; // field errors now displayed inline
      }
      const reviewTabIndex = steps.findIndex(step => step.title.toLowerCase().includes('review'));
      if (reviewTabIndex > -1) gotoStep(reviewTabIndex);
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
          labelWhenSaved: "Saved as Draft"
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
                  const isReviewTab = step.title.toLowerCase().includes('review');
                  const isDisabled = isReviewTab && (!createdProductId || !configuration.productType);
                  
                  return (
                    <button
                      key={step.id}
                      type="button"
                      className={[
                        "np-step",
                        isActive ? "active" : "",
                        isCompleted ? "completed" : "",
                        isDisabled ? "disabled" : ""
                      ].join(" ").trim()}
                      onClick={() => !isDisabled && gotoStep(i)}
                      disabled={isDisabled}
                      title={isDisabled ? "Please complete the configuration first" : ""}
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
              {/* faint separators behind content */}
              <div className="af-skel-rule af-skel-rule--top" />
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
                            
                            {/* Product Icon Field - Add */}
                            <div className="np-form-group">
                              <label className="if-label">Product Icon</label>
                              <div className="np-icon-field-wrapper">
                                <div className="np-icon-placeholder">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 56 56" fill="none">
                                    <rect x="0.525" y="0.525" width="54.95" height="54.95" rx="7.475" fill="#F8F7FA"/>
                                    <rect x="0.525" y="0.525" width="54.95" height="54.95" rx="7.475" stroke="#BFBECE" strokeWidth="1.05"/>
                                    <path d="M28 25.1996C31.866 25.1996 35 22.379 35 18.8996C35 15.4202 31.866 12.5996 28 12.5996C24.134 12.5996 21 15.4202 21 18.8996C21 22.379 24.134 25.1996 28 25.1996Z" stroke="#909599" strokeWidth="2.1"/>
                                    <path d="M28.0008 43.4008C34.1864 43.4008 39.2008 40.5802 39.2008 37.1008C39.2008 33.6214 34.1864 30.8008 28.0008 30.8008C21.8152 30.8008 16.8008 33.6214 16.8008 37.1008C16.8008 40.5802 21.8152 43.4008 28.0008 43.4008Z" stroke="#909599" strokeWidth="2.1"/>
                                  </svg>
                                </div>
                                <span className="np-icon-placeholder-text">Add product icon</span>
                                <button
                                  type="button"
                                  className="np-icon-add-btn"
                                  onClick={() => setIsIconPickerOpen(true)}
                                >
                                  <span>+ Add</span>
                                </button>
                              </div>
                            </div>

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
                              <div className="np-form-group">
                                <label className="if-label">Product Icon</label>
                                <div className="np-icon-field-wrapper">
                                  <div className="np-icon-preview">
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
                                  <div className="np-icon-actions">
                                    <button
                                      type="button"
                                      className="np-icon-action-btn"
                                      onClick={() => setIsIconPickerOpen(true)}
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
  <path d="M5.99942 10.9517H11.2494M8.55208 1.39783C8.7843 1.16562 9.09926 1.03516 9.42767 1.03516C9.75607 1.03516 10.071 1.16562 10.3032 1.39783C10.5355 1.63005 10.6659 1.94501 10.6659 2.27342C10.6659 2.60183 10.5355 2.91678 10.3032 3.149L3.29742 10.1554C3.15864 10.2942 2.9871 10.3957 2.79867 10.4506L1.12333 10.9394C1.07314 10.9541 1.01993 10.9549 0.969281 10.942C0.91863 10.929 0.872399 10.9026 0.835427 10.8657C0.798455 10.8287 0.772102 10.7825 0.759125 10.7318C0.746149 10.6812 0.747027 10.6279 0.761667 10.5778L1.2505 8.90242C1.30546 8.7142 1.40698 8.54286 1.54567 8.40425L8.55208 1.39783Z" stroke="#1D7AFC" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
                                      <span>Edit</span>
                                    </button>
                                    <button
                                      type="button"
                                      className="np-icon-action-btn np-icon-action-btn--remove"
                                      onClick={() => setSelectedIcon(null)}
                                    >
                                     <svg xmlns="http://www.w3.org/2000/svg" width="12" height="14" viewBox="0 0 12 14" fill="none">
  <path d="M0.75 3.7845H11.25M10.0833 3.7845V11.9512C10.0833 12.5345 9.5 13.1178 8.91667 13.1178H3.08333C2.5 13.1178 1.91667 12.5345 1.91667 11.9512V3.7845M3.66667 3.78451V2.61784C3.66667 2.03451 4.25 1.45117 4.83333 1.45117H7.16667C7.75 1.45117 8.33333 2.03451 8.33333 2.61784V3.78451M4.83333 6.70117V10.2012M7.16667 6.70117V10.2012" stroke="#ED5142" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
</svg>
                                      <span>Remove</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                              );
                            })()}

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
                          
                          {/* Product Icon Picker Modal */}
                          <ProductIconPickerModal
                            isOpen={isIconPickerOpen}
                            onClose={() => setIsIconPickerOpen(false)}
                            onSelect={(icon) => {
                              setSelectedIcon(icon);
                              setIsIconPickerOpen(false);
                            }}
                          />
                        </section>
                      )}

                      {activeTab === "configuration" && (
                        <section>
                          <div className="np-section-header" style={{display:'flex',alignItems:'center'}}>
                            <h3 className="np-section-title">CONFIGURATION</h3>
                            {isConfigurationLocked && <LockBadge />}
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
                            isSavingDraft={isSaving}
                            readOnly={false}
                            locked={isConfigurationLocked}
                          />
                        </section>
                      )}

                      {activeTab === "review" && createdProductId && configuration.productType ? (
                        <section>
                          <div className="np-section-header">
                            <h3 className="np-section-title">REVIEW & CONFIRM</h3>
                          </div>
                          <ProductReview generalDetails={formData} configuration={configuration} />
                          {/* Hidden ConfigurationTab to keep ref alive */}
                          <div style={{ display: 'none' }}>
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
                      ) : activeTab === "review" ? (
                        <div className="np-section-header">
                          <h3 className="np-section-title">Please complete the configuration first</h3>
                          <p>Click 'Back' to complete the required configuration steps.</p>
                          <button 
                            className="np-btn np-btn--primary mt-4"
                            onClick={() => gotoStep(1)}
                          >
                            Back to Configuration
                          </button>
                        </div>
                      ) : null}
                    </div>

                    {/* Footer actions on a line */}
                    <div className="np-form-footer" style={{position:'relative'}}>
                      {activeTab === "general" && (
                        <>
                          {errors.form && (
                            <div className="np-error-message">{errors.form}</div>
                          )}
                          <div className="np-btn-group np-btn-group--next">
                          <PrimaryButton
                            type="button"
                            onClick={handleSaveAndNext}
                          >
                            Save & Next
                          </PrimaryButton>
                        </div>
                        </>
                      )}

                      {activeTab === "configuration" && (
                        <>
                          {isConfigurationLocked ? (
                            // ONLY the hint when locked (no buttons)
                            <div
                              className="np-footer-hint"
                              style={{
                                position: 'absolute',
                                left: '50%',
                                bottom: '20px',
                                transform: 'translateX(-50%)',
                                color: '#8C8F96',
                                fontSize: 14,
                                pointerEvents: 'none',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              Fill the previous steps to unlock this step
                            </div>
                          ) : (
                            // normal buttons when unlocked
                            <>
                              <div>
                                <SecondaryButton
                                  type="button"
                                  onClick={() => gotoStep(0)}
                                >
                                  Back
                                </SecondaryButton>
                              </div>
                              <div className="np-btn-group np-btn-group--next">
                              <PrimaryButton
                                type="button"
                                onClick={async () => {
                                  try {
                                    setIsSaving(true);
                                    if (configRef.current) {
                                      // Validate but don't save to server yet (skipValidation=false, saveToServer=false)
                                      const success = await configRef.current.submit(false, false);
                                      if (success) gotoStep(2);
                                    }
                                  } catch (error) {
                                    console.error('Error saving configuration:', error);
                                    setErrors(prev => ({
                                      ...prev,
                                      form: 'Failed to save configuration. Please try again.'
                                    }));
                                  } finally {
                                    setIsSaving(false);
                                  }
                                }}
                                disabled={isSaving}
                              >
                                Save & Next
                              </PrimaryButton>
                            </div>
                            </>
                          )}
                        </>
                      )}

                      {activeTab === "review" && (
                        <>
                          <div className="np-btn-group np-btn-group--back">
                            <SecondaryButton
                              type="button"
                              onClick={() => gotoStep(1)}
                            >
                              Back
                            </SecondaryButton>
                          </div>
                          <div className="np-btn-group np-btn-group--next">
                            <PrimaryButton 
                              type="button" 
                              onClick={async () => {
                                if (!createdProductId) {
                                  console.error('No product ID available for finalization');
                                  return;
                                }
                                if (!configRef.current) {
                                  console.error('Configuration ref not available');
                                  return;
                                }
                                setIsSaving(true);
                                try {
                                  // 1️⃣ save configuration (real API call)
                                  const ok = await configRef.current.submit();
                                  if (!ok) return;
                                  // 2️⃣ finalize product
                                  const resp = await finalizeProduct(createdProductId);
                                  if (resp.success) {
                                    console.log('Product created and finalized successfully!');
                                    onClose();
                                  } else {
                                    throw new Error(resp.message || 'Failed to finalize product');
                                  }
                                } catch (error) {
                                  console.error('Error finalizing product:', error);
                                  const msg = error instanceof Error ? error.message : 'Unknown error';
                                  setErrors(prev => ({ ...prev, form: msg }));
                                } finally {
                                  setIsSaving(false);
                                }
                              }}
                              disabled={isSaving}
                            >
                              Create Product
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

      {/* Save Draft confirmation modal */}
      <SaveDraft
        isOpen={showSavePrompt}
        onClose={async () => {
          setShowSavePrompt(false);
          let ok = true;
          try {
            if (createdProductId) {
              await deleteProduct(createdProductId);
              // Only show toast if there was actually a product to delete
              showToast({
                kind: 'success',
                title: 'Product Deleted',
                message: 'Product deleted successfully.'
              });
            }
          } catch (e) {
            console.error('Failed to delete product on discard', e);
            ok = false;
            // Only show error toast if deletion failed
            showToast({
              kind: 'error',
              title: 'Delete Failed',
              message: 'Unable to delete product. Please try again.'
            });
          } finally {
            onClose();
          }
        }}
        onSave={async () => {
          const ok = await handleSaveDraft();
          // Check if user has filled any details
          const hasData = formData.productName || formData.version || formData.skuCode || formData.description;
          
          // Show success toast if save was successful and there's data
          if (ok && hasData) {
            showToast({
              kind: "success",
              title: "Product Draft Saved",
              message: "Product draft saved successfully."
            });
          } else if (!ok) {
            showToast({
              kind: "error",
              title: "Failed to Save Draft",
              message: "Unable to save draft. Please try again."
            });
          }
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
              // Only show success toast if there was actually a product to delete
              showToast({
                kind: 'success',
                title: 'Product Deleted',
                message: 'Product deleted successfully.'
              });
            }
          } catch (e) {
            console.error('Failed to delete product', e);
            ok = false;
            // Only show error toast if deletion failed
            showToast({
              kind: 'error',
              title: 'Delete Failed',
              message: 'Unable to delete product. Please try again.'
            });
          } finally {
            setShowDeleteConfirm(false);
            onClose();
          }
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
}


