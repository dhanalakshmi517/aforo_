import React, { useState, useEffect } from 'react';
import { InputField, SelectField } from '../../Components/InputFields';
import './EditAccount.css';

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
}

const EditAccount: React.FC<Props> = ({ data, onChange, errors = {} }) => {
  const [initialized, setInitialized] = useState(false);

  const [phoneNumber, setPhoneNumber] = useState('');
  const [primaryEmail, setPrimaryEmail] = useState('');
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

  // local inline errors (cleared on valid input)
  const [localErr, setLocalErr] = useState<{ [k: string]: string }>({});

  const setErr = (k: string, msg: string) => setLocalErr((p) => ({ ...p, [k]: msg }));
  const clearErr = (k: string) =>
    setLocalErr((p) => {
      const n = { ...p };
      delete n[k];
      return n;
    });

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  // Fetch country list once
  useEffect(() => {
    fetch('http://44.201.19.187:8081/v1/api/meta/countries')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCountryOptions(
            data.map((c: { code: string; name: string }) => ({ label: c.name, value: c.code }))
          );
        }
      })
      .catch((err) => console.error('Failed to load countries', err));
  }, []);

  // Sync props -> local state (once)
  useEffect(() => {
    if (!data || initialized) return;
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
    setInitialized(true);
  }, [data, initialized]);

  // Notify parent on state change
  useEffect(() => {
    if (!onChange) return;
    const updatedData: AccountDetailsData = {
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
    };
    onChange(updatedData);
  }, [phoneNumber, primaryEmail, additionalEmails, billingAddress, customerAddress, sameAsBilling, onChange]);

  const Checkbox: React.FC<{ checked: boolean; onToggle: () => void }> = ({ checked, onToggle }) => (
    <button type="button" className="checkbox-btn" onClick={onToggle} aria-label="Toggle same as billing">
      {checked ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#2D7CA4">
          <path d="M4 12C4 8.22876 4 6.34314 5.17158 5.17158C6.34314 4 8.22876 4 12 4C15.7712 4 17.6569 4 18.8284 5.17158C20 6.34314 20 8.22876 20 12C20 15.7712 20 17.6569 18.8284 18.8284C17.6569 20 15.7712 20 12 20C8.22876 20 6.34314 20 5.17158 18.8284C4 17.6569 4 15.7712 4 12Z" stroke="#0066cc" strokeWidth="1.2" />
          <path d="M8 12.5L10.5 15L16 9.5" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M4 12C4 8.22876 4 6.34314 5.17158 5.17158C6.34314 4 8.22876 4 12 4C15.7712 4 17.6569 4 18.8284 5.17158C20 6.34314 20 8.22876 20 12C20 15.7712 20 17.6569 18.8284 18.8284C17.6569 20 15.7712 20 12 20C8.22876 20 6.34314 20 5.17158 18.8284C4 17.6569 4 15.7712 4 12Z" stroke="#E6E5E6" strokeWidth="1.2" />
        </svg>
      )}
    </button>
  );

  const handleBillingChange = (field: string, value: string) => {
    const updated = { ...billingAddress, [field]: value };
    setBillingAddress(updated);
    if (sameAsBilling) setCustomerAddress(updated);

    // inline validations
    if (!value.trim()) setErr(`billing_${field}`, 'This is a required field');
    else clearErr(`billing_${field}`);
  };

  const handleCustomerChange = (field: string, value: string) => {
    setCustomerAddress({ ...customerAddress, [field]: value });
    if (!value.trim()) setErr(`customer_${field}`, 'This is a required field');
    else clearErr(`customer_${field}`);
  };

  const addEmailField = () => setAdditionalEmails([...additionalEmails, '']);
  const updateAdditionalEmail = (index: number, value: string) => {
    const updated = [...additionalEmails];
    updated[index] = value;
    setAdditionalEmails(updated);
  };

  const handleToggleSame = () => {
    const newVal = !sameAsBilling;
    setSameAsBilling(newVal);
    if (newVal) {
      setCustomerAddress({ ...billingAddress });
      // clear customer address errors when disabled
      ['line1', 'line2', 'city', 'state', 'zip', 'country'].forEach((f) => clearErr(`customer_${f}`));
    } else {
      setCustomerAddress({ line1: '', line2: '', city: '', state: '', zip: '', country: '' });
    }
  };

  return (
    <div className="account-details-form">
      {/* Contact Info */}
      <div className="acc-form-group">
        <InputField
          label="Customer Phone Number"
          value={phoneNumber}
          placeholder="e.g., +1234567890"
          onChange={(val) => {
            if (/^\+?\d*$/.test(val)) {
              setPhoneNumber(val);
              if (!val.trim()) setErr('phoneNumber', 'This is a required field');
              else clearErr('phoneNumber');
            }
          }}
          onBlur={() => {
            if (!phoneNumber.trim()) setErr('phoneNumber', 'This is a required field');
          }}
          type="tel"
          inputMode="tel"
          pattern="[+0-9]*"
          error={localErr.phoneNumber || errors.phoneNumber}
        />
      </div>

      <div className="acc-form-group">
        <InputField
          label="Primary Email ID"
          value={primaryEmail}
          placeholder="e.g., johndoe@example.com"
          type="email"
          onChange={(val) => {
            setPrimaryEmail(val);
            if (!val.trim()) setErr('primaryEmail', 'This is a required field');
            else if (!emailRegex.test(val)) setErr('primaryEmail', 'Enter a valid email address');
            else clearErr('primaryEmail');
          }}
          onBlur={() => {
            if (!primaryEmail.trim()) setErr('primaryEmail', 'This is a required field');
            else if (!emailRegex.test(primaryEmail)) setErr('primaryEmail', 'Enter a valid email address');
          }}
          error={localErr.primaryEmail || errors.primaryEmail}
        />
      </div>

      {/* Secondary Email IDs */}
      <div className="acc-form-group">
        <label>Secondary Email IDs</label>
        {additionalEmails.map((email, idx) => (
          <div key={idx} className="email-row">
            <InputField
              type="email"
              placeholder="e.g., johndoe@example.com"
              value={email}
              onChange={(val) => updateAdditionalEmail(idx, val)}
            />
          </div>
        ))}
        <button type="button" className="add-email-btn" onClick={addEmailField}>+ Add Additional Email Recipients</button>
      </div>

      {/* Same as Billing */}
      <div className="checkbox-row">
        <Checkbox checked={sameAsBilling} onToggle={handleToggleSame} />
        <span className="checkbox-label" onClick={handleToggleSame}>
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
            onChange={(e) => handleCustomerChange('line1', e.target.value)}
            onBlur={() => !sameAsBilling && !customerAddress.line1.trim() ? setErr('customer_line1', 'This is a required field') : null}
            disabled={sameAsBilling}
            required
          />
          {(localErr.customer_line1 || errors.customerAddressLine1) && <span className="field-error">{localErr.customer_line1 || errors.customerAddressLine1}</span>}
        </div>
        <div className="acc-form-group">
          <label>Customer Address Line 2</label>
          <input
            type="text"
            placeholder="e.g., 123 Main Street, Apt 4B, New York, NY 10001"
            value={customerAddress.line2}
            onChange={(e) => handleCustomerChange('line2', e.target.value)}
            onBlur={() => !sameAsBilling && !customerAddress.line2.trim() ? setErr('customer_line2', 'This is a required field') : null}
            disabled={sameAsBilling}
            required
          />
          {(localErr.customer_line2 || errors.customerAddressLine2) && <span className="field-error">{localErr.customer_line2 || errors.customerAddressLine2}</span>}
        </div>
        <div className="acc-form-row">
          <div className="acc-form-group">
            <label>City</label>
            <input
              type="text"
              value={customerAddress.city}
              onChange={(e) => handleCustomerChange('city', e.target.value)}
              onBlur={() => !sameAsBilling && !customerAddress.city.trim() ? setErr('customer_city', 'This is a required field') : null}
              placeholder="City"
              required
              disabled={sameAsBilling}
            />
            {(localErr.customer_city || errors.customerCity) && <span className="field-error">{localErr.customer_city || errors.customerCity}</span>}
          </div>
          <div className="acc-form-group">
            <label>State/Province/Region</label>
            <input
              type="text"
              value={customerAddress.state}
              onChange={(e) => handleCustomerChange('state', e.target.value)}
              onBlur={() => !sameAsBilling && !customerAddress.state.trim() ? setErr('customer_state', 'This is a required field') : null}
              placeholder="State/Province/Region"
              required
              disabled={sameAsBilling}
            />
            {(localErr.customer_state || errors.customerState) && <span className="field-error">{localErr.customer_state || errors.customerState}</span>}
          </div>
        </div>
        <div className="acc-form-row">
          <div className="acc-form-group">
            <label>ZIP/Postal Code</label>
            <input
              type="text"
              value={customerAddress.zip}
              onChange={(e) => handleCustomerChange('zip', e.target.value)}
              onBlur={() => !sameAsBilling && !customerAddress.zip.trim() ? setErr('customer_zip', 'This is a required field') : null}
              placeholder="ZIP/Postal Code"
              required
              disabled={sameAsBilling}
            />
            {(localErr.customer_zip || errors.customerPostalCode) && <span className="field-error">{localErr.customer_zip || errors.customerPostalCode}</span>}
          </div>
          <div className="acc-form-group">
            <label>Country</label>
            <SelectField
              value={customerAddress.country}
              required
              placeholder="Select Country"
              onChange={(val) => handleCustomerChange('country', val)}
              onBlur={() => !sameAsBilling && !customerAddress.country.trim() ? setErr('customer_country', 'This is a required field') : null}
              options={countryOptions}
              disabled={sameAsBilling}
              error={localErr.customer_country || errors.customerCountry}
            />
          </div>
        </div>
      </div>

      {/* Billing Address */}
      <div className="address-section">
        <h4>Billing Address</h4>
        <div className="acc-form-group">
          <label>Billing Address Line 1</label>
          <input
            type="text"
            placeholder="e.g., 123 Main Street, Apt 4B, New York, NY 10001"
            value={billingAddress.line1}
            onChange={(e) => handleBillingChange('line1', e.target.value)}
            onBlur={() => !billingAddress.line1.trim() ? setErr('billing_line1', 'This is a required field') : null}
            required
          />
          {(localErr.billing_line1 || errors.billingAddressLine1) && <span className="field-error">{localErr.billing_line1 || errors.billingAddressLine1}</span>}
        </div>
        <div className="acc-form-group">
          <label>Billing Address Line 2</label>
          <input
            type="text"
            placeholder="e.g., 123 Main Street, Apt 4B, New York, NY 10001"
            value={billingAddress.line2}
            onChange={(e) => handleBillingChange('line2', e.target.value)}
            onBlur={() => !billingAddress.line2.trim() ? setErr('billing_line2', 'This is a required field') : null}
            required
          />
          {(localErr.billing_line2 || errors.billingAddressLine2) && <span className="field-error">{localErr.billing_line2 || errors.billingAddressLine2}</span>}
        </div>
        <div className="acc-form-row">
          <div className="acc-form-group">
            <label>City</label>
            <input
              type="text"
              value={billingAddress.city}
              onChange={(e) => handleBillingChange('city', e.target.value)}
              onBlur={() => !billingAddress.city.trim() ? setErr('billing_city', 'This is a required field') : null}
              placeholder="City"
              required
            />
            {(localErr.billing_city || errors.billingCity) && <span className="field-error">{localErr.billing_city || errors.billingCity}</span>}
          </div>
          <div className="acc-form-group">
            <label>State/Province/Region</label>
            <input
              type="text"
              value={billingAddress.state}
              onChange={(e) => handleBillingChange('state', e.target.value)}
              onBlur={() => !billingAddress.state.trim() ? setErr('billing_state', 'This is a required field') : null}
              placeholder="State/Province/Region"
              required
            />
            {(localErr.billing_state || errors.billingState) && <span className="field-error">{localErr.billing_state || errors.billingState}</span>}
          </div>
        </div>
        <div className="acc-form-row">
          <div className="acc-form-group">
            <label>ZIP/Postal Code</label>
            <input
              type="text"
              value={billingAddress.zip}
              onChange={(e) => handleBillingChange('zip', e.target.value)}
              onBlur={() => !billingAddress.zip.trim() ? setErr('billing_zip', 'This is a required field') : null}
              placeholder="ZIP/Postal Code"
              required
            />
            {(localErr.billing_zip || errors.billingPostalCode) && <span className="field-error">{localErr.billing_zip || errors.billingPostalCode}</span>}
          </div>
          <div className="acc-form-group">
            <label>Country</label>
            <SelectField
              value={billingAddress.country}
              required
              placeholder="Select Country"
              onChange={(val) => handleBillingChange('country', val)}
              onBlur={() => !billingAddress.country.trim() ? setErr('billing_country', 'This is a required field') : null}
              options={countryOptions}
              error={localErr.billing_country || errors.billingCountry}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditAccount;
