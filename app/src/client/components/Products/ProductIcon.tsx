// ProductIcon.tsx
import React from 'react';

export interface ProductIconData {
  id: string;
  label: string;
  svgPath: string;
  /** optional custom viewBox, e.g. "0 0 19 19" (defaults to 0 0 18 18) */
  viewBox?: string;
  outerBg?: [string, string];   // gradient for the outer card
  tileColor?: string;           // solid for the middle tile
}

const ProductIcon: React.FC<{
  icon: ProductIconData;
  onSelect: (i: ProductIconData) => void;
}> = ({ icon, onSelect }) => {
  const tile = icon.tileColor ?? '#CC9434';
  
  // Convert hex to rgba with 15% opacity for outer background
  const hexToRgba = (hex: string, opacity: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  return (
    <button
      type="button"
      className="pi-item"
      onClick={() => onSelect(icon)}
      aria-label={icon.label}
    >
      {/* OUTER CARD — with layered background (tile color + base white with blue overlay) */}
      <div
        style={{
          width: 50.6537,
          height: 46.3351,
          borderRadius: 12,
          border: '0.6px solid var(--border-border-2, #D5D4DF)',
          background: `
            ${hexToRgba(tile, 0.15)},
            linear-gradient(0deg, rgba(2, 151, 158, 0.10) 0%, rgba(2, 151, 158, 0.10) 100%),
            var(--surface-layer-4, #FFF)
          `,
          display: 'flex',
          padding: 8,
          justifyContent: 'center',
          alignItems: 'center',
          gap: -4,  // added gap as per Figma specs
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* BACK TILE (brand solid) — positioned for diagonal peek effect */}
        <div
          style={{
            position: 'absolute',
            left: 10,   // positioned to peek from behind the glass tile
            top: 6,     // positioned towards upper area
            width: 26.6,  // updated to match Figma specs
            height: 26.6, // updated to match Figma specs
            borderRadius: 5.7,
            background: tile,
            flexShrink: 0,
          }}
        />

        {/* GLASS FOREGROUND TILE — centered with slight offset */}
        <div
          style={{
            width: 28,    // updated to match Figma specs
            height: 28,   // updated to match Figma specs
            padding: '1.661px 3.321px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 2.214,
            flexShrink: 0,
            borderRadius: 6,
            border: '0.6px solid #FFF',
            background: 'rgba(202, 171, 213, 0.10)',
            backdropFilter: 'blur(3.875px)',
            transform: 'translate(3px, 2px)',  // moved up slightly for clearer icon visibility
            boxShadow: 'inset 0 1px 8px rgba(255,255,255,0.35)',
          }}
        >
          {/* ICON — slightly reduced size for better proportion */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14.727"
            height="14.727"
            viewBox={icon.viewBox ?? "0 0 18 18"}
            fill="none"
            style={{ 
              flexShrink: 0, 
              aspectRatio: '14.73 / 14.73', 
              display: 'block' 
            }}
          >
            <path d={icon.svgPath} fill="#FFFFFF" />
          </svg>
        </div>
      </div>

      <span style={{ textTransform: 'capitalize' }}>{icon.label}</span>
    </button>
  );
};

export default ProductIcon;
