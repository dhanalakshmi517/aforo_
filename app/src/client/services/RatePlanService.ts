import axios from 'axios';

interface RatePlanData {
  ratePlanName: string;
  productId: string;
  description: string;
  pricingModel: string;
  billingFrequency: string;
}

export class RatePlanService {
  private static BASE_URL = 'http://13.230.194.245:8080/api';

  static async createRatePlan(data: RatePlanData) {
    try {
      const response = await axios.post(`${this.BASE_URL}/rateplans`, data);
      return response.data;
    } catch (error: any) {
      throw new Error('Failed to create rate plan: ' + error.message);
    }
  }

  static async getProducts() {
    try {
      const response = await axios.get(`${this.BASE_URL}/products`);
      return response.data;
    } catch (error: any) {
      throw new Error('Failed to fetch products: ' + error.message);
    }
  }
}
