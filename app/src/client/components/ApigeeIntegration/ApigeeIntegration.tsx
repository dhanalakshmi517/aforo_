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

        <div className="aforo-logo">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="72"
            height="16"
            viewBox="0 0 72 16"
            fill="none"
          >
            <path
              d="M4.7352 15.9735C2.41273 15.9735 0.676514 14.6657 0.676514 12.4785C0.676514 9.90797 3.13428 8.91585 6.76455 8.78056L8.25274 8.73546V8.37469C8.25274 7.38256 7.53119 6.72866 6.33613 6.72866C5.11852 6.72866 4.48717 7.36002 4.28424 8.26195H0.969641C1.24022 5.87183 3.22447 4.02287 6.33613 4.02287C9.24486 4.02287 11.3869 5.44341 11.3869 8.35214V13.651C11.3869 14.35 11.432 15.3196 11.4997 15.5901V15.6352H8.29783C8.27528 15.3647 8.27528 14.9813 8.27528 14.5078C7.53119 15.3421 6.33613 15.9735 4.7352 15.9735ZM5.63714 13.4706C7.17042 13.4706 8.25274 12.3657 8.25274 11.0805V10.607L7.32826 10.6521C5.20872 10.7874 4.10385 11.2609 4.10385 12.253C4.10385 12.9971 4.75775 13.4706 5.63714 13.4706Z"
              fill="url(#paint0_linear_12866_2370)"
            />
            <path
              d="M16.8742 15.6352H13.5145V6.9767H11.4626V4.3611H13.5596V2.48959C13.5596 0.775918 14.3262 0.00927734 16.0399 0.00927734H19.3545V2.71507H17.5281C16.9418 2.71507 16.7614 2.89546 16.7614 3.43662V4.3611H19.3545V6.9767H16.8742V15.6352Z"
              fill="url(#paint1_linear_12866_2370)"
            />
            <path
              d="M24.691 15.996C21.2636 15.996 18.6029 13.4481 18.6029 9.99817C18.6029 6.52573 21.2636 4.00032 24.691 4.00032C28.0957 4.00032 30.779 6.52573 30.779 9.99817C30.779 13.4481 28.0957 15.996 24.691 15.996ZM24.691 12.8843C26.2242 12.8843 27.284 11.6216 27.284 9.99817C27.284 8.32959 26.2242 7.11199 24.691 7.11199C23.1351 7.11199 22.0754 8.32959 22.0754 9.99817C22.0754 11.6216 23.1351 12.8843 24.691 12.8843Z"
              fill="url(#paint2_linear_12866_2370)"
            />
            <path
              d="M38.6095 4.15816H38.7673V7.85608C38.4742 7.81098 38.2487 7.78843 37.9556 7.78843C36.3321 7.78843 34.7086 8.53253 34.7086 10.8099V15.6352H31.2813V4.3611H34.6184V6.2777C35.4527 4.94735 36.986 4.15816 38.6095 4.15816Z"
              fill="url(#paint3_linear_12866_2370)"
            />
            <path
              d="M44.1147 15.996C40.6874 15.996 38.0267 13.4481 38.0267 9.99817C38.0267 6.52573 40.6874 4.00032 44.1147 4.00032C47.5195 4.00032 50.2027 6.52573 50.2027 9.99817C50.2027 13.4481 47.5195 15.996 44.1147 15.996ZM44.1147 12.8843C45.648 12.8843 46.7078 11.6216 46.7078 9.99817C46.7078 8.32959 45.648 7.11199 44.1147 7.11199C42.5589 7.11199 41.4991 8.32959 41.4991 9.99817C41.4991 11.6216 42.5589 12.8843 44.1147 12.8843Z"
              fill="url(#paint4_linear_12866_2370)"
            />
            <path
              d="M54.651 15.6352H50.5247V11.7344H54.651V15.6352Z"
              fill="url(#paint5_linear_12866_2370)"
            />
            <path
              d="M59.0429 15.9735C56.7204 15.9735 54.9842 14.6657 54.9842 12.4785C54.9842 9.90797 57.442 8.91585 61.0722 8.78056L62.5604 8.73546V8.37469C62.5604 7.38256 61.8389 6.72866 60.6438 6.72866C59.4262 6.72866 58.7949 7.36002 58.5919 8.26195H55.2773C55.5479 5.87183 57.5322 4.02287 60.6438 4.02287C63.5525 4.02287 65.6946 5.44341 65.6946 8.35214V13.651C65.6946 14.35 65.7397 15.3196 65.8074 15.5901V15.6352H62.6055C62.583 15.3647 62.583 14.9813 62.583 14.5078C61.8389 15.3421 60.6438 15.9735 59.0429 15.9735ZM59.9448 13.4706C61.4781 13.4706 62.5604 12.3657 62.5604 11.0805V10.607L61.6359 10.6521C59.5164 10.7874 58.4115 11.2609 58.4115 12.253C58.4115 12.9971 59.0654 13.4706 59.9448 13.4706Z"
              fill="url(#paint6_linear_12866_2370)"
            />
            <path
              d="M70.2091 3.09839H66.7818V0.0769213H70.2091V3.09839ZM70.2091 15.6352H66.7818V4.3611H70.2091V15.6352Z"
              fill="url(#paint7_linear_12866_2370)"
            />
            <defs>
              <linearGradient
                id="paint0_linear_12866_2370"
                x1="66.9015"
                y1="15.996"
                x2="49.9334"
                y2="37.785"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#0262A1" />
                <stop offset="1" stopColor="#00365A" />
              </linearGradient>
              <linearGradient
                id="paint1_linear_12866_2370"
                x1="66.9015"
                y1="15.996"
                x2="49.9334"
                y2="37.785"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#0262A1" />
                <stop offset="1" stopColor="#00365A" />
              </linearGradient>
              <linearGradient
                id="paint2_linear_12866_2370"
                x1="66.9015"
                y1="15.996"
                x2="49.9334"
                y2="37.785"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#0262A1" />
                <stop offset="1" stopColor="#00365A" />
              </linearGradient>
              <linearGradient
                id="paint3_linear_12866_2370"
                x1="66.9015"
                y1="15.996"
                x2="49.9334"
                y2="37.785"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#0262A1" />
                <stop offset="1" stopColor="#00365A" />
              </linearGradient>
              <linearGradient
                id="paint4_linear_12866_2370"
                x1="66.9015"
                y1="15.996"
                x2="49.9334"
                y2="37.785"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#0262A1" />
                <stop offset="1" stopColor="#00365A" />
              </linearGradient>
              <linearGradient
                id="paint5_linear_12866_2370"
                x1="66.9015"
                y1="15.996"
                x2="49.9334"
                y2="37.785"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#0262A1" />
                <stop offset="1" stopColor="#00365A" />
              </linearGradient>
              <linearGradient
                id="paint6_linear_12866_2370"
                x1="66.9015"
                y1="15.996"
                x2="49.9334"
                y2="37.785"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#0262A1" />
                <stop offset="1" stopColor="#00365A" />
              </linearGradient>
              <linearGradient
                id="paint7_linear_12866_2370"
                x1="66.9015"
                y1="15.996"
                x2="49.9334"
                y2="37.785"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#0262A1" />
                <stop offset="1" stopColor="#00365A" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="separator">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="2"
            height="27"
            viewBox="0 0 2 27"
            fill="none"
          >
            <path
              d="M0.633545 0.633545L0.633544 25.9773"
              stroke="#D1D7E0"
              strokeWidth="1.26719"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <div
          className="apigee-logo"
          style={{
            backgroundImage: `url(${apigeeLogo})`,
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            width: '40px',
            height: '40px',
          }}
        ></div>
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
