export const EXTRAS_KEYS = [
  'setupFee',
  'discountPercent',
  'discountFlat',
  'freemiumUnits',
  'minimumUsage',
  'minimumCharge'
];

export function clearExtrasLocalStorage() {
  EXTRAS_KEYS.forEach((k) => localStorage.removeItem(k));
}
