import React, { useEffect, useState } from 'react';
import './EditPlan.css';

interface Product {
  productId: string;
  productName: string;
  productType: string;
  description: string;
  category: string;
  status: string;
  version: string;
  visibility: boolean;
}

interface RatePlanData {
  ratePlanName: string;
  productName: string;
  description: string;
  ratePlanType: string;
  billingFrequency: string;
}

interface PlanDetailsProps {
  onPricingModelSelect: (model: string) => void;
  onNext: (data: RatePlanData) => void;
}

const PlanDetails: React.FC<PlanDetailsProps> = ({ onPricingModelSelect, onNext }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [ratePlanName, setRatePlanName] = useState('');
  const [description, setDescription] = useState('');
  const [pricingModel, setPricingModel] = useState('');
  const [billingFrequency, setBillingFrequency] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Dummy static products (replace with API or props as needed)
    const dummyProducts: Product[] = [
      { productId: '1', productName: 'Google Maps', productType: 'API', description: '', category: '', status: 'ACTIVE', version: 'v1', visibility: true },
      { productId: '2', productName: 'ChatGPT', productType: 'LLMToken', description: '', category: '', status: 'ACTIVE', version: 'v2', visibility: true }
    ];
    setProducts(dummyProducts);
  }, []);

  const handlePricingModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPricingModel(e.target.value);
    onPricingModelSelect(e.target.value);
  };

  const handleNextClick = () => {
    if (!selectedProduct || !ratePlanName || !description || !billingFrequency) {
      setError('Please fill in all required fields');
      return;
    }

    const selectedProductObj = products.find(p => p.productId === selectedProduct);
    if (!selectedProductObj) {
      setError('Please select a valid product');
      return;
    }

    const ratePlan: RatePlanData = {
      ratePlanName,
      productName: selectedProductObj.productName,
      description,
      ratePlanType: pricingModel,
      billingFrequency: billingFrequency.toUpperCase()
    };

    onNext(ratePlan);
  };

  return (
    <div className="price-plan-details-section">
      <div className="price-plan-form">
        {error && <p style={{ color: 'red', marginBottom: '10px' }}>{error}</p>}

        <div className="price-plan-form-groups">
          <label>Rate Plan Name</label>
          <input
            type="text"
            value={ratePlanName}
            onChange={(e) => setRatePlanName(e.target.value)}
            placeholder="Google Maps API"
            className="rate-plan-name-input"
          />
        </div>

        <div className="price-plan-form-groups">
          <label>Product Name</label>
          <select
            className="product-select"
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
          >
            <option value="">--Select--</option>
            {products.map((product) => (
              <option key={product.productId} value={product.productId}>
                {product.productName}
              </option>
            ))}
          </select>
        </div>

        <div className="price-plan-form-groups">
          <label>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter description here"
            className="description-textarea"
            style={{ minHeight: '80px' }}
          />
        </div>

        <div className="price-plan-form-groups">
          <label>Billing Frequency</label>
          <select
            className="billing-frequency-select"
            value={billingFrequency}
            onChange={(e) => setBillingFrequency(e.target.value)}
          >
            <option value="">--Select--</option>
            <option value="MONTHLY">MONTHLY</option>
            <option value="WEEKLY">WEEKLY</option>
            <option value="YEARLY">YEARLY</option>
            <option value="DAILY">DAILY</option>
            <option value="HOURLY">HOURLY</option>
          </select>
        </div>

        <div className="price-plan-form-groups">
          <label>Pricing Model</label>
          <select
            className="pricing-model-select"
            value={pricingModel}
            onChange={handlePricingModelChange}
          >
            <option value="">--Select--</option>
            <option value="flat">Flat Fee</option>
            <option value="tiered">Tiered</option>
            <option value="volume">Volume</option>
            <option value="stairstep">Stair-Step</option>
            <option value="usage">Usage-Based</option>
          </select>
        </div>

        <div style={{ marginTop: '20px' }}>
          <button className="buttonPrimary" onClick={handleNextClick}>
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlanDetails;
