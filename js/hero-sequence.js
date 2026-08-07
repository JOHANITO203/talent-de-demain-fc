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

  /* Deux définitions, choisies selon ce que le canvas affiche RÉELLEMENT.
     MESURÉ sur l'appareil du client : le coût dominant n'est ni le GPU ni
     l'envoi, c'est le DÉCODAGE WebP — 10 ms par image en 900x1080, contre
     0,4 ms pour envoyer une image déjà décodée. Ce coût est proportionnel au
     nombre de pixels.
     Or son canvas n'affiche que 679 px de large : décoder du 900 pour en
     montrer 679 était du travail perdu. Le jeu 720x864 fait 64% des pixels,
     donc environ 6 ms au lieu de 10, et ne perd rien à l'écran tant que le
     canvas reste sous 720.
     Les écrans qui en demandent davantage — un iPhone à densité 3 réclame
     833 px — reçoivent toujours le jeu complet. */
  var besoin = (function () {
    var cv = document.getElementById('jersey-canvas');
    var l = cv ? cv.offsetWidth : 0;
    if (!l) {                                // avant la mise en page
      l = Math.min(window.innerWidth * 0.62, window.innerHeight * 0.42 * 0.833);
    }
    return l * (window.devicePixelRatio || 1);
  }());
  var PETIT = besoin <= 720;
  var DIR = PETIT ? 'assets/frames720/' : 'assets/frames/';
  var LARGE = PETIT ? 720 : 900, HAUT = PETIT ? 864 : 1080;
  var VER = '?v=1';                        // à incrémenter si on ré-encode
  var STRIDE = 4;                          // 1 image sur 4 dans la vague 1

  var imgs = new Array(COUNT);
  var done = new Array(COUNT);
  var chaud = new Array(COUNT);   // image déjà décodée d'avance
  var loadedCount = 0;

  /* Pas de préparation d'avance en ImageBitmap.
     Essayé et MESURÉ sur l'appareil : createImageBitmap bloque le fil
     principal 9,9 ms en médiane, 15,5 au 90e centile — davantage que ce
     qu'il fait économiser à l'envoi, et il est appelé plus souvent que le
     dessin (248 préparations pour 150 envois). Net négatif.
     La bonne réponse était en amont : décoder moins de pixels. Voir le choix
     de définition plus haut. On demande simplement au navigateur de décoder
     les images qui arrivent, ce qui ne bloque pas. */
  function prechauffer(centre) {
    for (var d = -2; d <= 8; d++) {
      var i = centre + d;
      if (i < 0 || i >= COUNT || chaud[i] || !done[i]) continue;
      chaud[i] = true;
      if (imgs[i].decode) imgs[i].decode().catch(function () {});
    }
  }

  /* ---- Contrat exposé à main.js ------------------------------------------ */
  var SRC = {
    ready: false,
    width: LARGE,
    height: HAUT,
    count: COUNT,
    progress: function () { return loadedCount / COUNT; },

    /* Image à peindre pour une progression 0→1. Renvoie la plus proche
       DÉJÀ chargée : pendant la vague 2 la rotation se densifie au lieu de
       sauter sur du vide. */
    frameAt: function (p) {
      if (!(p >= 0)) p = 0; else if (p > 1) p = 1;
      var want = Math.round(p * (COUNT - 1));
      prechauffer(want);
      if (done[want]) return imgs[want];
      for (var d = 1; d < COUNT; d++) {
        if (want - d >= 0 && done[want - d]) return imgs[want - d];
        if (want + d < COUNT && done[want + d]) return imgs[want + d];
      }
      return null;
    }
  };

  window.tddFrameSource = SRC;

  queue(wave1, 6, function () { queue(wave2, 6); });
}());
