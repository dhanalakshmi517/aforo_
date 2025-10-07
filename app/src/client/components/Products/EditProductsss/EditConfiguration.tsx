import * as React from 'react';
import { useState, useEffect } from 'react';
import './ConfigurationTab.css';
import { SelectField, InputField, TextareaField } from '../../componenetsss/Inputs';

/* ------------------------------------
 * EditConfiguration Component
 * ------------------------------------
 * Enhanced with comprehensive localStorage functionality:
 * 
 * LocalStorage Keys:
 * - editConfigFormData: Current form field values
 * - editConfigProductType: Selected product type
 * - editConfigFetchedData: Original data fetched from API (baseline)
 * - editConfigModifiedFields: Array of field names that user has modified
 * 
 * Features:
 * - Auto-saves all changes to localStorage immediately
 * - Tracks which fields have been modified after fetch
 * - Preserves user changes even if data is re-fetched
 * - Provides utilities to check for unsaved changes
 * - Merges fetched data with existing user changes intelligently
 * ------------------------------------*/

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
    { label: 'Endpoint URL', type: 'text', placeholder: 'https://api.example.com/v1/endpoint', required: true },
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
    { label: 'File Location', type: 'text', placeholder: '/path/to/file or s3://bucket/key', required: true },
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
    { label: 'Model Name', type: 'text', placeholder: 'gpt-4o', required: true },
    { label: 'Endpoint URL', type: 'text', placeholder: 'https://api.llmprovider.com/v1/chat', required: true },
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
 * LocalStorage Utility Functions
 * ------------------------------------*/

/**
 * Clears all localStorage data for edit configuration
 * Removes: form data, product type, fetched data, and modified fields tracking
 */
export const clearEditConfigStorage = () => {
  localStorage.removeItem('editConfigFormData');
  localStorage.removeItem('editConfigProductType');
  localStorage.removeItem('editConfigFetchedData');
  localStorage.removeItem('editConfigModifiedFields');
};

/**
 * Gets the list of field names that have been modified by the user
 * @returns Array of field label strings that were changed after initial fetch
 */
export const getModifiedFields = (): string[] => {
  try {
    const modifiedFields = localStorage.getItem('editConfigModifiedFields');
    return modifiedFields ? JSON.parse(modifiedFields) : [];
  } catch (error) {
    console.error('Error reading modified fields:', error);
    return [];
  }
};

/**
 * Checks if there are unsaved changes by comparing current data with fetched baseline
 * @returns true if current form data differs from originally fetched data
 */
export const hasUnsavedChanges = (): boolean => {
  try {
    const currentData = localStorage.getItem('editConfigFormData');
    const fetchedData = localStorage.getItem('editConfigFetchedData');
    
    if (!currentData || !fetchedData) return false;
    
    return JSON.stringify(JSON.parse(currentData)) !== JSON.stringify(JSON.parse(fetchedData));
  } catch (error) {
    console.error('Error checking unsaved changes:', error);
    return false;
  }
};

/* ------------------------------------
 * Public API
 * ------------------------------------*/
export interface ConfigurationTabHandle {
  submit: () => Promise<boolean>; // now: purely client-side validation
  clearStorage: () => void; // clear localStorage data
  getModifiedFields: () => string[]; // get list of modified fields
  hasUnsavedChanges: () => boolean; // check if there are unsaved changes
  getCurrentData: () => Record<string, string>; // get current form data
  getFetchedData: () => Record<string, string> | null; // get original fetched data
}

export interface ConfigurationTabProps {
  initialProductType?: string;
  onConfigChange: (config: Record<string, string>) => void;
  onProductTypeChange: (type: string) => void;
  productId?: string; // kept for compatibility; unused
  onSubmit?: () => Promise<boolean>; // kept for compatibility; optional, called after validation
}

/* ------------------------------------
 * Component (renamed): EditConfiguration
 * ------------------------------------*/
