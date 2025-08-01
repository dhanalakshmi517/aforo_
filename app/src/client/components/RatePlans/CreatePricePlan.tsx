import React, { useState } from 'react';
import './CreatePricePlan.css';
import Extras from './Extras';
import ReviewSummary from './ReviewSummary';
import BillableMetrics from './BillableMetrics';
import PlanDetails from './PlanDetails';
import PricingModelSetup from './PricingModelSetup';
import { saveFlatFee, saveTieredPricing, saveVolumePricing, saveStairStepPricing, saveUsageBased } from './api';
import { showSuccessAlert, showErrorAlert } from '../../../utils/sweetAlert';

interface FlatFee {
  recurringFee: string;
  billingFrequency: string;
  currency: string;
}

interface TieredTier {
  from: number;
  to: number;
  price: number;
}

interface VolumeTier {
  from: number;
  to: number;
  price: number;
}

interface StairStepTier {
  from: number;
  to: number;
  price: number;
}

interface RatePlanData {
  ratePlanId?: string;
  ratePlanName: string;
  productName: string;
  description: string;
  ratePlanType: string;
  billingFrequency: string;
}

interface PricingFormData {
  flat: FlatFee;
  tiered: { tiers: TieredTier[] };
  volume: { tiers: VolumeTier[] };
  stairstep: { tiers: StairStepTier[] };
  usage: { perUnitAmount: string };
  chargePerUser: string;
  planDetails?: RatePlanData;
}

const initialState: PricingFormData = {
  flat: { recurringFee: '', billingFrequency: '', currency: '' },
  tiered: { tiers: Array(3).fill({ from: 0, to: 0, price: 0 }) },
  volume: { tiers: Array(3).fill({ from: 0, to: 0, price: 0 }) },
  stairstep: { tiers: Array(3).fill({ from: 0, to: 0, price: 0 }) },
  usage: { perUnitAmount: '' },
  chargePerUser: ''
};

interface CreatePricePlanProps {
  onClose: () => void;
  onCreateSuccess?: () => void;
  onNext?: (data: RatePlanData) => Promise<void>;
}

