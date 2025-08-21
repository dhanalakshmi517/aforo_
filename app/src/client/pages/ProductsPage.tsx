import React, { useState } from 'react';
import Products from '../components/Products/Products';

export default function ProductsPage() {
  const [showNewProductForm, setShowNewProductForm] = useState(false);
  
  return <Products 
    showNewProductForm={showNewProductForm} 
    setShowNewProductForm={setShowNewProductForm} 
  />;
}
