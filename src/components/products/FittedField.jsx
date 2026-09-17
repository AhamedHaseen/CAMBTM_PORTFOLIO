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

    const targetX = seen.current ? pointer.current.x : box.left + box.width / 2;
    const targetY = seen.current ? pointer.current.y : box.top + box.height / 2;

    const lines = container.children;
    for (let index = 0; index < lines.length; index += 1) {
      const column = index % COLUMNS;
      const row = Math.floor(index / COLUMNS);
      const centreX = box.left + ((column + 0.5) / COLUMNS) * box.width;
      const centreY = box.top + ((row + 0.5) / ROWS) * box.height;

      const angle =
        (Math.atan2(targetY - centreY, targetX - centreX) * 180) / Math.PI;
      lines[index].style.setProperty("--angle", `${angle.toFixed(1)}deg`);
    }
  }, []);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const stillness = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (stillness.matches) return;

    const schedule = () => {
      if (!frame.current) frame.current = window.requestAnimationFrame(apply);
    };

    // Calculate initial needle angles towards grid center on load
    schedule();

    const updateCoords = (clientX, clientY) => {
      pointer.current = { x: clientX, y: clientY };
      seen.current = true;
      schedule();
    };

    const onPointerMove = (event) => {
      updateCoords(event.clientX, event.clientY);
    };

    const onTouchStartMove = (event) => {
      if (event.touches && event.touches[0]) {
        updateCoords(event.touches[0].clientX, event.touches[0].clientY);
      }
    };

    const onReflow = () => {
      schedule();
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerMove, { passive: true });
    window.addEventListener("touchstart", onTouchStartMove, { passive: true });
    window.addEventListener("touchmove", onTouchStartMove, { passive: true });
    window.addEventListener("scroll", onReflow, { passive: true });
    window.addEventListener("resize", onReflow, { passive: true });

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerMove);
      window.removeEventListener("touchstart", onTouchStartMove);
      window.removeEventListener("touchmove", onTouchStartMove);
      window.removeEventListener("scroll", onReflow);
      window.removeEventListener("resize", onReflow);
      if (frame.current) window.cancelAnimationFrame(frame.current);
    };
  }, [apply]);

  return (
    <div className="cambt-customisation-section">
      <div className="cambt-fitted-field-wrap">
        <div className="cambt-fitted-info">
          <span className="cambt-label">{copy.label}</span>
          <div className="cambt-section-head" style={{ marginBottom: 0 }}>
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
        </div>

        <div aria-hidden="true" className="cambt-fitted-grid" ref={ref}>
          {Array.from({ length: CELLS }, (_, index) => (
            <span className="cambt-fitted-line" key={index} />
          ))}
        </div>
      </div>

      {/* 4 Delivery Principles without glowing spotlight */}
      <div className="cambt-fitted-cards-grid">
        {copy.points.map((pt, i) => (
          <div key={i} className="cambt-fitted-card">
            <div className="cambt-fitted-card-header">
              <span className="cambt-fitted-card-num">0{i + 1}</span>
            </div>
            <p className="cambt-fitted-card-text">{pt}</p>
          </div>
        ))}
      </div>
    </div>
  );
}



