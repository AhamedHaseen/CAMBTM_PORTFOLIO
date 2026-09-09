(function () {
  'use strict';

  const STORAGE_KEY = 'cambridge-theme';
  const root = document.documentElement;

  function normalizeTheme(value) {
    return value === 'light' ? 'light' : 'dark';
  }

  function getSavedTheme() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      return null;
    }
  }

  function updateControls() {
    const currentTheme = root.dataset.theme || root.getAttribute('data-theme') || 'dark';
    const isLight = currentTheme === 'light';
    document.querySelectorAll('.theme-toggle').forEach(function (toggle) {
      const label = isLight ? toggle.dataset.labelDark : toggle.dataset.labelLight;
      toggle.setAttribute('aria-pressed', isLight ? 'true' : 'false');
      toggle.setAttribute('aria-label', label || (isLight ? 'Switch to dark theme' : 'Switch to light theme'));
    });
  }

  function syncCalTheme(theme) {
    try {
      const calNamespace = window.Cal && window.Cal.ns && window.Cal.ns['strategy-call'];
      if (!calNamespace) return;
      calNamespace('ui', {
        theme: theme,
        styles: { branding: { brandColor: '#ff5a00' } },
        hideEventTypeDetails: false,
        layout: 'month_view'
      });
    } catch (error) {
    }
  }

  function applyTheme(value, persist) {
    const theme = normalizeTheme(value);
    root.dataset.theme = theme;
    root.setAttribute('data-theme', theme);
    root.style.colorScheme = theme;
    updateControls();
    syncCalTheme(theme);

    if (persist) {
      try {
        localStorage.setItem(STORAGE_KEY, theme);
      } catch (error) {
      }
    }

    document.dispatchEvent(new CustomEvent('cambm:themechange', {
      detail: { theme: theme }
    }));
  }

  let lastToggleTime = 0;
  function toggleTheme() {
    const now = Date.now();
    if (now - lastToggleTime < 250) return;
    lastToggleTime = now;
    const current = root.dataset.theme || root.getAttribute('data-theme') || 'dark';
    const nextTheme = current === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme, true);
  }

  // Initial theme application: check localStorage -> HTML data-theme -> default dark
  const initialTheme = getSavedTheme() || root.getAttribute('data-theme') || 'dark';
  applyTheme(initialTheme, false);

  // Global capture-phase event delegation for instant click response on all pages & routes
  document.addEventListener('click', function (event) {
    const toggle = event.target && event.target.closest && event.target.closest('.theme-toggle');
    if (toggle) {
      event.preventDefault();
      event.stopPropagation();
      toggleTheme();
    }
  }, true);

  document.addEventListener('keydown', function (event) {
    if (event.key !== 'Enter' && event.key !== ' ' && event.key !== 'Spacebar') return;
    const toggle = event.target && event.target.closest && event.target.closest('.theme-toggle');
    if (toggle) {
      event.preventDefault();
      event.stopPropagation();
      toggleTheme();
    }
  }, true);

  // Observe React route/DOM updates to keep toggle attributes synchronized
  if (typeof MutationObserver !== 'undefined') {
    const observer = new MutationObserver(function () {
      updateControls();
    });
    if (document.body) {
      observer.observe(document.body, { childList: true, subtree: true });
    } else {
      document.addEventListener('DOMContentLoaded', function () {
        if (document.body) observer.observe(document.body, { childList: true, subtree: true });
      }, { once: true });
    }
  }

  document.addEventListener('cambm:localechange', updateControls);
  window.addEventListener('storage', function (event) {
    if (event.key === STORAGE_KEY) applyTheme(event.newValue || 'dark', false);
  });

  window.toggleTheme = toggleTheme;
  window.CAMBMTheme = {
    apply: function (theme) { applyTheme(theme, true); },
    toggle: toggleTheme,
    current: function () { return root.dataset.theme || root.getAttribute('data-theme') || 'dark'; },
    initControls: updateControls
  };
})();
