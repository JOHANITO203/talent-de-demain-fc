/* ==========================================================================
   Hero — décodage MATÉRIEL des images du maillot (WebCodecs)
   --------------------------------------------------------------------------
   POURQUOI
   Le coût dominant du héro sur mobile est le décodage d'image. Mesuré sur un
   Galaxy S23+, dans la page, pour une image de 900x1080 :
       WebP  13,9 ms      JPEG  8,1 ms      budget d'une image  16,7 ms
   Un décodeur d'IMAGE est logiciel. Un décodeur VIDÉO est une puce dédiée :
   elle sort la même définition en une à deux millisecondes. C'est exactement
   pour cela que le desktop est fluide — il lit une vidéo.

   WebCodecs donne accès à cette puce tout en gardant le pilotage au
   défilement, ce que l'élément <video> ne permettait pas de façon fiable sur
   mobile (le décodeur refuse de se réveiller sans geste utilisateur).

   COMMENT
   La vidéo est encodée tout-intra : chaque image est autonome. On peut donc
   décoder n'importe laquelle isolément, dans n'importe quel ordre — ce qui
   est précisément ce qu'exige un défilement qui va et vient.
   mp4box.js sert à ouvrir le conteneur MP4 et à en extraire les échantillons
   bruts ; WebCodecs ne sait pas lire un conteneur, seulement des images
   compressées.

   REPLI
   Si l'API manque, si le conteneur ne s'ouvre pas ou si le décodeur refuse,
   on rend la main à la séquence JPEG (js/hero-sequence.js), qui reste la
   voie éprouvée. Rien n'est perdu.
   ========================================================================== */

