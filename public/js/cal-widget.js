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

// Prevent background website scroll and prevent clicking dark background from exiting
(function () {
  let isModalActive = false;
  let allowModalClose = false;
  let activeCheckInterval = null;

  function isCalModalOpen() {
    const iframes = document.querySelectorAll(
      "iframe[src*='cal.com'], iframe[src*='app.cal.com'], iframe[name*='cal'], iframe[data-cal-embed]"
    );
    for (let i = 0; i < iframes.length; i++) {
      const el = iframes[i];
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      const parent =
        el.closest("div[style*='fixed'], div[style*='absolute']") ||
        el.parentElement;
      const parentStyle = parent ? window.getComputedStyle(parent) : null;

      if (
        rect.width > 200 &&
        rect.height > 200 &&
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        style.opacity !== "0" &&
        (!parentStyle ||
          (parentStyle.display !== "none" &&
            parentStyle.visibility !== "hidden" &&
            parentStyle.opacity !== "0"))
      ) {
        return true;
      }
    }
    return false;
  }

  function lockScroll() {
    isModalActive = true;
    document.documentElement.style.overflow = "hidden";
    document.documentElement.style.height = "100%";
    document.body.style.overflow = "hidden";
    document.body.style.height = "100%";
    document.body.style.touchAction = "none";
    if (window.__cambmLenis && typeof window.__cambmLenis.stop === "function") {
      window.__cambmLenis.stop();
    }
  }

  function unlockScroll() {
    isModalActive = false;
    document.documentElement.style.overflow = "";
    document.documentElement.style.height = "";
    document.body.style.overflow = "";
    document.body.style.height = "";
    document.body.style.touchAction = "";
    if (window.__cambmLenis && typeof window.__cambmLenis.start === "function") {
      window.__cambmLenis.start();
    }
    const shield = document.getElementById("cambm-cal-backdrop-shield");
    if (shield) shield.remove();
    const overlay = document.getElementById("cambm-cal-custom-close-overlay");
    if (overlay) overlay.remove();
    if (activeCheckInterval) {
      clearInterval(activeCheckInterval);
      activeCheckInterval = null;
    }
  }

  function closeCalModal() {
    allowModalClose = true;
    try {
      window.postMessage({ type: "__cal:modalClose" }, "*");
      window.postMessage(JSON.stringify({ type: "__cal:modalClose" }), "*");
      window.postMessage({ action: "modalClose" }, "*");
    } catch (e) {}

    const iframes = document.querySelectorAll(
      "iframe[src*='cal.com'], iframe[src*='app.cal.com'], iframe[name*='cal'], iframe[data-cal-embed]"
    );
    iframes.forEach(function (iframe) {
      const parent =
        iframe.closest("div[style*='fixed'], div[style*='absolute']") ||
        iframe.parentElement;
      if (parent && parent !== document.body) {
        parent.remove();
      } else {
        iframe.remove();
      }
    });

    unlockScroll();
    setTimeout(function () {
      allowModalClose = false;
    }, 400);
  }

  function createBackdropShield() {
    if (document.getElementById("cambm-cal-backdrop-shield")) return;

    const shieldWrap = document.createElement("div");
    shieldWrap.id = "cambm-cal-backdrop-shield";
    shieldWrap.style.cssText =
      "position: fixed; inset: 0; z-index: 999999998; pointer-events: none;";

    const pStyle =
      "position: absolute; pointer-events: auto; background: transparent; cursor: default;";

    // 4 directional panels around the central Cal.com modal
    const topPanel = document.createElement("div");
    topPanel.style.cssText =
      pStyle + "top: 0; left: 0; right: 0; height: calc((100vh - min(680px, 90vh)) / 2);";

    const bottomPanel = document.createElement("div");
    bottomPanel.style.cssText =
      pStyle + "bottom: 0; left: 0; right: 0; height: calc((100vh - min(680px, 90vh)) / 2);";

    const leftPanel = document.createElement("div");
    leftPanel.style.cssText =
      pStyle + "top: 0; bottom: 0; left: 0; width: calc((100vw - min(620px, 94vw)) / 2);";

    const rightPanel = document.createElement("div");
    rightPanel.style.cssText =
      pStyle + "top: 0; bottom: 0; right: 0; width: calc((100vw - min(620px, 94vw)) / 2);";

    const panels = [topPanel, bottomPanel, leftPanel, rightPanel];

    function blockEvent(e) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
    }

    panels.forEach(function (p) {
      [
        "click",
        "mousedown",
        "mouseup",
        "pointerdown",
        "pointerup",
        "touchstart",
        "touchend",
        "wheel",
      ].forEach(function (evt) {
        p.addEventListener(evt, blockEvent, true);
      });
      shieldWrap.appendChild(p);
    });

    document.body.appendChild(shieldWrap);
  }

  function createCloseOverlay() {
    if (document.getElementById("cambm-cal-custom-close-overlay")) return;

    const overlay = document.createElement("div");
    overlay.id = "cambm-cal-custom-close-overlay";
    overlay.style.cssText =
      "position: fixed; top: 16px; right: 20px; z-index: 2147483647; display: flex; align-items: center; justify-content: center; pointer-events: auto; cursor: pointer;";

    const btn = document.createElement("button");
    btn.setAttribute("aria-label", "Close Booking");
    btn.style.cssText =
      "width: 44px; height: 44px; border-radius: 50%; background: rgba(30, 30, 30, 0.85); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.25); color: #ffffff; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: transform 0.2s ease, background 0.2s ease, border-color 0.2s ease; box-shadow: 0 4px 20px rgba(0,0,0,0.5); padding: 0;";

    btn.innerHTML =
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';

    btn.onmouseenter = function () {
      btn.style.background = "#eb5757";
      btn.style.borderColor = "#eb5757";
      btn.style.transform = "scale(1.08)";
    };
    btn.onmouseleave = function () {
      btn.style.background = "rgba(30, 30, 30, 0.85)";
      btn.style.borderColor = "rgba(255, 255, 255, 0.25)";
      btn.style.transform = "scale(1)";
    };

    function handleCloseClick(e) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      closeCalModal();
    }

    btn.addEventListener("click", handleCloseClick);
    overlay.addEventListener("click", handleCloseClick);
    overlay.appendChild(btn);
    document.body.appendChild(overlay);
  }

  // Intercept Cal.com close message to prevent exiting when clicking dark backdrop
  window.addEventListener(
    "message",
    function (e) {
      if (!e.data) return;
      try {
        let msgType = null;
        if (typeof e.data === "string") {
          try {
            const parsed = JSON.parse(e.data);
            msgType = parsed.type || parsed.action;
          } catch (_) {
            msgType = e.data;
          }
        } else if (typeof e.data === "object") {
          msgType = e.data.type || e.data.action;
        }

        if (
          msgType === "__cal:modalClose" ||
          msgType === "modalClose" ||
          msgType === "__cal:close" ||
          msgType === "close"
        ) {
          if (!allowModalClose) {
            // Dark backdrop was clicked inside the iframe -> BLOCK IT so modal never exits!
            e.stopImmediatePropagation();
            e.stopPropagation();
          } else {
            unlockScroll();
          }
        }
      } catch (err) {}
    },
    true // Capture phase
  );

  // Prevent wheel events from scrolling the background website when Cal modal is active
  window.addEventListener(
    "wheel",
    function (e) {
      if (isModalActive) {
        const path = e.composedPath ? e.composedPath() : [];
        const isInsideCal = path.some(function (el) {
          return (
            el &&
            el.tagName === "IFRAME" &&
            (el.src?.includes("cal.com") || el.getAttribute?.("name")?.includes("cal"))
          );
        });
        if (!isInsideCal) {
          e.preventDefault();
        }
      }
    },
    { passive: false }
  );

  window.addEventListener(
    "touchmove",
    function (e) {
      if (isModalActive) {
        const path = e.composedPath ? e.composedPath() : [];
        const isInsideCal = path.some(function (el) {
          return (
            el &&
            el.tagName === "IFRAME" &&
            (el.src?.includes("cal.com") || el.getAttribute?.("name")?.includes("cal"))
          );
        });
        if (!isInsideCal) {
          e.preventDefault();
        }
      }
    },
    { passive: false }
  );

  function checkModalState() {
    const visible = isCalModalOpen();
    if (visible && !isModalActive) {
      lockScroll();
      createBackdropShield();
      createCloseOverlay();
      if (!activeCheckInterval) {
        activeCheckInterval = setInterval(checkModalState, 250);
      }
    } else if (!visible && isModalActive) {
      unlockScroll();
    }
  }

  // MutationObserver to detect Cal modal insertion, modification, and removal
  const observer = new MutationObserver(checkModalState);

  function initObserver() {
    if (document.body) {
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["style", "class"],
      });
      checkModalState();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initObserver);
  } else {
    initObserver();
  }

  // Expose global helper if needed
  window.closeCalModal = closeCalModal;
})();
