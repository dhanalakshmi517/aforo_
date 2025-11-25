// src/pages/Apigee/api.ts
import axios, { AxiosInstance } from 'axios';
import { getAuthHeaders, logout } from '../../utils/auth';

const API_BASE_URL = 'http://44.203.209.2:8086';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: 'application/json',
  },
  withCredentials: false,
});

export interface ConnectionResponse {
  connected: boolean;
  message?: string;
  org?: string;
  envs?: string;
  analyticsMode?: string;
}

export interface ApigeeProduct {
  name: string;
  display_name: string;
  quota: string;
  resources: any[];
}

/**
 * POST /api/integrations/apigee/connections
 */
export async function saveApigeeConnection(
  org: string,
  envs: string,
  analyticsMode: string,
  serviceAccountFile: File
): Promise<ConnectionResponse> {
  const formData = new FormData();
  formData.append('org', org);
  formData.append('envs', envs);
  formData.append('analyticsMode', analyticsMode);
  formData.append('serviceAccountFile', serviceAccountFile);

  console.log('[api.saveApigeeConnection] Request payload (no file contents):', {
    org,
    envs,
    analyticsMode,
    fileName: serviceAccountFile.name,
  });

  try {
    const response = await apiClient.post<ConnectionResponse>(
      '/api/integrations/apigee/connections',
      formData,
      {
        headers: {
          Accept: 'application/json',
          ...getAuthHeaders(), // browser sets multipart boundary
        },
      }
    );

    console.log('[api.saveApigeeConnection] Response:', {
      status: response.status,
      data: response.data,
    });

    return response.data;
  } catch (error: any) {
    console.error('[api.saveApigeeConnection] Error while calling backend:', error);

    if (error?.response) {
      console.error('[api.saveApigeeConnection] Error response details:', {
        status: error.response.status,
        data: error.response.data,
      });

      if (error.response.status === 401) {
        logout();
      }
    }

    throw error;
  }
}

/**
 * GET /api/integrations/apigee/products
 * Uses stored connection (org/env/file) on backend.
 */
export async function getApigeeProducts(): Promise<ApigeeProduct[]> {
  try {
    const response = await apiClient.get<ApigeeProduct[]>(
      '/api/integrations/apigee/products',
      {
        headers: {
          Accept: 'application/json',
          ...getAuthHeaders(),
        },
      }
    );

    console.log('[api.getApigeeProducts] Response:', {
      status: response.status,
      count: response.data?.length ?? 0,
    });

    return response.data;
  } catch (error: any) {
    console.error('[api.getApigeeProducts] Error while calling backend:', error);

    if (error?.response?.status === 401) {
      logout();
    }

    throw error;
  }
}

/**
 * POST /api/integrations/apigee/products/import-selected
 * Body:
 * {
 *   "selectedProducts": [
 *     { "productName": "testing 4" },
 *     ...
 *   ]
 * }
 */
export interface ImportSelectedApigeeProductsResponse {
  success?: boolean;
  importedCount?: number;
  message?: string;
  // backend might return other fields; keep this flexible
  [key: string]: any;
}

export async function importSelectedApigeeProducts(
  productNames: string[]
): Promise<ImportSelectedApigeeProductsResponse> {
  const payload = {
    selectedProducts: productNames.map((name) => ({ productName: name })),
  };

  console.log('[api.importSelectedApigeeProducts] Request payload:', payload);

  try {
    const response = await apiClient.post<ImportSelectedApigeeProductsResponse>(
      '/api/integrations/apigee/products/import-selected',
      payload,
      {
        headers: {
          Accept: '*/*',
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
      }
    );

    console.log('[api.importSelectedApigeeProducts] Response:', {
      status: response.status,
      data: response.data,
    });

    return response.data;
  } catch (error: any) {
    console.error(
      '[api.importSelectedApigeeProducts] Error while calling backend:',
      error
    );

    if (error?.response?.status === 401) {
      logout();
    }

    throw error;
  }
}