(function () {
  'use strict';

  if (!document.documentElement.classList.contains('js-anim')) return;
  if (!document.getElementById('jersey-canvas')) return;

  /* Même aiguillage que la séquence : appareils tactiles et fenêtres
     étroites. Le desktop garde son <video>, qui fonctionne parfaitement. */
  var coarse = window.matchMedia('(pointer: coarse)').matches;
  var narrow = window.matchMedia('(max-width: 1024px)').matches;
  if (!coarse && !narrow) return;

  if (typeof window.VideoDecoder !== 'function' ||
      typeof window.EncodedVideoChunk !== 'function' ||
      typeof window.MP4Box === 'undefined') {
    return;                       // la séquence JPEG prendra le relais
  }

  var URL_MP4 = 'assets/video/jersey-scrub.mp4?v=8';
  var CACHE_MAX = 14;             // images décodées gardées en mémoire
  var AVANT = 6;                  // images demandées devant le curseur
  var ARRIERE = 2;

  var samples = null;             // échantillons compressés, dans l'ordre
  var decodeur = null;
  var COUNT = 0;
  var pret = 0;                   // images décodées au moins une fois
  var cache = {};                 // index -> VideoFrame
  var ordre = [];                 // ordre d'usage, pour libérer
  var enVol = {};                 // décodages en cours
  var sens = 1, dernier = 0;
  var abandonne = false;

  var SRC = {
    ready: false,
    width: 900,
    height: 1080,
    count: 0,
    moteur: 'materiel',
    progress: function () { return COUNT ? Math.min(1, pret / COUNT) : 0; },
    frameAt: function (p) {
      if (!(p >= 0)) p = 0; else if (p > 1) p = 1;
      if (!COUNT) return null;
      var i = Math.round(p * (COUNT - 1));
      if (i !== dernier) { sens = i > dernier ? 1 : -1; dernier = i; }
      demander(i);
      if (cache[i]) { toucher(i); return cache[i]; }
      // la plus proche déjà décodée : la rotation se densifie au lieu de
      // s'arrêter sur du vide
      for (var d = 1; d < COUNT; d++) {
        if (cache[i - d]) { toucher(i - d); return cache[i - d]; }
        if (cache[i + d]) { toucher(i + d); return cache[i + d]; }
      }
      return null;
    }
  };

  function toucher(i) {
    var k = ordre.indexOf(i);
    if (k >= 0) ordre.splice(k, 1);
    ordre.push(i);
  }

  function liberer() {
    while (ordre.length > CACHE_MAX) {
      var v = ordre.shift();
      if (cache[v]) { try { cache[v].close(); } catch (e) {} delete cache[v]; }
    }
  }

  /* On ne noie pas le décodeur : au-delà de quelques images en attente, il
     rend la main plus tard qu'il ne le ferait en travaillant au fil de l'eau. */
  function demander(centre) {
    if (!decodeur || decodeur.state !== 'configured') return;
    if (decodeur.decodeQueueSize > 6) return;
    var i, k;
    for (k = 0; k <= AVANT; k++) {
      i = centre + k * sens;
      if (i >= 0 && i < COUNT && !cache[i] && !enVol[i]) { pousser(i); return; }
    }
    for (k = 1; k <= ARRIERE; k++) {
      i = centre - k * sens;
      if (i >= 0 && i < COUNT && !cache[i] && !enVol[i]) { pousser(i); return; }
    }
  }

  function pousser(i) {
    var s = samples[i];
    if (!s) return;
    enVol[i] = true;
    try {
      /* L'horodatage sert d'identifiant : c'est par lui qu'on retrouve
         l'index quand l'image ressort du décodeur. */
      decodeur.decode(new window.EncodedVideoChunk({
        type: 'key',                       // encodage tout-intra
        timestamp: i * 1000,
        duration: 1000,
        data: s.data
      }));
    } catch (e) {
      enVol[i] = false;
      renoncer('decode a echoue');
    }
  }

  /* Rendre la main à la séquence JPEG, proprement et une seule fois. */
  function renoncer(raison) {
    if (abandonne) return;
    abandonne = true;
    /* La raison est conservée : sans elle, impossible de distinguer une
       absence de matériel d'un défaut de code au moment du diagnostic. */
    window.tddCodecRaison = raison || 'inconnue';
    try { if (decodeur && decodeur.state !== 'closed') decodeur.close(); } catch (e) {}
    ordre.forEach(function (v) { if (cache[v]) { try { cache[v].close(); } catch (e) {} } });
    cache = {}; ordre = [];
    window.tddFrameSource = null;
    if (typeof window.tddSequenceFallback === 'function') window.tddSequenceFallback();
  }

  /* ---- Ouverture du conteneur ------------------------------------------- */
  function description(fichier, piste) {
    var trak = fichier.getTrackById(piste.id);
    var entrees = trak.mdia.minf.stbl.stsd.entries;
    for (var i = 0; i < entrees.length; i++) {
      var box = entrees[i].avcC || entrees[i].hvcC || entrees[i].vpcC || entrees[i].av1C;
      if (box) {
        /* DataStream est exposé comme variable globale par la bibliothèque,
           et non comme propriété de MP4Box — on accepte les deux. */
        var DS = window.DataStream || window.MP4Box.DataStream;
        if (!DS) return null;
        var flux = new DS(undefined, 0, DS.BIG_ENDIAN);
        box.write(flux);
        return new Uint8Array(flux.buffer, 8);   // sans l'en-tête de boîte
      }
    }
    return null;
  }

  function demarrer() {
    var fichier = window.MP4Box.createFile();
    var recus = [];

    fichier.onError = function (e) { renoncer('conteneur illisible : ' + e); };

    fichier.onReady = function (info) {
      var piste = info.videoTracks && info.videoTracks[0];
      if (!piste) { renoncer('aucune piste video'); return; }
      SRC.width = piste.video.width;
      SRC.height = piste.video.height;

      var desc = description(fichier, piste);
      if (!desc) { renoncer('description du codec introuvable'); return; }

      decodeur = new window.VideoDecoder({
        output: function (frame) {
          var i = Math.round(frame.timestamp / 1000);
          enVol[i] = false;
          if (abandonne) { try { frame.close(); } catch (e) {} return; }
          if (cache[i]) { try { frame.close(); } catch (e) {} return; }
          cache[i] = frame;
          ordre.push(i);
          pret++;
          liberer();
          if (!SRC.ready) SRC.ready = true;   // main.js démarre sur ce signal
        },
        error: function (e) { renoncer('decodeur en erreur : ' + e); }
      });

      var conf = {
        codec: piste.codec,
        codedWidth: piste.video.width,
        codedHeight: piste.video.height,
        description: desc,
        optimizeForLatency: true
      };
      window.tddCodecInfo = { codec: piste.codec, nb: piste.nb_samples,
                              taille: piste.video.width + 'x' + piste.video.height };
      if (window.VideoDecoder.isConfigSupported) {
        window.VideoDecoder.isConfigSupported(conf).then(function (r) {
          window.tddCodecSupporte = !!r.supported;
        }).catch(function () { window.tddCodecSupporte = false; });
      }

      try {
        decodeur.configure({
          codec: piste.codec,
          codedWidth: piste.video.width,
          codedHeight: piste.video.height,
          description: desc,
          optimizeForLatency: true          // on décode à la demande, pas en flux
        });
      } catch (e) { renoncer('configure refuse : ' + e); return; }

      fichier.setExtractionOptions(piste.id, null, { nbSamples: 100000 });
      fichier.start();
    };

    fichier.onSamples = function (id, user, lot) {
      for (var i = 0; i < lot.length; i++) recus.push(lot[i]);
    };

    /* Lecture PROGRESSIVE du conteneur.
       Charger les 8 Mo en un bloc échouait sur l'appareil du client
       (« Failed to fetch ») : une allocation unique de cette taille est
       fragile sur mobile. En flux, chaque morceau est remis à mp4box dès son
       arrivée — l'en-tête suffit à configurer le décodeur, et les premières
       images sont décodables bien avant la fin du téléchargement. */
    var offset = 0;

    function terminer() {
      try { fichier.flush(); } catch (e) {}
      if (!recus.length) { renoncer('aucun echantillon extrait'); return; }
      samples = recus;
      COUNT = recus.length;
      SRC.count = COUNT;
      demander(0);
    }

    fetch(URL_MP4).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      if (!r.body || !r.body.getReader) {          // navigateur sans flux
        return r.arrayBuffer().then(function (buf) {
          buf.fileStart = 0;
          fichier.appendBuffer(buf);
          terminer();
        });
      }
      var lecteur = r.body.getReader();
      function suite() {
        return lecteur.read().then(function (bloc) {
          if (bloc.done) { terminer(); return; }
          var buf = bloc.value.buffer.slice(bloc.value.byteOffset,
                                            bloc.value.byteOffset + bloc.value.byteLength);
          buf.fileStart = offset;
          offset += buf.byteLength;
          fichier.appendBuffer(buf);
          return suite();
        });
      }
      return suite();
    }).catch(function (e) { renoncer('telechargement : ' + e); });
  }

  /* Le créneau est réservé avant même le chargement : la séquence JPEG voit
     qu'une source existe et se met en réserve au lieu de télécharger 13 Mo
     en parallèle pour rien. */
  window.tddFrameSource = SRC;
  demarrer();

  /* Filet : si rien n'est décodé au bout de six secondes, on rend la main. */
  setTimeout(function () { if (!SRC.ready) renoncer('aucune image en 6 s'); }, 6000);
}());
