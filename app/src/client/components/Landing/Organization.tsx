import React, { useState, useEffect } from "react";
import { createOrganization, fetchCountries, type OrganizationPayload } from "./api";
import { useNavigate } from "react-router-dom";
import CountrySelector from "../Common/CountrySelector";
import "./Organization.css";
import SigninLogo from "./signin.svg";
import { Link } from "react-router-dom";

interface Country {
  code: string;
  name: string;
  dialCode: string;
}

const Organization: React.FC = () => {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [selectedCountry, setSelectedCountry] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState('');
  const [empSize, setEmpSize] = useState('');
  const [otherRole, setOtherRole] = useState('');

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
        phoneError = 'Indian phone numbers must be 10 digits';
      }
    } else if (countryCode === 'US' || countryCode === 'CA') {
      // US/Canada: 10 digits after country code (1)
      const digitsOnly = phoneNumberWithoutFormatting.replace(/^1/, '');
      if (digitsOnly.length !== 10) {
        phoneIsValid = false;
        phoneError = 'US/Canada phone numbers must be 10 digits';
      }
    } else {
      // Default validation for other countries (at least 8 digits)
      const digitsOnly = phoneNumberWithoutFormatting.replace(/^\+?[0-9]{1,3}/, '');
      if (digitsOnly.length < 8) {
        phoneIsValid = false;
        phoneError = 'Invalid phone number length';
      }
    }

    const requiredFields: [string, string][] = [
      ["firstName", "This field is required"],
      ["lastName", "This field is required"],
      ["email", "Invalid email address"],
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

    requiredFields.forEach(([field, message]) => {
      const value = formValues[field]?.toString().trim();
      if (!value) {
        newErrors[field] = "This field is required";
      } else if (field === 'email') {
        if (!emailRegex.test(value)) {
          newErrors[field] = 'Invalid business email';
        } else if (!value.endsWith('.com') && !value.endsWith('.net') && !value.endsWith('.org') && !value.endsWith('.io') && !value.endsWith('.co') && !value.endsWith('.ai')) {
          newErrors[field] = 'Invalid business email';
        }
      } else if (field === 'phone' && !phoneIsValid) {
        // Use the specific phone error message we set earlier
        if (!newErrors.phone) {
          newErrors[field] = message;
        }
      }
    });

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }
    
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
    }
  }

  return (
    <div className="org-page">
      {/* Decorative background  visual svg is there na remove it i dont wnat */}


      <div className="org-wrap">
        {/* Left copy */}
        <section className="org-copy">
          <Link to="/" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="41" height="37" viewBox="0 0 41 37" fill="none">
  <path d="M18.7663 0.845831C16.9507 1.36458 13.9031 5.81715 12.6062 7.9786C16.4968 10.2481 20.0632 15.7598 23.6296 19.3262C27.196 22.8926 28.4928 22.5683 30.4381 22.5683C31.9944 22.5683 34.5449 21.2715 35.6256 20.623C33.6803 17.1647 29.1413 9.27546 26.5475 5.38486C23.3054 0.521615 21.0359 0.197398 18.7663 0.845831Z" fill="url(#paint0_linear_7865_40146)"/>
  <path d="M39.8404 29.7011C39.5811 28.6636 37.4355 24.0267 36.8951 22.8379C35.3389 24.3941 33.7884 25.8639 32.7077 26.4042C24.9265 30.2948 17.4695 24.7832 12.9305 21.2168C9.29923 18.3637 7.87841 17.2181 7.1219 17.002C6.68962 17.7585 4.30629 22.309 2.23131 26.4589C-0.362425 31.6464 0.934441 33.9159 3.20396 35.2128C5.47347 36.5097 10.3367 36.8339 19.0906 36.8339H19.0906C27.8444 36.8339 33.3561 36.8339 36.9225 35.537C40.4889 34.2401 40.1646 30.998 39.8404 29.7011Z" fill="url(#paint1_linear_7865_40146)"/>
  <defs>
    <linearGradient id="paint0_linear_7865_40146" x1="38.1615" y1="36.8339" x2="15.1533" y2="44.1875" gradientUnits="userSpaceOnUse">
      <stop stop-color="#025A94"/>
      <stop offset="1" stop-color="#00365A"/>
    </linearGradient>
    <linearGradient id="paint1_linear_7865_40146" x1="38.1615" y1="36.8339" x2="15.1533" y2="44.1875" gradientUnits="userSpaceOnUse">
      <stop stop-color="#025A94"/>
      <stop offset="1" stop-color="#00365A"/>
    </linearGradient>
  </defs>
</svg>
            <img src={SigninLogo} alt="Aforo" height={24} />
          </Link>
          <h1 className="org-title">
            You Focus on the Product.
            <br />
            Aforo Will Handle the Billing.
          </h1>
          <p className="org-sub">
            Get expert help from Aforo’s sales team to set up everything —
            from subscriptions and usage-based pricing to automated payments.
          </p>
        </section>

        {/* Right form */}
        <section className="org-form-card">
          <form className="org-form" noValidate onSubmit={handleSubmit}>
            <div className="org-row">
              <div className="org-field">
                <label htmlFor="firstName" className="form-label">
                  First Name
                </label>
                <input 
                  id="firstName" 
                  name="firstName" 
                  placeholder="Sarah" 
                  onChange={handleFieldChange} 
                  className={errors.firstName ? 'error' : ''}
                />
                {errors.firstName && (<span className="error-msg">{errors.firstName}</span>)}
              </div>
              <div className="org-field">
                <label htmlFor="lastName" className="form-label">
                  Last Name
                </label>
                <input 
                  id="lastName" 
                  name="lastName" 
                  placeholder="Johnson" 
                  onChange={handleFieldChange} 
                  className={errors.lastName ? 'error' : ''}
                />
                {errors.lastName && (<span className="error-msg">{errors.lastName}</span>)}
              </div>
            </div>

            <div className="org-field">
              <label htmlFor="email" className="form-label">
                Business Email
              </label>
              <input 
                id="email" 
                type="email" 
                name="email" 
                placeholder="john@example.com" 
                onChange={(e) => {
                  handleFieldChange(e);
                  // Clear email error when user types
                  if (errors.email) {
                    setErrors(prev => {
                      const newErrors = { ...prev };
                      delete newErrors.email;
                      return newErrors;
                    });
                  }
                }}
                className={errors.email ? 'error' : ''}
              />
              {errors.email && (<span className="error-msg">{errors.email}</span>)}
            </div>

            <div className="org-row">
              <div className="org-field">
                <label htmlFor="company" className="form-label">Company</label>
                <input 
                  id="company" 
                  name="company" 
                  placeholder="BrightPath Ltd" 
                  onChange={handleFieldChange} 
                  className={errors.company ? 'error' : ''}
                />
                {errors.company && (<span className="error-msg">{errors.company}</span>)}
              </div>

              <div className="org-field">
                <label htmlFor="role" className="form-label">Your Role</label>
                <div className="role-selector">
                <select
  id="role"
  name="role"
  value={selectedRole}
  onChange={handleFieldChange}
  className={errors.role ? 'error' : ''}
  required
>
  <option value="" disabled hidden>
    Select your role...
  </option>
  <option value="OWNER">Owner</option>
  <option value="ADMIN">Admin</option>
  <option value="CEO">CEO</option>
  <option value="CTO">CTO</option>
  <option value="CFO">CFO</option>
  <option value="MANAGER">Manager</option>
  <option value="ENGINEER">Engineer</option>
  <option value="MARKETING">Marketing</option>
  <option value="SALES">Sales</option>
  <option value="SUPPORT">Support</option>
  <option value="OTHER">Other</option>
</select>

                  {selectedRole === 'OTHER' && (
                    <div className="org-field other-role-input" style={{ marginTop: '8px', width: '100%' }}>
                      <label htmlFor="otherRole" className="form-label">
                        Specify your role
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
                        <span className="error-msg">Specify your role</span>
                      )}
                    </div>
                  )}
                  {errors.role && selectedRole !== 'OTHER' && (
                    <span className="error-msg">{errors.role}</span>
                  )}
                </div>
              </div>
            </div>
            <div className="org-field">
  <label htmlFor="empSize" className="form-label">
    Employee size of the company
  </label>
  <select 
    id="empSize" 
    name="empSize" 
    value={empSize}   // controlled input
    onChange={handleFieldChange}
    className={errors.empSize ? 'error' : ''}
    required
  >
    <option value="" disabled hidden>
      Select company size
    </option>
    <option value="_1_10">1-10</option>
    <option value="_11_50">11-50</option>
    <option value="_51_100">51-100</option>
    <option value="_101_500">101-500</option>
    <option value="_501_1000">501-1000</option>
    <option value="_1001_5000">1001-5000</option>
    <option value="_5001_10000">5001-10000</option>
    <option value="_10001_50000">10001-50000</option>
    <option value="_50001_100000">50001-100000</option>
    <option value="_100001_PLUS">100001+</option>
  </select>
  {errors.empSize && (
    <span className="error-msg">{errors.empSize}</span>
  )}
