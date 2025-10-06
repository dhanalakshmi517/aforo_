import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { isAuthenticated, getAuthData, clearAuthData } from '../../utils/auth';

type Product = {
  productId: string;
  productName: string;
  productType: string;
  billable?: boolean;
  status: string;
  category: string;
  createdOn?: string;
};

export const BASE_URL = 'http://54.238.204.246:8080/api';

export interface BillableMetric {
  unitOfMeasure: string;
  aggregationFunction: string;
  aggregationWindow: string;
  // Optional fields for when we connect to the real API
  billableMetricId?: string;
  metricName?: string;
  productId?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductPayload {
  productName: string;
  version: string;
  internalSkuCode: string;
  productDescription: string;
}


interface ApiErrorResponse {
  message?: string;
  [key: string]: any;
}

function handleApiResponse<T>(response: AxiosResponse<T>): T {
  return response.data;
}

function handleApiError(error: unknown): never {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    const { response, message } = error;

    if (response?.status === 401) {
      clearAuthData();
      window.location.href = '/login?session_expired=true';
      throw new Error('Session expired. Please login again.');
    }

    console.error('API Error Response:', {
      status: response?.status,
      statusText: response?.statusText,
      data: response?.data,
      headers: response?.headers,
    });

    const errorMessage =
      response?.data?.message || message || 'API request failed';
    throw new Error(errorMessage);
  }

  if (error instanceof Error) {
    console.error('Error details:', error);
    throw error;
  }

  console.error('Unknown error occurred:', error);
  throw new Error('An unknown error occurred');
}

const createApiClient = (): AxiosInstance => {
  const api = axios.create({
    baseURL: BASE_URL,
    headers: {
      Accept: 'application/json',
    },
  });

  api.interceptors.request.use(
    (config) => {
      const authData = getAuthData();
      if (authData?.token) {
        config.headers.Authorization = `Bearer ${authData.token}`;
      }

      if (config.data instanceof FormData) {
        config.headers['Content-Type'] = 'multipart/form-data';
      } else {
        config.headers['Content-Type'] = 'application/json';
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        clearAuthData();
        window.location.href = '/login?session_expired=true';
      }
      return Promise.reject(error);
    }
  );

  return api;
};

const verifyAuth = () => {
  if (!isAuthenticated()) {
    clearAuthData();
    window.location.href = '/login?session_expired=true';
    throw new Error('Not authenticated');
  }
};

/**
 * Fetch all products
 */
// Product list with auth (for uniqueness validation)
export const listAllProducts = async (): Promise<Product[]> => {
  try {
    verifyAuth();
    const api = createApiClient();
    const response = await api.get<Product[]>('/products');
    return handleApiResponse(response);
  } catch (error) {
    console.error('listAllProducts error', error);
    return handleApiError(error);
  }
};

