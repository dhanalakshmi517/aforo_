import React, { useState, useEffect } from 'react';
import { InputField, SelectField, TextareaField } from '../Components/InputFields';
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
        <Grid item xs={12} sm={12}>
          <InputField
            label={formLabels.productName}
            placeholder="Enter Product Name"
            value={formData.productName}
            onChange={(val) => onChange({ productName: val })}
          />
          {isCheckingName && <span className={styles.loadingIndicator}>Checking...</span>}
          {errors.productName && <div className={styles.error}>{errors.productName}</div>}
        </Grid>

        <Grid item xs={12} sm={12}>
          <SelectField
            label={formLabels.productType}
            value={formData.productType}
            onChange={(val) => onChange({ productType: val })}
            options={productTypeOptions.map((t) => ({ label: t, value: t }))}
          />
          {errors.productType && <div className={styles.error}>{errors.productType}</div>}
        </Grid>

        <div className="sub-create-form">
          <Grid item xs={12} sm={12}>
            <InputField
              label={formLabels.version}
              placeholder="Enter Version"
              value={formData.version}
              onChange={(val) => onChange({ version: val })}
            />
            {errors.version && <div className={styles.error}>{errors.version}</div>}
          </Grid>
        </div>

        <Grid item xs={12} sm={12}>
          <TextareaField
            label={formLabels.productDescription}
            placeholder="Enter Product Description"
            value={formData.productDescription}
            onChange={(val) => onChange({ productDescription: val })}
          />
          {errors.productDescription && <div className={styles.error}>{errors.productDescription}</div>}
        </Grid>

        <Grid item xs={12} sm={12}>
          <SelectField
            label={formLabels.category}
            value={formData.category}
            onChange={(val) => onChange({ category: val })}
            options={categoryOptions.map((c) => ({ label: c, value: c }))}
          />
          {errors.category && <div className={styles.error}>{errors.category}</div>}
        </Grid>

        <Grid item xs={12} sm={12}>
          <SelectField
            label={formLabels.status}
            value={formData.status}
            onChange={(val) => onChange({ status: val })}
            options={statusOptions.map((s) => ({ label: s, value: s }))}
          />
          {errors.status && <div className={styles.error}>{errors.status}</div>}
        </Grid>

        <Grid item xs={12} sm={12}>
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

        <Grid item xs={12} sm={12}>
          <label className={styles.label}>{formLabels.visibility}</label>
          <label className={styles.checkboxContainer}>
            <input
              type="checkbox"
              name="visibility"
              checked={formData.visibility}
              onChange={(e) => onChange({ visibility: e.target.checked })}
              className={styles.hiddenCheckbox}
            />
            <span className={styles.visibilityIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M4 12C4 8.22876 4 6.34314 5.17158 5.17158C6.34314 4 8.22876 4 12 4C15.7712 4 17.6569 4 18.8284 5.17158C20 6.34314 20 8.22876 20 12C20 15.7712 20 17.6569 18.8284 18.8284C17.6569 20 15.7712 20 12 20C8.22876 20 6.34314 20 5.17158 18.8284C4 17.6569 4 15.7712 4 12Z" stroke="#E6E5E6" strokeWidth="1.2"/>
              </svg>
            </span>
          </label>
        </Grid>

        <Grid item xs={12} sm={12}>
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