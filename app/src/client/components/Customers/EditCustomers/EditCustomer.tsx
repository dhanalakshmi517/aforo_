import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getCustomer,
  updateCustomer,
  confirmCustomer,
  updateCustomerLogo,
  deleteCustomerLogo,
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
import PrimaryButton from '../../componenetsss/PrimaryButton';
import SecondaryButton from '../../componenetsss/SecondaryButton';

import './EditCustomer.css'; // reuse the same layout shell (np-style classes)

/* ---------- helpers copied from Customers list ---------- */
const FILE_HOST = 'http://44.201.19.187:8081/';

const absolutizeUpload = (path: string) => {
  const clean = path.replace(/\\/g, '/').trim();
  if (/^https?:\/\//i.test(clean)) return clean;
  return `${FILE_HOST}${clean.startsWith('/') ? '' : '/'}${clean}`;
};

const resolveLogoSrc = async (uploadPath?: string): Promise<string | null> => {
  if (!uploadPath) return null;
  const url = absolutizeUpload(uploadPath);
  console.log('EditCustomer - Resolving logo URL:', url);

  // First try: Direct URL
  try {
    const directUrl = url;
    console.log('EditCustomer - Trying direct URL:', directUrl);
    const testRes = await fetch(directUrl, {
      method: 'HEAD',
      cache: 'no-store',
    });
    if (testRes.ok) {
      console.log('EditCustomer - Direct URL works, using it:', directUrl);
      return directUrl;
    }
  } catch (error) {
    console.log('EditCustomer - Direct URL failed, trying authenticated fetch:', error);
  }

  // Second try: authenticated fetch
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { ...getAuthHeaders(), Accept: 'image/*' },
      cache: 'no-store',
    });
    console.log('EditCustomer - Authenticated fetch response:', res.status, res.statusText);
    if (!res.ok) {
      console.error('EditCustomer - Authenticated fetch failed:', res.status, res.statusText);
      return null;
    }
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    console.log('EditCustomer - Logo blob URL created:', objectUrl);
    return objectUrl;
  } catch (error) {
    console.error('EditCustomer - Logo fetch error:', error);
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
  const [isInitializing, setIsInitializing] = useState(true);

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

  // Track original data for change detection
  const [originalData, setOriginalData] = useState<{
    customerName: string;
    companyName: string;
    companyType: string;
    accountDetails: AccountDetailsData | null;
  } | null>(null);

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

        setOriginalData({
          customerName: data.customerName ?? '',
          companyName: data.companyName ?? '',
          companyType: data.companyType ?? '',
          accountDetails: account,
        });
      })
      .catch((err: unknown) => console.error('Failed to fetch customer', err))
      .finally(() => {
        setLoading(false);
        setIsInitializing(false);
      });
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

  // ------- step helpers (match EditProduct / EditSubscription UX) -------
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
      'billingAddressLine1',
      'billingAddressLine2',
      'billingCity',
      'billingState',
      'billingPostalCode',
      'billingCountry',
      'customerAddressLine1',
      'customerAddressLine2',
      'customerCity',
      'customerState',
      'customerPostalCode',
      'customerCountry',
    ].forEach(k => {
      // @ts-ignore
      if (!a[k]?.trim()) newAccErrs[k] = `${k.replace(/([A-Z])/g, ' $1')} is required`;
    });

    setAccountErrors(prev => ({ ...prev, ...newAccErrs }));
    return Object.keys(newAccErrs).length === 0;
  };

  const savePatch = async () => {
    if (!id) return false;

    console.log('savePatch: companyLogo state:', companyLogo);

    const payload: Record<string, any> = {
      companyName,
      customerName,
      companyType,
      ...(accountDetails ?? {}),
    };
    console.log('JSON payload:', payload);
    try {
      await updateCustomer(id, payload);

      if (companyLogo) {
        console.log('Uploading logo via separate endpoint');
        try {
          await updateCustomerLogo(id, companyLogo);
          console.log('Logo uploaded successfully');
        } catch (logoErr) {
          console.error('Failed to upload logo:', logoErr);
        }
      }

      return true;
    } catch (err) {
      console.error('Failed to save draft/update with JSON', err);
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
      const ok = await savePatch();
      if (!ok) return;
      goToStep(2);
      return;
    }
    if (activeTab === 'review') {
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
  const hasChanges = () => {
    if (!originalData) return false;

    if (
      originalData.customerName !== customerName ||
      originalData.companyName !== companyName ||
      originalData.companyType !== companyType
    ) {
      return true;
    }

    if (JSON.stringify(originalData.accountDetails) !== JSON.stringify(accountDetails)) {
      return true;
    }

    return false;
  };

  const openLeavePopup = () => {
    if (hasChanges()) {
      setShowLeavePopup(true);
    } else {
      navigate(-1);
    }
  };

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
                <InputField
                  label="Company Name"
                  value={companyName}
                  placeholder="Enter company name"
                  onChange={val => {
                    setCompanyName(val);
                    if (!val.trim())
                      setErrors(p => ({ ...p, companyName: 'Company Name is required' }));
                    else if (errors.companyName)
                      setErrors(p => ({
                        ...Object.fromEntries(
                          Object.entries(p).filter(([k]) => k !== 'companyName',
                          ),
                        ),
                      }));
                  }}
                  onBlur={() => {
                    if (!companyName.trim())
                      setErrors(p => ({ ...p, companyName: 'Company Name is required' }));
                  }}
                  error={errors.companyName}
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
              <div className="edit-np-form-group">
                <label className="edit-np-label">Customer Name</label>
                <InputField
                  label=""
                  value={customerName}
                  placeholder="Enter customer name"
                  onChange={val => {
                    setCustomerName(val);
                    if (!val.trim())
                      setErrors(p => ({ ...p, customerName: 'Customer Name is required' }));
                    else if (errors.customerName)
                      setErrors(p => ({
                        ...Object.fromEntries(
                          Object.entries(p).filter(([k]) => k !== 'customerName'),
                        ),
                      }));
                  }}
                  onBlur={() => {
                    if (!customerName.trim())
                      setErrors(p => ({ ...p, customerName: 'Customer Name is required' }));
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
                  onChange={val => {
                    setCompanyType(val);
                    if (!val.trim())
                      setErrors(p => ({ ...p, companyType: 'Company Type is required' }));
                    else if (errors.companyType)
                      setErrors(p => ({
                        ...Object.fromEntries(
                          Object.entries(p).filter(([k]) => k !== 'companyType'),
                        ),
                      }));
                  }}
                  onBlur={() => {
                    if (!companyType.trim())
                      setErrors(p => ({ ...p, companyType: 'Company Type is required' }));
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

  return (
    <>
      <TopBar title="Edit Customer" onBack={openLeavePopup} />

      {/* same shell as EditSubscription – viewport → card → grid → rail + main */}
      <div className="editsub-np-viewport">
        <div className="editsub-np-card">
          <div className="editsub-np-grid">
            {/* LEFT rail – stepper */}
            <aside className="editsub-np-rail">
              <nav className="editsub-np-steps">
                {steps.map((step, index) => {
                  const isActive = index === currentStep;
                  const isCompleted = index < currentStep;

                  return (
                    <button
                      key={step.id}
                      type="button"
                      className={[
                        'editsub-np-step',
                        isActive ? 'active' : '',
                        isCompleted ? 'completed' : '',
                      ]
                        .join(' ')
                        .trim()}
                      onClick={() => goToStep(index)}
                    >
                      <span className="edisub-np-step__text">
                        <span className="editsub-np-step__title">{step.title}</span>
                      </span>
                    </button>
                  );
                })}
              </nav>
            </aside>

            {/* MAIN area – matches EditSubscription structure */}
            <main className="editsub-np-main">
              <div className="editsub-np-main__inner">
                <div className="editsub-np-body">
                  <form
                    className="editsub-np-form"
                    onSubmit={e => {
                      e.preventDefault();
                    }}
                  >
                    <div className="editsub-np-form-section">
                      {renderStepContent()}
                    </div>

                    <div className="af-skel-rule af-skel-rule--bottom" />

                    {/* FOOTER actions – Back / Save & Next / Save Changes */}
                    <div className="editsub-np-form-footer">
                      <div className="editsub-np-btn-group editsub-np-btn-group--back">
                        {activeTab !== 'details' && (
                          <SecondaryButton
                            onClick={handlePreviousStep}
                          >
                            Back
                          </SecondaryButton>
                        )}
                      </div>

                      <div className="editsub-np-btn-group editsub-np-btn-group--next">
                        <PrimaryButton
                          onClick={handleNextStep}
                        >
                          {activeTab === 'review' ? 'Save Changes' : 'Save & Next'}
                        </PrimaryButton>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
              <div className="af-skel-rule af-skel-rule--bottom" />
            </main>
          </div>
        </div>
      </div>

      {/* Leave / Save popup */}
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
