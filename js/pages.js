/* ==========================================================================
   Talent de Demain FC — inner pages behavior
   1. Load-in choreography release (same `is-ready` contract as the landing).
   2. Kinetic page title: per-letter staggered rise.
   3. Reveal-on-scroll for sections/cards (IntersectionObserver).
   4. Match cards: clicking play swaps the poster for the embedded replay
      (the embed URL lives in data-embed; empty = replay not published yet).
   ========================================================================== */

(function () {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Runtime copy in the active language (see js/i18n.js) */
  var T = (window.TDD_I18N && window.TDD_I18N.t) || {
    ok: 'Thank you — your request has been sent. The club will get back to you shortly.',
    err: 'Sorry, the form could not be sent. Please write to contact@talentdedemainfc.com or message us on WhatsApp.'
  };

  /* ---- 1. Release the load-in choreography ------------------------------ */
  function ready() {
    document.documentElement.classList.add('is-ready');
    document.querySelectorAll('.page-hero__title').forEach(function (t) {
      t.classList.add('is-in');
    });
  }
  (document.fonts && document.fonts.ready
    ? document.fonts.ready : Promise.resolve()).then(function () {
    requestAnimationFrame(ready);
  });
  setTimeout(ready, 1200); // safety net

  /* ---- 2. Kinetic page title -------------------------------------------- */
  document.querySelectorAll('.page-hero__title').forEach(function (title) {
    var text = title.textContent;
    title.textContent = '';
    title.setAttribute('aria-label', text);
    for (var k = 0; k < text.length; k++) {
      var ch = document.createElement('span');
      ch.className = 'char';
      ch.setAttribute('aria-hidden', 'true');
      ch.style.setProperty('--i', k);
      ch.textContent = text[k] === ' ' ? ' ' : text[k];
      title.appendChild(ch);
    }
  });

  /* ---- 3. Reveal on scroll ---------------------------------------------- */
  var revealed = document.querySelectorAll('.reveal');
  if (reducedMotion || !('IntersectionObserver' in window)) {
    revealed.forEach(function (el) { el.classList.add('in-view'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in-view');
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealed.forEach(function (el) { io.observe(el); });
  }

  /* ---- Cinematic videos ---------------------------------------------------
     Any <video data-cinema> plays muted while it is on screen and pauses
     when it leaves, so playback follows the scroll. Clicking the video
     toggles play/pause; the round .film__sound button inside the same
     wrapper toggles the audio (and starts playback if it was paused).
     Only one soundtrack at a time: unmuting one mutes the others.        */
  var cinemas = Array.prototype.slice.call(
    document.querySelectorAll('video[data-cinema]')
  );

  cinemas.forEach(function (video) {
    var wrap = video.closest('[data-cinema-wrap]') || video.parentNode;
    var soundBtn = wrap.querySelector('.film__sound');

    if (!reducedMotion && 'IntersectionObserver' in window) {
      var io2 = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) video.play().catch(function () {});
          else video.pause();
        });
      }, { threshold: 0.35 });
      io2.observe(video);
    }

    video.addEventListener('click', function () {
      if (video.paused) video.play().catch(function () {});
      else video.pause();
    });

    if (!soundBtn) return;
    soundBtn.addEventListener('click', function () {
      var turningOn = video.muted;
      if (turningOn) {
        // Mute every other cinematic video first — never two soundtracks.
        cinemas.forEach(function (other) {
          if (other === video) return;
          other.muted = true;
          var b = (other.closest('[data-cinema-wrap]') || other.parentNode)
                    .querySelector('.film__sound');
          if (b) b.classList.remove('is-on');
        });
      }
      video.muted = !turningOn;
      soundBtn.classList.toggle('is-on', turningOn);
      if (turningOn && video.paused) video.play().catch(function () {});
    });
  });

  /* ---- Join form ----------------------------------------------------------
     Submits in place so the visitor never leaves the page. Two backends are
     supported without touching this code:
       · data-endpoint set  → POST JSON there (Formspree, Basin, a Worker…)
       · otherwise          → POST the form back to its own URL, which is what
                              Netlify Forms listens for.
     If JavaScript fails, the plain <form> still posts normally.            */
  var joinForm = document.querySelector('.join__form');
  if (joinForm) {
    var status = joinForm.querySelector('.join__status');
    var submit = joinForm.querySelector('.join__submit');

    joinForm.addEventListener('submit', function (e) {
      if (!joinForm.checkValidity()) return;      // let the browser complain
      e.preventDefault();

      var endpoint = (joinForm.dataset.endpoint || '').trim();
      var data = new FormData(joinForm);
      if (data.get('company')) return;            // honeypot tripped: silent no-op

      submit.disabled = true;
      status.className = 'join__status';
      status.textContent = '';

      var opts = endpoint
        ? { method: 'POST', headers: { 'Accept': 'application/json' }, body: data }
        : { method: 'POST', body: new URLSearchParams(data).toString(),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' } };

      fetch(endpoint || window.location.pathname, opts)
        .then(function (r) {
          if (!r.ok) throw new Error(r.status);
          joinForm.reset();
          status.className = 'join__status is-ok';
          status.textContent = T.ok;

          /* The one metric that matters: a completed sign-up. Fired as a DOM
             event and pushed to a dataLayer, so whichever analytics tool the
             club ends up using can pick it up without touching this file.
             `role` tells player / parent / supporter / partner apart. */
          var role = data.get('role') || 'unknown';
          document.dispatchEvent(new CustomEvent('tdd:join', { detail: { role: role } }));
          window.dataLayer = window.dataLayer || [];
          window.dataLayer.push({ event: 'join_submitted', role: role });
        })
        .catch(function () {
          status.className = 'join__status is-error';
          status.textContent = T.err;
        })
        .then(function () { submit.disabled = false; });
    });
  }

  /* ---- 4. Replay playback -------------------------------------------------
     Two modes on .match-card__play:
     - data-embed="https://www.youtube.com/embed/ID" → in-card iframe player
     - data-href="https://app.veo.co/matches/…"      → opens the platform
       page in a new tab (Veo forbids iframing via X-Frame-Options)
     Neither attribute set = replay not available yet.                       */
  document.querySelectorAll('.match-card__play').forEach(function (btn) {
    var embed = (btn.dataset.embed || '').trim();
    var href  = (btn.dataset.href  || '').trim();

    if (!embed && !href) {
      btn.disabled = true;
      btn.setAttribute('title', 'Replay coming soon');
      return;
    }

    btn.addEventListener('click', function () {
      if (embed) {
        var media = btn.closest('.match-card__media');
        if (!media) return;
        var iframe = document.createElement('iframe');
        iframe.src = embed + (embed.indexOf('?') === -1 ? '?' : '&') + 'autoplay=1';
        iframe.allow = 'accelerometer; autoplay; encrypted-media; picture-in-picture';
        iframe.allowFullscreen = true;
        media.innerHTML = '';
        media.appendChild(iframe);
      } else {
        window.open(href, '_blank', 'noopener');
      }
    });
  });
})();
