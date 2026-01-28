import { authFetch } from '../../../utils/authFetch';

const BASE_URL = 'http://product.dev.aforo.space:8080/api';

export interface Product {
  id: string;
  productName: string;
  version: string;
  internalSkuCode: string;
  productDescription: string;
  [key: string]: any;
}

export async function checkProductNameExists(productName: string, currentProductId?: string): Promise<{ exists: boolean; message: string }> {
  if (!productName.trim()) {
    return { exists: false, message: '' };
  }

  try {
    const response = await authFetch(`${BASE_URL}/products?productName=${encodeURIComponent(productName)}`);
    const products: Product[] = await response.json();

    // Check if any product (other than current one being edited) has this name
    const existingProduct = products.find(
      product => product.productName.toLowerCase() === productName.toLowerCase() &&
        product.id !== currentProductId
    );

    return {
      exists: !!existingProduct,
      message: existingProduct ? 'A product with this name already exists' : ''
    };
  } catch (error) {
    console.error('Error checking product name:', error);
    return { exists: false, message: 'Error checking product name' };
  }
}

export interface ProductData {
  id?: string;
  productName: string;
  version: string;
  internalSkuCode: string;
  productDescription: string;
  [key: string]: any; // Allow additional properties from config
}

type CreateProductPayload = Omit<ProductData, 'status' | 'id'>;

