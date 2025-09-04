import React, { useState, useEffect } from 'react';
import './Billable.css';

interface Metric {
  id: number;
  title: string;
  subtitle: string;
  iconText: string;
  iconSubText: string;
  iconClass: string;
  unit?: string;
  aggregation?: string;
}

const RadioIcon: React.FC<{ active: boolean }> = ({ active }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    style={{ marginRight: 8 }}
  >
    <circle
      cx="12"
      cy="12"
      r="11.5"
      stroke={active ? '#1976d2' : '#BDBBBE'}
      strokeWidth="1"
    />
    <circle cx="12" cy="12" r="6" fill={active ? '#1976d2' : '#BDBBBE'} />
  </svg>
);

interface BillableProps {
  productName?: string;
  selectedMetricId: number | null;
  onSelectMetric: (id: number) => void;
}

import { fetchBillableMetrics, BillableMetric } from './api';

const Billable: React.FC<BillableProps> = ({ productName, selectedMetricId, onSelectMetric }) => {
  // Metrics to display
  const [metrics, setMetrics] = useState<Metric[]>([]);

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        let data: BillableMetric[] = await fetchBillableMetrics(productName);
        if (productName) {
          data = data.filter((m: any) => m.productName === productName);
        }
        
        const colorClasses = ['bg-orange-100 text-orange-600','bg-purple-100 text-purple-600','bg-yellow-100 text-yellow-700','bg-teal-100 text-teal-700','bg-blue-100 text-blue-700','bg-pink-100 text-pink-600','bg-green-100 text-green-700'];
        const mapped: Metric[] = data.map((m, idx) => ({
          
          // build a unique id even if backend metricId is missing/duplicated
          id: (m as any).metricId ?? (m as any).billableMetricId,
          
          title: m.metricName, // display name from backend
          subtitle: '',
          iconText: m.metricName.slice(0, 3).toUpperCase(),
          iconSubText: m.metricName.length > 3 ? m.metricName.slice(3, 6) : '',
          iconClass: colorClasses[idx % colorClasses.length],
          // assuming backend may supply unit and aggregation fields
          unit: (m as any).unit,
          aggregation: (m as any).aggregationType,
        }));
        setMetrics(mapped);
      } catch (err) {
        console.error('Failed to load billable metrics', err);
      }
    };

    loadMetrics();
  }, [productName]);

  return (
    <div className="billable-section">
      <h2>
        Billable metrics applicable for <span>"{productName || 'Selected Product'}"</span>
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
            className={`billable-metric-card ${selectedMetricId === metric.id ? 'selected' : ''}`}
          >
            <input
              type="radio"
              name="metric"
              value={metric.id}
              checked={selectedMetricId === metric.id}
              onChange={() => {
                onSelectMetric(metric.id);
                // Persist details for review step
                localStorage.setItem('billableMetricName', metric.title);
                localStorage.setItem('billableMetricDescription', metric.subtitle || '');
                if (metric.unit) localStorage.setItem('billableMetricUnit', metric.unit);
                if (metric.aggregation) localStorage.setItem('billableMetricAggregation', metric.aggregation);
              }}
              className="hidden"
            />
            <RadioIcon active={selectedMetricId === metric.id} />
            <div className="billable-metric-content">
              <div className="billable-metric-info">
                <div className="billable-metric-title">{metric.title}</div>
                <div className="billable-metric-subtitle">Metric Unit</div>
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

export default Billable;