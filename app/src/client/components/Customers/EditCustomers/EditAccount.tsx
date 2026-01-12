import React, { useState, useEffect } from 'react';
import { InputField, DropdownField, SelectField } from '../../componenetsss/Inputs';
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

    // inline validations (skip line2 as it's optional)
    if (field !== 'line2') {
      if (!value.trim()) setErr(`billing_${field}`, 'This is a required field');
      else clearErr(`billing_${field}`);
    }
  };

  const handleCustomerChange = (field: string, value: string) => {
    setCustomerAddress({ ...customerAddress, [field]: value });
    
    // inline validations (skip line2 as it's optional)
    if (field !== 'line2') {
      if (!value.trim()) setErr(`customer_${field}`, 'This is a required field');
      else clearErr(`customer_${field}`);
    }
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
          required
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
          error={localErr.phoneNumber || errors.phoneNumber}
        />
      </div>

      <div className="acc-form-group">
        <InputField
          label="Primary Email ID"
          value={primaryEmail}
          placeholder="e.g., johndoe@example.com"
          type="email"
          required
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
  

    

      {/* Billing Address */}
      <div className="address-section">
        <h4>Billing Address</h4>
        <InputField
          label=" Line 1"
                    required

          value={billingAddress.line1}
          placeholder="e.g., 123 Main Street, Apt 4B, New York, NY 10001"
          onChange={(val) => handleBillingChange('line1', val)}
          onBlur={() => !billingAddress.line1.trim() ? setErr('billing_line1', 'This is a required field') : clearErr('billing_line1')}
          error={localErr.billing_line1 || errors.billingAddressLine1}
        />
        <InputField
          label=" Line 2"

          value={billingAddress.line2}
          placeholder="e.g., 123 Main Street, Apt 4B, New York, NY 10001"
          onChange={(val) => handleBillingChange('line2', val)}
        />
        <div className="acc-form-row">
          <div className="acc-form-group">
            <InputField
              label="City"
                        required

              value={billingAddress.city}
              placeholder="City"
              onChange={(val) => handleBillingChange('city', val)}
              onBlur={() => !billingAddress.city.trim() ? setErr('billing_city', 'This is a required field') : clearErr('billing_city')}
              error={localErr.billing_city || errors.billingCity}
            />
          </div>
          <div className="acc-form-group">
            <InputField
              label="State/Province/Region"
              
              value={billingAddress.state}
                        required

              placeholder="State/Province/Region"
              onChange={(val) => handleBillingChange('state', val)}
              onBlur={() => !billingAddress.state.trim() ? setErr('billing_state', 'This is a required field') : clearErr('billing_state')}
              error={localErr.billing_state || errors.billingState}
            />
          </div>
        </div>
        <div className="acc-form-row">
          <div className="acc-form-group">
            <InputField
              label="ZIP/Postal Code"
              value={billingAddress.zip}
                        required

              placeholder="ZIP/Postal Code"
              onChange={(val) => handleBillingChange('zip', val)}
              onBlur={() => !billingAddress.zip.trim() ? setErr('billing_zip', 'This is a required field') : clearErr('billing_zip')}
              error={localErr.billing_zip || errors.billingPostalCode}
            />
          </div>
          <div className="acc-form-group acc-country">
            <DropdownField
              label="Country"
              value={billingAddress.country}
              placeholder="Select Country"
                        required

              onChange={(val: string) => handleBillingChange('country', val)}
              options={countryOptions}
              error={localErr.billing_country || errors.billingCountry}
            />
          </div>
        </div>
      </div>
          <div className="checkbox-row">
        <Checkbox checked={sameAsBilling} onToggle={handleToggleSame} />
        <span className="checkbox-label" onClick={handleToggleSame}>
          Billing address is same as customer address
        </span>
      </div>
        {/* Customer Address */}
      <div className={`address-section1 ${sameAsBilling ? 'disabled' : ''}`}>
        <h4>Customer Address</h4>
        <InputField
          label=" Line 1"
          value={customerAddress.line1}
                    required

          placeholder="e.g., 123 Main Street, Apt 4B, New York, NY 10001"
          onChange={(val) => handleCustomerChange('line1', val)}
          onBlur={() => !sameAsBilling && !customerAddress.line1.trim() ? setErr('customer_line1', 'This is a required field') : clearErr('customer_line1')}
          disabled={sameAsBilling}
          error={localErr.customer_line1 || errors.customerAddressLine1}
        />
        <InputField
          label=" Line 2"
          value={customerAddress.line2}
          placeholder="e.g., 123 Main Street, Apt 4B, New York, NY 10001"
          onChange={(val) => handleCustomerChange('line2', val)}
          disabled={sameAsBilling}
        />
        <div className="acc-form-row">
          <div className="acc-form-group">
            <InputField
              label="City"
              value={customerAddress.city}
              placeholder="City"
                        required

              onChange={(val) => handleCustomerChange('city', val)}
              onBlur={() => !sameAsBilling && !customerAddress.city.trim() ? setErr('customer_city', 'This is a required field') : clearErr('customer_city')}
              disabled={sameAsBilling}
              error={localErr.customer_city || errors.customerCity}
            />
          </div>
          <div className="acc-form-group">
            <InputField
              label="State/Province/Region"
              value={customerAddress.state}
              placeholder="State/Province/Region"
              onChange={(val) => handleCustomerChange('state', val)}
              onBlur={() => !sameAsBilling && !customerAddress.state.trim() ? setErr('customer_state', 'This is a required field') : clearErr('customer_state')}
              disabled={sameAsBilling}
                        required

              error={localErr.customer_state || errors.customerState}
            />
          </div>
        </div>
        <div className="acc-form-row">
          <div className="acc-form-group">
            <InputField
              label="ZIP/Postal Code"
              value={customerAddress.zip}
              placeholder="ZIP/Postal Code"
              onChange={(val) => handleCustomerChange('zip', val)}
              onBlur={() => !sameAsBilling && !customerAddress.zip.trim() ? setErr('customer_zip', 'This is a required field') : clearErr('customer_zip')}
              disabled={sameAsBilling}
                        required

              error={localErr.customer_zip || errors.customerPostalCode}
            />
          </div>
          <div className="acc-form-group acc-country">
            <DropdownField
              label="Country"
              value={customerAddress.country}
              placeholder="Select Country"
              onChange={(val: string) => handleCustomerChange('country', val)}
              options={countryOptions}
              disabled={sameAsBilling}
                        required

              error={localErr.customer_country || errors.customerCountry}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditAccount;
