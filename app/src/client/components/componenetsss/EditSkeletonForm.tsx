import React from "react";
import "./EditSkeletonForm.css";

export type SkeletonFormProps = {
  /** Optional content for the left grey rail */
  rail?: React.ReactNode;
  /** Main content (your form, sections, etc.) */
  children?: React.ReactNode;
  /** Optional extra class for the card */
  className?: string;
};

export default function EditSkeletonForm({
  rail,
  children,
  className = "",
}: SkeletonFormProps): React.JSX.Element {
  return (
    <div className="edit-af-skel-viewport">
      <div className={["edit-af-skel-card", className].join(" ").trim()}>
        <div className="edit-af-skel-grid">
          <aside className="edit-af-skel-rail">
            <div className="edit-af-skel-rail__content">{rail}</div>
          </aside>

          <section className="edit-af-skel-main">
            {/* faint separators behind content */}
            <div className="edit-af-skel-rule af-skel-rule--top" />
            <div className="edit-af-skel-rule af-skel-rule--bottom" />

            {/* your page content goes here */}
            <div className="edit-af-skel-main__content">{children}</div>
          </section>
        </div>
      </div>
    </div>
  );
}
