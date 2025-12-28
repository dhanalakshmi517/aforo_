import React from "react";
import "./TopBar.css";
import Spark from "../componenetsss/Spark";
import Bell from "../componenetsss/Bell";

type BackAction = {
  onClick: () => void;
  disabled?: boolean;
  title?: string;
  ariaLabel?: string;
};

type CancelAction = { label?: string; onClick?: () => void; disabled?: boolean; title?: string };
type SaveAction = {
  label?: string;
  labelWhenSaved?: string;
  saved?: boolean;
  saving?: boolean;
  disabled?: boolean;
  onClick?: () => void;
};

type TopBarProps = {
  title: string;

  /** Backward compatible: still works if you pass onBack only */
  onBack?: () => void;

  /** New: richer control over the back arrow */
  back?: BackAction;

  cancel?: CancelAction;
  save?: SaveAction;
  className?: string;
};

const TopBar: React.FC<TopBarProps> = ({
  title,
  onBack,
  back: backProp,
  cancel,
  save,
  className = "",
}) => {
  const saved = !!save?.saved;
  const saving = !!save?.saving;
  const saveDisabled = saving || !!save?.disabled;

  // Normalize back config (support both old onBack and new back object)
  const back = backProp ?? (onBack ? { onClick: onBack } : undefined);
  const backDisabled = !!back?.disabled;

  return (
    <div className={["af-topbar", className].join(" ")}>
      <div className="af-topbar__container">
        <div className="af-topbar__left">
        {back && (
          <button
            type="button"
            className={[
              "af-topbar__back",
              backDisabled ? "is-disabled" : "",
            ].join(" ")}
            onClick={back.onClick}
            disabled={backDisabled}
            aria-label={back.ariaLabel ?? "Back"}
            title={back.title}
          >
            {/* IMPORTANT: stroke uses currentColor so CSS can theme the states */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              className="af-topbar__back-icon"
            >
              <path
                d="M10.0001 15.8334L4.16675 10.0001M4.16675 10.0001L10.0001 4.16675M4.16675 10.0001H15.8334"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
          <span className="af-topbar__title">{title}</span>
        </div>

        <div className="af-topbar__right">
        {/* Icon buttons */}
       

        {cancel && (
          <button
            type="button"
            className={[
              "af-topbar__btn",
              "af-topbar__btn--cancel",
              cancel.disabled ? "is-disabled" : "",
            ].join(" ").trim()}
            onClick={cancel.onClick}
            disabled={!!cancel.disabled}
            aria-disabled={!!cancel.disabled}
            title={cancel.title}
          >
            {cancel.label ?? "Discard"}
          </button>
        )}

        {save && (
          <button
            type="button"
            className={[
              "af-topbar__btn",
              saveDisabled ? "af-topbar__btn--disabled" : "",
              saved ? "af-topbar__btn--saved" : "af-topbar__btn--save",
            ].join(" ").trim()}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (saveDisabled) return;
              save.onClick?.();
            }}
            disabled={saveDisabled}
            style={{ cursor: saveDisabled ? "not-allowed" : "pointer", opacity: saveDisabled ? 0.7 : 1 }}
          >
            {save.saving ? (
              <>
                <span className="af-spinner" aria-hidden="true"></span>
                Saving…
              </>
            ) : saved ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" className="af-topbar__btn-icon">
                  <path d="M13.3337 4L6.00033 11.3333L2.66699 8" stroke="#23A36D" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {save.labelWhenSaved ?? "Saved as Draft"}
              </>
            ) : (
              <>{save.label ?? "Save as Draft"}</>
            )}
            </button>
          )}
          
          {save && (
            <svg xmlns="http://www.w3.org/2000/svg" width="1" height="34" viewBox="0 0 1 34" fill="none" className="af-topbar__separator" aria-hidden="true">
              <path d="M0.5 0.5V33.5" stroke="#EEF1F6" strokeLinecap="round"/>
            </svg>
          )}
          
           <Spark onClick={() => console.log('Spark clicked')} />
           <Bell onClick={() => console.log('Bell clicked')} />
        </div>
      </div>
    </div>
  );
};

export default TopBar;
