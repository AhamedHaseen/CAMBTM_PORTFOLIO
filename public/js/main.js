// ===== FOOTER YEAR =====
const yearEl = document.getElementById("currentYear");
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

// ===== MULTI-PAGE PREFETCH =====
// Keep the static multi-page architecture, but warm the other documents
// before visitors request them.
const cambmPages = [
  "welcome.html",
  "about.html",
  "portfolio-under-construction.html",
];
const prefetchedPages = new Set();

function getInternalPage(anchor) {
  if (
    !anchor ||
    !anchor.href ||
    anchor.target === "_blank" ||
    anchor.hasAttribute("download")
  )
    return null;
  let url;
  try {
    url = new URL(anchor.href, window.location.href);
  } catch (error) {
    return null;
  }
  if (url.origin !== window.location.origin) return null;
  const page = (url.pathname.split("/").pop() || "welcome.html").toLowerCase();
  return cambmPages.indexOf(page) !== -1 ? { page: page, url: url } : null;
}

function prefetchPage(page) {
  if (prefetchedPages.has(page)) return;
  prefetchedPages.add(page);
  const link = document.createElement("link");
  link.rel = "prefetch";
  link.href = page;
  link.as = "document";
  link.fetchPriority = "low";
  document.head.appendChild(link);
}

function prefetchFromEvent(event) {
  const target =
    event.target instanceof Element ? event.target.closest("a[href]") : null;
  const destination = getInternalPage(target);
  if (destination) prefetchPage(destination.page);
}

document.addEventListener("pointerover", prefetchFromEvent, { passive: true });
document.addEventListener("focusin", prefetchFromEvent);
document.addEventListener("touchstart", prefetchFromEvent, { passive: true });
const prefetchAllPages = function () {
  cambmPages.forEach(prefetchPage);
};
function scheduleIdlePrefetch() {
  if ("requestIdleCallback" in window)
    window.requestIdleCallback(prefetchAllPages, { timeout: 4000 });
  else window.setTimeout(prefetchAllPages, 2500);
}
if (
  document.documentElement.classList.contains("bento-preloading") ||
  document.documentElement.classList.contains("page-preloading")
) {
  document.addEventListener("cambm:revealed", scheduleIdlePrefetch, {
    once: true,
  });
} else {
  scheduleIdlePrefetch();
}

// ===== SITE-REVEAL SIGNAL =====
// The preloader overlay is owned entirely by the inline #bento-media-loader
// script in welcome.html now. This promise just tells the rest of main.js
// WHEN the site actually became visible, so time-sensitive intros (the
// hero-stat count-up below) don't run while still hidden behind the loader
// - otherwise the whole count finishes off-screen and visitors only ever
// see the final resting numbers. Resolves on the loader's `cambm:revealed`
// event, or immediately on pages that are already visible.
const overlayHiddenPromise = new Promise((resolve) => {
  if (document.documentElement.classList.contains("bento-ready")) {
    resolve();
    return;
  }
  document.addEventListener("cambm:revealed", resolve, { once: true });
  setTimeout(resolve, 12000); // safety net - never leave counters un-started
});

// ===== HEADER SCROLL EFFECT + PARALLAX (combined, rAF-throttled) =====
// Both effects need window.scrollY on every scroll frame. Running them in one
// listener, gated behind requestAnimationFrame, avoids doing this work more
// than once per rendered frame - the raw, unthrottled version was a source of
// jank/stutter on lower-powered phones.
let header = document.getElementById("header");
const parallaxElements = document.querySelectorAll(".hero-bg, .cta-bg");
const visibleParallaxElements = new Set();
let backToTop = document.getElementById("backToTop");
let ticking = false;

if ("IntersectionObserver" in window) {
  const parallaxObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) visibleParallaxElements.add(entry.target);
        else visibleParallaxElements.delete(entry.target);
      });
    },
    { rootMargin: "20% 0px" },
  );
  parallaxElements.forEach((el) => parallaxObserver.observe(el));
} else {
  parallaxElements.forEach((el) => visibleParallaxElements.add(el));
}

function onScrollFrame() {
  const currentScroll = window.pageYOffset || document.documentElement.scrollTop || 0;
  const activeHeader = document.getElementById("header") || header;
  if (activeHeader) {
    if (currentScroll > 50) {
      activeHeader.classList.add("scrolled");
    } else {
      activeHeader.classList.remove("scrolled");
    }
  }
  visibleParallaxElements.forEach((el) => {
    el.style.transform = `translateY(${currentScroll * 0.3}px)`;
  });
  const activeBackToTop = document.getElementById("backToTop") || backToTop;
  if (activeBackToTop) {
    if (currentScroll > 600) {
      activeBackToTop.classList.add("visible");
    } else {
      activeBackToTop.classList.remove("visible");
    }
  }
  ticking = false;
}

window.addEventListener(
  "scroll",
  () => {
    if (!ticking) {
      requestAnimationFrame(onScrollFrame);
      ticking = true;
    }
  },
  { passive: true },
);

