import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import SystemMark from "./SystemMark";

export default function SystemWall({ systems }) {
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (!window.matchMedia("(prefers-reduced-motion: no-preference)").matches) return;

    let visible = false;
    const sync = () => {
      element.style.setProperty("--wall-drift", visible && !document.hidden ? "9s" : "0s");
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry?.isIntersecting ?? false;
        sync();
      },
      { threshold: 0.1 }
    );
    observer.observe(element);
    document.addEventListener("visibilitychange", sync);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  return (
    <div className="cambt-desk" ref={ref}>
      <div className="cambt-machine">
        <div className="cambt-bezel">
          <div className="cambt-glass">
            <ul aria-label="Systems" className="cambt-wall-grid">
              {systems.map((system, index) => (
                <li
                  className="cambt-wall-cell"
                  key={system.slug}
                  style={{
                    "--cell-index": (index % 3) + Math.floor(index / 3),
                  }}
                >
                  <Link
                    aria-label={system.name}
                    className="cambt-wall-tile"
                    to={`/products/${system.slug}`}
                  >
                    <span className="cambt-wall-plate">
                      <SystemMark slug={system.slug} />
                    </span>
                    <span className="cambt-wall-label">{system.label || system.shortName}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div aria-hidden="true" className="cambt-neck" />
        <div aria-hidden="true" className="cambt-foot" />
      </div>
    </div>
  );
}
