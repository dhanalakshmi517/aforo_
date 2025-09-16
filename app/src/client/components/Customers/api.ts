import type { Customer } from "./Customers";
import { getAuthHeaders, isAuthenticated, logout } from "../../utils/auth";

const BASE_URL = "http://43.206.110.213:8081/v1/api";

/**
 * Handle API response errors and authentication
 */
async function handleApiResponse(res: Response): Promise<any> {
  if (res.status === 401) {
    logout();
    throw new Error('Session expired. Please login again.');
  }
  if (!res.ok) {
    let errorMessage = `API error ${res.status}`;
    try {
      const errorData = await res.json();
      if (errorData?.message) errorMessage = errorData.message;
    } catch {
      errorMessage = res.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  const contentLength = res.headers.get('content-length');
  const contentType = res.headers.get('content-type');
  if (contentLength === '0' || (!contentType?.includes('application/json') && !contentLength)) {
    return null;
  }
  try {
    const text = await res.text();
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

/** Get all customers */
export async function getCustomers(): Promise<Customer[]> {
  if (!isAuthenticated()) throw new Error('Not authenticated');
  const res = await fetch(`${BASE_URL}/customers`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  const data = await handleApiResponse(res);
  return data as Customer[];
}

/** Get one customer */
export async function getCustomer(customerId: number | string): Promise<Customer> {
  if (!isAuthenticated()) throw new Error('Not authenticated');
  const res = await fetch(`${BASE_URL}/customers/${encodeURIComponent(customerId)}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  const data = await handleApiResponse(res);
  return data as Customer;
}

/** Update customer (PATCH) */
export async function updateCustomer(customerId: number | string, payload: Record<string, unknown> | FormData) {
  if (!isAuthenticated()) throw new Error('Not authenticated');

  const isFormData = payload instanceof FormData;
  const sanitized = isFormData
    ? payload
    : Object.fromEntries(
        Object.entries(payload as Record<string, unknown>).filter(
          ([, v]) => v !== '' && v !== null && v !== undefined,
        ),
      );

  if (!(sanitized as any).customerCountry) {
    delete (sanitized as Record<string, unknown>).phoneNumber;
  }

  const headers = isFormData ? getAuthHeaders() : { ...getAuthHeaders() };
  if (isFormData && headers['Content-Type']) delete headers['Content-Type'];

  const res = await fetch(`${BASE_URL}/customers/${encodeURIComponent(customerId)}`, {
    method: 'PATCH',
    headers,
    body: isFormData ? (sanitized as FormData) : JSON.stringify(sanitized),
  });

  return handleApiResponse(res);
}

/** Confirm customer */
export async function confirmCustomer(customerId: number | string) {
  if (!isAuthenticated()) throw new Error('Not authenticated');
  const res = await fetch(`${BASE_URL}/customers/${encodeURIComponent(customerId)}/confirm`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  return handleApiResponse(res);
}

/** Create customer (POST) */
export async function createCustomer(payload: Record<string, unknown> | FormData) {
  if (!isAuthenticated()) throw new Error('Not authenticated');

  const isFormData = payload instanceof FormData;
  const headers = isFormData ? getAuthHeaders() : { ...getAuthHeaders() };
  if (isFormData && headers['Content-Type']) delete headers['Content-Type'];

  const res = await fetch(`${BASE_URL}/customers`, {
    method: 'POST',
    headers,
    body: isFormData ? (payload as FormData) : JSON.stringify(payload),
  });

  return handleApiResponse(res);
}

/** Email existence check */
export async function checkEmailExists(email: string): Promise<boolean> {
  if (!isAuthenticated()) throw new Error('Not authenticated');
  try {
    const customers = await getCustomers();
    return customers.some(c => (c as any).primaryEmail?.toLowerCase() === email.toLowerCase());
  } catch (error) {
    console.error('Error checking email:', error);
    return false;
  }
}

/** Delete customer */
export async function deleteCustomer(customerId: number | string): Promise<void> {
  if (!isAuthenticated()) throw new Error('Not authenticated');
  const url = `${BASE_URL}/customers/${encodeURIComponent(customerId)}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  await handleApiResponse(res);
}

/* ─────────────── NEW: Logo endpoints ─────────────── */

/** PATCH /v1/api/customers/{customerId}/logo */
export async function updateCustomerLogo(customerId: number | string, file: File) {
  if (!isAuthenticated()) throw new Error('Not authenticated');
  const fd = new FormData();
  // backend expects 'companyLogo' (same as Create)
  fd.append('companyLogo', file, file.name);

  const headers = getAuthHeaders();
  if (headers['Content-Type']) delete headers['Content-Type']; // let browser set boundary

  const res = await fetch(
    `${BASE_URL}/customers/${encodeURIComponent(customerId)}/logo`,
    { method: 'PATCH', headers, body: fd }
  );
  return handleApiResponse(res);
}

/** DELETE /v1/api/customers/{customerId}/logo */
export async function deleteCustomerLogo(customerId: number | string) {
  if (!isAuthenticated()) throw new Error('Not authenticated');
  const res = await fetch(
    `${BASE_URL}/customers/${encodeURIComponent(customerId)}/logo`,
    { method: 'DELETE', headers: getAuthHeaders() }
  );
  return handleApiResponse(res);
}
