import * as React from 'react';
import { useState, useEffect } from 'react';
import './ConfigurationTab.css';
import { DropdownField, InputField, TextareaField } from '../../componenetsss/Inputs';
import { getProductConfiguration } from '../api';

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
    { label: 'Endpoint URL', type: 'text', placeholder: 'https://api.example.com/v1/endpoint', required: true, },
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
    { label: 'Connection String', type: 'text', placeholder: 'jdbc:mysql://host:3306/db?user=usr&password=pwd', required: true },
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
    { label: 'Model Name', type: 'text', placeholder: 'gpt-4o', required: true,},
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
};

export const getSelectOptions = (_: string) => null;

/* ------------------------------------
 * Inline Validation Helpers
 * ------------------------------------*/

// DB Type → Connection String validation patterns
const connectionStringPatterns: Record<string, { pattern: RegExp; example: string }> = {
  MYSQL: { pattern: /^jdbc:mysql:\/\//, example: 'jdbc:mysql://hostname:port/database' },
  POSTGRES: { pattern: /^jdbc:postgresql:\/\//, example: 'jdbc:postgresql://hostname:port/database' },
  SQLSERVER: { pattern: /^jdbc:sqlserver:\/\//, example: 'jdbc:sqlserver://hostname:port;databaseName=database' },
  ORACLE: { pattern: /^jdbc:oracle:thin:@/, example: 'jdbc:oracle:thin:@hostname:port:database' },
  BIGQUERY: { pattern: /^jdbc:bigquery:\/\//, example: 'jdbc:bigquery://https://www.googleapis.com/bigquery/v2:443;ProjectId=project' },
  SNOWFLAKE: { pattern: /^jdbc:snowflake:\/\//, example: 'jdbc:snowflake://account.snowflakecomputing.com/?db=database' },
  OTHERS: { pattern: /^jdbc:/, example: 'Accepts any JDBC connection string starting with jdbc:' },
};

// File Format → File Location validation patterns
const fileLocationPatterns: Record<string, { pattern: RegExp; example: string }> = {
  CSV: { pattern: /\.csv$/i, example: 'Must end with .csv' },
  JSON: { pattern: /\.json$/i, example: 'Must end with .json' },
  XML: { pattern: /\.xml$/i, example: 'Must end with .xml' },
  PARQUET: { pattern: /\.parquet$/i, example: 'Must end with .parquet' },
  OTHERS: { pattern: /.*/, example: 'Accepts any file path' },
};

// Validate Connection String based on DB Type
const validateConnectionString = (dbType: string, connectionString: string): string | null => {
  if (!connectionString || !dbType) return null;
  const config = connectionStringPatterns[dbType];
  if (!config) return null;
  if (!config.pattern.test(connectionString)) {
    return `Invalid format for ${dbType}. Expected: ${config.example}`;
  }
  return null;
};

// Validate File Location based on File Format
const validateFileLocation = (fileFormat: string, fileLocation: string): string | null => {
  if (!fileLocation || !fileFormat) return null;
  if (fileFormat === 'OTHERS') return null; // No restriction for OTHERS
  const config = fileLocationPatterns[fileFormat];
  if (!config) return null;
  if (!config.pattern.test(fileLocation)) {
    return `Invalid format. ${config.example}`;
  }
  return null;
};

// Validate Endpoint URL format (for API product type)
const validateEndpointURL = (url: string): string | null => {
  if (!url) return null;
  // More permissive pattern: allows localhost, IPs, domains, and template variables like {endpoint}
  const urlPattern = /^https?:\/\/.+/;
  if (!urlPattern.test(url)) {
    return 'Invalid URL format. Must start with http:// or https://';
  }
  return null;
};

export const clearEditConfigStorage = () => {
  localStorage.removeItem('editConfigFormData');
  localStorage.removeItem('editConfigProductType');
  localStorage.removeItem('editConfigFetchedData');
  localStorage.removeItem('editConfigModifiedFields');
};

export const getModifiedFields = (): string[] => {
  try {
    const modifiedFields = localStorage.getItem('editConfigModifiedFields');
    return modifiedFields ? JSON.parse(modifiedFields) : [];
  } catch {
    return [];
  }
};

export const hasUnsavedChanges = (): boolean => {
  try {
    const currentData = localStorage.getItem('editConfigFormData');
    const fetchedData = localStorage.getItem('editConfigFetchedData');
    if (!currentData || !fetchedData) return false;
    return JSON.stringify(JSON.parse(currentData)) !== JSON.stringify(JSON.parse(fetchedData));
  } catch {
    return false;
  }
};

export interface ConfigurationTabHandle {
  submit: () => Promise<boolean>;
  clearStorage: () => void;
  getModifiedFields: () => string[];
  hasUnsavedChanges: () => boolean;
  getCurrentData: () => Record<string, string>;
  getFetchedData: () => Record<string, string> | null;
}

export interface ConfigurationTabProps {
  initialProductType?: string;
  onConfigChange: (config: Record<string, string>) => void;
  onProductTypeChange: (type: string) => void;
  productId?: string;
  onSubmit?: () => Promise<boolean>;
}

const EditConfiguration = React.forwardRef<ConfigurationTabHandle, ConfigurationTabProps>(
  ({ onConfigChange, initialProductType = '', onProductTypeChange, productId, onSubmit }, ref) => {
    const [formData, setFormData] = useState<Record<string, string>>(() => {
      const saved = localStorage.getItem('editConfigFormData');
      return saved ? JSON.parse(saved) : {};
    });
    const [productType, setProductType] = useState(() => {
      const saved = localStorage.getItem('editConfigProductType');
      return saved || initialProductType || '';
    });
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [originalProductType, setOriginalProductType] = useState<string>('');

    const handleConfigChange = React.useCallback(
      (updates: Record<string, string>) => {
        const newFormData = { ...formData, ...updates };
        setFormData(newFormData);
        localStorage.setItem('editConfigFormData', JSON.stringify(newFormData));
        onConfigChange(newFormData);
      },
      [formData, onConfigChange]
    );

    const handleProductTypeChange = React.useCallback(
      (type: string) => {
        setProductType(type);
        localStorage.setItem('editConfigProductType', type);
        onProductTypeChange(type);

        // Only set the "type changed" flag if user actually changed away from original
        if (originalProductType && type !== originalProductType) {
          localStorage.setItem('editConfigProductTypeChanged', 'true');
        } else {
          localStorage.removeItem('editConfigProductTypeChanged');
        }

        // Reset fields
        setFormData({});
        localStorage.removeItem('editConfigFormData');
        setFieldErrors({});
        setError('');
      },
      [onProductTypeChange, originalProductType]
    );

    const validate = (): boolean => {
      if (!productType) {
        setError('Select product type');
        return false;
      }
      const fields = configurationFields[productType] || [];
      const errs: Record<string, string> = {};
      fields.forEach((f) => {
        const fieldValue = `${formData[f.label] || ''}`.trim();
        if (f.required && !fieldValue) {
          errs[f.label] = `${f.label} is required`;
        }
        // Validate Connection String based on DB Type
        else if (f.label === 'Connection String' && fieldValue) {
          const dbType = formData['DB Type'];
          const connError = validateConnectionString(dbType, fieldValue);
          if (connError) {
            errs[f.label] = connError;
          }
        }
        // Validate File Location based on File Format
        else if (f.label === 'File Location' && fieldValue) {
          const fileFormat = formData['File Format'];
          const fileError = validateFileLocation(fileFormat, fieldValue);
          if (fileError) {
            errs[f.label] = fileError;
          }
        }
        // Validate Endpoint URL format for API product type
        else if (f.label === 'Endpoint URL' && fieldValue) {
          const urlError = validateEndpointURL(fieldValue);
          if (urlError) {
            errs[f.label] = urlError;
          }
        }
      });
      setFieldErrors(errs);
      setError('');
      return Object.keys(errs).length === 0;
    };

    React.useImperativeHandle(ref, () => ({
      submit: async () => {
        const ok = validate();
        if (!ok) return false;
        if (onSubmit) {
          try {
            const res = await onSubmit();
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
      },
      getModifiedFields: () => getModifiedFields(),
      hasUnsavedChanges: () => hasUnsavedChanges(),
      getCurrentData: () => formData,
      getFetchedData: () => {
        try {
          const fetchedData = localStorage.getItem('editConfigFetchedData');
          return fetchedData ? JSON.parse(fetchedData) : null;
        } catch {
          return null;
        }
      }
    }));

    // Fetch baseline configuration; only mark "type changed" on 404.
    useEffect(() => {
      const fetchConfigData = async () => {
        if (!productId || !productType) return;
        try {
          // Use the proper API client instead of direct fetch to avoid CORS issues
          const configData = await getProductConfiguration(productId, productType);

          if (configData && Object.keys(configData).length > 0) {
            if (!originalProductType) {
              setOriginalProductType(productType);
              localStorage.setItem('editConfigOriginalProductType', productType);
            }

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

            localStorage.setItem('editConfigFetchedData', JSON.stringify(mapped));
            const existingEdits = localStorage.getItem('editConfigFormData');
            const merged = existingEdits ? { ...mapped, ...JSON.parse(existingEdits) } : mapped;
            setFormData(merged);
            localStorage.setItem('editConfigFormData', JSON.stringify(merged));

            // we DO have existing config → ensure flag is off
            localStorage.removeItem('editConfigProductTypeChanged');
          } else {
            // no existing config – will need to POST on save
            localStorage.setItem('editConfigProductTypeChanged', 'true');
            localStorage.removeItem('editConfigFetchedData');
          }
        } catch (err) {
          // Important: Do NOT force productTypeChanged=true on generic errors
          console.warn('Failed to fetch config data:', err);
          localStorage.setItem('editConfigProductTypeChanged', 'true');
          localStorage.removeItem('editConfigFetchedData');
        }
      };

      fetchConfigData();
    }, [productId, productType, onConfigChange, initialProductType, originalProductType]);

    useEffect(() => {
      if (Object.keys(formData).length > 0) {
        localStorage.setItem('editConfigFormData', JSON.stringify(formData));
      }
      onConfigChange(formData);
    }, [formData, onConfigChange]);

    const handleInputChange = React.useCallback(
      (field: string) => (value: string) => {
        const newFormData = { ...formData, [field]: value };
        setFormData(newFormData);
        localStorage.setItem('editConfigFormData', JSON.stringify(newFormData));

        const modifiedFields = JSON.parse(localStorage.getItem('editConfigModifiedFields') || '[]');
        if (!modifiedFields.includes(field)) {
          modifiedFields.push(field);
          localStorage.setItem('editConfigModifiedFields', JSON.stringify(modifiedFields));
        }

        onConfigChange(newFormData);
        const def = (configurationFields[productType] || []).find((f) => f.label === field);
        if (def?.required && !value) {
          setFieldErrors((prev) => ({ ...prev, [field]: `${field} is required` }));
        } else {
          // Check for Connection String validation based on DB Type
          if (field === 'Connection String' && value) {
            const dbType = newFormData['DB Type'];
            const connError = validateConnectionString(dbType, value);
            if (connError) {
              setFieldErrors((prev) => ({ ...prev, [field]: connError }));
            } else {
              setFieldErrors((prev) => {
                const { [field]: _, ...rest } = prev;
                return rest;
              });
            }
          }
          // Check for File Location validation based on File Format
          else if (field === 'File Location' && value) {
            const fileFormat = newFormData['File Format'];
            const fileError = validateFileLocation(fileFormat, value);
            if (fileError) {
              setFieldErrors((prev) => ({ ...prev, [field]: fileError }));
            } else {
              setFieldErrors((prev) => {
                const { [field]: _, ...rest } = prev;
                return rest;
              });
            }
          }
          // Check for Endpoint URL validation for API product type
          else if (field === 'Endpoint URL' && value) {
            const urlError = validateEndpointURL(value);
            if (urlError) {
              setFieldErrors((prev) => ({ ...prev, [field]: urlError }));
            } else {
              setFieldErrors((prev) => {
                const { [field]: _, ...rest } = prev;
                return rest;
              });
            }
          }
          // Re-validate Connection String when DB Type changes
          else if (field === 'DB Type') {
            const connString = newFormData['Connection String'];
            if (connString) {
              const connError = validateConnectionString(value, connString);
              if (connError) {
                setFieldErrors((prev) => ({ ...prev, 'Connection String': connError }));
              } else {
                setFieldErrors((prev) => {
                  const { 'Connection String': _, ...rest } = prev;
                  return rest;
                });
              }
            }
            setFieldErrors((prev) => {
              const { [field]: _, ...rest } = prev;
              return rest;
            });
          }
          // Re-validate File Location when File Format changes
          else if (field === 'File Format') {
            const fileLocation = newFormData['File Location'];
            if (fileLocation) {
              const fileError = validateFileLocation(value, fileLocation);
              if (fileError) {
                setFieldErrors((prev) => ({ ...prev, 'File Location': fileError }));
              } else {
                setFieldErrors((prev) => {
                  const { 'File Location': _, ...rest } = prev;
                  return rest;
                });
              }
            }
            setFieldErrors((prev) => {
              const { [field]: _, ...rest } = prev;
              return rest;
            });
          }
          else {
            setFieldErrors((prev) => {
              const { [field]: _, ...rest } = prev;
              return rest;
            });
          }
        }
      },
      [formData, onConfigChange, productType]
    );

    const renderField = (field: FieldProps, index?: number) => {
      const fieldValue = formData[field.label] || '';
      const fieldError = fieldErrors[field.label];

      const handleBlur = () => {
        if (field.required && !fieldValue) {
          setFieldErrors((prev) => ({ ...prev, [field.label]: `${field.label} is required` }));
        } else if (field.label === 'Connection String' && fieldValue) {
          // Validate Connection String on blur
          const dbType = formData['DB Type'];
          const connError = validateConnectionString(dbType, fieldValue);
          if (connError) {
            setFieldErrors((prev) => ({ ...prev, [field.label]: connError }));
          } else {
            setFieldErrors((prev) => {
              const { [field.label]: _, ...rest } = prev;
              return rest;
            });
          }
        } else if (field.label === 'File Location' && fieldValue) {
          // Validate File Location on blur
          const fileFormat = formData['File Format'];
          const fileError = validateFileLocation(fileFormat, fieldValue);
          if (fileError) {
            setFieldErrors((prev) => ({ ...prev, [field.label]: fileError }));
          } else {
            setFieldErrors((prev) => {
              const { [field.label]: _, ...rest } = prev;
              return rest;
            });
          }
        } else if (field.label === 'Endpoint URL' && fieldValue) {
          // Validate Endpoint URL on blur
          const urlError = validateEndpointURL(fieldValue);
          if (urlError) {
            setFieldErrors((prev) => ({ ...prev, [field.label]: urlError }));
          } else {
            setFieldErrors((prev) => {
              const { [field.label]: _, ...rest } = prev;
              return rest;
            });
          }
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
            <div key={index !== undefined ? `field-${index}` : field.label} className="edit-con-form-group">
              <DropdownField
                label={labelText}
                value={fieldValue}
                onChange={handleInputChange(field.label)}
                options={field.options || getSelectOptions(field.label) || []}
                error={fieldError}
                required={field.required}
              />
            </div>
          );
        case 'checkbox':
          return (
            <div key={index !== undefined ? `field-${index}` : field.label} className="edit-con-form-group">
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
            <div key={index !== undefined ? `field-${index}` : field.label} className="edit-con-form-group">
              <TextareaField
                label={labelText}
                value={fieldValue}
                onChange={handleInputChange(field.label)}
                placeholder={field.placeholder}
                error={fieldError}
                onBlur={handleBlur}
                required={field.required}
              />
            </div>
          );
        case 'number':
          return (
            <div key={index !== undefined ? `field-${index}` : field.label} className="edit-con-form-group">
              <InputField
                type="number"
                label={labelText}
                value={fieldValue}
                onChange={handleInputChange(field.label)}
                onBlur={handleBlur}
                placeholder={field.placeholder}
                error={fieldError}
                required={field.required}
                min={field.min}
                max={field.max}
                step={field.step}
                inputMode="decimal"
              />
            </div>
          );
        case 'password':
          return (
            <div key={index !== undefined ? `field-${index}` : field.label} className="edit-con-form-group">
              <InputField
                type="password"
                label={labelText}
                value={fieldValue}
                onChange={handleInputChange(field.label)}
                onBlur={handleBlur}
                placeholder={field.placeholder}
                error={fieldError}
                required={field.required}
              />
            </div>
          );
        default:
          return (
            <div key={index !== undefined ? `field-${index}` : field.label} className="edit-con-form-group">
              <InputField
                type={field.type || 'text'}
                label={labelText}
                value={fieldValue}
                onChange={handleInputChange(field.label)}
                onBlur={handleBlur}
                placeholder={field.placeholder}
                error={fieldError}
                required={field.required}
              />
            </div>
          );
      }
    };

    return (
      <div className="edit-con-configuration-tab">
        <div className="edit-con-form-group">
          <DropdownField
            label="Product Type"
            value={productType}
            onChange={handleProductTypeChange}
            options={productOptions}
            required
            error={error}
          />
        </div>

        {productType && (
          <div className="configuration-fields">
            <div className="form-fields">
              {configurationFields[productType]?.map((field: FieldProps, index: number) => renderField(field, index))}
            </div>
          </div>
        )}
      </div>
    );
  }
);

export { EditConfiguration };
export { EditConfiguration as ConfigurationTab };