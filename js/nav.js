/* ==========================================================================
   Talent de Demain FC — menu button
   --------------------------------------------------------------------------
   Loaded by every page. The button used to be inert, which left the site
   with no navigation at all on phones (the horizontal menu is hidden below
   900px, and the landing page has no footer nav to fall back on).

   The panel is BUILT FROM the existing .nav__menu links rather than being
   duplicated into five HTML files — one source of truth, so the panel can
   never drift out of sync with the header.

   Behaviour: toggles on click, closes on Escape / backdrop / link choice,
   locks page scroll while open, moves focus into the panel and returns it
   to the button on close, and reports state through aria-expanded.
   ========================================================================== */

(function () {
  'use strict';

  var btn  = document.querySelector('.nav__actions .icon-btn');
  var menu = document.querySelector('.nav__menu');
  if (!btn || !menu) return;

  /* ---- Build the panel once, from the header links --------------------- */
  var panel = document.createElement('div');
  panel.className = 'nav-panel';
  panel.id = 'nav-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'true');
  panel.setAttribute('aria-label', 'Menu');

  var inner = document.createElement('nav');
  inner.className = 'nav-panel__links';

  Array.prototype.forEach.call(menu.querySelectorAll('a'), function (a) {
    var link = a.cloneNode(true);
    link.className = a.classList.contains('is-active') ? 'is-active' : '';
    inner.appendChild(link);
  });

  var extra = document.createElement('div');
  extra.className = 'nav-panel__extra';
  extra.innerHTML =
    '<a class="btn btn--light" href="community.html#join">Join The Club</a>' +
    '<div class="nav-panel__social">' +
      '<a href="https://www.instagram.com/talent_de_demainfc" target="_blank" rel="noopener" aria-label="Instagram">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.2" cy="6.8" r="1.2" fill="currentColor" stroke="none"/></svg></a>' +
      '<a href="https://youtube.com/@talentdedemainfc" target="_blank" rel="noopener" aria-label="YouTube">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2.5" y="5.5" width="19" height="13" rx="4"/><path d="M10.2 9.3v5.4l4.8-2.7-4.8-2.7z" fill="currentColor" stroke="none"/></svg></a>' +
      '<a href="https://www.facebook.com/profile.php?id=61552210673396" target="_blank" rel="noopener" aria-label="Facebook">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M15.5 8.2h-2.1c-.5 0-.9.4-.9 1v2h3l-.5 2.8h-2.5V21h-3v-7h-2v-2.8h2v-2A3.4 3.4 0 0 1 13 5.7h2.5v2.5z"/></svg></a>' +
    '</div>';

  panel.appendChild(inner);
  panel.appendChild(extra);
  document.body.appendChild(panel);

  /* ---- Button: add the close icon and the ARIA wiring ------------------ */
  var barsIcon = btn.querySelector('svg');
  if (barsIcon) barsIcon.classList.add('icon-bars');
  btn.insertAdjacentHTML('beforeend',
    '<svg class="icon-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
    'stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>');
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-controls', 'nav-panel');

  /* ---- Open / close ----------------------------------------------------- */
  var open = false;
  var scrollY = 0;

  function setOpen(next) {
    if (next === open) return;
    open = next;

    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Menu');
    document.documentElement.classList.toggle('nav-open', open);

    if (open) {
      // freeze the page behind the panel without losing the scroll position
      scrollY = window.pageYOffset;
      document.body.style.position = 'fixed';
      document.body.style.top = -scrollY + 'px';
      document.body.style.width = '100%';
      var first = panel.querySelector('a');
      if (first) first.focus();
    } else {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, scrollY);
      btn.focus();
    }
  }

  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    setOpen(!open);
  });

  // a link choice closes the panel (needed for same-page #anchors, which
  // would otherwise leave it open on top of the target)
  panel.addEventListener('click', function (e) {
    if (e.target.closest('a')) setOpen(false);
    else if (e.target === panel) setOpen(false);   // backdrop
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && open) setOpen(false);
  });

  // keep focus inside the panel while it is open
  document.addEventListener('focusin', function (e) {
    if (open && !panel.contains(e.target) && e.target !== btn) {
      var first = panel.querySelector('a');
      if (first) first.focus();
    }
  });

  // a resize into the desktop layout should not leave the page frozen
  window.addEventListener('resize', function () {
    if (open && window.innerWidth > 900) setOpen(false);
  });
})();
