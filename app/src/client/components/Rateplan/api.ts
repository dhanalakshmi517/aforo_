import axios from 'axios';

export interface Product {
  productId: string;
  productName: string;
  productType: string;
  version: string;
  productDescription: string;
  tags: Record<string, any>;
  category: string;
  visibility: boolean;
  status: string;
  internalSkuCode: string;
  uom: string;
  effectiveStartDate: string;
  effectiveEndDate: string | null;
}

export const BASE_URL = 'http://13.230.194.245:8080/api';

/**
 * Fetch all products from the backend service
 */
export const fetchProducts = async (): Promise<Product[]> => {
  const response = await axios.get(`${BASE_URL}/products`);
  return response.data;
};
