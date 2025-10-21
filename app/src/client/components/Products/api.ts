import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { isAuthenticated, getAuthData, clearAuthData } from '../../utils/auth';

export type Product = {
  productId: string;
  productName: string;
  productType: string;
  billable?: boolean;
  status: string;
  category: string;
  createdOn?: string;
  icon?: string; // backend may return "/uploads/icons/<file>.svg" or "api/uploads/..."
  productIcon?: string; // JSON string containing structured icon data
};

export const BASE_URL = 'http://54.238.204.246:8080/api';
// Useful if you ever need to build absolute URLs without doubling "/api"
export const API_ORIGIN = BASE_URL.replace(/\/api\/?$/, '');

export interface BillableMetric {
  unitOfMeasure: string;
  aggregationFunction: string;
  aggregationWindow: string;
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
  /** Structured icon data (legacy) */
  productIcon?: string;
  /** Primary icon field used by backend */
  icon?: string;
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
      headers: response?.headers
    });

    const errorMessage = response?.data?.message || message || 'API request failed';
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
      Accept: 'application/json'
    }
  });

  api.interceptors.request.use(
    (config) => {
      const authData = getAuthData();
      if (authData?.token) {
        config.headers.Authorization = `Bearer ${authData.token}`;
      }
      // Attach Content-Type smartly
      if (config.data instanceof FormData) {
        (config.headers as any)['Content-Type'] = 'multipart/form-data';
      } else {
        (config.headers as any)['Content-Type'] = 'application/json';
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

export const createProduct = async (
  payload: ProductPayload & { status?: string }
): Promise<Product> => {
  try {
    verifyAuth();
    const authData = getAuthData();

    const formData = new FormData();
    const requestPayload: Record<string, string> = {};

    if (payload.productName?.trim()) requestPayload.productName = payload.productName.trim();
    if (payload.version?.trim()) requestPayload.version = payload.version.trim();
    if (payload.internalSkuCode?.trim())
      requestPayload.internalSkuCode = payload.internalSkuCode.trim();
    if (payload.productDescription?.trim())
      requestPayload.productDescription = payload.productDescription.trim();
    if (payload.status) requestPayload.status = payload.status;
    if (payload.productIcon) {
      console.log('📤 Adding productIcon to request payload:', payload.productIcon);
      requestPayload.productIcon = payload.productIcon;
    }

    // Remove productIcon from request payload to send it separately
    const { productIcon, ...requestWithoutIcon } = requestPayload;
    
    const requestJson = JSON.stringify(requestWithoutIcon);
    console.log('📤 createProduct requestPayload (without icon):', requestWithoutIcon);
    console.log('📤 createProduct requestJson:', requestJson);
    formData.append('request', requestJson);
    
    // Add productIcon as a separate FormData field if it exists
    if (productIcon) {
      console.log('📤 Adding productIcon as separate FormData field');
      formData.append('productIcon', productIcon);
    }

    if (payload.productIcon) {
      try {
        const iconData =
          typeof payload.productIcon === 'string'
            ? JSON.parse(payload.productIcon)
            : payload.productIcon;

        // Use the SVG content exactly as provided - no modifications
        let svgContent: string;
        
        if (iconData.svgContent) {
          // Use the original SVG content as-is
          svgContent = iconData.svgContent;
        } else if (iconData.svgPath) {
          // Create a simple SVG from the path - no extra styling or frames
          svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="${
            iconData.viewBox || '0 0 24 24'
          }" fill="none"><path d="${iconData.svgPath}" fill="currentColor"/></svg>`;
        } else {
          throw new Error('Invalid icon data: missing svgContent or svgPath');
        }

        const svgBlob = new Blob([svgContent], { type: 'image/svg+xml' });
        formData.append('icon', svgBlob, 'icon.svg');
      } catch (e) {
        console.error('Error processing icon:', e);
      }
    }

    const api = createApiClient();
    
    // Log the FormData contents for debugging
    console.log('📤 FormData contents:');
    for (const [key, value] of formData.entries()) {
      if (value instanceof Blob) {
        console.log(`  ${key}: [Blob] ${value.type} (${value.size} bytes)`);
      } else {
        console.log(`  ${key}:`, value);
      }
    }
    
    const response = await api.post<Product>('/products', formData, {
      headers: {
        // Some backends require org header during creation
        'X-Organization-Id': authData?.organizationId?.toString() || ''
      }
    });

    const result = handleApiResponse<Product>(response);
    console.log('📥 createProduct API response:', result);
    return result;
  } catch (error) {
    console.error('Error creating product:', error);
    if (axios.isAxiosError(error)) {
      console.error('Error Response:', error.response?.data);
      console.error('Status Code:', error.response?.status);
    }
    return handleApiError(error);
  }
};

export const updateProduct = async (
  productId: string,
  payload: Partial<ProductPayload>
): Promise<Product> => {
  const authData = getAuthData();

  const cleanPayload: Record<string, any> = {};
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      cleanPayload[key] = typeof value === 'string' ? value.trim() : value;
    }
  });

  console.log('🔄 updateProduct payload:', payload);
  console.log('🧹 updateProduct cleanPayload:', cleanPayload);

  if (Object.keys(cleanPayload).length === 0) {
    throw new Error('No valid fields to update');
  }

  const api = createApiClient();

  try {
    const response = await api.patch<Product>(`/products/${productId}`, cleanPayload, {
      headers: {
        'Content-Type': 'application/json',
        'X-Organization-Id': authData?.organizationId?.toString() || ''
      }
    });

    return handleApiResponse(response);
  } catch (error) {
    console.error(`Error updating product ${productId}:`, error);
    return handleApiError(error);
  }
};

