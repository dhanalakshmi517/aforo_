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
  version: string;
  unitOfMeasure: string;
  description: string;
  aggregationFunction: string;
  aggregationWindow: string;
  billingCriteria: string;
}

// Separate base URLs: one for billable metrics (typically local Swagger) and one for products service.
// Updated to point to new metrics service endpoint
import { getAuthHeaders } from '../../utils/auth';

const METRICS_BASE_URL = (import.meta as any).env?.VITE_METRICS_API_URL || 'http://18.182.19.181:8081/api';
const PRODUCTS_BASE_URL = (import.meta as any).env?.VITE_PRODUCTS_API_URL || 'http://54.238.204.246:8080/api';

export async function getUsageMetrics(): Promise<UsageMetricDTO[]> {
  try {
    const response = await fetch(`${METRICS_BASE_URL}/billable-metrics`, {
    headers: getAuthHeaders(),
  });
    if (!response.ok) {
      throw new Error(`API error with status ${response.status}`);
    }
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

export interface UsageConditionPayload {
  dimension: string;
  operator: string;
  value: string;
}

export interface BillableMetricPayload {
  billingCriteria?: string;
  metricName: string;
  productId: number;
  version: string;
  unitOfMeasure: string;
  description: string;
  aggregationFunction: string;
  aggregationWindow: string;
  usageConditions: UsageConditionPayload[];
}

export interface CreateMetricResult {
  ok: boolean;
  id?: number;
}

export async function createBillableMetric(payload: BillableMetricPayload): Promise<CreateMetricResult> {
  try {
    const response = await fetch(`${METRICS_BASE_URL}/billable-metrics`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      return { ok: false };
    }
    // Try to parse the created metric ID from the response JSON (if any)
    try {
      const data = await response.json();
      const id = (data?.metricId ?? data?.id ?? data?.billableMetricId) as number | undefined;
      return { ok: true, id };
    } catch {
      // If response has no JSON body, just return success
      return { ok: true };
    }
  } catch (error) {
    console.error('Error creating billable metric:', error);
    return { ok: false };
  }
}

export type BillableMetricDetails = Partial<BillableMetricPayload> & { metricId?: number };

export async function updateBillableMetric(metricId: number, payload: BillableMetricDetails): Promise<boolean> {
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

export async function finalizeBillableMetric(metricId: number): Promise<boolean> {
  try {
    const response = await fetch(`${METRICS_BASE_URL}/billable-metrics/${metricId}/finalize`, { method: 'POST', headers: getAuthHeaders() });
    return response.ok;
  } catch (error) {
    console.error('Error finalizing billable metric:', error);
    return false;
  }
}

export async function getProducts(): Promise<Product[]> {
  try {
    const response = await fetch(`${PRODUCTS_BASE_URL}/products`, { headers: getAuthHeaders() });
    if (!response.ok) {
      throw new Error(`API error with status ${response.status}`);
    }
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
    console.error('Error fetching products:', error);
    return [];
  }
}
