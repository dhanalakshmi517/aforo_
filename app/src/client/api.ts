import type { AccountDetailsData } from './components/Customers/AccountDetailsForm';
import { getAuthHeaders, isAuthenticated, logout } from './utils/auth';

const BASE_URL = 'http://43.206.110.213:8081/v1/api';

export interface LoginPayload {
  businessEmail: string;
  password: string;
}

export async function login(payload: LoginPayload) {
  const res = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Login failed');
  return res.json();
}

export interface CreateCustomerPayload {
  companyName: string;
  customerName: string;
  companyType: string;
  phoneNumber: string;
  primaryEmail: string;
  additionalEmailRecipients: string[];
  customerAddressLine1: string;
  customerAddressLine2: string;
  customerCity: string;
  customerState: string;
  customerPostalCode: string;
  customerCountry: string;
  billingSameAsCustomer: boolean;
  billingAddressLine1: string;
  billingAddressLine2: string;
  billingCity: string;
  billingState: string;
  billingPostalCode: string;
  billingCountry: string;
}

/**
 * Handle API response errors and authentication
 */
async function handleApiResponse(res: Response): Promise<any> {
  if (res.status === 401) {
    // Unauthorized - clear auth data and redirect to login
    logout();
    throw new Error('Session expired. Please login again.');
  }
  
  if (!res.ok) {
    let errorMessage = `API error ${res.status}`;
    try {
      const errorData = await res.json();
      if (errorData?.message) {
        errorMessage = errorData.message;
      }
    } catch {
      // If response is not JSON, use status text
      errorMessage = res.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }
  
  return res.json();
}

export async function createCustomer(payload: CreateCustomerPayload | FormData) {
  if (!isAuthenticated()) {
    throw new Error('Not authenticated');
  }
  
  const isFormData = payload instanceof FormData;
  const headers = isFormData ? getAuthHeaders() : { ...getAuthHeaders() };
  
  // Remove Content-Type for FormData to let browser set it with boundary
  if (isFormData && headers['Content-Type']) {
    delete headers['Content-Type'];
  }
  
  const res = await fetch(`${BASE_URL}/customers`, {
    method: 'POST',
    headers,
    body: isFormData ? payload : JSON.stringify(payload),
  });
  
  return handleApiResponse(res);
}

// Confirm customer after creation with authentication
export async function confirmCustomer(customerId: number | string) {
  if (!isAuthenticated()) {
    throw new Error('Not authenticated');
  }
  
  const res = await fetch(`${BASE_URL}/customers/${encodeURIComponent(customerId)}/confirm`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  
  return handleApiResponse(res);
}
