




(function () {
  'use strict';

  if (!document.documentElement.classList.contains('js-anim')) return;
  if (!document.getElementById('jersey-canvas')) return;

  var coarse = window.matchMedia('(pointer: coarse)').matches;
  var narrow = window.matchMedia('(max-width: 1024px)').matches;
  if (!coarse && !narrow) return;

  if (window.tddFrameSource) {
    window.tddSequenceFallback = demarrerSequence;
    return;
  }
  demarrerSequence();

  function demarrerSequence() {
    window.tddSequenceFallback = null;

  var COUNT = 193;

  var DIR = 'assets/frames-jpg/';
  var EXT = '.jpg';
  var VER = '?v=1';
  var STRIDE = 4;

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
      if (!SRC.ready) SRC.ready = true;
      if (then) then();
    };
    img.onerror = function () { if (then) then(); };
    img.src = DIR + 'f_' + pad(i + 1) + EXT + VER;
  }

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

  var SRC = {
    ready: false,
    width: 900,
    height: 1080,
    count: COUNT,
    progress: function () { return loadedCount / COUNT; },

    frameAt: function (p) {
      if (!(p >= 0)) p = 0; else if (p > 1) p = 1;
      var want = Math.round(p * (COUNT - 1));
      if (done[want]) return imgs[want];
      for (var d = 1; d < COUNT; d++) {
        if (want - d >= 0 && done[want - d]) return imgs[want - d];
        if (want + d < COUNT && done[want + d]) return imgs[want + d];
      }
      return null;
    }
  };

  window.tddFrameSource = SRC;

  load(0, function () {
    queue(wave1.slice(1), 6, function () { queue(wave2, 6); });
  });
  }
}());
