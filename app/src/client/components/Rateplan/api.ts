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
export interface FlatFeePayload {
  flatFeeAmount: number;
  numberOfApiCalls: number;
  overageUnitRate: number;
  graceBuffer: number;
}

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

export interface UsageBasedPricingPayload {
  perUnitAmount: number;
  overageUnitRate?: number;
  graceBuffer?: number;
}

/* =========================
 * Pricing APIs
 * ========================= */
export const saveFlatFeePricing = async (ratePlanId: number, payload: FlatFeePayload) => {
  return axios.post(`${BASE_URL}/rateplans/${ratePlanId}/flatfee`, payload);
};
export const saveVolumePricing = async (ratePlanId: number, payload: VolumePricingPayload) => {
  return axios.post(`${BASE_URL}/rateplans/${ratePlanId}/volume-pricing`, payload);
};
export const saveTieredPricing = async (ratePlanId: number, payload: TieredPricingPayload) => {
  return axios.post(`${BASE_URL}/rateplans/${ratePlanId}/tiered`, payload);
};
export const saveStairStepPricing = async (ratePlanId: number, payload: StairStepPricingPayload) => {
  return axios.post(`${BASE_URL}/rateplans/${ratePlanId}/stairstep`, payload);
};
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

/* =========================
 * Draft Resume Helpers
 * ========================= */

// helper: treat 200 with empty array/object as "no data"
function hasUsefulData(data: any): boolean {
  if (data == null) return false;
  if (Array.isArray(data)) return data.length > 0;
  if (typeof data === 'object') return Object.keys(data).length > 0;
  return true;
}

// helper: if array, take first element; else return as-is
function takeFirstIfArray<T>(data: T | T[]): T | undefined {
  return Array.isArray(data) ? (data[0] as T | undefined) : (data as T);
}

// Get pricing snapshot — prefer USAGE first, skip empty results
export async function getPricingSnapshot(ratePlanId: number) {
  console.log('🔍 Fetching pricing snapshot for ratePlanId:', ratePlanId);

  // ✅ PRIORITY FIX: put USAGE first so a valid usage-based record wins over empty volume/tiered, etc.
  const endpoints = [
    { key: 'USAGE',     url: `${BASE_URL}/rateplans/${ratePlanId}/usagebased` },
    { key: 'FLAT_FEE',  url: `${BASE_URL}/rateplans/${ratePlanId}/flatfee` },
    { key: 'VOLUME',    url: `${BASE_URL}/rateplans/${ratePlanId}/volume-pricing` },
    { key: 'TIERED',    url: `${BASE_URL}/rateplans/${ratePlanId}/tiered` },
    { key: 'STAIRSTEP', url: `${BASE_URL}/rateplans/${ratePlanId}/stairstep` },
  ];

  const results = await Promise.allSettled(endpoints.map(e => axios.get(e.url)));
  console.log('📊 Pricing endpoint results:', results.map((r, i) => ({
    endpoint: endpoints[i].key,
    status: r.status,
    data: r.status === 'fulfilled' ? (r as any).value.data : (r as any)?.reason?.response?.status
  })));

  // find first with useful data
  let chosen: { model: string; data: any } | null = null;
  for (let i = 0; i < endpoints.length; i++) {
    const r = results[i];
    if (r.status !== 'fulfilled') continue;
    const raw = (r as any).value.data;
    if (!hasUsefulData(raw)) continue;

    // normalize arrays to single record (backend sometimes returns lists)
    const normalized = takeFirstIfArray<any>(raw);
    if (!hasUsefulData(normalized)) continue;

    chosen = { model: endpoints[i].key, data: normalized };
    break;
  }

  if (!chosen) {
    console.log('❌ No pricing model found');
    return null;
  }

  console.log('✅ Found pricing model:', chosen);
  return chosen;
}

// Get extras snapshot - fetches all extras types
export async function getExtrasSnapshot(ratePlanId: number) {
  console.log('🎁 Fetching extras snapshot for ratePlanId:', ratePlanId);

  const [setup, discount, freemium, minc] = await Promise.allSettled([
    axios.get(`${BASE_URL}/rateplans/${ratePlanId}/setupfees`),
    axios.get(`${BASE_URL}/rateplans/${ratePlanId}/discounts`),
    axios.get(`${BASE_URL}/rateplans/${ratePlanId}/freemiums`),
    axios.get(`${BASE_URL}/rateplans/${ratePlanId}/minimumcommitments`)
  ]);

  console.log('📊 Extras endpoint results:', {
    setupFee: setup.status === 'fulfilled' ? (setup as any).value.data : (setup as any)?.reason?.response?.status,
    discount: discount.status === 'fulfilled' ? (discount as any).value.data : (discount as any)?.reason?.response?.status,
    freemium: freemium.status === 'fulfilled' ? (freemium as any).value.data : (freemium as any)?.reason?.response?.status,
    minimumCommitment: minc.status === 'fulfilled' ? (minc as any).value.data : (minc as any)?.reason?.response?.status,
  });

  const pick = (r: any) => (r.status === 'fulfilled' ? (r as any).value.data : undefined);
  const result = {
    setupFee: pick(setup),
    discount: pick(discount),
    freemium: pick(freemium),
    minimumCommitment: pick(minc),
  };

  console.log('✅ Extras data collected:', result);
  return result;
}

// Comprehensive fetch that gets rate plan + pricing + extras
export async function fetchRatePlanWithDetails(ratePlanId: number) {
  try {
    const [planResult, pricingResult, extrasResult] = await Promise.allSettled([
      fetchRatePlan(ratePlanId),
      getPricingSnapshot(ratePlanId),
      getExtrasSnapshot(ratePlanId)
    ]);

    const plan: any = planResult.status === 'fulfilled' ? planResult.value : {};
    const pricing = pricingResult.status === 'fulfilled' ? pricingResult.value : null;
    const extras: any = extrasResult.status === 'fulfilled' ? extrasResult.value : {};

    // Attach pricing data to plan object based on model type (normalized)
    if (pricing) {
      const data = pricing.data;
      switch (pricing.model) {
        case 'FLAT_FEE':
          plan.flatFeeAmount    = data.flatFeeAmount;
          plan.numberOfApiCalls = data.numberOfApiCalls;
          plan.overageUnitRate  = data.overageUnitRate;
          plan.graceBuffer      = data.graceBuffer;
          break;
        case 'VOLUME':
          plan.volumePricing = data; // object with { tiers, overageUnitRate, graceBuffer } OR already normalized
          break;
        case 'TIERED':
          plan.tieredPricing = data;
          break;
        case 'STAIRSTEP':
          plan.stairStepPricing = data;
          break;
        case 'USAGE':
          // Provide BOTH shapes so consumers can read either one
          plan.perUnitAmount     = data.perUnitAmount;
          plan.usageBasedPricing = { ...data };
          break;
      }
    }

    // Attach extras data to plan object (handle arrays from API)
    const firstOf = (x: any) => (Array.isArray(x) ? x[0] : x);
    const ex = extras || {};
    if (ex.setupFee)           plan.setupFee = firstOf(ex.setupFee);
    if (ex.discount)           plan.discount = firstOf(ex.discount);
    if (ex.freemium)           plan.freemium = firstOf(ex.freemium);
    if (ex.minimumCommitment)  plan.minimumCommitment = firstOf(ex.minimumCommitment);

    return plan;
  } catch (error) {
    console.error('Failed to fetch complete rate plan details:', error);
    return await fetchRatePlan(ratePlanId);
  }
}
