/* nathan.andmar.dev: pt.js
   Runs in <head>, before first paint. If the last page handed off a page transition (see site.js),
   park the incoming page off screen so it can slide in. Fails safe: it never stays parked. */
(function () {
  try {
    var raw = sessionStorage.getItem('pt');
    var pt = raw && JSON.parse(raw);
    if (pt && Date.now() - pt.t < 4000) {
      var root = document.documentElement;
      root.classList.add('pt-in');
      setTimeout(function () { root.classList.remove('pt-in'); }, 2500);
    }
  } catch (e) { /* storage blocked */ }
})();
