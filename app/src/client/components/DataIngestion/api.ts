import axios from 'axios';
import { getAuthHeaders } from '../../utils/auth';

const INGESTION_BASE_URL = 'http://52.87.124.177:8088/api/ingestion';

export interface FileIngestResponse {
  success: boolean;
  message?: string;
  data?: any;
  status?: number;
  errorData?: any;
}

// Shape of a file record returned by GET /files
export interface IngestionFile {
  fileId: number;
  organizationId: number;
  fileName: string;
  description: string | null;
  sizeBytes: number;
  checksum: string;
  ingestType: string;
  contentType: string;
  compression: string;
  uploadedAt: string;   // ISO timestamp
  startedAt: string | null;
  finishedAt: string | null;
  status: string;       // e.g. STAGED, UPLOADED, FAILED
  successPercentage: number;
  totalRows: number;
  successCount: number;
  errorCount: number;
  duplicateCount: number;
  errorSamples: any[];
}

// Centralized error pass-through (kept if you want to redirect on 401 elsewhere)
const handleApiError = (error: any) => {
  if (error.response?.status === 401) {
    window.location.href = '/login';
  }
  throw error;
};

/**
 * Upload files via multipart/form-data.
 * - Sends Authorization + X-Organization-Id headers.
 * - Builds query string explicitly with bracket notation for descriptions[].
 * - Lets axios set Content-Type (multipart boundary).
 *
 * Backend variants:
 * - If backend expects MultipartFile[] files  -> keeps "files" key.
 * - If backend expects repeated "file" key    -> switch to the commented block.
 */
export const ingestFiles = async (
  files: File[],
  descriptions: string[],
  ingestType: string = 'MANUAL',
  validateNow: boolean = true
): Promise<FileIngestResponse> => {
  const formData = new FormData();

  // Default: many backends use MultipartFile[] files
  files.forEach((file) => formData.append('files', file, file.name));

  // If your backend expects repeated single key "file":
  // files.forEach((file) => formData.append('file', file, file.name));

  // Build query string with explicit bracket notation for descriptions[]
  const qs = new URLSearchParams();
  qs.set('ingestType', ingestType);
  qs.set('validateNow', String(validateNow));
  descriptions.forEach((d) => qs.append('descriptions[]', d ?? ''));

  const headers = getAuthHeaders(); // no Content-Type here!

  const endpoint = `${INGESTION_BASE_URL}/files?${qs.toString()}`;

  console.log('=== REQUEST DETAILS ===');
  console.log('Endpoint:', endpoint);
  console.log('Method: POST');
  console.log('Headers:', headers);
  console.log('Files:', files.map(f => f.name));
  console.log('Descriptions:', descriptions);

  try {
    console.log('=== SENDING REQUEST ===');
    const response = await axios.post(endpoint, formData, {
      headers,
      withCredentials: false, // set true only if server needs cookies
    });

    console.log('=== RESPONSE RECEIVED ===', response.status, response.data);
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error('=== ERROR DETAILS ===');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      console.error('No response. Request:', error.request);
    } else {
      console.error('Message:', error.message);
    }
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to ingest files',
      status: error.response?.status,
      errorData: error.response?.data
    };
  }
};

// Fetch all ingestion files for history tab
export const fetchIngestionFiles = async (): Promise<IngestionFile[]> => {
  const headers = getAuthHeaders();
  const endpoint = `${INGESTION_BASE_URL}/files`;

  const response = await axios.get<IngestionFile[]>(endpoint, {
    headers,
    withCredentials: false,
  });

  return response.data ?? [];
};

// Delete a single ingestion file by id
export const deleteIngestionFile = async (fileId: number): Promise<void> => {
  const headers = getAuthHeaders();
  const endpoint = `${INGESTION_BASE_URL}/files/${fileId}`;

  try {
    await axios.delete(endpoint, {
      headers,
      withCredentials: false,
    });
  } catch (error) {
    handleApiError(error);
  }
};
