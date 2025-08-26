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

interface EditAccountProps {
  data?: AccountDetailsData;
  onChange?: (data: AccountDetailsData) => void;
  errors?: { [key: string]: string };
}

const EditAccount: React.FC<EditAccountProps> = ({ data, onChange, errors = {} }) => {
  // Flag to sync incoming data only once (initial load)
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

  // Sync incoming data for Edit Mode (only first time)
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

  // Notify parent of changes
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
  }, [phoneNumber, primaryEmail, additionalEmails, sameAsBilling, billingAddress, customerAddress, onChange]);

  return (
    <div className="edit-account-form">
      <h3>Edit Account Details</h3>

      {/* Phone Number */}
      <InputField
        label="Phone Number"
        value={phoneNumber}
        onChange={(val: string) => setPhoneNumber(val)}
        error={errors.phoneNumber}
      />

      {/* Primary Email */}
      <InputField
        label="Primary Email"
        value={primaryEmail}
        onChange={(val: string) => setPrimaryEmail(val)}
        error={errors.primaryEmail}
      />

      {/* Additional Emails */}
      <InputField
        label="Additional Emails (comma separated)"
        value={additionalEmails.join(', ')}
        onChange={(val: string) => setAdditionalEmails(val.split(',').map((email) => email.trim()))}
      />

      {/* Same as Billing */}
      <div className="checkbox-field">
        <label>
          <input
            type="checkbox"
            checked={sameAsBilling}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSameAsBilling(e.target.checked)}
          />
          Billing Address same as Customer Address
        </label>
      </div>

      {/* Customer Address */}
      <h4>Customer Address</h4>
      <InputField label="Line 1" value={customerAddress.line1} onChange={(val: string) => setCustomerAddress({ ...customerAddress, line1: val })} />
      <InputField label="Line 2" value={customerAddress.line2} onChange={(val: string) => setCustomerAddress({ ...customerAddress, line2: val })} />
      <InputField label="City" value={customerAddress.city} onChange={(val: string) => setCustomerAddress({ ...customerAddress, city: val })} />
      <InputField label="State" value={customerAddress.state} onChange={(val: string) => setCustomerAddress({ ...customerAddress, state: val })} />
      <InputField label="Postal Code" value={customerAddress.zip} onChange={(val: string) => setCustomerAddress({ ...customerAddress, zip: val })} />
      <InputField label="Country" value={customerAddress.country} onChange={(val: string) => setCustomerAddress({ ...customerAddress, country: val })} />

      {/* Billing Address */}
      {!sameAsBilling && (
        <>
          <h4>Billing Address</h4>
          <InputField label="Line 1" value={billingAddress.line1} onChange={(val: string) => setBillingAddress({ ...billingAddress, line1: val })} />
          <InputField label="Line 2" value={billingAddress.line2} onChange={(val: string) => setBillingAddress({ ...billingAddress, line2: val })} />
          <InputField label="City" value={billingAddress.city} onChange={(val: string) => setBillingAddress({ ...billingAddress, city: val })} />
          <InputField label="State" value={billingAddress.state} onChange={(val: string) => setBillingAddress({ ...billingAddress, state: val })} />
          <InputField label="Postal Code" value={billingAddress.zip} onChange={(val: string) => setBillingAddress({ ...billingAddress, zip: val })} />
          <InputField label="Country" value={billingAddress.country} onChange={(val: string) => setBillingAddress({ ...billingAddress, country: val })} />
        </>
      )}
    </div>
  );
};

export default EditAccount;
