import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getCustomer,
  updateCustomer,
  confirmCustomer,
  updateCustomerLogo,
  deleteCustomerLogo
} from '../api';
import type { Customer } from '../Customers';
import EditReview from './EditReview';
import { AccountDetailsData } from './EditAccount';
import EditAccount from './EditAccount';
import { InputField, SelectField } from '../../componenetsss/Inputs';
import TopBar from '../../TopBar/TopBar';
import LogoUploader from '../LogoUploader';
import { getAuthHeaders } from '../../../utils/auth';
import EditPopup from '../../componenetsss/EditPopUp';

/* ---------- helpers copied from Customers list ---------- */
const FILE_HOST = 'http://43.206.110.213:8081';

const absolutizeUpload = (path: string) => {
  const clean = path.replace(/\\/g, '/').trim();
  if (/^https?:\/\//i.test(clean)) return clean;
  return `${FILE_HOST}${clean.startsWith('/') ? '' : '/'}${clean}`;
};

const resolveLogoSrc = async (uploadPath?: string): Promise<string | null> => {
  if (!uploadPath) return null;
  const url = encodeURI(absolutizeUpload(uploadPath));
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { ...getAuthHeaders(), Accept: 'image/*' },
      credentials: 'include',
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  } catch {
    return null;
  }
};
/* -------------------------------------------------------- */

const steps = [
  { id: 1, title: 'Customer Details' },
  { id: 2, title: 'Billing & Plan' },
  { id: 3, title: 'Review & Confirm' },
];

type ActiveTab = 'details' | 'account' | 'review';

