import React from 'react';
import { ProductFormData } from '../../../../types/productTypes';
import styles from './LlmTokenConfig.module.css';

interface Props {
  formData: ProductFormData;
  setFormData: (data: Partial<ProductFormData>) => void;
  errors: { [key: string]: string };
}

const LlmTokenConfig: React.FC<Props> = ({ formData, setFormData, errors }) => {
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ [name]: value });
  };

  const handleSelectChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ [name]: value });
  };

  return (
    <div className={styles.formGrid}>
      <div className={styles.formGroup}>
        <label className={styles.formGroupLabel} htmlFor="tokenProvider">Token Provider</label>
        <select
          id="tokenProvider"
          name="tokenProvider"
          value={formData.tokenProvider || ''}
          onChange={handleSelectChange}
          className={styles.formGroupSelect}
        >
          <option value="">--Select--</option>
          <option value="OPENAI">OPENAI</option>
          <option value="ANTHROPIC">ANTHROPIC</option>
          <option value="MISTRAL">MISTRAL</option>
          <option value="CUSTOM">CUSTOM</option>
        </select>
        {errors.tokenProvider && <div className={styles.errorMessage}>{errors.tokenProvider}</div>}
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formGroupLabel} htmlFor="modelName">Model Name</label>
        <input
          type="text"
          id="modelName"
          name="modelName"
          value={formData.modelName || ''}
          onChange={handleInputChange}
          placeholder="Enter model name"
          className={styles.formGroupInput}
        />
        {errors.modelName && <div className={styles.errorMessage}>{errors.modelName}</div>}
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formGroupLabel} htmlFor="tokenUnitCost">Token Unit Cost</label>
        <input
          type="number"
          id="tokenUnitCost"
          name="tokenUnitCost"
          value={formData.tokenUnitCost || ''}
          onChange={handleInputChange}
          placeholder="Enter cost"
          className={styles.formGroupInput}
        />
        {errors.tokenUnitCost && <div className={styles.errorMessage}>{errors.tokenUnitCost}</div>}
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formGroupLabel} htmlFor="calculationMethod">Calculation Method</label>
        <select
          id="calculationMethod"
          name="calculationMethod"
          value={formData.calculationMethod || ''}
          onChange={handleSelectChange}
          className={styles.formGroupSelect}
        >
          <option value="">--Select--</option>
          <option value="FIXED">FIXED</option>
          <option value="DYNAMIC">DYNAMIC</option>
          <option value="HYBRID">HYBRID</option>
        </select>
        {errors.calculationMethod && <div className={styles.errorMessage}>{errors.calculationMethod}</div>}
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formGroupLabel} htmlFor="quota">Quota</label>
        <input
          type="number"
          id="quota"
          name="quota"
          value={formData.quota || ''}
          onChange={handleInputChange}
          placeholder="Enter quota"
          className={styles.formGroupInput}
        />
        {errors.quota && <div className={styles.errorMessage}>{errors.quota}</div>}
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formGroupLabel} htmlFor="promptTemplate">Prompt Template</label>
        <input
          type="text"
          id="promptTemplate"
          name="promptTemplate"
          value={formData.promptTemplate || ''}
          onChange={handleInputChange}
          placeholder="Enter prompt"
          className={styles.formGroupInput}
        />
        {errors.promptTemplate && <div className={styles.errorMessage}>{errors.promptTemplate}</div>}
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formGroupLabel} htmlFor="inferencePriority">Inference Priority</label>
        <select
          id="inferencePriority"
          name="inferencePriority"
          value={formData.inferencePriority || ''}
          onChange={handleSelectChange}
          className={styles.formGroupSelect}
        >
          <option value="">--Select--</option>
          <option value="LOW">LOW</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="HIGH">HIGH</option>
        </select>
        {errors.inferencePriority && <div className={styles.errorMessage}>{errors.inferencePriority}</div>}
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formGroupLabel} htmlFor="computeTier">Compute Tier</label>
        <select
          id="computeTier"
          name="computeTier"
          value={formData.computeTier || ''}
          onChange={handleSelectChange}
          className={styles.formGroupSelect}
        >
          <option value="">--Select--</option>
          <option value="STANDARD">STANDARD</option>
          <option value="PREMIUM">PREMIUM</option>
          <option value="GPU_OPTIMIZED">GPU_OPTIMIZED</option>
        </select>
        {errors.computeTier && <div className={styles.errorMessage}>{errors.computeTier}</div>}
      </div>
    </div>
  );
};

export default LlmTokenConfig;
