import React from 'react';
import '../styles/ProductBasicInfo.css';

type ProductBasicInfoProps = {
  data: {
    productName: string;
    productType: string;
    description: string;
  };
  onChange: (data: Partial<ProductBasicInfoProps['data']>) => void;
};

const ProductBasicInfo: React.FC<ProductBasicInfoProps> = ({ data, onChange }) => {
  const handleChange = (field: string, value: string) => {
    onChange({ [field]: value } as any);
  };

  return (
    <div className="basic-info-container">
      <div className="form-group">
        <label htmlFor="productName">
          Product Name <span className="required">*</span>
        </label>
        <input
          type="text"
          id="productName"
          value={data.productName}
          onChange={(e) => handleChange('productName', e.target.value)}
          placeholder="Enter product name"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="productType">
          Product Type <span className="required">*</span>
        </label>
        <select
          id="productType"
          value={data.productType}
          onChange={(e) => handleChange('productType', e.target.value)}
          required
        >
          <option value="">Select product type</option>
          <option value="API">API</option>
          <option value="SERVICE">Service</option>
          <option value="DATASET">Dataset</option>
          <option value="SOFTWARE">Software</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          value={data.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Describe your product..."
          rows={6}
          maxLength={1000}
        />
        <small className="char-count">
          {data.description?.length || 0}/1000 characters
        </small>
      </div>
    </div>
  );
};

export default ProductBasicInfo;