const EditCustomer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  // Step data
  const [customerName, setCustomerName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyType, setCompanyType] = useState('');
  const [companyLogo, setCompanyLogo] = useState<File | null>(null);
  const [companyLogoUrl, setCompanyLogoUrl] = useState<string | null>(null);
  const lastBlobUrlRef = useRef<string | null>(null);

  const [accountDetails, setAccountDetails] = useState<AccountDetailsData | null>(null);

  // Step control & validation
  const [currentStep, setCurrentStep] = useState(0);
  const [activeTab, setActiveTab] = useState<ActiveTab>('details');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [accountErrors, setAccountErrors] = useState<Record<string, string>>({});

  // Leave popup
  const [showLeavePopup, setShowLeavePopup] = useState(false);
  const [savingLeave, setSavingLeave] = useState(false);

  // ------- fetch existing customer -------
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getCustomer(id)
      .then(async (data: Customer) => {
        setCompanyName(data.companyName ?? '');
        setCustomerName(data.customerName ?? '');
        setCompanyType(data.companyType ?? '');

        const rawPath =
          (data as any).companyLogoUrl ??
          (data as any).logoUrl ??
          (data as any).logo ??
          null;

        const blobUrl = await resolveLogoSrc(rawPath ?? undefined);
        if (blobUrl) {
          if (lastBlobUrlRef.current && lastBlobUrlRef.current.startsWith('blob:')) {
            URL.revokeObjectURL(lastBlobUrlRef.current);
          }
          lastBlobUrlRef.current = blobUrl;
          setCompanyLogoUrl(blobUrl);
        } else {
          setCompanyLogoUrl(null);
        }

        const account: AccountDetailsData = {
          phoneNumber: (data as any).phoneNumber ?? '',
          primaryEmail: (data as any).primaryEmail ?? '',
          additionalEmailRecipients: (data as any).additionalEmailRecipients ?? [],
          billingSameAsCustomer: (data as any).billingSameAsCustomer ?? false,
          customerAddressLine1: (data as any).customerAddressLine1 ?? '',
          customerAddressLine2: (data as any).customerAddressLine2 ?? '',
          customerCity: (data as any).customerCity ?? '',
          customerState: (data as any).customerState ?? '',
          customerPostalCode: (data as any).customerPostalCode ?? '',
          customerCountry: (data as any).customerCountry ?? '',
          billingAddressLine1: (data as any).billingAddressLine1 ?? '',
          billingAddressLine2: (data as any).billingAddressLine2 ?? '',
          billingCity: (data as any).billingCity ?? '',
          billingState: (data as any).billingState ?? '',
          billingPostalCode: (data as any).billingPostalCode ?? '',
          billingCountry: (data as any).billingCountry ?? '',
        };
        setAccountDetails(account);
      })
      .catch((err: unknown) => console.error('Failed to fetch customer', err))
      .finally(() => setLoading(false));
  }, [id]);

  // revoke blob on unmount
  useEffect(() => {
    return () => {
      if (lastBlobUrlRef.current && lastBlobUrlRef.current.startsWith('blob:')) {
        URL.revokeObjectURL(lastBlobUrlRef.current);
      }
    };
  }, []);

  /* ---------- live error clearing ---------- */
  useEffect(() => {
    const next = { ...errors };
    if (companyName.trim()) delete next.companyName;
    if (customerName.trim()) delete next.customerName;
    if (companyType.trim()) delete next.companyType;
    if (JSON.stringify(next) !== JSON.stringify(errors)) setErrors(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyName, customerName, companyType]);

  useEffect(() => {
    if (!accountDetails) return;
    const n = { ...accountErrors };
    const clear = (k: keyof AccountDetailsData, keyInErr: string) => {
      // @ts-expect-error – we check for trimmed strings
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
    if (JSON.stringify(n) !== JSON.stringify(accountErrors)) setAccountErrors(n);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountDetails]);
  /* ---------------------------------------- */

  // ------- step helpers (match EditProduct UX) -------
  const goToStep = (index: number) => {
    setCurrentStep(index);
    const first = steps[index].title.split(' ')[0].toLowerCase();
    const tab = (first === 'customer'
      ? 'details'
      : first === 'billing'
      ? 'account'
      : 'review') as ActiveTab;
    setActiveTab(tab);
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      goToStep(currentStep - 1);
    }
  };

  // ------- validation & navigation -------
  const validateStep0 = () => {
    const newErrors: Record<string, string> = {};
    if (!companyName.trim()) newErrors.companyName = 'Company Name is required';
    if (!customerName.trim()) newErrors.customerName = 'Customer Name is required';
    if (!companyType.trim()) newErrors.companyType = 'Company Type is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep1 = () => {
    const a = accountDetails ?? ({} as AccountDetailsData);
    const newAccErrs: Record<string, string> = {};

    if (!a.phoneNumber?.trim()) newAccErrs.phoneNumber = 'Phone Number is required';
    if (!a.primaryEmail?.trim()) {
      newAccErrs.primaryEmail = 'Primary Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a.primaryEmail)) {
      newAccErrs.primaryEmail = 'Enter a valid email address';
    }

    [
      'billingAddressLine1','billingAddressLine2','billingCity','billingState','billingPostalCode','billingCountry',
      'customerAddressLine1','customerAddressLine2','customerCity','customerState','customerPostalCode','customerCountry'
    ].forEach((k) => {
      // @ts-ignore
      if (!a[k]?.trim()) newAccErrs[k] = `${k.replace(/([A-Z])/g, ' $1')} is required`;
    });

    setAccountErrors((prev) => ({ ...prev, ...newAccErrs }));
    return Object.keys(newAccErrs).length === 0;
  };

  const savePatch = async () => {
    if (!id) return false;
    const payload: Record<string, any> = {
      companyName,
      customerName,
      companyType,
      ...(accountDetails ?? {}),
    };
    try {
      await updateCustomer(id, payload);
      return true;
    } catch (err) {
      console.error('Failed to save draft/update', err);
      return false;
    }
  };

  const handleNextStep = async () => {
    if (activeTab === 'details') {
      if (!validateStep0()) return;
      goToStep(1);
      return;
    }
    if (activeTab === 'account') {
      if (!validateStep1()) return;
      // persist patch so review is fresh
      const ok = await savePatch();
      if (!ok) return;
      goToStep(2);
      return;
    }
    if (activeTab === 'review') {
      // final save + confirm
      const ok = await savePatch();
      if (!ok || !id) return;
      try {
        await confirmCustomer(id);
        navigate(-1);
      } catch (err) {
        console.error('Failed to confirm customer', err);
      }
    }
  };

  // ------- leave popup actions -------
  const openLeavePopup = () => setShowLeavePopup(true);

  const handlePopupSave = async () => {
    if (activeTab === 'details' && !validateStep0()) {
      setShowLeavePopup(false);
      return;
    }
    if (activeTab === 'account' && !validateStep1()) {
      setShowLeavePopup(false);
      return;
    }
    setSavingLeave(true);
    const ok = await savePatch();
    setSavingLeave(false);
    setShowLeavePopup(false);
    if (ok) navigate(-1);
  };

  // ------- Logo handlers -------
  const handleLogoChange = async (file: File | null) => {
    if (!id || !file) return;
    try {
      await updateCustomerLogo(id, file);
      setCompanyLogo(file);
      const localUrl = URL.createObjectURL(file);
      if (lastBlobUrlRef.current && lastBlobUrlRef.current.startsWith('blob:')) {
        URL.revokeObjectURL(lastBlobUrlRef.current);
      }
      lastBlobUrlRef.current = localUrl;
      setCompanyLogoUrl(localUrl);
    } catch (e) {
      console.error('Failed to update logo', e);
    }
  };

  const handleLogoRemove = async () => {
    if (!id) return;
    try {
      await deleteCustomerLogo(id);
      setCompanyLogo(null);
      if (lastBlobUrlRef.current && lastBlobUrlRef.current.startsWith('blob:')) {
        URL.revokeObjectURL(lastBlobUrlRef.current);
      }
      lastBlobUrlRef.current = null;
      setCompanyLogoUrl(null);
    } catch (e) {
      console.error('Failed to remove logo', e);
    }
  };

  // ------- step content -------
  const renderStepContent = () => {
    switch (activeTab) {
      case 'details':
        return (
          <div className="edit-np-section">
            <div className="edit-np-form-row">
              <div className="edit-np-form-group">
                <label className="edit-np-label">Company Name</label>
                <InputField
                  label=""
                  value={companyName}
                  placeholder="Enter company name"
                  onChange={(val) => {
                    setCompanyName(val);
                    if (!val.trim()) setErrors((p) => ({ ...p, companyName: 'Company Name is required' }));
                    else if (errors.companyName) setErrors((p) => ({
                      ...Object.fromEntries(Object.entries(p).filter(([k]) => k !== 'companyName'))
                    }));
                  }}
                  onBlur={() => {
                    if (!companyName.trim()) setErrors((p) => ({ ...p, companyName: 'Company Name is required' }));
                  }}
                  error={errors.companyName}
                  required
                />
              </div>
              <div className="edit-np-form-group">
                <label className="edit-np-label">Customer Name</label>
                <InputField
                  label=""
                  value={customerName}
                  placeholder="Enter customer name"
                  onChange={(val) => {
                    setCustomerName(val);
                    if (!val.trim()) setErrors((p) => ({ ...p, customerName: 'Customer Name is required' }));
                    else if (errors.customerName) setErrors((p) => ({
                      ...Object.fromEntries(Object.entries(p).filter(([k]) => k !== 'customerName'))
                    }));
                  }}
                  onBlur={() => {
                    if (!customerName.trim()) setErrors((p) => ({ ...p, customerName: 'Customer Name is required' }));
                  }}
                  error={errors.customerName}
                  required
                />
              </div>
            </div>

            <div className="edit-np-form-row">
              <div className="edit-np-form-group">
                <label className="edit-np-label">Company Type</label>
                <SelectField
                  label=""
                  value={companyType}
                  onChange={(val) => {
                    setCompanyType(val);
                    if (!val.trim()) setErrors((p) => ({ ...p, companyType: 'Company Type is required' }));
                    else if (errors.companyType) setErrors((p) => ({
                      ...Object.fromEntries(Object.entries(p).filter(([k]) => k !== 'companyType'))
                    }));
                  }}
                  onBlur={() => {
                    if (!companyType.trim()) setErrors((p) => ({ ...p, companyType: 'Company Type is required' }));
                  }}
                  options={[
                    { label: 'Select company type', value: '' },
                    { label: 'Individual', value: 'INDIVIDUAL' },
                    { label: 'Business', value: 'BUSINESS' },
                  ]}
                  error={errors.companyType}
                  required
                />
              </div>

              <div className="edit-np-form-group">
                <label className="edit-np-label">Company Logo</label>
                <LogoUploader
                  logo={companyLogo}
                  logoUrl={companyLogoUrl}
                  onChange={handleLogoChange}
                  onRemove={handleLogoRemove}
                />
              </div>
            </div>
          </div>
        );

      case 'account':
        return (
          <div className="edit-np-section">
            <EditAccount
              data={accountDetails ?? undefined}
              onChange={setAccountDetails}
              errors={accountErrors}
            />
          </div>
        );

      case 'review':
        return (
          <div className="edit-np-section">
            <div className="edit-np-review-container">
              <EditReview
                customerName={customerName}
                companyName={companyName}
                companyType={companyType}
                accountDetails={accountDetails}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <>
      <TopBar
        title="Edit Customer"
        onBack={() => setShowLeavePopup(true)}
      />

      <div className="edit-np-viewport">
        <div className="edit-np-card">
          <div className="edit-np-grid">
            {/* Sidebar */}
            <aside className="edit-np-rail">
              <div className="edit-np-steps">
                {steps.map((step, index) => {
                  const isActive = index === currentStep;
                  const isCompleted = index < currentStep;
                  return (
                    <div
                      key={step.id}
                      className={`edit-np-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                      onClick={() => goToStep(index)}
                    >
                      <div className="edit-np-step__title">{step.title}</div>
                    </div>
                  );
                })}
              </div>
            </aside>

            {/* Main Content */}
            <div className="edit-np-content">
              <div className="edit-np-form">
                {renderStepContent()}
              </div>

              {/* Footer Buttons */}
              <div className="edit-np-form-footer">
                <div className="edit-np-btn-group edit-np-btn-group--back">
                  {activeTab !== 'details' && (
                    <button
                      type="button"
                      className="np-btn np-btn--ghost"
                      onClick={handlePreviousStep}
                    >
                      Back
                    </button>
                  )}
                </div>

                <div className="edit-np-btn-group edit-np-btn-group--next">
                  <button
                    type="button"
                    className="np-btn np-btn--primary"
                    onClick={handleNextStep}
                  >
                    {activeTab === 'review' ? 'Save Changes' : 'Next'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="af-skel-rule af-skel-rule--bottom" />
        </div>
      </div>

      {/* Leave / Save popup (matches EditProduct API) */}
      <EditPopup
        isOpen={showLeavePopup}
        onClose={() => {
          setShowLeavePopup(false);
          navigate(-1);
        }}
        onDismiss={() => setShowLeavePopup(false)}
        onSave={async () => {
          await handlePopupSave();
        }}
      />
    </>
  );
};

export default EditCustomer;
