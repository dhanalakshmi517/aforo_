import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchProducts, createRatePlan, RatePlan, BASE_URL } from './api';
import axios from 'axios';
import './CreatePricePlan.css';

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
  const [pricePlans, setPricePlans] = useState([]);
  const [showAddTier, setShowAddTier] = useState(false);
  const [tiers, setTiers] = useState([]);
  const [selectedTier, setSelectedTier] = useState('');
  const [tierName, setTierName] = useState('');
  const [tierPrice, setTierPrice] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchProducts();
        setProducts(data);
      } catch (error) {
        setError('Failed to fetch products');
      }
    };
    loadProducts();
  }, []);

  const handlePricingModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPricingModel(e.target.value);
    onPricingModelSelect(e.target.value);
  };

  const handleNextClick = async () => {
    if (!selectedProduct || !ratePlanName || !description || !pricingModel || !billingFrequency) {
      setError('Please fill in all required fields');
      return;
    }
    const selectedProductObj = products.find(p => p.productId === selectedProduct);
    if (!selectedProductObj) {
      setError('Please select a valid product');
      return;
    }
    try {
      // Create the rate plan data in the format expected by the API
      const formData: RatePlan = {
        ratePlanName,
        productName: selectedProductObj.productName,
        description,
        ratePlanType: pricingModel.toUpperCase(),
        billingFrequency: billingFrequency.toUpperCase()
      };
      
      // Create the rate plan using the API
      const response = await createRatePlan(formData);
      const createdRatePlan = response;
      
      // Pass the created rate plan to the next step
      onNext(createdRatePlan);
    } catch (error) {
      setError('Failed to create rate plan. Please try again.');
      console.error('Error creating rate plan:', error);
    }
  };

  useEffect(() => {
    // Initialize products when component mounts
    if (products.length === 0) {
      fetchProducts().then(setProducts);
    }
  }, []);

  return (
    <div className="price-plan-details-section">
      <div className="price-plan-form">
        <div className="price-plan-form-groups">
          <label style={{ display: 'block', margin: '5px', padding: 0 }}>Rate Plan Name</label>
          <input
            type="text"
            value={ratePlanName}
            onChange={(e) => setRatePlanName(e.target.value)}
            placeholder="Google Maps API"
            style={{ flex: 1, maxWidth: '415px' }}
            className="rate-plan-name-input"
          />
        </div>

        <div className="price-plan-form-groups">
          <label style={{ display: 'block', margin: '5px', padding: 0 }}>Product Name</label>
          <select
            className="product-select"
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            style={{ flex: 1, maxWidth: '420px' }}
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
          <label style={{ display: 'block', margin: '5px', padding: 0 }}>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter description here"
            className="description-textarea"
            style={{ flex: 1, maxWidth: '415px', minHeight: '80px' }}
          ></textarea>
        </div>

        <div className="price-plan-form-groups">
          <label style={{ display: 'block', margin: '5px', padding: 0 }}>Rate Plan Type</label>
          <select
            className="pricing-model-select"
            value={pricingModel}
            onChange={handlePricingModelChange}
            style={{ flex: 1, maxWidth: '420px' }}
          >
            <option value="">--Select--</option>
            <option value="FLAT_FEE">FLAT_FEE</option>
            <option value="TIERED">TIERED</option>
            <option value="VOLUME_BASED">VOLUME_BASED</option>
            <option value="STAIRSTEP">STAIRSTEP</option>
            <option value="USAGE_BASED">USAGE_BASED</option>
          </select>
        </div>

        <div className="price-plan-form-groups">
          <label style={{ display: 'block', margin: '5px', padding: 0 }}>Billing Frequency</label>
          <select
            className="billing-frequency-select"
            value={billingFrequency}
            onChange={(e) => setBillingFrequency(e.target.value)}
            style={{ flex: 1, maxWidth: '420px' }}
          >
            <option value="">--Select--</option>
            <option value="MONTHLY">MONTHLY</option>
            <option value="WEEKLY">WEEKLY</option>
            <option value="YEARLY">YEARLY</option>
            <option value="DAILY">DAILY</option>
            <option value="HOURLY">HOURLY</option>
          </select>
        </div>


      </div>
    </div>
  );
};

export default PlanDetails;
