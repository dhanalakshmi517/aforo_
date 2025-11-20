import React, { useMemo, useState } from "react";
import "./KongIntegration.css";
import KongTopbar from "./KongTopBar";
import PrimaryButton from "../../componenetsss/PrimaryButton";
import SecondaryButton from "../../componenetsss/SecondaryButton";
import SelectableCard from "../../componenetsss/SelectableCard";
import kongHelperImage from "./kong1.svg";
import KongProducts from "./KongProducts";
import KongImportedProducts from "./KongImportedProducts";

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

  // Handle API call to submit Kong integration details
  const submitKongIntegration = async () => {
    if (!token || !region) {
      setError("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("http://44.203.209.2:8086/api/client-api-details", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          base_url: getBaseUrl(),
          endpoint: "/v2/api-products",
          auth_token: token
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      console.log("API response:", data);
      
      // Set connected state and move to next step
      setIsConnected(true);
      setCurrentStep("import");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect to Kong");
      console.error("Kong integration error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="kong-page">
      <KongTopbar onBack={onClose} />
      <div className="kong-frame">
        {/* LEFT SIDEBAR */}
        <aside className="kong-sidebar">
          <div className="kong-stepper">
            {/* Step 1: active card */}
            <div
              className={`kong-step ${
(isStepOneCompleted && !isAssignStep) ? "kong-step--completed" : "kong-step--active"
              }`}
            >
              <div
                className={`kong-step-icon ${
                  (isStepOneCompleted && !isAssignStep) ? "kong-step-icon--completed" : "kong-step-icon--active"
                }`}
              >
                {isImportStep ? (
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
                <div className="kong-step-title">Establish Connection</div>
                <div className="kong-step-subtitle">
                  {isImportStep || isAssignStep ? "Connected" : "Connecting"}
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div
              className={`kong-step ${
                isImportStep || isAssignStep ? "kong-step--active" : "kong-step--inactive"
              }`}
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
                        <label className="kong-label">
                          Select Country
                        </label>
                        <div className="kong-country-grid">
                          <div 
                            className={`kong-country-option ${selectedCountry === "AU" ? "kong-country-option--selected" : ""}`}
                            onClick={() => handleCountrySelect("AU")}
                          >
                            <span className="kong-country-flag">🇦🇺</span>
                            <span className="kong-country-name">AU (Australia)</span>
                          </div>
                          <div 
                            className={`kong-country-option ${selectedCountry === "EU" ? "kong-country-option--selected" : ""}`}
                            onClick={() => handleCountrySelect("EU")}
                          >
                            <span className="kong-country-flag">🇪🇺</span>
                            <span className="kong-country-name">EU (Europe)</span>
                          </div>
                          <div 
                            className={`kong-country-option ${selectedCountry === "IN" ? "kong-country-option--selected" : ""}`}
                            onClick={() => handleCountrySelect("IN")}
                          >
                            <span className="kong-country-flag">🇮🇳</span>
                            <span className="kong-country-name">IN (India)</span>
                          </div>
                          <div 
                            className={`kong-country-option ${selectedCountry === "ME" ? "kong-country-option--selected" : ""}`}
                            onClick={() => handleCountrySelect("ME")}
                          >
                            <span className="kong-country-flag">🇦🇪</span>
                            <span className="kong-country-name">ME (Middle East)</span>
                          </div>
                          <div 
                            className={`kong-country-option ${selectedCountry === "SG" ? "kong-country-option--selected" : ""}`}
                            onClick={() => handleCountrySelect("SG")}
                          >
                            <span className="kong-country-flag">🇸🇬</span>
                            <span className="kong-country-name">SG (Singapore)</span>
                          </div>
                          <div 
                            className={`kong-country-option ${selectedCountry === "US" ? "kong-country-option--selected" : ""}`}
                            onClick={() => handleCountrySelect("US")}
                          >
                            <span className="kong-country-flag">🇺🇸</span>
                            <span className="kong-country-name">US (North America)</span>
                          </div>
                        </div>
                      </div>

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
                            <option value="us">US</option>
                            <option value="eu">EU</option>
                            <option value="asia">Asia</option>
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
                          How to Enter Personal Access Token
                        </span>
                      </div>

                      <div className="kong-helper-body">
                        <div className="kong-helper-image-placeholder">
                          <img src={kongHelperImage} alt="Kong helper" className="kong-helper-img" />
                        </div>

                        <ol className="kong-helper-steps">
                          <li>Step 1: Click on the projects.</li>
                          <li>Step 2: Copy the Id of your project.</li>
                          <li>Step 3: Paste the Id in the given input field.</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="kong-connected-body">
                  <div className="kong-connected-illustration">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="120"
                      height="120"
                      viewBox="0 0 100 101"
                      fill="none"
                    >
                      <path
                        d="M52.328 34.8594C57.2185 35.4793 59.9245 38.3443 63.1927 41.8438C67.8971 48.1692 69.2347 55.274 68.2552 63.0123C66.9312 69.8988 63.9635 74.3976 59.0601 79.3282C57.4522 80.9586 55.8778 82.6196 54.2985 84.2777C53.0124 85.6067 51.7251 86.9345 50.4364 88.261C49.521 89.2213 49.521 89.2213 48.5871 90.2009C42.2107 96.663 35.7807 100.209 26.6215 100.29C21.3505 100.3 17.2584 99.8966 12.7497 96.943C12.2115 96.6139 11.6733 96.2848 11.1188 95.9457C5.60594 92.2395 2.03696 87.0592 0.332988 80.6461C-0.363824 72.4464 -0.404017 64.8644 4.68006 58.0195C6.50491 55.8965 8.44944 53.9164 10.4216 51.9324C11.6484 50.6764 12.8751 49.4204 14.1017 48.1643C15.4445 46.8 16.7884 45.4369 18.1335 44.0749C18.7958 43.4022 19.4582 42.7295 20.1405 42.0365C20.7657 41.4107 21.3909 40.7849 22.035 40.1401C22.6001 39.5718 23.1653 39.0035 23.7476 38.4179C25.1665 37.1875 25.1665 37.1875 26.7185 37.1875C28.1142 42.2804 29.4189 47.4539 28.2706 52.7084C25.3531 57.5067 20.8712 61.0695 16.4897 64.4959C13.7808 67.1922 13.2879 70.2441 13.2347 73.9527C13.3317 78.1885 13.9842 80.4261 16.6299 83.7503C19.6341 86.1288 22.8746 87.5536 26.7185 87.6305C30.6352 86.9363 33.6501 85.5665 36.604 82.8984C37.1392 82.4151 37.6744 81.9318 38.2258 81.4339C41.103 78.7644 43.9478 76.0701 46.7502 73.3221C47.3319 72.7694 47.9137 72.2167 48.513 71.6473C52.5578 67.6675 54.9846 64.3445 55.6535 58.553C55.1914 54.3376 53.8214 51.834 51.067 48.616C49.0578 46.0931 48.973 43.4427 48.9904 40.2978C49.3511 37.8902 50.6483 36.5391 52.328 34.8594Z"
                        fill="url(#paint0_linear_1)"
                      />
                      <path
                        d="M87.2505 3.8176C87.7887 4.14672 88.3269 4.47585 88.8814 4.81494C94.3943 8.52116 97.9632 13.7014 99.6672 20.1146C100.364 28.3143 100.404 35.8962 95.3202 42.7411C93.4953 44.8641 91.5508 46.8443 89.5786 48.8283C88.3518 50.0842 87.1251 51.3402 85.8985 52.5963C84.5558 53.9606 83.2118 55.3238 81.8667 56.6857C81.2044 57.3584 80.5421 58.0311 79.8597 58.7242C79.2345 59.35 78.6093 59.9757 77.9652 60.6205C77.4001 61.1888 76.8349 61.7572 76.2527 62.3427C74.8338 63.5731 74.8338 63.5731 73.2817 63.5731C73.2347 62.9079 73.1876 62.2426 73.1392 61.5572C73.0742 60.6699 73.0091 59.7826 72.9422 58.8683C72.8791 57.995 72.8161 57.1217 72.7512 56.2219C72.5948 53.4627 72.5948 53.4627 71.7144 50.8229C71.7321 47.5866 72.1375 47.224 74.2881 44.9692C75.425 43.8951 76.5777 42.8376 77.7439 41.7953C83.9171 36.3572 83.9171 36.3572 86.8109 28.8481C86.8181 23.9418 86.4648 20.8984 83.3703 17.0104C80.3619 14.6284 77.1287 13.2056 73.2817 13.1301C66.1564 13.9647 61.8667 18.2949 57.1062 23.2078C55.8699 24.4791 54.6088 25.7212 53.3425 26.9626C48.4925 31.8115 44.687 36.076 44.5164 43.2292C45.3017 46.7779 46.1971 49.1699 48.5452 51.9809C50.8651 54.7898 51.3843 56.8047 51.1462 60.4265C50.5962 62.7977 49.3943 64.2329 47.6722 65.9013C42.7845 65.2731 40.0301 62.4728 36.8075 58.9168C31.9951 51.6808 30.5389 44.1301 32.1513 35.6355C33.6506 29.6921 36.666 25.7283 40.9367 21.4325C42.5516 19.7992 44.1382 18.1397 45.729 16.4829C47.0222 15.1539 48.3166 13.8262 49.6123 12.4996C50.2291 11.8594 50.8459 11.2193 51.4813 10.5597C60.693 1.26271 75.2337 -4.05464 87.2505 3.8176Z"
                        fill="url(#paint1_linear_1)"
                      />
                      <path
                        d="M79.0106 75.7139C81.619 76.0681 82.3493 76.8783 84.0489 78.8514C84.527 79.3826 85.0052 79.9138 85.4979 80.4611C86.474 82.1981 86.474 82.1981 86.2375 84.3474C86.0595 84.9186 85.8814 85.4898 85.698 86.0783C83.967 86.6179 83.967 86.6179 81.8177 86.8544C80.0807 85.8782 80.0807 85.8782 78.471 84.4292C77.9298 83.9631 77.3886 83.4969 76.831 83.0166C75.6094 81.422 75.6094 81.422 75.3335 79.391C75.7173 76.8184 76.4381 76.0976 79.0106 75.7139Z"
                        fill="url(#paint2_linear_1)"
                      />
                      <path
                        d="M17.6004 13.9546C20.6285 14.9869 22.5313 16.7513 24.3908 19.3384C24.7788 21.4726 24.7788 21.4726 24.3908 23.2187C22.8387 24.7707 22.8387 24.7707 20.9895 25.0466C18.3811 24.6923 17.6509 23.8822 15.9513 21.9091C15.4731 21.3779 14.995 20.8467 14.5023 20.2994C13.5262 18.5624 13.5262 18.5624 13.6656 16.4616C14.5103 14.1004 15.1343 13.8861 17.6004 13.9546Z"
                        fill="url(#paint3_linear_1)"
                      />
                      <path
                        d="M61.6619 86.1905C63.1927 86.8544 63.1927 86.8544 64.0324 88.3216C65.9483 94.5098 65.9483 94.5098 64.7448 97.719C63.9688 98.4951 63.9688 98.4951 61.9802 98.5436C61.3559 98.5276 60.7317 98.5116 60.0886 98.4951C58.1896 95.11 57.3703 92.2658 56.9844 88.4065C59.6286 86.0456 59.6286 86.0456 61.6619 86.1905Z"
                        fill="url(#paint4_linear_1)"
                      />
                      <path
                        d="M37.9226 2.12012C39.9112 2.26563 39.9112 2.26563 41.4633 3.81772C42.009 5.78208 42.009 5.78208 42.4334 8.08597C42.5814 8.84625 42.7295 9.60653 42.882 10.3899C42.926 11.0381 42.9701 11.6863 43.0154 12.3542C41.4633 13.9063 41.4633 13.9063 39.0382 14.0033C38.3019 13.9713 37.5656 13.9393 36.807 13.9063C33.9546 6.50929 33.9546 6.50929 35.2549 3.04167C36.031 2.26563 36.031 2.26563 37.9226 2.12012Z"
                        fill="url(#paint5_linear_1)"
                      />
                      <path
                        d="M88.0265 57.3647C89.9908 57.4981 89.9908 57.4981 92.2947 57.9468C93.4351 58.1569 93.4351 58.1569 94.5986 58.3712C96.563 58.9168 96.563 58.9168 98.1151 60.4689C98.3091 62.409 98.3091 62.409 98.1151 64.3492C97.6029 64.8613 97.0907 65.3735 96.563 65.9012C92.6966 65.7111 89.4896 65.4354 86.4744 62.7971C86.1348 60.8084 86.1348 60.8084 86.4744 58.9168C86.9866 58.4046 87.4987 57.8925 88.0265 57.3647Z"
                        fill="url(#paint6_linear_1)"
                      />
                      <path
                        d="M3.4371 34.8594C6.98368 35.0919 10.3962 35.3857 13.5257 37.1875C14.3502 38.6426 14.3502 38.6426 14.3017 40.2917C13.2347 42.1348 13.2347 42.1348 11.1976 43.3959C7.64026 43.1908 4.84029 42.2619 1.88501 40.2917C1.6425 38.3516 1.6425 38.3516 1.88501 36.4115C2.3972 35.8993 2.90939 35.3871 3.4371 34.8594Z"
                        fill="url(#paint7_linear_1)"
                      />
                      <defs>
                        <linearGradient id="paint0_linear_1" x1="65.2953" y1="100.29" x2="24.849" y2="112.802" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#0262A1" />
                          <stop offset="1" stopColor="#00365A" />
                        </linearGradient>
                        <linearGradient id="paint1_linear_1" x1="96.7427" y1="65.9013" x2="56.2839" y2="78.3136" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#0262A1" />
                          <stop offset="1" stopColor="#00365A" />
                        </linearGradient>
                        <linearGradient id="paint2_linear_1" x1="85.8429" y1="86.8544" x2="79.2719" y2="88.7759" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#0262A1" />
                          <stop offset="1" stopColor="#00365A" />
                        </linearGradient>
                        <linearGradient id="paint3_linear_1" x1="24.1547" y1="25.0466" x2="17.5633" y2="26.9891" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#0262A1" />
                          <stop offset="1" stopColor="#00365A" />
                        </linearGradient>
                        <linearGradient id="paint4_linear_1" x1="65.1652" y1="98.5436" x2="59.8355" y2="99.6331" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#0262A1" />
                          <stop offset="1" stopColor="#00365A" />
                        </linearGradient>
                        <linearGradient id="paint5_linear_1" x1="42.6064" y1="14.0033" x2="37.2913" y2="15.1386" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#0262A1" />
                          <stop offset="1" stopColor="#00365A" />
                        </linearGradient>
                        <linearGradient id="paint6_linear_1" x1="97.6878" y1="65.9012" x2="91.0546" y2="68.6636" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#0262A1" />
                          <stop offset="1" stopColor="#00365A" />
                        </linearGradient>
                        <linearGradient id="paint7_linear_1" x1="13.7187" y1="43.3959" x2="6.86783" y2="46.3851" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#0262A1" />
                          <stop offset="1" stopColor="#00365A" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                  <h2 className="kong-connected-title">Connected to Kong</h2>
                  <p className="kong-connected-description">
                    Import products from Kong to aforo seamlessly. Review connections before importing to ensure the
                    latest services reach monetization.
                  </p>
                  <PrimaryButton className="kong-connected-cta" onClick={() => setCurrentStep("import")}>
                    Import Products
                  </PrimaryButton>
                </div>
              )}
            </div>
          ) : isImportStep ? (
            <KongProducts />
          ) : isImportedStep ? (
            <KongImportedProducts onBack={() => setCurrentStep("import")} />
          ) : null}
        </main>
      </div>
    </div>
  );
};

export default KongIntegration;