export interface ApiIngestionPayload {
  endpointUrl: string;
  authType: 'NONE' | 'BASIC' | 'TOKEN';
}
export interface FlatfileIngestionPayload {
  format: 'CSV' | 'JSON' | 'XML';
  fileLocation: string;
}

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

export const uploadProductIcon = async (
  productId: string | number,
  file: File
): Promise<void> => {
  verifyAuth();
  const api = createApiClient();
  const fd = new FormData();
  fd.append('icon', file, file.name);
  try {
    await api.patch(`/products/${productId}/icon`, fd, {
      headers: {}
    });
  } catch (error) {
    return handleApiError(error);
  }
};

export const deleteProductIcon = async (productId: string | number): Promise<void> => {
  verifyAuth();
  const api = createApiClient();
  try {
    await api.delete(`/products/${productId}/icon`);
  } catch (e) {
    return handleApiError(e);
  }
};

export const deleteProduct = async (productId: number | string): Promise<void> => {
  verifyAuth();
  try {
    const api = createApiClient();
    await api.delete(`/products/${productId}`);
  } catch (error) {
    return handleApiError(error);
  }
};

export const getProductConfiguration = async (
  productId: string,
  productType: string
): Promise<Record<string, any>> => {
  try {
    const api = createApiClient();
    const normalizedType = (productType || '').toLowerCase();
    
    const getApiEndpoint = (type: string): string => {
      switch (type) {
        case 'api':
          return `/products/${productId}/api`;
        case 'sqlresult':
        case 'sql-result':
          return `/products/${productId}/sql-result`;
        case 'llmtoken':
        case 'llm-token':
          return `/products/${productId}/llm-token`;
        case 'flatfile':
          return `/products/${productId}/flatfile`;
        default:
          return `/products/${productId}/config`;
      }
    };

    const apiEndpoint = getApiEndpoint(normalizedType);
    console.log('Fetching configuration from:', apiEndpoint);
    
    const response = await api.get(apiEndpoint);
    console.log('Configuration fetched:', response.data);
    return response.data || {};
  } catch (error: any) {
    // If 404, configuration doesn't exist yet - return empty object
    if (error.response?.status === 404) {
      console.log('No configuration found for product, returning empty');
      return {};
    }
    console.error('Error fetching product configuration:', error);
    throw error;
  }
};

