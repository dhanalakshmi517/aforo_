// API functions specific to EditMetering module
import type { Product } from '../api';
export type { Product };
// Provides helper to fetch a single billable metric by ID so that EditMetrics
// can pre-populate its form.

export interface UsageConditionDTO {
  dimension: string;
  operator: string;
  value: string;
}

export interface BillableMetricDetails {
  metricId: number;
  metricName: string;
  productId?: number;
  productName?: string;
  version: string;
  unitOfMeasure: string;
  description: string;
  aggregationFunction: string;
  aggregationWindow: string;
  usageConditions: UsageConditionDTO[];
  billingCriteria?: string;
}

// Allow override via Vite env (keeps consistent with other API helpers)
// Use same default as other metering APIs
const METRICS_BASE_URL = (import.meta as any).env?.VITE_METRICS_API_URL ||
  'http://18.182.19.181:8081/api';
const PRODUCTS_BASE_URL = (import.meta as any).env?.VITE_PRODUCTS_API_URL || 'http://54.238.204.246:8080/api';

export async function getBillableMetricById(
  metricId: string | number,
): Promise<BillableMetricDetails | null> {
  try {
    const url = `${METRICS_BASE_URL}/billable-metrics/${metricId}`;
    console.debug('GET billable metric', url);
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Error ${res.status}`);
    }
    // back-end may wrap payload; try common keys
    const payload = await res.json();
    const data: BillableMetricDetails = (payload?.data ?? payload?.content ?? payload) as BillableMetricDetails;
    return data;
  } catch (err) {
    console.error('Failed to fetch billable metric', err);
    return null;
  }
}

export async function updateBillableMetric(
  metricId: string | number,
  payload: Omit<BillableMetricDetails, 'metricId'>,
): Promise<boolean> {
  try {
    const res = await fetch(`${METRICS_BASE_URL}/billable-metrics/${metricId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const text = await res.text();
      console.error('Update failed', res.status, text);
    }
    return res.ok;
  } catch (err) {
    console.error('Failed to update billable metric', err);
    return false;
  }
}


export async function getProducts(): Promise<Product[]> {
  try {
    const response = await fetch(`${PRODUCTS_BASE_URL}/products`);
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
