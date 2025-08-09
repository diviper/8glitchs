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
  var colors = {
    'Квант': '#56e0ff',
    'Время': '#ffd580',
    'Космос': '#9bb3ff',
    'Идентичность': '#ffa0ff',
    'Информация': '#a0ffcc',
    'Логика': '#ffd7a8',
    'Наблюдатель': '#b0ffc6'
  };

  window.renderMap = async function(container, manifest){
    container.innerHTML = '';
    if (typeof d3 === 'undefined' || !d3.forceSimulation) {
      var cats = Array.from(new Set(manifest.map(function(g){ return g.category; })));
      var html = '<ul>';
      cats.forEach(function(c){
        var slug = catSlugMap[c] || '';
        html += '<li><a href="#/overview?cat=' + slug + '">' + c + '</a></li>';
      });
      html += '</ul>';
      container.innerHTML = html;
      return;
    }

    var toolbar = document.createElement('div');
    toolbar.className = 'map-toolbar';
    var search = document.createElement('input');
    search.type = 'search';
    search.placeholder = 'Поиск';
    var select = document.createElement('select');
    select.innerHTML = '<option value="both">Связи: оба</option><option value="cat">Связи: категория</option><option value="tag">Связи: теги</option>';
    var reset = document.createElement('button');
    reset.textContent = 'Reset';
    toolbar.appendChild(search);
    toolbar.appendChild(select);
    toolbar.appendChild(reset);
    container.appendChild(toolbar);

    var wrap = document.createElement('div');
    wrap.className = 'map-wrap';
    container.appendChild(wrap);
    var svg = d3.select(wrap).append('svg').attr('width','100%').attr('height','100%');
    var tip = document.createElement('div');
    tip.className = 'map-tip';
    tip.style.display = 'none';
    container.appendChild(tip);

    var nodes = manifest.map(function(g){
      return { id:g.slug, title:g.title, category:g.category, hasScene:g.status==='sceneExists', tags:g.tags||[] };
    });

    function buildLinks(mode){
      var links = [];
      for(var i=0;i<nodes.length;i++){
        for(var j=i+1;j<nodes.length;j++){
          var n1 = nodes[i], n2 = nodes[j];
          var w = 0;
          if(mode==='cat' || mode==='both'){
            if(n1.category === n2.category) w += 0.5;
          }
          if(mode==='tag' || mode==='both'){
            if(n1.tags.length && n2.tags.length){
              var common = n1.tags.filter(function(t){ return n2.tags.indexOf(t)!==-1; }).length;
              w += common;
            }
          }
          if(w>0) links.push({ source:n1.id, target:n2.id, value:w });
        }
      }
      return links;
    }

    var mode = 'both';
    var links = buildLinks(mode);
    var width = wrap.clientWidth;
    var height = wrap.clientHeight;

    var link = svg.append('g').attr('stroke','#888').selectAll('line');
    var node = svg.append('g').selectAll('circle');

    var simulation = d3.forceSimulation(nodes)
      .force('charge', d3.forceManyBody().strength(-80))
      .force('link', d3.forceLink(links).id(function(d){ return d.id; }).distance(function(d){ return 80/(d.value); }))
      .force('collide', d3.forceCollide().radius(20))
      .force('center', d3.forceCenter(width/2, height/2))
      .on('tick', ticked);

    function ticked(){
      link.attr('x1', function(d){ return d.source.x; })
          .attr('y1', function(d){ return d.source.y; })
          .attr('x2', function(d){ return d.target.x; })
          .attr('y2', function(d){ return d.target.y; });
      node.attr('cx', function(d){ return d.x; })
          .attr('cy', function(d){ return d.y; });
    }

    function restart(){
      links = buildLinks(mode);
      link = link.data(links, function(d){ return d.source+ '-' + d.target; });
      link.exit().remove();
      link = link.enter().append('line').attr('stroke-width', function(d){ return Math.max(1,d.value); }).merge(link);
      node = node.data(nodes, function(d){ return d.id; });
      var nodeEnter = node.enter().append('circle')
        .attr('r',6)
        .attr('fill', function(d){ return colors[d.category] || '#ccc'; })
        .attr('stroke', '#222')
        .attr('stroke-width', function(d){ return d.hasScene ? 3 : 1; })
        .call(d3.drag()
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended))
        .on('click', function(event,d){ location.hash = '#/glitch/' + d.id; })
        .on('mouseover', function(event,d){ showTip(event,d); })
        .on('mousemove', moveTip)
        .on('mouseout', hideTip);
      node = nodeEnter.merge(node);
      simulation.nodes(nodes);
      simulation.force('link').links(links);
      simulation.alpha(1).restart();
    }

    function dragstarted(event,d){
      if(!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }
    function dragged(event,d){
      d.fx = event.x;
      d.fy = event.y;
    }
    function dragended(event,d){
      if(!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    function showTip(event,d){
      tip.style.display = 'block';
      tip.textContent = d.title + ' — ' + d.category + (d.hasScene ? ' • сцена' : '');
      moveTip(event);
    }
    function moveTip(event){
      tip.style.left = (event.clientX + 12) + 'px';
      tip.style.top = (event.clientY + 12) + 'px';
    }
    function hideTip(){ tip.style.display = 'none'; }

    function applySearch(){
      var term = search.value.trim().toLowerCase();
      node.attr('r', function(d){
        var match = term && d.title.toLowerCase().indexOf(term) !== -1;
        d.__match = match;
        return match ? 10 : 6;
      });
      simulation.alpha(0.3).restart();
    }

    search.addEventListener('input', applySearch);
    select.addEventListener('change', function(){
      mode = select.value;
      restart();
    });
    reset.addEventListener('click', function(){
      search.value = '';
      select.value = 'both';
      mode = 'both';
      applySearch();
      restart();
    });

    window.addEventListener('resize', function(){
      width = wrap.clientWidth;
      height = wrap.clientHeight;
      simulation.force('center', d3.forceCenter(width/2, height/2));
      simulation.alpha(0.3).restart();
    });

    restart();
  };
})();
