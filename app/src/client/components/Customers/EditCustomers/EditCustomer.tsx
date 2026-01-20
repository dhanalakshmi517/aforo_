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
import { InputField, DropdownField } from '../../componenetsss/Inputs';
import TopBar from '../../TopBar/TopBar';
import LogoUploader from '../LogoUploader';
import { getAuthHeaders } from '../../../utils/auth';
import EditPopup from '../../componenetsss/EditPopUp';
import ConfigurationStepShell from '../../componenetsss/ConfigurationStepShell';
import UnsavedChangesModal from '../../componenetsss/UnsavedChangesModal';
import { useToast } from '../../componenetsss/ToastProvider';

import './EditCustomer.css'; // reuse the same layout shell (np-style classes)

/* ---------- helpers for logo fetching (optimized) ---------- */
const FILE_HOST = 'http://44.201.19.187:8081';

const absolutizeUpload = (path: string) => {
  const clean = path.replace(/\\/g, '/').trim();
  if (/^https?:\/\//i.test(clean)) return clean;
  const separator = clean.startsWith('/') ? '' : '/';
  return `${FILE_HOST}${separator}${clean}`;
};

/**
 * Resolve logo URL for display - optimized version
 * Goes straight to authenticated fetch since direct URLs require auth (401)
 */
const resolveLogoSrc = async (uploadPath?: string): Promise<string | null> => {
  if (!uploadPath) return null;
  const url = absolutizeUpload(uploadPath);

  // Skip direct URL check - it always fails with 401
  // Go straight to authenticated fetch
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { ...getAuthHeaders(), Accept: 'image/*' },
      cache: 'no-store',
    });
    if (!res.ok) {
      console.error('EditCustomer - Logo fetch failed:', res.status);
      return null;
    }
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('EditCustomer - Logo fetch error:', error);
    return null;
  }
};
/* -------------------------------------------------------- */

const steps = [
  { id: 1, title: 'Customer Details' },
  { id: 2, title: 'Account Details' },
  { id: 3, title: 'Review & Confirm' },
];

type ActiveTab = 'details' | 'account' | 'review';