</div>


            <div className="org-row">
              <div className="org-field">
                <label htmlFor="country" className="form-label">Country</label>
                {isLoading ? (
                  <div>Loading countries...</div>
                ) : (
                  <CountrySelector
                    value={selectedCountry}
                    onChange={handleCountrySelect}
                    countries={countries}
                    error={errors.country}
                    onDialCodeChange={handleDialCodeChange}
                  />
                )}
              </div>
              <div className="org-fields">
                <label htmlFor="phone" className="form-label">Phone Number</label>
                <div className="phone-input-container">
                  <div className={`phone-input-wrapper ${errors.phone ? 'error' : ''}`}>
                    <div className="country-code-display">
                      {selectedCountry ? (
                        <>
                          <span className={`fi fi-${selectedCountry.toLowerCase()}`} style={{marginRight: '8px'}}></span>
                          <span>{countries.find(c => c.code === selectedCountry)?.dialCode}</span>
                        </>
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
                        
                        // Format the phone number
                        const userNumber = input.replace(/\D/g, ''); // Remove all non-digits
                        const formattedNumber = userNumber.replace(/(\d{3})(?=\d)/g, '$1 '); // Add space after every 3 digits
                        
                        // Only add the dial code if it's not already there
                        const newPhoneNumber = phoneNumber.startsWith(dialCode) 
                          ? dialCode + (formattedNumber ? ' ' + formattedNumber : '')
                          : formattedNumber;
                        
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
              <label htmlFor="help" className="form-label">How can we help you?</label>
              <textarea
                id="help"
                name="help"
                rows={4}
                placeholder="Tell us about your needs and how we can assist you"
                onChange={handleFieldChange}
                className={errors.help ? 'error' : ''}
                style={{ width: '100%', padding: '12px', borderRadius: '4px', border: '1px solid #ccc' }}
              />
              {errors.help && <span className="error-msg">{errors.help}</span>}
            </div>

            <p className="org-disclaimer">By submitting this form, you agree to our <a href="#" aria-label="Terms & Conditions">Terms & Conditions</a> and <a href="#" aria-label="Privacy Policy">Privacy Policy</a>.</p>

            <div className="org-terms">
              <input id="agree" name="agree" type="checkbox" />
              <label htmlFor="agree">Yes, I'd like to receive mails on occasional updates, feature launches, and tips to help me grow with Aforo. You can unsubscribe anytime.
              </label>
            </div>

            <button className="org-btn" type="submit">Contact Sales</button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default Organization; 


