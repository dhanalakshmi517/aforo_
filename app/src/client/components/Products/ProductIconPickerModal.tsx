// ProductIconPickerModal.tsx
import React, { useEffect, useMemo, useState } from 'react';
import ProductIcon, { ProductIconData } from './ProductIcon';
import { outerBgPalettes, tileSolids, buildColorCombos } from './icons/iconPalette';
import { iconSymbols } from './icons/iconSymbols';
import SearchInput from '../componenetsss/SearchInput';
import './ProductIconPickerModal.css';

export interface ProductIconPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (icon: any) => void;
  icons?: ProductIconData[];
  maxCombosPerIcon?: number; // keep grid reasonable
}

const ProductIconPickerModal: React.FC<ProductIconPickerModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  icons = [],
  maxCombosPerIcon = 24,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const builtIcons = useMemo(() => {
    if (icons.length) return icons;

    const combos = buildColorCombos(outerBgPalettes, tileSolids);

    // Map each unique icon symbol to exactly one color combo so the grid shows
    // each icon only once (no repetitions).
    const list: ProductIconData[] = iconSymbols.map((sym, idx) => {
      const combo = combos[idx % combos.length];
      return {
        id: sym.id,
        label: sym.label,
        svgPath: sym.svgPath,
        outerBg: combo.outerBg,
        tileColor: combo.tileColor,
      };
    });

    return list;
  }, [icons, maxCombosPerIcon]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return builtIcons;
    return builtIcons.filter(i => i.label.toLowerCase().includes(q));
  }, [query, builtIcons]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div 
      className="pi-overlay" 
      role="dialog" 
      aria-modal="true"
      onClick={handleOverlayClick}
      onMouseDown={handleMouseDown}
      style={{ pointerEvents: 'auto' }}
    >
      <div className="pi-modal" onMouseDown={handleMouseDown}>
        <button className="pi-close" onClick={onClose} aria-label="Close icon picker">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 5L5 15M5 5L15 15" stroke="#909599" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <div className="pi-search">
          <SearchInput
            value={query}
            placeholder="Search product icon..."
            onChange={setQuery}
          />
        </div>

        <div className="pi-grid">
          {filtered.map((icon: ProductIconData) => (
            <ProductIcon key={icon.id} icon={icon} onSelect={icon=>onSelect?.(icon)} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductIconPickerModal;
