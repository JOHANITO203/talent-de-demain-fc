/* ==========================================================================
   Choix du thème clair / sombre
   --------------------------------------------------------------------------
   Le site suit la préférence du système par défaut. Ce module ajoute un choix
   explicite, mémorisé, qui prend le pas dessus — comme le sélecteur de langue.

   L'attribut data-theme est posé sur <html> AVANT le rendu, par le petit
   script en ligne dans le <head> de chaque page. Ici on ne fait que construire
   le bouton et écrire le choix : si ce module tardait à charger, la page
   s'afficherait un instant dans le mauvais thème.

   Trois états, pas deux : « système » est le défaut et reste accessible, pour
   qu'un visiteur puisse revenir au comportement automatique après avoir
   essayé les deux.
   ========================================================================== */

(function () {
  'use strict';

  var KEY = 'tdd-theme';
  var root = document.documentElement;
  var sys = window.matchMedia('(prefers-color-scheme: dark)');

  function stored() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }

  function apply(mode) {
    if (mode === 'light' || mode === 'dark') root.setAttribute('data-theme', mode);
    else root.removeAttribute('data-theme');
    try {
      if (mode) localStorage.setItem(KEY, mode);
      else localStorage.removeItem(KEY);
    } catch (e) { /* navigation privée : le choix ne survit pas, tant pis */ }
  }

  /* Ce que le bouton affiche : l'état VERS lequel il fait basculer, pas
     l'état courant — c'est ce que l'utilisateur cherche à savoir. */
  function isDark() {
    var m = stored();
    return m ? m === 'dark' : sys.matches;
  }

  var SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
    'stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4.2"/>' +
    '<path d="M12 2.6v2.2M12 19.2v2.2M2.6 12h2.2M19.2 12h2.2' +
    'M5.4 5.4l1.6 1.6M17 17l1.6 1.6M18.6 5.4L17 7M7 17l-1.6 1.6"/></svg>';

  var MOON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
    'stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M20.5 14.6A8.6 8.6 0 0 1 9.4 3.5a8.6 8.6 0 1 0 11.1 11.1z"/></svg>';

  function build() {
    var actions = document.querySelector('.nav__actions');
    if (!actions || document.querySelector('.theme-btn')) return;

    var btn = document.createElement('button');
    btn.className = 'icon-btn theme-btn';
    btn.type = 'button';

    function paint() {
      var dark = isDark();
      // On bascule vers l'inverse : l'icône annonce la destination.
      btn.innerHTML = dark ? SUN : MOON;
      btn.setAttribute('aria-label', dark ? 'Passer en thème clair' : 'Passer en thème sombre');
      btn.title = btn.getAttribute('aria-label');
    }

    btn.addEventListener('click', function () {
      apply(isDark() ? 'light' : 'dark');
      paint();
    });

    // Sans choix mémorisé, le bouton doit suivre le système en direct.
    if (sys.addEventListener) {
      sys.addEventListener('change', function () { if (!stored()) paint(); });
    }

    paint();
    // Après le sélecteur de langue, avant le menu : langue puis thème puis menu.
    var lang = actions.querySelector('.lang-btn');
    if (lang && lang.nextSibling) actions.insertBefore(btn, lang.nextSibling);
    else actions.insertBefore(btn, actions.firstChild);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
}());