const CreatePricePlan: React.FC<CreatePricePlanProps> = ({ onClose, onNext, onCreateSuccess }) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<string>('details');
  const [selectedPricingModel, setSelectedPricingModel] = useState<string>('');
  const [pricingFormData, setPricingFormData] = useState<PricingFormData>(initialState);
  const [noUpperLimit, setNoUpperLimit] = useState<boolean>(false);

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'details') setCurrentStep(1);
    if (tab === 'billable') setCurrentStep(2);
    if (tab === 'pricing') setCurrentStep(3);
    if (tab === 'extras') setCurrentStep(4);
    if (tab === 'review') setCurrentStep(5);

  };

  const handleNext = async () => {
    if (currentStep === 1) {
      setActiveTab('billable');
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setActiveTab('pricing');
      setCurrentStep(3);
    } else if (currentStep === 3) {
      try {
        const id = pricingFormData.planDetails?.ratePlanId;
        const type = pricingFormData.planDetails?.ratePlanType;
        if (!id || !type) throw new Error('Missing rate plan details');

        switch (type) {
          case 'flatfee':
            await saveFlatFee(id, pricingFormData.flat);
            break;
          case 'tiered-pricing':
            await saveTieredPricing(id, pricingFormData.tiered);
            break;
          case 'volume-pricing':
            await saveVolumePricing(id, pricingFormData.volume);
            break;
          case 'stair-step-pricing':
            await saveStairStepPricing(id, pricingFormData.stairstep);
            break;
          case 'usage-based':
            await saveUsageBased(id, pricingFormData.usage);
            break;
          default:
            throw new Error('Unknown pricing model');
        }
        showSuccessAlert('Success', 'Pricing details saved');
        setActiveTab('extras');
        setCurrentStep(4);
      } catch (e) {
        console.error('Error saving pricing', e);
        showErrorAlert('Error', 'Failed to save pricing details');
        return;
      }
    } else if (currentStep === 4) {
      setActiveTab('review');
      setCurrentStep(5);
    } else if (currentStep === 5) {
      onCreateSuccess?.();
      onClose();
    }

  };

  const handleBack = () => {
    if (currentStep === 2) {
      setActiveTab('details');
      setCurrentStep(1);
    } else if (currentStep === 3) {
      setActiveTab('billable');
      setCurrentStep(2);
    } else if (currentStep === 4) {
      setActiveTab('pricing');
      setCurrentStep(3);
    } else if (currentStep === 5) {
      setActiveTab('extras');
      setCurrentStep(4);
    } else {
      onClose();
    }
  };


  const handleFlatDetailsChange = (field: keyof FlatFee, value: string) => {
    setPricingFormData(prev => ({
      ...prev,
      flat: { ...prev.flat, [field]: value }
    }));
  };

  const handleTierChange = (type: 'tiered' | 'volume' | 'stairstep', index: number, field: string, value: string | number) => {
    setPricingFormData(prev => ({
      ...prev,
      [type]: {
        tiers: prev[type].tiers.map((tier, i) =>
          i === index ? { ...tier, [field]: value } : tier
        )
      }
    }));
  };

  const handleAddTier = (type: 'tiered' | 'volume' | 'stairstep') => {
    const newTier = { from: 0, to: 0, price: 0 };
    setPricingFormData(prev => ({
      ...prev,
      [type]: { tiers: [...prev[type].tiers, newTier] }
    }));
  };

  const handleRemoveTier = (type: 'tiered' | 'volume' | 'stairstep', index: number) => {
    setPricingFormData(prev => ({
      ...prev,
      [type]: {
        tiers: prev[type].tiers.filter((_, i) => i !== index)
      }
    }));
  };

  const handleUsageChange = (value: string) => {
    setPricingFormData(prev => ({
      ...prev,
      usage: { perUnitAmount: value }
    }));
  };

  const handleChargePerUserChange = (value: string) => {
    setPricingFormData(prev => ({
      ...prev,
      chargePerUser: value
    }));
  };



  return (
    <div className="price-plan-outer-container">
      <div className="price-plan-container">
        <div className="stepper-and-form">
          <div className="vertical-stepper">
          <div className={`step ${activeTab === 'details' ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`} onClick={() => handleTabClick('details')}>
  <div className="step-content">
    <svg className="step-circle" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="11.5" stroke="#D6D5D7" />
      <circle cx="12" cy="12" r="6" fill="#D6D5D7" />
    </svg>
    <div className="step-info">
      <h6 className="step-title">Plan Details</h6>
      <p>Define the basic information and structure of your plan.</p>
    </div>
  </div>

  {/* ✅ Add connector line */}
  <svg className="step-line" xmlns="http://www.w3.org/2000/svg" width="2" height="85" viewBox="0 0 2 85" fill="none">
    <path d="M1 84L1 1" stroke="#D6D5D7" strokeWidth="2" strokeLinecap="round" />
  </svg>
</div>

            <div className={`step ${activeTab === 'billable' ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`} onClick={() => handleTabClick('billable')}>
              
              <div className="step-content">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
  <circle cx="12" cy="12" r="11.5" stroke="#D6D5D7"/>
  <circle cx="12" cy="12" r="6" fill="#D6D5D7"/>
</svg>
<div className="step-info">

                <h6 className="step-title">Billable Metrics</h6>
                <p>Name your metric and link it to a product.</p>
              </div>
              </div>
               {/* ✅ Add connector line */}
  <svg className="step-line" xmlns="http://www.w3.org/2000/svg" width="2" height="85" viewBox="0 0 2 85" fill="none">
    <path d="M1 84L1 1" stroke="#D6D5D7" strokeWidth="2" strokeLinecap="round" />
  </svg>

            </div>

            <div className={`step ${activeTab === 'pricing' ? 'active' : ''} ${currentStep > 3 ? 'completed' : ''}`} onClick={() => handleTabClick('pricing')}>
                         <div className="step-content">
                         <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
  <circle cx="12" cy="12" r="11.5" stroke="#D6D5D7"/>
  <circle cx="12" cy="12" r="6" fill="#D6D5D7"/>
</svg>
<div className="step-info">

                <h6 className="step-title">Pricing Model Setup</h6>
                <p>Configure how pricing will work for this plan.</p>
              </div>
            </div>
             {/* ✅ Add connector line */}
  <svg className="step-line" xmlns="http://www.w3.org/2000/svg" width="2" height="85" viewBox="0 0 2 85" fill="none">
    <path d="M1 84L1 1" stroke="#D6D5D7" strokeWidth="2" strokeLinecap="round" />
  </svg>
            </div>
            <div className={`step ${activeTab === 'extras' ? 'active' : ''} ${currentStep > 4 ? 'completed' : ''}`} onClick={() => handleTabClick('extras')}>
           
             <div className="step-content"> 
             <svg  className="circle" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
  <circle cx="12" cy="12" r="11.5" stroke="#D6D5D7"/>
  <circle cx="12" cy="12" r="6" fill="#D6D5D7"/>
</svg>
<div className="step-info">

                <h6 className="step-title">Extras</h6>
                <p>Add optional features or benefits to enhance your plan.</p>
              </div>
            </div>
             {/* ✅ Add connector line */}
  <svg className="step-line" xmlns="http://www.w3.org/2000/svg" width="2" height="85" viewBox="0 0 2 85" fill="none">
    <path d="M1 84L1 1" stroke="#D6D5D7" strokeWidth="2" strokeLinecap="round" />
  </svg>
            </div>
            <div className={`step ${activeTab === 'review' ? 'active' : ''}`} onClick={() => handleTabClick('review')}>
            
            <div className="step-content">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
  <circle cx="12" cy="12" r="11.5" stroke="#D6D5D7"/>
  <circle cx="12" cy="12" r="6" fill="#D6D5D7"/>
</svg>

<div className="step-info">

              <h6 className="step-title">Review & Confirm</h6>
              <p>Check and Finalize details.</p>
            </div>
          </div>
          
          </div>
          </div>
         


          <div className="price-plan-form-section">
            {activeTab === 'details' && (
              <PlanDetails
                onPricingModelSelect={setSelectedPricingModel}
                onNext={async (createdRatePlan) => {
                  await setPricingFormData(prev => ({
                    ...prev,
                    planDetails: {
                      ratePlanId: createdRatePlan.ratePlanId,
                      ratePlanName: createdRatePlan.ratePlanName,
                      productName: createdRatePlan.productName,
                      description: createdRatePlan.description,
                      ratePlanType: createdRatePlan.ratePlanType,
                      billingFrequency: createdRatePlan.billingFrequency
                    }
                  }));
                  await handleNext();
                }}
              />
            )}
            {activeTab === 'billable' && <BillableMetrics onSkip={handleNext} />}
            {activeTab === 'pricing' && (
              <PricingModelSetup
                chargePerUser={pricingFormData.chargePerUser}
                handleChargePerUserChange={handleChargePerUserChange}
                onPricingModelSelect={setSelectedPricingModel}
                selectedPricingModel={selectedPricingModel}
                pricingFormData={pricingFormData}
                handleFlatDetailsChange={handleFlatDetailsChange}
                handleTierChange={handleTierChange}
                handleAddTier={handleAddTier}
                handleRemoveTier={handleRemoveTier}
                handleUsageChange={handleUsageChange}
                noUpperLimit={noUpperLimit}
                setNoUpperLimit={setNoUpperLimit}
              />
            )}
            {activeTab === 'extras' && <Extras noUpperLimit={noUpperLimit} />}
            {activeTab === 'review' && <ReviewSummary />}
          


        <div className="button-group">

            <button type="button" className="button-secondary" onClick={handleBack} disabled={currentStep === 1}>
              <h6>Back</h6>
            </button>
            <button type="button" className="button-primary" onClick={handleNext}>
            <h6>{activeTab === 'review' ? 'Create Rate Plan' : 'Save & Next'}</h6>
            </button>
          </div>
        </div>
      </div>
      </div>
       </div>

  );
};

export default CreatePricePlan;
