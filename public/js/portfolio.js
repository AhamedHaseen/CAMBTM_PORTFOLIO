(function () {
  'use strict';

  const portfolioRoot = document.getElementById('project-atlas');
  if (!portfolioRoot) return;

  const WORLD_VIEW_BOX = [0, 0, 1000, 500];
  const MAP_TRANSITION_DURATION = 680;
  const KNOWN_SERVICES = new Set(['websites', 'systems', 'branding', 'social', 'campaigns', 'automation']);
  const CAL_LANGUAGE_MAP = { en: 'en', es: 'es', ar: 'ar', si: 'en', ta: 'en' };

  const grid = document.getElementById('portfolioGrid');
  const resultCount = document.getElementById('portfolioResultCount');
  const emptyState = document.getElementById('portfolioEmpty');
  const unavailableState = document.getElementById('portfolioUnavailable');
  const clearFiltersButton = document.getElementById('portfolioClearFilters');
  const filterChips = document.getElementById('portfolioFilterChips');
  const matchControl = document.getElementById('portfolioMatchControl');
  const mapSvg = document.getElementById('portfolioWorldMap');
  const mapCountryDetail = document.getElementById('portfolioCountryMap');
  const mapMarkers = document.getElementById('portfolioMapMarkers');
  const mapBack = document.getElementById('portfolioMapBack');
  const mapPreview = document.getElementById('portfolioMapPreview');
  const mapStatus = document.getElementById('portfolioMapStatus');
  const mapShortcut = document.getElementById('portfolioMapShortcut');

  const state = {
    registry: null,
    projects: [],
    activeServices: new Set(),
    matchMode: 'any',
    openId: null,
    mapCountry: null,
    mapProjectId: null,
    currentViewBox: WORLD_VIEW_BOX.slice(),
    filterTimer: null,
    mapAnimation: null
  };

  function currentLanguage() {
    return document.documentElement.lang || 'en';
  }

  function translate(key, replacements) {
    const translations = window.CAMBM_TRANSLATIONS || {};
    const language = currentLanguage();
    const dictionary = translations[language] || translations.en || {};
    const english = translations.en || {};
    let value = dictionary[key] != null ? dictionary[key] : (english[key] != null ? english[key] : key);
    if (replacements) {
      Object.keys(replacements).forEach(function (name) {
        value = String(value).replace(new RegExp('\\{' + name + '\\}', 'g'), String(replacements[name]));
      });
    }
    return value;
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function easeInOutCubic(progress) {
    return progress < 0.5
      ? 4 * progress * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 3) / 2;
  }

  function smoothScrollToElement(element, focusAfter) {
    if (!element) return;
    const start = window.pageYOffset;
    const destination = Math.max(0, element.getBoundingClientRect().top + start - 82);
    const distance = destination - start;
    const duration = 700;
    let startedAt = null;

    function frame(timestamp) {
      if (startedAt === null) startedAt = timestamp;
      const progress = Math.min((timestamp - startedAt) / duration, 1);
      window.scrollTo(0, start + distance * easeInOutCubic(progress));
      if (progress < 1) {
        requestAnimationFrame(frame);
      } else if (focusAfter) {
        focusAfter.focus({ preventScroll: true });
      }
    }

    requestAnimationFrame(frame);
  }

  function validateRegistry(registry) {
    if (!registry || !Array.isArray(registry.projects)) {
      throw new Error('Portfolio registry does not contain a projects array.');
    }

    const seen = new Set();
    const countries = registry.countries || {};
    const validProjects = [];

    registry.projects.forEach(function (project, index) {
      if (!project || typeof project !== 'object' || !project.id) {
        console.error('Portfolio project skipped: record ' + (index + 1) + ' has no stable id.');
        return;
      }
      if (seen.has(project.id)) {
        console.error('Portfolio project skipped: duplicate id "' + project.id + '".');
        return;
      }
      seen.add(project.id);

      const normalized = Object.assign({}, project);
      normalized.brand = project.brand || project.id;
      normalized.index = project.index || String(validProjects.length + 1).padStart(2, '0');
      normalized.variant = ['wide', 'tall', 'feature', 'standard'].indexOf(project.variant) !== -1 ? project.variant : 'standard';
      normalized.services = Array.isArray(project.services) ? project.services : ['branding', 'social'];
      normalized.logo = project.logo || project.logo_url || '';
      normalized.logo_url = project.logo_url || project.logo || '';
      normalized.industry = project.industry || 'Beauty & Wellness';
      normalized.market = project.market || 'Global';
      normalized.location_name = typeof project.location === 'string' ? project.location : (project.location_place || 'Colombo, Sri Lanka');
      normalized.overview = project.overview || project.short_description || '';
      normalized.challenge = project.challenge || '';
      normalized.approach = project.approach || '';
      normalized.deliverables = project.deliverables || '';
      normalized.gallery = Array.isArray(project.gallery) ? project.gallery.slice(0, 4) : [];
      while (normalized.gallery.length < 4) normalized.gallery.push('');
      normalized.metrics = Array.isArray(project.metrics) && project.metrics.length > 0 ? project.metrics : ['+240% Sales Growth', '4.8x Ad ROI', '1.2M+ Reach'];

      const location = project.location;
      if (!location || typeof location === 'string' || !location.country || !countries[location.country] || !Array.isArray(location.countryPosition)) {
        normalized.location = null;
      }

      validProjects.push(normalized);
    });

    return {
      version: registry.version || 1,
      countries: countries,
      projects: validProjects
    };
  }

  function projectCopy(project, field) {
    if (project[field]) return project[field];
    if (field === 'overview' && project.short_description) return project.short_description;
    const key = (project.translationPrefix || ('portfolio.project.' + project.id)) + '.' + field;
    const val = translate(key);
    if (val && val !== key) return val;
    return project[field] || '';
  }

  function serviceLabel(service) {
    const key = 'portfolio.service.' + service;
    const val = translate(key);
    return (val && val !== key) ? val : (service.charAt(0).toUpperCase() + service.slice(1));
  }

  function industryLabel(industry) {
    if (!industry) return 'Beauty & Wellness';
    const key = 'portfolio.industry.' + industry;
    const val = translate(key);
    if (val && val !== key) return val;
    return industry;
  }

  function marketLabel(market) {
    if (!market) return 'Global';
    const key = 'portfolio.market.' + market;
    const val = translate(key);
    if (val && val !== key) return val;
    return market;
  }

  function locationLabel(project) {
    if (project.location_name) return project.location_name;
    if (typeof project.location === 'string' && project.location) return project.location;
    if (project.location && project.location.cityKey) {
      const city = translate(project.location.cityKey);
      const country = translate(project.location.countryKey);
      if (city && !city.startsWith('portfolio.')) {
        return city + (country && !country.startsWith('portfolio.') ? ', ' + country : '');
      }
    }
    return 'Colombo, Sri Lanka';
  }

  function neutralFrameMarkup(project, frameNumber, modifier) {
    const label = frameNumber === 0
      ? translate('portfolio.image.coverLabel', { brand: project.brand })
      : translate('portfolio.image.galleryLabel', { brand: project.brand, number: String(frameNumber).padStart(2, '0') });
    const logoSrc = project.logo || project.logo_url;
    const logo = logoSrc
      ? '<img class="portfolio-frame-logo" src="' + escapeHtml(logoSrc) + '" alt="' + escapeHtml(project.brand + ' logo') + '">'
      : '<span class="portfolio-frame-monogram" aria-hidden="true">' + escapeHtml(project.brand.charAt(0)) + '</span>';

    return '<div class="portfolio-neutral-frame ' + (modifier || '') + '" role="img" aria-label="' + escapeHtml(label) + '">' +
      '<span class="portfolio-frame-code">CAMBM / ' + escapeHtml(project.index) + '</span>' +
      logo +
      '<span class="portfolio-frame-label">' + escapeHtml(translate('portfolio.image.placeholder')) + '</span>' +
      '<span class="portfolio-frame-coordinate">' + escapeHtml(frameNumber === 0 ? '00 / COVER' : '0' + frameNumber + ' / FRAME') + '</span>' +
      '</div>';
  }

  function mediaMarkup(project, imagePath, frameNumber, modifier) {
    const label = frameNumber === 0
      ? translate('portfolio.image.coverAlt', { brand: project.brand })
      : translate('portfolio.image.galleryAlt', { brand: project.brand, number: frameNumber });
    const neutral = neutralFrameMarkup(project, frameNumber, modifier);
    if (!imagePath) return neutral;
    return '<div class="portfolio-image-frame ' + (modifier || '') + '">' +
      '<img src="' + escapeHtml(imagePath) + '" alt="' + escapeHtml(label) + '" loading="lazy" decoding="async" data-portfolio-image>' +
      '<div class="portfolio-image-fallback">' + neutral + '</div>' +
      '</div>';
  }

  function logoStageMarkup(project) {
    const logoUrl = project.logo || project.logo_url;
    const logo = logoUrl
      ? '<img class="portfolio-logo-stage-image" src="' + escapeHtml(logoUrl) + '" alt="' + escapeHtml(project.brand + ' logo') + '" loading="lazy" decoding="async" data-portfolio-logo>'
      : '';

    return '<div class="portfolio-logo-stage' + (logoUrl ? '' : ' image-failed') + '">' +
      logo +
      '<span class="portfolio-logo-stage-monogram" aria-hidden="true">' + escapeHtml(project.brand.charAt(0)) + '</span>' +
      '</div>';
  }

  function tagsMarkup(project) {
    const services = project.services.map(function (service) {
      return '<span class="portfolio-tag portfolio-tag-service">' + escapeHtml(serviceLabel(service)) + '</span>';
    }).join('');
    return services +
      '<span class="portfolio-tag">' + escapeHtml(industryLabel(project.industry)) + '</span>' +
      '<span class="portfolio-tag">' + escapeHtml(marketLabel(project.market)) + '</span>';
  }

  function caseStudyMarkup(project) {
    const overviewText = project.overview || project.short_description || projectCopy(project, 'overview') || 'A connected brand and campaign direction designed to make ' + project.brand + ' feel coherent across every customer touchpoint while creating a stronger platform for future growth.';
    const challengeText = project.challenge || projectCopy(project, 'challenge') || 'Legacy workflows and fragmented brand touchpoints created high customer drop-off before checkout across retail channels.';
    const approachText = project.approach || projectCopy(project, 'approach') || 'Unified digital design system, conversion-focused e-commerce storefront, and high-performance Meta creative funnels.';
    const deliverablesText = project.deliverables || projectCopy(project, 'deliverables') || 'Brand direction, social design system, campaign concepts, launch toolkit and performance-ready creative templates.';

    const brandLogoMarkup = (project.logo || project.logo_url)
      ? '<img src="' + escapeHtml(project.logo || project.logo_url) + '" alt="' + escapeHtml(project.brand + ' logo') + '" />'
      : '';

    const metricsMarkup = project.metrics.map(function (item, index) {
      let val = '';
      let lbl = '';
      if (typeof item === 'object' && item !== null) {
        val = item.value || '';
        lbl = item.label || '';
      } else if (typeof item === 'string') {
        const parts = item.trim().split(/\s+(.*)/);
        if (parts.length >= 2 && /^[\+\-\d\.\,\%xXkKmMbB\$\€\£\₹]+$/.test(parts[0])) {
          val = parts[0];
          lbl = parts[1];
        } else {
          val = item;
          const fallbackKey = 'portfolio.metric.' + (index + 1);
          const tr = translate(fallbackKey);
          lbl = (tr && tr !== fallbackKey && !tr.includes('Placeholder')) ? tr : '';
        }
      }
      return '<div class="portfolio-case-metric"><strong>' + escapeHtml(val) + '</strong>' +
        (lbl ? '<span>' + escapeHtml(lbl) + '</span>' : '') + '</div>';
    }).join('');

    return '<div class="portfolio-case-shell" id="case-' + escapeHtml(project.id) + '" aria-hidden="true">' +
      '<div class="portfolio-case-inner">' +
      '<div class="portfolio-case-topline"><span>CASE FILE / ' + escapeHtml(project.index) + '</span>' +
      '<button type="button" class="portfolio-case-close" data-close-project="' + escapeHtml(project.id) + '"><span>Close</span><i aria-hidden="true">×</i></button></div>' +
      '<header class="portfolio-case-header">' +
      '<div>' +
      '<span class="portfolio-case-location">' + escapeHtml(locationLabel(project)) + '</span>' +
      '<h3 id="case-heading-' + escapeHtml(project.id) + '" tabindex="-1">' + escapeHtml(project.brand) + '</h3>' +
      '</div>' +
      '<p class="portfolio-case-overview">' + escapeHtml(overviewText) + '</p>' +
      '</header>' +
      '<div class="portfolio-case-facts">' +
      '<div><span>Industry</span><strong>' + escapeHtml(industryLabel(project.industry)) + '</strong></div>' +
      '<div><span>Market</span><strong>' + escapeHtml(marketLabel(project.market)) + '</strong></div>' +
      '</div>' +
      '<div class="portfolio-case-narrative">' +
      '<section><span>01</span><h4>The Challenge</h4><p>' + escapeHtml(challengeText) + '</p></section>' +
      '<section><span>02</span><h4>The Approach</h4><p>' + escapeHtml(approachText) + '</p></section>' +
      '</div>' +
      '<div class="portfolio-case-deliverables">' +
      '<span class="portfolio-kicker">Deliverables</span><p>' + escapeHtml(deliverablesText) + '</p>' +
      '</div>' +
      '<div class="portfolio-case-metrics">' + metricsMarkup + '</div>' +
      '<div class="portfolio-case-conversion">' +
      '<div><span class="portfolio-kicker">Next Step</span><h4>Ready to scale your brand like ' + escapeHtml(project.brand) + '?</h4></div>' +
      '<button type="button" class="btn btn-primary js-open-cal js-portfolio-cta-btn" style="background-color: #ff5a00 !important; border-color: #ff5a00 !important; color: #fff !important;" data-cal-link="cambridge.marketing" data-cal-namespace="strategy-call" data-cal-config="{&quot;layout&quot;:&quot;month_view&quot;,&quot;language&quot;:&quot;en&quot;,&quot;locale&quot;:&quot;en&quot;}">Book a strategy call</button>' +
      '</div>' +
      '<nav class="portfolio-case-nav" aria-label="Case study navigation">' +
      '<button type="button" data-case-direction="previous"><span aria-hidden="true">←</span><span>Previous Project</span></button>' +
      '<button type="button" data-case-direction="next"><span>Next Project</span><span aria-hidden="true">→</span></button>' +
      '</nav>' +
      '</div>' +
      '</div>';
  }

  function projectCardMarkup(project) {
    return '<article class="portfolio-card" data-project-id="' + escapeHtml(project.id) + '">' +
      '<div class="portfolio-card-face" data-card-face-id="' + escapeHtml(project.id) + '">' +
      '<button type="button" class="portfolio-card-open" aria-expanded="false" aria-controls="case-' + escapeHtml(project.id) + '" data-open-project="' + escapeHtml(project.id) + '">' +
      '<span class="portfolio-visually-hidden">' + escapeHtml(translate('portfolio.card.open', { brand: project.brand })) + '</span>' +
      '</button>' +
      '<div class="portfolio-card-topline"><span>' + escapeHtml(project.index) + '</span><span>' + escapeHtml(locationLabel(project)) + '</span></div>' +
      '<div class="portfolio-card-media">' + logoStageMarkup(project) + '</div>' +
      '<div class="portfolio-card-content">' +
      '<h3>' + escapeHtml(project.brand) + '</h3>' +
      '<span class="portfolio-card-arrow" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path d="M6.9 17.1 17 7M9.1 6.9c2.8-.1 5.4 0 8 .1.2 2.7.2 5.3 0 8"/></svg></span>' +
      '</div>' +
      '</div>' +
      caseStudyMarkup(project) +
      '</article>';
  }

  function visibleProjects() {
    if (state.activeServices.size === 0) return state.projects.slice();
    const selected = Array.from(state.activeServices);
    return state.projects.filter(function (project) {
      if (state.matchMode === 'all') {
        return selected.every(function (service) { return project.services.indexOf(service) !== -1; });
      }
      return selected.some(function (service) { return project.services.indexOf(service) !== -1; });
    });
  }

  function updateFilterControls() {
    if (filterChips) {
      filterChips.querySelectorAll('[data-filter]').forEach(function (button) {
        const service = button.getAttribute('data-filter');
        const active = service === 'all' ? state.activeServices.size === 0 : state.activeServices.has(service);
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
    }
    if (matchControl) {
      matchControl.querySelectorAll('[data-match-mode]').forEach(function (button) {
        const active = button.getAttribute('data-match-mode') === state.matchMode;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
      matchControl.classList.toggle('is-relevant', state.activeServices.size > 1);
    }
  }

  function setProjectHash(projectId, mode) {
    const url = new URL(window.location.href);
    url.hash = projectId ? projectId : '';
    const method = mode === 'replace' ? 'replaceState' : 'pushState';
    window.history[method]({ portfolioProject: projectId || null }, '', url.pathname + url.search + url.hash);
  }

  function updateCalConfig() {
    const language = CAL_LANGUAGE_MAP[currentLanguage()] || 'en';
    grid.querySelectorAll('.js-open-cal').forEach(function (button) {
      button.setAttribute('data-cal-config', JSON.stringify({ layout: 'month_view', language: language, locale: language }));
    });
  }

  function bindImageFallbacks() {
    grid.querySelectorAll('[data-portfolio-image]').forEach(function (image) {
      image.addEventListener('error', function () {
        const frame = image.closest('.portfolio-image-frame');
        if (frame) frame.classList.add('image-failed');
      }, { once: true });
    });
    grid.querySelectorAll('[data-portfolio-logo]').forEach(function (image) {
      image.addEventListener('error', function () {
        const stage = image.closest('.portfolio-logo-stage');
        if (stage) stage.classList.add('image-failed');
      }, { once: true });
    });
  }

  function applyOpenState(focusHeading, scrollToCard) {
    grid.querySelectorAll('.portfolio-card').forEach(function (card) {
      const isOpen = card.getAttribute('data-project-id') === state.openId;
      const button = card.querySelector('.portfolio-card-open');
      const shell = card.querySelector('.portfolio-case-shell');
      card.classList.toggle('is-open', isOpen);
      if (button) button.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      if (shell) {
        shell.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
        shell.inert = !isOpen;
      }
      if (isOpen && scrollToCard) {
        const heading = card.querySelector('[id^="case-heading-"]');
        window.setTimeout(function () {
          smoothScrollToElement(card, focusHeading ? heading : null);
        }, 70);
      }
    });
  }

  function renderProjects(animate) {
    const visible = visibleProjects();
    const render = function () {
      grid.innerHTML = visible.map(projectCardMarkup).join('');
      grid.setAttribute('aria-busy', 'false');
      emptyState.hidden = visible.length !== 0;
      resultCount.textContent = translate('portfolio.results', { visible: visible.length, total: state.projects.length });
      bindImageFallbacks();
      updateCalConfig();
      applyOpenState(false, false);
      requestAnimationFrame(function () { grid.classList.remove('is-updating'); });
    };

    if (animate) {
      clearTimeout(state.filterTimer);
      grid.classList.add('is-updating');
      state.filterTimer = window.setTimeout(render, 150);
    } else {
      render();
    }
  }

  function closeProject(options) {
    if (!state.openId) return;
    state.openId = null;
    applyOpenState(false, false);
    if (!options || options.history !== false) setProjectHash('', options && options.replace ? 'replace' : 'push');
  }

  function openProject(projectId, options) {
    const project = state.projects.find(function (item) { return item.id === projectId; });
    if (!project) return;
    const visible = visibleProjects();
    if (!visible.some(function (item) { return item.id === projectId; })) {
      state.activeServices.clear();
      updateFilterControls();
      renderProjects(false);
    }
    state.openId = projectId;
    applyOpenState(Boolean(options && options.focus), options ? options.scroll !== false : true);
    if (!options || options.history !== false) setProjectHash(projectId, options && options.replace ? 'replace' : 'push');
  }

  function navigateCase(direction) {
    const filtered = visibleProjects();
    const order = filtered.length ? filtered : state.projects;
    const currentIndex = order.findIndex(function (project) {
      return String(project.id) === String(state.openId) || String(project.slug) === String(state.openId);
    });

    let nextIndex = 0;
    if (currentIndex !== -1) {
      const offset = direction === 'previous' ? -1 : 1;
      nextIndex = (currentIndex + offset + order.length) % order.length;
    }
    const nextProject = order[nextIndex];
    if (!nextProject) return;
    const nextProjectId = nextProject.id;

    grid.classList.add('is-case-navigating');
    openProject(nextProjectId, { focus: false, scroll: false });

    setTimeout(function () {
      const nextCard = grid.querySelector('[data-project-id="' + nextProjectId + '"]');
      if (nextCard) {
        const nextHeading = nextCard.querySelector('[id^="case-heading-"]');
        smoothScrollToElement(nextCard, nextHeading);
      }
      grid.classList.remove('is-case-navigating');
    }, 80);
  }

  function handleFilterChange() {
    if (state.openId && !visibleProjects().some(function (project) { return project.id === state.openId; })) {
      state.openId = null;
      setProjectHash('', 'replace');
    }
    updateFilterControls();
    renderProjects(true);
  }

  function clearFilters() {
    state.activeServices.clear();
    handleFilterChange();
  }

  function projectFromHash() {
    const id = decodeURIComponent(window.location.hash.replace(/^#/, ''));
    return state.projects.some(function (project) { return project.id === id; }) ? id : null;
  }

  function applyHashState() {
    const projectId = projectFromHash();
    if (projectId) {
      openProject(projectId, { history: false, focus: true, scroll: true });
    } else {
      closeProject({ history: false });
    }
  }

  function markerLabel(project) {
    return translate('portfolio.map.projectMarker', { brand: project.brand, location: locationLabel(project) });
  }

  function renderWorldMarkers() {
    if (!mapMarkers) return;
    const countries = state.registry.countries;
    const labelPositions = {
      IQ: { x: -18, y: -9, anchor: 'end' },
      SA: { x: -18, y: 14, anchor: 'end' },
      AE: { x: 18, y: 15, anchor: 'start' },
      IN: { x: 18, y: 4, anchor: 'start' },
      LK: { x: 18, y: 5, anchor: 'start' }
    };
    mapMarkers.innerHTML = Object.keys(countries).map(function (countryCode) {
      const countryProjects = state.projects.filter(function (project) {
        return project.location && project.location.country === countryCode;
      });
      if (!countryProjects.length || !Array.isArray(countries[countryCode].worldMarker)) return '';
      const position = countries[countryCode].worldMarker;
      const label = translate(countryProjects.length === 1 ? 'portfolio.map.countryMarkerOne' : 'portfolio.map.countryMarker', {
        country: translate(countries[countryCode].nameKey),
        count: countryProjects.length
      });
      const labelPosition = labelPositions[countryCode] || { x: 18, y: 5, anchor: 'start' };
      const displayName = countries[countryCode].shortNameKey
        ? translate(countries[countryCode].shortNameKey)
        : translate(countries[countryCode].nameKey);
      return '<g class="portfolio-map-marker portfolio-map-country-marker" transform="translate(' + position[0] + ' ' + position[1] + ')" tabindex="0" role="button" data-map-country="' + escapeHtml(countryCode) + '" aria-label="' + escapeHtml(label) + '">' +
        '<circle class="portfolio-marker-pulse" r="24"></circle><circle class="portfolio-marker-core" r="10"></circle>' +
        '<text class="portfolio-marker-count" text-anchor="middle" dominant-baseline="central">' + countryProjects.length + '</text>' +
        '<text class="portfolio-marker-name" x="' + labelPosition.x + '" y="' + labelPosition.y + '" text-anchor="' + labelPosition.anchor + '">' + escapeHtml(displayName) + '</text>' +
        '</g>';
    }).join('');
  }

  function renderCountryMarkers(countryCode) {
    if (!mapMarkers) return;
    const projects = state.projects.filter(function (project) {
      return project.location && project.location.country === countryCode;
    });
    const country = state.registry.countries[countryCode];
    const markerScale = Math.max(country.viewBox[2] / WORLD_VIEW_BOX[2], country.viewBox[3] / WORLD_VIEW_BOX[3]);
    const labelPositions = {
      myra: { x: 18, y: -11, anchor: 'start' },
      hijaz: { x: 18, y: 4, anchor: 'start' },
      mahanama: { x: 18, y: 18, anchor: 'start' },
      'lucky-darbar': { x: -18, y: 5, anchor: 'end' }
    };
    mapMarkers.innerHTML = projects.map(function (project, index) {
      const position = project.location.countryPosition;
      const labelPosition = labelPositions[project.id] || { x: 18, y: 5, anchor: 'start' };
      return '<g class="portfolio-map-marker portfolio-map-project-marker" style="--marker-delay:' + (index * 80) + 'ms" transform="translate(' + position[0] + ' ' + position[1] + ') scale(' + markerScale + ')" tabindex="0" role="button" data-map-project="' + escapeHtml(project.id) + '" aria-label="' + escapeHtml(markerLabel(project)) + '">' +
        '<circle class="portfolio-marker-pulse" r="24"></circle><circle class="portfolio-marker-core" r="10"></circle>' +
        '<text class="portfolio-marker-name" x="' + labelPosition.x + '" y="' + labelPosition.y + '" text-anchor="' + labelPosition.anchor + '">' + escapeHtml(project.brand) + '</text>' +
        '</g>';
    }).join('');
  }

  function animateMapViewBox(target, complete) {
    if (state.mapAnimation) cancelAnimationFrame(state.mapAnimation);
    const start = state.currentViewBox.slice();
    const duration = MAP_TRANSITION_DURATION;
    let startTime = null;

    function frame(timestamp) {
      if (startTime === null) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = easeInOutCubic(progress);
      const current = start.map(function (value, index) {
        return value + (target[index] - value) * eased;
      });
      mapSvg.setAttribute('viewBox', current.join(' '));
      state.currentViewBox = current;
      if (progress < 1) {
        state.mapAnimation = requestAnimationFrame(frame);
      } else {
        state.currentViewBox = target.slice();
        state.mapAnimation = null;
        if (complete) complete();
      }
    }

    state.mapAnimation = requestAnimationFrame(frame);
  }

  function openCountry(countryCode) {
    const country = state.registry.countries[countryCode];
    if (!country || !Array.isArray(country.viewBox)) return;
    state.mapCountry = countryCode;
    state.mapProjectId = null;
    mapPreview.hidden = true;
    mapBack.hidden = false;
    mapCountryDetail.setAttribute('href', 'assets/maps/countries/' + countryCode.toLowerCase() + '.svg?v=1.0.18');
    mapSvg.classList.add('is-zooming', 'is-country-view');
    mapStatus.textContent = translate('portfolio.map.zoomingStatus', { country: translate(country.nameKey) });
    mapMarkers.classList.add('is-leaving');
    window.setTimeout(function () { mapMarkers.innerHTML = ''; }, 180);
    animateMapViewBox(country.viewBox, function () {
      renderCountryMarkers(countryCode);
      mapMarkers.classList.remove('is-leaving');
      mapSvg.classList.remove('is-zooming');
      mapStatus.textContent = translate('portfolio.map.countryStatus', { country: translate(country.nameKey) });
      const firstMarker = mapMarkers.querySelector('[data-map-project]');
      if (firstMarker) firstMarker.focus({ preventScroll: true });
    });
  }

  function returnToWorld() {
    const previousCountry = state.mapCountry;
    state.mapCountry = null;
    state.mapProjectId = null;
    mapPreview.hidden = true;
    mapBack.hidden = true;
    mapSvg.classList.add('is-zooming');
    mapSvg.classList.remove('is-country-view');
    mapMarkers.classList.add('is-leaving');
    window.setTimeout(function () { mapMarkers.innerHTML = ''; }, 180);
    animateMapViewBox(WORLD_VIEW_BOX, function () {
      renderWorldMarkers();
      mapMarkers.classList.remove('is-leaving');
      mapSvg.classList.remove('is-zooming');
      mapCountryDetail.removeAttribute('href');
      mapStatus.textContent = translate('portfolio.map.worldStatus');
      const previousMarker = mapMarkers.querySelector('[data-map-country="' + previousCountry + '"]');
      if (previousMarker) previousMarker.focus({ preventScroll: true });
    });
  }

  function renderMapPreview(projectId) {
    const project = state.projects.find(function (item) { return item.id === projectId; });
    if (!project) return;
    state.mapProjectId = projectId;
    mapPreview.innerHTML = '<span class="portfolio-map-preview-index">' + escapeHtml(project.index) + '</span>' +
      '<div><span class="portfolio-map-preview-location">' + escapeHtml(locationLabel(project)) + '</span>' +
      '<h3>' + escapeHtml(project.brand) + '</h3><p>' + escapeHtml(projectCopy(project, 'teaser')) + '</p></div>' +
      '<button type="button" class="btn btn-primary" data-map-view-case="' + escapeHtml(project.id) + '">' + escapeHtml(translate('portfolio.map.viewCase')) + '</button>';
    mapPreview.hidden = false;
    mapStatus.textContent = translate('portfolio.map.selectedStatus', { brand: project.brand });
  }

  function renderMapForLocale() {
    if (!state.mapCountry) {
      renderWorldMarkers();
      mapStatus.textContent = translate('portfolio.map.worldStatus');
    } else {
      renderCountryMarkers(state.mapCountry);
      const country = state.registry.countries[state.mapCountry];
      mapStatus.textContent = translate('portfolio.map.countryStatus', { country: translate(country.nameKey) });
    }
    if (state.mapProjectId) renderMapPreview(state.mapProjectId);
  }

  function bindEvents() {
    filterChips.addEventListener('click', function (event) {
      const button = event.target.closest('[data-filter]');
      if (!button) return;
      const service = button.getAttribute('data-filter');
      if (service === 'all') {
        state.activeServices.clear();
      } else if (state.activeServices.has(service)) {
        state.activeServices.delete(service);
      } else {
        state.activeServices.add(service);
      }
      handleFilterChange();
    });

    matchControl.addEventListener('click', function (event) {
      const button = event.target.closest('[data-match-mode]');
      if (!button) return;
      state.matchMode = button.getAttribute('data-match-mode');
      handleFilterChange();
    });

    clearFiltersButton.addEventListener('click', clearFilters);

    grid.addEventListener('click', function (event) {
      const closeButton = event.target.closest('[data-close-project]');
      const navigationButton = event.target.closest('[data-case-direction]');
      const openButton = event.target.closest('[data-open-project]');
      const cardFace = event.target.closest('.portfolio-card-face');

      if (closeButton) {
        event.preventDefault();
        event.stopPropagation();
        closeProject();
        return;
      }

      if (navigationButton) {
        event.preventDefault();
        event.stopPropagation();
        const direction = navigationButton.getAttribute('data-case-direction');
        navigateCase(direction);
        return;
      }

      if (openButton || cardFace) {
        // Prevent re-opening or toggling when clicking inside an already-opened case study
        if (event.target.closest('.portfolio-case-shell') && !openButton) {
          return;
        }
        const card = event.target.closest('.portfolio-card');
        const id = openButton ? openButton.getAttribute('data-open-project') : (card ? card.getAttribute('data-project-id') : null);
        if (id) {
          if (state.openId === id) closeProject();
          else openProject(id, { focus: true, scroll: true });
        }
      }
    });

    if (mapMarkers) {
      mapMarkers.addEventListener('click', function (event) {
        const countryMarker = event.target.closest('[data-map-country]');
        const projectMarker = event.target.closest('[data-map-project]');
        if (countryMarker) openCountry(countryMarker.getAttribute('data-map-country'));
        if (projectMarker) renderMapPreview(projectMarker.getAttribute('data-map-project'));
      });

      mapMarkers.addEventListener('keydown', function (event) {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        const marker = event.target.closest('[data-map-country], [data-map-project]');
        if (!marker) return;
        event.preventDefault();
        const countryCode = marker.getAttribute('data-map-country');
        const projectId = marker.getAttribute('data-map-project');
        if (countryCode) openCountry(countryCode);
        if (projectId) renderMapPreview(projectId);
      });
    }

    if (mapBack) {
      mapBack.addEventListener('click', returnToWorld);
    }

    if (mapPreview) {
      mapPreview.addEventListener('click', function (event) {
        const button = event.target.closest('[data-map-view-case]');
        if (!button) return;
        openProject(button.getAttribute('data-map-view-case'), { focus: true, scroll: true });
      });
    }

    if (mapShortcut) {
      mapShortcut.addEventListener('click', function (event) {
        event.preventDefault();
        smoothScrollToElement(document.getElementById('project-map'));
      });
    }

    window.addEventListener('popstate', applyHashState);
    window.addEventListener('hashchange', applyHashState);

    document.addEventListener('cambm:localechange', function () {
      if (!state.registry) return;
      updateFilterControls();
      renderProjects(false);
      renderMapForLocale();
    });
  }

  function bindMapShortcutVisibility() {
    const mapSection = document.getElementById('project-map');
    if (!mapShortcut || !mapSection || !('IntersectionObserver' in window)) return;

    const setMapShortcutHidden = function (hidden) {
      mapShortcut.classList.toggle('is-map-visible', hidden);
      mapShortcut.setAttribute('aria-hidden', hidden ? 'true' : 'false');
      mapShortcut.tabIndex = hidden ? -1 : 0;
    };

    const observer = new IntersectionObserver(function (entries) {
      setMapShortcutHidden(entries[0].isIntersecting);
    }, { rootMargin: '-12% 0px -12% 0px', threshold: 0.08 });

    observer.observe(mapSection);
  }

  function initialize(registry) {
    state.registry = validateRegistry(registry);
    state.projects = state.registry.projects;
    bindEvents();
    bindMapShortcutVisibility();
    updateFilterControls();
    renderProjects(false);

    if (mapMarkers && mapStatus) {
      renderWorldMarkers();
      mapStatus.textContent = translate('portfolio.map.worldStatus');
    }

    requestAnimationFrame(applyHashState);
  }

  try {
    if (!window.CAMBM_PORTFOLIO) {
      throw new Error('Portfolio registry script did not load.');
    }
    initialize(window.CAMBM_PORTFOLIO);
  } catch (error) {
    console.error('Portfolio unavailable:', error);
    grid.setAttribute('aria-busy', 'false');
    grid.hidden = true;
    emptyState.hidden = true;
    unavailableState.hidden = false;
    resultCount.textContent = translate('portfolio.resultsUnavailable');
  }
})();
