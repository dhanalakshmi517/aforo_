import React, { useState, useEffect } from 'react';
import './EditExtras.css';

import { saveSetupFee, saveDiscounts, saveFreemiums, saveMinimumCommitment } from '../api';
import { setRatePlanData } from '../utils/sessionStorage';

interface EditExtrasProps {
  noUpperLimit: boolean;
  ratePlanId?: number;
  /** Draft data from backend for pre-filling */
  draftData?: any;
  /** allow parent to trigger save-on-demand (Next / Save as Draft) */
  registerSaveExtras?: (fn: () => Promise<void>) => void;
}

/** —— Freemium UI ⇄ API mapping (aligned with Extras.tsx) —— */
type UIFreemiumType = 'FREE_UNITS' | 'FREE_TRIAL_DURATION' | 'FREE_UNITS_PER_DURATION' | '';

/** ✅ Use BACKEND ENUMS here (updated tokens) */
type APIFreemiumType = 'FREE_UNITS' | 'FREE_TRIAL_DURATION' | 'FREE_UNITS_PER_DURATION';

/** Accept legacy tokens but return the UI token set */
const apiToUiFreemium = (raw?: APIFreemiumType | 'FREE_TRIAL' | 'UNITS_PER_DURATION' | '' | null): UIFreemiumType => {
  const v = (raw || '').toUpperCase().trim();
  if (v === 'FREE_TRIAL_DURATION' || v === 'FREE_TRIAL') return 'FREE_TRIAL_DURATION';
  if (v === 'FREE_UNITS_PER_DURATION' || v === 'UNITS_PER_DURATION') return 'FREE_UNITS_PER_DURATION';
  if (v === 'FREE_UNITS') return 'FREE_UNITS';
  return '';
};

/** Accept legacy UI tokens but ALWAYS output the BACKEND enum */
const uiToApiFreemium = (raw?: UIFreemiumType | '' | null): APIFreemiumType => {
  const v = (raw || '').toUpperCase().trim();
  if (v === 'FREE_TRIAL_DURATION' || v === 'FREE_TRIAL') return 'FREE_TRIAL_DURATION';
  if (v === 'FREE_UNITS_PER_DURATION' || v === 'UNITS_PER_DURATION') return 'FREE_UNITS_PER_DURATION';
  return 'FREE_UNITS';
};

