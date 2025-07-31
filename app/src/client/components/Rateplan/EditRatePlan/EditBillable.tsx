import React, { useState } from 'react';
import './EditBillable.css'; // Keep this as-is if you are reusing the same styles

interface Metric {
  id: string;
  title: string;
  subtitle: string;
  iconText: string;
  iconSubText: string;
  iconClass: string;
}

const metrics: Metric[] = [
  {
    id: 'api',
    title: 'API Calls',
    subtitle: '10,000 Calls / Month',
    iconText: 'API',
    iconSubText: 'Calls',
    iconClass: 'bg-orange-100 text-orange-600',
  },
  {
    id: 'sms',
    title: 'SMS Sent',
    subtitle: '200 Messages / Month',
    iconText: 'SMS',
    iconSubText: 'Messages',
    iconClass: 'bg-purple-100 text-purple-600',
  },
  {
    id: 'storage',
    title: 'Storage GB',
    subtitle: '50 GB / Month',
    iconText: 'GB',
    iconSubText: 'Storage',
    iconClass: 'bg-yellow-100 text-yellow-700',
  },
  {
    id: 'users',
    title: 'Active Users',
    subtitle: '5 Users / Month',
    iconText: 'A.U',
    iconSubText: 'Active',
    iconClass: 'bg-teal-100 text-teal-700',
  },
  {
    id: 'support',
    title: 'Support Hours',
    subtitle: '20 Support Hours / Month',
    iconText: 'S.Hr',
    iconSubText: 'Hours',
    iconClass: 'bg-blue-100 text-blue-700',
  },
];

interface EditBillableProps {
  productName?: string;
}

const EditBillable: React.FC<EditBillableProps> = ({ productName }) => {
  const [selectedId, setSelectedId] = useState<string>('sms');

  return (
    <div className="billable-metrics-container">
      <h2>
        Billable metrics applicable for <span>“{productName || 'Selected Product'}”</span>
      </h2>
      <p className="billable-note">
        Billable metrics must be defined before adding them to a rate plan. Save this rate
        <br />
        plan as draft to create a new one now.
      </p>

      <div className="billable-metric-grid">
        {metrics.map((metric) => (
          <label
            key={metric.id}
            className={`billable-metric-card ${selectedId === metric.id ? 'selected' : ''}`}
          >
            <input
              type="radio"
              name="metric"
              value={metric.id}
              checked={selectedId === metric.id}
              onChange={() => setSelectedId(metric.id)}
            />
            <div className="billable-metric-content">
              <div>
                <div className="billable-metric-title">{metric.title}</div>
                <div className="billable-metric-subtitle">{metric.subtitle}</div>
              </div>
              <div className={`billable-icon-box ${metric.iconClass}`}>
                <div className="billable-icon-text">{metric.iconText}</div>
                <div className="billable-icon-sub">{metric.iconSubText}</div>
              </div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
};

export default EditBillable;
