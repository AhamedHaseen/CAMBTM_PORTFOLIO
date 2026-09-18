import React, { useState, useRef, useEffect } from "react";

export default function ScreenStack({ captionPrefix, galleryLabel, screens }) {
  const portraits = screens.filter((screen) => screen.format === "portrait");
  const stacked = screens.filter((screen) => screen.format !== "portrait");

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const railRef = useRef(null);
  const galleryRef = useRef(null);
  const directionRef = useRef(1); // 1 = right, -1 = left
  const autoScrollTimer = useRef(null);

  const prevSlide = () => {
    directionRef.current = -1;
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : portraits.length - 1));
  };

  const nextSlide = () => {
    directionRef.current = 1;
    setActiveIndex((prev) => (prev < portraits.length - 1 ? prev + 1 : 0));
  };

  const goToSlide = (index) => {
    directionRef.current = index >= activeIndex ? 1 : -1;
    setActiveIndex(index);
  };

  // Smoothly center the active slide in the slider track
  useEffect(() => {
    if (galleryRef.current && railRef.current && portraits.length > 0) {
      const slides = railRef.current.children;
      const targetSlide = slides[activeIndex];
      if (targetSlide) {
        const gallery = galleryRef.current;
        const targetLeft =
          targetSlide.offsetLeft - (gallery.clientWidth - targetSlide.clientWidth) / 2;
        gallery.scrollTo({
          left: Math.max(0, targetLeft),
          behavior: "smooth",
        });
      }
    }
  }, [activeIndex, portraits.length]);

  // Automatic horizontal scrolling back and forth (left and right)
  useEffect(() => {
    if (portraits.length <= 1 || isPaused) return;

    autoScrollTimer.current = setInterval(() => {
      setActiveIndex((prev) => {
        let next = prev + directionRef.current;
        if (next >= portraits.length) {
          directionRef.current = -1;
          next = portraits.length - 2 >= 0 ? portraits.length - 2 : 0;
        } else if (next < 0) {
          directionRef.current = 1;
          next = 1 < portraits.length ? 1 : 0;
        }
        return next;
      });
    }, 3200);

    return () => {
      if (autoScrollTimer.current) clearInterval(autoScrollTimer.current);
    };
  }, [portraits.length, isPaused]);

  // Mouse wheel horizontal scroll & Drag-to-scroll handler
  useEffect(() => {
    const gallery = galleryRef.current;
    if (!gallery) return;

    let isDown = false;
    let startX = 0;
    let scrollLeftStart = 0;
    let scrollTimeout = null;

    const syncActiveIndex = () => {
      if (railRef.current && portraits.length > 0) {
        const slides = Array.from(railRef.current.children);
        const galleryCenter = gallery.scrollLeft + gallery.clientWidth / 2;
        let closestIdx = 0;
        let minDiff = Infinity;
        slides.forEach((s, idx) => {
          const sCenter = s.offsetLeft + s.clientWidth / 2;
          const diff = Math.abs(sCenter - galleryCenter);
          if (diff < minDiff) {
            minDiff = diff;
            closestIdx = idx;
          }
        });
        setActiveIndex(closestIdx);
      }
    };

    const onWheel = (e) => {
      const delta = e.deltaY || e.deltaX;
      if (delta !== 0) {
        e.preventDefault();
        e.stopPropagation();
        gallery.scrollLeft += delta * 1.4;

        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          syncActiveIndex();
        }, 50);
      }
    };

    const onMouseDown = (e) => {
      isDown = true;
      startX = e.pageX - gallery.offsetLeft;
      scrollLeftStart = gallery.scrollLeft;
      setIsPaused(true);
    };

    const onMouseLeave = () => {
      isDown = false;
      setIsPaused(false);
    };

    const onMouseUp = () => {
      if (isDown) {
        isDown = false;
        syncActiveIndex();
      }
      setIsPaused(false);
    };

    const onMouseMove = (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - gallery.offsetLeft;
      const walk = (x - startX) * 1.5;
      gallery.scrollLeft = scrollLeftStart - walk;
    };

    gallery.addEventListener("wheel", onWheel, { passive: false });
    gallery.addEventListener("mousedown", onMouseDown);
    gallery.addEventListener("mouseleave", onMouseLeave);
    gallery.addEventListener("mouseup", onMouseUp);
    gallery.addEventListener("mousemove", onMouseMove);

    return () => {
      gallery.removeEventListener("wheel", onWheel);
      gallery.removeEventListener("mousedown", onMouseDown);
      gallery.removeEventListener("mouseleave", onMouseLeave);
      gallery.removeEventListener("mouseup", onMouseUp);
      gallery.removeEventListener("mousemove", onMouseMove);
      clearTimeout(scrollTimeout);
    };
  }, [portraits.length]);

  return (
    <div className="cambt-screen-stack">
      {stacked.map((screen, index) => (
        <figure
          className="cambt-screen-frame"
          data-format={screen.format}
          key={screen.src}
          style={{ "--native": `${screen.width}px` }}
        >
          <div className="cambt-screen-plate">
            <img
              alt={`${captionPrefix}: ${screen.caption}`}
              className="cambt-screen-img"
              height={screen.height}
              loading={index === 0 ? "eager" : "lazy"}
              src={screen.src}
              width={screen.width}
            />
          </div>
          <figcaption className="cambt-screen-caption">
            <span className="cambt-caption-num">
              {String(index + 1).padStart(2, "0")}
            </span>
            {screen.caption}
          </figcaption>
        </figure>
      ))}

      {portraits.length > 0 && (
        <div
          className="cambt-portrait-slider-container"
          aria-label={galleryLabel}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          {/* Slider Stage (Arrow marks removed) */}
          <div className="cambt-slider-stage">
            {/* Slider Track / Rail */}
            <div
              className="cambt-portrait-gallery"
              data-lenis-prevent
              ref={galleryRef}
              role="region"
              tabIndex={0}
            >
              <ol className="cambt-portrait-rail" ref={railRef}>
                {portraits.map((screen, idx) => (
                  <li
                    className={`cambt-portrait-slide ${idx === activeIndex ? "is-active" : ""}`}
                    key={screen.src}
                    onClick={() => goToSlide(idx)}
                  >
                    <figure className="cambt-portrait-card">
                      <div className="cambt-portrait-plate">
                        <img
                          alt={`${captionPrefix}: ${screen.caption}`}
                          height={screen.height}
                          loading="lazy"
                          src={screen.src}
                          width={screen.width}
                        />
                      </div>
                      <figcaption className="cambt-screen-caption">
                        <span className="cambt-caption-num">{String(idx + 1).padStart(2, "0")}</span>
                        {screen.caption}
                      </figcaption>
                    </figure>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Bottom pagination & info bar */}
          <div className="cambt-slider-bottom-bar">
            <div className="cambt-slider-caption-info">
              <span className="cambt-caption-num">
                {String(activeIndex + 1).padStart(2, "0")} / {String(portraits.length).padStart(2, "0")}
              </span>
              <span className="cambt-slider-caption-title">
                {portraits[activeIndex]?.caption}
              </span>
            </div>

            <div className="cambt-slider-pagination" role="tablist" aria-label="Card navigation">
              {portraits.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  role="tab"
                  aria-selected={idx === activeIndex}
                  className={`cambt-slider-dot ${idx === activeIndex ? "is-active" : ""}`}
                  onClick={() => goToSlide(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
