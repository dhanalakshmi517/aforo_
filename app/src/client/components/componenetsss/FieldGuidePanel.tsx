import * as React from "react";
import "./FieldGuidePanel.css";

export type FieldGuide = {
  title: string;
  imageSrc?: string;
  imageAlt?: string;
  steps: string[];
};

type Props = {
  guide?: FieldGuide | null;

  emptyTitle?: string;
  emptySubtitle?: string;

  className?: string;
};

export default function FieldGuidePanel({
  guide,
  emptyTitle = "Tap any field to see what to enter.",
  emptySubtitle = "We will guide you with some quick notes.",
  className = "",
}: Props) {
  const hasGuide = !!guide;

  return (
    <section className={`fgCard ${className}`}>
      <div className="fgInner">
        {!hasGuide ? (
          <EmptyState title={emptyTitle} subtitle={emptySubtitle} />
        ) : (
          <GuideState guide={guide!} />
        )}
      </div>
    </section>
  );
}

function EmptyState({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="fgEmpty">
      <div className="fgEmptyBadge" aria-hidden="true">
        <InfoIcon />
      </div>

      <div className="fgEmptyText">
        <p className="fgEmptyTitle">{title}</p>
        <p className="fgEmptySub">{subtitle}</p>
      </div>
    </div>
  );
}

function GuideState({ guide }: { guide: FieldGuide }) {
  return (
    <div className="fgGuide">
      <div className="fgGuideTitleRow">
        <span className="fgGuideQ" aria-hidden="true">
          <HelpIcon />
        </span>
        <h3 className="fgGuideTitle">{guide.title}</h3>
      </div>

      {guide.imageSrc ? (
        <div className="fgGuideMedia">
          <img
            className="fgGuideImg"
            src={guide.imageSrc}
            alt={guide.imageAlt || guide.title}
            loading="lazy"
            draggable={false}
          />
        </div>
      ) : null}

      <ul className="fgGuideSteps">
        {guide.steps.map((s, idx) => (
          <li key={`${idx}-${s}`}>{s}</li>
        ))}
      </ul>
    </div>
  );
}

function InfoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path
        d="M10 18.3333C5.39763 18.3333 1.66667 14.6024 1.66667 10C1.66667 5.39763 5.39763 1.66667 10 1.66667C14.6024 1.66667 18.3333 5.39763 18.3333 10C18.3333 14.6024 14.6024 18.3333 10 18.3333Z"
        stroke="#0B66D1"
        strokeWidth="1.6"
      />
      <path
        d="M10 9.16667V14.1667"
        stroke="#0B66D1"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M10 6.66667H10.0083"
        stroke="#0B66D1"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function HelpIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path
        d="M10 18.3333C5.39763 18.3333 1.66667 14.6024 1.66667 10C1.66667 5.39763 5.39763 1.66667 10 1.66667C14.6024 1.66667 18.3333 5.39763 18.3333 10C18.3333 14.6024 14.6024 18.3333 10 18.3333Z"
        stroke="#0B66D1"
        strokeWidth="1.6"
      />
      <path
        d="M8.925 7.625C9.13333 6.875 9.80833 6.25 10.6083 6.25C11.5583 6.25 12.325 6.95833 12.325 7.875C12.325 8.70833 11.7917 9.16667 11.1833 9.51667C10.6083 9.85 10 10.2167 10 11.25V11.6667"
        stroke="#0B66D1"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 14.1667H10.0083"
        stroke="#0B66D1"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
