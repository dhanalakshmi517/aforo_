import React from 'react';
import { Routes, Route } from 'react-router-dom';
import EmptyPage from './components/EmptyPage/EmptyPage';
import EstimateRevenue from './components/Rateplan/Revenue/EstimateRevenue';

export default function RoutesComponent() {
  return (
    <Routes>
      <Route path="/get-started" element={<EmptyPage />} />
      <Route path="/estimate-revenue" element={<EstimateRevenue />} />
    </Routes>
  );
}
