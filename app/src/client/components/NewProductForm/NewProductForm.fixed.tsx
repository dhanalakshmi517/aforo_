import React, { useState } from 'react';
import GeneralDetails from './GeneralDetails';
import ProductMetadata from './ProductMetadata';
import ConfigurationStep from './ConfigurationStep';
import ReviewStep from './ReviewStep';

import { ProductFormData } from '../../../types/productTypes';
import styles from './StepIndicator.module.css';


type Step = 0 | 1 | 2 | 3 | 4;

const productTypeOptions = ['API', 'FlatFile', 'SQLResult', 'LLMToken'];
const steps = ['General Details', 'Product Metadata', 'Configuration', 'Review'];

const stepDescriptions = [
  {
    title: 'General Details',
    description: 'Set plan name, structure, and billing basics.',
  },
  {
    title: 'Product Metadata',
    description: 'Link product info and identifiers.',
  },
  {
    title: 'Configuration',
    description: 'Define pricing, usage, and billing rules.',
  },
  {
    title: 'Review',
    description: 'Check and Finalize details.',
  }
];

interface NewProductFormProps {
  onSubmit: (formData: ProductFormData) => Promise<void>;
  onClose: () => void;
}

interface ModalState {
  showCancelModal: boolean;
  isClosing: boolean;
}

