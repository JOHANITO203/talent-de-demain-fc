/* ==========================================================================
   Hero — source d'images pour appareils tactiles (mobile / tablette)
   --------------------------------------------------------------------------
   POURQUOI CE FICHIER EXISTE
   Le héro desktop scrubbe un <video> en déplaçant currentTime. Sur mobile
   cette technique est fragile : le navigateur refuse de réveiller le décodeur
   sans geste utilisateur, les recherches d'image n'aboutissent jamais, et
   main.js finit par basculer en enterLoopMode() — le maillot tourne alors en
   boucle libre, détaché du défilement. C'est précisément le symptôme observé
   sur téléphone : « ça scrolle mais la vidéo ne suit pas ».

   Une séquence d'images n'a aucun décodeur vidéo, donc aucune politique
   d'autoplay, donc rien qui puisse se bloquer. Un <img> se charge, point.

   CE QUE CE MODULE N'EST PAS
   Ce n'est pas un second moteur de héro. Il n'embarque ni défilement, ni
   lissage, ni mise en page : il expose seulement window.tddFrameSource, que
   main.js interroge à la place du <video>. Le lissage, les légendes, le
   compteur de rotation, la dérive du titre et le détourage WebGL restent
   rigoureusement ceux du desktop — c'est ce qui garantit que l'expérience est
   la même, et non une imitation.

   QUALITÉ
   193 images — le compte intégral de la vidéo source, pas un échantillon.
   900×1080, soit la résolution native d'affichage du maillot à DPR 3 sur
   téléphone (281×338 px CSS) et à DPR 2 sur tablette. Aucun sous-échantillon.

   FLUIDITÉ AU PREMIER CHARGEMENT
   Charger 10 Mo avant d'afficher quoi que ce soit donnerait un trou blanc de
   plusieurs secondes en 4G. Le chargement se fait donc en deux vagues : une
   sur quatre d'abord (~2 Mo), ce qui rend le maillot scrubbable presque tout
   de suite, puis le reste en arrière-plan. Le rendu choisit toujours l'image
   chargée la plus proche : la rotation est grossière une seconde ou deux,
   puis se densifie d'elle-même jusqu'aux 193 pas. Jamais d'attente, jamais de
   qualité définitivement dégradée.
   ========================================================================== */

(function () {
  'use strict';

  if (!document.documentElement.classList.contains('js-anim')) return;
  if (!document.getElementById('jersey-canvas')) return;

  /* ---- Aiguillage ---------------------------------------------------------
     La largeur seule ne suffit pas : une tablette en paysage est large mais
     reste tactile. On teste donc le type de pointeur en premier, la largeur
     en secours (navigateur ancien sans (pointer:coarse), fenêtre étroite). */
  var coarse = window.matchMedia('(pointer: coarse)').matches;
  var narrow = window.matchMedia('(max-width: 1024px)').matches;
  if (!coarse && !narrow) return;          // desktop : moteur <video> intact

  var COUNT = 193;
  var DIR = 'assets/frames/';
  var VER = '?v=1';                        // à incrémenter si on ré-encode
  var STRIDE = 4;                          // 1 image sur 4 dans la vague 1

  var imgs = new Array(COUNT);
  var done = new Array(COUNT);
  var loadedCount = 0;

  function pad(n) { return n < 100 ? (n < 10 ? '00' + n : '0' + n) : '' + n; }

  function load(i, then) {
    if (imgs[i]) { if (then) then(); return; }
    var img = new Image();
    img.decoding = 'async';
    imgs[i] = img;
    img.onload = function () {
      done[i] = true;
      loadedCount++;
      if (!SRC.ready) SRC.ready = true;    // main.js démarre sur ce signal
      if (then) then();
    };
    // Une image manquante ne doit pas figer la file : on passe à la suivante.
    img.onerror = function () { if (then) then(); };
    img.src = DIR + 'f_' + pad(i + 1) + '.webp' + VER;
  }

  /* File d'attente à concurrence bornée. Sans borne, 193 requêtes partent
     ensemble et la première image arrive aussi tard que la dernière. */
  function queue(list, lanes, whenDone) {
    var next = 0, active = 0;
    function pump() {
      while (active < lanes && next < list.length) {
        active++;
        load(list[next++], function () { active--; pump(); });
      }
      if (!active && next >= list.length && whenDone) { whenDone(); whenDone = null; }
    }
    pump();
  }

  var wave1 = [], wave2 = [], i;
  for (i = 0; i < COUNT; i++) (i % STRIDE ? wave2 : wave1).push(i);

  /* ---- Contrat exposé à main.js ------------------------------------------ */
  var SRC = {
    ready: false,
    width: 900,
    height: 1080,
    count: COUNT,
    progress: function () { return loadedCount / COUNT; },

    /* Image à peindre pour une progression 0→1. Renvoie la plus proche
       DÉJÀ chargée : pendant la vague 2 la rotation se densifie au lieu de
       sauter sur du vide. */
    frameAt: function (p) {
      if (!(p >= 0)) p = 0; else if (p > 1) p = 1;
      var want = Math.round(p * (COUNT - 1));
      if (done[want]) return imgs[want];
      for (var d = 1; d < COUNT; d++) {
        if (want - d >= 0 && done[want - d]) return imgs[want - d];
        if (want + d < COUNT && done[want + d]) return imgs[want + d];
      }
      return null;
    },

    /* Les DEUX images encadrant la progression, plus leur pondération, pour
       que le rendu interpole au lieu de sauter d'un pas à l'autre. 193 images
       pour 360° font un pas tous les ~10px de défilement : au doigt lent la
       rotation n'avançait qu'à ~14 images/s.
       On n'interpole que si les deux voisines immédiates sont chargées —
       pendant la seconde vague, mélanger deux images éloignées produirait un
       dédoublement. Sinon on retombe proprement sur l'image la plus proche. */
    framesAt: function (p) {
      if (!(p >= 0)) p = 0; else if (p > 1) p = 1;
      var x = p * (COUNT - 1);
      var i = Math.floor(x);
      var j = Math.min(i + 1, COUNT - 1);
      if (done[i] && done[j]) return { a: imgs[i], b: imgs[j], mix: x - i };
      var near = SRC.frameAt(p);
      return near ? { a: near, b: near, mix: 0 } : null;
    }
  };

  window.tddFrameSource = SRC;

  queue(wave1, 6, function () { queue(wave2, 6); });
}());
