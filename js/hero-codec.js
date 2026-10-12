



(function () {
  'use strict';

  if (!document.documentElement.classList.contains('js-anim')) return;
  if (!document.getElementById('jersey-canvas')) return;

  var coarse = window.matchMedia('(pointer: coarse)').matches;
  var narrow = window.matchMedia('(max-width: 1024px)').matches;
  if (!coarse && !narrow) return;

  if (typeof window.VideoDecoder !== 'function' ||
      typeof window.EncodedVideoChunk !== 'function' ||
      typeof window.MP4Box === 'undefined') {
    return;
  }

  var URL_MP4 = 'assets/video/jersey-scrub.mp4?v=8';
  var CACHE_MAX = 14;
  var AVANT = 6;
  var ARRIERE = 2;

  var samples = null;
  var decodeur = null;
  var COUNT = 0;
  var pret = 0;
  var cache = {};
  var ordre = [];
  var enVol = {};
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
      decodeur.decode(new window.EncodedVideoChunk({
        type: 'key',
        timestamp: i * 1000,
        duration: 1000,
        data: s.data
      }));
    } catch (e) {
      enVol[i] = false;
      renoncer('decode a echoue');
    }
  }

  function renoncer(raison) {
    if (abandonne) return;
    abandonne = true;
    window.tddCodecRaison = raison || 'inconnue';
    try { if (decodeur && decodeur.state !== 'closed') decodeur.close(); } catch (e) {}
    ordre.forEach(function (v) { if (cache[v]) { try { cache[v].close(); } catch (e) {} } });
    cache = {}; ordre = [];
    window.tddFrameSource = null;
    if (typeof window.tddSequenceFallback === 'function') window.tddSequenceFallback();
  }

  function description(fichier, piste) {
    var trak = fichier.getTrackById(piste.id);
    var entrees = trak.mdia.minf.stbl.stsd.entries;
    for (var i = 0; i < entrees.length; i++) {
      var box = entrees[i].avcC || entrees[i].hvcC || entrees[i].vpcC || entrees[i].av1C;
      if (box) {
        var DS = window.DataStream || window.MP4Box.DataStream;
        if (!DS) return null;
        var flux = new DS(undefined, 0, DS.BIG_ENDIAN);
        box.write(flux);
        return new Uint8Array(flux.buffer, 8);
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
      COUNT = piste.nb_samples || 0;
      SRC.count = COUNT;
      samples = recus;

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
          if (!SRC.ready) SRC.ready = true;
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
          optimizeForLatency: true
        });
      } catch (e) { renoncer('configure refuse : ' + e); return; }

      fichier.setExtractionOptions(piste.id, null, { nbSamples: 100000 });
      fichier.start();
    };

    fichier.onSamples = function (id, user, lot) {
      var premier = recus.length === 0;
      for (var i = 0; i < lot.length; i++) recus.push(lot[i]);
      if (premier) demander(0);
    };

    var offset = 0;

    function terminer() {
      try { fichier.flush(); } catch (e) {}
      if (!recus.length) { renoncer('aucun echantillon extrait'); return; }
      samples = recus;
      if (recus.length !== COUNT) { COUNT = recus.length; SRC.count = COUNT; }
    }

    fetch(URL_MP4).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      if (!r.body || !r.body.getReader) {
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

  window.tddFrameSource = SRC;
  demarrer();

  setTimeout(function () {
    if (!SRC.ready && !recusGlobal()) renoncer('rien recu en 12 s');
  }, 12000);

  function recusGlobal() { return !!(samples && samples.length); }
}());
