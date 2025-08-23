import React, { useState } from 'react';
import { saveSetupFee, saveDiscounts, saveFreemiums, saveMinimumCommitment,
  DiscountPayload, FreemiumPayload, MinimumCommitmentPayload } from './api';
import './Extras.css';
import { clearExtrasLocalStorage } from './utils/localStorageExtras';

interface ExtrasProps {
  ratePlanId: number | null;
  noUpperLimit: boolean;
}

export default function Extras({ ratePlanId, noUpperLimit }: ExtrasProps): JSX.Element {
  // clear cached extras once when component mounts AND there's no ratePlan yet
  React.useEffect(() => {
    if (!ratePlanId) {
      clearExtrasLocalStorage();
    }
  }, [ratePlanId]);
  // Setup Fee state
  const [setupFeePayload, setSetupFeePayload] = useState({
    setupFee: Number(localStorage.getItem('setupFee') || 0),
    applicationTiming: 0,
    invoiceDescription: '',
  });
  // Discounts state
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

  // Save Discounts handler
  const saveDiscount = async () => {
    if (!ratePlanId) { alert('Rate plan not yet created'); return; }
    try {
      console.log('Discount form', discountForm);
      // persist for estimator
      const percentVal = Number(discountForm.percentageDiscountStr || 0);
      const flatVal = Number(discountForm.flatDiscountAmountStr || 0);
      if(discountForm.discountType==='PERCENTAGE'){
        if(percentVal>0){
          localStorage.setItem('discountPercent', percentVal.toString());
        } else {
          localStorage.removeItem('discountPercent');
        }
        localStorage.removeItem('discountFlat');
      } else {
        if(flatVal>0){
          localStorage.setItem('discountFlat', flatVal.toString());
        } else {
          localStorage.removeItem('discountFlat');
        }
        localStorage.removeItem('discountPercent');
      }
      await saveDiscounts(ratePlanId, {
        ...discountForm,
        percentageDiscount: percentVal,
        flatDiscountAmount: flatVal,
      });
      alert('Discount saved');
    } catch (err) {
      console.error(err);
      alert('Failed to save');
    }
  };

  // keep existing state hooks below
  // Freemium state
  const [freemiumPayload, setFreemiumPayload] = useState<FreemiumPayload>({
    freemiumType: 'FREE_UNITS',
    freeUnits: 0,
    freeTrialDuration: 0,
    startDate: '',
    endDate: '',
  });

  const saveFreemium = async () => {
    if (!ratePlanId) { alert('Rate plan not yet created'); return; }
    try {
      console.log('Freemium payload', freemiumPayload, 'Freemium type', freemiumType);
      // persist for estimator (free units)
      if(freemiumType==='FREE_UNITS'){
        localStorage.setItem('freemiumUnits', freemiumPayload.freeUnits.toString());
      }
      await saveFreemiums(ratePlanId, freemiumPayload);
      alert('Freemium saved');
    } catch (err) {
      console.error(err);
      alert('Failed to save');
    }
  };

  const [activeSections, setActiveSections] = useState<string[]>([]);
  // Track currently selected freemium type; initialise to FREE_UNITS to stay in sync with payload
// use backend enum literals
const [freemiumType, setFreemiumType] = useState<'FREE_UNITS' | 'FREE_TRIAL_DURATION' | 'FREE_UNITS_PER_DURATION'>('FREE_UNITS');
  const [minimumUsage, setMinimumUsage] = useState('');
  const [minimumCharge, setMinimumCharge] = useState('');

  const saveCommitment = async () => {
    if (!ratePlanId) { alert('Rate plan not yet created'); return; }
    const payload: MinimumCommitmentPayload = {
      minimumUsage: minimumUsage ? +minimumUsage : 0,
      minimumCharge: minimumCharge ? +minimumCharge : 0,
    };
    try {
      console.log('Minimum commitment payload', payload);
      // persist for estimator
      localStorage.setItem('minimumUsage', payload.minimumUsage.toString());
      if(payload.minimumCharge>0){
        localStorage.setItem('minimumCharge', payload.minimumCharge.toString());
      } else {
        localStorage.removeItem('minimumCharge');
      }
      await saveMinimumCommitment(ratePlanId, payload);
      alert('Minimum commitment saved');
    } catch (err) {
      console.error(err);
      alert('Failed to save');
    }
  };

  const toggleSection = (section: string) => {
    setActiveSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const iconMap: Record<string, JSX.Element> = {
    setupFee: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path d="M14.6994 6.30022C14.5161 6.48715 14.4135 6.73847 14.4135 7.00022C14.4135 7.26198 14.5161 7.51329 14.6994 7.70022L16.2994 9.30022C16.4863 9.48345 16.7376 9.58608 16.9994 9.58608C17.2611 9.58608 17.5124 9.48345 17.6994 9.30022L21.4694 5.53022C21.9722 6.64141 22.1244 7.87946 21.9058 9.07937C21.6872 10.2793 21.1081 11.3841 20.2456 12.2465C19.3832 13.1089 18.2784 13.6881 17.0785 13.9067C15.8786 14.1253 14.6406 13.9731 13.5294 13.4702L6.61937 20.3802C6.22154 20.778 5.68198 21.0015 5.11937 21.0015C4.55676 21.0015 4.01719 20.778 3.61937 20.3802C3.22154 19.9824 2.99805 19.4428 2.99805 18.8802C2.99805 18.3176 3.22154 17.778 3.61937 17.3802L10.5294 10.4702C10.0265 9.35904 9.87428 8.12099 10.0929 6.92108C10.3115 5.72117 10.8907 4.61638 11.7531 3.75395C12.6155 2.89151 13.7203 2.31239 14.9202 2.09377C16.1201 1.87514 17.3582 2.02739 18.4694 2.53022L14.6994 6.30022Z" stroke="#D59026" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
    ),
   
    discounts: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M15 9L9 15M9 9H9.01M15 15H15.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="#D59026" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    ),
    freemium: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path d="M12 7.99995V20.9999M12 7.99995C11.6383 6.50935 11.0154 5.23501 10.2127 4.34311C9.41003 3.45121 8.46469 2.98314 7.5 2.99995C6.83696 2.99995 6.20107 3.26334 5.73223 3.73218C5.26339 4.20102 5 4.83691 5 5.49995C5 6.16299 5.26339 6.79887 5.73223 7.26772C6.20107 7.73656 6.83696 7.99995 7.5 7.99995M12 7.99995C12.3617 6.50935 12.9846 5.23501 13.7873 4.34311C14.59 3.45121 15.5353 2.98314 16.5 2.99995C17.163 2.99995 17.7989 3.26334 18.2678 3.73218C18.7366 4.20102 19 4.83691 19 5.49995C19 6.16299 18.7366 6.79887 18.2678 7.26772C17.7989 7.73656 17.163 7.99995 16.5 7.99995M19 11.9999V18.9999C19 19.5304 18.7893 20.0391 18.4142 20.4142C18.0391 20.7892 17.5304 20.9999 17 20.9999H7C6.46957 20.9999 5.96086 20.7892 5.58579 20.4142C5.21071 20.0391 5 19.5304 5 18.9999V11.9999M4 7.99995H20C20.5523 7.99995 21 8.44766 21 8.99995V10.9999C21 11.5522 20.5523 11.9999 20 11.9999H4C3.44772 11.9999 3 11.5522 3 10.9999V8.99995C3 8.44766 3.44772 7.99995 4 7.99995Z" stroke="#D59026" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
    ),
    commitment: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path d="M9 12H15M20 13C20 18 16.5 20.5 12.34 21.95C12.1222 22.0238 11.8855 22.0202 11.67 21.94C7.5 20.5 4 18 4 13V5.99996C4 5.73474 4.10536 5.48039 4.29289 5.29285C4.48043 5.10532 4.73478 4.99996 5 4.99996C7 4.99996 9.5 3.79996 11.24 2.27996C11.4519 2.09896 11.7214 1.99951 12 1.99951C12.2786 1.99951 12.5481 2.09896 12.76 2.27996C14.51 3.80996 17 4.99996 19 4.99996C19.2652 4.99996 19.5196 5.10532 19.7071 5.29285C19.8946 5.48039 20 5.73474 20 5.99996V13Z" stroke="#D59026" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
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
           <path d="M15 12.5L10 7.5L5 12.5" stroke="#2B7194" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
         </svg>
        ) : (
         
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M5 7.5L10 12.5L15 7.5" stroke="#2B7194" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
        )}
      </span>
    </div>
  );

  return (
    <div className="extras-container">
      {/* Setup Fee */}
      <div className="section">
        {renderHeader('Setup Fee(Optional)', 'setupFee')}
        <div className="description-row"><p className="description">Charge a one-time fee when the customer starts this plan.</p><button className="icon-btn" aria-label="Add setup fee action" /></div>
        {activeSections.includes('setupFee') && (
          <div className="section-content">
            <label>Enter one-time Setup Fee <span className="optional">(optional)</span></label>
            <input type="number" value={setupFeePayload.setupFee || ''}
              onChange={e=>{
                const val = e.target.value;
                setSetupFeePayload({...setupFeePayload, setupFee: val.trim()==='' ? 0 : Number(val)});
              }} placeholder="$0" />
            <label>Application Timing</label>
            <input type="number" value={setupFeePayload.applicationTiming || ''}
              onChange={e=>{
                const val = e.target.value;
                setSetupFeePayload({...setupFeePayload, applicationTiming: val.trim()==='' ? 0 : Number(val)});
              }} placeholder="0" />
            <label>Invoice Description</label>
            <textarea value={setupFeePayload.invoiceDescription}
              onChange={e=>setSetupFeePayload({...setupFeePayload, invoiceDescription:e.target.value})} placeholder="Invoice Description"></textarea>
            <button type="button" className="extras-save-btn" onClick={async()=>{
              if(ratePlanId==null){alert('Rate plan not yet created');return;}
              try{console.log('Setup fee payload', setupFeePayload);
              // persist for estimator
              if(setupFeePayload.setupFee>0){
                localStorage.setItem('setupFee', setupFeePayload.setupFee.toString());
              } else {
                localStorage.removeItem('setupFee');
              }
              await saveSetupFee(ratePlanId, setupFeePayload);
              alert('Setup fee saved');}catch(err){console.error(err);alert('Failed to save');}
            }}>Save</button>
          </div>
        )}
      </div>

      {/* Discounts */}
      <div className="section">
        {renderHeader('Discounts', 'discounts')}
        <div className="description-row"><p className="description">Add time-bound or recurring discounts to attract or retain users.</p><button className="icon-btn" aria-label="Add discount action" /></div>
        {activeSections.includes('discounts') && (
          <div className="section-content">
            <label>Discount Type</label>
            <select value={discountForm.discountType}
              onChange={e=>setDiscountForm({...discountForm, discountType:e.target.value as 'PERCENTAGE' | 'FLAT'})}>
              <option value="">--Select--</option>
              <option value="PERCENTAGE">PERCENTAGE</option>
              <option value="FLAT">FLAT</option>  
            </select>
            <label>Enter % discount</label>
            <input type="text" inputMode="decimal" pattern="[0-9]*" value={discountForm.percentageDiscountStr}
              onChange={e=>{
                setDiscountForm({...discountForm, percentageDiscountStr: e.target.value});
              }} placeholder="0" />
            <label>Enter Flat Discount Amount</label>
            <input type="text" inputMode="decimal" pattern="[0-9]*" value={discountForm.flatDiscountAmountStr}
              onChange={e=>{
                setDiscountForm({...discountForm, flatDiscountAmountStr: e.target.value});
              }} placeholder="0" />
            <label>Eligibility</label>
            <input type="text" value={discountForm.eligibility}
              onChange={e=>setDiscountForm({...discountForm, eligibility:e.target.value})} placeholder="e.g. new users" />
            <label>Validity Period</label>
            <div className="date-range">
              <div className="date-input">
                <label>Start Date</label>
                <input type="date" value={discountForm.startDate}
                    onChange={e=>setDiscountForm({...discountForm, startDate:e.target.value})} />
              </div>
              <div className="date-input">
                <label>End Date</label>
                <input type="date" value={discountForm.endDate}
                    onChange={e=>setDiscountForm({...discountForm, endDate:e.target.value})} />
              </div>
            </div>
            <button type="button" className="extras-save-btn" onClick={saveDiscount}>Save</button>
          </div>
        )}
      </div>

      {/* Freemium Setup */}
      <div className="section">
        {renderHeader('Freemium Setup', 'freemium')}
        <div className="description-row"><p className="description">Allow limited access to features for free before switching to paid tiers.</p><button className="icon-btn" aria-label="Add freemium action" /></div>
        {activeSections.includes('freemium') && (
          <div className="section-content">
            <label>Freemium Type</label>
            <select
              value={freemiumType}
              onChange={e => {
                const type = e.target.value as 'FREE_UNITS' | 'FREE_TRIAL_DURATION' | 'FREE_UNITS_PER_DURATION';
                setFreemiumType(type);
                // payload type differs from backend enum; suppress TS error for assignment
                // @ts-ignore
                setFreemiumPayload({ ...freemiumPayload, freemiumType: type });
              }}>
              <option value="">--Select--</option>
              <option value="FREE_UNITS">Free Units</option>
              <option value="FREE_TRIAL_DURATION">Free Trial Duration</option>
              <option value="FREE_UNITS_PER_DURATION">Free Units for Duration</option>
            </select>

            {(freemiumType === 'FREE_UNITS' || freemiumType === 'FREE_UNITS_PER_DURATION') && (
              <>
                <label>Select Free Units</label>
                <input type="number" value={freemiumPayload.freeUnits === 0 ? '' : freemiumPayload.freeUnits}
                  onChange={e => {
                    const val = e.target.value;
                    setFreemiumPayload({ ...freemiumPayload, freeUnits: val.trim() === '' ? 0 : Number(val) });
                  }}
                  placeholder="Enter Free Units" />
              </>
            )}

            {(freemiumType === 'FREE_TRIAL_DURATION' || freemiumType === 'FREE_UNITS_PER_DURATION') && (
              <>
                <label>Select Free Trial Duration</label>
                <input
                  type="number"
                  value={freemiumPayload.freeTrialDuration === 0 ? '' : freemiumPayload.freeTrialDuration}
                  onChange={e => {
                    const val = e.target.value;
                    setFreemiumPayload({ ...freemiumPayload, freeTrialDuration: val.trim() === '' ? 0 : Number(val) });
                  }}
                  placeholder="Enter Trial Duration"
                />
              </>
            )}

            <div className="date-range">
              <div className="date-input">
                <label>Start Date</label>
                <input
                  type="date"
                  value={freemiumPayload.startDate}
                  onChange={e =>
                    setFreemiumPayload({ ...freemiumPayload, startDate: e.target.value })
                  }
                />
              </div>
              <div className="date-input">
                <label>End Date</label>
                <input
                  type="date"
                  value={freemiumPayload.endDate}
                  onChange={e =>
                    setFreemiumPayload({ ...freemiumPayload, endDate: e.target.value })
                  }
                />
              </div>
            </div>
            <button type="button" className="extras-save-btn" onClick={async()=>{
  if(ratePlanId==null){alert('Rate plan not yet created');return;}
  try{console.log('Freemium payload', freemiumPayload);
  await saveFreemiums(ratePlanId, freemiumPayload);alert('Freemium saved');}catch(err){console.error(err);alert('Failed to save');}
}}>Save</button>
          </div>
        )}
      </div>

      {/* Minimum Commitment */}
      <div className="section">
        {renderHeader('Minimum Commitment', 'commitment')}
        <div className="description-row"><p className="description">Define how customers are billed when usage exceeds the plan limits.</p><button className="icon-btn" aria-label="Add commitment action" /></div>
        {activeSections.includes('commitment') && (
          <div className="section-content">
            <label>Minimum Usage</label>
            <input
              type="text"
              placeholder="Enter usage"
              value={minimumUsage.replace(/^0+(?=\d)/, '')}
              onChange={(e) => {
                setMinimumUsage(e.target.value.replace(/^0+(?=\d)/, ''));
                if (e.target.value) setMinimumCharge(''); // Clear charge
              }}
              disabled={!!minimumCharge}
            />

            <label>Minimum Charge</label>
            <input
              type="text"
              placeholder="Enter charge"
              value={minimumCharge.replace(/^0+(?=\d)/, '')}
              onChange={(e) => {
                setMinimumCharge(e.target.value.replace(/^0+(?=\d)/, ''));
                if (e.target.value) setMinimumUsage(''); // Clear usage
              }}
              disabled={!!minimumUsage}
            />
            <button
              type="button"
              className="extras-save-btn"
              onClick={saveCommitment}
            >
              Save
            </button>
          </div>
        )}
      </div>

     
    </div>

  );
}
