import React, { useState, useEffect } from "react";
import { createOrganization, fetchCountries, type OrganizationPayload } from "./api";
import { useNavigate } from "react-router-dom";
import CountrySelector from "../Common/CountrySelector";
import { DropdownField, InputField } from "../componenetsss/Inputs";
import { Checkbox } from "../componenetsss/Checkbox";
import PrimaryButton from "../componenetsss/PrimaryButton";
import "./Organization.css";
import SigninLogo from "./signin.svg";
import logoNew from "../LandingComponents/logo-new.svg";
import salesLogo from "../LandingComponents/sales-logo.svg";
import contactSales from "../LandingComponents/contact-sales.svg";
import polygon5 from "../LandingComponents/Polygon 5.svg";
import { Link } from "react-router-dom";
import 'flag-icons/css/flag-icons.min.css';

interface Country {
  code: string;
  name: string;
  dialCode: string;
}

const Organization: React.FC = () => {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [selectedCountry, setSelectedCountry] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState('');
  const [empSize, setEmpSize] = useState('');
  const [otherRole, setOtherRole] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    help: ''
  });
  const [agreed, setAgreed] = useState(false);

  // Email validation regex
  const emailRegex = /^[^\s@]+@(?!gmail\.com|yahoo\.com|hotmail\.com|outlook\.com|aol\.com|icloud\.com|mail\.com|protonmail\.com|zoho\.com|yandex\.com|gmx\.com|tutanota\.com|tutanota\.de|tutanota\.io|tuta\.io|tutanota\.com|tuta\.io|mail\.ru|inbox\.ru|list\.ru|bk\.ru|ya\.ru)[^\s@]+\.[^\s@]+$/;

  // Check if form is valid
  const isFormValid = React.useMemo(() => {
    const isPhoneValid = () => {
      if (!selectedCountry) return false;
      const digits = phoneNumber.replace(/\D/g, '');
      // Basic length check based on country
      if (selectedCountry === 'IN' || selectedCountry === 'US' || selectedCountry === 'CA') {
        // Country code (1-3 digits) + 10 digits
        const countryCodeLength = countries.find(c => c.code === selectedCountry)?.dialCode.replace(/\D/g, '').length || 0;
        return digits.length === countryCodeLength + 10;
      }
      return digits.length >= 8; // Generic check
    };

    return (
      formData.firstName.trim() !== '' &&
      formData.lastName.trim() !== '' &&
      formData.company.trim() !== '' &&
      emailRegex.test(formData.email) &&
      selectedRole !== '' &&
      (selectedRole !== 'OTHER' || otherRole.trim() !== '') &&
      empSize !== '' &&
      selectedCountry !== '' &&
      isPhoneValid()
    );
  }, [formData, selectedRole, otherRole, empSize, selectedCountry, phoneNumber, countries]);

  // Load countries on component mount
  useEffect(() => {
    const loadCountries = async () => {
      try {
        const data = await fetchCountries();
        setCountries(data);
        // No default country selected, will show placeholder
      } catch (error) {
        console.error('Failed to load countries:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadCountries();
  }, []);

  const handleCountrySelect = (countryCode: string) => {
    setSelectedCountry(countryCode);

    // Clear any previous country error
    if (errors.country) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.country;
        return newErrors;
      });
    }
  };

  const handleDialCodeChange = (dialCode: string) => {
    const dialCodeWithSpace = `${dialCode} `;

    // If the current phone number is empty or matches the old dial code, replace it with the new one
    if (!phoneNumber || phoneNumber.startsWith('+') || phoneNumber === '') {
      setPhoneNumber(dialCodeWithSpace);
    } else {
      // Otherwise, keep the user's input but update the dial code
      const userNumber = phoneNumber.replace(/^\+?[0-9]+\s*/, '');
      setPhoneNumber(dialCodeWithSpace + userNumber);
    }

    // Clear any phone validation errors when dial code changes
    if (errors.phone) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.phone;
        return newErrors;
      });
    }
  };

  // No helper function needed - we'll use flag-icons classes directly in JSX

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const selected = countries.find(c => c.code === selectedCountry);

    if (!selected) {
      setPhoneNumber(input);
      return;
    }

    const dialCode = selected.dialCode;
    const dialCodeWithSpace = `${dialCode} `;

    // If input is empty, just set the dial code with space
    if (input === '') {
      setPhoneNumber(dialCodeWithSpace);
      return;
    }

    // If input already starts with the dial code
    if (input.startsWith(dialCode)) {
      // If there's no space after dial code, add it
      if (input.length > dialCode.length && input[dialCode.length] !== ' ') {
        const numberPart = input.substring(dialCode.length).replace(/\D/g, '');
        setPhoneNumber(`${dialCode} ${numberPart}`);
      } else {
        setPhoneNumber(input);
      }
    } else {
      // Otherwise, prepend the dial code and clean the input
      const numberPart = input.replace(/\D/g, '');
      setPhoneNumber(`${dialCode} ${numberPart}`);
    }
  };

  const handleFieldChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name === 'role') {
      setSelectedRole(value);
      // Clear other role field when switching away from 'OTHER'
      if (value !== 'OTHER') {
        setOtherRole('');
      }
    } else if (name === 'empSize') {
      setEmpSize(value);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    if (errors[name] && value.trim()) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const formValues: Record<string, any> = Object.fromEntries(formData.entries());

    // Set the role and customRole based on selection
    if (selectedRole === 'OTHER') {
      // When 'Other' is selected, set role to 'OTHERS' and include the custom role text
      formValues.role = 'OTHERS';
      formValues.customRole = otherRole.trim();
    } else {
      // For all other roles, just set the role
      formValues.role = selectedRole;
      formValues.customRole = null; // Clear customRole for non-other roles
    }

    // Manually add the selected country and phone number
    formValues.country = selectedCountry;
    formValues.phone = phoneNumber;

    const newErrors: Record<string, string> = {};
    // Business email validation - doesn't allow common free email domains
    const emailRegex = /^[^\s@]+@(?!gmail\.com|yahoo\.com|hotmail\.com|outlook\.com|aol\.com|icloud\.com|mail\.com|protonmail\.com|zoho\.com|yandex\.com|gmx\.com|tutanota\.com|tutanota\.de|tutanota\.io|tuta\.io|tutanota\.com|tuta\.io|mail\.ru|inbox\.ru|list\.ru|bk\.ru|ya\.ru)[^\s@]+\.[^\s@]+$/;

    // Phone number validation based on country
    const phoneNumberWithoutFormatting = phoneNumber.replace(/\D/g, '');
    const countryCode = selectedCountry;
    let phoneIsValid = true;
    let phoneError = '';

    if (countryCode === 'IN') {
      // India: 10 digits after country code (91)
      const digitsOnly = phoneNumberWithoutFormatting.replace(/^91/, '');
      if (digitsOnly.length !== 10) {
        phoneIsValid = false;
        phoneError = 'Indian phone number';
      }
    } else if (countryCode === 'US' || countryCode === 'CA') {
      // US/Canada: 10 digits after country code (1)
      const digitsOnly = phoneNumberWithoutFormatting.replace(/^1/, '');
      if (digitsOnly.length !== 10) {
        phoneIsValid = false;
        phoneError = 'US/Canada phone number';
      }
    } else {
      // Default validation for other countries (at least 8 digits)
      const digitsOnly = phoneNumberWithoutFormatting.replace(/^\+?[0-9]{1,3}/, '');
      if (digitsOnly.length < 8) {
        phoneIsValid = false;
        phoneError = 'Invalid phone number';
      }
    }

    const requiredFields: [string, string][] = [
      ["firstName", "This field is required"],
      ["lastName", "This field is required"],
      ["email", "Enter your work Email"],
      ["company", "This field is required"],
      ["role", "This field is required"],
      ["empSize", "This field is required"],
      ["country", "This field is required"],
      ["phone", "Invalid phone number"],
    ];

    // Add phone validation if phone field exists
    if (!phoneIsValid && phoneError) {
      newErrors.phone = phoneError;
    }

    // Validate "Other" role field
    if (selectedRole === 'OTHER' && !otherRole.trim()) {
      newErrors.role = "This field is required";
    }

    requiredFields.forEach(([field, message]) => {
      let value;
      if (field === 'empSize') {
        value = empSize?.toString().trim();
      } else {
        value = formValues[field]?.toString().trim();
      }
      
      if (!value) {
        newErrors[field] = "This field is required";
      } else if (field === 'email') {
        if (!emailRegex.test(value)) {
          newErrors[field] = 'Invalid email id';
        } else if (!value.endsWith('.com') && !value.endsWith('.net') && !value.endsWith('.org') && !value.endsWith('.io') && !value.endsWith('.co') && !value.endsWith('.ai')) {
          newErrors[field] = 'Invalid email id';
        }
      } else if (field === 'phone' && !phoneIsValid) {
        // Use the specific phone error message we set earlier
        if (!newErrors.phone) {
          newErrors[field] = message;
        }
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare the payload for the API
      const roleValue = selectedRole === 'OTHER' ? 'OTHERS' : selectedRole;
      const customRoleValue = selectedRole === 'OTHER' && otherRole.trim() ? otherRole.trim() : null;

      console.log('Form values:', formValues);
      console.log('Selected role:', selectedRole);
      console.log('Other role:', otherRole);
      console.log('Sending role:', roleValue);
      console.log('Sending customRole:', customRoleValue);

      // Create base payload without customRole
      const payload: any = {
        firstName: formValues.firstName?.toString() || null,
        lastName: formValues.lastName?.toString() || null,
        company: formValues.company?.toString() || null,
        businessEmail: formValues.email?.toString() || null,
        role: roleValue,
        employeeSize: formValues.empSize?.toString() || null,
        country: formValues.country?.toString() || null,
        phoneNumber: formValues.phone?.toString() || null,
        howCanWeHelp: formValues.help?.toString() || null,
        marketingOptIn: formValues.agree === 'on',
      };

      // Only add customRole if 'Other' is selected and has a value
      if (selectedRole === 'OTHER' && customRoleValue) {
        payload.customRole = customRoleValue;
      }

      console.log('Submitting organization payload:', payload);
      const response = await createOrganization(payload);
      console.log('Organization created successfully:', response);

      // Reset form and show success
      setSubmitted(true);
      setErrors({});
      navigate('/thank-you');
    } catch (err: any) {
      console.error('Error creating organization:', err);

      // Handle backend validation errors
      if (err.response?.data?.phoneNumber) {
        setErrors(prev => ({
          ...prev,
          phone: 'Invalid phone number' // Show simple error message
        }));
      } else {
        // For other errors, show a generic error
        alert(`Failed to submit: ${err.message || 'An error occurred. Please try again.'}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="org-page">
      {/* Background decorations */}
      <div className="org-background-decoration">
        <svg xmlns="http://www.w3.org/2000/svg" width="386" height="458" viewBox="0 0 386 458" fill="none">
          <g filter="url(#filter0_f_12072_37366)">
            <path d="M27 209.534L257 128.8L216.5 329.034L27 209.534Z" fill="url(#paint0_linear_12072_37366)" />
          </g>
          <defs>
            <filter id="filter0_f_12072_37366" x="-101.8" y="-0.000198364" width="487.6" height="457.834" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
              <feGaussianBlur stdDeviation="30.4" result="effect1_foregroundBlur_12072_37366" />
            </filter>
            <linearGradient id="paint0_linear_12072_37366" x1="142" y1="128.8" x2="142" y2="329.034" gradientUnits="userSpaceOnUse">
              <stop stopColor="#EDF8FD" />
              <stop offset="1" stopColor="#ade1feff" />
            </linearGradient>
          </defs>
        </svg>
      </div>


      <div className="org-polygon-decoration">
        <img src={polygon5} alt="Polygon decoration" className="polygon-5" />
      </div>

      <div className="org-wrap">
        {/* Left copy */}
        <section className="org-copy">
          <img src={salesLogo} alt="Sales illustration" className="sales-logo" />

          <h1 className="org-title">
            You Focus on the{"\u00A0"}Product.
            <br />
            Aforo Will Handle the Billing.
          </h1>
          <p className="org-sub">
            Onboarding with Aforo begins with a conversation.
            Contact us to explore how we can help your company get started.
          </p>
          <img src={contactSales} alt="Contact sales illustration" className="contact-sales" />
        </section>

        {/* Right form */}
        <section className="org-form-card">
          <form className="org-form" noValidate onSubmit={handleSubmit}>
            <div className="org-row">
              <div className="org-field">
                <InputField
                  id="firstName"
                  name="firstName"
                  label="First Name"
                  placeholder="Sarah"
                  value={formData.firstName}
                  onChange={(value) => handleFieldChange({ target: { name: 'firstName', value } } as any)}
                  onBlur={() => {
                    if (!formData.firstName.trim()) {
                      setErrors(prev => ({ ...prev, firstName: 'This field is required' }));
                    }
                  }}
                  error={errors.firstName}
                  required
                />
              </div>
              <div className="org-field">
                <InputField
                  id="lastName"
                  name="lastName"
                  label="Last Name"
                  placeholder="Johnson"
                  value={formData.lastName}
                  onChange={(value) => handleFieldChange({ target: { name: 'lastName', value } } as any)}
                  onBlur={() => {
                    if (!formData.lastName.trim()) {
                      setErrors(prev => ({ ...prev, lastName: 'This field is required' }));
                    }
                  }}
                  error={errors.lastName}
                  required
                />
              </div>
            </div>

            <div className="org-field">
              <InputField
                id="email"
                type="email"
                name="email"
                label="Business Email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(value) => {
                  handleFieldChange({ target: { name: 'email', value } } as any);
                  // Clear email error when user types
                  if (errors.email) {
                    setErrors(prev => {
                      const newErrors = { ...prev };
                      delete newErrors.email;
                      return newErrors;
                    });
                  }
                }}
                onBlur={() => {
                  const val = formData.email.trim();
                  if (!val) {
                    setErrors(prev => ({ ...prev, email: 'This field is required' }));
                  } else if (!emailRegex.test(val)) {
                    setErrors(prev => ({ ...prev, email: 'Invalid email id' }));
                  }
                }}
                error={errors.email}
                required
              />
            </div>

            <div className="org-row">
              <div className="org-field">
                <InputField
                  id="company"
                  name="company"
                  label="Company"
                  placeholder="BrightPath Ltd"
                  value={formData.company}
                  onChange={(value) => handleFieldChange({ target: { name: 'company', value } } as any)}
                  onBlur={() => {
                    if (!formData.company.trim()) {
                      setErrors(prev => ({ ...prev, company: 'This field is required' }));
                    }
                  }}
                  error={errors.company}
                  required
                />
              </div>

              <div className="org-field">
                <DropdownField
                  id="role"
                  name="role"
                  label="Your Role"
                  placeholder="Select your role..."
                  value={selectedRole}
                  onChange={(value) => handleFieldChange({ target: { name: 'role', value } } as any)}
                  options={[
                    { value: 'OWNER', label: 'Owner' },
                    { value: 'ADMIN', label: 'Admin' },
                    { value: 'CEO', label: 'CEO' },
                    { value: 'CTO', label: 'CTO' },
                    { value: 'CFO', label: 'CFO' },
                    { value: 'MANAGER', label: 'Manager' },
                    { value: 'ENGINEER', label: 'Engineer' },
                    { value: 'MARKETING', label: 'Marketing' },
                    { value: 'SALES', label: 'Sales' },
                    { value: 'SUPPORT', label: 'Support' },
                    { value: 'OTHER', label: 'Other' }
                  ]}
                  error={errors.role && selectedRole !== 'OTHER' ? errors.role : undefined}
                  required
                />
              </div>
            </div>

            {selectedRole === 'OTHER' && (
              <div className="org-field other-role-input" style={{ marginTop: '8px', width: '100%' }}>
                <label htmlFor="otherRole" className="form-label">
                  Specify your role *
                </label>
                <input
                  type="text"
                  id="otherRole"
                  placeholder="Specify your role"
                  value={otherRole}
                  onChange={(e) => setOtherRole(e.target.value)}
                  className={`field-input ${!otherRole.trim() && errors.role ? 'error' : ''}`}
                  style={{ width: '100%' }}
                />
                {!otherRole.trim() && errors.role && (
                  <span className="error-msg">This Field is Required</span>
                )}
              </div>
            )}
            <div className="org-field">
              <DropdownField
                id="empSize"
                name="empSize"
                placeholder="Select Company Size..."
                label="Employee size of the company"
                value={empSize}
                onChange={(value) => handleFieldChange({ target: { name: 'empSize', value } } as any)}
                options={[
                  { value: '_1_10', label: '1-10' },
                  { value: '_11_50', label: '11-50' },
                  { value: '_51_100', label: '51-100' },
                  { value: '_101_500', label: '101-500' },
                  { value: '_501_1000', label: '501-1000' },
                  { value: '_1001_5000', label: '1001-5000' },
                  { value: '_5001_10000', label: '5001-10000' },
                  { value: '_10001_50000', label: '10001-50000' },
                  { value: '_50001_100000', label: '50001-100000' },
                  { value: '_100001_PLUS', label: '100001+' }
                ]}
                error={errors.empSize}
                required
              />
            </div>


            <div className="org-row">
              <div className="org-field">
                {isLoading ? (
                  <div>Loading countries...</div>
                ) : (
                  <DropdownField
                    id="country"
                    name="country"
                    label="Country"
                    value={selectedCountry}
                    onChange={(value) => {
                      handleCountrySelect(value);
                      const country = countries.find(c => c.code === value);
                      if (country) {
                        handleDialCodeChange(country.dialCode);
                      }
                    }}
                    options={countries.map(country => ({
                      value: country.code,
                      label: country.name,
                      icon: <span className={`fi fi-${country.code.toLowerCase()}`} style={{ fontSize: '20px' }}></span>
                    }))}
                    error={errors.country}
                    required
                    placeholder="Select a country"
                  />
                )}
              </div>
              <div className="org-fields">
                <label htmlFor="phone" className="form-label">Phone Number *</label>
                <div className="phone-input-container">
                  <div className={`phone-input-wrapper ${errors.phone ? 'error' : ''}`}>
                    <div className="country-code-display">
                      {selectedCountry ? (
                        <span>{countries.find(c => c.code === selectedCountry)?.dialCode}</span>
                      ) : (
                        <span className="dialcode-placeholder">+00</span>
                      )}
                    </div>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      className={`phone-input ${errors.phone ? 'error' : ''}`}
                      value={(() => {
                        // Only show the user's input without the country code
                        if (!selectedCountry) return '';
                        const dialCode = countries.find(c => c.code === selectedCountry)?.dialCode || '';
                        return phoneNumber.startsWith(dialCode)
                          ? phoneNumber.substring(dialCode.length).trim()
                          : phoneNumber;
                      })()}
                      onChange={(e) => {
                        const selected = countries.find(c => c.code === selectedCountry);
                        if (!selected) return;

                        const input = e.target.value;
                        const dialCode = selected.dialCode;

                        // If input is empty, just set the dial code with space
                        if (input === '') {
                          setPhoneNumber(dialCode + ' ');
                          return;
                        }

                        // Remove all non-digits from user input
                        const userNumber = input.replace(/\D/g, '');

                        // Only add the dial code if it's not already there
                        const newPhoneNumber = phoneNumber.startsWith(dialCode)
                          ? dialCode + (userNumber ? ' ' + userNumber : '')
                          : userNumber;

                        setPhoneNumber(newPhoneNumber);

                        // Clear phone error when user types
                        if (errors.phone) {
                          setErrors(prev => ({
                            ...prev,
                            phone: undefined
                          }));
                        }
                      }}
                      onKeyDown={(e) => {
                        /*
                          Protect the dial code displayed to the left of the input (rendered in a separate
                          element) by preventing Backspace when the caret is at the very start (index 0).
                          The input value itself does NOT include the dial code, so we should not compare
                          against dialCode length here—doing so was blocking deletion of the first few
                          user-typed digits.  
                        */
                        const selectionStart = (e.target as HTMLInputElement).selectionStart ?? 0;
                        if (e.key === 'Backspace' && selectionStart === 0) {
                          e.preventDefault();
                        }
                      }}

                      placeholder="123-456-7890"
                    />
                  </div>
                  {errors.phone && <span className="error-msg">{errors.phone}</span>}
                </div>
              </div>
            </div>

            <div className="org-field">
              <label htmlFor="help" className="form-label">How can we help you? </label>
              <textarea
                id="help"
                name="help"
                rows={4}
                placeholder="Type your message..."
                value={formData.help}
                onChange={handleFieldChange}
                className={errors.help ? 'error' : ''}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #D1D7E0' }}
              />
              {errors.help && <span className="error-msg">{errors.help}</span>}
            </div>

            <p className="org-disclaimer">By submitting this form, you agree to our <a href="#" aria-label="Terms & Conditions">Terms & Conditions</a> and <a href="#" aria-label="Privacy Policy">Privacy Policy</a>.</p>

            <div className="org-terms">
              <Checkbox
                name="agree"
                checked={agreed}
                onChange={setAgreed}
                label={
                  <span>
                    Yes, I'd like to receive mails on occasional updates, feature launches, and tips to help me grow with Aforo. You can unsubscribe anytime.
                  </span>
                }
                className="org-checkbox"
              />
            </div>

            <PrimaryButton
              type="submit"
              fullWidth={true}
              className="prim-org-btn"
            >
              {isSubmitting ? 'Submitting…' : 'Contact Sales'}
            </PrimaryButton>
          </form>
        </section>
      </div>
    </div>
  );
};

export default Organization;