const EditConfiguration = React.forwardRef<ConfigurationTabHandle, ConfigurationTabProps>(
  (
    { onConfigChange, initialProductType = '', onProductTypeChange, productId, onSubmit }: ConfigurationTabProps,
    ref
  ) => {
    const [formData, setFormData] = useState<Record<string, string>>(() => {
      // Load configuration from localStorage on mount
      const saved = localStorage.getItem('editConfigFormData');
      return saved ? JSON.parse(saved) : {};
    });
    const [productType, setProductType] = useState(() => {
      // Load product type from localStorage on mount
      const saved = localStorage.getItem('editConfigProductType');
      return saved || initialProductType || '';
    });
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [isFetched, setIsFetched] = useState(false); // Track if data has been fetched
    const [hasUserChanges, setHasUserChanges] = useState(false); // Track if user has made changes

    // Memoized change handlers
    const handleConfigChange = React.useCallback(
      (updates: Record<string, string>) => {
        const newFormData = { ...formData, ...updates };
        setFormData(newFormData);
        // Persist to localStorage
        localStorage.setItem('editConfigFormData', JSON.stringify(newFormData));
        onConfigChange(newFormData);
      },
      [formData, onConfigChange]
    );

    const handleProductTypeChange = React.useCallback(
      (type: string) => {
        setProductType(type);
        // Persist product type to localStorage
        localStorage.setItem('editConfigProductType', type);
        onProductTypeChange(type);
        // Clear form data when changing product type
        setFormData({});
        localStorage.removeItem('editConfigFormData');
        setFieldErrors({});
        setError('');
      },
      [onProductTypeChange]
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
          errs[f.label] = `${f.label} is required`;
        }
      });
      setFieldErrors(errs);
      setError(Object.keys(errs).length ? 'Please fix the highlighted fields.' : '');
      return Object.keys(errs).length === 0;
    };

    // Expose submit via ref (client-side only)
    React.useImperativeHandle(ref, () => ({
      submit: async () => {
        const ok = validate();
        if (!ok) return false;
        if (onSubmit) {
          try {
            const res = await onSubmit(); // optional callback
            return res !== false;
          } catch {
            return false;
          }
        }
        return true;
      },
      clearStorage: () => {
        clearEditConfigStorage();
        localStorage.removeItem('editConfigFetchedData');
        localStorage.removeItem('editConfigModifiedFields');
        setFormData({});
        setProductType('');
        setFieldErrors({});
        setError('');
        setIsFetched(false);
        setHasUserChanges(false);
      },
      getModifiedFields: () => {
        return getModifiedFields();
      },
      hasUnsavedChanges: () => {
        return hasUnsavedChanges();
      },
      getCurrentData: () => {
        return formData;
      },
      getFetchedData: () => {
        try {
          const fetchedData = localStorage.getItem('editConfigFetchedData');
          return fetchedData ? JSON.parse(fetchedData) : null;
        } catch (error) {
          console.error('Error reading fetched data:', error);
          return null;
        }
      }
    }));

    // Fetch configuration data when productId and productType are available
    useEffect(() => {
      const fetchConfigData = async () => {
        if (!productId || !productType) return;
        
        try {
          const { getAuthData } = await import('../../../utils/auth');
          const authData = getAuthData();
          
          if (!authData?.token) return;

          const headers = {
            'Authorization': `Bearer ${authData.token}`,
            'Content-Type': 'application/json',
            'X-Organization-Id': authData?.organizationId?.toString() || ''
          };

          const endpointMap: Record<string,string> = {
            API: 'api',
            FlatFile: 'flatfile',
            SQLResult: 'sql-result',
            LLMToken: 'llm-token',
          };
          const apiEndpoint = endpointMap[productType as keyof typeof endpointMap] || productType.replace(/_/g,'-').toLowerCase();
          console.debug('Fetching config', productId, apiEndpoint);
          let url = `http://54.238.204.246:8080/api/products/${productId}/${apiEndpoint}`;
          let opts: RequestInit = { headers };
          if (productType === ProductTypeEnum.SQLResult) {
            // Ask backend to return only metadata / small payload
            url += '?meta=1';
          } else if (productType === ProductTypeEnum.LLMToken) {
            url += '?meta=1'; // lightweight metadata only
          }
          const res = await fetch(url, opts);
          
          if (res.ok) {
            console.log('Fetched configuration details:', productId, productType);

            const configData = await res.json();
            console.log('Configuration JSON:', configData);
            if (configData) {
              // Map backend keys to UI labels for prefill
              const lowerType = productType.toLowerCase();
              const mapped: Record<string,string> = {};
              if (lowerType === 'llmtoken' || lowerType === 'llm-token') {
                if (configData.modelName) mapped['Model Name'] = configData.modelName;
                if (configData.endpointUrl) mapped['Endpoint URL'] = configData.endpointUrl;
                if (configData.authType) mapped['Auth Type'] = configData.authType;
              } else if (lowerType === 'api') {
                if (configData.endpointUrl) mapped['Endpoint URL'] = configData.endpointUrl;
                if (configData.authType) mapped['Auth Type'] = configData.authType;
              } else if (lowerType === 'flatfile') {
                if (configData.format) mapped['File Format'] = configData.format;
                if (configData.fileLocation) mapped['File Location'] = configData.fileLocation;
              } else if (lowerType === 'sqlresult' || lowerType === 'sql-result') {
                if (configData.connectionString) mapped['Connection String'] = configData.connectionString;
                if (configData.dbType) mapped['DB Type'] = configData.dbType;
                if (configData.authType) mapped['Auth Type'] = configData.authType;
              }
              // Check if there are existing user changes in localStorage
              const existingData = localStorage.getItem('editConfigFormData');
              const hasExistingChanges = existingData && Object.keys(JSON.parse(existingData)).length > 0;
              
              // Only overwrite if there are no existing user changes
              if (!hasExistingChanges) {
                setFormData(mapped);
                localStorage.setItem('editConfigFormData', JSON.stringify(mapped));
                localStorage.setItem('editConfigFetchedData', JSON.stringify(mapped)); // Store original fetched data
              } else {
                // Merge fetched data with existing changes, prioritizing user changes
                const existingChanges = JSON.parse(existingData);
                const mergedData = { ...mapped, ...existingChanges };
                setFormData(mergedData);
                localStorage.setItem('editConfigFormData', JSON.stringify(mergedData));
                if (!localStorage.getItem('editConfigFetchedData')) {
                  localStorage.setItem('editConfigFetchedData', JSON.stringify(mapped));
                }
              }
              setIsFetched(true);
            }
          }
        } catch (err) {
          console.warn('Failed to fetch config data:', err);
        }
      };

      fetchConfigData();
    }, [productId, productType, onConfigChange, initialProductType]);

    useEffect(() => {
      // Persist to localStorage whenever formData changes
      if (Object.keys(formData).length > 0) {
        localStorage.setItem('editConfigFormData', JSON.stringify(formData));
      }
      onConfigChange(formData);
    }, [formData, onConfigChange]);

    const handleInputChange = React.useCallback(
      (field: string) => (value: string) => {
        const newFormData = { ...formData, [field]: value };
        setFormData(newFormData);
        setHasUserChanges(true); // Mark that user has made changes
        
        // Persist to localStorage immediately
        localStorage.setItem('editConfigFormData', JSON.stringify(newFormData));
        
        // Track modified fields separately
        const modifiedFields = JSON.parse(localStorage.getItem('editConfigModifiedFields') || '[]');
        if (!modifiedFields.includes(field)) {
          modifiedFields.push(field);
          localStorage.setItem('editConfigModifiedFields', JSON.stringify(modifiedFields));
        }
        
        onConfigChange(newFormData);
        // inline validation for required fields
        const def = (configurationFields[productType] || []).find((f) => f.label === field);
        if (def?.required && !value) {
          setFieldErrors((prev) => ({ ...prev, [field]: `${field} is required` }));
        } else {
          setFieldErrors((prev) => {
            const { [field]: _, ...rest } = prev;
            return rest;
          });
        }
      },
      [formData, onConfigChange, productType]
    );

    const renderField = (field: FieldProps) => {
      const fieldValue = formData[field.label] || '';
      const fieldError = fieldErrors[field.label];

      const handleBlur = () => {
        if (field.required && !fieldValue) {
          setFieldErrors((prev) => ({ ...prev, [field.label]: `${field.label} is required` }));
        } else if (fieldError) {
          setFieldErrors((prev) => {
            const { [field.label]: _, ...rest } = prev;
            return rest;
          });
        }
      };

      const labelText = field.label;

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
                value={fieldValue}
                onChange={(val: string) => {
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

        default:
          return (
            <div className="form-group">
              <InputField
                label={labelText}
                value={fieldValue}
                onChange={handleInputChange(field.label)}
                placeholder={field.placeholder}
                error={fieldError}
                onBlur={handleBlur}
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
            options={[{ label: 'Select Product Type', value: '' }, ...productOptions]}
            required
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
