import axios from 'axios';

export interface Product {
  productId: number;
  productName: string;
  [key: string]: any;
}

export interface RatePlan {
  ratePlanId: number;
  ratePlanName: string;
  [key: string]: any;
}

const BASE_URL = 'http://13.230.194.245:8080/api';

export const Api = {
  async getProducts(): Promise<Product[]> {
    const { data } = await axios.get(`${BASE_URL}/products`);
    return data;
  },

  async getRatePlans(): Promise<RatePlan[]> {
    const { data } = await axios.get(`${BASE_URL}/rateplans`);
    return data;
  },
};
