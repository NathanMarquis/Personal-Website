/* nathan.andmar.dev — site.js
   Self-hosted Bootstrap 5.3.3 is loaded separately; this file only does:
   1) current-year in the footer, 2) scroll-reveal transitions via IntersectionObserver.
   No analytics, no third parties, no network calls. */

(function () {
  'use strict';

  // --- footer year (keeps the static page current without a build step) ---
  var y = document.getElementById('year');
  if (y) y.textContent = String(new Date().getFullYear());

  // --- theme toggle: dark default, light persisted in localStorage ---
  var THEME_KEY = 'site-theme';
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-bs-theme', theme);
    var btn = document.getElementById('themeToggle');
    if (btn) {
      var moon = btn.querySelector('.icon-moon');
      var sun = btn.querySelector('.icon-sun');
      if (moon && sun) {
        moon.classList.toggle('d-none', theme === 'light');
        sun.classList.toggle('d-none', theme !== 'light');
      }
    }
  }

  var saved = null;
  try { saved = localStorage.getItem(THEME_KEY); } catch (e) { /* private mode */ }
  applyTheme(saved === 'light' ? 'light' : 'dark');

  var toggle = document.getElementById('themeToggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var next = document.documentElement.getAttribute('data-bs-theme') === 'light' ? 'dark' : 'light';
      applyTheme(next);
      try { localStorage.setItem(THEME_KEY, next); } catch (e) { /* ignore */ }
    });
  }

  // --- scroll-reveal: elements with [data-reveal] fade/slide in on first view ---
  var reveals = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));

  if ('IntersectionObserver' in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          io.unobserve(entry.target); // reveal once, stay put
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    reveals.forEach(function (el, i) {
      // gentle stagger for elements entering the same viewport batch
      el.style.transitionDelay = ((i % 4) * 70) + 'ms';
      io.observe(el);
    });
  } else {
    // no IO support: show everything immediately
    reveals.forEach(function (el) { el.classList.add('revealed'); });
  }

  // --- copy-to-clipboard buttons (data-copy="value") ---
  Array.prototype.forEach.call(document.querySelectorAll('[data-copy]'), function (btn) {
    btn.addEventListener('click', function () {
      var value = btn.getAttribute('data-copy');
      var label = btn.querySelector('.copy-label');
      var done = function () {
        if (!label) return;
        var original = label.textContent;
        label.textContent = 'Copied!';
        setTimeout(function () { label.textContent = original; }, 1600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(value).then(done, function () { /* blocked: do nothing */ });
      }
    });
  });

  // --- respect reduced-motion: reveal instantly, no transitions ---
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.classList.add('reduced-motion');
    reveals.forEach(function (el) { el.classList.add('revealed'); });
  }
})();
