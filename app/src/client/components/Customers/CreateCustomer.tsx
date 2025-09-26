import React, { useState, useEffect, useCallback, useRef } from 'react';
import CustomerReview from './CustomerReview';
import {
  createCustomer,
  updateCustomer,
  confirmCustomer,
  checkEmailExists,
  deleteCustomer,
} from './api';
import type { Customer } from './Customers';
import { AccountDetailsData } from './AccountDetailsForm';
import AccountDetailsForm from './AccountDetailsForm';
import './CustomerForm.css';
import LogoUploader from './LogoUploader';
import buttonStyles from '../NewProductForm/GeneralDetails.module.css';
import TopBar from '../TopBar/TopBar';
import SaveDraft from '../componenetsss/SaveDraft';
import { InputField } from '../componenetsss/Inputs';

interface CreateCustomerProps {
  onClose: () => void;
  /** When resuming a draft from the list, prefill with this data */
  draftCustomer?: Partial<Customer>;
  /** Optional pre-resolved image URL to preview the existing logo */
  initialLogoUrl?: string | null;
}

const steps = [
  { title: 'Customer Details', desc: 'Enter core information for the customer.' },
  { title: 'Billing & Plan', desc: 'Configure billing frequency and plan.' },
  { title: 'Review & Confirm', desc: 'Double-check everything before saving.' },
];

