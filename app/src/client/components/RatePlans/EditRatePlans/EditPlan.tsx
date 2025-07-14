import React, { useState } from 'react';
import './EditPlan.css';        // <-- update to the correct stylesheet
import Extras from './Extras';
import ReviewSummary from './ReviewSummary';
import BillableMetrics from './BillableMetrics';
import PlanDetails from './PlanDetails';
import PricingModelSetup from './PricingModelSetup';
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

interface EditPlanProps {
  onClose: () => void;
  onCreateSuccess?: () => void;
}

const EditPlan: React.FC<EditPlanProps> = ({ onClose, onCreateSuccess }) => {
  const handleSaveDefault = () => {
    // TODO: implement save-as-default logic
    onCreateSuccess?.();
    onClose();
  };
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
      setActiveTab('extras');
      setCurrentStep(4);
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

  const handleTierChange = (
    type: 'tiered' | 'volume' | 'stairstep',
    index: number,
    field: string,
    value: string | number
  ) => {
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
        <div className="price-plan-header">
          <h2>Edit {pricingFormData.planDetails?.ratePlanName || 'Rate Plan'}</h2>
          <div className="header-actions">
            <button className="cancel-button" onClick={onClose}>Cancel</button>
            <button className="draft-button" onClick={handleSaveDefault}>Save as Dft</button>
          </div>
        </div>
      <div className="price-plan-container">
        <div className="stepper-and-form">
          <div className="vertical-steppers">
            {[
              { key: 'details', title: 'Plan Details', desc: 'Define the basic information and structure of your plan.' },
              { key: 'billable', title: 'Billable Metrics', desc: 'Name your metric and link it to a product.' },
              { key: 'pricing', title: 'Pricing Model Setup', desc: 'Configure how pricing will work for this plan.' },
              { key: 'extras', title: 'Extras', desc: 'Add optional features or benefits to enhance your plan.' },
              { key: 'review', title: 'Review & Confirm', desc: 'Check and Finalize details.' }
            ].map((step, index) => (
              <div
                key={step.key}
                className={`step ${activeTab === step.key ? 'active' : ''} ${currentStep > index + 1 ? 'completed' : ''}`}
                onClick={() => handleTabClick(step.key)}
              >
                
                
                
                
                
                <div className="step-content">
                  <h6 className="step-title">{step.title}</h6>
                
                </div>
              </div>
            ))}
          </div>

          <div className="price-plan-form-section">
            {activeTab === 'details' && (
              <PlanDetails
                onPricingModelSelect={setSelectedPricingModel}
                onNext={async (createdRatePlan) => {
                  setPricingFormData(prev => ({
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
            {activeTab === 'billable' && <BillableMetrics />}
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

export default EditPlan;
