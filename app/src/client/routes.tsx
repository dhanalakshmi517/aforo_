import React from 'react';
import { Routes, Route } from 'react-router-dom';
import EmptyPage from './components/EmptyPage/EmptyPage';

export default function RoutesComponent() {
  return (
    <Routes>
      <Route path="/get-started" element={<EmptyPage />} />
      {/* Add other routes here */}
    </Routes>
  );
}
