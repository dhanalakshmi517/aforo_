import axios from 'axios';

export interface Product {
  productId: string;
  productName: string;
  productType: string;
  version: string;
  productDescription: string;
  tags: Record<string, any>;
  category: string;
  visibility: boolean;
  status: string;
  internalSkuCode: string;
  uom: string;
  effectiveStartDate: string;
  effectiveEndDate: string | null;
}

export const BASE_URL = 'http://54.238.204.246:8080/api';

// Billable Metrics
export interface BillableMetric {
  metricId: number;
  metricName: string;
}

export const fetchBillableMetrics = async (productName?: string): Promise<BillableMetric[]> => {
  const url = productName
    ? `http://18.182.19.181:8081/api/billable-metrics?product=${encodeURIComponent(productName)}`
    : 'http://18.182.19.181:8081/api/billable-metrics';
  const response = await axios.get(url);
  return response.data;
};

// -------------------- Rate Plans --------------------
export interface RatePlan {
  ratePlanId: number;
  ratePlanName: string;
  description: string;
  ratePlanType: string;
  billingFrequency: string;
  productId: number;
  productName?: string;
  status?: string;
  // Add any additional fields returned by backend here
}

/**
 * Fetch all rate plans from the backend service
 */
export const fetchRatePlans = async (): Promise<RatePlan[]> => {
  const response = await axios.get(`${BASE_URL}/rateplans`);
  return response.data;
};

/**
 * Fetch all products from the backend service
 */
export const fetchProducts = async (): Promise<Product[]> => {
  const response = await axios.get(`${BASE_URL}/products`);
  return response.data;
};

/**
 * Delete a rate plan by id
 */
export const deleteRatePlan = async (id: number): Promise<void> => {
  await axios.delete(`${BASE_URL}/rateplans/${id}`);
};

// ---- Create Rate Plan ----
export interface RatePlanRequest {
  ratePlanName: string;
  productName: string;
  description: string;
  billingFrequency: 'MONTHLY' | 'WEEKLY' | 'YEARLY' | 'DAILY' | 'HOURLY';
  paymentType: 'POSTPAID' | 'PREPAID';
  billableMetricId: number;
}

export const confirmRatePlan = async (ratePlanId: number) => {
  // Calls endpoint that changes status from DRAFT to ACTIVE
  return axios.post(`${BASE_URL}/rateplans/api/rateplans/${ratePlanId}/confirm`);
};

export const createRatePlan = async (payload: RatePlanRequest) => {
  const response = await axios.post(`${BASE_URL}/rateplans`, payload);
  return response.data as RatePlan; // backend responds with created plan
};

// ------------ Pricing endpoints -----------------
interface VolumeTierInput {
  usageStart: number;
  usageEnd: number | null;
  unitPrice: number;
}

interface TieredTierInput {
  startRange: number;
  endRange: number | null;
  unitPrice: number;
}
// Basic tier shape used by tiered & stairstep endpoints
interface VolumeTier {
  from: number;
  to: number;
  price: number;
}

interface VolumePricingPayload {
  tiers: VolumeTierInput[];
  overageUnitRate: number;
  graceBuffer: number;
}
export const saveVolumePricing = async (
  ratePlanId: number,
  payload: VolumePricingPayload
) => {
  return axios.post(`${BASE_URL}/rateplans/${ratePlanId}/volume-pricing`, payload);
};

export const saveUsageBasedPricing = async (ratePlanId: number, payload: any) => {
  console.log('Usage-based pricing payload', payload);
  try {
    const res = await axios.post(`${BASE_URL}/rateplans/${ratePlanId}/usagebased`, payload);
    console.log('Usage-based pricing saved', res.status);
    return res;
  } catch (err) {
    console.error('Failed to save usage-based pricing', err);
    throw err;
  }
};

interface TieredPricingPayload {
  tiers: TieredTierInput[];
  overageUnitRate: number;
  graceBuffer: number;
}

export const saveTieredPricing = async (
  ratePlanId: number,
  payload: TieredPricingPayload
) => {
  return axios.post(`${BASE_URL}/rateplans/${ratePlanId}/tiered`, payload);
};

interface StairStepTierInput {
  usageStart: number;
  usageEnd: number | null;
  flatCost: number;
}

interface StairStepPricingPayload {
  tiers: StairStepTierInput[];
  overageUnitRate: number;
  graceBuffer: number;
}

export const saveStairStepPricing = async (
  ratePlanId: number,
  payload: StairStepPricingPayload
) => {
  return axios.post(`${BASE_URL}/rateplans/${ratePlanId}/stairstep`, payload);
};

export const saveFlatFeePricing = async (
  ratePlanId: number,
  payload: { flatFeeAmount: number; numberOfApiCalls: number; overageUnitRate: number; graceBuffer: number; }
) => {
  console.log('Flat-fee pricing payload', payload);
  try {
    const res = await axios.post(`${BASE_URL}/rateplans/${ratePlanId}/flatfee`, payload);
    console.log('Flat-fee pricing saved', res.status);
    return res;
  } catch (err) {
    console.error('Failed to save flat-fee pricing', err);
    throw err;
  }
};

// ------------------ Extras ------------------
export interface MinimumCommitmentPayload {
  minimumUsage: number;
  minimumCharge: number;
}
export const saveMinimumCommitment = (ratePlanId: number, payload: MinimumCommitmentPayload) => {
  return axios.post(`${BASE_URL}/rateplans/${ratePlanId}/minimumcommitments`, payload);
};

// ------------------ Extras ------------------
export interface SetupFeePayload {
  setupFee: number;
  applicationTiming: number;
  invoiceDescription: string;
}
export const saveSetupFee = (ratePlanId: number, payload: SetupFeePayload) => {
  return axios.post(`${BASE_URL}/rateplans/${ratePlanId}/setupfees`, payload);
};

export interface DiscountPayload {
  discountType: 'PERCENTAGE' | 'FLAT';
  percentageDiscount: number;
  flatDiscountAmount: number;
  eligibility: string;
  startDate: string;
  endDate: string;
}
export const saveDiscounts = (ratePlanId: number, payload: DiscountPayload) => {
  return axios.post(`${BASE_URL}/rateplans/${ratePlanId}/discounts`, payload);
};

// ------------------ Freemium ------------------
export interface FreemiumPayload {
  freemiumType: 'FREE_UNITS' | 'FREE_TRIAL' | 'UNITS_PER_DURATION';
  freeUnits: number;
  freeTrialDuration: number;
  startDate: string;
  endDate: string;
}
export const saveFreemiums = (ratePlanId: number, payload: FreemiumPayload) => {
  return axios.post(`${BASE_URL}/rateplans/${ratePlanId}/freemiums`, payload);
};
