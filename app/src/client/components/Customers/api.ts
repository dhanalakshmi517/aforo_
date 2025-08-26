import type { Customer } from "./Customers";

const BASE_URL = "http://43.206.110.213:8081/v1/api";

/**
 * Fetch customers list from backend.
 * Adjust the response parsing if API responds with different envelope structure.
 */
export async function getCustomers(): Promise<Customer[]> {
  const res = await fetch(`${BASE_URL}/customers`);
  if (!res.ok) {
    throw new Error(`API error ${res.status}`);
  }
  // API assumed to return array of customers directly. Update if wrapped.
  const data = await res.json();
  return data as Customer[];
}

/**
 * Fetch a single customer by id
 */
export async function getCustomer(customerId: number | string): Promise<Customer> {
  const res = await fetch(`${BASE_URL}/customers/${encodeURIComponent(customerId)}`);
  if (!res.ok) {
    throw new Error(`API error ${res.status}`);
  }
  const data = await res.json();
  return data as Customer;
}

/**
 * Delete customer by id
 */
/**
 * Update existing customer
 */
export async function updateCustomer(customerId: number | string, payload: Record<string, unknown> | FormData) {
  const isFormData = payload instanceof FormData;
  const res = await fetch(`${BASE_URL}/customers/${encodeURIComponent(customerId)}`, {
    method: 'PUT',
    headers: isFormData ? undefined : { 'Content-Type': 'application/json' },
    body: isFormData ? payload : JSON.stringify(payload),
  });
  if (!res.ok) {
    let msg = `Failed to update (status ${res.status})`;
    try {
      const data = await res.json();
      if (data?.message) msg = data.message;
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export async function deleteCustomer(customerId: number | string): Promise<void> {
  const url = `${BASE_URL}/customers/${encodeURIComponent(customerId)}`;
  const res = await fetch(url, { method: 'DELETE' });
  if (!res.ok) {
    let msg = `Failed to delete (status ${res.status})`;
    try {
      const data = await res.json();
      if (data?.message) msg = data.message;
    } catch {}
    throw new Error(msg);
  }
}
