import React, { useState, forwardRef, useImperativeHandle, useRef } from 'react';
import {
  saveSetupFee,
  saveDiscounts,
  saveFreemiums,
  saveMinimumCommitment,
  DiscountPayload,
  FreemiumPayload,
  MinimumCommitmentPayload
} from './api';
import './Extras.css';
import { InputField, SelectField, TextareaField } from '../componenetsss/Inputs';
import { clearExtrasLocalStorage } from './utils/localStorageExtras';
import { getRatePlanData, setRatePlanData } from './utils/sessionStorage';

export interface ExtrasHandle { saveAll: (ratePlanId: number) => Promise<void>; }

interface ExtrasProps {
  ratePlanId: number | null;
  noUpperLimit: boolean;
  draftData?: any; // Draft data from backend
}

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

// 🔁 MAP: API ⇄ UI freemium type
type UIFreemiumType = 'FREE_UNITS' | 'FREE_TRIAL_DURATION' | 'FREE_UNITS_PER_DURATION';
type APIFreemiumType = 'FREE_UNITS' | 'FREE_TRIAL' | 'UNITS_PER_DURATION';

const apiToUiFreemium = (api: APIFreemiumType | '' | undefined): UIFreemiumType => {
  if (api === 'FREE_TRIAL') return 'FREE_TRIAL_DURATION';
  if (api === 'UNITS_PER_DURATION') return 'FREE_UNITS_PER_DURATION';
  return 'FREE_UNITS';
};

const uiToApiFreemium = (ui: UIFreemiumType | '' | undefined): APIFreemiumType => {
  if (ui === 'FREE_TRIAL_DURATION') return 'FREE_TRIAL';
  if (ui === 'FREE_UNITS_PER_DURATION') return 'UNITS_PER_DURATION';
  return 'FREE_UNITS';
};

