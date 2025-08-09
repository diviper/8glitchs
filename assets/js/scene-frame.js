// Helper for scene pages loaded in the hub
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

  function applyQuery(q){
    var base = location.hash.split('?')[0] || '#';
    var qs = new URLSearchParams(q || {}).toString();
    history.replaceState(null, '', base + (qs ? '?' + qs : ''));
  }

  function localToast(msg){
    if(typeof window.showToast === 'function'){ window.showToast(msg); return; }
    var t = document.createElement('div');
    t.style.position = 'fixed';
    t.style.bottom = '20px';
    t.style.right = '20px';
    t.style.background = 'rgba(0,0,0,.8)';
    t.style.padding = '8px 14px';
    t.style.borderRadius = '8px';
    t.style.color = '#fff';
    t.style.zIndex = 10000;
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function(){ t.remove(); }, 1500);
  }

  function copyShareUrl(){
    var params = {};
    if(typeof window.__getShareParams === 'function'){
      try{ params = window.__getShareParams() || {}; } catch(e){}
    }
    applyQuery(params);
    var url = location.href;
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(url).then(function(){ localToast('Скопировано'); });
    } else {
      var ok = prompt('Ссылка:', url);
      if(ok !== null) localToast('Скопировано');
    }
  }

  function renderSceneHead(opts){
    opts = opts || {};
    var title = opts.title || '';
    var slug = opts.slug || '';
    var head = document.createElement('div');
    head.className = 'scene-head';
    head.innerHTML = '\n      <a class="btn-link" href="#/glitch/' + slug + '">← К карточке</a>\n      <div class="spacer"></div>\n      <button class="btn-link" id="shareBtn">Поделиться</button>\n    ';
    document.querySelector('#scene-frame')?.prepend(head);
    head.querySelector('#shareBtn')?.addEventListener('click', async function(){
      var url = location.href;
      try{ await navigator.share?.({ title: title, url: url }); } catch(e){}
      try{ await navigator.clipboard?.writeText(url); window.showToast?.('Ссылка скопирована'); } catch(e){}
    });
  }

  function cleanupLegacy(){
    document.querySelectorAll('.hero,.legacy,.series,.bug-series,.project-banner,.btns').forEach(function(n){ n.remove(); });
    document.querySelectorAll('.chipbar,.chips,.hero-badges').forEach(function(n){ n.remove(); });
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
      shareBtn.addEventListener('click', copyShareUrl);
    }
  }

  window.applyQuery = applyQuery;
  window.copyShareUrl = copyShareUrl;
  window.sceneFrame = { renderSceneHead: renderSceneHead, cleanupLegacy: cleanupLegacy };
  window.addEventListener('DOMContentLoaded', init);
})();
