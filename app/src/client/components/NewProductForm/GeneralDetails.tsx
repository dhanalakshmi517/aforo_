import React, { useState, useEffect } from 'react';
import { Grid, Box } from '@mui/material';
import styles from './GeneralDetails.module.css';
import { validateProductName } from '../../api/productValidation';

interface FormLabel {
  productName: string;
  productType: string;
  category: string;
  tags: string;
  productDescription: string;
  version: string;
  status: string;
  internalSkuCode: string;
  visibility: string;
}

const formLabels: FormLabel = {
  productName: 'Product Name',
  productType: 'Product Type',
  category: 'Category',
  tags: 'Tags',
  productDescription: 'Description',
  version: 'Version',
  status: 'Status',
  internalSkuCode: 'Internal SKU Code',
  visibility: 'Visibility'
};

interface GeneralDetailsProps {
  formData: {
    productName: string;
    productType: string;
    version: string;
    productDescription: string;
    category: string;
    status: string;
    tags: { key: string; value: string }[];
    visibility: boolean;
  };
  onChange: (data: Partial<GeneralDetailsProps['formData']>) => void;
  onNext: () => void;
  onCancel: () => void;
  onClose?: () => void;
  categoryOptions: string[];
  productTypeOptions: string[];
  addTag: (key: string, value: string) => void;
  removeTag: (key: string) => void;
  tagKey: string;
  tagValue: string;
  setTagKey: (key: string) => void;
  setTagValue: (value: string) => void;
}

const statusOptions = ['DRAFT', 'ACTIVE', 'INACTIVE', 'DEPRECATED'];

interface ErrorState {
  [key: string]: string | undefined;
}

