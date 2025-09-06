import React, { useState, useEffect } from 'react';
import { getAuthHeaders } from '../../../utils/auth';
import './ConfigurationTab.css';
import { SelectField } from '../../Components/InputFields';

import { InputField, TextareaField } from '../../Components/InputFields';
/* ------------------------------------
 * Configuration field definitions
 * ------------------------------------*/
export interface FieldProps {
  label: string;
  type: 'text' | 'number' | 'select' | 'checkbox' | 'textarea' | 'password' | 'email';
  placeholder?: string;
  required?: boolean;
  options?: Array<{ label: string; value: string }>;
  min?: number;
  max?: number;
  step?: number;
}

// ProductType enum originates from backend DTO – keep in sync here
export enum ProductTypeEnum {
  API = 'API',
  FlatFile = 'FlatFile',
  SQLResult = 'SQLResult',
  LLMToken = 'LLMToken',
}

export const productOptions = [
  { label: 'API', value: ProductTypeEnum.API },
  { label: 'Flat File', value: ProductTypeEnum.FlatFile },
  { label: 'SQL Result', value: ProductTypeEnum.SQLResult },
  { label: 'LLM Token', value: ProductTypeEnum.LLMToken },
];

export const configurationFields: Record<string, FieldProps[]> = {
  [ProductTypeEnum.API]: [
    {
      label: 'Endpoint URL',
      type: 'text',
      placeholder: 'https://api.example.com/v1/endpoint',
      required: true,
    },
    {
      label: 'Auth Type',
      type: 'select',
      required: true,
      options: [
        { label: 'None', value: 'NONE' },
        { label: 'API Key', value: 'API_KEY' },
        { label: 'OAuth2', value: 'OAUTH2' },
        { label: 'Basic Auth', value: 'BASIC_AUTH' },
      ],
    },
  ],
  [ProductTypeEnum.FlatFile]: [
    {
      label: 'File Format',
      type: 'select',
      required: true,
      options: [
        { label: 'CSV', value: 'CSV' },
        { label: 'JSON', value: 'JSON' },
        { label: 'XML', value: 'XML' },
        { label: 'Parquet', value: 'PARQUET' },
        { label: 'Others', value: 'OTHERS' },
      ],
    },
    {
      label: 'File Location',
      type: 'text',
      placeholder: '/path/to/file or s3://bucket/key',
      required: true,
    },
  ],
  [ProductTypeEnum.SQLResult]: [
    {
      label: 'Connection String',
      type: 'text',
      placeholder: 'jdbc:mysql://host:3306/db?user=usr&password=pwd',
      required: true,
    },
    {
      label: 'DB Type',
      type: 'select',
      required: true,
      options: [
        { label: 'MySQL', value: 'MYSQL' },
        { label: 'Postgres', value: 'POSTGRES' },
        { label: 'SQL Server', value: 'SQLSERVER' },
        { label: 'Oracle', value: 'ORACLE' },
        { label: 'BigQuery', value: 'BIGQUERY' },
        { label: 'Snowflake', value: 'SNOWFLAKE' },
        { label: 'Others', value: 'OTHERS' },
      ],
    },
    {
      label: 'Auth Type',
      type: 'select',
      required: true,
      options: [
        { label: 'None', value: 'NONE' },
        { label: 'API Key', value: 'API_KEY' },
        { label: 'OAuth2', value: 'OAUTH2' },
        { label: 'Basic Auth', value: 'BASIC_AUTH' },
      ],
    },
  ],
  [ProductTypeEnum.LLMToken]: [
    {
      label: 'Model Name',
      type: 'text',
      placeholder: 'gpt-4o',
      required: true,
    },
    {
      label: 'Endpoint URL',
      type: 'text',
      placeholder: 'https://api.llmprovider.com/v1/chat',
      required: true,
    },
    {
      label: 'Auth Type',
      type: 'select',
      required: true,
      options: [
        { label: 'None', value: 'NONE' },
        { label: 'API Key', value: 'API_KEY' },
        { label: 'OAuth2', value: 'OAUTH2' },
        { label: 'Basic Auth', value: 'BASIC_AUTH' },
      ],
    },
  ],
  software: [
    {
      label: 'License Type',
      type: 'select',
      required: true,
      options: [
        { label: 'Single User', value: 'single' },
        { label: 'Multi User', value: 'multi' },
        { label: 'Enterprise', value: 'enterprise' },
      ],
    },
    {
      label: 'Version',
      type: 'text',
      placeholder: 'e.g., 1.0.0',
      required: true,
    },
    {
      label: 'Platform',
      type: 'select',
      required: true,
      options: [
        { label: 'Windows', value: 'windows' },
        { label: 'macOS', value: 'macos' },
        { label: 'Linux', value: 'linux' },
        { label: 'Web', value: 'web' },
      ],
    },
    {
      label: 'System Requirements',
      type: 'textarea',
      placeholder: 'Minimum system requirements...',
    },
  ],
  hardware: [
    {
      label: 'Model Number',
      type: 'text',
      placeholder: 'e.g., HW-2024-001',
      required: true,
    },
    {
      label: 'Warranty Period (months)',
      type: 'number',
      min: 1,
      max: 120,
      required: true,
    },
    {
      label: 'Color',
      type: 'select',
      options: [
        { label: 'Black', value: 'black' },
        { label: 'White', value: 'white' },
        { label: 'Silver', value: 'silver' },
        { label: 'Custom', value: 'custom' },
      ],
    },
    {
      label: 'Dimensions',
      type: 'text',
      placeholder: 'L x W x H (cm)',
    },
    {
      label: 'Weight (kg)',
      type: 'number',
      step: 0.1,
      min: 0,
    },
  ],
  service: [
    {
      label: 'Service Type',
      type: 'select',
      required: true,
      options: [
        { label: 'Consultation', value: 'consultation' },
        { label: 'Implementation', value: 'implementation' },
        { label: 'Support', value: 'support' },
        { label: 'Training', value: 'training' },
      ],
    },
    {
      label: 'Duration (hours)',
      type: 'number',
      min: 1,
      required: true,
    },
    {
      label: 'Location',
      type: 'select',
      options: [
        { label: 'On-site', value: 'onsite' },
        { label: 'Remote', value: 'remote' },
        { label: 'Hybrid', value: 'hybrid' },
      ],
    },
    {
      label: 'Prerequisites',
      type: 'textarea',
      placeholder: 'Any requirements or prerequisites...',
    },
  ],
  digital: [
    {
      label: 'File Format',
      type: 'select',
      required: true,
      options: [
        { label: 'PDF', value: 'pdf' },
        { label: 'Video (MP4)', value: 'mp4' },
        { label: 'Audio (MP3)', value: 'mp3' },
        { label: 'Archive (ZIP)', value: 'zip' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      label: 'File Size (MB)',
      type: 'number',
      min: 0.1,
      step: 0.1,
    },
    {
      label: 'Access Type',
      type: 'select',
      required: true,
      options: [
        { label: 'Download', value: 'download' },
        { label: 'Streaming', value: 'streaming' },
        { label: 'Online Access', value: 'online' },
      ],
    },
    {
      label: 'DRM Protection',
      type: 'checkbox',
    },
    {
      label: 'Description',
      type: 'textarea',
      placeholder: 'Detailed description of the digital product...',
      required: true,
    },
  ],
};

export const getSelectOptions = (fieldLabel: string): Array<{ label: string; value: string }> | null => {
  return null;
};

export const buildApiEndpoint = (
  baseUrl: string,
  productId: string,
  productType: string
): string | null => {
  if (!productType || !productId) return null;

  // Normalise productType string for safer comparison
  const typeKey = productType.toLowerCase();

  switch (typeKey) {
    case 'api':
      // e.g. http://.../products/8/api
      return `${baseUrl}/${productId}/api`;
    case 'flatfile':
      // e.g. http://.../products/8/flatfile
      return `${baseUrl}/${productId}/flatfile`;
    case 'sqlresult':
    case 'sql_result':
      // http://.../products/6/sql-result
      return `${baseUrl}/${productId}/sql-result`;
    case 'llmtoken':
    case 'llm_token':
      // http://.../products/9/llm-token
      return `${baseUrl}/${productId}/llm-token`;
    default:
      // Fallback to previous pattern
      return `${baseUrl}/${productId}/configuration/${productType}`;
  }
};

export const buildRequestBody = (
  productType: string,
  formData: Record<string, string>,
  isDraft: boolean = false,
): Record<string, any> => {
  // Map UI field labels to backend payload keys
  const normalizedConfig: Record<string, string> = {};

  const lowerType = productType.toLowerCase();

  if (lowerType === 'llmtoken' || lowerType === 'llm_token') {
    if (formData['Model Name']) normalizedConfig['modelName'] = formData['Model Name'];
    if (formData['Endpoint URL']) normalizedConfig['endpointUrl'] = formData['Endpoint URL'];
    if (formData['Auth Type']) normalizedConfig['authType'] = formData['Auth Type'];
  } else if (lowerType === 'api') {
    if (formData['Endpoint URL']) normalizedConfig['endpointUrl'] = formData['Endpoint URL'];
    if (formData['Auth Type']) normalizedConfig['authType'] = formData['Auth Type'];
  } else if (lowerType === 'flatfile') {
    // Backend expects `format` and `fileLocation`
    if (formData['File Format']) {
      normalizedConfig['format'] = formData['File Format'];
    }
    if (formData['File Location']) {
      normalizedConfig['fileLocation'] = formData['File Location'];
    }
  } else {
    // Fallback – camel-case the label text, e.g. "Endpoint URL" -> "endpointUrl"
    Object.entries(formData).forEach(([label, value]) => {
      if (!value) return; // skip empty values
      const key = label
        .split(/\s+/)
        .map((w, idx) => (idx === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1)))
        .join('');
      normalizedConfig[key] = value;
    });
  }

  // For LLM Token and API types backend expects only specific keys
  if (lowerType === 'llmtoken' || lowerType === 'llm_token' || lowerType === 'api') {
    return { ...normalizedConfig, ...(isDraft ? { isDraft: true } : {}) };
  }
  return {
    ...(productType ? { productType } : {}),
    ...normalizedConfig,
    ...(isDraft ? { isDraft: true } : {}),
    timestamp: new Date().toISOString(),
  };
};
/* ------------------------------------
 * End inlined configuration defs
 * ------------------------------------*/ 


export interface ConfigurationTabHandle {
  submit: () => Promise<boolean>;
}

export interface ConfigurationTabProps {
  onConfigChange: (config: Record<string, string>) => void;
  onProductTypeChange: (type: string) => void;
  productId?: string;
  onSubmit: () => Promise<boolean>;
}

const ConfigurationTab = React.forwardRef<ConfigurationTabHandle, ConfigurationTabProps>(
  ({
    onConfigChange,
    onProductTypeChange,
    productId,
    onSubmit,
  }, ref) => {
    const [formData, setFormData] = useState<Record<string, string>>({});
    const [productType, setProductType] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isSavingDraft, setIsSavingDraft] = useState(false);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

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
        const endpoint = buildApiEndpoint(baseUrl, productId, productType);
        const body = buildRequestBody(productType, formData, true);
        
        if (!endpoint) {
          return false;
        }

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
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

    // Submit function that can be called from parent via ref
    const submit = async (): Promise<boolean> => {
      // reuse logic below without needing SyntheticEvent
      if (!productId) {
        setError('Product ID is missing');
        return false;
      }
      
      if (!productType) {
        setError('Please select a product type first');
        return false;
      }

      // Validate that all required fields for selected product type have values
      const missingRequired: Record<string,string> = {};
      (configurationFields[productType] || []).forEach((f)=>{
        if (f.required && !formData[f.label]) {
          missingRequired[f.label] = 'This field is required';
        }
      });
      if (Object.keys(missingRequired).length) {
        setFieldErrors((prev)=>({...prev,...missingRequired}));
        setError('Please fill all required fields before proceeding');
        return false;
      }
      
      setIsSaving(true);
      setError('');
      
      try {
        const baseUrl = 'http://54.238.204.246:8080/api/products';
        const endpoint = buildApiEndpoint(baseUrl, productId, productType);
        const body = buildRequestBody(productType, formData, false);
        
        if (!endpoint) {
          setError('Invalid product type selected');
          return false;
        }

        console.log('Submitting configuration payload:', {
          endpoint,
          body,
          productType,
          formData
        });

        if (productType.toLowerCase() === 'flatfile') {
          await (await import('../api')).createProductFlatfileConfig(productId, body as any);
          console.log('FlatFile config saved');
          return true;
        }
        if (productType.toLowerCase() === 'api') {
          await (await import('../api')).createProductApiConfig(productId, body as any);
          console.log('API config saved');
          return true;
        }

        // Fallback to original fetch for other types
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          console.error('API Error:', errData);
          throw new Error(errData.message || `Configuration failed (${res.status})`);
        }

        const result = await res.json().catch(() => ({}));
        console.log('Configuration saved successfully:', result);
        onConfigChange({ ...formData, ...result });
        return true;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Configuration failed';
        console.error('Configuration error:', err);
        setError(msg);
        return false;
      } finally {
        setIsSaving(false);
      }
    };

    // expose submit via ref
    React.useImperativeHandle(ref, () => ({ submit }));

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!productId) {
        setError('Product ID is missing');
        return false;
      }

      setIsSaving(true);
      setError('');
      try {
        const baseUrl = 'http://54.238.204.246:8080/api/products';
        const endpoint = buildApiEndpoint(baseUrl, productId, productType);
        const body = buildRequestBody(productType, formData, false);
        
        if (!endpoint) {
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



    const handleInputChange = React.useCallback((field: string) => (value: string) => {
      const newFormData = {
        ...formData,
        [field]: value,
      };
      setFormData(newFormData);
      onConfigChange(newFormData);
    }, [formData, onConfigChange]);



    const renderField = (field: FieldProps) => {
      const fieldValue = formData[field.label] || '';
      const fieldError = fieldErrors[field.label];

      const handleBlur = () => {
        if (field.required && !fieldValue) {
          setFieldErrors((prev) => ({ ...prev, [field.label]: `This field is required` }));
        } else if (fieldError) {
          setFieldErrors((prev) => ({
            ...Object.fromEntries(Object.entries(prev).filter(([key]) => key !== field.label)),
          }));
        }
      };

      const labelText = field.label;
      // Handle different input types
      switch (field.type) {
        case 'select':
          return (
            <div className="form-group">
              <SelectField
                label={labelText}
                value={fieldValue}
                onChange={handleInputChange(field.label)}
                onBlur={handleBlur}
                options={[
                  { label: field.placeholder || 'Select an option', value: '' },
                  ...(field.options || getSelectOptions(field.label) || []),
                ]}
                error={fieldError}
                required={field.required}
              />
            </div>
          );

        case 'checkbox':
          return (
            <div className="form-group">
              <InputField
                type="checkbox"
                label={labelText}
                checked={fieldValue === 'true'}
                onChange={(val) => {
                  const newValue = val === 'true' ? 'false' : 'true';
                  handleInputChange(field.label)(newValue);
                }}
                onBlur={handleBlur}
              />
            </div>
          );

        case 'textarea':
          return (
            <div className="form-group">
              <TextareaField
                label={labelText}
                value={fieldValue}
                onChange={handleInputChange(field.label)}
                placeholder={field.placeholder}
                error={fieldError}
                onBlur={handleBlur}
              />
            </div>
          );

        case 'number':
          return (
            <div className="form-group">
              <InputField
                type="number"
                label={labelText}
                value={fieldValue}
                onChange={handleInputChange(field.label)}
                onBlur={handleBlur}
                placeholder={field.placeholder}
                error={fieldError}
                min={field.min}
                max={field.max}
                step={field.step}
                inputMode="decimal"
              />
            </div>
          );

        case 'password':
          return (
            <div className="form-group">
              <InputField
                type="password"
                label={labelText}
                value={fieldValue}
                onChange={handleInputChange(field.label)}
                placeholder={field.placeholder}
                error={fieldError}
              />
            </div>
          );

        case 'email':
          return (
            <div className="form-group">
              <InputField
                type="email"
                label={labelText}
                value={fieldValue}
                onChange={handleInputChange(field.label)}
                onBlur={handleBlur}
                placeholder={field.placeholder}
                error={fieldError}
                inputMode="email"
                autoComplete="email"
              />
            </div>
          );

        // Default to text input
        default:
          const commonProps = {
            label: labelText,
            value: fieldValue,
            onChange: handleInputChange(field.label),
            placeholder: field.placeholder,
            error: fieldError,
            onBlur: () => {
              if (field.required && !fieldValue) {
                setFieldErrors((prev) => ({ ...prev, [field.label]: `This field is required` }));
              } else if (fieldError) {
                setFieldErrors((prev) => ({
                  ...Object.fromEntries(Object.entries(prev).filter(([key]) => key !== field.label)),
                }));
              }
            },
          };

          return (
            <div className="form-group">
              <InputField
                {...commonProps}
                type={field.type as any}
              />
            </div>
          );
      }
    };

    return (
      <div className="configuration-tab">
        <div className="form-group">
          <SelectField
            label="Product Type"
            value={productType}
            onChange={handleProductTypeChange}
            options={[
              { label: 'Select Product Type', value: '' },
              ...productOptions,
            ]}
            required
          />
        </div>

        {productType && (
          <div className="configuration-fields">
            <h4>Configuration for {productType.charAt(0).toUpperCase() + productType.slice(1)}</h4>
            {error && <div className="error-message">{error}</div>}
            <div className="form-fields">
              {configurationFields[productType]?.map((field: FieldProps) => renderField(field))}
            </div>
          </div>
        )}
      </div>
    );
  }
);

export { ConfigurationTab };
