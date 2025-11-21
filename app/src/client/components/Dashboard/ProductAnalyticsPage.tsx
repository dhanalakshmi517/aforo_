// ProductAnalyticsPage.tsx
import React from "react";
import ProductPriceBarChart from "./tremor charts/ProductPriceBarChart";
import ProductStockBarChart from "./tremor charts/ProductStockBarChart";
import "./ProductAnalyticsPage.css";

const ProductAnalyticsPage: React.FC = () => {
  return (
    <div className="pa-page" style={{ marginLeft: "250px" }}>
      <div className="pa-container">
        <header className="pa-header">
          <h1>Product Analytics</h1>
          <p>
            Insights based on products data from dummyjson.com (products by
            category).
          </p>
        </header>

      
        {/* Charts container with explicit height and spacing */}
        <div style={{ marginTop: "2rem", display: "flex", flexDirection: "column", gap: "2rem" }}>
          {/* First chart with explicit height */}
          <div style={{ minHeight: "500px" }}>
            <ProductPriceBarChart />
          </div>
          
          {/* Second chart with explicit height */}
          <div style={{ minHeight: "500px", marginTop: "2rem" }}>
            <ProductStockBarChart />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductAnalyticsPage;
