// Product type (same as in productActions.ts)
import { ProductType } from '../components/CreateProductForm';

type Product = {
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

import { productApi, ProductResponse } from '../../services/api';

// Convert backend response to our internal Product type
const mapResponseToProduct = (response: ProductResponse): Product => ({
  id: response.id.toString(), // Convert numeric ID to string
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

// Implementation for getProducts
export async function getProducts(context: any): Promise<Product[]> {
  try {
    console.log('Fetching products from API');
    const products = await productApi.getAllProducts();
    console.log('Products received from API:', products);
    return products.map(mapResponseToProduct);
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error; // Don't use mock data, throw the error to be handled by the UI
  }
}

// Implementation for getProductById
export async function getProductById(args: { id: string }, context: any): Promise<Product | null> {
  try {
    console.log('Fetching product by ID from API:', args.id);
    const product = await productApi.getProductById(parseInt(args.id));
    return mapResponseToProduct(product);
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    throw error; // Don't use mock data, throw the error to be handled by the UI
  }
}
