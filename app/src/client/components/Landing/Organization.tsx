import React, { useState, useEffect } from "react";
import { createOrganization, fetchCountries, type OrganizationPayload } from "./api";
import ThankYou from "./ThankYou";
import VisualBg from "./visual.svg";
import CountrySelector from "../Common/CountrySelector";
import "./Organization.css";

interface Country {
  code: string;
  name: string;
  dialCode: string;
}

const Organization: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedCountry, setSelectedCountry] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState('');
  const [otherRole, setOtherRole] = useState('');

  // Load countries on component mount
  useEffect(() => {
    const loadCountries = async () => {
      try {
        const data = await fetchCountries();
        setCountries(data);
        // Set default country to India if available
        const india = data.find(c => c.code === 'IN');
        if (india) {
          setSelectedCountry('IN');
          setPhoneNumber(india.dialCode);
        }
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
    // If the current phone number is empty or matches the old dial code, replace it with the new one
    if (!phoneNumber || phoneNumber.startsWith('+') || phoneNumber === '') {
      setPhoneNumber(dialCode);
    } else {
      // Otherwise, keep the user's input but update the dial code
      const userNumber = phoneNumber.replace(/^\+?[0-9]+/, '');
      setPhoneNumber(dialCode + userNumber);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(e.target.value);
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
    const formValues = Object.fromEntries(formData.entries());
    
    // Use the otherRole if 'OTHER' is selected
    if (selectedRole === 'OTHER' && otherRole.trim()) {
      formValues.role = otherRole;
    }
    
    // Manually add the selected country and phone number
    formValues.country = selectedCountry;
    formValues.phone = phoneNumber;

    const newErrors: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[0-9\s-()]{10,}$/;

    const requiredFields: [string, string][] = [
      ["firstName", "This field is required"],
      ["lastName", "This field is required"],
      ["email", "Please enter a valid email address"],
      ["company", "This field is required"],
      ["role", "This field is required"],
      ["empSize", "This field is required"],
      ["country", "This field is required"],
      ["phone", "Please enter a valid phone number"],
    ];

    requiredFields.forEach(([field, message]) => {
      const value = formValues[field]?.toString().trim();
      if (!value) {
        newErrors[field] = "This field is required";
      } else if (field === 'email' && !emailRegex.test(value)) {
        newErrors[field] = message;
      } else if (field === 'phone' && !phoneRegex.test(value)) {
        newErrors[field] = message;
      }
    });

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    const payload: OrganizationPayload = {
      firstName: formValues.firstName || null,
      lastName: formValues.lastName || null,
      company: formValues.company || null,
      businessEmail: formValues.email || null,
      role: formValues.role || null,
      employeeSize: formValues.empSize || null,
      country: formValues.country || null,
      phoneNumber: formValues.phone || null,
      howCanWeHelp: formValues.help || null,
      marketingOptIn: formValues.agree === "on",
    };

    try {
      console.log("Submitting organization payload", payload);
      const responseJson = await createOrganization(payload);
      console.log("Organization created successfully", responseJson);
      setSubmitted(true);
    } catch (err: any) {
      console.error("Organization creation failed", err);
      alert(`Failed to submit: ${err.message || err}`);
    }
  };
  if (submitted) return <ThankYou />;

  return (
    <div className="org-page">
      {/* Decorative background SVG */}
      <img src={VisualBg} alt="" className="org-bg" aria-hidden="true"/>


      <div className="org-wrap">
        {/* Left copy */}
        <section className="org-copy">
          <h1 className="org-title">
            You Focus on the Product.
            <br />
            <span>Aforo Will Handle the Billing.</span>
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
                  >
                    <option value="">Select your role...</option>
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
                    <div className="other-role-input" style={{ marginTop: '8px' }}>
                      <input
                        type="text"
                        placeholder="Please specify your role"
                        value={otherRole}
                        onChange={(e) => setOtherRole(e.target.value)}
                        className={`${!otherRole.trim() && errors.role ? 'error' : ''}`}
                      />
                      {!otherRole.trim() && errors.role && (
                        <span className="error-msg">Please specify your role</span>
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
              <label htmlFor="empSize" className="form-label">Employee size of the company</label>
              <select 
                id="empSize" 
                name="empSize" 
                defaultValue="" 
                onChange={handleFieldChange}
                className={errors.empSize ? 'error' : ''}
              >
                <option value="">Select company size</option>
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
              {errors.empSize && (<span className="error-msg">{errors.empSize}</span>)}
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
                {errors.country && (<span className="error-msg">{errors.country}</span>)}
              </div>
              <div className="org-field">
                <label htmlFor="phone" className="form-label">Phone Number</label>
                <input 
                  id="phone" 
                  name="phone" 
                  value={phoneNumber}
                  onChange={(e) => {
                    const selected = countries.find(c => c.code === selectedCountry);
                    if (selected) {
                      // If user tries to delete the dial code, keep it
                      if (!e.target.value.startsWith(selected.dialCode)) {
                        const newNumber = e.target.value.replace(/^\+?\d*/, '');
                        setPhoneNumber(selected.dialCode + newNumber);
                        return;
                      }
                    }
                    setPhoneNumber(e.target.value);
                    // Clear phone error when user types
                    if (errors.phone) {
                      setErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors.phone;
                        return newErrors;
                      });
                    }
                  }}
                  placeholder="Phone Number"
                  className={errors.phone ? 'error' : ''}
                  style={{ width: '100%' }}
                />
                {errors.phone && <span className="error-msg">{errors.phone}</span>}
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
