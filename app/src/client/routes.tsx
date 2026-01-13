import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import EmptyPage from './components/EmptyPage/EmptyPage';
import EstimateRevenue from './components/Rateplan/Revenue/EstimateRevenue';
import ApigeeIntegration from './components/ApigeeIntegration/ApigeeIntegration';
import ApigeeSuccess from './components/ApigeeIntegration/ApigeeSuccess';
import ApigeeFailure from './components/ApigeeIntegration/ApigeeFailure';
import ApigeeImport from './components/ApigeeIntegration/ApigeeImport';
import ApigeeImportedProducts from './components/ApigeeIntegration/ApigeeImportedProductsPage';
import ImportProducts from './components/componenetsss/ImportProducts';
import RealTimeTracking from './components/Dashboard/Real-time analysis/RealTimeTracking';
import QBIntegration from './components/Integrations/Quickbooks/QBIntegration';
import SuccessQB from './components/Integrations/Quickbooks/SuccessQB';

export default function RoutesComponent() {
  const navigate = useNavigate();
  
  return (
    <Routes>
      <Route path="/get-started" element={<EmptyPage />} />
      <Route path="/estimate-revenue" element={<EstimateRevenue />} />
      <Route path="/get-started/integrations/apigee" element={<ApigeeIntegration />} />
      <Route path="/apigee-success" element={
        <ApigeeSuccess 
          onBack={() => {}}
          onImportProducts={() => {}}
        />
      } />
      <Route path="/apigee-failure" element={
        <ApigeeFailure 
          onBack={() => {}}
          onTryAgain={() => {}}
        />
      } />
      <Route path="/get-started/integrations/apigee/import" element={<ApigeeImport />} />
      <Route path="/get-started/integrations/apigee/imported-products" element={<ApigeeImportedProducts />} />
      <Route path="/get-started/products/import" element={<ImportProducts />} />
      <Route path="/get-started/dashboards/real-time-tracking" element={<RealTimeTracking />} />
      <Route path="/quickbooks-integration" element={
        <QBIntegration 
          heroSrc="/quickbooks-hero.png"
          onBack={() => navigate('/integrations')}
          onConnect={() => navigate('/quickbooks-success')}
        />
      } />
      <Route path="/quickbooks-success" element={
        <SuccessQB 
          onBack={() => navigate('/quickbooks-integration')}
          onViewCustomerSyncStatus={() => {}}
        />
      } />
    </Routes>
  );
}
