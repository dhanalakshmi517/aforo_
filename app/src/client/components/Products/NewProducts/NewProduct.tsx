import * as React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { InputField, TextareaField } from '../../Components/InputFields';
import SaveAsDraftModal from '../Componenets/SaveAsDraftModel';
import DeleteConfirmModal from '../Componenets/DeleteConfirmModal';
import { ConfigurationTab } from './ConfigurationTab';
import ProductReview from './ProductReview';
import { createProduct } from '../api';
import { getAuthHeaders } from '../../../utils/auth';
import './NewProduct.css';

const steps = [
  { id: 1, title: 'General Details', desc: 'Start with the basics of your product.' },
  { id: 2, title: 'Configuration', desc: 'Define configuration and parameters.' },
  { id: 3, title: 'Review & Confirm', desc: 'Validate all details before finalizing.' },
];

interface NewProductProps {
  onClose: () => void;
}

const NewProduct: React.FC<NewProductProps> = ({ onClose }: NewProductProps) => {
  useEffect(() => {
    document.body.classList.add('create-product-page');
    return () => {
      document.body.classList.remove('create-product-page');
    };
  }, []);

  type ActiveTab = 'general' | 'configuration' | 'review';
  
  const [currentStep, setCurrentStep] = useState(0);
  const [activeTab, setActiveTab] = useState<ActiveTab>('general');
  const [showSaveDraftModal, setShowSaveDraftModal] = useState(false);
  // draftStatus: idle | saving | saved
  const [draftStatus, setDraftStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    productName: '',
    version: '',
    skuCode: '',
    description: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [existingProductNames, setExistingProductNames] = useState<string[]>([]);
  const [existingSkuCodes, setExistingSkuCodes] = useState<string[]>([]);
  const [productIcon, setProductIcon] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [configuration, setConfiguration] = useState<Record<string, string>>({});
  const configRef = React.useRef<import('./ConfigurationTab').ConfigurationTabHandle>(null);
  const [createdProductId,setCreatedProductId]=useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Fetch existing product names once on mount
  useEffect(() => {
    (async () => {
      try {
        const allProducts = await (await import('../api')).getProducts();
        setExistingProductNames(allProducts.map((p: any) => (p.productName || '').toLowerCase()));
        setExistingSkuCodes(allProducts.map((p: any) => (p.internalSkuCode || '').toLowerCase()));
      } catch (err) {
        console.error('Failed to fetch existing products for name validation', err);
      }
    })();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const file = e.target.files?.[0];
      if (!file) return;
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setSubmitError('Please upload an image file (JPEG, PNG, etc.)');
        return;
      }
      
      // Validate file size (e.g., 5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setSubmitError('Image size should be less than 5MB');
        return;
      }
      
      setProductIcon(file);
      setPreviewUrl(URL.createObjectURL(file));
      setSubmitError(null);
    } catch (error) {
      console.error('Error handling image upload:', error);
      setSubmitError('Failed to process the selected image');
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeImage = () => {
    setProductIcon(null);
    setPreviewUrl(null);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.productName.trim()) {
      newErrors.productName = 'Product name is required';
    } else if (existingProductNames.includes(formData.productName.trim().toLowerCase())) {
      newErrors.productName = 'Product name is already taken';
    }
    if (!formData.skuCode.trim()) {
      newErrors.skuCode = 'SKU code is required';
    } else if (existingSkuCodes.includes(formData.skuCode.trim().toLowerCase())) {
      newErrors.skuCode = 'SKU code is already taken';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCancel = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    setShowDeleteConfirm(false);
    onClose(); // close overlay immediately
    navigate('/get-started/products');
  };

  const handleSaveDraft = () => {
    if (draftStatus === 'saving') return;
    setDraftStatus('saving');

    // Simulate or hook up actual API call here
    console.log('Saving as draft...', formData);

    // After operation completes (simulate immediate success)
    setTimeout(() => {
      setDraftStatus('saved');
      // Reset back to idle after 4 seconds to allow re-saving if needed
      setTimeout(() => setDraftStatus('idle'), 4000);
    }, 4000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Only finalize on Review step
    if (currentStep !== steps.length - 1) return;

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      const baseUrl = 'http://54.238.204.246:8080/api/products';
      const productId = parseInt(createdProductId || formData.skuCode || '0');
      const endpoint = `${baseUrl}/${productId}/finalize`;

      console.log('Finalizing product – POST', endpoint);
      console.log('Product ID being sent:', productId, typeof productId);
      console.log('Auth headers:', getAuthHeaders());

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        }
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        console.error('API Error Response:', errData);
        console.error('Response Status:', res.status);
        console.error('Response Headers:', Object.fromEntries(res.headers.entries()));
        throw new Error(errData.message || `Finalize failed (${res.status})`);
      }

      console.log('Product finalized successfully');
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Finalize failed';
      console.error(msg);
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfigChange = (config: Record<string, string>) => {
    setConfiguration(prev => ({
      ...prev,
      ...config
    }));
  };

  const handleProductTypeChange = (type: string) => {
    setConfiguration(prev => ({
      ...prev,
      productType: type
    }));
  };

  const handleNextStep = async () => {
    // Prevent multiple submissions
    if (isSubmitting) return;

    if (currentStep === 0) {
      // For general details tab, validate and submit
      if (!validateForm()) return;
      
      try {
        setIsSubmitting(true);
        setSubmitError(null); // Clear previous errors
        
        const payload = {
          productName: formData.productName.trim(),
          version: formData.version.trim(),
          internalSkuCode: formData.skuCode.trim(),
          productDescription: formData.description.trim(),
          productIcon: productIcon || undefined // Include the product icon if available
        };
        
        console.log('Submitting product with payload:', payload);
        const result = await createProduct(payload);
        console.log('Product created successfully:', result);
        setCreatedProductId(result?.productId?.toString() || formData.skuCode);
        // Only proceed to next step if submission is successful
        setCurrentStep(1);
        setActiveTab('configuration');
      } catch (error) {
        console.error('Error creating product:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to create product';
        setSubmitError(errorMessage);
        // Keep the form on the current step to show the error
        return;
      } finally {
        setIsSubmitting(false);
      }
    } else if(activeTab==='configuration'){
      const ok = await configRef.current?.submit();
      if(ok){
        setCurrentStep(prev=>prev+1);
        setActiveTab('review');
      }
    } else {
      if (currentStep < steps.length - 1) {
        setCurrentStep(prev => prev + 1);
        const nextTab = steps[currentStep + 1].title.toLowerCase() as ActiveTab;
        setActiveTab(nextTab);
      }
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      const prevTab = steps[currentStep - 1].title.split(' ')[0].toLowerCase() as ActiveTab;
      setActiveTab(prevTab);
    }
  };

  return (
    <div className="product-create-overlay">
      {/* Header - Outside wrapper */}
      <div className="product-header">
        <div className="header-title-container">
          <h2>Create New Product</h2>
        </div>
        <div className="product-header-buttons">
          <button type="button" className="product-cancel-btn" onClick={handleCancel}>
            Cancel
          </button>
          <button
            type="button"
            className="product-save-draft-btn"
            onClick={handleSaveDraft}
            disabled={draftStatus === 'saving'}>
            {draftStatus === 'saving' ? 'Saving...' : draftStatus === 'saved' ? 'Saved' : 'Save as Draft'}
          </button>
        </div>
      </div>

      <div className="product-create-wrapper">
      <button 
        className="close-button" 
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
      >
        
      </button>

      <div className="product-main-content">
        {/* Sidebar */}
        <aside className="product-sidebar">
          {steps.map((step, index) => {
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            return (
              <div
                key={step.id}
                className={`product-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                onClick={() => {
                  setCurrentStep(index);
                  const tabName = step.title.split(' ')[0].toLowerCase() as ActiveTab;
                  setActiveTab(tabName);
                }}
              >
                <div className="product-step-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="2" />
                    <circle cx="12" cy="12" r="6" fill="currentColor" />
                  </svg>
                </div>
                <div className="product-step-text">
                  <span className="product-step-title">{step.title}</span>
                  <span className="product-step-desc">{step.desc}</span>
                </div>
              </div>
            );
          })}
        </aside>

        {/* Main Content */}
        <div className="product-content">
          <form className="product-form-container" onSubmit={handleSubmit}>
            <div className="product-form-section">
              {activeTab === 'general' && (
                <div>
                  <h3>GENERAL DETAILS</h3>
                  {submitError && (
                    <div className="error-message" style={{ 
                      background: '#FEF2F2', 
                      color: '#B91C1C', 
                      padding: '12px 16px', 
                      borderRadius: '4px', 
                      marginBottom: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 6.66699V10.0003M10 13.3337H10.0083M18.3333 10.0003C18.3333 14.6027 14.6024 18.3337 10 18.3337C5.39763 18.3337 1.66667 14.6027 1.66667 10.0003C1.66667 5.39795 5.39763 1.66699 10 1.66699C14.6024 1.66699 18.3333 5.39795 18.3333 10.0003Z" stroke="#B91C1C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {submitError}
                    </div>
                  )}
                  <div className="form-row">
                    <div className="forms-group">
                      <label>Product Name</label>
                      <InputField
                        value={formData.productName}
                        onChange={(val: string) => handleInputChange('productName', val)}
                        placeholder="eg. Google Maps API"
                        error={errors.productName}
                      />
                    </div>
                    <div className="forms-group">
                      <label>Version</label>
                      <InputField
                        value={formData.version}
                        onChange={(val: string) => handleInputChange('version', val)}
                        placeholder="eg., 2.3-VOS"
                      />
                    </div>
                  </div>
                  {/* <div className="form-row">
                    <div className="forms-group">
                      <label>Product Icon</label>
                      <div className="product-icon-upload">
                        <div className="upload-placeholder" onClick={triggerFileInput}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 56 56" fill="none">
                            <rect x="0.525" y="0.525" width="54.95" height="54.95" rx="7.475" fill="#EFF0F0"/>
                            <rect x="0.525" y="0.525" width="54.95" height="54.95" rx="7.475" stroke="#CCCBCD" strokeWidth="1.05"/>
                            <path d="M28 25.2001C31.866 25.2001 35 22.3795 35 18.9001C35 15.4207 31.866 12.6001 28 12.6001C24.134 12.6001 21 15.4207 21 18.9001C21 22.3795 24.134 25.2001 28 25.2001Z" stroke="#706C72" strokeWidth="2.1"/>
                            <path d="M27.9998 43.4C34.1854 43.4 39.1998 40.5794 39.1998 37.1C39.1998 33.6207 34.1854 30.8 27.9998 30.8C21.8142 30.8 16.7998 33.6207 16.7998 37.1C16.7998 40.5794 21.8142 43.4 27.9998 43.4Z" stroke="#706C72" strokeWidth="2.1"/>
                          </svg>
                          <input
                            type="file"
                            ref={fileInputRef}
                            accept="image/jpeg, image/png, image/gif, image/webp"
                            onChange={handleImageUpload}
                            onClick={(e) => e.stopPropagation()}
                            style={{ display: 'none' }}
                          />
                        </div>
                      </div>
                    </div>
                  </div> */}

                    <div className="forms-group">
                      <label>SKU Code</label>
                      <InputField
                        value={formData.skuCode}
                        onChange={(val: string) => handleInputChange('skuCode', val)}
                        placeholder="eg. API-WTHR-STD-001"
                        error={errors.skuCode}
                      />
                    </div>
                  <div className="form-row">
                    <div className="forms-group full-width">
                      <label>Description</label>
                      <TextareaField
                        value={formData.description}
                        onChange={(val: string) => handleInputChange('description', val)}
                        placeholder="eg. Mapping service API for location-based apps"
                      />
                    </div>
                  </div>
                </div>
              )}
              {activeTab === 'configuration' && (
                <div className="configuration-tab-container">
                  <h3>CONFIGURATION</h3>
                  <ConfigurationTab
                    onConfigChange={handleConfigChange}
                    onProductTypeChange={handleProductTypeChange}
                    ref={configRef}
                    productId={createdProductId || formData.skuCode}
                    onSubmit={async () => {
                      // Handle configuration submission if needed
                      return true;
                    }}
                  />
                </div>
              )}
              {activeTab === 'review' && (
                <ProductReview 
                  generalDetails={formData}
                  configuration={configuration}
                />
              )}
            </div>
            {/* Form Footer inside container */}
        <div className="product-form-footer">
          {activeTab === 'general' && (
            <button
              type="button"
              className="product-save-next-btn"
              onClick={handleNextStep}
            >
              Save &Next
            </button>
          )}
          {activeTab === 'configuration' && (
            <div className="button-group">
              <button type="button" className="product-cancel-btn" onClick={handlePreviousStep}>Back</button>
              <button type="button" className="product-save-next-btn" onClick={handleNextStep}>Next</button>
            </div>
          )}
          {activeTab === 'review' && (
            <div className="button-group">
              <button type="button" className="product-cancel-btn" onClick={handlePreviousStep}>Back</button>
              <button type="submit" className="product-save-next-btn">Submit</button>
            </div>
          )}
        </div>
      </form>
        </div>
      </div>
      
      <SaveAsDraftModal
        isOpen={showSaveDraftModal}
        onSave={() => {
          // Handle save draft logic here
          setShowSaveDraftModal(false);
          onClose();
        }}
        onDelete={() => {
          // Handle discard changes logic here
          setShowSaveDraftModal(false);
          onClose();
        }}
      />
      
      <DeleteConfirmModal
        isOpen={showDeleteConfirm}
        productName={formData.productName || 'this product'}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setShowDeleteConfirm(false);
          onClose();
        }}
      />
    </div>{/* product-create-wrapper */}
  </div>
  );
};

export default NewProduct;


