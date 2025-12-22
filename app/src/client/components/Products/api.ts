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

// Use the remote backend for all environments (dev + prod) to avoid localhost:3001
export const BASE_URL = 'http://3.208.93.68:8080/api';
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
    // Add cache-busting parameter to ensure fresh data
    const timestamp = Date.now();
    const response = await api.get<Product[]>(`/products?_t=${timestamp}`);
    const products = handleApiResponse(response);

    // Debug: Check if productIcon field is present in backend response
    console.log('🔍 Backend GET /products response analysis:');
    console.log('📊 Total products:', products.length);
    console.log('🎨 Products with productIcon field:', products.filter(p => p.productIcon).length);
    console.log('🎨 Products with icon field:', products.filter(p => p.icon).length);

    if (products.length > 0) {
      const sampleProduct = products[0];
      console.log('🎯 Sample product fields:', Object.keys(sampleProduct));
      console.log('🎨 Raw productIcon field:', sampleProduct.productIcon);
      console.log('🖼️ Raw icon field:', sampleProduct.icon);
    }

    return products;
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

    // Build clean request payload
    const requestPayload: Record<string, string> = {};

    if (payload.productName !== undefined) requestPayload.productName = payload.productName.trim();
    if (payload.version?.trim()) requestPayload.version = payload.version.trim();
    if (payload.internalSkuCode?.trim())
      requestPayload.internalSkuCode = payload.internalSkuCode.trim();
    if (payload.productDescription?.trim())
      requestPayload.productDescription = payload.productDescription.trim();
    if (payload.status) requestPayload.status = payload.status;

    // Add productIcon to the main payload if it exists
    if (payload.productIcon) {
      console.log('📤 Adding productIcon to request payload:', payload.productIcon);
      requestPayload.productIcon = payload.productIcon;
    }

    console.log('📤 createProduct requestPayload:', requestPayload);

    // Create FormData with the complete request
    const formData = new FormData();
    const requestJson = JSON.stringify(requestPayload);
    formData.append('request', requestJson);

    // Only add icon file if we have icon data with SVG content
    if (payload.productIcon) {
      try {
        const iconData =
          typeof payload.productIcon === 'string'
            ? JSON.parse(payload.productIcon)
            : payload.productIcon;

        // Only create SVG file if we have the necessary data
        if (iconData.svgContent || iconData.svgPath) {
          let svgContent: string = '';

          if (iconData.svgContent) {
            // Use the original SVG content as-is
            svgContent = iconData.svgContent;
          } else if (iconData.svgPath) {
            // Create a simple SVG from the path
            svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="${iconData.viewBox || '0 0 24 24'
              }" fill="none"><path d="${iconData.svgPath}" fill="currentColor"/></svg>`;
          }

          if (svgContent) {
            const svgBlob = new Blob([svgContent], { type: 'image/svg+xml' });
            formData.append('icon', svgBlob, 'icon.svg');
            console.log('📤 Added SVG file to FormData:', svgContent.length, 'bytes');
          }
        }
      } catch (e) {
        console.error('Error processing icon:', e);
        // Continue without icon if there's an error
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

      // Check if product was actually created despite 500 error
      // Some backends return 500 but include the created product data
      if (error.response?.status === 500 && error.response?.data) {
        const responseData = error.response.data as any;

        // Check if the error details mention "productName already exists"
        const errorDetails = responseData.details || responseData.error || '';
        const isNameExistsError = errorDetails.toLowerCase().includes('productname already exists');

        // If we got a productId back, the product was actually created
        if (responseData.productId || responseData.id) {
          if (isNameExistsError) {
            console.warn('⚠️ Backend says "productName already exists" but returned product data. This might be the same product being updated.');
          } else {
            console.warn('⚠️ Backend returned 500 but product was created. Using response data.');
          }

          return {
            productId: (responseData.productId || responseData.id).toString(),
            productName: responseData.productName || '',
            productType: responseData.productType || '',
            status: responseData.status || 'DRAFT',
            category: responseData.category || '',
            icon: responseData.icon,
            productIcon: responseData.productIcon,
            createdOn: responseData.createdOn,
            ...responseData
          } as Product;
        }

        // If no productId but it's a "name exists" error, throw a clearer error
        if (isNameExistsError) {
          throw new Error('A product with this name already exists. Please use a different name.');
        }
      }
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
    if (value === undefined) {
      return;
    }

    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed === '' && key !== 'productName') {
        return;
      }
      cleanPayload[key] = trimmed;
      return;
    }

    cleanPayload[key] = value;
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
    // Handle various error scenarios gracefully
    if (error.response?.status === 404) {
      console.log('No configuration found for product, returning empty');
      return {};
    } else if (error.response?.status === 500) {
      console.warn('Server error when fetching configuration, assuming no config exists');
      return {};
    } else if (error.response?.status >= 400 && error.response?.status < 500) {
      console.warn('Client error when fetching configuration, assuming no config exists');
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

        // Ensure endpointUrl is always present, even if empty
        apiPayload.endpointUrl = configData.endpointUrl?.trim() || '';

        // Always send authType, default to 'NONE' if not provided
        apiPayload.authType = configData.authType || 'NONE';

        // Only attach additional credentials for specific auth modes
        if (configData.authType === 'BASIC_AUTH') {
          apiPayload.username = configData.username?.trim() || '';
          apiPayload.password = configData.password?.trim() || '';
        } else if (configData.authType === 'API_KEY') {
          apiPayload.apiKey = configData.apiKey?.trim() || '';
        } else if (configData.authType === 'OAUTH2') {
          apiPayload.clientId = configData.clientId?.trim() || '';
          apiPayload.clientSecret = configData.clientSecret?.trim() || '';
          apiPayload.tokenUrl = configData.tokenUrl?.trim() || '';
        }

        // Ensure we always have required fields for API configuration
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

    let cleanedPayload = cleanPayload(payload);

    console.log('=== BACKEND API CALL ===');
    console.log('Endpoint:', apiEndpoint);
    console.log('Method:', operationType === 'update' ? 'PUT' : 'POST');
    console.log('Payload sent to backend:', JSON.stringify(cleanedPayload, null, 2));
    console.log('========================');

    // Validate payload before sending
    if (!cleanedPayload || Object.keys(cleanedPayload).length === 0) {
      console.warn('Empty payload detected, adding default values');
      if (normalizedType === 'api') {
        cleanedPayload = {
          endpointUrl: '',
          authType: 'NONE'
        };
      }
    }

    let response: AxiosResponse<Product>;
    try {
      if (operationType === 'update') {
        response = await api.put(apiEndpoint, cleanedPayload, {
          headers: { 'Content-Type': 'application/json' }
        });
      } else {
        response = await api.post(apiEndpoint, cleanedPayload, {
          headers: { 'Content-Type': 'application/json' }
        });
      }
    } catch (apiError: any) {
      // Log detailed error information for debugging
      console.error('API Error Details:', {
        status: apiError.response?.status,
        statusText: apiError.response?.statusText,
        data: apiError.response?.data,
        endpoint: apiEndpoint,
        method: operationType === 'update' ? 'PUT' : 'POST',
        payload: cleanedPayload
      });

      // Provide more specific error messages
      if (apiError.response?.status === 500) {
        throw new Error(`Server error when saving ${normalizedType} configuration. Please check the data and try again.`);
      } else if (apiError.response?.status === 400) {
        const errorMsg = apiError.response?.data?.message || 'Invalid configuration data';
        throw new Error(`Configuration validation failed: ${errorMsg}`);
      } else {
        throw apiError;
      }
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

export const updateProductIcon = async (productId: string, iconData: any): Promise<{ success: boolean; message: string }> => {
  try {
    const authData = getAuthData();
    if (!authData?.token) {
      throw new Error('No authentication token found');
    }

    console.log('🔄 Updating product icon using same approach as createProduct...');

    if (iconData === null) {
      // Remove icon - update product with empty productIcon AND icon fields
      console.log('🗑️ Removing product icon via /api/products/{id}...');

      const api = createApiClient();
      // Clear BOTH productIcon (JSON data) and icon (SVG file path) to prevent fallback
      await api.patch(`/products/${productId}`, { productIcon: null, icon: null }, {
        headers: {
          'X-Organization-Id': authData?.organizationId?.toString() || ''
        }
      });

      console.log('✅ Product icon removed successfully (both productIcon and icon fields cleared)');
      return { success: true, message: 'Product icon removed successfully' };
    } else {
      // Follow the same approach as createProduct - use FormData with both structured data and file
      const api = createApiClient();

      // Create the productIcon JSON - use SIMPLE SVG like createProduct
      let simpleSvgContent: string;

      if (iconData.svgContent) {
        // Use the original SVG content as-is
        simpleSvgContent = iconData.svgContent;
      } else if (iconData.svgPath) {
        // Create a simple SVG from the path - no extra styling or frames
        simpleSvgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="${iconData.viewBox || '0 0 24 24'
          }" fill="none"><path d="${iconData.svgPath}" fill="currentColor"/></svg>`;
      } else {
        throw new Error('Invalid icon data: missing svgContent or svgPath');
      }

      const productIconJson = JSON.stringify({
        iconData: iconData,
        svgContent: simpleSvgContent
      });

      console.log('📤 updateProductIcon productIconJson:', productIconJson);

      // STEP 1: Upload SVG file to /icon endpoint (updates 'icon' field)
      try {
        const svgBlob = new Blob([simpleSvgContent], { type: 'image/svg+xml' });
        const iconFormData = new FormData();
        iconFormData.append('icon', svgBlob, 'icon.svg');

        console.log('📤 Step 1: Uploading SVG to /products/{id}/icon endpoint...');
        await api.patch(`/products/${productId}/icon`, iconFormData, {
          headers: {
            'X-Organization-Id': authData?.organizationId?.toString() || ''
          }
        });
        console.log('✅ Step 1 complete: SVG file uploaded');
      } catch (iconUploadErr: any) {
        console.warn('⚠️ Icon file upload failed (continuing with productIcon update):', iconUploadErr?.message);
      }

      // STEP 2: Update productIcon JSON field via main /products endpoint
      console.log('📤 Step 2: Updating productIcon JSON field...');
      const response = await api.patch(`/products/${productId}`, {
        productIcon: productIconJson
      }, {
        headers: {
          'Content-Type': 'application/json',
          'X-Organization-Id': authData?.organizationId?.toString() || ''
        }
      });

      console.log('✅ Step 2 complete: productIcon JSON updated');
      console.log('✅ Product icon updated successfully (both icon file and productIcon JSON)');
      return { success: true, message: 'Product icon updated successfully' };
    }
  } catch (error) {
    console.error('❌ Failed to update product icon:', error);
    return handleApiError(error);
  }
};

export const getProductById = async (productId: string): Promise<Product | null> => {
  try {
    verifyAuth();
    const api = createApiClient();
    const timestamp = Date.now();
    const response = await api.get<Product>(`/products/${productId}?_t=${timestamp}`);
    const product = handleApiResponse(response);

    console.log(`🔍 Individual product ${productId} fetch:`);
    console.log(`🎨 Has productIcon field:`, !!product.productIcon);
    console.log(`🖼️ Has icon field:`, !!product.icon);
    console.log(`🎨 Raw productIcon:`, product.productIcon);

    return product;
  } catch (error) {
    console.error(`Error fetching product ${productId}:`, error);
    return null;
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
