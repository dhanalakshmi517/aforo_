import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './ApigeeImportedProducts.css';
import {
  getImportedApigeeProducts,
  deleteImportedApigeeProduct,
  ImportedApigeeProduct,
} from './api';

// single letter from product name
const productLetterFromName = (name: string) => {
  if (!name) return 'P';
  return name.trim().charAt(0).toUpperCase();
};

const ApigeeImportedProducts: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const importedCount = (location.state as any)?.importedCount as
    | number
    | undefined;

  const [items, setItems] = useState<ImportedApigeeProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchImported = async () => {
      console.log('🔍 [API DEBUG] Starting fetchImported...');
      setLoading(true);
      try {
        console.log('🔍 [API DEBUG] Calling getImportedApigeeProducts()...');
        const data = await getImportedApigeeProducts();
        console.log('🔍 [API DEBUG] getImportedApigeeProducts() returned:', data);
        console.log('🔍 [API DEBUG] Data type:', typeof data);
        console.log('🔍 [API DEBUG] Data length:', data?.length);
        setItems(data || []);
      } catch (err) {
        console.error(
          '[ApigeeImportedProducts] Failed to fetch imported products',
          err
        );
        console.log('🔍 [API DEBUG] Error details:', err);
      } finally {
        console.log('🔍 [API DEBUG] fetchImported completed, setting loading to false');
        setLoading(false);
      }
    };

    fetchImported();
  }, []);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/get-started/integrations');
    }
  };

  const handleDelete = async (id: string) => {
    if (deletingId) return;
    setDeletingId(id);
    try {
      await deleteImportedApigeeProduct(id);
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error(
        '[ApigeeImportedProducts] Failed to delete imported product',
        err
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="apigee-imported-page">
      {/* TOP BAR */}
      <header className="apigee-imported-header">
        <div className="apigee-imported-header-bar">
          <button className="apigee-imported-back" onClick={handleBack}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
            >
              <path
                d="M10.0001 15.8334L4.16675 10.0001M4.16675 10.0001L10.0001 4.16675M4.16675 10.0001H15.8334"
                stroke="#6B7280"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <h1 className="apigee-imported-title">Apigee Imported Products</h1>
        </div>
      </header>

      {/* SUCCESS BANNER */}
      {typeof importedCount === 'number' && importedCount > 0 && (
        <div className="apigee-imported-banner">
          Imported {importedCount} Apigee product
          {importedCount > 1 ? 's' : ''} successfully.
        </div>
      )}

      {/* MAIN CARD */}
      <main className="apigee-imported-main">
        <section className="apigee-imported-card">
          {/* TABLE HEADER */}
          <div className="apigee-imported-card-header">
            <div className="apigee-imported-header-cell apigee-imported-header-name">
              Product Name
            </div>
            <div className="apigee-imported-header-cell apigee-imported-header-type">
              Product Type
            </div>
            <div className="apigee-imported-header-cell apigee-imported-header-imported">
              Imported On
            </div>
            <div className="apigee-imported-header-cell apigee-imported-header-actions">
              Actions
            </div>
          </div>

          {/* TABLE BODY */}
          <div className="apigee-imported-card-body">
            {loading && (
              <div className="apigee-imported-row apigee-imported-row-empty">
                Loading imported products…
              </div>
            )}

            {!loading && items.length === 0 && (
              <div className="apigee-imported-row apigee-imported-row-empty">
                No history yet.
              </div>
            )}

            {!loading &&
              items.map(item => {
                const letter = productLetterFromName(item.productName);
                const importedDate = new Date(item.importedOn);
                const isValidDate = !Number.isNaN(importedDate.getTime());
                const formattedDate = isValidDate
                  ? importedDate.toLocaleString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                    timeZoneName: 'short',
                  })
                  : '-';

                return (
                  <div key={item.id} className="apigee-imported-row">
                    {/* PRODUCT NAME CELL */}
                    <div className="apigee-imported-product-cell">
                      <div className="apigee-imported-product-row">
                        {/* PRODUCT ICON STACK */}
                        <div className="apigee-imported-logo-container">
                          <div className="apigee-imported-logo-stack">
                            <div className="apigee-imported-logo-back" />
                            <div className="apigee-imported-logo-foreground">
                              <span className="apigee-imported-logo-letter">
                                {letter}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="apigee-imported-product-name-container">
                          <div className="apigee-imported-product-name">
                            {item.productName}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* TYPE CELL */}
                    <div className="apigee-imported-type-cell">
                      <span className="apigee-imported-type-pill">
                        {item.productType || '--'}
                      </span>
                    </div>

                    {/* IMPORTED ON CELL */}
                    <div className="apigee-imported-date-cell">
                      {formattedDate}
                    </div>

                    {/* ACTIONS CELL */}
                    <div className="apigee-imported-actions-cell">
                      <button
                        className="apigee-imported-delete-btn"
                        onClick={() => handleDelete(item.id)}
                        disabled={deletingId === item.id}
                        title="Delete imported product"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                        >
                          <path
                            d="M3.33325 4.66667H12.6666M10.9999 4.66667V11.3333C10.9999 11.5101 10.9297 11.6797 10.8047 11.8047C10.6797 11.9298 10.5101 12 10.3333 12H5.66659C5.4898 12 5.32023 11.9298 5.19521 11.8047C5.07018 11.6797 4.99992 11.5101 4.99992 11.3333V4.66667M6.66659 4.66667V3.33333C6.66659 3.15652 6.73685 2.98695 6.86187 2.86193C6.9869 2.7369 7.15647 2.66667 7.33325 2.66667H8.66659C8.84337 2.66667 9.01294 2.7369 9.13796 2.86193C9.26299 2.98695 9.33325 3.15652 9.33325 3.33333V4.66667"
                            stroke="#F9735B"
                            strokeWidth="1.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </section>
      </main>
    </div>
  );
};

export default ApigeeImportedProducts;
