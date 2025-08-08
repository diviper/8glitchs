import fs from 'fs';
import path from 'path';

const REQUIRED = [
  'observer-problem', 'nonlocality', 'quantum-superposition', 'quantum-decoherence',
  'quantum-tunneling', 'quantum-teleportation', 'quantum-zeno', 'delayed-choice',
  'quantum-darwinism', 'collapse-problem', 'arrow-of-time', 'retrocausality',
  'block-universe', 'invisible-universe', 'fine-tuning', 'cosmic-loneliness',
  'multiverse-inflation', 'heat-death', 'big-crunch-rip', 'consciousness-problem',
  'ship-of-theseus', 'mind-uploading', 'chinese-room', 'free-will-illusion',
  'belief-power', 'landauer', 'bekenstein-bound', 'goodhart-law', 'simulation',
  'map-territory', 'zeno', 'banach-tarski', 'godel', 'liar', 'anthropic'
];

async function main() {
  let data;
  try {
    data = JSON.parse(await fs.promises.readFile('content/glitches.json', 'utf8'));
  } catch (err) {
    console.error('Invalid JSON:', err.message);
    process.exit(1);
  }

  const seen = new Set();
  let ok = true;
  const missingFiles = [];
  const badCategories = [];
  const ALLOWED_CATS = ['Квант','Время','Космос','Идентичность','Информация','Логика','Наблюдатель'];
  for (const item of data) {
    if (seen.has(item.slug)) {
      console.error('Duplicate slug:', item.slug);
      ok = false;
    }
    seen.add(item.slug);

    if (!(await exists(item.paths.card))) {
      missingFiles.push(item.paths.card);
      ok = false;
    } else if (!hasValidFrontMatter(item.paths.card)) {
      console.error('Invalid front matter:', item.paths.card);
      ok = false;
    }
    if (item.status === 'sceneExists') {
      if (!item.paths.scene || !(await exists(item.paths.scene))) {
        missingFiles.push(item.paths.scene || '(no scene path for ' + item.slug + ')');
        ok = false;
      }
    }
    if (!ALLOWED_CATS.includes(item.category)) {
      badCategories.push(item.slug);
      ok = false;
    }
  }

  const list = Array.from(seen);
  const missing = REQUIRED.filter((s) => !list.includes(s));
  const extra = list.filter((s) => !REQUIRED.includes(s));
  if (missing.length || extra.length) {
    console.error(`Slug set mismatch: missing=${missing} extra=${extra}`);
    ok = false;
  }

  console.log('missingFiles:', JSON.stringify(missingFiles));
  console.log('badCategories:', JSON.stringify(badCategories));
  if (!ok) {
    process.exit(1);
  } else {
    console.log('Manifest OK');
  }
}

async function exists(p) {
  try {
    await fs.promises.access(path.resolve(p));
    return true;
  } catch {
    return false;
  }
}

function hasValidFrontMatter(p) {
  const t = fs.readFileSync(p, 'utf8');
  return /^---\s*[\s\S]*?\n---\s*/.test(t);
}

main();
