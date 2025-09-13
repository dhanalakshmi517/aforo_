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
  
  // Filter countries based on search term
  const filteredCountries = searchTerm 
    ? countries.filter(country => {
        const searchLower = searchTerm.toLowerCase();
        const countryNameLower = country.name.toLowerCase();
        const countryCodeLower = country.code.toLowerCase();
        
        // First priority: Exact start of country name
        if (countryNameLower.startsWith(searchLower)) return true;
        
        // Second priority: Exact start of country code
        if (countryCodeLower.startsWith(searchLower)) return true;
        
        // Third priority: Contains in country name
        if (countryNameLower.includes(searchLower)) return true;
        
        // Fourth priority: Contains in country code
        if (countryCodeLower.includes(searchLower)) return true;
        
        // Last priority: Dial code match
        return country.dialCode.includes(searchTerm);
      })
    : countries;

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
          <div className="flex items-center">
            <img 
              src={`https://flagcdn.com/16x12/${selectedCountry.code.toLowerCase()}.png`} 
              alt={selectedCountry.name}
              style={{ width: '20px', height: '15px', marginRight: '8px', objectFit: 'cover' }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <span>{selectedCountry.name}</span>
          </div>
        ) : (
          <span className="text-gray-400">{placeholder}</span>
        )}
        <span className="chevron">{isOpen ? '▲' : '▼'}</span>
      </div>
      
      {isOpen && (
        <div className="dropdown">
          <div className="p-2 border-b border-gray-200">
            <input
              type="text"
              placeholder="Search countries..."
              className="w-full p-2 border rounded text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
          </div>
          <div className="dropdown-list">
            {filteredCountries.length > 0 ? (
              filteredCountries.map(country => (
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
                  <span className="truncate">{country.name} ({country.code})</span>
                  <span className="ml-auto text-gray-500 text-sm">{country.dialCode}</span>
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
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          z-index: 10;
          display: flex;
          flex-direction: column;
        }
        .dropdown-list {
          overflow-y: auto;
          max-height: 250px;
        }
        .dropdown-item {
          padding: 8px 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .dropdown-item:hover {
          background-color: white;
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