const GeneralDetails: React.FC<GeneralDetailsProps> = ({
  formData,
  onChange,
  onNext,
  onCancel,
  categoryOptions,
  productTypeOptions,
  addTag,
  removeTag,
  tagKey,
  tagValue,
  setTagKey,
  setTagValue,
}) => {
  const [errors, setErrors] = useState<ErrorState>({});
  const [isCheckingName, setIsCheckingName] = useState(false);
  const [isUnique, setIsUnique] = useState(true);

  // Remove the checkProductNameUnique function since we're handling validation directly in useEffect

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (formData.productName?.trim()) {
        try {
          const { exists, message } = await validateProductName(formData.productName);
          setIsUnique(!exists);
          if (message) {
            setErrors(prev => ({ ...prev, productName: message }));
          } else {
            setErrors(prev => ({ ...prev, productName: undefined }));
          }
        } catch (error) {
          console.error('Error validating product name:', error);
          setErrors(prev => ({ ...prev, productName: 'Error checking product name uniqueness' }));
        }
      } else {
        setIsUnique(true);
        setErrors(prev => ({ ...prev, productName: undefined }));
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [formData.productName]);

  const validate = (): boolean => {
    const newErrors: ErrorState = {};

    if (!formData.productName?.trim()) {
      newErrors.productName = 'Product Name is required.';
    } else if (isCheckingName) {
      newErrors.productName = 'Checking product name, please wait...';
    } else if (!isUnique) {
      newErrors.productName = 'Product Name must be unique.';
    }

    if (!formData.productType?.trim()) newErrors.productType = 'Product Type is required.';
    if (!formData.version?.trim()) newErrors.version = 'Version is required.';
    if (!formData.productDescription?.trim()) newErrors.productDescription = 'Product Description is required.';
    if (!formData.category?.trim()) newErrors.category = 'Category is required.';
    if (!formData.status?.trim()) newErrors.status = 'Status is required.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (isCheckingName) {
      setErrors(prev => ({ ...prev, productName: 'Still checking uniqueness, please wait...' }));
      return;
    }

    const isValid = validate();
    if (isValid) {
      onNext();
    }
  };

  const setError = (key: string, message: string) => {
    setErrors(prev => ({ ...prev, [key]: message }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (!value) {
      setError(name, `${formLabels[name as keyof typeof formLabels]} is required`);
    } else {
      onChange({ [name]: value });
      setError(name, '');
    }
  };

  const handleAddTag = () => {
    if (tagKey && tagValue) {
      addTag(tagKey, tagValue);
      setTagKey('');
      setTagValue('');
    }
  };

  return (
    <div className={styles.formContainer}>
      <h2 className={styles.sectionHeading}>PLAN DETAILS</h2>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <label className={styles.label}>{formLabels.productName}</label>
          <div className={styles.inputWithLoader}>
            <input
              type="text"
              name="productName"
              value={formData.productName}
              onChange={(e) => onChange({ productName: e.target.value })}
              className={styles.formInput}
              placeholder="Enter Product Name"
              required
            />
            {isCheckingName && <span className={styles.loadingIndicator}>Checking...</span>}
            {errors.productName && <div className={styles.error}>{errors.productName}</div>}
          </div>
        </Grid>

        <Grid item xs={12}>
          <label className={styles.label}>{formLabels.productType}</label>
          <select
            className={styles.formSelect}
            name="productType"
            value={formData.productType}
            onChange={handleSelectChange}
          >
            <option value="">--Select--</option>
            {productTypeOptions.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          {errors.productType && <div className={styles.error}>{errors.productType}</div>}
        </Grid>

        <Grid item xs={12}>
          <label className={styles.label}>{formLabels.version}</label>
          <input
            type="text"
            name="version"
            value={formData.version}
            onChange={(e) => onChange({ version: e.target.value })}
            className={styles.formInput}
            placeholder="Enter Version"
          />
          {errors.version && <div className={styles.error}>{errors.version}</div>}
        </Grid>

        <Grid item xs={12}>
          <label className={styles.label}>{formLabels.productDescription}</label>
          <textarea
            name="productDescription"
            value={formData.productDescription}
            onChange={(e) => onChange({ productDescription: e.target.value })}
            className={styles.formTextarea}
            placeholder="Enter Product Description"
            rows={3}
          />
          {errors.productDescription && <div className={styles.error}>{errors.productDescription}</div>}
        </Grid>

        <Grid item xs={12}>
          <label className={styles.label}>{formLabels.category}</label>
          <select
            className={styles.formSelect}
            name="category"
            value={formData.category}
            onChange={handleSelectChange}
          >
            <option value="">--Select--</option>
            {categoryOptions.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          {errors.category && <div className={styles.error}>{errors.category}</div>}
        </Grid>

        <Grid item xs={12}>
          <label className={styles.label}>{formLabels.status}</label>
          <select
            className={styles.formSelect}
            name="status"
            value={formData.status}
            onChange={handleSelectChange}
          >
            <option value="">--Select--</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          {errors.status && <div className={styles.error}>{errors.status}</div>}
        </Grid>

        <Grid item xs={12}>
          <label className={styles.label}>{formLabels.tags}</label>
          <div className={styles.tagInputWrapper}>
            <input
              type="text"
              placeholder="Key"
              value={tagKey}
              onChange={(e) => setTagKey(e.target.value)}
              className={styles.tagKeyInput}
            />
            <input
              type="text"
              placeholder="Value"
              value={tagValue}
              onChange={(e) => setTagValue(e.target.value)}
              className={styles.tagValueInput}
            />
            <button onClick={handleAddTag} disabled={!tagKey || !tagValue}>✚</button>
          </div>
          <div className={styles.tagsContainer}>
            {formData.tags.map((tag, index) => (
              <div key={index} className={styles.tagItem}>
                <span className={styles.tagKey}>{tag.key}</span>
                <span className={styles.tagValue}>{tag.value}</span>
                <button onClick={() => removeTag(tag.key)} className={styles.tagRemoveButton}>✕</button>
              </div>
            ))}
          </div>
        </Grid>

        <Grid item xs={12}>
          <label className={styles.label}>{formLabels.visibility}</label>
          <div className={styles.checkboxContainer}>
            <input
              type="checkbox"
              name="visibility"
              checked={formData.visibility}
              onChange={(e) => onChange({ visibility: e.target.checked })}
              className={styles.visibilityCheckbox}
            />
          </div>
        </Grid>

        <Grid item xs={12}>
          <Box className={styles.buttonGroup}>
            <button type="button" onClick={onCancel} className={styles.buttonSecondary}>Cancel</button>
            <button
              type="button"
              onClick={handleNext}
              className={styles.buttonPrimary}
              disabled={isCheckingName}
            >
              Save & Next
            </button>
          </Box>
        </Grid>
      </Grid>
    </div>
  );
};

export default GeneralDetails;
