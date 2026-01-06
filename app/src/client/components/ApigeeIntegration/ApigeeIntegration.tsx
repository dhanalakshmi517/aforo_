// ApigeeIntegration.tsx
import * as React from "react";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ApigeeIntegration.css";
import ApigeeBar from "./ApigeeBar";
import ApigeeHintCard from "./ApigeeHintCard";
import { InputField, SelectField } from "../componenetsss/Inputs";
import PrimaryButton from "../componenetsss/PrimaryButton";
import UploadField from "./UploadField";

import { orgIdImage, envImage, jsonImage, apigeeLogo } from "../../static/images";
import { saveApigeeConnection } from "./api";
import type { ConnectionResponse } from "./api";

type FocusedField = "orgId" | "environment" | "analytics" | "json" | null;

export default function ApigeeIntegration() {
  const navigate = useNavigate();

  const [orgId, setOrgId] = useState("");
  const [environment, setEnvironment] = useState("");
  const [analyticsMode, setAnalyticsMode] = useState<"STANDARD" | "BASIC">("STANDARD");

  const [serviceAccountFile, setServiceAccountFile] = useState<File | null>(null);
  const [focusedField, setFocusedField] = useState<FocusedField>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const canConnect =
    !!orgId.trim() && !!environment.trim() && !!serviceAccountFile && !isSubmitting;

  function handleBackClick() {
    navigate("/get-started/integrations");
  }

  const handleFileChange = (file: File | null) => {
    if (!file) {
      setServiceAccountFile(null);
      setErrorMessage(null);
      return;
    }

    if (!file.name.toLowerCase().endsWith(".json")) {
      setErrorMessage("Please upload a valid .json service account file.");
      setServiceAccountFile(null);
      return;
    }

    setErrorMessage(null);
    setServiceAccountFile(file);
  };

  async function handleConnectApigee() {
    setErrorMessage(null);

    if (!orgId.trim()) return setErrorMessage("Apigee Org ID is required.");
    if (!environment.trim()) return setErrorMessage("Environment is required.");
    if (!serviceAccountFile) return setErrorMessage("Service account JSON file is required.");

    setIsSubmitting(true);
    try {
      const response: ConnectionResponse = await saveApigeeConnection(
        orgId.trim(),
        environment.trim(),
        analyticsMode,
        serviceAccountFile
      );

      if (response.connected) {
        // Pass form data to success page for display in ReviewComponent
        navigate("/apigee-success", {
          state: {
            orgId: orgId.trim(),
            environment: environment.trim(),
            analyticsMode: analyticsMode
          }
        });
      } else {
        setErrorMessage(
          response.message ||
            "Unable to connect to Apigee. Please check credentials and try again."
        );
        navigate("/apigee-failure");
      }
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.message ||
          "Failed to connect to Apigee. Please verify your details and try again."
      );
      navigate("/apigee-failure");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="kiPage">
      {/* TOP BAR */}
      <ApigeeBar
        title="Apigee Integration"
        onBack={handleBackClick}
        onMagicClick={() => console.log("Magic clicked")}
        onBellClick={() => console.log("Bell clicked")}
      />

      {/* CONTENT */}
      <div className="kongShell">
        <div className="kiCard">
          <div className="kiCardBody">
            <div className="kiGrid">
              {/* LEFT: FORM */}
              <div className="kiLeft">
                <div className="kongSectionTitle">Connection Management</div>

                <div className="kiField">
                  <InputField
                    label="Apigee Org ID"
                    value={orgId}
                    onChange={setOrgId}
                    placeholder="Enter organization id"
                    onFocus={() => setFocusedField("orgId")}
                    onBlur={() => setFocusedField(null)}
                  />
                </div>

                <div className="kiField">
                  <InputField
                    label="Enter Environment(s)"
                    value={environment}
                    onChange={setEnvironment}
                    placeholder="eg. dev,prod"
                    onFocus={() => setFocusedField("environment")}
                    onBlur={() => setFocusedField(null)}
                  />
                </div>

                <div className="kiField" onClick={() => setFocusedField("analytics")}>
                  <SelectField
                    label="Analytics Mode"
                    value={analyticsMode}
                    onChange={(v: string) => setAnalyticsMode(v as "STANDARD" | "BASIC")}
                    onBlur={() => setFocusedField(null)}
                    options={[
                      { label: "Standard", value: "STANDARD" },
                      { label: "Basic", value: "BASIC" },
                    ]}
                    placeholderOption="Select Analytics Mode"
                  />
                </div>

                <div className="kiField" onClick={() => setFocusedField("json")}>
                  <label className="kiLabel">JSON File</label>
                  <UploadField
                    value={serviceAccountFile}
                    buttonText="Upload"
                    accept=".json"
                    onChange={handleFileChange}
                  />

                  <div className="apgFileHint">
                    Accepted file formats are <b>.json</b>
                  </div>
                </div>

                {errorMessage && (
                  <div className="apgError">
                    {errorMessage}
                  </div>
                )}

                <div className="kiLeftSpacer" />
              </div>

              {/* RIGHT: GUIDE */}
              <div className="kiRight">
                <ApigeeHintCard focusedField={focusedField} />
              </div>
            </div>
          </div>

          {/* FOOTER BAR */}
          <div className="kiFooter">
            <div className="kiFooterLeft">
              <span className="kiFooterIcon" aria-hidden="true">
                <AforoMark />
              </span>

              <span className="kiFooterDivider" aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" width="1" height="22" viewBox="0 0 1 22" fill="none">
                  <path
                    d="M0.45459 0.45459V20.9091"
                    stroke="#EEF1F6"
                    strokeWidth="0.909091"
                    strokeLinecap="round"
                  />
                </svg>
              </span>

              <span className="kiFooterIcon" aria-hidden="true">
                <ApigeeMark />
              </span>
            </div>

            <PrimaryButton
              onClick={handleConnectApigee}
              disabled={!canConnect}
              className="kong-button"
            >
              {isSubmitting ? "Connecting…" : "Connect Apigee"}
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}


/* Footer marks */
function AforoMark() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="23" height="19" viewBox="0 0 23 19" fill="none">
      <path d="M9.06291 17.5641L7.33649 13.2135C6.94618 12.2299 6.75102 11.7382 6.90631 11.6483C7.06161 11.5585 7.39053 11.973 8.04837 12.8019L11.7653 17.4851C12.1597 17.9822 12.357 18.2307 12.6062 18.4047C12.7878 18.5315 12.9885 18.6284 13.2007 18.6919C13.4919 18.7789 13.8092 18.7789 14.4438 18.7789C17.9864 18.7789 19.7577 18.7789 20.7534 17.9834C21.4628 17.4166 21.9345 16.6049 22.0757 15.7079C22.274 14.4489 21.397 12.9099 19.6431 9.83196L18.8699 8.47519C15.7771 3.04762 14.2307 0.33383 11.9163 0.037962C11.5802 -0.00499916 11.2405 -0.0113082 10.9031 0.0191469C8.57925 0.228886 6.93316 2.88339 3.64098 8.1924L2.95857 9.29287C0.827786 12.729 -0.237605 14.4471 0.0446479 15.8563C0.193534 16.5997 0.571029 17.278 1.12434 17.7963C2.17329 18.7789 4.19487 18.7789 8.23803 18.7789C8.72371 18.7789 8.96655 18.7789 9.11055 18.6601C9.18701 18.597 9.24383 18.5133 9.27428 18.4189C9.33162 18.2413 9.24205 18.0156 9.06291 17.5641Z" fill="#8BA4B8"/>
    </svg>
  );
}

function ApigeeMark() {
  return (
    <div
      className="apgFooterLogo"
      style={{
        backgroundImage: `url(${apigeeLogo})`,
        backgroundSize: "contain",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    />
  );
}
