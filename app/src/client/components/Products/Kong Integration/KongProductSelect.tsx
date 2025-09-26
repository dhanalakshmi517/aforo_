import React, { useMemo, useState, useCallback } from 'react';
import TopBar from '../../componenetsss/TopBar';
import SelectableCard from '../../componenetsss/SelectableCard';
import KongPopup from '../../componenetsss/Kongpopup';
import './KongProductPicker.css';

export type Product = {
  id: number | string;
  name: string;
  version?: string;
  meta?: string;
};

type Props = {
  /** No API products yet; keep this page self-contained */
  onImport?: (selected: Product[]) => void;
  title?: string;
  onBack?: () => void;
  previousRoute?: 'settings' | 'products';
};

/* -------------------------------------------
 * Fixed mock list (duplicates) — change count if needed
 * ------------------------------------------*/
const MOCK_COUNT = 30;
const MOCKS: Product[] = Array.from({ length: MOCK_COUNT }).map((_, i) => ({
  id: i + 1,
  name: 'FGG API Pro',
  version: 'version 3.4r',
  meta: 'Extra metadata, such as connected "/public"/"internal"...',
}));

export default function KongProductSelect({
  onImport,
  onBack,
  title = 'Choose products to monetize',
  previousRoute = 'products', // Default to 'products' if not specified
}: Props) {
  const data = MOCKS; // <-- always use duplicates (no API)

  const [query, setQuery] = useState('');
    const [selected, setSelected] = useState<Set<Product['id']>>(new Set());
  const [selectedColor, setSelectedColor] = useState<string>('rgba(27, 105, 255, 0.03)');
  const [showConfirm, setShowConfirm] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data;
    return data.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.version || '').toLowerCase().includes(q) ||
        (p.meta || '').toLowerCase().includes(q)
    );
  }, [data, query]);

  const selectedList = useMemo(
    () => data.filter((p) => selected.has(p.id)),
    [data, selected]
  );
  const hasSelected = selectedList.length > 0;

  // Generate a color based on the product ID
  const getColorForId = useCallback((id: number | string) => {
    const colors = [
      'rgba(255, 99, 71, 0.15)',     /* Tomato */
      'rgba(30, 144, 255, 0.15)',    /* DodgerBlue */
      'rgba(60, 179, 113, 0.15)',    /* MediumSeaGreen */
      'rgba(255, 215, 0, 0.15)',     /* Gold */
      'rgba(218, 112, 214, 0.15)',   /* Orchid */
      'rgba(75, 0, 130, 0.15)',      /* Indigo */
      'rgba(244, 164, 96, 0.15)',    /* SandyBrown */
      'rgba(220, 20, 60, 0.15)',     /* Crimson */
      'rgba(0, 206, 209, 0.15)',     /* DarkTurquoise */
      'rgba(186, 85, 211, 0.15)',    /* MediumOrchid */
      'rgba(255, 140, 0, 0.15)',     /* DarkOrange */
      'rgba(0, 128, 128, 0.15)',     /* Teal */
      'rgba(72, 61, 139, 0.15)',     /* DarkSlateBlue */
      'rgba(46, 139, 87, 0.15)',     /* SeaGreen */
      'rgba(128, 0, 0, 0.15)',       /* Maroon */
      
    ];
    const index = typeof id === 'string' 
      ? id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length
      : id % colors.length;
    return colors[index];
  }, []);

  const toggle = (prod: Product, next?: boolean) => {
    setSelected((prev) => {
      const s = new Set(prev);
      const willSelect = typeof next === 'boolean' ? next : !s.has(prod.id);
      if (willSelect) {
        s.add(prod.id);
        setSelectedColor(getColorForId(prod.id));
      } else {
        s.delete(prod.id);
        // Reset to default color if no items are selected
        if (s.size === 0) {
          setSelectedColor('rgba(27, 105, 255, 0.03)');
        }
      }
      return s;
    });
  };

  const remove = (id: Product['id']) =>
    setSelected((prev) => {
      const s = new Set(prev);
      s.delete(id);
      return s;
    });

  if (showConfirm) {
    return (
      <KongPopup
        isOpen
        onClose={() => setShowConfirm(false)}
        onLeave={() => {
          if (onBack) {
            onBack();
          } else if (previousRoute === 'settings') {
            // Navigate directly to settings if that's where we came from
            window.location.href = '/get-started/settings';
          } else {
            // Default to products page if no specific handler
            window.location.href = '/get-started/products';
          }
          setShowConfirm(false);
        }}
        onKeep={() => setShowConfirm(false)}
      />
    );
  }

  return (
    <div className="kps-page">
      <TopBar 
        title="Kong Product Integration" 
        onBack={() => {
          // Show confirmation dialog when back button is clicked
          setShowConfirm(true);
        }} 
      />

      {/* ONE container: header + grid + (optional) selection panel */}
      <div className="kps-card">
        {/* Header Row */}
        <div className="kps-row kps-row--header">
          <div className="kps-title">{title}</div>
          <div className="kps-search">
            <div className="kps-search-container">
              <div className="kps-search-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M16.5 16.5L12.8833 12.8833M14.8333 8.16667C14.8333 11.8486 11.8486 14.8333 8.16667 14.8333C4.48477 14.8333 1.5 11.8486 1.5 8.16667C1.5 4.48477 4.48477 1.5 8.16667 1.5C11.8486 1.5 14.8333 4.48477 14.8333 8.16667Z" stroke="#909599" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <input
                className="kps-search-input"
                placeholder="Search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search products"
              />
            </div>
            <div className="kps-selected-count" style={{ visibility: selectedList.length > 0 ? 'visible' : 'hidden' }}>
                Selected Products
            </div>
          </div>
        </div>

        {/* Body Row */}
        <div className="kps-row kps-row--body">
          {/* Left grid */}
          <div className={`kps-grid ${hasSelected ? '' : 'kps-grid--full'}`}>
            {filtered.map((p) => {
              const cardColor = getColorForId(p.id);
              const borderColor = cardColor.replace('0.03', '1');
              const bgColor = cardColor.replace('0.03', '0.1');
              
              return (
                <div 
                  key={p.id} 
                  className="kps-card-wrapper"
                  style={{
                    '--af-bg-selected': bgColor,
                    '--af-border-selected': borderColor,
                    '--af-bg-pressed': cardColor.replace('0.03', '0.2'),
                    '--af-brand-strong': borderColor
                  } as React.CSSProperties}
                >
                  <SelectableCard
                    title={p.name}
                    version={p.version}
                    meta={p.meta}
                    selected={selected.has(p.id)}
                    onSelectedChange={(n: boolean) => toggle(p, n)}
                  />
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div className="kps-empty">No products match “{query}”.</div>
            )}
          </div>

          {/* Divider + Right panel ONLY after first selection */}
          {hasSelected && <div className="kps-divider" aria-hidden="true" />}

          {hasSelected && (
            <aside className="kps-right">
              <div className="kps-right-content">
                {/* {selectedList.length > 0 && (
                  <div className="kps-right-title">Selected Products</div>
                )} */}
                <div className="kps-chip-list" role="list">
                  {selectedList.map((p) => {
                    const chipColor = getColorForId(p.id);
                    const borderColor = chipColor.replace('0.03', '1');
                    const bgColor = chipColor.replace('0.03', '0.1');
                    
                    return (
                      <div 
                        key={p.id}
                        className="kps-chip"
                        style={{
                          backgroundColor: bgColor,
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                          marginBottom: '8px',
                          padding: '8px 12px',
                          borderRadius: '4px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <div className="kps-chip-name" style={{ color: 'var(--af-text)' }}>
                          {p.name}
                          <div className="kps-chip-version" style={{ color: 'var(--af-text)' }}>
                          {p.version}
                          </div>
                        </div>
                        <button
                          type="button"
                          className="kps-chip-x"
                          aria-label={`Remove ${p.name}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            remove(p.id);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '16px',
                            color: '#777',
                            padding: '0 4px',
                            marginLeft: '8px'
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 10" fill="none">
  <path d="M9 1L1 9M1 1L9 9" stroke="#1A2126" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                type="button"
                className="kps-import"
                onClick={() => onImport?.(selectedList)}
               
                // onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1557d5'}
                // onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#1b69ff'}
              >
                Import products
              </button>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
