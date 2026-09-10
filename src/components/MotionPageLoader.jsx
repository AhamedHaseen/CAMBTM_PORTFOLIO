import React, { useEffect, useState, useRef } from "react";

export default function MotionPageLoader() {
  const [isLoading, setIsLoading] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const containerRef = useRef(null);
  const pctRef = useRef(null);

  useEffect(() => {
    let rafId;
    let exitTimer;
    let hideTimer;
    const startTime = performance.now();
    const DURATION = 1100; // 1.1s smooth animated fill
    const HOLD_TIME = 180; // Brief pause at 100% before cinematic zoom-through

    const updateFrame = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / DURATION, 1);

      // Smooth cubic-out easing curve
      const eased = 1 - Math.pow(1 - progress, 2.5);

      if (containerRef.current) {
        containerRef.current.style.setProperty("--preloader-p", eased.toFixed(4));
      }
      if (pctRef.current) {
        pctRef.current.textContent = `${Math.round(eased * 100)}%`;
      }

      if (progress < 1) {
        rafId = requestAnimationFrame(updateFrame);
      } else {
        if (containerRef.current) {
          containerRef.current.style.setProperty("--preloader-p", "1");
        }
        if (pctRef.current) {
          pctRef.current.textContent = "100%";
        }

        exitTimer = window.setTimeout(() => {
          setIsExiting(true);
          hideTimer = window.setTimeout(() => {
            setIsLoading(false);
            try {
              document.dispatchEvent(new CustomEvent("cambm:loader-done"));
              document.dispatchEvent(new CustomEvent("cambm:revealed"));
            } catch (e) {}
          }, 850);
        }, HOLD_TIME);
      }
    };

    rafId = requestAnimationFrame(updateFrame);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (exitTimer) window.clearTimeout(exitTimer);
      if (hideTimer) window.clearTimeout(hideTimer);
    };
  }, []);

  if (!isLoading) return null;

  return (
    <div
      ref={containerRef}
      className={`loading-overlay${isExiting ? " out" : ""}`}
      role="status"
      aria-live="polite"
      aria-label="Loading Cambridge Marketing"
      style={{ "--preloader-p": 0 }}
    >
      <div className="preloader-stage">
        <div className="preloader-meta">
          <span data-i18n="loader.loading">Loading</span>
          <b aria-live="polite" ref={pctRef}>
            0%
          </b>
        </div>
        <div className="preloader-rule" aria-hidden="true" />
      </div>
    </div>
  );
}
