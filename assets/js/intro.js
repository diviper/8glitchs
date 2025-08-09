(() => {
  const LS = {
    get k() { return { skip: 'intro:alwaysSkip', seen: 'intro:lastSeen', mute: 'intro:mute' }; }
  };
  let ctx, audio, started = false, muted = false, rafId;
  const bursts = [];
  let motion = 0;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function initAudio() {
    if (audio) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      audio = new AC();
      const osc = audio.createOscillator();
      const gain = audio.createGain();
      osc.type = 'sawtooth';
      osc.frequency.value = 110;
      gain.gain.value = 0.02;
      osc.connect(gain).connect(audio.destination);
      osc.start();
    } catch (e) {}
  }

  function spawnBurst(x, y) {
    bursts.push({ x, y, r: 0 });
  }

  function draw(ts) {
    const c = document.getElementById('intro-canvas');
    if (!c) return;
    if (!ctx) { c.width = innerWidth; c.height = innerHeight; ctx = c.getContext('2d'); }
    const w = c.width = innerWidth, h = c.height = innerHeight;
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(0, 0, w, h);

    const speed = prefersReduced ? (0.3 + 0.3 * Math.sin(ts * 0.001)) : Math.min(1, motion / 40);
    if (!prefersReduced) motion *= 0.9;

    const count = 80 + speed * 160;
    for (let i = 0; i < count; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const s = 1 + speed * 5;
      ctx.fillStyle = `hsl(${Math.random() * 360} 90% 60% / ${0.2 + speed * 0.5})`;
      ctx.fillRect(x, y, s, s);
    }

    for (let i = bursts.length - 1; i >= 0; i--) {
      const b = bursts[i];
      b.r += 2 + speed * 8;
      if (b.r > 200) { bursts.splice(i, 1); continue; }
      ctx.strokeStyle = `hsl(${(ts * 0.05 + b.r) % 360} 80% 70% / ${1 - b.r / 200})`;
      ctx.lineWidth = 2;
      ctx.strokeRect(b.x - b.r / 2, b.y - b.r / 2, b.r, b.r);
    }

    rafId = requestAnimationFrame(draw);
  }

  function prefetch() {
    ['router.js', 'md.js', 'widgets.js'].forEach(src => {
      const l = document.createElement('link');
      l.rel = 'prefetch';
      l.href = 'assets/js/' + src;
      document.head.appendChild(l);
    });
  }

  function show(force = false) {
    const seen = +localStorage.getItem(LS.k.seen) || 0;
    const skip = localStorage.getItem(LS.k.skip) === '1';
    const week = 7 * 24 * 3600 * 1000;
    if (!force && (skip || Date.now() - seen < week)) {
      location.hash = location.hash || '#/overview';
      return;
    }
    document.getElementById('intro')?.removeAttribute('hidden');
    requestAnimationFrame(draw);
    requestIdleCallback?.(prefetch);
  }

  function hideToHub() {
    localStorage.setItem(LS.k.seen, Date.now().toString());
    cancelAnimationFrame(rafId);
    document.getElementById('intro')?.setAttribute('hidden', '');
    location.hash = '#/overview';
  }

  function bind() {
    const introEl = document.getElementById('intro');
    const enter = document.getElementById('intro-enter');
    const always = document.getElementById('intro-always-skip');
    const mute = document.getElementById('intro-mute');
    const canvas = document.getElementById('intro-canvas');

    const gesture = () => { if (!started) { initAudio(); started = true; if (muted && audio) audio.suspend().catch(() => {}); } };
    ['click', 'pointerdown', 'touchstart', 'keydown'].forEach(ev => {
      document.addEventListener(ev, gesture, { once: true, passive: true });
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !introEl.hasAttribute('hidden')) hideToHub();
    });

    canvas?.addEventListener('click', e => {
      const r = canvas.getBoundingClientRect();
      spawnBurst(e.clientX - r.left, e.clientY - r.top);
    });

    if (!prefersReduced) {
      let lastX, lastY;
      window.addEventListener('mousemove', e => {
        if (lastX !== undefined) {
          const dx = e.clientX - lastX, dy = e.clientY - lastY;
          motion = Math.min(100, motion + Math.sqrt(dx * dx + dy * dy));
        }
        lastX = e.clientX; lastY = e.clientY;
      });
    }

    enter?.addEventListener('click', hideToHub);

    always?.addEventListener('change', e => {
      localStorage.setItem(LS.k.skip, e.target.checked ? '1' : '');
    });

    mute?.addEventListener('click', () => {
      muted = !muted;
      localStorage.setItem(LS.k.mute, muted ? '1' : '');
      mute.textContent = muted ? '🔇' : '🔊';
      mute.toggleAttribute('data-muted', muted);
      if (audio) (muted ? audio.suspend() : audio.resume()).catch(() => {});
    });

    muted = localStorage.getItem(LS.k.mute) === '1';
    if (muted) mute?.setAttribute('data-muted', '');
    mute && (mute.textContent = muted ? '🔇' : '🔊');
    if (always && localStorage.getItem(LS.k.skip) === '1') always.checked = true;
  }

  window.intro = { show, hideToHub };
  window.addEventListener('DOMContentLoaded', () => {
    bind();
    const url = new URL(location.href);
    if (url.searchParams.get('skip') === '0') show(true); else show(false);
  });
})();