export const getProducts = async (): Promise<Product[]> => {
  verifyAuth();
  try {
    const api = createApiClient();
    const response = await api.get<Product[]>('/products');
    return handleApiResponse(response);
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Create a new product
 * API Endpoint: POST /products
 * Headers: 
 *   - Content-Type: multipart/form-data
 *   - X-Organization-Id: {organizationId}
 *   - Authorization: Bearer {token}
 */
export const createProduct = async (payload: ProductPayload & { status?: string }): Promise<Product> => {
  try {
    verifyAuth();
    const authData = getAuthData();
    
    // Create a clean payload with only non-empty values
    const cleanPayload: Record<string, string> = {};
    
    // Only include fields that have values
    if (payload.productName?.trim()) cleanPayload.productName = payload.productName.trim();
    if (payload.version?.trim()) cleanPayload.version = payload.version.trim();
    if (payload.internalSkuCode?.trim()) cleanPayload.internalSkuCode = payload.internalSkuCode.trim();
    if (payload.productDescription?.trim()) cleanPayload.productDescription = payload.productDescription.trim();
    
    // Only add status if it's explicitly provided
    if (payload.status) {
      cleanPayload.status = payload.status;
    }

    if (Object.keys(cleanPayload).length === 0) {
      throw new Error('No valid fields provided for product creation');
    }

    console.log('Request Payload:', cleanPayload);
    
    const api = createApiClient();
    
    // Try JSON first - simpler approach that might avoid transaction issues
    const headers = {
      'Content-Type': 'application/json',
      'X-Organization-Id': authData?.organizationId?.toString() || ''
    };
    
    console.log('Sending JSON request...');
    const startTime = performance.now();
    
    let response;
    try {
      // Try JSON first
      response = await api.post<Product>('/products', cleanPayload, { headers });
    } catch (jsonError) {
      console.log('JSON request failed, trying multipart/form-data...');
      
      // Fallback to multipart/form-data if JSON fails
      const formData = new FormData();
      const jsonPayload = JSON.stringify(cleanPayload);
      const blob = new Blob([jsonPayload], { type: 'application/json' });
      formData.append('request', blob);
      
      const formHeaders = {
        'X-Organization-Id': authData?.organizationId?.toString() || ''
        // Don't set Content-Type here - let the browser set it with the correct boundary
      };
      
      response = await api.post<Product>('/products', formData, {
        headers: formHeaders,
        transformRequest: [(data) => data] // Prevent axios from transforming the form data
      });
    }
    
    const endTime = performance.now();
    console.log(`Request completed in ${(endTime - startTime).toFixed(2)}ms`);
    console.log('Response Status:', response.status, response.statusText);
    console.log('Response Data:', response.data);
    
    const result = handleApiResponse(response);
    console.log('Created Product ID:', result.productId);
    
    return result;
  } catch (error) {
    console.error('Error creating product:', error);
    if (axios.isAxiosError(error)) {
      console.error('Error Response:', error.response?.data);
      console.error('Status Code:', error.response?.status);
      
      // Provide more specific error messages for common issues
      if (error.response?.status === 500) {
        const errorData = error.response?.data;
        if (errorData?.details?.includes('JPA EntityManager')) {
          throw new Error('Database connection error. Please try again in a moment.');
        } else if (errorData?.error === 'Unexpected error occurred') {
          throw new Error('Server error occurred. Please check your input data and try again.');
        }
      }
    }
    return handleApiError(error);
  }
}

export const updateProduct = async (productId: string, payload: Partial<ProductPayload>): Promise<Product> => {
  console.log(`Updating product ${productId} with:`, payload);
  
  const authData = getAuthData();
  
  // Clean the payload to remove undefined or empty strings
  const cleanPayload: Record<string, any> = {};
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      cleanPayload[key] = typeof value === 'string' ? value.trim() : value;
    }
  });
  
  // If no valid fields to update, throw an error
  if (Object.keys(cleanPayload).length === 0) {
    throw new Error('No valid fields to update');
  }
  
  // For PATCH requests, send as raw JSON instead of form-data
  console.log(`Sending PATCH to /products/${productId} with:`, cleanPayload);
  
  const api = createApiClient();
  
  try {
    const response = await api.patch<Product>(`/products/${productId}`, cleanPayload, { 
      headers: {
        'Content-Type': 'application/json',
        'X-Organization-Id': authData?.organizationId?.toString() || ''
      }
    });
    
    console.log('Product updated successfully');
    return handleApiResponse(response);
  } catch (error) {
    console.error(`Error updating product ${productId}:`, error);
    if (axios.isAxiosError(error)) {
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data,
          headers: error.config?.headers
        }
      });
    }
    return handleApiError(error);
  }
};

/**
 * Delete a product by ID
 */
/**
 * Payload for API ingestion configuration
 */
export interface ApiIngestionPayload {
  endpointUrl: string;
  authType: 'NONE' | 'BASIC' | 'TOKEN';
}

/**
 * Payload for Flat-file ingestion configuration
 */
export interface FlatfileIngestionPayload {
  format: 'CSV' | 'JSON' | 'XML';
  fileLocation: string;
}

/**
 * Create API ingestion configuration for a product
 */
