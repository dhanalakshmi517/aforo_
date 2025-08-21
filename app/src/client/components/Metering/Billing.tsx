import React, { useEffect, useState } from 'react';
import { getUsageMetrics, UsageMetricDTO } from './api';
import './Billing.css';

interface BillingProps {
  /** Currently selected metric id */
  selectedMetricId: number | null;
  /** Callback when user selects a metric */
  onSelectMetric: (id: number) => void;
}

const Billing: React.FC<BillingProps> = ({ selectedMetricId, onSelectMetric }) => {
  // Local state that holds metrics fetched from backend
  const [metrics, setMetrics] = useState<UsageMetricDTO[]>([]);

  useEffect(() => {
    // Fetch metrics once on mount
    (async () => {
      const data = await getUsageMetrics();
      setMetrics(data);
    })();
  }, []);

  return (
    <div className="billing-form-wrapper">
      <div className="form-cardss">
        <div className="form-groupss">
          <label>Function</label>
          <select
            value={selectedMetricId ?? ''}
            onChange={e => onSelectMetric(Number(e.target.value))}
          >
            <option value="">--select--</option>
            {metrics.map(m => (
              <option key={m.metricId} value={m.metricId}>
                {m.metricName}
              </option>
            ))}
          </select>
        </div>

        <div className="form-groupss">
          <label>Aggregation Window</label>
          <input type="text" placeholder="Placeholder" />
        </div>

        <div className="form-groupss">
          <label>Group_By Keys</label>
          <select>
            <option>--select--</option>
          </select>
        </div>

        <div className="form-groupss">
          <label>Threshold</label>
          <select>
            <option>--select--</option>
          </select>
        </div>

        <div className="form-groupss">
          <label>Reset Behavior</label>
          <select>
            <option>--select--</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default Billing;
