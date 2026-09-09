(function () {
  'use strict';

  const root = document.documentElement;
  if (!root.classList.contains('page-preloading')) return;

  const minimumDuration = 750;
  const failsafeDuration = 5000;
  const holdDuration = 300;
  const loader = document.getElementById('pageLoading');
  const percentage = document.getElementById('pagePreloaderPct');
  let revealed = false;

  function reveal() {
    if (revealed) return;
    revealed = true;
    root.classList.remove('page-preloading');
    root.classList.add('page-ready');
    document.body.classList.add('revealing');

    let finished = false;
    function done() {
      if (finished) return;
      finished = true;
      document.body.classList.remove('revealing');
      if (loader) loader.style.display = 'none';
      document.dispatchEvent(new Event('cambm:revealed'));
    }

    if (loader) {
      loader.classList.add('out');
      loader.addEventListener('transitionend', done, { once: true });
      window.setTimeout(done, 1400);
    } else {
      done();
    }
  }

  const images = Array.from(document.querySelectorAll('img')).filter(function (image) {
    return !image.closest('.loading-overlay');
  });
  const mapAssets = Array.from(document.querySelectorAll('svg image[href]')).map(function (image) {
    return image.getAttribute('href');
  }).filter(Boolean);
  const total = Math.max(images.length + mapAssets.length, 1);
  let loaded = 0;

  function bump() {
    loaded += 1;
  }

  images.forEach(function (image) {
    image.loading = 'eager';
    if (image.complete && image.naturalWidth > 0) {
      bump();
      return;
    }
    let counted = false;
    function mark() {
      if (counted) return;
      counted = true;
      bump();
    }
    image.addEventListener('load', mark, { once: true });
    image.addEventListener('error', mark, { once: true });
  });

  mapAssets.forEach(function (source) {
    const image = new Image();
    image.addEventListener('load', bump, { once: true });
    image.addEventListener('error', bump, { once: true });
    image.src = source;
  });

  let start = null;
  let level = 0;
  let filled = false;
  let failsafeHit = false;
  window.setTimeout(function () { failsafeHit = true; }, failsafeDuration);

  function frame(timestamp) {
    if (start === null) start = timestamp;
    const elapsed = timestamp - start;
    const realProgress = loaded / total;
    const target = failsafeHit ? 1 : Math.min(realProgress, elapsed < minimumDuration ? 0.94 : 1);
    level += (target - level) * 0.08;
    if (target === 1 && 1 - level < 0.005) level = 1;

    root.style.setProperty('--preloader-p', level.toFixed(4));
    if (percentage) percentage.textContent = Math.round(level * 100);

    if (level >= 1 && !filled) {
      filled = true;
      window.setTimeout(reveal, holdDuration);
    }
    if (!revealed) requestAnimationFrame(frame);
  }

  (document.fonts ? document.fonts.ready : Promise.resolve()).then(function () {
    requestAnimationFrame(frame);
  });

  window.setTimeout(function () {
    if (!revealed) reveal();
  }, failsafeDuration + 1800);
})();
