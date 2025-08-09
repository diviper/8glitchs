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
  window.repoPaths = { base, toRepoURL, fetchText, getManifest, getManifestItem };
})();
