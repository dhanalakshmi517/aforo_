import axios from 'axios';
import { getAuthHeaders } from '../../utils/auth';

const INGESTION_BASE_URL = 'http://43.207.67.221:8088/api/ingestion';

// Error handler for API requests
const handleApiError = (error: any) => {
  if (error.response?.status === 401) {
    // Token expired or invalid, redirect to login
    window.location.href = '/login';
  }
  throw error;
};

// Helper function to get common request config
const getRequestConfig = () => ({
  headers: getAuthHeaders(),
  params: {
    organizationId: localStorage.getItem('organizationId')
  }
});

export interface FileIngestResponse {
  success: boolean;
  message?: string;
  data?: any;
  status?: number;
  errorData?: any;
}

export const ingestFiles = async (
  files: File[],
  descriptions: string[],
  ingestType: string = 'MANUAL',
  validateNow: boolean = false
): Promise<FileIngestResponse> => {
  const formData = new FormData();

  // Append each file (do not wrap in Blob, keep original File object)
  files.forEach((file) => {
    formData.append('files', file, file.name);
  });

  // ✅ Build query params (Swagger style: descriptions as query array)
  const requestConfig = {
    ...getRequestConfig(),
    // ⚠️ Do NOT override Content-Type, let Axios set the multipart boundary
    params: {
      ...getRequestConfig().params,
      ingestType,
      validateNow: validateNow.toString(),
      descriptions // backend expects this in query string, not FormData
    }
  };

  console.log('=== REQUEST DETAILS ===');
  console.log('Endpoint:', `${INGESTION_BASE_URL}/files`);
  console.log('Method: POST');
  console.log('Query Parameters:', requestConfig.params);
  console.log('Headers:', requestConfig.headers);

  try {
    console.log('=== SENDING REQUEST ===');
    const response = await axios.post(
      `${INGESTION_BASE_URL}/files`,
      formData,
      requestConfig
    );

    console.log('=== RESPONSE RECEIVED ===');
    console.log('Status:', response.status);
    console.log('Response Data:', response.data);

    return {
      success: true,
      data: response.data,
    };
  } catch (error: any) {
    console.error('=== ERROR DETAILS ===');
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Data:', JSON.stringify(error.response.data, null, 2));

      if (error.response.data?.errors?.length > 0) {
        console.error('Error Details:');
        error.response.data.errors.forEach((err: any, index: number) => {
          console.error(`  Error ${index + 1}:`, JSON.stringify(err, null, 2));
        });
      }

      console.error('Response Headers:', error.response.headers);
    } else if (error.request) {
      console.error('No response received. Request:', error.request);
    } else {
      console.error('Error Message:', error.message);
      console.error('Error Stack:', error.stack);
    }

    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to ingest files',
      status: error.response?.status,
      errorData: error.response?.data
    };
  }
};
