import React from "react";
import "./TopBar.css";

type CancelAction = { label?: string; onClick?: () => void };
type SaveAction = {
  label?: string;              // default: "Save as Draft"
  labelWhenSaved?: string;     // default: "Saved as Draft"
  saved?: boolean;             // green pill state
  saving?: boolean;            // shows "Saving…" and disables
  disabled?: boolean;          // force-disabled from parent
  onClick?: () => void;
};

type TopBarProps = {
  title: string;
  onBack?: () => void;
  cancel?: CancelAction;
  save?: SaveAction;
  className?: string;
};

const TopBar: React.FC<TopBarProps> = ({
  title,
  onBack,
  cancel,
  save,
  className = "",
}) => {
  const saved = !!save?.saved;
  const saving = !!save?.saving;
  const disabled = saving || !!save?.disabled;

  return (
    <div className={["af-topbar", className].join(" ")}>
      <div className="af-topbar__left">
        {onBack && (
          <button
            type="button"
            className="af-topbar__back"
            onClick={onBack}
            aria-label="Back"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
  <path d="M10.0001 15.8334L4.16675 10.0001M4.16675 10.0001L10.0001 4.16675M4.16675 10.0001H15.8334" stroke="#909599" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
          </button>
        )}
        <span className="af-topbar__title">{title}</span>
      </div>

      <div className="af-topbar__right">
        {cancel && (
          <button
            type="button"
            className="af-topbar__btn af-topbar__btn--cancel"
            onClick={cancel.onClick}
          >
            {cancel.label ?? "Delete"}
          </button>
        )}

        {save && (
          <button
            type="button"
            className={[
              "af-topbar__btn",
              disabled ? "af-topbar__btn--disabled" : "",
              saved ? "af-topbar__btn--saved" : "af-topbar__btn--save",
            ].join(" ").trim()}
            onClick={(e) => {
              console.log('Save button clicked');
              e.preventDefault();
              e.stopPropagation();
              if (disabled) {
                console.log('Save button is disabled');
                return;
              }
              if (save.onClick) {
                console.log('Calling save.onClick');
                save.onClick();
              } else {
                console.error('save.onClick is not defined');
              }
            }}
            disabled={disabled}
            style={{
              cursor: disabled ? 'not-allowed' : 'pointer',
              opacity: disabled ? 0.7 : 1
            }}
          >
            {saving ? (
              <>Saving…</>
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
      </div>
    </div>
  );
};

export default TopBar;


