import axios from '../../utils/axiosInstance';

export interface Product {
  productId: number;
  productName: string;
  [key: string]: any;
}

export interface Customer {
  customerId: number;
  customerName: string;
  [key: string]: any;
}

export interface RatePlan {
  ratePlanId: number;
  ratePlanName: string;
  [key: string]: any;
}

const BASE_URL = 'http://54.238.204.246:8080/api';

export const Api = {
  async getProducts(): Promise<Product[]> {
    const { data } = await axios.get(`${BASE_URL}/products`);
    return data;
  },

  async getCustomers(): Promise<Customer[]> {
    const { data } = await axios.get('http://43.206.110.213:8081/v1/api/customers');
    return data;
  },

  async createSubscription(payload: {
    customerId: number;
    productId: number;
    ratePlanId: number;
    paymentType: string;
    adminNotes: string;
  }): Promise<any> {
    const { data } = await axios.post('http://13.113.70.183:8084/api/subscriptions', payload);
    return data;
  },

  async getRatePlans(): Promise<RatePlan[]> {
    const { data } = await axios.get(`${BASE_URL}/rateplans`);
    return data;
  },
};
