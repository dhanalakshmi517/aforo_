import React, { useState } from 'react';
import './CreatePricePlan.css';
import Extras from './Extras';
import PlanDetails from './PlanDetails';
import PricingModelSetup from './PricingModelSetup';
import { createRatePlan } from './api';

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
  planDetails?: RatePlanData;
}

const initialState: PricingFormData = {
  flat: { recurringFee: '', billingFrequency: '', currency: '' },
  tiered: { tiers: Array(3).fill({ from: 0, to: 0, price: 0 }) },
  volume: { tiers: Array(3).fill({ from: 0, to: 0, price: 0 }) },
  stairstep: { tiers: Array(3).fill({ from: 0, to: 0, price: 0 }) },
  usage: { perUnitAmount: '' }
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
    if (tab === 'pricing') setCurrentStep(2);
    if (tab === 'extras') setCurrentStep(3);
  };

  const handleNext = async () => {
    if (currentStep === 1 && selectedPricingModel) {
      setActiveTab('pricing');
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setActiveTab('extras');
      setCurrentStep(3);
    } else if (currentStep === 3) {
      setCurrentStep(4);
    } else if (currentStep === 4) {
      onCreateSuccess?.();
      onClose();
    }
  };

  const handleBack = () => {
    if (currentStep === 2) {
      setActiveTab('details');
      setCurrentStep(1);
    } else if (currentStep === 3) {
      setActiveTab('pricing');
      setCurrentStep(2);
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

  return (
    <div className="price-plan-outer-container">
      <div className="price-plan-container">
        <div className="stepper-and-form">
          <div className="vertical-stepper">
            <div className={`step ${activeTab === 'details' ? 'active' : ''}`} onClick={() => handleTabClick('details')}>
              <svg className="step-icon" xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="11.5" stroke="#D6D5D7"/>
                <circle cx="12" cy="12" r="6" fill="#D6D5D7"/>
              </svg>
              <div className="step-content">
                <strong>Plan Details</strong>
                <p>Define the basic information and structure of your plan.</p>
              </div>
            </div>
            <div className={`step ${activeTab === 'pricing' ? 'active' : ''}`} onClick={() => handleTabClick('pricing')}>
              <svg className="step-icon" xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="11.5" stroke="#D6D5D7"/>
                <circle cx="12" cy="12" r="6" fill="#D6D5D7"/>
              </svg>
              <div className="step-content">
                <strong>Pricing Model Setup</strong>
                <p>Configure how pricing will work for this plan.</p>
              </div>
            </div>
            <div className={`step ${activeTab === 'extras' ? 'active' : ''}`} onClick={() => handleTabClick('extras')}>
              <svg className="step-icon" xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="11.5" stroke="#D6D5D7"/>
                <circle cx="12" cy="12" r="6" fill="#D6D5D7"/>
              </svg>
              <div className="step-content">
                <strong>Extras</strong>
                <p>Add optional features or benefits to enhance your plan.</p>
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
            {activeTab === 'pricing' && (
              <PricingModelSetup
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
          </div>
        </div>

        <div className="button-group">
          <div className="button-group-left">
            <button type="button" className="aforo-button" onClick={onClose}>
              <h6>Cancel</h6>
            </button>
          </div>
          <div className="button-group-right">
            <button type="button" className="buttonSecondary" onClick={handleBack} disabled={currentStep === 1}>
              <h6>Back</h6>
            </button>
            <button type="button" className="buttonPrimary" onClick={handleNext} disabled={currentStep === 4}>
              <h6>{currentStep === 4 ? 'Finish' : 'Next'}</h6>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePricePlan;
