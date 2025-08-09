import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const manifestFile = path.join(root, 'content', 'glitches.json');
const glitches = JSON.parse(await fs.readFile(manifestFile, 'utf8'));

const report = [];
for (const item of glitches) {
  const slug = item.slug;
  const expected = `content/glitches/${slug}.md`;
  let status = 'OK';
  if (!item.paths) item.paths = {};
  if (item.paths.card !== expected) {
    item.paths.card = expected;
    status = 'Fixed';
  }
  const abs = path.join(root, expected);
  try {
    await fs.access(abs);
  } catch (e) {
    const stub = `---\nid: glitch-${slug}\ntitle: ${item.title}\ncategory: ${item.category}\nstatus: draft\n---\n\n### TL;DR\nКоротко: 1–3 предложения без хайпа.\n\n### Научная опора\n1–2 предложения.\n\n### Парадокс\nГде ломается интуиция.\n\n### Дневник Дивайпера\nЛичная заметка.\n\n### Юнг\n1–2 строки.\n\n### Сенека\n1–2 строки.\n\n### Рик\n1 строка.\n\n### Сцена/механика\nЧто делает сцена.\n\n### Ссылки\n- источник\n`;
    await fs.writeFile(abs, stub);
    status = status === 'Fixed' ? 'Fixed+Stub' : 'Stub';
  }
  report.push(`${slug}: ${status}`);
}

await fs.writeFile(manifestFile, '[\n' + glitches.map(o => '  ' + JSON.stringify(o)).join(',\n') + '\n]\n');

console.log('Manifest doctor report:');
report.forEach(r => console.log(' - ' + r));
