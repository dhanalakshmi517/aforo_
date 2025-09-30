import React, { useState, useEffect, useRef } from 'react';

interface Country {
  code: string;
  name: string;
  dialCode: string;
}

interface CountrySelectorProps {
  value: string;
  onChange: (countryCode: string) => void;
  countries: Country[];
  error?: string;
  onDialCodeChange?: (dialCode: string) => void;
  showDialCode?: boolean;
  showCountryCode?: boolean;
}

const CountrySelector: React.FC<CountrySelectorProps> = ({
  value,
  onChange,
  countries,
  error,
  onDialCodeChange,
  showDialCode = true,
  showCountryCode = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedCountry = countries.find(c => c.code === value);
  const placeholder = 'Select a country';

  const filteredCountries = searchTerm
    ? countries.filter(country => {
        const s = searchTerm.toLowerCase();
        const name = country.name.toLowerCase();
        const code = country.code.toLowerCase();
        if (name.startsWith(s)) return true;
        if (code.startsWith(s)) return true;
        if (name.includes(s)) return true;
        if (code.includes(s)) return true;
        return country.dialCode.includes(searchTerm);
      })
    : countries;

  const handleSelect = (countryCode: string) => {
    const country = countries.find(c => c.code === countryCode);
    if (country) {
      onChange(countryCode);
      onDialCodeChange?.(country.dialCode);
    }
    setIsOpen(false);
  };

  return (
    <div className="country-selector" ref={dropdownRef}>
      <div
        className={`${error ? 'error' : ''} ${isOpen ? 'open' : ''} country-selector__control`}
        onClick={() => setIsOpen(o => !o)}
        role="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') setIsOpen(o => !o);
          if (e.key === 'Escape') setIsOpen(false);
        }}
      >
        {selectedCountry ? (
          <div className="selected-option">
            <img
              src={`https://flagcdn.com/16x12/${selectedCountry.code.toLowerCase()}.png`}
              alt={selectedCountry.name}
              className="flag"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <span>{selectedCountry.name}</span>
          </div>
        ) : (
          <span className="placeholder-text">{placeholder}</span>
        )}

        {/* SVG chevron */}
        <svg className="chevron" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M7 10l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      {isOpen && (
        <div className="dropdown">
          <div className="p-2 border-b border-gray-200">
            <input
              type="text"
              placeholder="Search countries..."
              className="w-full p-2 border rounded text-sm search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
          </div>
          <div className="dropdown-list" role="listbox">
            {filteredCountries.length > 0 ? (
              filteredCountries.map(country => (
                <div
                  key={country.code}
                  className={`dropdown-item ${value === country.code ? 'selected' : ''}`}
                  onClick={() => handleSelect(country.code)}
                  role="option"
                  aria-selected={value === country.code}
                >
                  <img
                    src={`https://flagcdn.com/w20/${country.code.toLowerCase()}.png`}
                    alt={`${country.name} flag`}
                    className="flag"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                  <span className="truncate">
                    {country.name}
                    {showCountryCode && ` (${country.code})`}
                  </span>
                  {showDialCode && (
                    <span className="ml-auto text-gray-500 text-sm">{country.dialCode}</span>
                  )}
                </div>
              ))
            ) : (
              <div className="p-2 text-sm text-gray-500 text-center">No countries found</div>
            )}
          </div>
        </div>
      )}

      {error && <span className="error-msg">{error}</span>}

      <style>{`
        .country-selector { position: relative; width: 100%; }

        .country-selector__control {
          position: relative;
          width: 100%;
          min-height: 40px;
          padding: 8px 44px 8px 16px;
          border: 1px solid var(--color-neutral-300);
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          background: var(--color-neutral-white);
          transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
        }
        .country-selector__control:hover:not(.error) {
          border-color: var(--color-neutral-200);
          background-color: var(--color-neutral-white );
        }
        .country-selector__control.open {
          border-color: var(--color-primary-600);
          background-color: var(--color-neutral-white);
        }
        .country-selector__control:focus-visible {
          border-color: var(--color-primary-600);
          outline: none;
          box-shadow: 0 0 0 1px var(--color-primary-600);
        }
        .country-selector__control.error { border: 1px solid #ff4d4f; }

        .selected-option { display: flex; align-items: center; gap: 10px; color: var(--color-neutral-1700); }
        .flag { width: 24px; height: 18px; object-fit: cover; margin-right: 8px; }

        .chevron {
          position: absolute;
          right: 12px;
          top: 50%;
          width: 20px;
          height: 20px;
          color: var(--color-neutral-500);
          transform: translateY(-50%);
          transition: transform 0.15s ease;
          pointer-events: none;
        }
        .country-selector__control.open .chevron { transform: translateY(-50%) rotate(180deg); }

        .placeholder-text { color: var(--color-neutral-500); font-weight: 400; font-family: var(--font-family-primary); }
        .error-msg { color: #ff4d4f; font-size: 0.8em; margin-top: 4px; }

        .dropdown {
          position: absolute;
          top: 100%;
          left: 0; right: 0;
          background: var(--color-neutral-white);
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.08);
          z-index: 10;
          display: flex;
          flex-direction: column;
          max-height: 320px;
          overflow: hidden;
          margin-top: 6px;
        }
        .dropdown-list { overflow-y: auto; max-height: 260px; }
        .dropdown-item {
          padding: 10px 16px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 12px;
          color: var(--color-neutral-1700);
          background-color: var(--color-neutral-50);
          margin: 4px 8px;
          border-radius: 6px;
          transition: all 0.15s ease;
          background-color: var(--color-neutral-white);
        }
        .search-input:focus {
          border-color: var(--color-neutral-300); /* keep neutral on the input */
          background-color: var(--color-neutral-white);
          box-shadow: none;
        }

        /* Move focus ring to the FIELD when search is focused */
        .country-selector:has(.search-input:focus) .country-selector__control {
          border-color: var(--color-primary-600);
          box-shadow: 0 0 0 1px var(--color-primary-600);
          background-color: var(--color-neutral-white);
        }
      `}</style>
    </div>
  );
};

export default CountrySelector;
