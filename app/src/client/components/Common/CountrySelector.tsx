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
}

const CountrySelector: React.FC<CountrySelectorProps> = ({
  value,
  onChange,
  countries,
  error,
  onDialCodeChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
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

  const handleSelect = (countryCode: string) => {
    const country = countries.find(c => c.code === countryCode);
    if (country) {
      onChange(countryCode);
      if (onDialCodeChange) {
        onDialCodeChange(country.dialCode);
      }
    }
    setIsOpen(false);
  };

  return (
    <div className="country-selector" ref={dropdownRef}>
      <div 
        className={`country-selector__control ${error ? 'error' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedCountry ? (
          <div className="selected-option">
            <img 
              src={`https://flagcdn.com/w20/${selectedCountry.code.toLowerCase()}.png`} 
              alt=""
              className="flag"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            {selectedCountry.name}
          </div>
        ) : (
          <span className="placeholder-text">Select a country...</span>
        )}
        <span className="chevron">{isOpen ? '▲' : '▼'}</span>
      </div>
      
      {isOpen && (
        <div className="dropdown">
          {countries.map(country => (
            <div 
              key={country.code}
              className={`dropdown-item ${value === country.code ? 'selected' : ''}`}
              onClick={() => handleSelect(country.code)}
            >
              <img 
                src={`https://flagcdn.com/w20/${country.code.toLowerCase()}.png`} 
                alt={`${country.name} flag`}
                className="flag"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              {country.name} ({country.code})
            </div>
          ))}
        </div>
      )}
      
      {error && <span className="error-msg">{error}</span>}
      <style>{`
        .country-selector {
          position: relative;
          width: 100%;
        }
        .country-selector__control {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #d9d9d9;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: white;
          transition: border-color 0.2s ease;
          min-height: 40px;
        }
        .country-selector__control.error {
          border-color: #ff4d4f;
        }
        .selected-option {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .flag {
          width: 20px;
          height: 15px;
          object-fit: cover;
        }
        .dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          max-height: 300px;
          overflow-y: auto;
          background:white;
          border: 1px solid #EAE9EA;
          border-radius: 8px;
          margin-top: 4px;
          z-index: 1000;
        }
        .dropdown-item {
          padding: 8px 12px;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }
        .chevron {
          margin-left: 8px;
          font-size: 0.8em;
          color: #666;
          pointer-events: none;
        }
        .placeholder-text {
          color: var(--color-neutral-400);
          font-style: italic;
        }
        .error-msg {
          color: #ff4d4f;
          font-size: 0.8em;
          margin-top: 4px;
        }
      `}</style>
    </div>
  );
};

export default CountrySelector;
