(function () {
  'use strict';

  const STORAGE_KEY = 'cambridge-theme';
  const root = document.documentElement;

  function normalizeTheme(value) {
    return value === 'dark' ? 'dark' : 'light';
  }

  function getSavedTheme() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      return null;
    }
  }

  function updateControls() {
    const isLight = root.dataset.theme === 'light';
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
        styles: { branding: { brandColor: '#e3752f' } },
        hideEventTypeDetails: false,
        layout: 'month_view'
      });
    } catch (error) {
    }
  }

  function applyTheme(value, persist) {
    const theme = normalizeTheme(value);
    root.dataset.theme = theme;
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

  applyTheme(getSavedTheme() || 'light', false);

  function initializeThemeControls() {
    document.querySelectorAll('.theme-toggle').forEach(function (toggle) {
      function toggleTheme() {
        applyTheme(root.dataset.theme === 'light' ? 'dark' : 'light', true);
      }

      toggle.addEventListener('click', toggleTheme);
      toggle.addEventListener('keydown', function (event) {
        if (event.key !== 'Enter' && event.key !== ' ' && event.key !== 'Spacebar') return;
        event.preventDefault();
        toggleTheme();
      });
    });
    updateControls();
  }

  document.addEventListener('cambm:localechange', updateControls);
  window.addEventListener('storage', function (event) {
    if (event.key === STORAGE_KEY) applyTheme(event.newValue || 'light', false);
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeThemeControls, { once: true });
  } else {
    initializeThemeControls();
  }

  window.CAMBMTheme = {
    apply: function (theme) { applyTheme(theme, true); },
    current: function () { return root.dataset.theme; }
  };
})();
