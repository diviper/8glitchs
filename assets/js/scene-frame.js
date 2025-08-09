(function(){
  function ensure(el, html){ if(!el){ el=document.createElement('div'); el.innerHTML=html; return el.firstElementChild; } return el; }
  window.renderSceneFrame = function(slug, meta){
    meta = meta || {};
    var root = document.querySelector('#scene-root') || document.body;
    root.querySelectorAll('.legacy-banner,.g-universe,.btns-legacy,[data-legacy]').forEach(function(n){ n.remove(); });
    var head = document.createElement('div');
    head.className = 'scene-head';
    head.innerHTML = '<a class="crumb" href="#/glitch/' + slug + '">← к карточке</a>' +
      '<div class="chips"><span class="chip chip-cat">' + (meta.category || '') + '</span>' +
      (meta.tags || []).map(function(t){ return '<span class="chip">' + t + '</span>'; }).join('') + '</div>' +
      '<button class="btn-link share">Поделиться</button>';
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
    head.querySelector('.share')?.addEventListener('click', async function(){
      var url = location.href;
      try { await navigator.share?.({ title: meta.title || '', url: url }); } catch(e){}
      try { await navigator.clipboard?.writeText(url); window.showToast?.('Ссылка скопирована'); } catch(e){}
    });
  };
})();
