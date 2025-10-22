import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { InputField, TextareaField } from '../../componenetsss/Inputs';
import EditPopup from '../../componenetsss/EditPopUp';
import ConfirmDeleteModal from '../../componenetsss/ConfirmDeleteModal';
import { ConfigurationTab } from './EditConfiguration';
import EditReview from './EditReview';
import TopBar from '../../componenetsss/TopBar';
import { useToast } from '../../componenetsss/ToastProvider';
import PrimaryButton from '../../componenetsss/PrimaryButton';
import SecondaryButton from '../../componenetsss/SecondaryButton';
import ProductIconPickerModal from '../ProductIconPickerModal';
import { ProductIconData } from '../ProductIcon';
import './EditProduct.css';
import { updateGeneralDetails, fetchGeneralDetails, updateConfiguration } from './EditProductApi';
import { finalizeProduct, deleteProduct, updateProductIcon, updateProduct } from '../api';
import type { ProductPayload } from '../api';
import { listAllProducts, getProducts } from '../api';

// Minimal product type for local state (id only needed)
interface Product {
  productId: string;
}

const steps = [
  { id: 1, title: 'General Details', desc: 'Start with the basics of your product.' },
  { id: 2, title: 'Configuration', desc: 'Define configuration and parameters.' },
  { id: 3, title: 'Review & Confirm', desc: 'Validate all details before finalizing.' }
];

interface EditProductProps {
  onClose: () => void;
  productId?: string;
  onIconUpdate?: (productId: string, iconData: any) => void;
}

type ActiveTab = 'general' | 'configuration' | 'review';

