/* nathan.andmar.dev: site.js
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
          setTimeout(function () { entry.target.style.transitionDelay = ''; }, 1000);   // the stagger shouldn't delay hover effects
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

  // --- helicopter: hovers above the cursor; clip it and it loses control ---
  // Home page only. Skipped for touch devices (no cursor) and reduced-motion users.
  var motionOk = !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var hasMouse = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var heliApi = null;                   // set by initHelicopter: lets a page change hand the flight over
  if (motionOk && hasMouse && document.body.getAttribute('data-page') === 'home') initHelicopter();

  // A grey UH-1 Huey, side view with the nose to the right, plus top and nose-on views for the
  // yaw turns and the fall. Rotor/tail-rotor flicker is pure CSS (styles.css).
  function createHeliEl() {
    var el = document.createElement('div');
    el.className = 'heli';
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML =
      '<svg viewBox="0 0 80 40" xmlns="http://www.w3.org/2000/svg">' +
        '<g class="heli-upper">' +                                 // tall mast, two-blade rotor, Bell stabilizer bar
          '<line class="heli-mast" x1="40" y1="12.4" x2="40" y2="18"/>' +
          '<ellipse class="heli-dark" cx="40" cy="16.2" rx="2.2" ry="0.8"/>' +
          '<ellipse class="heli-rotor" cx="40" cy="12.4" rx="35" ry="1.2"/>' +
          '<line class="heli-line thin" x1="33.5" y1="13.6" x2="46.5" y2="13.6"/>' +
          '<ellipse class="heli-dark" cx="33.5" cy="13.6" rx="2.2" ry="0.8"/>' +
          '<ellipse class="heli-dark" cx="46.5" cy="13.6" rx="2.2" ry="0.8"/>' +
        '</g>' +
        '<g class="heli-top">' +                                   // from above, mid-fall
          '<line class="heli-line" x1="35" y1="15.7" x2="53" y2="15.7"/>' +
          '<line class="heli-line" x1="35" y1="28.3" x2="53" y2="28.3"/>' +
          '<line class="heli-line" x1="37.5" y1="15.7" x2="37.5" y2="28.3"/>' +
          '<line class="heli-line" x1="47.1" y1="15.7" x2="47.1" y2="28.3"/>' +
          '<polygon class="heli-dark" points="27.4,20.6 -1.5,21.4 -1.5,22.6 27.4,23.4"/>' +
          '<polygon class="heli-dark" points="12,15 16,15 16,29 12,29"/>' +
          '<path class="heli-body" d="M27.4 16 L47 16 Q55 16.4 58.9 20 Q60.2 22 58.9 24 Q55 27.6 47 28 L27.4 28 Q25 25.6 24 23.4 L24 20.6 Q25 18.4 27.4 16 Z"/>' +
          '<rect class="heli-dark" x="28" y="18.4" width="14" height="7.2" rx="2"/>' +
          '<path class="heli-glass" d="M49.8 18.6 Q55 20 57.8 22 Q55 24 49.8 25.4 Z"/>' +
          '<circle class="heli-disc" cx="40" cy="22" r="35"/>' +
          '<g class="heli-blades"><line class="heli-blade" x1="5" y1="22" x2="75" y2="22"/></g>' +
          '<circle class="heli-hub" cx="40" cy="22" r="2.4"/>' +
        '</g>' +
        '<g class="heli-front">' +                                 // nose-on, mid-turn
          '<path class="heli-line" d="M32.4 32.4 Q40 27.6 47.6 32.4"/>' +
          '<rect class="heli-line-fill" x="29.6" y="31.8" width="4.8" height="1.6" rx="0.8"/>' +
          '<rect class="heli-line-fill" x="45.6" y="31.8" width="4.8" height="1.6" rx="0.8"/>' +
          '<path class="heli-dark" d="M35 19 Q35 15.6 37.6 15.6 L42.4 15.6 Q45 15.6 45 19 Z"/>' +
          '<path class="heli-body" d="M31.8 22.6 Q31.8 19 36 18.6 L44 18.6 Q48.2 19 48.2 22.6 L48.8 28.2 Q48.8 30.6 46.6 30.6 L33.4 30.6 Q31.2 30.6 31.2 28.2 Z"/>' +
          '<path class="heli-glass" d="M33.4 20.6 L46.6 20.6 L47.2 26.4 L32.8 26.4 Z"/>' +
          '<path class="heli-glass" d="M34.4 27 L45.6 27 L46 29.2 L34 29.2 Z"/>' +
          '<line class="heli-door" x1="40" y1="20.6" x2="40" y2="26.4"/>' +
          '<line class="heli-hi" x1="34.4" y1="19.4" x2="45.6" y2="19.4"/>' +
          '<rect class="heli-shade" x="31.4" y="22" width="1.4" height="7" rx="0.6"/>' +
          '<rect class="heli-shade" x="47.2" y="22" width="1.4" height="7" rx="0.6"/>' +
          '<circle class="heli-light" cx="40" cy="29.9" r="0.7"/>' +
        '</g>' +
        '<g class="heli-side">' +
          '<circle class="heli-tdisc" cx="-3.4" cy="14.9" r="6.3"/>' +
          '<g class="heli-tblades"><line class="heli-blade" x1="-9.7" y1="14.9" x2="2.9" y2="14.9"/></g>' +
          '<polygon class="heli-dark" points="-1.6,23.2 -5.6,24.6 -1.4,24.2"/>' +
          '<path class="heli-body" d="M31.6 29.7 L56.8 30 Q58.8 30 58.9 27.4 Q58.9 25 54.2 24.2 L49.2 20.4 L28.5 20.3 L27.4 22.7 L4.8 21.7 L-1.8 22.2 L-1.6 23.4 Q14 26.6 31.6 29.7 Z"/>' +
          '<polygon class="heli-body" points="4.8,21.7 -2,14.6 -5.4,14.9 -1.6,23.4"/>' +
          '<circle class="heli-dark" cx="-3.4" cy="14.9" r="0.9"/>' +
          '<path class="heli-shade" d="M31.8 28.7 L58.7 28.7 Q58.8 29.9 56.8 30 L31.6 29.7 Z"/>' +
          '<line class="heli-hi" x1="30" y1="21.1" x2="48.6" y2="21.1"/>' +
          '<path class="heli-dark" d="M42.4 20.4 L40.5 18.3 Q39.9 17.9 38.4 17.9 L31.2 17.9 Q29.2 18.2 28.5 20.4 Z"/>' +
          '<rect class="heli-vent" x="31.5" y="18.7" width="3.4" height="1.2" rx="0.3"/>' +
          '<line class="heli-door" x1="51.4" y1="20.3" x2="51" y2="18.7"/>' +
          '<path class="heli-spade" transform="translate(36.6 25.2)" d="M0 -2.1 C0.5 -1.3 1.9 -0.5 1.9 0.6 C1.9 1.35 1.4 1.75 0.85 1.75 C0.55 1.75 0.25 1.6 0 1.3 C0.1 1.95 0.3 2.25 0.85 2.5 L-0.85 2.5 C-0.3 2.25 -0.1 1.95 0 1.3 C-0.25 1.6 -0.55 1.75 -0.85 1.75 C-1.4 1.75 -1.9 1.35 -1.9 0.6 C-1.9 -0.5 -0.5 -1.3 0 -2.1 Z"/>' +   // squadron spade
          '<rect class="heli-door" x="41" y="21.8" width="6.9" height="6.9" rx="0.7"/>' +
          '<rect class="heli-glass" x="41.9" y="22.9" width="5.2" height="3.7" rx="0.5"/>' +
          '<polygon class="heli-door" points="49.6,21.4 52.6,21.4 54.6,28 49.6,28"/>' +
          '<polygon class="heli-glass" points="52.1,22.5 49.8,22.5 49.8,26.5 53.7,26.5"/>' +
          '<line class="heli-door" x1="49.2" y1="20.4" x2="54.2" y2="24.2"/>' +
          '<path class="heli-door" d="M54.6 27.1 L58.9 27.1"/>' +
          '<circle class="heli-beam" cx="58.4" cy="28.4" r="1.8" fill="#ffd9a0" opacity="0.35"/>' +
          '<circle class="heli-light" cx="58.4" cy="28.4" r="0.7"/>' +
          '<path class="heli-line" d="M35.3 32.6 L50.5 32.6 Q52.4 32.4 52.8 30.8"/>' +
          '<line class="heli-line" x1="47.1" y1="30" x2="47.3" y2="32.6"/>' +
          '<line class="heli-line" x1="37.5" y1="30.2" x2="37.7" y2="32.6"/>' +
        '</g>' +
      '</svg>';
    document.body.appendChild(el);
    return el;
  }

  function initHelicopter() {
    var el = createHeliEl();

    // Warm light cone on the page itself. A sibling layer (not part of the sprite) so it can blend
    // with the page underneath; styles.css only shows it in dark mode.
    var tip = document.createElement('div');
    tip.className = 'heli-tip';
    tip.setAttribute('aria-hidden', 'true');
    tip.textContent = 'Hover over me to make me follow you again.';
    document.body.appendChild(tip);

    // Intro hint: a faint short line with a cursor darting back and forth along it, saying how to shoo the heli.
    // Shown on every home page load, once the heli is visible; fades out by itself.
    var hint = document.createElement('div');
    hint.className = 'heli-hint';
    hint.setAttribute('aria-hidden', 'true');
    hint.innerHTML =
      '<svg viewBox="0 0 120 24" xmlns="http://www.w3.org/2000/svg">' +
        '<line class="heli-hint-line" x1="8" y1="12" x2="108" y2="12"/>' +
        '<path class="heli-hint-cursor" d="M0 0 L0 15 L4 11.5 L7 18 L9.5 17 L6.6 10.5 L12 10.5 Z"/>' +
      '</svg>' +
      '<p>Shake your mouse back and forth and the helicopter will stop bothering you.</p>';
    document.body.appendChild(hint);

    var lamp = document.createElement('div');
    lamp.className = 'heli-lamp';
    lamp.setAttribute('aria-hidden', 'true');
    document.body.appendChild(lamp);
    var side = el.querySelector('.heli-side');
    var front = el.querySelector('.heli-front');
    var top = el.querySelector('.heli-top');
    var upper = el.querySelector('.heli-upper');

    var OFF_X = 80, OFF_Y = -100;         // hover point: 80px to one side of the cursor, 100px above it
    var EXPLORE_SPEED = 130;              // px/s cruising speed while wandering the page
    var MAX_SPEED = 450;                  // px/s cap while flying under its own power
    var HELI_LEN = 64;                    // px, roughly nose to tail: it never comes closer than this to a window edge
    var FACE_FAST = 170;                  // px/s needed before it yaws around; slower moves it just backs/sidesteps
    var s = { x: 0, y: 0, vx: 0, vy: 0, rot: 0, spin: 0, theta: 0, want: 0,
              mx: -9999, my: -9999, mvx: 0, mvy: 0, mode: 'perch', until: 0, grace: 0, phase: 0,
              seen: true, hasMouse: false, intro: true, introAt: 0, inside: false, hold: 0, land: 0, fleeAt: 0, hintAt: 0, tipOn: false, tipUntil: 0, spot: null, side: -1, tuck: false,
              over: 0, validFor: 0, probeT: 0, probeX: -1, probeY: -1, wp: null, xStart: 0, ramp: -10, ax: 0, ay: 0, pvx: 0, tax: 0,
              top: 0, yaw: 0, aim: 40, beam: 0, cStart: 0, cDur: 1 };   // fall views: top = 0..1 how far it is looking down on it, yaw = extra turn (rad) to show the far side
    // side: -1 = hover northwest of the cursor, +1 = northeast; tuck: cursor is under it, so it holds still
    var HOVER_ABOVE = 70;                 // px above its landing spot where it hovers before landing / after lifting off
    var SHAKE_STROKE = 80, SHAKE_NEED = 4, SHAKE_WINDOW = 1.6;   // shaking the mouse: 4 reversals of 80px+ strokes in 1.6s
    var shakeX = { init: false, dir: 0, ext: 0, hits: [] }, shakeY = { init: false, dir: 0, ext: 0, hits: [] };
    var last = 0;

    function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
    function capSpeed(limit) {            // limit total speed, keeping direction
      var max = limit || MAX_SPEED;
      var sp = Math.sqrt(s.vx * s.vx + s.vy * s.vy);
      if (sp > max) { s.vx *= max / sp; s.vy *= max / sp; }
    }
    // Fly toward (tx, ty) like a helicopter: pick a speed that shrinks as the target gets close (so it
    // brakes early instead of overshooting), accelerate toward it at a limited rate, and ease the
    // acceleration in and out. A change of direction therefore decelerates, then spools back up.
    function steerTo(tx, ty, dt, vmax, amax) {
      var ex = tx - s.x, ey = ty - s.y, dist = Math.sqrt(ex * ex + ey * ey);
      var vwant = Math.min(vmax, 4 * dist, Math.sqrt(2 * amax * 0.8 * dist));
      var ax = ((dist > 0 ? ex / dist : 0) * vwant - s.vx) * 3;
      var ay = ((dist > 0 ? ey / dist : 0) * vwant - s.vy) * 3;
      var am = Math.sqrt(ax * ax + ay * ay);
      if (am > amax) { ax *= amax / am; ay *= amax / am; }
      var blend = Math.min(1, dt * 6);
      s.ax += (ax - s.ax) * blend;
      s.ay += (ay - s.ay) * blend;
      s.vx += s.ax * dt;
      s.vy += s.ay * dt;
    }
    // Glide to a point without ever passing it: speed is limited to what lets it stop in the distance
    // left (with margin), so it slows steadily as it nears the point and creeps in. Returns the distance
    // it started this frame at.
    function glideTo(tx, ty, dt, vmax, a) {
      var ex = tx - s.x, ey = ty - s.y, dist = Math.sqrt(ex * ex + ey * ey);
      var vstop = Math.sqrt(2 * a * dist);
      var vs = Math.min(vmax, vstop);
      var ux = dist > 0 ? ex / dist : 0, uy = dist > 0 ? ey / dist : 0;
      var ax = (ux * vs - s.vx) * 5, ay = (uy * vs - s.vy) * 5;
      var am = Math.sqrt(ax * ax + ay * ay), cap = a * 1.6;
      if (am > cap) { ax *= cap / am; ay *= cap / am; }
      s.vx += ax * dt;
      s.vy += ay * dt;
      var sp = Math.sqrt(s.vx * s.vx + s.vy * s.vy);
      if (sp > vstop) {                   // too fast to stop in time: brake harder (but not instantly)
        var ns = Math.max(vstop, sp - 700 * dt);
        s.vx *= ns / sp; s.vy *= ns / sp;
      }
      return dist;
    }
    // Counts how many times the cursor has doubled back on one axis, each a stroke of SHAKE_STROKE px
    // or more, within the last SHAKE_WINDOW seconds.
    function trackShake(tr, v, t) {
      if (!tr.init) { tr.init = true; tr.ext = v; return 0; }
      if (tr.dir === 0) {
        if (Math.abs(v - tr.ext) > 20) { tr.dir = Math.sign(v - tr.ext); tr.ext = v; }
        return 0;
      }
      if ((v - tr.ext) * tr.dir > 0) tr.ext = v;                        // still going the same way
      else if (Math.abs(v - tr.ext) > SHAKE_STROKE) {                  // came back far enough: a reversal
        tr.hits.push(t); tr.dir = -tr.dir; tr.ext = v;
      }
      while (tr.hits.length && t - tr.hits[0] > SHAKE_WINDOW) tr.hits.shift();
      return tr.hits.length;
    }
    // Keep the heli one length away from every window edge. Moving toward an edge it may only go as
    // fast as it can still stop in the room left (a bit harder braking than normal flight uses, so
    // this only ever kicks in if something unexpected pushes it that way).
    function wallGovern() {
      var W = window.innerWidth, H = window.innerHeight, A = 650;
      function room(d) { return Math.sqrt(2 * A * Math.max(0, d)); }
      s.vx = s.vx < 0 ? Math.max(s.vx, -room(s.x - HELI_LEN)) : Math.min(s.vx, room(W - HELI_LEN - s.x));
      s.vy = s.vy < 0 ? Math.max(s.vy, -room(s.y - HELI_LEN)) : Math.min(s.vy, room(H - HELI_LEN - s.y));
    }
    // Pitch like a real helicopter: nose into the direction of travel while cruising, a touch more when
    // it's pushing to speed up, and a backward flare when braking. The flare grows with how hard it's
    // braking AND how fast it's going, so a quick stop from top speed rocks it way back and a slow
    // one barely tips it.
    function pitchTarget() {
      var v = Math.abs(s.vx);
      var lean = clamp(s.vx * 0.02, -9, 9);
      var push = clamp(s.tax * 0.015, -5, 5);
      var along = v > 12 ? s.tax * s.vx / v : 0;          // acceleration along the direction of travel
      var flare = along < 0 ? Math.sign(s.vx) * along * Math.pow(Math.min(1, v / MAX_SPEED), 1.5) * 0.22 : 0;
      return clamp(lean + push + flare, -28, 28);
    }
    function wrap180(d) { return ((d + 180) % 360 + 360) % 360 - 180; }

    document.addEventListener('pointermove', function (e) {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      if (s.hasMouse) {                   // smoothed cursor velocity (px/s), used to aim a crash
        var mdt = Math.max(0.008, (e.timeStamp - s.mt) / 1000);
        s.mvx = s.mvx * 0.6 + ((e.clientX - s.mx) / mdt) * 0.4;
        s.mvy = s.mvy * 0.6 + ((e.clientY - s.my) / mdt) * 0.4;
      }
      s.hasMouse = true;
      s.mt = e.timeStamp;
      s.mx = e.clientX; s.my = e.clientY;
      if (s.intro && !s.introAt) s.introAt = e.timeStamp / 1000 + 0.6;   // first mouse move: rotors spool up, then it lifts off

      // mouse shaken back and forth, anywhere on the page: it's had enough and goes home
      var nt = e.timeStamp / 1000;
      var shakes = Math.max(trackShake(shakeX, e.clientX, nt), trackShake(shakeY, e.clientY, nt));
      if (shakes >= SHAKE_NEED && (s.mode === 'fly' || s.mode === 'explore' || s.mode === 'crash')) {
        shakeX.hits = []; shakeY.hits = [];
        flee(nt);
      }
    });

    // where it can land: on the "open to opportunities" pill, else on the header's bottom edge
    // skid bottoms sit 13.4px below the sprite center, so the spot is 13.5px above the surface
    function pillSpot() {
      var pill = document.querySelector('.status-line');
      if (!pill) return null;
      var r = pill.getBoundingClientRect();
      var shown = !pill.hasAttribute('data-reveal') || pill.classList.contains('revealed');
      return { x: r.left + r.width / 2, y: r.top - 13.5, vis: shown && r.top > 91 && r.bottom < window.innerHeight };
    }
    function ledgeSpot() {
      var hdr = document.querySelector('.site-header'), brand = document.querySelector('.navbar-brand');
      if (!hdr || !brand) return { x: 80, y: 80, vis: true };
      return { x: brand.getBoundingClientRect().right + 70, y: hdr.getBoundingClientRect().bottom - 13.5, vis: true };
    }

    // is the cursor on something the heli would be in the way of? 2 = header bar, 1 = a box with text in it
    // (the whole box, padding included) or actual text, 0 = clear
    var BOXES = '.card-surface, .plate, .cta-banner, .timeline-item, .accordion, .channels, .btn, .tag, .chip';
    var probeRange = document.createRange();
    function overText(x, y) {
      var e = document.elementFromPoint(x, y);   // the heli has pointer-events: none, so it never answers
      if (!e) return 0;
      if (e.closest('.site-header')) return 2;
      if (e.closest(BOXES)) return 1;
      for (var n = e.firstChild; n; n = n.nextSibling) {
        if (n.nodeType !== 3 || !n.nodeValue.trim()) continue;
        probeRange.selectNodeContents(n);
        var rects = probeRange.getClientRects();
        for (var i = 0; i < rects.length; i++) {
          var r = rects[i];
          if (x >= r.left - 4 && x <= r.right + 4 && y >= r.top - 3 && y <= r.bottom + 3) return 1;
        }
      }
      return 0;
    }

    // somewhere in the lower part of the page, below and away from the cursor
    function pickWaypoint() {
      var W = window.innerWidth, H = window.innerHeight;
      var hi = H - HELI_LEN, lo = Math.min(Math.max(s.my + 140, H * 0.5), hi - 30);
      var sp = Math.sqrt(s.vx * s.vx + s.vy * s.vy);
      for (var i = 0; i < 14; i++) {
        var x = HELI_LEN + Math.random() * Math.max(1, W - 2 * HELI_LEN), y = lo + Math.random() * (hi - lo);
        var dx = x - s.mx, dy = y - s.my;
        var ex = x - s.x, ey = y - s.y, el2 = Math.sqrt(ex * ex + ey * ey);
        if (dx * dx + dy * dy < 160 * 160 || el2 < 200) continue;
        // prefer somewhere roughly ahead, so it sweeps around in wide curves instead of turning on the spot
        if (sp > 40 && i < 10 && (ex * s.vx + ey * s.vy) / (el2 * sp) < 0.3) continue;
        return { x: x, y: y };
      }
      return { x: W - clamp(s.mx, HELI_LEN, W - HELI_LEN), y: hi };
    }

    // somewhere low on the page on the far side of the heli from the cursor
    function awayWaypoint() {
      var W = window.innerWidth, H = window.innerHeight;
      var hi = H - HELI_LEN, lo = Math.min(Math.max(s.my + 140, H * 0.5), hi - 30);
      var dx = s.x - s.mx, dy = s.y - s.my, d = Math.sqrt(dx * dx + dy * dy);
      var ux = d > 20 ? dx / d : (s.x < W / 2 ? -1 : 1), uy = d > 20 ? dy / d : 0;
      return { x: clamp(s.x + ux * 400, HELI_LEN, W - HELI_LEN), y: clamp(s.y + uy * 300, lo, hi) };
    }

    function crash(t) {
      s.mode = 'crash';
      s.tuck = false;
      s.until = t + 1.1 + Math.random() * 0.4;
      s.cStart = t;
      s.cDur = s.until - t;
      // knocked along the cursor's motion, or away from it if it's barely moving
      var dir = Math.abs(s.mvx) > 60 ? Math.sign(s.mvx) : (s.x < s.mx ? -1 : 1);
      s.vx = dir * (160 + Math.random() * 100) + clamp(s.mvx * 0.4, -450, 450);
      s.vy = -70 + clamp(s.mvy * 0.25, -150, 250);                             // little pop, then down
      s.spin = dir * (220 + Math.random() * 140);                              // deg/s, gentle in-plane turn the way it's hit
      s.phase = Math.random() * 6.28;
    }

    // had enough: pull out of whatever it was doing and go sit on the pill
    function flee(t) {
      s.mode = 'flee';
      s.fleeAt = t;
      s.land = 0;                         // 0: fly to the hover point above the pill, 1: lower onto it
      s.hold = 0;
      s.tuck = false;
      s.rot = wrap180(s.rot);
      s.spot = pillSpot() ? pillSpot : ledgeSpot;   // always the pill; if it's off screen the heli leaves upward and waits there
    }
    // back to following the cursor (it was hovered over, or the user invited it back)
    function resume(t) {
      s.mode = 'fly';
      s.tuck = false;
      s.hold = 0;
      s.ramp = t;                         // spool up gradually
      s.grace = t + 1.5;
      s.tipOn = false;
      tip.classList.remove('show');
      el.classList.remove('perched');
      el.style.visibility = '';
      el.classList.add('on');
    }

    function frame(ms) {
      var t = ms / 1000;
      var dt = Math.min(0.05, t - last);
      last = t;
      if (s.seen && dt > 0) {
        if (ms - s.mt > 80) {             // cursor stopped sending events: let its speed die down
          var dec = Math.max(0, 1 - dt * 8);
          s.mvx *= dec; s.mvy *= dec;
        }
        var hx = (s.mx - s.x) / 33, hy = (s.my - s.y) / 14;
        var inside = hx * hx + hy * hy < 1;

        // cursor swiped onto the heli: it loses control
        if ((s.mode === 'fly' || s.mode === 'explore') && inside && !s.inside && t > s.grace) crash(t);

        if (s.mode === 'fly' || s.mode === 'explore') {
          // check under the cursor whenever it moves (and now and then, for page scrolls)
          if (s.mx !== s.probeX || s.my !== s.probeY || t - s.probeT > 0.1) {
            s.probeT = t; s.probeX = s.mx; s.probeY = s.my;
            s.over = overText(s.mx, s.my);
          }
          if (s.over) s.validFor = 0; else s.validFor += dt;
          if (s.mode === 'fly' && s.over) {   // no delay: the moment it's on text or the header, stop chasing
            s.mode = 'explore';
            s.tuck = false;
            s.wp = awayWaypoint();            // wander off the opposite way, starting at once
            s.xStart = t - 0.7;
          } else if (s.mode === 'explore' && s.validFor > 0) {   // cursor's off the text: back to following it right away
            s.mode = 'fly';
            s.ramp = t - 3;                   // no spool-up: its own inertia keeps the return gentle
          }
        }

        if (s.mode !== 'fly') { s.ax = 0; s.ay = 0; }
        if (s.mode === 'fly') {
          // it hovers on whichever side of the cursor it arrived from
          if (s.x < s.mx - 80) s.side = -1; else if (s.x > s.mx + 80) s.side = 1;

          // the zone under it is free space: while the cursor is in there the heli stays put
          // (just creeping toward centered over it) and only chases once the cursor leaves
          var ux = s.mx - s.x, uy = s.my - s.y;
          if (!s.tuck) {
            if (Math.abs(ux) < 70 && uy > 35 && uy < 170) s.tuck = true;
          } else if (Math.abs(ux) > 100 || uy < 20 || uy > 210) {
            s.tuck = false;
          }

          if (s.tuck) {
            s.ax = 0; s.ay = 0;
            var ease = Math.min(1, dt * 4);
            s.vx += (clamp(ux * 0.8, -35, 35) - s.vx) * ease;
            s.vy += (8 * Math.cos(t * 3.2) - s.vy) * ease;   // keep the idle bob
          } else {
            // head for the corner point; gentler right after leaving a no-go zone (rp: 0 -> 1 over 3s)
            var tx = clamp(s.mx + s.side * OFF_X, HELI_LEN, window.innerWidth - HELI_LEN);
            var ty = clamp(s.my + OFF_Y, HELI_LEN, window.innerHeight - HELI_LEN) + Math.sin(t * 3.2) * 2.5;
            var rp = clamp((t - s.ramp) / 3, 0, 1);
            steerTo(tx, ty, dt, 140 + (MAX_SPEED - 140) * rp, 90 + 230 * rp);
          }
          s.rot += (pitchTarget() - s.rot) * Math.min(1, dt * 8);
          // only yaw around when really moving; otherwise keep the nose where it is
          if (s.vx > FACE_FAST) s.want = 0; else if (s.vx < -FACE_FAST) s.want = Math.PI;
        } else if (s.mode === 'explore') {
          // Phase 1, coast: it was chasing at speed, so it keeps drifting while it eases to a near stop.
          // Phase 2, cruise: gentle, continuous sweeps between waypoints low on the page. It never parks:
          // it turns toward the next waypoint as it nears the current one, so the path is long and curved.
          var dvx = 0, dvy = 0, rate = 3, amax = 420;
          if (t - s.xStart > 0.7) {
            if (!s.wp) s.wp = pickWaypoint();
            var wdx = s.wp.x - s.x, wdy = s.wp.y + Math.sin(t * 1.7) * 10 - s.y;
            var wd = Math.sqrt(wdx * wdx + wdy * wdy);
            if (wd < 110) { s.wp = pickWaypoint(); wdx = s.wp.x - s.x; wdy = s.wp.y - s.y; wd = Math.sqrt(wdx * wdx + wdy * wdy); }
            var cruise = EXPLORE_SPEED * (0.8 + 0.2 * Math.sin(t * 0.9));
            if (wd > 0) { dvx = wdx / wd * cruise; dvy = wdy / wd * cruise; }
            rate = 1.4; amax = 150;
          }
          var ax = (dvx - s.vx) * rate, ay = (dvy - s.vy) * rate;
          var am = Math.sqrt(ax * ax + ay * ay);
          if (am > amax) { ax *= amax / am; ay *= amax / am; }
          s.vx += ax * dt;
          s.vy += ay * dt;
          s.rot += (pitchTarget() - s.rot) * Math.min(1, dt * 8);
          if (s.vx > 40) s.want = 0; else if (s.vx < -40) s.want = Math.PI;
        } else if (s.mode === 'crash') {
          // tumble: gravity with drag, gusty sway, spin that bleeds off, nose swings with the drift
          s.vy += (900 - 3 * s.vy) * dt;
          s.vx += (Math.sin(t * 8 + s.phase) * 600 - 1.2 * s.vx) * dt;
          s.rot += s.spin * dt;
          s.spin *= 1 - 0.6 * dt;
          if (t > s.until) {              // regain control: unwind the spin and climb back
            s.mode = 'fly';
            s.rot = wrap180(s.rot);
            s.grace = t + 1.0;
          }
        } else if (s.mode === 'flee') {
          // Head home. First to a hover point straight above the landing spot, slowing steadily so it
          // never passes it; then lower straight down onto the spot.
          var sp = s.spot();
          var hoverY = Math.max(sp.y - HOVER_ABOVE, 76);   // never up under the header bar
          var dHome = 1e9;
          if (!sp.vis) {
            // The pill isn't on screen (scrolled away). Fly straight up and off the top; from there it
            // counts as landed: it waits on the pill, unseen, and is already there when it scrolls back.
            s.land = 0;
            glideTo(s.x, -90, dt, MAX_SPEED, 220);
            s.rot += (pitchTarget() - s.rot) * Math.min(1, dt * 8);
            if (s.y < -50) {
              s.mode = 'perch';
              s.hold = 0; s.want = 0; s.vx = 0; s.vy = 0;
              s.tipOn = false;
              el.style.visibility = 'hidden';    // instant: no flash as it snaps over to the pill
              el.classList.remove('on');
              el.classList.add('perched');
            }
          } else if (s.land === 0) {
            dHome = glideTo(sp.x, hoverY, dt, MAX_SPEED, 220);
            if (dHome < 8) s.land = 1;     // close and slow: commit to the descent
          } else {
            // straight down: sideways speed is killed fast and it settles over the spot while the
            // sink rate shrinks with the height left
            dHome = sp.y - s.y;
            var sink = Math.min(70, Math.sqrt(120 * Math.max(0, dHome)));
            s.vy += (sink - s.vy) * Math.min(1, dt * 5);
            s.vx += ((sp.x - s.x) * 6 - s.vx) * Math.min(1, dt * 10);
          }
          if (sp.vis) s.rot += (pitchTarget() - s.rot) * Math.min(1, dt * 8);
          if (s.vx > 80) s.want = 0; else if (s.vx < -80) s.want = Math.PI;
          // cursor catches up with it on the way home: it changes its mind and chases again. A touch is
          // enough (it's moving, so nobody can rest on it), but not during the first moments, while the
          // shake that sent it home is still winding down.
          var fx = (s.mx - s.x) / 46, fy = (s.my - s.y) / 30;
          s.hold = (sp.vis && fx * fx + fy * fy < 1 && t - s.fleeAt > 0.8) ? s.hold + dt : 0;
          if (s.mode !== 'flee') {
            // went to wait off screen this frame
          } else if (s.hold >= 0.1) {
            resume(t);
          } else if (sp.vis && s.land === 1 && dHome < 1.5 && Math.abs(sp.x - s.x) < 3) {
            s.x = sp.x; s.y = sp.y; s.vx = 0; s.vy = 0;
            s.mode = 'perch';             // touchdown
            s.hold = 0;
            s.want = 0;
            s.tipOn = true;               // tell them how to bring it back
            s.tipUntil = t + 8;
            el.classList.add('perched');
          }
        } else if (s.mode === 'depart') { // leaving the page: nose right, spool up toward the right side and keep going
          s.want = 0;
          s.vx += (clamp((s.xTo - s.x) / 0.5, 520, 1000) - s.vx) * Math.min(1, dt * 4);   // never slows down on the way
          s.vy += (0 - s.vy) * Math.min(1, dt * 3);
          s.rot += (clamp(s.vx * 0.02, -9, 9) - s.rot) * Math.min(1, dt * 8);
        } else if (s.mode === 'perch') {  // perched: ride along with the pill, wait to be invited back
          var ps = s.spot();
          s.x = ps.x; s.y = ps.y; s.vx = 0; s.vy = 0;     // re-read the pill's spot every frame, so it rides along with scrolling
          s.rot += (0 - s.rot) * Math.min(1, dt * 8);
          if (ps.vis && el.style.visibility) el.style.visibility = '';
          el.classList.toggle('on', ps.vis);
          tip.classList.toggle('show', s.tipOn && t < s.tipUntil && ps.vis);
          if (hint && !s.hintAt && ps.vis) {   // first time it's on screen: show the hint
            s.hintAt = t;
            hint.classList.add('show');
          }
          tip.style.transform = 'translate(' + clamp(s.x, 110, window.innerWidth - 110).toFixed(1) + 'px,' +
            (s.y - 24).toFixed(1) + 'px) translate(-50%, -100%)';
          var px = (s.mx - s.x) / 38, py = (s.my - s.y) / 24;
          s.hold = (px * px + py * py < 1) ? s.hold + dt : 0;
          var intro = s.intro && s.introAt && t >= s.introAt;
          if (intro || s.hold >= 0.5) {   // first mouse move, or cursor rested on it: take off
            s.intro = false;
            s.tipOn = false;
            tip.classList.remove('show');
            if (!ps.vis) {                // its perch is scrolled out of view: come in from the top edge instead
              s.x = clamp(s.mx + s.side * OFF_X, HELI_LEN, window.innerWidth - HELI_LEN);
              s.y = -40;
              resume(t);
            } else {
              s.mode = 'liftoff';         // straight up first; chasing starts once it's hovering
              el.classList.remove('perched');
            }
          }
        } else {                          // liftoff: rise straight up to the hover point, then start chasing
          var ls = s.spot();
          var dUp = glideTo(ls.x, Math.max(ls.y - HOVER_ABOVE, 76), dt, 60, 50);
          s.rot += (0 - s.rot) * Math.min(1, dt * 8);
          if (dUp < 3) resume(t);
        }
        s.inside = inside;
        if (hint && s.hintAt && t - s.hintAt > 6) {   // brief: fade it out and let go of it
          hint.classList.remove('show');
          hint = null;
        }
        if (s.mode === 'fly' || s.mode === 'explore' || s.mode === 'crash') wallGovern();
        s.tax += ((s.vx - s.pvx) / dt - s.tax) * Math.min(1, dt * 8);   // measured horizontal acceleration, smoothed
        s.pvx = s.vx;
        s.x = s.mode === 'perch' ? s.x : clamp(s.x + s.vx * dt, 0, window.innerWidth);   // a perched heli rides its pill, even out of the window
        s.y += s.vy * dt;

        // fall in 3D, one pass through four views: side, top, nose-on, far side; then it levels out
        if (s.mode === 'crash') {
          var u = clamp((t - s.cStart) / (s.cDur * 0.85), 0, 1);
          s.top = clamp(Math.sin(clamp((u - 0.1) / 0.35, 0, 1) * Math.PI) * 1.4, 0, 1);
          var yu = clamp((u - 0.35) / 0.45, 0, 1);
          s.yaw = Math.PI * yu * yu * (3 - 2 * yu);
        } else {                            // recovering: swing back around and look away from the top
          s.top += (0 - s.top) * Math.min(1, dt * 10);
          s.yaw += (0 - s.yaw) * Math.min(1, dt * 8);
        }

        // yaw: sweep theta 0 (facing right) <-> PI (facing left); scaleX = cos(theta)
        // mid-turn the side view thins out and a nose-on view fades in, so it never goes paper-thin
        var step = Math.PI / 0.5 * dt;
        s.theta += clamp(s.want - s.theta, -step, step);
        var f = Math.cos(s.theta + s.yaw), af = Math.abs(f);
        var sideAmt = 1 - s.top;
        side.style.transform = 'scaleX(' + f.toFixed(3) + ')';
        side.style.opacity = (Math.min(1, af * 2) * sideAmt).toFixed(2);
        front.style.opacity = ((1 - af) * sideAmt).toFixed(2);
        upper.style.opacity = sideAmt.toFixed(2);
        top.style.opacity = Math.min(1, s.top * 1.6).toFixed(2);

        // lamp: sits on the nose, aims toward the cursor within the forward half, fades when it can't shine
        var facing = f >= 0 ? 1 : -1, rr = s.rot * Math.PI / 180;
        var bx = s.x + 18.4 * facing * Math.cos(rr) - 6.4 * Math.sin(rr);
        var by = s.y + 18.4 * facing * Math.sin(rr) + 6.4 * Math.cos(rr);
        var aimTo = 40;                     // wandering: just light the ground ahead
        if (s.mode === 'fly') aimTo = clamp(Math.atan2(s.my - by, (s.mx - bx) * facing) * 180 / Math.PI, 12, 75);
        s.aim += (aimTo - s.aim) * Math.min(1, dt * 5);
        var lit = (s.mode === 'fly' || s.mode === 'explore' || (s.mode === 'flee' && s.land === 0)) ? 1 : 0;
        s.beam += (lit - s.beam) * Math.min(1, dt * 6);
        lamp.style.opacity = (s.beam * af * (1 - s.top)).toFixed(2);
        lamp.style.transform = 'translate(' + bx.toFixed(1) + 'px,' + by.toFixed(1) + 'px) ' +
          'rotate(' + (facing > 0 ? s.aim : 180 - s.aim).toFixed(1) + 'deg)';

        // a touch bigger when we're looking straight down on it
        el.style.transform = 'translate(' + s.x.toFixed(1) + 'px,' + s.y.toFixed(1) + 'px) ' +
          'rotate(' + s.rot.toFixed(1) + 'deg) scale(' + (1 + 0.2 * s.top).toFixed(3) + ')';
      }
      requestAnimationFrame(frame);
    }
    // Page change (see "page transitions" below): only a heli that is in the air takes part
    heliApi = {
      depart: function () {
        if (s.mode === 'perch') return false;       // landed: the page just slides away under it
        s.mode = 'depart';
        s.tuck = false;
        s.xTo = Math.min(window.innerWidth - HELI_LEN, Math.max(s.x + 260, window.innerWidth * 0.78));
        tip.classList.remove('show');
        if (hint) hint.classList.remove('show');
        return true;
      },
      arrived: function () { return s.x >= s.xTo - 20; },
      snapshot: function () { return { x: s.x, y: s.y, vx: s.vx, rot: s.rot }; }
    };
    s.spot = pillSpot() ? pillSpot : ledgeSpot;
    el.classList.add('perched');
    requestAnimationFrame(frame);
  }

  // --- page transitions: the content slides out to the left and the next page slides in from the
  // right (header stays put). A heli that is in the air flies off to the right with it and carries on
  // across the next page; a landed one just rides out with the page. pt.js (in <head>) parks the
  // incoming page off screen before first paint; the hand-off lives in sessionStorage. ---
  var root = document.documentElement, PT_KEY = 'pt', navigating = false;
  function pageKey(p) { return p.replace(/index\.html$/, '').replace(/\.html$/, '').replace(/\/$/, ''); }

  function flyOver(h) {                 // the heli from the last page, carrying on until it leaves the screen
    var el = createHeliEl(), x = h.x, y = h.y, vx = Math.max(h.vx, 300), rot = h.rot, prev = null;
    el.style.transition = 'none';
    el.classList.add('on');
    (function step(ms) {
      var dt = prev === null ? 0 : Math.min(0.05, (ms - prev) / 1000);
      prev = ms;
      vx += (800 - vx) * Math.min(1, dt * 1.5);
      x += vx * dt;
      rot += (Math.min(9, vx * 0.02) - rot) * Math.min(1, dt * 8);
      el.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) rotate(' + rot.toFixed(1) + 'deg)';
      if (x > window.innerWidth + 100) el.remove(); else requestAnimationFrame(step);
    })(performance.now());
  }

  var arriving = null;
  try {
    var rawPt = sessionStorage.getItem(PT_KEY);
    if (rawPt) {
      sessionStorage.removeItem(PT_KEY);
      arriving = JSON.parse(rawPt);
      if (!arriving || Date.now() - arriving.t > 4000) arriving = null;
    }
  } catch (err) { /* storage blocked: no transition */ }
  if (arriving) {
    if (arriving.heli && motionOk) flyOver(arriving.heli);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        root.classList.add('pt-run');
        root.classList.remove('pt-in');
        setTimeout(function () { root.classList.remove('pt-run'); }, 1000);
      });
    });
  }

  document.addEventListener('click', function (e) {
    if (navigating || !motionOk || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest ? e.target.closest('a[href]') : null;
    if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download')) return;
    var u = new URL(a.href, location.href);
    if (u.origin !== location.origin || pageKey(u.pathname) === pageKey(location.pathname)) return;
    if (/\.[a-z0-9]+$/i.test(u.pathname) && !/\.html$/i.test(u.pathname)) return;   // a file, not a page
    e.preventDefault();
    navigating = true;
    var flying = !!(heliApi && heliApi.depart());
    var minMs = flying ? 800 : 550, t0 = Date.now();
    root.style.setProperty('--pt-out', minMs + 'ms');
    root.classList.add('pt-out');
    (function wait() {
      var waited = Date.now() - t0;
      if (waited < minMs || (flying && !heliApi.arrived() && waited < 1300)) { setTimeout(wait, 30); return; }
      try { sessionStorage.setItem(PT_KEY, JSON.stringify({ t: Date.now(), heli: flying ? heliApi.snapshot() : null })); } catch (err) { /* ignore */ }
      location.href = u.href;
    })();
  });
  window.addEventListener('pageshow', function (e) {   // back button restored the slid-out page from cache
    if (e.persisted && root.classList.contains('pt-out')) location.reload();
  });

  // --- respect reduced-motion: reveal instantly, no transitions ---
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.classList.add('reduced-motion');
    reveals.forEach(function (el) { el.classList.add('revealed'); });
  }
})();
