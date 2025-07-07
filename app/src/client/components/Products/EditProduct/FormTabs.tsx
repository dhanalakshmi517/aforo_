import React, { useState, useEffect } from 'react';
import {
  FormData,
  ProductType,
  ConfigurationData,
  GeneralFormData,
  MetadataForm
} from './types';
import { getInitialConfig } from './utils';
import { updateProduct } from './api';
import GeneralForm from './GeneralForm';
import MetaDataForm from './MetaDataForm';
import ConfigurationForm from './ConfigurationForm';
import FormActions from './FormActions';
import './EditProductForm.css';

interface FormTabsProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
  productType: ProductType;
  loading: boolean;
  error: string;
  activeTab: 'general' | 'metadata' | 'configuration';
  onTabChange: (tab: 'general' | 'metadata' | 'configuration') => void;
  onNextClick: () => void;
  onSubmit: () => Promise<void>;
  onClose: () => void;
  productId: string;
  setLoading: (loading: boolean) => void;
  setError: (error: string) => void;
}

const FormTabs: React.FC<FormTabsProps> = ({
  formData,
  setFormData,
  productType,
  loading,
  error,
  activeTab,
  onTabChange,
  onNextClick,
  onSubmit,
  onClose,
  productId,
  setLoading,
  setError
}) => {
  const [currentFormData, setCurrentFormData] = useState<FormData>(formData);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isNameEdited, setIsNameEdited] = useState(false);

  useEffect(() => {
    setCurrentFormData(formData);
  }, [formData]);

  const handleDataChange = (updatedData: FormData) => {
    setCurrentFormData(updatedData);
    setFormData(updatedData);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="tab-content">
            <GeneralForm
              data={{
                productName: currentFormData.productName || '',
                productType: currentFormData.productType || ProductType.API,
                description: currentFormData.description || '',
                status: currentFormData.status || 'DRAFT',
                category: currentFormData.category || 'INTERNAL',
                version: currentFormData.version || '1.0',
                visibility: currentFormData.visibility ?? true,
                tags: currentFormData.tags || {}
              }}
              onChange={(newData: GeneralFormData) => {
                handleDataChange({
                  ...currentFormData,
                  productName: newData.productName,
                  productType: newData.productType,
                  description: newData.description,
                  status: newData.status,
                  category: newData.category,
                  version: newData.version,
                  visibility: newData.visibility,
                  tags: newData.tags
                });
              }}
              loading={loading}
              productId={productId}
            />
          </div>
        );
      case 'metadata':
        return (
          <MetaDataForm
            data={{
              internalSkuCode: currentFormData.internalSkuCode,
              uom: currentFormData.uom,
              effectiveStartDate: currentFormData.effectiveStartDate,
              effectiveEndDate: currentFormData.effectiveEndDate,
              billable: currentFormData.billable,
              linkedRatePlans: currentFormData.linkedRatePlans,
              auditLogId: currentFormData.auditLogId,
              labels: currentFormData.labels
            }}
            onChange={(newData: MetadataForm) => {
              handleDataChange({
                ...currentFormData,
                internalSkuCode: newData.internalSkuCode,
                uom: newData.uom,
                effectiveStartDate: newData.effectiveStartDate,
                effectiveEndDate: newData.effectiveEndDate,
                billable: newData.billable,
                linkedRatePlans: newData.linkedRatePlans,
                auditLogId: Number(newData.auditLogId),
                labels: newData.labels
              });
            }}
            loading={loading}
          />
        );
      case 'configuration':
        return (
          <ConfigurationForm
            data={currentFormData.configuration || getInitialConfig(productType)}
            productType={productType}
            onChange={(newConfig: Partial<ConfigurationData>) => {
              const updatedConfig = {
                ...currentFormData.configuration,
                ...newConfig
              };

              handleDataChange({
                ...currentFormData,
                configuration: updatedConfig
              });

              updateProduct(productId, {
                ...currentFormData,
                configuration: updatedConfig
              }).catch(err => {
                console.error('Failed to save configuration:', err);
              });
            }}
            loading={loading}
          />
        );
      default:
        return null;
    }
  };

  const handleNext = async () => {
    if (activeTab === 'configuration') {
      try {
        await onSubmit();
        onClose();
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to update product');
      }
    } else if (activeTab === 'general') {
      // Check if there are any validation errors in GeneralForm
      const generalForm = document.querySelector('.general-form');
      const errorMessages = generalForm?.querySelectorAll('.error-message');
      
      // Only show error if name has been edited
      if (errorMessages && errorMessages.length > 0) {
        setError('');
        return;
      }
      
      // Clear error messages before moving to next tab
      setError('');
      onNextClick();
    } else {
      onNextClick();
    }
  };

  return (
    <>
      {showCancelModal && (
        <div className="delete-modal-overlay">
          <div className="delete-modal-content">
            <div className="delete-modal-body">
              <h5>
                Are you sure you want to cancel?                 <br />
                <strong>"{formData.productName || 'New Product'}"</strong>
              </h5>
              <p>All unsaved changes will be lost.</p>
            </div>
            <div className="delete-modal-footer">
              <button
                className="delete-modal-cancel"
                onClick={() => setShowCancelModal(false)}
              >
                Stay
              </button>
              <button
                className="delete-modal-confirm"
                onClick={() => {
                  setShowCancelModal(false);
                  onClose();
                }}
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="form-heading">
        <div className="heading-content">
          <h2>Edit "{formData.productName || 'New Product'}"</h2>
        </div>
        <div className="heading-buttons">
          <button
            type="button"
            onClick={() => setShowCancelModal(true)}
            className="heading-cancel-button"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              // Handle save as draft
            }}
            className="heading-save-button"
          >
            Save as Draft
          </button>
        </div>
      </div>
      <div className="form-tabs">
        <div className="tab-buttons">
        <button
  className={`tab-button ${activeTab === 'general' ? 'active' : ''}`}
  disabled
>
  General details
</button>
<button
  className={`tab-button ${activeTab === 'metadata' ? 'active' : ''}`}
  disabled
>
  Product Metadata
</button>
<button
  className={`tab-button ${activeTab === 'configuration' ? 'active' : ''}`}
  disabled
>
  Configuration
</button>

         
        </div>
        <div className="tab-content">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          {renderTabContent()}
          <FormActions
            onClose={() => {
              if (activeTab === 'general') {
                onClose();
              } else {
                onTabChange('general');
              }
            }}
            onSubmit={onSubmit}
            onNext={handleNext}
            onBack={() => {
              if (activeTab === 'metadata') {
                onTabChange('general');
              } else if (activeTab === 'configuration') {
                onTabChange('metadata');
              }
            }}
            activeTab={activeTab}
            loading={loading}
            isLastTab={activeTab === 'configuration'}
            onSaveSuccess={() => {}}
            onSaveError={error => setError(error)}
          />
        </div>
      </div>
    </>
  );
};

export default FormTabs;
