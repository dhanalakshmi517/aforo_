import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './StepIndicator.module.css';
import { ConfigurationTab } from './ConfigurationTab';
import { ReviewTab } from './ReviewTab';
import './CreateProduct.css';
import { InputField, TextareaField } from '../../Components/InputFields';
import { createProduct, saveAsDraft, updateDraft, checkProductNameExists } from './api';

interface CreateProductProps {
  onClose: () => void;
}

interface FormData {
  productName: string;
  version: string;
  internalSkuCode: string;  
  productDescription: string;
}

interface FormErrors {
  productName?: string;
  version?: string;
  internalSkuCode?: string;
  productDescription?: string;
}

interface ConfigData {
  [key: string]: string;
}

type PricingHandle = {
  save: () => Promise<boolean>;
};

const steps = [
  { title: 'General Details', desc: 'Start with the basics of your product.' },
  { title: 'Configuration', desc: 'Define configuration and parameters.' },
  { title: 'Review & Confirm', desc: 'Validate all details before finalizing.' },
];

const CreateProduct: React.FC<CreateProductProps> = ({ onClose }) => {
  const pricingRef = React.useRef<PricingHandle>(null);
  const [formData, setFormData] = useState<FormData>({
    productName: '',
    version: '',
    internalSkuCode: '',
    productDescription: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isCheckingName, setIsCheckingName] = useState(false);

  const [configData, setConfigData] = useState<ConfigData>({});
  const [productType, setProductType] = useState('api');
  const [selectedMetricId, setSelectedMetricId] = useState<number | null>(null);

  const [currentStep, setCurrentStep] = useState(0);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [isFinishing, setIsFinishing] = useState(false);
  const [productId, setProductId] = useState<string | null>(null);

  const validateForm = async (): Promise<boolean> => {
    const newErrors: FormErrors = {};
    let isValid = true;
    
    // Check product name
    if (!formData.productName.trim()) {
      newErrors.productName = 'Product name is required';
      isValid = false;
    } else {
      setIsCheckingName(true);
      try {
        const { exists, message } = await checkProductNameExists(formData.productName, productId || undefined);
        if (exists) {
          newErrors.productName = message;
          isValid = false;
        }
      } catch (error) {
        console.error('Error validating product name:', error);
        // Don't block form submission on validation error
      } finally {
        setIsCheckingName(false);
      }
    }
    
    // Check other required fields
    if (!formData.productDescription.trim()) {
      newErrors.productDescription = 'Description is required';
      isValid = false;
    }
    
    // Additional validation for step 1
    if (currentStep === 0) {
      if (!formData.version.trim()) {
        newErrors.version = 'Version is required';
        isValid = false;
      }
      if (!formData.internalSkuCode.trim()) {
        newErrors.internalSkuCode = 'SKU code is required';
        isValid = false;
      }
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const handleNext = async () => {
    try {
      // First validate the form
      if (!(await validateForm())) {
        return false;
      }
      
      // Prepare data for saving
      const draftData: any = {
        productName: formData.productName.trim(),
        version: formData.version.trim(),
        internalSkuCode: formData.internalSkuCode.trim(),
        productDescription: formData.productDescription.trim()
      };
      
      setSaveState('saving');
      
      // Case 1: If user never saved as draft, create new product
      if (!productId) {
        console.log('Creating new product in handleNext (Case 1)');
        const savedProduct = await createProduct(draftData);
        if (savedProduct?.id) {
          setProductId(savedProduct.id); // Save the ID for future updates
        }
      } 
      // Case 2: If user previously saved as draft, update existing product
      else {
        console.log('Updating existing product in handleNext (Case 2)');
        await updateDraft(productId, draftData);
      }
      
      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 2000);
      
      // Move to next step
      if (currentStep < steps.length - 1) {
        setCurrentStep(prev => prev + 1);
      }
      
      return true;
    } catch (error: any) {
      console.error('Error in handleNext:', error);
      setSaveState('idle');
      const errorMessage = error?.response?.data?.message || error.message || 'Failed to proceed';
      alert(`Error: ${errorMessage}`);
      return false;
    }
  };

  const handleSaveDraft = async (e?: React.MouseEvent) => {
    // Skip if already checking name
    if (isCheckingName) {
      return false;
    }

    // Basic validation for required fields
    if (!formData.productName.trim()) {
      setErrors(prev => ({ ...prev, productName: 'Product name is required' }));
      return false;
    }
    
    // Only include fields that have values to avoid sending empty strings
    const draftData: any = {
      productName: formData.productName.trim()
    };
    
    // Only include these fields if they have values
    if (formData.version.trim()) draftData.version = formData.version.trim();
    if (formData.internalSkuCode.trim()) draftData.internalSkuCode = formData.internalSkuCode.trim();
    if (formData.productDescription.trim()) draftData.productDescription = formData.productDescription.trim();
    
    try {
      setSaveState('saving');
      
      console.log('Saving draft with data:', draftData);
      
      const { data, isNew } = await saveAsDraft(draftData, productId || undefined);
      
      // If this was a new product, save the ID for future updates
      if (isNew && data.id) {
        setProductId(data.id);
      }
      
      setSaveState('saved');
      
      // Reset saved state after 2 seconds
      setTimeout(() => setSaveState('idle'), 2000);
      
      console.log('Draft saved successfully', { productId: data.id });
      return true;
    } catch (error: any) {
      console.error('Error saving draft:', error);
      setSaveState('idle');
      // Show error message to user
      const errorMessage = error?.response?.data?.message || error.message || 'Failed to save draft';
      alert(`Error: ${errorMessage}`);
      return false;
    }
  };

  const handleFinish = async () => {
    try {
      setIsFinishing(true);
      // Call the API to create/update the product with final data
      await createProduct({
        ...formData,
        status: 'ACTIVE',
        ...configData, // Include all configuration data
        productType
      });
      
      // Close the form or redirect to products list
      onClose();
    } catch (error) {
      console.error('Error finishing product:', error);
    } finally {
      setIsFinishing(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep((prev) => prev - 1);
  };

  return (
    <div className="create-product">
      {/* Header */}
      <div className="prod-sub-header">
        <h2>Create New Product</h2>
        <div className="metric-actions">
          <button className="btn cancel" onClick={() => setShowCancelModal(true)}>Cancel</button>
          <button 
            className={`btn save-draft ${saveState}`}
            onClick={handleSaveDraft}
            disabled={saveState !== 'idle'}
          >
            {saveState === 'saving' ? (
              <>
                <span className="spinner"></span>
                Saving...
              </>
            ) : saveState === 'saved' ? (
              <span className="saved-text">✓ Saved</span>
            ) : (
              'Save as Draft'
            )}
          </button>
          <hr />
        </div>
      </div>

      {/* Layout */}
      <div className="sub-create-price-plan">
        <div className="sub-usage-metric-wrapper">
          {/* Sidebar stepper */}
          <aside className="prod-sidebars">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`prod-step-item ${index === currentStep ? 'active' : ''}`}
                onClick={() => setCurrentStep(index)}
              >
                <div className="sub-icon-wrappers">
                  {index < currentStep ? (
                    // Completed Step
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="11.5" fill="var(--color-primary-800)" stroke="var(--color-primary-800)" />
                      <path d="M7 12l3 3 6-6" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    // Pending Step
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="11.5" stroke="#D6D5D7" />
                      <circle cx="12" cy="12" r="6" fill="#D6D5D7" />
                    </svg>
                  )}
                  {index < steps.length - 1 && (
                    // Vertical Connector Line
                    <svg xmlns="http://www.w3.org/2000/svg" width="2" height="111" viewBox="0 0 2 111" fill="none">
                      <path
                        d="M1 110L1 1"
                        stroke={index < currentStep ? 'var(--color-primary-800)' : '#BDBBBE'}
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  )}
                </div>
                <div className="sub-step-text">
                  <span className="sub-step-title">{step.title}</span>
                  <span className="sub-step-desc">{step.desc}</span>
                </div>
              </div>
            ))}
          </aside>

          {/* Step Content */}
          <div className="form-section">
            <div className="form-card">
              {currentStep === 0 && (
                <div>
                  <div className="form-group">
                    <InputField
                      label="Product Name"
                      value={formData.productName}
                      onChange={(val) => setFormData({ ...formData, productName: val })}
                      placeholder="eg. Google Maps API"
                      error={errors.productName}
                    />
                  </div>
                  
                  <div className="form-group">
                    <InputField
                      label="Version"
                      value={formData.version}
                      onChange={(val) => setFormData({ ...formData, version: val })}
                      placeholder="eg., 2.3-VOS"
                      error={errors.version}
                    />
                  </div>
                  
                  <div className="form-group">
                    <InputField
                      label="Internal SKU Code"
                      value={formData.internalSkuCode}
                      onChange={(val) => setFormData({ ...formData, internalSkuCode: val })}
                      placeholder="eg., 1234567890"
                      error={errors.internalSkuCode}
                    />
                  </div>
                   <div className="form-group">
                    <TextareaField
                      label="Product Description"
                      placeholder="eg. Mapping service API for location-based apps"
                      value={formData.productDescription}
                      onChange={(value: string) => setFormData({ ...formData, productDescription: value })}
                    />
                  </div>
                </div>
              )}
              {currentStep === 1 && (
                <ConfigurationTab
                  onConfigChange={setConfigData}
                  onProductTypeChange={setProductType}
                  onSubmit={async () => {
                    console.log('Form submitted:', { formData, configData, productType });
                    return true;
                  }}
                />
              )}
              {currentStep === 2 && (
                <ReviewTab
                  formData={formData}
                  configData={configData}
                  productType={productType}
                  onFinish={handleFinish}
                  isFinishing={isFinishing}
                />
              )}
            </div>

            {/* Actions */}
            <div className="button-group">
              <button 
                className={styles.buttonSecondary} 
                onClick={handleBack} 
                disabled={currentStep === 0}
              >
                Back
              </button>
              <button 
                className={styles.buttonPrimary} 
                onClick={handleNext}
                disabled={saveState === 'saving'}
              >
                {saveState === 'saving' 
                  ? 'Saving...' 
                  : currentStep === steps.length - 1 
                    ? 'Finish' 
                    : 'Next'}
              </button>
            </div>
          </div>
        </div>

        {/* Cancel Modal */}
        {showCancelModal && (
          <div className="delete-modal-overlay">
            <div className="delete-modal-content">
              <div className="delete-modal-body">
                <h5>Are you sure you want to discard<br /> this product?</h5>
                <p>Your progress will not be saved.</p>
              </div>
              <div className="delete-modal-footer">
                <button className="delete-modal-cancel" onClick={() => setShowCancelModal(false)}>Back</button>
                <button className="delete-modal-confirm" onClick={onClose}>Confirm</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateProduct;
