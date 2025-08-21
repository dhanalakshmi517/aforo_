import React, { useState } from 'react';
import styles from './ConfigurationStep.module.css';
import { ProductFormData } from '../../../types/productTypes';
import LlmTokenConfig from './configs/LlmTokenConfig';
import FlatFileConfig from './configs/FlatFileConfig';
import SqlResultConfig from './configs/SqlResultConfig';
import ApiConfig from './configs/ApiConfig';

interface ConfigurationStepProps {
  formData: ProductFormData;
  onChange: (data: Partial<ProductFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const ConfigurationStep: React.FC<ConfigurationStepProps> = ({ formData, onChange, onNext, onBack }) => {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    onChange({ [name]: type === 'checkbox' ? checked : value });
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    onChange({ [name]: value });
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateFields = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    switch (formData.productType) {
      case 'API':
        if (!formData.endpointUrl) newErrors.endpointUrl = 'Endpoint URL is Required';
        if (!formData.authType) newErrors.authType = 'Authentication Type is Required';
        if (!formData.payloadMetric) newErrors.payloadMetric = 'Payload Metric is Required';
        if (!formData.rateLimitPolicy) newErrors.rateLimitPolicy = 'Rate Limit Policy is Required';
        if (!formData.granularity) newErrors.granularity = 'Granularity is Required';
        if (!formData.grouping) newErrors.grouping = 'Grouping is Required';
        if (!formData.latencyClass) newErrors.latencyClass = 'Latency Class is Required';
        break;
      case 'FlatFile':
        if (!formData.format) newErrors.format = 'Format is Required';
        if (!formData.size) newErrors.size = 'Size is Required';
        if (!formData.deliveryFrequency) newErrors.deliveryFrequency = 'Delivery Frequency is Required';
        if (!formData.accessMethod) newErrors.accessMethod = 'Access Method is Required';
        if (!formData.retentionPolicy) newErrors.retentionPolicy = 'RetentionPolicy is Required';
        if (!formData.fileNamingConvention) newErrors.fileNamingConvention = 'File Naming Convention is Required';
        if (!formData.compression) newErrors.compression = 'Compression is Required';
        break;
      case 'LLMToken':
        if (!formData.tokenProvider) newErrors.tokenProvider = 'Token Provider is Required';
        if (!formData.modelName) newErrors.modelName = 'Model Name is Required';
        if (formData.tokenUnitCost === undefined) newErrors.tokenUnitCost = 'Token Unit Cost is Required';
        if (!formData.calculationMethod) newErrors.calculationMethod = 'Calculation Method is Required';
        if (formData.quota === undefined) newErrors.quota = 'Quota is Required';
        if (!formData.promptTemplate) newErrors.promptTemplate = 'Prompt Template is Required';
        if (!formData.inferencePriority) newErrors.inferencePriority = 'Inference Priority is Required';
        if (!formData.computeTier) newErrors.computeTier = 'Compute Tier is Required';
        break;
      case 'SQLResult':
        if (!formData.queryTemplate) newErrors.queryTemplate = 'Query Template is Required';
        if (!formData.dbType) newErrors.dbType = 'DB Type is Required';
        if (!formData.resultSize) newErrors.resultSize = 'Result Size is Required';
        if (!formData.freshness) newErrors.freshness = 'Freshness is Required';
        if (!formData.executionFrequency) newErrors.executionFrequency = 'Execution Frequency is Required';
        if (!formData.expectedRowRange) newErrors.expectedRowRange = 'Expected Row Range is Required';
        if (!formData.joinComplexity) newErrors.joinComplexity = 'Join Complexity is Required';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const renderFields = () => {
    switch (formData.productType) {
      case 'API':
        return (
          <div className={styles.formGrid}>
            <ApiConfig formData={formData} setFormData={onChange} errors={errors} />
          </div>
        );

      case 'FlatFile':
        return (
          <FlatFileConfig formData={formData} setFormData={onChange} errors={errors} />
        );

      case 'LLMToken':
        return (
          <LlmTokenConfig formData={formData} setFormData={onChange} errors={errors} />
        );

      case 'SQLResult':
        return (
          <SqlResultConfig formData={formData} setFormData={onChange} errors={errors} />
        );

      default:
        return <p>Please select one product type.</p>;
    }
  };

  return (
    <div className={styles.formContainer}>
      <h2 className={styles.sectionHeading}>PLAN DETAILS</h2>
      <form onSubmit={(e) => {
        e.preventDefault();
        if (validateFields()) onNext();
      }}>
        {renderFields()}
        <div className={styles.buttonGroup}>
          <button type="button" onClick={onBack} className={styles.backButton}>
            Back
          </button>
          <button type="submit" className={styles.nextButton}>
            Save & Next
          </button>
        </div>
      </form>
    </div>
  );
};

export default ConfigurationStep;