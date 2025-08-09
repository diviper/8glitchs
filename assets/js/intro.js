let audioCtx = null;
let masterGain = null;
let muted = localStorage.getItem('intro:mute') === 'true';

function ensureAudio() {
  if (!audioCtx || audioCtx.state === 'closed') {
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
}

function startAudio() {
  ensureAudio();
  if (audioCtx.state === 'suspended') audioCtx.resume();
}

function stopAudio() {
  if (audioCtx && audioCtx.state !== 'closed') {
    masterGain?.gain?.setTargetAtTime(0, audioCtx.currentTime, 0.05);
    audioCtx.close().catch(() => {});
  }
}

function setMute(on) {
  muted = on ?? !muted;
  localStorage.setItem('intro:mute', muted);
  if (!audioCtx || audioCtx.state === 'closed') ensureAudio();
  masterGain.gain.value = muted ? 0 : 0.05;
}

window.intro = {
  show() {
    document.getElementById('intro')?.classList.remove('hidden');
  },
  hide() {
    document.getElementById('intro')?.classList.add('hidden');
    stopAudio();
  },
  mute: setMute,
  startAudio,
};

window.addEventListener('keydown', e => {
  if (e.key.toLowerCase() === 'm') setMute();
});
