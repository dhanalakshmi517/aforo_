import React, { useState, useEffect } from 'react';
import { InputField, SelectField } from '../Components/InputFields';
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
}

const AccountDetailsForm: React.FC<Props> = ({ data, onChange, errors = {} }) => {
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

  // Notify parent on state change
  useEffect(() => {
    if (!onChange) return;
    const data: AccountDetailsData = {
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
    onChange(data);
  }, [phoneNumber, primaryEmail, additionalEmails, billingAddress, customerAddress, sameAsBilling, onChange]);

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
  }, []);

  // propagate state to parent
  useEffect(() => {
    if (!onChange) return;
    onChange({
      phoneNumber,
      primaryEmail,
      additionalEmailRecipients: additionalEmails,
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
    });
  }, [onChange, phoneNumber, primaryEmail, additionalEmails, sameAsBilling, customerAddress, billingAddress]);

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

  return (
    <div className="account-details-form">
      {/* Contact Info */}
      <div className="acc-form-group">
        <InputField
          label="Customer Phone Number"
          value={phoneNumber}
          placeholder="Enter digits only"
          onChange={(val) => {
            // allow only digits
            if (/^\d*$/.test(val)) setPhoneNumber(val);
          }}
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
        />
        {errors.phoneNumber && <span className="field-error">{errors.phoneNumber}</span>}
      </div>

      <div className="acc-form-group">
        <InputField
          label="Primary Email ID"
          value={primaryEmail}
          placeholder="example@domain.com"
          type="email"
          pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
          onChange={setPrimaryEmail}
        />
        {errors.primaryEmail && <span className="field-error">{errors.primaryEmail}</span>}
      </div>

      {/* Secondary Email IDs */}
      <div className="acc-form-group">
        <label>Secondary Email IDs</label>
        {additionalEmails.map((email, idx) => (
          <div key={idx} className="email-row">
            <InputField
              type="email"
              placeholder="example@domain.com"
              value={email}
              pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
              onChange={(val) => updateAdditionalEmail(idx, val)}
            />
            {errors.billingCity && <span className="field-error">{errors.billingCity}</span>}
          </div>
        ))}
        <button type="button" className="add-email-btn" onClick={addEmailField}>+ Add</button>
      </div>

      {/* Billing Address */}
      <div className="address-section">
        <h4>Billing Address</h4>
        <div className="acc-form-group">
          <label>Customer Address Line 1</label>
          <input
            type="text"
            placeholder="Placeholder"
            value={billingAddress.line1}
            onChange={(e) => handleBillingChange('line1', e.target.value)}
            required
          />
          {errors.billingAddressLine1 && <span className="field-error">{errors.billingAddressLine1}</span>}
        </div>
        <div className="acc-form-group">
          <label>Customer Address Line 2</label>
          <input
            type="text"
            placeholder="Placeholder"
            value={billingAddress.line2}
            onChange={(e) => handleBillingChange('line2', e.target.value)}
            required
          />
          {errors.billingAddressLine2 && <span className="field-error">{errors.billingAddressLine2}</span>}
        </div>
        <div className="acc-form-row">
          <div className="acc-form-group">
            <label>City</label>
            <SelectField
              value={billingAddress.city}
              required
              onChange={(val) => handleBillingChange('city', val)}
              options={[
                { label: 'Bengaluru', value: 'BENGALURU' },
                { label: 'Mumbai', value: 'MUMBAI' },
                { label: 'Delhi', value: 'DELHI' },
                { label: 'New York', value: 'NEW_YORK' },
                { label: 'Toronto', value: 'TORONTO' },
              ]}
            />
            {errors.billingCity && <span className="field-error">{errors.billingCity}</span>}
          </div>
          <div className="acc-form-group">
            <label>State/Province/Region</label>
            <SelectField
              value={billingAddress.state}
              required
              onChange={(val) => handleBillingChange('state', val)}
              options={[
                { label: 'KA', value: 'KA' },
                { label: 'MH', value: 'MH' },
                { label: 'CA', value: 'CA' },
                { label: 'NY', value: 'NY' },
                { label: 'ON', value: 'ON' },
              ]}
            />
            {errors.billingState && <span className="field-error">{errors.billingState}</span>}
          </div>
        </div>
        <div className="acc-form-row">
          <div className="acc-form-group">
            <label>ZIP/Postal Code</label>
            <SelectField
              value={billingAddress.zip}
              required
              onChange={(val) => handleBillingChange('zip', val)}
              options={[
                { label: '560001', value: 'CODE_560001' },
                { label: '400001', value: 'CODE_400001' },
                { label: '110001', value: 'CODE_110001' },
                { label: '10001', value: 'CODE_10001' },
                { label: 'M5H1A1', value: 'CODE_M5H1A1' },
              ]}
            />
            {errors.billingPostalCode && <span className="field-error">{errors.billingPostalCode}</span>}
          </div>
          <div className="acc-form-group">
            <label>Country</label>
            <SelectField
              value={billingAddress.country}
              required
              onChange={(val) => handleBillingChange('country', val)}
              options={[
                { label: 'India', value: 'INDIA' },
                { label: 'USA', value: 'USA' },
                { label: 'Canada', value: 'CANADA' },
                { label: 'UK', value: 'UK' },
                { label: 'Australia', value: 'AUSTRALIA' },
              ]}
            />
            {errors.billingCountry && <span className="field-error">{errors.billingCountry}</span>}
          </div>
        </div>
      </div>

    {/* Same as Billing Checkbox */}
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
            placeholder="Placeholder"
            value={customerAddress.line1}
            onChange={(e) => handleCustomerChange('line1', e.target.value)}
            disabled={sameAsBilling}
            required
          />
          {errors.customerAddressLine1 && <span className="field-error">{errors.customerAddressLine1}</span>}
        </div>
        <div className="acc-form-group">
          <label>Customer Address Line 2</label>
          <input
            type="text"
            placeholder="Placeholder"
            value={customerAddress.line2}
            onChange={(e) => handleCustomerChange('line2', e.target.value)}
            disabled={sameAsBilling}
            required
          />
          {errors.customerAddressLine2 && <span className="field-error">{errors.customerAddressLine2}</span>}
        </div>
        <div className="acc-form-row">
          <div className="acc-form-group">
            <label>City</label>
            <SelectField
              value={customerAddress.city}
              required
              onChange={(val) => handleCustomerChange('city', val)}
              options={[
                { label: 'Bengaluru', value: 'BENGALURU' },
                { label: 'Mumbai', value: 'MUMBAI' },
                { label: 'Delhi', value: 'DELHI' },
                { label: 'New York', value: 'NEW_YORK' },
                { label: 'Toronto', value: 'TORONTO' },
              ]}
              disabled={sameAsBilling}
            />
            {errors.customerCity && <span className="field-error">{errors.customerCity}</span>}
          </div>
          <div className="acc-form-group">
            <label>State/Province/Region</label>
            <SelectField
              value={customerAddress.state}
              required
              onChange={(val) => handleCustomerChange('state', val)}
              options={[
                { label: 'KA', value: 'KA' },
                { label: 'MH', value: 'MH' },
                { label: 'CA', value: 'CA' },
                { label: 'NY', value: 'NY' },
                { label: 'ON', value: 'ON' },
              ]}
              disabled={sameAsBilling}
            />
            {errors.customerState && <span className="field-error">{errors.customerState}</span>}
          </div>
        </div>
        <div className="acc-form-row">
          <div className="acc-form-group">
            <label>ZIP/Postal Code</label>
            <SelectField
              value={customerAddress.zip}
              required
              onChange={(val) => handleCustomerChange('zip', val)}
              options={[
                { label: '560001', value: 'CODE_560001' },
                { label: '400001', value: 'CODE_400001' },
                { label: '110001', value: 'CODE_110001' },
                { label: '10001', value: 'CODE_10001' },
                { label: 'M5H1A1', value: 'CODE_M5H1A1' },
              ]}
              disabled={sameAsBilling}
            />
            {errors.customerPostalCode && <span className="field-error">{errors.customerPostalCode}</span>}
          </div>
          <div className="acc-form-group">
            <label>Country</label>
            <SelectField
              value={customerAddress.country}
              required
              onChange={(val) => handleCustomerChange('country', val)}
              options={[
                { label: 'India', value: 'INDIA' },
                { label: 'USA', value: 'USA' },
                { label: 'Canada', value: 'CANADA' },
                { label: 'UK', value: 'UK' },
                { label: 'Australia', value: 'AUSTRALIA' },
              ]}
              disabled={sameAsBilling}
            />
            {errors.customerCountry && <span className="field-error">{errors.customerCountry}</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountDetailsForm;
