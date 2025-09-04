import type { Customer } from "./Customers";
import { getAuthHeaders, isAuthenticated, logout } from "../../utils/auth";

const BASE_URL = "http://43.206.110.213:8081/v1/api";

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

/**
 * Fetch customers list from backend with authentication.
 * Only returns customers for the authenticated organization.
 */
export async function getCustomers(): Promise<Customer[]> {
  if (!isAuthenticated()) {
    throw new Error('Not authenticated');
  }
  
  const res = await fetch(`${BASE_URL}/customers`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  
  const data = await handleApiResponse(res);
  return data as Customer[];
}

/**
 * Fetch a single customer by id with authentication
 */
export async function getCustomer(customerId: number | string): Promise<Customer> {
  if (!isAuthenticated()) {
    throw new Error('Not authenticated');
  }
  
  const res = await fetch(`${BASE_URL}/customers/${encodeURIComponent(customerId)}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  
  const data = await handleApiResponse(res);
  return data as Customer;
}

/**
 * Update existing customer with authentication
 */
export async function updateCustomer(customerId: number | string, payload: Record<string, unknown> | FormData) {
  if (!isAuthenticated()) {
    throw new Error('Not authenticated');
  }
  
  const isFormData = payload instanceof FormData;
  // remove blank values that backend may reject (e.g., enum fields)
  const sanitized = isFormData
    ? payload
    : Object.fromEntries(
        Object.entries(payload as Record<string, unknown>).filter(
          ([, v]) => v !== '' && v !== null && v !== undefined,
        ),
      );
  // backend rule: customerCountry required when phoneNumber present. If missing, drop phoneNumber for draft saves.
  if (!('customerCountry' in sanitized) || !sanitized.customerCountry) {
    delete (sanitized as Record<string, unknown>).phoneNumber;
  }
  
  const bodyInit: BodyInit | undefined = isFormData ? (sanitized as FormData) : JSON.stringify(sanitized);
  const headers = isFormData ? getAuthHeaders() : { ...getAuthHeaders() };
  
  // Remove Content-Type for FormData to let browser set it with boundary
  if (isFormData && headers['Content-Type']) {
    delete headers['Content-Type'];
  }
  
  const res = await fetch(`${BASE_URL}/customers/${encodeURIComponent(customerId)}`, {
    method: 'PATCH',
    headers,
    body: bodyInit,
  });
  
  return handleApiResponse(res);
}

// Confirm customer with authentication
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

export async function deleteCustomer(customerId: number | string): Promise<void> {
  if (!isAuthenticated()) {
    throw new Error('Not authenticated');
  }
  
  const url = `${BASE_URL}/customers/${encodeURIComponent(customerId)}`;
  const res = await fetch(url, { 
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  
  await handleApiResponse(res);
}
