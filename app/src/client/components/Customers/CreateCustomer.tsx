import React, { useState, useEffect, useCallback, useRef } from "react";
import TopBar from "../componenetsss/TopBar";
import SaveDraft from "../componenetsss/SaveDraft";
import ConfirmDeleteModal from "../componenetsss/ConfirmDeleteModal";
import PrimaryButton from "../componenetsss/PrimaryButton";
import SecondaryButton from "../componenetsss/SecondaryButton";
import { InputField, SelectField } from "../componenetsss/Inputs";
import AccountDetailsForm, { AccountDetailsData } from "./AccountDetailsForm";
import CustomerReview from "./CustomerReview";
import LogoUploader from "./LogoUploader";

import {
  createCustomer,
  updateCustomer,
  confirmCustomer,
  checkEmailExists,
  deleteCustomer,
} from "./api";

import type { Customer } from "./Customers";
import "../componenetsss/SkeletonForm.css";
import "./CustomerForm.css";

interface CreateCustomerProps {
  onClose: () => void;
  draftCustomer?: Partial<Customer>;
  initialLogoUrl?: string | null;
}

type StepKey = "general" | "billing" | "review";

const steps = [
  { id: 1, key: "general" as StepKey, title: "Customer Details", desc: "Enter core information for the customer." },
  { id: 2, key: "billing" as StepKey,  title:"Account Details",  desc: "Configure billing frequency and plan." },
  { id: 3, key: "review"  as StepKey,  title: "Review & Confirm", desc: "Double-check everything before saving." },
];

