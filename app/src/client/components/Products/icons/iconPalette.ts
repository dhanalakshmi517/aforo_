// icons/iconPalette.ts

// OUTER CARD: soft background gradients (the pale rounded-card behind the tile)
export const outerBgPalettes: [string, string][] = [
  // neutral → ice blue
  ['var(--neutral-50, #F8F7FA)', 'var(--neutral-100, #E4EEF9)'],
  // peach wash
  ['var(--peach-50, #FFF5E5)', 'var(--peach-100, #FDE3BD)'],
  // violet fade
  ['var(--violet-50, #F4EFFF)', 'var(--violet-100, #E4D7FF)'],
  // aqua fade
  ['var(--aqua-50, #E7F9F8)', 'var(--aqua-100, #CFF1F3)'],
];

// MIDDLE TILE: brand solids (these should mirror your Figma tokens).
// Put every shade you want to permute here. They have safe fallbacks.
export const tileSolids: string[] = [
  'var(--multi-colors-Products-Amber, #CC9434)',

  // Primary blues by shade (adjust to your brand tokens)
  'var(--brand-color-primary-300, #7BC4FF)',
  'var(--brand-color-primary-400, #5AAEFF)',
  'var(--brand-color-primary-500, #3D98FF)',
  'var(--brand-color-primary-600, #1E83FF)',
  'var(--brand-color-primary-700, #0F6DDA)',

  // Other families (optional – keep or remove as you like)
  'var(--brand-color-violet-500, #7B61FF)',
  'var(--brand-color-teal-500, #4FB8C7)',
  'var(--brand-color-green-500, #4CC38A)',
  'var(--brand-color-orange-500, #FFB36B)',
  'var(--brand-color-blue-500, #6AA6FF)',
  'var(--brand-color-red-500, #F47280)',
];

// Build permutations of (outerBg × tileSolid)
export const buildColorCombos = (
  outers = outerBgPalettes,
  tiles = tileSolids,
  limit?: number
) => {
  const combos: { outerBg: [string, string]; tileColor: string }[] = [];
  for (let i = 0; i < outers.length; i++) {
    for (let j = 0; j < tiles.length; j++) {
      combos.push({ outerBg: outers[i] as [string, string], tileColor: tiles[j] });
      if (limit && combos.length >= limit) return combos;
    }
  }
  return combos;
};
