window.__BUILD = (new Date()).toISOString().replace(/[:.]/g,'');
window.repoPaths = window.repoPaths||{};
repoPaths.v = () => window.__BUILD;
repoPaths.withV = (url) => url + (url.includes('?')?'&':'?') + 'v=' + repoPaths.v();
repoPaths.loadScript = (src) => new Promise((res,rej)=>{
  const s=document.createElement('script'); s.src=repoPaths.withV(src); s.onload=res; s.onerror=()=>rej(new Error('load '+src));
  document.head.appendChild(s);
});

(()=>{'use strict';
  const base = (() => {
    const seg = location.pathname.split('/').filter(Boolean)[0] || '';
    return seg ? `/${seg}/` : '/';
  })();
  function toRepoURL(p){ return new URL(p.replace(/^\//,''), location.origin + base).toString(); }
  async function fetchText(p){
    const res = await fetch(toRepoURL(p), {cache:'no-store'});
    if(!res.ok) throw new Error(`MD not found: ${p} (${res.status})`);
    return res.text();
  }
  function getManifest(){ return window.__manifest || []; }
  function getManifestItem(slug){ return getManifest().find(x => x.slug===slug) || null; }
  Object.assign(repoPaths, { base, toRepoURL, fetchText, getManifest, getManifestItem });
})();
