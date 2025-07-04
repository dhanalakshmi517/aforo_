import React from 'react';
import { ProductFormData } from '../../../../types/productTypes';
import styles from './ApiConfig.module.css';

interface Props {
  formData: ProductFormData;
  setFormData: (data: Partial<ProductFormData>) => void;
  errors: { [key: string]: string };
}

const ApiConfig: React.FC<Props> = ({ formData, setFormData, errors }) => {
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <div className={styles.formGrid}>
      <div className={styles.formGroup}>
        <label className={styles.formGroupLabel} htmlFor="endpointUrl">
          Endpoint URL *
        </label>
        <input
          id="endpointUrl"
          name="endpointUrl"
          type="url"
          value={formData.endpointUrl || ''}
          onChange={handleInputChange}
          className={`${styles.formGroupInput} ${errors.endpointUrl ? styles.error : ''}`}
          placeholder="Ex:https://api.example.com/endpoint"
          required
        />
        {errors.endpointUrl && 
          <div className={styles.errorMessage}>{errors.endpointUrl}</div>
        }
        
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formGroupLabel} htmlFor="authType">
          Authentication Type
        </label>
        <select
          id="authType"
          name="authType"
          value={formData.authType || ''}
          onChange={handleSelectChange}
          className={`${styles.formGroupSelect} ${errors.authType ? styles.error : ''}`}
        >
          <option value="">--Select--</option>
          <option value="None">None</option>
          <option value="API_KEY">API_KEY</option>
          <option value="OAUTH2">OAUTH2</option>
          <option value="BASIC_AUTH">BASIC_AUTH</option>
        </select>
        {errors.authType && 
          <div className={styles.errorMessage}>{errors.authType}</div>
        }
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formGroupLabel} htmlFor="payloadMetric">
          Payload Metric
        </label>
        <input
          id="payloadMetric"
          name="payloadMetric"
          type="text"
          value={formData.payloadMetric || ''}
          onChange={handleInputChange}
          className={`${styles.formGroupInput} ${errors.payloadMetric ? styles.error : ''}`}
          placeholder="EnterPayload Metric"
        />
        {errors.payloadMetric && 
          <div className={styles.errorMessage}>{errors.payloadMetric}</div>
        }
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formGroupLabel} htmlFor="rateLimitPolicy">
          Rate Limit Policy
        </label>
        <input
          type="text"
          id="rateLimitPolicy"
          name="rateLimitPolicy"
          value={formData.rateLimitPolicy || ''}
          onChange={handleInputChange}
          className={`${styles.formGroupInput} ${errors.rateLimitPolicy ? styles.error : ''}`}
          placeholder="Enter Rate Limit Policy"
          required
        />
        {errors.rateLimitPolicy && 
          <div className={styles.errorMessage}>{errors.rateLimitPolicy}</div>
        }
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formGroupLabel} htmlFor="granularity">
          Granularity
        </label>
        <input
          type="text"
          id="granularity"
          name="granularity"
          value={formData.granularity || ''}
          onChange={handleInputChange}
          placeholder="Enter Granularity"
          className={`${styles.formGroupInput} ${errors.granularity ? styles.error : ''}`}
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
        <label className={styles.formGroupLabel} htmlFor="grouping">
          Grouping 
        </label>
        <input
          id="grouping"
          name="grouping"
          type="text"
          value={formData.grouping || ''}
          onChange={handleInputChange}
          className={styles.formGroupInput}
          placeholder="Enter grouping e.g., customer_id, region"
        />
        {errors.grouping && 
          <div className={styles.errorMessage}>{errors.grouping}</div>
        }
      </div>
    </div>
  );
};

export default ApiConfig; 