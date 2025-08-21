import React from 'react';
import { ProductFormData } from '../../../../types/productTypes';
import styles from './ApiConfig.module.css';
import { InputField, SelectField } from '../../Components/InputFields';

interface Props {
  formData: ProductFormData;
  setFormData: (data: Partial<ProductFormData>) => void;
  errors: { [key: string]: string };
}

const ApiConfig: React.FC<Props> = ({ formData, setFormData, errors }) => {
  const update = (patch: Partial<ProductFormData>) => setFormData({ ...formData, ...patch });

  // local handlers for native inputs/selects
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    update({ [name]: type === 'checkbox' ? checked : value } as unknown as Partial<ProductFormData>);
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    update({ [name]: value } as unknown as Partial<ProductFormData>);
  };

  return (
    <div className={styles.formGrid}>
      {/* Endpoint URL */}
      <div className={styles.formGroup}>
        <InputField
          label="Endpoint URL *"
          placeholder="Ex:https://api.example.com/endpoint"
          value={formData.endpointUrl || ''}
          onChange={(val) => setFormData({ ...formData, endpointUrl: val })}
        />
        {errors.endpointUrl && (
          <div className={styles.errorMessage}>{errors.endpointUrl}</div>
        )}
      </div>

      <div className={styles.formGroup}>
        <SelectField
          label="Authentication Type"
          value={formData.authType || ''}
          onChange={(val) => setFormData({ ...formData, authType: val })}
          options={[
            { label: 'NONE', value: 'NONE' },
            { label: 'API_KEY', value: 'API_KEY' },
            { label: 'OAUTH2', value: 'OAUTH2' },
            { label: 'BASIC_AUTH', value: 'BASIC_AUTH' },
          ]}
        />
        {errors.authType && (
          <div className={styles.errorMessage}>{errors.authType}</div>
        )}
      </div>

      <div className={styles.formGroup}>
        <InputField
          label="Payload Metric"
          placeholder="Enter Payload Metric"
          value={formData.payloadMetric || ''}
          onChange={(val) => setFormData({ ...formData, payloadMetric: val })}
        />
        {errors.payloadMetric && (
          <div className={styles.errorMessage}>{errors.payloadMetric}</div>
        )}
      </div>

      <div className={styles.formGroup}>
        <InputField
          label="Rate Limit Policy"
          placeholder="Enter Rate Limit Policy"
          value={formData.rateLimitPolicy || ''}
          onChange={(val) => setFormData({ ...formData, rateLimitPolicy: val })}
          
        />
        {errors.rateLimitPolicy && (
          <div className={styles.errorMessage}>{errors.rateLimitPolicy}</div>
        )}
      </div>

      <div className={styles.formGroup}>
        <InputField
          label="Granularity"
          placeholder="Enter Granularity"
          value={formData.granularity || ''}
          onChange={(val) => update({ granularity: val })}
          
        />
        {errors.granularity && 
          <div className={styles.errorMessage}>{errors.granularity}</div>
        }
      </div>

      <div className={styles.formGroup}>
        {/* <div className={styles.checkbox}> */}
        <label className={styles.formGroupLabel} htmlFor="caching">
             Caching Flag
          </label>
          <input
            type="checkbox"
            id="caching"
            name="caching"
            checked={!!formData.caching}
            onChange={handleInputChange}
          />
          
        </div>
      {/* </div> */}

      <div className={styles.formGroup}>
        <label className={styles.formGroupLabel} htmlFor="latencyClass">
          Latency Class
        </label>
        <select
          id="latencyClass"
          name="latencyClass"
          value={formData.latencyClass || ''}
          onChange={handleSelectChange}
          className={styles.formGroupSelect}
        >
          <option value="">Select</option>
          <option value="LOW">LOW</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="HIGH">HIGH</option>
        </select>
        {errors.latencyClass && 
          <div className={styles.errorMessage}>{errors.latencyClass}</div>
        }
      </div>

      <div className={styles.formGroup}>
        <InputField
          label="Grouping"
          placeholder="Enter grouping"
          value={formData.grouping ?? ''}
          onChange={(val) => update({ grouping: val })}
        />
        {errors.grouping && <div className={styles.errorMessage}>{errors.grouping}</div>}
      </div>
    </div>
  );
};

export default ApiConfig;