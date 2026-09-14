import React, { useCallback, useEffect, useRef } from "react";

const COLUMNS = 9;
const ROWS = 6;
const CELLS = COLUMNS * ROWS;

export default function FittedField({ copy }) {
  const ref = useRef(null);
  const frame = useRef(0);
  const pointer = useRef({ x: 0, y: 0 });
  const seen = useRef(false);

  const apply = useCallback(() => {
    frame.current = 0;
    const container = ref.current;
    if (!container) return;

    const box = container.getBoundingClientRect();
    if (!box.width || !box.height) return;

    const lines = container.children;
    for (let index = 0; index < lines.length; index += 1) {
      const column = index % COLUMNS;
      const row = Math.floor(index / COLUMNS);
      const centreX = box.left + ((column + 0.5) / COLUMNS) * box.width;
      const centreY = box.top + ((row + 0.5) / ROWS) * box.height;

      const angle =
        (Math.atan2(pointer.current.y - centreY, pointer.current.x - centreX) * 180) / Math.PI;
      lines[index].style.setProperty("--angle", `${angle.toFixed(1)}deg`);
    }
  }, []);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const responsive = window.matchMedia("(hover: hover) and (pointer: fine)");
    const stillness = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!responsive.matches || stillness.matches) return;

    const schedule = () => {
      if (!frame.current) frame.current = window.requestAnimationFrame(apply);
    };

    const onMove = (event) => {
      pointer.current = { x: event.clientX, y: event.clientY };
      seen.current = true;
      schedule();
    };

    const onReflow = () => {
      if (seen.current) schedule();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onReflow, { passive: true });
    window.addEventListener("resize", onReflow, { passive: true });

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onReflow);
      window.removeEventListener("resize", onReflow);
      if (frame.current) window.cancelAnimationFrame(frame.current);
    };
  }, [apply]);

  return (
    <div className="cambt-fitted-field-wrap">
      <div className="cambt-fitted-info">
        <span className="cambt-label">{copy.label}</span>
        <div className="cambt-section-head" style={{ marginBottom: "1.5rem" }}>
          <h2>
            {copy.headingParts.map((part, index) => {
              if (part.tone === "accent") {
                return (
                  <span key={index} style={{ color: "var(--cambt-color-brand-blue)" }}>
                    {part.text}
                  </span>
                );
              }
              return <span key={index}>{part.text}</span>;
            })}
          </h2>
          <p>{copy.body}</p>
        </div>
        <ul className="cambt-fitted-points">
          {copy.points.map((pt, i) => (
            <li key={i}>{pt}</li>
          ))}
        </ul>
      </div>

      <div aria-hidden="true" className="cambt-fitted-grid" ref={ref}>
        {Array.from({ length: CELLS }, (_, index) => (
          <span className="cambt-fitted-line" key={index} />
        ))}
      </div>
    </div>
  );
}
