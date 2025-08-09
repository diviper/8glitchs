(() => {
  const LS = {
    get k() { return { skip: 'intro:alwaysSkip', seen: 'intro:lastSeen' }; }
  };
  const { ctx, gain: busGain } = window.audioBus.ensure();
  const masterGain = ctx.createGain();
  masterGain.gain.value = 1;
  masterGain.connect(busGain);
  const root = document.getElementById('intro');

  const noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const data = noiseBuf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.02;
  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuf;
  noise.loop = true;
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 800;
  noise.connect(lp).connect(masterGain);

  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.value = 110;
  const env = ctx.createGain();
  env.gain.value = 0.0;
  osc.connect(env).connect(masterGain);

  let started = false, rafId;
  let ctx2d;
  const bursts = [];
  let motion = 0;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function startAudioOnGesture() {
    if (ctx.state !== 'running') ctx.resume();
    if (!started) {
      noise.start();
      osc.start();
      started = true;
    }
    const now = ctx.currentTime;
    env.gain.cancelScheduledValues(now);
    env.gain.linearRampToValueAtTime(0.05, now + 0.8);
  }

  function stopAudio() {
    const now = ctx.currentTime;
    env.gain.cancelScheduledValues(now);
    env.gain.linearRampToValueAtTime(0.0, now + 0.2);
    masterGain.gain.setTargetAtTime(0, now, 0.05);
  }

  function applyMuteUI(btn) {
    const isMuted = window.audioBus.isMuted();
    btn && (btn.textContent = isMuted ? '🔇' : '🔊', btn.toggleAttribute('data-muted', isMuted));
  }

  function spawnBurst(x, y) {
    bursts.push({ x, y, r: 0 });
  }

  function draw(ts) {
    const c = document.getElementById('intro-canvas');
    if (!c) return;
    if (!ctx2d) { c.width = innerWidth; c.height = innerHeight; ctx2d = c.getContext('2d'); }
    const w = c.width = innerWidth, h = c.height = innerHeight;
    ctx2d.fillStyle = 'rgba(0,0,0,0.2)';
    ctx2d.fillRect(0, 0, w, h);

    const speed = prefersReduced ? (0.3 + 0.3 * Math.sin(ts * 0.001)) : Math.min(1, motion / 40);
    if (!prefersReduced) motion *= 0.9;

    const count = 80 + speed * 160;
    for (let i = 0; i < count; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const s = 1 + speed * 5;
      ctx2d.fillStyle = `hsl(${Math.random() * 360} 90% 60% / ${0.2 + speed * 0.5})`;
      ctx2d.fillRect(x, y, s, s);
    }

    for (let i = bursts.length - 1; i >= 0; i--) {
      const b = bursts[i];
      b.r += 2 + speed * 8;
      if (b.r > 200) { bursts.splice(i, 1); continue; }
      ctx2d.strokeStyle = `hsl(${(ts * 0.05 + b.r) % 360} 80% 70% / ${1 - b.r / 200})`;
      ctx2d.lineWidth = 2;
      ctx2d.strokeRect(b.x - b.r / 2, b.y - b.r / 2, b.r, b.r);
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

  function showIntro() {
    root?.classList.remove('hidden');
    document.body.classList.add('lock');
    requestAnimationFrame(draw);
    requestIdleCallback?.(prefetch);
  }

  function maybeShow(force = false) {
    const seen = +localStorage.getItem(LS.k.seen) || 0;
    const skip = localStorage.getItem(LS.k.skip) === '1';
    const week = 7 * 24 * 3600 * 1000;
    if (!force && (skip || Date.now() - seen < week)) {
      location.hash = location.hash || '#/overview';
      return;
    }
    showIntro();
  }

  function hide() {
    root?.classList.add('hidden');
    document.body.classList.remove('lock');
    try { masterGain?.gain.setTargetAtTime(0, ctx.currentTime, 0.05); } catch {}
    try { ctx?.close?.(); } catch {}
    cancelAnimationFrame(rafId);
  }

  function hideToHub() {
    localStorage.setItem(LS.k.seen, Date.now().toString());
    hide();
    location.hash = '#/overview';
  }

  function bind() {
    const introEl = root;
    const enter = document.getElementById('intro-enter');
    const always = document.getElementById('intro-always-skip');
    const mute = document.getElementById('intro-mute');
    const canvas = document.getElementById('intro-canvas');

    const gesture = () => { startAudioOnGesture(); };
    ['click', 'pointerdown', 'touchstart', 'keydown'].forEach(ev => {
      document.addEventListener(ev, gesture, { once: true, passive: true });
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !introEl.classList.contains('hidden')) hideToHub();
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

    function toggleMute() {
      window.audioBus.setMuted(!window.audioBus.isMuted());
      applyMuteUI(mute);
    }
    mute?.addEventListener('click', toggleMute);
    window.addEventListener('keydown', e => {
      if (e.key.toLowerCase() === 'm') toggleMute();
    });

    applyMuteUI(mute);
    if (always && localStorage.getItem(LS.k.skip) === '1') always.checked = true;
  }

  window.intro = {
    show: showIntro,
    hide: hide,
    mute: function(on){ window.audioBus.setMuted(on); }
  };
  window.addEventListener('DOMContentLoaded', () => {
    bind();
    const url = new URL(location.href);
    if (url.searchParams.get('skip') === '0') maybeShow(true); else maybeShow(false);
  });
})();

