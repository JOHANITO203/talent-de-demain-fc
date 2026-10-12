
(function () {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var T = (window.TDD_I18N && window.TDD_I18N.t) || {
    ok: 'Your request is ready in WhatsApp. Tap Send to pass it on to the club.'
  };

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
  setTimeout(ready, 1200);

  document.querySelectorAll('.page-hero__title').forEach(function (title) {
    var text = title.textContent.trim();
    title.textContent = '';
    title.setAttribute('aria-label', text);

    var i = 0;
    text.split(/(\s+)/).forEach(function (chunk) {
      if (!chunk) return;
      if (/^\s+$/.test(chunk)) {
        title.appendChild(document.createTextNode(' '));
        return;
      }
      var word = document.createElement('span');
      word.className = 'word';
      word.setAttribute('aria-hidden', 'true');
      for (var k = 0; k < chunk.length; k++) {
        var ch = document.createElement('span');
        ch.className = 'char';
        ch.style.setProperty('--i', i++);
        ch.textContent = chunk[k];
        word.appendChild(ch);
      }
      title.appendChild(word);
    });
  });

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

  var CLUB_WHATSAPP = '2250101106428';
  var joinForm = document.querySelector('.join__form');
  if (joinForm) {
    var status = joinForm.querySelector('.join__status');

    function champ(data, nom) {
      return String(data.get(nom) || '').trim() || '-';
    }

    joinForm.addEventListener('submit', function (e) {
      if (!joinForm.checkValidity()) return;
      e.preventDefault();

      var data = new FormData(joinForm);
      if (data.get('_gotcha')) return;

      var texte = [
        'Bonjour, je souhaite rejoindre le Talent de Demain FC.',
        '',
        'Nom : ' + champ(data, 'name'),
        'E-mail : ' + champ(data, 'email'),
        'Je suis : ' + champ(data, 'role'),
        'Catégorie : ' + champ(data, 'age_group'),
        'Message : ' + champ(data, 'message'),
        'Accord pour être contacté : oui'
      ].join('\n');
      var url = 'https://wa.me/' + CLUB_WHATSAPP + '?text=' + encodeURIComponent(texte);

      var fenetre = window.open(url, '_blank');
      if (fenetre) fenetre.opener = null;
      else window.location.href = url;

      joinForm.reset();
      status.className = 'join__status is-ok';
      status.textContent = T.ok;

      var role = data.get('role') || 'unknown';
      document.dispatchEvent(new CustomEvent('tdd:join', { detail: { role: role } }));
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: 'join_submitted', role: role });
    });
  }

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
