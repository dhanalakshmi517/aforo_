const API_BASE_URL = 'http://54.238.204.246:8080/api';

interface ProductData {
  productName: string;
  version: string;
  internalSkuCode: string;
  productDescription: string;
  status?: 'draft' | 'active';
}

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
  [key: string]: any; // Allow additional properties
}

async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  let data: any;
  try {
    data = await response.json();
  } catch (e) {
    console.error('Failed to parse JSON response:', e);
    const errorResponse: ApiResponse<never> = {
      error: 'Invalid response from server',
      status: response.status || 500
    };
    return errorResponse;
  }
  
  if (!response.ok) {
    console.error('API Error Response:', {
      status: response.status,
      statusText: response.statusText,
      data
    });
    
    const errorResponse: ApiResponse<never> = {
      error: data?.message || data?.error || `Server error: ${response.status} ${response.statusText}`,
      status: response.status,
      data: data // Include the full response data for debugging
    };
    return errorResponse;
  }

  const successResponse: ApiResponse<T> = { 
    data: data as T, 
    status: response.status 
  };
  return successResponse;
}

export const productsApi = {
  /**
   * Create a new product
   */
  async createProduct(productData: ProductData): Promise<ApiResponse<{ id: string; productId: string }>> {
    try {
      console.log('Sending request to create product:', {
        url: `${API_BASE_URL}/products`,
        method: 'POST',
        body: productData
      });

      const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(productData)
      });

      console.log('Received response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

      const result = await handleResponse<{ id: string; productId: string }>(response);
      console.log('Processed response:', result);
      
      // Ensure we have the expected data structure
      if (result.data && (!result.data.id || !result.data.productId)) {
        console.warn('Unexpected response structure:', result.data);
        // Try to extract IDs from the response if they're in a different format
        const data = result.data as any;
        if (data.data?.id || data.data?.productId) {
          result.data = {
            id: data.data.id,
            productId: data.data.productId || data.data.id
          };
        } else if (data.id) {
          result.data = {
            id: data.id,
            productId: data.productId || data.id
          };
        }
      }
      
      return result;
    } catch (error) {
      console.error('Error in createProduct:', error);
      const errorResponse: ApiResponse<{ id: string; productId: string }> = {
        error: error instanceof Error ? error.message : 'Failed to create product',
        status: 500
      };
      return errorResponse;
    }
  },

  /**
   * Save product configuration
   */
  async saveConfiguration(
    productId: string, 
    productType: string, 
    configData: Record<string, any>
  ): Promise<ApiResponse> {
    try {
      let endpoint = '';
      const body: Record<string, any> = { ...configData, status: 'draft' };

      switch (productType) {
        case 'api':
          endpoint = `${API_BASE_URL}/products/${productId}/api`;
          break;
        case 'storage':
          endpoint = `${API_BASE_URL}/products/${productId}/storage`;
          break;
        case 'sqlresult':
          endpoint = `${API_BASE_URL}/products/${productId}/sql-result`;
          break;
        case 'llmtoken':
          endpoint = `${API_BASE_URL}/products/${productId}/llm-token`;
          break;
        case 'flatfile':
          endpoint = `${API_BASE_URL}/products/${productId}/flatfile`;
          break;
        default:
          return {
            error: `Unknown product type: ${productType}`,
            status: 400
          };
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      return handleResponse(response);
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Failed to save configuration',
        status: 500
      };
    }
  },

  /**
   * Get product by ID
   */
  async getProduct(productId: string): Promise<ApiResponse<ProductData>> {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${productId}`);
      return handleResponse(response);
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Failed to fetch product',
        status: 500
      };
    }
  },

  /**
   * Update product
   */
  async updateProduct(
    productId: string, 
    productData: Partial<ProductData>
  ): Promise<ApiResponse> {
    return fetch(`${API_BASE_URL}/products/${productId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    }).then(handleResponse);
  },
  
  /**
   * Finalize a product
   */
  finalizeProduct(productId: string): Promise<ApiResponse<{ success: boolean }>> {
    return fetch(`${API_BASE_URL}/products/${productId}/finalize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
    .then(response => response.json())
    .then(data => ({
      data: { success: data.success },
      status: 200
    }))
    .catch(error => ({
      error: error.message || 'Failed to finalize product',
      status: 500
    }));
  }
};

export default productsApi;
