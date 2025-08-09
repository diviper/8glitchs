window.audioBus = (function(){
  let ctx, gain;
  let muted = JSON.parse(localStorage.getItem('audio:muted') || 'false');
  function ensure(){
    if(!ctx){
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      gain = ctx.createGain();
      gain.gain.value = muted ? 0 : 0.05;
      gain.connect(ctx.destination);
    }
    return { ctx, gain };
  }
  function node(){
    ensure();
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.connect(g).connect(gain);
    return { osc, g, ctx };
  }
  function setMuted(m){
    ensure();
    muted = m;
    localStorage.setItem('audio:muted', JSON.stringify(m));
    gain.gain.setTargetAtTime(m ? 0 : 0.05, ctx.currentTime, 0.05);
  }
  window.addEventListener('keydown', e=>{
    if(e.key.toLowerCase() === 'm') setMuted(!muted);
  });
  return { ensure, node, setMuted, isMuted: () => muted };
})();
