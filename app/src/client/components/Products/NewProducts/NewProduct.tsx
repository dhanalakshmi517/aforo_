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
import EditButton from "../../componenetsss/EditButton";
import DeleteButton from "../../componenetsss/DeleteButton";
import { createProduct, updateProduct, updateProductIcon, finalizeProduct, deleteProduct, ProductPayload, listAllProducts, getProducts } from "../api";
import ProductIconPickerModal from "../ProductIconPickerModal";
import { ProductIconData } from "../ProductIcon";
import ProductCreatedSuccess from "../../componenetsss/ProductCreatedSuccess";

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
  const [showSuccess, setShowSuccess] = useState(false);

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
    let iconLoaded = false;

    // PRIORITY 0: Check localStorage cache FIRST (has the most up-to-date icon data)
    // This is necessary because backend doesn't properly return productIcon field
    if (activeDraft?.productId) {
      try {
        const iconCache = JSON.parse(localStorage.getItem('iconDataCache') || '{}');
        const cachedIconJson = iconCache[activeDraft.productId];
        if (cachedIconJson) {
          const parsedCache = typeof cachedIconJson === 'string' ? JSON.parse(cachedIconJson) : cachedIconJson;
          if (parsedCache?.iconData) {
            console.log(`✅ NewProduct: Using localStorage cached icon for ${activeDraft.productId}`);
            setSelectedIcon(parsedCache.iconData as ProductIconData);
            iconLoaded = true;
          } else if (parsedCache?.id && parsedCache?.svgPath) {
            console.log(`✅ NewProduct: Using localStorage cached icon (direct) for ${activeDraft.productId}`);
            setSelectedIcon(parsedCache as ProductIconData);
            iconLoaded = true;
          }
        }
      } catch (cacheErr) {
        console.warn('NewProduct: Failed to read icon cache from localStorage:', cacheErr);
      }
    }

    // PRIORITY 1: Check activeDraft.productIcon (backend data - only if cache miss)
    if (!iconLoaded && activeDraft?.productIcon) {
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
          iconLoaded = true;
        }
        // Fallback: check if the parsed data itself is the icon (old format)
        else if (parsedIcon.id) {
          console.log('Loading icon from root level (old format)');
          console.log('🎨 Root level icon structure:', parsedIcon);
          console.log('🎨 outerBg colors:', parsedIcon.outerBg);
          console.log('🎨 tileColor:', parsedIcon.tileColor);
          setSelectedIcon(parsedIcon as ProductIconData);
          console.log('Icon loaded successfully');
          iconLoaded = true;
        }
        // If only svgContent exists, we can't reconstruct the icon picker data
        else if (parsedIcon.svgContent) {
          console.warn('Icon only has svgContent, cannot load into icon picker. Please re-select icon.');
        }
      } catch (error) {
        console.error('Error parsing icon data:', error);
      }
    }

    // PRIORITY 2: Direct iconData field (already structured)
    if (!iconLoaded && activeDraft?.iconData) {
      console.log('Loading icon from direct iconData field');
      setSelectedIcon(activeDraft.iconData as ProductIconData);
    }
  }, [activeDraft?.productId, activeDraft?.productIcon, activeDraft?.iconData]);
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
          console.log('🔍 Existing products for uniqueness check:', mapped);
          setExistingProducts(mapped);
        } catch (e) { /* already logged */ }
      } catch (e) {
        console.error('Failed to fetch existing products', e);
      }
    })();
  }, []);

  const configRef = React.useRef<any>(null);

  // Function to refresh existing products list
  const refreshExistingProducts = async () => {
    try {
      let data: any[] = [];
      try {
        data = await listAllProducts();
      } catch {
        // fallback to authenticated endpoint
        try { data = await getProducts(); } catch { data = []; }
      }
      const mapped = data.map(p => ({ productName: p.productName, skuCode: ((p as any).internalSkuCode ?? (p as any).skuCode ?? '') as string }));
      console.log('🔄 Refreshed existing products for uniqueness check:', mapped);
      setExistingProducts(mapped);
      return mapped;
    } catch (e) {
      console.error('Failed to refresh existing products', e);
      return existingProducts; // return current list if refresh fails
    }
  };

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
        <path d="M4.66667 7.33334V4.66668C4.66667 3.78262 5.01786 2.93478 5.64298 2.30965C6.2681 1.68453 7.11595 1.33334 8 1.33334C8.88406 1.33334 9.7319 1.68453 10.357 2.30965C10.9821 2.93478 11.3333 3.78262 11.3333 4.66668V7.33334M3.33333 7.33334H12.6667C13.403 7.33334 14 7.9303 14 8.66668V13.3333C14 14.0697 13.403 14.6667 12.6667 14.6667H3.33333C2.59695 14.6667 2 14.0697 2 13.3333V8.66668C2 7.9303 2.59695 7.33334 3.33333 7.33334Z" stroke="#75797E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
      console.log('🔍 Uniqueness check for productName:', {
        inputName: trimmed,
        existingProducts: existingProducts.map(p => p.productName),
        activeDraftName: activeDraft?.productName,
        isDuplicate: duplicate
      });
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
    console.log('🚀 handleFinalSubmit called');
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
      console.log('📞 Calling finalizeProduct with ID:', createdProductId);
      const response = await finalizeProduct(createdProductId);
      console.log('📞 Finalize product response:', response);
      if (response.success) {
        // Show success component instead of closing
        console.log('✅ Product created and finalized successfully!');
        console.log('🎯 Setting showSuccess to true');
        setShowSuccess(true);
        console.log('🎯 showSuccess state should now be true');
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

  const handleGoToAllProducts = () => {
    navigate('/get-started/products');
  };

  const gotoStep = async (index: number, skipSave: boolean = false) => {
    // Basic guard: prevent invalid index
    if (index < 0 || index >= steps.length) return;

    // Block moving away from General when required fields are empty but at least one field is filled
    if (currentStep === 0 && index > 0) {
      const productNameEmpty = !formData.productName.trim();
      const skuCodeEmpty = !formData.skuCode.trim();

      // If user has entered something in any field, enforce required-field validation
      if (hasAnyRequiredInput && (productNameEmpty || skuCodeEmpty)) {
        const newErrors: Record<string, string> = {};
        if (productNameEmpty) {
          newErrors.productName = 'This field is required';
        }
        if (skuCodeEmpty) {
          newErrors.skuCode = 'This field is required';
        }

        setErrors(prev => ({ ...prev, ...newErrors }));
        return;
      }
    }

    // when jumping forward, make sure we have a product record
    if (index > currentStep && !skipSave) {
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
  const [lastSavedIcon, setLastSavedIcon] = useState<ProductIconData | null>(null);

  // Check if there are unsaved changes
  const hasUnsavedChanges = React.useMemo(() => {
    if (!lastSavedData) return hasAnyRequiredInput; // If never saved, check if any input exists

    const formDataChanged =
      lastSavedData.productName !== formData.productName ||
      lastSavedData.version !== formData.version ||
      lastSavedData.skuCode !== formData.skuCode ||
      lastSavedData.description !== formData.description;

    const iconChanged =
      (lastSavedIcon?.id !== selectedIcon?.id) ||
      (lastSavedIcon?.svgPath !== selectedIcon?.svgPath) ||
      (JSON.stringify(lastSavedIcon?.outerBg) !== JSON.stringify(selectedIcon?.outerBg)) ||
      (lastSavedIcon?.tileColor !== selectedIcon?.tileColor);

    return formDataChanged || iconChanged;
  }, [formData, selectedIcon, lastSavedData, lastSavedIcon, hasAnyRequiredInput]);

  const saveProduct = async (isDraft: boolean = false) => {
    console.log('Saving product...', { isDraft, formData, selectedIcon, createdProductId });

    // Prevent concurrent saves
    if (isSaving) {
      console.log('⚠️ Save already in progress, skipping...');
      return false;
    }

    // Refresh existing products list to ensure we have latest data
    if (!createdProductId) {
      console.log('🔄 Refreshing existing products before creating new product...');
      await refreshExistingProducts();
    }

    // Only validate required fields if not a draft
    if (!isDraft) {
      const newErrors: Record<string, string> = {};
      // uniqueness checks - exclude current draft product
      const lower = (s: string) => s.trim().toLowerCase();
      if (formData.productName && existingProducts.some(p =>
        lower(p.productName || '') === lower(formData.productName) &&
        p.productName !== activeDraft?.productName
      )) {
        console.log('❌ Frontend uniqueness check failed for productName:', formData.productName);
        newErrors.productName = 'Must be unique';
      }
      if (formData.skuCode && existingProducts.some(p =>
        lower(p.skuCode || '') === lower(formData.skuCode) &&
        p.skuCode !== (activeDraft?.internalSkuCode ?? activeDraft?.skuCode)
      )) {
        console.log('❌ Frontend uniqueness check failed for skuCode:', formData.skuCode);
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
          svgContent: (() => {/* placeholder */ })()
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

      if (createdProductId) {
        // Update existing product
        console.log('Updating existing product with ID:', createdProductId);
        const payload = {
          ...payloadWithIcon,
          ...(isDraft ? { status: 'DRAFT' } : {})
        };

        // For updates, handle icon separately using the correct endpoint
        const hasIconInPayload = payload.icon || payload.productIcon;

        if (hasIconInPayload) {
          console.log('🎨 Updating icon for product using updateProductIcon...');
          console.log('🔍 selectedIcon data:', selectedIcon);

          if (selectedIcon) {
            // Update with new icon
            await updateProductIcon(createdProductId, selectedIcon);
            console.log('✅ Product icon updated successfully');

            // Cache the icon data in localStorage for Products.tsx and EditProduct to use
            const iconCache = JSON.parse(localStorage.getItem('iconDataCache') || '{}');
            iconCache[createdProductId] = JSON.stringify({ iconData: selectedIcon });
            localStorage.setItem('iconDataCache', JSON.stringify(iconCache));
            console.log('💾 Cached icon data in localStorage for product', createdProductId);
          } else {
            // Remove icon
            await updateProductIcon(createdProductId, null);
            console.log('✅ Product icon removed successfully');

            // Remove from cache
            const iconCache = JSON.parse(localStorage.getItem('iconDataCache') || '{}');
            delete iconCache[createdProductId];
            localStorage.setItem('iconDataCache', JSON.stringify(iconCache));
            console.log('🗑️ Removed icon from localStorage cache for product', createdProductId);
          }

          // Update other fields (excluding icon fields)
          const { icon, productIcon, ...payloadWithoutIcon } = payload;
          if (Object.keys(payloadWithoutIcon).length > 0) {
            console.log('📝 Updating other product fields...');
            await updateProduct(createdProductId, payloadWithoutIcon);
            console.log('✅ Product fields updated successfully');
          }
        } else {
          // No icon changes, just update other fields normally
          console.log('📝 No icon changes, updating product fields normally...');
          await updateProduct(createdProductId, payload);
          console.log('✅ Product updated successfully');
        }

        console.log('Product update completed');

        // Signal Products component to refresh
        localStorage.setItem('productUpdated', Date.now().toString());
        console.log('📡 Set product update signal for Products component');
      } else {
        // Create new product (draft or not)
        const payload = {
          ...payloadWithIcon,
          ...(isDraft ? { status: 'DRAFT' } : {})
        };

        console.log('Creating new product with payload:', payload);
        console.log('🔍 Payload productIcon field:', payload.productIcon);
        const response = await createProduct(payload);
        setCreatedProductId(response.productId);
        console.log('Product created with ID:', response.productId);

        // Cache icon data in localStorage for Products.tsx and EditProduct to use
        if (selectedIcon && response.productId) {
          const iconCache = JSON.parse(localStorage.getItem('iconDataCache') || '{}');
          iconCache[response.productId] = JSON.stringify({ iconData: selectedIcon });
          localStorage.setItem('iconDataCache', JSON.stringify(iconCache));
          console.log('💾 Cached icon data in localStorage for new product', response.productId);
        }

        // cache snapshot
        setLastSavedData({ ...formData });
        setLastSavedIcon(selectedIcon);
        console.log('🔍 Created product response:', response);

        // Signal Products component to refresh
        localStorage.setItem('productUpdated', Date.now().toString());
        console.log('📡 Set product update signal for Products component');
      }

      // Update last saved data
      setLastSavedData({ ...formData });
      setLastSavedIcon(selectedIcon);
      return true;
    } catch (error: any) {
      console.error('Failed to save product:', error);

      // Extract specific error message from API response
      let errorMessage = 'Failed to save product. Please try again.';

      if (error?.response?.data?.details) {
        // Backend returned specific error details
        errorMessage = error.response.data.details;

        // If it's a duplicate product name error, refresh the products list and check again
        if (errorMessage.toLowerCase().includes('productname already exists')) {
          console.log('⚠️ Backend says productName already exists, refreshing products list...');

          // Refresh the products list to see if there's a mismatch
          const refreshedProducts = await refreshExistingProducts();
          const lower = (s: string) => s.trim().toLowerCase();
          const actualDuplicate = refreshedProducts.some(p =>
            lower(p.productName || '') === lower(formData.productName) &&
            p.productName !== activeDraft?.productName
          );

          if (actualDuplicate) {
            console.log('✅ Confirmed: Product name actually exists after refresh');
            setErrors(prev => ({
              ...prev,
              productName: 'A product with this name already exists. Please use a different name.'
            }));
          } else {
            console.log('🤔 Backend says duplicate but frontend doesn\'t see it. This might be a backend caching issue.');
            setErrors(prev => ({
              ...prev,
              form: 'There seems to be a temporary issue with name validation. Please try a slightly different name or try again in a moment.'
            }));
          }
          return false;
        }
      } else if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      setErrors(prev => ({
        ...prev,
        form: errorMessage
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
      setIsDraftSaving(true);
      setIsDraftSaved(false);

      const ok = await saveProduct(true); // uses full payload including icon
      if (!ok) return false;

      // save configuration too if needed
      if (activeTab === 'configuration' && configRef.current) {
        await configRef.current.submit(true);
      }

      console.log('Draft saved successfully');
      // ensure spinner visible
      await new Promise(res => setTimeout(res, 500));
      setIsDraftSaved(true);
      setTimeout(() => setIsDraftSaved(false), 3000);
      return true;
    } catch (error) {
      console.error('Error saving draft:', error);
      setIsDraftSaved(false);
      return false;
    } finally {
      setIsDraftSaving(false);
    }
  };

  const hasErrors = () => Object.keys(errors).length > 0;

  const handleSaveAndNext = async () => {
    if (hasErrors()) return;

    // Validate required fields for the current tab before proceeding
    if (activeTab === 'general') {
      const newErrors: Record<string, string> = {};

      // Check required fields
      if (!formData.productName.trim()) {
        newErrors.productName = 'This field is required';
      }
      if (!formData.skuCode.trim()) {
        newErrors.skuCode = 'This field is required';
      }

      // Check uniqueness - exclude current draft product
      const lower = (s: string) => s.trim().toLowerCase();
      if (formData.productName && existingProducts.some(p =>
        lower(p.productName || '') === lower(formData.productName) &&
        p.productName !== activeDraft?.productName
      )) {
        console.log('❌ Frontend uniqueness check failed for productName:', formData.productName);
        newErrors.productName = 'Must be unique';
      }
      if (formData.skuCode && existingProducts.some(p =>
        lower(p.skuCode || '') === lower(formData.skuCode) &&
        p.skuCode !== (activeDraft?.internalSkuCode ?? activeDraft?.skuCode)
      )) {
        console.log('❌ Frontend uniqueness check failed for skuCode:', formData.skuCode);
        newErrors.skuCode = 'Must be unique';
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
    }

    let success = true;

    // Always save the current step data before moving to next
    if (activeTab === 'general') {
      // Save general details as draft before moving to configuration
      success = await saveProduct(true);
      if (!success) return;
    } else {
      // For other tabs, save their data
      success = await saveProduct(true);
      if (!success) return;
    }

    // Navigate after successful save
    if (activeTab === 'general') {
      const configTabIndex = steps.findIndex(step => step.title.toLowerCase().includes('configuration'));
      if (configTabIndex > -1) {
        gotoStep(configTabIndex, true); // skipSave = true since we just saved
      }
    } else if (activeTab === 'configuration') {
      // Validate configuration fields; do not hit backend yet
      if (configRef.current) {
        const ok = await configRef.current.submit(false, false); // client-side validation only
        if (!ok) return; // field errors now displayed inline
      }
      const reviewTabIndex = steps.findIndex(step => step.title.toLowerCase().includes('review'));
      if (reviewTabIndex > -1) gotoStep(reviewTabIndex, true); // skipSave = true since we just saved
    } else {
      // For other tabs, just move to the next step
      const currentIndex = steps.findIndex(step => step.title.toLowerCase().includes(activeTab));
      if (currentIndex < steps.length - 1) {
        gotoStep(currentIndex + 1, true); // skipSave = true since we just saved
      }
    }
  };

  return (
    <>
      {console.log('🔍 Rendering NewProduct, showSuccess:', showSuccess, 'productName:', formData.productName)}
      {showSuccess ? (
        <>
          {console.log('🎉 Rendering ProductCreatedSuccess component')}
          <ProductCreatedSuccess
            productName={formData.productName}
            onGoAllProducts={handleGoToAllProducts}
          />
        </>
      ) : (
        <>
          {console.log('📝 Rendering normal product form')}
          <TopBar
            title="Create New Product"
            onBack={() => hasAnyRequiredInput ? setShowSavePrompt(true) : onClose()}
            cancel={{
              onClick: () => setShowDeleteConfirm(true),
              disabled: !hasAnyRequiredInput
            }}
            save={{
              onClick: handleSaveDraft,
              label: isDraftSaved ? "Saved!" : "Save as Draft",
              saved: isDraftSaved,
              saving: isDraftSaving,
              labelWhenSaved: "Saved as Draft",
              disabled: !hasAnyRequiredInput
            }}
          />

          <div className="prod-np-viewport">
            <div className="prod-np-card">
              <div className="prod-np-grid">
                {/* LEFT rail */}
                <aside className="prod-np-rail" data-modal-open={isIconPickerOpen ? 'true' : 'false'} style={{
                  pointerEvents: isIconPickerOpen ? 'none' : 'auto',
                  opacity: isIconPickerOpen ? 0.5 : 1,
                  transition: 'opacity 0.2s'
                }}>
                  <nav className="prod-np-steps">
                    {steps.map((step, i) => {
                      const isActive = i === currentStep;
                      const isCompleted = i < currentStep;
                      const showConnector = i < steps.length - 1;
                      const isReviewTab = step.title.toLowerCase().includes('review');
                      const isDisabled = isReviewTab && (!createdProductId || !configuration.productType);
                      const isModalOpen = isIconPickerOpen;

                      return (
                        <button
                          key={step.id}
                          type="button"
                          className={[
                            "prod-np-step",
                            isActive && !isModalOpen ? "active" : "",
                            isCompleted ? "completed" : "",
                            isDisabled || isModalOpen ? "disabled" : ""
                          ].join(" ").trim()}
                          onClick={() => !isDisabled && !isModalOpen && gotoStep(i)}
                          disabled={isDisabled || isModalOpen}
                          title={isDisabled ? "Please complete the configuration first" : isModalOpen ? "Close the icon picker first" : ""}
                        >
                          {/* Bullet + connector column */}
                          <span className="prod-np-step__bullet" aria-hidden="true">
                            {/* Circle bullet */}
                            <span className="prod-np-step__icon">
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="11" stroke={isModalOpen ? "#C3C2D0" : (isActive ? "var(--color-primary-800)" : "#C3C2D0")} strokeWidth="2" />
                                <circle cx="12" cy="12" r="6" fill={isModalOpen ? "#C3C2D0" : (isActive ? "var(--color-primary-800)" : "#C3C2D0")} />
                              </svg>
                            </span>

                            {/* Vertical connector (hidden on last step) */}
                            {showConnector && <span className="prod-np-step__connector" />}
                          </span>

                          {/* Text column */}
                          <span className="prod-np-step__text">
                            <span className="prod-np-step__title">{step.title}</span>
                            <span className="prod-np-step__desc">{step.desc}</span>
                          </span>
                        </button>
                      );
                    })}
                  </nav>
                </aside>

                {/* MAIN area */}
                <main className="prod-np-main">
                  {/* faint separators behind content */}
                  <div className="af-skel-rule af-skel-rule--top" />
                  <div className="prod-np-main__inner">
                    <div className="prod-np-body">
                      <form className="prod-np-form" onSubmit={(e) => e.preventDefault()}>
                        <div className="prod-np-form-section">
                          {activeTab === "general" && (
                            <section>
                              <div className="prod-np-section-header">
                                <h3 className="prod-np-section-title">GENERAL DETAILS</h3>
                              </div>

                              <div className="prod-np-grid ">
                                <InputField
                                  label="Product Name"
                                  value={formData.productName}
                                  onChange={handleFieldChange('productName')}
                                  error={errors.productName}
                                  placeholder="eg. Google Maps API"
                                  required
                                />
                                <InputField
                                  label="Version"
                                  value={formData.version}
                                  onChange={handleFieldChange('version')}
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
                                            onClick={() => setSelectedIcon(null)}
                                            label="Remove"
                                            variant="soft"
                                          />
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
                                  required
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
                                  // Prevent any focus on step elements
                                  document.activeElement instanceof HTMLElement && document.activeElement.blur();
                                }}
                              />
                            </section>
                          )}

                          {activeTab === "configuration" && (
                            <section>
                              <div className="prod-np-section-header" style={{ display: 'flex', alignItems: 'center' }}>
                                <h3 className="prod-np-section-title">CONFIGURATION</h3>
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
                              <div className="prod-np-section-header">
                                <h3 className="prod-np-section-title">REVIEW & CONFIRM</h3>
                              </div>
                              <ProductReview generalDetails={formData} configuration={configuration} />
                              {/* Hidden ConfigurationTab to keep ref alive */}
                              <div style={{ display: 'none' }}>
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
                          ) : activeTab === "review" ? (
                            <div className="prod-np-section-header">
                              <h3 className="prod-np-section-title">Please complete the configuration first</h3>
                              <p>Click 'Back' to complete the required configuration steps.</p>
                              <button
                                className="prod-np-btn prod-np-btn--primary mt-4"
                                onClick={() => gotoStep(1)}
                              >
                                Back to Configuration
                              </button>
                            </div>
                          ) : null}
                        </div>

                        {/* Footer actions on a line */}
                        <div className="prod-np-form-footer" style={{ position: 'relative' }}>
                          {activeTab === "general" && (
                            <>
                              {errors.form && (
                                <div className="prod-np-error-message">{errors.form}</div>
                              )}
                              <div className="prod-np-btn-group prod-np-btn-group--next">
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
                                  className="prod-np-footer-hint"
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
                                  <div className="prod-np-btn-group prod-np-btn-group--next">
                                    <PrimaryButton
                                      type="button"
                                      onClick={async () => {
                                        try {
                                          setIsSaving(true);
                                          if (configRef.current) {
                                            // Only client-side validation - NO API call (saveToServer=false)
                                            // API will be called in Review tab when finalizing
                                            const success = await configRef.current.submit(false, false);
                                            if (success) gotoStep(2);
                                          }
                                        } catch (error) {
                                          console.error('Error validating configuration:', error);
                                          setErrors(prev => ({
                                            ...prev,
                                            form: 'Please fill all required fields.'
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
                              <div className="prod-np-btn-group prod-np-btn-group--back">
                                <SecondaryButton
                                  type="button"
                                  onClick={() => gotoStep(1)}
                                >
                                  Back
                                </SecondaryButton>
                              </div>
                              <div className="prod-np-btn-group prod-np-btn-group--next">
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
                                      console.log('📞 Calling finalizeProduct from inline handler with ID:', createdProductId);
                                      const resp = await finalizeProduct(createdProductId);
                                      console.log('📞 Finalize product response from inline handler:', resp);
                                      if (resp.success) {
                                        console.log('✅ Product created and finalized successfully from inline handler!');
                                        console.log('🎯 Setting showSuccess to true from inline handler');
                                        setShowSuccess(true);
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
               discardLabel="Keep editing"
          confirmLabel="Discard"
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
      )}
    </>
  );
}
