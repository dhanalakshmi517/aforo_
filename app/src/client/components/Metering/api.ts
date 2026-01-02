// api.ts — full updated file

export interface Product {
  productId: number;
  productName: string;
  productType: string;
  version: string;
  productDescription: string | null;
  tags: Record<string, unknown>;
}

export interface UsageMetricDTO {
  metricId: number;
  metricName: string;
  productId: number;
  productName: string;
  unitOfMeasure: string;
  version?: string;
  description?: string;
  aggregationFunction?: string;
  aggregationWindow?: string;
  billingCriteria?: string;
  usageConditions?: Array<{
    dimension: string;
    operator: string;
    value: string;
  }>;
  productType?: string;
  status?: string;
  createdOn?: string;
}

export interface UsageConditionPayload {
  dimension: string;
  operator: string;
  value: string;
}

export interface BillableMetricPayload {
  metricName: string;
  productId: number;
  unitOfMeasure: string;
  usageConditions: UsageConditionPayload[];
  version?: string;
  description?: string;
  aggregationFunction?: string;
  aggregationWindow?: string;
  billingCriteria?: string;
}

export interface CreateMetricResult {
  ok: boolean;
  id?: number;
}

// -------------------------------
// Base URLs & auth
// -------------------------------
import { getAuthHeaders } from '../../utils/auth';

const METRICS_BASE_URL =
  (import.meta as any).env?.VITE_METRICS_API_URL || 'http://54.146.189.144:8081/api';

const PRODUCTS_BASE_URL =
  (import.meta as any).env?.VITE_PRODUCTS_API_URL || 'http://3.208.93.68:8080/api';

// -------------------------------
// Metrics list & read
// -------------------------------
export async function getUsageMetrics(): Promise<UsageMetricDTO[]> {
  try {
    const response = await fetch(`${METRICS_BASE_URL}/billable-metrics`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error(`API error with status ${response.status}`);

    const payload = await response.json();
    const data = Array.isArray(payload)
      ? payload
      : Array.isArray((payload as any)?.data)
        ? (payload as any).data
        : Array.isArray((payload as any)?.content)
          ? (payload as any).content
          : [];

    return data;
  } catch (error) {
    console.error('Error fetching usage metrics:', error);
    return [];
  }
}

export async function getUsageMetric(id: number): Promise<UsageMetricDTO | null> {
  try {
    const response = await fetch(`${METRICS_BASE_URL}/billable-metrics/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) return null;

    const data = await response.json();

    // If the API doesn't return usageConditions, initialize it as an empty array
    if (!data.usageConditions) {
      data.usageConditions = [];
    }

    return data;
  } catch (e) {
    console.error('Error fetching metric', e);
    return null;
  }
}

// -------------------------------
// Delete
// -------------------------------
export async function deleteUsageMetric(id: number): Promise<boolean> {
  try {
    const response = await fetch(`${METRICS_BASE_URL}/billable-metrics/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return response.ok;
  } catch (error) {
    console.error('Error deleting usage metric:', error);
    return false;
  }
}

// -------------------------------
// Create
// -------------------------------
export async function createBillableMetric(
  payload: BillableMetricPayload
): Promise<CreateMetricResult> {
  try {
    console.log('Creating billable metric with payload:', JSON.stringify(payload, null, 2));
    const response = await fetch(`${METRICS_BASE_URL}/billable-metrics`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    console.log('Create response status:', response.status);

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      try {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        errorMessage += `: ${JSON.stringify(errorData)}`;
      } catch {
        errorMessage += ': No error details available';
      }
      console.error('Failed to create billable metric:', errorMessage);
      return { ok: false };
    }

    try {
      const data = await response.json();
      console.log('Create success response:', data);
      const id = (data?.metricId ?? data?.id ?? data?.billableMetricId) as
        | number
        | undefined;
      return { ok: true, id };
    } catch {
      // No body / not JSON — still OK
      console.log('Create successful but no response body');
      return { ok: true };
    }
  } catch (error) {
    console.error('Error creating billable metric:', error);
    return { ok: false };
  }
}

// -------------------------------
// Update (PUT)
// Body may include metricId for backends that validate path vs body.
// -------------------------------
export type BillableMetricDetails = Partial<BillableMetricPayload> & {
  metricId?: number;
};

export async function updateBillableMetric(
  metricId: number,
  payload: BillableMetricDetails
): Promise<boolean> {
  try {
    const response = await fetch(`${METRICS_BASE_URL}/billable-metrics/${metricId}`, {
      method: 'PUT',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    return response.ok;
  } catch (error) {
    console.error('Error updating billable metric:', error);
    return false;
  }
}

// -------------------------------
// Finalize
// -------------------------------
export async function finalizeBillableMetric(metricId: number): Promise<boolean> {
  try {
    const response = await fetch(
      `${METRICS_BASE_URL}/billable-metrics/${metricId}/finalize`,
      { method: 'POST', headers: getAuthHeaders() }
    );

    if (!response.ok) {
      // Log the error details
      console.error('❌ Finalize failed with status:', response.status);
      try {
        const errorData = await response.json();
        console.error('❌ Finalize error details:', JSON.stringify(errorData, null, 2));
      } catch {
        console.error('❌ No error details in response body');
      }
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error finalizing billable metric:', error);
    return false;
  }
}

// -------------------------------
// Products (for product dropdown)
// -------------------------------
export async function getProducts(): Promise<Product[]> {
  try {
    console.log('getProducts API call started');
    console.log('Products API URL:', `${PRODUCTS_BASE_URL}/products`);
    console.log('Auth headers:', getAuthHeaders());

    const response = await fetch(`${PRODUCTS_BASE_URL}/products`, {
      headers: getAuthHeaders(),
    });

    console.log('Products API response status:', response.status, response.statusText);

    if (!response.ok) {
      console.error('Products API error - Status:', response.status);
      throw new Error(`API error with status ${response.status}`);
    }

    const payload = await response.json();
    console.log('Products API raw payload:', payload);

    const data = Array.isArray(payload)
      ? payload
      : Array.isArray((payload as any)?.data)
        ? (payload as any).data
        : Array.isArray((payload as any)?.content)
          ? (payload as any).content
          : [];

    console.log('Products API processed data:', data);
    console.log('Products count:', data.length);

    return data;
  } catch (error) {
    console.error('Error fetching products:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return [];
  }
}
