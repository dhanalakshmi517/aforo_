import React from 'react';
import { ConfigurationFormProps, ProductType } from './types';
import './EditProductForm.css';

interface FieldConfig {
  label: string;
  type: 'text' | 'select' | 'checkbox';
  options?: string[];
  required?: boolean;
}

const configurationFields: Record<ProductType, Record<string, FieldConfig>> = {
  [ProductType.API]: {
    endpointUrl: { label: 'Endpoint URL', type: 'text', required: true },
    authType: { label: 'Authentication Type', type: 'select', required: true, options: ['BASIC_AUTH', 'NONE', 'API_KEY','OAUTH2'] },
    payloadSizeMetric: { label: 'Payload Size Metric', type: 'text'},
    rateLimitPolicy: { label: 'Rate Limit Policy', type: 'text' },
    meteringGranularity: { label: 'Metering Granularity', type: 'text'},
    grouping: { label: 'Grouping', type: 'text' },
    latencyClass: { label: 'Latency Class', type: 'select', options: ['LOW', 'MEDIUM', 'HIGH'] },
    cachingFlag: { label: 'Enable Caching', type: 'checkbox' }
  },
  [ProductType.FLATFILE]: {
    size: { label: 'File Size', type: 'text' },
    format: { label: 'File Format', type: 'select', options: ['CSV', 'JSON', 'XML','PARQUET'] },
    deliveryFrequency: { label: 'Delivery Frequency', type: 'select', options: ['DAILY', 'WEEKLY', 'MONTHLY'] },
    accessMethod: { label: 'Access Method', type: 'select', options: ['FTP', 'S3', 'EMAIL','API'] },
    compressionFormat: { label: 'Compression Format', type: 'select', options: ['ZIP', 'GZIP', 'NONE'] },
    fileNamingConvention: { label: 'File Naming Convention', type: 'text' },
    retentionPolicy: { label: 'Retention Policy', type: 'text' }
  },
  [ProductType.SQLRESULT]: {
    queryTemplate: { label: 'Query Template', type: 'text' },
    dbType: { label: 'Database Type', type: 'select', options: ['MYSQL', 'POSTGRES', 'ORACLE','SQLSERVER'] },
    freshness: { label: 'Freshness', type: 'select', options: ['DAILY', 'REALTIME', 'HOURLY'] },
    executionFrequency: { label: 'Execution Frequency', type: 'select', options: ['ON_DEMAND', 'SCHEDULED','EVENT_DRIVEN'] },
    joinComplexity: { label: 'Join Complexity', type: 'select', options: ['LOW', 'MEDIUM', 'HIGH'] },
    expectedRowRange: { label: 'Expected Row Range', type: 'text' },
    resultSize: { label: 'Result Size', type: 'text' },
    cached: { label: 'Enable Caching', type: 'checkbox' }
  },
  [ProductType.LLMTOKEN]: {
    tokenProvider: { label: 'Token Provider', type: 'select', options: ['OPENAI', 'ANTHROPIC', 'MISTRAL','CUSTOM'] },
    modelName: { label: 'Model Name', type: 'text' },
    tokenUnitCost: { label: 'Token Unit Cost', type: 'text' },
    calculationMethod: { label: 'Calculation Method', type: 'select', options: ['FIXED', 'DYAMIC','HYBRID'] },
    quota: { label: 'Quota', type: 'text' },
    inferencePriority: { label: 'Inference Priority', type: 'select', options: ['LOW', 'MEDIUM', 'HIGH'] },
    computeTier: { label: 'Compute Tier', type: 'select', options: ['STANDARD', 'PREMIUM','GPU_OPTIMIZED'] },
    promptTemplate: { label: 'Prompt Template', type: 'text' }
  }
};

const normalizeProductType = (productType: string): ProductType => {
  if (!productType) return ProductType.API;
  
  const normalizedType = productType.toLowerCase();
  switch (normalizedType) {
    case 'api':
      return ProductType.API;
    case 'flatfile':
      return ProductType.FLATFILE;
    case 'sqlresult':
      return ProductType.SQLRESULT;
    case 'llmtoken':
      return ProductType.LLMTOKEN;
    default:
      return ProductType.API;
  }
};

const ConfigurationForm: React.FC<ConfigurationFormProps> = ({ data, productType, onChange, loading }) => {
  // Normalize product type to handle both lowercase and uppercase values
  const normalizedType = normalizeProductType(productType);
  
  if (!normalizedType || !configurationFields[normalizedType]) {
    return (
      <div className="edit-form-group">
        <label>No configuration available for this product type</label>
      </div>
    );
  }

  const fields = configurationFields[normalizedType];

  const renderField = (field: string, config: FieldConfig) => {
    // Get the value with type assertion
    const value = (data as any)[field] ?? false; // Use false as fallback for boolean values
    const handleChange = (newValue: any) => {
      if (onChange) {
        const newConfig = { ...data };
        (newConfig as any)[field] = newValue;
        onChange(newConfig);
      }
    };

    switch (config.type) {
      case 'text':
        return (
          <div className="edit-form-group" key={field}>
            <label>{config.label}</label>
            <input
              type="text"
              value={value !== undefined && value !== null ? String(value) : ''}
              onChange={(e) => handleChange(e.target.value)}
              disabled={loading}
            />
          </div>
        );
      case 'select':
        return (
          <div className="edit-form-group" key={field}>
            <label>{config.label}</label>
            <select
              value={value !== undefined && value !== null ? String(value) : ''}
              onChange={(e) => handleChange(e.target.value)}
              disabled={loading}
            >
              <option value="">Select {config.label}</option>
              {config.options?.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        );
      case 'checkbox':
        return (
          <div className="edit-form-group" key={field}>
            <label>{config.label}</label>
            <label className="switch">
              <input
                type="checkbox"
                checked={value === true}
                onChange={(e) => handleChange(e.target.checked)}
                disabled={loading}
              />
              <span className="slider round"></span>
            </label>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="general-form">
      {Object.entries(fields).map(([field, config]) => renderField(field, config))}
    </div>
  );
};

export default ConfigurationForm;
