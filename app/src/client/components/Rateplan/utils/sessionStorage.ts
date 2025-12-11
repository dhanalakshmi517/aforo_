/**
 * Session-scoped storage utility to prevent localStorage contamination
 * between different rate plan creation sessions
 */

// Generate a unique session ID for each rate plan creation session
let currentSessionId: string | null = null;

export const generateSessionId = (): string => {
  return `rateplan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const initializeSession = (): string => {
  currentSessionId = generateSessionId();
  // Store session ID in sessionStorage (clears on browser tab close)
  sessionStorage.setItem('ratePlanSessionId', currentSessionId);
  return currentSessionId;
};

export const getCurrentSessionId = (): string => {
  if (!currentSessionId) {
    // Try to get from sessionStorage first
    currentSessionId = sessionStorage.getItem('ratePlanSessionId');
    if (!currentSessionId) {
      currentSessionId = initializeSession();
    }
  }
  return currentSessionId;
};

// Prefixed storage functions that include session ID
export const setSessionItem = (key: string, value: string): void => {
  const sessionId = getCurrentSessionId();
  const prefixedKey = `${sessionId}_${key}`;
  localStorage.setItem(prefixedKey, value);
};

export const getSessionItem = (key: string): string | null => {
  const sessionId = getCurrentSessionId();
  const prefixedKey = `${sessionId}_${key}`;
  return localStorage.getItem(prefixedKey);
};

export const removeSessionItem = (key: string): void => {
  const sessionId = getCurrentSessionId();
  const prefixedKey = `${sessionId}_${key}`;
  localStorage.removeItem(prefixedKey);
};

// Clear all data for current session
export const clearCurrentSession = (): void => {
  const sessionId = getCurrentSessionId();
  if (!sessionId) return;

  // Get all localStorage keys and remove ones with current session prefix
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(`${sessionId}_`)) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach(key => localStorage.removeItem(key));

  // Clear session storage
  sessionStorage.removeItem('ratePlanSessionId');
  currentSessionId = null;
};

// Force clear all rate plan related data (for fresh start)
export const clearAllRatePlanData = (): void => {
  // Clear current session
  clearCurrentSession();

  // Also clear any legacy localStorage keys that might be cached
  const legacyKeys = [
    'pricingModel', 'flatFeeAmount', 'flatFeeApiCalls', 'flatFeeOverage', 'flatFeeGrace',
    'usagePerUnit', 'tieredTiers', 'tieredOverage', 'tieredGrace',
    'volumeTiers', 'volumeOverage', 'volumeGrace',
    'stairTiers', 'stairOverage', 'stairGrace'
  ];

  legacyKeys.forEach(key => localStorage.removeItem(key));

  // Initialize a fresh session
  initializeSession();
};

// Clear old sessions (cleanup utility)
export const clearOldSessions = (): void => {
  const currentSession = getCurrentSessionId();
  const keysToRemove: string[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('rateplan_') && !key.startsWith(`${currentSession}_`)) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach(key => localStorage.removeItem(key));
};

// Rate plan specific storage keys
export const RATE_PLAN_KEYS = {
  // Wizard state
  WIZARD_STEP: 'WIZARD_STEP',
  CURRENT_STEP: 'CURRENT_STEP',

  // Plan details
  PLAN_NAME: 'PLAN_NAME',
  PLAN_DESCRIPTION: 'PLAN_DESCRIPTION',
  BILLING_FREQUENCY: 'BILLING_FREQUENCY',
  PRODUCT_NAME: 'PRODUCT_NAME',

  // Billable metric details
  BILLABLE_METRIC_NAME: 'BILLABLE_METRIC_NAME',
  BILLABLE_METRIC_DESCRIPTION: 'BILLABLE_METRIC_DESCRIPTION',
  BILLABLE_METRIC_UNIT: 'BILLABLE_METRIC_UNIT',
  BILLABLE_METRIC_AGGREGATION: 'BILLABLE_METRIC_AGGREGATION',

  // Pricing model
  PRICING_MODEL: 'PRICING_MODEL',

  // Flat Fee pricing
  FLAT_FEE_AMOUNT: 'FLAT_FEE_AMOUNT',
  FLAT_FEE_API_CALLS: 'FLAT_FEE_API_CALLS',
  FLAT_FEE_OVERAGE: 'FLAT_FEE_OVERAGE',
  FLAT_FEE_GRACE: 'FLAT_FEE_GRACE',

  // Usage-based pricing
  USAGE_PER_UNIT_AMOUNT: 'USAGE_PER_UNIT_AMOUNT',

  // Tiered pricing
  TIERED_TIERS: 'TIERED_TIERS',
  TIERED_OVERAGE: 'TIERED_OVERAGE',
  TIERED_GRACE: 'TIERED_GRACE',
  TIERED_NO_UPPER_LIMIT: 'TIERED_NO_UPPER_LIMIT',

  // Volume pricing
  VOLUME_TIERS: 'VOLUME_TIERS',
  VOLUME_OVERAGE: 'VOLUME_OVERAGE',
  VOLUME_GRACE: 'VOLUME_GRACE',
  VOLUME_NO_UPPER_LIMIT: 'VOLUME_NO_UPPER_LIMIT',

  // Stair-step pricing
  STAIR_TIERS: 'STAIR_TIERS',
  STAIR_OVERAGE: 'STAIR_OVERAGE',
  STAIR_GRACE: 'STAIR_GRACE',
  STAIR_NO_UPPER_LIMIT: 'STAIR_NO_UPPER_LIMIT',

  // Extras - Setup Fee
  SETUP_FEE: 'SETUP_FEE',
  SETUP_FEE_AMOUNT: 'SETUP_FEE_AMOUNT',
  SETUP_APPLICATION_TIMING: 'SETUP_APPLICATION_TIMING',
  SETUP_INVOICE_DESC: 'SETUP_INVOICE_DESC',

  // Extras - Discounts
  DISCOUNT_PERCENT: 'DISCOUNT_PERCENT',
  DISCOUNT_FLAT: 'DISCOUNT_FLAT',
  DISCOUNT_TYPE: 'DISCOUNT_TYPE',
  PERCENTAGE_DISCOUNT: 'PERCENTAGE_DISCOUNT',
  FLAT_DISCOUNT_AMOUNT: 'FLAT_DISCOUNT_AMOUNT',
  ELIGIBILITY: 'ELIGIBILITY',
  DISCOUNT_START: 'DISCOUNT_START',
  DISCOUNT_END: 'DISCOUNT_END',

  // Extras - Freemium
  FREEMIUM_UNITS: 'FREEMIUM_UNITS',
  FREEMIUM_TYPE: 'FREEMIUM_TYPE',
  FREE_UNITS: 'FREE_UNITS',
  FREE_TRIAL_DURATION: 'FREE_TRIAL_DURATION',
  FREEMIUM_START: 'FREEMIUM_START',
  FREEMIUM_END: 'FREEMIUM_END',

  // Extras - Minimum Commitment
  MINIMUM_USAGE: 'MINIMUM_USAGE',
  MINIMUM_CHARGE: 'MINIMUM_CHARGE',
} as const;

// Convenience functions for rate plan data
export const setRatePlanData = (key: keyof typeof RATE_PLAN_KEYS, value: string): void => {
  setSessionItem(RATE_PLAN_KEYS[key], value);
};

export const getRatePlanData = (key: keyof typeof RATE_PLAN_KEYS): string | null => {
  return getSessionItem(RATE_PLAN_KEYS[key]);
};

export const removeRatePlanData = (key: keyof typeof RATE_PLAN_KEYS): void => {
  removeSessionItem(RATE_PLAN_KEYS[key]);
};
