/**
 * ═══════════════════════════════════════════════════════════════
 * NIGHT SKY LOVE ALBUM — script.js (v2)
 * For a sister, with love ♡
 *
 * Sections:
 *   1. DATA          — gallery, thoughts, music
 *   2. STATE         — app-wide state
 *   3. STARS         — canvas: twinkling + sparkle bursts + shooting stars
 *   4. PARALLAX      — moon on scroll
 *   5. GATE          — password screen
 *   6. NAVIGATION    — view router
 *   7. HOME          — thoughts + video rendering
 *   8. GALLERY       — card rendering
 *   9. MUSIC         — audio player + modal
 *  10. SCROLL ANIM   — IntersectionObserver
 *  11. UTILS         — helpers
 * ═══════════════════════════════════════════════════════════════
 */

'use strict';

/* ══════════════════════════════════════════════
   1. DATA
══════════════════════════════════════════════ */

/** Unlock password */
const PASSWORD = '01062024';

/**
 * Emotional lines shown on the home page.
 * Replace ADD_YOUR_TEXT_HERE with real words.
 */
const thoughtsData = [
  { line: 'ADD_YOUR_TEXT_HERE' },
  { line: 'ADD_YOUR_TEXT_HERE' },
  { line: 'ADD_YOUR_TEXT_HERE' },
  { line: 'ADD_YOUR_TEXT_HERE' },
];

/**
 * Gallery — add as many items as you like.
 * mediaType: "image" | "video"
 * src: e.g. "assets/images/photo1.jpg"
 * text: memory caption
 */
const galleryData = [
  { mediaType: 'image', src: 'assets/images/sample.jpg',  text: 'ADD_MEMORY_TEXT' },
  { mediaType: 'image', src: 'assets/images/sample2.jpg', text: 'ADD_MEMORY_TEXT' },
  { mediaType: 'video', src: 'assets/videos/sample.mp4',  text: 'ADD_MEMORY_TEXT' },
  { mediaType: 'image', src: 'assets/images/sample3.jpg', text: 'ADD_MEMORY_TEXT' },
  { mediaType: 'image', src: 'assets/images/sample4.jpg', text: 'ADD_MEMORY_TEXT' },
  { mediaType: 'image', src: 'assets/images/sample5.jpg', text: 'ADD_MEMORY_TEXT' },
];

/**
 * Music playlist — add song objects freely.
 * file: filename inside assets/audio/
 */
const musicList = [
  { name: 'ADD_SONG_NAME', file: 'ADD_AUDIO_HERE.mp3' },
  { name: 'ADD_SONG_NAME', file: 'ADD_AUDIO_HERE.mp3' },
  { name: 'ADD_SONG_NAME', file: 'ADD_AUDIO_HERE.mp3' },
];


/* ══════════════════════════════════════════════
   2. STATE
══════════════════════════════════════════════ */

const state = {
  currentView: 'home',
  musicModalOpen: false,
  audio: {
    currentIndex: -1,
    isPlaying: false,
  },
};


/* ══════════════════════════════════════════════
   3. STARS — twinkling canvas ✦
   Stars are drawn as:
   - Round dots (base)
   - Cross/sparkle spikes when bright (twinkle burst)
   - Warm rose/gold/lavender tints (not cold white)
   - Shooting stars occasionally
══════════════════════════════════════════════ */

