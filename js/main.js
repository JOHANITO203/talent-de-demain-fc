
(function () {
  'use strict';

  var track    = document.getElementById('hero-track');
  var video    = document.getElementById('jersey-video');
  var canvas   = document.getElementById('jersey-canvas');
  var jersey   = document.getElementById('jersey');
  var progress = document.getElementById('scroll-progress');
  var titleLines = document.querySelectorAll('.hero-title__line');

  var storyItems = Array.prototype.map.call(
    document.querySelectorAll('.story__item'),
    function (el) {
      return {
        el: el,
        from: parseFloat(el.dataset.from),
        to: parseFloat(el.dataset.to),
        right: el.classList.contains('story__item--right')
      };
    }
  );
  var rotLabel = document.getElementById('rotation-label');
  var rotLine  = document.getElementById('rotation-line');
  var rotDeg   = document.getElementById('rotation-deg');
  var heroTitle = document.querySelector('.hero-title');

  titleLines.forEach(function (line, li) {
    var text = line.textContent;
    line.textContent = '';
    line.setAttribute('aria-hidden', 'true');
    for (var k = 0; k < text.length; k++) {
      var ch = document.createElement('span');
      ch.className = 'char';
      ch.style.setProperty('--i', k + li * 6);
      ch.textContent = text[k] === ' ' ? ' ' : text[k];
      line.appendChild(ch);
    }
  });
  (document.fonts && document.fonts.ready
    ? document.fonts.ready : Promise.resolve()).then(function () {
    requestAnimationFrame(function () {
      document.documentElement.classList.add('is-ready');
      titleLines.forEach(function (l) { l.classList.add('is-in'); });
    });
  });
  setTimeout(function () {
    document.documentElement.classList.add('is-ready');
    titleLines.forEach(function (l) { l.classList.add('is-in'); });
  }, 1200);

  if (!track || !video || !canvas) return;

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var T = (window.TDD_I18N && window.TDD_I18N.t) || { scroll: 'Scroll', rotation: 'Rotation' };



  var sticky = document.querySelector('.hero-sticky');
  var copyEl = document.querySelector('.hero-copy');
  var cardEl = document.querySelector('.media-card');
  var meterEl = document.getElementById('rotation-meter');
  var storyEl = document.querySelector('.story__item');

  function topOf(el) {
    if (!el) return Infinity;
    var cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') return Infinity;
    return el.getBoundingClientRect().top;
  }

  var titleEl = document.querySelector('.hero-title');
  var stacked = window.matchMedia('(max-width: 900px)');

  function navH0() {
    var n = document.querySelector('.nav');
    return n ? n.offsetHeight : 0;
  }

  function syncJerseyBand() {
    if (!stacked.matches) {
      sticky.style.removeProperty('--jersey-h');
      sticky.style.removeProperty('--jersey-bottom');
      return;
    }
    if (!copyEl) return;
    var vh = window.innerHeight;
    var sTop = sticky.getBoundingClientRect().top;

    var navEl2 = document.querySelector('.nav');
    var bandTop = sTop + (navEl2 ? navEl2.offsetHeight : 0) + 6;
    var bandBottom = sTop + copyEl.offsetTop - 8;


    var copyY = sTop + copyEl.offsetTop;
    var restFromBottom = vh - copyY;

    var GROW = 1.2;
    var MARGE_HAUT = 0.116;
    var libre = (copyY - 10 - (navH0() + 6)) / (GROW * (1 - MARGE_HAUT));
    var h = Math.min(vh * 0.395, libre);
    sticky.style.setProperty('--jersey-h', h + 'px');
    var mH0 = meterEl ? meterEl.offsetHeight : 30;
    sticky.style.setProperty('--story-bottom',
      (restFromBottom + 4 + mH0 + 2) + 'px');
    sticky.style.setProperty('--jersey-bottom', (restFromBottom + 10) + 'px');
    sticky.style.setProperty('--meter-touch', (restFromBottom + 4) + 'px');
  }

  var dernierH = 0, dernierW = 0;

  function syncHeroLayout(force) {
    if (!sticky) return;
    var vh = window.innerHeight;
    if (!force && dernierW === window.innerWidth
        && Math.abs(vh - dernierH) < 24 && dernierH) return;
    dernierH = vh; dernierW = window.innerWidth;

    sticky.style.removeProperty('--meter-bottom');

    var copyTop = topOf(copyEl);
    var cardTop = topOf(cardEl);
    var GAP = 22;

    var storyH = 92;
    document.querySelectorAll('.story__item').forEach(function (el) {
      if (el.offsetHeight > storyH) storyH = el.offsetHeight;
    });

    if (!stacked.matches) {
      var wanted = vh * 0.46, ceiling = vh * 0.14;
      sticky.style.setProperty('--story-top-l',
        Math.max(ceiling, Math.min(wanted, copyTop - storyH - GAP)) + 'px');
      sticky.style.setProperty('--story-top-r',
        Math.max(ceiling, Math.min(wanted, cardTop - storyH - GAP)) + 'px');
    }

    sticky.style.setProperty('--copy-clear',
      Math.max(0, vh - copyTop + 14) + 'px');

    syncJerseyBand();

    if (meterEl && copyEl && vh && meterEl.offsetParent === sticky) {
      var mW = meterEl.offsetWidth, mH = meterEl.offsetHeight;
      var sRect = sticky.getBoundingClientRect();
      var mTop  = sRect.top + meterEl.offsetTop;
      var mLeft = sRect.left + meterEl.offsetLeft - mW / 2;
      var c = copyEl.getBoundingClientRect();
      var overX = Math.min(mLeft + mW, c.right) - Math.max(mLeft, c.left);
      var overY = Math.min(mTop + mH, c.bottom) - Math.max(mTop, c.top);
      if (overX > 2 && overY > 2) {
        sticky.style.setProperty('--meter-bottom', (vh - c.top + 14) + 'px');
      }
    }
  }

  window.addEventListener('resize', syncHeroLayout);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { syncHeroLayout(true); });
  }
  setTimeout(function () { syncHeroLayout(true); }, 0);
  setTimeout(function () { syncHeroLayout(true); }, 1300);

  if (window.ResizeObserver && copyEl) {
    new ResizeObserver(function () { syncHeroLayout(true); }).observe(copyEl);
  }

  var scrubOverride = parseFloat(
    new URLSearchParams(location.search).get('scrub')
  );
  var hasOverride = !isNaN(scrubOverride);

  var pisteVh = parseFloat(new URLSearchParams(location.search).get('piste'));
  if (!isNaN(pisteVh) && pisteVh >= 120 && pisteVh <= 600) {
    track.style.height = pisteVh + 'vh';
  }

  var frameSrc = window.tddFrameSource || null;

  var isSmall = window.matchMedia('(max-width: 767px)').matches;

  var hiDpi = (window.devicePixelRatio || 1) >= 1.5;
  var srcUrl = (isSmall
    ? 'assets/video/jersey-scrub-540.mp4'
    : (hiDpi ? 'assets/video/jersey-scrub-1350.mp4'
             : 'assets/video/jersey-scrub.mp4')) + '?v=8';
  var srcFps = 24;

  if (!frameSrc) {
    fetch(srcUrl)
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.blob(); })
      .then(function (blob) { video.src = URL.createObjectURL(blob); video.load(); })
      .catch(function () { video.src = srcUrl; video.load(); });
  }

  var VERT =
    'attribute vec2 aPos;' +
    'varying vec2 vUv;' +
    'void main(){' +
    '  vUv = vec2(aPos.x * .5 + .5, .5 - aPos.y * .5);' +
    '  gl_Position = vec4(aPos, 0., 1.);' +
    '}';

  var FRAG =
    'precision mediump float;' +
    'uniform sampler2D uTex;' +
    'uniform vec2 uTexel;' +
    'varying vec2 vUv;' +
    'void main(){' +
    '  vec3 c = texture2D(uTex, vUv).rgb;' +
    '  vec3 nb = texture2D(uTex, vUv + vec2(uTexel.x, 0.)).rgb' +
    '          + texture2D(uTex, vUv - vec2(uTexel.x, 0.)).rgb' +
    '          + texture2D(uTex, vUv + vec2(0., uTexel.y)).rgb' +
    '          + texture2D(uTex, vUv - vec2(0., uTexel.y)).rgb;' +
    '  vec3 cSharp = clamp(c + (c - nb * .25) * .55, 0., 1.);' +
    '  vec3 bgL = texture2D(uTex, vec2(.015, vUv.y)).rgb;' +
    '  vec3 bgR = texture2D(uTex, vec2(.985, vUv.y)).rgb;' +
    '  vec3 bgEst = .5 * (bgL + bgR);' +
    '  float d = length(c - bgEst);' +
    '  float alpha = smoothstep(.055, .13, d);' +
    '  float sat = max(c.r, max(c.g, c.b)) - min(c.r, min(c.g, c.b));' +
    '  alpha = max(alpha, smoothstep(.08, .18, sat));' +
    '  float lum   = dot(c,     vec3(.299, .587, .114));' +
    '  float bgLum = dot(bgEst, vec3(.299, .587, .114));' +
    '  alpha = max(alpha, smoothstep(.03, .08, lum - bgLum));' +
    '  vec2 hd = (vUv - vec2(.5, .52)) * vec2(1., .8);' +
    '  float halo = (1. - smoothstep(.10, .38, length(hd))) * .18;' +
    '  alpha = max(alpha, halo);' +
    '  gl_FragColor = vec4(cSharp * alpha, alpha);' +
    '}';

  var gl = null, glTex = null, glTexelLoc = null;

  function initWebGL() {
    gl = canvas.getContext('webgl', {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false
    });
    if (!gl) return false;

    function compile(type, src) {
      var s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) return null;
      return s;
    }
    var vs = compile(gl.VERTEX_SHADER, VERT);
    var fs = compile(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) { gl = null; return false; }

    var prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { gl = null; return false; }
    gl.useProgram(prog);

    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(prog, 'aPos');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    glTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, glTex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    gl.uniform1i(gl.getUniformLocation(prog, 'uTex'), 0);
    glTexelLoc = gl.getUniformLocation(prog, 'uTexel');
    gl.uniform2f(glTexelLoc, 1 / 900, 1 / 1080);
    return true;
  }

  var ctx2d = null;
  if (!initWebGL()) {
    document.documentElement.classList.add('no-webgl');
    ctx2d = canvas.getContext('2d');
  }

  var duration = 0;
  var target   = 0;
  var smooth   = 0;
  var vSmooth  = 0;
  var seekBusy = false;
  var pendingT = -1;

  function resizeCanvas() {
    var rect = canvas.getBoundingClientRect();
    var dpr  = Math.min(window.devicePixelRatio || 1, 2);
    var w = Math.round(rect.width  * dpr);
    var h = Math.round(rect.height * dpr);
    if (frameSrc) {
      var real = window.devicePixelRatio || 1;
      w = Math.min(Math.round(rect.width  * real), frameSrc.width);
      h = Math.min(Math.round(rect.height * real), frameSrc.height);
    }
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width  = w;
      canvas.height = h;
      if (gl) gl.viewport(0, 0, w, h);
      lastPainted = null;
      drawFrame();
    }
  }

  var lastPainted = null;

  function drawFrame() {
    var pixels = video;
    if (frameSrc) {
      pixels = frameSrc.frameAt(vSmooth);
      if (!pixels || pixels === lastPainted) return;
      lastPainted = pixels;
    } else if (video.readyState < 2) {
      return;
    }
    if (gl) {
      gl.bindTexture(gl.TEXTURE_2D, glTex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    } else if (ctx2d) {
      ctx2d.drawImage(pixels, 0, 0, canvas.width, canvas.height);
    }
  }

  var seekTimer = 0;
  var seekFails = 0;
  var loopMode = false;

  function primeDecoder() {
    try {
      var p = video.play();
      if (p && p.then) {
        p.then(function () { video.pause(); drawFrame(); })
         .catch(function () {   });
      } else {
        video.pause();
      }
    } catch (e) {   }
  }

  function drawWhenReady() {
    drawFrame();
    if (video.requestVideoFrameCallback) {
      try { video.requestVideoFrameCallback(function () { drawFrame(); }); }
      catch (e) {   }
    }
  }

  function enterLoopMode() {
    if (loopMode) return;
    loopMode = true;
    video.loop = true;
    video.play().catch(function () {});
  }

  function requestSeek(t) {
    if (loopMode || seekBusy) { if (!loopMode) pendingT = t; return; }
    seekBusy = true;
    video.currentTime = t;
    clearTimeout(seekTimer);
    seekTimer = setTimeout(function () {
      seekBusy = false;
      if (++seekFails >= 3) enterLoopMode();
    }, 600);
  }

  video.addEventListener('seeked', function () {
    clearTimeout(seekTimer);
    seekFails = 0;
    drawWhenReady();
    seekBusy = false;
    if (pendingT >= 0) {
      var t = pendingT;
      pendingT = -1;
      requestSeek(t);
    }
  });

  function readScroll() {
    if (hasOverride) { target = Math.min(1, Math.max(0, scrubOverride)); return; }
    var runway = track.offsetHeight - window.innerHeight;
    if (runway <= 0) { target = 0; return; }
    var y = -track.getBoundingClientRect().top;
    target = Math.min(1, Math.max(0, y / runway));
  }

  window.addEventListener('scroll', function () {
    if (introActive && window.pageYOffset > 2) introActive = false;
    readScroll();
  }, { passive: true });
  window.addEventListener('resize', function () { readScroll(); resizeCanvas(); });

  var recalcTimer = 0;
  var wasOverHero = null;
  var lastNow = 0;
  var frames = 0;

  var INTRO_SPIN_MS = 4200;
  var INTRO_RISE_MS = 900;
  var introActive = false;
  var introT0 = -1;

  var FRAME_STEP = 1 / srcFps;

  function tick(now) {
    var rise = 0;

    readScroll();

    var navEl = document.querySelector('.nav');
    var navH = navEl ? navEl.offsetHeight : 0;
    if (Math.abs(window.innerHeight - dernierH) >= 24) {
      clearTimeout(recalcTimer);
      recalcTimer = setTimeout(function () { syncHeroLayout(true); }, 90);
    }

    var overHero = track.getBoundingClientRect().bottom > navH + 170;
    if (overHero !== wasOverHero) {
      wasOverHero = overHero;
      document.documentElement.classList.toggle('is-over-hero', overHero);
    }
    if (introActive && window.pageYOffset > 2) introActive = false;

    var dt = lastNow ? Math.min(now - lastNow, 100) : 16.7;
    lastNow = now;
    frames++;

    var gap = Math.abs(target - vSmooth);
    var snap = 0.42 - 0.28 * Math.min(1, gap * 14);
    var k = 1 - Math.pow(1 - snap, dt / 16.7);

    if (introActive) {
      if (introT0 < 0) introT0 = now;
      var p = Math.min(1, (now - introT0) / INTRO_SPIN_MS);
      vSmooth = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      var r = Math.min(1, (now - introT0) / INTRO_RISE_MS);
      rise = 26 * Math.pow(1 - r, 3);
      if (p >= 1) { introActive = false; vSmooth = 0; }
    } else {
      vSmooth += (target - vSmooth) * k;
    }

    smooth += (target - smooth) * k;
    if (hasOverride) { smooth = target; vSmooth = target; }

    if (frameSrc) {
      drawFrame();
    } else if (loopMode) {
      drawFrame();
    } else if (duration > 0) {
      var t = Math.min(vSmooth * duration, duration - 0.05);
      if (Math.abs(t - video.currentTime) > FRAME_STEP / 2) {
        requestSeek(t);
      }
    }

    var drift = smooth * 13;
    titleLines.forEach(function (line) {
      var dir = parseFloat(line.dataset.parallax || '0');
      line.style.transform = 'translateX(' + (dir * drift) + 'vw)' +
                             ' scale(' + (1 - smooth * 0.09).toFixed(4) + ')';
      line.style.letterSpacing = (-smooth * 0.022).toFixed(4) + 'em';
    });
    if (heroTitle) {
      heroTitle.style.opacity = (1 - smooth * 0.6).toFixed(3);
    }
    if (jersey) {
      jersey.style.transform =
        'translateY(' + rise.toFixed(1) + 'px) scale(' + (1 + smooth * 0.2) + ')';
    }
    if (progress) {
      progress.style.transform = 'scaleY(' + smooth + ')';
    }

    var FADE = 0.05;
    storyItems.forEach(function (s) {
      var a = Math.min((smooth - s.from) / FADE, (s.to - smooth) / FADE, 1);
      a = Math.max(0, Math.min(1, a));
      var shift = (1 - a) * 18 * (s.right ? 1 : -1);
      s.el.style.opacity = a.toFixed(3);
      s.el.style.transform = 'translateX(' + shift.toFixed(1) + 'px)';
      s.el.style.setProperty('--t', a.toFixed(3));
    });

    var deg = Math.round(vSmooth * 360);
    if (rotDeg)  rotDeg.textContent = deg + '°';
    if (rotLine) {
      rotLine.style.clipPath = 'inset(0 ' + ((1 - vSmooth) * 100).toFixed(2) + '% 0 0)';
      if (rotLine.parentNode) {
        rotLine.parentNode.style.setProperty('--p', (vSmooth * 100).toFixed(2) + '%');
      }
    }
    if (rotLabel) {
      rotLabel.style.opacity = vSmooth < 0.02 ? '1' : '.45';
      rotLabel.textContent = vSmooth < 0.02 ? T.scroll : T.rotation;
    }

    requestAnimationFrame(tick);
  }

  var booted = false;

  function onMeta() {
    if (frameSrc) {
      if (gl && glTexelLoc) {
        gl.uniform2f(glTexelLoc, 1 / frameSrc.width, 1 / frameSrc.height);
      }
      resizeCanvas();
      return;
    }
    duration = video.duration;
    if (gl && glTexelLoc && video.videoWidth) {
      gl.uniform2f(glTexelLoc, 1 / video.videoWidth, 1 / video.videoHeight);
    }
    resizeCanvas();
  }

  function onReady() {
    if (booted) return;
    booted = true;
    drawFrame();
    if (!frameSrc) primeDecoder();
    readScroll();
    if (!hasOverride && !reducedMotion && window.pageYOffset < 4) {
      introActive = true;
      introT0 = -1;
    }
    requestAnimationFrame(tick);
  }

  function bootVideo() {
    video.addEventListener('loadedmetadata', onMeta);
    video.addEventListener('loadeddata', onReady, { once: true });

    if (video.readyState >= 1) onMeta();
    if (video.readyState >= 2) onReady();
  }

  if (frameSrc) {
    var waited = 0;
    (function awaitFirstFrame() {
      if (frameSrc.ready) { onMeta(); onReady(); return; }
      if (++waited > 600) {
        frameSrc = null;
        lastPainted = null;
        fetch(srcUrl)
          .then(function (r) { if (!r.ok) throw new Error(r.status); return r.blob(); })
          .then(function (blob) { video.src = URL.createObjectURL(blob); video.load(); })
          .catch(function () { video.src = srcUrl; video.load(); });
        bootVideo();
        return;
      }
      requestAnimationFrame(awaitFirstFrame);
    }());
  } else {
    bootVideo();
  }

  if (/[?&]diag=1/.test(location.search)) {
    var probe = document.createElement('pre');
    probe.style.cssText = 'position:fixed;left:0;right:0;top:0;z-index:9999;' +
      'margin:0;padding:7px;font:11px/1.4 monospace;white-space:pre-wrap;' +
      'background:rgba(0,0,0,.85);color:#3f6;pointer-events:none';
    document.body.appendChild(probe);
    var pFrames = 0, pTime = 0;
    setInterval(function () {
      var t = Date.now();
      var fps = pTime ? Math.round((frames - pFrames) * 1000 / (t - pTime)) : 0;
      pFrames = frames; pTime = t;
      var b = jersey.getBoundingClientRect();
      var c = canvas.getBoundingClientRect();
      probe.textContent =
        'ecran ' + window.innerWidth + 'x' + window.innerHeight +
          ' dpr' + (window.devicePixelRatio || 1) +
          '  source=' + (frameSrc ? 'images ' + Math.round(frameSrc.progress() * 100) + '%'
                                  : 'video') + '\n' +
        'bande  ' + Math.round(b.left) + '..' + Math.round(b.right) + '\n' +
        'maillot ' + Math.round(c.left) + '..' + Math.round(c.right) +
          '   centre ' + Math.round((c.left + c.right) / 2) +
          ' / attendu ' + Math.round(window.innerWidth / 2) + '\n' +
        'haut ' + Math.round(c.top) + '  bas ' + Math.round(c.bottom) +
          '   rotation ' + Math.round(vSmooth * 360) + 'deg' +
          '   defilement ' + Math.round(target * 100) + '%\n' +
        'scrollY ' + Math.round(window.pageYOffset) +
          '  piste ' + Math.round(track.getBoundingClientRect().top) +
          '..' + track.offsetHeight +
          '  course ' + Math.round(track.offsetHeight - window.innerHeight) +
          '   ' + fps + ' im/s\n' +
        'piste ' + Math.round(track.offsetHeight / window.innerHeight * 100) + 'vh' +
          '   ~' + (193 * 150 /
            Math.max(1, track.offsetHeight - window.innerHeight)).toFixed(1) +
          ' pas/s au doigt lent  (cinema 24)\n' +
        'mouvement reduit : ' + (reducedMotion ? 'OUI' : 'non') +
          '   webgl ' + (gl ? 'oui' : 'NON');
    }, 300);
  }
})();