const Extras = forwardRef<ExtrasHandle, ExtrasProps>(({ ratePlanId, draftData }, ref) => {
  // ✅ Optional guarded clear: only when switching between two *different* valid plans
  const prevRatePlanIdRef = useRef<number | null>(null);
  React.useEffect(() => {
    if (
      prevRatePlanIdRef.current !== null &&
      ratePlanId !== null &&
      prevRatePlanIdRef.current !== ratePlanId
    ) {
      // We're switching to a different plan explicitly; safe to clear
      clearExtrasLocalStorage();
    }
    if (ratePlanId !== null) {
      prevRatePlanIdRef.current = ratePlanId;
    }
  }, [ratePlanId]);

  // -------------------------------------------------------
  // Hydrate from sessionStorage when no backend draft data
  // -------------------------------------------------------
  React.useEffect(() => {
    // Skip session storage hydration if we have draftData (even if empty object)
    if (draftData !== null && draftData !== undefined) {
      console.log('⏭️ Skipping session storage hydration - draftData exists:', draftData);
      return;
    }

    console.log('🔍 Session storage hydration - checking for existing data...');
    const sections: string[] = [];

    // Setup Fee
    const setupFeeStr = getRatePlanData('SETUP_FEE');
    const setupTimingStr = getRatePlanData('SETUP_APPLICATION_TIMING');
    const invoiceDesc = getRatePlanData('SETUP_INVOICE_DESC');
    if (setupFeeStr && Number(setupFeeStr) > 0) {
      setSetupFeePayload(prev => ({
        ...prev,
        setupFee: Number(setupFeeStr),
        applicationTiming: setupTimingStr ? Number(setupTimingStr) : 0,
        invoiceDescription: invoiceDesc || '',
      }));
      sections.push('setupFee');
    }

    // Discounts
    const percentStr = getRatePlanData('DISCOUNT_PERCENT');
    const flatStr    = getRatePlanData('DISCOUNT_FLAT');
    const typeStr    = getRatePlanData('DISCOUNT_TYPE');
    const eligStr    = getRatePlanData('ELIGIBILITY');
    const dStart     = getRatePlanData('DISCOUNT_START');
    const dEnd       = getRatePlanData('DISCOUNT_END');

    const hasDiscountData = (
      (percentStr && Number(percentStr) > 0) ||
      (flatStr && Number(flatStr) > 0) ||
      (eligStr && eligStr.trim()) ||
      (dStart && dStart.trim()) ||
      (dEnd && dEnd.trim())
    );

    if (hasDiscountData) {
      setDiscountForm(prev => ({
        ...prev,
        discountType: (typeStr as 'PERCENTAGE'|'FLAT') || (percentStr ? 'PERCENTAGE' : 'FLAT'),
        percentageDiscountStr: percentStr || '',
        flatDiscountAmountStr: flatStr || '',
        eligibility: eligStr || '',
        startDate: dStart || '',
        endDate: dEnd || '',
      }));
      sections.push('discounts');
    }

    // Freemium (session storage is in UI terms; convert for payload)
    const freeTypeStr   = getRatePlanData('FREEMIUM_TYPE') as UIFreemiumType | '' | null;
    const freeUnitsStr  = getRatePlanData('FREEMIUM_UNITS');
    const trialDurStr   = getRatePlanData('FREE_TRIAL_DURATION');
    const freeStartStr  = getRatePlanData('FREEMIUM_START');
    const freeEndStr    = getRatePlanData('FREEMIUM_END');

    const hasFreemiumData = (
      (freeTypeStr && typeof freeTypeStr === 'string' && freeTypeStr.trim()) ||
      (freeUnitsStr && typeof freeUnitsStr === 'string' && freeUnitsStr.trim() && Number(freeUnitsStr) > 0) ||
      (trialDurStr && typeof trialDurStr === 'string' && trialDurStr.trim() && Number(trialDurStr) > 0) ||
      (freeStartStr && typeof freeStartStr === 'string' && freeStartStr.trim()) ||
      (freeEndStr && typeof freeEndStr === 'string' && freeEndStr.trim())
    );

    if (hasFreemiumData) {
      const inferredUi: UIFreemiumType =
        (freeTypeStr as UIFreemiumType) ||
        (freeUnitsStr ? 'FREE_UNITS' : trialDurStr ? 'FREE_TRIAL_DURATION' : 'FREE_UNITS');

      const apiType = uiToApiFreemium(inferredUi);

      setFreemiumType(inferredUi);
      setFreemiumPayload({
        freemiumType: apiType,
        freeUnits: freeUnitsStr ? Number(freeUnitsStr) : 0,
        freeTrialDuration: trialDurStr ? Number(trialDurStr) : 0,
        startDate: freeStartStr || '',
        endDate: freeEndStr || '',
      });
      sections.push('freemium');
    }

    // Minimum Commitment
    const minUsageStr = getRatePlanData('MINIMUM_USAGE');
    const minChargeStr = getRatePlanData('MINIMUM_CHARGE');
    if (minUsageStr && Number(minUsageStr) > 0) {
      setMinimumUsage(minUsageStr);
      setMinimumCharge('');
      sections.push('commitment');
    } else if (minChargeStr && Number(minChargeStr) > 0) {
      setMinimumCharge(minChargeStr);
      setMinimumUsage('');
      sections.push('commitment');
    }

    if (sections.length) setActiveSections(sections);
  }, [draftData]);

  // Initialize from draftData (direct from backend)
  React.useEffect(() => {
    if (!draftData) {
      console.log('🎁 Extras component mounted - no draft data, using defaults');
      return;
    }

    console.log('🚀 Extras component mounted - initializing from backend draft data:', draftData);

    const sectionsToExpand: string[] = [];

    // Setup Fee
    if (draftData.setupFee && typeof draftData.setupFee === 'object') {
      setSetupFeePayload({
        setupFee: draftData.setupFee.setupFee || 0,
        applicationTiming: draftData.setupFee.applicationTiming || 0,
        invoiceDescription: draftData.setupFee.invoiceDescription || '',
      });
      sectionsToExpand.push('setupFee');
    }

    // Discounts
    if (draftData.discount && typeof draftData.discount === 'object') {
      setDiscountForm({
        discountType: draftData.discount.discountType || 'PERCENTAGE',
        percentageDiscountStr: String(draftData.discount.percentageDiscount || ''),
        flatDiscountAmountStr: String(draftData.discount.flatDiscountAmount || ''),
        eligibility: draftData.discount.eligibility || '',
        startDate: draftData.discount.startDate || '',
        endDate: draftData.discount.endDate || '',
      });
      sectionsToExpand.push('discounts');
    }

    // Freemium (object or array)
    let freemiumData: any = null;
    if (draftData.freemium && typeof draftData.freemium === 'object') {
      freemiumData = draftData.freemium;
    } else if (draftData.freemiums && Array.isArray(draftData.freemiums) && draftData.freemiums.length > 0) {
      freemiumData = draftData.freemiums[0];
    }

    if (freemiumData) {
      const apiType = (freemiumData.freemiumType || 'FREE_UNITS') as APIFreemiumType;
      const uiType = apiToUiFreemium(apiType);

      setFreemiumType(uiType);
      setFreemiumPayload({
        freemiumType: apiType,
        freeUnits: freemiumData.freeUnits || 0,
        freeTrialDuration: freemiumData.freeTrialDuration || 0,
        startDate: freemiumData.startDate || '',
        endDate: freemiumData.endDate || '',
      });
      sectionsToExpand.push('freemium');
    }

    // Minimum Commitment
    if (draftData.minimumCommitment && typeof draftData.minimumCommitment === 'object') {
      setMinimumUsage(String(draftData.minimumCommitment.minimumUsage || ''));
      setMinimumCharge(String(draftData.minimumCommitment.minimumCharge || ''));
      sectionsToExpand.push('commitment');
    }

    setActiveSections(sectionsToExpand);
  }, [draftData]);

  // Save state for buttons
  const [saveState, setSaveState] = useState<{
    setupFee: SaveState;
    discounts: SaveState;
    freemium: SaveState;
    commitment: SaveState;
  }>({
    setupFee: 'idle',
    discounts: 'idle',
    freemium: 'idle',
    commitment: 'idle',
  });

  /** Setup Fee */
  const [setupFeePayload, setSetupFeePayload] = useState({
    setupFee: 0,
    applicationTiming: 0,
    invoiceDescription: '',
  });

  /** Discounts */
  type DiscountForm = Omit<DiscountPayload, 'percentageDiscount' | 'flatDiscountAmount'> & {
    percentageDiscountStr: string;
    flatDiscountAmountStr: string;
  };
  const [discountForm, setDiscountForm] = useState<DiscountForm>({
    discountType: 'PERCENTAGE',
    percentageDiscountStr: '',
    flatDiscountAmountStr: '',
    eligibility: '',
    startDate: '',
    endDate: '',
  });

  /** Freemium */
  const [freemiumType, setFreemiumType] = useState<UIFreemiumType>('FREE_UNITS');

  const [freemiumPayload, setFreemiumPayload] = useState<FreemiumPayload>({
    freemiumType: 'FREE_UNITS', // API-type string in your payload type is fine at runtime
    freeUnits: 0,
    freeTrialDuration: 0,
    startDate: '',
    endDate: '',
  });

  /** Minimum Commitment */
  const [minimumUsage, setMinimumUsage] = useState('');
  const [minimumCharge, setMinimumCharge] = useState('');

  // -------------------------------------------------------
  // Sync key pieces of state to sessionStorage immediately
  // -------------------------------------------------------
  React.useEffect(() => {
    // Setup fee
    setRatePlanData('SETUP_FEE', setupFeePayload.setupFee > 0 ? String(setupFeePayload.setupFee) : '');
    setRatePlanData('SETUP_APPLICATION_TIMING', setupFeePayload.applicationTiming > 0 ? String(setupFeePayload.applicationTiming) : '');
    setRatePlanData('SETUP_INVOICE_DESC', setupFeePayload.invoiceDescription);
  }, [setupFeePayload]);

  React.useEffect(() => {
    // Discounts – persist all relevant fields
    const pct  = discountForm.discountType === 'PERCENTAGE' ? discountForm.percentageDiscountStr : '';
    const flat = discountForm.discountType === 'FLAT'       ? discountForm.flatDiscountAmountStr : '';

    setRatePlanData('DISCOUNT_TYPE',  discountForm.discountType || '');
    setRatePlanData('DISCOUNT_PERCENT', pct);
    setRatePlanData('DISCOUNT_FLAT',    flat);
    setRatePlanData('ELIGIBILITY',      discountForm.eligibility);
    setRatePlanData('DISCOUNT_START',   discountForm.startDate);
    setRatePlanData('DISCOUNT_END',     discountForm.endDate);
  }, [discountForm]);

  React.useEffect(() => {
    // Freemium – persist all relevant fields (store UI type for consistency)
    setRatePlanData('FREEMIUM_TYPE', freemiumType);
    setRatePlanData('FREEMIUM_UNITS', freemiumPayload.freeUnits > 0 ? String(freemiumPayload.freeUnits) : '');
    setRatePlanData('FREE_TRIAL_DURATION', freemiumPayload.freeTrialDuration > 0 ? String(freemiumPayload.freeTrialDuration) : '');
    setRatePlanData('FREEMIUM_START', freemiumPayload.startDate);
    setRatePlanData('FREEMIUM_END',   freemiumPayload.endDate);
  }, [freemiumType, freemiumPayload]);

  React.useEffect(() => {
    // Minimum commitment
    setRatePlanData('MINIMUM_USAGE', minimumUsage ? minimumUsage : '');
  }, [minimumUsage]);
  React.useEffect(() => {
    setRatePlanData('MINIMUM_CHARGE', minimumCharge ? minimumCharge : '');
  }, [minimumCharge]);

  /** Expand/collapse */
  const [activeSections, setActiveSections] = useState<string[]>([]);
  const toggleSection = (section: string) =>
    setActiveSections(prev => (prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]));

  /** Icons */
  const iconMap: Record<string, JSX.Element> = {
    setupFee: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M14.6994 6.30022C14.5161 6.48715 14.4135 6.73847 14.4135 7.00022C14.4135 7.26198 14.5161 7.51329 14.6994 7.70022L16.2994 9.30022C16.4863 9.48345 16.7376 9.58608 16.9994 9.58608C17.2611 9.58608 17.5124 9.48345 17.6994 9.30022L21.4694 5.53022C21.9722 6.64141 22.1244 7.87946 21.9058 9.07937C21.6872 10.2793 21.1081 11.3841 20.2456 12.2465C19.3832 13.1089 18.2784 13.6881 17.0785 13.9067C15.8786 14.1253 14.6406 13.9731 13.5294 13.4702L6.61937 20.3802C6.22154 20.778 5.68198 21.0015 5.11937 21.0015C4.55676 21.0015 4.01719 20.778 3.61937 20.3802C3.22154 19.9824 2.99805 19.4428 2.99805 18.8802C2.99805 18.3176 3.22154 17.778 3.61937 17.3802L10.5294 10.4702C10.0265 9.35904 9.87428 8.12099 10.0929 6.92108C10.3115 5.72117 10.8907 4.61638 11.7531 3.75395C12.6155 2.89151 13.7203 2.31239 14.9202 2.09377C16.1201 1.87514 17.3582 2.02739 18.4694 2.53022L14.6994 6.30022Z" stroke="#D59026" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    discounts: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M15 9L9 15M9 9H9.01M15 15H15.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="#D59026" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    freemium: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 7.99995V20.9999M12 7.99995C11.6383 6.50935 11.0154 5.23501 10.2127 4.34311C9.41003 3.45121 8.46469 2.98314 7.5 2.99995C6.83696 2.99995 6.20107 3.26334 5.73223 3.73218C5.26339 4.20102 5 4.83691 5 5.49995C5 6.16299 5.26339 6.79887 5.73223 7.26772C6.20107 7.73656 6.83696 7.99995 7.5 7.99995M12 7.99995C12.3617 6.50935 12.9846 5.23501 13.7873 4.34311C14.59 3.45121 15.5353 2.98314 16.5 2.99995C17.163 2.99995 17.7989 3.26334 18.2678 3.73218C18.7366 4.20102 19 4.83691 19 5.49995C19 6.16299 18.7366 6.79887 18.2678 7.26772C17.7989 7.73656 17.163 7.99995 16.5 7.99995M19 11.9999V18.9999C19 19.5304 18.7893 20.0391 18.4142 20.4142C18.0391 20.7892 17.5304 20.9999 17 20.9999H7C6.46957 20.9999 5.96086 20.7892 5.58579 20.4142C5.21071 20.0391 5 19.5304 5 18.9999V11.9999M4 7.99995H20C20.5523 7.99995 21 8.44766 21 8.99995V10.9999C21 11.5522 20.5523 11.9999 20 11.9999H4C3.44772 11.9999 3 11.5522 3 10.9999V8.99995C3 8.44766 3.44772 7.99995 4 7.99995Z" stroke="#D59026" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    commitment: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M9 12H15M20 13C20 18 16.5 20.5 12.34 21.95C12.1222 22.0238 11.8855 22.0202 11.67 21.94C7.5 20.5 4 18 4 13V5.99996C4 5.73474 4.10536 5.48039 4.29289 5.29285C4.48043 5.10532 4.73478 4.99996 5 4.99996C7 4.99996 9.5 3.79996 11.24 2.27996C11.4519 2.09896 11.7214 1.99951 12 1.99951C12.2786 1.99951 12.5481 2.09896 12.76 2.27996C14.51 3.80996 17 4.99996 19 4.99996C19.2652 4.99996 19.5196 5.10532 19.7071 5.29285C19.8946 5.48039 20 5.73474 20 5.99996V13Z" stroke="#D59026" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  };

  const renderHeader = (label: string, section: string): JSX.Element => (
    <div className="section-header" onClick={() => toggleSection(section)}>
      <button type="button" className="extras-icon-btn" aria-label={`${label} icon`}>
        {iconMap[section]}
      </button>
      <span className="header-label">{label}</span>
      <span className="dropdown-icon">
        {activeSections.includes(section) ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M15 12.5L10 7.5L5 12.5" stroke="#2B7194" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M5 7.5L10 12.5L15 7.5" stroke="#2B7194" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </span>
    </div>
  );

  const SavedCheck = () => (
    <svg className="saved-check" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M5 10.5L8.5 14L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
  const btnClass = (state: SaveState) =>
    `extras-save-btn ${state === 'saved' ? 'is-saved' : ''} ${state === 'saving' ? 'is-saving' : ''}`;

  useImperativeHandle(ref, () => ({
    saveAll: async (ratePlanId: number) => {
      const savePromises: Promise<any>[] = [];
      
      if (setupFeePayload.setupFee > 0) {
        setRatePlanData('SETUP_FEE', setupFeePayload.setupFee.toString());
        savePromises.push(
          saveSetupFee(ratePlanId, setupFeePayload).catch((err: any) => {
            console.error('Setup fee save failed:', err);
            if (err.response?.status === 500) {
              console.warn('⚠️ 500 error during setup fee save - likely duplicate entry, continuing...');
            } else {
              throw err;
            }
          })
        );
      } else {
        setRatePlanData('SETUP_FEE', '');
      }
      
      if (discountForm.discountType && (discountForm.percentageDiscountStr || discountForm.flatDiscountAmountStr)) {
        const percentVal = Number(discountForm.percentageDiscountStr || 0);
        const flatVal = Number(discountForm.flatDiscountAmountStr || 0);
        
        if (discountForm.discountType === 'PERCENTAGE') {
          if (percentVal > 0) setRatePlanData('DISCOUNT_PERCENT', String(percentVal));
          setRatePlanData('DISCOUNT_FLAT', '');
        } else {
          if (flatVal > 0) setRatePlanData('DISCOUNT_FLAT', String(flatVal));
          setRatePlanData('DISCOUNT_PERCENT', '');
        }
        
        savePromises.push(
          saveDiscounts(ratePlanId, {
            ...discountForm,
            percentageDiscount: percentVal,
            flatDiscountAmount: flatVal,
          }).catch((err: any) => {
            console.error('Discounts save failed:', err);
            if (err.response?.status === 500) {
              console.warn('⚠️ 500 error during discounts save - likely duplicate entry, continuing...');
            } else {
              throw err;
            }
          })
        );
      } else {
        setRatePlanData('DISCOUNT_PERCENT', '');
        setRatePlanData('DISCOUNT_FLAT', '');
      }
      
      const buildFreemiumPayload = (): FreemiumPayload => {
        const { freemiumType: apiType, freeUnits, freeTrialDuration, startDate, endDate } = freemiumPayload;
        const clean: FreemiumPayload = { freemiumType: apiType, freeUnits: 0, freeTrialDuration: 0, startDate, endDate };
        if (apiType === 'FREE_UNITS') clean.freeUnits = freeUnits;
        else if (apiType === 'FREE_TRIAL') clean.freeTrialDuration = freeTrialDuration;
        else {
          clean.freeUnits = freeUnits;
          clean.freeTrialDuration = freeTrialDuration;
        }
        return clean;
      };

      if (freemiumPayload.freemiumType && (freemiumPayload.freeUnits > 0 || freemiumPayload.freeTrialDuration > 0)) {
        setRatePlanData('FREEMIUM_TYPE', freemiumType);
        setRatePlanData('FREEMIUM_UNITS', freemiumPayload.freeUnits ? String(freemiumPayload.freeUnits) : '');
        setRatePlanData('FREE_TRIAL_DURATION', freemiumPayload.freeTrialDuration ? String(freemiumPayload.freeTrialDuration) : '');
        
        const cleanFreemium = buildFreemiumPayload();
        savePromises.push(
          saveFreemiums(ratePlanId, cleanFreemium).catch((err: any) => {
            console.error('Freemiums save failed:', err);
            if (err.response?.status === 500) {
              console.warn('⚠️ 500 error during freemiums save - likely duplicate entry, continuing...');
            } else {
              throw err;
            }
          })
        );
      } else {
        setRatePlanData('FREEMIUM_TYPE', '');
        setRatePlanData('FREEMIUM_UNITS', '');
        setRatePlanData('FREE_TRIAL_DURATION', '');
      }
      
      if (minimumUsage || minimumCharge) {
        const payload = {
          minimumUsage: minimumUsage ? +minimumUsage : 0,
          minimumCharge: minimumCharge ? +minimumCharge : 0,
        };
        
        setRatePlanData('MINIMUM_USAGE', String(payload.minimumUsage));
        if (payload.minimumCharge > 0) {
          setRatePlanData('MINIMUM_CHARGE', String(payload.minimumCharge));
        } else {
          setRatePlanData('MINIMUM_CHARGE', '');
        }
        
        savePromises.push(
          saveMinimumCommitment(ratePlanId, payload).catch((err: any) => {
            console.error('Minimum commitment save failed:', err);
            if (err.response?.status === 500) {
              console.warn('⚠️ 500 error during minimum commitment save - likely duplicate entry, continuing...');
            } else {
              throw err;
            }
          })
        );
      } else {
        setRatePlanData('MINIMUM_USAGE', '');
        setRatePlanData('MINIMUM_CHARGE', '');
      }
      
      await Promise.all(savePromises);
    },
  }));

  return (
    <div className="extras-container">
      {/* Setup Fee */}
      <div className="section">
        {renderHeader('Setup Fee(Optional)', 'setupFee')}
        <div className="description-row">
          <p className="description">Charge a one-time fee when the customer starts this plan.</p>
          <button className="icon-btn" aria-label="Add setup fee action" />
        </div>
        {activeSections.includes('setupFee') && (
          <div className="section-content">
            <label>
              Enter one-time Setup Fee <span className="optional">(optional)</span>
            </label>
            <InputField
              type="number"
              value={setupFeePayload.setupFee || ''}
              onChange={(val) => {
                const v = val;
                setSetupFeePayload({
                  ...setupFeePayload,
                  setupFee: v.trim() === '' ? 0 : Number(v),
                });
              }}
              placeholder="$0"
            />

            <label>Application Timing</label>
            <InputField
              type="number"
              value={setupFeePayload.applicationTiming || ''}
              onChange={(val) => {
                const v = val;
                setSetupFeePayload({
                  ...setupFeePayload,
                  applicationTiming: v.trim() === '' ? 0 : Number(v),
                });
              }}
              placeholder="0"
            />

            <label>Invoice Description</label>
            <TextareaField
              value={setupFeePayload.invoiceDescription}
              onChange={(val) => setSetupFeePayload({ ...setupFeePayload, invoiceDescription: val })}
              placeholder="Invoice Description"
            />

            <button
              type="button"
              className={btnClass(saveState.setupFee)}
              disabled={!ratePlanId || saveState.setupFee === 'saving'}
              onClick={async () => {
                if (!ratePlanId) return;
                setSaveState(s => ({ ...s, setupFee: 'saving' }));
                try {
                  if (setupFeePayload.setupFee > 0) {
                    setRatePlanData('SETUP_FEE', setupFeePayload.setupFee.toString());
                  } else {
                    setRatePlanData('SETUP_FEE', '');
                  }
                  await saveSetupFee(ratePlanId, setupFeePayload);
                  setSaveState(s => ({ ...s, setupFee: 'saved' }));
                } catch {
                  setSaveState(s => ({ ...s, setupFee: 'error' }));
                }
              }}
            >
              {saveState.setupFee === 'saved' ? (
                <>
                  <SavedCheck /> <span>Saved</span>
                </>
              ) : (
                <span>{saveState.setupFee === 'saving' ? 'Saving…' : 'Save'}</span>
              )}
            </button>
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
            <SelectField
              value={discountForm.discountType}
              onChange={(val) => {
                const nextType = (val as 'PERCENTAGE' | 'FLAT') || 'PERCENTAGE';
                // clear the opposite field to avoid stale values
                if (nextType === 'PERCENTAGE') {
                  setDiscountForm({
                    ...discountForm,
                    discountType: 'PERCENTAGE',
                    flatDiscountAmountStr: '',   // clear flat
                  });
                } else {
                  setDiscountForm({
                    ...discountForm,
                    discountType: 'FLAT',
                    percentageDiscountStr: '',   // clear percent
                  });
                }
              }}
              options={[
                { label: '--Select--', value: '' },
                { label: 'PERCENTAGE', value: 'PERCENTAGE' },
                { label: 'FLAT', value: 'FLAT' },
              ]}
            />

            {/* Show only the relevant input */}
            {discountForm.discountType === 'PERCENTAGE' && (
              <>
                <label>Enter % discount</label>
                <InputField
                  type="number"
                  value={discountForm.percentageDiscountStr}
                  onChange={(val)=> setDiscountForm({ ...discountForm, percentageDiscountStr: val })}
                  placeholder="e.g., 10"
                />
              </>
            )}

            {discountForm.discountType === 'FLAT' && (
              <>
                <label>Enter Flat Discount Amount</label>
                <InputField
                  type="number"
                  value={discountForm.flatDiscountAmountStr}
                  onChange={(val)=> setDiscountForm({ ...discountForm, flatDiscountAmountStr: val })}
                  placeholder="e.g., 50"
                />
              </>
            )}

            <label>Eligibility</label>
            <InputField
              type="text"
              value={discountForm.eligibility}
              onChange={(val)=> setDiscountForm({ ...discountForm, eligibility: val })}
              placeholder="e.g. new users"
            />

            <label>Validity Period</label>
            <div className="date-range">
              <div className="date-input">
                <label>Start Date</label>
                <InputField
                  type="date"
                  value={discountForm.startDate}
                  onChange={(val)=> setDiscountForm({ ...discountForm, startDate: val })}
                />
              </div>
              <div className="date-input">
                <label>End Date</label>
                <InputField
                  type="date"
                  value={discountForm.endDate}
                  onChange={(val)=> setDiscountForm({ ...discountForm, endDate: val })}
                />
              </div>
            </div>

            <button
              type="button"
              className={btnClass(saveState.discounts)}
              disabled={!ratePlanId || saveState.discounts === 'saving'}
              onClick={async () => {
                if (!ratePlanId) return;
                setSaveState(s => ({ ...s, discounts: 'saving' }));
                try {
                  const percentVal = Number(discountForm.percentageDiscountStr || 0);
                  const flatVal = Number(discountForm.flatDiscountAmountStr || 0);

                  if (discountForm.discountType === 'PERCENTAGE') {
                    if (percentVal > 0) setRatePlanData('DISCOUNT_PERCENT', String(percentVal));
                    setRatePlanData('DISCOUNT_FLAT', '');
                  } else {
                    if (flatVal > 0) setRatePlanData('DISCOUNT_FLAT', String(flatVal));
                    setRatePlanData('DISCOUNT_PERCENT', '');
                  }

                  await saveDiscounts(ratePlanId, {
                    ...discountForm,
                    percentageDiscount: percentVal,
                    flatDiscountAmount: flatVal,
                  });
                  setSaveState(s => ({ ...s, discounts: 'saved' }));
                } catch {
                  setSaveState(s => ({ ...s, discounts: 'error' }));
                }
              }}
            >
              {saveState.discounts === 'saved' ? (
                <>
                  <SavedCheck /> <span>Saved</span>
                </>
              ) : (
                <span>{saveState.discounts === 'saving' ? 'Saving…' : 'Save'}</span>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Freemium */}
      <div className="section">
        {renderHeader('Freemium Setup', 'freemium')}
        <div className="description-row">
          <p className="description">Allow limited access to features for free before switching to paid tiers.</p>
          <button className="icon-btn" aria-label="Add freemium action" />
        </div>
        {activeSections.includes('freemium') && (
          <div className="section-content">
            <label>Freemium Type</label>
            <SelectField
              value={freemiumType}
              onChange={val => {
                const ui = val as UIFreemiumType;
                setFreemiumType(ui);
                setFreemiumPayload(prev => ({
                  ...prev,                               // keep previously-hydrated numbers
                  freemiumType: uiToApiFreemium(ui),
                }));
              }}
              options={[
                { label: '--Select--', value: '' },
                { label: 'Free Units', value: 'FREE_UNITS' },
                { label: 'Free Trial Duration', value: 'FREE_TRIAL_DURATION' },
                { label: 'Free Units for Duration', value: 'FREE_UNITS_PER_DURATION' },
              ]}
            />

            {(freemiumType === 'FREE_UNITS' || freemiumType === 'FREE_UNITS_PER_DURATION') && (
              <>
                <label>Select Free Units</label>
                <InputField
                  type="number"
                  value={freemiumPayload.freeUnits === 0 ? '' : String(freemiumPayload.freeUnits)}
                  onChange={(val)=>{
                    setFreemiumPayload({
                      ...freemiumPayload,
                      freeUnits: val.trim() === '' ? 0 : Number(val),
                    });
                  }}
                  placeholder="Enter Free Units"
                />
              </>
            )}

            {(freemiumType === 'FREE_TRIAL_DURATION' || freemiumType === 'FREE_UNITS_PER_DURATION') && (
              <>
                <label>Select Free Trial Duration</label>
                <InputField
                  type="number"
                  value={freemiumPayload.freeTrialDuration === 0 ? '' : String(freemiumPayload.freeTrialDuration)}
                  onChange={(val)=>{
                    setFreemiumPayload({
                      ...freemiumPayload,
                      freeTrialDuration: val.trim() === '' ? 0 : Number(val),
                    });
                  }}
                  placeholder="Enter Trial Duration"
                />
              </>
            )}

            <div className="date-range">
              <div className="date-input">
                <label>Start Date</label>
                <InputField
                  type="date"
                  value={freemiumPayload.startDate}
                  onChange={(val)=> setFreemiumPayload({ ...freemiumPayload, startDate: val })}
                />
              </div>
              <div className="date-input">
                <label>End Date</label>
                <InputField
                  type="date"
                  value={freemiumPayload.endDate}
                  onChange={(val)=> setFreemiumPayload({ ...freemiumPayload, endDate: val })}
                />
              </div>
            </div>

            <button
              type="button"
              className={btnClass(saveState.freemium)}
              disabled={!ratePlanId || saveState.freemium === 'saving'}
              onClick={async () => {
                if (!ratePlanId) return;
                setSaveState(s => ({ ...s, freemium: 'saving' }));
                try {
                  // Persist UI type and numbers for back/forward navigation
                  setRatePlanData('FREEMIUM_TYPE', freemiumType);
                  setRatePlanData('FREEMIUM_UNITS', freemiumPayload.freeUnits ? String(freemiumPayload.freeUnits) : '');
                  setRatePlanData('FREE_TRIAL_DURATION', freemiumPayload.freeTrialDuration ? String(freemiumPayload.freeTrialDuration) : '');
                  setRatePlanData('FREEMIUM_START', freemiumPayload.startDate);
                  setRatePlanData('FREEMIUM_END', freemiumPayload.endDate);

                  await saveFreemiums(ratePlanId, freemiumPayload);
                  setSaveState(s => ({ ...s, freemium: 'saved' }));
                } catch {
                  setSaveState(s => ({ ...s, freemium: 'error' }));
                }
              }}
            >
              {saveState.freemium === 'saved' ? (
                <>
                  <SavedCheck /> <span>Saved</span>
                </>
              ) : (
                <span>{saveState.freemium === 'saving' ? 'Saving…' : 'Save'}</span>
              )}
            </button>
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
            <InputField
              type="number"
              placeholder="Enter usage"
              value={minimumUsage.replace(/^0+(?=\d)/, '')}
              onChange={(val)=>{
                setMinimumUsage(val.replace(/^0+(?=\d)/, ''));
                if (val) setMinimumCharge('');
              }}
              disabled={!!minimumCharge}
            />

            <label>Minimum Charge</label>
            <InputField
              type="number"
              placeholder="Enter charge"
              value={minimumCharge.replace(/^0+(?=\d)/, '')}
              onChange={(val)=>{
                setMinimumCharge(val.replace(/^0+(?=\d)/, ''));
                if (val) setMinimumUsage('');
              }}
              disabled={!!minimumUsage}
            />

            <button
              type="button"
              className={btnClass(saveState.commitment)}
              disabled={!ratePlanId || saveState.commitment === 'saving'}
              onClick={async () => {
                if (!ratePlanId) return;
                setSaveState(s => ({ ...s, commitment: 'saving' }));
                const payload: MinimumCommitmentPayload = {
                  minimumUsage: minimumUsage ? +minimumUsage : 0,
                  minimumCharge: minimumCharge ? +minimumCharge : 0,
                };
                try {
                  setRatePlanData('MINIMUM_USAGE', String(payload.minimumUsage));
                  if (payload.minimumCharge > 0) {
                    setRatePlanData('MINIMUM_CHARGE', String(payload.minimumCharge));
                  } else {
                    setRatePlanData('MINIMUM_CHARGE', '');
                  }
                  await saveMinimumCommitment(ratePlanId, payload);
                  setSaveState(s => ({ ...s, commitment: 'saved' }));
                } catch {
                  setSaveState(s => ({ ...s, commitment: 'error' }));
                }
              }}
            >
              {saveState.commitment === 'saved' ? (
                <>
                  <SavedCheck /> <span>Saved</span>
                </>
              ) : (
                <span>{saveState.commitment === 'saving' ? 'Saving…' : 'Save'}</span>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

export default Extras;
