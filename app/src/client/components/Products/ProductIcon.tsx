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
  const outer = icon.outerBg ?? ['#F8F7FA', '#E4EEF9'];
  const tile = icon.tileColor ?? '#CC9434';

  return (
    <button
      type="button"
      className="pi-item"
      onClick={() => onSelect(icon)}
      aria-label={icon.label}
    >
      {/* OUTER CARD — spec sizes and a soft BR vignette */}
      <div
        style={{
          width: 50.6537,
          height: 46.3351,
          borderRadius: 12,
          border: '0.6px solid var(--border-border-2, #D5D4DF)',
          background: `
            linear-gradient(0deg, rgba(1,69,118,0.10) 0%, rgba(1,69,118,0.10) 100%),
            linear-gradient(135deg, ${outer[0]}, ${outer[1]}),
            radial-gradient(110% 110% at 85% 85%, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0) 60%)
          `,
          display: 'flex',
          padding: 8,
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* BACK TILE (brand solid) — offset up/left */}
        <div
          style={{
            position: 'absolute',
            left: 10.5,   // <- slight tweak so it peeks correctly
            top: 8.2,
            width: 29.45,
            height: 25.243,
            borderRadius: 5.7,
            background: tile,
          }}
        />

        {/* GLASS FOREGROUND TILE — offset right/down so layers are visible */}
        <div
          style={{
            width: 29.339,
            height: 26.571,
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
            // key: push glass slightly so the amber pad peeks
            transform: 'translate(3px, 2px)',
            boxShadow: 'inset 0 1px 8px rgba(255,255,255,0.35)',
          }}
        >
          {/* ICON — single SVG at 18×18 using the original 400×400 path */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox={icon.viewBox ?? "0 0 18 18"}
            fill="none"
            style={{ flexShrink: 0, aspectRatio: '1 / 1', display: 'block' }}
          >
            <path d={icon.svgPath} fill="#FFFFFF" />
          </svg>
        </div>
      </div>

      <span>{icon.label}</span>
    </button>
  );
};

export default ProductIcon;
