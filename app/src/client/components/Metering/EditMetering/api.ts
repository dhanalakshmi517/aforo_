// API functions specific to EditMetering module
import type { Product } from '../api';
import { getAuthHeaders } from '../../../utils/auth';
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
  'http://usage.dev.aforo.space:8081/api';
const PRODUCTS_BASE_URL = (import.meta as any).env?.VITE_PRODUCTS_API_URL || 'http://product.dev.aforo.space:8080/api';

export async function getBillableMetricById(
  metricId: string | number,
): Promise<BillableMetricDetails | null> {
  try {
    const url = `${METRICS_BASE_URL}/billable-metrics/${metricId}`;
    console.debug('GET billable metric', url);
    const res = await fetch(url, { headers: getAuthHeaders() });
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
  payload: any,
): Promise<boolean> {
  const url = `${METRICS_BASE_URL}/billable-metrics/${metricId}`;
  const requestOptions = {
    method: 'PUT',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(payload),
  };

  console.log('Sending update request:', {
    url,
    options: {
      ...requestOptions,
      body: JSON.parse(JSON.stringify(payload)) // Clone to avoid mutation
    }
  });

  try {
    const startTime = performance.now();
    const res = await fetch(url, requestOptions);
    const responseTime = Math.round(performance.now() - startTime);

    const responseText = await res.text();
    let responseData;

    try {
      responseData = responseText ? JSON.parse(responseText) : {};
    } catch (e) {
      console.warn('Failed to parse JSON response:', { responseText, error: e });
      responseData = { message: responseText };
    }

    if (!res.ok) {
      const errorDetails = {
        status: res.status,
        statusText: res.statusText,
        responseTime: `${responseTime}ms`,
        response: responseData,
        request: {
          url,
          method: 'PUT',
          payload: payload,
          headers: requestOptions.headers
        }
      };

      console.error('Update failed with details:', JSON.stringify(errorDetails, null, 2));

      // Try to extract a meaningful error message
      let errorMessage = `HTTP ${res.status} ${res.statusText}`;
      if (responseData.message) {
        errorMessage += `: ${responseData.message}`;
      } else if (responseData.error) {
        errorMessage += `: ${responseData.error}`;
      } else if (typeof responseData === 'string') {
        errorMessage += `: ${responseData}`;
      }

      throw new Error(errorMessage);
    }

    console.log(`Update successful (${responseTime}ms)`, {
      status: res.status,
      response: responseData
    });

    return true;
  } catch (error) {
    const errorInfo = {
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : error,
      request: {
        url,
        method: 'PUT',
        payload: payload,
        headers: requestOptions.headers
      },
      timestamp: new Date().toISOString()
    };

    console.error('Failed to update billable metric:', JSON.stringify(errorInfo, null, 2));

    // Re-throw with more context if needed
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to update metric: ${String(error)}`);
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
