window.Repo = (() => {
  const base = (document.querySelector('base')?.href || (location.origin + location.pathname)).replace(/\/$/, '');
  const toUrl = p => new URL(String(p).replace(/^\/+/, ''), base + '/');
  async function fetchText(p) {
    const res = await fetch(toUrl(p), { cache: 'no-store' });
    if (!res.ok) throw new Error(`MD not found: ${p} (${res.status})`);
    return res.text();
  }
  const loadScript = src => new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = res;
    s.onerror = () => rej(new Error('load ' + src));
    document.head.appendChild(s);
  });
  let manifest = [];
  const setManifest = data => { manifest = Array.isArray(data) ? data : []; };
  const getManifest = () => manifest;
  const getManifestItem = slug => getManifest().find(x => x.slug === slug) || null;
  return { url: toUrl, fetchText, loadScript, setManifest, getManifest, getManifestItem };
})();
window.repoPaths = window.Repo;
