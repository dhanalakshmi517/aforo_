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
  const res = await fetch(`${BASE_URL}/customers/${encodeURIComponent(customerId)}`, {
    method: 'PATCH',
    headers: isFormData ? undefined : { 'Content-Type': 'application/json' },
    body: bodyInit,
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

// Confirm customer
export async function confirmCustomer(customerId: number | string) {
  const res = await fetch(`${BASE_URL}/customers/${encodeURIComponent(customerId)}/confirm`, {
    method: 'POST',
  });
  if (!res.ok) {
    let msg = `Failed to confirm (status ${res.status})`;
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
