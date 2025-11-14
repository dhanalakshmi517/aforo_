import React, { useState, useEffect, useMemo, useRef } from 'react';
import { InputField, SelectField } from '../Components/InputFields';
import { checkEmailExists } from './api';
import { getAuthHeaders } from '../../utils/auth';
import './AccountDetailsForm.css';

export interface AccountDetailsData {
  phoneNumber: string;
  primaryEmail: string;
  additionalEmailRecipients: string[];
  billingSameAsCustomer: boolean;
  customerAddressLine1: string;
  customerAddressLine2: string;
  customerCity: string;
  customerState: string;
  customerPostalCode: string;
  customerCountry: string;
  billingAddressLine1: string;
  billingAddressLine2: string;
  billingCity: string;
  billingState: string;
  billingPostalCode: string;
  billingCountry: string;
}

interface Props {
  data?: AccountDetailsData;
  onChange?: (data: AccountDetailsData) => void;
  errors?: { [key: string]: string };
  onEmailBlur?: (email: string) => void; // optional parent hook
  /** NEW: exclude self from uniqueness checks */
  currentCustomerId?: number | string;
  /** NEW: whether this is a resumed draft */
  isDraft?: boolean;
  /** NEW: for unchanged-email suppression */
  initialPrimaryEmail?: string;
  /** NEW: lock state from parent */
  locked?: boolean;
}

