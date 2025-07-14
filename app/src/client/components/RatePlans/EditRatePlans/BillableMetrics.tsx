import React, { useState } from 'react';
import './BillableMetrics.css';

const BillableMetrics: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'saved' | 'new'>('saved');

  return (
    <div className="metrics-wrapper">
      <div className="tab-toggle-container">
        <button
          className={`tab-toggle-button ${activeTab === 'saved' ? 'active' : ''}`}
          onClick={() => setActiveTab('saved')}
        >
          Pick a saved Metric
        </button>
        <button
          className={`tab-toggle-button ${activeTab === 'new' ? 'active' : ''}`}
          onClick={() => setActiveTab('new')}
        >
          Create New Metric
        </button>
      </div>

      {/* <div className="metric-box"> */}
        {activeTab === 'saved' && (
          <div className="form-group">
            <label className="label">Choose Metrics</label>
            <select className="select">
              <option value="">--Select--</option>
            </select>
          </div>
        )}

        {activeTab === 'new' && (
          <>
            <div className="form-group">
              <label className="label">Metric Name</label>
              <input type="text" placeholder="Placeholder" className="input" />
            </div>

            <div className="form-group">
              <label className="label">Description</label>
              <textarea
                placeholder="Placeholder Placeholder Placeholder"
                className="textarea"
                rows={3}
              />
            </div>

            <div className="form-group">
              <label className="label">Define Unit</label>
              <select className="select">
                <option value="">--select--</option>
              </select>
            </div>

            <div className="form-group">
              <label className="label">Define Aggregation Type</label>
              <select className="select">
                <option value="">--select--</option>
              </select>
            </div>

            <div className="checkbox-wrapper">
              <input type="checkbox" id="reuse" defaultChecked />
              <label htmlFor="reuse">Save Metric for Reuse</label>
            </div>
          </>
        )}
      </div>
    // </div>
  );
};

export default BillableMetrics;
