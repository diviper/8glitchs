const KEY = 'glitch:progress';
const LAST_KEY = 'glitch:lastVisited';
const QUIZ_PREFIX = 'gr:quiz:';

function getProgress(){
  try{
    return JSON.parse(localStorage.getItem(KEY)) || [];
  }catch(e){
    return [];
  }
}

function saveProgress(list){
  try{ localStorage.setItem(KEY, JSON.stringify(list)); }catch(e){}
}

function markDone(slug){
  var list = new Set(getProgress());
  list.add(slug);
  saveProgress(Array.from(list));
}

function isDone(slug){
  return getProgress().includes(slug);
}

function setLastVisited(data){
  try{ localStorage.setItem(LAST_KEY, JSON.stringify(data)); }catch(e){}
}

function getLastVisited(){
  try{ return JSON.parse(localStorage.getItem(LAST_KEY)); }catch(e){ return null; }
}

function resetProgress(){
  localStorage.removeItem(KEY);
  localStorage.removeItem(LAST_KEY);
  try{
    var del = [];
    for (var i=0;i<localStorage.length;i++){
      var k = localStorage.key(i);
      if (k && k.indexOf(QUIZ_PREFIX)===0) del.push(k);
    }
    del.forEach(function(k){ localStorage.removeItem(k); });
  }catch(e){}
  quizCache = null;
}

function quizKey(slug,id){ return QUIZ_PREFIX+slug+':'+id; }

function setQuizPassed(slug,id){
  if (!slug || !id) return;
  try{ localStorage.setItem(quizKey(slug,id),'1'); }catch(e){}
  quizCache = null;
}

function isQuizPassed(slug,id){
  if (!slug || !id) return false;
  try{ return localStorage.getItem(quizKey(slug,id))==='1'; }catch(e){ return false; }
}

var quizCache = null;

async function getQuizStats(){
  if (quizCache) return quizCache;
  var res = { total:0, passed:0, bySlug:{} };
  try{
    for (var i=0;i<localStorage.length;i++){
      var k = localStorage.key(i);
      if (k && k.indexOf(QUIZ_PREFIX)===0){
        var parts = k.split(':');
        var slug = parts[2];
        res.total++;
        res.passed++;
        if (!res.bySlug[slug]) res.bySlug[slug] = { t:0, p:0 };
        res.bySlug[slug].t++;
        res.bySlug[slug].p++;
      }
    }
  }catch(e){}
  quizCache = res;
  return res;
}

function getStats(){
  var progress = getProgress();
  return { doneCount: progress.length, byCategory: {} };
}

if (typeof window !== 'undefined'){
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

if (typeof module !== 'undefined'){
  module.exports = { markDone, isDone, getProgress, setLastVisited, getLastVisited, resetProgress, getStats, setQuizPassed, isQuizPassed, getQuizStats };
}
