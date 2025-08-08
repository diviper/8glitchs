import fs from 'fs';
import path from 'path';

const DIR = 'content/glitches';
const REQUIRED_FRONT = ['id', 'title', 'category', 'status'];
const REQUIRED_SECTIONS = [
  'TL;DR',
  'Научная опора',
  'Парадокс',
  'Дневник Дивайпера',
  'Юнг',
  'Сенека',
  'Рик',
  'Сцена',
  'Ссылки'
];

async function main() {
  const files = (await fs.promises.readdir(DIR)).filter((f) => f.endsWith('.md'));
  let ok = true;

  for (const file of files) {
    const full = path.join(DIR, file);
    const text = await fs.promises.readFile(full, 'utf8');

    const fmMatch = text.match(/^---\n([\s\S]*?)\n---/);
    if (!fmMatch) {
      console.error(`Missing front matter: ${full}`);
      ok = false;
      continue;
    }
    const fm = {};
    for (const line of fmMatch[1].split('\n')) {
      const [key, ...rest] = line.split(':');
      if (key) fm[key.trim()] = rest.join(':').trim();
    }

    for (const field of REQUIRED_FRONT) {
      if (!fm[field]) {
        console.error(`Missing field ${field} in ${full}`);
        ok = false;
      }
    }

    if (fm.status === 'draft') {
      continue;
    }

    for (const sec of REQUIRED_SECTIONS) {
      if (sec === 'Сцена') {
        if (!/^###\s+Сцена/m.test(text)) {
          console.error(`Missing section ${sec} in ${full}`);
          ok = false;
        }
      } else if (!text.includes(`### ${sec}`)) {
        console.error(`Missing section ${sec} in ${full}`);
        ok = false;
      }
    }
  }

  if (!ok) {
    process.exit(1);
  } else {
    console.log('Cards OK');
  }
}

main();
