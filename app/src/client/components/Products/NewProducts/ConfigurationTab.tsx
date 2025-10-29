import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import './ConfigurationTab.css';
import { SelectField, InputField, TextareaField } from '../../componenetsss/Inputs';
import { saveProductConfiguration, getProductConfiguration } from '../api';

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
  submit: (skipValidation?: boolean, saveToServer?: boolean) => Promise<boolean>; // skipValidation: true for draft saves, saveToServer: true for final save
}

export interface ConfigurationTabProps {
  initialProductType?: string;
  onConfigChange: (config: Record<string, string>) => void;
  onProductTypeChange: (type: string) => void;
  productId?: string;
  onSubmit?: (isDraft?: boolean) => Promise<boolean>;
  isSavingDraft?: boolean;
  readOnly?: boolean;
  locked?: boolean;
}

const EditConfiguration = React.forwardRef<ConfigurationTabHandle, ConfigurationTabProps>(
  (
    { onConfigChange, initialProductType = '', onProductTypeChange, productId, onSubmit, isSavingDraft, readOnly = false, locked = false }: ConfigurationTabProps,
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
    const [hasSaved, setHasSaved] = useState(() => {
      // Check localStorage for persisted hasSaved state
      const saved = localStorage.getItem(`configHasSaved_${productId}`);
      return saved === 'true';
    });
    const [isLoadingConfig, setIsLoadingConfig] = useState(false);

    // Sync productType with initialProductType when editing a draft
    useEffect(() => {
      if (initialProductType) {
        console.log('Initial product type received:', initialProductType);
        console.log('Current product type state:', productType);
        
        // Normalize the product type to match our enum values
        let normalizedType = initialProductType;
        const lowerType = initialProductType.toLowerCase();
        
        if (lowerType === 'sqlresult' || lowerType === 'sql-result') {
          normalizedType = 'sql-result';
        } else if (lowerType === 'llmtoken' || lowerType === 'llm-token') {
          normalizedType = 'llm-token';
        } else if (lowerType === 'flatfile') {
          normalizedType = 'FlatFile';
        } else if (lowerType === 'api') {
          normalizedType = 'API';
        }
        
        console.log('Normalized product type:', normalizedType);
        
        if (productType !== normalizedType) {
          console.log('Syncing product type to:', normalizedType);
          setProductType(normalizedType);
          localStorage.setItem('configProductType', normalizedType);
        }
      }
    }, [initialProductType]);

    // Fetch existing configuration when editing a draft product
    useEffect(() => {
      const fetchConfiguration = async () => {
        if (productId && initialProductType && !readOnly) {
          try {
            setIsLoadingConfig(true);
            console.log('Fetching configuration for product:', productId, 'type:', initialProductType);
            const configData = await getProductConfiguration(productId, initialProductType);
            
            // Check if configuration exists in backend
            const configExists = configData && Object.keys(configData).length > 0;
            
            if (configExists) {
              console.log('Configuration data received:', configData);
              console.log('Product type (normalized):', initialProductType.toLowerCase());
              console.log('Configuration exists in backend - will use PUT for updates');
              
              // Map backend field names to form field labels based on product type
              const mappedFormData: Record<string, string> = {};
              const normalizedType = initialProductType.toLowerCase();
              
              // Helper to check if value is valid (not placeholder like "string")
              const isValidValue = (val: any) => {
                return val && val !== 'string' && val !== '';
              };
              
              if (normalizedType === 'api') {
                console.log('Mapping API fields:', { endpointUrl: configData.endpointUrl, authType: configData.authType });
                if (isValidValue(configData.endpointUrl)) mappedFormData['Endpoint URL'] = configData.endpointUrl;
                if (isValidValue(configData.authType)) mappedFormData['Auth Type'] = configData.authType;
              } else if (normalizedType === 'flatfile') {
                console.log('Mapping FlatFile fields:', { format: configData.format, fileLocation: configData.fileLocation });
                if (isValidValue(configData.format)) mappedFormData['File Format'] = configData.format;
                if (isValidValue(configData.fileLocation)) mappedFormData['File Location'] = configData.fileLocation;
              } else if (normalizedType === 'sqlresult' || normalizedType === 'sql-result') {
                console.log('Mapping SQL Result fields:', { 
                  connectionString: configData.connectionString, 
                  dbType: configData.dbType, 
                  authType: configData.authType 
                });
                if (isValidValue(configData.connectionString)) mappedFormData['Connection String'] = configData.connectionString;
                if (isValidValue(configData.dbType)) mappedFormData['DB Type'] = configData.dbType;
                if (isValidValue(configData.authType)) mappedFormData['Auth Type'] = configData.authType;
              } else if (normalizedType === 'llmtoken' || normalizedType === 'llm-token') {
                console.log('Mapping LLM Token fields:', { 
                  modelName: configData.modelName, 
                  endpointUrl: configData.endpointUrl, 
                  authType: configData.authType 
                });
                if (isValidValue(configData.modelName)) mappedFormData['Model Name'] = configData.modelName;
                if (isValidValue(configData.endpointUrl)) mappedFormData['Endpoint URL'] = configData.endpointUrl;
                if (isValidValue(configData.authType)) mappedFormData['Auth Type'] = configData.authType;
              }
              
              console.log('Mapped form data:', mappedFormData);
              console.log('Number of fields mapped:', Object.keys(mappedFormData).length);
              setFormData(mappedFormData);
              setHasSaved(true); // Mark as saved since configuration exists in backend
              localStorage.setItem('configFormData', JSON.stringify(mappedFormData));
              localStorage.setItem(`configHasSaved_${productId}`, 'true');
            } else {
              console.log('No existing configuration found - will use POST for creation');
              setHasSaved(false); // No configuration exists, use POST
              localStorage.setItem(`configHasSaved_${productId}`, 'false');
            }
          } catch (error) {
            console.error('Error loading configuration:', error);
            // Don't show error to user for 404/500 errors - just means no config exists yet
            // But log the specific error for debugging
            if (error instanceof Error) {
              console.log('Configuration fetch error details:', error.message);
            }
            setHasSaved(false); // On error, assume no configuration exists
            localStorage.setItem(`configHasSaved_${productId}`, 'false');
          } finally {
            setIsLoadingConfig(false);
          }
        }
      };

      fetchConfiguration();
    }, [productId, initialProductType, readOnly]);

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
        console.log('=== CONFIGURATION SAVE DECISION ===');
        console.log('hasSaved state:', hasSaved);
        console.log('isUpdate (will use PUT if true):', isUpdate);
        console.log('isDraft:', isDraft);
        console.log('productId:', productId);
        console.log('===================================');
        
        console.log('Sending request to API with:', {
          productId,
          productType: normalizedType,
          requestBody,
          isUpdate
        });
        
        await saveProductConfiguration(productId, productType, requestBody, hasSaved);
        
        // Mark as saved after first successful save (regardless of draft status)
        setHasSaved(true);
        localStorage.setItem(`configHasSaved_${productId}`, 'true');
        console.log(isDraft ? 'Draft saved successfully' : 'Configuration saved successfully');
        return true;
      } catch (error) {
        console.error('Error saving configuration:', error);
        
        // Provide more user-friendly error messages
        let errorMessage = 'Failed to save configuration';
        if (error instanceof Error) {
          if (error.message.includes('Server error')) {
            errorMessage = 'Server error occurred. Please check your configuration data and try again.';
          } else if (error.message.includes('validation failed')) {
            errorMessage = error.message;
          } else if (error.message.includes('Network Error')) {
            errorMessage = 'Network error. Please check your connection and try again.';
          } else {
            errorMessage = error.message;
          }
        }
        
        setError(errorMessage);
        return false;
      }
    };

    // Expose submit via ref (client-side only)
    React.useImperativeHandle(ref, () => ({
      submit: async (skipValidation: boolean = false, saveToServer: boolean = true) => {
        // Skip validation when saving as draft (skipValidation=true)
        if (!skipValidation) {
          // Run validation for Save & Next and final submit
          if (!validate()) return false;
        } else {
          // Clear any existing errors when saving as draft
          setFieldErrors({});
          setError('');
        }
        
        // If saveToServer is false, just return true after validation (for Save & Next)
        if (!saveToServer) {
          return true;
        }
        
        // For draft saves, check if there's a product type selected
        // If no product type, just return true without saving
        if (skipValidation && !productType) {
          console.log('No product type selected, skipping configuration save');
          return true;
        }
        
        // Save to server for both draft and final submit
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
          const isDraft = skipValidation; // If skipValidation is true, it's a draft save
          const success = await saveConfiguration(cleanedFormData, isDraft);
          if (success && onSubmit) {
            return await onSubmit(isDraft);
          }
          return success;
        } catch (error) {
          console.error('Error in configuration submit:', error);
          setError('Failed to save configuration. Please try again.');
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
        required: field.required,
        placeholder: field.placeholder,
        disabled: readOnly, // Remove locked from here - we'll handle it per field type
        error: fieldError,
      };

      switch (field.type) {
        case 'select':
          return (
            <div className="form-group">
              <SelectField
                {...commonProps}
                options={field.options || getSelectOptions(field.label) || []}
                disabled={readOnly} // Dropdowns stay enabled when locked, only disabled when readOnly
                onChange={locked ? () => {} : commonProps.onChange} // Prevent changes when locked but allow viewing
              />
            </div>
          );

        case 'checkbox':
          return (
            <div className="form-group">
              <InputField
                type="checkbox"
                {...commonProps}
                disabled={readOnly || locked} // Disable checkboxes when locked
                checked={fieldValue === 'true'}
                onChange={(val: string) => {
                  if (readOnly || locked) return;
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
                disabled={readOnly || locked} // Disable textareas when locked
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
                disabled={readOnly || locked} // Disable number inputs when locked
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
                disabled={readOnly || locked} // Disable password inputs when locked
              />
            </div>
          );

        case 'email':
          return (
            <div className="form-group">
              <InputField
                type="email"
                {...commonProps}
                disabled={readOnly || locked} // Disable email inputs when locked
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
                disabled={readOnly || locked} // Disable default text inputs when locked
                type={field.type as any}
              />
            </div>
          );
      }
    };

    return (
      <div
        className={`configuration-tab ${locked ? 'is-locked' : ''}`}
        style={{ position: 'relative', opacity: locked ? 0.8 : 1 }}
        aria-disabled={locked}
      >
        {/* Reduced opacity overlay - allows dropdown interactions */}
        {locked && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none', // Allow interactions to pass through
              background: 'rgba(255, 255, 255, 0.1)', // Very subtle overlay
              borderRadius: 12
            }}
          />
        )}
        <div className="form-group">
          {/* Product type dropdown with inline error */}
          <SelectField
            label="Type of Product"
            value={productType}
            onChange={locked ? () => {} : handleProductTypeChange} // Prevent changes when locked but allow viewing
            options={productOptions}
            required
            disabled={readOnly || isLoadingConfig} // Only disable for readOnly, not locked
            error={!productType && error ? error : undefined}
          />
        </div>

        {isLoadingConfig && (
          <div className="loading-message" style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
            Loading configuration...
          </div>
        )}

        {!isLoadingConfig && productType && (
          <div className="configuration-fields">
            {/* keep generic error only for non-field messages */}
            <div className="form-fields">
              {configurationFields[productType]?.map((field: FieldProps) => (
                <div key={field.label}>
                  {renderField(field)}
                </div>
              ))}
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

