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
 * Delete customer by id
 */
export async function deleteCustomer(customerId: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/customers/${customerId}`, { method: 'DELETE' });
  if (!res.ok) {
    throw new Error(`Failed to delete (status ${res.status})`);
  }
}