window.addEventListener("cambm:revealed", () => {
  requestAnimationFrame(onScrollFrame);
}, { passive: true });

// ===== LENIS SMOOTH SCROLL ENGINE =====
let lenisInstance = null;
if (
  typeof window.Lenis !== "undefined" &&
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches
) {
  try {
    lenisInstance = new window.Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      syncTouch: false, // Keep native touch inertia on mobile
      wheelMultiplier: 0.95,
      autoResize: true,
    });

    function lenisRaf(time) {
      if (lenisInstance) {
        lenisInstance.raf(time);
        requestAnimationFrame(lenisRaf);
      }
    }
    requestAnimationFrame(lenisRaf);
    window.__cambmLenis = lenisInstance;
  } catch (err) {
    console.warn("Lenis init skipped:", err);
  }
}

// Manual eased scrolling rather than native scrollTo/scrollIntoView with
// behavior:'smooth': browsers silently downgrade native smooth scrolling to
// an instant jump when the visitor's OS has "reduce motion" turned on, which
// the scroll options can't override. That downgrade is exactly why nav clicks
// animated on phones but jumped instantly on desktops that have reduce-motion
// enabled. Driving it ourselves via rAF guarantees these explicit navigation
// actions (back-to-top, nav anchors, logo) always visibly animate everywhere.
function easeInOutQuad(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}
function smoothScrollTo(targetY, duration = 600) {
  if (window.__cambmLenis) {
    window.__cambmLenis.scrollTo(targetY, { duration: duration / 1000 });
    return;
  }
  const startY = window.pageYOffset;
  const maxY = Math.max(
    0,
    document.documentElement.scrollHeight - window.innerHeight,
  );
  const destY = Math.max(0, Math.min(targetY, maxY));
  const distance = destY - startY;
  if (Math.abs(distance) < 1) return;
  let startTime = null;
  function step(timestamp) {
    if (startTime === null) startTime = timestamp;
    const progress = Math.min((timestamp - startTime) / duration, 1);
    window.scrollTo(0, startY + distance * easeInOutQuad(progress));
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

if (backToTop) backToTop.addEventListener("click", () => smoothScrollTo(0));

// ===== MOBILE NAV TOGGLE (SPA-safe dynamic lookups + global delegation) =====
function getMobileNavElements() {
  return {
    toggle: document.getElementById("navToggle") || document.querySelector(".nav-toggle"),
    nav: document.getElementById("mobileNav") || document.querySelector(".mobile-nav"),
    backdrop: document.getElementById("mobileNavBackdrop") || document.querySelector(".mobile-nav-backdrop"),
  };
}

function closeMobileNav() {
  const { toggle, nav, backdrop } = getMobileNavElements();
  if (toggle) {
    toggle.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  }
  if (nav) {
    nav.classList.remove("open");
  }
  if (backdrop) {
    backdrop.classList.remove("open");
  }
  document.body.style.overflow = "";
}

function openMobileNav() {
  const { toggle, nav, backdrop } = getMobileNavElements();
  if (toggle) {
    toggle.classList.add("open");
    toggle.setAttribute("aria-expanded", "true");
  }
  if (nav) {
    nav.classList.add("open");
  }
  if (backdrop) {
    backdrop.classList.add("open");
  }
  document.body.style.overflow = "hidden"; // prevent background scroll while menu is open
}

function toggleMobileNav() {
  const { nav } = getMobileNavElements();
  if (nav && nav.classList.contains("open")) {
    closeMobileNav();
  } else {
    openMobileNav();
  }
}

// Global click delegation so newly mounted React headers / navbars always work instantly
document.addEventListener("click", (e) => {
  const toggleBtn = e.target && e.target.closest && e.target.closest("#navToggle, .nav-toggle");
  if (toggleBtn) {
    e.preventDefault();
    e.stopPropagation();
    toggleMobileNav();
    return;
  }

  const backdrop = e.target && (e.target.id === "mobileNavBackdrop" || (e.target.classList && e.target.classList.contains("mobile-nav-backdrop")));
  if (backdrop) {
    e.preventDefault();
    closeMobileNav();
    return;
  }

  const navLink = e.target && e.target.closest && e.target.closest(".mobile-nav-link");
  if (navLink) {
    closeMobileNav();
  }
});

// Close mobile nav on Esc key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeMobileNav();
  }
});

// Expose globally for components
window.closeMobileNav = closeMobileNav;
window.openMobileNav = openMobileNav;
window.toggleMobileNav = toggleMobileNav;

// If the viewport grows past the mobile breakpoint, make sure the menu doesn't stay stuck open
window.addEventListener("resize", () => {
  if (window.innerWidth >= 1024) {
    const { nav } = getMobileNavElements();
    if (nav && nav.classList.contains("open")) {
      closeMobileNav();
    }
  }
});

