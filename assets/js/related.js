(function(){
  var catSlugMap = {
    'Квант': 'quant',
    'Время': 'time',
    'Космос': 'cosmos',
    'Идентичность': 'id',
    'Информация': 'info',
    'Логика': 'logic',
    'Наблюдатель': 'observer'
  };
  window.renderRelated = function(target, currentSlug, manifest, opts){
    if(!target || !currentSlug || !Array.isArray(manifest)) return;
    var current = manifest.find(function(g){ return g.slug === currentSlug; });
    if(!current) return;
    var results = [];
    manifest.forEach(function(g){
      if(g.slug === currentSlug) return;
      var score = 0;
      if(g.category === current.category) score += 2;
      var tagsA = current.tags || [];
      var tagsB = g.tags || [];
      if(tagsA.length && tagsB.length){
        tagsA.forEach(function(t){ if(tagsB.indexOf(t) !== -1) score += 1; });
      }
      if(g.status === 'sceneExists') score += 0.5;
      results.push({ item: g, score: score });
    });
    results.sort(function(a,b){ return b.score - a.score; });
    results.slice(0,6).forEach(function(r){
      var g = r.item;
      var catSlug = catSlugMap[g.category] || 'unknown';
      var a = document.createElement('a');
      a.className = 'rel-chip';
      a.href = '#/glitch/' + g.slug;
      a.setAttribute('aria-label', 'Открыть связанную карточку: ' + g.title);
      var cat = document.createElement('span');
      cat.className = 'cat cat-' + catSlug;
      a.appendChild(cat);
      var b = document.createElement('b');
      b.textContent = g.title;
      a.appendChild(b);
      if(g.status === 'sceneExists'){
        var s = document.createElement('span');
        s.className = 'scene';
        s.textContent = '\u2022 сцена';
        a.appendChild(s);
      }
      target.appendChild(a);
    });
  };
})();
