import axios from '../../utils/axiosInstance'

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
 * Helpers
 * ========================= */

// anti-cache
function nocache(url: string): string {
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}_=${Date.now()}`;
}

function hasUsefulData(data: any): boolean {
  if (data == null) return false;
  if (Array.isArray(data)) return data.length > 0;
  if (typeof data === 'object') return Object.keys(data).length > 0;
  return true;
}

// prefer any *Id field (except productId), else "id"
function extractId(obj: any): number | undefined {
  if (!obj || typeof obj !== 'object') return undefined;
  const idKey = Object.keys(obj).find(k => /id$/i.test(k) && k !== 'productId') || 'id';
  const val = (obj as any)[idKey];
  const num = typeof val === 'string' ? Number(val) : val;
  return Number.isFinite(num) ? num : undefined;
}

// If array: choose largest id if present, else last; if object: return as-is
function pickLatest<T = any>(data: T | T[]): T | undefined {
  if (!Array.isArray(data)) return data as T | undefined;
  if (data.length === 0) return undefined;

  const withIds = data
    .map((x) => ({ x, id: extractId(x) }))
    .filter((p) => typeof p.id === 'number') as Array<{ x: T; id: number }>;

  if (withIds.length > 0) {
    withIds.sort((a, b) => a.id! - b.id!);
    return withIds[withIds.length - 1].x;
  }
  return data[data.length - 1] as T;
}

// Remove any keys that end with "id" (server typically rejects ids in body)
function stripIds<T extends Record<string, any>>(obj: T): T {
  const copy: any = { ...obj };
  for (const k of Object.keys(copy)) {
    if (/id$/i.test(k)) delete copy[k];
  }
  return copy as T;
}

// Extract a numeric id from known keys only
function extractNumericId(maybe: any, keys: string[] = []): number | undefined {
  if (!maybe || typeof maybe !== 'object') return undefined;
  const candidates = keys.length
    ? keys
    : ['flatFeeId','usageBasedPricingId','tieredPricingId','stairStepPricingId','volumePricingId','id'];
  for (const k of candidates) {
    const v = maybe[k];
    const n = typeof v === 'string' ? Number(v) : v;
    if (Number.isFinite(n)) return n as number;
  }
  return undefined;
}

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
  const base = 'http://18.182.19.181:8081/api/billable-metrics';
  const url = productName ? `${base}?product=${encodeURIComponent(productName)}` : base;
  const response = await axios.get(nocache(url));
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
  const response = await axios.get(nocache(`${BASE_URL}/rateplans`));
  return response.data;
};

export const fetchRatePlan = async (id: number): Promise<RatePlan & Record<string, any>> => {
  const response = await axios.get(nocache(`${BASE_URL}/rateplans/${id}`));
  return response.data;
};

export const fetchProducts = async (): Promise<Product[]> => {
  const response = await axios.get(nocache(`${BASE_URL}/products`));
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

/* =========================================================
 * Pricing APIs
 * ========================================================= */

// FLAT FEE (POST-first with GET+PUT fallback)
export const saveFlatFeePricing = async (ratePlanId: number, payload: FlatFeePayload) => {
  const baseUrl = `${BASE_URL}/rateplans/${ratePlanId}/flatfee`;
  const clean = stripIds(payload);

  try {
    return await axios.post(baseUrl, clean);
  } catch (postErr: any) {
    try {
      const { data } = await axios.get(nocache(baseUrl));
      const latest = pickLatest<any>(data);
      const flatFeeId = extractNumericId(latest, ['flatFeeId', 'id']);
      if (flatFeeId != null) {
        return axios.put(`${baseUrl}/${flatFeeId}`, clean);
      }
    } catch {}
    throw postErr;
  }
};

// VOLUME-BASED — GET-first so we update instead of creating duplicates
export const saveVolumePricing = async (ratePlanId: number, payload: VolumePricingPayload) => {
  const baseUrl = `${BASE_URL}/rateplans/${ratePlanId}/volume-pricing`;
  const clean = stripIds(payload);

  try {
    const { data } = await axios.get(nocache(baseUrl));
    if (hasUsefulData(data)) {
      const latest = pickLatest<any>(data);
      const volumePricingId = extractNumericId(latest, ['volumePricingId', 'id']);
      if (volumePricingId != null) {
        return axios.put(`${baseUrl}/${volumePricingId}`, clean);
      }
    }
  } catch (getErr: any) {
    if (getErr?.response && getErr.response.status !== 404 && getErr.response.status !== 500) {
      throw getErr;
    }
  }

  return axios.post(baseUrl, clean);
};

// TIERED — GET-first
export const saveTieredPricing = async (ratePlanId: number, payload: TieredPricingPayload) => {
  const baseUrl = `${BASE_URL}/rateplans/${ratePlanId}/tiered`;
  const clean = stripIds(payload);

  try {
    const { data } = await axios.get(nocache(baseUrl));
    if (hasUsefulData(data)) {
      const latest = pickLatest<any>(data);
      const tieredPricingId = extractNumericId(latest, ['tieredPricingId', 'id']);
      if (tieredPricingId != null) {
        return axios.put(`${baseUrl}/${tieredPricingId}`, clean);
      }
    }
  } catch (getErr: any) {
    if (getErr?.response && getErr.response.status !== 404 && getErr.response.status !== 500) {
      throw getErr;
    }
  }

  return axios.post(baseUrl, clean);
};

// ✅ STAIRSTEP — GET-first so we PUT the existing record instead of POSTing new ones
export const saveStairStepPricing = async (ratePlanId: number, payload: StairStepPricingPayload) => {
  const baseUrl = `${BASE_URL}/rateplans/${ratePlanId}/stairstep`;
  const clean = stripIds(payload);

  // 1) Try to fetch existing stairstep pricing(s)
  try {
    const { data } = await axios.get(nocache(baseUrl));
    if (hasUsefulData(data)) {
      const latest = pickLatest<any>(data);
      const stairStepPricingId = extractNumericId(latest, ['stairStepPricingId', 'id']);
      if (stairStepPricingId != null) {
        // 2) Update existing
        return axios.put(`${baseUrl}/${stairStepPricingId}`, clean);
      }
    }
  } catch (getErr: any) {
    // If GET fails with 404/500, we'll POST a new one; otherwise bubble up.
    if (getErr?.response && getErr.response.status !== 404 && getErr.response.status !== 500) {
      throw getErr;
    }
  }

  // 3) Nothing to update -> create new
  return axios.post(baseUrl, clean);
};

// USAGE-BASED — GET-first
export const saveUsageBasedPricing = async (ratePlanId: number, payload: UsageBasedPricingPayload) => {
  const baseUrl = `${BASE_URL}/rateplans/${ratePlanId}/usagebased`;
  const clean = stripIds(payload);

  try {
    const { data } = await axios.get(nocache(baseUrl));
    if (hasUsefulData(data)) {
      const latest = pickLatest<any>(data);
      const usageBasedPricingId = extractNumericId(latest, ['usageBasedPricingId', 'id']);
      if (usageBasedPricingId != null) {
        return axios.put(`${baseUrl}/${usageBasedPricingId}`, clean);
      }
    }
  } catch (getErr: any) {
    if (getErr?.response && getErr.response.status !== 404 && getErr.response.status !== 500) {
      throw getErr;
    }
  }

  return axios.post(baseUrl, clean);
};

/* =========================
 * Extras
 * ========================= */

export interface MinimumCommitmentPayload {
  minimumUsage: number;
  minimumCharge: number;
}
export interface SetupFeePayload {
  setupFee: number;
  applicationTiming: number;
  invoiceDescription: string;
}
export interface DiscountPayload {
  discountType: 'PERCENTAGE' | 'FLAT';
  percentageDiscount: number;
  flatDiscountAmount: number;
  eligibility: string;
  startDate: string;
  endDate: string;
}
export interface FreemiumPayload {
  freemiumType: 'FREE_UNITS' | 'FREE_TRIAL' | 'UNITS_PER_DURATION';
  freeUnits: number;
  freeTrialDuration: number;
  startDate: string;
  endDate: string;
}

// fetch latest item + its id for a given extras endpoint
async function getExistingExtrasItem(ratePlanId: number, endpoint: string): Promise<{ id?: number; item?: any } | null> {
  try {
    const { data } = await axios.get(nocache(`${BASE_URL}/rateplans/${ratePlanId}/${endpoint}`));
    if (!hasUsefulData(data)) return null;
    const latest = pickLatest(data);
    const id = extractId(latest);
    if (id == null) return { item: latest };
    return { id, item: latest };
  } catch (err: any) {
    if (err?.response?.status === 404) return null;
    throw err;
  }
}

// Setup Fee: POST -> PATCH/PUT /setupfees/{id}
export const saveSetupFee = async (ratePlanId: number, payload: SetupFeePayload, usePut: boolean = false) => {
  const endpoint = 'setupfees';
  const baseUrl = `${BASE_URL}/rateplans/${ratePlanId}/${endpoint}`;
  const existing = await getExistingExtrasItem(ratePlanId, endpoint);

  if (existing?.id != null) {
    return usePut
      ? axios.put(`${baseUrl}/${existing.id}`, payload)
      : axios.patch(`${baseUrl}/${existing.id}`, payload);
  }
  return axios.post(baseUrl, payload);
};

// Discounts: POST -> PATCH/PUT /discounts/{id}
export const saveDiscounts = async (ratePlanId: number, payload: DiscountPayload, usePut: boolean = false) => {
  const endpoint = 'discounts';
  const baseUrl = `${BASE_URL}/rateplans/${ratePlanId}/${endpoint}`;
  const existing = await getExistingExtrasItem(ratePlanId, endpoint);

  if (existing?.id != null) {
    return usePut
      ? axios.put(`${baseUrl}/${existing.id}`, payload)
      : axios.patch(`${baseUrl}/${existing.id}`, payload);
  }
  return axios.post(baseUrl, payload);
};

// Freemiums: POST -> PATCH/PUT /freemiums/{id}
export const saveFreemiums = async (ratePlanId: number, payload: FreemiumPayload, usePut: boolean = false) => {
  const endpoint = 'freemiums';
  const baseUrl = `${BASE_URL}/rateplans/${ratePlanId}/${endpoint}`;
  const existing = await getExistingExtrasItem(ratePlanId, endpoint);

  if (existing?.id != null) {
    return usePut
      ? axios.put(`${baseUrl}/${existing.id}`, payload)
      : axios.patch(`${baseUrl}/${existing.id}`, payload);
  }
  return axios.post(baseUrl, payload);
};

// Minimum Commitments: POST -> PATCH/PUT /minimumcommitments/{id}
export const saveMinimumCommitment = async (ratePlanId: number, payload: MinimumCommitmentPayload, usePut: boolean = false) => {
  const endpoint = 'minimumcommitments';
  const baseUrl = `${BASE_URL}/rateplans/${ratePlanId}/${endpoint}`;
  const existing = await getExistingExtrasItem(ratePlanId, endpoint);

  if (existing?.id != null) {
    return usePut
      ? axios.put(`${baseUrl}/${existing.id}`, payload)
      : axios.patch(`${baseUrl}/${existing.id}`, payload);
  }
  return axios.post(baseUrl, payload);
};

/* =========================
 * Snapshots
 * ========================= */

export async function getPricingSnapshot(ratePlanId: number) {
  console.log('🔍 Fetching pricing snapshot for ratePlanId:', ratePlanId);

  const endpoints = [
    { key: 'USAGE',     url: `${BASE_URL}/rateplans/${ratePlanId}/usagebased` },
    { key: 'FLAT_FEE',  url: `${BASE_URL}/rateplans/${ratePlanId}/flatfee` },
    { key: 'VOLUME',    url: `${BASE_URL}/rateplans/${ratePlanId}/volume-pricing` },
    { key: 'TIERED',    url: `${BASE_URL}/rateplans/${ratePlanId}/tiered` },
    { key: 'STAIRSTEP', url: `${BASE_URL}/rateplans/${ratePlanId}/stairstep` },
  ];

  const results = await Promise.allSettled(endpoints.map(e => axios.get(nocache(e.url))));
  console.log('📊 Pricing endpoint results:', results.map((r, i) => ({
    endpoint: endpoints[i].key,
    status: r.status,
    data: r.status === 'fulfilled' ? (r as any).value.data : (r as any)?.reason?.response?.status
  })));

  let chosen: { model: string; data: any } | null = null;
  for (let i = 0; i < endpoints.length; i++) {
    const r = results[i];
    if (r.status !== 'fulfilled') continue;
    const raw = (r as any).value.data;
    if (!hasUsefulData(raw)) continue;
    const normalized = pickLatest<any>(raw);
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

export async function getExtrasSnapshot(ratePlanId: number) {
  console.log('🎁 Fetching extras snapshot for ratePlanId:', ratePlanId);

  const [setup, discount, freemium, minc] = await Promise.allSettled([
    axios.get(nocache(`${BASE_URL}/rateplans/${ratePlanId}/setupfees`)),
    axios.get(nocache(`${BASE_URL}/rateplans/${ratePlanId}/discounts`)),
    axios.get(nocache(`${BASE_URL}/rateplans/${ratePlanId}/freemiums`)),
    axios.get(nocache(`${BASE_URL}/rateplans/${ratePlanId}/minimumcommitments`))
  ]);

  const pick = (r: any) => {
    if (r.status !== 'fulfilled') return undefined;
    const data = r.value.data;
    return pickLatest(data);
    // Note: pickLatest from helpers
  };

  const result = {
    setupFee: pick(setup),
    discount: pick(discount),
    freemium: pick(freemium),
    minimumCommitment: pick(minc),
  };

  console.log('✅ Extras data collected:', result);
  return result;
}

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
          plan.volumePricing = data;
          break;
        case 'TIERED':
          plan.tieredPricing = data;
          break;
        case 'STAIRSTEP':
          plan.stairStepPricing = data;
          break;
        case 'USAGE':
          plan.perUnitAmount     = data.perUnitAmount;
          plan.usageBasedPricing = { ...data };
          break;
      }
    }

    const ex = extras || {};
    if (ex.setupFee)           plan.setupFee = ex.setupFee;
    if (ex.discount)           plan.discount = ex.discount;
    if (ex.freemium)           plan.freemium = ex.freemium;
    if (ex.minimumCommitment)  plan.minimumCommitment = ex.minimumCommitment;

    return plan;
  } catch (error) {
    console.error('Failed to fetch complete rate plan details:', error);
    return await fetchRatePlan(ratePlanId);
  }
}
