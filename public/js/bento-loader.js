(function () {
  var root = document.documentElement;
  // If the page doesn't have the preloading class, don't run the loader
  if (!root.classList.contains("bento-preloading")) {
    // Just make sure it's visible
    document.body.classList.remove("revealing");
    var l = document.querySelector(".loading-overlay");
    if (l) l.style.display = "none";
    return;
  }

  var MIN_DURATION = 1500;   // floor so a warm cache doesn't flash the bar
  var FAILSAFE = 8000;   // reveal even if an asset hangs
  var HOLD = 700;    // dwell at 100% before the zoom-out fires

  var loader = document.querySelector(".loading-overlay");
  var pctEl = document.getElementById("preloaderPct") || document.getElementById("pagePreloaderPct");
  var revealed = false;

  function reveal() {
    if (revealed) return;
    revealed = true;
    root.classList.remove("bento-preloading");
    root.classList.add("bento-ready");
    document.body.classList.add("revealing"); // keep scroll locked through the zoom

    var finished = false;
    function done() {
      if (finished) return;
      finished = true;
      document.body.classList.remove("revealing"); // restore scroll only now
      if (loader) loader.style.display = "none";    // stop it eating clicks
      try { document.dispatchEvent(new Event("cambm:revealed")); } catch (e) { }
    }

    if (loader) {
      loader.classList.add("out");
      loader.addEventListener("transitionend", done, { once: true });
      window.setTimeout(done, 1400); // failsafe if transitionend never fires
    } else {
      done();
    }
  }

  // --- Track the real hero assets (images + videos) ---
  var assets = Array.prototype.slice.call(
    document.querySelectorAll(".hero-bento img, .hero-bento video")
  );
  if (assets.length === 0) {
    reveal();
    return;
  }
  var total = Math.max(assets.length, 1);
  var loaded = 0;
  function bump() { loaded++; }

  assets.forEach(function (el) {
    var isVideo = el.tagName === "VIDEO";
    if (isVideo ? el.readyState >= 2 : (el.complete && el.naturalWidth > 0)) { bump(); return; }
    var counted = false;
    function mark() { if (counted) return; counted = true; bump(); }
    if (isVideo) {
      el.addEventListener("loadeddata", mark, { once: true });
    } else {
      el.loading = "eager";
      el.addEventListener("load", mark, { once: true });
      if (!el.getAttribute("src") && el.dataset.src) el.src = el.dataset.src;
    }
    el.addEventListener("error", mark, { once: true }); // errors MUST count
  });

  // --- Progress-driven rAF loop (single source of truth: --preloader-p) ---
  var start = null, level = 0, filled = false, raf, failsafeHit = false;
  window.setTimeout(function () { failsafeHit = true; }, FAILSAFE);

  function frame(now) {
    if (start === null) start = now;
    var elapsed = now - start;
    var real = loaded / total;
    var target = failsafeHit ? 1 : Math.min(real, elapsed < MIN_DURATION ? 0.94 : 1);
    level += (target - level) * 0.05;               // eased - raw progress is jumpy
    if ((target === 1) && 1 - level < 0.005) level = 1;

    root.style.setProperty("--preloader-p", level.toFixed(4));
    if (pctEl) pctEl.textContent = Math.round(level * 100);

    if (level >= 1 && !filled) { filled = true; window.setTimeout(reveal, HOLD); }
    if (!revealed) raf = requestAnimationFrame(frame); // stop once revealed
  }

  (document.fonts ? document.fonts.ready : Promise.resolve()).then(function () {
    raf = requestAnimationFrame(frame);
  });

  // Hard backstop: reveal no matter what.
  window.setTimeout(function () { if (!revealed) reveal(); }, FAILSAFE + 2500);
})();