export const createProductApiConfig = async (
  productId: number | string,
  payload: ApiIngestionPayload
): Promise<void> => {
  verifyAuth();
  try {
    const api = createApiClient();
    await api.post(`/products/${productId}/api`, payload);
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Create Flat-file ingestion configuration for a product
 */
export const createProductFlatfileConfig = async (
  productId: number | string,
  payload: FlatfileIngestionPayload
): Promise<void> => {
  verifyAuth();
  try {
    const api = createApiClient();
    await api.post(`/products/${productId}/flatfile`, payload);
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Upload or replace a product icon (PATCH /products/{id}/icon)
 */
export const uploadProductIcon = async (productId: string | number, file: File): Promise<void> => {
  verifyAuth();
  const api = createApiClient();
  const fd = new FormData();
  fd.append('icon', file, file.name);
  try {
    await api.patch(`/products/${productId}/icon`, fd, {
      headers: {
        // let axios set multipart boundary
      }
    });
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Delete product icon (DELETE /products/{id}/icon)
 */
export const deleteProductIcon = async (productId: string | number): Promise<void> => {
  verifyAuth();
  const api = createApiClient();
  try {
    await api.delete(`/products/${productId}/icon`);
  } catch (e) {
    return handleApiError(e);
  }
};

export const deleteProduct = async (
  productId: number | string
): Promise<void> => {
  verifyAuth();
  try {
    const api = createApiClient();
    await api.delete(`/products/${productId}`);
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Finalize a product by ID
 */
export const saveProductConfiguration = async (
  productId: string,
  productType: string,
  configData: Record<string, any>,
  isUpdate: boolean = false
): Promise<any> => {
  console.log('saveProductConfiguration called with:', {
    productId,
    productType,
    configData: JSON.parse(JSON.stringify(configData)), // Ensure we log the actual data
    isUpdate
  });
  try {
    const api = createApiClient();
    const normalizedType = productType.toLowerCase();
    
    // We'll use the provided isUpdate flag to determine the operation
    const isUpdateOperation = isUpdate;
    
    // Only include fields that are explicitly set by the user
    const createPayload = (data: Record<string, any>): Record<string, any> => {
      if (!data || typeof data !== 'object') {
        return data;
      }

      const result: Record<string, any> = {};
      
      // Only include fields that are explicitly set (not null/undefined/empty)
      for (const [key, value] of Object.entries(data)) {
        // Skip null, undefined, empty strings, empty objects, and empty arrays
        if (value === null || 
            value === undefined || 
            value === '' ||
            (typeof value === 'object' && Object.keys(value).length === 0) ||
            (Array.isArray(value) && value.length === 0)) {
          continue;
        }
        
        // Handle nested objects
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          const nested = createPayload(value);
          // Only add if the nested object has properties
          if (Object.keys(nested).length > 0) {
            result[key] = nested;
          }
        } 
        // Handle arrays - only include if not empty after filtering
        else if (Array.isArray(value)) {
          const filteredArray = value.filter(item => 
            item !== null && 
            item !== undefined && 
            item !== '' &&
            !(typeof item === 'object' && Object.keys(item).length === 0)
          );
          if (filteredArray.length > 0) {
            result[key] = filteredArray;
          }
        } 
        // Include booleans and numbers regardless of value
        else if (typeof value === 'boolean' || typeof value === 'number') {
          result[key] = value;
        } 
        // Only include non-empty strings
        else if (typeof value === 'string' && value.trim() !== '') {
          result[key] = value.trim();
        }
      }
      
      return result;
    };
    
    // Create the base payload
    let payload = createPayload(configData);
    
    // Determine the operation type based on the isUpdate flag
    const operationType = isUpdate ? 'update' : 'create';
    
    // Get the API endpoint based on the product type
    const getApiEndpoint = (type: string): string => {
      switch(type) {
        case 'api': return `/products/${productId}/api`;
        case 'sqlresult':
        case 'sql-result': return `/products/${productId}/sql-result`; // Updated to use sql-result
        case 'llmtoken':
        case 'llm-token': return `/products/${productId}/llm-token`;
        case 'flatfile': return `/products/${productId}/flatfile`;
        default: return `/products/${productId}/config`;
      }
    };
    
    const apiEndpoint = getApiEndpoint(normalizedType);
    
    switch(normalizedType) {
      case 'api':
        // Only include fields that are explicitly set by the user
        const apiPayload: Record<string, any> = {};
        
        // Only add endpointUrl if it's not empty
        if (configData.endpointUrl?.trim()) {
          apiPayload.endpointUrl = configData.endpointUrl.trim();
        }
        
        // Only add authType if it's explicitly set and not empty
        if (configData.authType && configData.authType !== 'NONE') {
          apiPayload.authType = configData.authType;
          
          // Only add auth-specific fields if they have values
          if (configData.authType === 'BASIC') {
            if (configData.username?.trim()) apiPayload.username = configData.username.trim();
            if (configData.password?.trim()) apiPayload.password = configData.password;
          } else if (configData.authType === 'TOKEN' && configData.token?.trim()) {
            apiPayload.token = configData.token.trim();
          }
        }
        
        // Only include the payload if it has any properties
        if (Object.keys(apiPayload).length > 0) {
          payload = apiPayload;
        } else {
          // If no fields are set, return an empty object to avoid sending null/undefined
          payload = {};
        }
        break;
        
      case 'flatfile': {
        const flatfilePayload: Record<string, any> = {};
        // Only include format and fileLocation as required by backend
        if (configData.format) flatfilePayload.format = configData.format;
        if (configData.fileLocation) flatfilePayload.fileLocation = configData.fileLocation;
        payload = flatfilePayload;
        break;
      }
        
      case 'sqlresult':
      case 'sql-result': {
        // Only include required fields with defaults
        payload = {
          connectionString: configData.connectionString || '',
          dbType: configData.dbType || 'MYSQL',
          authType: configData.authType || 'NONE'
        };
        console.log('SQL Result payload:', payload);
        break;
      }
        
      case 'llmtoken':
      case 'llm-token': {
        const llmPayload: Record<string, any> = {};
        if (configData.modelName) llmPayload.modelName = configData.modelName;
        if (configData.endpointUrl) llmPayload.endpointUrl = configData.endpointUrl;
        if (configData.authType) llmPayload.authType = configData.authType;
        
        if (configData.authType === 'API_KEY' && configData.apiKey) {
          llmPayload.apiKey = configData.apiKey;
        } else if (configData.authType === 'OAUTH2' && configData.oauthConfig) {
          llmPayload.oauthConfig = configData.oauthConfig;
        }
        
        if (configData.maxTokens !== undefined) llmPayload.maxTokens = configData.maxTokens;
        if (configData.temperature !== undefined) llmPayload.temperature = configData.temperature;
        
        payload = llmPayload;
        break;
      }
        
      default:
        // For other types, just pass through the config data
        payload = { ...configData };
    }
    
    // Helper function to clean payload of null/undefined values
    const cleanPayload = <T extends Record<string, any>>(obj: T): Partial<T> => {
      if (obj === null || obj === undefined) {
        return {};
      }
      
      return Object.entries(obj).reduce((acc, [key, value]) => {
        // Skip null/undefined values
        if (value === null || value === undefined) {
          return acc;
        }
        
        // Handle nested objects
        if (typeof value === 'object' && !Array.isArray(value)) {
          const cleaned = cleanPayload(value);
          if (Object.keys(cleaned).length > 0) {
            (acc as any)[key] = cleaned;
          }
        } 
        // Handle arrays
        else if (Array.isArray(value)) {
          const cleanedArray = value
            .map(item => typeof item === 'object' && item !== null ? cleanPayload(item) : item)
            .filter(item => item !== undefined && item !== null && item !== '');
          
          if (cleanedArray.length > 0) {
            (acc as any)[key] = cleanedArray;
          }
        }
        // Handle primitive values
        else if (value !== '') {
          (acc as any)[key] = value;
        }
        
        return acc;
      }, {} as Partial<T>);
    };

    // Clean the payload without adding productType to the final payload
    // Clean the payload before sending
    const cleanedPayload = cleanPayload(payload);

    console.log(`Saving ${operationType} configuration for product ${productId} (${productType}) to ${apiEndpoint}:`, cleanedPayload);

    try {
      console.log(`Sending ${operationType === 'update' ? 'PUT' : 'POST'} request to:`, {
        url: apiEndpoint,
        method: operationType === 'update' ? 'PUT' : 'POST',
        payload: cleanedPayload,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthData()?.token}`
        }
      });

      let response;
      if (operationType === 'update') {
        console.log('Using PUT for update with payload:', cleanedPayload);
        response = await api.put(apiEndpoint, cleanedPayload, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
      } else {
        console.log('Using POST for create with payload:', cleanedPayload);
        response = await api.post(apiEndpoint, cleanedPayload);
      }
      
      console.log(`${operationType === 'update' ? 'Updated (PUT)' : 'Created (POST)'} configuration successfully:`, response.data);
      return response.data;
    } catch (error: any) {
      console.error('Full error object:', JSON.stringify(error, null, 2));
      
      const errorMessage = error?.message || 'Unknown error occurred';
      const errorData = error?.response?.data;
      const status = error?.response?.status;
      const statusText = error?.response?.statusText;
      
      console.error('Error details:', {
        method: operationType === 'update' ? 'PUT' : 'POST',
        url: apiEndpoint,
        status,
        statusText,
        requestPayload: cleanedPayload,
        errorResponse: errorData,
        errorMessage
      });
      
      // Re-throw with a more descriptive error
      throw new Error(`Failed to save ${productType} configuration: ${errorMessage}`);
    }
  } catch (error) {
    console.error('Error saving product configuration:', error);
    throw error;
  }
};

export const finalizeProduct = async (
  productId: string
): Promise<{ success: boolean; message: string }> => {
  verifyAuth();
  try {
    const authData = getAuthData();
    if (!authData?.token) {
      throw new Error('No authentication token found. Please log in again.');
    }

    console.group('Finalizing Product - API Request');
    console.log('API Endpoint:', `${BASE_URL}/products/${productId}/finalize`);
    
    const api = createApiClient();
    
    // Add a small delay to avoid potential transaction conflicts
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const response = await api.post(`/products/${productId}/finalize`, {}, {
      headers: {
        'X-Organization-Id': authData?.organizationId?.toString() || ''
      }
    });
    
    console.log('Response Status:', response.status, response.statusText);
    console.log('Response Data:', response.data);
    console.groupEnd();
    
    return {
      success: true,
      message: 'Product finalized successfully'
    };
  } catch (error) {
    console.error('Error finalizing product:', error);
    if (axios.isAxiosError(error)) {
      console.error('Error Response:', error.response?.data);
      console.error('Status Code:', error.response?.status);
      
      // Provide more specific error messages for database issues
      if (error.response?.status === 500) {
        const errorData = error.response?.data;
        if (errorData?.details?.includes('JPA EntityManager')) {
          throw new Error('Database connection error during finalization. Please try again in a moment.');
        } else if (errorData?.error === 'Unexpected error occurred') {
          throw new Error('Server error during product finalization. Please ensure all product data is valid and try again.');
        }
      }
    }
    console.groupEnd();
    return handleApiError(error);
  }
};

// Mock data for billable metrics since the endpoint is not available
const mockBillableMetrics: BillableMetric[] = [
  {
    unitOfMeasure: 'API Call',
    aggregationFunction: 'COUNT',
    aggregationWindow: 'PER_EVENT'
  },
  {
    unitOfMeasure: 'Records',
    aggregationFunction: 'SUM',
    aggregationWindow: 'PER_DAY'
  }
];

export const getBillableMetrics = async (productId: string): Promise<BillableMetric[]> => {
  try {
    const api = createApiClient();
    const response = await api.get<BillableMetric[]>(`/billable-metrics/by-product?productId=${productId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching billable metrics for product ${productId}:`, error);
    // Return empty list so UI shows '-' when no metrics
    return [];
  }
};
