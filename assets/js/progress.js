const KEY = 'glitch:progress';
const LAST_KEY = 'glitch:lastVisited';

function getProgress() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch (e) {
    return [];
  }
}

function saveProgress(list) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

function markDone(slug) {
  const list = new Set(getProgress());
  list.add(slug);
  saveProgress(Array.from(list));
}

function isDone(slug) {
  return getProgress().includes(slug);
}

function setLastVisited(data) {
  try {
    localStorage.setItem(LAST_KEY, JSON.stringify(data));
  } catch (e) {}
}

function getLastVisited() {
  try {
    return JSON.parse(localStorage.getItem(LAST_KEY));
  } catch (e) {
    return null;
  }
}

function resetProgress() {
  localStorage.removeItem(KEY);
  localStorage.removeItem(LAST_KEY);
}

var catSlugMap = {
  'Квант': 'quant',
  'Время': 'time',
  'Космос': 'cosmos',
  'Идентичность': 'id',
  'Информация': 'info',
  'Логика': 'logic',
  'Наблюдатель': 'observer'
};

async function getStats() {
  var progress = getProgress();
  var res = { doneCount: progress.length, byCategory: {} };
  try {
    var manifest = await fetch('content/glitches.json').then(function (r) { return r.json(); });
    manifest.forEach(function (g) {
      var slug = catSlugMap[g.category] || 'other';
      if (!res.byCategory[slug]) res.byCategory[slug] = 0;
      if (progress.includes(g.slug)) res.byCategory[slug] += 1;
    });
  } catch (e) {}
  return res;
}

if (typeof window !== 'undefined') {
  window.markDone = markDone;
  window.isDone = isDone;
  window.getProgress = getProgress;
  window.setLastVisited = setLastVisited;
  window.getLastVisited = getLastVisited;
  window.resetProgress = resetProgress;
  window.getStats = getStats;
}

if (typeof module !== 'undefined') {
  module.exports = { markDone, isDone, getProgress, setLastVisited, getLastVisited, resetProgress, getStats };
}
