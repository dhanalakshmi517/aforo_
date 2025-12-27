import React from "react";
import "./SkeletonForm.css";

export type SkeletonFormProps = {
  /** Optional content for the left grey rail */
  rail?: React.ReactNode;
  /** Main content (your form, sections, etc.) */
  children?: React.ReactNode;
  /** Optional extra class for the card */
  className?: string;
};

export default function SkeletonForm({
  rail,
  children,
  className = "",
}: SkeletonFormProps): React.JSX.Element {
  return (
    <div className="af-skel-viewport">
      <div className={["af-skel-card", className].join(" ").trim()}>
        <div className="af-skel-grid">
          <aside className="af-skel-rail">
            <div className="af-skel-rail__content">{rail}</div>
          </aside>

          <section className="af-skel-main">
            {/* faint separators behind content */}
            <div className="af-skel-rule af-skel-rule--top" />
            <div className="af-skel-rule af-skel-rule--bottom" />

            {/* your page content goes here */}
            <div className="af-skel-main__content">{children}</div>
          </section>
        </div>
      </div>
    </div>
  );
}


