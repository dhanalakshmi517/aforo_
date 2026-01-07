import React from "react";
import RealTimeHeader from "./RealTimeHeader";
import RealTimekpiCards from "./RealTimekpiCards";
import RealTimePaymentWidgets from "./RealTimePaymentWidgets";
import CustomersByUsageCard from "./CustomersByUsageCard";
import BIllableHeatmapAndRevenue from "./BIllableHeatmapAndRevenue";
import "./RealTimeTracking.css";

const RealTimeTracking: React.FC = () => {
  return (
    <div className="real-time-tracking">
      <RealTimeHeader />
      
      <div className="real-time-content">
        <div className="real-time-grid">
          <div className="real-time-row">
            <RealTimekpiCards />
          </div>
          
          <div className="real-time-row">
            <RealTimePaymentWidgets />
          </div>
          
          <div className="real-time-row">
            <CustomersByUsageCard />
          </div>
          
          <div className="real-time-row">
            <BIllableHeatmapAndRevenue />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeTracking;
