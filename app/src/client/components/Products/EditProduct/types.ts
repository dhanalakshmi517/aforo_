export enum ProductType {
  API = 'api',
  FLATFILE = 'flatfile',
  SQLRESULT = 'sqlresult',
  LLMTOKEN = 'llmtoken'
}

export interface GeneralFormData {
  productName: string;
  productType: ProductType;
  description: string;
  status: string;
  category: string;
  version: string;
  visibility: boolean;
  tags: { [key: string]: string };
}

export interface MetadataForm {
  internalSkuCode: string;
  uom: string;
  effectiveStartDate: string;
  effectiveEndDate: string;
  billable: boolean;
  linkedRatePlans: string[];
  auditLogId: number | string;
  labels: { [key: string]: string };
}

export interface ConfigurationData {
  billingPeriod?: string;
  trialPeriod?: string;
  gracePeriod?: string;
  setupFee?: string;
  recurringFee?: string;
  currency?: string;
  endpointUrl?: string;
  authType?: string;
  payloadSizeMetric?: string;
  rateLimitPolicy?: string;
  meteringGranularity?: string;
  grouping?: string;
  latencyClass?: string;
  cachingFlag?: boolean;
  size?: string;
  format?: string;
  deliveryFrequency?: string;
  accessMethod?: string;
  compressionFormat?: string;
  fileNamingConvention?: string;
  method?: string; // HTTP method for API product type
  retentionPolicy?: string;
  queryTemplate?: string;
  dbType?: string;
  freshness?: string;
  executionFrequency?: string;
  joinComplexity?: string;
  expectedRowRange?: string;
  resultSize?: string;
  cached?: boolean;
  tokenProvider?: string;
  modelName?: string;
  tokenUnitCost?: string;
  calculationMethod?: string;
  quota?: string;
  inferencePriority?: string;
  computeTier?: string;
  promptTemplate?: string;
}

export interface ConfigurationFormProps {
  data: ConfigurationData;
  productType: ProductType;
  onChange: (newConfig: Partial<ConfigurationData>) => void;
  loading: boolean;
}

export interface FormData {
  productName: string;
  productType: ProductType;
  version: string;
  description: string;
  tags: { [key: string]: string };
  category: string;
  visibility: boolean;
  status: string;
  internalSkuCode: string;
  uom: string;
  effectiveStartDate: string;
  effectiveEndDate: string;
  billable: boolean;
  linkedRatePlans: string[];
  labels: { [key: string]: string };
  auditLogId: number;
  configuration?: ConfigurationData;
}

export interface EditProductFormProps {
  productId: string;
  productType: ProductType;
  onClose: () => void;
  onSave: () => void;
  showEditForm: boolean;
  productName: string;
}

export interface Tag {
  key: string;
  value: string;
}

export type TagArray = Tag[];

export enum Category {
  INTERNAL = 'INTERNAL',
  EXTERNAL = 'EXTERNAL',
  PARTNER = 'PARTNER'
}

export enum Status {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DEPRECATED = 'DEPRECATED'
}

export const normalizeProductType = (type: string): ProductType => {
  if (!type) return ProductType.API;
  
  // Handle both lowercase and uppercase versions
  const normalizedType = type.toLowerCase();
  switch (normalizedType) {
    case 'api':
      return ProductType.API;
    case 'flatfile':
      return ProductType.FLATFILE;
    case 'sqlresult':
      return ProductType.SQLRESULT;
    case 'llmtoken':
      return ProductType.LLMTOKEN;
    default:
      return ProductType.API;
  }
};

export interface MetaDataFormProps {
  metadata: MetadataForm;
  updateFormData: (section: keyof FormData, field: keyof any, value: any) => void;
  loading: boolean;
}