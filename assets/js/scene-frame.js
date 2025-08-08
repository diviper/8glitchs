(function(){
  function parseParams(){
    var hash = location.hash || '';
    var q = {};
    var idx = hash.indexOf('?');
    var paramStr = '';
    if(idx !== -1){
      paramStr = hash.slice(idx+1);
    } else if(hash.startsWith('#')){
      paramStr = hash.slice(1);
    }
    if(paramStr){
      var sp = new URLSearchParams(paramStr);
      sp.forEach(function(v,k){ q[k] = v; });
    }
    return q;
  }
  function init(){
    if(typeof window.__initScene === 'function'){
      try{ window.__initScene(); } catch(e){}
    }
    if(typeof window.__applyParams === 'function'){
      try{ window.__applyParams(parseParams()); } catch(e){}
    }
    var shareBtn = document.querySelector('[data-share]');
    if(shareBtn){
      shareBtn.addEventListener('click', function(){
        var params = {};
        if(typeof window.__getShareParams === 'function'){
          try{ params = window.__getShareParams() || {}; } catch(e){}
        }
        var hash = new URLSearchParams(params).toString();
        if(hash) location.hash = '#' + hash; else location.hash = '';
        var url = location.href;
        if(navigator.share){
          navigator.share({url:url}).catch(function(){});
        } else if(navigator.clipboard && navigator.clipboard.writeText){
          navigator.clipboard.writeText(url);
        } else {
          prompt('Ссылка:', url);
        }
      });
    }
  }
  window.addEventListener('DOMContentLoaded', init);
})();
