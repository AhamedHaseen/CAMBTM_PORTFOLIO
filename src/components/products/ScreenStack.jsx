import React from "react";

export default function ScreenStack({ captionPrefix, galleryLabel, screens }) {
  const portraits = screens.filter((screen) => screen.format === "portrait");
  const stacked = screens.filter((screen) => screen.format !== "portrait");

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
          aria-label={galleryLabel}
          className="cambt-portrait-gallery"
          data-lenis-prevent
          role="group"
          tabIndex={0}
        >
          <ol className="cambt-portrait-rail">
            {portraits.map((screen) => (
              <li className="cambt-portrait-slide" key={screen.src}>
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
                  <figcaption className="cambt-screen-caption">{screen.caption}</figcaption>
                </figure>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
