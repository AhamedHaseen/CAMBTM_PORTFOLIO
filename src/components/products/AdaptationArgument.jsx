import React from "react";

export default function AdaptationArgument({ copy }) {
  const unused = copy.generic.filter((row) => row.verdict === "unused").length;

  return (
    <div className="cambt-argument">
      <div className="cambt-section-head">
        <span className="cambt-label">{copy.label}</span>
        <h2>
          {copy.headingParts.map((part, index) => {
            if (part.tone === "accent") {
              return (
                <span key={index} style={{ color: "var(--cambt-color-brand-blue)" }}>
                  {part.text}
                </span>
              );
            }
            if (part.tone === "counter") {
              return (
                <span
                  key={index}
                  style={{
                    color: "var(--cambt-color-text-secondary)",
                    textDecoration: "line-through",
                    textDecorationColor: "var(--cambt-color-danger)",
                  }}
                >
                  {part.text}
                </span>
              );
            }
            return <span key={index}>{part.text}</span>;
          })}
        </h2>
        <p>{copy.body}</p>
      </div>

      <div className="cambt-diptych">
        {/* Generic Panel */}
        <div className="cambt-compare-card cambt-compare-generic">
          <div className="cambt-compare-head">
            <h3 className="cambt-compare-title">{copy.genericTitle}</h3>
            <p className="cambt-compare-desc">{copy.genericNote}</p>
          </div>

          <div className="cambt-compare-table">
            {copy.generic.map((row) => (
              <div className="cambt-compare-row" data-verdict={row.verdict} key={row.field}>
                <span className="cambt-row-name">{row.field}</span>
                <span className={`cambt-row-badge ${row.verdict}`}>
                  {row.verdict}
                </span>
              </div>
            ))}
          </div>

          <div className="cambt-compare-footer">
            <span className="cambt-footer-num danger">{unused}</span>
            <span className="cambt-footer-label">{copy.unusedLabel}</span>
          </div>
        </div>

        {/* Fitted Panel */}
        <div className="cambt-compare-card cambt-compare-fitted">
          <div className="cambt-compare-head">
            <h3 className="cambt-compare-title">{copy.fittedTitle}</h3>
            <p className="cambt-compare-desc">{copy.fittedNote}</p>
          </div>

          <div className="cambt-compare-table">
            {copy.fitted.map((row) => (
              <div className="cambt-compare-row" data-verdict={row.verdict} key={row.field}>
                <span className="cambt-row-name">{row.field}</span>
                <span className={`cambt-row-badge ${row.verdict}`}>
                  {row.verdict}
                </span>
              </div>
            ))}
          </div>

          <div className="cambt-compare-footer">
            <span className="cambt-footer-num success">0</span>
            <span className="cambt-footer-label">{copy.unusedLabel}</span>
          </div>
        </div>
      </div>
    </div>
  );
}


