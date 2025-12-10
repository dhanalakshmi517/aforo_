import React from "react";
import "./TopBar.css";

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
          
           <button
          type="button"
          className="af-topbar__icon-btn"
          aria-label="Magic"
          title="Magic"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none">
            <path d="M7.44033 1.2871C7.47246 1.11505 7.56376 0.959662 7.6984 0.847839C7.83304 0.736017 8.00255 0.674805 8.17758 0.674805C8.3526 0.674805 8.52211 0.736017 8.65675 0.847839C8.7914 0.959662 8.88269 1.11505 8.91483 1.2871L9.70308 5.4556C9.75906 5.75196 9.90308 6.02456 10.1163 6.23783C10.3296 6.45109 10.6022 6.59512 10.8986 6.6511L15.0671 7.43935C15.2391 7.47149 15.3945 7.56278 15.5063 7.69742C15.6182 7.83207 15.6794 8.00158 15.6794 8.1766C15.6794 8.35162 15.6182 8.52113 15.5063 8.65578C15.3945 8.79042 15.2391 8.88172 15.0671 8.91385L10.8986 9.7021C10.6022 9.75808 10.3296 9.90211 10.1163 10.1154C9.90308 10.3286 9.75906 10.6012 9.70308 10.8976L8.91483 15.0661C8.88269 15.2381 8.7914 15.3935 8.65675 15.5054C8.52211 15.6172 8.3526 15.6784 8.17758 15.6784C8.00255 15.6784 7.83304 15.6172 7.6984 15.5054C7.56376 15.3935 7.47246 15.2381 7.44033 15.0661L6.65208 10.8976C6.59609 10.6012 6.45207 10.3286 6.2388 10.1154C6.02554 9.90211 5.75294 9.75808 5.45658 9.7021L1.28808 8.91385C1.11603 8.88172 0.960639 8.79042 0.848816 8.65578C0.736993 8.52113 0.675781 8.35162 0.675781 8.1766C0.675781 8.00158 0.736993 7.83207 0.848816 7.69742C0.960639 7.56278 1.11603 7.47149 1.28808 7.43935L5.45658 6.6511C5.75294 6.59512 6.02554 6.45109 6.2388 6.23783C6.45207 6.02456 6.59609 5.75196 6.65208 5.4556L7.44033 1.2871Z" stroke="#25303D" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <button
          type="button"
          className="af-topbar__icon-btn"
          aria-label="Notifications"
          title="Notifications"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="17" viewBox="0 0 15 17" fill="none">
            <path d="M6.12623 14.9248C6.25789 15.1528 6.44725 15.3422 6.67527 15.4738C6.90329 15.6054 7.16194 15.6747 7.42523 15.6747C7.68853 15.6747 7.94718 15.6054 8.1752 15.4738C8.40322 15.3422 8.59258 15.1528 8.72423 14.9248M0.871733 10.6693C0.773757 10.7767 0.709099 10.9102 0.685625 11.0537C0.662151 11.1972 0.680873 11.3443 0.739513 11.4774C0.798153 11.6104 0.894185 11.7235 1.01592 11.8029C1.13767 11.8823 1.27987 11.9247 1.42523 11.9248H13.4252C13.5706 11.9249 13.7128 11.8827 13.8346 11.8034C13.9565 11.7241 14.0526 11.6111 14.1114 11.4782C14.1702 11.3453 14.1891 11.1981 14.1658 11.0546C14.1425 10.9112 14.0781 10.7776 13.9802 10.6701C12.9827 9.6418 11.9252 8.54905 11.9252 5.1748C11.9252 3.98133 11.4511 2.83674 10.6072 1.99282C9.7633 1.14891 8.61871 0.674805 7.42523 0.674805C6.23176 0.674805 5.08717 1.14891 4.24325 1.99282C3.39934 2.83674 2.92523 3.98133 2.92523 5.1748C2.92523 8.54905 1.86698 9.6418 0.871733 10.6693Z" stroke="#25303D" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
