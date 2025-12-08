import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { orgIdImage, envImage, jsonImage, apigeeLogo } from '../../static/images';
import './ApigeeIntegration.css';
import { saveApigeeConnection } from './api';
import type { ConnectionResponse } from './api';

const ApigeeIntegration: React.FC = () => {
  const navigate = useNavigate();

  const [activeField, setActiveField] =
    useState<'orgId' | 'environment' | 'json' | 'analytics' | null>(null);

  const [orgId, setOrgId] = useState('');
  const [environment, setEnvironment] = useState('');
  const [analyticsMode, setAnalyticsMode] = useState<'STANDARD' | 'BASIC'>('STANDARD');

  const [serviceAccountFile, setServiceAccountFile] = useState<File | null>(null);
  const [serviceAccountFileName, setServiceAccountFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleBackClick = () => {
    navigate('/get-started/integrations');
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Only accept JSON as per backend expectation
    if (!file.name.toLowerCase().endsWith('.json')) {
      setErrorMessage('Please upload a valid .json service account file.');
      setServiceAccountFile(null);
      setServiceAccountFileName('');
      return;
    }

    setErrorMessage(null);
    setServiceAccountFile(file);
    setServiceAccountFileName(file.name);
  };

  const handleConnectApigee = async () => {
    setErrorMessage(null);

    if (!orgId.trim()) {
      setErrorMessage('Apigee Org ID is required.');
      return;
    }
    if (!environment.trim()) {
      setErrorMessage('Environment is required.');
      return;
    }
    if (!serviceAccountFile) {
      setErrorMessage('Service account JSON file is required.');
      return;
    }

    const payloadPreview = {
      org: orgId.trim(),
      envs: environment.trim(),
      analyticsMode,
      fileName: serviceAccountFile.name,
    };
    console.log('[ApigeeIntegration] Submitting connection payload:', payloadPreview);

    setIsSubmitting(true);
    try {
      const response: ConnectionResponse = await saveApigeeConnection(
        orgId.trim(),
        environment.trim(), // maps to "envs" on backend
        analyticsMode,
        serviceAccountFile
      );

      console.log('[ApigeeIntegration] Backend ConnectionResponse:', response);

      if (response.connected) {
        // Success path
        navigate('/apigee-success');
      } else {
        // Backend explicitly said "connected: false"
        const msg =
          response.message ||
          'Unable to connect to Apigee. Please check credentials and try again.';
        setErrorMessage(msg);
        navigate('/apigee-failure');
      }
    } catch (err: any) {
      console.error('[ApigeeIntegration] Error while connecting to Apigee:', err);

      // Log what backend actually sent (if available)
      if (err?.response) {
        console.error(
          '[ApigeeIntegration] Error response from backend:',
          {
            status: err.response.status,
            data: err.response.data,
          }
        );
      }

      setErrorMessage(
        err?.response?.data?.message ||
        'Failed to connect to Apigee. Please verify your details and try again.'
      );
      navigate('/apigee-failure');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="apigee-integration-page">
      {/* Header */}
      <div className="apigee-header">
        <button className="back-button" onClick={handleBackClick}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
          >
            <path
              d="M10.0001 15.8334L4.16675 10.0001M4.16675 10.0001L10.0001 4.16675M4.16675 10.0001H15.8334"
              stroke="#909599"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Aforo Logo Container */}
        <div className="aforo-logo-container">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="31"
            height="27"
            viewBox="0 0 31 27"
            fill="none"
          >
            <path
              d="M12.664 24.5418L10.2517 18.4628C9.70631 17.0884 9.43362 16.4012 9.65061 16.2757C9.8676 16.1502 10.3272 16.7293 11.2464 17.8875L16.44 24.4314C16.9912 25.126 17.2668 25.4732 17.615 25.7163C17.8687 25.8935 18.1492 26.0289 18.4457 26.1176C18.8526 26.2392 19.2959 26.2392 20.1826 26.2392C25.1327 26.2392 27.6077 26.2392 28.999 25.1276C29.9902 24.3356 30.6493 23.2014 30.8467 21.9481C31.1237 20.189 29.8983 18.0385 27.4475 13.7377L26.3673 11.8419C22.0457 4.25801 19.8849 0.466063 16.651 0.0526505C16.1814 -0.0073781 15.7067 -0.0161929 15.2352 0.0263605C11.9882 0.319426 9.68812 4.02854 5.08799 11.4468L4.13445 12.9845C1.15713 17.7857 -0.331525 20.1864 0.0628633 22.1555C0.270901 23.1943 0.79837 24.142 1.57151 24.8662C3.0372 26.2392 5.86193 26.2392 11.5114 26.2392C12.19 26.2392 12.5294 26.2392 12.7306 26.0731C12.8374 25.985 12.9168 25.8681 12.9593 25.7362C13.0395 25.488 12.9143 25.1726 12.664 24.5418L12.664 24.5418Z"
              fill="url(#paint0_linear_13446_25889)"
            />
            <defs>
              <linearGradient
                id="paint0_linear_13446_25889"
                x1="33.0277"
                y1="-25.1522"
                x2="-4.45086"
                y2="11.521"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#0092DF" />
                <stop offset="1" stopColor="#0262A1" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* X Separator */}
        <span className="header-x-separator">x</span>

        {/* Apigee Logo Container */}
        <div className="apigee-logo-container">
          <div
            className="apigee-logo"
            style={{
              backgroundImage: `url(${apigeeLogo})`,
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          ></div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="apigee-content">
        {/* Sidebar */}
        <div className="apigee-sidebar">
          <div className="sidebar-section">
            <div className="sidebar-item active">
              <div className="sidebar-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="15"
                  height="15"
                  viewBox="0 0 15 15"
                  fill="none"
                  className="establish-connection-icon"
                >
                  <path
                    d="M12.0001 2.66675L14.0001 0.666748M0.666748 14.0001L2.66675 12.0001M4.33341 8.33341L6.00008 6.66675M6.33341 10.3334L8.00008 8.66675M3.53341 12.8667C3.68206 13.0159 3.85869 13.1343 4.05317 13.215C4.24765 13.2958 4.45617 13.3373 4.66675 13.3373C4.87733 13.3373 5.08584 13.2958 5.28032 13.215C5.47481 13.1343 5.65144 13.0159 5.80008 12.8667L7.33341 11.3334L3.33341 7.33341L1.80008 8.86675C1.65092 9.01539 1.53257 9.19202 1.45181 9.38651C1.37106 9.58099 1.32949 9.7895 1.32949 10.0001C1.32949 10.2107 1.37106 10.4192 1.45181 10.6137C1.53257 10.8081 1.65092 10.9848 1.80008 11.1334L3.53341 12.8667ZM7.33341 3.33341L11.3334 7.33341L12.8667 5.80008C13.0159 5.65144 13.1343 5.47481 13.215 5.28032C13.2958 5.08584 13.3373 4.87733 13.3373 4.66675C13.3373 4.45617 13.2958 4.24765 13.215 4.05317C13.1343 3.85869 13.0159 3.68206 12.8667 3.53341L11.1334 1.80008C10.9848 1.65092 10.8081 1.53257 10.6137 1.45181C10.4192 1.37106 10.2107 1.32949 10.0001 1.32949C9.7895 1.32949 9.58099 1.37106 9.38651 1.45181C9.19202 1.53257 9.01539 1.65092 8.86675 1.80008L7.33341 3.33341Z"
                    stroke="var(--icon-color-lightest, #F9FBFD)"
                    strokeWidth="1.333"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="sidebar-text">
                <h4>Establish Connection</h4>
                <p>Configure</p>
              </div>
            </div>

            <div className="sidebar-item disabled">
              <div className="sidebar-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <g clipPath="url(#clip0_12866_2701)">
                    <path
                      d="M2.2 4.66668L8 8.00002M8 8.00002L13.8 4.66668M8 8.00002L8 14.6667M14 5.33335C13.9998 5.09953 13.938 4.86989 13.821 4.66746C13.704 4.46503 13.5358 4.29692 13.3333 4.18002L8.66667 1.51335C8.46397 1.39633 8.23405 1.33472 8 1.33472C7.76595 1.33472 7.53603 1.39633 7.33333 1.51335L2.66667 4.18002C2.46417 4.29692 2.29599 4.46503 2.17897 4.66746C2.06196 4.86989 2.00024 5.09953 2 5.33335V10.6667C2.00024 10.9005 2.06196 11.1301 2.17897 11.3326C2.29599 11.535 2.46417 11.7031 2.66667 11.82L7.33333 14.4867C7.53603 14.6037 7.76595 14.6653 8 14.6653C8.23405 14.6653 8.46397 14.6037 8.66667 14.4867L13.3333 11.82C13.5358 11.7031 13.704 11.535 13.821 11.3326C13.938 11.1301 13.9998 10.9005 14 10.6667V5.33335Z"
                      stroke="#D1D7E0"
                      strokeWidth="1.52381"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_12866_2701">
                      <rect width="16" height="16" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
              </div>
              <div className="sidebar-text">
                <h4>Import Apigee Products</h4>
                <p>Import UI</p>
              </div>
            </div>
          </div>

          {/* Import History Button */}
          <div className="sidebar-footer">
            <button className="import-history-btn">Import History</button>
          </div>
        </div>

        {/* Main Content */}
        <div className="apigee-main">
          <div className="main-content-wrapper">
            {/* Left Side - Connection Form */}
            <div className="connection-section">
              <h2>Connection Management</h2>

              <div className="connection-form">
                {/* Apigee Org ID Field */}
                <div className="form-field">
                  <label className="form-label">Apigee Org ID</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter organization id"
                    value={orgId}
                    onChange={(e) => setOrgId(e.target.value)}
                    onFocus={() => setActiveField('orgId')}
                  />
                </div>

                {/* Enter Environment Field */}
                <div className="form-field">
                  <label className="form-label">Enter Environment(s)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="eg. dev,prod"
                    value={environment}
                    onChange={(e) => setEnvironment(e.target.value)}
                    onFocus={() => setActiveField('environment')}
                  />
                </div>

                {/* Analytics Mode Field */}
                <div className="form-field">
                  <label className="form-label">Analytics Mode</label>
                  <select
                    className="form-input"
                    value={analyticsMode}
                    onChange={(e) =>
                      setAnalyticsMode(e.target.value as 'STANDARD' | 'BASIC')
                    }
                    onFocus={() => setActiveField('analytics')}
                  >
                    <option value="STANDARD">Standard</option>
                    <option value="BASIC">Basic</option>
                  </select>
                </div>

                {/* Upload Json File Field */}
                <div className="form-field">
                  <label className="form-label">Upload Json File</label>
                  <div className="file-upload-wrapper">
                    <input
                      type="text"
                      className="form-input file-upload-input"
                      placeholder="Upload file"
                      readOnly
                      value={serviceAccountFileName}
                      onFocus={() => setActiveField('json')}
                    />
                    <button
                      type="button"
                      className="upload-btn-integrated"
                      onClick={handleUploadClick}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                      >
                        <path
                          d="M7 1.75V8.75M7 1.75L9.91667 4.66667M7 1.75L4.08333 4.66667M12.25 8.75V11.0833C12.25 11.3928 12.1271 11.6895 11.9083 11.9083C11.6895 12.1271 11.3928 12.25 11.0833 12.25H2.91667C2.60725 12.25 2.3105 12.1271 2.09171 11.9083C1.87292 11.6895 1.75 11.3928 1.75 11.0833V8.75"
                          stroke="#004B80"
                          strokeWidth="0.88"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      Upload
                    </button>
                    {/* Hidden real file input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json"
                      style={{ display: 'none' }}
                      onChange={handleFileChange}
                    />
                  </div>
                  <div className="file-info-external">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle
                        cx="8"
                        cy="8"
                        r="7"
                        stroke="#0EA5E9"
                        strokeWidth="1.33333"
                      />
                      <path
                        d="M8 11.3333V8"
                        stroke="#0EA5E9"
                        strokeWidth="1.33333"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M8 5.33334H8.00667"
                        stroke="#0EA5E9"
                        strokeWidth="1.33333"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Accepted file formats are .json
                  </div>
                </div>

                {/* Error Message */}
                {errorMessage && (
                  <div className="form-error-message">
                    {errorMessage}
                  </div>
                )}

                {/* Connect Button */}
                <button
                  className="connect-btn"
                  onClick={handleConnectApigee}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Connecting…' : 'Connect Apigee'}
                </button>
              </div>
            </div>

            {/* Right Side - Info Card */}
            {activeField && (
              <div className="info-card-section">
                <div className="info-card">
                  <div className="info-card-header">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle
                        cx="8"
                        cy="8"
                        r="7"
                        stroke="#0262A1"
                        strokeWidth="1.33333"
                      />
                      <path
                        d="M8 11.3333V8"
                        stroke="#0262A1"
                        strokeWidth="1.33333"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M8 5.33334H8.00667"
                        stroke="#0262A1"
                        strokeWidth="1.33333"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="info-card-title">
                      {activeField === 'orgId'
                        ? 'How to Enter Apigee Org ID'
                        : activeField === 'environment'
                          ? 'How to Enter Environment'
                          : activeField === 'analytics'
                            ? 'How to Select  Analytics Mode'
                            : 'How to Upload JSON File'}
                    </span>
                  </div>

                  <div className="info-card-content">
                    <div
                      className="info-card-image"
                      style={{
                        backgroundImage: `url(${activeField === 'orgId'
                          ? orgIdImage
                          : activeField === 'environment'
                            ? envImage
                            : activeField === 'analytics'
                              ? orgIdImage
                              : jsonImage
                          })`,
                        backgroundPosition:
                          activeField === 'orgId'
                            ? '-26.183px -21.054px'
                            : 'center',
                        backgroundSize:
                          activeField === 'orgId'
                            ? '150.915% 160.769%'
                            : 'cover',
                        backgroundRepeat: 'no-repeat',
                      }}
                    ></div>

                    <div className="info-steps">
                      {activeField === 'orgId' ? (
                        <>
                          <p>Step 1: Go to Google Cloud Console and then Apigee.</p>
                          <p>Step 2: Check the top-left dropdown for your active org/project.</p>
                          <p>Step 3: The name shown there is your Apigee Org ID — that's the exact ID you need to enter.</p>
                        </>
                      ) : activeField === 'environment' ? (
                        <>
                          <p>Step 1: Go to Apigee and open any API Proxy.</p>
                          <p>Step 2: In the Overview tab, scroll to the Deployments section.</p>
                          <p>Step 3: The small badge (like eval/test/prod) is your Environment.</p>
                        </>
                      ) : activeField === 'analytics' ? (
                        <>
                          <p>Step 1: Open Google Cloud Console and go to Apigee.</p>
                          <p>Step 2: Go to Admin and then Organization Settings.</p>
                          <p>Step 3: Under Analytics, you'll see whether your org is on Standard or Basic analytics mode.</p>
                        </>
                      ) : (
                        <>
                          <p>Step 1: Go to IAM & Admin, open Service Accounts, and select your Apigee service account.</p>
                          <p>Step 2: Open Keys, choose Add Key, and create a new JSON key.</p>
                          <p>Step 3: Download the JSON file and Upload here..</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApigeeIntegration;