const NewProductForm: React.FC<NewProductFormProps> = ({ onSubmit, onClose }) => {
  const [modalState, setModalState] = useState<ModalState>({
    showCancelModal: false,
    isClosing: false,
  });

  const handleCancel = () => {
    setModalState({ showCancelModal: true, isClosing: false });
  };

  const confirmCancel = () => {
    setModalState({ showCancelModal: false, isClosing: true });
    onClose();
  };

  const [step, setStep] = useState<Step>(0);
  const [productId, setProductId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tagKey, setTagKey] = useState('');
  const [tagValue, setTagValue] = useState('');
  const categoryOptions = ['INTERNAL', 'EXTERNAL', 'PARTNER'];

  const [formData, setFormData] = useState<ProductFormData>({
    productName: '',
    productType: '',
    version: '',
    productDescription: '',
    category: '',
    visibility: false,
    status: '',
    internalSkuCode: '',
    uom: '',
    effectiveStartDate: '',
    effectiveEndDate: '',
    billable: false,
    auditLogId: '',
    linkedRatePlans: [],
    tags: [],
    labels: {},

    endpointUrl: '',
    authType: '',
    payloadMetric: '',
    rateLimitPolicy: '',
    granularity: '',
    grouping: '',
    caching: false,
    latencyClass: '',

    size: '',
    format: '',
    compression: '',
    encoding: '',
    schema: '',
    deliveryFrequency: '',
    accessMethod: '',
    retentionPolicy: '',
    fileNamingConvention: '',

    queryTemplate: '',
    dbType: '',
    freshness: '',
    executionFrequency: '',
    expectedRowRange: '',
    joinComplexity: '',
    resultSize: '',
    cached: false,

    tokenProvider: '',
    modelName: '',
    tokenUnitCost: '',
    calculationMethod: '',
    quota: '',
    promptTemplate: '',
    inferencePriority: '',
    computeTier: '',
  });

  const updateFormData = (newData: Partial<ProductFormData>) =>
    setFormData((prev) => ({ ...prev, ...newData }));

  const handleAddTag = (key: string, value: string) => {
    updateFormData({ tags: [...(formData.tags || []), { key, value }] });
  };

  const handleRemoveTag = (key: string) => {
    updateFormData({ tags: formData.tags.filter(tag => tag.key !== key) });
  };

  const handleAddLabel = (key: string, value: string) => {
    const newLabels = { ...formData.labels, [key]: value };
    updateFormData({ labels: newLabels });
  };

  const handleRemoveLabel = (key: string) => {
    const newLabels = { ...formData.labels };
    delete newLabels[key];
    updateFormData({ labels: newLabels });
  };

  const validateGeneralDetails = () => {
    if (!formData.productName || !formData.productType || !formData.version || !formData.productDescription || !formData.category || !formData.status) {
      setError('Please fill in all required fields');
      return false;
    }
    return true;
  };

  const validateProductMetadata = () => {
    if (!formData.internalSkuCode || !formData.uom || !formData.effectiveStartDate || !formData.effectiveEndDate) {
      setError('Please fill in all required fields');
      return false;
    }
    return true;
  };

  const nextStep = async () => {
    if (step === 0 && !validateGeneralDetails()) return;
    if (step === 1 && !validateProductMetadata()) return;

    if (step === 1) {
      try {
        const basePayload = {
          productName: formData.productName,
          productType: formData.productType as 'API' | 'FlatFile' | 'SQLResult' | 'LLMToken',
          version: formData.version,
          productDescription: formData.productDescription,
          category: formData.category as 'INTERNAL' | 'EXTERNAL' | 'PARTNER',
          visibility: formData.visibility,
          status: formData.status as 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'DEPRECATED',
          internalSkuCode: formData.internalSkuCode,
          uom: formData.uom,
          effectiveStartDate: formData.effectiveStartDate ? new Date(formData.effectiveStartDate).toISOString() : null,
          effectiveEndDate: formData.effectiveEndDate ? new Date(formData.effectiveEndDate).toISOString() : null,
          billable: formData.billable,
          auditLogId: formData.auditLogId,
          linkedRatePlans: formData.linkedRatePlans,
          tags: formData.tags.reduce((acc, tag) => ({ ...acc, [tag.key]: tag.value }), {}),
          labels: formData.labels,
        };

        const res = await fetch('http://13.230.194.245:8080/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(basePayload),
        });

        const responseText = await res.text();

        if (!res.ok) {
          throw new Error(`Product creation failed: ${responseText}`);
        }

        const responseJson = JSON.parse(responseText);
        if (!responseJson.productId) {
          throw new Error('Invalid response: productId missing');
        }

        setProductId(responseJson.productId);
      } catch (err: any) {
        console.error('Error details:', err);
        setError(err.message);
        console.error('Backend error:', err.message);
        return;
      }
    }

    setStep((prev) => (prev < 4 ? (prev + 1) as Step : prev));
  };

  const prevStep = () => setStep((prev) => (prev > 0 ? (prev - 1) as Step : prev));

  const handleSubmit = async () => {
    if (!productId) {
      setError('Product ID missing. Please complete earlier steps.');
      return;
    }

    try {
      let configEndpoint = '';
      let configBody: any = { productId };

      switch (formData.productType) {
        case 'API':
          configEndpoint = '/api/products/api';
          configBody = {
            ...configBody,
            endpointUrl: formData.endpointUrl,
            authType: formData.authType,
            payloadSizeMetric: formData.payloadMetric,
            rateLimitPolicy: formData.rateLimitPolicy,
            meteringGranularity: formData.granularity,
            grouping: formData.grouping,
            cachingFlag: formData.caching,
            latencyClass: formData.latencyClass,
          };
          break;

        case 'FlatFile':
          configEndpoint = '/api/products/flatfile';
          configBody = {
            ...configBody,
            size: formData.size,
            format: formData.format,
            compressionFormat: formData.compression,
            deliveryFrequency: formData.deliveryFrequency,
            accessMethod: formData.accessMethod,
            retentionPolicy: formData.retentionPolicy,
            fileNamingConvention: formData.fileNamingConvention,
          };
          break;

        case 'SQLResult':
          configEndpoint = '/api/products/sql-result';
          configBody = {
            ...configBody,
            queryTemplate: formData.queryTemplate,
            dbType: formData.dbType,
            freshness: formData.freshness,
            executionFrequency: formData.executionFrequency,
            expectedRowRange: formData.expectedRowRange,
            joinComplexity: formData.joinComplexity,
            resultSize: formData.resultSize,
            cached: formData.cached,
          };
          break;

        case 'LLMToken':
          configEndpoint = '/api/products/llm-token';
          configBody = {
            ...configBody,
            tokenProvider: formData.tokenProvider,
            modelName: formData.modelName,
            tokenUnitCost: formData.tokenUnitCost,
            calculationMethod: formData.calculationMethod,
            quota: formData.quota,
            promptTemplate: formData.promptTemplate,
            inferencePriority: formData.inferencePriority,
            computeTier: formData.computeTier,
          };
          break;

        default:
          throw new Error('Unknown product type');
      }

      const endpointMap = {
        API: 'api',
        FlatFile: 'flatfile',
        SQLResult: 'sql-result',
        LLMToken: 'llm-token',
      };

      const configRes = await fetch(`http://13.230.194.245:8080/api/products/${productId}/${endpointMap[formData.productType]}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configBody),
      });

      if (!configRes.ok) {
        const errorText = await configRes.text();
        throw new Error(`Configuration failed: ${errorText}`);
      }

      nextStep();
    } catch (err: any) {
      console.error('Backend error:', err.message);
    }
  };

  const renderStepTabs = () => (
    <div className={styles.stepIndicatorContainer}>
      {steps.map((label, index) => (
        <div
          key={index}
          className={`${styles.step} ${step > index ? styles.completed : ''} ${step === index ? styles.active : ''}`}
        >
          <div className={styles.stepTitle}>
            <div className={styles.stepIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="11.5" stroke="#D6D5D7" />
                <circle cx="12" cy="12" r="6" fill="#3088B4" />
                {step > index && (
                  <path
                    d="M9 12.5L11 14.5L15 10"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
              </svg>
            </div>


            {label}
          </div>
          <div className={styles.stepDescription}>{stepDescriptions[index].description}</div>
          {index < steps.length - 1 && (
            <div className={styles.connector}>
              <svg xmlns="http://www.w3.org/2000/svg" width="2" height="87" viewBox="0 0 2 87" fill="none">
                <path d="M1 85.7998L1 1.7998" stroke="#D6D5D7" stroke-width="2" stroke-linecap="round" />
              </svg>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className={styles.newProductForm}>
      {modalState.showCancelModal && (
        <div className="delete-modal-overlay">
          <div className="delete-modal-content">
            <div className="delete-modal-body">
              <h5>
                Are you sure you want to Cancel?
                <br />
                <strong>Your saved changes will be lost.</strong>
              </h5>
              <p>This action cannot be undone.</p>
            </div>
            <div className="delete-modal-footer">
              <button className="delete-modal-cancel" onClick={() => {
                setModalState({ showCancelModal: false, isClosing: false });
              }}>Dismiss</button>
              <button className="delete-modal-confirm" onClick={confirmCancel} disabled={modalState.isClosing}>
                {modalState.isClosing ? 'Closing...' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
     <div className={styles.titleContainer}>
  <div className={styles.titleLeft}>
    {/* <svg className={styles.titleIcon} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M9.99935 15.8332L4.16602 9.99984M4.16602 9.99984L9.99935 4.1665M4.16602 9.99984H15.8327" stroke="#706C72" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg> */}
    <h4 className={styles.title}>Create New Pricing Product</h4>
  </div>
  <div className={styles.titleActions}>
    <button className={styles.buttonSecondary} onClick={handleCancel}>Cancel</button>
    <button className={styles.buttonGhost}>Save as Draft</button>
  </div>
</div>

      <div className={styles.formContainer}>
        <div className={styles.tabsContainer}>{renderStepTabs()}</div>

        <div className={styles.contentContainer}>


          {step === 0 && (
            <GeneralDetails
              formData={formData}
              onChange={updateFormData}
              onNext={nextStep}
              onCancel={onClose}
              categoryOptions={categoryOptions}
              productTypeOptions={productTypeOptions}
              addTag={handleAddTag}
              removeTag={handleRemoveTag}
              tagKey={tagKey}
              tagValue={tagValue}
              setTagKey={setTagKey}
              setTagValue={setTagValue}
            />
          )}
          {step === 1 && (
            <ProductMetadata
              formData={formData}
              onChange={updateFormData}
              onNext={nextStep}
              onBack={prevStep}
              categoryOptions={[]}
              subCategoryOptions={[]}
              unitOptions={[]}
              taxOptions={[]}
              unitTypeOptions={[]}
              labelKey={tagKey}
              labelValue={tagValue}
              setLabelKey={setTagKey}
              setLabelValue={setTagValue}
              addLabel={handleAddLabel}
              removeLabel={handleRemoveLabel}
            />
          )}
          {step === 2 && (
            <ConfigurationStep
              formData={formData}
              onChange={updateFormData}
              onNext={nextStep}
              onBack={prevStep}
            />
          )}
          {step === 3 && (
            <ReviewStep
              formData={formData}
              onBack={prevStep}
              onSubmit={handleSubmit}
              onClose={onClose}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default NewProductForm;
