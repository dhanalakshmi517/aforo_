import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { isAuthenticated, getAuthData, clearAuthData } from '../../utils/auth';

export const BASE_URL = 'http://54.238.204.246:8080/api';

export interface ProductPayload {
  productName: string;
  version: string;
  internalSkuCode: string;
  productDescription: string;
  productIcon?: File;
}

export interface Product {
  productId: string;
  productName: string;
  productType: string;
  version: string;
  productDescription: string;
  tags: Record<string, any>;
  category: string;
  visibility: boolean;
  status: string;
  internalSkuCode: string;
  uom: string;
  effectiveStartDate: string;
  effectiveEndDate: string | null;
  createdAt?: string;
  updatedAt?: string;
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
 */
export const createProduct = async (
  payload: ProductPayload
): Promise<Product> => {
  verifyAuth();

  try {
    const authData = getAuthData();
    if (!authData?.token) {
      throw new Error('No authentication token found. Please log in again.');
    }

    const formData = new FormData();
    
    // Create the request object that the server expects
    const requestData = {
      productName: payload.productName.trim(),
      version: payload.version.trim(),
      internalSkuCode: payload.internalSkuCode.trim(),
      productDescription: payload.productDescription.trim()
    };

    // Append the request data as a JSON string under the 'request' key
    formData.append('request', new Blob(
      [JSON.stringify(requestData)],
      { type: 'application/json' }
    ));

    // If there's a file, append it
    if (payload.productIcon) {
      formData.append('file', payload.productIcon);
    }

    const api = createApiClient();
    api.defaults.headers['X-Organization-Id'] =
      authData?.organizationId?.toString() || '';

    const response = await api.post<Product>('/products', formData);
    return handleApiResponse(response);
  } catch (error) {
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
