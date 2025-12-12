import * as React from 'react';
import { useState, useEffect } from 'react';
import './ConfigurationTab.css';
import { SelectField, InputField, TextareaField } from '../../componenetsss/Inputs';
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
    { label: 'Connection String', type: 'text', placeholder: 'jdbc:mysql://host:3306/db?user=usr&password=pwd', required: true },
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
};

export const getSelectOptions = (_: string) => null;

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
          setFieldErrors((prev) => {
            const { [field]: _, ...rest } = prev;
            return rest;
          });
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
            <div key={index !== undefined ? `field-${index}` : field.label} className="form-group">
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
            <div key={index !== undefined ? `field-${index}` : field.label} className="form-group">
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
            <div key={index !== undefined ? `field-${index}` : field.label} className="form-group">
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
            <div key={index !== undefined ? `field-${index}` : field.label} className="form-group">
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
            <div key={index !== undefined ? `field-${index}` : field.label} className="form-group">
              <InputField
                type="password"
                label={labelText}
                value={fieldValue}
                onChange={handleInputChange(field.label)}
                onBlur={handleBlur}
                placeholder={field.placeholder}
                error={fieldError}
              />
            </div>
          );
        default:
          return (
            <div key={index !== undefined ? `field-${index}` : field.label} className="form-group">
              <InputField
                type={field.type || 'text'}
                label={labelText}
                value={fieldValue}
                onChange={handleInputChange(field.label)}
                onBlur={handleBlur}
                placeholder={field.placeholder}
                error={fieldError}
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