(function () {
  var contentEl = document.getElementById('content');
  var listEl = document.getElementById('glitch-list');
  var searchInput = document.getElementById('search');
  var categorySelect = document.getElementById('category-filter');
  var manifestPromise;
  var catSlugMap = {
    'Квант': 'quant',
    'Время': 'time',
    'Космос': 'cosmos',
    'Идентичность': 'id',
    'Информация': 'info',
    'Логика': 'logic',
    'Наблюдатель': 'observer'
  };
  var slugCatMap = {};
  Object.keys(catSlugMap).forEach(function (k) { slugCatMap[catSlugMap[k]] = k; });
  var sidebar = document.querySelector('.sidebar');
  var sidebarToggle = document.getElementById('sidebar-toggle');
  var sidebarOverlay = document.getElementById('sidebar-overlay');
  var randomBtn = document.getElementById('random-btn');
  var lexToggle = document.getElementById('lexicon-toggle');
  var mobileBreakpoint = 820;
  var navIndex = -1;
  var lastSlug = null;
  var scrollHandler = null;

  function updateFocused() {
    var items = listEl.querySelectorAll('.gl-item');
    items.forEach(function (el, i) {
      el.classList.toggle('focused', i === navIndex);
    });
    if (navIndex >= 0 && items[navIndex]) {
      items[navIndex].scrollIntoView({ block: 'nearest' });
      items[navIndex].focus();
    }
  }

  function isDistOne(a, b) {
    if (a === b) return true;
    var la = a.length, lb = b.length;
    if (Math.abs(la - lb) > 1) return false;
    var i = 0, j = 0, mism = 0;
    while (i < la && j < lb) {
      if (a[i] === b[j]) { i++; j++; }
      else {
        mism++;
        if (mism > 1) return false;
        if (la > lb) i++;
        else if (lb > la) j++;
        else { i++; j++; }
      }
    }
    if (i < la || j < lb) mism++;
    return mism <= 1;
  }

  function findApproxIndex(text, word) {
    var len = word.length;
    for (var i = 0; i <= text.length - len; i++) {
      var sub = text.slice(i, i + len);
      if (isDistOne(sub, word)) return i;
    }
    return -1;
  }

  function highlightText(el, text, query) {
    var words = (query || '').toLowerCase().split(/\s+/).filter(Boolean);
    if (!words.length) { el.textContent = text; return; }
    var lower = text.toLowerCase();
    var ranges = [];
    words.forEach(function (w) {
      var idx = lower.indexOf(w);
      if (idx === -1) idx = findApproxIndex(lower, w);
      if (idx !== -1) ranges.push([idx, idx + w.length]);
    });
    if (!ranges.length) { el.textContent = text; return; }
    ranges.sort(function (a, b) { return a[0] - b[0]; });
    var pos = 0;
    ranges.forEach(function (r) {
      if (r[0] > pos) el.appendChild(document.createTextNode(text.slice(pos, r[0])));
      var mark = document.createElement('mark');
      mark.textContent = text.slice(r[0], r[1]);
      el.appendChild(mark);
      pos = r[1];
    });
    if (pos < text.length) el.appendChild(document.createTextNode(text.slice(pos)));
  }

  function fuzzyMatch(str, word) {
    var lower = str.toLowerCase();
    var w = word.toLowerCase();
    if (lower.indexOf(w) !== -1) return true;
    var tokens = lower.split(/[^a-zа-я0-9ё]+/);
    for (var i = 0; i < tokens.length; i++) {
      if (isDistOne(tokens[i], w)) return true;
    }
    return false;
  }

  function debounce(fn, ms) {
    var t;
    return function () {
      var args = arguments;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(null, args); }, ms);
    };
  }

  function saveCat() {
    try {
      var val = categorySelect.value;
      var slug = catSlugMap[val] || '';
      if (slug) {
        localStorage.setItem('ui:cat', slug);
      } else {
        localStorage.removeItem('ui:cat');
      }
    } catch (e) {}
  }

  function showToast(msg) {
    var t = document.createElement('div');
    t.className = 'toast';
    t.setAttribute('role', 'status');
    var span = document.createElement('span');
    span.textContent = msg;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'toast-close';
    btn.textContent = '\u00d7';
    btn.addEventListener('click', remove);
    t.appendChild(span);
    t.appendChild(btn);
    document.body.appendChild(t);
    setTimeout(function () { t.classList.add('show'); }, 10);
    var to = setTimeout(remove, 2000);
    function remove() {
      clearTimeout(to);
      t.classList.remove('show');
      setTimeout(function () { t.remove(); }, 300);
    }
  }
  window.showToast = showToast;

  function loadScript(src) {
    return new Promise(function (res, rej) {
      var s = document.createElement('script');
      s.src = src; s.async = true;
      s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });
  }

  async function renderMapRoute() {
    if (navigator.onLine) {
      try {
        if (!window.d3) await loadScript('https://cdn.jsdelivr.net/npm/d3-force@3/dist/d3-force.min.js');
      } catch (e) {}
    }
    try {
      if (!window.renderMindMap) await loadScript('assets/js/map.js');
    } catch (e) {}
    if (window.renderMindMap) {
      try { await window.renderMindMap(); }
      catch (e) { contentEl.innerHTML = '<div class="empty">Карта недоступна</div>'; }
    } else {
      contentEl.innerHTML = '<div class="empty">Карта недоступна</div>';
    }
  }

  async function renderShow(slug) {
    if (slug === 'intro') { contentEl.innerHTML = ''; window.intro?.show(); return; }
    if (slug === 'bugs') {
      try {
        var showHtml = await fetch('reality_bugs_mindmap.html').then(function (r) { return r.text(); });
        contentEl.innerHTML = showHtml;
        document.title = 'Glitch Registry — Show';
      } catch (e) {
        contentEl.innerHTML = '<div class="empty">Не нашлось</div>';
      }
      return;
    }
    contentEl.innerHTML = '<div class="empty">Не нашлось</div>';
  }

  async function renderCard(slug, anchor, glitches) {
    var item = glitches.find(function (g) { return g.slug === slug; });
    var mdPath = item && item.paths && item.paths.card ? item.paths.card : ('content/glitches/' + slug + '.md');
    contentEl.innerHTML = '<div class="md-body"></div>';
    var target = contentEl.querySelector('.md-body');
    var md = '';
    try {
      var resp = await fetch(mdPath, { cache: 'no-cache' });
      if (!resp.ok) throw new Error('MD not found: ' + mdPath + ' (' + resp.status + ')');
      md = await resp.text();
    } catch (e) {
      console.warn(e.message);
      target.innerHTML = '\n    <div class="callout warn">\n      Не удалось загрузить карточку.\n      ' + (item && item.paths && item.paths.scene ? '<div style="margin-top:8px">\n        <a class="btn-link" href="#/scene/' + slug + '">Открыть сцену</a>\n      </div>' : '') + '\n    </div>';
      return;
    }
    await window.renderMarkdown(md, target, { slug: slug, title: item ? item.title : slug, manifest: glitches, item: item });
    var headings = target.querySelectorAll('h3');
    if (headings.length >= 2) {
      var toc = document.createElement('div');
      toc.className = 'toc';
      headings.forEach(function (h) {
        var id = h.id;
        var link = document.createElement('a');
        link.href = '#' + id;
        link.textContent = h.textContent;
        link.addEventListener('click', function (e) {
          e.preventDefault();
          var offset = document.querySelector('nav').offsetHeight || 0;
          var top = h.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top: top, behavior: 'smooth' });
        });
        toc.appendChild(link);
      });
      target.insertBefore(toc, target.children[1] || null);
      var links = toc.querySelectorAll('a');
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            var id = en.target.id;
            links.forEach(function (a) {
              a.classList.toggle('active', a.getAttribute('href') === '#' + id);
            });
          }
        });
      }, { rootMargin: '-80px 0px -70% 0px' });
      headings.forEach(function (h) { io.observe(h); });
    }
    var storedPos = null;
    try { storedPos = sessionStorage.getItem('scroll:' + slug); } catch (e) {}
    if (!anchor) { window.__shareAnchor = null; }
    if (!anchor && storedPos !== null) {
      window.scrollTo(0, parseInt(storedPos, 10));
    }
    if (anchor) {
      var elA = document.getElementById(anchor);
      if (elA) {
        var off = document.querySelector('nav').offsetHeight || 0;
        var topA = elA.getBoundingClientRect().top + window.scrollY - off;
        window.scrollTo(0, topA);
      }
    }
    document.title = 'Glitch Registry — ' + (item ? item.title : '');
    scrollHandler = debounce(function(){ saveScroll(slug); }, 200);
    window.addEventListener('scroll', scrollHandler);
    lastSlug = slug;
    if (typeof window.setLastVisited === 'function') {
      window.setLastVisited({ type: 'glitch', slug: slug });
    }
  }

  async function renderScene(slug, params, glitches) {
    var item = glitches.find(function (g) { return g.slug === slug; });
    contentEl.innerHTML = '<div id="scene-root"></div>';
    var root = document.getElementById('scene-root');
    if (item && item.paths && item.paths.scene) {
      try {
        var html = await fetch(item.paths.scene).then(function (r) { return r.text(); });
        html = html.replace(/<script[^>]*scene-frame.js[^>]*><\/script>/gi, '');
        root.innerHTML = html;
        if (typeof window.__initScene === 'function') { try { window.__initScene(); } catch(e){} }
        if (typeof window.__applyParams === 'function') { try { window.__applyParams(params); } catch(e){} }
      } catch (e) {
        console.warn(e.message);
      }
    }
    window.renderSceneFrame?.(slug, { title: item ? item.title : '', category: item ? item.category : '', tags: item && item.tags ? item.tags : [] });
    if (typeof window.setLastVisited === 'function') {
      window.setLastVisited({ type: 'scene', slug: slug });
    }
    document.title = 'Glitch Registry — ' + (item ? item.title : '');
  }

  function saveScroll(slug) {
    if (!slug) return;
    try { sessionStorage.setItem('scroll:' + slug, String(window.scrollY)); } catch (e) {}
  }

  function isMobile() {
    return window.innerWidth < mobileBreakpoint;
  }

  function openSidebar() {
    if (!sidebar || !isMobile() || sidebar.classList.contains('is-open')) return;
    sidebar.classList.add('is-open');
    if (sidebarOverlay) sidebarOverlay.classList.add('show');
    history.pushState({sb: true}, '');
  }

  function closeSidebar() {
    if (!sidebar) return;
    sidebar.classList.remove('is-open');
    if (sidebarOverlay) sidebarOverlay.classList.remove('show');
  }

  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', function () {
      if (sidebar.classList.contains('is-open')) {
        history.back();
      } else {
        openSidebar();
      }
    });
  }
  if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', function(){ history.back(); });
  }
  window.addEventListener('resize', function () {
    if (!isMobile()) closeSidebar();
  });
  window.addEventListener('popstate', function(){
    if (sidebar.classList.contains('is-open')) closeSidebar();
  });

  if (randomBtn) {
    randomBtn.addEventListener('click', async function () {
      var glitches = await getManifest();
      var cards = glitches.filter(function (g) { return g.status === 'cardOnly'; });
      var pool = cards.length ? cards.concat(glitches) : glitches;
      var pick = pool[Math.floor(Math.random() * pool.length)];
      if (pick) {
        location.hash = '#/glitch/' + pick.slug;
      }
    });
  }

  if (lexToggle) {
    function syncLex() {
      if (window.isLexiconEnabled && window.isLexiconEnabled()) {
        lexToggle.classList.add('active');
      } else {
        lexToggle.classList.remove('active');
      }
    }
    lexToggle.addEventListener('click', function () {
      if (window.toggleLexicon) {
        var en = !(window.isLexiconEnabled && window.isLexiconEnabled());
        window.toggleLexicon(en);
        syncLex();
      }
    });
    syncLex();
  }
  function moveSelection(dir) {
    var items = listEl.querySelectorAll('.gl-item');
    if (!items.length) return;
    var newIndex = navIndex + dir;
    if (newIndex < 0) newIndex = items.length - 1;
    if (newIndex >= items.length) newIndex = 0;
    navIndex = newIndex;
    updateFocused();
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (sidebar.classList.contains('is-open')) {
        e.preventDefault();
        history.back();
        return;
      }
      if (searchInput.value || categorySelect.value) {
        e.preventDefault();
        searchInput.value = '';
        categorySelect.value = '';
        navIndex = -1;
        renderList(currentSlug());
        updateHashQuery();
      }
    } else if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
      e.preventDefault();
      openSidebar();
      searchInput.focus();
      searchInput.select();
    } else if (e.key === 'ArrowDown' && e.target.tagName !== 'SELECT') {
      e.preventDefault();
      moveSelection(1);
    } else if (e.key === 'ArrowUp' && e.target.tagName !== 'SELECT') {
      e.preventDefault();
      moveSelection(-1);
    } else if (e.key === 'Home' && e.target.tagName !== 'SELECT') {
      e.preventDefault();
      navIndex = 0;
      updateFocused();
    } else if (e.key === 'End' && e.target.tagName !== 'SELECT') {
      e.preventDefault();
      var items = listEl.querySelectorAll('.gl-item');
      navIndex = items.length - 1;
      updateFocused();
    } else if (e.key === 'Enter') {
      var items = listEl.querySelectorAll('.gl-item');
      if (navIndex >= 0 && items[navIndex]) {
        e.preventDefault();
        var href = items[navIndex].getAttribute('href');
        location.hash = href;
      }
    }
  });

  function getManifest() {
    if (!manifestPromise) {
      manifestPromise = (async function () {
        var ver = (window.APP_VERSION || '0');
        var key = 'manifest:' + ver;
        try {
          var cached = localStorage.getItem(key);
          if (cached) return JSON.parse(cached);
        } catch (e) {}
        var data = await fetch('content/glitches.json', { cache: 'no-store' }).then(function (r) { return r.json(); });
        await Promise.all(data.map(async function (g) {
          try {
            var txt = await fetch(g.paths.card, { cache: 'no-store' }).then(function (r) { return r.text(); });
            var m = txt.match(/^---\s*([\s\S]*?)\n---/);
            if (m) {
              var tagsMatch = m[1].match(/tags:\s*\[(.*?)\]/);
              if (tagsMatch) {
                g.tags = tagsMatch[1].split(',').map(function (s) {
                  return s.trim().replace(/^['"]|['"]$/g, '');
                });
              }
            }
          } catch (e) { g.tags = []; }
        }));
        try { localStorage.setItem(key, JSON.stringify(data)); } catch (e) {}
        return data;
      })();
    }
    return manifestPromise;
  }

  function getFilterQuery() {
    var qs = new URLSearchParams();
    if (searchInput.value) qs.set('q', searchInput.value);
    if (categorySelect.value) {
      var c = catSlugMap[categorySelect.value] || categorySelect.value;
      qs.set('cat', c);
    }
    var s = qs.toString();
    return s ? '?' + s : '';
  }

  function updateHashQuery() {
    var base = location.hash.split('?')[0];
    var newHash = base + getFilterQuery();
    history.replaceState(null, '', newHash);
  }

  async function renderList(activeSlug) {
    var glitches = await getManifest();
    var quizStats = {};
    if (typeof window.getQuizStats === 'function') {
      try { quizStats = await window.getQuizStats(); } catch (e) {}
    }
    var rawSearch = (searchInput.value || '').trim();
    var words = rawSearch.toLowerCase().split(/\s+/).filter(Boolean);
    var category = categorySelect.value;
    listEl.innerHTML = '';
    var results = glitches.map(function (g) {
      var score = 0;
      words.forEach(function (w) {
        if (fuzzyMatch(g.title, w)) score += 3;
        if (fuzzyMatch(g.category, w)) score += 1;
        if (g.tags && g.tags.some(function (t) { return fuzzyMatch(t, w); })) score += 2;
      });
      return { g: g, score: score };
    }).filter(function (item) {
      return (!category || item.g.category === category) && (!words.length || item.score > 0);
    });
    results.sort(function (a, b) { return b.score - a.score; });
    results.forEach(function (item) {
      var g = item.g;
      var a = document.createElement('a');
      a.className = 'gl-item';
      a.href = '#/glitch/' + g.slug + getFilterQuery();
      a.dataset.slug = g.slug;
      a.setAttribute('tabindex', '0');
      a.setAttribute('role', 'option');
      a.setAttribute('aria-selected', 'false');
      var title = document.createElement('b');
      highlightText(title, g.title, rawSearch);
      a.appendChild(title);
      var catBadge = document.createElement('span');
      catBadge.className = 'badge';
      catBadge.textContent = g.category;
      a.appendChild(catBadge);
      var statusBadge = document.createElement('span');
      statusBadge.className = 'badge ' + (g.status === 'sceneExists' ? 'scene' : 'card');
      statusBadge.textContent = g.status === 'sceneExists' ? 'scene' : 'card';
      a.appendChild(statusBadge);
      if (typeof window.isDone === 'function' && window.isDone(g.slug)) {
        var doneIcon = document.createElement('span');
        doneIcon.className = 'check';
        doneIcon.textContent = '✔';
        var qs = quizStats.bySlug && quizStats.bySlug[g.slug];
        if (qs && qs.t > 0 && qs.p === qs.t) {
          doneIcon.classList.add('quiz-done');
        }
        a.appendChild(doneIcon);
      }
      listEl.appendChild(a);
    });
    highlightActive(activeSlug);
  }

  function applyFilters(params) {
    searchInput.value = params.q || '';
    var cat = params.cat;
    if (!cat) {
      try { cat = localStorage.getItem('ui:cat') || ''; } catch (e) { cat = ''; }
    }
    if (slugCatMap[cat]) {
      categorySelect.value = slugCatMap[cat];
    } else {
      categorySelect.value = cat || '';
    }
    saveCat();
  }

  function highlightActive(slug) {
    var idx = -1;
    listEl.querySelectorAll('.gl-item').forEach(function (el, i) {
      var isActive = el.dataset.slug === slug;
      el.classList.toggle('active', isActive);
      el.setAttribute('aria-selected', isActive ? 'true' : 'false');
      if (isActive) idx = i;
    });
  navIndex = idx;
  updateFocused();
}

function parseHash(hash) {
  var h = hash.startsWith('#') ? hash.slice(1) : hash;
  var anchor = null;
  var anchorIndex = h.indexOf('#');
  if (anchorIndex !== -1) {
    anchor = h.slice(anchorIndex + 1);
    h = h.slice(0, anchorIndex);
  }
  var queryStr = '';
  var qIndex = h.indexOf('?');
  if (qIndex !== -1) {
    queryStr = h.slice(qIndex + 1);
    h = h.slice(0, qIndex);
  }
  var parts = h.split('/').filter(Boolean);
  return {
    route: parts[0] || null,
    slug: parts[1] || null,
    anchor: anchor,
    query: Object.fromEntries(new URLSearchParams(queryStr))
  };
}

async function handleRoute() {
    if (scrollHandler) {
      window.removeEventListener('scroll', scrollHandler);
      scrollHandler = null;
    }
    saveScroll(lastSlug);
    closeSidebar();
    window.intro?.hide();
    if (!location.hash) {
      return;
    }
  var parsed = parseHash(location.hash);
  var route = parsed.route;
  var slug = parsed.slug;
  var anchor = parsed.anchor;
  var params = parsed.query;
  applyFilters(params);
  updateHashQuery();
  await renderList(slug);

    if (!contentEl) return;
    contentEl.innerHTML = '<div class="empty">Загрузка…</div>';
    var glitches = await getManifest();

    try {
    if (route === 'glitch' && slug) {
      await renderCard(slug, anchor, glitches);
    } else if (route === 'scene' && slug) {
      await renderScene(slug, params, glitches);
    } else if (route === 'show') {
      await renderShow(slug);
      highlightActive(null);
      return;
    } else if (route === 'overview' || !route) {
      try {
        var mdOverview = await fetch('content/overview.md').then(function (r) { return r.text(); });
        contentEl.innerHTML = '';

        var grid = document.createElement('div');
        grid.className = 'tiles';

        var last = null;
        if (typeof window.getLastVisited === 'function') {
          last = window.getLastVisited();
        }
        if (last) {
          var lastItem = glitches.find(function (g) { return g.slug === last.slug; });
          if (lastItem) {
            var cont = document.createElement('div');
            cont.className = 'tile continue';
            var contBtn = document.createElement('button');
            contBtn.className = 'btn-link btn-primary';
            contBtn.textContent = 'Продолжить → ' + lastItem.title;
            contBtn.addEventListener('click', function () {
              location.hash = '#/' + last.type + '/' + last.slug;
            });
            cont.appendChild(contBtn);
            grid.appendChild(cont);
          }
        }

        var catCounts = glitches.reduce(function (acc, g) {
          acc[g.category] = (acc[g.category] || 0) + 1;
          return acc;
        }, {});
        var stats = { byCategory: {} };
        if (typeof window.getStats === 'function') {
          try { stats = await window.getStats(); } catch (e) {}
        }
        function highlightTile(sl) {
          grid.querySelectorAll('.tile').forEach(function (t) {
            t.classList.toggle('active', t.dataset.cat === sl);
          });
        }
        Object.keys(catCounts).forEach(function (c) {
          var slugCat = catSlugMap[c] || '';
          var done = (stats.byCategory && stats.byCategory[slugCat]) || 0;
          var tile = document.createElement('div');
          tile.className = 'tile';
          tile.dataset.cat = slugCat;
          tile.setAttribute('tabindex', '0');
          var h = document.createElement('div');
          h.textContent = c;
          tile.appendChild(h);
          var count = document.createElement('div');
          count.textContent = done + '/' + catCounts[c];
          tile.appendChild(count);
          tile.addEventListener('click', function () {
            categorySelect.value = c;
            saveCat();
            renderList(null);
            history.replaceState(null, '', '#/overview?cat=' + slugCat);
            highlightTile(slugCat);
            openSidebar();
          });
          tile.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              tile.click();
            }
          });
          grid.appendChild(tile);
        });
        var activeSlug = params.cat;
        if (!slugCatMap[activeSlug]) {
          activeSlug = catSlugMap[params.cat] || '';
        }
        if (activeSlug) {
          highlightTile(activeSlug);
          openSidebar();
          history.replaceState(null, '', '#/overview?cat=' + activeSlug);
        }

        var resetTile = document.createElement('div');
        resetTile.className = 'tile';
        var resetBtn = document.createElement('button');
        resetBtn.className = 'btn-link';
        resetBtn.textContent = 'Сброс прогресса';
        resetBtn.addEventListener('click', function () {
          if (confirm('Сбросить прогресс?')) {
            if (typeof window.resetProgress === 'function') { window.resetProgress(); }
            showToast('Сброшено');
            renderList(null);
            handleRoute();
          }
        });
        resetTile.appendChild(resetBtn);
        grid.appendChild(resetTile);

        contentEl.appendChild(grid);

        var bodyOverview = document.createElement('div');
        bodyOverview.className = 'md-body';
        contentEl.appendChild(bodyOverview);
        await window.renderMarkdown(mdOverview, bodyOverview);
        if (typeof window.getQuizStats === 'function') {
          try {
            var qs = await window.getQuizStats();
            var info = document.createElement('div');
            info.textContent = 'Учебный прогресс: ' + qs.passed + '/' + qs.total;
            var hEl = bodyOverview.querySelector('h1, h2, h3');
            if (hEl) hEl.insertAdjacentElement('afterend', info); else bodyOverview.prepend(info);
          } catch (e) {}
        }
        document.title = 'Glitch Registry — Обзор';
      } catch (e) {
        contentEl.innerHTML = '<div class="empty">Не нашлось</div>';
      }
      highlightActive(null);
      return;
    } else if (route === 'map') {
      document.title = 'Glitch Registry — Карта';
      await renderMapRoute();
      highlightActive(null);
      return;
    } else {
      location.hash = '#/overview';
    }
    } catch (e) {
      console.error('[router] route error:', e);
      location.hash = '#/overview';
    }

    highlightActive(slug);
  }

  function currentSlug() {
    var h = location.hash.slice(1).split('?')[0];
    var a = h.indexOf('#');
    if (a !== -1) h = h.slice(0, a);
    var p = h.split('/').filter(Boolean);
    return (p[0] === 'glitch' || p[0] === 'scene') ? p[1] : null;
  }

  var searchHandler = debounce(function () {
    navIndex = -1;
    renderList(currentSlug());
    updateHashQuery();
  }, 300);
  searchInput.addEventListener('input', searchHandler);
  categorySelect.addEventListener('change', function () {
    navIndex = -1;
    saveCat();
    renderList(currentSlug());
    updateHashQuery();
  });

  window.addEventListener('hashchange', handleRoute);
  window.addEventListener('DOMContentLoaded', handleRoute);
  window.addEventListener('quiz-passed', function () { renderList(currentSlug()); });
})();