const packagesSwitcher = document.querySelector(".packages-switcher");
if (packagesSwitcher) {
  const packageTabs = Array.from(
    packagesSwitcher.querySelectorAll("[data-package-tab]"),
  );
  const packagePanels = Array.from(
    document.querySelectorAll("[data-package-panel]"),
  );
  const packageGlass = packagesSwitcher.querySelector(
    ".packages-switcher-glass",
  );
  let packageGlassTimer;

  function activatePackageTab(index, moveFocus) {
    const normalizedIndex = (index + packageTabs.length) % packageTabs.length;
    const activeTab = packageTabs[normalizedIndex];
    const activeName = activeTab.getAttribute("data-package-tab");
    const previousIndex = packageTabs.findIndex(
      (tab) => tab.getAttribute("aria-selected") === "true",
    );

    packagesSwitcher.style.setProperty("--package-tab-index", normalizedIndex);
    if (packageGlass && previousIndex !== normalizedIndex) {
      clearTimeout(packageGlassTimer);
      packageGlass.classList.remove("is-gliding");
      requestAnimationFrame(() => packageGlass.classList.add("is-gliding"));
      packageGlassTimer = setTimeout(
        () => packageGlass.classList.remove("is-gliding"),
        600,
      );
    }
    packageTabs.forEach((tab, tabIndex) => {
      const isActive = tabIndex === normalizedIndex;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-selected", isActive ? "true" : "false");
      tab.tabIndex = isActive ? 0 : -1;
    });
    packagePanels.forEach((panel) => {
      const isActive = panel.getAttribute("data-package-panel") === activeName;
      panel.classList.remove("is-active");
      panel.hidden = !isActive;
      if (isActive)
        requestAnimationFrame(() => panel.classList.add("is-active"));
    });
    if (moveFocus) activeTab.focus();
  }

  packageTabs.forEach((tab, tabIndex) => {
    tab.addEventListener("click", () => activatePackageTab(tabIndex, false));
    tab.addEventListener("keydown", (event) => {
      const isRtl = document.documentElement.dir === "rtl";
      let nextIndex = null;
      if (event.key === "ArrowRight") nextIndex = tabIndex + (isRtl ? -1 : 1);
      if (event.key === "ArrowLeft") nextIndex = tabIndex + (isRtl ? 1 : -1);
      if (event.key === "Home") nextIndex = 0;
      if (event.key === "End") nextIndex = packageTabs.length - 1;
      if (nextIndex === null) return;
      event.preventDefault();
      activatePackageTab(nextIndex, true);
    });
  });
}

// ===== CUSTOM CURSOR =====
let cursor = document.getElementById("cursor") || document.getElementById("cursorDot");
let cursorRing = document.getElementById("cursorRing");
let cursorX = -100,
  cursorY = -100;
let ringX = -100,
  ringY = -100;

const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;

if (!isTouchDevice) {
  let cursorFrame = null;

  function getCursorEls() {
    if (!cursor || !document.body.contains(cursor)) {
      cursor = document.getElementById("cursor") || document.getElementById("cursorDot");
    }
    if (!cursorRing || !document.body.contains(cursorRing)) {
      cursorRing = document.getElementById("cursorRing");
    }
    return { cursor, cursorRing };
  }

  function renderCursor() {
    const { cursor: dotEl, cursorRing: ringEl } = getCursorEls();
    if (dotEl) {
      dotEl.style.transform = `translate3d(${cursorX - 4}px, ${cursorY - 4}px, 0)`;
    }
    ringX += (cursorX - ringX) * 0.18;
    ringY += (cursorY - ringY) * 0.18;
    if (ringEl) {
      ringEl.style.transform = `translate3d(${ringX - 20}px, ${ringY - 20}px, 0)`;
    }

    if (Math.abs(cursorX - ringX) > 0.1 || Math.abs(cursorY - ringY) > 0.1) {
      cursorFrame = requestAnimationFrame(renderCursor);
    } else {
      ringX = cursorX;
      ringY = cursorY;
      if (ringEl) {
        ringEl.style.transform = `translate3d(${ringX - 20}px, ${ringY - 20}px, 0)`;
      }
      cursorFrame = null;
    }
  }

  let isFirstMove = true;

  window.addEventListener(
    "pointermove",
    (e) => {
      cursorX = e.clientX;
      cursorY = e.clientY;
      const { cursor: dotEl, cursorRing: ringEl } = getCursorEls();
      if (dotEl && !dotEl.classList.contains("is-visible")) dotEl.classList.add("is-visible");
      if (ringEl && !ringEl.classList.contains("is-visible")) ringEl.classList.add("is-visible");

      if (isFirstMove) {
        ringX = cursorX;
        ringY = cursorY;
        if (dotEl) dotEl.style.transform = `translate3d(${cursorX - 4}px, ${cursorY - 4}px, 0)`;
        if (ringEl) ringEl.style.transform = `translate3d(${ringX - 20}px, ${ringY - 20}px, 0)`;
        isFirstMove = false;
      }

      if (cursorFrame === null) {
        cursorFrame = requestAnimationFrame(renderCursor);
      }
    },
    { passive: true }
  );

  document.addEventListener("mouseleave", () => {
    const { cursor: dotEl, cursorRing: ringEl } = getCursorEls();
    if (dotEl) dotEl.classList.remove("is-visible");
    if (ringEl) ringEl.classList.remove("is-visible");
  });

  // Dynamic hover delegation for all current and future interactive elements
  document.addEventListener(
    "pointerover",
    (e) => {
      const isInteractive = e.target && e.target.closest && e.target.closest("a, button, [role='button'], .btn, .tab, .service-row, .feature-card, .service-card, .bento-card, select, .nav-link");
      if (isInteractive) {
        const { cursorRing: ringEl } = getCursorEls();
        if (ringEl) ringEl.classList.add("hover");
      }
    },
    { passive: true }
  );

  document.addEventListener(
    "pointerout",
    (e) => {
      const isInteractive = e.target && e.target.closest && e.target.closest("a, button, [role='button'], .btn, .tab, .service-row, .feature-card, .service-card, .bento-card, select, .nav-link");
      if (isInteractive) {
        const { cursorRing: ringEl } = getCursorEls();
        if (ringEl) ringEl.classList.remove("hover");
      }
    },
    { passive: true }
  );
} else {
  const dotEl = document.getElementById("cursor") || document.getElementById("cursorDot");
  const ringEl = document.getElementById("cursorRing");
  if (dotEl) dotEl.style.display = "none";
  if (ringEl) ringEl.style.display = "none";
}

