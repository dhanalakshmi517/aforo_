import axios from '../../utils/axiosInstance';
import { getAuthHeaders } from '../../utils/auth';

declare global {
  interface Window {
    __subscriptionLogs?: string[];
  }
}

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

const SUBSCRIPTIONS_BASE_URL = 'http://34.228.66.74:8084/api/subscriptions';
const CUSTOMERS_BASE_URL = 'http://44.201.19.187:8081/v1/api/customers';
const PRODUCTS_BASE_URL = 'http://3.208.93.68:8080/api/products';
const RATE_PLANS_URL = 'http://3.208.93.68:8080/api/rateplans';

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
  status?: string;
  isDraft?: boolean;
}): Promise<Subscription> => {
  try {
    console.log('Creating subscription with payload:', JSON.stringify(payload, null, 2));
    
    // Skip validations for drafts
    const isDraft = payload.isDraft !== false; // Default to true if not specified
    
    const requestPayload: any = {
      status: payload.status || 'DRAFT',
      organizationId: localStorage.getItem('organizationId'),
      isDraft
    };
    
    // Only include fields that have values
    if (payload.customerId) requestPayload.customerId = Number(payload.customerId);
    if (payload.productId) requestPayload.productId = Number(payload.productId);
    if (payload.ratePlanId) requestPayload.ratePlanId = Number(payload.ratePlanId);
    if (payload.paymentType) requestPayload.paymentType = payload.paymentType;
    if (payload.adminNotes) requestPayload.adminNotes = payload.adminNotes;

    console.log('Sending request to:', SUBSCRIPTIONS_BASE_URL);
    console.log('Request payload:', JSON.stringify(requestPayload, null, 2));
    
    const response = await axios.post(
      SUBSCRIPTIONS_BASE_URL,
      requestPayload,
      { 
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        validateStatus: (status) => status < 500 // Don't throw for 4xx errors
      }
    );

    console.log('Subscription created successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error creating subscription:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error message:', error.message);
    }
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

export const confirmSubscription = async (id: number): Promise<Subscription> => {
  try {
    const { data } = await axios.post(
      `${SUBSCRIPTIONS_BASE_URL}/${id}/confirm`,
      {
        organizationId: localStorage.getItem('organizationId')
      },
      { headers: getAuthHeaders() }
    );
    return data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Helper function for reliable logging
const log = (...args: any[]) => {
  // Try multiple ways to log to ensure it works in all environments
  try {
    // Standard console.log
    console.log(...args);
    
    // Also log to window.console if available (for some browser environments)
    if (typeof window !== 'undefined' && window.console) {
      window.console.log(...args);
    }
    
    // For environments that might override console methods
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join(' ')}`;
    
    // Log with timestamps
    console.log(logMessage);
    
    // Also log to a global array for debugging
    if (typeof window !== 'undefined') {
      if (!window.__subscriptionLogs) {
        window.__subscriptionLogs = [];
      }
      window.__subscriptionLogs.push(logMessage);
    }
  } catch (logError) {
    // If all else fails, use the most basic logging possible
    try {
      console.error('Logging error:', logError);
      console.log('Raw log data:', args);
    } catch (e) {
      // Last resort
    }
  }
};

/**
 * Creates a new subscription and immediately confirms it
 * @param payload Subscription creation payload
 * @returns Confirmed subscription
 */
export const createAndConfirmSubscription = async (
  payload: Omit<Parameters<typeof createSubscription>[0], 'isDraft'>
): Promise<Subscription> => {
  log('🚀 Starting subscription creation with payload:', JSON.stringify(payload, null, 2));
  
  try {
    // First create the subscription
    log('Step 1/2: Creating subscription...');
    const newSubscription = await createSubscription({
      ...payload,
      isDraft: false
    });
    
    log('✅ Step 1/2: Subscription created successfully');
    log('📄 Subscription details:', JSON.stringify({
      id: newSubscription.subscriptionId,
      status: newSubscription.status,
      customerId: newSubscription.customerId,
      productId: newSubscription.productId
    }, null, 2));
    
    if (!newSubscription || !newSubscription.subscriptionId) {
      throw new Error('Invalid subscription response: missing subscriptionId');
    }
    
    // Add a small delay to ensure the subscription is fully processed
    await new Promise(resolve => setTimeout(resolve, 500));
    
    log('\nStep 2/2: Attempting to confirm subscription...');
    log(`📞 Calling confirm API: POST ${SUBSCRIPTIONS_BASE_URL}/${newSubscription.subscriptionId}/confirm`);
    
    try {
      // Call confirmSubscription with the new subscription ID
      const confirmedSubscription = await confirmSubscription(newSubscription.subscriptionId);
      
      log('✅ Step 2/2: Subscription confirmed successfully!');
      log('📋 Confirmed subscription details:', JSON.stringify({
        id: confirmedSubscription.subscriptionId,
        status: confirmedSubscription.status,
        confirmedAt: new Date().toISOString()
      }, null, 2));
      
      return confirmedSubscription;
    } catch (confirmError: any) {
      log('❌ Confirmation failed:', confirmError);
      if (confirmError?.response) {
        log('📊 Confirmation error response:', {
          status: confirmError.response.status,
          data: confirmError.response.data,
          headers: confirmError.response.headers
        });
      }
      throw confirmError; // Re-throw to be caught by the outer catch
    }
  } catch (error: any) {
    // Log the error using our reliable logging function
    log('❌ Error in createAndConfirmSubscription:', error);
    log('❌ Failed payload:', JSON.stringify(payload, null, 2));
    
    // Log detailed error information
    if (error?.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      log('📊 Error response data:', error.response.data);
      log('🔢 Error status code:', error.response.status);
      log('📋 Error headers:', error.response.headers);
    } else if (error?.request) {
      // The request was made but no response was received
      log('❌ No response received. Request details:', error.request);
    } else if (error?.message) {
      // Something happened in setting up the request that triggered an Error
      log('❌ Request setup error:', error.message);
    } else {
      log('❌ Unknown error occurred:', error);
    }
    
    // Also log the full error stack for debugging
    if (error?.stack) {
      log('🔍 Error stack:', error.stack);
    }
    
    // Check if we can access the logs array
    if (typeof window !== 'undefined' && window.__subscriptionLogs) {
      log('📜 Full log history:', window.__subscriptionLogs);
    }
    
    return handleApiError(error);
  }
};

// -----------------------------------------------------------------------------
// Backward compatibility: preserve previous `Api` object interface used by UI
// -----------------------------------------------------------------------------
export const Api = {
  getProducts,
  getCustomers,
  createSubscription,
  createAndConfirmSubscription,
  getRatePlans,
  getSubscriptions,
  getSubscription,
  updateSubscription,
  deleteSubscription,
  confirmSubscription,
  // draft helpers
  createSubscriptionDraft: (p: Omit<Subscription,'subscriptionId'>&{isDraft?:boolean})=>createSubscription({ ...p, isDraft:true } as any),
  updateSubscriptionDraft: (id:number,p:Partial<Subscription>)=>updateSubscription(id,{...p,isDraft:true}),
};
