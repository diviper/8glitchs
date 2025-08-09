const KEY = 'glitch:progress';
const LAST_KEY = 'glitch:lastVisited';
const QUIZ_PREFIX = 'gr:quiz:';

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
  try {
    var del = [];
    for (var i = 0; i < localStorage.length; i++) {
      var k = localStorage.key(i);
      if (k && k.indexOf(QUIZ_PREFIX) === 0) del.push(k);
    }
    del.forEach(function (k) { localStorage.removeItem(k); });
  } catch (e) {}
  quizCache = null;
}

function quizKey(slug, id) {
  return QUIZ_PREFIX + slug + ':' + id;
}

function setQuizPassed(slug, id) {
  if (!slug || !id) return;
  try { localStorage.setItem(quizKey(slug, id), '1'); } catch (e) {}
  quizCache = null;
}

function isQuizPassed(slug, id) {
  if (!slug || !id) return false;
  try { return localStorage.getItem(quizKey(slug, id)) === '1'; } catch (e) { return false; }
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

var quizCache = null;

async function getQuizStats() {
  if (quizCache) return quizCache;
  var res = { total: 0, passed: 0, byCategory: {}, bySlug: {} };
  try {
    var passedMap = {};
    for (var i = 0; i < localStorage.length; i++) {
      var k = localStorage.key(i);
      if (k && k.indexOf(QUIZ_PREFIX) === 0) {
        var parts = k.split(':');
        var slug = parts[2];
        if (!passedMap[slug]) passedMap[slug] = new Set();
        passedMap[slug].add(parts[3]);
      }
    }
    var manifest = (window.repoPaths && window.repoPaths.getManifest ? window.repoPaths.getManifest() : []);
    Object.keys(passedMap).forEach(function (slug) {
      var count = passedMap[slug].size;
      res.total += count;
      res.passed += count;
      var item = manifest.find ? manifest.find(function (i) { return i.slug === slug; }) : null;
      var cat = item ? (catSlugMap[item.category] || 'other') : 'other';
      if (!res.byCategory[cat]) res.byCategory[cat] = { t: 0, p: 0 };
      res.byCategory[cat].t += count;
      res.byCategory[cat].p += count;
      res.bySlug[slug] = { t: count, p: count };
    });
  } catch (e) {}
  quizCache = res;
  return res;
}

async function getStats() {
  var progress = getProgress();
  var res = { doneCount: progress.length, byCategory: {} };
  try {
    var manifest = (window.repoPaths && window.repoPaths.getManifest ? window.repoPaths.getManifest() : []);
    if (!manifest.length && window.repoPaths && window.repoPaths.fetchText) {
      manifest = JSON.parse(await window.repoPaths.fetchText('content/glitches.json'));
    }
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
  window.setQuizPassed = setQuizPassed;
  window.isQuizPassed = isQuizPassed;
  window.getQuizStats = getQuizStats;
  window.progress = {
    markDone: markDone,
    isDone: isDone,
    getProgress: getProgress,
    setLastVisited: setLastVisited,
    getLastVisited: getLastVisited,
    resetProgress: resetProgress,
    getStats: getStats,
    setQuizPassed: setQuizPassed,
    isQuizPassed: isQuizPassed,
    getQuizStats: getQuizStats
  };
}

if (typeof module !== 'undefined') {
  module.exports = { markDone, isDone, getProgress, setLastVisited, getLastVisited, resetProgress, getStats, setQuizPassed, isQuizPassed, getQuizStats };
}
