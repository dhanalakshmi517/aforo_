import React from "react";
import "./KongImportedProducts.css";
import SecondaryButton from "../../componenetsss/SecondaryButton";
import PrimaryButton from "../../componenetsss/PrimaryButton";

interface ImportedProduct {
  id: string;
  name: string;
  externalId: string;
}

interface KongImportedProductsProps {
  onBack?: () => void;
}

const mockedProducts: ImportedProduct[] = [
  { id: "1", name: "Chatbot cloud api", externalId: "ID23BK7X9675997464" },
  { id: "2", name: "Chatbot cloud api", externalId: "ID23BK7X9675997464" },
  { id: "3", name: "Chatbot cloud api", externalId: "ID23BK7X9675997464" },
  { id: "4", name: "Chatbot cloud api", externalId: "ID23BK7X9675997464" },
  { id: "5", name: "Chatbot cloud api", externalId: "ID23BK7X9675997464" },
  { id: "6", name: "Chatbot cloud api", externalId: "ID23BK7X9675997464" },
  { id: "7", name: "Chatbot cloud api", externalId: "ID23BK7X9675997464" },
  { id: "8", name: "Chatbot cloud api", externalId: "ID23BK7X9675997464" },
  { id: "9", name: "Chatbot cloud api", externalId: "ID23BK7X9675997464" },
  { id: "10", name: "Chatbot cloud api", externalId: "ID23BK7X9675997464" },
  { id: "11", name: "Chatbot cloud api", externalId: "ID23BK7X9675997464" },
  { id: "12", name: "Chatbot cloud api", externalId: "ID23BK7X9675997464" },
];

const productTypeOptions = [
  "Select product type",
  "API",
  "LLM Token Model",
  "Flat File",
  "SQL Result",
];

const KongImportedProducts: React.FC<KongImportedProductsProps> = ({ onBack }) => {
  const handleRemove = (id: string) => {
    console.log("Remove imported product:", id);
  };

  const handleBack = () => {
    console.log("Back button clicked, onBack prop:", onBack);
    if (onBack) {
      onBack();
    }
  };

  const handleImport = () => {
    console.log("Import Products clicked");
  };

  return (
    <div className="kong-imported-products-page">

      <div className="kong-imported-products-wrapper">
        <div className="kong-imported-products-header">
          <h1 className="kong-imported-products-title">Import Kong Products</h1>
        </div>

        <div className="kong-imported-products-grid">
          {mockedProducts.map((p) => (
            <div key={p.id} className="kong-imported-products-card">
              <div className="kong-imported-products-card-header">
                <div>
                  <div className="kong-imported-products-card-name">
                    {p.name}
                  </div>
                  <div className="kong-imported-products-card-id">
                    {p.externalId}
                  </div>
                </div>
                <button
                  type="button"
                  className="kong-imported-products-close-btn"
                  onClick={() => handleRemove(p.id)}
                >
                  ×
                </button>
              </div>

              <div className="kong-imported-products-select-wrapper">
                <select className="kong-imported-products-select">
                  {productTypeOptions.map((opt) => (
                    <option
                      key={opt}
                      value={opt === "Select product type" ? "" : opt}
                    >
                      {opt}
                    </option>
                  ))}
                </select>
                <span className="kong-imported-products-select-chevron">⌄</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="kong-imported-products-bottom-bar">
        <div className="kong-imported-products-bottom-inner">
          <SecondaryButton onClick={handleBack}>
            Back
          </SecondaryButton>
          <PrimaryButton onClick={handleImport}>
            Import Products
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
};

export default KongImportedProducts;
