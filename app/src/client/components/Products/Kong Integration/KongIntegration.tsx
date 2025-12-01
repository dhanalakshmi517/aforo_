import React, { useMemo, useState } from "react";
import "./KongIntegration.css";
import KongBar from "./KongBar";
import PrimaryButton from "../../componenetsss/PrimaryButton";
import SecondaryButton from "../../componenetsss/SecondaryButton";
import SelectableCard from "../../componenetsss/SelectableCard";
import kongHelperImage from "./kong1.svg";
import kongImage from "./kong.svg";
import KongProducts from "./KongProducts";
import KongImportedProducts from "./KongImportedProducts";
import { clearAuthData, getAuthData } from "../../../utils/auth";

interface KongIntegrationProps {
  onClose: () => void;
}

const KongIntegration: React.FC<KongIntegrationProps> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState<"connection" | "import" | "imported" | "assign">("connection");
  const [isConnected, setIsConnected] = useState(false);
  const [region, setRegion] = useState<string>("");
  const [token, setToken] = useState<string>("");
  const [selectedCountry, setSelectedCountry] = useState<string>("IN");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [kongProducts, setKongProducts] = useState<any[]>([]);
  const [connectionId, setConnectionId] = useState<string | null>(null);
  const [tokenFieldFocused, setTokenFieldFocused] = useState(false);

  const isImportStep = currentStep === "import";
  const isImportedStep = currentStep === "imported";
  const isAssignStep = currentStep === "assign";
  const isStepOneCompleted = isConnected || isImportStep || isImportedStep || isAssignStep;

  // Get base URL based on selected country
  const getBaseUrl = () => {
    switch (selectedCountry) {
      case "AU": return "https://au.api.konghq.com";
      case "EU": return "https://eu.api.konghq.com";
      case "IN": return "https://in.api.konghq.com";
      case "ME": return "https://me.api.konghq.com";
      case "SG": return "https://sg.api.konghq.com";
      case "US": return "https://us.api.konghq.com";
      default: return "https://in.api.konghq.com";
    }
  };

  // Handle country selection
  const handleCountrySelect = (country: string) => {
    setSelectedCountry(country);
  };

  // Fetch Kong products from database
  const fetchKongProducts = async (id: string) => {
    try {
      const authData = getAuthData();
      const response = await fetch(`http://44.203.209.2:8086/api/kong/fetch/from-db/${id}`, {
        headers: {
          "Content-Type": "application/json",
          ...(authData?.token && { Authorization: `Bearer ${authData.token}` })
        }
      });
      
      if (response.status === 401) {
        clearAuthData();
        window.location.href = '/login?session_expired=true';
        throw new Error("Session expired. Please login again.");
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch products with status ${response.status}`);
      }

      const data = await response.json();
      console.log("Kong products:", data);
      
      // Extract products from response
      const products = data[0]?.data || [];
      setKongProducts(products);
    } catch (err) {
      console.error("Error fetching Kong products:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch Kong products");
    }
  };

  // Handle importing selected products
  const handleImportProducts = async (selectedIds: string[]) => {
    if (selectedIds.length === 0) {
      setError("Please select at least one product to import");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const authData = getAuthData();
      const response = await fetch("http://44.203.209.2:8086/api/kong/import-selected", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authData?.token && { Authorization: `Bearer ${authData.token}` })
        },
        body: JSON.stringify(selectedIds)
      });

      if (response.status === 401) {
        clearAuthData();
        window.location.href = '/login?session_expired=true';
        throw new Error("Session expired. Please login again.");
      }

      if (!response.ok) {
        throw new Error(`Import failed with status ${response.status}`);
      }

      const data = await response.json();
      console.log("Import response:", data);
      
      // Close modal on successful import
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to import products");
      console.error("Import error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle API call to submit Kong integration details
  const submitKongIntegration = async () => {
    if (!token || !region) {
      setError("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const authData = getAuthData();
      const response = await fetch("http://44.203.209.2:8086/api/client-api-details", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authData?.token && { Authorization: `Bearer ${authData.token}` })
        },
        body: JSON.stringify({
          base_url: getBaseUrl(),
          endpoint: "/v2/api-products",
          auth_token: token
        })
      });

      if (response.status === 401) {
        clearAuthData();
        window.location.href = '/login?session_expired=true';
        throw new Error("Session expired. Please login again.");
      }

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      console.log("API response:", data);
      
      // Extract connection ID and store it
      const id = data.id;
      if (id) {
        setConnectionId(id);
      }
      
      // Set connected state (show success screen)
      setIsConnected(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect to Kong");
      console.error("Kong integration error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle going to products (calls GET API)
  const handleGoToProducts = async () => {
    if (!connectionId) {
      setError("Connection ID not found");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await fetchKongProducts(connectionId);
      setCurrentStep("import");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch products");
      console.error("Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="kong-page">
      <KongBar onBack={onClose} />
      <div className="kong-frame">
        {/* LEFT SIDEBAR */}
        <aside className="kong-sidebar">
          <div className="kong-stepper">
            {/* Step 1: active card */}
            <div
              className={`kong-step ${
(isStepOneCompleted && !isAssignStep) ? "kong-step--completed" : "kong-step--active"
              }`}
              onClick={() => isConnected && setCurrentStep("connection")}
              style={{ cursor: isConnected ? "pointer" : "default" }}
            >
              <div
                className={`kong-step-icon ${
                  (isStepOneCompleted && !isAssignStep) ? "kong-step-icon--completed" : "kong-step-icon--active"
                }`}
              >
                {isConnected ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                  >
                    <path
                      d="M10.2489 3.08115L12.665 0.665039M0.665039 12.665L3.08115 10.2489M9.12142 9.12142L6.86638 11.2959C6.68681 11.4761 6.47343 11.6191 6.23849 11.7166C6.00354 11.8142 5.75165 11.8644 5.49725 11.8644C5.24286 11.8644 4.99097 11.8142 4.75602 11.7166C4.52107 11.6191 4.3077 11.4761 4.12813 11.2959L2.03417 9.20195C1.85397 9.02238 1.71099 8.809 1.61344 8.57406C1.51588 8.33911 1.46566 8.08722 1.46566 7.83282C1.46566 7.57843 1.51588 7.32654 1.61344 7.09159C1.71099 6.85665 1.85397 6.64327 2.03417 6.4637L4.12813 4.39328M9.12142 9.12142L4.12813 4.39328M9.12142 9.12142L11.2959 6.86638C11.4761 6.68681 11.6191 6.47343 11.7166 6.23849C11.8142 6.00354 11.8644 5.75165 11.8644 5.49725C11.8644 5.24286 11.8142 4.99097 11.7166 4.75602C11.6191 4.52107 11.4761 4.3077 11.2959 4.12813L9.20195 2.03417C9.02238 1.85397 8.809 1.71099 8.57406 1.61344C8.33911 1.51588 8.08722 1.46566 7.83282 1.46566C7.57843 1.46566 7.32654 1.51588 7.09159 1.61344C6.85665 1.71099 6.64327 1.85397 6.4637 2.03417L4.12813 4.39328"
                      stroke="#389315"
                      strokeWidth="1.33"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="15"
                    height="15"
                    viewBox="0 0 15 15"
                    fill="none"
                  >
                    <path
                      d="M12.0001 2.6665L14.0001 0.666504M0.666748 13.9998L2.66675 11.9998M4.33341 8.33317L6.00008 6.6665M6.33341 10.3332L8.00008 8.6665M3.53341 12.8665C3.68206 13.0157 3.85869 13.134 4.05317 13.2148C4.24765 13.2955 4.45617 13.3371 4.66675 13.3371C4.87733 13.3371 5.08584 13.2955 5.28032 13.2148C5.47481 13.134 5.65144 13.0157 5.80008 12.8665L7.33341 11.3332L3.33341 7.33317L1.80008 8.8665C1.65092 9.01515 1.53257 9.19178 1.45181 9.38626C1.37106 9.58074 1.32949 9.78925 1.32949 9.99984C1.32949 10.2104 1.37106 10.4189 1.45181 10.6134C1.53257 10.8079 1.65092 10.9845 1.80008 11.1332L3.53341 12.8665ZM7.33341 3.33317L11.3334 7.33317L12.8667 5.79984C13.0159 5.65119 13.1343 5.47456 13.215 5.28008C13.2958 5.0856 13.3373 4.87709 13.3373 4.6665C13.3373 4.45592 13.2958 4.24741 13.215 4.05293C13.1343 3.85844 13.0159 3.68182 12.8667 3.53317L11.1334 1.79984C10.9848 1.65067 10.8081 1.53232 10.6137 1.45157C10.4192 1.37081 10.2107 1.32924 10.0001 1.32924C9.7895 1.32924 9.58099 1.37081 9.38651 1.45157C9.19202 1.53232 9.01539 1.65067 8.86675 1.79984L7.33341 3.33317Z"
                      stroke="#F9FBFD"
                      strokeWidth="1.33333"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
              <div className="kong-step-content">
                <div className="kong-step-title">{isConnected ? "Manage Connection" : "Establish Connection"}</div>
                <div className="kong-step-subtitle">
                  {isConnected ? "Connected" : "Connecting"}
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div
              className={`kong-step ${
                isImportStep || isAssignStep ? "kong-step--active" : "kong-step--inactive"
              }`}
              onClick={() => isImportStep && setCurrentStep("connection")}
              style={{ cursor: isImportStep ? "pointer" : "default" }}
            >
              <div
                className={`kong-step-icon ${
                  isImportStep || isAssignStep ? "kong-step-icon--active" : "kong-step-icon--inactive"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="15"
                  viewBox="0 0 14 15"
                  fill="none"
                >
                  <path
                    d="M0.961963 4.09368L6.76196 7.42702M6.76196 7.42702L12.562 4.09368M6.76196 7.42702L6.76196 14.0937M12.762 4.76035C12.7617 4.52653 12.7 4.29689 12.583 4.09446C12.466 3.89203 12.2978 3.72393 12.0953 3.60702L7.42863 0.940351C7.22594 0.823327 6.99601 0.761719 6.76196 0.761719C6.52791 0.761719 6.29799 0.823327 6.0953 0.940351L1.42863 3.60702C1.22614 3.72393 1.05795 3.89203 0.940937 4.09446C0.823925 4.29689 0.762203 4.52653 0.761963 4.76035V10.0937C0.762203 10.3275 0.823925 10.5571 0.940937 10.7596C1.05795 10.962 1.22614 11.1301 1.42863 11.247L6.0953 13.9137C6.29799 14.0307 6.52791 14.0923 6.76196 14.0923C6.99601 14.0923 7.22594 14.0307 7.42863 13.9137L12.0953 11.247C12.2978 11.1301 12.466 10.962 12.583 10.7596C12.7 10.5571 12.7617 10.3275 12.762 10.0937V4.76035Z"
                    stroke={isImportStep || isAssignStep ? "#FFFFFF" : "#D1D7E0"}
                    strokeWidth="1.52381"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="kong-step-content">
                <div className="kong-step-title">Import Kong Products</div>
                <div className="kong-step-subtitle">{isAssignStep ? "Assigning" : "Import"}</div>
              </div>
            </div>
          </div>

          <div className="kong-sidebar-footer">
            <SecondaryButton disabled fullWidth className="kong-import-history">
              Import History
            </SecondaryButton>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="kong-main">
          {currentStep === "connection" ? (
            <div className="kong-connection-card">
              {!isConnected ? (
                <>
                  <div className="kong-connection-header">
                    <h2>Connection Management</h2>
                  </div>

                  <div className="kong-connection-body">
                    {/* FORM SIDE */}
                    <div className="kong-form">
                      <div className="kong-form-group">
                        <label htmlFor="kong-region" className="kong-label">
                          Select Region
                        </label>
                        <div className="kong-select-wrapper">
                          <select
                            id="kong-region"
                            value={region}
                            onChange={(event) => setRegion(event.target.value)}
                            className={`kong-control kong-select ${region ? "is-filled" : ""}`}
                          >
                            <option value="" disabled>
                              Select region
                            </option>
                            <option value="AU">AU (Australia)</option>
                            <option value="EU">EU (Europe)</option>
                            <option value="IN">IN (India)</option>
                            <option value="ME">ME (Middle East)</option>
                            <option value="SG">SG (Singapore)</option>
                            <option value="US">US (North America)</option>
                          </select>
                        </div>
                      </div>

                      <div className="kong-form-group">
                        <label htmlFor="kong-token" className="kong-label">
                          Personal Access Token
                        </label>
                        <input
                          id="kong-token"
                          type="text"
                          placeholder="Enter access token"
                          className={`kong-control kong-input ${token ? "is-filled" : ""}`}
                          value={token}
                          onChange={(event) => setToken(event.target.value)}
                          onFocus={() => setTokenFieldFocused(true)}
                          onBlur={() => setTokenFieldFocused(false)}
                          autoComplete="off"
                          spellCheck={false}
                        />
                      </div>

                      {error && (
                        <div className="kong-error-message">
                          {error}
                        </div>
                      )}

                      <PrimaryButton
                        fullWidth
                        className="kong-primary-button"
                        onClick={submitKongIntegration}
                        disabled={isLoading || !token || !region}
                      >
                        {isLoading ? "Connecting..." : "Connect Kong"}
                      </PrimaryButton>
                    </div>

                    {/* HOW-TO CARD */}
                    <div className="kong-helper-card">
                      <div className="kong-helper-header">
                        <span className="kong-helper-icon">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                          >
                            <path
                              d="M7.57508 7.49984C7.771 6.94289 8.15771 6.47326 8.66671 6.17411C9.17571 5.87497 9.77416 5.76562 10.3561 5.86543C10.938 5.96524 11.4658 6.26777 11.846 6.71944C12.2262 7.17111 12.4343 7.74277 12.4334 8.33317C12.4334 9.99984 9.93341 10.8332 9.93341 10.8332M10.0001 14.1665H10.0084M18.3334 9.99984C18.3334 14.6022 14.6025 18.3332 10.0001 18.3332C5.39771 18.3332 1.66675 14.6022 1.66675 9.99984C1.66675 5.39746 5.39771 1.6665 10.0001 1.6665C14.6025 1.6665 18.3334 5.39746 18.3334 9.99984Z"
                              stroke="#0262A1"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                        <span className="kong-helper-title">
                          {tokenFieldFocused ? "Kong Integration Ready" : "How to Enter Personal Access Token"}
                        </span>
                      </div>

                      <div className="kong-helper-body">
                        <div className="kong-helper-image-placeholder">
                          <img src={tokenFieldFocused ? kongImage : kongHelperImage} alt="Kong helper" className="kong-helper-img" />
                        </div>

                        {tokenFieldFocused ? (
                          <div className="kong-helper-steps">
                             <li>Step 1: Log in to Kong Admin Portal.</li>
                            <li>Step 2: Go to User Profile → API Tokens or Personal Access Tokens.</li>
                            <li>Step 3: Create or copy your token from there.</li>
                            
                          </div>
                        ) : (
                          <ol className="kong-helper-steps">
                            <li>Step 1: Log in to your Kong Admin Portal.</li>
                            <li>Step 2: Go to Workspace Settings or Cluster Info.</li>
                            <li>Step 3: Check the Region/Cluster field—it will show which region your workspace or APIs are running in.</li>
                           
                          </ol>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              ) : error ? (
                <div className="kong-connected-body">
                  <div className="kong-connected-illustration">
                    <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120" fill="none">
                      <g filter="url(#filter0_f_13019_74808)">
                        <path d="M88.4167 60.9583L95.5833 53.8333H95.5C99.336 49.8585 101.438 44.5239 101.344 39.0007C101.25 33.4776 98.9687 28.2174 95 24.375C91.1123 20.6258 85.9218 18.5308 80.5208 18.5308C75.1198 18.5308 69.9294 20.6258 66.0417 24.375L58.875 31.5M31.4583 58.875L24.3333 66C20.4974 69.9748 18.3955 75.3095 18.4893 80.8326C18.583 86.3558 20.8647 91.616 24.8333 95.4583C28.7211 99.2075 33.9115 101.303 39.3125 101.303C44.7135 101.303 49.9039 99.2075 53.7917 95.4583L60.9167 88.3333M43.25 18.25V30.75M18.25 43.25H30.75M76.5833 89.0833V101.583M89.0833 76.5833H101.583" stroke="url(#paint0_linear_13019_74808)" strokeWidth="12.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </g>
                      <defs>
                        <filter id="filter0_f_13019_74808" x="-2.08301" y="-2.08447" width="124" height="124" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                          <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
                          <feGaussianBlur stdDeviation="6" result="effect1_foregroundBlur_13019_74808"/>
                        </filter>
                        <linearGradient id="paint0_linear_13019_74808" x1="97.6192" y1="101.583" x2="48.0694" y2="116.212" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#025A94"/>
                          <stop offset="1" stopColor="#2A455E"/>
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                  <h2 className="kong-connected-title">Connection Failed</h2>
                  <p className="kong-connected-description">
                    {error}
                  </p>
                  <PrimaryButton className="kong-connected-cta" onClick={() => {
                    setIsConnected(false);
                    setError(null);
                  }}>
                    Try Again
                  </PrimaryButton>
                </div>
              ) : (
                <div className="kong-connected-body">
                  <div className="kong-connected-illustration">
                    <svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96" fill="none">
  <path d="M39.3482 51.8065C41.1375 54.1987 43.4205 56.1781 46.0421 57.6104C48.6638 59.0427 51.5628 59.8945 54.5425 60.1079C57.5223 60.3213 60.5131 59.8914 63.3121 58.8473C66.1111 57.8031 68.6528 56.1693 70.7648 54.0565L83.2648 41.5565C87.0598 37.6273 89.1597 32.3647 89.1122 26.9023C89.0647 21.4399 86.8737 16.2146 83.011 12.3519C79.1484 8.48927 73.9231 6.29825 68.4607 6.25079C62.9982 6.20332 57.7357 8.3032 53.8065 12.0982L46.6398 19.2232M56.0148 43.4732C54.2254 41.081 51.9425 39.1016 49.3209 37.6692C46.6992 36.2369 43.8002 35.3852 40.8205 35.1718C37.8407 34.9584 34.8499 35.3883 32.0509 36.4324C29.2519 37.4765 26.7102 39.1104 24.5982 41.2232L12.0982 53.7232C8.3032 57.6524 6.20332 62.9149 6.25079 68.3774C6.29825 73.8398 8.48927 79.065 12.3519 82.9277C16.2146 86.7904 21.4399 88.9814 26.9023 89.0289C32.3647 89.0763 37.6273 86.9765 41.5565 83.1815L48.6815 76.0565" stroke="url(#paint0_linear_13019_74807)" stroke-width="12.5" stroke-linecap="round" stroke-linejoin="round"/>
  <defs>
    <linearGradient id="paint0_linear_13019_74807" x1="85.1713" y1="89.0297" x2="35.9091" y2="103.588" gradientUnits="userSpaceOnUse">
      <stop stop-color="#025A94"/>
      <stop offset="1" stop-color="#2A455E"/>
    </linearGradient>
  </defs>
</svg>
                  </div>
                  <h2 className="kong-connected-title">Connected To Kong</h2>
                  <p className="kong-connected-description">
                    You are successfully connected to Kong. You can now import API products and manage them seamlessly.
                  </p>
                  <PrimaryButton className="kong-connected-cta" onClick={handleGoToProducts} disabled={isLoading}>
                    {isLoading ? "Loading..." : "Import Products ➜ "}
                  </PrimaryButton>
                </div>
              )}
            </div>
          ) : isImportStep ? (
            <KongProducts products={kongProducts} onImport={(selectedIds) => handleImportProducts(selectedIds)} />
          ) : isImportedStep ? (
            <KongImportedProducts onBack={() => setCurrentStep("import")} />
          ) : null}
        </main>
      </div>
    </div>
  );
};

export default KongIntegration;
