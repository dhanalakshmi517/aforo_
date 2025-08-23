import React, { useState } from 'react';
import { Grid } from '@mui/material';
import { ProductFormData, enums } from '../../../types/productTypes';
import styles from './ProductMetadata.module.css';
import metadataStyles from './MetadataLabels.module.css';
import { InputField } from '../Components/InputFields';

interface ProductMetadataProps {
  formData: ProductFormData;
  onChange: (data: Partial<ProductFormData>) => void;
  onNext: () => void;
  onBack: () => void;
  categoryOptions: string[];
  subCategoryOptions: string[];
  unitOptions: string[];
  taxOptions: string[];
  unitTypeOptions: string[];
  labelKey: string;
  labelValue: string;
  setLabelKey: React.Dispatch<React.SetStateAction<string>>;
  setLabelValue: React.Dispatch<React.SetStateAction<string>>;
  addLabel: (key: string, value: string) => void;
  removeLabel: (key: string) => void;
}

type ErrorState = {
  [key: string]: string;
};

const ProductMetadata: React.FC<ProductMetadataProps> = ({
  formData,
  onChange,
  onNext,
  onBack,
  categoryOptions,
  subCategoryOptions,
  unitOptions,
  taxOptions,
  unitTypeOptions,
  labelKey,
  labelValue,
  setLabelKey,
  setLabelValue,
  addLabel,
  removeLabel,
}) => {
  const [errors, setErrors] = useState<ErrorState>({});

  const validateFields = (): boolean => {
    const newErrors: ErrorState = {};

    if (!formData.internalSkuCode?.trim()) newErrors.internalSkuCode = 'Internal SKU Code is required.';
    if (!formData.uom?.trim()) newErrors.uom = 'UOM is required.';
    if (!formData.effectiveStartDate) newErrors.effectiveStartDate = 'Effective Start Date is required.';
    if (!formData.effectiveEndDate) newErrors.effectiveEndDate = 'Effective End Date is required.';
    if (!formData.auditLogId?.trim()) newErrors.auditLogId = 'Audit Log ID is required.';
    if (!formData.linkedRatePlans || formData.linkedRatePlans.length === 0) {
      newErrors.linkedRatePlans = 'At least one rate plan is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const parsedValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

    onChange({ [name]: parsedValue });

    // clear error on change if valid
    if (parsedValue !== '' && errors[name]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateFields()) {
      onNext();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className={styles.sectionsHeading}>Product Metadata</h2>
      <div className={styles.containers}>
        <Grid container spacing={2} className={styles.formGrid}>
          <Grid item xs={12} sm={6}>
            <div className={styles.formGroupsLabel}>
              <InputField
                label="Internal SKU Code"
                placeholder="Enter internal SKU code"
                value={formData.internalSkuCode}
                onChange={(val) => onChange({ internalSkuCode: val })}
              />
              {errors.internalSkuCode && <div className={styles.error}>{errors.internalSkuCode}</div>}
            </div>
          </Grid>

          <Grid item xs={12} sm={6}>
            <div className={styles.formGroupsLabel}>
              <InputField
                label="UOM"
                placeholder="Enter UOM"
                value={formData.uom}
                onChange={(val) => onChange({ uom: val })}
              />
              {errors.uom && <div className={styles.error}>{errors.uom}</div>}
            </div>
          </Grid>

          <Grid item xs={12} sm={6}>
            <div className={styles.formGroupsLabel}>
              <InputField
                label="Effective Start Date"
                type="date"
                value={formData.effectiveStartDate ?? ''}
                onChange={(val) => onChange({ effectiveStartDate: val })}
              />
              {errors.effectiveStartDate && <div className={styles.error}>{errors.effectiveStartDate}</div>}
            </div>
          </Grid>

          <Grid item xs={12} sm={6}>
            <div className={styles.formGroupsLabel}>
              <InputField
                label="Effective End Date"
                type="date"
                value={formData.effectiveEndDate ?? ''}
                onChange={(val) => onChange({ effectiveEndDate: val })}
              />
              {errors.effectiveEndDate && <div className={styles.error}>{errors.effectiveEndDate}</div>}
            </div>
          </Grid>
          <Grid item xs={12}>
            <div className={styles.formGroupsLabel}>
              <label>Billable</label>
              <div className={styles.checkboxGroup}>
                <input
                  type="checkbox"
                  name="billable"
                  checked={formData.billable}
                  onChange={handleChange}
                  className={styles.checkbox}
                />
              </div>
            </div>
          </Grid>

          <Grid item xs={12}>
            <label className={styles.formGroupsLabel}>Labels</label>
            <div className={metadataStyles.labelInputWrapper}>
              <input
                type="text"
                placeholder="Key"
                value={labelKey}
                onChange={(e) => setLabelKey(e.target.value)}
                className={metadataStyles.labelKeyInput}
              />
              <input
                type="text"
                placeholder="Value"
                value={labelValue}
                onChange={(e) => setLabelValue(e.target.value)}
                className={metadataStyles.labelValueInput}
              />
              <button
                onClick={(e) => {
                  e.preventDefault();
                  const key = labelKey.trim();
                  const value = labelValue.trim();
                  if (key && value) {
                    addLabel(key, value);
                    setLabelKey('');
                    setLabelValue('');
                  }
                }}
                disabled={!labelKey || !labelValue}
                className={styles.labelAddButton}
              >
                ✚
              </button>
            </div>
            <div className={metadataStyles.labelList}>
              {Object.entries(formData.labels || {}).map(([key, value]) => (
                <div key={key} className={styles.labelRow}>
                  <span className={styles.labelKey}>{key}</span>
                  <span className={styles.labelValue}>{value}</span>
                  <button
                    onClick={() => removeLabel(key)}
                    className={styles.labelDeleteBtn}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
  <path d="M2 4.00016H14M12.6667 4.00016V13.3335C12.6667 14.0002 12 14.6668 11.3333 14.6668H4.66667C4 14.6668 3.33333 14.0002 3.33333 13.3335V4.00016M5.33333 4.00016V2.66683C5.33333 2.00016 6 1.3335 6.66667 1.3335H9.33333C10 1.3335 10.6667 2.00016 10.6667 2.66683V4.00016M6.66667 7.3335V11.3335M9.33333 7.3335V11.3335" stroke="#E34935" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
                  </button>
                </div>
              ))}
            </div>
          </Grid>

          <Grid item xs={12} sm={6}>
            <div className={styles.formGroupsLabel}>
              <InputField
                label="Linked Rate Plans"
                placeholder="Enter rate plan names (comma separated)"
                value={Array.isArray(formData.linkedRatePlans) ? formData.linkedRatePlans.join(', ') : ''}
                onChange={(val) => {
                  const ids = val.trim() ? val.split(',').map((v) => v.trim()) : [];
                  onChange({ linkedRatePlans: ids });

                  if (ids.length > 0 && errors.linkedRatePlans) {
                    setErrors((prev) => {
                      const updated = { ...prev };
                      delete updated.linkedRatePlans;
                      return updated;
                    });
                  }
                }}
              />
              {errors.linkedRatePlans && <div className={styles.error}>{errors.linkedRatePlans}</div>}
            </div>
          </Grid>

          <Grid item xs={12} sm={6}>
            <div className={styles.formGroupsLabel}>
              <InputField
                label="Audit Log ID"
                placeholder="Enter audit log ID"
                value={formData.auditLogId ?? ''}
                onChange={(val) => onChange({ auditLogId: val })}
              />
              {errors.auditLogId && <div className={styles.error}>{errors.auditLogId}</div>}
            </div>
          </Grid>

          <Grid item xs={12} className={styles.buttonGroup}>
            <button
              type="button"
              onClick={onBack}
              className={styles.backButton}
            >
              Back
            </button>
            <button
              type="submit"
              className={styles.buttonPrimary}
            >
              Save & Next
            </button>
          </Grid>
        </Grid>
      </div>
    </form>
  );
};

export default ProductMetadata;
