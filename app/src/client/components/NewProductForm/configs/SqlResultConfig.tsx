import React from 'react';
import { ProductFormData } from '../../../../types/productTypes';
import styles from './SqlResultConfig.module.css';
import { InputField, SelectField, TextareaField } from '../../Components/InputFields';

interface Props {
  formData: ProductFormData;
  setFormData: (data: Partial<ProductFormData>) => void;
  errors: { [key: string]: string };
}

const SqlResultConfig: React.FC<Props> = ({ formData, setFormData, errors }) => {
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFormData({ [name]: type === 'checkbox' ? checked : value });
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ [name]: value });
  };
  return (
    <div className={styles.formGrid}>
      <div className={styles.formGroup}>
        <TextareaField
          label="Query Template"
          value={formData.queryTemplate ?? ''}
          placeholder="Enter query template"
          onChange={(val) => setFormData({ queryTemplate: val })}
        />
        {errors.queryTemplate && <div className={styles.errorMessage}>{errors.queryTemplate}</div>}
      </div>

      <div className={styles.formGroup}>
        <SelectField
          label="Database Type"
          value={formData.dbType ?? ''}
          onChange={(val) => setFormData({ dbType: val })}
          options={[
            { label: 'MYSQL', value: 'MYSQL' },
            { label: 'POSTGRES', value: 'POSTGRES' },
            { label: 'SQLSERVER', value: 'SQLSERVER' },
            { label: 'ORACLE', value: 'ORACLE' },
          ]}
        />
        {errors.dbType && <div className={styles.errorMessage}>{errors.dbType}</div>}
      </div>

      <div className={styles.formGroup}>
        <SelectField
          label="Freshness"
          value={formData.freshness ?? ''}
          onChange={(val) => setFormData({ freshness: val })}
          options={[
            { label: 'REALTIME', value: 'REALTIME' },
            { label: 'HOURLY', value: 'HOURLY' },
            { label: 'DAILY', value: 'DAILY' },
          ]}
        />
        {errors.freshness && <div className={styles.errorMessage}>{errors.freshness}</div>}
      </div>

      <div className={styles.formGroup}>
        <SelectField
          label="Execution Frequency"
          value={formData.executionFrequency ?? ''}
          onChange={(val) => setFormData({ executionFrequency: val })}
          options={[
            { label: 'ON_DEMAND', value: 'ON_DEMAND' },
            { label: 'SCHEDULED', value: 'SCHEDULED' },
            { label: 'EVENT_DRIVEN', value: 'EVENT_DRIVEN' },
          ]}
        />
        {errors.executionFrequency && <div className={styles.errorMessage}>{errors.executionFrequency}</div>}
      </div>

      <div className={styles.formGroup}>
        <InputField
          label="Expected Row Range"
          placeholder="Enter expected row range"
          value={formData.expectedRowRange ?? ''}
          onChange={(val) => setFormData({ expectedRowRange: val })}
        />
        {errors.expectedRowRange && <div className={styles.errorMessage}>{errors.expectedRowRange}</div>}
      </div>

      <div className={styles.formGroup}>
        <SelectField
          label="Join Complexity"
          value={formData.joinComplexity ?? ''}
          onChange={(val) => setFormData({ joinComplexity: val })}
          options={[
            { label: 'LOW', value: 'LOW' },
            { label: 'MEDIUM', value: 'MEDIUM' },
            { label: 'HIGH', value: 'HIGH' },
          ]}
        />
        {errors.joinComplexity && <div className={styles.errorMessage}>{errors.joinComplexity}</div>}
      </div>

      <div className={styles.formGroup}>
        <InputField
          label="Result Size"
          placeholder="Enter result size"
          value={formData.resultSize ?? ''}
          onChange={(val) => setFormData({ resultSize: val })}
        />
        {errors.resultSize && <div className={styles.errorMessage}>{errors.resultSize}</div>}
      </div>

      <div className={styles.formGroup}>
  <label className={styles.formGroupLabel} htmlFor="cached">Cached Result</label>
  <input
    type="checkbox"
    id="cached"
    name="cached"
    checked={!!formData.cached}
    onChange={handleInputChange}
    className={styles.customCheckbox} // 👈 custom class here
  />
</div>

    </div>
  );
};

export default SqlResultConfig;
