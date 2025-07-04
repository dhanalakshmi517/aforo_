import React, { useState, useEffect } from 'react';
import { FormData, ProductType, ConfigurationData, GeneralFormData, MetadataForm } from './types';
import { getInitialConfig } from './utils';
import { updateProduct } from './api';
import GeneralForm from './GeneralForm';
import MetaDataForm from './MetaDataForm';
import ConfigurationForm from './ConfigurationForm';
import FormActions from './FormActions';
import './EditProductForm.css';

interface FormTabsProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  productType: ProductType;
  loading: boolean;
  error: string | null;
  activeTab: 'general' | 'metadata' | 'configuration';
  onTabChange: (tab: 'general' | 'metadata' | 'configuration') => void;
  onNextClick: () => void;
  onSubmit: () => void;
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
          />
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
              // Create a new configuration object
              const updatedConfig = {
                ...currentFormData.configuration,
                ...newConfig
              };
              
              // Update form data immediately
              handleDataChange({
                ...currentFormData,
                configuration: updatedConfig
              });
              
              // Save the configuration data immediately
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

  return (
    <div className="form-tabs">
      <div className="tab-buttons">
        <button
          onClick={() => onTabChange('general')}
          className={`tab-button ${activeTab === 'general' ? 'active' : ''}`}
          disabled={loading}
        >
          General details
        </button>
        <button
          onClick={() => onTabChange('metadata')}
          className={`tab-button ${activeTab === 'metadata' ? 'active' : ''}`}
          disabled={loading}
        >
          Product Metadata
        </button>
        <button
          onClick={() => onTabChange('configuration')}
          className={`tab-button ${activeTab === 'configuration' ? 'active' : ''}`}
          disabled={loading}
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
              onClose(); // Close the form if we're on the general tab
            } else {
              onTabChange('general'); // Go back to general tab if we're not on it
            }
          }}
          onSubmit={onSubmit}
          onNext={onNextClick}
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
          onSaveSuccess={() => {
            // No specific action needed here as the success message is shown by FormActions
          }}
          onSaveError={(error) => {
            setError(error);
          }}
        />
      </div>
    </div>
  );
};

export default FormTabs;
