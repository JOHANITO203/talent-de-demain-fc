/* ==========================================================================
   Talent de Demain FC — scroll-driven jersey rotation
   --------------------------------------------------------------------------
   The rotation is an IMAGE SEQUENCE, not a video. That decision was forced by
   real devices: a <video> only yields frames once the browser agrees to play
   it, and phones routinely refuse — data saver, battery saver, autoplay
   policy — leaving the hero frozen on frame one. Seeking a paused video is
   just as unreliable there.

   49 stills cover the full turn. They are lighter than the clip they replace
   (2.2 MB against 8.3 MB desktop, 0.9 MB on phones), they need no codec, no
   playback permission and no seeking, so desktop and mobile behave the same.

   1. The hero is pinned (position: sticky) inside a tall scroll runway
      (.hero-track); scroll through it maps 0→1.
   2. That value is smoothed with a lerp in a requestAnimationFrame loop and
      converted to a frame index — forwards and backwards.
   3. WebGL keys the studio backdrop out of each still in real time, sampling
      the frame's own left/right margins, so the jersey melts into the page.
      A 2D-canvas + CSS-blend fallback covers browsers without WebGL.
   ========================================================================== */

(function () {
  'use strict';

  var track    = document.getElementById('hero-track');
  var canvas   = document.getElementById('jersey-canvas');
  var jersey   = document.getElementById('jersey');
  var progress = document.getElementById('scroll-progress');
  var titleLines = document.querySelectorAll('.hero-title__line');

  /* Scroll-story elements (captions synced to rotation windows) */
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

  /* ---- Kinetic headline entrance -----------------------------------------
     Split each title line into per-letter spans; letters rise out of the
     line's overflow mask with a staggered ease (see .char in styles.css).
     Line 2 starts a few steps after line 1. Waits for the display font so
     the animation never plays on a fallback face. */
  titleLines.forEach(function (line, li) {
    var text = line.textContent;
    line.textContent = '';
    line.setAttribute('aria-hidden', 'true'); // h1 keeps its aria-label
    for (var k = 0; k < text.length; k++) {
      var ch = document.createElement('span');
      ch.className = 'char';
      ch.style.setProperty('--i', k + li * 6);
      ch.textContent = text[k] === ' ' ? ' ' : text[k];
      line.appendChild(ch);
    }
  });
  /* Load-in choreography: `is-ready` releases every element from its offset
     start position (see the "Load-in choreography" block in styles.css).
     Fired on font-ready, never on the video, so the page settles even if the
     clip is slow or fails. */
  (document.fonts && document.fonts.ready
    ? document.fonts.ready : Promise.resolve()).then(function () {
    requestAnimationFrame(function () {
      document.documentElement.classList.add('is-ready');
      titleLines.forEach(function (l) { l.classList.add('is-in'); });
    });
  });
  // Safety net: never leave the page hidden if the font promise never settles.
  setTimeout(function () {
    document.documentElement.classList.add('is-ready');
    titleLines.forEach(function (l) { l.classList.add('is-in'); });
  }, 1200);

  if (!track || !canvas) return;

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Runtime copy in the active language (see js/i18n.js) */
  var T = (window.TDD_I18N && window.TDD_I18N.t) || { scroll: 'Scroll', rotation: 'Rotation' };

  /* Horizontal placement of the jersey: centred everywhere except on a phone
     held sideways, where the hero lays out side by side (see styles.css).
     Resolved here in JS so the transform string stays plain CSS. */
  var landscapeHero = window.matchMedia(
    '(max-width: 950px) and (max-height: 520px) and (orientation: landscape)');
  var jerseyX = landscapeHero.matches ? '0px' : '-50%';
  function syncJerseyX() { jerseyX = landscapeHero.matches ? '0px' : '-50%'; }
  if (landscapeHero.addEventListener) landscapeHero.addEventListener('change', syncJerseyX);
  else if (landscapeHero.addListener) landscapeHero.addListener(syncJerseyX);   // older Safari
  window.addEventListener('resize', syncJerseyX);

  /* Debug hook: ?scrub=0.5 freezes the scrub at a fixed progress
     (used for visual QA screenshots — inert in normal use). */
  var scrubOverride = parseFloat(
    new URLSearchParams(location.search).get('scrub')
  );
  var hasOverride = !isNaN(scrubOverride);

  /* ---- Frame sequence ---------------------------------------------------
     Phones get the half-size set. Every still is fetched up front: the whole
     sequence is smaller than a single second of the video it replaces, and a
     half-loaded rotation would stutter. */
  var isSmall = window.matchMedia('(max-width: 767px)').matches;
  var FRAMES = 49;
  var PREFIX = 'assets/seq/' + (isSmall ? 'm_' : 'd_');
  var frames = [];
  var framesReady = 0;

  function pad(n) { return n < 10 ? '00' + n : n < 100 ? '0' + n : '' + n; }

  for (var fi = 1; fi <= FRAMES; fi++) {
    (function (i) {
      var img = new Image();
      img.decoding = 'async';
      img.onload = function () {
        framesReady++;
        if (i === 1) { onFirstFrame(); }      // paint as soon as we can
      };
      img.onerror = function () { framesReady++; };
      img.src = PREFIX + pad(i) + '.webp?v=1';
      frames[i - 1] = img;
    })(fi);
  }

  /* ======================================================================
     WebGL renderer — keys the studio backdrop out of each frame
     ====================================================================== */
  var VERT =
    'attribute vec2 aPos;' +
    'varying vec2 vUv;' +
    'void main(){' +
    '  vUv = vec2(aPos.x * .5 + .5, .5 - aPos.y * .5);' + // flip Y for video
    '  gl_Position = vec4(aPos, 0., 1.);' +
    '}';

  var FRAG =
    'precision mediump float;' +
    'uniform sampler2D uTex;' +
    'uniform vec2 uTexel;' +   // 1 / video resolution, for the sharpen taps
    'varying vec2 vUv;' +
    'void main(){' +
    '  vec3 c = texture2D(uTex, vUv).rgb;' +
       // 5-tap unsharp mask at display time: crisper fabric and crest.
       // The keying below uses the UNsharpened color so edge halos never
       // disturb the backdrop estimate.
    '  vec3 nb = texture2D(uTex, vUv + vec2(uTexel.x, 0.)).rgb' +
    '          + texture2D(uTex, vUv - vec2(uTexel.x, 0.)).rgb' +
    '          + texture2D(uTex, vUv + vec2(0., uTexel.y)).rgb' +
    '          + texture2D(uTex, vUv - vec2(0., uTexel.y)).rgb;' +
    '  vec3 cSharp = clamp(c + (c - nb * .25) * .55, 0., 1.);' +
       // Estimate the backdrop color for THIS row from the frame's own
       // left/right margins (the jersey never reaches them).
       // NO mid-frame brightness compensation: the current clip sits on a
       // flat white backdrop, and boosting the estimate there made the
       // centre of the backdrop differ from itself — which the key below
       // read as foreground and rendered as a bright haze over the headline.
    '  vec3 bgL = texture2D(uTex, vec2(.015, vUv.y)).rgb;' +
    '  vec3 bgR = texture2D(uTex, vec2(.985, vUv.y)).rgb;' +
    '  vec3 bgEst = .5 * (bgL + bgR);' +
       // Distance from the estimated backdrop → cutout alpha.
    '  float d = length(c - bgEst);' +
    '  float alpha = smoothstep(.055, .13, d);' +
       // Guard: strongly colored pixels (jersey red) are always opaque.
    '  float sat = max(c.r, max(c.g, c.b)) - min(c.r, min(c.g, c.b));' +
    '  alpha = max(alpha, smoothstep(.08, .18, sat));' +
       // Guard: pixels clearly BRIGHTER than the backdrop (white stripes,
       // collar) are jersey fabric — keep them fully opaque.
    '  float lum   = dot(c,     vec3(.299, .587, .114));' +
    '  float bgLum = dot(bgEst, vec3(.299, .587, .114));' +
    '  alpha = max(alpha, smoothstep(.03, .08, lum - bgLum));' +
       // Studio halo: keep part of the REAL backdrop (its soft light and
       // vignette) in an elliptical zone around the jersey, fading to zero
       // well before the frame edges — restores the photographic depth the
       // hard cutout removed, with no visible rectangle.
       // Kept deliberately faint: this clip sits on a near-white backdrop
       // (254) while the page is a warm off-white (240), so a strong halo
       // reads as a bright smear that washes out the headline behind it.
    '  vec2 hd = (vUv - vec2(.5, .52)) * vec2(1., .8);' +
    '  float halo = (1. - smoothstep(.10, .38, length(hd))) * .18;' +
    '  alpha = max(alpha, halo);' +
       // Premultiplied output (canvas is composited premultiplied);
       // the sharpened color carries the extra detail.
    '  gl_FragColor = vec4(cSharp * alpha, alpha);' +
    '}';

  var gl = null, glTex = null, glTexelLoc = null;

  function initWebGL() {
    gl = canvas.getContext('webgl', {
      alpha: true, premultipliedAlpha: true, antialias: false
    });
    if (!gl) return false;

    function compile(type, src) {
      var sh = gl.createShader(type);
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      return gl.getShaderParameter(sh, gl.COMPILE_STATUS) ? sh : null;
    }
    var vs = compile(gl.VERTEX_SHADER, VERT), fs = compile(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) { gl = null; return false; }

    var prog = gl.createProgram();
    gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
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
    gl.uniform2f(glTexelLoc, 1 / (isSmall ? 450 : 900), 1 / (isSmall ? 540 : 1080));
    return true;
  }

  var ctx2d = null;
  if (!initWebGL()) {
    document.documentElement.classList.add('no-webgl');   // CSS blend fallback
    ctx2d = canvas.getContext('2d');
  }

  /* ---- State ------------------------------------------------------------ */
  var target  = 0;    // raw scroll progress 0..1
  var smooth  = 0;    // lerped, drives the LAYOUT effects
  var vSmooth = 0;    // lerped, drives the ROTATION
  var drawn   = -1;   // frame index currently on the canvas

  /* ---- Canvas sizing (device-pixel-ratio aware) -------------------------- */
  function resizeCanvas() {
    var rect = canvas.getBoundingClientRect();
    var dpr = Math.min(window.devicePixelRatio || 1, 2);   // cap DPR: perf
    var w = Math.round(rect.width * dpr), h = Math.round(rect.height * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w; canvas.height = h;
      if (gl) gl.viewport(0, 0, w, h);
      drawn = -1;                 // force a repaint at the new size
      paint(vSmooth);
    }
  }

  /* ---- Painting ----------------------------------------------------------
     Only touches the canvas when the frame actually changes, so scrolling
     within one step costs nothing. */
  function paint(p) {
    var idx = Math.round(Math.max(0, Math.min(1, p)) * (FRAMES - 1));
    if (idx === drawn) return;
    var img = frames[idx];
    if (!img || !img.complete || !img.naturalWidth) return;   // not here yet
    if (gl) {
      gl.bindTexture(gl.TEXTURE_2D, glTex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    } else if (ctx2d) {
      ctx2d.clearRect(0, 0, canvas.width, canvas.height);
      ctx2d.drawImage(img, 0, 0, canvas.width, canvas.height);
    }
    drawn = idx;
  }

  /* ---- Autoplay intro ------------------------------------------------------
     On load the jersey turns a full circle by itself, then hands over to the
     scroll. Only the ROTATION follows the intro curve — the layout effects
     keep tracking the (still idle) scroll, so nothing snaps when it ends.
     The turn is seamless, so landing back on 0 is invisible. Any scroll
     cancels it and the rotation sweeps smoothly to the scroll position. */
  var INTRO_SPIN_MS = 4200;
  var INTRO_RISE_MS = 900;
  var introActive = false;
  var introT0 = -1;

  /* ---- Scroll progress --------------------------------------------------- */
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

  /* ---- Main loop --------------------------------------------------------- */
  function tick(now) {
    var rise = 0;

    if (introActive) {
      if (introT0 < 0) introT0 = now;
      var p = Math.min(1, (now - introT0) / INTRO_SPIN_MS);
      // easeInOutCubic
      vSmooth = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      rise = 26 * Math.pow(1 - Math.min(1, (now - introT0) / INTRO_RISE_MS), 3);
      if (p >= 1) { introActive = false; vSmooth = 0; }
    } else {
      vSmooth += (target - vSmooth) * 0.14;
    }

    smooth += (target - smooth) * 0.14;                 // layout follows scroll
    if (hasOverride) { smooth = target; vSmooth = target; }

    paint(vSmooth);

    // Headline drifts apart and recedes; the jersey comes forward.
    var drift = smooth * 6;
    titleLines.forEach(function (line) {
      var dir = parseFloat(line.dataset.parallax || '0');
      line.style.transform = 'translateX(' + (dir * drift) + 'vw)' +
                             ' scale(' + (1 - smooth * 0.08).toFixed(4) + ')';
    });
    if (heroTitle) heroTitle.style.opacity = (1 - smooth * 0.6).toFixed(3);
    if (jersey) {
      // Literal offset, never var(): some mobile browsers drop a transform
      // that contains a custom property, which left the jersey off-centre.
      jersey.style.transform =
        'translateX(' + jerseyX + ') translateY(' + rise.toFixed(1) + 'px)' +
        ' scale(' + (1 + smooth * 0.2) + ')';
    }
    if (progress) progress.style.transform = 'scaleY(' + smooth + ')';

    // Story captions fade and slide inside their own window of the rotation.
    var FADE = 0.05;
    storyItems.forEach(function (item) {
      var a = Math.max(0, Math.min(1,
        Math.min((smooth - item.from) / FADE, (item.to - smooth) / FADE, 1)));
      item.el.style.opacity = a.toFixed(3);
      item.el.style.transform =
        'translateX(' + ((1 - a) * 18 * (item.right ? 1 : -1)).toFixed(1) + 'px)';
    });

    // Meter reads the rotation, so the intro spin shows live too.
    if (rotDeg) rotDeg.textContent = Math.round(vSmooth * 360) + '\u00b0';
    if (rotLine) rotLine.style.transform = 'scaleX(' + vSmooth + ')';
    if (rotLabel) {
      rotLabel.style.opacity = vSmooth < 0.02 ? '1' : '.45';
      rotLabel.textContent = vSmooth < 0.02 ? T.scroll : T.rotation;
    }

    requestAnimationFrame(tick);
  }

  /* ---- Boot -------------------------------------------------------------- */
  var booted = false;

  function onFirstFrame() {
    if (booted) return;
    booted = true;
    resizeCanvas();
    paint(0);
    if (reducedMotion && !hasOverride) return;   // a11y: still frame, no motion
    readScroll();
    if (!hasOverride && window.pageYOffset < 4) { introActive = true; introT0 = -1; }
    requestAnimationFrame(tick);
  }

  // the first image may already be cached and complete before onload attaches
  if (frames[0] && frames[0].complete && frames[0].naturalWidth) onFirstFrame();
})();
