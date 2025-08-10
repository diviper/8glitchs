let audioCtx = null;
let masterGain = null;
let muted = localStorage.getItem('intro:mute') === 'true';
const muteBtn = document.getElementById('intro-mute');
muteBtn?.toggleAttribute('data-muted', muted);

function ensureAudio() {
  if (audioCtx && audioCtx.state !== 'closed') return;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  audioCtx = new Ctx();
  masterGain = audioCtx.createGain();
  masterGain.gain.value = muted ? 0 : 0.05;
  masterGain.connect(audioCtx.destination);

  const osc = audioCtx.createOscillator();
  osc.type = 'sine';
  osc.frequency.value = 80;
  osc.connect(masterGain);
  osc.start();

  const noise = audioCtx.createBufferSource();
  const buf = audioCtx.createBuffer(1, audioCtx.sampleRate * 2, audioCtx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.03;
  noise.buffer = buf;
  noise.loop = true;
  noise.connect(masterGain);
  noise.start();
}

function startAudio() {
  ensureAudio();
  masterGain.gain.value = muted ? 0 : 0.05;
  if (audioCtx.state === 'suspended') audioCtx.resume();
}

function stopAudio() {
  if (!audioCtx || audioCtx.state === 'closed') return;
  try {
    masterGain?.gain?.setTargetAtTime(0, audioCtx.currentTime, 0.05);
  } catch {}
}

function setMute(on) {
  muted = on ?? !muted;
  localStorage.setItem('intro:mute', muted);
  if (!audioCtx || audioCtx.state === 'closed') ensureAudio();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  masterGain.gain.value = muted ? 0 : 0.05;
  muteBtn?.toggleAttribute('data-muted', muted);
}

window.intro = {
  show() {
    document.getElementById('intro')?.classList.remove('hidden');
  },
  hide() {
    document.getElementById('intro')?.classList.add('hidden');
    stopAudio();
  },
  startAudio,
  mute: setMute
};

window.addEventListener('keydown', e => {
  if (e.key.toLowerCase() === 'm') setMute();
});

document.getElementById('intro-enter')?.addEventListener('click', () => {
  startAudio();
  try { window.intro?.hide?.(); } catch {}
  localStorage.setItem('intro:skip', '1');
  location.hash = '#/overview';
});
document.getElementById('intro-mute')?.addEventListener('click', function(){
  startAudio();
  setMute();
  this.toggleAttribute('data-muted', muted);
});
