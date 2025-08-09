(function(){
  window.renderSceneFrame = function(slug, meta){
    meta = meta || {};
    var container = document.querySelector('#scene-root') || document.body;
    var nodes = Array.from(container.childNodes);
    container.innerHTML = '
      <div class="head"><h1 class="title"></h1><span class="chip cat"></span><div class="tags"></div></div>
      <div class="scene-root">
        <canvas id="scene-bg" class="scene-bg"></canvas>
        <div class="scene-content"></div>
      </div>';
    var head = container.querySelector('.head');
    head.querySelector('.title').textContent = meta.title || '';
    var catEl = head.querySelector('.chip.cat');
    catEl.textContent = meta.category || '';
    try {
      var th = window.theme || window.THEME;
      catEl.style.color = th.catColor ? th.catColor(meta.category) : th.categoryColor?.(meta.category);
    } catch(e){}
    var tagBox = head.querySelector('.tags');
    (Array.isArray(meta.tags)?meta.tags:[]).forEach(function(t){
      var s = document.createElement('span');
      s.className = 'chip';
      s.textContent = t;
      tagBox.appendChild(s);
    });
    var content = container.querySelector('.scene-content');
    nodes.forEach(function(n){ content.appendChild(n); });
    if (!content.textContent.trim()) {
      var p = document.createElement('p');
      p.textContent = meta.intro || 'эта сцена ещё в разработке';
      content.appendChild(p);
    }
    var root = container.querySelector('.scene-root');
    var bg = container.querySelector('.scene-bg');
    function fit(){
      var r = root.getBoundingClientRect();
      bg.width = r.width;
      bg.height = r.height;
    }
    window.addEventListener('resize', fit, {passive:true});
    fit();
    try { window.widgets?.mountAll(container); } catch(e){ console.warn('[widgets]', e); }
  };
})();
