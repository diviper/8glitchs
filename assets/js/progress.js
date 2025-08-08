const KEY = 'glitch:progress';

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

if (typeof window !== 'undefined') {
  window.markDone = markDone;
  window.isDone = isDone;
  window.getProgress = getProgress;
}

if (typeof module !== 'undefined') {
  module.exports = { markDone, isDone, getProgress };
}
