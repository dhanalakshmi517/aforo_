import React, { ChangeEvent } from "react";
import { MetadataForm } from "./types";
import "./EditProductForm.css";

interface MetaDataFormProps {
  data: MetadataForm;
  onChange: (newData: MetadataForm) => void;
  loading: boolean;
}

const MetaDataForm: React.FC<MetaDataFormProps> = ({
  data,
  onChange,
  loading
}) => {
  // Debug logs to check data
  console.log('MetaDataForm received data:', data);

  // Format dates if they exist
  const formattedData = {
    ...data,
    effectiveStartDate: data.effectiveStartDate ? new Date(data.effectiveStartDate).toISOString().split('T')[0] : '',
    effectiveEndDate: data.effectiveEndDate ? new Date(data.effectiveEndDate).toISOString().split('T')[0] : ''
  };

  // Prevent multiple renders
  React.useEffect(() => {
    console.log('Data changed:', data);
  }, [data]);

  const handleChange = (field: keyof MetadataForm, value: string | boolean | number) => {
    const newData = {
      ...data,
      [field]: value
    };
    onChange(newData);
  };

  if (loading) {
    return <div className="loading-state">Loading Configuration details...</div>;
  }

  return (
    <div className="general-form">
      <div className="edit-form-group">
        <label>Internal SKU Code</label>
        <input
          type="text"
          placeholder="Enter SKU code"
          value={data.internalSkuCode}
          onChange={(e) => handleChange('internalSkuCode', e.target.value)}
          disabled={loading}
        />
      </div>

      <div className="edit-form-group">
        <label>UOM</label>
        <input
          type="text"
          placeholder="Enter Unit of Measure"
          value={data.uom}
          onChange={(e) => handleChange('uom', e.target.value)}
          disabled={loading}
        />
      </div>

      <div className="edit-form-group">
        <label>Effective Start Date</label>
        <input
          type="date"
          value={formattedData.effectiveStartDate}
          onChange={(e) => handleChange('effectiveStartDate', e.target.value)}
          disabled={loading}
        />
      </div>

      <div className="edit-form-group">
        <label>Effective End Date</label>
        <input
          type="date"
          value={formattedData.effectiveEndDate}
          onChange={(e) => handleChange('effectiveEndDate', e.target.value)}
          disabled={loading}
        />
      </div>

      <div className="edit-form-group">
        <label>Billable</label>
        <div className="switch">
          <input
            type="checkbox"
            checked={data.billable}
            onChange={(e) => handleChange('billable', e.target.checked)}
            disabled={loading}
          />
          <span className="slider round"></span>
        </div>
      </div>

      {/* <div className="edit-form-group">
        <label>Linked Rate Plans</label>
        <div className="linked-rate-plans">
          {data.linkedRatePlans?.map((plan, index) => (
            <div key={index} className="rate-plan-item">
              <span>{plan}</span>
              <button
                onClick={() => {
                  const newData = { ...data };
                  newData.linkedRatePlans = [...newData.linkedRatePlans];
                  newData.linkedRatePlans.splice(index, 1);
                  onChange(newData);
                }}
                disabled={loading}
              >
                ×
              </button>
            </div>
          )) || []}
          <input
            type="text"
            placeholder="Add new rate plan"
            onChange={(e) => {
              if (e.target.value) {
                const newData = { ...data };
                newData.linkedRatePlans = [...newData.linkedRatePlans, e.target.value];
                onChange(newData);
                e.target.value = '';
              }
            }}
            disabled={loading}
          />
        </div>
      </div>

      <div className="edit-form-group">
        <label>Labels</label>
        <div className="labels-container">
          {Object.entries(data.labels || {}).map(([key, value]) => (
            <div key={key} className="label-item">
              <span>{key}: {value}</span>
              <button
                onClick={() => {
                  const newData = { ...data };
                  newData.labels = { ...newData.labels };
                  delete newData.labels[key];
                  onChange(newData);
                }}
                disabled={loading}
              >
                ×
              </button>
            </div>
          ))}
          <input
            type="text"
            placeholder="Add new label (key:value)"
            onChange={(e) => {
              if (e.target.value) {
                const [key, value] = e.target.value.split(':').map(s => s.trim());
                if (key && value) {
                  const newData = { ...data };
                  newData.labels = { ...newData.labels, [key]: value };
                  onChange(newData);
                  e.target.value = '';
                }
              }
            }}
            disabled={loading}
          />
        </div>
      </div> */}

      <div className="edit-form-group">
        <label>Audit Log ID</label>
        <input
          type="number"
          value={data.auditLogId || ''}
          onChange={(e) => handleChange('auditLogId', parseInt(e.target.value) || 0)}
          disabled={loading}
        />
      </div>
    </div>
  );
};

export default MetaDataForm;
