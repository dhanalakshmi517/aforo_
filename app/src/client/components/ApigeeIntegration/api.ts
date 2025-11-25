// src/api.ts
import axios, { AxiosInstance } from 'axios';
import { getAuthHeaders, logout } from '../../utils/auth';

const API_BASE_URL = 'http://44.203.209.2:8086';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: 'application/json',
  },
  // If later you secure this endpoint with JWT cookies, flip this to true.
  withCredentials: false,
});

export interface ConnectionResponse {
  connected: boolean;
  message?: string;
  // Optional extra fields if backend adds them later
  org?: string;
  envs?: string;
  analyticsMode?: string;
}

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
  try {
    const response = await apiClient.post<ConnectionResponse>(
      '/api/integrations/apigee/connections',
      formData,
      {
        headers: {
          // Accept JSON responses and include multi-tenant auth headers
          Accept: 'application/json',
          ...getAuthHeaders(),
        },
      }
    );

    return response.data;
  } catch (error: any) {
    if (error?.response?.status === 401) {
      // Centralized logout (clears token, redirects appropriately)
      logout();
    }
    throw error;
  }
}
