import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const manifestFile = path.join(root, 'content', 'glitches.json');
const scenesDir = path.join(root, 'scenes');

const data = JSON.parse(await fs.readFile(manifestFile, 'utf8'));

await fs.mkdir(scenesDir, { recursive: true });

function stubHtml({ title, slug }) {
  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Сцена — ${title}</title>
  <style>
    body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, 'Helvetica Neue', Arial, 'Noto Sans', 'Apple Color Emoji', 'Segoe UI Emoji'; background:#0b1326; color:#fff; margin:0; }
    .scene { min-height: 60vh; padding: 24px; display: grid; place-items: center; text-align: center; }
    .box { background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.12); border-radius: 12px; padding: 24px; max-width: 720px; }
    .box h1 { margin: 0 0 8px; font-size: 24px; }
    .box p { margin: 0 0 12px; color: #9aa4b2; }
    .box .controls { display:flex; gap:8px; justify-content:center; margin-top: 12px; }
    .btn { appearance:none; border:1px solid rgba(255,255,255,.2); background:transparent; color:#fff; padding:8px 12px; border-radius:8px; cursor:pointer; }
    .btn:hover { background: rgba(255,255,255,.08); }
  </style>
</head>
<body>
  <div class="scene">
    <div class="box">
      <h1>${title}</h1>
      <p>Интерактивная сцена для «${title}». Заглушка. Замените на реальную механику.</p>
      <div class="controls">
        <button class="btn" id="act">Действие</button>
        <button class="btn" id="share">Параметры</button>
      </div>
      <pre id="out" style="text-align:left; white-space:pre-wrap; margin-top: 12px;"></pre>
    </div>
  </div>
  <script>
  (function(){
    window.__initScene = function(){
      const out = document.getElementById('out');
      const act = document.getElementById('act');
      act?.addEventListener('click', function(){ out.textContent = 'tick:' + Date.now(); });
      const sh = document.getElementById('share');
      sh?.addEventListener('click', function(){ const p = window.__getShareParams(); out.textContent = 'share:' + JSON.stringify(p); });
    };
    window.__applyParams = function(params){
      try { document.getElementById('out').textContent = 'params:' + JSON.stringify(params||{}); } catch(e){}
    };
    window.__getShareParams = function(){ return { s: '${slug}', t: '${title}' }; };
  })();
  </script>
</body>
</html>`;
}

let changed = false;
for (const item of data) {
  const slug = item.slug;
  const expected = `scenes/glitch-${slug}.html`;
  const abs = path.join(root, expected);
  const needScene = !item.paths || !item.paths.scene;
  if (needScene) {
    try {
      await fs.access(abs);
      // scene file exists but manifest not pointing
      item.paths = item.paths || {};
      item.paths.scene = expected;
      item.status = 'sceneExists';
      changed = true;
      continue;
    } catch {}
    const html = stubHtml({ title: item.title, slug });
    await fs.writeFile(abs, html, 'utf8');
    item.paths = item.paths || {};
    item.paths.scene = expected;
    item.status = 'sceneExists';
    changed = true;
    continue;
  }
  // ensure file exists if path is present
  if (item.paths && item.paths.scene) {
    try { await fs.access(path.join(root, item.paths.scene)); }
    catch {
      const html = stubHtml({ title: item.title, slug });
      await fs.writeFile(path.join(root, item.paths.scene), html, 'utf8');
      item.status = 'sceneExists';
      changed = true;
    }
  }
}

if (changed) {
  await fs.writeFile(
    manifestFile,
    '[\n' + data.map(o => '  ' + JSON.stringify(o)).join(',\n') + '\n]\n',
    'utf8'
  );
  console.log('Scene stubs generated and manifest updated.');
} else {
  console.log('No changes needed. All scenes present.');
}