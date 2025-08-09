(() => {
  const LS = {
    get k() { return { skip:'intro:alwaysSkip', seen:'intro:lastSeen', muted:'intro:muted' } }
  };
  let ctx, audio, started=false, muted=false, rafId;

  function initAudio(){
    if (audio) return;
    try {
      const AC = window.AudioContext||window.webkitAudioContext;
      audio = new AC();
      const o1 = audio.createOscillator(), o2 = audio.createOscillator();
      const g1 = audio.createGain(), g2 = audio.createGain();
      const filt = audio.createBiquadFilter();
      const fb = audio.createDelay(); const fbGain = audio.createGain();
      o1.type='sine'; o2.type='triangle';
      o1.frequency.value=110; o2.frequency.value=220;
      g1.gain.value=g2.gain.value=0.03;
      filt.type='lowpass'; filt.frequency.value=1200;
      fb.delayTime.value=0.25; fbGain.gain.value=0.2;

      o1.connect(g1).connect(filt);
      o2.connect(g2).connect(filt);
      filt.connect(audio.destination);
      filt.connect(fb).connect(fbGain).connect(filt);

      o1.start(); o2.start();
    } catch {}
  }

  function draw(ts){
    const c=document.getElementById('intro-canvas');
    if(!c) return;
    if(!ctx){ c.width=innerWidth; c.height=innerHeight; ctx=c.getContext('2d'); }
    const w=c.width=innerWidth, h=c.height=innerHeight;
    ctx.fillStyle='rgba(0,0,0,0.3)'; ctx.fillRect(0,0,w,h);
    for(let i=0;i<180;i++){
      const x=(Math.sin(i*13.37+ts*0.0007)+1)/2*w;
      const y=(Math.cos(i*9.91 +ts*0.0004)+1)/2*h;
      const r=(Math.sin(i+ts*0.002)+1)*1.2+0.3;
      ctx.fillStyle=`hsl(${(i*7+ts*0.02)%360} 80% 60% / .6)`;
      ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
    }
    rafId=requestAnimationFrame(draw);
  }

  function prefetch(){
    const s1=document.createElement('link');
    s1.rel='prefetch'; s1.href='assets/js/router.js';
    document.head.appendChild(s1);
    const s2=document.createElement('link');
    s2.rel='prefetch'; s2.href='content/glitches.json';
    document.head.appendChild(s2);
  }

  function show(force=false){
    const seen=+localStorage.getItem(LS.k.seen)||0;
    const skip=localStorage.getItem(LS.k.skip)==='1';
    const week=7*24*3600*1000;
    if (!force && skip && Date.now()-seen<week){
      location.hash = location.hash || '#/overview';
      return;
    }
    document.getElementById('intro')?.removeAttribute('hidden');
    requestAnimationFrame(draw);
    requestIdleCallback?.(prefetch);
  }

  function hideToHub(){
    localStorage.setItem(LS.k.seen, Date.now().toString());
    cancelAnimationFrame(rafId);
    document.getElementById('intro')?.setAttribute('hidden','');
    location.hash='#/overview';
  }

  function bind(){
    const enter=document.getElementById('intro-enter');
    const skip=document.getElementById('intro-skip');
    const always=document.getElementById('intro-always-skip');
    const mute=document.getElementById('intro-mute');

    const gesture=()=>{ if(!started){ initAudio(); started=true; } };
    ['click','pointerdown','keydown','touchstart'].forEach(ev=>{
      document.addEventListener(ev,gesture,{once:true,passive:true});
    });

    enter?.addEventListener('click', hideToHub);
    skip?.addEventListener('click', hideToHub);
    always?.addEventListener('change', e=>{
      localStorage.setItem(LS.k.skip, e.target.checked?'1':'');
      hideToHub();
    });
    mute?.addEventListener('click', ()=>{
      muted=!muted; localStorage.setItem(LS.k.muted, muted?'1':'');
      mute.toggleAttribute('data-muted', muted);
      if (audio) (muted? audio.suspend(): audio.resume()).catch(()=>{});
    });

    if (localStorage.getItem(LS.k.muted)==='1') mute?.setAttribute('data-muted','');
  }

  window.intro = { show, hideToHub };
  window.addEventListener('DOMContentLoaded', ()=>{
    bind();
    const url=new URL(location.href);
    if (url.searchParams.get('skip')==='0') show(true); else show(false);
  });
})();