// ===== SCROLL REVEAL =====
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("revealed");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.08, rootMargin: "0px 0px -40px 0px" },
);

function observeNewRevealElements() {
  document
    .querySelectorAll(
      ".scroll-reveal:not(.revealed), .scroll-reveal-left:not(.revealed), .scroll-reveal-right:not(.revealed), .scroll-reveal-scale:not(.revealed)",
    )
    .forEach((el) => revealObserver.observe(el));
}
window.observeNewRevealElements = observeNewRevealElements;
window.addEventListener("cambm:revealed", observeNewRevealElements);
window.addEventListener("cambm:observe-reveal", observeNewRevealElements);

observeNewRevealElements();

// ===== CLIENT CARD POPUP (bento gallery cards) =====
// Opens ONLY on click of an individual image. Shows that image's picture
// and brand name. Stays open until closed via the close button, clicking
// outside the card, or Escape.
const clientPopupBackdrop = document.getElementById("clientPopupBackdrop");
const clientPopupClose = document.getElementById("clientPopupClose");
const clientPopupImage = document.getElementById("clientPopupImage");
const clientPopupName = document.getElementById("clientPopupName");
const bentoCards = document.querySelectorAll(".bento-card");

if (clientPopupBackdrop && clientPopupClose) {
  function openClientPopup(card) {
    const img = card.querySelector("img");
    const video = card.querySelector("video");
    const overlayName = card.querySelector(".bento-brand");
    if (img && clientPopupImage) {
      clientPopupImage.style.backgroundImage = `url("${img.getAttribute("src")}")`;
    }
    if (clientPopupName) {
      const mediaName = img
        ? img.getAttribute("alt")
        : video
          ? video.getAttribute("aria-label")
          : "";
      clientPopupName.textContent = overlayName
        ? overlayName.textContent.trim()
        : mediaName || "Client";
    }
    clientPopupBackdrop.classList.add("open");
  }
  function closeClientPopup() {
    clientPopupBackdrop.classList.remove("open");
  }

  bentoCards.forEach((card) => {
    card.addEventListener("click", () => openClientPopup(card));
  });

  clientPopupClose.addEventListener("click", closeClientPopup);

  // Clicking the dimmed backdrop (i.e. outside the card itself) closes it.
  clientPopupBackdrop.addEventListener("click", (e) => {
    if (e.target === clientPopupBackdrop) {
      closeClientPopup();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && clientPopupBackdrop.classList.contains("open")) {
      closeClientPopup();
    }
  });
}

// Auto-scroll speed, in pixels PER SECOND (not per frame - see the
// delta-time note in autoScrollStep below), for every auto-scrolling
// slider: the 3 hero columns AND the horizontal brand marquee.
// Mobile gets a slightly higher speed, per request ("increase the
// animation on phone by a tiny bit") - both use the same mechanism,
// just a different flat number, not derived from anything else.
const AUTO_SCROLL_SPEED = 35;
const AUTO_SCROLL_SPEED_MOBILE = 37;
const DEFAULT_AUTO_SCROLL_SPEED = isTouchDevice
  ? AUTO_SCROLL_SPEED_MOBILE
  : AUTO_SCROLL_SPEED;

