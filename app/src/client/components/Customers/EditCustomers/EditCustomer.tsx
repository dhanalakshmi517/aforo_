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
import { InputField, SelectField } from '../../Components/InputFields';
import './EditCustomer.css';
import TopBar from '../../TopBar/TopBar';
import LogoUploader from '../LogoUploader';
import { getAuthHeaders } from '../../../utils/auth';
import EditModal from '../../componenetsss/EditModal';

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
  { title: 'Customer Details' },
  { title: 'Billing & Plan' },
  { title: 'Review & Confirm' },
];

const EditCustomer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  // Step 0
  const [customerName, setCustomerName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyType, setCompanyType] = useState('');
  const [companyLogo, setCompanyLogo] = useState<File | null>(null);
  const [companyLogoUrl, setCompanyLogoUrl] = useState<string | null>(null);

  const lastBlobUrlRef = useRef<string | null>(null);

  // Step 1
  const [accountDetails, setAccountDetails] = useState<AccountDetailsData | null>(null);

  // Step control & validation
  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [accountErrors, setAccountErrors] = useState<{ [key: string]: string }>({});

  // Leave modal
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [savingLeave, setSavingLeave] = useState(false);

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

  /* ---------- live error clearing (like Create) ---------- */
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
  /* ------------------------------------------------------ */

  const handleNext = async () => {
    if (currentStep === 0) {
      const newErrors: { [key: string]: string } = {};
      if (!companyName.trim()) newErrors.companyName = 'Company Name is required';
      if (!customerName.trim()) newErrors.customerName = 'Customer Name is required';
      if (!companyType.trim()) newErrors.companyType = 'Company Type is required';
      setErrors(newErrors);
      if (Object.keys(newErrors).length) return;
    }

    if (currentStep === 1) {
      const newAccErrs: { [key: string]: string } = {};
      if (!accountDetails?.phoneNumber?.trim()) newAccErrs.phoneNumber = 'Phone Number is required';
      if (!accountDetails?.primaryEmail?.trim()) {
        newAccErrs.primaryEmail = 'Primary Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(accountDetails.primaryEmail)) {
        newAccErrs.primaryEmail = 'Enter a valid email address';
      }

      [
        'billingAddressLine1','billingAddressLine2','billingCity','billingState','billingPostalCode','billingCountry',
        'customerAddressLine1','customerAddressLine2','customerCity','customerState','customerPostalCode','customerCountry'
      ].forEach((k) => {
        // @ts-ignore
        if (!accountDetails?.[k]?.trim()) newAccErrs[k] = `${k.replace(/([A-Z])/g, ' $1')} is required`;
      });

      setAccountErrors({ ...accountErrors, ...newAccErrs });
      if (Object.keys(newAccErrs).length) return;

      try {
        const patchPayload: Record<string, any> = {
          companyName,
          customerName,
          companyType,
          ...(accountDetails ?? {}),
        };
        await updateCustomer(id!, patchPayload);
      } catch (err) {
        console.error('Failed to save draft before review', err);
        return;
      }
    }

    const isLastStep = currentStep === steps.length - 1;
    if (isLastStep) {
      const payload: Record<string, any> = {
        companyName,
        customerName,
        companyType,
        ...(accountDetails ?? {})
      };
      try {
        await updateCustomer(id!, payload);
        await confirmCustomer(id!);
        navigate(-1);
      } catch (err) {
        console.error('Failed to save changes', err);
      }
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleFooterBack = () => {
    if (currentStep > 0) setCurrentStep((prev) => prev - 1);
    else navigate(-1);
  };

  const openLeaveModal = () => setShowLeaveModal(true);

  const handleSaveAndLeave = async () => {
    if (!id) return;
    try {
      setSavingLeave(true);
      const payload: Record<string, any> = {
        companyName,
        customerName,
        companyType,
        ...(accountDetails ?? {}),
      };
      await updateCustomer(id, payload);
      setShowLeaveModal(false);
      navigate(-1);
    } catch (e) {
      console.error('Failed to save before leaving', e);
    } finally {
      setSavingLeave(false);
    }
  };

  /* ---------- Logo handlers ---------- */
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
  /* ----------------------------------- */

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <>
            <div className="sub-create-form">
              <InputField
                label="Company Name"
                value={companyName}
                placeholder="Enter company name"
                onChange={(val: string) => {
                  setCompanyName(val);
                  if (!val.trim()) setErrors((p) => ({ ...p, companyName: 'Company Name is required' }));
                  else if (errors.companyName) setErrors((p) => ({ ...p, companyName: '' }));
                }}
                onBlur={() => {
                  if (!companyName.trim()) setErrors((p) => ({ ...p, companyName: 'Company Name is required' }));
                }}
                error={errors.companyName}
              />
            </div>

            <div className="sub-create-form">
              <label className="com-form-label">Company Logo</label>
              <LogoUploader
                logo={companyLogo}
                logoUrl={companyLogoUrl}
                onChange={handleLogoChange}
                onRemove={handleLogoRemove}
              />
            </div>

            <div className="sub-create-form">
              <InputField
                label="Customer Name"
                value={customerName}
                placeholder="Enter customer name"
                onChange={(val: string) => {
                  setCustomerName(val);
                  if (!val.trim()) setErrors((p) => ({ ...p, customerName: 'Customer Name is required' }));
                  else if (errors.customerName) setErrors((p) => ({ ...p, customerName: '' }));
                }}
                onBlur={() => {
                  if (!customerName.trim()) setErrors((p) => ({ ...p, customerName: 'Customer Name is required' }));
                }}
                error={errors.customerName}
              />
            </div>

            <div className="sub-create-form">
              <SelectField
                label="Company Type"
                value={companyType}
                onChange={(val: string) => {
                  setCompanyType(val);
                  if (!val.trim()) setErrors((p) => ({ ...p, companyType: 'Company Type is required' }));
                  else if (errors.companyType) setErrors((p) => ({ ...p, companyType: '' }));
                }}
                onBlur={() => {
                  if (!companyType.trim()) setErrors((p) => ({ ...p, companyType: 'Company Type is required' }));
                }}
                options={[
                  { label: 'Individual', value: 'INDIVIDUAL' },
                  { label: 'Business', value: 'BUSINESS' },
                ]}
                error={errors.companyType}
              />
            </div>
          </>
        );
      case 1:
        return (
          <EditAccount
            data={accountDetails ?? undefined}
            onChange={setAccountDetails}
            errors={accountErrors}
          />
        );
      case 2:
        return (
          <EditReview
            customerName={customerName}
            companyName={companyName}
            companyType={companyType}
            accountDetails={accountDetails}
          />
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
        onBack={openLeaveModal}
      />

      <div className="edit-customer-container">
        <div className="cus-wrapper">
          <aside className="side-progress" aria-label="Progress">
            {steps.map((s, i) => {
              const isActive = i === currentStep;
              return (
                <button
                  key={s.title}
                  type="button"
                  className={`side-step ${isActive ? 'is-active' : 'is-inactive'}`}
                  onClick={() => setCurrentStep(i)}
                  aria-current={isActive ? 'step' : undefined}
                >
                  <span className="side-step__label">{s.title}</span>
                </button>
              );
            })}
          </aside>

          <div className="form-section">
            <div className="form-card">
              <h4 className="form-section-heading">{steps[currentStep].title.toUpperCase()}</h4>
              <hr className="form-section-divider" />
              {renderStepContent()}
            </div>
            <div className="button-group">
              <button className="back" onClick={handleFooterBack} disabled={currentStep === 0}>
                Back
              </button>
              <button className="save-next" onClick={handleNext}>
                {currentStep === steps.length - 1 ? 'Save Changes' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <EditModal
        isOpen={showLeaveModal}
        onClose={() => setShowLeaveModal(false)}
        onCancel={() => setShowLeaveModal(false)}
        onSave={handleSaveAndLeave}
        saving={savingLeave}
      />
    </>
  );
};

export default EditCustomer;
