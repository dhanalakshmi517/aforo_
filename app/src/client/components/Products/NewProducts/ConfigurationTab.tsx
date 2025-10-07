import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import './ConfigurationTab.css';
import { SelectField, InputField, TextareaField } from '../../componenetsss/Inputs';
import { saveProductConfiguration } from '../api';

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
  SQLResult = 'sql-result',
  LLMToken = 'llm-token',
}

export const productOptions = [
  { label: 'API', value: ProductTypeEnum.API },
  { label: 'Flat File', value: ProductTypeEnum.FlatFile },
  { label: 'SQL Result', value: ProductTypeEnum.SQLResult },
  { label: 'LLM Token', value: ProductTypeEnum.LLMToken },
];

export const configurationFields: Record<string, FieldProps[]> = {
  [ProductTypeEnum.API]: [
    { label: 'Endpoint URL', type: 'text', placeholder: 'eg. https://api.example.com/v1/{endpoint}', required: true },
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
    { label: 'File Location', type: 'text', placeholder: 'e.g., /path/to/file.csv', required: true },
  ],
  [ProductTypeEnum.SQLResult]: [
    {
      label: 'Connection String',
      type: 'text',
      placeholder: 'eg. https://api.example.com/v1/{endpoint}',
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
    { label: 'Model Name', type: 'text', placeholder: 'e.g., GPT-4, Claude, custom model', required: true },
    { label: 'Endpoint URL', type: 'text', placeholder: 'eg. https://api.example.com/v1/{endpoint}', required: true },
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
    { label: 'Version', type: 'text', placeholder: 'e.g., 1.0.0', required: true },
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
    { label: 'System Requirements', type: 'textarea', placeholder: 'Minimum system requirements...' },
  ],
  hardware: [
    { label: 'Model Number', type: 'text', placeholder: 'e.g., HW-2024-001', required: true },
    { label: 'Warranty Period (months)', type: 'number', min: 1, max: 120, required: true },
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
    { label: 'Dimensions', type: 'text', placeholder: 'L x W x H (cm)' },
    { label: 'Weight (kg)', type: 'number', step: 0.1, min: 0 },
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
    { label: 'Duration (hours)', type: 'number', min: 1, required: true },
    {
      label: 'Location',
      type: 'select',
      options: [
        { label: 'On-site', value: 'onsite' },
        { label: 'Remote', value: 'remote' },
        { label: 'Hybrid', value: 'hybrid' },
      ],
    },
    { label: 'Prerequisites', type: 'textarea', placeholder: 'Any requirements or prerequisites...' },
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
    { label: 'File Size (MB)', type: 'number', min: 0.1, step: 0.1 },
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
    { label: 'DRM Protection', type: 'checkbox' },
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

/* ------------------------------------
 * Public API
 * ------------------------------------*/
export interface ConfigurationTabHandle {
  submit: () => Promise<boolean>; // now: purely client-side validation
}

export interface ConfigurationTabProps {
  initialProductType?: string;
  onConfigChange: (config: Record<string, string>) => void;
  onProductTypeChange: (type: string) => void;
  productId?: string;
  onSubmit?: (isDraft?: boolean) => Promise<boolean>;
  isSavingDraft?: boolean;
  readOnly?: boolean;
}

const EditConfiguration = React.forwardRef<ConfigurationTabHandle, ConfigurationTabProps>(
  (
    { onConfigChange, initialProductType = '', onProductTypeChange, productId, onSubmit, isSavingDraft, readOnly = false }: ConfigurationTabProps,
    ref
  ) => {
    const [formData, setFormData] = useState<Record<string, string>>(() => {
      const saved = localStorage.getItem('configFormData');
      return saved ? JSON.parse(saved) : {};
    });
    const [productType, setProductType] = useState(() => {
      const saved = localStorage.getItem('configProductType');
      return saved || initialProductType || '';
    });
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [hasSaved, setHasSaved] = useState(false); // Track if we've saved at least once

    // Memoized change handlers
    const handleConfigChange = React.useCallback(
      (updates: Record<string, string>) => {
        const newFormData = { ...formData, ...updates };
        setFormData(newFormData);
        onConfigChange(newFormData);
      },
      [formData, onConfigChange, readOnly]
    );

    const handleProductTypeChange = React.useCallback(
      (type: string) => {
        // Prevent any changes when in read-only mode
        if (readOnly) {
          return;
        }
        
        // Only proceed if we're not in read-only mode
        if (!readOnly) {
          setError('');
          setProductType(type);
          localStorage.setItem('configProductType', type);
          onProductTypeChange(type);
        }
      },
      [onProductTypeChange, readOnly]
    );

    // Validation (no network)
    const validate = (): boolean => {
      if (!productType) {
        setError('Please select a product type first');
        return false;
      }
      const fields = configurationFields[productType] || [];
      const errs: Record<string, string> = {};
      fields.forEach((f) => {
        if (f.required && !(`${formData[f.label] || ''}`.trim())) {
          errs[f.label] = 'This field is required';
        }
      });
      setFieldErrors(errs);
      setError(Object.keys(errs).length ? '' : '');
      return Object.keys(errs).length === 0;
    };

    // Save configuration to the server
    const saveConfiguration = async (configData: Record<string, any>, isDraft: boolean = false): Promise<boolean> => {
      console.log('Starting saveConfiguration with:', { productId, productType, configData, isDraft });
      if (!productId || !productType) {
        console.error('Missing productId or productType');
        return false;
      }
      
      try {
        // Map form data to the expected API structure based on product type
        let requestBody: Record<string, any> = {};
        const normalizedType = productType.toLowerCase();
        
        // Helper function to create an object with only defined values
        const createConfig = (fields: Record<string, any>) => {
          return Object.entries(fields).reduce((acc, [key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
              acc[key] = value;
            }
            return acc;
          }, {} as Record<string, any>);
        };

        // API Configuration
        if (normalizedType === 'api') {
          requestBody = createConfig({
            endpointUrl: configData['Endpoint URL'],
            authType: configData['Auth Type']
          });
        } 
        // Flat File Configuration
        else if (normalizedType === 'flatfile') {
          requestBody = createConfig({
            format: configData['File Format'],
            fileLocation: configData['File Location']
          });
        } 
        // LLM Token Configuration
        else if (normalizedType === 'llmtoken' || normalizedType === 'llm-token') {
          requestBody = createConfig({
            modelName: configData['Model Name'],
            endpointUrl: configData['Endpoint URL'],
            authType: configData['Auth Type']
          });
        } 
        // SQL Result Configuration
        else if (normalizedType === 'sqlresult' || normalizedType === 'sql-result') {
          // Ensure all required fields are included with default values if not set
          requestBody = {
            connectionString: configData['Connection String'] || '',
            dbType: configData['DB Type'] || 'MYSQL', // Default to MYSQL if not set
            authType: configData['Auth Type'] || 'NONE' // Default to NONE if not set
          };
          console.log('SQL Result request body:', requestBody);
        }

        // Decide whether to POST (first time) or PUT (subsequent / draft updates)
        const isUpdate = hasSaved;
        console.log('Update check:', { isUpdate, hasSaved, isDraft, productId });
        
        console.log('Sending request to API with:', {
          productId,
          productType: normalizedType,
          requestBody,
          isUpdate
        });
        
        await saveProductConfiguration(productId, productType, requestBody, hasSaved);
        
        // Mark as saved after first successful save (regardless of draft status)
        setHasSaved(true);
        console.log(isDraft ? 'Draft saved successfully' : 'Configuration saved successfully');
        return true;
      } catch (error) {
        console.error('Error saving configuration:', error);
        setError(error instanceof Error ? error.message : 'Failed to save configuration');
        return false;
      }
    };

    // Expose submit via ref (client-side only)
    React.useImperativeHandle(ref, () => ({
      submit: async (isDraft: boolean = false) => {
        // Skip validation for draft saves
        if (!isDraft && !validate()) return false;
        
        try {
          console.log('Original formData:', JSON.parse(JSON.stringify(formData)));
          
          // Clean the form data before saving
          const cleanedFormData = Object.entries(formData).reduce((acc, [key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
              acc[key] = value;
            }
            return acc;
          }, {} as Record<string, any>);
          
          console.log('Cleaned formData before sendConfiguration:', cleanedFormData);
          const success = await saveConfiguration(cleanedFormData, isDraft);
          if (success && onSubmit) {
            return await onSubmit(isDraft);
          }
          return success;
        } catch (error) {
          console.error(`Error in ${isDraft ? 'draft ' : ''}configuration submit:`, error);
          setError(`Failed to save ${isDraft ? 'draft ' : ''}configuration. Please try again.`);
          return false;
        }
      }
    }));

    // Initialize form with empty data for new configuration
    useEffect(() => {
      if (productType && !Object.keys(formData || {}).length) {
        // Initialize with empty form data based on product type
        const initialData: Record<string, string> = {};
        const fields = configurationFields[productType] || [];
        
        fields.forEach(field => {
          initialData[field.label] = '';
        });
        
        setFormData(initialData);
      }
    }, [productType, formData, setFormData]);

    // Only call onConfigChange when formData actually changes
    const prevFormDataRef = useRef<Record<string, any>>();
    
    useEffect(() => {
      // Skip initial render and only update if formData has actually changed
      if (prevFormDataRef.current !== undefined && 
          JSON.stringify(prevFormDataRef.current) !== JSON.stringify(formData)) {
        onConfigChange(formData);
      }
      prevFormDataRef.current = formData;
    }, [formData, onConfigChange]);

    const handleInputChange = React.useCallback(
      (field: string) => (value: string) => {
        // Prevent any changes when in read-only mode
        if (readOnly) {
          return;
        }
        
        // Only proceed if we're not in read-only mode
        if (!readOnly) {
          // Create a new form data object without the field if the value is empty
          const newFormData = { ...formData };
          if (value === '' || value === null || value === undefined) {
            delete newFormData[field];
          } else {
            newFormData[field] = value;
          }
          
          setFormData(newFormData);
          localStorage.setItem('configFormData', JSON.stringify(newFormData));
          onConfigChange(newFormData);
          
          // inline validation for required fields
          const def = (configurationFields[productType] || []).find((f) => f.label === field);
          if (def?.required && !value) {
            setFieldErrors((prev) => ({ ...prev, [field]: 'This field is required' }));
          } else {
            setFieldErrors((prev) => {
              const { [field]: _, ...rest } = prev;
              return rest;
            });
          }
        }
      },
      [formData, onConfigChange, productType, readOnly]
    );

    const renderField = (field: FieldProps) => {
      const fieldValue = formData[field.label] || '';
      const fieldError = fieldErrors[field.label];

      const handleBlur = () => {
        if (readOnly) return;
        if (field.required && !fieldValue) {
          setFieldErrors((prev) => ({ ...prev, [field.label]: 'This field is required' }));
        } else if (fieldError) {
          setFieldErrors((prev) => {
            const { [field.label]: _, ...rest } = prev;
            return rest;
          });
        }
      };

      const labelText = field.label;
      
      // Common props for all input fields
      const commonProps = {
        label: labelText,
        value: fieldValue,
        onChange: handleInputChange(field.label),
        onBlur: handleBlur,
        placeholder: field.placeholder,
        error: fieldError,
        required: field.required,
        readOnly,
        disabled: readOnly
      };

      switch (field.type) {
        case 'select':
          return (
            <div className="form-group">
              <SelectField
                {...commonProps}
                options={field.options || getSelectOptions(field.label) || []}
              />
            </div>
          );

        case 'checkbox':
          return (
            <div className="form-group">
              <InputField
                type="checkbox"
                {...commonProps}
                checked={fieldValue === 'true'}
                onChange={(val: string) => {
                  if (readOnly) return;
                  const newValue = val === 'true' ? 'false' : 'true';
                  handleInputChange(field.label)(newValue);
                }}
              />
            </div>
          );

        case 'textarea':
          return (
            <div className="form-group">
              <TextareaField
                {...commonProps}
                rows={4}
              />
            </div>
          );

        case 'number':
          return (
            <div className="form-group">
              <InputField
                type="number"
                {...commonProps}
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
                {...commonProps}
              />
            </div>
          );

        case 'email':
          return (
            <div className="form-group">
              <InputField
                type="email"
                {...commonProps}
                inputMode="email"
                autoComplete="email"
              />
            </div>
          );

        default:
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
            label=" Type of Product"
            value={productType}
            onChange={handleProductTypeChange}
            options={productOptions}
            required
            disabled={readOnly}
          />
        </div>

        {productType && (
          <div className="configuration-fields">
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

export { EditConfiguration };
// Compat alias so existing imports keep working:
export { EditConfiguration as ConfigurationTab };

