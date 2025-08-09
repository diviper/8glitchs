import fs from 'fs';
import path from 'path';

const MANIFEST = 'content/glitches.json';
const ROOT = process.cwd();
const ALLOWED_CATS = new Set(['Квант','Время','Космос','Идентичность','Информация','Логика','Наблюдатель']);

const manifest = JSON.parse(fs.readFileSync(MANIFEST,'utf8'));
const seen = new Set();
const rows = [];
const problems = [];

function exists(p){ return fs.existsSync(path.join(ROOT, p)); }
function hasYamlAndSections(p){
  if(!exists(p)) return {yaml:false, sections:[]};
  const txt = fs.readFileSync(path.join(ROOT,p),'utf8');
  const yaml = /^---\s*[\s\S]*?---/m.test(txt);
  const req = ['### TL;DR','### Научная опора','### Парадокс','### Дневник Дивайпера','### Юнг','### Сенека','### Рик','### Сцена/механика','### Ссылки'];
  const found = req.filter(h => txt.includes(h));
  return {yaml, sections:found};
}

for(const it of manifest){
  const {slug, title, category, paths={}} = it;
  const errs = [];
  if(!slug) errs.push('no slug');
  if(seen.has(slug)) errs.push('duplicate slug'); else seen.add(slug);
  if(!ALLOWED_CATS.has(category)) errs.push(`bad category: ${category}`);
  if(paths.card?.startsWith('/')) errs.push('card path starts with "/"');
  if(paths.scene?.startsWith('/')) errs.push('scene path starts with "/"');

  const cardOk = paths.card ? exists(paths.card) : false;
  const sceneOk = paths.scene ? exists(paths.scene) : false;

  if(paths.card && !cardOk) errs.push(`missing card: ${paths.card}`);
  if(paths.scene && !sceneOk) errs.push(`missing scene: ${paths.scene}`);

  const meta = hasYamlAndSections(paths.card||'');
  if(paths.card){
    if(!meta.yaml) errs.push('card: no YAML');
    if(meta.sections.length < 5) errs.push('card: missing sections');
  }

  rows.push({ slug, title, category, card: cardOk?'OK':'—', scene: sceneOk?'OK':'—', errs: errs.join('; ')});
  if(errs.length) problems.push({slug, errs});
}

const md = [
  '# Route audit',
  '',
  `Всего записей: ${manifest.length}. Проблемных: ${problems.length}.`,
  '',
  '| slug | category | card | scene | issues |',
  '|---|---|---:|---:|---|',
  ...rows.map(r=>`| ${r.slug} | ${r.category} | ${r.card} | ${r.scene} | ${r.errs||'—'} |`),
  ''
].join('\n');

fs.writeFileSync('REPORT.routes.md', md);
console.log('Wrote REPORT.routes.md');
process.exit(problems.length ? 2 : 0);
