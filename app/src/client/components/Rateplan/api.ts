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

// -------------------- Rate Plans --------------------
export interface RatePlan {
  ratePlanId: number;
  ratePlanName: string;
  description: string;
  ratePlanType: string;
  billingFrequency: string;
  productId: number;
  productName?: string;
  status?: string;
  // Add any additional fields returned by backend here
}

/**
 * Fetch all rate plans from the backend service
 */
export const fetchRatePlans = async (): Promise<RatePlan[]> => {
  const response = await axios.get(`${BASE_URL}/rateplans`);
  return response.data;
};

/**
 * Fetch all products from the backend service
 */
export const fetchProducts = async (): Promise<Product[]> => {
  const response = await axios.get(`${BASE_URL}/products`);
  return response.data;
};

/**
 * Delete a rate plan by id
 */
export const deleteRatePlan = async (id: number): Promise<void> => {
  await axios.delete(`${BASE_URL}/rateplans/${id}`);
};