export async function createProduct(productData: ProductData): Promise<ProductData> {
  try {
    // Backend requires productType, category, visibility & status as well, so include sensible defaults
    const cleanedData: any = {
      productType: (productData.productType || 'api').toLowerCase(),
      category: productData.category || 'INTERNAL',
      visibility: productData.visibility ?? true,
      status: productData.status || 'DRAFT',
      billable: productData.billable ?? false,
      uom: productData.uom || '',
      effectiveStartDate: productData.effectiveStartDate || new Date().toISOString(),
      effectiveEndDate: productData.effectiveEndDate || null,
      linkedRatePlans: [],
      auditLogId: 0,
      tags: {},
      labels: {},
    } as Record<string, any>;

    // Trim string fields
    if (productData.productName) cleanedData.productName = productData.productName.trim();
    if (productData.version) cleanedData.version = productData.version.trim();
    if (productData.internalSkuCode) cleanedData.internalSkuCode = productData.internalSkuCode.trim();
    if (productData.productDescription) cleanedData.description = productData.productDescription.trim();
    if ((productData as any).description) cleanedData.description = (productData as any).description.trim();

    // Remove empty strings, null or undefined to satisfy backend validation
    Object.keys(cleanedData).forEach(key => {
      const value = cleanedData[key];
      if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
        delete cleanedData[key];
      }
    });

    console.log('Sending product data:', cleanedData);

    const response = await authFetch(`${BASE_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(cleanedData),
    });

    let responseData;
    try {
      responseData = await response.json();
    } catch (e) {
      console.error('Failed to parse JSON response:', e);
      throw new Error('Invalid response from server');
    }

    if (!response.ok) {
      const errorDetails = {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        response: responseData,
        requestData: cleanedData
      };

      console.error('API Error Details:', errorDetails);

      if (response.status === 400) {
        const errorMessage = responseData.message || 'Invalid product data';
        const validationErrors = responseData.errors || {};
        throw new Error(`Validation Error: ${errorMessage} ${JSON.stringify(validationErrors)}`);
      }

      if (response.status === 409) {
        throw new Error('A product with this name already exists.');
      }

      throw new Error(responseData.message || `Request failed with status ${response.status}`);
    }

    // Accept the response if it has either an id or a productId field
    if (!responseData.id && !responseData.productId) {
      console.error('Unexpected response format - missing id or productId:', responseData);
      throw new Error('Invalid response format from server - missing product identifier');
    }

    // Normalize the response to always have an id field
    if (responseData.productId && !responseData.id) {
      responseData.id = responseData.productId;
    }

    return responseData;
  } catch (error: any) {
    console.error('Error in createProduct:', {
      error: error.message,
      stack: error.stack,
      data: productData
    });
    throw error;
  }
}

export async function updateDraft(productId: string, productData: Partial<ProductData>): Promise<ProductData> {
  if (!productId) {
    throw new Error('Product ID is required for updating a draft');
  }

  try {
    // Only include fields that are present in the productData (modified fields)
    const cleanedData: any = {};

    // Only add fields that are explicitly provided in productData and have a value
    if (productData.productName !== undefined && productData.productName !== '') {
      cleanedData.productName = productData.productName.trim();
    }
    if (productData.version !== undefined && productData.version !== '') {
      cleanedData.version = productData.version.trim();
    }
    if (productData.internalSkuCode !== undefined && productData.internalSkuCode !== '') {
      cleanedData.internalSkuCode = productData.internalSkuCode.trim();
    }
    if (productData.productDescription !== undefined && productData.productDescription !== '') {
      cleanedData.productDescription = productData.productDescription.trim();
    }

    // If no fields were provided, no need to make the request
    if (Object.keys(cleanedData).length === 0) {
      console.log('No fields to update');
      return { id: productId, ...productData } as ProductData;
    }

    console.log('Updating draft with ID:', productId, 'Data:', cleanedData);

    const response = await authFetch(`${BASE_URL}/products/${productId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/merge-patch+json',
        'Accept': 'application/json',
      },
      // Removed credentials as they're not needed and cause CORS issues
      body: JSON.stringify(cleanedData),
    });

    let responseData;
    try {
      responseData = await response.json();
    } catch (e) {
      console.error('Failed to parse JSON response:', e);
      throw new Error('Invalid response from server');
    }

    if (!response.ok) {
      const errorDetails = {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        response: responseData,
        requestData: cleanedData
      };

      console.error('API Update Error Details:', errorDetails);

      if (response.status === 400) {
        const errorMessage = responseData.message || 'Invalid update data';
        const validationErrors = responseData.errors || {};
        throw new Error(`Update Validation Error: ${errorMessage} ${JSON.stringify(validationErrors)}`);
      }

      if (response.status === 404) {
        throw new Error('The product you are trying to update was not found. It may have been deleted.');
      }

      throw new Error(responseData.message || `Failed to update product: ${response.status}`);
    }

    // Accept the response if it has either an id or a productId field
    if (!responseData.id && !responseData.productId) {
      console.error('Unexpected response format - missing id or productId:', responseData);
      throw new Error('Invalid response format from server - missing product identifier');
    }

    // Normalize the response to always have an id field
    if (responseData.productId && !responseData.id) {
      responseData.id = responseData.productId;
    }

    return responseData;
  } catch (error: any) {
    console.error('Error in updateDraft:', {
      error: error.message,
      stack: error.stack,
      productId,
      data: productData
    });
    throw error;
  }
}

export async function saveAsDraft(productData: ProductData, productId?: string): Promise<{ data: ProductData; isNew: boolean }> {
  try {
    // Only include fields that have values
    const cleanData: any = {};
    if (productData.productName) cleanData.productName = productData.productName.trim();
    if (productData.version) cleanData.version = productData.version.trim();
    if (productData.internalSkuCode) cleanData.internalSkuCode = productData.internalSkuCode.trim();
    if (productData.productDescription) cleanData.productDescription = productData.productDescription.trim();

    if (productId) {
      console.log('Updating existing draft with ID:', productId);
      const updatedProduct = await updateDraft(productId, cleanData);
      return { data: updatedProduct, isNew: false };
    } else {
      console.log('Creating new draft with data:', cleanData);
      const newProduct = await createProduct(cleanData);
      return { data: newProduct, isNew: true };
    }
  } catch (error: any) {
    console.error('Error in saveAsDraft:', {
      error: error?.message || 'Unknown error',
      stack: error?.stack,
      productId,
      data: productData
    });
    throw error; // Re-throw to be handled by the caller
  }
}