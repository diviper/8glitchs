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
  var sidebar = document.querySelector('.sidebar');
  var sidebarToggle = document.getElementById('sidebar-toggle');
  var sidebarOverlay = document.getElementById('sidebar-overlay');
  var navIndex = -1;

  function openSidebar() {
    if (sidebar) sidebar.classList.add('open');
    if (sidebarOverlay) sidebarOverlay.classList.add('show');
  }

  function closeSidebar() {
    if (sidebar) sidebar.classList.remove('open');
    if (sidebarOverlay) sidebarOverlay.classList.remove('show');
  }

  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', openSidebar);
  }
  if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', closeSidebar);
  }
  function moveSelection(dir) {
    var items = listEl.querySelectorAll('.gl-item');
    if (!items.length) return;
    var newIndex = navIndex + dir;
    if (newIndex < 0) newIndex = items.length - 1;
    if (newIndex >= items.length) newIndex = 0;
    navIndex = newIndex;
    items.forEach(function (el, i) {
      el.classList.toggle('active', i === navIndex);
    });
    items[navIndex].scrollIntoView({ block: 'nearest' });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeSidebar();
    if (e.ctrlKey && (e.key === 'k' || e.key === 'K')) {
      e.preventDefault();
      searchInput.focus();
    } else if (e.key === 'ArrowDown' && e.target.tagName !== 'SELECT') {
      e.preventDefault();
      moveSelection(1);
    } else if (e.key === 'ArrowUp' && e.target.tagName !== 'SELECT') {
      e.preventDefault();
      moveSelection(-1);
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
    var search = (searchInput.value || '').toLowerCase();
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
      title.textContent = g.title;
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
    categorySelect.value = params.cat || '';
  }

  function highlightActive(slug) {
    var idx = -1;
    listEl.querySelectorAll('.gl-item').forEach(function (el, i) {
      var isActive = el.dataset.slug === slug;
      el.classList.toggle('active', isActive);
      if (isActive) idx = i;
    });
    navIndex = idx;
  }

  async function load() {
    var rawHash = location.hash.slice(1);
    if (!rawHash) {
      location.hash = '#/overview';
      return;
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
            sceneLink.className = 'btn-link';
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
            renderList(slug);
          });
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
            contentEl.querySelector('.scene-frame').innerHTML = html;
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

        var stats = document.createElement('div');
        stats.className = 'overview-stats';
        var totalDiv = document.createElement('div');
        totalDiv.textContent = 'Всего глитчей: ' + glitches.length;
        stats.appendChild(totalDiv);

        var catCounts = glitches.reduce(function (acc, g) {
          acc[g.category] = (acc[g.category] || 0) + 1;
          return acc;
        }, {});
        var catsDiv = document.createElement('div');
        catsDiv.textContent = Object.keys(catCounts).map(function (c) {
          return c + ': ' + catCounts[c];
        }).join(' • ');
        stats.appendChild(catsDiv);

        var done = (typeof window.getProgress === 'function') ? window.getProgress() : [];
        var progressDiv = document.createElement('div');
        var pct = glitches.length ? Math.round(done.length / glitches.length * 100) : 0;
        progressDiv.textContent = 'Пройдено: ' + pct + '%';
        stats.appendChild(progressDiv);

        contentEl.appendChild(stats);

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
    var p = h.split('/').filter(Boolean);
    return (p[0] === 'glitch' || p[0] === 'scene') ? p[1] : null;
  }

  searchInput.addEventListener('input', function () {
    renderList(currentSlug());
    updateHashQuery();
  });
  categorySelect.addEventListener('change', function () {
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

