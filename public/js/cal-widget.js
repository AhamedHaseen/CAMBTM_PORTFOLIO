(function (C, A, L) {
  let p = function (a, ar) { a.q.push(ar); };
  let d = C.document;
  C.Cal = C.Cal || function () {
    let cal = C.Cal;
    let ar = arguments;
    if (!cal.loaded) {
      cal.ns = {};
      cal.q = cal.q || [];
      d.head.appendChild(d.createElement("script")).src = A;
      cal.loaded = true;
    }
    if (ar[0] === L) {
      const api = function () { p(api, arguments); };
      const namespace = ar[1];
      api.q = api.q || [];
      typeof namespace === "string" ? (cal.ns[namespace] = api) && p(api, ar) : p(cal, ar);
      return;
    }
    p(cal, ar);
  };
})(window, "https://app.cal.com/embed/embed.js", "init");
Cal("init", "strategy-call", { origin: "https://cal.com" });
Cal("ui", { "styles": { "branding": { "brandColor": "#000000" } }, "hideEventTypeDetails": false, "layout": "month_view" });

// Prevent background page from scrolling and prevent backdrop clicks from exiting Cal modal
(function () {
  let isCalModalActive = false;

  function lockBackground() {
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    if (window.__cambmLenis && typeof window.__cambmLenis.stop === "function") {
      window.__cambmLenis.stop();
    }
  }

  function unlockBackground() {
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
    if (window.__cambmLenis && typeof window.__cambmLenis.start === "function") {
      window.__cambmLenis.start();
    }
  }

  function setupModalBackdrop(container) {
    if (!container || container._calProtected) return;
    container._calProtected = true;

    // Intercept clicks on the backdrop (red marked areas) to prevent exiting the modal
    function handleBackdropClick(e) {
      // If the user clicked the close button (top-right '✕'), let it close
      const isCloseButton =
        e.target.closest("button") ||
        e.target.closest("[aria-label*='close' i]") ||
        e.target.closest("[aria-label*='Close']") ||
        e.target.closest(".cal-modal-close") ||
        e.target.closest("svg");

      if (isCloseButton) {
        return; // Allow close button to work
      }

      // If clicked anywhere else on the backdrop wrapper outside the iframe, prevent exit
      if (e.target.tagName !== "IFRAME") {
        e.stopPropagation();
        e.stopImmediatePropagation();
        e.preventDefault();
      }
    }

    ["click", "mousedown", "pointerdown"].forEach(function (evtType) {
      container.addEventListener(evtType, handleBackdropClick, true);
    });

    // Prevent wheel and touch scrolling on backdrop from scrolling background website
    function preventBackgroundScroll(e) {
      if (e.target.tagName !== "IFRAME") {
        e.preventDefault();
        e.stopPropagation();
      }
    }

    container.addEventListener("wheel", preventBackgroundScroll, { passive: false });
    container.addEventListener("touchmove", preventBackgroundScroll, { passive: false });
  }

  const observer = new MutationObserver(function () {
    const iframeEl = document.querySelector(
      "iframe[src*='cal.com'], iframe[name*='cal'], iframe[data-cal-embed]"
    );
    const modalWrapper =
      iframeEl?.closest("div[style*='position: fixed']") ||
      iframeEl?.parentElement ||
      document.querySelector("[data-cal-modal], .cal-modal");

    if (modalWrapper && !isCalModalActive) {
      isCalModalActive = true;
      lockBackground();
      setupModalBackdrop(modalWrapper);
    } else if (!modalWrapper && isCalModalActive) {
      isCalModalActive = false;
      unlockBackground();
    }
  });

  function startObserver() {
    if (document.body) {
      observer.observe(document.body, { childList: true, subtree: true });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startObserver);
  } else {
    startObserver();
  }
})();
