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
  
  // Determine if this icon should be circular based on its ID
  const isCircular = icon.id.includes('circle') || icon.id.includes('round') || parseInt(icon.id) % 3 === 0;
  const borderRadius = isCircular ? '50%' : '6px';
  
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
      onClick={(e) => {
        e.stopPropagation();
        onSelect(icon);
      }}
      aria-label={icon.label}
    >
      {/* OUTER CARD — with layered background (tile color + base white with blue overlay) */}
      <div
        style={{
          width: 55.6537,
          height: 50.3351,
          borderRadius: 12,
          border: '0.6px solid var(--border-border-2, #D5D4DF)',
         
          display: 'flex',
          padding: 8,
          justifyContent: 'center',
          alignItems: 'center',
          gap: -4,  // added gap as per Figma specs
          position: 'relative',
        }}
      >
        {/* BACK TILE (brand solid) — positioned for diagonal peek effect */}
        <div
         style={{
            position: 'absolute',
            left: 6,
            top: 4,
            width: 34,
            height: 34,
            borderRadius: borderRadius,
            backgroundColor: tile,
            background: tile,
          }}
        />

        {/* GLASS FOREGROUND TILE — centered with slight offset */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%) translate(5px, 2px)',
            width: 34,
            height: 34,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: borderRadius,
            border: '0.6px solid #FFF',
            backgroundColor: hexToRgba(tile, 0.10),
            background: hexToRgba(tile, 0.10),
            backdropFilter: 'blur(3.875000238418579px)',
            // boxShadow: 'inset 0 1px 4px rgba(255,255,255,0.35)',
          }}
        >
          {/* ICON — slightly reduced size for better proportion */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
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