function getZoomSpeedMultiplier() {
  const outerWidth = window.outerWidth;
  if (!outerWidth || outerWidth < 500) return 1;
  const zoomRatio = window.innerWidth / outerWidth;
  return Math.min(4, Math.max(1, zoomRatio));
}

let zoomSpeedMultiplier = getZoomSpeedMultiplier();
const autoScrollTasks = [];
let autoScrollTimestamp = null;

function runAutoScrollFrame(timestamp) {
  if (autoScrollTimestamp === null) {
    autoScrollTimestamp = timestamp;
  } else {
    const deltaMs = Math.min(timestamp - autoScrollTimestamp, 1000);
    autoScrollTimestamp = timestamp;
    autoScrollTasks.forEach((task) => task(deltaMs, zoomSpeedMultiplier));
  }
  requestAnimationFrame(runAutoScrollFrame);
}

function registerAutoScroll(task) {
  autoScrollTasks.push(task);
  if (autoScrollTasks.length === 1) requestAnimationFrame(runAutoScrollFrame);
}

document.addEventListener("visibilitychange", () => {
  if (document.hidden) autoScrollTimestamp = null;
});

window.addEventListener(
  "resize",
  () => {
    zoomSpeedMultiplier = getZoomSpeedMultiplier();
  },
  { passive: true },
);

// ===== INFINITE-LOOP SCROLL SLIDERS =====
// Both the 3 vertical hero columns and the horizontal brand strip are plain
// native scroll containers (no CSS animation). To make them loop seamlessly:
//   1. Clone the track's contents once, so there are two identical sets.
//   2. Start scrolled to the beginning of the 2nd set (the middle).
//   3. On every scroll, if the user passes into the 1st or 3rd "zone",
//      silently jump by one set-length. Because both sets are identical,
//      the jump is invisible - it feels like an endless loop that stops
//      wherever the user stops.
// Works with wheel, trackpad, touch, and click-drag. Nothing auto-moves.
//
// Auto-scroll: each slider also creeps along on its own (direction/speed
// set by the caller), pausing whenever the mouse is over it or the user
// is actively dragging/touching it, and resuming from wherever it left
// off (no reset to start) once they're done. Auto-scroll just nudges the
// same scrollTop/scrollLeft that manual scrolling uses, so it never
// blocks wheel/drag/touch input.
// Play bento videos ONLY while they're on-screen. The loop-slider clones
// each column ~3x, so there can be a dozen <video> elements in the DOM;
// the videos also carry preload="none" and no autoplay attribute, so a
// copy stays fully idle (nothing fetched, nothing decoding) until it
// actually scrolls into view. Without this, all copies would try to play
// at once - blowing past the browser's concurrent-decode limit (extra
// ones just freeze on a black frame) and, on a slow host, pulling every
// copy over the network simultaneously. This is the fix for the sliders
// "bugging out" once hosted.
const bentoVideoObserver =
  "IntersectionObserver" in window
    ? new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          const v = entry.target;
          if (entry.isIntersecting) {
            v.muted = true;
            v.playsInline = true;
            if (v.paused) {
              const p = v.play();
              if (p && typeof p.catch === "function") p.catch(function () { });
            }
          } else {
            if (!v.paused) {
              v.pause();
            }
          }
        });
      },
      { rootMargin: "50px 0px 50px 0px", threshold: 0.05 },
    )
    : null;
function observeBentoVideos(container) {
  container.querySelectorAll("video.bento-video").forEach(function (v) {
    v.muted = true;
    v.playsInline = true;
    v.pause();
    if (!v.src && v.dataset.videoKey && window.BENTO_VIDEOS) {
      var uri = window.BENTO_VIDEOS[v.dataset.videoKey];
      if (uri) v.src = uri;
    }
    if (bentoVideoObserver) {
      bentoVideoObserver.observe(v);
    }
  });
}

function unobserveBentoVideos(container) {
  if (!bentoVideoObserver) return;
  container.querySelectorAll("video.bento-video").forEach(function (video) {
    bentoVideoObserver.unobserve(video);
  });
}

