// ProductAnalyticsPage.tsx
import React from "react";
import "./ProductAnalyticsPage.css";
import ProductsChart from './recharts/ProductsChart';
import ProductsDonutChart from './recharts/ProductsDonutChart';
import ProductsAreaChart from './recharts/ProductsAreaChart';
import ProductsPriceLineChart from './recharts/ProductsPriceLineChart';
import ProductsScatterChart from './recharts/ProductsScatterChart';
import ProductsStackedBarChart from './recharts/ProductStackedBarChart';
// import ProductsCategoryBarChart from './recharts/ProductsCategoryBarChart';
import ProductsCategoryPieChart from './recharts/ProductsCategoryPieChart';
import ProductsHorizantalBarChart from './recharts/ProductsHorizantalBarChart';
import SolarInverterAreaChart from './recharts/SolarInverterAreaChart';
import SolarInverterComboChart from './recharts/SolarInverterComboChart';

const ProductAnalyticsPage: React.FC = () => {
  return (
    <div className="pa-page">
      <div className="pa-container">
        <header className="pa-header">
          <h1>Product Analytics</h1>
          <p>
            Insights based on products data 
          </p>
        </header>

      
        {/* Charts container with explicit height and spacing */}
        <div style={{ marginTop: "2rem", display: "flex", flexDirection: "column", gap: "2rem" }}>
          {/* First chart with explicit height */}
          <div style={{ minHeight: "500px" ,border:"1px solid #025A94" }}>
            <ProductsChart />
          </div>
          
          {/* Second chart with explicit height */}
          <div style={{ minHeight: "500px", marginTop: "2rem" ,border:"1px solid #025A94"}}>
            <ProductsDonutChart />
          </div>

           <div style={{ minHeight: "500px", marginTop: "2rem",border:"1px solid #025A94" }}>
            <ProductsAreaChart />
          </div>

           <div style={{ minHeight: "500px", marginTop: "2rem" ,border:"1px solid #025A94"}}>
            <ProductsPriceLineChart />
          </div>

           <div style={{ minHeight: "500px", marginTop: "2rem",border:"1px solid #025A94" }}>
            <ProductsScatterChart />
          </div>

           <div style={{ minHeight: "500px", marginTop: "2rem",border:"1px solid #025A94" }}>
            <ProductsStackedBarChart />
          </div>

           <div style={{ minHeight: "500px", marginTop: "2rem",border:"1px solid #025A94" }}>
            <SolarInverterAreaChart/>
          </div>
          
          <div style={{ minHeight: "500px", marginTop: "2rem",border:"1px solid #025A94" }}>
          <ProductsHorizantalBarChart/>
          </div>

           <div style={{ minHeight: "500px", marginTop: "2rem" ,border:"1px solid #025A94"}}>
            <SolarInverterComboChart />
          </div>



          
        </div>
      </div>
    </div>
  );
};

export default ProductAnalyticsPage;
