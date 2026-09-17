import React, { useEffect, useState, useRef } from "react";

const ALL_DEFAULT_BRAND_LOGOS = [
  'images/brands/myra.png',
  'images/brands/hijaz-logo.png',
  'images/brands/uneeflow.png',
  'images/brands/milemir.png',
  'images/brands/whitehawk.png',
  'images/brands/top-baller.png',
  'images/brands/dan-massey-logo.png',
  'images/brands/onex-roze-logo.png',
  'images/brands/al-fakhir.png',
  'images/brands/rumico.png',
  'images/brands/airlink-cargo.png',
  'images/brands/bananaleaf.png',
  'images/brands/bluestar.png',
  'images/brands/brightcargo.png',
  'images/brands/creative-graphics.png',
  'images/brands/elitealhijaz.png',
  'images/brands/elitetours.png',
  'images/brands/eubakeries-equipments.png',
  'images/brands/gep.png',
  'images/brands/cavara.png',
  'images/brands/wefaq monochrome logo.png',
  'images/brands/classictrip.png',
  'images/brands/iclx.png',
  'images/brands/mahanama.png',
  'images/brands/crane-shoes.png',
  'images/brands/convenience-store.png',
  'images/brands/lucky-darbar.png',
  'images/brands/fly-bagdad.png',
  'images/brands/hamada-enterprises.png',
  'images/brands/krexpress.png',
  'images/brands/nabdemirates.png',
  'images/brands/oxbridge-academy.png',
  'images/brands/qrqumarentals.png',
  'images/brands/tricoarabia.png',
  'images/brands/tuktukmarbella.png',
  'images/brands/victoriaingredients.png',
  'images/brands/zahrani-group.png',
  'images/brands/nch.png'
];

const getFullUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:') || url.startsWith('data:')) {
    return url;
  }
  return url.startsWith('/') ? url : `/${url}`;
};

export default function MotionPageLoader({ customAssets = [] }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const containerRef = useRef(null);
  const pctRef = useRef(null);

  useEffect(() => {
    let rafId;
    let exitTimer;
    let hideTimer;
    let isCancelled = false;

    // Gather all assets to preload (Brand logos + custom assets + cached brand logos)
    let extraLogos = [];
    try {
      const cached = localStorage.getItem('cambm_brands_rows');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.row1) extraLogos.push(...parsed.row1.map(b => b.logo_url));
        if (parsed?.row2) extraLogos.push(...parsed.row2.map(b => b.logo_url));
      }
    } catch (e) {}

    const allUrls = [...new Set([...ALL_DEFAULT_BRAND_LOGOS, ...extraLogos, ...customAssets])].filter(Boolean);

    let loadedCount = 0;
    const totalAssets = allUrls.length;
    const assetsLoadedPromise = Promise.all(
      allUrls.map((url) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.src = getFullUrl(url);
          const handleComplete = () => {
            loadedCount++;
            if (typeof img.decode === "function") {
              img.decode().catch(() => {}).then(() => resolve());
            } else {
              resolve();
            }
          };

          if (img.complete && img.naturalWidth !== 0) {
            handleComplete();
          } else {
            img.onload = () => handleComplete();
            img.onerror = () => {
              loadedCount++;
              resolve();
            };
          }
        });
      })
    );

    // Timeout fallback: max 1800ms so loader never freezes even on poor connections
    const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 1800));
    const readyPromise = Promise.race([assetsLoadedPromise, timeoutPromise]);

    const startTime = performance.now();
    const MIN_ANIMATION_DURATION = 1100; // 1.1s smooth animated fill
    const HOLD_TIME = 150; // Brief pause at 100% before smooth reveal

    const finishLoading = () => {
      if (isCancelled) return;
      if (containerRef.current) {
        containerRef.current.style.setProperty("--preloader-p", "1");
      }
      if (pctRef.current) {
        pctRef.current.textContent = "100%";
      }

      exitTimer = window.setTimeout(() => {
        if (isCancelled) return;
        setIsExiting(true);
        hideTimer = window.setTimeout(() => {
          if (isCancelled) return;
          setIsLoading(false);
          try {
            document.dispatchEvent(new CustomEvent("cambm:loader-done"));
            document.dispatchEvent(new CustomEvent("cambm:revealed"));
            if (window.initLoopSliders) {
              window.initLoopSliders();
            }
          } catch (e) {}
        }, 850);
      }, HOLD_TIME);
    };

    let assetsReady = false;
    readyPromise.then(() => {
      assetsReady = true;
    });

    const updateFrame = (now) => {
      if (isCancelled) return;
      const elapsed = now - startTime;
      const animProgress = Math.min(elapsed / MIN_ANIMATION_DURATION, 1);

      const assetProgress = totalAssets > 0 ? (loadedCount / totalAssets) : 1;
      const effectiveProgress = Math.min(animProgress, (animProgress * 0.7) + (assetProgress * 0.3));

      // Smooth cubic-out easing curve
      const eased = 1 - Math.pow(1 - effectiveProgress, 2.5);

      if (containerRef.current) {
        containerRef.current.style.setProperty("--preloader-p", eased.toFixed(4));
      }
      if (pctRef.current) {
        pctRef.current.textContent = `${Math.min(99, Math.round(eased * 100))}%`;
      }

      if (animProgress < 1 || !assetsReady) {
        rafId = requestAnimationFrame(updateFrame);
      } else {
        finishLoading();
      }
    };

    rafId = requestAnimationFrame(updateFrame);

    return () => {
      isCancelled = true;
      if (rafId) cancelAnimationFrame(rafId);
      if (exitTimer) window.clearTimeout(exitTimer);
      if (hideTimer) window.clearTimeout(hideTimer);
    };
  }, [customAssets]);

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