function makeLoopSlider(
  container,
  axis,
  direction = 1,
  speed = DEFAULT_AUTO_SCROLL_SPEED,
) {
  const track = container.firstElementChild;
  if (!track) return;

  if (container.__loopSlider) {
    container.__loopSlider.build(true);
    return container.__loopSlider;
  }

  const sizeProp = axis === "y" ? "scrollHeight" : "scrollWidth";
  const posProp = axis === "y" ? "scrollTop" : "scrollLeft";
  const clientProp = axis === "y" ? "clientHeight" : "clientWidth";

  // Snapshot ONE original set of cards before we clone anything.
  let originalHTML = track.dataset.rawHtml !== undefined ? track.dataset.rawHtml : track.innerHTML;
  let setSize = 0; // length of one original set (px)
  let recentering = false;
  let dragging = false; // true while a manual drag/touch interaction is in progress
  let paused = false; // true while the mouse is hovering the slider
  let inViewport = true; // pause frame ticks and DOM mutations when offscreen

  if ("IntersectionObserver" in window) {
    const vpObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          inViewport = entry.isIntersecting;
        });
      },
      { rootMargin: "150px 0px 150px 0px" },
    );
    vpObserver.observe(container);
  }

  function build(force) {
    if (setSize && !force) return;
    unobserveBentoVideos(container);

    // Always prioritize the clean data-raw-html from React / DB
    if (track.dataset.rawHtml !== undefined) {
      originalHTML = track.dataset.rawHtml;
    } else if (force && track.dataset.freshSet) {
      originalHTML = track.dataset.freshSet;
    } else if (!originalHTML || force) {
      const cards = track.querySelectorAll(".bento-card, .brand-card");
      if (cards.length === 0) {
        track.innerHTML = "";
        setSize = 0;
        return;
      }
      originalHTML = Array.from(cards).map(c => c.outerHTML).join("");
    }

    if (!originalHTML || !originalHTML.trim()) {
      track.innerHTML = "";
      setSize = 0;
      return;
    }

    track.innerHTML = originalHTML;
    setSize = axis === "y" ? track.scrollHeight : track.scrollWidth;
    if (!setSize) return;
    const viewport = container[clientProp] || 1;
    let copies = Math.max(3, Math.ceil((viewport * 3) / setSize));
    if (copies % 2 === 0) copies += 1; // keep it odd -> clean middle
    track.innerHTML = originalHTML.repeat(copies);
    // Park in the middle copy.
    recentering = true;
    container[posProp] = setSize * Math.floor(copies / 2);
    recentering = false;
    // Hand fresh copies to visibility observer
    observeBentoVideos(container);
  }

  const sliderApi = { build };
  container.__loopSlider = sliderApi;

  if (document.readyState === "complete") build();
  else window.addEventListener("load", () => build());
  setTimeout(() => build(), 300);
  // Only rebuild on a genuine width change (rotation, real window resize).
  // Mobile browsers fire 'resize' on window whenever the address bar
  // auto-hides/shows while scrolling - that only changes height, but
  // was re-triggering build() (which wipes the track and re-centers
  // scroll position) on basically every scroll gesture, which is what
  // looked like the slider "stopping and resetting" while scrolling.
  let lastInnerWidth = window.innerWidth;
  let resizeFrame = null;
  window.addEventListener(
    "resize",
    () => {
      if (window.innerWidth === lastInnerWidth) return;
      lastInnerWidth = window.innerWidth;
      if (resizeFrame !== null) cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => {
        resizeFrame = null;
        build(true); // force: card widths genuinely changed, must re-measure
      });
    },
    { passive: true },
  );

  // As the user scrolls, keep them near the centre by jumping in whole
  // set-lengths whenever they've drifted more than one set from centre.
  // A jump of exactly setSize is invisible (every set is identical), so it
  // reads as an endless loop that stops wherever the user stops - the same
  // both up and down, regardless of how many cards the column has.
  container.addEventListener(
    "scroll",
    () => {
      if (!setSize || recentering) return;
      const pos = container[posProp];
      const maxPos = container[sizeProp] - container[clientProp];
      const centre = Math.round(maxPos / 2);
      if (pos <= 0) {
        recentering = true;
        container[posProp] = pos + setSize; // hit top -> jump down a set
        recentering = false;
      } else if (pos >= maxPos) {
        recentering = true;
        container[posProp] = pos - setSize; // hit bottom -> jump up a set
        recentering = false;
      } else if (Math.abs(pos - centre) > setSize) {
        recentering = true;
        // Snap back toward centre by whole sets, preserving sub-position.
        const drift = pos - centre;
        const steps = Math.trunc(drift / setSize);
        container[posProp] = pos - steps * setSize;
        recentering = false;
      }
    },
    { passive: true },
  );

  // Pause on hover: when the mouse hovers over any image, video, or slider,
  // it immediately stops in place. When the mouse leaves, it resumes scrolling.
  container.addEventListener("mouseenter", () => {
    if (!isTouchDevice) paused = true;
  });
  container.addEventListener("mouseleave", () => {
    if (!isTouchDevice) paused = false;
  });
  // Also pause for the duration of a touch interaction (no hover events
  // on touch devices, so this is what keeps auto-scroll from fighting a
  // finger-swipe on mobile). Resuming isn't instant: phones keep
  // scrolling under momentum/inertia well after touchend fires, and if
  // auto-scroll jumps back in immediately it fights that native
  // momentum, which is what shows up as stutter/glitching on real
  // devices. So resume is delayed until momentum has had time to settle.
  let touchResumeTimer = null;
  container.addEventListener(
    "touchstart",
    () => {
      dragging = true;
      paused = false; // belt-and-braces: a real touch can never leave this stuck paused
      if (touchResumeTimer) {
        clearTimeout(touchResumeTimer);
        touchResumeTimer = null;
      }
    },
    { passive: true },
  );
  container.addEventListener(
    "touchend",
    () => {
      if (touchResumeTimer) clearTimeout(touchResumeTimer);
      touchResumeTimer = setTimeout(() => {
        dragging = false;
        touchResumeTimer = null;
      }, 600);
    },
    { passive: true },
  );
  container.addEventListener(
    "touchcancel",
    () => {
      if (touchResumeTimer) clearTimeout(touchResumeTimer);
      dragging = false;
      touchResumeTimer = null;
    },
    { passive: true },
  );

  // Auto-scroll: creep along at `speed` px/SECOND in `direction`, unless
  // paused (hover) or being manually dragged/touched. Reuses the same
  // posProp the manual controls and the recentring listener above use,
  // so it just looks like a very slow, continuous manual scroll.
  let remainder = 0;
  registerAutoScroll((deltaMs, zoomMultiplier) => {
    if (!paused && !dragging && inViewport && setSize) {
      remainder += speed * zoomMultiplier * (deltaMs / 1000) * direction;
      const whole = Math.trunc(remainder);
      if (whole !== 0) {
        const previousPosition = container[posProp];
        container[posProp] = previousPosition + whole;
        remainder -= container[posProp] - previousPosition;
      }
    }
  });

  // Horizontal strip: click-and-drag to scroll (plus native wheel/trackpad).
  if (axis === "x") {
    let down = false,
      startX = 0,
      startScroll = 0,
      moved = false;
    container.addEventListener("mousedown", (e) => {
      down = true;
      moved = false;
      dragging = true;
      startX = e.pageX;
      startScroll = container.scrollLeft;
      container.classList.add("dragging");
    });
    window.addEventListener("mousemove", (e) => {
      if (!down) return;
      const dx = e.pageX - startX;
      if (Math.abs(dx) > 3) moved = true;
      container.scrollLeft = startScroll - dx;
    });
    window.addEventListener("mouseup", () => {
      down = false;
      dragging = false;
      container.classList.remove("dragging");
    });
    // Prevent a drag from also firing a click on a card/link.
    container.addEventListener(
      "click",
      (e) => {
        if (moved) {
          e.preventDefault();
          e.stopPropagation();
        }
      },
      true,
    );
    // Fast, smooth horizontal wheel scroll directly on the marquee without scrolling the full website
    container.addEventListener(
      "wheel",
      (e) => {
        e.preventDefault();
        e.stopPropagation();
        const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
        container.scrollLeft += delta * 1.35;
      },
      { passive: false },
    );
  }

  // Vertical columns: click-and-drag to scroll (native wheel/trackpad/touch
  // already scroll the column since it's overflow-y:auto). Mirrors the
  // horizontal slider's drag behavior, just on the Y axis.
  if (axis === "y") {
    // Fast, smooth vertical wheel scroll directly on the bento column without scrolling the full website
    container.addEventListener(
      "wheel",
      (e) => {
        e.preventDefault();
        e.stopPropagation();
        container.scrollTop += e.deltaY * 1.35;
      },
      { passive: false }
    );

    let down = false,
      startY = 0,
      startScroll = 0,
      moved = false;
    container.addEventListener("mousedown", (e) => {
      down = true;
      moved = false;
      dragging = true;
      startY = e.pageY;
      startScroll = container.scrollTop;
      container.classList.add("dragging");
    });
    window.addEventListener("mousemove", (e) => {
      if (!down) return;
      const dy = e.pageY - startY;
      if (Math.abs(dy) > 3) moved = true;
      container.scrollTop = startScroll - dy;
    });
    window.addEventListener("mouseup", () => {
      down = false;
      dragging = false;
      container.classList.remove("dragging");
    });
    // A drag shouldn't also fire the card's click-to-popup.
    container.addEventListener(
      "click",
      (e) => {
        if (moved) {
          e.preventDefault();
          e.stopPropagation();
        }
      },
      true,
    );
  }
}

