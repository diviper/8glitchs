import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const manifestFile = path.join(root, 'content', 'glitches.json');
const glitches = JSON.parse(await fs.readFile(manifestFile, 'utf8'));

const args = process.argv.slice(2);
const write = args.includes('--write');
const makeStubs = args.includes('--stubs');

let changed = false;
const report = [];
const cats = ['Квант', 'Время', 'Космос', 'Информация', 'Логика', 'Идентичность'];
const normMap = {
  'Квантовые': 'Квант',
  'Квантовая': 'Квант',
  'Время/времени': 'Время',
  'Времени': 'Время',
  'Наблюдатель': 'Космос'
};

for (const item of glitches) {
  const slug = item.slug;
  const expected = `content/glitches/${slug}.md`;
  const statuses = [];
  if (!item.paths) item.paths = {};
  if (item.paths.card !== expected) {
    statuses.push('path');
    changed = true;
    item.paths.card = expected;
  }

  const abs = path.join(root, expected);
  try {
    await fs.access(abs);
  } catch (e) {
    changed = true;
    if (makeStubs) {
      const stub = `---\nid: glitch-${slug}\ntitle: ${item.title}\ncategory: ${item.category}\nstatus: draft\n---\n\n### TL;DR\nКоротко: 1–3 предложения без хайпа.\n\n### Научная опора\n1–2 предложения.\n\n### Парадокс\nГде ломается интуиция.\n\n### Дневник Дивайпера\nЛичная заметка.\n\n### Юнг\n1–2 строки.\n\n### Сенека\n1–2 строки.\n\n### Рик\n1 строка.\n\n### Сцена/механика\nЧто делает сцена.\n\n### Ссылки\n- источник\n`;
      await fs.writeFile(abs, stub);
      statuses.push('stub');
    } else {
      statuses.push('missing');
    }
  }

  if (!cats.includes(item.category)) {
    const norm = normMap[item.category];
    if (norm) {
      changed = true;
      if (write) {
        statuses.push(`cat:${item.category}->${norm}`);
        item.category = norm;
      } else {
        statuses.push(`cat?${item.category}->${norm}`);
      }
    } else {
      statuses.push(`cat!${item.category}`);
    }
  }

  report.push(`${slug}: ${statuses.join(', ') || 'OK'}`);
}

if (write && changed) {
  await fs.writeFile(
    manifestFile,
    '[\n' + glitches.map(o => '  ' + JSON.stringify(o)).join(',\n') + '\n]\n'
  );
}

console.log('Manifest doctor report:');
report.forEach(r => console.log(' - ' + r));

if (!write && changed) {
  console.error('Manifest doctor found issues.');
  process.exit(1);
}

