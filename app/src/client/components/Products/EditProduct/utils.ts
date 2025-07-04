import { FormData, ProductType, Tag, ConfigurationData } from './types';

export const getTagsObject = (tags?: { [key: string]: string }): { [key: string]: string } => {
  return tags || {};
};

export const ensureStringTags = (tags: any): { [key: string]: string } => {
  if (!tags) return {};
  if (typeof tags === 'object' && !Array.isArray(tags)) {
    return Object.entries(tags).reduce((acc, [key, value]) => ({
      ...acc,
      [key]: String(value)
    }), {});
  }
  return {};
};

export const getTagsArray = (tagsObj: { [key: string]: string }): { key: string; value: string }[] => {
  return Object.entries(tagsObj).map(([key, value]) => ({ key, value }));
};

export const normalizeProductType = (type: string): ProductType => {
  if (!type) return '' as ProductType;
  return type.toLowerCase() === 'sqlresult' ? 'sql-result' as ProductType :
    type.toLowerCase() === 'llmtoken' ? 'llm-token' as ProductType :
      type.toLowerCase() as ProductType;
};

export const getInitialConfig = (type: ProductType): ConfigurationData => {
  switch (type) {
    case ProductType.API:
      return {
        endpointUrl: '',
        authType: '',
        payloadSizeMetric: '',
        rateLimitPolicy: '',
        meteringGranularity: '',
        grouping: '',
        latencyClass: '',
        cachingFlag: false
      };
    case ProductType.FLATFILE:
      return {
        size: '',
        format: '',
        deliveryFrequency: '',
        accessMethod: '',
        compressionFormat: '',
        fileNamingConvention: '',
        retentionPolicy: ''
      };
    case ProductType.SQLRESULT:
      return {
        queryTemplate: '',
        dbType: '',
        freshness: '',
        executionFrequency: '',
        joinComplexity: '',
        expectedRowRange: '',
        resultSize: '',
        cached: false
      };
    case ProductType.LLMTOKEN:
      return {
        tokenProvider: '',
        modelName: '',
        tokenUnitCost: '',
        calculationMethod: '',
        quota: '',
        inferencePriority: '',
        computeTier: '',
        promptTemplate: ''
      };
    case ProductType.FLATFILE:
      return {
        size: '',
        format: '',
        deliveryFrequency: '',
        accessMethod: '',
        compressionFormat: '',
        fileNamingConvention: '',
        retentionPolicy: ''
      };
    default:
      return {
        size: '',
        format: '',
        deliveryFrequency: '',
        accessMethod: '',
        compressionFormat: '',
        fileNamingConvention: '',
        retentionPolicy: ''
      };
  }
};

export const handleAddTag = (setFormData: React.Dispatch<React.SetStateAction<FormData>>, 
  tagKey: string, tagValue: string, setTagKey: React.Dispatch<React.SetStateAction<string>>, 
  setTagValue: React.Dispatch<React.SetStateAction<string>>) => {
  setFormData(prev => ({
    ...prev,
    tags: { ...prev.tags, [tagKey]: tagValue }
  }));
  setTagKey('');
  setTagValue('');
};

export const handleRemoveTag = (setFormData: React.Dispatch<React.SetStateAction<FormData>>, 
  keyToRemove: string) => {
  setFormData(prev => ({
    ...prev,
    tags: Object.entries(prev.tags)
      .filter(([key]) => key !== keyToRemove)
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
  }));
};