// ===== LOOP SLIDERS (Hero Bento Columns + Brand Marquees) =====
function initLoopSliders() {
  // Columns auto-scroll DOWN, UP, DOWN (direction: +1 = down, -1 = up).
  const bentoCols = document.querySelectorAll(".bento-column");
  bentoCols.forEach((col, i) => {
    makeLoopSlider(col, "y", i === 1 ? -1 : 1);
  });

  // Two brand-logo rows, scrolling opposite ways: row 1 right-to-left
  // (+1 = increasing scrollLeft), row 2 left-to-right (-1).
  document.querySelectorAll(".brands-marquee").forEach((marquee, i) => {
    makeLoopSlider(marquee, "x", i === 0 ? 1 : -1);
  });

  // Bento container level wheel capture to ensure zero page-scroll and fast smooth bento-only scrolling
  const heroBentoEl = document.querySelector(".hero-bento");
  if (heroBentoEl && !heroBentoEl.__wheelBound) {
    heroBentoEl.__wheelBound = true;
    heroBentoEl.addEventListener(
      "wheel",
      (e) => {
        const currentBentoCols = document.querySelectorAll(".bento-column");
        const col = e.target.closest(".bento-column") || currentBentoCols[0];
        if (col) {
          e.preventDefault();
          e.stopPropagation();
          col.scrollTop += e.deltaY * 1.35;
        }
      },
      { passive: false }
    );
  }
}

