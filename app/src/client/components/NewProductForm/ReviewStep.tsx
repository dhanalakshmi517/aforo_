import React from 'react';
import { ProductFormData } from '../../../types/productTypes';
import styles from './ReviewStep.module.css';

interface ReviewStepProps {
  formData: ProductFormData;
  onBack: () => void;
  onSubmit: () => void;
}

const ReviewStep: React.FC<ReviewStepProps> = ({ formData, onBack, onSubmit }) => {
  const renderItem = (label: string, value?: any) => {
    const displayValue = () => {
      if (!value) return 'N/A';
      if (typeof value === 'object') {
        if (Array.isArray(value)) {
          return value.map((item, index) => (
            <div key={index}>
              {typeof item === 'object' ? 
                Object.entries(item).map(([key, val]) => (
                  <div key={key}>{`${key}: ${val}`}</div>
                )) : 
                item
              }
            </div>
          ));
        }
        return Object.entries(value).map(([key, val]) => (
          <div key={key}>{`${key}: ${val}`}</div>
        ));
      }
      return value;
    };

    return (
      <div className={styles.reviewItem}>
        <strong>{label}:</strong> {displayValue()}
      </div>
    );
  };

  return (
    <div className={styles.reviewContainer}>
      <h2 className={styles.sectionHeading}>REVIEW</h2>
      <div className={styles.sectionWrapper}>
        {/* Section 1: General Details */}
        <div className={styles.sectionBlock}>
          <h3 className={styles.sectionTitle}>General Details</h3>
          <div className={styles.section}>
            {renderItem('Product Name', formData.productName)}
            {renderItem('Product Type', formData.productType)}
            {renderItem('Version', formData.version)}
            {renderItem('Description', formData.productDescription)}
            {renderItem('Category', formData.category)}
            {renderItem('Tags',formData.tags)}
            {renderItem('Visibility', formData.visibility ? 'Yes' : 'No')}
            {renderItem('Status', formData.status)}
          </div>
        </div>

        {/* Section 2: Metadata */}
        <div className={styles.sectionBlock}>
          <h3 className={styles.sectionTitle}>Product Metadata</h3>
          <div className={styles.section}>
            {renderItem('Internal SKU Code', formData.internalSkuCode)}
            {renderItem('Unit of Measure', formData.uom)}
            {renderItem('labels',formData.labels)}
            {renderItem('Effective Start Date', formData.effectiveStartDate)}
            {renderItem('Effective End Date', formData.effectiveEndDate)}
            {renderItem('Billable', formData.billable ? 'Yes' : 'No')}
            {renderItem('Linked Rate Plans', formData.linkedRatePlans?.join(', '))}
          </div>
        </div>

        {/* Section 3: Configuration */}
        <div className={styles.sectionBlock}>
          <h3 className={styles.sectionTitle}>Configuration</h3>
          <div className={styles.section}>
            {formData.productType === 'API' && (
              <>
                {renderItem('Endpoint URL', formData.endpointUrl)}
                {renderItem('Auth Type', formData.authType)}
                {renderItem('Payload Metric', formData.payloadMetric)}
                {renderItem('Rate Limit Policy', formData.rateLimitPolicy)}
                {renderItem('Granularity', formData.granularity)}
                {renderItem('Grouping', formData.grouping)}
                {renderItem('Latency Class', formData.latencyClass)}
                {renderItem('Caching Enabled', formData.caching ? 'Yes' : 'No')}
              </>
            )}
            {formData.productType === 'FlatFile' && (
              <>
               {renderItem('Size',formData.size) }
                {renderItem('Format', formData.format)}
                {renderItem('Compression', formData.compression || 'None')}
                {renderItem('Delivery Frequency', formData.deliveryFrequency)}
                {renderItem('Access Method', formData.accessMethod)}
                {renderItem('Retention Policy', formData.retentionPolicy)}
                {renderItem('File Naming Convention', formData.fileNamingConvention)}
              </>
            )}
            {formData.productType === 'SQLResult' && (
              <>
                {renderItem('Query Template', formData.queryTemplate)}
                {renderItem('Database Type', formData.dbType)}
                {renderItem('Freshness', formData.freshness)}
                {renderItem('Execution Frequency', formData.executionFrequency)}
                {renderItem('Expected Row Range', formData.expectedRowRange)}
                {renderItem('Join Complexity', formData.joinComplexity)}
                {renderItem('Result Size', formData.resultSize)}
                {renderItem('Cached', formData.cached ? 'Yes' : 'No')}
              </>
            )}
            {formData.productType === 'LLMToken' && (
              <>
                {renderItem('Token Provider', formData.tokenProvider)}
                {renderItem('Model Name', formData.modelName)}
                {renderItem('Token Unit Cost', formData.tokenUnitCost)}
                {renderItem('Calculation Method', formData.calculationMethod)}
                {renderItem('Quota', formData.quota)}
                {renderItem('Prompt Template', formData.promptTemplate)}
                {renderItem('Inference Priority', formData.inferencePriority)}
                {renderItem('Compute Tier', formData.computeTier)}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className={styles.buttonRow}>
        <button className={styles.backButton} onClick={onBack}>Back</button>
        <button className={styles.nextButton} onClick={onSubmit}>Create Product</button>
      </div>
    </div>
  );
};

export default ReviewStep;
