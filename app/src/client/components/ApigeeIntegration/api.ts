// src/pages/Apigee/api.ts
import axios from 'axios';
import { getAuthHeaders, logout } from '../../utils/auth';

// Real Apigee integration backend
// All endpoints are of the form:
//   GET    /api/integrations/apigee/products
//   POST   /api/integrations/apigee/products/import-selected
//   POST   /api/integrations/apigee/connections?org=...&envs=...&analyticsMode=...
//   GET    /api/integrations/apigee/products/imported
//   DELETE /api/integrations/apigee/products/imported/{id}
export const APIGEE_BASE_URL = 'http://44.203.209.2:8086/api/integrations/apigee';

export interface ConnectionResponse {
  connected: boolean;
  message?: string;
  org?: string;
  envs?: string;
  analyticsMode?: string;
}

export interface ApigeeProduct {
  name: string;
  display_name?: string;
  quota?: string | number | null;
}

/**
 * Save / update Apigee connection details.
 * Mirrors the curl example you provided.
 */
export async function saveApigeeConnection(
  org: string,
  envs: string,
  analyticsMode: string,
  serviceAccountFile: File
): Promise<ConnectionResponse> {
  const formData = new FormData();
  // Backend expects the file field to be named "serviceAccountFile"
  formData.append('serviceAccountFile', serviceAccountFile);

  const query = new URLSearchParams({
    org,
    envs,
    analyticsMode,
  });

  const url = `${APIGEE_BASE_URL}/connections?${query.toString()}`;

  try {
    console.log('[api.saveApigeeConnection] POST', url);
    const response = await axios.post<ConnectionResponse>(url, formData, {
      headers: {
        Accept: '*/*',
        ...getAuthHeaders(), // adds Authorization / org headers if present
      },
    });

    console.log('[api.saveApigeeConnection] Response:', {
      status: response.status,
      data: response.data,
    });

    return response.data;
  } catch (error: any) {
    console.error('[api.saveApigeeConnection] Error:', error);

    if (error?.response) {
      console.error('[api.saveApigeeConnection] Error response:', {
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
 * Fetch raw products from Apigee.
 * GET http://44.203.209.2:8086/api/integrations/apigee/products
 */
export async function getApigeeProducts(): Promise<ApigeeProduct[]> {
  try {
    const response = await axios.get<ApigeeProduct[]>(
      `${APIGEE_BASE_URL}/products`,
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
    console.error('[api.getApigeeProducts] Error:', error);

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
    const response = await axios.post<ImportSelectedApigeeProductsResponse>(
      `${APIGEE_BASE_URL}/products/import-selected`,
      payload,
      {
        headers: {
          Accept: '*/*',
          ...getAuthHeaders({ contentType: 'json' }),
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

/* ========= IMPORTED PRODUCTS SCREEN ========= */

export interface ImportedApigeeProduct {
  id: string;
  productName: string;
  productType: string;
  importedOn: string; // ISO timestamp string from backend
}

/**
 * Fetch all imported Apigee products stored in Aforo DB.
 * GET /api/integrations/apigee/products
 */
export async function getImportedApigeeProducts(): Promise<
  ImportedApigeeProduct[]
> {
  try {
    const response = await axios.get<ImportedApigeeProduct[]>(
      `${APIGEE_BASE_URL}/products`,
      {
        headers: {
          Accept: '*/*',
          ...getAuthHeaders(),
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('[api.getImportedApigeeProducts] Error:', error);

    if (error?.response?.status === 401) {
      logout();
    }

    throw error;
  }
}

/**
 * Delete a single imported Apigee product by its ID.
 * DELETE /api/integrations/apigee/products/imported/{id}
 */
export async function deleteImportedApigeeProduct(
  id: string
): Promise<void> {
  try {
    await axios.delete(`${APIGEE_BASE_URL}/products/imported/${id}`, {
      headers: {
        Accept: '*/*',
        ...getAuthHeaders(),
      },
    });
  } catch (error: any) {
    console.error('[api.deleteImportedApigeeProduct] Error:', error);

    if (error?.response?.status === 401) {
      logout();
    }

    throw error;
  }
}
