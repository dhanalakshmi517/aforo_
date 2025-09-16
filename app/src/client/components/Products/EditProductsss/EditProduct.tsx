import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { InputField, TextareaField } from '../../componenetsss/Inputs';
import SaveDraft from '../../componenetsss/SaveDraft';
import ConfirmDeleteModal from '../../componenetsss/ConfirmDeleteModal';
import { ConfigurationTab } from './EditConfiguration';
import EditReview from './EditReview';
import TopBar from '../../componenetsss/TopBar';
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

    // Uniqueness checks similar to NewProduct component
    if (field === 'productName') {
      const duplicate = existingProducts.some(p => (p.productName || '').toLowerCase() === trimmed.toLowerCase() && p.skuCode !== formData.skuCode);
      if (duplicate) {
        setErrors(prev => ({ ...prev, productName: 'Must be unique' }));
      } else if (errors.productName === 'Must be unique') {
        const { productName, ...rest } = errors;
        setErrors(rest);
      }
    }
    if (field === 'skuCode') {
      const duplicate = existingProducts.some(p => (p.skuCode || '').toLowerCase() === trimmed.toLowerCase() && p.productName !== formData.productName);
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

    // Uniqueness checks
    if (formData.productName && existingProducts.some(p => lower(p.productName || '') === lower(formData.productName) && p.skuCode !== formData.skuCode)) {
      newErrors.productName = 'Must be unique';
    }
    if (formData.skuCode && existingProducts.some(p => lower(p.skuCode || '') === lower(formData.skuCode) && p.productName !== formData.productName)) {
      newErrors.skuCode = 'Must be unique';
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
      
      // Update product via PUT API before moving to next step
      try {
        setLoading(true);
        const { getAuthData } = await import('../../../utils/auth');
        const authData = getAuthData();
        
        if (!authData?.token) {
          throw new Error('No authentication token found');
        }

        const updatePayload = {
          productName: formData.productName,
          version: formData.version,
          internalSkuCode: formData.skuCode,
          productDescription: formData.description
        };

        await updateGeneralDetails(productId!, updatePayload);

        // Only move to next step if API call succeeds
        goToStep(1);
      } catch (err) {
        console.error('Update failed:', err);
        // Show error to user - you could add a toast notification here
        alert('Failed to update product. Please try again.');
      } finally {
        setLoading(false);
      }
      return;
    }
    if (activeTab === 'configuration') {
      const ok = await configRef.current?.submit();
      if (!ok) return;
      goToStep(2);
      return;
    }
    if (activeTab === 'review') {
      if (isDraft && productId) {
        try {
          setLoading(true);
          await finalizeProduct(productId);
          onClose();
        } catch (err) {
          console.error('Finalize failed', err);
          alert('Failed to finalize product. Please try again.');
        } finally {
          setLoading(false);
        }
      } else {
        onClose();
      }
    }
  };


  // Submit configuration PUT
  const submitConfig = async (): Promise<boolean> => {
    if (!productId) return true; // new product? allow
    try {
      const { getAuthData } = await import('../../../utils/auth');
      const authData = getAuthData();
      if (!authData?.token) throw new Error('No authentication token');
      await updateConfiguration(productId, configuration.productType, configuration);
      return true;
    } catch (err) {
      console.error('Config update failed', err);
      alert('Failed to update configuration');
      return false;
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
        
        setFormData(prev => ({
          ...prev,
          productName: data.productName ?? '',
          version: data.version ?? '',
          skuCode: data.internalSkuCode ?? '',
          description: data.productDescription ?? ''
        }));
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

  if (loading) {
    return <div style={{ padding: 20 }}>Loading...</div>;
  }

  return (
    <>
      <TopBar
        title={productId ? 'Edit Product' : 'Create New Product'}
        onBack={() => setShowSaveDraftModal(true)}
        cancel={{
          label: 'Cancel',
          onClick: handleCancel
        }}
        save={{
          label: draftStatus === 'saved' ? 'Saved as Draft' : 'Save as Draft',
          labelWhenSaved: 'Saved as Draft',
          saved: draftStatus === 'saved',
          saving: draftStatus === 'saving',
          disabled: loading,
          onClick: handleSaveDraft
        }}
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
                        onSubmit={submitConfig}
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
                    <button
                      type="button"
                      className="np-btn np-btn--ghost"
                      onClick={handlePreviousStep}
                    >
                      Back
                    </button>
                  )}
                </div>

                <div className="edit-np-btn-group edit-np-btn-group--next">
                  <button
                    type="button"
                    className={`np-btn np-btn--primary ${loading ? 'np-btn--loading' : ''}`}
                    onClick={handleNextStep}
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : activeTab === 'review' ? (isDraft ? 'Finalize Product' : 'Update Product') : 'Next'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <SaveDraft
          isOpen={showSaveDraftModal}
          onClose={async () => {
            setShowSaveDraftModal(false);
            if (productId) {
              try {
                await deleteProduct(productId);
              } catch (e) {
                console.error('Failed to delete product draft', e);
              }
            }
          }}
          onSave={async () => {
            await handleSaveDraft();
            setShowSaveDraftModal(false);
            onClose();
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


