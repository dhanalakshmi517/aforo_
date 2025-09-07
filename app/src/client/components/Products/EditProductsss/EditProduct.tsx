import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { InputField, TextareaField } from '../../Components/InputFields';
import SaveAsDraftModal from '../Componenets/SaveAsDraftModel';
import DeleteConfirmModal from '../Componenets/DeleteConfirmModal';
import { ConfigurationTab } from './EditConfiguration';
import EditReview from './EditReview';
import './EditProduct.css';

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

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [configuration, setConfiguration] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const configRef = useRef<import('./EditConfiguration').ConfigurationTabHandle>(null);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.productName.trim()) newErrors.productName = 'Product name is required';
    if (!formData.skuCode.trim()) newErrors.skuCode = 'SKU code is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCancel = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    setShowDeleteConfirm(false);
    onClose();
    navigate('/get-started/products');
  };

  const handleSaveDraft = () => {
    if (draftStatus === 'saving') return;
    setDraftStatus('saving');
    // UI-only simulation
    setTimeout(() => {
      setDraftStatus('saved');
      setTimeout(() => setDraftStatus('idle'), 4000);
    }, 4000);
  };

  const handleConfigChange = (config: Record<string, string>) => {
    setConfiguration(prev => ({ ...prev, ...config }));
  };

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

        const headers = {
          'Authorization': `Bearer ${authData.token}`,
          'Content-Type': 'application/json',
          'X-Organization-Id': authData?.organizationId?.toString() || ''
        };

        const updatePayload = {
          productName: formData.productName,
          version: formData.version,
          internalSkuCode: formData.skuCode,
          productDescription: formData.description
        };

        const res = await fetch(`http://54.238.204.246:8080/api/products/${productId}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(updatePayload)
        });

        if (!res.ok) {
          throw new Error('Failed to update product');
        }

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
      onClose(); // finish without API
    }
  };


  // Submit configuration PUT
  const submitConfig = async (): Promise<boolean> => {
    if (!productId) return true; // new product? allow
    try {
      const { getAuthData } = await import('../../../utils/auth');
      const authData = getAuthData();
      if (!authData?.token) throw new Error('No authentication token');
      const headers: Record<string,string> = {
        'Authorization': `Bearer ${authData.token}`,
        'Content-Type': 'application/json',
        'X-Organization-Id': authData?.organizationId?.toString() || ''
      };
      // map
      const endpointMap: Record<string,string> = {
        API: 'api',
        FlatFile: 'flatfile',
        SQLResult: 'sql-result',
        LLMToken: 'llm-token'
      };
      const endpoint = endpointMap[configuration.productType ?? ''] || (configuration.productType || '').toLowerCase();
      if (!endpoint) return false;
      const res = await fetch(
        `http://54.238.204.246:8080/api/products/${productId}/${endpoint}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(configuration)
      });
      if (!res.ok) throw new Error('Failed to update configuration');
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
        const { getAuthData } = await import('../../../utils/auth');
        const authData = getAuthData();
        
        if (!authData?.token) {
          throw new Error('No authentication token found');
        }

        const headers = {
          'Authorization': `Bearer ${authData.token}`,
          'Content-Type': 'application/json',
          'X-Organization-Id': authData?.organizationId?.toString() || ''
        };

        const res = await fetch(`http://54.238.204.246:8080/api/products/${productId}`, { headers });
        if (!res.ok) throw new Error('Failed to fetch product');
        const data = await res.json();
        console.log('Fetched general product details:', data);
        
        setFormData(prev => ({
          ...prev,
          productName: data.productName ?? '',
          version: data.version ?? '',
          skuCode: data.internalSkuCode ?? '',
          description: data.productDescription ?? ''
        }));
        
        // Set product type for configuration component to fetch its data
        if (data.productType) {
          setProductType(data.productType);
          handleProductTypeChange(data.productType);
        } else {
          // Fallback: probe known configuration endpoints to infer type
          const typeMap: Record<string,string> = { API:'api', FlatFile:'flatfile', SQLResult:'sql-result', LLMToken:'llm-token' };
          for (const [key, slug] of Object.entries(typeMap)) {
            try {
              const probeRes = await fetch(
                `http://54.238.204.246:8080/api/products/${productId}/${slug}`, { method: 'HEAD', headers });
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
    <div className="edit-product-create-overlay">
      {/* Header */}
      <div className="edit-product-header">
        <div className="edit-header-title-container">
          <h2>Edit Product</h2>
        </div>
        <div className="edit-product-header-buttons">
          <button type="button" className="edit-product-cancel-btn" onClick={handleCancel}>
            Cancel
          </button>
          <button
            type="button"
            className="edit-product-save-draft-btn"
            onClick={handleSaveDraft}
            disabled={draftStatus === 'saving'}
          >
            {draftStatus === 'saving' ? 'Saving...' : draftStatus === 'saved' ? 'Saved' : 'Save as Draft'}
          </button>
        </div>
      </div>

      <div className="edit-product-create-wrapper">
        <button
          className="edit-close-button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: '#666',
            zIndex: 1000
          }}
          aria-label="Close"
        >
          ×
        </button>

        <div className="edit-product-main-content">
          {/* Sidebar */}
          <aside className="edit-product-sidebar">
            {steps.map((step, index) => {
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              return (
                <div
                  key={step.id}
                  className={`edit-product-step ${isActive ? 'edit-active' : ''} ${isCompleted ? 'edit-completed' : ''}`}
                  onClick={() => goToStep(index)}
                >
                  <div className="edit-product-step-text">
                    <span className="edit-product-step-title">{step.title}</span>
                    <span className="edit-product-step-desc">{step.desc}</span>
                  </div>
                </div>
              );
            })}
          </aside>

          {/* Main Content */}
          <div className="edit-product-content">
            <div className="edit-product-form-container">
              <div className="edit-product-form-section">
                {/* ---------- GENERAL DETAILS ---------- */}
                {activeTab === 'general' && (
                  <div>
                    <h3>GENERAL DETAILS</h3>
                    <div className="edit-form-row">
                      <div className="edit-forms-group">
                        <label>Product Name</label>
                        <InputField
                          value={formData.productName}
                          onChange={(val: string) => handleInputChange('productName', val)}
                          placeholder="eg. Google Maps API"
                          error={errors.productName}
                        />
                      </div>
                      <div className="edit-forms-group">
                        <label>Version</label>
                        <InputField
                          value={formData.version}
                          onChange={(val: string) => handleInputChange('version', val)}
                          placeholder="eg., 2.3-VOS"
                        />
                      </div>
                    </div>

                    <div className="edit-forms-group">
                      <label>SKU Code</label>
                      <InputField
                        value={formData.skuCode}
                        onChange={(val: string) => handleInputChange('skuCode', val)}
                        placeholder="Enter SKU code"
                        error={errors.skuCode}
                      />
                    </div>

                    <div className="edit-forms-group">
                      <label>Description</label>
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
                  <div className="edit-configuration-tab-container">
                    <h3>CONFIGURATION</h3>
                    <ConfigurationTab
                      initialProductType={productType}
                      onConfigChange={handleConfigChange}
                      onProductTypeChange={handleProductTypeChange}
                      ref={configRef}
                      productId={productId ?? formData.skuCode}
                      onSubmit={submitConfig}
                    />
                  </div>
                )}

                {/* ---------- REVIEW ---------- */}
                {activeTab === 'review' && (
                  <div>
                    <h3>REVIEW &amp; CONFIRM</h3>
                    <EditReview generalDetails={formData} configuration={configuration} />
                  </div>
                )}
              </div>

              {/* Footer Buttons */}
              <div className="edit-button-group">
                {activeTab !== 'general' && (
                  <button type="button" className="edit-product-cancel-btn" onClick={handlePreviousStep}>
                    Back
                  </button>
                )}
                <button type="button" className="edit-product-save-next-btn" onClick={handleNextStep}>
                  {activeTab === 'review' ? 'Finish' : 'Next'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <SaveAsDraftModal
          isOpen={showSaveDraftModal}
          onSave={() => {
            setShowSaveDraftModal(false);
            onClose();
          }}
          onDelete={() => {
            setShowSaveDraftModal(false);
            onClose();
          }}
        />

        <DeleteConfirmModal
          isOpen={showDeleteConfirm}
          productName={formData.productName || 'this product'}
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      </div>
    </div>
  );
};

export default EditProduct;