(function initStars() {
  const canvas = document.getElementById('starCanvas');
  const ctx    = canvas.getContext('2d');

  // ── Config ──────────────────────────────────────
  const STAR_COUNT  = 240;
  const STAR_COLORS = [
    [255, 240, 248],  // warm white-pink
    [255, 230, 200],  // peach
    [220, 200, 255],  // soft lavender
    [255, 245, 210],  // warm cream
    [255, 200, 220],  // blush rose
    [200, 220, 255],  // cool periwinkle
  ];

  const stars = [];

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function makeStars() {
    stars.length = 0;
    for (let i = 0; i < STAR_COUNT; i++) {
      const col = STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)];
      stars.push({
        x:       Math.random() * canvas.width,
        y:       Math.random() * canvas.height,
        baseR:   Math.random() * 1.5 + 0.3,
        color:   col,

        // Twinkle parameters — varied so they all look independent
        phase:       Math.random() * Math.PI * 2,
        twinkleFreq: Math.random() * 0.04 + 0.02,   // how fast it oscillates
        twinkleAmp:  Math.random() * 0.5 + 0.4,      // 0.4–0.9: how dramatic the fade

        // Sparkle burst (cross spikes) only when star is near-peak brightness
        spikeLen:    Math.random() * 6 + 3,           // length of cross arms
        spikeOpBase: Math.random() * 0.5 + 0.2,

        // Occasional "super twinkle" — star flashes much brighter for a moment
        superPhase: Math.random() * Math.PI * 2,
        superFreq:  Math.random() * 0.008 + 0.003,
      });
    }
  }

  /**
   * Draw a twinkling star at (x, y).
   * When brightness > threshold, also draw cross spikes.
   */
  function drawStar(s, brightness) {
    const r   = s.baseR * (0.6 + brightness * 0.8);
    const [R, G, B] = s.color;
    const alpha = 0.15 + brightness * 0.85;

    ctx.beginPath();
    ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${R},${G},${B},${alpha})`;
    ctx.fill();

    // Draw sparkle cross when bright enough
    if (brightness > 0.55) {
      const spikeAlpha = (brightness - 0.55) / 0.45 * s.spikeOpBase;
      const spikeLen   = s.spikeLen * brightness;

      ctx.save();
      ctx.translate(s.x, s.y);

      // Main cross (0° and 90°)
      for (const angle of [0, Math.PI / 2]) {
        ctx.save();
        ctx.rotate(angle);

        const grad = ctx.createLinearGradient(-spikeLen, 0, spikeLen, 0);
        grad.addColorStop(0,   `rgba(${R},${G},${B},0)`);
        grad.addColorStop(0.4, `rgba(${R},${G},${B},${spikeAlpha})`);
        grad.addColorStop(0.5, `rgba(${R},${G},${B},${spikeAlpha * 1.4})`);
        grad.addColorStop(0.6, `rgba(${R},${G},${B},${spikeAlpha})`);
        grad.addColorStop(1,   `rgba(${R},${G},${B},0)`);

        ctx.beginPath();
        ctx.moveTo(-spikeLen, 0);
        ctx.lineTo(spikeLen, 0);
        ctx.strokeStyle = grad;
        ctx.lineWidth = r * 0.6;
        ctx.stroke();
        ctx.restore();
      }

      // Diagonal cross at 45° (thinner)
      for (const angle of [Math.PI / 4, -Math.PI / 4]) {
        ctx.save();
        ctx.rotate(angle);
        const diagLen = spikeLen * 0.55;
        const gradD = ctx.createLinearGradient(-diagLen, 0, diagLen, 0);
        gradD.addColorStop(0,   `rgba(${R},${G},${B},0)`);
        gradD.addColorStop(0.5, `rgba(${R},${G},${B},${spikeAlpha * 0.6})`);
        gradD.addColorStop(1,   `rgba(${R},${G},${B},0)`);

        ctx.beginPath();
        ctx.moveTo(-diagLen, 0);
        ctx.lineTo(diagLen, 0);
        ctx.strokeStyle = gradD;
        ctx.lineWidth = r * 0.35;
        ctx.stroke();
        ctx.restore();
      }

      ctx.restore();
    }
  }

  // ── Animation loop ───────────────────────────────
  let frameCount = 0;

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    frameCount++;

    for (const s of stars) {
      // Base twinkle oscillation (fast, asymmetric)
      s.phase      += s.twinkleFreq;
      s.superPhase += s.superFreq;

      // Fast sine gives visible flicker
      const baseBrightness = 0.5 + 0.5 * Math.sin(s.phase);
      // Slow super-twinkle adds an infrequent bright flash
      const superMult = 0.5 + 0.5 * Math.sin(s.superPhase);
      // Blend: mainly base, occasionally boosted
      const brightness = Math.min(1, baseBrightness * (1 + superMult * 0.4));
      // Apply amplitude: stars range from near-off to full-on
      const finalB = 1 - s.twinkleAmp + s.twinkleAmp * brightness;

      drawStar(s, finalB);
    }

    requestAnimationFrame(draw);
  }

  // ── Shooting star ────────────────────────────────
  function spawnShootingStar() {
    const sx    = Math.random() * canvas.width * 0.65;
    const sy    = Math.random() * canvas.height * 0.45;
    const angle = Math.PI / 5.5 + Math.random() * Math.PI / 7;
    const len   = 90 + Math.random() * 130;
    const dur   = 650 + Math.random() * 550;
    const ex    = sx + Math.cos(angle) * len;
    const ey    = sy + Math.sin(angle) * len;
    const start = performance.now();

    // Random warm/cool color for shooting star
    const colors = ['255,240,200', '232,180,220', '200,210,255', '255,220,180'];
    const col = colors[Math.floor(Math.random() * colors.length)];

    function tick(now) {
      const t    = Math.min((now - start) / dur, 1);
      const ease = t < 0.5 ? 2*t*t : -1+(4-2*t)*t;
      const alph = t < 0.6 ? ease / 0.6 : (1 - t) / 0.4;

      const cx = sx + (ex - sx) * ease;
      const cy = sy + (ey - sy) * ease;
      const tailLen = len * 0.38;
      const tx = cx - Math.cos(angle) * tailLen;
      const ty = cy - Math.sin(angle) * tailLen;

      const grad = ctx.createLinearGradient(tx, ty, cx, cy);
      grad.addColorStop(0, `rgba(${col},0)`);
      grad.addColorStop(0.6, `rgba(${col},${alph * 0.6})`);
      grad.addColorStop(1,   `rgba(255,255,240,${alph})`);

      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(cx, cy);
      ctx.strokeStyle = grad;
      ctx.lineWidth   = 1.6;
      ctx.stroke();

      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function scheduleShooter() {
    const delay = 4500 + Math.random() * 11000;
    setTimeout(() => { spawnShootingStar(); scheduleShooter(); }, delay);
  }

  window.addEventListener('resize', () => { resize(); makeStars(); });
  resize();
  makeStars();
  requestAnimationFrame(draw);
  scheduleShooter();
})();


/* ══════════════════════════════════════════════
   4. PARALLAX — moon
══════════════════════════════════════════════ */

(function initParallax() {
  const moon = document.getElementById('moon');
  if (!moon) return;
  window.addEventListener('scroll', () => {
    moon.style.transform = `translateY(${window.scrollY * -0.07}px)`;
  }, { passive: true });
})();


/* ══════════════════════════════════════════════
   5. GATE — password screen
══════════════════════════════════════════════ */

(function initGate() {
  const gateScreen    = document.getElementById('gateScreen');
  const app           = document.getElementById('app');
  const inputWrapper  = document.getElementById('inputWrapper');
  const passwordInput = document.getElementById('passwordInput');
  const unlockBtn     = document.getElementById('unlockBtn');
  const gateError     = document.getElementById('gateError');

  function unlock() {
    gateScreen.classList.add('gate-fadeout');
    gateScreen.addEventListener('animationend', () => {
      gateScreen.classList.add('hidden');
      gateScreen.classList.remove('active');
      app.classList.remove('hidden');
      app.classList.add('reveal');
    }, { once: true });
  }

  function showError() {
    gateError.classList.add('visible');
    inputWrapper.classList.add('shake');
    passwordInput.value = '';

    inputWrapper.addEventListener('animationend', () => {
      inputWrapper.classList.remove('shake');
    }, { once: true });

    setTimeout(() => gateError.classList.remove('visible'), 3500);
  }

  function checkPassword() {
    if (passwordInput.value.trim() === PASSWORD) {
      unlock();
    } else {
      showError();
    }
  }

  unlockBtn.addEventListener('click', checkPassword);
  passwordInput.addEventListener('keydown', e => { if (e.key === 'Enter') checkPassword(); });
})();


/* ══════════════════════════════════════════════
   6. NAVIGATION
══════════════════════════════════════════════ */

(function initNav() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const target = item.dataset.view;

      if (target === 'music') {
        openMusicModal();
        return;
      }

      document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
      item.classList.add('active');
      switchView(target);
    });
  });
})();

function switchView(viewName) {
  if (state.currentView === viewName) return;

  const current = document.querySelector('.active-view');
  const next    = document.getElementById(viewName === 'home' ? 'viewHome' : 'viewGallery');

  if (current) { current.classList.remove('active-view'); current.classList.add('hidden-view'); }
  if (next)    { next.classList.remove('hidden-view');    next.classList.add('active-view'); }

  state.currentView = viewName;
  window.scrollTo({ top: 0, behavior: 'smooth' });
  setTimeout(observeElements, 300);
}


/* ══════════════════════════════════════════════
   7. HOME — thoughts + video
══════════════════════════════════════════════ */

(function renderHome() {
  renderThoughts();
  initVideoSection();
})();

function renderThoughts() {
  const grid = document.getElementById('thoughtsGrid');
  if (!grid) return;
  grid.innerHTML = '';

  thoughtsData.forEach((t, i) => {
    const card = document.createElement('div');
    card.className = 'thought-card fade-up';
    card.style.transitionDelay = `${i * 0.08}s`;
    card.innerHTML = `
      <p class="thought-num">♡ ${String(i + 1).padStart(2, '0')}</p>
      <p class="thought-line">${escapeHTML(t.line)}</p>
    `;
    grid.appendChild(card);
  });
}

function initVideoSection() {
  const video       = document.getElementById('specialVideo');
  const placeholder = document.getElementById('videoPlaceholder');
  if (!video || !placeholder) return;

  const src = video.querySelector('source')?.getAttribute('src') || '';
  if (src && !src.includes('ADD_')) placeholder.classList.add('hidden');

  video.addEventListener('loadedmetadata', () => placeholder.classList.add('hidden'));
}


/* ══════════════════════════════════════════════
   8. GALLERY — render cards
══════════════════════════════════════════════ */

(function renderGallery() {
  const grid = document.getElementById('galleryGrid');
  if (!grid) return;
  grid.innerHTML = '';

  galleryData.forEach((item, i) => {
    const card = document.createElement('article');
    card.className = 'gallery-card fade-up';
    card.style.transitionDelay = `${(i % 3) * 0.1}s`;

    card.innerHTML = `
      <div class="card-media">${buildMediaEl(item, i)}</div>
      <div class="card-body">
        <p class="card-index">memory ${String(i + 1).padStart(2, '0')} ♡</p>
        <p class="card-text">${escapeHTML(item.text)}</p>
      </div>
    `;
    grid.appendChild(card);
  });
})();

function buildMediaEl(item, i) {
  if (!item.src || item.src.includes('ADD_')) {
    const ico = item.mediaType === 'video' ? '▶' : '♡';
    const lbl = item.mediaType === 'video' ? 'add a video' : 'add a photo';
    return `<div class="card-media-placeholder"><span>${ico}</span><span>${lbl}</span></div>`;
  }
  if (item.mediaType === 'video') {
    return `<video src="${escapeHTML(item.src)}" controls playsinline preload="none" loading="lazy" aria-label="Memory ${i + 1}"></video>`;
  }
  return `<img src="${escapeHTML(item.src)}" alt="Memory ${i + 1}" loading="lazy"
    onerror="this.parentElement.innerHTML='<div class=card-media-placeholder><span>♡</span><span>photo not found</span></div>'" />`;
}


/* ══════════════════════════════════════════════
   9. MUSIC PLAYER
══════════════════════════════════════════════ */

(function initMusicPlayer() {
  const audio        = document.getElementById('audioPlayer');
  const modal        = document.getElementById('musicModal');
  const backdrop     = document.getElementById('musicBackdrop');
  const closeBtn     = document.getElementById('musicClose');
  const playPauseBtn = document.getElementById('playPauseBtn');
  const prevBtn      = document.getElementById('prevBtn');
  const nextBtn      = document.getElementById('nextBtn');
  const songList     = document.getElementById('songList');
  const progressBar  = document.getElementById('progressBar');
  const progressFill = document.getElementById('progressFill');
  const progressThumb= document.getElementById('progressThumb');
  const volumeSlider = document.getElementById('volumeSlider');
  const npSong       = document.getElementById('npSong');
  const npStatus     = document.getElementById('npStatus');
  const npDisc       = document.getElementById('npDisc');
  const timeElapsed  = document.getElementById('timeElapsed');
  const timeDuration = document.getElementById('timeDuration');

  audio.volume = parseFloat(volumeSlider.value);

  // ── Render songs ──────────────────────────────
  function renderSongs() {
    songList.innerHTML = '';

    if (musicList.length === 0) {
      songList.innerHTML = `<li style="text-align:center;color:var(--col-text-subtle);padding:24px;font-family:'Dancing Script',cursive;font-size:1rem;">no songs added yet ♡</li>`;
      return;
    }

    musicList.forEach((song, i) => {
      const li = document.createElement('li');
      li.className = 'song-item';
      li.setAttribute('role', 'option');
      li.dataset.index = i;
      li.innerHTML = `
        <span class="song-num">${String(i + 1).padStart(2, '0')}</span>
        <span class="song-name">${escapeHTML(song.name)}</span>
        <span class="song-play-icon">▶</span>
      `;
      li.addEventListener('click', () => loadAndPlay(i));
      songList.appendChild(li);
    });
  }

  renderSongs();

  // ── Play a song ──────────────────────────────
  function loadAndPlay(index) {
    if (index < 0 || index >= musicList.length) return;
    state.audio.currentIndex = index;
    const song = musicList[index];
    audio.src = `assets/audio/${song.file}`;
    audio.load();
    audio.play().catch(err => {
      console.warn('Audio play failed:', err);
      npStatus.textContent = 'could not play';
    });
    npSong.textContent = song.name;
    highlightSong(index);
  }

  function highlightSong(i) {
    document.querySelectorAll('.song-item').forEach((el, j) => el.classList.toggle('playing', j === i));
  }

  // ── Controls ─────────────────────────────────
  function togglePlay() {
    if (state.audio.currentIndex === -1) { if (musicList.length) loadAndPlay(0); return; }
    audio.paused ? audio.play() : audio.pause();
  }

  playPauseBtn.addEventListener('click', togglePlay);
  prevBtn.addEventListener('click', () => { const p = state.audio.currentIndex - 1; if (p >= 0) loadAndPlay(p); });
  nextBtn.addEventListener('click', () => { const n = state.audio.currentIndex + 1; if (n < musicList.length) loadAndPlay(n); });

  audio.addEventListener('play',  () => { state.audio.isPlaying = true;  playPauseBtn.textContent = '⏸'; npDisc.classList.add('spinning');    npStatus.textContent = 'playing ♪'; });
  audio.addEventListener('pause', () => { state.audio.isPlaying = false; playPauseBtn.textContent = '▶'; npDisc.classList.remove('spinning'); npStatus.textContent = 'paused'; });
  audio.addEventListener('ended', () => {
    const next = state.audio.currentIndex + 1;
    next < musicList.length ? loadAndPlay(next) : (playPauseBtn.textContent = '▶', npDisc.classList.remove('spinning'), npStatus.textContent = 'done ♡');
  });

  // ── Progress ─────────────────────────────────
  audio.addEventListener('timeupdate', () => {
    if (!audio.duration) return;
    const pct = (audio.currentTime / audio.duration) * 100;
    progressFill.style.width = `${pct}%`;
    progressThumb.style.left = `${pct}%`;
    timeElapsed.textContent  = formatTime(audio.currentTime);
  });
  audio.addEventListener('loadedmetadata', () => { timeDuration.textContent = formatTime(audio.duration); });

  progressBar.addEventListener('click', e => {
    if (!audio.duration) return;
    const rect = progressBar.getBoundingClientRect();
    audio.currentTime = ((e.clientX - rect.left) / rect.width) * audio.duration;
  });

  volumeSlider.addEventListener('input', () => { audio.volume = parseFloat(volumeSlider.value); });

  // ── Modal ────────────────────────────────────
  window.openMusicModal = function () {
    modal.classList.remove('hidden');
    modal.classList.add('open');
    state.musicModalOpen = true;
    document.body.style.overflow = 'hidden';
  };

  function closeMusicModal() {
    modal.classList.add('hidden');
    modal.classList.remove('open');
    state.musicModalOpen = false;
    document.body.style.overflow = '';
  }

  closeBtn.addEventListener('click', closeMusicModal);
  backdrop.addEventListener('click', closeMusicModal);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && state.musicModalOpen) closeMusicModal(); });
})();


/* ══════════════════════════════════════════════
   10. SCROLL ANIMATIONS
══════════════════════════════════════════════ */

let scrollObserver = null;

function observeElements() {
  if (scrollObserver) scrollObserver.disconnect();

  scrollObserver = new IntersectionObserver(
    entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        scrollObserver.unobserve(entry.target);
      }
    }),
    { threshold: 0.1, rootMargin: '0px 0px -36px 0px' }
  );

  document.querySelectorAll('.fade-up, .thought-card, .gallery-card').forEach(el => {
    if (!el.classList.contains('visible')) scrollObserver.observe(el);
  });
}


/* ══════════════════════════════════════════════
   11. UTILS
══════════════════════════════════════════════ */

function escapeHTML(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

function formatTime(secs) {
  if (isNaN(secs)) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}


/* ══════════════════════════════════════════════
   INIT
══════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  observeElements();

  // Re-run observers once app is revealed after unlock
  document.getElementById('app').addEventListener('animationend', () => {
    observeElements();
  }, { once: true });
});
