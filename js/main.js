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

  /* La position horizontale du maillot n'est plus l'affaire du JS : la bande
     .jersey est pleine largeur et centre son canvas par le flux (styles.css).
     Le cas du téléphone couché y est traité par justify-content, sans
     pourcentage ni requête média dupliquée ici. */

  /* ---- Hero collision guard -----------------------------------------------
     Every piece of the hero is absolutely positioned with its own fixed
     offset, so none of them knows where the others are. A sweep of 63
     viewports found 126 real overlaps — captions landing on the copy block,
     the meter crossing it — on ordinary laptop and tablet heights.

     Fixed offsets cannot express "stay clear of that block", because the
     block's height depends on the text and the font size. So we measure it
     once per layout and hand the result to CSS, which keeps ownership of the
     design; these values only ever act as a floor. */
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

  /* Sur écran empilé (≤900px) le maillot doit tenir DANS la bande libre entre
     le bas du grand titre et le haut du bloc de texte. Cette bande dépend de
     la langue et de la hauteur d'écran, et les deux approches purement CSS
     ont échoué : une hauteur fixe en vh la débordait (le maillot masquait
     « FOOTBALL » en 375x667), et l'ancrer au seul bloc de texte l'expulsait
     hors de l'écran en haut sur un téléphone réel. On mesure donc la bande,
     et le maillot s'y inscrit — il ne peut plus en sortir par construction.
     Géométrie de mise en page (offset*), jamais les rectangles : le titre
     porte une échelle qui varie à chaque image du défilement. */
  var titleEl = document.querySelector('.hero-title');
  var stacked = window.matchMedia('(max-width: 900px)');

  function syncJerseyBand() {
    if (!stacked.matches) {                 // desktop : le CSS garde la main
      sticky.style.removeProperty('--jersey-h');
      sticky.style.removeProperty('--jersey-bottom');
      return;
    }
    if (!titleEl || !copyEl) return;
    var vh = window.innerHeight;
    var sTop = sticky.getBoundingClientRect().top;
    var bandTop = sTop + titleEl.offsetTop + titleEl.offsetHeight + 6;
    var bandBottom = sTop + copyEl.offsetTop - 8;
    var band = bandBottom - bandTop;
    if (band < 90) return;                  // trop serré : on laisse le CSS
    sticky.style.setProperty('--jersey-h', Math.min(vh * 0.42, band) + 'px');
    sticky.style.setProperty('--jersey-bottom', (vh - bandBottom) + 'px');
  }

  function syncHeroLayout() {
    if (!sticky) return;
    syncJerseyBand();
    var vh = window.innerHeight;

    // clear any value we set before measuring, or we would measure our own
    // correction and oscillate on every resize
    sticky.style.removeProperty('--meter-bottom');

    var copyTop = topOf(copyEl);
    var cardTop = topOf(cardEl);
    var GAP = 22;

    // The TALLEST caption, not the first: their texts differ in length, and
    // measuring the short one left the long ones overlapping by 16px.
    var storyH = 92;
    document.querySelectorAll('.story__item').forEach(function (el) {
      if (el.offsetHeight > storyH) storyH = el.offsetHeight;
    });

    // Desktop: captions sit at 46% unless the block underneath reaches up
    // into them, in which case they rise just enough to clear it.
    var wanted = vh * 0.46, ceiling = vh * 0.14;
    sticky.style.setProperty('--story-top-l',
      Math.max(ceiling, Math.min(wanted, copyTop - storyH - GAP)) + 'px');
    sticky.style.setProperty('--story-top-r',
      Math.max(ceiling, Math.min(wanted, cardTop - storyH - GAP)) + 'px');

    // Bottom-anchored tiers use this as a floor (see the ≤900px rules).
    sticky.style.setProperty('--copy-clear',
      Math.max(0, vh - copyTop + 14) + 'px');

    // The meter is centred: on narrower desktops the copy block reaches the
    // middle of the screen and they cross. Lift it above the copy only then.
    if (meterEl && copyEl && vh && meterEl.offsetParent === sticky) {
      /* Layout geometry (offset*), NOT getBoundingClientRect. The meter plays
         an entrance animation that holds it 18px below its resting place for
         ~2s after load, and rects include transforms. Measuring during that
         window reported a 7px gap where the settled layout has an 11px
         overlap, so the guard quietly declined to fire and the meter stayed
         on the text — the 1024×640 case. offset* ignores transforms, so it
         describes where the meter actually comes to rest. */
      var mW = meterEl.offsetWidth, mH = meterEl.offsetHeight;
      var sRect = sticky.getBoundingClientRect();
      var mTop  = sRect.top + meterEl.offsetTop;
      var mLeft = sRect.left + meterEl.offsetLeft - mW / 2; // translateX(-50%)
      var c = copyEl.getBoundingClientRect();
      var overX = Math.min(mLeft + mW, c.right) - Math.max(mLeft, c.left);
      var overY = Math.min(mTop + mH, c.bottom) - Math.max(mTop, c.top);
      if (overX > 2 && overY > 2) {
        sticky.style.setProperty('--meter-bottom', (vh - c.top + 14) + 'px');
      }
    }
  }

  window.addEventListener('resize', syncHeroLayout);
  // fonts change the copy block's height, so re-measure once they land
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(syncHeroLayout);
  setTimeout(syncHeroLayout, 0);
  setTimeout(syncHeroLayout, 1300);

  /* The copy block settles late and unpredictably: webfonts swap in, the text
     re-wraps, the language toggle rewrites it. Measuring only at fixed
     moments made the guard above a race — at 1024×640 it fired on some loads
     and not on others, leaving the meter sitting on the text. Watching the
     block instead removes the timing question entirely. */
  if (window.ResizeObserver && copyEl) {
    new ResizeObserver(syncHeroLayout).observe(copyEl);
  }

  /* Debug hook: ?scrub=0.5 freezes the scrub at a fixed progress
     (used for visual QA screenshots — inert in normal use). */
  var scrubOverride = parseFloat(
    new URLSearchParams(location.search).get('scrub')
  );
  var hasOverride = !isNaN(scrubOverride);

  /* ?piste=200 — règle la course du héro en vh, à la volée.
     La course détermine la finesse perçue de la rotation : 193 pas répartis
     sur moins de défilement font plus de pas par seconde au même geste.
     Le bon réglage est une affaire de ressenti, pas de calcul — ce paramètre
     permet de l'essayer sur l'appareil réel sans redéployer à chaque valeur.
     Bornes larges mais fermées, pour qu'une valeur absurde ne casse rien. */
  var pisteVh = parseFloat(new URLSearchParams(location.search).get('piste'));
  if (!isNaN(pisteVh) && pisteVh >= 120 && pisteVh <= 600) {
    track.style.height = pisteVh + 'vh';
  }

  /* ---- Where the pixels come from ---------------------------------------
     On a touch device js/hero-sequence.js has published an image sequence:
     no video decoder to wake, so nothing that can stall. Everything else in
     this engine — smoothing, captions, meter, title drift, WebGL keying — is
     shared by both paths. Only the frame source differs, which is what makes
     the two experiences identical rather than merely similar.
     frameSrc is null on desktop, and every guard below then falls through to
     the original <video> path unchanged. */
  var frameSrc = window.tddFrameSource || null;

  /* ---- Source selection: light encode for small screens ---------------- */
  var isSmall = window.matchMedia('(max-width: 767px)').matches;

  /* Écran haute densité : la version 900x1080 ne suffit plus.
     Mesuré — sur un portable Retina le canvas demande 990x1188, sur un
     desktop 4K mis à l'échelle 1188x1426. Le maillot y était donc AGRANDI
     au-delà de sa définition source (x0,91 et x0,76), c'est-à-dire flou.
     La source d'origine fait 2488x3332 : la matière existait, elle n'était
     pas servie. La version 1350x1620 reprend exactement la même géométrie
     (mise à l'échelle puis marges centrées, vérifié image par image) et
     n'est servie qu'aux écrans qui en profitent — 15 Mo au lieu de 8. */
  var hiDpi = (window.devicePixelRatio || 1) >= 1.5;
  var srcUrl = (isSmall
    ? 'assets/video/jersey-scrub-540.mp4'
    : (hiDpi ? 'assets/video/jersey-scrub-1350.mp4'
             : 'assets/video/jersey-scrub.mp4')) + '?v=8';
  var srcFps = 24;

  /* Fully prefetch the clip into a Blob before wiring it to the <video>.
     Every seek is then served from memory: instant scrubbing, and no
     dependency on the server supporting HTTP Range requests (a seek into
     un-buffered data on a Range-less server stalls forever otherwise).
     Falls back to plain streaming if the fetch fails. */
  if (!frameSrc) {
    fetch(srcUrl)
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.blob(); })
      .then(function (blob) { video.src = URL.createObjectURL(blob); video.load(); })
      .catch(function () { video.src = srcUrl; video.load(); });
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
    if (frameSrc) {
      // That DPR-2 cap exists to spare the video decoder. An image sequence
      // has no decoder, so a phone can be served its true pixel density —
      // clamped to the source so we never upscale past the real detail.
      // On an iPhone this is 843px of jersey instead of 562, at no extra
      // download: those pixels were already fetched.
      var real = window.devicePixelRatio || 1;
      w = Math.min(Math.round(rect.width  * real), frameSrc.width);
      h = Math.min(Math.round(rect.height * real), frameSrc.height);
    }
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width  = w;
      canvas.height = h;
      if (gl) gl.viewport(0, 0, w, h);
      lastPainted = null; // force the repaint below through the skip guard
      drawFrame(); // repaint at the new size
    }
  }

  /* ---- Painting --------------------------------------------------------- */
  var lastPainted = null; // sequence path only: last image uploaded to the GPU

  function drawFrame() {
    var pixels = video;
    if (frameSrc) {
      // tick() runs every rAF, but the chosen image only changes when the
      // scroll actually moves. Re-uploading a 900×1080 texture 60 times a
      // second would drain a phone for nothing.
      pixels = frameSrc.frameAt(vSmooth);
      if (!pixels || pixels === lastPainted) return;
      lastPainted = pixels;
    } else if (video.readyState < 2) {
      return; // no decodable frame yet
    }
    if (gl) {
      gl.bindTexture(gl.TEXTURE_2D, glTex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    } else if (ctx2d) {
      ctx2d.drawImage(pixels, 0, 0, canvas.width, canvas.height);
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

  /* Le défilement N'EST PAS lu depuis l'événement 'scroll'.
     QA sur appareil réel (webview intégrée, écran 338x648) : la page défilait
     visiblement — le maillot était sorti par le haut, la section suivante à
     l'écran — et la sonde affichait toujours « defilement 0% / rotation
     0deg ». L'événement ne parvenait pas au handler, donc la progression
     restait à sa valeur d'origine et la rotation ne démarrait jamais.
     La position est désormais relue à chaque image dans tick() : une lecture
     de rectangle par frame, insensible à la façon dont le navigateur
     distribue (ou non) ses événements. Le listener reste comme filet pour les
     défilements qui n'arrivent pas via rAF (ancre, restauration de session). */
  window.addEventListener('scroll', function () {
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
  var wasOverHero = null;   // dernier état connu, pour ne toucher au DOM qu'au changement
  var lastNow = 0;   // horloge du lissage (voir tick)
  var frames = 0;    // compteur d'images, lu par la sonde ?diag=1

  var INTRO_SPIN_MS = 4200;
  var INTRO_RISE_MS = 900;
  var introActive = false;
  var introT0 = -1;

  /* ---- Main loop --------------------------------------------------------- */
  var FRAME_STEP = 1 / srcFps; // skip sub-frame seeks

  function tick(now) {
    var rise = 0; // jersey settle-in offset during the intro

    // Source de vérité du défilement : mesurée ici, pas reçue par événement.
    readScroll();

    /* En thème sombre le héro garde un fond clair (voir styles.css). La barre
       de navigation est fixe et le survole : elle doit s'accorder à lui tant
       qu'il est DERRIÈRE elle, puis revenir au thème de la page.
       La bonne question n'est pas « la piste est-elle encore visible ? » mais
       « qu'y a-t-il derrière la barre ? » : en bas de page il restait 240px de
       piste sous l'écran, et la barre gardait son gris clair par-dessus la
       section finale, sombre. On compare donc au bas de la barre. */
    var navEl = document.querySelector('.nav');
    var navH = navEl ? navEl.offsetHeight : 0;
    /* 170 : longueur du fondu de fin de piste (styles.css). La barre bascule
       au même endroit que lui, sinon elle garde son gris clair au-dessus de
       la section finale, sombre — visible en bas de page, où il reste ~84px
       de héro que la hauteur de la page ne permet pas de faire sortir. */
    var overHero = track.getBoundingClientRect().bottom > navH + 170;
    if (overHero !== wasOverHero) {
      wasOverHero = overHero;
      document.documentElement.classList.toggle('is-over-hero', overHero);
    }
    if (introActive && window.pageYOffset > 2) introActive = false;

    /* Lissage indépendant de la cadence d'affichage.
       Le facteur 0.14 était appliqué PAR IMAGE : à 60 im/s la rotation
       rattrape le défilement en ~120ms, mais un téléphone en économie de
       batterie tourne à 30 im/s ou moins, et la même constante y met deux à
       trois fois plus de temps — c'est la lenteur remontée en QA. Converti en
       constante de temps, le ressenti est le même à 30, 60 ou 120 im/s, et le
       desktop (déjà à 60) ne change pas d'un poil. */
    var dt = lastNow ? Math.min(now - lastNow, 100) : 16.7;
    lastNow = now;
    frames++;

    /* Lissage ADAPTATIF, en plus d'être indépendant de la cadence.
       Une constante unique laisse ~120ms de retard. Au défilement rapide ce
       retard ne se voit pas — il adoucit même le passage d'une image à la
       suivante. Au défilement lent il se ressent comme du jeu mécanique : le
       maillot ne répond pas tout de suite au doigt (remonté en QA : « fluide
       si je scrolle vite, du mou si je scrolle doucement »).
       On resserre donc quand l'écart restant est petit — le maillot colle au
       geste — et on relâche quand il est grand, ce qui conserve exactement le
       glissé actuel sur les grands mouvements. */
    var gap = Math.abs(target - vSmooth);
    var snap = 0.42 - 0.28 * Math.min(1, gap * 14);   // 0.42 tout près → 0.14 loin
    var k = 1 - Math.pow(1 - snap, dt / 16.7);

    if (introActive) {
      if (introT0 < 0) introT0 = now;         // same clock as rAF
      var p = Math.min(1, (now - introT0) / INTRO_SPIN_MS);
      // easeInOutCubic — gentle start, gentle stop
      vSmooth = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      var r = Math.min(1, (now - introT0) / INTRO_RISE_MS);
      rise = 26 * Math.pow(1 - r, 3);
      if (p >= 1) { introActive = false; vSmooth = 0; } // seamless loop point
    } else {
      vSmooth += (target - vSmooth) * k;
    }

    // Layout effects always follow the scroll — never the intro.
    smooth += (target - smooth) * k;
    if (hasOverride) { smooth = target; vSmooth = target; } // QA: exact frame

    if (frameSrc) {
      // Nothing to seek: drawFrame() resolves vSmooth to an image itself, and
      // skips the upload when that image has not changed.
      drawFrame();
    } else if (loopMode) {
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
      // NO horizontal component here any more. Centring used to ride in this
      // string as translateX(-50%), and it kept failing on real phones — the
      // jersey sat half a width to the right, twice, while every emulator
      // centred it. It is now done by the flex band in styles.css, where no
      // percentage has to resolve against a width derived from aspect-ratio.
      jersey.style.transform =
        'translateY(' + rise.toFixed(1) + 'px) scale(' + (1 + smooth * 0.2) + ')';
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
    if (frameSrc) {
      // Frame size is fixed, so the shader's sharpen taps are set once.
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
    if (booted) return; // guard against listener + readyState double boot
    booted = true;
    drawFrame();    // paint the first frame immediately
    if (!frameSrc) primeDecoder(); // …wake the decoder so seeks yield frames
    readScroll();
    /* prefers-reduced-motion ne coupe PLUS la boucle de rendu.
       Ce réglage vise le mouvement subi — une animation qui se joue toute
       seule. La rotation du maillot ne bouge que si le visiteur fait défiler :
       elle est pilotée, pas subie. Couper la boucle figeait le héro entier, et
       comme l'économiseur de batterie Android active ce réglage, un visiteur à
       4% de batterie n'avait tout simplement plus d'expérience — constaté en
       QA sur l'appareil du client, symptôme reproduit puis vérifié en ligne.
       Seule l'intro qui tourne d'elle-même reste supprimée, ci-dessous : c'est
       le seul mouvement involontaire du héro. */
    // Autoplay the reveal spin only from the top of the page (a reload
    // restored mid-scroll keeps the scroll-driven position instead).
    if (!hasOverride && !reducedMotion && window.pageYOffset < 4) {
      introActive = true;
      introT0 = -1;
    }
    requestAnimationFrame(tick);
  }

  function bootVideo() {
    video.addEventListener('loadedmetadata', onMeta);
    video.addEventListener('loadeddata', onReady, { once: true });

    // If the (cached) video fired its events before listeners attached:
    if (video.readyState >= 1) onMeta();
    if (video.readyState >= 2) onReady();
  }

  if (frameSrc) {
    // An image sequence fires no media events: boot as soon as the first
    // image exists, without waiting for the other 192.
    var waited = 0;
    (function awaitFirstFrame() {
      if (frameSrc.ready) { onMeta(); onReady(); return; }
      // …but never wait forever. If the frames are missing or the network
      // dropped, fall back to the <video> engine: a jersey that scrubs badly
      // still beats an empty hero.
      if (++waited > 600) {          // ≈10s of visible time at 60fps
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

  /* ---- Sonde d'appareil (?diag=1) -----------------------------------------
     Le héro a échoué deux fois sur un téléphone réel sans qu'aucune émulation
     ne le reproduise. Cette sonde affiche les valeurs telles que L'APPAREIL
     les calcule : une capture d'écran suffit alors à trancher au lieu de
     supposer. Totalement inerte sans le paramètre. */
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
