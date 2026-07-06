    // ===== FOOTER YEAR =====
    const yearEl = document.getElementById('currentYear');
    if (yearEl) {
      yearEl.textContent = new Date().getFullYear();
    }

    // ===== LOADING OVERLAY =====
    // Was gated on window's `load` event, which waits for EVERY resource on
    // the page - including the third-party Cal.com embed script - so a slow
    // or hanging third-party request left the whole site stuck behind the
    // spinner. This script tag sits at the end of <body>, so the DOM above
    // it is already parsed by the time this runs; no need to wait further.
    setTimeout(() => {
      document.getElementById('loading').classList.add('hidden');
    }, 800);

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

    // Manual eased scroll-to-top rather than scrollTo({behavior:'smooth'}):
    // browsers silently downgrade the native smooth behavior to an instant
    // jump when the visitor's OS has "reduce motion" turned on, which isn't
    // something the scrollTo options can override. Driving it ourselves via
    // rAF guarantees it always visibly animates.
    backToTop.addEventListener('click', () => {
      const startY = window.pageYOffset;
      const duration = 600;
      let startTime = null;
      function easeInOutQuad(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
      function step(timestamp) {
        if (startTime === null) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        window.scrollTo(0, startY * (1 - easeInOutQuad(progress)));
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });

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

    function openClientPopup(card) {
      const img = card.querySelector('img');
      const overlayName = card.querySelector('.bento-brand');
      if (img && clientPopupImage) {
        clientPopupImage.style.backgroundImage = `url("${img.getAttribute('src')}")`;
      }
      if (clientPopupName) {
        clientPopupName.textContent = overlayName ? overlayName.textContent.trim() : (img ? img.getAttribute('alt') : 'Client');
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

      function build() {
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
        build();
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
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });

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

    // ===== TYPEWRITER EFFECT FOR HERO =====
    function typewriterEffect(element, text, speed = 50) {
      let i = 0;
      element.textContent = '';
      function type() {
        if (i < text.length) {
          element.textContent += text.charAt(i);
          i++;
          setTimeout(type, speed);
        }
      }
      type();
    }

    // ===== COUNTER ANIMATION =====
    function animateCounter(element, target, duration = 2000) {
      let start = 0;
      const increment = target / (duration / 16);
      function update() {
        start += increment;
        if (start < target) {
          element.textContent = Math.floor(start) + '+';
          requestAnimationFrame(update);
        } else {
          element.textContent = target + '+';
        }
      }
      update();
    }

    // Trigger counter animation when hero stats are visible
    const statObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const statValue = entry.target.querySelector('.hero-stat-value');
          if (statValue && statValue.textContent.includes('500')) {
            animateCounter(statValue, 500, 1500);
          } else if (statValue && statValue.textContent.includes('98')) {
            animateCounter(statValue, 98, 1500);
          }
          statObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    
    document.querySelectorAll('.hero-stat').forEach(stat => statObserver.observe(stat));

    // ===== TEXT SCRAMBLE EFFECT =====
    class TextScramble {
      constructor(el) {
        this.el = el;
        this.chars = '!<>-_\\/[]{}&mdash;=+*^?#________';
        this.update = this.update.bind(this);
      }
      setText(newText) {
        const oldText = this.el.innerText;
        const length = Math.max(oldText.length, newText.length);
        const promise = new Promise(resolve => this.resolve = resolve);
        this.queue = [];
        for (let i = 0; i < length; i++) {
          const from = oldText[i] || '';
          const to = newText[i] || '';
          const start = Math.floor(Math.random() * 40);
          const end = start + Math.floor(Math.random() * 40);
          this.queue.push({ from, to, start, end });
        }
        cancelAnimationFrame(this.frameRequest);
        this.frame = 0;
        this.update();
        return promise;
      }
      update() {
        let output = '';
        let complete = 0;
        for (let i = 0, n = this.queue.length; i < n; i++) {
          let { from, to, start, end, char } = this.queue[i];
          if (this.frame >= end) {
            complete++;
            output += to;
          } else if (this.frame >= start) {
            if (!char || Math.random() < 0.28) {
              char = this.randomChar();
              this.queue[i].char = char;
            }
            output += `<span class="text-scramble-char">${char}</span>`;
          } else {
            output += from;
          }
        }
        this.el.innerHTML = output;
        if (complete === this.queue.length) {
          this.resolve();
        } else {
          this.frameRequest = requestAnimationFrame(this.update);
          this.frame++;
        }
      }
      randomChar() {
        return this.chars[Math.floor(Math.random() * this.chars.length)];
      }
    }

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