const EditCustomer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

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
  const [showUnsavedRequiredModal, setShowUnsavedRequiredModal] = useState(false);

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
      .then((data: Customer) => {
        setCompanyName(data.companyName ?? '');
        setCustomerName(data.customerName ?? '');
        setCompanyType(data.companyType ?? '');

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

        // Load logo asynchronously (don't block form display)
        const rawPath =
          (data as any).companyLogoUrl ??
          (data as any).logoUrl ??
          (data as any).logo ??
          null;

        if (rawPath) {
          resolveLogoSrc(rawPath).then(blobUrl => {
            if (blobUrl) {
              if (lastBlobUrlRef.current && lastBlobUrlRef.current.startsWith('blob:')) {
                URL.revokeObjectURL(lastBlobUrlRef.current);
              }
              lastBlobUrlRef.current = blobUrl;
              setCompanyLogoUrl(blobUrl);
            }
          });
        }
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
    if (accountDetails.billingSameAsCustomer && n.billingSameAsCustomer) {
      delete n.billingSameAsCustomer;
    }
    if (JSON.stringify(n) !== JSON.stringify(accountErrors)) setAccountErrors(n);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountDetails]);
  /* ---------------------------------------- */

  // ------- step helpers (match EditProduct / EditSubscription UX) -------
  const goToStep = (index: number) => {
    setCurrentStep(index);
    setActiveTab(['details', 'account', 'review'][index] as ActiveTab);
  };

  const handleStepClick = (index: number) => {
    if (index === currentStep) return;

    if (index < currentStep) {
      goToStep(index);
      return;
    }

    const validators = [validateStep0, validateStep1];
    for (let i = 0; i < index; i += 1) {
      const check = validators[i];
      if (check && !check()) {
        return;
      }
    }

    goToStep(index);
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

    if (!a.billingSameAsCustomer) {
      newAccErrs.billingSameAsCustomer = 'Select this checkbox to continue';
    }
    if (!a.phoneNumber?.trim()) newAccErrs.phoneNumber = 'Phone Number is required';
    if (!a.primaryEmail?.trim()) {
      newAccErrs.primaryEmail = 'Primary Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a.primaryEmail)) {
      newAccErrs.primaryEmail = 'Enter a valid email address';
    }

    [
      'billingAddressLine1',
      'billingCity',
      'billingState',
      'billingPostalCode',
      'billingCountry',
      'customerAddressLine1',
      'customerCity',
      'customerState',
      'customerPostalCode',
      'customerCountry',
    ].forEach(k => {
      // @ts-ignore
      if (!a[k]?.trim()) newAccErrs[k] = `${k.replace(/([A-Z])/g, ' $1')} is required`;
    });

    setAccountErrors(newAccErrs);
    return Object.keys(newAccErrs).length === 0;
  };

  const hasEmptyRequiredFields = () => {
    // Step 0 required fields
    if (!companyName.trim() || !customerName.trim() || !companyType.trim()) return true;

    // Step 1 required fields
    const a = accountDetails ?? ({} as AccountDetailsData);
    if (!a.billingSameAsCustomer) return true;
    if (!a.phoneNumber?.trim()) return true;
    if (!a.primaryEmail?.trim()) return true;

    const requiredKeys: (keyof AccountDetailsData)[] = [
      'billingAddressLine1',
      'billingCity',
      'billingState',
      'billingPostalCode',
      'billingCountry',
      'customerAddressLine1',
      'customerCity',
      'customerState',
      'customerPostalCode',
      'customerCountry',
    ];

    for (const k of requiredKeys) {
      const v = (a as any)[k];
      if (!v || (typeof v === 'string' && !v.trim())) return true;
    }

    return false;
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

    // Check if user uploaded a new logo
    if (companyLogo !== null) {
      return true;
    }

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
    if (hasEmptyRequiredFields()) {
      setShowUnsavedRequiredModal(true);
      return;
    }

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
    if (ok) {
      showToast({ kind: 'success', title: 'Changes Saved', message: 'Customer updated successfully.' });
      navigate(-1);
    }
  };

  // ------- Logo handlers -------
  const handleLogoChange = async (file: File | null) => {
    if (!id) return;

    // Handle removal case - when LogoUploader calls onChange(null)
    if (!file) {
      // Clear local file state - the onRemove callback handles server deletion
      setCompanyLogo(null);
      return;
    }

    // Handle new file upload
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


              <div className="editcust-np-form-group">
                <label className="editcust-np-label">Company Logo</label>
                <LogoUploader
                  logo={companyLogo}
                  logoUrl={companyLogoUrl}
                  onChange={handleLogoChange}
                  onRemove={handleLogoRemove}
                />
              </div>
              <div className="edit-np-form-group">
                <InputField
                  label="Customer Name"
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
                <DropdownField
                  label="Comapny Type"
                  placeholder="Company Type"
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

      {/* === USING ConfigurationStepShell === */}
      <ConfigurationStepShell
        steps={steps.map((step, index) => ({
          id: String(index),
          label: step.title,
        }))}
        activeStepId={String(currentStep)}
        onStepClick={(stepId) => {
          const index = parseInt(stepId, 10);
          handleStepClick(index);
        }}
        onBack={handlePreviousStep}
        onSave={handleNextStep}
        backLabel="Back"
        saveLabel={activeTab === 'review' ? 'Save Changes' : 'Save & Next'}
      >
        <form
          className="editsub-np-form"
          onSubmit={e => {
            e.preventDefault();
          }}
        >
          <div className="editsub-np-form-section">
            {renderStepContent()}
          </div>
        </form>
      </ConfigurationStepShell>

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
      {showUnsavedRequiredModal && (
        <UnsavedChangesModal
          onDiscard={() => {
            setShowUnsavedRequiredModal(false);
            navigate(-1);
          }}
          onKeepEditing={() => setShowUnsavedRequiredModal(false)}
          onClose={() => setShowUnsavedRequiredModal(false)}
        />
      )}
    </>
  );
};

export default EditCustomer;