const CreateCustomer: React.FC<CreateCustomerProps> = ({ onClose, draftCustomer, initialLogoUrl = null }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const activeTab: StepKey = steps[currentStep].key;

  const [companyName, setCompanyName] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [companyType, setCompanyType] = useState("");
  const [companyLogo, setCompanyLogo] = useState<File | null>(null);

  const [accountDetails, setAccountDetails] = useState<AccountDetailsData | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [accountErrors, setAccountErrors] = useState<Record<string, string>>({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSaveDraftModal, setShowSaveDraftModal] = useState(false);

  const [customerId, setCustomerId] = useState<number | null>(null);
  const [isDraft, setIsDraft] = useState(false);

  // Lock logic - similar to CreateUsageMetric
  const hasAnyRequiredInput = React.useMemo(() => {
    return Boolean(
      companyName.trim() ||
      customerName.trim() ||
      companyType.trim() ||
      companyLogo
    );
  }, [companyName, customerName, companyType, companyLogo]);

  const isBillingLocked = !hasAnyRequiredInput;

  const LockBadge = () => (
    <span
      style={{
        borderRadius: '8px',
        background: '#E9E9EE',
        display: 'flex',
        padding: '6px',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '5px',
        marginLeft: '8px'
      }}
      aria-label="Locked"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M4.66667 7.33334V4.66668C4.66667 3.78262 5.01786 2.93478 5.64298 2.30965C6.2681 1.68453 7.11595 1.33334 8 1.33334C8.88406 1.33334 9.7319 1.68453 10.357 2.30965C10.9821 2.93478 11.3333 3.78262 11.3333 4.66668V7.33334M3.33333 7.33334H12.6667C13.403 7.33334 14 7.9303 14 8.66668V13.3333C14 14.0697 13.403 14.6667 12.6667 14.6667H3.33333C2.59695 14.6667 2 14.0697 2 13.3333V8.66668C2 7.9303 2.59695 7.33334 3.33333 7.33334Z" stroke="#75797E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </span>
  );

  // email helpers
  const initialPrimaryEmailRef = useRef<string | null>(null);
  const emailCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    document.body.classList.add("create-product-page");
    return () => document.body.classList.remove("create-product-page");
  }, []);

  // prefill draft
  useEffect(() => {
    if (!draftCustomer) return;

    setCompanyName(draftCustomer.companyName ?? "");
    setCustomerName(draftCustomer.customerName ?? "");
    setCompanyType(draftCustomer.companyType ?? "");

    const acc: AccountDetailsData = {
      phoneNumber: draftCustomer.phoneNumber ?? "",
      primaryEmail: draftCustomer.primaryEmail ?? "",
      additionalEmailRecipients: draftCustomer.additionalEmailRecipients ?? [],
      billingSameAsCustomer: draftCustomer.billingSameAsCustomer ?? false,
      customerAddressLine1: draftCustomer.customerAddressLine1 ?? "",
      customerAddressLine2: draftCustomer.customerAddressLine2 ?? "",
      customerCity: draftCustomer.customerCity ?? "",
      customerState: draftCustomer.customerState ?? "",
      customerPostalCode: draftCustomer.customerPostalCode ?? "",
      customerCountry: draftCustomer.customerCountry ?? "",
      billingAddressLine1: draftCustomer.billingAddressLine1 ?? "",
      billingAddressLine2: draftCustomer.billingAddressLine2 ?? "",
      billingCity: draftCustomer.billingCity ?? "",
      billingState: draftCustomer.billingState ?? "",
      billingPostalCode: draftCustomer.billingPostalCode ?? "",
      billingCountry: draftCustomer.billingCountry ?? "",
    };
    setAccountDetails(acc);

    const id = draftCustomer.customerId ?? (draftCustomer as any).id ?? null;
    if (id != null) setCustomerId(id);

    setIsDraft(true);
    initialPrimaryEmailRef.current = draftCustomer.primaryEmail ?? "";
  }, [draftCustomer]);

  useEffect(() => {
    const n = { ...errors };
    if (companyName.trim()) delete n.companyName;
    if (customerName.trim()) delete n.customerName;
    if (companyType.trim()) delete n.companyType;
    setErrors(n);
  }, [companyName, customerName, companyType]); // eslint-disable-line

  // email uniqueness
  const checkEmailUniqueness = useCallback(async (email: string) => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;

    const normalized = email.trim().toLowerCase();
    const initial = (initialPrimaryEmailRef.current ?? "").toLowerCase();

    if (isDraft && normalized === initial) {
      setAccountErrors(prev => { const n = { ...prev }; delete n.primaryEmail; return n; });
      return;
    }

    try {
      const exists = await checkEmailExists(email, isDraft ? customerId ?? undefined : undefined);
      if (exists) setAccountErrors(prev => ({ ...prev, primaryEmail: "This email address is already registered" }));
      else setAccountErrors(prev => { const n = { ...prev }; delete n.primaryEmail; return n; });
    } catch {/* ignore */}
  }, [isDraft, customerId]);

  const handleEmailBlur = useCallback(async (email: string) => { await checkEmailUniqueness(email); }, [checkEmailUniqueness]);

  useEffect(() => {
    if (emailCheckTimeoutRef.current) clearTimeout(emailCheckTimeoutRef.current);
    const email = accountDetails?.primaryEmail?.trim() ?? "";
    const normalized = email.toLowerCase();
    const initial = (initialPrimaryEmailRef.current ?? "").toLowerCase();
    const shouldCheck =
      !!email &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
      (!isDraft || normalized !== initial);

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
    [
      "phoneNumber","primaryEmail",
      "billingAddressLine1","billingAddressLine2","billingCity","billingState","billingPostalCode","billingCountry",
      "customerAddressLine1","customerAddressLine2","customerCity","customerState","customerPostalCode","customerCountry"
    ].forEach((k) => clear(k as any, k));
    setAccountErrors(n);
  }, [accountDetails]); // eslint-disable-line

  const gotoStep = (index: number) => setCurrentStep(index);
  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(s => s - 1);
    else setShowSaveDraftModal(true);
  };

  const validateStep = async (s: number): Promise<boolean> => {
    if (s === 0) {
      const n: Record<string, string> = {};
      if (!companyName.trim()) n.companyName = "Company Name is required";
      if (!customerName.trim()) n.customerName = "Customer Name is required";
      if (!companyType.trim()) n.companyType = "Company Type is required";
      setErrors(n);
      return Object.keys(n).length === 0;
    }
    if (s === 1) {
      const n: Record<string, string> = {};
      const email = (accountDetails?.primaryEmail ?? "").trim();

      if (!accountDetails?.phoneNumber?.trim()) n.phoneNumber = "Phone Number is required";

      if (!email) n.primaryEmail = "Primary Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) n.primaryEmail = "Enter a valid email address";
      else {
        try {
          const normalized = email.toLowerCase();
          const initial = (initialPrimaryEmailRef.current ?? "").toLowerCase();
          if (!isDraft || normalized !== initial) {
            const exists = await checkEmailExists(email, isDraft ? customerId ?? undefined : undefined);
            if (exists) n.primaryEmail = "This email address is already registered";
          }
        } catch { /* ignore */ }
      }

      [
        "billingAddressLine1","billingAddressLine2","billingCity","billingState","billingPostalCode","billingCountry",
        "customerAddressLine1","customerAddressLine2","customerCity","customerState","customerPostalCode","customerCountry"
      ].forEach(k => {
        // @ts-ignore
        if (!accountDetails?.[k]?.trim()) n[k] = `${k.replace(/([A-Z])/g," $1")} is required`;
      });

      setAccountErrors({ ...accountErrors, ...n });
      return Object.keys({ ...accountErrors, ...n }).length === 0;
    }
    return true;
  };

  const handleNext = async () => {
    if (!(await validateStep(currentStep))) return;
    if (currentStep === steps.length - 1) {
      await handleCreateCustomer();
    } else {
      setCurrentStep(s => s + 1);
    }
  };

  const buildRequestBlob = (payload: any) =>
    new Blob([JSON.stringify(payload)], { type: "application/json" });

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
    fd.append("request", buildRequestBlob(payload));
    if (companyLogo) fd.append("companyLogo", companyLogo, companyLogo.name);

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
      console.error("Error creating customer:", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    setDraftSaved(false);

    const nz = (v?: string | null) => (typeof v === "string" ? (v.trim() || null) : v ?? null);
    const cleanPhone = (() => {
      const raw = nz(accountDetails?.phoneNumber);
      if (!raw) return null;
      const cleaned = raw.replace(/[^0-9+]/g, "");
      return cleaned.startsWith("+") ? "+" + cleaned.slice(1).replace(/[^0-9]/g, "") : cleaned.replace(/[^0-9]/g, "");
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
    fd.append("request", buildRequestBlob(payload));
    if (companyLogo) fd.append("companyLogo", companyLogo, companyLogo.name);

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
      console.error("Error saving draft:", e);
    } finally {
      setIsSavingDraft(false);
    }
  };

  const discardAndClose = async () => {
    try {
      if (customerId != null) await deleteCustomer(customerId);
    } catch (e) {
      console.error("Error deleting on back modal:", e);
    } finally {
      setShowSaveDraftModal(false);
      onClose();
    }
  };

  const saveDraftThenClose = async () => {
    await handleSaveDraft();
    setShowSaveDraftModal(false);
    onClose();
  };

  const confirmDeleteTopRight = async () => {
    try {
      if (customerId != null) await deleteCustomer(customerId);
    } catch (e) {
      console.error("Error deleting customer:", e);
    } finally {
      setShowDeleteModal(false);
      onClose();
    }
  };

  return (
    <>
      <TopBar
        title="Create New Customer"
        onBack={() => setShowSaveDraftModal(true)}
        cancel={{ onClick: () => setShowDeleteModal(true) }}
        save={{
          label: draftSaved ? "Saved!" : "Save as Draft",
          saving: isSavingDraft,
          saved: draftSaved,
          disabled: isSubmitting,
          onClick: handleSaveDraft,
        }}
      />

      <div className="customer-np-viewport">
        <div className="customer-np-card">
          <div className="customer-np-grid">
            {/* LEFT rail */}
            <aside className="customer-np-rail">
              <nav className="customer-np-steps">
                {steps.map((step, i) => {
                  const isActive = i === currentStep;
                  const isCompleted = i < currentStep;
                  const showConnector = i < steps.length - 1;

                  return (
                    <button
                      key={step.id}
                      type="button"
                      className={[
                        "customer-np-step",
                        isActive ? "active" : "",
                        isCompleted ? "completed" : "",
                      ].join(" ").trim()}
                      onClick={() => gotoStep(i)}
                    >
                      <span className="customer-np-step__bullet" aria-hidden="true">
                        <span className="customer-np-step__icon">
                          {isCompleted ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                              <circle cx="12" cy="12" r="11.5" fill="var(--color-primary-800)" stroke="var(--color-primary-800)" />
                              <path d="M7 12l3 3 6-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                              <circle cx="12" cy="12" r="11" stroke="#C3C2D0" strokeWidth="2" />
                              <circle cx="12" cy="12" r="6" fill="#C3C2D0" />
                            </svg>
                          )}
                        </span>
                        {showConnector && <span className="customer-np-step__connector" />}
                      </span>

                      <span className="customer-np-step__text">
                        <span className="customer-np-step__title">{step.title}</span>
                        <span className="customer-np-step__desc">{step.desc}</span>
                      </span>
                    </button>
                  );
                })}
              </nav>
            </aside>

            {/* MAIN */}
            <main className="customer-np-main">
              <div className="customer-np-main__inner">
                <div className="customer-np-body">
                  <form className="customer-np-form" onSubmit={(e) => e.preventDefault()}>
                    <div className="customer-np-form-section">
                      {/* STEP 1: GENERAL */}
                      {activeTab === "general" && (
                        <section>
                          <div className="customer-np-section-header">
                            <h3 className="customer-np-section-title">CUSTOMER DETAILS</h3>
                          </div>

                          <div className="customer-np-grid">
                            <InputField
                              label="Company Name"
                              value={companyName}
                              placeholder="eg., ABC Company"
                              onChange={(v) => setCompanyName(v)}
                              error={errors.companyName}
                            />

                            <div className="customer-np-grid__full">
                              <label className="customer-visually-hidden">Company Logo</label>
                              <LogoUploader
                                logo={companyLogo}
                                logoUrl={initialLogoUrl}
                                onChange={(file) => setCompanyLogo(file)}
                              />
                            </div>

                            <InputField
                              label="Customer Name"
                              value={customerName}
                              placeholder="eg., John Doe"
                              onChange={(v) => setCustomerName(v)}
                              error={errors.customerName}
                            />

                            <SelectField
                              label="Company Type"
                              value={companyType}
                              onChange={setCompanyType}
                              error={errors.companyType}
                              options={[
                                { value: '', label: 'Select Company Type' },
                                { value: 'INDIVIDUAL', label: 'Individual' },
                                { value: 'BUSINESS', label: 'Business' }
                              ]}
                            />
                          </div>
                        </section>
                      )}

                      {/* STEP 2: BILLING */}
                      {activeTab === "billing" && (
                        <section>
                          <div className="customer-np-section-header" style={{display:'flex',alignItems:'center'}}>
                            <h3 className="customer-np-section-title">Account Details</h3>
                            {isBillingLocked && <LockBadge />}
                          </div>
                          <AccountDetailsForm
                            data={accountDetails ?? undefined}
                            onChange={(d) => { setAccountDetails(d); if (draftSaved) setDraftSaved(false); }}
                            errors={accountErrors}
                            onEmailBlur={handleEmailBlur}
                            currentCustomerId={customerId ?? undefined}
                            isDraft={isDraft}
                            initialPrimaryEmail={initialPrimaryEmailRef.current ?? undefined}
                            locked={isBillingLocked}
                          />
                        </section>
                      )}

                      {/* STEP 3: REVIEW */}
                      {activeTab === "review" && (
                        <section>
                          <div className="customer-np-section-header">
                            <h3 className="customer-np-section-title">REVIEW & CONFIRM</h3>
                          </div>
                          <CustomerReview
                            customerName={customerName}
                            companyName={companyName}
                            companyType={companyType}
                            accountDetails={accountDetails}
                          />
                        </section>
                      )}
                    </div>

                    {/* Footer actions */}
                    <div className="customer-np-form-footer" style={{position:'relative'}}>
                      {activeTab === "billing" && isBillingLocked ? (
                        // ONLY the hint when billing step is locked (no buttons)
                        <div
                          className="customer-np-footer-hint"
                          style={{
                            position: 'absolute',
                            left: '50%',
                            bottom: '20px',
                            transform: 'translateX(-50%)',
                            color: '#8C8F96',
                            fontSize: 14,
                            pointerEvents: 'none',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          Fill the previous steps to unlock this step
                        </div>
                      ) : (
                        // normal buttons when unlocked or not billing step
                        <>
                          {activeTab !== "general" && (
                            <div className="customer-np-btn-group customer-np-btn-group--back">
                              <SecondaryButton type="button" onClick={handleBack}>
                                Back
                              </SecondaryButton>
                            </div>
                          )}

                          <div className="customer-np-btn-group customer-np-btn-group--next">
                            <PrimaryButton
                              type="button"
                              onClick={handleNext}
                              disabled={isSubmitting}
                            >
                              {activeTab === "review" ? "Create Customer" : "Save & Next"}
                            </PrimaryButton>
                          </div>
                        </>
                      )}
                    </div>
                  </form>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* Delete (top-right) */}
      {showDeleteModal && (
        <ConfirmDeleteModal
          isOpen={showDeleteModal}
          productName={(customerName || companyName || "this customer").trim()}
          onConfirm={confirmDeleteTopRight}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}

      {/* Save Draft dialog on back */}
      <SaveDraft
        isOpen={showSaveDraftModal}
        onClose={() => setShowSaveDraftModal(false)}
        onSave={saveDraftThenClose}
        onDelete={discardAndClose}
      />
    </>
  );
};

export default CreateCustomer;
