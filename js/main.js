    // ===== FOOTER YEAR =====
    const yearEl = document.getElementById('currentYear');
    if (yearEl) {
      yearEl.textContent = new Date().getFullYear();
    }

    // ===== MULTI-PAGE PREFETCH =====
    // Keep the static multi-page architecture, but warm the other documents
    // before visitors request them.
    const cambmPages = ['welcome.html', 'about.html', 'portfolio.html'];
    const prefetchedPages = new Set();

    function getInternalPage(anchor) {
      if (!anchor || !anchor.href || anchor.target === '_blank' || anchor.hasAttribute('download')) return null;
      let url;
      try { url = new URL(anchor.href, window.location.href); } catch (error) { return null; }
      if (url.origin !== window.location.origin) return null;
      const page = (url.pathname.split('/').pop() || 'welcome.html').toLowerCase();
      return cambmPages.indexOf(page) !== -1 ? { page: page, url: url } : null;
    }

    function prefetchPage(page) {
      if (prefetchedPages.has(page)) return;
      prefetchedPages.add(page);
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = page;
      link.as = 'document';
      document.head.appendChild(link);
    }

    function prefetchFromEvent(event) {
      const target = event.target instanceof Element ? event.target.closest('a[href]') : null;
      const destination = getInternalPage(target);
      if (destination) prefetchPage(destination.page);
    }

    document.addEventListener('pointerover', prefetchFromEvent, { passive: true });
    document.addEventListener('focusin', prefetchFromEvent);
    document.addEventListener('touchstart', prefetchFromEvent, { passive: true });
    const prefetchAllPages = function () { cambmPages.forEach(prefetchPage); };
    if ('requestIdleCallback' in window) window.requestIdleCallback(prefetchAllPages, { timeout: 1800 });
    else window.setTimeout(prefetchAllPages, 900);

    // ===== SITE-REVEAL SIGNAL =====
    // The preloader overlay is owned entirely by the inline #bento-media-loader
    // script in welcome.html now. This promise just tells the rest of main.js
    // WHEN the site actually became visible, so time-sensitive intros (the
    // hero-stat count-up below) don't run while still hidden behind the loader
    // - otherwise the whole count finishes off-screen and visitors only ever
    // see the final resting numbers. Resolves on the loader's `cambm:revealed`
    // event, or immediately on pages that are already visible.
    const overlayHiddenPromise = new Promise((resolve) => {
      if (document.documentElement.classList.contains('bento-ready')) { resolve(); return; }
      document.addEventListener('cambm:revealed', resolve, { once: true });
      setTimeout(resolve, 12000); // safety net - never leave counters un-started
    });

    // ===== HEADER SCROLL EFFECT + PARALLAX (combined, rAF-throttled) =====
    // Both effects need window.scrollY on every scroll frame. Running them in one
    // listener, gated behind requestAnimationFrame, avoids doing this work more
    // than once per rendered frame  -  the raw, unthrottled version was a source of
    // jank/stutter on lower-powered phones.
    const header = document.getElementById('header');
    const parallaxElements = document.querySelectorAll('.hero-bg, .cta-bg');
    const backToTop = document.getElementById('backToTop');
    let ticking = false;

    function onScrollFrame() {
      const currentScroll = window.pageYOffset;
      if (currentScroll > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
      parallaxElements.forEach(el => {
        el.style.transform = `translateY(${currentScroll * 0.3}px)`;
      });
      if (currentScroll > 600) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(onScrollFrame);
        ticking = true;
      }
    }, { passive: true });

    // Manual eased scrolling rather than native scrollTo/scrollIntoView with
    // behavior:'smooth': browsers silently downgrade native smooth scrolling to
    // an instant jump when the visitor's OS has "reduce motion" turned on, which
    // the scroll options can't override. That downgrade is exactly why nav clicks
    // animated on phones but jumped instantly on desktops that have reduce-motion
    // enabled. Driving it ourselves via rAF guarantees these explicit navigation
    // actions (back-to-top, nav anchors, logo) always visibly animate everywhere.
    function easeInOutQuad(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
    function smoothScrollTo(targetY, duration = 600) {
      const startY = window.pageYOffset;
      const maxY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
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

    backToTop.addEventListener('click', () => smoothScrollTo(0));

    // ===== MOBILE NAV TOGGLE =====
    const navToggle = document.getElementById('navToggle');
    const mobileNav = document.getElementById('mobileNav');
    const mobileNavBackdrop = document.getElementById('mobileNavBackdrop');

    function closeMobileNav() {
      navToggle.classList.remove('open');
      mobileNav.classList.remove('open');
      mobileNavBackdrop.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    function openMobileNav() {
      navToggle.classList.add('open');
      mobileNav.classList.add('open');
      mobileNavBackdrop.classList.add('open');
      navToggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden'; // prevent background scroll while menu is open
    }

    navToggle.addEventListener('click', () => {
      if (mobileNav.classList.contains('open')) {
        closeMobileNav();
      } else {
        openMobileNav();
      }
    });

    mobileNavBackdrop.addEventListener('click', closeMobileNav);

    document.querySelectorAll('.mobile-nav-link').forEach(link => {
      link.addEventListener('click', closeMobileNav);
    });

    // If the viewport grows past the mobile breakpoint (e.g. rotating a tablet,
    // or resizing a desktop window back up), make sure the menu doesn't stay
    // stuck open with the background-scroll lock still applied.
    window.addEventListener('resize', () => {
      if (window.innerWidth >= 1024 && mobileNav.classList.contains('open')) {
        closeMobileNav();
      }
    });

    const packagesSwitcher = document.querySelector('.packages-switcher');
    if (packagesSwitcher) {
      const packageTabs = Array.from(packagesSwitcher.querySelectorAll('[data-package-tab]'));
      const packagePanels = Array.from(document.querySelectorAll('[data-package-panel]'));
      const packageGlass = packagesSwitcher.querySelector('.packages-switcher-glass');
      let packageGlassTimer;

      function activatePackageTab(index, moveFocus) {
        const normalizedIndex = (index + packageTabs.length) % packageTabs.length;
        const activeTab = packageTabs[normalizedIndex];
        const activeName = activeTab.getAttribute('data-package-tab');
        const previousIndex = packageTabs.findIndex(tab => tab.getAttribute('aria-selected') === 'true');

        packagesSwitcher.style.setProperty('--package-tab-index', normalizedIndex);
        if (packageGlass && previousIndex !== normalizedIndex) {
          clearTimeout(packageGlassTimer);
          packageGlass.classList.remove('is-gliding');
          requestAnimationFrame(() => packageGlass.classList.add('is-gliding'));
          packageGlassTimer = setTimeout(() => packageGlass.classList.remove('is-gliding'), 600);
        }
        packageTabs.forEach((tab, tabIndex) => {
          const isActive = tabIndex === normalizedIndex;
          tab.classList.toggle('is-active', isActive);
          tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
          tab.tabIndex = isActive ? 0 : -1;
        });
        packagePanels.forEach(panel => {
          const isActive = panel.getAttribute('data-package-panel') === activeName;
          panel.classList.remove('is-active');
          panel.hidden = !isActive;
          if (isActive) requestAnimationFrame(() => panel.classList.add('is-active'));
        });
        if (moveFocus) activeTab.focus();
      }

      packageTabs.forEach((tab, tabIndex) => {
        tab.addEventListener('click', () => activatePackageTab(tabIndex, false));
        tab.addEventListener('keydown', event => {
          const isRtl = document.documentElement.dir === 'rtl';
          let nextIndex = null;
          if (event.key === 'ArrowRight') nextIndex = tabIndex + (isRtl ? -1 : 1);
          if (event.key === 'ArrowLeft') nextIndex = tabIndex + (isRtl ? 1 : -1);
          if (event.key === 'Home') nextIndex = 0;
          if (event.key === 'End') nextIndex = packageTabs.length - 1;
          if (nextIndex === null) return;
          event.preventDefault();
          activatePackageTab(nextIndex, true);
        });
      });
    }

    // ===== CUSTOM CURSOR =====
    const cursor = document.getElementById('cursor');
    const cursorRing = document.getElementById('cursorRing');
    let cursorX = 0, cursorY = 0;
    let ringX = 0, ringY = 0;
    
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
    
    if (!isTouchDevice) {
      document.addEventListener('mousemove', (e) => {
        cursorX = e.clientX;
        cursorY = e.clientY;
      });
      
      function animateCursor() {
        cursor.style.transform = `translate(${cursorX - 4}px, ${cursorY - 4}px)`;
        ringX += (cursorX - ringX) * 0.15;
        ringY += (cursorY - ringY) * 0.15;
        cursorRing.style.transform = `translate(${ringX - 20}px, ${ringY - 20}px)`;
        requestAnimationFrame(animateCursor);
      }
      animateCursor();
      
      // Hover effect on interactive elements
      const interactiveElements = document.querySelectorAll('a, button, .service-card, .feature-card');
      interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => cursorRing.classList.add('hover'));
        el.addEventListener('mouseleave', () => cursorRing.classList.remove('hover'));
      });
    } else {
      cursor.style.display = 'none';
      cursorRing.style.display = 'none';
    }

    // ===== SCROLL REVEAL =====
    const revealElements = document.querySelectorAll('.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .scroll-reveal-scale');
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    
    revealElements.forEach(el => revealObserver.observe(el));

    // ===== CLIENT CARD POPUP (bento gallery cards) =====
    // Opens ONLY on click of an individual image. Shows that image's picture
    // and brand name. Stays open until closed via the close button, clicking
    // outside the card, or Escape.
    const clientPopupBackdrop = document.getElementById('clientPopupBackdrop');
    const clientPopupClose = document.getElementById('clientPopupClose');
    const clientPopupImage = document.getElementById('clientPopupImage');
    const clientPopupName = document.getElementById('clientPopupName');
    const bentoCards = document.querySelectorAll('.bento-card');

    if (clientPopupBackdrop && clientPopupClose) {
      function openClientPopup(card) {
        const img = card.querySelector('img');
        const video = card.querySelector('video');
        const overlayName = card.querySelector('.bento-brand');
        if (img && clientPopupImage) {
          clientPopupImage.style.backgroundImage = `url("${img.getAttribute('src')}")`;
        }
        if (clientPopupName) {
          const mediaName = img ? img.getAttribute('alt') : (video ? video.getAttribute('aria-label') : '');
          clientPopupName.textContent = overlayName ? overlayName.textContent.trim() : (mediaName || 'Client');
        }
        clientPopupBackdrop.classList.add('open');
      }
      function closeClientPopup() {
        clientPopupBackdrop.classList.remove('open');
      }

      bentoCards.forEach(card => {
        card.addEventListener('click', () => openClientPopup(card));
      });

      clientPopupClose.addEventListener('click', closeClientPopup);

      // Clicking the dimmed backdrop (i.e. outside the card itself) closes it.
      clientPopupBackdrop.addEventListener('click', (e) => {
        if (e.target === clientPopupBackdrop) {
          closeClientPopup();
        }
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && clientPopupBackdrop.classList.contains('open')) {
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
    const DEFAULT_AUTO_SCROLL_SPEED = isTouchDevice ? AUTO_SCROLL_SPEED_MOBILE : AUTO_SCROLL_SPEED;

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
    const bentoVideoObserver = ('IntersectionObserver' in window)
      ? new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            const v = entry.target;
            if (entry.isIntersecting) {
              const p = v.play();
              if (p && typeof p.catch === 'function') p.catch(function () {});
            } else {
              v.pause();
            }
          });
        }, { threshold: 0.2 })
      : null;
    function observeBentoVideos(container) {
      container.querySelectorAll('video.bento-video').forEach(function (v) {
        // Assign each (cloned) video its source from the embedded base64 map
        // in js/videos-base64.js. Done here in JS - not as an HTML src - so
        // the ~8MB of data URIs is never duplicated into the markup for every
        // cloned copy the loop-slider makes; each clone just points its src
        // property at the one shared string.
        if (!v.src && v.dataset.videoKey && window.BENTO_VIDEOS) {
          var uri = window.BENTO_VIDEOS[v.dataset.videoKey];
          if (uri) v.src = uri;
        }
        if (bentoVideoObserver) {
          bentoVideoObserver.observe(v);
        } else {
          // No IntersectionObserver (very old browser): just play them all.
          var p = v.play();
          if (p && typeof p.catch === 'function') p.catch(function () {});
        }
      });
    }

    function makeLoopSlider(container, axis, direction = 1, speed = DEFAULT_AUTO_SCROLL_SPEED) {
      const track = container.firstElementChild;
      if (!track) return;

      const sizeProp = axis === 'y' ? 'scrollHeight' : 'scrollWidth';
      const posProp = axis === 'y' ? 'scrollTop' : 'scrollLeft';
      const clientProp = axis === 'y' ? 'clientHeight' : 'clientWidth';

      // Snapshot ONE original set of cards before we clone anything.
      const originalHTML = track.innerHTML;
      let setSize = 0;      // length of one original set (px)
      let recentering = false;
      let dragging = false; // true while a manual drag/touch interaction is in progress
      let paused = false;   // true while the mouse is hovering the slider

      function build(force) {
        // Once a build has actually measured something usable, later calls
        // are no-ops unless explicitly forced (a real width change). This
        // used to run unconditionally every time build() was called - fine
        // for <img> cards (served instantly from cache, no visible effect),
        // but a <video> card gets torn down and recreated by the innerHTML
        // reset below just the same as an image would. Recreating a live,
        // already-playing, already-autoplaying video element a few hundred
        // ms after it started (which happened on every page load, since this
        // fired at least twice unconditionally) forces it to restart
        // decode/autoplay from scratch - on real phones that's a visible
        // flash/jump right as the layout resettles, not just a harmless
        // no-op like it is for images.
        if (setSize && !force) return;
        // One set on its own, measured.
        track.innerHTML = originalHTML;
        setSize = axis === 'y' ? track.scrollHeight : track.scrollWidth;
        if (!setSize) return;
        // Repeat the set until the whole track is at least 3 viewports long,
        // and always an odd number of copies so there's a true middle set.
        // This gives every column - even the 3-card one - a full set of
        // buffer above AND below the visible area, so wrapping never runs out
        // of room in either direction.
        const viewport = container[clientProp] || 1;
        let copies = Math.max(3, Math.ceil((viewport * 3) / setSize));
        if (copies % 2 === 0) copies += 1;      // keep it odd -> clean middle
        track.innerHTML = originalHTML.repeat(copies);
        // Park in the middle copy.
        recentering = true;
        container[posProp] = setSize * Math.floor(copies / 2);
        recentering = false;
        // Cloning just created fresh <video> copies - hand them to the
        // visibility observer so only the on-screen ones ever play/load.
        observeBentoVideos(container);
      }

      if (document.readyState === 'complete') build();
      else window.addEventListener('load', build);
      setTimeout(build, 300);
      // Only rebuild on a genuine width change (rotation, real window resize).
      // Mobile browsers fire 'resize' on window whenever the address bar
      // auto-hides/shows while scrolling - that only changes height, but
      // was re-triggering build() (which wipes the track and re-centers
      // scroll position) on basically every scroll gesture, which is what
      // looked like the slider "stopping and resetting" while scrolling.
      let lastInnerWidth = window.innerWidth;
      window.addEventListener('resize', () => {
        if (window.innerWidth === lastInnerWidth) return;
        lastInnerWidth = window.innerWidth;
        build(true); // force: card widths genuinely changed, must re-measure
      });

      // As the user scrolls, keep them near the centre by jumping in whole
      // set-lengths whenever they've drifted more than one set from centre.
      // A jump of exactly setSize is invisible (every set is identical), so it
      // reads as an endless loop that stops wherever the user stops - the same
      // both up and down, regardless of how many cards the column has.
      container.addEventListener('scroll', () => {
        if (!setSize || recentering) return;
        const pos = container[posProp];
        const maxPos = container[sizeProp] - container[clientProp];
        const centre = Math.round((maxPos) / 2);
        if (pos <= 0) {
          recentering = true;
          container[posProp] = pos + setSize;          // hit top -> jump down a set
          recentering = false;
        } else if (pos >= maxPos) {
          recentering = true;
          container[posProp] = pos - setSize;          // hit bottom -> jump up a set
          recentering = false;
        } else if (Math.abs(pos - centre) > setSize) {
          recentering = true;
          // Snap back toward centre by whole sets, preserving sub-position.
          const drift = pos - centre;
          const steps = Math.trunc(drift / setSize);
          container[posProp] = pos - steps * setSize;
          recentering = false;
        }
      }, { passive: true });

      // Pause auto-scroll on hover; resume from the same spot on mouse-leave.
      // Gated to non-touch devices only: touchscreens fire a synthetic
      // "mouseenter" for click-compatibility on tap, but never a matching
      // "mouseleave" (there's no real cursor to leave), which without this
      // guard would set paused = true on the very first tap and never clear
      // it again - permanently freezing the animation on that device from
      // then on. That's device/interaction-dependent, which is exactly why
      // this could look fine on one device and be stuck solid on another.
      container.addEventListener('mouseenter', () => { if (!isTouchDevice) paused = true; });
      container.addEventListener('mouseleave', () => { if (!isTouchDevice) paused = false; });
      // Also pause for the duration of a touch interaction (no hover events
      // on touch devices, so this is what keeps auto-scroll from fighting a
      // finger-swipe on mobile). Resuming isn't instant: phones keep
      // scrolling under momentum/inertia well after touchend fires, and if
      // auto-scroll jumps back in immediately it fights that native
      // momentum, which is what shows up as stutter/glitching on real
      // devices. So resume is delayed until momentum has had time to settle.
      let touchResumeTimer = null;
      container.addEventListener('touchstart', () => {
        dragging = true;
        paused = false; // belt-and-braces: a real touch can never leave this stuck paused
        if (touchResumeTimer) { clearTimeout(touchResumeTimer); touchResumeTimer = null; }
      }, { passive: true });
      container.addEventListener('touchend', () => {
        if (touchResumeTimer) clearTimeout(touchResumeTimer);
        touchResumeTimer = setTimeout(() => { dragging = false; touchResumeTimer = null; }, 600);
      }, { passive: true });

      // Auto-scroll: creep along at `speed` px/SECOND in `direction`, unless
      // paused (hover) or being manually dragged/touched. Reuses the same
      // posProp the manual controls and the recentring listener above use,
      // so it just looks like a very slow, continuous manual scroll.
      //
      // Movement is scaled by the actual elapsed time between frames
      // (rAF's timestamp argument), not a fixed amount per frame. Frame rate
      // isn't the same across devices - a 60Hz laptop gets ~60 frames/sec,
      // but plenty of phones run 90Hz or 120Hz screens, meaning noticeably
      // more frames (and, at a flat px/frame rate, noticeably faster visible
      // motion) in the same second. That's why the speed used to look
      // different on laptop vs. phone even though the code was identical.
      // Scaling by real elapsed time makes the speed the same everywhere
      // regardless of the display's refresh rate.
      //
      // `remainder` banks the fractional pixels a given frame's delta didn't
      // use up. container.scrollTop/scrollLeft round to whole pixels on
      // read, so writing a sub-1px delta straight to it gets silently
      // discarded - below a certain speed the position would never advance
      // at all. Accumulating the fraction here instead (and only flushing
      // whole pixels out to the DOM once they add up) means any speed, no
      // matter how small, eventually moves it.
      let remainder = 0;
      let lastTimestamp = null;
      function autoScrollStep(timestamp) {
        if (lastTimestamp === null) {
          lastTimestamp = timestamp;
          requestAnimationFrame(autoScrollStep);
          return;
        }
        // Clamp so returning from a backgrounded/throttled tab (where the
        // gap between frames can be seconds long) doesn't fast-forward the
        // scroll position in one big jump.
        const deltaMs = Math.min(timestamp - lastTimestamp, 100);
        lastTimestamp = timestamp;
        if (!paused && !dragging && setSize) {
          remainder += speed * (deltaMs / 1000) * direction;
          const whole = Math.trunc(remainder);
          if (whole !== 0) {
            container[posProp] += whole;
            remainder -= whole;
          }
        }
        requestAnimationFrame(autoScrollStep);
      }
      requestAnimationFrame(autoScrollStep);

      // Horizontal strip: click-and-drag to scroll (plus native wheel/trackpad).
      if (axis === 'x') {
        let down = false, startX = 0, startScroll = 0, moved = false;
        container.addEventListener('mousedown', (e) => {
          down = true; moved = false;
          dragging = true;
          startX = e.pageX;
          startScroll = container.scrollLeft;
          container.classList.add('dragging');
        });
        window.addEventListener('mousemove', (e) => {
          if (!down) return;
          const dx = e.pageX - startX;
          if (Math.abs(dx) > 3) moved = true;
          container.scrollLeft = startScroll - dx;
        });
        window.addEventListener('mouseup', () => {
          down = false;
          dragging = false;
          container.classList.remove('dragging');
        });
        // Prevent a drag from also firing a click on a card/link.
        container.addEventListener('click', (e) => {
          if (moved) { e.preventDefault(); e.stopPropagation(); }
        }, true);
        // Translate vertical wheel into horizontal scroll for convenience.
        container.addEventListener('wheel', (e) => {
          if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
            e.preventDefault();
            container.scrollLeft += e.deltaY;
          }
        }, { passive: false });
      }

      // Vertical columns: click-and-drag to scroll (native wheel/trackpad/touch
      // already scroll the column since it's overflow-y:auto). Mirrors the
      // horizontal slider's drag behavior, just on the Y axis.
      if (axis === 'y') {
        let down = false, startY = 0, startScroll = 0, moved = false;
        container.addEventListener('mousedown', (e) => {
          down = true; moved = false;
          dragging = true;
          startY = e.pageY;
          startScroll = container.scrollTop;
          container.classList.add('dragging');
        });
        window.addEventListener('mousemove', (e) => {
          if (!down) return;
          const dy = e.pageY - startY;
          if (Math.abs(dy) > 3) moved = true;
          container.scrollTop = startScroll - dy;
        });
        window.addEventListener('mouseup', () => {
          down = false;
          dragging = false;
          container.classList.remove('dragging');
        });
        // A drag shouldn't also fire the card's click-to-popup.
        container.addEventListener('click', (e) => {
          if (moved) { e.preventDefault(); e.stopPropagation(); }
        }, true);
      }
    }

    // Columns auto-scroll DOWN, UP, DOWN (direction: +1 = down, -1 = up).
    document.querySelectorAll('.bento-column').forEach((col, i) => {
      makeLoopSlider(col, 'y', i === 1 ? -1 : 1);
    });
    // Two brand-logo rows, scrolling opposite ways: row 1 right-to-left
    // (+1 = increasing scrollLeft), row 2 left-to-right (-1).
    document.querySelectorAll('.brands-marquee').forEach((marquee, i) => {
      makeLoopSlider(marquee, 'x', i === 0 ? 1 : -1);
    });

    // (Parallax is now handled in the combined, rAF-throttled scroll listener above.)

    // ===== SMOOTH SCROLL FOR NAV LINKS =====
    // Uses the same rAF-driven smoothScrollTo as back-to-top so nav clicks animate
    // even when the OS has reduce-motion on. The fixed header height is subtracted
    // so the target section isn't left hidden underneath the header.
    const HEADER_OFFSET = 80; // = --header-height (64) + 16, matches section[id] scroll-margin-top
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        // Bare "#" placeholders (logo, footer icons, etc.) aren't real anchors -
        // document.querySelector('#') throws, so just do nothing for those.
        if (href.length <= 1) {
          e.preventDefault();
          return;
        }
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          const targetY = target.getBoundingClientRect().top + window.pageYOffset - HEADER_OFFSET;
          smoothScrollTo(targetY);
        }
      });
    });

    // ===== LOGO -> HOME (top of landing page) =====
    // On the landing page the logo scrolls smoothly to the top instead of
    // reloading; on any other page (e.g. about.html) it just follows its
    // href="welcome.html" and lands at the top of a fresh page load.
    const logoHome = document.querySelector('.js-logo-home');
    if (logoHome) {
      logoHome.addEventListener('click', function (e) {
        const page = (location.pathname.split('/').pop() || 'welcome.html').toLowerCase();
        if (page === '' || page === 'welcome.html') {
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

    // ===== TILT EFFECT ON CARDS =====
    if (!isTouchDevice) {
      const tiltCards = document.querySelectorAll('.feature-card, .service-card');
      tiltCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          const rotateX = (y - centerY) / 20;
          const rotateY = (centerX - x) / 20;
          card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
        });
        card.addEventListener('mouseleave', () => {
          card.style.transform = '';
        });
      });
    }

    // ===== MAGNETIC BUTTONS =====
    if (!isTouchDevice) {
      const magneticBtns = document.querySelectorAll('.btn');
      magneticBtns.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
          const rect = btn.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;
          btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
        });
        btn.addEventListener('mouseleave', () => {
          btn.style.transform = '';
        });
      });
    }

    // ===== GLOW FOLLOW EFFECT =====
    if (!isTouchDevice) {
      const glowCards = document.querySelectorAll('.feature-card');
      glowCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          card.style.setProperty('--mouse-x', `${x}px`);
          card.style.setProperty('--mouse-y', `${y}px`);
        });
      });
    }

    // ===== COUNTER ANIMATION =====
    function animateCounter(element, target, duration = 2000) {
      // Suffix ('+', '%', etc.) read from the element's own starting text
      // instead of being hardcoded - previously this always appended '+',
      // so a stat written as "98%" in the HTML would count up correctly but
      // land on "98+" once the animation finished.
      const suffix = element.textContent.replace(/[0-9]/g, '');
      let start = 0;
      const increment = target / (duration / 16);
      function update() {
        start += increment;
        if (start < target) {
          element.textContent = Math.floor(start) + suffix;
          requestAnimationFrame(update);
        } else {
          element.textContent = target + suffix;
        }
      }
      update();
    }

    // Trigger counter animation when hero stats are visible
    const statObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const statValue = entry.target.querySelector('.hero-stat-value');
          if (statValue && statValue.textContent.includes('430')) {
            animateCounter(statValue, 430, 1500);
          } else if (statValue && statValue.textContent.includes('97')) {
            animateCounter(statValue, 97, 1500);
          }
          statObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    // Delayed so hero stats already in view on load don't fire (and finish)
    // their count-up while still hidden behind the loading overlay above.
    overlayHiddenPromise.then(() => {
      document.querySelectorAll('.hero-stat').forEach(stat => statObserver.observe(stat));
    });

    // ===== BLUR-IN ANIMATION =====
    function blurInElements() {
      const elements = document.querySelectorAll('.scroll-reveal');
      elements.forEach(el => {
        el.style.filter = 'blur(10px)';
        el.style.opacity = '0';
      });
      
      const blurObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.style.transition = 'filter 0.8s ease-out, opacity 0.8s ease-out, transform 0.8s ease-out';
            entry.target.style.filter = 'blur(0px)';
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            blurObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });
      
      elements.forEach(el => blurObserver.observe(el));
    }
    blurInElements();

    // ===== WOBBLE ANIMATION ON LOAD =====
    document.querySelectorAll('.hero-title, .section-title').forEach(el => {
      el.style.animation = 'fadeInUp 1s ease-out forwards';
    });
