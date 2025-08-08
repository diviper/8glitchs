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
  var mobileBreakpoint = 768;
  var navIndex = -1;

  function updateFocused() {
    var items = listEl.querySelectorAll('.gl-item');
    items.forEach(function (el, i) {
      el.classList.toggle('focused', i === navIndex);
    });
    if (navIndex >= 0 && items[navIndex]) {
      items[navIndex].scrollIntoView({ block: 'nearest' });
    }
  }

  function highlightText(el, text, query) {
    if (!query) {
      el.textContent = text;
      return;
    }
    var lower = text.toLowerCase();
    var q = query.toLowerCase();
    var start = 0;
    var idx;
    while ((idx = lower.indexOf(q, start)) !== -1) {
      if (idx > start) {
        el.appendChild(document.createTextNode(text.slice(start, idx))); 
      }
      var mark = document.createElement('mark');
      mark.textContent = text.slice(idx, idx + q.length);
      el.appendChild(mark);
      start = idx + q.length;
    }
    if (start < text.length) {
      el.appendChild(document.createTextNode(text.slice(start)));
    }
  }

  function showToast(msg) {
    var t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function () { t.classList.add('show'); }, 10);
    setTimeout(function () {
      t.classList.remove('show');
      setTimeout(function () { t.remove(); }, 300);
    }, 2000);
  }
  window.showToast = showToast;

  function isMobile() {
    return window.innerWidth < mobileBreakpoint;
  }

  function openSidebar() {
    if (!sidebar || !isMobile() || sidebar.classList.contains('open')) return;
    sidebar.classList.add('open');
    if (sidebarOverlay) sidebarOverlay.classList.add('show');
    history.pushState({sb: true}, '');
  }

  function closeSidebar() {
    if (!sidebar) return;
    sidebar.classList.remove('open');
    if (sidebarOverlay) sidebarOverlay.classList.remove('show');
  }

  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', function () {
      if (sidebar.classList.contains('open')) {
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
    if (sidebar.classList.contains('open')) closeSidebar();
  });
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
      if (searchInput.value || categorySelect.value) {
        e.preventDefault();
        searchInput.value = '';
        categorySelect.value = '';
        navIndex = -1;
        renderList(currentSlug());
        updateHashQuery();
      } else {
        if(sidebar.classList.contains('open')){ history.back(); }
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
      manifestPromise = fetch('content/glitches.json').then(function (r) { return r.json(); });
    }
    return manifestPromise;
  }

  function getFilterQuery() {
    var qs = new URLSearchParams();
    if (searchInput.value) qs.set('q', searchInput.value);
    if (categorySelect.value) qs.set('cat', categorySelect.value);
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
    var rawSearch = (searchInput.value || '').trim();
    var search = rawSearch.toLowerCase();
    var category = categorySelect.value;
    listEl.innerHTML = '';
    glitches.filter(function (g) {
      return (!category || g.category === category) && g.title.toLowerCase().includes(search);
    }).forEach(function (g) {
      var a = document.createElement('a');
      a.className = 'gl-item';
      a.href = '#/glitch/' + g.slug + getFilterQuery();
      a.dataset.slug = g.slug;
      var title = document.createElement('span');
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
        a.appendChild(doneIcon);
      }
      listEl.appendChild(a);
    });
    highlightActive(activeSlug);
  }

  function applyFilters(params) {
    searchInput.value = params.q || '';
    var cat = params.cat || '';
    if (slugCatMap[cat]) {
      categorySelect.value = slugCatMap[cat];
    } else {
      categorySelect.value = cat;
    }
  }

  function highlightActive(slug) {
    var idx = -1;
    listEl.querySelectorAll('.gl-item').forEach(function (el, i) {
      var isActive = el.dataset.slug === slug;
      el.classList.toggle('active', isActive);
      if (isActive) idx = i;
    });
    navIndex = idx;
    updateFocused();
  }

  async function load() {
    var rawHash = location.hash.slice(1);
    if (!rawHash) {
      location.hash = '#/overview';
      return;
    }
    var anchorIndex = rawHash.indexOf('#');
    var anchor = null;
    if (anchorIndex !== -1) {
      anchor = rawHash.slice(anchorIndex + 1);
      rawHash = rawHash.slice(0, anchorIndex);
    }
    var qIndex = rawHash.indexOf('?');
    var query = '';
    if (qIndex !== -1) {
      query = rawHash.slice(qIndex + 1);
      rawHash = rawHash.slice(0, qIndex);
    }
    var params = Object.fromEntries(new URLSearchParams(query));
    applyFilters(params);
    var parts = rawHash.split('/').filter(Boolean);
    var slug = parts[1];
    await renderList(slug);

    if (!contentEl) return;
    contentEl.innerHTML = '<div class="empty">Загрузка…</div>';
    var glitches = await getManifest();

    if (parts[0] === 'glitch' && slug) {
      var item = glitches.find(function (g) { return g.slug === slug; });
      if (item) {
        try {
          var md = await fetch(item.paths.card).then(function (r) { return r.text(); });
          contentEl.innerHTML = '';
          var head = document.createElement('div');
          head.className = 'card-head';
          var catEl = document.createElement('span');
          var catSlug = catSlugMap[item.category] || 'unknown';
          catEl.className = 'cat cat-' + catSlug;
          catEl.textContent = item.category;
          head.appendChild(catEl);
          var h1 = document.createElement('h1');
          h1.textContent = item.title;
          head.appendChild(h1);
          var actions = document.createElement('div');
          actions.className = 'actions';
          if (item.status === 'sceneExists' && item.paths.scene) {
            var sceneLink = document.createElement('a');
            sceneLink.className = 'btn-link btn-primary';
            sceneLink.href = '#/scene/' + slug + getFilterQuery();
            sceneLink.textContent = 'Открыть сцену';
            actions.appendChild(sceneLink);
          }
          var shareBtn = document.createElement('button');
          shareBtn.className = 'btn-link';
          shareBtn.textContent = 'Поделиться';
          shareBtn.setAttribute('data-share', '');
          actions.appendChild(shareBtn);
          var doneBtn = document.createElement('button');
          doneBtn.className = 'btn-link';
          doneBtn.textContent = 'Пометить пройдено';
          doneBtn.setAttribute('data-done', '');
          actions.appendChild(doneBtn);
          head.appendChild(actions);
          contentEl.appendChild(head);
          var body = document.createElement('div');
          body.className = 'md-body';
          contentEl.appendChild(body);
          await window.renderMarkdown(md, body);
          body.querySelectorAll('.hero,.legacy,.btns,.bug-series,.series-banner,.project-banner')
            .forEach(function (n) { n.remove(); });
          var first = body.querySelector('h3');
          if (first) {
            var txt = (first.textContent || '').trim().toLowerCase();
            var legacyH = ['глюки', 'визуализации', 'о проекте'];
            if (legacyH.some(function (t) { return txt.includes(t); })) {
              while (body.firstChild && body.firstChild !== first) {
                body.removeChild(body.firstChild);
              }
              first.remove();
            }
          }

          var headings = body.querySelectorAll('h3');
          if (headings.length) {
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
            contentEl.insertBefore(toc, body);
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

          if (anchor) {
            var elA = document.getElementById(anchor);
            if (elA) {
              var off = document.querySelector('nav').offsetHeight || 0;
              var topA = elA.getBoundingClientRect().top + window.scrollY - off;
              window.scrollTo(0, topA);
            }
          }
          document.title = 'Glitch Registry — ' + item.title;

          shareBtn.addEventListener('click', function () {
            var shareHash = '#/scene/' + slug;
            if (typeof window.__getShareParams === 'function') {
              var sp = window.__getShareParams();
              var qs = typeof sp === 'string' ? sp : new URLSearchParams(sp).toString();
              if (qs) shareHash += '?' + qs;
            }
            var url = location.origin + location.pathname + shareHash;
            if (navigator.share) {
              navigator.share({ url: url }).catch(function () {});
            } else if (navigator.clipboard && navigator.clipboard.writeText) {
              navigator.clipboard.writeText(url);
            } else {
              prompt('Ссылка:', url);
            }
          });
          doneBtn.addEventListener('click', function () {
            if (typeof window.markDone === 'function') {
              window.markDone(slug);
            }
            doneBtn.textContent = 'Пройдено';
            showToast('Сохранено');
            renderList(slug);
          });

          if (typeof window.setLastVisited === 'function') {
            window.setLastVisited({ type: 'glitch', slug: slug });
          }
        } catch (e) {
          contentEl.innerHTML = '<div class="empty">Не нашлось</div>';
        }
      } else {
        contentEl.innerHTML = '<div class="empty">Не нашлось</div>';
      }
    } else if (parts[0] === 'scene' && slug) {
      var itemScene = glitches.find(function (g) { return g.slug === slug; });
      if (itemScene) {
        document.title = 'Glitch Registry — ' + itemScene.title;
        if (typeof window.setLastVisited === 'function') {
          window.setLastVisited({ type: 'scene', slug: slug });
        }
        if (itemScene.status === 'cardOnly' || !itemScene.paths.scene) {
          contentEl.innerHTML = '<div class="scene-head">'
            + '<div class="actions-left"><a class="btn-link" href="#/glitch/' + slug + '">← К карточке</a></div>'
            + '<h1>' + itemScene.title + '</h1>'
            + '<div class="actions-right"><button class="btn-link" data-share>Поделиться</button></div>'
            + '</div>'
            + '<div class="callout warn">Сцена в разработке. Открой карточку — там краткий смысл и ссылки.</div>';
        } else {
          try {
            var html = await fetch(itemScene.paths.scene).then(function (r) { return r.text(); });
            contentEl.innerHTML = '<div class="scene-head">'
              + '<div class="actions-left"><a class="btn-link" href="#/glitch/' + slug + '">← К карточке</a></div>'
              + '<h1>' + itemScene.title + '</h1>'
              + '<div class="actions-right"><button class="btn-link" data-share>Поделиться</button></div>'
              + '</div>'
              + '<div class="scene-frame"></div>';
            var frame = contentEl.querySelector('.scene-frame');
            frame.innerHTML = html;
            [
              '.series',
              '.series-bar',
              '[data-series]',
              '.bug-title',
              '.bug-header',
              'h1.bug',
              '.bug-number',
              '.progress',
              '.progress-bar',
              '.promise-section'
            ].forEach(function (sel) {
              frame.querySelectorAll(sel).forEach(function (el) { el.remove(); });
            });
            if (typeof window.__initScene === 'function') { window.__initScene(); }
            if (typeof window.__applyParams === 'function') { window.__applyParams(params); }
          } catch (e) {
            contentEl.innerHTML = '<div class="empty">Не нашлось</div>';
          }
        }
        var shareBtnScene = contentEl.querySelector('[data-share]');
        if (shareBtnScene) {
          shareBtnScene.addEventListener('click', function () {
            var shareHash = '#/scene/' + slug;
            if (typeof window.__getShareParams === 'function') {
              var sp = window.__getShareParams();
              var qs = typeof sp === 'string' ? sp : new URLSearchParams(sp).toString();
              if (qs) shareHash += '?' + qs;
            }
            var url = location.origin + location.pathname + shareHash;
            if (navigator.share) {
              navigator.share({ url: url }).catch(function () {});
            } else if (navigator.clipboard && navigator.clipboard.writeText) {
              navigator.clipboard.writeText(url);
            } else {
              prompt('Ссылка:', url);
            }
          });
        }
      } else {
        contentEl.innerHTML = '<div class="empty">Не нашлось</div>';
      }
    } else if (parts[0] === 'overview') {
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
            load();
          }
        });
        resetTile.appendChild(resetBtn);
        grid.appendChild(resetTile);

        contentEl.appendChild(grid);

        var bodyOverview = document.createElement('div');
        bodyOverview.className = 'md-body';
        contentEl.appendChild(bodyOverview);
        await window.renderMarkdown(mdOverview, bodyOverview);
        document.title = 'Glitch Registry — Обзор';
      } catch (e) {
        contentEl.innerHTML = '<div class="empty">Не нашлось</div>';
      }
      highlightActive(null);
      return;
    } else {
      contentEl.innerHTML = '<div class="empty">Не нашлось</div>';
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

  searchInput.addEventListener('input', function () {
    navIndex = -1;
    renderList(currentSlug());
    updateHashQuery();
  });
  categorySelect.addEventListener('change', function () {
    navIndex = -1;
    renderList(currentSlug());
    updateHashQuery();
  });

  window.addEventListener('hashchange', function () {
    closeSidebar();
    load();
  });
  window.addEventListener('DOMContentLoaded', function () {
    if (!location.hash) {
      location.hash = '#/overview';
    }
    load();
  });
})();