const CreateCustomer: React.FC<CreateCustomerProps> = ({ onClose, draftCustomer, initialLogoUrl = null }) => {
  const [customerName, setCustomerName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyType, setCompanyType] = useState('');
  const [companyLogo, setCompanyLogo] = useState<File | null>(null);
  const [accountDetails, setAccountDetails] = useState<AccountDetailsData | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [accountErrors, setAccountErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSaveDraftModal, setShowSaveDraftModal] = useState(false);

  const [customerId, setCustomerId] = useState<number | null>(null);
  const [isDraft, setIsDraft] = useState(false);

  const initialPrimaryEmailRef = useRef<string | null>(null);
  const emailCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    document.body.classList.add('create-customer-page');
    return () => { document.body.classList.remove('create-customer-page'); };
  }, []);

  // Prefill when resuming a draft
  useEffect(() => {
    if (!draftCustomer) return;

    setCompanyName(draftCustomer.companyName ?? '');
    setCustomerName(draftCustomer.customerName ?? '');
    setCompanyType(draftCustomer.companyType ?? '');

    const acc: AccountDetailsData = {
      phoneNumber: draftCustomer.phoneNumber ?? '',
      primaryEmail: draftCustomer.primaryEmail ?? '',
      additionalEmailRecipients: draftCustomer.additionalEmailRecipients ?? [],
      billingSameAsCustomer: draftCustomer.billingSameAsCustomer ?? false,
      customerAddressLine1: draftCustomer.customerAddressLine1 ?? '',
      customerAddressLine2: draftCustomer.customerAddressLine2 ?? '',
      customerCity: draftCustomer.customerCity ?? '',
      customerState: draftCustomer.customerState ?? '',
      customerPostalCode: draftCustomer.customerPostalCode ?? '',
      customerCountry: draftCustomer.customerCountry ?? '',
      billingAddressLine1: draftCustomer.billingAddressLine1 ?? '',
      billingAddressLine2: draftCustomer.billingAddressLine2 ?? '',
      billingCity: draftCustomer.billingCity ?? '',
      billingState: draftCustomer.billingState ?? '',
      billingPostalCode: draftCustomer.billingPostalCode ?? '',
      billingCountry: draftCustomer.billingCountry ?? '',
    };
    setAccountDetails(acc);

    const id = draftCustomer.customerId ?? draftCustomer.id ?? null;
    if (id != null) setCustomerId(id);
    setIsDraft(true);

    // capture initial draft email for change detection
    initialPrimaryEmailRef.current = draftCustomer.primaryEmail ?? '';
  }, [draftCustomer]);

  useEffect(() => {
    const next = { ...errors };
    if (companyName.trim()) delete next.companyName;
    if (customerName.trim()) delete next.customerName;
    if (companyType.trim()) delete next.companyType;
    setErrors(next);
  }, [companyName, customerName, companyType]); // eslint-disable-line

  /**
   * Debounced uniqueness check used while typing.
   * - Skips when in Draft and email hasn't changed from the initial draft value.
   * - Excludes the current draft's own id from the search to avoid self-collision.
   */
  const checkEmailUniqueness = useCallback(async (email: string) => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;

    const normalized = email.trim().toLowerCase();
    const initial = (initialPrimaryEmailRef.current ?? '').toLowerCase();

    if (isDraft && normalized === initial) {
      // same email as draft's original → never flag
      setAccountErrors(prev => {
        const n = { ...prev };
        if (n.primaryEmail) delete n.primaryEmail;
        return n;
      });
      return;
    }

    try {
      const exists = await checkEmailExists(email, isDraft ? customerId ?? undefined : undefined);
      if (exists) {
        setAccountErrors(prev => ({ ...prev, primaryEmail: 'This email address is already registered' }));
      } else {
        setAccountErrors(prev => {
          const n = { ...prev };
          if (n.primaryEmail === 'This email address is already registered') delete n.primaryEmail;
          return n;
        });
      }
    } catch {
      // ignore network errors here
    }
  }, [isDraft, customerId]);

  /**
   * Legacy onBlur hook from child → mirror the same rules as the debounced checker.
   */
  const handleEmailBlur = useCallback(async (email: string) => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;

    const normalized = email.trim().toLowerCase();
    const initial = (initialPrimaryEmailRef.current ?? '').toLowerCase();

    if (isDraft && normalized === initial) {
      setAccountErrors(prev => {
        const n = { ...prev };
        if (n.primaryEmail) delete n.primaryEmail;
        return n;
      });
      return;
    }

    try {
      const exists = await checkEmailExists(email, isDraft ? customerId ?? undefined : undefined);
      if (exists) setAccountErrors(prev => ({ ...prev, primaryEmail: 'This email address is already registered' }));
      else setAccountErrors(prev => {
        const n = { ...prev };
        if (n.primaryEmail === 'This email address is already registered') delete n.primaryEmail;
        return n;
      });
    } catch {
      // ignore
    }
  }, [isDraft, customerId]);

  // Debounce uniqueness on change — but only when it's not the initial draft email
  useEffect(() => {
    if (emailCheckTimeoutRef.current) clearTimeout(emailCheckTimeoutRef.current);

    const email = accountDetails?.primaryEmail?.trim() ?? '';
    const normalized = email.toLowerCase();
    const initial = (initialPrimaryEmailRef.current ?? '').toLowerCase();

    // New create → always check when valid
    // Draft → only check if user changed the email from initial
    const shouldCheck = !!email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && (!isDraft || normalized !== initial);

    if (shouldCheck) {
      emailCheckTimeoutRef.current = setTimeout(() => checkEmailUniqueness(email), 500);
    }

    return () => { if (emailCheckTimeoutRef.current) clearTimeout(emailCheckTimeoutRef.current); };
  }, [accountDetails?.primaryEmail, isDraft, checkEmailUniqueness]);

  useEffect(() => {
    if (!accountDetails) return;
    const n = { ...accountErrors };
    const clear = (k: keyof AccountDetailsData, keyInErr: string) => {
      // @ts-ignore
      if (accountDetails[k]?.trim && accountDetails[k].trim() && n[keyInErr]) delete n[keyInErr];
    };
    clear('phoneNumber', 'phoneNumber');
    clear('primaryEmail', 'primaryEmail');
    clear('billingAddressLine1', 'billingAddressLine1');
    clear('billingAddressLine2', 'billingAddressLine2');
    clear('billingCity', 'billingCity');
    clear('billingState', 'billingState');
    clear('billingPostalCode', 'billingPostalCode');
    clear('billingCountry', 'billingCountry');
    clear('customerAddressLine1', 'customerAddressLine1');
    clear('customerAddressLine2', 'customerAddressLine2');
    clear('customerCity', 'customerCity');
    clear('customerState', 'customerState');
    clear('customerPostalCode', 'customerPostalCode');
    clear('customerCountry', 'customerCountry');
    setAccountErrors(n);
  }, [accountDetails]); // eslint-disable-line

  const handleHeaderBack = () => setShowSaveDraftModal(true);
  const handleBack = () => (currentStep === 0 ? onClose() : setCurrentStep(s => s - 1));

  const validateStep = async (s: number): Promise<boolean> => {
    if (s === 0) {
      const n: Record<string, string> = {};
      if (!companyName.trim()) n.companyName = 'Company Name is required';
      if (!customerName.trim()) n.customerName = 'Customer Name is required';
      if (!companyType.trim()) n.companyType = 'Company Type is required';
      setErrors(n);
      return Object.keys(n).length === 0;
    }
    if (s === 1) {
      const n: Record<string, string> = {};
      const email = (accountDetails?.primaryEmail ?? '').trim();
      if (!accountDetails?.phoneNumber?.trim()) n.phoneNumber = 'Phone Number is required';
      if (!email) n.primaryEmail = 'Primary Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) n.primaryEmail = 'Enter a valid email address';
      else {
        try {
          const normalized = email.toLowerCase();
          const initial = (initialPrimaryEmailRef.current ?? '').toLowerCase();

          // For NEW create → always check uniqueness.
          // For DRAFT → only when email changed, excluding self by id.
          if (!isDraft || normalized !== initial) {
            const exists = await checkEmailExists(email, isDraft ? customerId ?? undefined : undefined);
            if (exists) n.primaryEmail = 'This email address is already registered';
          }
        } catch { /* ignore */ }
      }

      [
        'billingAddressLine1','billingAddressLine2','billingCity','billingState','billingPostalCode','billingCountry',
        'customerAddressLine1','customerAddressLine2','customerCity','customerState','customerPostalCode','customerCountry'
      ].forEach(k => {
        // @ts-ignore
        if (!accountDetails?.[k]?.trim()) n[k] = `${k.replace(/([A-Z])/g,' $1')} is required`;
      });
      setAccountErrors({ ...accountErrors, ...n });
      return Object.keys({ ...accountErrors, ...n }).length === 0;
    }
    return true;
  };

  const handleNext = async () => {
    if (!(await validateStep(currentStep))) return;
    const last = currentStep === steps.length - 1;
    if (last) await handleCreateCustomer();
    else setCurrentStep(s => s + 1);
  };

  const handleCreateCustomer = async () => {
    if (!accountDetails) return;
    const payload = {
      companyName, customerName, companyType,
      phoneNumber: accountDetails.phoneNumber,
      primaryEmail: accountDetails.primaryEmail,
      additionalEmailRecipients: accountDetails.additionalEmailRecipients,
      customerAddressLine1: accountDetails.customerAddressLine1,
      customerAddressLine2: accountDetails.customerAddressLine2,
      customerCity: accountDetails.customerCity,
      customerState: accountDetails.customerState,
      customerPostalCode: accountDetails.customerPostalCode,
      customerCountry: accountDetails.customerCountry,
      billingSameAsCustomer: accountDetails.billingSameAsCustomer,
      billingAddressLine1: accountDetails.billingAddressLine1,
      billingAddressLine2: accountDetails.billingAddressLine2,
      billingCity: accountDetails.billingCity,
      billingState: accountDetails.billingState,
      billingPostalCode: accountDetails.billingPostalCode,
      billingCountry: accountDetails.billingCountry,
    };
    const fd = new FormData();
    fd.append('request', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
    if (companyLogo) fd.append('companyLogo', companyLogo, companyLogo.name);

    try {
      setIsSubmitting(true);
      if (customerId && isDraft) {
        await updateCustomer(customerId, payload);
        await confirmCustomer(customerId);
        onClose();
      } else {
        const created = await createCustomer(fd);
        const id = created?.id ?? created?.customerId ?? created?.data?.id;
        if (id != null) await confirmCustomer(id);
        onClose();
      }
    } catch (e) {
      console.error('Error creating customer:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    setDraftSaved(false);
    const nz = (v?: string | null) => (typeof v === 'string' ? (v.trim() || null) : v ?? null);

    const cleanPhone = (() => {
      const raw = nz(accountDetails?.phoneNumber);
      if (!raw) return null;
      const cleaned = raw.replace(/[^0-9+]/g, '');
      return cleaned.startsWith('+') ? '+' + cleaned.slice(1).replace(/[^0-9]/g, '') : cleaned.replace(/[^0-9]/g, '');
    })();

    const payload = {
      companyName: nz(companyName),
      customerName: nz(customerName),
      companyType: nz(companyType),
      phoneNumber: cleanPhone,
      primaryEmail: nz(accountDetails?.primaryEmail),
      additionalEmailRecipients: accountDetails?.additionalEmailRecipients?.length ? accountDetails.additionalEmailRecipients : null,
      customerAddressLine1: nz(accountDetails?.customerAddressLine1),
      customerAddressLine2: nz(accountDetails?.customerAddressLine2),
      customerCity: nz(accountDetails?.customerCity),
      customerState: nz(accountDetails?.customerState),
      customerPostalCode: nz(accountDetails?.customerPostalCode),
      customerCountry: nz(accountDetails?.customerCountry),
      billingSameAsCustomer: accountDetails?.billingSameAsCustomer ?? false,
      billingAddressLine1: nz(accountDetails?.billingAddressLine1),
      billingAddressLine2: nz(accountDetails?.billingAddressLine2),
      billingCity: nz(accountDetails?.billingCity),
      billingState: nz(accountDetails?.billingState),
      billingPostalCode: nz(accountDetails?.billingPostalCode),
      billingCountry: nz(accountDetails?.billingCountry)
    };

    const fd = new FormData();
    fd.append('request', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
    if (companyLogo) fd.append('companyLogo', companyLogo, companyLogo.name);

    try {
      setIsSavingDraft(true);
      if (customerId && isDraft) {
        await updateCustomer(customerId, payload);
      } else {
        const created = await createCustomer(fd);
        const id = created?.id ?? created?.customerId ?? created?.data?.id;
        if (id) { setCustomerId(id); setIsDraft(true); }
      }
      setDraftSaved(true);
    } catch (e) {
      console.error('Error saving draft:', e);
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleAccountDetailsChange = (data: AccountDetailsData) => {
    setAccountDetails(data);
    if (draftSaved) setDraftSaved(false);
  };

  // SaveDraft modal (back arrow) — delete flow
  const handleSaveDraft_NoDelete = async () => {
    try {
      if (customerId != null) {
        await deleteCustomer(customerId);
      }
    } catch (e) {
      console.error('Error deleting on back modal:', e);
    } finally {
      setShowSaveDraftModal(false);
      onClose();
    }
  };

  // SaveDraft modal (back arrow) — SAVE AS DRAFT flow
  const handleSaveDraft_Save = async () => {
    await handleSaveDraft();
    setShowSaveDraftModal(false);
    onClose();
  };

  // Top-right Delete confirmation
  const handleConfirmDelete = async () => {
    try {
      if (customerId != null) {
        await deleteCustomer(customerId);
      }
    } catch (e) {
      console.error('Error deleting customer:', e);
    } finally {
      setShowDeleteModal(false);
      onClose();
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <>
            <div className="sub-create-form">
              <InputField
                label="Company Name"
                value={companyName}
                placeholder="eg., abc company"
                onChange={(value) => { 
                  setCompanyName(value); 
                  if (errors.companyName) setErrors(p => ({ ...p, companyName: '' })); 
                }}
                error={errors.companyName}
                className="company-name-input"
              />
            </div>

            <div className="sub-create-form">
              <label style={{ display: 'none' }}>Company Logo</label>
              <LogoUploader logo={companyLogo} logoUrl={initialLogoUrl} onChange={(file)=>setCompanyLogo(file)} />
            </div>

            <div className="sub-create-form">
              <InputField
                label="Customer Name"
                value={customerName}
                placeholder="eg. john doe"
                onChange={(value) => { 
                  setCustomerName(value); 
                  if (errors.customerName) setErrors(p => ({ ...p, customerName: '' })); 
                }}
                error={errors.customerName}
                className="customer-name-input"
              />
            </div>

            <div className="sub-create-form">
              <label className="com-form-label">Company Type</label>
              <select
                className="cus-select"
                value={companyType}
                onChange={(e) => { setCompanyType(e.target.value); if (errors.companyType) setErrors(p => ({ ...p, companyType: '' })); }}
              >
                <option value="">Select Company Type</option>
                <option value="INDIVIDUAL">Individual</option>
                <option value="BUSINESS">Business</option>
              </select>
              {errors.companyType && <span className="field-error">{errors.companyType}</span>}
            </div>
          </>
        );
      case 1:
        return (
          <AccountDetailsForm
            data={accountDetails ?? undefined}
            onChange={setAccountDetails}
            errors={accountErrors}
            onEmailBlur={handleEmailBlur}
            // NEW: let child know who we are and what is initial email
            currentCustomerId={customerId ?? undefined}
            isDraft={isDraft}
            initialPrimaryEmail={initialPrimaryEmailRef.current ?? undefined}
          />
        );
      case 2:
        return <CustomerReview customerName={customerName} companyName={companyName} companyType={companyType} accountDetails={accountDetails} />;
      default:
        return <p>Coming soon...</p>;
    }
  };

  const modalName = (customerName || draftCustomer?.customerName || companyName || draftCustomer?.companyName || '').trim() || 'this customer';
  const deleteModalTitle = `Are you sure you want to delete the product “${modalName}”?`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <TopBar
        title="Create New Customer"
        onBack={handleHeaderBack}
        cancel={{ onClick: () => setShowDeleteModal(true) }}
        save={{ label: "Save as Draft", saving: isSavingDraft, saved: draftSaved, disabled: isSubmitting, onClick: handleSaveDraft }}
      />

      <div className="create-customer-layout" style={{ flex: 1 }}>
        <aside className="progress-sidebar">
          <div className="progress-container">
            {steps.map((step, i) => {
              const isActive = i === currentStep;
              const isCompleted = i < currentStep;
              return (
                <div
                  key={i}
                  className={`progress-step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                  onClick={() => setCurrentStep(i)}
                >
                  <div className="progress-icon-wrapper">
                    {isCompleted ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="11.5" fill="var(--color-primary-800)" stroke="var(--color-primary-800)" />
                        <path d="M7 12l3 3 6-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="11.5" stroke="#D6D5D7" />
                        <circle cx="12" cy="12" r="6" fill="#D6D5D7" />
                      </svg>
                    )}
                  </div>
                  <div className="progress-step-text">
                    <span className="progress-step-title">{step.title}</span>
                    <span className="progress-step-desc">{step.desc}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        <div className="main-content-area">
          <div className="section-header">
            <div className="section-title">{steps[currentStep].title.toUpperCase()}</div>
          </div>

          <div className="form-content-wrapper">
            <div className="form-card">
              <div className="form-content">
                {renderStepContent()}
              </div>
            </div>
          </div>

          <div className="form-footer">
            <div className="footer-button-group">
              {currentStep > 0 && (
                <button type="button" className={buttonStyles.buttonSecondary} onClick={handleBack}>Back</button>
              )}
              <button
                className={buttonStyles.buttonPrimary}
                onClick={handleNext}
                disabled={isSubmitting}
                style={currentStep === 0 ? { marginLeft: 'auto' } : undefined}
              >
                {currentStep === steps.length - 1 ? 'Create Customer' : 'Save & Next'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <div className="rate-delete-modal-overlay" role="dialog" aria-modal="true">
          <div className="rate-delete-modal-content">
            <div className="rate-delete-modal-body">
              <h5>{deleteModalTitle}</h5>
              <p>This action cannot be undone.</p>
            </div>
            <div className="rate-delete-modal-footer">
              <button
                className="rate-delete-modal-cancel"
                onClick={() => setShowDeleteModal(false)}
              >
                Discard
              </button>
              <button
                className="rate-delete-modal-confirm"
                onClick={handleConfirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <SaveDraft
        isOpen={showSaveDraftModal}
        onClose={() => setShowSaveDraftModal(false)}   // Close modal (X button/overlay)
        onSave={handleSaveDraft_Save}        // "Save as Draft"
        onDelete={handleSaveDraft_NoDelete}  // "No, Delete"
      />
    </div>
  );
};

export default CreateCustomer;
