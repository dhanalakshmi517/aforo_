import React, { useState, useEffect, useRef } from 'react';

interface Country {
  code: string;
  name: string;
  dialCode: string;
}

interface CountrySelectProps {
  value: string;
  onChange: (countryCode: string) => void;
  countries: Country[];
  error?: string;
}

const CountrySelect: React.FC<CountrySelectProps> = ({ value, onChange, countries, error }) => {
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

  return (
    <div className="country-select" ref={dropdownRef}>
      <div 
        className={`select-header ${error ? 'error' : ''}`}
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
            {selectedCountry.name} ({selectedCountry.dialCode})
          </div>
        ) : (
          'Select a country...'
        )}
        <span className="chevron">{isOpen ? '▲' : '▼'}</span>
      </div>
      
      {isOpen && (
        <div className="dropdown">
          {countries.map(country => (
            <div 
              key={country.code}
              className={`dropdown-item ${value === country.code ? 'selected' : ''}`}
              onClick={() => {
                onChange(country.code);
                setIsOpen(false);
              }}
            >
              <img 
                src={`https://flagcdn.com/w20/${country.code.toLowerCase()}.png`} 
                alt={`${country.name} flag`}
                className="flag"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              {country.name} ({country.dialCode})
            </div>
          ))}
        </div>
      )}
      
      <style>{`
        .country-select {
          position: relative;
          width: 100%;
        }
        .select-header {
          width: 100%;
          padding: 10px;
          border: 1px solid #d9d9d9;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: white;
        }
        .select-header.error {
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
          background: white;
          border: 1px solid #d9d9d9;
          border-radius: 4px;
          margin-top: 4px;
          z-index: 1000;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .dropdown-item {
          padding: 8px 12px;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }
        .dropdown-item:hover, .dropdown-item.selected {
          background-color: #f5f5f5;
        }
        .chevron {
          margin-left: 8px;
          font-size: 0.8em;
          color: #666;
        }
      `}</style>
    </div>
  );
};

export default CountrySelect;
