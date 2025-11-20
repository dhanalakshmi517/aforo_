// ProductAnalyticsPage.tsx
import React from "react";
import ProductsByCategoryChart from "../../../admin/dashboards/analytics/ProductsByCategoryChart";
import ProductsByCategoryDonutChart from "../../../admin/dashboards/analytics/ProductsByCategoryDonutChart";
import AverageRatingByCategoryChart from "../../../admin/dashboards/analytics/AverageRatingByCategoryChart";
import TotalStockByCategoryChart from "../../../admin/dashboards/analytics/TotalStockByCategoryChart";
import AveragePriceByCategoryChart from "../../../admin/dashboards/analytics/AveragePriceByCategoryChart";
import RatingDistributionChart from "../../../admin/dashboards/analytics/RatingDistributionChart";
import PriceVsRatingScatterChart from "../../../admin/dashboards/analytics/PriceVsRatingScatterChart";
import AverageRatingLineChart from "../../../admin/dashboards/analytics/AverageRatingLineChart";
import UsageStackedAreaChart from "../../../admin/dashboards/analytics/UsageStackedAreaChart";
import ProductsDetailTable from "../../../admin/dashboards/analytics/ProductsDetailTable";
import RevenueAndProfitChart from "../../../admin/dashboards/analytics/RevenueAndProfitChart";
import TotalPageViewsCard from "../../../admin/dashboards/analytics/TotalPageViewsCard";
import TotalPayingUsersCard from "../../../admin/dashboards/analytics/TotalPayingUsersCard";
import TotalRevenueCard from "../../../admin/dashboards/analytics/TotalRevenueCard";
import TotalSignupsCard from "../../../admin/dashboards/analytics/TotalSignupsCard";
import ErrorRateCounterChart from "../../../admin/dashboards/analytics/ErrorRateCounterChart";
import GaugeChart from "../../../admin/dashboards/analytics/GaugeChart";

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

        <div className="pa-grid">
          {/* KPI Cards Row */}
          

          {/* row 1 */}
          <div className="pa-card pa-card-full">
            <UsageStackedAreaChart />
          </div>

          {/* row 2 */}
          <div className="pa-card">
            <ProductsByCategoryChart />
          </div>
          <div className="pa-card">
            <AverageRatingByCategoryChart/>
          </div>
          <div className="pa-card pa-card-full">
            <ProductsByCategoryDonutChart />
          </div>

          {/* row 3 */}
          <div className="pa-card pa-card-full">
            <ErrorRateCounterChart />
          </div>
          
          <div className="pa-card pa-card-full">
            <RevenueAndProfitChart />
          </div>
         
          <div className="pa-card pa-card-full">
            <TotalStockByCategoryChart />
          </div>

          {/* row 4 */}
          <div className="pa-card">
            <AveragePriceByCategoryChart />
          </div>
          <div className="pa-card">
            <GaugeChart />
          </div>
          
          {/* row 5 */}
          <div className="pa-card">
            <RatingDistributionChart />
          </div>

          {/* row 5 */}
          <div className="pa-card">
            <PriceVsRatingScatterChart />
          </div>
          <div className="pa-card pa-card-full">
            <AverageRatingLineChart />
          </div>

          {/* row 6 */}
          <div className="pa-card pa-card-full">
            <ProductsDetailTable />
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default ProductAnalyticsPage;
