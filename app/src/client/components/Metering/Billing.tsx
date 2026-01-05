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
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Prevent multiple simultaneous calls
    if (isLoading) return;
    
    // Fetch metrics once on mount
    let isMounted = true;
    (async () => {
      try {
        setIsLoading(true);
        setHasError(false);
        const data = await getUsageMetrics();
        if (isMounted) {
          setMetrics(data);
        }
      } catch (error) {
        console.error('Failed to load metrics:', error);
        if (isMounted) {
          setHasError(true);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    })();
    
    return () => {
      isMounted = false;
    };
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
