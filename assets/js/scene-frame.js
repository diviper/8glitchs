(function(){
  window.renderSceneFrame = function(slug, meta){
    meta = meta || {};
    var root = document.querySelector('#scene-root') || document.body;
    root.querySelectorAll('.legacy-banner,.g-universe,.btns-legacy,[data-legacy]').forEach(function(n){ n.remove(); });
    var head = document.createElement('div');
    head.className = 'head';
    head.innerHTML = '<a class="crumb" href="#/overview" aria-label="К реестру">← к реестру</a>' +
      '<h1 class="title"></h1>' +
      '<div class="meta"><span class="chip cat"></span><span class="chips tags"></span></div>';
    head.querySelector('.title').textContent = meta.title || '';
    var catEl = head.querySelector('.chip.cat');
    catEl.textContent = meta.category || '';
    try { catEl.style.background = window.THEME.catColor(meta.category); } catch(e){}
    var tags = Array.isArray(meta.tags) ? meta.tags : [];
    var maxTags = 6;
    var tagBox = head.querySelector('.tags');
    tags.slice(0, maxTags).forEach(function(t){
      var s = document.createElement('span');
      s.className = 'chip tag';
      s.textContent = t;
      tagBox.appendChild(s);
    });
    if (tags.length > maxTags) {
      var more = document.createElement('span');
      more.className = 'chip tag';
      more.textContent = '+' + (tags.length - maxTags);
      more.title = tags.slice(maxTags).join(', ');
      tagBox.appendChild(more);
    }
    var wrap = document.createElement('div');
    wrap.className = 'scene-wrap';
    var box = document.createElement('div');
    box.className = 'scene-canvas';
    if (!root.querySelector('.scene-content,canvas,svg,.widget')) {
      var stub = document.createElement('div');
      stub.className = 'scene-empty';
      stub.innerHTML = 'Эта сцена ещё в разработке. Ниже — учебный мини-демо.';
      box.appendChild(stub);
      if (slug === 'quantum-superposition') {
        var w = document.createElement('div');
        w.className = 'widget';
        w.dataset.type = 'twoslit';
        box.appendChild(w);
        window.widgets?.mount(w);
      }
    } else {
      var content = root.querySelector('.scene-content');
      if (content) box.appendChild(content);
    }
    wrap.appendChild(box);
    root.innerHTML = ''; root.appendChild(head); root.appendChild(wrap);
  };
})();
