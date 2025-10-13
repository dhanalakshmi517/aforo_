// ProductLogoUploader.tsx
import React, { useRef, useState } from 'react';
import LogoUploader from '../Customers/LogoUploader';
import ProductIconPickerModal from './ProductIconPickerModal';
import './ProductLogoUploader.css';

interface ProductLogoUploaderProps {
  logo: File | null;
  onChange: (file: File | null) => void;
}

const ProductLogoUploader: React.FC<ProductLogoUploaderProps> = ({ logo, onChange }) => {
  const [showPicker, setShowPicker] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAddClick = () => setShowPicker(true);

  const handleSelectIcon = async (icon: {
    id: string;
    label: string;
    svgPath: string;
    outerBg?: [string, string];
    tileColor?: string;
  }) => {
    try {
      const outer = icon.outerBg ?? ['#F8F7FA', '#E4EEF9'];
      const tile  = icon.tileColor ?? '#CC9434';

      const svgContent = `
        <svg xmlns="http://www.w3.org/2000/svg" width="50.6537" height="46.3351" viewBox="0 0 50.6537 46.3351">
          <defs>
            <linearGradient id="bg-${icon.id}" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:${outer[0]}" />
              <stop offset="100%" style="stop-color:${outer[1]}" />
            </linearGradient>
          </defs>

          <!-- OUTER CARD -->
          <rect width="50.6537" height="46.3351" rx="12" fill="url(#bg-${icon.id})"/>
          <rect x="0.3" y="0.3" width="50.0537" height="45.7351" rx="11.7"
                fill="rgba(1,69,118,0.10)" stroke="#D5D4DF" strokeWidth="0.6"/>

          <!-- BACK TILE -->
          <rect x="12" y="9" width="29.45" height="25.243" rx="5.7" fill="${tile}"/>

          <!-- GLASS FOREGROUND TILE -->
          <g transform="translate(10.657,9.385)">
            <rect width="29.339" height="26.571" rx="6"
                  fill="rgba(202,171,213,0.10)" stroke="#FFFFFF" strokeWidth="0.6"/>
            <!-- ICON PATH (scaled) -->
            <g transform="translate(5.2,4.2) scale(0.08)">
              <g transform="translate(200,200) translate(-200,-200)">
                <path d="${icon.svgPath}" fill="#FFFFFF"/>
              </g>
            </g>
          </g>
        </svg>
      `.trim();

      const blob = new Blob([svgContent], { type: 'image/svg+xml' });
      const file = new File([blob], `${icon.id}.svg`, { type: 'image/svg+xml' });
      onChange(file);
    } catch (e) {
      console.error('Failed to generate icon SVG', e);
    } finally {
      setShowPicker(false);
    }
  };

  return (
    <div className="logo-wrapper">
      <LogoUploader
        logo={logo}
        logoUrl={null}
        onChange={onChange}
        onEdit={() => inputRef.current?.click()}
      />

      {!logo && (
        <button type="button" className="logo-add-overlay" onClick={handleAddClick} aria-label="Pick icon" />
      )}

      <ProductIconPickerModal
        isOpen={showPicker}
        onClose={() => setShowPicker(false)}
        onSelect={handleSelectIcon}
        maxCombosPerIcon={24}
      />

      <input ref={inputRef} type="file" style={{ display: 'none' }} />
    </div>
  );
};

export default ProductLogoUploader;
