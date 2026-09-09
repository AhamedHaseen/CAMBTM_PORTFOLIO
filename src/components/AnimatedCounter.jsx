import React, { useEffect, useState, useRef } from "react";

export default function AnimatedCounter({
  value,
  prefix = "",
  suffix = "",
  duration = 2500,
  delay = 900,
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    let animFrame;
    let timeoutId;

    const startCounting = () => {
      if (startedRef.current) return;
      startedRef.current = true;

      timeoutId = setTimeout(() => {
        const startTime = performance.now();
        const startVal = 0;
        const endVal = typeof value === "number" ? value : parseInt(value, 10) || 0;

        const animate = (currentTime) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);

          // Quadratic ease-out for steady, clear and satisfying visible increments
          const easeProgress = 1 - Math.pow(1 - progress, 2);
          const currentCount = Math.round(startVal + (endVal - startVal) * easeProgress);

          setDisplayValue(currentCount);

          if (progress < 1) {
            animFrame = requestAnimationFrame(animate);
          } else {
            setDisplayValue(endVal);
          }
        };

        animFrame = requestAnimationFrame(animate);
      }, delay);
    };

    const hasActiveLoader = document.querySelector(".loading-overlay:not(.hidden):not(.out)");
    if (!hasActiveLoader) {
      // If no active loader is blocking the view, start after a slight initial delay
      startCounting();
    } else {
      const handleLoaderDone = () => {
        startCounting();
      };
      document.addEventListener("cambm:loader-done", handleLoaderDone, { once: true });

      // Fallback timer if event is not captured
      const fallbackTimer = setTimeout(() => {
        startCounting();
      }, 6500);

      return () => {
        document.removeEventListener("cambm:loader-done", handleLoaderDone);
        clearTimeout(fallbackTimer);
        if (timeoutId) clearTimeout(timeoutId);
        if (animFrame) cancelAnimationFrame(animFrame);
      };
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (animFrame) cancelAnimationFrame(animFrame);
    };
  }, [value, duration, delay]);

  return (
    <span>
      {prefix}
      {displayValue}
      {suffix}
    </span>
  );
}
