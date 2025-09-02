import React, { useState, useEffect } from 'react';
import './ConfigurationTab.css';
import { SelectField } from '../../Components/InputFields';
import { InputField, TextareaField } from '../../Components/InputFields';

interface ConfigurationFields {
  [key: string]: {
    label: string;
    type: string;
    placeholder: string;
    required?: boolean;
  }[];
}

const configurationFields: ConfigurationFields = {
  api: [
    { label: 'Endpoint URL', type: 'text', placeholder: 'https://api.example.com', required: true },
    { label: 'Authentication Type', type: 'select', placeholder: 'Select authentication type', required: true },
  ],
  storage: [
    { label: 'Storage Location', type: 'text', placeholder: 'S3://bucket, gs://path, etc.' },
    { label: 'Authentication Type', type: 'select', placeholder: 'Select authentication type', required: true },

  ],
  llmtoken: [
    { label: 'Model Name', type: 'text', placeholder: 'gpt-4', required: true },
    { label: 'Endpoint URL', type: 'text', placeholder: 'https://api.example.com', required: true },
    { label: 'Authentication Type', type: 'select', placeholder: 'Select authentication type', required: true },
  ],
  sqlresult: [
    { label: 'Database Type', type: 'select', placeholder: 'Select database type', required: true },
    { label: 'Connection String', type: 'text', placeholder: 'eg. https://api.example.com/v1/{endpoint}' },
    { label: 'Authentication Type', type: 'select', placeholder: 'Select authentication type', required: true },
],
  flatfile: [
    { label: 'File Location', type: 'text', placeholder: 'S3://bucket, gs://path, etc.' },
    { label: 'File Format', type: 'select', placeholder: 'file format', required: true },
   
  ],
};

export interface ConfigurationTabProps {
  onConfigChange: (config: Record<string, string>) => void;
  onProductTypeChange: (type: string) => void;
  productId?: string;
  onSubmit: () => Promise<boolean>;
}

