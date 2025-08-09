(()=>{'use strict';
  let resizeHandler = null;
  function mountSceneFrame(slug, meta){
    meta = meta || {};
    const container = document.querySelector('#scene-root') || document.body;
    const nodes = Array.from(container.childNodes);
    container.innerHTML = '<div class="head"><h1 class="title"></h1><span class="chip cat"></span><div class="tags"></div></div>' +
      '<div class="scene-root"><canvas id="scene-bg" class="scene-bg"></canvas><div class="scene-content"></div></div>';
    const head = container.querySelector('.head');
    head.querySelector('.title').textContent = meta.title || '';
    const catEl = head.querySelector('.chip.cat');
    catEl.textContent = meta.category || '';
    try {
      const th = window.theme || window.THEME;
      const fn = th.catColor || th.categoryColor;
      if (fn) catEl.style.color = fn(meta.category);
    } catch(e){}
    const tagBox = head.querySelector('.tags');
    (Array.isArray(meta.tags)?meta.tags:[]).forEach(function(t){
      const s = document.createElement('span');
      s.className = 'chip';
      s.textContent = t;
      tagBox.appendChild(s);
    });
    const content = container.querySelector('.scene-content');
    nodes.forEach(function(n){ content.appendChild(n); });
    if (!content.textContent.trim()){
      const p = document.createElement('p');
      p.textContent = meta.intro || 'эта сцена ещё в разработке';
      content.appendChild(p);
    }
    const root = container.querySelector('.scene-root');
    const bg = container.querySelector('.scene-bg');
    function fit(){
      const r = root.getBoundingClientRect();
      bg.width = r.width;
      bg.height = r.height;
    }
    resizeHandler = fit;
    window.addEventListener('resize', fit, {passive:true});
    fit();
    try { window.widgets?.mountAll(container); } catch(e){ console.warn('[widgets]', e); }
  }
  function unmountSceneFrame(){
    if (resizeHandler) {
      window.removeEventListener('resize', resizeHandler, {passive:true});
      resizeHandler = null;
    }
  }
  window.SceneFrame = { mount: mountSceneFrame, unmount: unmountSceneFrame };
})();
