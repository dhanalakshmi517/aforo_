import { FormData, ProductType } from './types';
import { normalizeProductType } from './utils';

const API_BASE_URL = 'http://13.230.194.245:8080/api/products';

export const fetchProductData = async (
  productId: string,
  productType: ProductType
): Promise<FormData> => {
  try {
    // Fetch general and metadata from main endpoint
    const generalResponse = await fetch(`${API_BASE_URL}/${productId}`);
    if (!generalResponse.ok) throw new Error('Failed to fetch product data');
    const generalData = await generalResponse.json();

    // Fetch configuration from product type specific endpoint
    const normalizedType = normalizeProductType(productType);
    const configResponse = await fetch(`${API_BASE_URL}/${productId}/${normalizedType}`);
    if (!configResponse.ok) throw new Error('Failed to fetch configuration data');
    const configData = await configResponse.json();

    // Debug logs to check API responses
    console.log('General Data Response:', generalData);
    console.log('Config Data Response:', configData);

    // Map API response fields to FormData structure
    const mappedData: FormData = {
      productName: generalData.productName,
      productType: generalData.productType || ProductType.API,
      version: generalData.version || '1.0',
      description: generalData.description,
      tags: generalData.tags || {},
      category: generalData.category || 'INTERNAL',
      visibility: generalData.visibility,
      status: generalData.status || 'DRAFT',
      internalSkuCode: generalData.internalSkuCode,
      uom: generalData.uom,
      effectiveStartDate: generalData.effectiveStartDate,
      effectiveEndDate: generalData.effectiveEndDate,
      billable: generalData.billable,
      linkedRatePlans: generalData.linkedRatePlans || [],
      labels: generalData.labels || {},
      auditLogId: generalData.auditLogId,
      configuration: {
        productType: productType,
        ...configData,
        ...(productType === ProductType.API ? {
          endpointUrl: configData.endpointUrl || '',
          authType: configData.authType || '',
          payloadSizeMetric: configData.payloadSizeMetric || '',
          rateLimitPolicy: configData.rateLimitPolicy || '',
          meteringGranularity: configData.meteringGranularity || '',
          grouping: configData.grouping || '',
          latencyClass: configData.latencyClass || '',
          cachingFlag: configData.cachingFlag || false
        } : {}),
        ...(productType === ProductType.FLATFILE ? {
          size: configData.size || '',
          format: configData.format || '',
          deliveryFrequency: configData.deliveryFrequency || '',
          accessMethod: configData.accessMethod || '',
          compressionFormat: configData.compressionFormat || '',
          fileNamingConvention: configData.fileNamingConvention || '',
          retentionPolicy: configData.retentionPolicy || ''
        } : {}),
        ...(productType === ProductType.SQLRESULT ? {
          queryTemplate: configData.queryTemplate || '',
          dbType: configData.dbType || '',
          freshness: configData.freshness || '',
          executionFrequency: configData.executionFrequency || '',
          joinComplexity: configData.joinComplexity || '',
          expectedRowRange: configData.expectedRowRange || '',
          resultSize: configData.resultSize || '',
          cached: configData.cached || false
        } : {}),
        ...(productType === ProductType.LLMTOKEN ? {
          tokenProvider: configData.tokenProvider || '',
          modelName: configData.modelName || '',
          tokenUnitCost: configData.tokenUnitCost || '',
          calculationMethod: configData.calculationMethod || '',
          quota: configData.quota || '',
          inferencePriority: configData.inferencePriority || '',
          computeTier: configData.computeTier || '',
          promptTemplate: configData.promptTemplate || ''
        } : {})
      }
    };

    return mappedData;
  } catch (error) {
    console.error('Error fetching product data:', error);
    throw error;
  }
};

export const saveProductChanges = async (productId: string, data: FormData): Promise<FormData> => {
  try {
    const response = await fetch(`${API_BASE_URL}/${productId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`Failed to save changes: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error saving product changes:', error);
    throw error;
  }
};

export const updateProduct = async (
  productId: string,
  formDataToUpdate: Partial<FormData>
): Promise<FormData> => {
  try {
    if (!productId) throw new Error('Product ID is required');

    const dataToSend: FormData = {
      productName: formDataToUpdate.productName || '',
      productType: formDataToUpdate.productType || ProductType.API,
      version: formDataToUpdate.version || '1.0',
      description: formDataToUpdate.description || '',
      tags: formDataToUpdate.tags || {},
      category: formDataToUpdate.category || 'INTERNAL',
      visibility: formDataToUpdate.visibility ?? true,
      status: formDataToUpdate.status || 'DRAFT',
      internalSkuCode: formDataToUpdate.internalSkuCode || '',
      uom: formDataToUpdate.uom || '',
      effectiveStartDate: formDataToUpdate.effectiveStartDate || new Date().toISOString(),
      effectiveEndDate: formDataToUpdate.effectiveEndDate || new Date().toISOString(),
      billable: formDataToUpdate.billable ?? true,
      linkedRatePlans: formDataToUpdate.linkedRatePlans || [],
      labels: formDataToUpdate.labels || {},
      auditLogId: formDataToUpdate.auditLogId || 0,
      configuration: formDataToUpdate.configuration
    };

    const generalResponse = await fetch(`${API_BASE_URL}/${productId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dataToSend)
    });

    if (!generalResponse.ok) {
      const error = await generalResponse.text();
      throw new Error(`General update failed: ${generalResponse.status} ${error}`);
    }

    const updatedProduct = await generalResponse.json();

    // If configuration data exists, update it too
    if (formDataToUpdate.configuration) {
      const normalizedType = normalizeProductType(dataToSend.productType);
      const configResponse = await fetch(`${API_BASE_URL}/${productId}/${normalizedType}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formDataToUpdate.configuration)
      });

      if (!configResponse.ok) {
        const error = await configResponse.text();
        throw new Error(`Configuration update failed: ${configResponse.status} ${error}`);
      }
    }

    return updatedProduct;
  } catch (error) {
    console.error('Update product error:', error);
    throw error instanceof Error ? error : new Error('Failed to update product');
  }
};
