import React, { useEffect, useState } from "react";

export default function MotionPageLoader() {
  const [isLoading, setIsLoading] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let exitTimer;
    let hideTimer;
    const progressTimer = window.setInterval(() => {
      setProgress((current) => {
        const next = Math.min(current + 1, 100);
        if (next === 100) {
          window.clearInterval(progressTimer);
          exitTimer = window.setTimeout(() => {
            setIsExiting(true);
            hideTimer = window.setTimeout(() => {
              setIsLoading(false);
              document.dispatchEvent(new CustomEvent("cambm:loader-done"));
            }, 900);
          }, 500);
        }
        return next;
      });
    }, 50);

    return () => {
      window.clearInterval(progressTimer);
      if (exitTimer) window.clearTimeout(exitTimer);
      if (hideTimer) window.clearTimeout(hideTimer);
    };
  }, []);

  return (
    isLoading && (
      <div
        className={`loading-overlay${isExiting ? " out" : ""}`}
        role="status"
        aria-live="polite"
        aria-label="Loading Cambridge Marketing"
        style={{ "--preloader-p": progress / 100 }}
      >
        <div className="preloader-stage">
          <div className="preloader-meta">
            <span>Loading</span>
            <b aria-live="polite">{progress}%</b>
          </div>
          <div className="preloader-rule" aria-hidden="true" />
        </div>
      </div>
    )
  );
}
