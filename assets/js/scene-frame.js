(function(){
  window.renderSceneFrame = function(slug, meta){
    meta = meta || {};
    var root = document.querySelector('#scene-root') || document.body;
    root.querySelectorAll('.legacy-banner,.g-universe,.btns-legacy,[data-legacy]').forEach(function(n){ n.remove(); });
    var nodes = Array.from(root.childNodes);
    var wrap = document.createElement('div');
    wrap.className = 'scene-wrap';
    var panel = document.createElement('div');
    panel.className = 'scene-panel';
    var bg = document.createElement('canvas');
    bg.className = 'scene-bg';
    bg.id = 'sceneCanvas';
    panel.appendChild(bg);
    var head = document.createElement('div');
    head.className = 'scene-head';
    head.innerHTML = '<h1 class="title"></h1><span class="chip cat"></span><div class="chips tags"></div>';
    head.querySelector('.title').textContent = meta.title || '';
    var catEl = head.querySelector('.chip.cat');
    catEl.textContent = meta.category || '';
    try {
      var th = window.theme || window.THEME;
      catEl.style.background = th.categoryColor(meta.category);
      var cFg = th.token ? th.token('chipFg') : '';
      if (cFg) catEl.style.color = cFg;
    } catch(e){}
    var tags = Array.isArray(meta.tags) ? meta.tags : [];
    var tagBox = head.querySelector('.tags');
    tags.forEach(function(t){
      var s = document.createElement('span');
      s.className = 'chip tag';
      s.textContent = t;
      try {
        var th = window.theme || window.THEME;
        var bgc = th.token ? th.token('chipBg') : '';
        var fg = th.token ? th.token('chipFg') : '';
        if (bgc) s.style.background = bgc;
        if (fg) s.style.color = fg;
      } catch(e){}
      tagBox.appendChild(s);
    });
    panel.appendChild(head);
    var body = document.createElement('div');
    body.className = 'scene-body';
    nodes.forEach(function(n){ body.appendChild(n); });
    if (!body.textContent.trim()) {
      var p = document.createElement('p');
      p.textContent = meta.intro || 'Сцена временно недоступна.';
      body.appendChild(p);
    }
    panel.appendChild(body);
    wrap.appendChild(panel);
    root.innerHTML = '';
    root.appendChild(wrap);
    try { if (window.widgets && window.widgets.mountAll) window.widgets.mountAll(root); } catch(e){}
  };
})();
