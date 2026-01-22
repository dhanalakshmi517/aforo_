import React from "react";
import "./QuickSync.css";
import quickImage from "./quick.svg";

const QuickSync: React.FC = () => {
  return (
    <div className="sync-container">
      <h2 className="sync-title">Sync Products Instantly</h2>

      <p className="sync-description">
        Import products from other API gateways and manage all billing within
        Aforo. Enjoy real-time ingestion with hassle-free services.
      </p>

      <div className="sync-visual">
        <img
          src={quickImage}
          alt="Sync products illustration"
          className="sync-image"
        />
      </div>
    </div>
  );
};

export default QuickSync;
