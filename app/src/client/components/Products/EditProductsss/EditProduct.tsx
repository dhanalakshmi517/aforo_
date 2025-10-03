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
import './EditProduct.css';
import { updateGeneralDetails, fetchGeneralDetails, updateConfiguration, buildAuthHeaders } from './EditProductApi';
import { finalizeProduct, deleteProduct } from '../api';
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
}

type ActiveTab = 'general' | 'configuration' | 'review';

const EditProduct: React.FC<EditProductProps> = ({ onClose, productId }: EditProductProps) => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    document.body.classList.add('edit-product-page');
    return () => {
      document.body.classList.remove('edit-product-page');
    };
  }, []);

  const [currentStep, setCurrentStep] = useState(0);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productType, setProductType] = useState<string>('');

  const [activeTab, setActiveTab] = useState<ActiveTab>('general');

  const [showSaveDraftModal, setShowSaveDraftModal] = useState(false);
  const [draftStatus, setDraftStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [formData, setFormData] = useState({
    productName: '',
    version: '',
    skuCode: '',
    description: ''
  });
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
          // fallback to authenticated endpoint
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
  const [configuration, setConfiguration] = useState<Record<string, string>>({});
  const [isDraft, setIsDraft] = useState(false);
  const [loading, setLoading] = useState(false);
  const configRef = useRef<import('./EditConfiguration').ConfigurationTabHandle>(null);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    const trimmed = value.trim();
    setFormData(prev => ({ ...prev, [field]: value }));

    // Mark this field as modified by the user
    setModifiedFields(prev => new Set(prev).add(field));

    // Only check uniqueness for fields that have been modified by the user (including this change)
    if (field === 'productName') {
      const duplicate = existingProducts.some(p => {
        // Skip if this is the current product (same original values)
        if ((p.productName || '').toLowerCase() === originalValues.productName.toLowerCase() && 
            (p.skuCode || '').toLowerCase() === originalValues.skuCode.toLowerCase()) {
          return false;
        }
        // Check if another product has the same name
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
        // Skip if this is the current product (same original values)
        if ((p.productName || '').toLowerCase() === originalValues.productName.toLowerCase() && 
            (p.skuCode || '').toLowerCase() === originalValues.skuCode.toLowerCase()) {
          return false;
        }
        // Check if another product has the same SKU
        return (p.skuCode || '').toLowerCase() === trimmed.toLowerCase();
      });
      if (duplicate) {
        setErrors(prev => ({ ...prev, skuCode: 'Must be unique' }));
      } else if (errors.skuCode === 'Must be unique') {
        const { skuCode, ...rest } = errors;
        setErrors(rest);
      }
    }

    // Clear specific error if other validations
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

    // Required field checks
    if (!formData.productName.trim()) newErrors.productName = 'Product name is required';
    if (!formData.skuCode.trim()) newErrors.skuCode = 'SKU code is required';

    // Uniqueness checks - only for fields that have been modified by the user
    if (formData.productName && modifiedFields.has('productName')) {
      const isDuplicate = existingProducts.some(p => {
        // Skip if this is the current product (same original values)
        if (lower(p.productName || '') === lower(originalValues.productName) && 
            lower(p.skuCode || '') === lower(originalValues.skuCode)) {
          return false;
        }
        // Check if another product has the same name
        return lower(p.productName || '') === lower(formData.productName);
      });
      if (isDuplicate) {
        newErrors.productName = 'Must be unique';
      }
    }

    if (formData.skuCode && modifiedFields.has('skuCode')) {
      const isDuplicate = existingProducts.some(p => {
        // Skip if this is the current product (same original values)
        if (lower(p.productName || '') === lower(originalValues.productName) && 
            lower(p.skuCode || '') === lower(originalValues.skuCode)) {
          return false;
        }
        // Check if another product has the same SKU
        return lower(p.skuCode || '') === lower(formData.skuCode);
      });
      if (isDuplicate) {
        newErrors.skuCode = 'Must be unique';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCancel = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    setShowDeleteConfirm(false);
    if (productId) {
      try {
        await deleteProduct(productId);
      } catch (e) {
        console.error('Failed to delete product', e);
      }
    }
    onClose();
    navigate('/get-started/products');
  };

  const handleSaveDraft = async () => {
    if (draftStatus === 'saving') return;
    try {
      setDraftStatus('saving');
      if (!productId) {
        alert('Product ID missing – cannot save draft');
        setDraftStatus('idle');
        return;
      }
      const draftPayload = {
        productName: formData.productName,
        version: formData.version,
        internalSkuCode: formData.skuCode,
        productDescription: formData.description,
        status: 'DRAFT' as const,
      };
      await updateGeneralDetails(productId, draftPayload as any);
      // If currently on configuration tab also persist configuration
      if (activeTab === 'configuration') {
        await updateConfiguration(productId, configuration.productType, configuration);
      }
      setDraftStatus('saved');
      // auto reset label back to normal after 4 s
      setTimeout(() => setDraftStatus('idle'), 4000);
    } catch (err) {
      console.error('Save draft failed', err);
      alert('Failed to save draft. Please try again.');
      setDraftStatus('idle');
    }
  };

  const handleConfigChange = React.useCallback((config: Record<string, string>) => {
    setConfiguration(prev => ({ ...prev, ...config }));
  }, []);

  const handleProductTypeChange = (type: string) => {
    setConfiguration(prev => ({ ...prev, productType: type }));
    setProductType(type);
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

  const handleNextStep = async () => {
    if (activeTab === 'general') {
      if (!validateForm()) return;
      // Just move to next step without API call
      goToStep(1);
      return;
    }
    if (activeTab === 'configuration') {
      // Just move to next step without API call - validation will happen in review
      goToStep(2);
      return;
    }
    if (activeTab === 'review') {
      // Use the shared save function
      const success = await saveAllChanges();
      if (success) {
        showToast({ kind: 'success', title: 'Changes Saved', message: 'Product updated successfully.' });
        onClose();
      } else {
        showToast({ kind: 'error', title: 'Failed to Save Changes', message: 'Could not update product. Please try again.' });
      }
    }
  };


  // Function to save all changes (used in both review tab and back button popup)
  const saveAllChanges = async ({ includeGeneral = true, includeConfig = true }: { includeGeneral?: boolean; includeConfig?: boolean } = {}): Promise<boolean> => {
    try {
      setLoading(true);
      console.log('Starting saveAllChanges...');
      console.log('Current form data:', formData);
      console.log('Current configuration:', configuration);
      console.log('Product ID:', productId);
      console.log('Is Draft:', isDraft);

      const { getAuthData } = await import('../../../utils/auth');
      const authData = getAuthData();
      
      if (!authData?.token) {
        throw new Error('No authentication token found');
      }

      // Check if productId exists
      if (!productId) {
        throw new Error('Product ID is required for updating');
      }

      // 1. Update general details with comprehensive payload (only if requested)
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
      
      console.log('Sending general details payload:', generalDetailsPayload);
      await updateGeneralDetails(productId, generalDetailsPayload);
      console.log('General details updated successfully');
      }

      // 2. Update configuration with enhanced payload (only if requested)
      if (includeConfig && configuration.productType && productId) {
        const configurationPayload = {
          productType: configuration.productType,
          productId: productId,
          version: formData.version?.trim() || '1.0',
          status: 'ACTIVE',
          lastUpdated: new Date().toISOString(),
          ...Object.fromEntries(
            Object.entries(configuration).map(([key, value]) => [key, String(value)])
          )
        };
        
        console.log('Sending configuration payload:', configurationPayload);
        await updateConfiguration(productId, configuration.productType, configurationPayload);
        console.log('Configuration updated successfully');
      } else {
        console.log('Skipping configuration update - no productType or productId');
      }

      // 3. Finalize product if it was a draft
      if (isDraft && productId) {
        console.log('Finalizing product:', productId);
        await finalizeProduct(productId);
        console.log('Product finalized successfully');
      } else {
        console.log('Skipping finalization - not a draft or no productId');
      }

      console.log('All updates completed successfully');
      return true;
    } catch (err) {
      console.error('Update failed:', err);
      console.error('Error details:', {
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined
      });
      alert(`Failed to update product: ${err instanceof Error ? err.message : 'Unknown error'}`);
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

  // Prefill form if productId provided
  useEffect(() => {
    const fetchDetails = async () => {
      if (!productId) return;
      try {
        setLoading(true);
        
        // Import auth utilities and create authenticated request
        const data = await fetchGeneralDetails(productId);
        console.log('Fetched general product details:', data);
        
        const originalProductName = data.productName ?? '';
        const originalSkuCode = data.internalSkuCode ?? '';
        
        setFormData(prev => ({
          ...prev,
          productName: originalProductName,
          version: data.version ?? '',
          skuCode: originalSkuCode,
          description: data.productDescription ?? ''
        }));
        
        // Store original values for uniqueness validation
        setOriginalValues({
          productName: originalProductName,
          skuCode: originalSkuCode
        });
        
        setIsDraft((data.status ?? '').toUpperCase() === 'DRAFT');
        
        // Set product type for configuration component to fetch its data
        if (data.productType) {
          setProductType(data.productType);
          handleProductTypeChange(data.productType);
        } else {
          // Fallback: probe known configuration endpoints to infer type
          const typeMap: Record<string,string> = { API:'api', FlatFile:'flatfile', SQLResult:'sql-result', LLMToken:'llm-token' };
          const hdrs = await (await import('./EditProductApi')).buildAuthHeaders();
          for (const [key, slug] of Object.entries(typeMap)) {
            try {
              const probeRes = await fetch(
                `http://54.238.204.246:8080/api/products/${productId}/${slug}`, { method: 'HEAD', headers: hdrs });
              if (probeRes.ok) {
                console.log('Inferred productType via probe:', key);
                setProductType(key);
                handleProductTypeChange(key);
                break;
              }
            } catch (probeErr) {
              /* ignore */
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [productId]);

  // Removed loading screen - component renders immediately

  return (
    <>
      <TopBar
        title={productId ? 'Edit Product' : 'Create New Product'}
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

          {/* Main Content */}
          <div className="edit-np-content">
            <div className="edit-np-form">
              {/* ---------- GENERAL DETAILS ---------- */}
              {activeTab === 'general' && (
                <div className="edit-np-section">
                  {/* <h3 className="edit-np-section-title">GENERAL DETAILS</h3> */}
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

                {/* ---------- CONFIGURATION ---------- */}
                {activeTab === 'configuration' && (
                  <div className="edit-np-section">
                    {/* <h3 className="edit-np-section-title">CONFIGURATION</h3> */}
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

                {/* ---------- REVIEW ---------- */}
                {activeTab === 'review' && (
                  <div className="edit-np-section">
                    {/* <h3 className="edit-np-section-title">REVIEW &amp; CONFIRM</h3> */}
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
                    <SecondaryButton
                      type="button"
                      onClick={handlePreviousStep}
                    >
                      Back
                    </SecondaryButton>
                  )}
                </div>

                <div className="edit-np-btn-group edit-np-btn-group--next">
                  <PrimaryButton
                    type="button"
                    onClick={handleNextStep}
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : activeTab === 'review' ? (isDraft ? 'Finalize Product' : 'Update Product') : 'Next'}
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
            setShowSaveDraftModal(false);
            onClose();
          }}
          onDismiss={() => {
            // Only close the popup, not the form
            setShowSaveDraftModal(false);
          }}
          onSave={async () => {
            // Save Changes - validate form first, then call all APIs like in review tab
            if (!validateForm()) {
              setShowSaveDraftModal(false);
              return; // Don't close if validation fails, let user see errors
            }
            
            setShowSaveDraftModal(false);
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


