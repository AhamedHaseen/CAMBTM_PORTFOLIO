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
        <section className="cambt-panel cambt-panel-generic">
          <header className="cambt-panel-head">
            <h3>{copy.genericTitle}</h3>
            <p>{copy.genericNote}</p>
          </header>
          <ul className="cambt-fields-list">
            {copy.generic.map((row) => (
              <li className="cambt-field-item" data-verdict={row.verdict} key={row.field}>
                <span className="cambt-field-name">{row.field}</span>
                <span className="cambt-verdict-tag">{row.verdict}</span>
              </li>
            ))}
          </ul>
          <p className="cambt-tally">
            <span className="cambt-tally-figure danger">{unused}</span>
            <span className="cambt-tally-label">{copy.unusedLabel}</span>
          </p>
        </section>

        <section className="cambt-panel cambt-panel-fitted">
          <header className="cambt-panel-head">
            <h3>{copy.fittedTitle}</h3>
            <p>{copy.fittedNote}</p>
          </header>
          <ul className="cambt-fields-list">
            {copy.fitted.map((row) => (
              <li className="cambt-field-item" data-verdict={row.verdict} key={row.field}>
                <span className="cambt-field-name">{row.field}</span>
                <span className="cambt-verdict-tag">{row.verdict}</span>
              </li>
            ))}
          </ul>
          <p className="cambt-tally">
            <span className="cambt-tally-figure success">0</span>
            <span className="cambt-tally-label">{copy.unusedLabel}</span>
          </p>
        </section>
      </div>
    </div>
  );
}
