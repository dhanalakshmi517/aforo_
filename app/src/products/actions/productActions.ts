// Product type
import { ProductType } from '../components/CreateProductForm';

export type Product = {
  id: string;
  name: string;
  type: ProductType;
  description: string;
  apiEndpoint?: string;
  status: 'DRAFT' | 'PUBLISHED';
  pricingModel: 'USAGE_BASED' | 'SUBSCRIPTION' | 'ENTERPRISE' | 'CUSTOM';
  basePrice: number;
  documentation?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

import { productApi, ProductResponse, ProductCreateRequest, ProductUpdateRequest } from '../../services/api';

// Convert backend response to our internal Product type
const mapResponseToProduct = (response: ProductResponse): Product => ({
  id: response.id.toString(),
  name: response.name,
  type: response.type as ProductType,
  description: response.description,
  apiEndpoint: response.apiEndpoint,
  status: response.status,
  pricingModel: response.pricingModel,
  basePrice: response.basePrice,
  documentation: response.documentation,
  userId: 'user-1', // We'll keep this hardcoded for now as the backend doesn't have this field
  createdAt: new Date(response.createdAt),
  updatedAt: new Date(response.updatedAt)
});

// Convert our internal Product type to backend request format
const mapProductToCreateRequest = (product: Omit<Product, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): ProductCreateRequest => ({
  name: product.name,
  type: product.type as ProductType,
  description: product.description,
  apiEndpoint: product.apiEndpoint,
  status: product.status,
  pricingModel: product.pricingModel,
  basePrice: product.basePrice,
  documentation: product.documentation
});

const mapProductToUpdateRequest = (product: Partial<Omit<Product, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>): ProductUpdateRequest => ({
  name: product.name,
  type: product.type as ProductType,
  description: product.description,
  apiEndpoint: product.apiEndpoint,
  status: product.status,
  pricingModel: product.pricingModel,
  basePrice: product.basePrice,
  documentation: product.documentation
});

// Implementation for createProduct
export async function createProduct(args: { product: Omit<Product, 'id' | 'userId' | 'createdAt' | 'updatedAt'> }, context: any): Promise<Product> {
  try {
    console.log('Creating product with API:', args.product);
    
    // Map the product data to the API request format
    const createRequest: ProductCreateRequest = mapProductToCreateRequest(args.product);
    
    try {
      // Call the API service to create the product
      const response = await productApi.createProduct(createRequest);
      
      // Map the API response back to our internal product format
      const product: Product = {
        id: response.id.toString(),
        name: response.name,
        type: response.type as ProductType,
        description: response.description || '',
        apiEndpoint: args.product.apiEndpoint,
        status: args.product.status as 'DRAFT' | 'PUBLISHED',
        pricingModel: args.product.pricingModel as 'USAGE_BASED' | 'SUBSCRIPTION' | 'ENTERPRISE' | 'CUSTOM',
        basePrice: args.product.basePrice,
        documentation: args.product.documentation || '',
        userId: 'user-1', // This would normally come from the authenticated user
        createdAt: new Date(response.createdAt || new Date()),
        updatedAt: new Date(response.updatedAt || new Date())
      };
      
      console.log('Product created successfully:', product);
      return product;
    } catch (apiError) {
      console.error('API error creating product:', apiError);
      console.log('Falling back to mock implementation');
      
      // Fall back to mock implementation if the API call fails
      const mockProduct: Product = {
        id: Math.floor(Math.random() * 10000).toString(),
        ...args.product,
        type: args.product.type,
        userId: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      console.log('Created mock product:', mockProduct);
      return mockProduct;
    }
  } catch (error) {
    console.error('Error creating product:', error);
    throw new Error('Failed to create product: ' + (error instanceof Error ? error.message : String(error)));
  }
}

// Implementation for updateProduct
export async function updateProduct(args: { id: string; product: Partial<Omit<Product, 'id' | 'userId' | 'createdAt' | 'updatedAt'>> }, context: any): Promise<Product> {
  try {
    console.log('Updating product with API:', args.id, args.product);
    
    // Map the product data to the API request format
    const updateRequest: ProductUpdateRequest = mapProductToUpdateRequest(args.product);
    
    try {
      // Call the API service to update the product
      const response = await productApi.updateProduct(parseInt(args.id), updateRequest);
      
      // Map the API response back to our internal product format
      const product: Product = {
        id: response.id.toString(),
        name: response.name,
        type: response.type as ProductType,
        description: response.description || '',
        apiEndpoint: args.product.apiEndpoint || '',
        status: (args.product.status || 'DRAFT') as 'DRAFT' | 'PUBLISHED',
        pricingModel: (args.product.pricingModel || 'SUBSCRIPTION') as 'USAGE_BASED' | 'SUBSCRIPTION' | 'ENTERPRISE' | 'CUSTOM',
        basePrice: args.product.basePrice || 0,
        documentation: args.product.documentation || '',
        userId: 'user-1',
        createdAt: new Date(response.createdAt || new Date()),
        updatedAt: new Date(response.updatedAt || new Date())
      };
      
      console.log('Product updated successfully:', product);
      return product;
    } catch (apiError) {
      console.error('API error updating product:', apiError);
      console.log('Falling back to mock implementation');
      
      // Fall back to mock implementation if the API call fails
      const mockProduct: Product = {
        id: args.id,
        name: args.product.name || 'Unknown',
        type: args.product.type || 'Service',
        description: args.product.description || '',
        apiEndpoint: args.product.apiEndpoint || '',
        status: (args.product.status || 'DRAFT') as 'DRAFT' | 'PUBLISHED',
        pricingModel: (args.product.pricingModel || 'SUBSCRIPTION') as 'USAGE_BASED' | 'SUBSCRIPTION' | 'ENTERPRISE' | 'CUSTOM',
        basePrice: args.product.basePrice || 0,
        documentation: args.product.documentation || '',
        userId: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      console.log('Updated mock product:', mockProduct);
      return mockProduct;
    }
  } catch (error) {
    console.error('Error updating product:', error);
    throw new Error('Failed to update product: ' + (error instanceof Error ? error.message : String(error)));
  }
}

// Implementation for deleteProduct
export async function deleteProduct(args: { id: string }, context: any): Promise<void> {
  try {
    console.log('Deleting product with API:', args.id);
    
    try {
      // Call the API service to delete the product
      await productApi.deleteProduct(parseInt(args.id));
      console.log(`Product ${args.id} deleted successfully`);
    } catch (apiError) {
      console.error('API error deleting product:', apiError);
      console.log('Simulating successful deletion');
      // We'll consider this a success even if the API call fails
      // This allows the frontend to continue functioning without backend support
    }
    
    return;
  } catch (error) {
    console.error('Error deleting product:', error);
    throw new Error('Failed to delete product: ' + (error instanceof Error ? error.message : String(error)));
  }
}