const ConfigurationTab: React.FC<ConfigurationTabProps> = ({ 
  onConfigChange, 
  onProductTypeChange, 
  productId,
  onSubmit
}) => {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [productType, setProductType] = useState('api');
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [error, setError] = useState('');
  
  // Memoize the config change handler to prevent unnecessary re-renders
  const handleConfigChange = React.useCallback((updates: Record<string, string>) => {
    const newFormData = { ...formData, ...updates };
    setFormData(newFormData);
    onConfigChange(newFormData);
  }, [formData, onConfigChange]);
  
  // Memoize the product type change handler
  const handleProductTypeChange = React.useCallback((type: string) => {
    setProductType(type);
    onProductTypeChange(type);
    // Reset form data when product type changes
    setFormData({});
  }, [onProductTypeChange]);

  const handleSaveDraft = async () => {
    if (!productId) {
      setError('Product ID is missing');
      return false;
    }

    setIsSavingDraft(true);
    setError('');

    try {
      const baseUrl = 'http://54.238.204.246:8080/api/products';
      let endpoint = '';
      let body = {};

      // Determine the endpoint and body based on product type
      switch (productType) {
        case 'api':
          endpoint = `${baseUrl}/${productId}/api`;
          body = {
            endpointUrl: formData.endpointUrl || '',
            authType: formData.authType || 'NONE',
            status: 'draft'
          };
          break;
        case 'storage':
          endpoint = `${baseUrl}/${productId}/storage`;
          body = {
            storageLocation: formData.storageLocation || '',
            authType: formData.authType || 'NONE',
            status: 'draft'
          };
          break;
        case 'sqlresult':
          endpoint = `${baseUrl}/${productId}/sql-result`;
          body = {
            databaseType: formData.databaseType || '',
            connectionString: formData.connectionString || '',
            authType: formData.authType || 'NONE',
            status: 'draft'
          };
          break;
        case 'llmtoken':
          endpoint = `${baseUrl}/${productId}/llm-token`;
          body = {
            modelName: formData.modelName || '',
            endpointUrl: formData.endpointUrl || '',
            authType: formData.authType || 'NONE',
            status: 'draft'
          };
          break;
        case 'flatfile':
          endpoint = `${baseUrl}/${productId}/flatfile`;
          body = {
            fileLocation: formData.fileLocation || '',
            fileFormat: formData.fileFormat || '',
            status: 'draft'
          };
          break;
        default:
          return false;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to save draft');
      }

      alert('Configuration draft saved successfully!');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save draft';
      setError(errorMessage);
      console.error('Error saving draft:', errorMessage);
      return false;
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) {
      setError('Product ID is missing');
      return false;
    }

    setIsSaving(true);
    setError('');

    try {
      let endpoint = '';
      let body = {};
      const baseUrl = 'http://54.238.204.246:8080/api/products';

      switch (productType) {
        case 'api':
          endpoint = `${baseUrl}/${productId}/api`;
          body = {
            endpointUrl: formData.endpointUrl || '',
            authType: formData.authType || 'NONE'
          };
          break;
          
        case 'storage':
          endpoint = `${baseUrl}/${productId}/storage`;
          body = {
            storageLocation: formData.storageLocation || '',
            authType: formData.authType || 'NONE'
          };
          break;
          
        case 'sqlresult':
          endpoint = `${baseUrl}/${productId}/sql-result`;
          body = {
            databaseType: formData.databaseType || '',
            connectionString: formData.connectionString || '',
            authType: formData.authType || 'NONE'
          };
          break;
          
        case 'llmtoken':
          endpoint = `${baseUrl}/${productId}/llm-token`;
          body = {
            modelName: formData.modelName || '',
            endpointUrl: formData.endpointUrl || '',
            authType: formData.authType || 'NONE'
          };
          break;
          
        case 'flatfile':
          endpoint = `${baseUrl}/${productId}/flatfile`;
          body = {
            fileLocation: formData.fileLocation || '',
            fileFormat: formData.fileFormat || ''
          };
          break;
          
        default:
          onConfigChange(formData);
          return;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to save configuration');
      }

      const result = await response.json();
      onConfigChange({ ...formData, ...result });
      
      // Call the parent's onSubmit handler
      if (onSubmit) {
        return await onSubmit();
      }
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save configuration';
      console.error('Error saving configuration:', errorMessage);
      setError(errorMessage);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    onConfigChange(formData);
  }, [formData, onConfigChange]);
  
  useEffect(() => {
    onProductTypeChange(productType);
  }, [productType, onProductTypeChange]);
  
  const productOptions = [
    { label: 'API', value: 'api' },
    { label: 'Storage', value: 'storage' },
    { label: 'LLM Token', value: 'llmtoken' },
    { label: 'SQL Result', value: 'sqlresult' },
    { label: 'Flat File', value: 'flatfile' },
  ];

  const handleInputChange = React.useCallback((field: string) => (value: string) => {
    const newFormData = {
      ...formData,
      [field]: value
    };
    setFormData(newFormData);
    onConfigChange(newFormData);
  }, [formData, onConfigChange]);

  const getSelectOptions = (fieldLabel: string) => {
    switch (fieldLabel) {
      case 'Authentication Type':
        return [
          { label: 'API_Key', value: 'API_KEY' },
          { label: 'OAuth2', value: 'OAUTH2' },
          { label: 'None', value: 'NONE' },
          { label: 'Basic_Auth', value: 'BASIC_AUTH' }
        ];
      case 'Database Type':
        return [
          { label: 'PostgreSQL', value: 'POSTGRES' },
          { label: 'MySQL', value: 'MYSQL' },
          { label: 'SQL Server', value: 'SQLSERVER' },
          { label: 'Oracle', value: 'ORACLE' },
          { label: 'Snowflake', value: 'SNOWFLAKE' },
          { label: 'BigQuery', value: 'BIGQUERY' },
          { label: 'Others', value: 'OTHERS' }

        ];
      case 'File Format':
        return [
          { label: 'CSV', value: 'CSV' },
          { label: 'JSON', value: 'JSON' },
          { label: 'Parquet', value: 'PARQUET' },
          { label: 'XML', value: 'XML' },
          { label: 'Others', value: 'OTHERS' }
        ];
      default:
        return [];
    }
  };

  const renderField = (field: { 
    label: string; 
    type: string; 
    placeholder: string; 
    required?: boolean;
    min?: string | number;
    max?: string | number;
    step?: string | number;
  }) => {
    const commonProps = {
      key: field.label,
      label: field.label,
      value: formData[field.label] || '',
      onChange: handleInputChange(field.label),
      placeholder: field.placeholder,
      required: field.required,
      min: field.min,
      max: field.max,
      step: field.step
    };

    switch (field.type) {
      case 'select':
        return (
          <SelectField
            {...commonProps}
            options={[
              { label: field.placeholder, value: '' },
              ...getSelectOptions(field.label)
            ]}
          />
        );
      case 'checkbox':
        return (
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={formData[field.label] === 'true'}
                onChange={(e) => handleInputChange(field.label)(e.target.checked.toString())}
              />
              {field.label}
            </label>
          </div>
        );
      default:
        return <InputField {...commonProps} type={field.type} />;
    }
  };

  return (
    <div className="configuration-tab">
      <div className="form-group">
        <label>Product Type</label>
        <select
          value={productType}
          onChange={(e) => handleProductTypeChange(e.target.value)}
          className="form-control"
        >
          <option value="">Select Product Type</option>
          {productOptions.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>
      
      {productType && (
        <div className="configuration-fields">
          <h4>Configuration for {productType.charAt(0).toUpperCase() + productType.slice(1)}</h4>
          {error && <div className="error-message">{error}</div>}
          <div className="form-fields">
        {configurationFields[productType]?.map(field => renderField(field))}
      </div>
        </div>
      )}
    </div>
  );
};

export { ConfigurationTab };
