import React from 'react';
import { ProductFormData } from '../../../../types/productTypes';
import styles from './SqlResultConfig.module.css';

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
        <label className={styles.formGroupLabel} htmlFor="queryTemplate">Query Template</label>
        <textarea
          id="queryTemplate"
          name="queryTemplate"
          value={formData.queryTemplate || ''}
          onChange={handleInputChange}
          rows={3}
          className={styles.formGroupInput}
          placeholder="Enter query template"
        ></textarea>
        {errors.queryTemplate && <div className={styles.errorMessage}>{errors.queryTemplate}</div>}
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formGroupLabel} htmlFor="dbType">Database Type</label>
        <select
          id="dbType"
          name="dbType"
          value={formData.dbType || ''}
          onChange={handleSelectChange}
          className={styles.formGroupSelect}
        >
          <option value="">--Select--</option>
          <option value="MYSQL">MYSQL</option>
          <option value="POSTGRES">POSTGRES</option>
          <option value="SQLSERVER">SQLSERVER</option>
          <option value="ORACLE">ORACLE</option>
        </select>
        {errors.dbType && <div className={styles.errorMessage}>{errors.dbType}</div>}
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formGroupLabel} htmlFor="freshness">Freshness</label>
        <select
          id="freshness"
          name="freshness"
          value={formData.freshness || ''}
          onChange={handleSelectChange}
          className={styles.formGroupSelect}
        >
          <option value="">--Select--</option>
          <option value="REALTIME">REALTIME</option>
          <option value="HOURLY">HOURLY</option>
          <option value="DAILY">DAILY</option>
        </select>
        {errors.freshness && <div className={styles.errorMessage}>{errors.freshness}</div>}
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formGroupLabel} htmlFor="executionFrequency">Execution Frequency</label>
        <select
          id="executionFrequency"
          name="executionFrequency"
          value={formData.executionFrequency || ''}
          onChange={handleSelectChange}
          className={styles.formGroupSelect}
        >
          <option value="">--Select--</option>
          <option value="ON_DEMAND">ON_DEMAND</option>
          <option value="SCHEDULED">SCHEDULED</option>
          <option value="EVENT_DRIVEN">EVENT_DRIVEN</option>
        </select>
        {errors.executionFrequency && <div className={styles.errorMessage}>{errors.executionFrequency}</div>}
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formGroupLabel} htmlFor="expectedRowRange">Expected Row Range</label>
        <input
          type="text"
          id="expectedRowRange"
          name="expectedRowRange"
          value={formData.expectedRowRange || ''}
          onChange={handleInputChange}
          className={styles.formGroupInput}
          placeholder="Enter expected row range"
        />
        {errors.expectedRowRange && <div className={styles.errorMessage}>{errors.expectedRowRange}</div>}
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formGroupLabel} htmlFor="joinComplexity">Join Complexity</label>
        <select
          id="joinComplexity"
          name="joinComplexity"
          value={formData.joinComplexity || ''}
          onChange={handleSelectChange}
          className={styles.formGroupSelect}
        >
          <option value="">--Select--</option>
          <option value="LOW">LOW</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="HIGH">HIGH</option>
        </select>
        {errors.joinComplexity && <div className={styles.errorMessage}>{errors.joinComplexity}</div>}
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formGroupLabel} htmlFor="resultSize">Result Size</label>
        <input
          type="text"
          id="resultSize"
          name="resultSize"
          value={formData.resultSize || ''}
          onChange={handleInputChange}
          className={styles.formGroupInput}
          placeholder="Enter result size"
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
