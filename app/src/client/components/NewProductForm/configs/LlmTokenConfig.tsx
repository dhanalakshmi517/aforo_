import React from 'react';
import { ProductFormData } from '../../../../types/productTypes';
import styles from './LlmTokenConfig.module.css';
import { InputField, SelectField } from '../../Components/InputFields';

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
        <SelectField
          label="Token Provider"
          value={formData.tokenProvider ?? ''}
          onChange={(val) => setFormData({ tokenProvider: val })}
          options={[
            { label: 'OPENAI', value: 'OPENAI' },
            { label: 'ANTHROPIC', value: 'ANTHROPIC' },
            { label: 'MISTRAL', value: 'MISTRAL' },
            { label: 'CUSTOM', value: 'CUSTOM' },
          ]}
        />

        {errors.tokenProvider && <div className={styles.errorMessage}>{errors.tokenProvider}</div>}
      </div>

      <div className={styles.formGroup}>
        <InputField
          label="Model Name"
          placeholder="Enter model name"
          value={formData.modelName ?? ''}
          onChange={(val) => setFormData({ modelName: val })}
        />
        {errors.modelName && <div className={styles.errorMessage}>{errors.modelName}</div>}
      </div>
      

      <div className={styles.formGroup}>
        <InputField
          label="Unit Cost"
          placeholder="Enter cost"
          value={String(formData.tokenUnitCost ?? '')}
          onChange={(val) => setFormData({ tokenUnitCost: val })}
        />
        {errors.tokenUnitCost && <div className={styles.errorMessage}>{errors.tokenUnitCost}</div>}
      </div>

      <div className={styles.formGroup}>
        <SelectField
          label="Calculation Method"
          value={formData.calculationMethod ?? ''}
          onChange={(val) => setFormData({ calculationMethod: val })}
          options={[
            { label: 'FIXED', value: 'FIXED' },
            { label: 'DYNAMIC', value: 'DYNAMIC' },
            { label: 'HYBRID', value: 'HYBRID' },
          ]}
        />
        {errors.calculationMethod && <div className={styles.errorMessage}>{errors.calculationMethod}</div>}
      </div>

      <div className={styles.formGroup}>
        <InputField
          label="Quota"
          placeholder="Enter quota"
          value={String(formData.quota ?? '')}
          onChange={(val) => setFormData({ quota: val })}
        />
        {errors.quota && <div className={styles.errorMessage}>{errors.quota}</div>}
      </div>

      <div className={styles.formGroup}>
        <InputField
          label="Prompt Template"
          placeholder="Enter prompt"
          value={formData.promptTemplate ?? ''}
          onChange={(val) => setFormData({ promptTemplate: val })}
          
        />
        {errors.promptTemplate && <div className={styles.errorMessage}>{errors.promptTemplate}</div>}
      </div>

      <div className={styles.formGroup}>
        <SelectField
          label="Inference Priority"
          value={formData.inferencePriority ?? ''}
          onChange={(val) => setFormData({ inferencePriority: val })}
          options={[
            { label: 'LOW', value: 'LOW' },
            { label: 'MEDIUM', value: 'MEDIUM' },
            { label: 'HIGH', value: 'HIGH' },
          ]}
        />
        {errors.inferencePriority && <div className={styles.errorMessage}>{errors.inferencePriority}</div>}
      </div>

      <div className={styles.formGroup}>
        <SelectField
          label="Compute Tier"
          value={formData.computeTier ?? ''}
          onChange={(val) => setFormData({ computeTier: val })}
          options={[
            { label: 'STANDARD', value: 'STANDARD' },
            { label: 'PREMIUM', value: 'PREMIUM' },
            { label: 'GPU_OPTIMIZED', value: 'GPU_OPTIMIZED' },
          ]}
        />
        {errors.computeTier && <div className={styles.errorMessage}>{errors.computeTier}</div>}
      </div>
    </div>
  );
};

export default LlmTokenConfig;
