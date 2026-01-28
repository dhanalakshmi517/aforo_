// Kong API Service
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { getAuthData } from '../../../utils/auth';

export interface KongConnectPayload {
  base_url: string;
  endpoint: string;
  auth_token: string;
}

export interface KongConnectResponse {
  [key: string]: any;
}

const KONG_API_ENDPOINT = "http://kong.dev.aforo.space:8086/api/client-api-details";

const regionMap: Record<string, string> = {
  us: "https://us.api.konghq.com",
  sg: "https://sg.api.konghq.com",
  au: "https://au.api.konghq.com",
  me: "https://me.api.konghq.com",
  eu: "https://eu.api.konghq.com",
  in: "https://in.api.konghq.com",
};

/**
 * Maps region code to Kong API base URL
 */
export function getKongBaseUrl(region: string): string {
  return regionMap[region] || `https://${region}.api.konghq.com`;
}

/**
 * Creates an axios instance with authentication interceptors
 */
const createKongApiClient = (): AxiosInstance => {
  const api = axios.create({
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    }
  });

  // Add request interceptor to attach auth token
  api.interceptors.request.use(
    (config) => {
      const authData = getAuthData();
      if (authData?.token) {
        config.headers.Authorization = `Bearer ${authData.token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Add response interceptor for error handling
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        console.error('Kong API: Unauthorized (401). Check authentication token.');
      }
      return Promise.reject(error);
    }
  );

  return api;
};

/**
 * Connects to Kong API with the provided credentials
 */
export async function connectToKong(
  region: string,
  authToken: string
): Promise<KongConnectResponse> {
  const baseUrl = getKongBaseUrl(region);

  const payload: KongConnectPayload = {
    base_url: baseUrl,
    endpoint: "/v2/api-products",
    auth_token: authToken.trim(),
  };

  try {
    const api = createKongApiClient();

    console.log('📤 Kong API Request:', {
      endpoint: KONG_API_ENDPOINT,
      payload: payload,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': 'Bearer [token]'
      }
    });

    const response: AxiosResponse<KongConnectResponse> = await api.post(
      KONG_API_ENDPOINT,
      payload
    );

    console.log("✅ Kong connection successful:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("❌ Failed to connect to Kong:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
    });

    if (error.response?.status === 401) {
      throw new Error('Unauthorized: Invalid authentication token. Please check your credentials.');
    } else if (error.response?.status === 400) {
      throw new Error(`Bad Request: ${error.response?.data?.message || 'Invalid request data'}`);
    } else if (error.response?.status === 500) {
      throw new Error('Server Error: Kong API server error. Please try again later.');
    }

    throw error;
  }
}

/**
 * Fetches Kong products from database using connection ID
 */
export async function fetchKongProducts(
  connectionId: string
): Promise<any[]> {
  const GET_ENDPOINT = `http://kong.dev.aforo.space:8086/api/kong/fetch/from-db/${connectionId}`;

  try {
    const api = createKongApiClient();

    console.log('📥 Kong Products Request:', {
      endpoint: GET_ENDPOINT,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': 'Bearer [token]'
      }
    });

    const response = await api.get(GET_ENDPOINT);

    if (response.status === 200) {
      console.log("✅ Kong products fetched successfully:", response.data);
      // Extract products from response array
      const products = response.data?.[0]?.data || [];
      return products;
    } else {
      throw new Error(`Unexpected response status: ${response.status}`);
    }
  } catch (error: any) {
    console.error("❌ Failed to fetch Kong products:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
    });

    if (error.response?.status === 404) {
      throw new Error('Connection not found. The connection may have already been deleted.');
    } else if (error.response?.status === 401) {
      throw new Error('Unauthorized: Invalid authentication token. Please check your credentials.');
    } else if (error.response?.status === 500) {
      throw new Error('Server Error: Kong API server error. Please try again later.');
    }

    throw error;
  }
}

/**
 * Imports selected Kong products
 */
export async function importKongProducts(
  selectedIds: string[]
): Promise<any> {
  const IMPORT_ENDPOINT = "http://kong.dev.aforo.space:8086/api/kong/import-selected";

  try {
    const api = createKongApiClient();

    console.log('📤 Kong Import Request:', {
      endpoint: IMPORT_ENDPOINT,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': 'Bearer [token]'
      },
      body: selectedIds
    });

    const response = await api.post(IMPORT_ENDPOINT, selectedIds);

    if (response.status === 200) {
      console.log("✅ Kong products imported successfully:", response.data);
      return response.data;
    } else {
      throw new Error(`Unexpected response status: ${response.status}`);
    }
  } catch (error: any) {
    console.error("❌ Failed to import Kong products:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
    });

    if (error.response?.status === 401) {
      throw new Error('Unauthorized: Invalid authentication token. Please check your credentials.');
    } else if (error.response?.status === 500) {
      throw new Error('Server Error: Kong API server error. Please try again later.');
    }

    throw error;
  }
}

/**
 * Disconnects from Kong API by deleting the connection
 */
export async function disconnectFromKong(
  connectionId: string
): Promise<void> {
  const DELETE_ENDPOINT = `http://kong.dev.aforo.space:8086/api/kong/${connectionId}`;

  try {
    const api = createKongApiClient();

    console.log('🗑️ Kong Disconnect Request:', {
      endpoint: DELETE_ENDPOINT,
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': 'Bearer [token]'
      }
    });

    const response = await api.delete(DELETE_ENDPOINT);

    if (response.status === 200 || response.status === 204) {
      console.log("✅ Kong connection deleted successfully");
    } else {
      throw new Error(`Unexpected response status: ${response.status}`);
    }
  } catch (error: any) {
    console.error("❌ Failed to disconnect Kong:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
    });

    if (error.response?.status === 404) {
      throw new Error('Connection not found. The connection may have already been deleted.');
    } else if (error.response?.status === 401) {
      throw new Error('Unauthorized: Invalid authentication token. Please check your credentials.');
    } else if (error.response?.status === 500) {
      throw new Error('Server Error: Kong API server error. Please try again later.');
    }

    throw error;
  }
}
