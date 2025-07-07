import React from 'react';
import styles from './FlatFileConfig.module.css';
import { ProductFormData } from '../../../../types/productTypes';

interface FlatFileConfigProps {
  formData: ProductFormData;
  setFormData: (data: Partial<ProductFormData>) => void;
  errors: { [key: string]: string };
}

const FlatFileConfig: React.FC<FlatFileConfigProps> = ({ formData, setFormData, errors }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ [name]: value });
  };

  return (
    <div className={styles.formGrid}>
      <div className={styles.formGroup}>
        <label className={styles.formGroupLabel} htmlFor="deliveryFrequency">Delivery Frequency</label>
        <select
          id="deliveryFrequency"
          name="deliveryFrequency"
          value={formData.deliveryFrequency || ''}
          onChange={handleChange}
          className={styles.formGroupSelect}
        >
          <option value="">--Select--</option>
          <option value="DAILY">DAILY</option>
          <option value="WEEKLY">WEEKLY</option>
          <option value="MONTHLY">MONTHLY</option>
        </select>
        {errors.deliveryFrequency && <div className={styles.errorMessage}>{errors.deliveryFrequency}</div>}
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formGroupLabel} htmlFor="accessMethod">Access Method</label>
        <select
          id="accessMethod"
          name="accessMethod"
          value={formData.accessMethod || ''}
          onChange={handleChange}
          className={styles.formGroupSelect}
        >
          <option value="">--Select--</option>
          <option value="FTP">FTP</option>
          <option value="S3">S3</option>
          <option value="EMAIL">EMAIL</option>
          <option value="API">API</option>
        </select>
        {errors.accessMethod && <div className={styles.errorMessage}>{errors.accessMethod}</div>}
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formGroupLabel} htmlFor="format">Format</label>
        <select
          id="format"
          name="format"
          value={formData.format || ''}
          onChange={handleChange}
          className={styles.formGroupSelect}
        >
          <option value="">--Select--</option>
          <option value="CSV">CSV</option>
          <option value="JSON">JSON</option>
          <option value="XML">XML</option>
          <option value="PARQUET">PARQUET</option>
        </select>
        {errors.format && <div className={styles.errorMessage}>{errors.format}</div>}
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formGroupLabel} htmlFor="compressionFormat">Compression Format</label>
        <select
          name="compression"
          value={formData.compression || ''}
          onChange={(e) => {
            const value = e.target.value;
            setFormData({ compression: value });
          }}
          className={styles.formGroupSelect}
        >
          <option value="">--Select--</option>
          <option value="NONE">NONE</option>
          <option value="GZIP">GZIP</option>
          <option value="ZIP">ZIP</option>
        </select>
        {errors.compression && <div className={styles.errorMessage}>{errors.compression}</div>}
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formGroupLabel} htmlFor="size">Size</label>
        <input
          type="text"
          id="size"
          name="size"
          value={formData.size || ''}
          onChange={handleChange}
          placeholder="e.g., 10MB, 1000 rows"
          className={styles.formGroupInput}
        />
        {errors.size && <div className={styles.errorMessage}>{errors.size}</div>}
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formGroupLabel} htmlFor="retentionPolicy">Retention Policy</label>
        <input
          type="text"
          id="retentionPolicy"
          name="retentionPolicy"
          value={formData.retentionPolicy || ''}
          onChange={handleChange}
          placeholder="e.g., 30 days"
          className={styles.formGroupInput}
        />
        {errors.retentionPolicy && <div className={styles.errorMessage}>{errors.retentionPolicy}</div>}
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formGroupLabel} htmlFor="fileNamingConvention">File Naming Convention</label>
        <input
          type="text"
          id="fileNamingConvention"
          name="fileNamingConvention"
          value={formData.fileNamingConvention || ''}
          onChange={handleChange}
          placeholder="e.g., YYYYMMDD_HHMMSS"
          className={styles.formGroupInput}
        />
        {errors.fileNamingConvention && <div className={styles.errorMessage}>{errors.fileNamingConvention}</div>}
      </div>
    </div>
  );
};

export default FlatFileConfig;
