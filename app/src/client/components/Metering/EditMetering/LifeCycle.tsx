import React, { useState } from 'react';
import './Lifecycle.css';

const Lifecycle: React.FC = () => {
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    priority: '',
    auditLogId: '',
    schemaValidation: '',
    processingType: '',
    errorHandling: '',
    performanceSLA: '',
    dryRun: false,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox'
      ? (e.target as HTMLInputElement).checked
      : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  return (
    <div className="lifecycle-form-wrapper">
      <div className="form-cardsss">
        <div className="form-groupsss">
          <label>Start Date</label>
          <input
            type="text"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            placeholder="Placeholder"
          />
        </div>

        <div className="form-groupsss">
          <label>End Date (optional)</label>
          <input
            type="text"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            placeholder="Placeholder"
          />
        </div>

        <div className="form-groupsss">
          <label>Priority / Order</label>
          <select name="priority" value={formData.priority} onChange={handleChange}>
            <option>--select--</option>
          </select>
        </div>

        <div className="form-groupsss">
          <label>Audit Log ID</label>
          <select name="auditLogId" value={formData.auditLogId} onChange={handleChange}>
            <option>--select--</option>
          </select>
        </div>

        <div className="form-groupsss">
          <label>Schema Validation Type</label>
          <select
            name="schemaValidation"
            value={formData.schemaValidation}
            onChange={handleChange}
          >
            <option>--select--</option>
          </select>
        </div>

        <div className="form-groupsss">
          <label>Processing Type</label>
          <select
            name="processingType"
            value={formData.processingType}
            onChange={handleChange}
          >
            <option>--select--</option>
          </select>
        </div>

        <div className="form-groupsss">
          <label>Error Handling</label>
          <select
            name="errorHandling"
            value={formData.errorHandling}
            onChange={handleChange}
          >
            <option>--select--</option>
          </select>
        </div>

        <div className="form-groupsss">
          <label>Performance SLA</label>
          <select
            name="performanceSLA"
            value={formData.performanceSLA}
            onChange={handleChange}
          >
            <option>--select--</option>
          </select>
        </div>

        <div className="form-groupsss checkbox-group">
          <input
            type="checkbox"
            id="dryRun"
            name="dryRun"
            checked={formData.dryRun}
            onChange={handleChange}
          />
          <label htmlFor="dryRun">Dry-Run Mode</label>
        </div>
      </div>
    </div>
  );
};

export default Lifecycle;
