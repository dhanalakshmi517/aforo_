import axios from '../../utils/axiosInstance';

/* =========================
 * Types - Products
 * ========================= */
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

/* =========================
 * Constants
 * ========================= */
export const BASE_URL = 'http://54.238.204.246:8080/api';

/* =========================
 * Types - Billable Metrics
 * ========================= */
export interface BillableMetric {
  metricId: number;
  metricName: string;
}

/* =========================
 * Billable Metrics APIs
 * ========================= */
export const fetchBillableMetrics = async (productName?: string): Promise<BillableMetric[]> => {
  const url = productName
    ? `http://18.182.19.181:8081/api/billable-metrics?product=${encodeURIComponent(productName)}`
    : 'http://18.182.19.181:8081/api/billable-metrics';
  const response = await axios.get(url);
  return response.data;
};

/* =========================
 * Types - Rate Plans
 * ========================= */
export interface RatePlan {
  ratePlanId: number;
  ratePlanName: string;
  description: string;
  ratePlanType: string;
  billingFrequency: string;
  productId: number;
  productName?: string;
  status?: string;
}

export interface RatePlanRequest {
  ratePlanName: string;
  /**
   * Prefer productId for backend compatibility. productName retained for
   * legacy tests and will be ignored by backend if present.
   */
  productId?: number;
  productName?: string;
  description: string;
  billingFrequency: 'MONTHLY' | 'WEEKLY' | 'YEARLY' | 'DAILY' | 'HOURLY';
  paymentType: 'POSTPAID' | 'PREPAID';
  billableMetricId: number;
}

/* =========================
 * Rate Plan APIs
 * ========================= */
export const fetchRatePlans = async (): Promise<RatePlan[]> => {
  const response = await axios.get(`${BASE_URL}/rateplans`);
  return response.data;
};

export const fetchRatePlan = async (id: number): Promise<RatePlan & Record<string, any>> => {
  const response = await axios.get(`${BASE_URL}/rateplans/${id}`);
  return response.data;
};

export const fetchProducts = async (): Promise<Product[]> => {
  const response = await axios.get(`${BASE_URL}/products`);
  return response.data;
};

export const deleteRatePlan = async (id: number): Promise<void> => {
  await axios.delete(`${BASE_URL}/rateplans/${id}`);
};

export const createRatePlan = async (payload: RatePlanRequest): Promise<RatePlan> => {
  const response = await axios.post(`${BASE_URL}/rateplans`, payload);
  return response.data as RatePlan;
};

export const updateRatePlan = async (ratePlanId: number, payload: Partial<RatePlanRequest>) => {
  return axios.patch(`${BASE_URL}/rateplans/${ratePlanId}`, payload);
};

export const confirmRatePlan = async (ratePlanId: number) => {
  return axios.post(`${BASE_URL}/rateplans/${ratePlanId}/confirm`);
};

/* =========================
 * Types - Pricing Payloads
 * ========================= */

/** Flat Fee */
export interface FlatFeePayload {
  flatFeeAmount: number;
  numberOfApiCalls: number;
  overageUnitRate: number;
  graceBuffer: number;
}

/** Volume Pricing */
export interface VolumeTierInput {
  usageStart: number;
  usageEnd: number | null;
  unitPrice: number;
}
export interface VolumePricingPayload {
  tiers: VolumeTierInput[];
  overageUnitRate: number;
  graceBuffer: number;
}

/** Tiered Pricing */
export interface TieredTierInput {
  startRange: number;
  endRange: number | null;
  unitPrice: number;
}
export interface TieredPricingPayload {
  tiers: TieredTierInput[];
  overageUnitRate: number;
  graceBuffer: number;
}

/** Stair-Step Pricing */
export interface StairStepTierInput {
  usageStart: number;
  usageEnd: number | null;
  flatCost: number;
}
export interface StairStepPricingPayload {
  tiers: StairStepTierInput[];
  overageUnitRate: number;
  graceBuffer: number;
}

/** Usage-Based Pricing */
export interface UsageBasedPricingPayload {
  perUnitAmount: number;
  overageUnitRate?: number;
  graceBuffer?: number;
}

/* =========================
 * Pricing APIs
 * ========================= */

/** Flat Fee — keep ONLY this version (backend path: /flatfee) */
export const saveFlatFeePricing = async (ratePlanId: number, payload: FlatFeePayload) => {
  return axios.post(`${BASE_URL}/rateplans/${ratePlanId}/flatfee`, payload);
};

/** Volume */
export const saveVolumePricing = async (ratePlanId: number, payload: VolumePricingPayload) => {
  return axios.post(`${BASE_URL}/rateplans/${ratePlanId}/volume-pricing`, payload);
};

/** Tiered */
export const saveTieredPricing = async (ratePlanId: number, payload: TieredPricingPayload) => {
  return axios.post(`${BASE_URL}/rateplans/${ratePlanId}/tiered`, payload);
};

/** Stair-Step — use singular /stairstep to match backend */
export const saveStairStepPricing = async (ratePlanId: number, payload: StairStepPricingPayload) => {
  return axios.post(`${BASE_URL}/rateplans/${ratePlanId}/stairstep`, payload);
};

/** Usage-Based */
export const saveUsageBasedPricing = async (ratePlanId: number, payload: UsageBasedPricingPayload) => {
  return axios.post(`${BASE_URL}/rateplans/${ratePlanId}/usagebased`, payload);
};

/* =========================
 * Extras
 * ========================= */

export interface MinimumCommitmentPayload {
  minimumUsage: number;
  minimumCharge: number;
}
export const saveMinimumCommitment = (ratePlanId: number, payload: MinimumCommitmentPayload) => {
  return axios.post(`${BASE_URL}/rateplans/${ratePlanId}/minimumcommitments`, payload);
};

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
