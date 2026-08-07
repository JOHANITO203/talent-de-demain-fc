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
  var chaud = new Array(COUNT);   // image déjà décodée d'avance
  var loadedCount = 0;

  /* ---- Images prêtes pour le GPU, en fenêtre glissante ------------------
     MESURÉ sur l'appareil du client (Galaxy S23+, Chrome et Samsung
     Internet), en chronométrant les appels dans la page :
        envoi d'une <img> au GPU : 13,9 ms de médiane, 18,7 au 90e centile
        rendu du shader          :  0,0 ms
     L'envoi consommait donc 14 ms sur les 16,7 d'un cycle d'écran — 47% des
     images arrivaient en retard pendant la rotation. Ce n'était ni le GPU
     (Adreno 740) ni le nombre d'images.

     La raison : donner une <img> à texImage2D oblige le navigateur à la
     décoder puis à la convertir à chaque envoi. Un ImageBitmap est déjà
     décodé et dans le bon format — l'envoi devient une copie.

     Le piège serait de tout convertir : 193 images de 900x1080 en mémoire
     décodée font 750 Mo et feraient tomber le téléphone. On garde donc une
     FENÊTRE glissante autour de l'image courante, et on libère le reste
     explicitement. La fenêtre suit le sens du défilement. */
  var bmp = new Array(COUNT);       // ImageBitmap prêts
  var enCours = new Array(COUNT);   // conversions en vol
  var recents = [];                 // ordre d'utilisation, pour libérer
  var FENETRE = 26;                 // ~100 Mo au plus, largement tenable
  var sensPrec = 1, dernierIdx = 0;

  function libererVieux() {
    while (recents.length > FENETRE) {
      var v = recents.shift();
      if (bmp[v] && bmp[v].close) bmp[v].close();
      bmp[v] = null;
    }
  }

  function preparer(i) {
    if (i < 0 || i >= COUNT || !done[i] || bmp[i] || enCours[i]) return;
    if (!window.createImageBitmap) {         // repli : on garde la <img>
      if (!chaud[i] && imgs[i].decode) {
        chaud[i] = true;
        imgs[i].decode().catch(function () {});
      }
      return;
    }
    enCours[i] = true;
    /* Aucune conversion d'espace de couleur ni de prémultiplication : le
       shader travaille sur les valeurs brutes, et chaque conversion coûte
       le temps qu'on essaie justement d'économiser. */
    window.createImageBitmap(imgs[i], {
      premultiplyAlpha: 'none',
      colorSpaceConversion: 'none'
    }).then(function (b) {
      enCours[i] = false;
      if (bmp[i]) { b.close && b.close(); return; }
      bmp[i] = b;
      recents.push(i);
      libererVieux();
    }).catch(function () { enCours[i] = false; });
  }

  function prechauffer(centre) {
    if (centre !== dernierIdx) {
      sensPrec = centre > dernierIdx ? 1 : -1;
      dernierIdx = centre;
    }
    /* AU PLUS DEUX conversions par image de rendu. Sans ce frein, une
       glissade rapide en lançait une dizaine d'un coup et le gain obtenu sur
       l'envoi au GPU était repris par la préparation. Le coût est ainsi
       étalé au lieu d'arriver en rafale. */
    var budget = 2;
    for (var d = 0; d <= 10 && budget > 0; d++) {
      var av = centre + d * sensPrec;
      if (av >= 0 && av < COUNT && done[av] && !bmp[av] && !enCours[av]) {
        preparer(av); budget--;
      }
    }
    for (var e = 1; e <= 3 && budget > 0; e++) {
      var ar = centre - e * sensPrec;
      if (ar >= 0 && ar < COUNT && done[ar] && !bmp[ar] && !enCours[ar]) {
        preparer(ar); budget--;
      }
    }
    var k = recents.indexOf(centre);
    if (k >= 0) { recents.splice(k, 1); recents.push(centre); }  // garder le courant
  }

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
      prechauffer(want);
      if (bmp[want]) return bmp[want];
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
