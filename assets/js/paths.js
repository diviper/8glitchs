const base = (() => {
  const segs = location.pathname.split('/');
  // If running from file://, path is like /path/to/repo/index.html -> ''
  // If running from gh-pages, path is like /repo-name/ -> 'repo-name'
  const repoName = segs.length > 2 ? segs[1] : '';
  return `/${repoName}`;
})();

function toRepoURL(path) {
  if (!path) throw new Error('toRepoURL: empty path');
  const cleanPath = String(path).replace(/^\/+/, '');
  // Use location.origin to handle both http and file protocols
  return new URL(`${base}/${cleanPath}`.replace(/\/+/g, '/'), location.origin).toString();
}

async function fetchText(path, options) {
  const url = toRepoURL(path);
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`fetchText failed for ${path}: ${response.status} ${response.statusText}`);
  }
  return response.text();
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`Script load error for ${src}`));
    document.head.appendChild(script);
  });
}

let manifestCache;
async function getManifest() {
  if (manifestCache) {
    return manifestCache;
  }
  try {
    const text = await fetchText('content/glitches.json');
    manifestCache = JSON.parse(text);
    return manifestCache;
  } catch (error) {
    console.error('Failed to load or parse manifest:', error);
    return []; // Return empty array on failure
  }
}

async function getManifestItem(slug) {
  const manifest = await getManifest();
  return manifest.find(item => item.slug === slug) || null;
}

export {
  base,
  toRepoURL,
  fetchText,
  loadScript,
  getManifest,
  getManifestItem,
};
