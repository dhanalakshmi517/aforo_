import React from 'react';
import '../styles/ProductPricing.css';

type ProductPricingProps = {
  data: {
    pricingModel: 'USAGE_BASED' | 'SUBSCRIPTION' | 'ENTERPRISE' | 'CUSTOM';
    basePrice: string;
  };
  onChange: (data: Partial<ProductPricingProps['data']>) => void;
};

const ProductPricing: React.FC<ProductPricingProps> = ({ data = { pricingModel: 'USAGE_BASED', basePrice: '0.01' }, onChange }) => {
  const handleChange = (field: string, value: string) => {
    let updates = { [field]: value } as any;
    
    // Update default base price when pricing model changes
    if (field === 'pricingModel') {
      switch (value) {
        case 'USAGE_BASED':
          updates.basePrice = '0.01';
          break;
        case 'SUBSCRIPTION':
          updates.basePrice = '199';
          break;
        case 'ENTERPRISE':
          updates.basePrice = '1999';
          break;
        case 'CUSTOM':
          updates.basePrice = '0';
          break;
        default:
          break;
      }
    }
    
    onChange(updates);
  };

  const renderPricingDetails = () => {
    switch (data.pricingModel) {
      case 'USAGE_BASED':
        return (
          <>
            <div className="form-group">
              <label htmlFor="basePrice">Price per Request ($)</label>
              <div className="price-input">
                <span>$</span>
                <input
                  type="number"
                  id="basePrice"
                  step="0.001"
                  min="0"
                  value={data.basePrice || '0.01'}
                  onChange={(e) => handleChange('basePrice', e.target.value)}
                />
                <span>per request</span>
              </div>
            </div>
            <div className="pricing-info">
              <p>Usage-based pricing is ideal for:</p>
              <ul>
                <li>Pay-as-you-go services</li>
                <li>Variable usage patterns</li>
                <li>Testing and development</li>
              </ul>
            </div>
          </>
        );

      case 'SUBSCRIPTION':
        return (
          <>
            <div className="form-group">
              <label htmlFor="basePrice">Monthly Subscription ($)</label>
              <div className="price-input">
                <span>$</span>
                <input
                  type="number"
                  id="basePrice"
                  step="1"
                  min="0"
                  value={data.basePrice || '199'}
                  onChange={(e) => handleChange('basePrice', e.target.value)}
                />
                <span>per month</span>
              </div>
            </div>
            <div className="pricing-info">
              <p>Monthly subscription includes:</p>
              <ul>
                <li>25,000 requests per month</li>
                <li>Priority support</li>
                <li>Analytics dashboard</li>
              </ul>
            </div>
          </>
        );

      case 'ENTERPRISE':
        return (
          <>
            <div className="form-group">
              <label htmlFor="basePrice">Annual Enterprise License ($)</label>
              <div className="price-input">
                <span>$</span>
                <input
                  type="number"
                  id="basePrice"
                  step="1"
                  min="0"
                  value={data.basePrice || '1999'}
                  onChange={(e) => handleChange('basePrice', e.target.value)}
                />
                <span>per year</span>
              </div>
            </div>
            <div className="pricing-info">
              <p>Enterprise license includes:</p>
              <ul>
                <li>Unlimited requests</li>
                <li>24/7 dedicated support</li>
                <li>Custom integration assistance</li>
                <li>Service Level Agreement (SLA)</li>
              </ul>
            </div>
          </>
        );

      case 'CUSTOM':
        return (
          <>
            <div className="form-group">
              <label htmlFor="basePrice">Custom Base Price ($)</label>
              <div className="price-input">
                <span>$</span>
                <input
                  type="number"
                  id="basePrice"
                  step="0.01"
                  min="0"
                  value={data.basePrice || '0'}
                  onChange={(e) => handleChange('basePrice', e.target.value)}
                />
              </div>
            </div>
            <div className="pricing-info">
              <p>Custom pricing allows:</p>
              <ul>
                <li>Tailored pricing structure</li>
                <li>Custom feature sets</li>
                <li>Negotiable terms</li>
                <li>Contact sales for details</li>
              </ul>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="pricing-container">
      <div className="pricing-section">
        <div className="form-group">
          <label htmlFor="pricingModel">Pricing Model</label>
          <select
            id="pricingModel"
            value={data.pricingModel || 'USAGE_BASED'}
            onChange={(e) => handleChange('pricingModel', e.target.value as any)}
          >
            <option value="USAGE_BASED">Usage Based</option>
            <option value="SUBSCRIPTION">Subscription</option>
            <option value="ENTERPRISE">Enterprise</option>
            <option value="CUSTOM">Custom</option>
          </select>
        </div>

        {renderPricingDetails()}
      </div>
    </div>
  );
};

export default ProductPricing;
