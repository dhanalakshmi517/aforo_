// Shared API utilities for Landing page components
// Keep all fetch logic centralized for easier maintenance and testing.

export interface OrganizationPayload {
  firstName: FormDataEntryValue | null;
  lastName: FormDataEntryValue | null;
  company: FormDataEntryValue | null;
  businessEmail: FormDataEntryValue | null;
  role: FormDataEntryValue | null;
  employeeSize: FormDataEntryValue | null;
  country: FormDataEntryValue | null;
  phoneNumber: FormDataEntryValue | null;
  howCanWeHelp: FormDataEntryValue | null;
  marketingOptIn: boolean;
}

const BASE_URL = "http://43.206.110.213:8081";

/**
 * Create a new organization contact from Landing form.
 * Throws an Error if the request fails.
 */
export async function createOrganization(payload: OrganizationPayload) {
  const res = await fetch(`${BASE_URL}/v1/api/organizations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(await res.text());
  }
  return res.json();
}