const AccountDetailsForm: React.FC<Props> = ({
  data,
  onChange,
  errors = {},
  onEmailBlur,
  currentCustomerId,
  isDraft = false,
  initialPrimaryEmail = '',
  locked = false
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [primaryEmail, setPrimaryEmail] = useState('');
  const [primaryEmailError, setPrimaryEmailError] = useState<string>(''); // inline error for email
  const [additionalEmails, setAdditionalEmails] = useState<string[]>([]);

  const [billingAddress, setBillingAddress] = useState({
    line1: '',
    line2: '',
    city: '',
    state: '',
    zip: '',
    country: '',
  });

  const [customerAddress, setCustomerAddress] = useState({
    line1: '',
    line2: '',
    city: '',
    state: '',
    zip: '',
    country: '',
  });

  const [sameAsBilling, setSameAsBilling] = useState(false);
  const [countryOptions, setCountryOptions] = useState<{ label: string; value: string }[]>([]);

  // fetch country list once
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        console.log('Fetching countries from API...');
        const response = await fetch('http://44.201.19.187:8081/v1/api/meta/countries', {
          method: 'GET',
          headers: getAuthHeaders(),
        });
        
        console.log('Countries API response status:', response.status, response.statusText);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Countries API response data:', data);
        
        if (Array.isArray(data)) {
          const options = data.map((c: { code: string; name: string }) => ({ 
            label: c.name, 
            value: c.code 
          }));
          console.log('Setting country options:', options.length, 'countries');
          setCountryOptions(options);
        } else {
          console.error('Countries API returned non-array data:', data);
          // Fallback to basic country list
          setCountryOptions([
            { label: 'United States', value: 'US' },
            { label: 'Canada', value: 'CA' },
            { label: 'United Kingdom', value: 'GB' },
            { label: 'India', value: 'IN' },
            { label: 'Australia', value: 'AU' },
          ]);
        }
      } catch (error) {
        console.error('Failed to load countries:', error);
        // Fallback to basic country list
        setCountryOptions([
          { label: 'United States', value: 'US' },
          { label: 'Canada', value: 'CA' },
          { label: 'United Kingdom', value: 'GB' },
          { label: 'India', value: 'IN' },
          { label: 'Australia', value: 'AU' },
        ]);
      }
    };
    
    fetchCountries();
  }, []);

  const Checkbox: React.FC<{ checked: boolean; onToggle: () => void }> = ({ checked, onToggle }) => (
    <button type="button" className="checkbox-btn" onClick={onToggle} aria-label="Toggle same as billing">
      {checked ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#2D7CA4">
          <path d="M4 12C4 8.22876 4 6.34314 5.17158 5.17158C6.34314 4 8.22876 4 12 4C15.7712 4 17.6569 4 18.8284 5.17158C20 6.34314 20 8.22876 20 12C20 15.7712 20 17.6569 18.8284 18.8284C17.6569 20 15.7712 20 12 20C8.22876 20 6.34314 20 5.17158 18.8284C4 17.6569 4 15.7712 4 12Z" stroke="#0066cc" strokeWidth="1.2"/>
          <path d="M8 12.5L10.5 15L16 9.5" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M4 12C4 8.22876 4 6.34314 5.17158 5.17158C6.34314 4 8.22876 4 12 4C15.7712 4 17.6569 4 18.8284 5.17158C20 6.34314 20 8.22876 20 12C20 15.7712 20 17.6569 18.8284 18.8284C17.6569 20 15.7712 20 12 20C8.22876 20 6.34314 20 5.17158 18.8284C4 17.6569 4 15.7712 4 12Z" stroke="#E6E5E6" strokeWidth="1.2"/>
        </svg>
      )}
    </button>
  );

  const handleBillingChange = (field: string, value: string) => {
    const updated = { ...billingAddress, [field]: value };
    setBillingAddress(updated);
    if (sameAsBilling) {
      setCustomerAddress(updated);
    }
  };

  // sync incoming props to local state
  useEffect(() => {
    if (!data) return;
    setPhoneNumber(data.phoneNumber || '');
    setPrimaryEmail(data.primaryEmail || '');
    setAdditionalEmails(data.additionalEmailRecipients || []);
    setSameAsBilling(data.billingSameAsCustomer);
    setCustomerAddress({
      line1: data.customerAddressLine1 || '',
      line2: data.customerAddressLine2 || '',
      city: data.customerCity || '',
      state: data.customerState || '',
      zip: data.customerPostalCode || '',
      country: data.customerCountry || '',
    });
    setBillingAddress({
      line1: data.billingAddressLine1 || '',
      line2: data.billingAddressLine2 || '',
      city: data.billingCity || '',
      state: data.billingState || '',
      zip: data.billingPostalCode || '',
      country: data.billingCountry || '',
    });
  }, []); // mount only

  const handleCustomerChange = (field: string, value: string) => {
    setCustomerAddress({ ...customerAddress, [field]: value });
  };

  const addEmailField = () => {
    setAdditionalEmails([...additionalEmails, '']);
  };

  const updateAdditionalEmail = (index: number, value: string) => {
    const updated = [...additionalEmails];
    updated[index] = value;
    setAdditionalEmails(updated);
  };

  const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

  // Run inline validation on blur using API (primary email only)
  const handlePrimaryEmailBlur = async () => {
    onEmailBlur && onEmailBlur(primaryEmail);

    const value = primaryEmail.trim();

    if (!value) {
      setPrimaryEmailError('This is a required field');
      return;
    }
    if (!emailRegex.test(value)) {
      setPrimaryEmailError('Enter a valid email address');
      return;
    }

    // NEW: for drafts, if unchanged from initial, never flag
    const normalized = value.toLowerCase();
    if (isDraft && normalized === (initialPrimaryEmail || '').toLowerCase()) {
      setPrimaryEmailError('');
      return;
    }

    try {
      const exists = await checkEmailExists(value, currentCustomerId);
      if (exists) {
        setPrimaryEmailError('This email is already registered in your organization.');
      } else {
        setPrimaryEmailError('');
      }
    } catch (err) {
      setPrimaryEmailError('');
      console.error('Failed to validate email uniqueness', err);
    }
  };

  const handlePrimaryEmailChange = (val: string) => {
    const valueChanged = val !== primaryEmail;
    setPrimaryEmail(val);
    if (valueChanged && primaryEmailError) {
      setPrimaryEmailError('');
    }
  };

  const handlePrimaryEmailFocus = () => {
    if (primaryEmailError) setPrimaryEmailError('');
  };

  // Toggle billing same as customer
  const handleToggleSame = () => {
    const newVal = !sameAsBilling;
    setSameAsBilling(newVal);
    if (newVal) {
      setCustomerAddress({ ...billingAddress });
    } else {
      setCustomerAddress({ line1: '', line2: '', city: '', state: '', zip: '', country: '' });
    }
  };

  /** ---------- SINGLE, DEDUPED parent notify ---------- */
  const payload = useMemo<AccountDetailsData>(() => ({
    phoneNumber,
    primaryEmail,
    additionalEmailRecipients: additionalEmails.filter(Boolean),
    billingSameAsCustomer: sameAsBilling,
    customerAddressLine1: customerAddress.line1,
    customerAddressLine2: customerAddress.line2,
    customerCity: customerAddress.city,
    customerState: customerAddress.state,
    customerPostalCode: customerAddress.zip,
    customerCountry: customerAddress.country,
    billingAddressLine1: billingAddress.line1,
    billingAddressLine2: billingAddress.line2,
    billingCity: billingAddress.city,
    billingState: billingAddress.state,
    billingPostalCode: billingAddress.zip,
    billingCountry: billingAddress.country,
  }), [
    phoneNumber,
    primaryEmail,
    additionalEmails,
    sameAsBilling,
    customerAddress,
    billingAddress
  ]);

  const lastSentRef = useRef<string>('');
  useEffect(() => {
    if (!onChange) return;
    const serialized = JSON.stringify(payload);
    if (serialized !== lastSentRef.current) {
      lastSentRef.current = serialized;
      onChange(payload);
    }
  }, [payload, onChange]);
  /** ----------------------------------------------- */

  return (
    <div
      className={`account-details-form ${locked ? 'is-locked' : ''}`}
      style={{ position: 'relative', opacity: locked ? 0.8 : 1 }}
      aria-disabled={locked}
    >
      {/* Reduced opacity overlay - allows dropdown interactions */}
      {locked && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none', // Allow interactions to pass through
            background: 'rgba(255, 255, 255, 0.1)', // Very subtle overlay
            borderRadius: 12
          }}
        />
      )}
      {/* Contact Info */}
      <div className="acc-form-group">
        <InputField
          label="Customer Phone Number"
          value={phoneNumber}
          placeholder="e.g., +1234567890"
          onChange={(val) => {
            if (locked) return; // Prevent changes when locked
            if (/^\+?\d*$/.test(val)) setPhoneNumber(val);
          }}
          type="tel"
          inputMode="tel"
          pattern="[+0-9]*"
        />
        {errors.phoneNumber && <span className="field-error">{errors.phoneNumber}</span>}
      </div>

      <div className="acc-form-group">
        <InputField
          label="Primary Email ID"
          value={primaryEmail}
          placeholder="e.g., johndoe@example.com"
          type="email"
          pattern="[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$"
          onChange={locked ? () => {} : handlePrimaryEmailChange} // Prevent changes when locked
          onBlur={locked ? () => {} : handlePrimaryEmailBlur}
          onFocus={locked ? () => {} : handlePrimaryEmailFocus}
          error={errors.primaryEmail || primaryEmailError}
        />
      </div>

      {/* Secondary Email IDs */}
      <div className="acc-form-group">
        {additionalEmails.map((email, idx) => (
          <div key={idx} className="email-row">
            <InputField
              type="email"
              placeholder="e.g., johndoe@example.com"
              value={email}
              pattern="[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$"
              onChange={locked ? () => {} : (val) => updateAdditionalEmail(idx, val)} // Prevent changes when locked
            />
          </div>
        ))}
        <button 
          type="button" 
          className="add-email-btn" 
          onClick={locked ? () => {} : addEmailField}
          disabled={locked}
        >
          + Add Additional Email Recipients
        </button>
      </div>

      {/* Billing Address */}
      <div className="address-section">
        <h4>Billing Address</h4>
        <div className="acc-form-group">
          <label>Customer Address Line 1</label>
          <input
            type="text"
            placeholder="e.g., 123 Main Street, Apt 4B, New York, NY 10001"
            value={billingAddress.line1}
            onChange={locked ? () => {} : (e) => handleBillingChange('line1', e.target.value)} // Prevent changes when locked
            required
            disabled={locked}
          />
          {errors.billingAddressLine1 && <span className="field-error">{errors.billingAddressLine1}</span>}
        </div>
        <div className="acc-form-group">
          <label>Billing Address Line 2</label>
          <input
            type="text"
            placeholder="e.g., 123 Main Street, Apt 4B, New York, NY 10001"
            value={billingAddress.line2}
            onChange={locked ? () => {} : (e) => handleBillingChange('line2', e.target.value)}
            required
            disabled={locked}
          />
          {errors.billingAddressLine2 && <span className="field-error">{errors.billingAddressLine2}</span>}
        </div>
        <div className="acc-form-row">
          <div className="acc-form-group">
            <label>City</label>
            <input
              type="text"
              value={billingAddress.city}
              onChange={locked ? () => {} : (e) => handleBillingChange('city', e.target.value)}
              placeholder="City"
              required
              disabled={locked}
            />
            {errors.billingCity && <span className="field-error">{errors.billingCity}</span>}
          </div>
          <div className="acc-form-group">
            <label>State/Province/Region</label>
            <input
              type="text"
              value={billingAddress.state}
              onChange={locked ? () => {} : (e) => handleBillingChange('state', e.target.value)}
              placeholder="State/Province/Region"
              required
              disabled={locked}
            />
            {errors.billingState && <span className="field-error">{errors.billingState}</span>}
          </div>
        </div>
        <div className="acc-form-row">
          <div className="acc-form-group">
            <label>ZIP/Postal Code</label>
            <input
              type="text"
              value={billingAddress.zip}
              onChange={locked ? () => {} : (e) => handleBillingChange('zip', e.target.value)}
              placeholder="ZIP/Postal Code"
              required
              disabled={locked}
            />
            {errors.billingPostalCode && <span className="field-error">{errors.billingPostalCode}</span>}
          </div>
          <div className="acc-form-group acc-country">
            <label>Country</label>
            <SelectField
              value={billingAddress.country}
              required
              placeholder="Select Country"
              onChange={locked ? () => {} : (val) => handleBillingChange('country', val)}
              options={countryOptions}
            />
            {errors.billingCountry && <span className="field-error">{errors.billingCountry}</span>}
          </div>
        </div>
      </div>

      {/* Same as Billing Checkbox */}
      <div className="checkbox-row">
        <Checkbox checked={sameAsBilling} onToggle={locked ? () => {} : handleToggleSame} />
        <span className="checkbox-label" onClick={locked ? () => {} : handleToggleSame}>
          Billing address is same as customer address
        </span>
      </div>

      {/* Customer Address */}
      <div className={`address-section1 ${sameAsBilling ? 'disabled' : ''}`}>
        <h4>Customer Address</h4>
        <div className="acc-form-group">
          <label>Customer Address Line 1</label>
          <input
            type="text"
            placeholder="e.g., 123 Main Street, Apt 4B, New York, NY 10001"
            value={customerAddress.line1}
            onChange={locked ? () => {} : (e) => handleCustomerChange('line1', e.target.value)}
            disabled={sameAsBilling || locked}
            required
          />
          {errors.customerAddressLine1 && <span className="field-error">{errors.customerAddressLine1}</span>}
        </div>
        <div className="acc-form-group">
          <label>Customer Address Line 2</label>
          <input
            type="text"
            placeholder="e.g., 123 Main Street, Apt 4B, New York, NY 10001"
            value={customerAddress.line2}
            onChange={locked ? () => {} : (e) => handleCustomerChange('line2', e.target.value)}
            disabled={sameAsBilling || locked}
            required
          />
          {errors.customerAddressLine2 && <span className="field-error">{errors.customerAddressLine2}</span>}
        </div>
        <div className="acc-form-row">
          <div className="acc-form-group">
            <label>City</label>
            <input
              type="text"
              value={customerAddress.city}
              onChange={locked ? () => {} : (e) => handleCustomerChange('city', e.target.value)}
              placeholder="City"
              required
              disabled={sameAsBilling || locked}
            />
            {errors.customerCity && <span className="field-error">{errors.customerCity}</span>}
          </div>
          <div className="acc-form-group">
            <label>State/Province/Region</label>
            <input
              type="text"
              value={customerAddress.state}
              onChange={locked ? () => {} : (e) => handleCustomerChange('state', e.target.value)}
              placeholder="State/Province/Region"
              required
              disabled={sameAsBilling || locked}
            />
            {errors.customerState && <span className="field-error">{errors.customerState}</span>}
          </div>
        </div>
        <div className="acc-form-row">
          <div className="acc-form-group">
            <label>ZIP/Postal Code</label>
            <input
              type="text"
              value={customerAddress.zip}
              onChange={locked ? () => {} : (e) => handleCustomerChange('zip', e.target.value)}
              placeholder="ZIP/Postal Code"
              required
              disabled={sameAsBilling || locked}
            />
            {errors.customerPostalCode && <span className="field-error">{errors.customerPostalCode}</span>}
          </div>
          <div className="acc-form-group acc-country">
            <label>Country</label>
            <SelectField
              value={customerAddress.country}
              required
              placeholder="Select Country"
              onChange={locked ? () => {} : (val) => handleCustomerChange('country', val)}
              options={countryOptions}
              disabled={sameAsBilling || locked}
            />
            {errors.customerCountry && <span className="field-error">{errors.customerCountry}</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountDetailsForm;
