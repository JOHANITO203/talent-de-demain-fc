/* ==========================================================================
   Talent de Demain FC — scroll-driven jersey video
   --------------------------------------------------------------------------
   How it works
   1. The hero is pinned (position: sticky) inside a tall scroll runway
      (.hero-track). Scroll progress through that runway maps 0→1.
   2. Progress is smoothed with a lerp inside a requestAnimationFrame loop,
      then converted to a target video time (scrubs back AND forward).
   3. The <video> element is only a frame source: it was re-encoded
      all-intra (every frame is a keyframe) so currentTime seeks resolve
      almost instantly. Each resolved seek repaints the canvas.
   4. Rendering is WebGL: a small shader keys out the clip's beige studio
      backdrop in real time (the backdrop color is sampled from the frame's
      own left/right edges, so it adapts to the vignette and to lighting
      changes across the rotation). The result is a true transparent cutout
      of the jersey that melts into the page — and removes any watermark
      along with the backdrop. A 2D-canvas + CSS-blend fallback covers
      browsers without WebGL.
   5. A lighter 540p encode is used on small screens.
   ========================================================================== */

(function () {
  'use strict';

  var track    = document.getElementById('hero-track');
  var video    = document.getElementById('jersey-video');
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

  if (!track || !video || !canvas) return;

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

  /* ---- Source selection: light encode for small screens ---------------- */
  var isSmall = window.matchMedia('(max-width: 767px)').matches;
  var srcUrl = (isSmall
    ? 'assets/video/jersey-scrub-540.mp4'
    : 'assets/video/jersey-scrub.mp4') + '?v=7'; // bump on video re-encode
  var srcFps = 24;

  /* Fully prefetch the clip into a Blob before wiring it to the <video>.
     Every seek is then served from memory: instant scrubbing, and no
     dependency on the server supporting HTTP Range requests (a seek into
     un-buffered data on a Range-less server stalls forever otherwise).
     Falls back to plain streaming if the fetch fails. */
  fetch(srcUrl)
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.blob(); })
    .then(function (blob) { video.src = URL.createObjectURL(blob); video.load(); })
    .catch(function () { video.src = srcUrl; video.load(); });

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

    // Fullscreen quad
    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(prog, 'aPos');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    // Video texture
    glTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, glTex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    gl.uniform1i(gl.getUniformLocation(prog, 'uTex'), 0);
    glTexelLoc = gl.getUniformLocation(prog, 'uTexel');
    gl.uniform2f(glTexelLoc, 1 / 900, 1 / 1080); // updated once metadata loads
    return true;
  }

  var ctx2d = null;
  if (!initWebGL()) {
    // Fallback: plain 2D frames + CSS multiply blend (see styles.css)
    document.documentElement.classList.add('no-webgl');
    ctx2d = canvas.getContext('2d');
  }

  /* ---- State ------------------------------------------------------------ */
  var duration = 0;      // video duration (s), known after metadata loads
  var target   = 0;      // raw scroll progress   0..1
  var smooth   = 0;      // lerped progress, drives the LAYOUT effects
  var vSmooth  = 0;      // lerped progress, drives the VIDEO position
  var seekBusy = false;  // a currentTime seek is in flight
  var pendingT = -1;     // seek requested while busy — run it next

  /* ---- Canvas sizing (device-pixel-ratio aware, no blur) ---------------- */
  function resizeCanvas() {
    var rect = canvas.getBoundingClientRect();
    var dpr  = Math.min(window.devicePixelRatio || 1, 2); // cap DPR: perf
    var w = Math.round(rect.width  * dpr);
    var h = Math.round(rect.height * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width  = w;
      canvas.height = h;
      if (gl) gl.viewport(0, 0, w, h);
      drawFrame(); // repaint at the new size
    }
  }

  /* ---- Painting --------------------------------------------------------- */
  function drawFrame() {
    if (video.readyState < 2) return; // no decodable frame yet
    if (gl) {
      gl.bindTexture(gl.TEXTURE_2D, glTex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    } else if (ctx2d) {
      ctx2d.drawImage(video, 0, 0, canvas.width, canvas.height);
    }
  }

  /* ---- Seeking (never more than one seek in flight) ---------------------- */
  var seekTimer = 0;
  var seekFails = 0;      // consecutive seeks that never reported back
  var loopMode = false;   // set when this device cannot scrub at all

  /* Mobile browsers commonly refuse to decode frames for a video that has
     never played: seeking a cold element leaves the canvas on frame 0, which
     is exactly how the hero looked frozen on a real phone. A muted play/pause
     initialises the decoder — allowed without a user gesture because the
     element is muted and playsinline. */
  function primeDecoder() {
    try {
      var p = video.play();
      if (p && p.then) {
        p.then(function () { video.pause(); drawFrame(); })
         .catch(function () { /* blocked: the loop fallback covers it */ });
      } else {
        video.pause();
      }
    } catch (e) { /* ignore */ }
  }

  /* Draw once the decoded frame is actually presented. Without this the
     canvas can be painted before the new frame exists, showing the old one. */
  function drawWhenReady() {
    drawFrame();
    if (video.requestVideoFrameCallback) {
      try { video.requestVideoFrameCallback(function () { drawFrame(); }); }
      catch (e) { /* ignore */ }
    }
  }

  /* Last resort: if this device simply will not seek, let the clip play on a
     loop. The jersey keeps turning — it is no longer tied to the scroll, but
     the hero stays alive instead of standing still. */
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
    // Watchdog: if 'seeked' never fires, unblock the pipeline so the scrub
    // self-heals; three misses in a row means seeking is dead on this device.
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
    if (pendingT >= 0) {           // a newer position arrived meanwhile
      var t = pendingT;
      pendingT = -1;
      requestSeek(t);
    }
  });

  /* ---- Scroll progress --------------------------------------------------- */
  function readScroll() {
    if (hasOverride) { target = Math.min(1, Math.max(0, scrubOverride)); return; }
    var runway = track.offsetHeight - window.innerHeight;
    if (runway <= 0) { target = 0; return; }
    var y = -track.getBoundingClientRect().top; // px scrolled into the track
    target = Math.min(1, Math.max(0, y / runway));
  }

  window.addEventListener('scroll', function () {
    // The first scroll always wins over the autoplay intro.
    if (introActive && window.pageYOffset > 2) introActive = false;
    readScroll();
  }, { passive: true });
  window.addEventListener('resize', function () { readScroll(); resizeCanvas(); });

  /* ---- Autoplay intro ------------------------------------------------------
     On load the jersey spins a full turn by itself, then hands over to the
     scroll. Only the VIDEO position follows the intro curve — the layout
     effects keep tracking the (still idle) scroll, so nothing snaps when the
     spin ends. The turn is seamless (last frame ≈ first frame), so landing
     back on 0 is invisible. Any scroll cancels it, and the rotation then
     sweeps smoothly to the scroll position instead of jumping. */
  var INTRO_SPIN_MS = 4200;
  var INTRO_RISE_MS = 900;
  var introActive = false;
  var introT0 = -1;

  /* ---- Main loop --------------------------------------------------------- */
  var FRAME_STEP = 1 / srcFps; // skip sub-frame seeks

  function tick(now) {
    var rise = 0; // jersey settle-in offset during the intro

    if (introActive) {
      if (introT0 < 0) introT0 = now;         // same clock as rAF
      var p = Math.min(1, (now - introT0) / INTRO_SPIN_MS);
      // easeInOutCubic — gentle start, gentle stop
      vSmooth = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      var r = Math.min(1, (now - introT0) / INTRO_RISE_MS);
      rise = 26 * Math.pow(1 - r, 3);
      if (p >= 1) { introActive = false; vSmooth = 0; } // seamless loop point
    } else {
      vSmooth += (target - vSmooth) * 0.14;
    }

    // Layout effects always follow the scroll — never the intro.
    smooth += (target - smooth) * 0.14;
    if (hasOverride) { smooth = target; vSmooth = target; } // QA: exact frame

    if (loopMode) {
      // seeking is unavailable here: just keep painting the playing clip
      drawFrame();
    } else if (duration > 0) {
      // Clamp a hair under duration: seeking exactly to the end can stall.
      var t = Math.min(vSmooth * duration, duration - 0.05);
      if (Math.abs(t - video.currentTime) > FRAME_STEP / 2) {
        requestSeek(t);
      }
    }

    // Cinematic touches tied to the same progress value:
    // headline lines drift apart and recede in depth, jersey grows slightly.
    var drift = smooth * 6; // vw
    titleLines.forEach(function (line) {
      var dir = parseFloat(line.dataset.parallax || '0');
      line.style.transform = 'translateX(' + (dir * drift) + 'vw)' +
                             ' scale(' + (1 - smooth * 0.08).toFixed(4) + ')';
    });
    if (heroTitle) {
      // The title recedes into the background as the jersey comes forward.
      heroTitle.style.opacity = (1 - smooth * 0.6).toFixed(3);
    }
    if (jersey) {
      // Foreground push: the jersey grows toward the viewer as the
      // rotation advances (origin at the hem, so it rises over the
      // receding headline instead of sinking below the fold).
      // `rise` only differs from 0 during the load-in settle.
      // Literal offset, never var(). Some mobile browsers fail to parse a
      // custom property inside a transform function and then drop the WHOLE
      // transform — the jersey lost its -50% and sat half a width to the
      // right. Seen on a real phone; desktop emulation centred it correctly.
      jersey.style.transform =
        'translateX(' + jerseyX + ') translateY(' + rise.toFixed(1) + 'px)' +
        ' scale(' + (1 + smooth * 0.2) + ')';
    }
    if (progress) {
      progress.style.transform = 'scaleY(' + smooth + ')';
    }

    // Story captions: fade/slide in and out inside their rotation window.
    var FADE = 0.05; // progress span used for each fade edge
    storyItems.forEach(function (s) {
      var a = Math.min((smooth - s.from) / FADE, (s.to - smooth) / FADE, 1);
      a = Math.max(0, Math.min(1, a));
      var shift = (1 - a) * 18 * (s.right ? 1 : -1); // slide from the edge
      s.el.style.opacity = a.toFixed(3);
      s.el.style.transform = 'translateX(' + shift.toFixed(1) + 'px)';
    });

    // Rotation meter follows the VIDEO, so the intro spin reads live too.
    var deg = Math.round(vSmooth * 360);
    if (rotDeg)  rotDeg.textContent = deg + '°';
    if (rotLine) rotLine.style.transform = 'scaleX(' + vSmooth + ')';
    if (rotLabel) {
      rotLabel.style.opacity = vSmooth < 0.02 ? '1' : '.45';
      rotLabel.textContent = vSmooth < 0.02 ? T.scroll : T.rotation;
    }

    requestAnimationFrame(tick);
  }

  /* ---- Boot -------------------------------------------------------------- */
  var booted = false;

  function onMeta() {
    duration = video.duration;
    if (gl && glTexelLoc && video.videoWidth) {
      gl.uniform2f(glTexelLoc, 1 / video.videoWidth, 1 / video.videoHeight);
    }
    resizeCanvas();
  }

  function onReady() {
    if (booted) return; // guard against listener + readyState double boot
    booted = true;
    drawFrame();    // paint the first frame immediately
    primeDecoder(); // …then wake the decoder so later seeks produce frames
    if (reducedMotion && !hasOverride) return; // a11y: static frame, no scrub
    readScroll();
    // Autoplay the reveal spin only from the top of the page (a reload
    // restored mid-scroll keeps the scroll-driven position instead).
    if (!hasOverride && window.pageYOffset < 4) {
      introActive = true;
      introT0 = -1;
    }
    requestAnimationFrame(tick);
  }

  video.addEventListener('loadedmetadata', onMeta);
  video.addEventListener('loadeddata', onReady, { once: true });

  // If the (cached) video fired its events before listeners attached:
  if (video.readyState >= 1) onMeta();
  if (video.readyState >= 2) onReady();
})();
