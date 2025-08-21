import type { AccountDetailsData } from './components/Customers/AccountDetailsForm';

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

export async function createCustomer(payload: CreateCustomerPayload | FormData) {
  const isFormData = payload instanceof FormData;
  const res = await fetch(`${BASE_URL}/customers`, {
    method: 'POST',
    headers: isFormData ? undefined : { 'Content-Type': 'application/json' },
    body: isFormData ? payload : JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to create customer');
  return res.json();
}
