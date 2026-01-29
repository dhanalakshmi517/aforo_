// CreateCustomer.tsx
import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useLocation } from "react-router-dom";
import TopBar from "../componenetsss/TopBar";
import SaveDraft from "../componenetsss/SaveDraft";
import ConfirmDeleteModal from "../componenetsss/ConfirmDeleteModal";
import PrimaryButton from "../componenetsss/PrimaryButton";
import SecondaryButton from "../componenetsss/SecondaryButton";
import SectionHeader from "../componenetsss/SectionHeader";
import CreateFormShell from "../componenetsss/CreateFormShell";
import { InputField, DropdownField } from "../componenetsss/Inputs";
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
  {
    id: 1,
    key: "general" as StepKey,
    title: "Customer Details",
    desc: "Fill in your basic details to proceed.",
  },
  {
    id: 2,
    key: "billing" as StepKey,
    title: "Account Details",
    desc: "Set up your account credentials securely",
  },
  {
    id: 3,
    key: "review" as StepKey,
    title: "Review & Confirm",
    desc: "Check and Finalize details.",
  },
];

const CreateCustomer: React.FC<CreateCustomerProps> = ({
  onClose,
  draftCustomer: propDraftCustomer,
  initialLogoUrl = null,
}) => {
  const location = useLocation();
  // Extract draft customer from navigation state or use prop
  const draftCustomer = (location.state as any)?.draftCustomer || propDraftCustomer;
  
  const [currentStep, setCurrentStep] = useState(0);
  const activeTab: StepKey = steps[currentStep].key;

  const [companyName, setCompanyName] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [companyType, setCompanyType] = useState("");
  const [companyLogo, setCompanyLogo] = useState<File | null>(null);

  const [accountDetails, setAccountDetails] = useState<AccountDetailsData | null>(
    null
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [accountErrors, setAccountErrors] = useState<Record<string, string>>({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSaveDraftModal, setShowSaveDraftModal] = useState(false);

  const [customerId, setCustomerId] = useState<number | null>(null);
  const [isDraft, setIsDraft] = useState(false);
  const [hasEverBeenEnabled, setHasEverBeenEnabled] = useState(false);

  // Lock logic
  const hasAnyRequiredInput = useMemo(() => {
    return Boolean(
      companyName.trim() ||
        customerName.trim() ||
        companyType.trim() ||
        companyLogo
    );
  }, [companyName, customerName, companyType, companyLogo]);

  const isStep0Completed = companyName.trim() && customerName.trim() && companyType.trim();
  
  const isBillingLocked = !isStep0Completed;

  const isBillingComplete = useMemo(() => {
    if (!accountDetails) return false;
    if (!accountDetails.phoneNumber?.trim()) return false;
    if (!accountDetails.primaryEmail?.trim()) return false;
    if (!accountDetails.billingAddressLine1?.trim()) return false;
    if (!accountDetails.billingCity?.trim()) return false;
    if (!accountDetails.billingState?.trim()) return false;
    if (!accountDetails.billingPostalCode?.trim()) return false;
    if (!accountDetails.billingCountry?.trim()) return false;
    if (!accountDetails.customerAddressLine1?.trim()) return false;
    if (!accountDetails.customerCity?.trim()) return false;
    if (!accountDetails.customerState?.trim()) return false;
    if (!accountDetails.customerPostalCode?.trim()) return false;
    if (!accountDetails.customerCountry?.trim()) return false;
    return true;
  }, [accountDetails]);

  const isReviewLocked = useMemo(() => {
    if (!hasAnyRequiredInput) return true;
    if (!accountDetails) return true;

    const email = (accountDetails.primaryEmail ?? "").trim();
    const hasValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!accountDetails.phoneNumber?.trim()) return true;
    if (!email || !hasValidEmail) return true;

    // Don't check accountErrors here as they might be stale
    // Validation will be performed when clicking review tab

    const requiredKeys: Array<keyof AccountDetailsData> = [
      "billingAddressLine1",
      "billingCity",
      "billingState",
      "billingPostalCode",
      "billingCountry",
    ];

    if (!accountDetails?.billingSameAsCustomer) {
      requiredKeys.push(
        "customerAddressLine1",
        "customerCity",
        "customerState",
        "customerPostalCode",
        "customerCountry"
      );
    }

    for (const k of requiredKeys) {
      // @ts-ignore
      if (!accountDetails?.[k]?.trim?.()) return true;
    }

    return false;
  }, [hasAnyRequiredInput, accountDetails]);

  // Lock badge (tab header)
  const LockBadge = () => (
    <span
      style={{
        borderRadius: "8px",
        background: "#E9E9EE",
        display: "flex",
        padding: "6px",
        justifyContent: "center",
        alignItems: "center",
        gap: "5px",
      }}
      aria-label="Locked"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
      >
        <path
          d="M4.66667 7.33334V4.66668C4.66667 3.78262 5.01786 2.93478 5.64298 2.30965C6.2681 1.68453 7.11595 1.33334 8 1.33334C8.88406 1.33334 9.7319 1.68453 10.357 2.30965C10.9821 2.93478 11.3333 3.78262 11.3333 4.66668V7.33334M3.33333 7.33334H12.6667C13.403 7.33334 14 7.9303 14 8.66668V13.3333C14 14.0697 13.403 14.6667 12.6667 14.6667H3.33333C2.59695 14.6667 2 14.0697 2 13.3333V8.66668C2 7.9303 2.59695 7.33334 3.33333 7.33334Z"
          stroke="#75797E"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );

  // ✅ Sidebar lock icon (the one you asked)
  const StepLockIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="26"
      height="26"
      viewBox="0 0 26 26"
      fill="none"
    >
      <path
        d="M10.03 11.895V9.67503C10.03 8.93905 10.3224 8.23322 10.8428 7.71281C11.3632 7.1924 12.069 6.90004 12.805 6.90004C13.541 6.90004 14.2468 7.1924 14.7672 7.71281C15.2876 8.23322 15.58 8.93905 15.58 9.67503V11.895M25 13C25 19.6274 19.6274 25 13 25C6.37258 25 1 19.6274 1 13C1 6.37258 6.37258 1 13 1C19.6274 1 25 6.37258 25 13ZM8.92003 11.895H16.69C17.303 11.895 17.8 12.392 17.8 13.005V16.89C17.8 17.503 17.303 18 16.69 18H8.92003C8.307 18 7.81003 17.503 7.81003 16.89V13.005C7.81003 12.392 8.307 11.895 8.92003 11.895Z"
        stroke="#BAC4D5"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  // ✅ Completed icon (your blue check)
  const CompletedIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M9.50024 16.6662C9.89077 17.0567 10.5239 17.0567 10.9145 16.6662L18.0341 9.54661C18.4017 9.17902 18.4017 8.58304 18.0341 8.21546C17.6665 7.84787 17.0705 7.84787 16.7029 8.21546L10.9145 14.0039C10.5239 14.3944 9.89077 14.3944 9.50024 14.0039L7.27291 11.7766C6.90533 11.409 6.30935 11.409 5.94176 11.7766C5.57418 12.1442 5.57418 12.7402 5.94176 13.1077L9.50024 16.6662ZM12.0022 24.0001C10.3425 24.0001 8.78242 23.6851 7.32204 23.0552C5.86163 22.4253 4.59129 21.5705 3.51102 20.4907C2.43072 19.4109 1.57549 18.1411 0.945316 16.6813C0.315145 15.2216 6.02322e-05 13.6619 6.02322e-05 12.0022C6.02322e-05 10.3425 0.315009 8.78242 0.944905 7.32204C1.5748 5.86163 2.42965 4.5913 3.50944 3.51102C4.58925 2.43072 5.85903 1.57549 7.31878 0.945317C8.77851 0.315147 10.3382 6.02322e-05 11.9979 6.02322e-05C13.6577 6.02322e-05 15.2177 0.31501 16.6781 0.944906C18.1385 1.5748 19.4088 2.42965 20.4891 3.50944C21.5694 4.58925 22.4246 5.85903 23.0548 7.31879C23.685 8.77852 24.0001 10.3382 24.0001 11.9979C24.0001 13.6577 23.6851 15.2177 23.0552 16.6781C22.4253 18.1385 21.5705 19.4088 20.4907 20.4891C19.4109 21.5694 18.1411 22.4246 16.6813 23.0548C15.2216 23.685 13.6619 24.0001 12.0022 24.0001Z"
        fill="#034A7D"
      />
    </svg>
  );

  // ✅ Active icon (your grey ring)
  const ActiveRingIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="11" stroke="#C3C2D0" strokeWidth="2" />
      <circle cx="12" cy="12" r="6" fill="#C3C2D0" />
    </svg>
  );

  // ✅ Unlocked icon (for available but not completed steps)
  const UnlockedIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 26 26" fill="none">
      <path d="M19 13C19 16.3137 16.3137 19 13 19C9.68629 19 7 16.3137 7 13C7 9.68629 9.68629 7 13 7C16.3137 7 19 9.68629 19 13Z" fill="#BAC4D5"/>
      <path d="M13 1C19.6274 1 25 6.37258 25 13C25 19.6274 19.6274 25 13 25C6.37258 25 1 19.6274 1 13C1 6.37258 6.37258 1 13 1ZM18 13C18 15.7614 15.7614 18 13 18C10.2386 18 8 15.7614 8 13C8 10.2386 10.2386 8 13 8C15.7614 8 18 10.2386 18 13ZM20 13C20 9.13401 16.866 6 13 6C9.13401 6 6 9.13401 6 13C6 16.866 9.13401 20 13 20C16.866 20 20 16.866 20 13Z" stroke="#BAC4D5" strokeWidth="2"/>
    </svg>
  );

  // email helpers
  const initialPrimaryEmailRef = useRef<string | null>(null);
  const emailCheckTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Track original data for change detection
  const [originalData, setOriginalData] = useState<{
    companyName: string;
    customerName: string;
    companyType: string;
    accountDetails: AccountDetailsData | null;
  } | null>(null);

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

    const id = (draftCustomer as any).customerId ?? (draftCustomer as any).id ?? null;
    if (id != null) setCustomerId(id);

    setIsDraft(true);
    initialPrimaryEmailRef.current = draftCustomer.primaryEmail ?? "";

    setOriginalData({
      companyName: draftCustomer.companyName ?? "",
      customerName: draftCustomer.customerName ?? "",
      companyType: draftCustomer.companyType ?? "",
      accountDetails: acc,
    });
  }, [draftCustomer]);

  useEffect(() => {
    const n = { ...errors };
    if (companyName.trim()) delete n.companyName;
    if (customerName.trim()) delete n.customerName;
    if (companyType.trim()) delete n.companyType;
    setErrors(n);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyName, customerName, companyType]);

  // email uniqueness
  const checkEmailUniqueness = useCallback(
    async (email: string) => {
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;

      const normalized = email.trim().toLowerCase();
      const initial = (initialPrimaryEmailRef.current ?? "").toLowerCase();

      if (isDraft && normalized === initial) {
        setAccountErrors((prev) => {
          const n = { ...prev };
          delete n.primaryEmail;
          return n;
        });
        return;
      }

      try {
        const exists = await checkEmailExists(
          email,
          isDraft ? customerId ?? undefined : undefined
        );

        if (exists) {
          setAccountErrors((prev) => ({
            ...prev,
            primaryEmail: "This email address is already registered",
          }));
        } else {
          setAccountErrors((prev) => {
            const n = { ...prev };
            delete n.primaryEmail;
            return n;
          });
        }
      } catch {
        /* ignore */
      }
    },
    [isDraft, customerId]
  );

  const handleEmailBlur = useCallback(
    async (email: string) => {
      await checkEmailUniqueness(email);
    },
    [checkEmailUniqueness]
  );

  useEffect(() => {
    if (emailCheckTimeoutRef.current) clearTimeout(emailCheckTimeoutRef.current);

    const email = accountDetails?.primaryEmail?.trim() ?? "";
    const normalized = email.toLowerCase();
    const initial = (initialPrimaryEmailRef.current ?? "").toLowerCase();

    const shouldCheck =
      !!email &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+\.[^\s@]+$/.test(email) === false
        ? false
        : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
          (!isDraft || normalized !== initial);

    if (shouldCheck) {
      emailCheckTimeoutRef.current = setTimeout(
        () => checkEmailUniqueness(email),
        500
      );
    }

    return () => {
      if (emailCheckTimeoutRef.current)
        clearTimeout(emailCheckTimeoutRef.current);
    };
  }, [accountDetails?.primaryEmail, isDraft, checkEmailUniqueness]);

  useEffect(() => {
    if (!accountDetails) return;

    const n = { ...accountErrors };
    const clear = (k: keyof AccountDetailsData, keyInErr: string) => {
      // @ts-ignore
      if (accountDetails[k]?.trim && accountDetails[k].trim() && n[keyInErr])
        delete n[keyInErr];
    };

    [
      "phoneNumber",
      "primaryEmail",
      "billingAddressLine1",
      "billingCity",
      "billingState",
      "billingPostalCode",
      "billingCountry",
      "customerAddressLine1",
      "customerCity",
      "customerState",
      "customerPostalCode",
      "customerCountry",
    ].forEach((k) => clear(k as any, k));

    setAccountErrors(n);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountDetails]);

  const gotoStep = (index: number) => setCurrentStep(index);

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

      if (!accountDetails?.phoneNumber?.trim())
        n.phoneNumber = "Phone Number is required";

      if (!email) n.primaryEmail = "Primary Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        n.primaryEmail = "Enter a valid email address";
      else {
        try {
          const normalized = email.toLowerCase();
          const initial = (initialPrimaryEmailRef.current ?? "").toLowerCase();
          if (!isDraft || normalized !== initial) {
            const exists = await checkEmailExists(
              email,
              isDraft ? customerId ?? undefined : undefined
            );
            if (exists) n.primaryEmail = "This email address is already registered";
          }
        } catch {
          /* ignore */
        }
      }

      [
        "billingAddressLine1",
        "billingCity",
        "billingState",
        "billingPostalCode",
        "billingCountry",
      ].forEach((k) => {
        // @ts-ignore
        if (!accountDetails?.[k]?.trim())
          n[k] = `${k.replace(/([A-Z])/g, " $1")} is required`;
      });

      if (!accountDetails?.billingSameAsCustomer) {
        [
          "customerAddressLine1",
          "customerCity",
          "customerState",
          "customerPostalCode",
          "customerCountry",
        ].forEach((k) => {
          // @ts-ignore
          if (!accountDetails?.[k]?.trim())
            n[k] = `${k.replace(/([A-Z])/g, " $1")} is required`;
        });
      }

      setAccountErrors(n);
      return Object.keys(n).length === 0;
    }

    return true;
  };

  const handleStepClick = async (index: number) => {
    if (index === currentStep) return;

    if (index < currentStep) {
      gotoStep(index);
      return;
    }

    if (index === 2 && isReviewLocked) return;

    // Only validate for Review & Confirm step (index 2)
    if (index === 2 && hasAnyRequiredInput) {
      for (let i = 0; i < index; i += 1) {
        const ok = await validateStep(i);
        if (!ok) {
          gotoStep(i);
          return;
        }
      }
      
      // Call API when navigating via sidebar to Review & Confirm
      await handleSaveDraft();
    }

    if (index === 1) setAccountErrors({});

    gotoStep(index);
  };

  const handleNext = async () => {
    if (currentStep === 1 && isBillingLocked) return;
    if (currentStep === 2 && isReviewLocked) return;

    if (!(await validateStep(currentStep))) return;

    if (currentStep === steps.length - 1) {
      await handleCreateCustomer();
    } else {
      setCurrentStep((s) => s + 1);
    }
  };

  const buildRequestBlob = (payload: any) =>
    new Blob([JSON.stringify(payload)], { type: "application/json" });

  const handleCreateCustomer = async () => {
    if (!accountDetails) return;

    const payload = {
      companyName,
      customerName,
      companyType,
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
      setErrors((prev) => {
        const n = { ...prev };
        delete n.form;
        return n;
      });

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
      setErrors((prev) => ({
        ...prev,
        form: "Failed to create customer. Please check required fields and try again.",
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    setDraftSaved(false);

    const nz = (v?: string | null) =>
      typeof v === "string" ? v.trim() || null : v ?? null;

    const cleanPhone = (() => {
      const raw = nz(accountDetails?.phoneNumber);
      if (!raw) return null;
      const cleaned = raw.replace(/[^0-9+]/g, "");
      return cleaned.startsWith("+")
        ? "+" + cleaned.slice(1).replace(/[^0-9]/g, "")
        : cleaned.replace(/[^0-9]/g, "");
    })();

    const payload = {
      companyName: nz(companyName),
      customerName: nz(customerName),
      companyType: nz(companyType),
      phoneNumber: cleanPhone,
      primaryEmail: nz(accountDetails?.primaryEmail),
      additionalEmailRecipients: accountDetails?.additionalEmailRecipients?.length
        ? accountDetails.additionalEmailRecipients
        : null,
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
      billingCountry: nz(accountDetails?.billingCountry),
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
        if (id) {
          setCustomerId(id);
          setIsDraft(true);
        }
      }
      setDraftSaved(true);
      setTimeout(() => setDraftSaved(false), 3000);
    } catch (e) {
      console.error("Error saving draft:", e);
    } finally {
      setIsSavingDraft(false);
    }
  };

  const saveDraftThenClose = async () => {
    await handleSaveDraft();
    setShowSaveDraftModal(false);
    onClose();
  };

  const discardAndClose = async () => {
    try {
      if (customerId != null) await deleteCustomer(customerId);
    } catch (e) {
      console.error("Error deleting draft:", e);
    } finally {
      setShowSaveDraftModal(false);
      onClose();
    }
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

  const hasUserMadeChanges = useMemo(() => {
    if (!originalData) return hasAnyRequiredInput;

    return (
      originalData.companyName !== companyName ||
      originalData.customerName !== customerName ||
      originalData.companyType !== companyType ||
      companyLogo !== null ||
      JSON.stringify(originalData.accountDetails) !== JSON.stringify(accountDetails)
    );
  }, [
    originalData,
    companyName,
    customerName,
    companyType,
    companyLogo,
    accountDetails,
    hasAnyRequiredInput,
  ]);

  useEffect(() => {
    if (hasUserMadeChanges && !hasEverBeenEnabled) setHasEverBeenEnabled(true);
  }, [hasUserMadeChanges, hasEverBeenEnabled]);

  const topActionsDisabled = !hasEverBeenEnabled;

  const clearLogoError = () => {
    if (errors.companyLogo) {
      setErrors((prev) => ({ ...prev, companyLogo: "" }));
    }
  };

  return (
    <>
      <TopBar
        title="Create New Customer"
        onBack={() => {
          const userMadeChanges = originalData
            ? originalData.companyName !== companyName ||
              originalData.customerName !== customerName ||
              originalData.companyType !== companyType ||
              companyLogo !== null ||
              JSON.stringify(originalData.accountDetails) !==
                JSON.stringify(accountDetails)
            : hasAnyRequiredInput;

          if (userMadeChanges) setShowSaveDraftModal(true);
          else onClose();
        }}
        cancel={{
          onClick: () => setShowDeleteModal(true),
          disabled: topActionsDisabled,
        }}
        save={{
          label: draftSaved ? "Saved!" : "Save as Draft",
          saving: isSavingDraft,
          saved: draftSaved,
          disabled: isSubmitting || topActionsDisabled,
          onClick: handleSaveDraft,
        }}
      />

      <CreateFormShell
        rail={
          <nav className="met-np-steps">
            {steps.map((step, i) => {
              // Icon logic: Ring icon until step is completed AND user has moved past it
              const showRingIcon =
                (i === 0 && (currentStep === 0 || !isStep0Completed)) ||
                (i === 1 && currentStep >= 1 && Boolean(isStep0Completed) && !isBillingComplete) ||
                (i === 2 && currentStep === 2);

              // Title styling: Only current step shows active color
              const isActiveStep = i === currentStep;

              // Step 0 completed (checkmark) only after moving past it
              // Step 1 completed only after moving past it
              const isCompleted =
                (i === 0 && Boolean(isStep0Completed) && currentStep > 0) ||
                (i === 1 && isBillingComplete && currentStep > 1);

              // Step 1 locked until Step 0 completed OR still on Step 0, Step 2 locked until both completed
              const isLocked =
                (i === 1 && currentStep === 0) || (i === 2 && isReviewLocked);

              const isUnlocked = !isLocked && !isCompleted && !showRingIcon;

              const showConnector = i < steps.length - 1;

              return (
                <button
                  key={step.id}
                  type="button"
                  className={[
                    "met-np-step",
                    isActiveStep ? "active" : "",
                    isCompleted ? "completed" : "",
                    isLocked ? "locked" : "",
                  ]
                    .join(" ")
                    .trim()}
                  onClick={() => void handleStepClick(i)}
                  disabled={i === 2 && isReviewLocked}
                >
                  <span className="met-np-step__bullet" aria-hidden="true">
                    <span className="met-np-step__icon">
                      {showRingIcon ? (
                        <ActiveRingIcon />
                      ) : isCompleted ? (
                        <CompletedIcon />
                      ) : isUnlocked ? (
                        <UnlockedIcon />
                      ) : (
                        <StepLockIcon />
                      )}
                    </span>

                    {showConnector && <span className="met-np-step__connector" />}
                  </span>

                  <span className="met-np-step__text">
                    <span className="met-np-step__title">{step.title}</span>
                    <span className="met-np-step__desc">{step.desc}</span>
                  </span>
                </button>
              );
            })}
          </nav>
        }
        title={
          activeTab === "general"
            ? "CUSTOMER DETAILS"
            : activeTab === "billing"
            ? "ACCOUNT DETAILS"
            : "REVIEW & CONFIRM"
        }
        locked={activeTab === "billing" ? isBillingLocked : activeTab === "review" ? isReviewLocked : false}
        footerLeft={
          activeTab === "general" ? null : activeTab === "billing" ? (
            <SecondaryButton type="button" onClick={() => setCurrentStep(0)}>
              Back
            </SecondaryButton>
          ) : isReviewLocked ? null : (
            <SecondaryButton type="button" onClick={() => setCurrentStep(1)}>
              Back
            </SecondaryButton>
          )
        }
        footerHint={
          (activeTab === "billing" && isBillingLocked) || (activeTab === "review" && isReviewLocked)
            ? "Complete the previous steps to unlock this step"
            : undefined
        }
        footerRight={
          activeTab === "general" ? (
            <PrimaryButton
              type="button"
              onClick={handleNext}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save & Next"}
            </PrimaryButton>
          ) : activeTab === "billing" ? (
            <PrimaryButton
              type="button"
              onClick={handleNext}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save & Next"}
            </PrimaryButton>
          ) : isReviewLocked ? null : (
            <PrimaryButton
              type="button"
              onClick={handleNext}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Create Customer"}
            </PrimaryButton>
          )
        }
      >
        <form className="met-np-form" onSubmit={(e) => e.preventDefault()}>
          <div className="met-np-form-section">
                      {/* STEP 1: GENERAL */}
                      {activeTab === "general" && (
                        <section>
                          <div className="met-np-grid-2">
                            <InputField
                              label="Customer Name"
                              value={customerName}
                              placeholder="eg., John Doe"
                              onChange={(v: any) => {
                                setCustomerName(v?.target ? v.target.value : v);
                                clearLogoError();
                              }}
                              onFocus={() => {
                                if (errors.customerName) {
                                  setErrors((prev) => ({ ...prev, customerName: "" }));
                                }
                              }}
                              error={errors.customerName}
                              required
                            />

                            <InputField
                              label="Company Name"
                              value={companyName}
                              placeholder="eg., ABC Company"
                              onChange={(v: any) => {
                                setCompanyName(v?.target ? v.target.value : v);
                                clearLogoError();
                              }}
                              onFocus={() => {
                                if (errors.companyName) {
                                  setErrors((prev) => ({ ...prev, companyName: "" }));
                                }
                              }}
                              error={errors.companyName}
                              required
                            />

                            <div className="met-np-field">
                              <label className="company-logo-label">Company Logo</label>
                              <LogoUploader
                                logo={companyLogo}
                                logoUrl={initialLogoUrl}
                                onChange={(file: File | null) => setCompanyLogo(file)}
                                error={errors.companyLogo}
                                onError={(error: string) =>
                                  setErrors((prev) => ({ ...prev, companyLogo: error }))
                                }
                              />
                            </div>

                            <DropdownField
                              label="Company Type"
                              value={companyType}
                              onChange={(v: string) => {
                                setCompanyType(v);
                                clearLogoError();
                              }}
                              placeholder="Company Type"
                              error={errors.companyType}
                              required
                              options={[
                                { value: "INDIVIDUAL", label: "Individual" },
                                { value: "BUSINESS", label: "Business" },
                              ]}
                            />
                          </div>
                        </section>
                      )}

                      {/* STEP 2: BILLING */}
                      {activeTab === "billing" && (
                        <section>
                          <AccountDetailsForm
                            data={accountDetails ?? undefined}
                            onChange={(d: AccountDetailsData) => {
                              setAccountDetails(d);
                              if (draftSaved) setDraftSaved(false);
                            }}
                            errors={accountErrors}
                            onEmailBlur={handleEmailBlur}
                            currentCustomerId={customerId ?? undefined}
                            isDraft={isDraft}
                            initialPrimaryEmail={initialPrimaryEmailRef.current ?? undefined}
                            locked={isBillingLocked}
                            onClearLogoError={clearLogoError}
                            onClearFieldError={(fieldName: string) => {
                              setAccountErrors((prev) => ({ ...prev, [fieldName]: "" }));
                            }}
                          />
                        </section>
                      )}

                      {/* STEP 3: REVIEW */}
                      {activeTab === "review" && (
                        <section>
                          <CustomerReview
                            customerName={customerName}
                            companyName={companyName}
                            companyType={companyType}
                            accountDetails={accountDetails}
                          />
                        </section>
                      )}
                    </div>

                    {/* FOOTER */}
                    <div className="metform-footer" style={{ position: "relative" }}>
                      {errors.form && (
                        <div className="met-met-np-error-message">{errors.form}</div>
                      )}

                      
                      {activeTab === "review" && (
                        <>
                          {isReviewLocked && (
                            <div
                              className="met-np-footer-hint"
                              style={{
                                position: "absolute",
                                left: "50%",
                                bottom: "20px",
                                transform: "translateX(-50%)",
                                color: "#8C8F96",
                                fontSize: 14,
                                pointerEvents: "none",
                                whiteSpace: "nowrap",
                              }}
                            >
                              Complete the previous steps to unlock this step
                            </div>
                          )}
                        </>
                      )}
          </div>
        </form>
      </CreateFormShell>

      {/* Save Draft dialog */}
      <SaveDraft
        isOpen={showSaveDraftModal}
        onClose={() => setShowSaveDraftModal(false)}
        onSave={saveDraftThenClose}
        onDelete={discardAndClose}
      />

      {/* Delete modal */}
      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        productName={(customerName || companyName || "this customer").trim()}
        entityType="customer"
        isDiscardMode={true}
        onConfirm={confirmDeleteTopRight}
        onCancel={() => setShowDeleteModal(false)}
        discardLabel="Keep editing"
        confirmLabel="Discard"
      />
    </>
  );
};

export default CreateCustomer;
