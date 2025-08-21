export interface ProductFormData {
  productName: string;
  productType: string;
  version: string;
  productDescription: string;
  category: string;
  visibility: boolean;
  status: string;
  internalSkuCode: string;
  uom: string;
  effectiveStartDate?: string;
  effectiveEndDate?: string;
  billable: boolean;
  auditLogId?: string;
  linkedRatePlans: string[];
  tags: { key: string; value: string }[];
  labels: Record<string, string>;
  
  // API specific
  endpointUrl?: string;
  authType?: string;
  payloadMetric?: string;
  rateLimitPolicy?: string;
  granularity?: string;
  grouping?: string;
  caching?: boolean;
  latencyClass?: string;
  
  // FlatFile specific
  size?: string;
  format?: string;
  compression?: string;
  encoding?: string;
  schema?: string;
  deliveryFrequency?: string;
  accessMethod?: string;
  retentionPolicy?: string;
  fileNamingConvention?: string;
  
  // SQLResult specific
  queryTemplate?: string;
  dbType?: string;
  freshness?: string;
  executionFrequency?: string;
  expectedRowRange?: string;
  joinComplexity?: string;
  resultSize?: string;
  cached?: boolean;
  
  // LLMToken specific
  tokenProvider?: string;
  modelName?: string;
  tokenUnitCost?: string;
  calculationMethod?: string;
  quota?: string;
  promptTemplate?: string;
  inferencePriority?: string;
  computeTier?: string;
}

export const productTypes = [
  { value: 'API', label: 'API', key: 'API' },
  { value: 'FlatFile', label: 'FlatFile', key: 'FlatFile' },
  { value: 'SQLResult', label: 'SQLResult', key: 'SQLResult' },
  { value: 'LLMToken', label: 'LLMToken', key: 'LLMToken' },
];

export const enums = {
  formats: ['JSON', 'CSV', 'XML', 'PARQUET'],
  accessMethods: ['FTP', 'S3', 'EMAIL', 'API'],
  compressionFormats: ['NONE', 'GZIP', 'ZIP'],
  deliveryFrequencies: ['DAILY', 'WEEKLY', 'MONTHLY']
};