const EditProduct: React.FC<EditProductProps> = ({ onClose, productId, onIconUpdate }: EditProductProps) => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    document.body.classList.add('edit-product-page');
    return () => {
      document.body.classList.remove('edit-product-page');
    };
  }, []);

  const [currentStep, setCurrentStep] = useState(0);
  const [productType, setProductType] = useState<string>('');
  const [activeTab, setActiveTab] = useState<ActiveTab>('general');

  const [showSaveDraftModal, setShowSaveDraftModal] = useState(false);
  const [draftStatus, setDraftStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // product icon state
  const [selectedIcon, setSelectedIcon] = useState<ProductIconData | null>(null);
  const [originalIcon, setOriginalIcon] = useState<ProductIconData | null>(null);
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [formData, setFormData] = useState({
    productName: '',
    version: '',
    skuCode: '',
    description: ''
  });

  // ----- CHANGE DETECTION SNAPSHOTS -----
  const originalFormDataRef = useRef<typeof formData | null>(null);
  const originalConfigRef = useRef<Record<string, string> | null>(null);

  // store existing products for uniqueness checks
  const [existingProducts, setExistingProducts] = useState<Array<{ productName: string; skuCode: string }>>([]);
  // store original values to exclude current product from uniqueness checks
  const [originalValues, setOriginalValues] = useState<{ productName: string; skuCode: string }>({ productName: '', skuCode: '' });
  // track which fields have been modified by the user
  const [modifiedFields, setModifiedFields] = useState<Set<string>>(new Set());

  // Fetch existing products once on mount (for uniqueness checks)
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
        const mapped = data.map(p => ({
          productName: (p as any).productName,
          skuCode: ((p as any).internalSkuCode ?? (p as any).skuCode ?? '') as string,
        }));
        setExistingProducts(mapped);
      } catch (e) {
        console.error('Failed to fetch existing products', e);
      }
    })();
  }, []);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [configuration, setConfiguration] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('editConfigFormData');
    return saved ? JSON.parse(saved) : {};
  });
  const [isDraft, setIsDraft] = useState(false);
  const [loading, setLoading] = useState(false);
  const configRef = useRef<import('./EditConfiguration').ConfigurationTabHandle>(null);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    const trimmed = value.trim();
    setFormData(prev => ({ ...prev, [field]: value }));

    // mark modified
    setModifiedFields(prev => new Set(prev).add(field));

    if (field === 'productName') {
      const duplicate = existingProducts.some(p => {
        if ((p.productName || '').toLowerCase() === originalValues.productName.toLowerCase() &&
            (p.skuCode || '').toLowerCase() === originalValues.skuCode.toLowerCase()) {
          return false;
        }
        return (p.productName || '').toLowerCase() === trimmed.toLowerCase();
      });
      if (duplicate) {
        setErrors(prev => ({ ...prev, productName: 'Must be unique' }));
      } else if (errors.productName === 'Must be unique') {
        const { productName, ...rest } = errors;
        setErrors(rest);
      }
    }

    if (field === 'skuCode') {
      const duplicate = existingProducts.some(p => {
        if ((p.productName || '').toLowerCase() === originalValues.productName.toLowerCase() &&
            (p.skuCode || '').toLowerCase() === originalValues.skuCode.toLowerCase()) {
          return false;
        }
        return (p.skuCode || '').toLowerCase() === trimmed.toLowerCase();
      });
      if (duplicate) {
        setErrors(prev => ({ ...prev, skuCode: 'Must be unique' }));
      } else if (errors.skuCode === 'Must be unique') {
        const { skuCode, ...rest } = errors;
        setErrors(rest);
      }
    }

    if (errors[field] && errors[field] !== 'Must be unique') {
      setErrors(prev => {
        const { [field]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const lower = (s: string) => s.trim().toLowerCase();

    if (!formData.productName.trim()) newErrors.productName = 'Product name is required';
    if (!formData.skuCode.trim()) newErrors.skuCode = 'SKU code is required';

    if (formData.productName && modifiedFields.has('productName')) {
      const isDuplicate = existingProducts.some(p => {
        if (lower(p.productName || '') === lower(originalValues.productName) &&
            lower(p.skuCode || '') === lower(originalValues.skuCode)) {
          return false;
        }
        return lower(p.productName || '') === lower(formData.productName);
      });
      if (isDuplicate) newErrors.productName = 'Must be unique';
    }

    if (formData.skuCode && modifiedFields.has('skuCode')) {
      const isDuplicate = existingProducts.some(p => {
        if (lower(p.productName || '') === lower(originalValues.productName) &&
            lower(p.skuCode || '') === lower(originalValues.skuCode)) {
          return false;
        }
        return lower(p.skuCode || '') === lower(formData.skuCode);
      });
      if (isDuplicate) newErrors.skuCode = 'Must be unique';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Helper function to detect if icon has changed
  const hasIconChanged = () => {
    if (!originalIcon && !selectedIcon) return false;
    if (!originalIcon || !selectedIcon) return true;
    
    return (
      originalIcon.id !== selectedIcon.id ||
      originalIcon.svgPath !== selectedIcon.svgPath ||
      originalIcon.tileColor !== selectedIcon.tileColor ||
      JSON.stringify(originalIcon.outerBg) !== JSON.stringify(selectedIcon.outerBg)
    );
  };

  const handleCancel = () => setShowDeleteConfirm(true);

  const handleConfirmDelete = async () => {
    setShowDeleteConfirm(false);
    if (productId) {
      try {
        await deleteProduct(productId);
      } catch (e) {
        console.error('Failed to delete product', e);
      }
    }
    localStorage.removeItem('editConfigFormData');
    localStorage.removeItem('editConfigProductType');
    onClose();
    navigate('/get-started/products');
  };

  const handleSaveDraft = async () => {
    if (draftStatus === 'saving') return;
    try {
      setDraftStatus('saving');
      if (!productId) {
        setDraftStatus('idle');
        return;
      }
      const draftPayload = {
        productName: formData.productName,
        version: formData.version,
        internalSkuCode: formData.skuCode,
        productDescription: formData.description,
        status: 'DRAFT' as const
      };
      await updateGeneralDetails(productId, draftPayload as any);
      
      // Update icon if changed
      if (hasIconChanged() && selectedIcon) {
        console.log('🎨 Draft save: Icon has changed, updating...');
        const iconResult = await updateProductIcon(productId, selectedIcon);
        if (iconResult.success) {
          setOriginalIcon(selectedIcon);
          // Notify parent component about the icon update
          if (onIconUpdate && productId && selectedIcon) {
            onIconUpdate(productId, selectedIcon);
          }
        }
      } else if (!selectedIcon && originalIcon) {
        console.log('🗑️ Draft save: Icon was removed, clearing...');
        const iconResult = await updateProductIcon(productId, null);
        if (iconResult.success) {
          setOriginalIcon(null);
        }
      }
      
      if (activeTab === 'configuration') {
        try {
          const productTypeChanged = localStorage.getItem('editConfigProductTypeChanged') === 'true';
          console.log('🔧 Draft save: Updating configuration...', { productType: configuration.productType, productTypeChanged, configuration });
          await updateConfiguration(productId, configuration.productType, configuration, productTypeChanged);
          console.log('✅ Draft save: Configuration updated successfully');
        } catch (configError) {
          console.error('❌ Draft save: Configuration update failed:', configError);
          // Don't fail the draft save if only configuration fails
          console.warn('⚠️ Draft save: Continuing despite configuration error');
        }
      }
      setDraftStatus('saved');
      setTimeout(() => setDraftStatus('idle'), 4000);
    } catch (err) {
      console.error('Save draft failed', err);
      setDraftStatus('idle');
      showToast?.({ kind: 'error', title: 'Failed to Save Draft', message: 'Please try again.' });
    }
  };

  const handleConfigChange = React.useCallback((config: Record<string, string>) => {
    setConfiguration(prev => {
      const updated = { ...prev, ...config };
      localStorage.setItem('editConfigFormData', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const handleProductTypeChange = (type: string) => {
    setConfiguration(prev => {
      const updated = { ...prev, productType: type };
      localStorage.setItem('editConfigFormData', JSON.stringify(updated));
      return updated;
    });
    setProductType(type);
    localStorage.setItem('editConfigProductType', type);
  };

  const goToStep = (index: number) => {
    setCurrentStep(index);
    const firstWord = steps[index].title.split(' ')[0].toLowerCase();
    const tab = (firstWord === 'general'
      ? 'general'
      : firstWord === 'configuration'
      ? 'configuration'
      : 'review') as ActiveTab;
    setActiveTab(tab);
  };

  // ---------- CHANGE DETECTION HELPERS ----------
  const shallowEqual = (a: any, b: any) => {
    const keys = new Set<string>([...Object.keys(a || {}), ...Object.keys(b || {})]);
    for (const k of keys) {
      if ((a as any)[k] !== (b as any)[k]) return false;
    }
    return true;
  };

  const hasPendingChanges = () => {
    // compare current vs snapshots
    const origForm = originalFormDataRef.current;
    const origCfg = originalConfigRef.current;
    if (!origForm || !origCfg) return false;
    const formChanged = !shallowEqual(origForm, formData);
    const cfgChanged = !shallowEqual(origCfg, configuration);
    return formChanged || cfgChanged;
  };

  const handleNextStep = async () => {
    if (activeTab === 'general') {
      if (!validateForm()) return;
      goToStep(1);
      return;
    }
    if (activeTab === 'configuration') {
      goToStep(2);
      return;
    }
    if (activeTab === 'review') {
      const changesExist = hasPendingChanges() || isDraft;
      if (!changesExist) {
        // nothing to persist – simply close and return to list without toast
        onClose();
        return;
      }
      const success = await saveAllChanges();
      if (success) {
        showToast({ kind: 'success', title: 'Changes Saved', message: 'Product updated successfully.' });
        onClose();
      } else {
        showToast({ kind: 'error', title: 'Failed to Save Changes', message: 'Could not update product. Please try again.' });
      }
    }
  };

  // Save all (only if there are changes)
  const saveAllChanges = async ({ includeGeneral = true, includeConfig = true }: { includeGeneral?: boolean; includeConfig?: boolean } = {}): Promise<boolean> => {
    // short-circuit: do nothing if no edits and not finalizing a draft
    if (!hasPendingChanges() && !isDraft) {
      return false;
    }
    try {
      setLoading(true);

      const { getAuthData } = await import('../../../utils/auth');
      const authData = getAuthData();
      if (!authData?.token) throw new Error('No authentication token found');
      if (!productId) throw new Error('Product ID is required for updating');

      // 1) General (PATCH /products/:id)
      if (includeGeneral) {
        const generalDetailsPayload = {
          productName: formData.productName?.trim() || '',
          version: formData.version?.trim() || '',
          internalSkuCode: formData.skuCode?.trim() || '',
          productDescription: formData.description?.trim() || '',
          status: isDraft ? 'DRAFT' : 'ACTIVE',
          productType: configuration.productType || productType || '',
          lastUpdated: new Date().toISOString()
        };
        await updateGeneralDetails(productId, generalDetailsPayload);
      }

      // 1.5) Icon Update - use updateProductIcon to properly update both icon URL and productIcon field
      if (hasIconChanged() && productId) {
        console.log('🎨 Icon has changed, updating via updateProductIcon...');
        
        const iconResult = await updateProductIcon(productId, selectedIcon);
        
        if (iconResult.success) {
          console.log('✅ Icon updated successfully via updateProductIcon');
          
          // Update the original icon to reflect the new state
          setOriginalIcon(selectedIcon);
          
          // Always notify parent component about the icon update (even if icon is removed)
          if (onIconUpdate) {
            console.log('🔔 Notifying parent about icon update:', { productId, selectedIcon });
            onIconUpdate(productId, selectedIcon);
          }
        } else {
          console.error('❌ Failed to update icon:', iconResult.message);
        }
      }

      // 2) Configuration (PATCH /products/:id/<type>) – only if we have a type and changes
      if (includeConfig && configuration.productType && productId) {
        // Check if there are actual configuration changes
        const hasConfigChanges = Object.keys(configuration).some(key => 
          key !== 'productType' && configuration[key] && configuration[key].trim() !== ''
        );
        
        if (hasConfigChanges) {
          try {
            const productTypeChanged = localStorage.getItem('editConfigProductTypeChanged') === 'true';
            console.log('🔧 Updating configuration...', { productType: configuration.productType, productTypeChanged, configuration });
            await updateConfiguration(productId, configuration.productType, configuration, productTypeChanged);
            console.log('✅ Configuration updated successfully');
          } catch (configError) {
            console.error('❌ Configuration update failed:', configError);
            // Don't fail the entire save if only configuration fails
            console.warn('⚠️ Continuing with save despite configuration error');
          }
        } else {
          console.log('⏭️ Skipping configuration update - no changes detected');
        }
      }

      // 3) Finalize if coming from a draft
      if (isDraft && productId) {
        await finalizeProduct(productId);
      }

      // success: refresh snapshots so subsequent clicks don't “save” again
      originalFormDataRef.current = { ...formData };
      originalConfigRef.current = { ...configuration };

      // clear cached config type/data
      localStorage.removeItem('editConfigFormData');
      localStorage.removeItem('editConfigProductType');

      return true;
    } catch (err) {
      console.error('Update failed:', err);
      // No alert() here – toasts only
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      goToStep(currentStep - 1);
    }
  };

  // Prefill and set snapshots
  useEffect(() => {
    const fetchDetails = async () => {
      if (!productId) return;
      try {
        setLoading(true);
        const data = await fetchGeneralDetails(productId);

        const originalProductName = data.productName ?? '';
        const originalSkuCode = data.internalSkuCode ?? '';

        const nextForm = {
          productName: originalProductName,
          version: data.version ?? '',
          skuCode: originalSkuCode,
          description: data.productDescription ?? ''
        };
        setFormData(nextForm);

        // ---------- Load product icon ----------
        console.log('🔍 Product data received:', data);
        console.log('🎨 Product icon field:', data.productIcon);
        console.log('🎨 Icon data field:', data.iconData);
        console.log('🖼️ Raw icon field:', data.icon);
        
        try {
          let hasStructuredIconData = false;
          
          // PRIORITY 1: Always check structured icon data first (productIcon field)
          if (data.productIcon) {
            console.log('📦 Found productIcon field - parsing JSON...');
            const parsed = JSON.parse(data.productIcon);
            console.log('📦 Parsed productIcon:', parsed);
            
            if (parsed.iconData) {
              console.log('✅ Using iconData from productIcon - SKIPPING SVG reconstruction');
              setSelectedIcon(parsed.iconData as ProductIconData);
              setOriginalIcon(parsed.iconData as ProductIconData);
              hasStructuredIconData = true;
              console.log('🚫 Structured icon data found - skipping SVG file processing');
            } else if (parsed.id) {
              console.log('✅ Using root level icon data from productIcon - SKIPPING SVG reconstruction');
              setSelectedIcon(parsed as ProductIconData);
              setOriginalIcon(parsed as ProductIconData);
              hasStructuredIconData = true;
              console.log('🚫 Structured icon data found - skipping SVG file processing');
            } else {
              console.log('⚠️ productIcon exists but no valid iconData found - will try SVG fallback');
            }
          } 
          // PRIORITY 2: Direct iconData field (fallback)
          else if (data.iconData) {
            console.log('✅ Using direct iconData field');
            setSelectedIcon(data.iconData as ProductIconData);
            setOriginalIcon(data.iconData as ProductIconData);
            hasStructuredIconData = true;
          } 
          
          // PRIORITY 3: Last resort - Parse SVG file to extract icon data (only if no structured data)
          if (!hasStructuredIconData && data.icon && typeof data.icon === 'string' && data.icon.includes('/uploads/')) {
            console.log('🔧 Attempting to fetch and parse SVG content...');
            
            // Resolve icon URL
            const resolveIconUrl = (icon: string) => {
              if (icon.startsWith('http') || icon.startsWith('data:')) return icon;
              if (icon.startsWith('/uploads')) {
                const serverBase = 'http://54.238.204.246:8080'; // BASE_URL without /api
                return `${serverBase}${icon}`;
              }
              const leadingSlash = icon.startsWith('/') ? '' : '/';
              return `http://54.238.204.246:8080/api${leadingSlash}${icon}`;
            };

            const iconUrl = resolveIconUrl(data.icon);
            console.log('🌐 Resolved icon URL:', iconUrl);

            try {
              // Fetch the SVG content with auth headers
              const { getAuthData } = await import('../../../utils/auth');
              const authData = getAuthData();
              
              const response = await fetch(iconUrl, {
                headers: {
                  'Authorization': `Bearer ${authData?.token}`,
                  'X-Organization-Id': authData?.organizationId?.toString() || ''
                }
              });
              
              if (response.ok) {
                const svgText = await response.text();
                console.log('📄 Fetched SVG content length:', svgText.length);
                
                // Parse the SVG to extract icon data
                const parser = new DOMParser();
                const doc = parser.parseFromString(svgText, 'image/svg+xml');
                
                // Extract the tile color from the back tile rect
                const rects = doc.querySelectorAll('rect');
                let tileColor = '#0F6DDA'; // default
                for (const rect of rects) {
                  const width = rect.getAttribute('width');
                  const fill = rect.getAttribute('fill');
                  // Find the back tile rect (width="29.45" or similar)
                  if (width && parseFloat(width) > 29 && parseFloat(width) < 30 && fill && fill.startsWith('#')) {
                    tileColor = fill;
                    console.log('🎨 Extracted tile color:', tileColor);
                    break;
                  }
                }
                
                // Extract the icon path
                const pathElement = doc.querySelector('path[fill="#FFFFFF"]');
                let svgPath = 'M12 2L2 7L12 12L22 7L12 2Z'; // default
                let viewBox = '0 0 24 24';
                if (pathElement) {
                  svgPath = pathElement.getAttribute('d') || svgPath;
                  const svgElement = pathElement.closest('svg');
                  if (svgElement) {
                    viewBox = svgElement.getAttribute('viewBox') || viewBox;
                  }
                  console.log('📐 Extracted path and viewBox:', { svgPath, viewBox });
                }
                
                // Create ProductIconData object
                const reconstructedIcon: ProductIconData = {
                  id: `reconstructed-${Date.now()}`,
                  label: 'Reconstructed Icon',
                  svgPath: svgPath,
                  viewBox: viewBox,
                  tileColor: tileColor,
                  outerBg: ['#F8F7FA', '#E4EEF9'] // default gradient
                };
                
                console.log('✅ Reconstructed icon data:', reconstructedIcon);
                setSelectedIcon(reconstructedIcon);
                setOriginalIcon(reconstructedIcon);
              } else {
                console.warn('❌ Failed to fetch SVG:', response.status);
              }
            } catch (fetchErr) {
              console.warn('❌ Failed to fetch/parse SVG:', fetchErr);
            }
          } else if (!hasStructuredIconData) {
            console.log('❌ No icon data found in product - no structured data and no SVG file');
            console.log('❌ Available fields:', Object.keys(data));
          }
        } catch (err) {
          console.warn('❌ Failed to parse product icon:', err);
          console.warn('❌ Raw productIcon data:', data.productIcon);
          console.warn('❌ Raw icon data:', data.icon);
        }

        // set snapshots for change detection
        originalFormDataRef.current = { ...nextForm };

        // baseline config snapshot
        const fetchedConfig = (() => {
          try {
            const s = localStorage.getItem('editConfigFetchedData');
            return s ? JSON.parse(s) : {};
          } catch {
            return {};
          }
        })();
        const currentConfig = (() => {
          try {
            const s = localStorage.getItem('editConfigFormData');
            return s ? JSON.parse(s) : {};
          } catch {
            return {};
          }
        })();
        originalConfigRef.current = Object.keys(fetchedConfig).length ? fetchedConfig : currentConfig;

        setOriginalValues({ productName: originalProductName, skuCode: originalSkuCode });
        setIsDraft((data.status ?? '').toUpperCase() === 'DRAFT');

        // product type from localStorage or API
        const savedProductType = localStorage.getItem('editConfigProductType');
        if (savedProductType) {
          setProductType(savedProductType);
          setConfiguration(prev => ({ ...prev, productType: savedProductType }));
        } else if (data.productType) {
          setProductType(data.productType);
          handleProductTypeChange(data.productType);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [productId]);

  return (
    <>
      <TopBar
        title={productId ? `Edit ${formData.productName || 'Product'}` : 'Create New Product'}
        onBack={() => setShowSaveDraftModal(true)}
      />
      <div className="edit-np-viewport">
        <div className="edit-np-card">
          <div className="edit-np-grid">
            {/* Sidebar */}
            <aside className="edit-np-rail">
              <div className="edit-np-steps">
                {steps.map((step, index) => {
                  const isActive = index === currentStep;
                  const isCompleted = index < currentStep;
                  return (
                    <div
                      key={step.id}
                      className={`edit-np-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                      onClick={() => goToStep(index)}
                    >
                      <div className="edit-np-step__title">{step.title}</div>
                    </div>
                  );
                })}
              </div>
            </aside>

            {/* Main */}
            <div className="edit-np-content">
              <div className="edit-np-form">
                {/* GENERAL */}
                {activeTab === 'general' && (
                  <div className="edit-np-section">
                    <div className="edit-np-form-row">
                      <div className="edit-np-form-group">
                        <label className="edit-np-label">Product Name</label>
                        <InputField
                          value={formData.productName}
                          onChange={(val: string) => handleInputChange('productName', val)}
                          placeholder="eg. Google Maps API"
                          error={errors.productName}
                        />
                      </div>
                      <div className="edit-np-form-group">
                        <label className="edit-np-label">Version</label>
                        <InputField
                          value={formData.version}
                          onChange={(val: string) => handleInputChange('version', val)}
                          placeholder="eg., 2.3-VOS"
                        />
                      </div>
                    </div>

                    {/* Product Icon Field */}
                    <div className="edit-np-form-group">
                      <label className="edit-np-label">Product Icon</label>
                      
                      {selectedIcon ? (
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
                                  linear-gradient(135deg, ${selectedIcon.outerBg?.[0] || '#F8F7FA'}, ${selectedIcon.outerBg?.[1] || '#E4EEF9'}),
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
                                  background: selectedIcon.tileColor || '#CC9434',
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
                                <path d="M5.99942 10.9517H11.2494M8.55208 1.39783C8.7843 1.16562 9.09926 1.03516 9.42767 1.03516C9.75607 1.03516 10.071 1.16562 10.3032 1.39783C10.5355 1.63005 10.6659 1.94501 10.6659 2.27342C10.6659 2.60183 10.5355 2.91678 10.3032 3.149L3.29742 10.1554C3.15864 10.2942 2.9871 10.3957 2.79867 10.4506L1.12333 10.9394C1.07314 10.9541 1.01993 10.9549 0.969281 10.942C0.91863 10.929 0.872399 10.9026 0.835427 10.8657C0.798455 10.8287 0.772102 10.7825 0.759125 10.7318C0.746149 10.6812 0.747027 10.6279 0.761667 10.5778L1.2505 8.90242C1.30546 8.7142 1.40698 8.54286 1.54567 8.40425L8.55208 1.39783Z" stroke="#1D7AFC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
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
                      ) : (
                        <button 
                          type="button" 
                          className="np-icon-add-btn" 
                          onClick={() => setIsIconPickerOpen(true)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '8px 12px',
                            border: '1px dashed #D5D4DF',
                            borderRadius: 6,
                            background: 'transparent',
                            color: '#1D7AFC',
                            cursor: 'pointer',
                            fontSize: 14,
                            fontWeight: 500
                          }}
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M8 3.33334V12.6667M3.33334 8H12.6667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          Add Icon
                        </button>
                      )}
                    </div>

                    <ProductIconPickerModal
                      isOpen={isIconPickerOpen}
                      onClose={() => setIsIconPickerOpen(false)}
                      onSelect={(icon) => {
                        setSelectedIcon(icon);
                        setIsIconPickerOpen(false);
                      }}
                      maxCombosPerIcon={24}
                    />

                    <div className="edit-np-form-group">
                      <label className="edit-np-label">SKU Code</label>
                      <InputField
                        value={formData.skuCode}
                        onChange={(val: string) => handleInputChange('skuCode', val)}
                        placeholder="SKU-96"
                        error={errors.skuCode}
                      />
                    </div>

                    <div className="edit-np-form-group">
                      <label className="edit-np-label">Description</label>
                      <TextareaField
                        value={formData.description}
                        onChange={(val: string) => handleInputChange('description', val)}
                        placeholder="Enter product description"
                        error={errors.description}
                      />
                    </div>
                  </div>
                )}

                {/* CONFIGURATION */}
                {activeTab === 'configuration' && (
                  <div className="edit-np-section">
                    <div className="edit-np-configuration-tab">
                      <ConfigurationTab
                        initialProductType={productType}
                        onConfigChange={handleConfigChange}
                        onProductTypeChange={handleProductTypeChange}
                        ref={configRef}
                        productId={productId ?? formData.skuCode}
                      />
                    </div>
                  </div>
                )}

                {/* REVIEW */}
                {activeTab === 'review' && (
                  <div className="edit-np-section">
                    <div className="edit-np-review-container">
                      <EditReview generalDetails={formData} configuration={configuration} />
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Buttons */}
              <div className="edit-np-form-footer">
                <div className="edit-np-btn-group edit-np-btn-group--back">
                  {activeTab !== 'general' && (
                    <SecondaryButton type="button" onClick={handlePreviousStep}>
                      Back
                    </SecondaryButton>
                  )}
                </div>

                <div className="edit-np-btn-group edit-np-btn-group--next">
                  <PrimaryButton type="button" onClick={handleNextStep} disabled={loading}>
                    {loading ? 'Saving...' : activeTab === 'review' ? (isDraft ? 'Finalize Product' : 'Save Changes') : 'Save & Next'}
                  </PrimaryButton>
                </div>
              </div>
            </div>

            <div className="af-skel-rule af-skel-rule--bottom" />
          </div>
        </div>

        <EditPopup
          isOpen={showSaveDraftModal}
          onClose={() => {
            // Clear localStorage when closing without saving
            localStorage.removeItem('editConfigFormData');
            localStorage.removeItem('editConfigProductType');
            setShowSaveDraftModal(false);
            onClose();
          }}
          onDismiss={() => setShowSaveDraftModal(false)}
          onSave={async () => {
            if (!validateForm()) {
              setShowSaveDraftModal(false);
              return;
            }
            setShowSaveDraftModal(false);

            // Only save if there are changes (or draft finalization)
            if (!hasPendingChanges() && !isDraft) {
              onClose();
              return;
            }

            const success = await saveAllChanges({
              includeGeneral: true,
              includeConfig: activeTab !== 'general'
            });
            if (success) {
              showToast({ kind: 'success', title: 'Changes Saved', message: 'Product updated successfully.' });
              onClose();
            } else {
              showToast({ kind: 'error', title: 'Failed to Save Changes', message: 'Could not update product. Please try again.' });
            }
          }}
        />

        <ConfirmDeleteModal
          isOpen={showDeleteConfirm}
          productName={formData.productName || 'this product'}
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      </div>
    </>
  );
};

export default EditProduct;
