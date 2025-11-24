import React, { useMemo, useState } from "react";
import "./KongProducts.css";
import SelectableCard from "../../componenetsss/SelectableCard";
import PrimaryButton from "../../componenetsss/PrimaryButton";
import Checkbox from "../../componenetsss/Checkbox";

type Product = {
  id: string;
  name: string;
  description: string;
  selected?: boolean;
};

interface KongProductsProps {
  products?: any[];
  onImport?: (selectedIds: string[]) => void;
}

const KongProducts: React.FC<KongProductsProps> = ({ products: kongProducts = [], onImport }) => {
  // Transform Kong API products to local Product format
  const initialProducts: Product[] = kongProducts.length > 0 
    ? kongProducts.map((p: any) => ({
        id: p.id,
        name: p.name,
        description: p.description || "",
        selected: false,
      }))
    : [];

  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [search, setSearch] = useState("");

  const filteredProducts = useMemo(
    () =>
      products.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      ),
    [products, search]
  );

  const selectedCount = useMemo(
    () => products.filter((p) => p.selected).length,
    [products]
  );

  const allSelected = useMemo(
    () => products.length > 0 && products.every((p) => p.selected),
    [products]
  );

  const toggleProduct = (id: string) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, selected: !p.selected } : p
      )
    );
  };

  const handleSelectAll = () => {
    setProducts((prev) => prev.map((p) => ({ ...p, selected: true })));
  };

  const handleClearAll = () => {
    setProducts((prev) => prev.map((p) => ({ ...p, selected: false })));
  };

  const handleImport = () => {
    const selectedIds = products.filter((p) => p.selected).map((p) => p.id);
    console.log("Importing products:", selectedIds);
    if (onImport) {
      onImport(selectedIds);
    }
  };

  return (
    <div className="kong-products-page">
      <div className="kong-products-card">
        {/* Top header row */}
        <div className="kong-products-header">
        <div className="kong-products-header-top">
          <div className="kong-products-header-left">
            <h1 className="kong-products-title">Import Apigee Products</h1>
            <p className="kong-products-selected-text">
              {selectedCount} Products selected
            </p>
          </div>

          <div className="kong-products-search-wrapper">
            <span className="kong-products-search-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 20 20"
                fill="none"
              >
                <path
                  d="M18.3334 18.3332L15.0001 14.9998M17.5001 9.1665C17.5001 13.3086 14.1422 16.6665 10.0001 16.6665C5.85794 16.6665 2.50008 13.3086 2.50008 9.1665C2.50008 5.02436 5.85794 1.6665 10.0001 1.6665C14.1422 1.6665 17.5001 5.02436 17.5001 9.1665Z"
                  stroke="#8DA0C5"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <input
              type="text"
              className="kong-products-search-input"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        
        <div className="kong-products-select-actions">
          <Checkbox
            label="Select All"
            checked={allSelected}
            onChange={(checked) =>
              checked ? handleSelectAll() : handleClearAll()
            }
          />
          <button
            type="button"
            className="kong-products-clear-btn"
            onClick={handleClearAll}
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Scrollable content container */}
      <div className="kong-products-content">
        {/* Cards grid */}
        <div className="kong-products-grid">
          {filteredProducts.map((product) => (
            <SelectableCard
              key={product.id}
              title={product.name}
              version={product.name}
              meta={product.description}
              selected={product.selected || false}
              onSelectedChange={() => toggleProduct(product.id)}
            />
          ))}
        </div>
      </div>

      {/* Fixed footer with button */}
      <div className="kong-products-footer">
        <div className="kong-products-footer-line" />
        <div className="kong-products-footer-actions">
          <PrimaryButton
            className="kong-products-import-btn"
            onClick={handleImport}
          >
            Import Products
          </PrimaryButton>
        </div>
      </div>
      </div>
    </div>
  );
};

export default KongProducts;
