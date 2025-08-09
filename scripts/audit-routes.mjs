import fs from 'fs';
import path from 'path';

const manifest = JSON.parse(fs.readFileSync('content/glitches.json','utf8'));
const reqSections = ['TL;DR','Научная опора','Парадокс','Дневник Дивайпера','Юнг','Сенека','Рик','Сцена/механика','Ссылки'];

function hasAllSections(md){
  return reqSections.every(h => new RegExp(`^###\\s*${h}\\b`, 'm').test(md));
}

const rows = [];
let missing = 0, bad = 0;

for (const it of manifest){
  const slug = it.slug;
  const card = it.paths?.card || `content/glitches/${slug}.md`;
  const scene = it.paths?.scene;
  const existsCard = fs.existsSync(card);
  const existsScene = scene ? fs.existsSync(scene) : false;
  let issues = [];
  if (!existsCard){ issues.push('no card'); missing++; }
  else {
    const md = fs.readFileSync(card,'utf8');
    if (!hasAllSections(md)) { issues.push('sections'); bad++; }
  }
  if (it.status==='sceneExists' && !existsScene) issues.push('status=sceneExists but no scene');
  rows.push({slug, category: it.category, card: existsCard?'OK':'—', scene: existsScene?'OK':'—', issues: issues.join(', ')||'—'});
}

const summary = `Всего записей: ${manifest.length}. Нет карточек: ${missing}. Проблемные секции: ${bad}.`;
let table = `| slug | category | card | scene | issues |\n|---|---|---:|---:|---|\n` + rows.map(r=>`| ${r.slug} | ${r.category} | ${r.card} | ${r.scene} | ${r.issues} |`).join('\n');

fs.writeFileSync('REPORT.routes.md', `# Route audit\n\n${summary}\n\n${table}\n`);
console.log(summary);