export const saveProductConfiguration = async (
  productId: string,
  productType: string,
  configData: Record<string, any>,
  isUpdate: boolean = false
): Promise<any> => {
  try {
    const api = createApiClient();
    const normalizedType = (productType || '').toLowerCase();
    const operationType = isUpdate ? 'update' : 'create';

    const createPayload = (data: Record<string, any>): Record<string, any> => {
      if (!data || typeof data !== 'object') return data;
      const result: Record<string, any> = {};
      for (const [key, value] of Object.entries(data)) {
        if (
          value === null ||
          value === undefined ||
          value === '' ||
          (typeof value === 'object' && Object.keys(value).length === 0) ||
          (Array.isArray(value) && value.length === 0)
        ) {
          continue;
        }
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          const nested = createPayload(value);
          if (Object.keys(nested).length > 0) result[key] = nested;
        } else if (Array.isArray(value)) {
          const filteredArray = value.filter(
            (item) =>
              item !== null &&
              item !== undefined &&
              item !== '' &&
              !(typeof item === 'object' && Object.keys(item).length === 0)
          );
          if (filteredArray.length > 0) result[key] = filteredArray;
        } else if (typeof value === 'boolean' || typeof value === 'number') {
          result[key] = value;
        } else if (typeof value === 'string' && value.trim() !== '') {
          result[key] = value.trim();
        }
      }
      return result;
    };

    let payload = createPayload(configData);

    const getApiEndpoint = (type: string): string => {
      switch (type) {
        case 'api':
          return `/products/${productId}/api`;
        case 'sqlresult':
        case 'sql-result':
          return `/products/${productId}/sql-result`;
        case 'llmtoken':
        case 'llm-token':
          return `/products/${productId}/llm-token`;
        case 'flatfile':
          return `/products/${productId}/flatfile`;
        default:
          return `/products/${productId}/config`;
      }
    };

    const apiEndpoint = getApiEndpoint(normalizedType);

    switch (normalizedType) {
      case 'api': {
        const apiPayload: Record<string, any> = {};
        if (configData.endpointUrl?.trim()) apiPayload.endpointUrl = configData.endpointUrl.trim();

        // Always send authType, even when it is "NONE" – backend requires explicit value
        if (configData.authType) {
          apiPayload.authType = configData.authType;

          // Only attach additional credentials for BASIC or TOKEN auth modes
          if (configData.authType === 'BASIC') {
            if (configData.username?.trim()) apiPayload.username = configData.username.trim();
            if (configData.password?.trim()) apiPayload.password = configData.password;
          } else if (configData.authType === 'TOKEN' && configData.token?.trim()) {
            apiPayload.token = configData.token.trim();
          }
        }

        // Ensure we send at least the authType; backend rejects empty object
        payload = apiPayload;
        break;
      }
      case 'flatfile': {
        const flatfilePayload: Record<string, any> = {};
        if (configData.format) flatfilePayload.format = configData.format;
        if (configData.fileLocation) flatfilePayload.fileLocation = configData.fileLocation;
        payload = flatfilePayload;
        break;
      }
      case 'sqlresult':
      case 'sql-result': {
        payload = {
          connectionString: configData.connectionString || '',
          dbType: configData.dbType || 'MYSQL',
          authType: configData.authType || 'NONE'
        };
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
        payload = { ...configData };
    }

    const cleanPayload = <T extends Record<string, any>>(obj: T): Partial<T> => {
      if (obj === null || obj === undefined) return {};
      return Object.entries(obj).reduce((acc, [key, value]) => {
        if (value === null || value === undefined) return acc;
        if (typeof value === 'object' && !Array.isArray(value)) {
          const cleaned = cleanPayload(value as Record<string, any>);
          if (Object.keys(cleaned).length > 0) (acc as any)[key] = cleaned;
        } else if (Array.isArray(value)) {
          const cleanedArray = (value as any[])
            .map((item) => (typeof item === 'object' && item !== null ? cleanPayload(item) : item))
            .filter((item) => item !== undefined && item !== null && item !== '');
          if (cleanedArray.length > 0) (acc as any)[key] = cleanedArray;
        } else if (value !== '') {
          (acc as any)[key] = value;
        }
        return acc;
      }, {} as Partial<T>);
    };

    const cleanedPayload = cleanPayload(payload);

    console.log('=== BACKEND API CALL ===');
    console.log('Endpoint:', apiEndpoint);
    console.log('Method:', operationType === 'update' ? 'PUT' : 'POST');
    console.log('Payload sent to backend:', JSON.stringify(cleanedPayload, null, 2));
    console.log('========================');

    let response: AxiosResponse<Product>;
    if (operationType === 'update') {
      response = await api.put(apiEndpoint, cleanedPayload, {
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      response = await api.post(apiEndpoint, cleanedPayload);
    }

    return response.data;
  } catch (error: any) {
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
    const api = createApiClient();
    // small delay to show progress UI if needed
    await new Promise((resolve) => setTimeout(resolve, 500));
    await api.post(`/products/${productId}/finalize`, {}, {
      headers: {
        'X-Organization-Id': authData?.organizationId?.toString() || ''
      }
    });
    return { success: true, message: 'Product finalized successfully' };
  } catch (error) {
    return handleApiError(error);
  }
};

export const getBillableMetrics = async (productId: string): Promise<BillableMetric[]> => {
  try {
    const api = createApiClient();
    const response = await api.get<BillableMetric[]>(
      `/billable-metrics/by-product?productId=${productId}`
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching billable metrics for product ${productId}:`, error);
    return [];
  }
};