export default function EditExtras({
  noUpperLimit,
  ratePlanId,
  draftData,
  registerSaveExtras,
}: EditExtrasProps): React.JSX.Element {
  const [activeSections, setActiveSections] = useState<string[]>([]);

  // Setup fee
  const [setupFee, setSetupFee] = useState('');
  const [applicationTiming, setApplicationTiming] = useState('');
  const [invoiceDescription, setInvoiceDescription] = useState('');

  // Discounts
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FLAT' | ''>('');
  const [percentageDiscount, setPercentageDiscount] = useState('');
  const [flatDiscountAmount, setFlatDiscountAmount] = useState('');
  const [eligibility, setEligibility] = useState('');
  const [discountStart, setDiscountStart] = useState('');
  const [discountEnd, setDiscountEnd] = useState('');

  // Freemium (UI type & fields)
  const [freemiumType, setFreemiumType] = useState<UIFreemiumType>('');
  const [freeUnits, setFreeUnits] = useState('');
  const [freeTrialDuration, setFreeTrialDuration] = useState('');
  const [freeStart, setFreeStart] = useState('');
  const [freeEnd, setFreeEnd] = useState('');

  // Minimum commitment
  const [minimumUsage, setMinimumUsage] = useState('');
  const [minimumCharge, setMinimumCharge] = useState('');

  // Validation errors
  const [validationErrors, setValidationErrors] = useState({
    discountPercentage: '',
    discountStartDate: '',
    discountEndDate: '',
    freemiumStartDate: '',
    freemiumEndDate: '',
    freemiumDateRange: '',
  });

  // Validation helper functions
  const validatePercentage = (value: string): string => {
    const num = Number(value);
    if (value && (isNaN(num) || num < 0)) {
      return 'Percentage must be a positive number';
    }
    if (num > 100) {
      return 'Percentage cannot exceed 100';
    }
    return '';
  };

  const validateDate = (dateStr: string): string => {
    if (!dateStr) return '';
    const selectedDate = new Date(dateStr);
    const today = new Date();
    const maxDate = new Date();
    maxDate.setFullYear(today.getFullYear() + 50);

    if (selectedDate > maxDate) {
      return 'Date cannot be more than 50 years in the future';
    }
    return '';
  };

  const validateFreemiumDateRange = (startDate: string, endDate: string, trialDuration: number): string => {
    if (!startDate || !endDate || !trialDuration) return '';

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Calculate difference in days
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays !== trialDuration) {
      return `Date range must be exactly ${trialDuration} days (currently ${diffDays} days)`;
    }

    return '';
  };

  // Initialize from backend data (prefill)
  useEffect(() => {
    console.log('EditExtras - draftData changed:', draftData);
    if (!draftData) return;

    const sections: string[] = [];

    // Setup Fee
    if (draftData.setupFee) {
      const setup = draftData.setupFee;
      setSetupFee(String(setup.setupFee ?? ''));
      setApplicationTiming(String(setup.applicationTiming ?? ''));
      setInvoiceDescription(setup.invoiceDescription ?? '');
      setRatePlanData('SETUP_FEE', String(setup.setupFee ?? ''));
      setRatePlanData('SETUP_APPLICATION_TIMING', String(setup.applicationTiming ?? ''));
      setRatePlanData('SETUP_INVOICE_DESC', setup.invoiceDescription ?? '');
      sections.push('setupFee');
    }

    // Discounts
    if (draftData.discount) {
      const disc = draftData.discount;
      setDiscountType((disc.discountType as 'PERCENTAGE' | 'FLAT') ?? '');
      setPercentageDiscount(String(disc.percentageDiscount ?? ''));
      setFlatDiscountAmount(String(disc.flatDiscountAmount ?? ''));
      setEligibility(disc.eligibility ?? '');
      setDiscountStart(disc.startDate ?? '');
      setDiscountEnd(disc.endDate ?? '');

      // store both key styles for compatibility
      setRatePlanData('DISCOUNT_TYPE', (disc.discountType as string) ?? '');
      setRatePlanData('DISCOUNT_PERCENT', String(disc.percentageDiscount ?? ''));
      setRatePlanData('PERCENTAGE_DISCOUNT', String(disc.percentageDiscount ?? ''));
      setRatePlanData('DISCOUNT_FLAT', String(disc.flatDiscountAmount ?? ''));
      setRatePlanData('FLAT_DISCOUNT_AMOUNT', String(disc.flatDiscountAmount ?? ''));
      setRatePlanData('ELIGIBILITY', disc.eligibility ?? '');
      setRatePlanData('DISCOUNT_START', disc.startDate ?? '');
      setRatePlanData('DISCOUNT_END', disc.endDate ?? '');
      sections.push('discounts');
    }

    // Freemium
    if (draftData.freemium) {
      const free = draftData.freemium;
      const uiType = apiToUiFreemium(free.freemiumType as any);
      setFreemiumType(uiType); // ✅ now recognizes FREE_TRIAL_DURATION / FREE_UNITS_PER_DURATION
      setFreeUnits(String(free.freeUnits ?? ''));
      setFreeTrialDuration(String(free.freeTrialDuration ?? ''));
      setFreeStart(free.startDate ?? '');
      setFreeEnd(free.endDate ?? '');

      // persist UI type like Extras does
      setRatePlanData('FREEMIUM_TYPE', uiType);
      setRatePlanData('FREEMIUM_UNITS', String(free.freeUnits ?? ''));
      setRatePlanData('FREE_UNITS', String(free.freeUnits ?? ''));
      setRatePlanData('FREE_TRIAL_DURATION', String(free.freeTrialDuration ?? ''));
      setRatePlanData('FREEMIUM_START', free.startDate ?? '');
      setRatePlanData('FREEMIUM_END', free.endDate ?? '');
      sections.push('freemium');
    }

    // Minimum Commitment (treat 0 as "empty")
    if (draftData.minimumCommitment) {
      const min = draftData.minimumCommitment;
      const usageStr = min.minimumUsage && Number(min.minimumUsage) > 0 ? String(min.minimumUsage) : '';
      const chargeStr = min.minimumCharge && Number(min.minimumCharge) > 0 ? String(min.minimumCharge) : '';
      setMinimumUsage(usageStr);
      setMinimumCharge(chargeStr);
      setRatePlanData('MINIMUM_USAGE', usageStr);
      setRatePlanData('MINIMUM_CHARGE', chargeStr);
      sections.push('commitment');
    }

    if (sections.length > 0) setActiveSections(sections);
  }, [draftData]);

  const toggleSection = (section: string) => {
    setActiveSections(prev =>
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  // === saver exposed to parent ===
  const handleSaveExtras = async () => {
    if (!ratePlanId) return;

    // Validate before saving
    let hasErrors = false;

    // Validate discount percentage
    if (discountType === 'PERCENTAGE' && percentageDiscount) {
      const percentError = validatePercentage(percentageDiscount);
      if (percentError) {
        setValidationErrors(prev => ({ ...prev, discountPercentage: percentError }));
        hasErrors = true;
      }
    }

    // Validate discount dates
    if (discountStart) {
      const startError = validateDate(discountStart);
      if (startError) {
        setValidationErrors(prev => ({ ...prev, discountStartDate: startError }));
        hasErrors = true;
      }
    }
    if (discountEnd) {
      const endError = validateDate(discountEnd);
      if (endError) {
        setValidationErrors(prev => ({ ...prev, discountEndDate: endError }));
        hasErrors = true;
      }
    }

    // Validate freemium dates
    if (freeStart) {
      const startError = validateDate(freeStart);
      if (startError) {
        setValidationErrors(prev => ({ ...prev, freemiumStartDate: startError }));
        hasErrors = true;
      }
    }
    if (freeEnd) {
      const endError = validateDate(freeEnd);
      if (endError) {
        setValidationErrors(prev => ({ ...prev, freemiumEndDate: endError }));
        hasErrors = true;
      }
    }

    // Validate freemium date range matches trial duration
    if ((freemiumType === 'FREE_TRIAL_DURATION' || freemiumType === 'FREE_UNITS_PER_DURATION') &&
      freeTrialDuration && Number(freeTrialDuration) > 0 &&
      freeStart && freeEnd) {
      const rangeError = validateFreemiumDateRange(freeStart, freeEnd, Number(freeTrialDuration));
      if (rangeError) {
        setValidationErrors(prev => ({ ...prev, freemiumDateRange: rangeError }));
        hasErrors = true;
      }
    }

    if (hasErrors) {
      throw new Error('Validation errors present. Please fix them before saving.');
    }

    try {
      // Setup Fee
      if (setupFee) {
        await saveSetupFee(ratePlanId, {
          setupFee: Number(setupFee),
          applicationTiming: Number(applicationTiming || 0),
          invoiceDescription,
        });
      }

      // Discounts — clean payload + session keys (clear opposite)
      if (discountType) {
        const percentVal = Number(percentageDiscount || 0);
        const flatVal = Number(flatDiscountAmount || 0);

        // session consistency
        setRatePlanData('DISCOUNT_TYPE', discountType);
        if (discountType === 'PERCENTAGE') {
          setRatePlanData('DISCOUNT_PERCENT', percentVal ? String(percentVal) : '');
          setRatePlanData('PERCENTAGE_DISCOUNT', percentVal ? String(percentVal) : '');
          setRatePlanData('DISCOUNT_FLAT', '');
          setRatePlanData('FLAT_DISCOUNT_AMOUNT', '');
        } else {
          setRatePlanData('DISCOUNT_FLAT', flatVal ? String(flatVal) : '');
          setRatePlanData('FLAT_DISCOUNT_AMOUNT', flatVal ? String(flatVal) : '');
          setRatePlanData('DISCOUNT_PERCENT', '');
          setRatePlanData('PERCENTAGE_DISCOUNT', '');
        }
        setRatePlanData('ELIGIBILITY', eligibility);
        setRatePlanData('DISCOUNT_START', discountStart);
        setRatePlanData('DISCOUNT_END', discountEnd);

        await saveDiscounts(ratePlanId, {
          discountType: discountType as any,
          percentageDiscount: discountType === 'PERCENTAGE' ? Number(percentageDiscount || 0) : 0,
          flatDiscountAmount: discountType === 'FLAT' ? Number(flatDiscountAmount || 0) : 0,
          eligibility,
          startDate: discountStart,
          endDate: discountEnd,
        });
      }

      // Freemium — map UI → API (new enums) and only send applicable fields
      if (freemiumType) {
        const apiType = uiToApiFreemium(freemiumType);

        const freeUnitsNum = Number(freeUnits || 0);
        const freeTrialNum = Number(freeTrialDuration || 0);

        // skip invalid/empty combos
        if (apiType === 'FREE_UNITS' && freeUnitsNum <= 0) {
          // no-op
        } else if (apiType === 'FREE_TRIAL_DURATION' && freeTrialNum <= 0) {
          // no-op
        } else if (apiType === 'FREE_UNITS_PER_DURATION' && (freeUnitsNum <= 0 || freeTrialNum <= 0)) {
          // no-op
        } else {
          const cleanPayload: {
            freemiumType: APIFreemiumType;
            freeUnits: number;
            freeTrialDuration: number;
            startDate: string;
            endDate: string;
          } = {
            freemiumType: apiType,
            freeUnits: 0,
            freeTrialDuration: 0,
            startDate: freeStart,
            endDate: freeEnd,
          };

          if (apiType === 'FREE_UNITS') {
            cleanPayload.freeUnits = freeUnitsNum;
          } else if (apiType === 'FREE_TRIAL_DURATION') {
            cleanPayload.freeTrialDuration = freeTrialNum;
          } else { // FREE_UNITS_PER_DURATION
            cleanPayload.freeUnits = freeUnitsNum;
            cleanPayload.freeTrialDuration = freeTrialNum;
          }

          // persist UI-side values for navigation continuity
          setRatePlanData('FREEMIUM_TYPE', freemiumType);
          setRatePlanData('FREEMIUM_UNITS', cleanPayload.freeUnits ? String(cleanPayload.freeUnits) : '');
          setRatePlanData('FREE_UNITS', cleanPayload.freeUnits ? String(cleanPayload.freeUnits) : '');
          setRatePlanData('FREE_TRIAL_DURATION', cleanPayload.freeTrialDuration ? String(cleanPayload.freeTrialDuration) : '');
          setRatePlanData('FREEMIUM_START', freeStart);
          setRatePlanData('FREEMIUM_END', freeEnd);

          await saveFreemiums(ratePlanId, cleanPayload as any);
        }
      }

      // Minimum Commitment — only send if a numeric value > 0 exists
      const minUsageNum = Number(minimumUsage || 0);
      const minChargeNum = Number(minimumCharge || 0);
      if (minUsageNum > 0 || minChargeNum > 0) {
        setRatePlanData('MINIMUM_USAGE', minUsageNum > 0 ? String(minUsageNum) : '');
        setRatePlanData('MINIMUM_CHARGE', minChargeNum > 0 ? String(minChargeNum) : '');
        await saveMinimumCommitment(ratePlanId, {
          minimumUsage: minUsageNum > 0 ? minUsageNum : 0,
          minimumCharge: minChargeNum > 0 ? minChargeNum : 0,
        });
      }

      console.log('✅ Extras saved');
    } catch (err: any) {
      console.error('Failed to save extras', err);
      throw err;
    }
  };

  useEffect(() => {
    if (registerSaveExtras) {
      registerSaveExtras(() => handleSaveExtras());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    registerSaveExtras,
    ratePlanId,
    minimumUsage, minimumCharge,
    setupFee, applicationTiming, invoiceDescription,
    discountType, percentageDiscount, flatDiscountAmount, eligibility, discountStart, discountEnd,
    freemiumType, freeUnits, freeTrialDuration, freeStart, freeEnd
  ]);

  /** Icons (same style as Extras) */
  const iconMap: Record<string, React.JSX.Element> = {
    setupFee: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M14.6994 6.30022C14.5161 6.48715 14.4135 6.73847 14.4135 7.00022C14.4135 7.26198 14.5161 7.51329 14.6994 7.70022L16.2994 9.30022C16.4863 9.48345 16.7376 9.58608 16.9994 9.58608C17.2611 9.58608 17.5124 9.48345 17.6994 9.30022L21.4694 5.53022C21.9722 6.64141 22.1244 7.87946 21.9058 9.07937C21.6872 10.2793 21.1081 11.3841 20.2456 12.2465C19.3832 13.1089 18.2784 13.6881 17.0785 13.9067C15.8786 14.1253 14.6406 13.9731 13.5294 13.4702L6.61937 20.3802C6.22154 20.778 5.68198 21.0015 5.11937 21.0015C4.55676 21.0015 4.01719 20.778 3.61937 20.3802C3.22154 19.9824 2.99805 19.4428 2.99805 18.8802C2.99805 18.3176 3.22154 17.778 3.61937 17.3802L10.5294 10.4702C10.0265 9.35904 9.87428 8.12099 10.0929 6.92108C10.3115 5.72117 10.8907 4.61638 11.7531 3.75395C12.6155 2.89151 13.7203 2.31239 14.9202 2.09377C16.1201 1.87514 17.3582 2.02739 18.4694 2.53022L14.6994 6.30022Z" stroke="#D59026" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    discounts: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M15 9L9 15M9 9H9.01M15 15H15.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="#D59026" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    freemium: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 7.99995V20.9999M12 7.99995C11.6383 6.50935 11.0154 5.23501 10.2127 4.34311C9.41003 3.45121 8.46469 2.98314 7.5 2.99995C6.83696 2.99995 6.20107 3.26334 5.73223 3.73218C5.26339 4.20102 5 4.83691 5 5.49995C5 6.16299 5.26339 6.79887 5.73223 7.26772C6.20107 7.73656 6.83696 7.99995 7.5 7.99995M12 7.99995C12.3617 6.50935 12.9846 5.23501 13.7873 4.34311C14.59 3.45121 15.5353 2.98314 16.5 2.99995C17.163 2.99995 17.7989 3.26334 18.2678 3.73218C18.7366 4.20102 19 4.83691 19 5.49995C19 6.16299 18.7366 6.79887 18.2678 7.26772C17.7989 7.73656 17.163 7.99995 16.5 7.99995M19 11.9999V18.9999C19 19.5304 18.7893 20.0391 18.4142 20.4142C18.0391 20.7892 17.5304 20.9999 17 20.9999H7C6.46957 20.9999 5.96086 20.7892 5.58579 20.4142C5.21071 20.0391 5 19.5304 5 18.9999V11.9999M4 7.99995H20C20.5523 7.99995 21 8.44766 21 8.99995V10.9999C21 11.5522 20.5523 11.9999 20 11.9999H4C3.44772 11.9999 3 11.5522 3 10.9999V8.99995C3 8.44766 3.44772 7.99995 4 7.99995Z" stroke="#D59026" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    commitment: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M9 12H15M20 13C20 18 16.5 20.5 12.34 21.95C12.1222 22.0238 11.8855 22.0202 11.67 21.94C7.5 20.5 4 18 4 13V5.99996C4 5.73474 4.10536 5.48039 4.29289 5.29285C4.48043 5.10532 4.73478 4.99996 5 4.99996C7 4.99996 9.5 3.79996 11.24 2.27996C11.4519 2.09896 11.7214 1.99951 12 1.99951C12.2786 1.99951 12.5481 2.09896 12.76 2.27996C14.51 3.80996 17 4.99996 19 4.99996C19.2652 4.99996 19.5196 5.10532 19.7071 5.29285C19.8946 5.48039 20 5.73474 20 5.99996V13Z" stroke="#D59026" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  };

  // convenience booleans to determine lock state (0 does NOT lock)
  const hasUsage = Number(minimumUsage) > 0;
  const hasCharge = Number(minimumCharge) > 0;

  const renderHeader = (label: string, section: string): React.JSX.Element => (
    <div className="section-header" onClick={() => toggleSection(section)}>
      <button type="button" className="extras-icon-btn" aria-label={`${label} icon`}>
        {iconMap[section]}
      </button>
      <span className="header-label">{label}</span>
      <span className="dropdown-icon">
        {activeSections.includes(section) ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M15 12.5L10 7.5L5 12.5" stroke="#2B7194" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M5 7.5L10 12.5L15 7.5" stroke="#2B7194" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
    </div>
  );

  return (
    <div className="extras-container">
      {/* Setup Fee */}
      <div className="section">
        {renderHeader('Setup Fee (Optional)', 'setupFee')}
        <div className="description-row">
          <p className="description">Charge a one-time fee when the customer starts this plan.</p>
          <button className="icon-btn" aria-label="Add setup fee action" />
        </div>
        {activeSections.includes('setupFee') && (
          <div className="section-content">
            <label>
              Enter one-time Setup Fee <span className="optional">(optional)</span>
            </label>
            <input
              type="number"
              placeholder="$22"
              value={setupFee}
              onChange={e => {
                setSetupFee(e.target.value);
                setRatePlanData('SETUP_FEE', e.target.value);
              }}
            />
            <label>Application Timing</label>
            <input
              type="number"
              placeholder="Timing code"
              value={applicationTiming}
              onChange={e => {
                setApplicationTiming(e.target.value);
                setRatePlanData('SETUP_APPLICATION_TIMING', e.target.value);
              }}
            />
            <label>Invoice Description</label>
            <textarea
              placeholder="Invoice Description"
              value={invoiceDescription}
              onChange={e => {
                setInvoiceDescription(e.target.value);
                setRatePlanData('SETUP_INVOICE_DESC', e.target.value);
              }}
            />
          </div>
        )}
      </div>

      {/* Discounts */}
      <div className="section">
        {renderHeader('Discounts', 'discounts')}
        <div className="description-row">
          <p className="description">Add time-bound or recurring discounts to attract or retain users.</p>
          <button className="icon-btn" aria-label="Add discount action" />
        </div>
        {activeSections.includes('discounts') && (
          <div className="section-content">
            <label>Discount Type</label>
            <select
              value={discountType}
              onChange={e => {
                const value = e.target.value as 'PERCENTAGE' | 'FLAT' | '';
                setDiscountType(value);
                setRatePlanData('DISCOUNT_TYPE', value);

                // clear opposite field to avoid stale values
                if (value === 'PERCENTAGE') {
                  setFlatDiscountAmount('');
                  setRatePlanData('DISCOUNT_FLAT', '');
                  setRatePlanData('FLAT_DISCOUNT_AMOUNT', '');
                } else if (value === 'FLAT') {
                  setPercentageDiscount('');
                  setRatePlanData('DISCOUNT_PERCENT', '');
                  setRatePlanData('PERCENTAGE_DISCOUNT', '');
                } else {
                  setPercentageDiscount('');
                  setFlatDiscountAmount('');
                  setRatePlanData('DISCOUNT_PERCENT', '');
                  setRatePlanData('PERCENTAGE_DISCOUNT', '');
                  setRatePlanData('DISCOUNT_FLAT', '');
                  setRatePlanData('FLAT_DISCOUNT_AMOUNT', '');
                }
              }}
            >
              <option value="">--Select--</option>
              <option value="PERCENTAGE">Recurring / One-time (Percentage)</option>
              <option value="FLAT">Flat Amount</option>
            </select>

            {/* Show only relevant field */}
            {discountType === 'PERCENTAGE' && (
              <>
                <label>Enter % discount</label>
                <input
                  type="number"
                  placeholder="10"
                  value={percentageDiscount}
                  onChange={e => {
                    setPercentageDiscount(e.target.value);
                    setRatePlanData('DISCOUNT_PERCENT', e.target.value);
                    setRatePlanData('PERCENTAGE_DISCOUNT', e.target.value);
                    const error = validatePercentage(e.target.value);
                    setValidationErrors(prev => ({ ...prev, discountPercentage: error }));
                  }}
                />
                {validationErrors.discountPercentage && (
                  <span style={{ color: '#E34935', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                    {validationErrors.discountPercentage}
                  </span>
                )}
              </>
            )}

            {discountType === 'FLAT' && (
              <>
                <label>Enter Flat Discount Amount</label>
                <input
                  type="number"
                  placeholder="50"
                  value={flatDiscountAmount}
                  onChange={e => {
                    setFlatDiscountAmount(e.target.value);
                    setRatePlanData('DISCOUNT_FLAT', e.target.value);
                    setRatePlanData('FLAT_DISCOUNT_AMOUNT', e.target.value);
                  }}
                />
              </>
            )}

            <label>Eligibility</label>
            <input
              type="text"
              placeholder="All Customers / New Customers"
              value={eligibility}
              onChange={e => {
                setEligibility(e.target.value);
                setRatePlanData('ELIGIBILITY', e.target.value);
              }}
            />

            <label>Validity Period</label>
            <div className="date-range">
              <div className="date-input">
                <label>Start Date</label>
                <input
                  type="date"
                  value={discountStart}
                  onChange={e => {
                    setDiscountStart(e.target.value);
                    setRatePlanData('DISCOUNT_START', e.target.value);
                    const error = validateDate(e.target.value);
                    setValidationErrors(prev => ({ ...prev, discountStartDate: error }));
                  }}
                />
                {validationErrors.discountStartDate && (
                  <span style={{ color: '#E34935', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                    {validationErrors.discountStartDate}
                  </span>
                )}
              </div>
              <div className="date-input">
                <label>End Date</label>
                <input
                  type="date"
                  value={discountEnd}
                  onChange={e => {
                    setDiscountEnd(e.target.value);
                    setRatePlanData('DISCOUNT_END', e.target.value);
                    const error = validateDate(e.target.value);
                    setValidationErrors(prev => ({ ...prev, discountEndDate: error }));
                  }}
                />
                {validationErrors.discountEndDate && (
                  <span style={{ color: '#E34935', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                    {validationErrors.discountEndDate}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Freemium Setup */}
      <div className="section">
        {renderHeader('Freemium Setup', 'freemium')}
        <div className="description-row">
          <p className="description">Allow limited access to features for free before switching to paid tiers.</p>
          <button className="icon-btn" aria-label="Add freemium action" />
        </div>
        {activeSections.includes('freemium') && (
          <div className="section-content">
            <label>Freemium Type</label>
            <select
              value={freemiumType}
              onChange={e => {
                const ui = (e.target.value as UIFreemiumType) || '';
                setFreemiumType(ui);
                setRatePlanData('FREEMIUM_TYPE', ui);

                // Clear irrelevant numeric fields to avoid stale values blocking save
                if (ui === 'FREE_UNITS') {
                  setFreeTrialDuration('');
                } else if (ui === 'FREE_TRIAL_DURATION') {
                  setFreeUnits('');
                }
              }}
            >
              <option value="">--Select--</option>
              <option value="FREE_UNITS">Free Units</option>
              <option value="FREE_TRIAL_DURATION">Free Trial Duration</option>
              <option value="FREE_UNITS_PER_DURATION">Free Units for Duration</option>
            </select>

            {(freemiumType === 'FREE_UNITS' || freemiumType === 'FREE_UNITS_PER_DURATION') && (
              <>
                <label>Select Free Units</label>
                <input
                  type="number"
                  placeholder="e.g., 1000"
                  value={freeUnits}
                  onChange={e => {
                    setFreeUnits(e.target.value);
                    setRatePlanData('FREEMIUM_UNITS', e.target.value);
                    setRatePlanData('FREE_UNITS', e.target.value);
                  }}
                />
              </>
            )}

            {(freemiumType === 'FREE_TRIAL_DURATION' || freemiumType === 'FREE_UNITS_PER_DURATION') && (
              <>
                <label>Select Free Trial Duration (in days)</label>
                <input
                  type="number"
                  placeholder="e.g., 14 (days)"
                  value={freeTrialDuration}
                  onChange={e => {
                    setFreeTrialDuration(e.target.value);
                    setRatePlanData('FREE_TRIAL_DURATION', e.target.value);
                    // Revalidate date range when duration changes
                    if (freeStart && freeEnd && e.target.value && Number(e.target.value) > 0) {
                      const rangeError = validateFreemiumDateRange(freeStart, freeEnd, Number(e.target.value));
                      setValidationErrors(prev => ({ ...prev, freemiumDateRange: rangeError }));
                    }
                  }}
                />
              </>
            )}

            <div className="date-range">
              <div className="date-input">
                <label>Start Date</label>
                <input
                  type="date"
                  value={freeStart}
                  onChange={e => {
                    setFreeStart(e.target.value);
                    setRatePlanData('FREEMIUM_START', e.target.value);
                    const error = validateDate(e.target.value);
                    setValidationErrors(prev => ({ ...prev, freemiumStartDate: error }));
                    // Validate date range if trial duration is set
                    if (e.target.value && freeEnd && freeTrialDuration && Number(freeTrialDuration) > 0) {
                      const rangeError = validateFreemiumDateRange(e.target.value, freeEnd, Number(freeTrialDuration));
                      setValidationErrors(prev => ({ ...prev, freemiumDateRange: rangeError }));
                    }
                  }}
                />
                {validationErrors.freemiumStartDate && (
                  <span style={{ color: '#E34935', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                    {validationErrors.freemiumStartDate}
                  </span>
                )}
              </div>
              <div className="date-input">
                <label>End Date</label>
                <input
                  type="date"
                  value={freeEnd}
                  onChange={e => {
                    setFreeEnd(e.target.value);
                    setRatePlanData('FREEMIUM_END', e.target.value);
                    const error = validateDate(e.target.value);
                    setValidationErrors(prev => ({ ...prev, freemiumEndDate: error }));
                    // Validate date range if trial duration is set
                    if (freeStart && e.target.value && freeTrialDuration && Number(freeTrialDuration) > 0) {
                      const rangeError = validateFreemiumDateRange(freeStart, e.target.value, Number(freeTrialDuration));
                      setValidationErrors(prev => ({ ...prev, freemiumDateRange: rangeError }));
                    }
                  }}
                />
                {validationErrors.freemiumEndDate && (
                  <span style={{ color: '#E34935', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                    {validationErrors.freemiumEndDate}
                  </span>
                )}
              </div>
            </div>
            {validationErrors.freemiumDateRange && (
              <span style={{ color: '#E34935', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                {validationErrors.freemiumDateRange}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Minimum Commitment */}
      <div className="section">
        {renderHeader('Minimum Commitment', 'commitment')}
        <div className="description-row">
          <p className="description">Define how customers are billed when usage exceeds the plan limits.</p>
          <button className="icon-btn" aria-label="Add commitment action" />
        </div>
        {activeSections.includes('commitment') && (
          <div className="section-content">
            <label>Minimum Usage</label>
            <input
              type="number"
              placeholder="Enter usage"
              value={minimumUsage}
              onChange={e => {
                const val = e.target.value;
                setMinimumUsage(val);
                setRatePlanData('MINIMUM_USAGE', val);
                if (Number(val) > 0) {
                  setMinimumCharge('');
                  setRatePlanData('MINIMUM_CHARGE', '');
                }
              }}
              disabled={hasCharge}
            />

            <label>Minimum Charge</label>
            <input
              type="number"
              placeholder="Enter charge"
              value={minimumCharge}
              onChange={e => {
                const val = e.target.value;
                setMinimumCharge(val);
                setRatePlanData('MINIMUM_CHARGE', val);
                if (Number(val) > 0) {
                  setMinimumUsage('');
                  setRatePlanData('MINIMUM_USAGE', '');
                }
              }}
              disabled={hasUsage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
