import React, { useState, useRef, useEffect } from "react";

export default function ScreenStack({ captionPrefix, galleryLabel, screens }) {
  const portraits = screens.filter((screen) => screen.format === "portrait");
  const stacked = screens.filter((screen) => screen.format !== "portrait");

  const [activeIndex, setActiveIndex] = useState(0);
  const railRef = useRef(null);

  const prevSlide = () => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : portraits.length - 1));
  };

  const nextSlide = () => {
    setActiveIndex((prev) => (prev < portraits.length - 1 ? prev + 1 : 0));
  };

  const goToSlide = (index) => {
    setActiveIndex(index);
  };

  // Scroll active slide into view smoothly
  useEffect(() => {
    if (railRef.current && portraits.length > 0) {
      const slides = railRef.current.children;
      if (slides && slides[activeIndex]) {
        slides[activeIndex].scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  }, [activeIndex, portraits.length]);

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
        <div className="cambt-portrait-slider-container" aria-label={galleryLabel}>
          {/* Slider Stage with Left and Right Floating Navigation Arrows */}
          <div className="cambt-slider-stage">
            {/* Left side arrow mark button */}
            <button
              type="button"
              className="cambt-slider-nav-arrow cambt-slider-nav-left"
              onClick={prevSlide}
              aria-label="Slide left (Previous card)"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>

            {/* Slider Track / Rail */}
            <div
              className="cambt-portrait-gallery"
              data-lenis-prevent
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

            {/* Right side arrow mark button */}
            <button
              type="button"
              className="cambt-slider-nav-arrow cambt-slider-nav-right"
              onClick={nextSlide}
              aria-label="Slide right (Next card)"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
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
