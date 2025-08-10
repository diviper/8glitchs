const KEY = 'glitch:progress';
const getProgress = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } };
const isDone = slug => getProgress().includes(slug);
const markDone = slug => { const s = new Set(getProgress()); s.add(slug); localStorage.setItem(KEY, JSON.stringify([...s])); };
if (typeof window !== 'undefined') {
  window.getProgress = getProgress;
  window.isDone = isDone;
  window.markDone = markDone;
  window.progress = { getProgress, isDone, markDone };
}
if (typeof module !== 'undefined') {
  module.exports = { getProgress, isDone, markDone };
}