window.initLoopSliders = initLoopSliders;
initLoopSliders();

window.addEventListener("cambm:bento-updated", () => {
  initLoopSliders();
});
window.addEventListener("cambm:brands-updated", () => {
  initLoopSliders();
});
window.addEventListener("cambm:revealed", () => {
  initLoopSliders();
});

// (Parallax is now handled in the combined, rAF-throttled scroll listener above.)

// ===== SMOOTH SCROLL FOR NAV LINKS =====
// Uses the same rAF-driven smoothScrollTo as back-to-top so nav clicks animate
// even when the OS has reduce-motion on. The fixed header height is subtracted
// so the target section isn't left hidden underneath the header.
const HEADER_OFFSET = 80; // = --header-height (64) + 16, matches section[id] scroll-margin-top
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    const href = this.getAttribute("href");
    // Bare "#" placeholders (logo, footer icons, etc.) aren't real anchors -
    // document.querySelector('#') throws, so just do nothing for those.
    if (href.length <= 1) {
      e.preventDefault();
      return;
    }
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      const targetY =
        target.getBoundingClientRect().top + window.pageYOffset - HEADER_OFFSET;
      smoothScrollTo(targetY);
    }
  });
});

// ===== LOGO -> HOME (top of landing page) =====
// On the landing page the logo scrolls smoothly to the top instead of
// reloading; on any other page (e.g. about.html) it just follows its
// href="welcome.html" and lands at the top of a fresh page load.
const logoHome = document.querySelector(".js-logo-home");
if (logoHome) {
  logoHome.addEventListener("click", function (e) {
    const page = (
      location.pathname.split("/").pop() || "welcome.html"
    ).toLowerCase();
    if (page === "" || page === "welcome.html") {
      e.preventDefault();
      smoothScrollTo(0);
    }
  });
}

// Note: marquee now runs at a fixed, smooth CSS-only speed (see .brands-track
// in css/main.css). Previously this dynamically rewrote animation-duration on
// every scroll event, which restarts/jumps the CSS animation's timing and is
// what caused the visible glitch/stutter in the "Trusted by 500+ brands" strip
// while scrolling. Removed entirely rather than patched, since mutating
// animation-duration on a running animation is inherently unreliable across
// browsers.

// ===== TILT & GLOW EFFECT ON CARDS (rAF-throttled) =====
if (!isTouchDevice) {
  const tiltCards = document.querySelectorAll(".feature-card, .service-card");
  tiltCards.forEach((card) => {
    let rect = null;
    let frame = null;

    card.addEventListener("mouseenter", () => {
      rect = card.getBoundingClientRect();
    }, { passive: true });

    card.addEventListener("mousemove", (e) => {
      if (!rect) rect = card.getBoundingClientRect();
      const clientX = e.clientX;
      const clientY = e.clientY;

      if (frame === null) {
        frame = requestAnimationFrame(() => {
          const x = clientX - rect.left;
          const y = clientY - rect.top;
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          const rotateX = (y - centerY) / 24;
          const rotateY = (centerX - x) / 24;
          card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translate3d(0, -4px, 0)`;
          card.style.setProperty("--mouse-x", `${x}px`);
          card.style.setProperty("--mouse-y", `${y}px`);
          frame = null;
        });
      }
    }, { passive: true });

    card.addEventListener("mouseleave", () => {
      if (frame !== null) {
        cancelAnimationFrame(frame);
        frame = null;
      }
      rect = null;
      card.style.transform = "";
    }, { passive: true });
  });

  // Magnetic Buttons (rAF-throttled)
  const magneticBtns = document.querySelectorAll(".btn");
  magneticBtns.forEach((btn) => {
    let rect = null;
    let frame = null;

    btn.addEventListener("mouseenter", () => {
      rect = btn.getBoundingClientRect();
    }, { passive: true });

    btn.addEventListener("mousemove", (e) => {
      if (!rect) rect = btn.getBoundingClientRect();
      const clientX = e.clientX;
      const clientY = e.clientY;

      if (frame === null) {
        frame = requestAnimationFrame(() => {
          const x = clientX - rect.left - rect.width / 2;
          const y = clientY - rect.top - rect.height / 2;
          btn.style.transform = `translate3d(${x * 0.15}px, ${y * 0.15}px, 0)`;
          frame = null;
        });
      }
    }, { passive: true });

    btn.addEventListener("mouseleave", () => {
      if (frame !== null) {
        cancelAnimationFrame(frame);
        frame = null;
      }
      rect = null;
      btn.style.transform = "";
    }, { passive: true });
  });
}
