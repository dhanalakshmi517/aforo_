import React from 'react';
import { Routes, Route } from 'react-router-dom';
import EmptyPage from './components/EmptyPage/EmptyPage';
import EstimateRevenue from './components/Rateplan/Revenue/EstimateRevenue';
import ApigeeIntegration from './components/ApigeeIntegration/ApigeeIntegration';
import ApigeeSuccess from './components/ApigeeIntegration/ApigeeSuccess';
import ApigeeFailure from './components/ApigeeIntegration/ApigeeFailure';
import ApigeeImport from './components/ApigeeIntegration/ApigeeImport';
import ApigeeImportedProducts from './components/ApigeeIntegration/ApigeeImportedProductsPage';
import ImportProducts from './components/componenetsss/ImportProducts';

export default function RoutesComponent() {
  return (
    <Routes>
      <Route path="/get-started" element={<EmptyPage />} />
      <Route path="/estimate-revenue" element={<EstimateRevenue />} />
      <Route path="/get-started/integrations/apigee" element={<ApigeeIntegration />} />
      <Route path="/apigee-success" element={<ApigeeSuccess />} />
      <Route path="/apigee-failure" element={<ApigeeFailure />} />
      <Route path="/get-started/integrations/apigee/import" element={<ApigeeImport />} />
      <Route path="/get-started/integrations/apigee/imported-products" element={<ApigeeImportedProducts />} />
      <Route path="/get-started/products/import" element={<ImportProducts />} />
    </Routes>
  );
}
