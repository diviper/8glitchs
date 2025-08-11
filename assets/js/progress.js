const KEY = 'glitch:progress';
const QUIZ_KEY = 'glitch:quiz';

const getProgress = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } };
const isDone = slug => getProgress().includes(slug);
const markDone = slug => { const s = new Set(getProgress()); s.add(slug); localStorage.setItem(KEY, JSON.stringify([...s])); };

// Quiz progress helpers
const getQuizStore = () => {
  try {
    const raw = localStorage.getItem(QUIZ_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return (parsed && typeof parsed === 'object') ? parsed : {};
  } catch {
    return {};
  }
};

const setQuizStore = (store) => {
  try {
    localStorage.setItem(QUIZ_KEY, JSON.stringify(store || {}));
  } catch {
    /* ignore */
  }
};

const isQuizPassed = (slug, questionId) => {
  if (!slug || !questionId) return false;
  const store = getQuizStore();
  const set = new Set(store[slug] || []);
  return set.has(questionId);
};

const setQuizPassed = (slug, questionId) => {
  if (!slug || !questionId) return;
  const store = getQuizStore();
  const set = new Set(store[slug] || []);
  set.add(questionId);
  store[slug] = [...set];
  setQuizStore(store);
};

// Optional aggregate stats helpers
const getQuizStats = async () => {
  const store = getQuizStore();
  // Aggregate simple counters; router uses only total/passed optionally
  let total = 0;
  let passed = 0;
  const bySlug = {};
  Object.keys(store).forEach((slug) => {
    const arr = Array.isArray(store[slug]) ? store[slug] : [];
    const unique = new Set(arr);
    bySlug[slug] = { t: unique.size, p: unique.size };
    total += unique.size;
    passed += unique.size;
  });
  return { total, passed, bySlug };
};

if (typeof window !== 'undefined') {
  window.getProgress = getProgress;
  window.isDone = isDone;
  window.markDone = markDone;
  window.progress = { getProgress, isDone, markDone, isQuizPassed, setQuizPassed };
  // expose stats optionally
  window.getQuizStats = getQuizStats;
}
if (typeof module !== 'undefined') {
  module.exports = { getProgress, isDone, markDone, isQuizPassed, setQuizPassed, getQuizStats };
}
