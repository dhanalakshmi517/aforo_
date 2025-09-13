import axios from '../../utils/axiosInstance';
import { getAuthHeaders } from '../../utils/auth';

// Error handler for API requests
const handleApiError = (error: any) => {
  if (error.response?.status === 401) {
    // Token expired or invalid, redirect to login
    window.location.href = '/login';
  }
  throw error;
};

// Helper function to get common request config
const getRequestConfig = () => ({
  headers: getAuthHeaders(),
  params: {
    organizationId: localStorage.getItem('organizationId')
  }
});

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

export interface Subscription {
  subscriptionId: number;
  customerId: number;
  productId: number;
  ratePlanId: number;
  status: string;
  startDate: string;
  endDate?: string;
  [key: string]: any;
}

const SUBSCRIPTIONS_BASE_URL = 'http://13.113.70.183:8084/api/subscriptions';
const CUSTOMERS_BASE_URL = 'http://43.206.110.213:8081/v1/api/customers';
const PRODUCTS_BASE_URL = 'http://54.238.204.246:8080/api/products';
const RATE_PLANS_URL = 'http://54.238.204.246:8080/api/rateplans';

export const getProducts = async (): Promise<Product[]> => {
  try {
    const { data } = await axios.get(PRODUCTS_BASE_URL, getRequestConfig());
    return data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getCustomers = async (): Promise<Customer[]> => {
  try {
    const { data } = await axios.get(CUSTOMERS_BASE_URL, getRequestConfig());
    return data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Create new subscription (draft or final)
export const createSubscription = async (payload: {
  customerId: number;
  productId: number;
  ratePlanId: number;
  paymentType: string;
  adminNotes: string;
}): Promise<Subscription> => {
  try {
    const { data } = await axios.post(
      SUBSCRIPTIONS_BASE_URL,
      {
        ...payload,
        organizationId: localStorage.getItem('organizationId')
      },
      { headers: getAuthHeaders() }
    );
    return data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getRatePlans = async (): Promise<any[]> => {
  try {
    const { data } = await axios.get(RATE_PLANS_URL, getRequestConfig());
    return data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getSubscriptions = async (): Promise<Subscription[]> => {
  try {
    const { data } = await axios.get(SUBSCRIPTIONS_BASE_URL, getRequestConfig());
    return data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getSubscription = async (id: number): Promise<Subscription> => {
  try {
    const { data } = await axios.get(
      `${SUBSCRIPTIONS_BASE_URL}/${id}`,
      getRequestConfig()
    );
    return data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const updateSubscription = async (
  id: number,
  payload: Partial<Subscription>
): Promise<Subscription> => {
  try {
    const { data } = await axios.patch(
      `${SUBSCRIPTIONS_BASE_URL}/${id}`,
      {
        ...payload,
        organizationId: localStorage.getItem('organizationId')
      },
      { headers: getAuthHeaders() }
    );
    return data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const deleteSubscription = async (id: number): Promise<void> => {
  try {
    await axios.delete(
      `${SUBSCRIPTIONS_BASE_URL}/${id}`,
      getRequestConfig()
    );
  } catch (error) {
    handleApiError(error);
  }
};

// -----------------------------------------------------------------------------
// Backward compatibility: preserve previous `Api` object interface used by UI
// -----------------------------------------------------------------------------
export const Api = {
  getProducts,
  getCustomers,
  createSubscription,
  getRatePlans,
  getSubscriptions,
  getSubscription,
  updateSubscription,
  deleteSubscription,
  // draft helpers
  createSubscriptionDraft: (p: Omit<Subscription,'subscriptionId'>&{isDraft?:boolean})=>createSubscription({ ...p, isDraft:true } as any),
  updateSubscriptionDraft: (id:number,p:Partial<Subscription>)=>updateSubscription(id,{...p,isDraft:true}),
};
