import React, { useState, useEffect } from "react";

import Billable from "./Billable";
import Pricing, { PricingHandle } from "./Pricing";
import Extras from "./Extras";
import Review from "./Review";
import {
  fetchProducts,
  Product,
  createRatePlan,
  RatePlanRequest,
  confirmRatePlan,
} from "./api";

import "./CreatePricePlan.css";
import { InputField, TextareaField, SelectField } from "../Components/InputFields";

interface CreatePricePlanProps {
  onClose: () => void;
}

const steps = [
  { title: "Plan Details", desc: "Define the basic information and structure of your plan." },
  { title: "Select Billable Metric", desc: "Select or define a Billable Metric" },
  { title: "Pricing Model Setup", desc: "Configure how pricing will work for this plan." },
  { title: "Extras", desc: "Add optional features or benefits to enhance your plan." },
  { title: "Review & confirm", desc: "Check and Finalize details." },
];

const CreatePricePlan: React.FC<CreatePricePlanProps> = ({ onClose }) => {
  const pricingRef = React.useRef<PricingHandle>(null);

  const [planName, setPlanName] = useState("");
  const [planDescription, setPlanDescription] = useState("");
  const [billingFrequency, setBillingFrequency] = useState("");
  const [selectedProductName, setSelectedProductName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedMetricId, setSelectedMetricId] = useState<number | null>(null);
  const [ratePlanId, setRatePlanId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [productError, setProductError] = useState("");

  // inline errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const getProducts = async () => {
      try {
        setProducts((await fetchProducts()) as Product[]);
      } catch {
        setProductError("Failed to load products");
      }
    };
    getProducts();
  }, []);

  const [currentStep, setCurrentStep] = useState(0);

  const validateStep0 = (): boolean => {
    const e: Record<string, string> = {};
    if (!planName.trim()) e.planName = "This is required field";
    if (!planDescription.trim()) e.planDescription = "This is required field";
    if (!billingFrequency) e.billingFrequency = "This is required field";
    if (!selectedProductName) e.selectedProductName = "This is required field";
    if (!paymentMethod) e.paymentMethod = "This is required field";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = async () => {
    if (currentStep === steps.length - 1) {
      if (!ratePlanId) return;
      try {
        setSaving(true);
        await confirmRatePlan(ratePlanId);
        onClose();
      } finally {
        setSaving(false);
      }
      return;
    }

    if (currentStep === 0 && !validateStep0()) return;

    if (currentStep === 1) {
      if (selectedMetricId === null) {
        setErrors({ billableMetric: "This is required field" });
        return;
      }
      const selectedProduct = products.find(p => p.productName === selectedProductName);
        if (!selectedProduct) {
          setErrors({ selectedProductName: 'Invalid product selected' });
          return;
        }

        const payload: RatePlanRequest = {
          ratePlanName: planName,
          productId: Number(selectedProduct.productId),
          description: planDescription,
          billingFrequency: billingFrequency as any,
          paymentType: paymentMethod as any,
          billableMetricId: selectedMetricId,
        };
      try {
        setSaving(true);
        const created = await createRatePlan(payload);
        setRatePlanId(created.ratePlanId);
      } catch {
        setSaving(false);
        return;
      }
      setSaving(false);
    }

    if (currentStep === 2 && pricingRef.current) {
      setSaving(true);
      const ok = await pricingRef.current.save();
      setSaving(false);
      if (!ok) return;
    }

    setCurrentStep((s) => s + 1);
  };

  const handleBack = () =>
    currentStep > 0 ? setCurrentStep((s) => s - 1) : onClose();

  const sectionHeading = steps[currentStep].title;

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <>
            <div className="create-form">
              <InputField
                label="Rate Plan Name"
                placeholder="e.g., Individual Plan, Pro Plan"
                value={planName}
                onChange={setPlanName}
                error={errors.planName}
              />
            </div>

            <div className="create-form">
              <TextareaField
                label="Rate Plan Description"
                placeholder="e.g., Best for solo developers using our API"
                value={planDescription}
                onChange={setPlanDescription}
                error={errors.planDescription}
              />
            </div>

            <div className="form-row">
              <div className="create-form">
                <SelectField
                  label="Billing Frequency"
                  value={billingFrequency}
                  onChange={setBillingFrequency}
                  placeholder="Select billing cycle"
                  options={[
                    { label: "Monthly", value: "MONTHLY" },
                    { label: "Yearly", value: "YEARLY" },
                    { label: "Daily", value: "DAILY" },
                    { label: "Hourly", value: "HOURLY" },
                    { label: "Weekly", value: "WEEKLY" },
                  ]}
                  error={errors.billingFrequency}
                />
              </div>

              <div className="create-form">
                <SelectField
                  label="Select Product"
                  value={selectedProductName}
                  onChange={setSelectedProductName}
                  placeholder="Select Product"
                  options={[
                    ...(productError ? [] : products.map((p) => ({
                      label: p.productName,
                      value: p.productName,
                    }))),
                  ]}
                  error={errors.selectedProductName}
                />
              </div>

              <div className="create-form">
                <SelectField
                  label="Payment type"
                  value={paymentMethod}
                  onChange={setPaymentMethod}
                  placeholder="Select payment method"
                  options={[
                    { label: "Post-Paid", value: "POSTPAID" },
                    { label: "Pre-Paid", value: "PREPAID" },
                  ]}
                  error={errors.paymentMethod}
                />
              </div>
            </div>
          </>
        );

      case 1:
        return (
          <Billable
            productName={selectedProductName}
            selectedMetricId={selectedMetricId}
            onSelectMetric={setSelectedMetricId}
          />
        );

      case 2:
        return <Pricing ref={pricingRef} ratePlanId={ratePlanId} />;

      case 3:
        return <Extras ratePlanId={ratePlanId} noUpperLimit={false} />;

      case 4: {
        const planDetails = {
          name: planName,
          description: planDescription,
          frequency: billingFrequency,
          product: selectedProductName,
          paymentMethod,
        };
        return <Review planDetails={planDetails} />;
      }

      default:
        return <p>Coming soon...</p>;
    }
  };

  return (
    <div className="create-price-plan align-under-back">
      <div className="price-plan-wrapper">
        {/* Progress / stepper — UNLOCKED (clickable) */}
        <aside className="price-plan-sidebars">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`step-item ${index === currentStep ? "active" : ""}`}
            >
              <div className="icon-wrappers">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle cx="12" cy="12" r="11.5" stroke="#D6D5D7" />
                  <circle cx="12" cy="12" r="6" fill="#D6D5D7" />
                </svg>
              </div>
              <div className="step-text">
                <span className="step-title">{step.title}</span>
                <span className="step-desc">{step.desc}</span>
              </div>
            </div>
          ))}
        </aside>

        <div className="price-plan-section">
          <div className="section-header">
            <div className="section-title">{sectionHeading}</div>
          </div>

          <div className="form-card">{renderStepContent()}</div>

          <div className="button-group">
            <button className="btn back" onClick={handleBack} disabled={currentStep === 0}>
              Back
            </button>
            <button className="btn save-next" onClick={handleNext} disabled={saving}>
              Save & Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePricePlan;
