(function () {
  var contentEl = document.getElementById('content');
  var listEl = document.getElementById('glitch-list');
  var searchInput = document.getElementById('search');
  var categorySelect = document.getElementById('category-filter');
  var manifestPromise;

  function getManifest() {
    if (!manifestPromise) {
      manifestPromise = fetch('content/glitches.json').then(function (r) { return r.json(); });
    }
    return manifestPromise;
  }

  async function renderList() {
    var glitches = await getManifest();
    var search = (searchInput.value || '').toLowerCase();
    var category = categorySelect.value;
    listEl.innerHTML = '';
    glitches.filter(function (g) {
      return (!category || g.category === category) && g.title.toLowerCase().includes(search);
    }).forEach(function (g) {
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = '#/glitch/' + g.slug;
      a.textContent = g.title;
      li.appendChild(a);
      var meta = document.createElement('span');
      meta.textContent = ' [' + g.category + '] ' + (g.status === 'sceneExists' ? '🎬' : '📄');
      li.appendChild(meta);
      if (window.isDone && window.isDone(g.slug)) {
        var done = document.createElement('span');
        done.textContent = ' ✔';
        li.appendChild(done);
      }
      listEl.appendChild(li);
    });
  }

  async function load() {
    if (!contentEl) return;
    var glitches = await getManifest();
    var hash = location.hash.slice(1);
    var queryIndex = hash.indexOf('?');
    var query = '';
    if (queryIndex !== -1) {
      query = hash.slice(queryIndex + 1);
      hash = hash.slice(0, queryIndex);
    }
    var params = Object.fromEntries(new URLSearchParams(query));
    var parts = hash.split('/').filter(Boolean);

    if (parts[0] === 'glitch' && parts[1]) {
      var slug = parts[1];
      var item = glitches.find(function (g) { return g.slug === slug; });
      if (item) {
        try {
          var md = await fetch(item.paths.card).then(function (r) { return r.text(); });
          await window.renderMarkdown(md, contentEl);
          var controls = document.createElement('div');
          if (item.status === 'sceneExists' && item.paths.scene) {
            var sceneLink = document.createElement('a');
            sceneLink.href = '#/scene/' + slug;
            sceneLink.textContent = 'Открыть сцену';
            controls.appendChild(sceneLink);
          }
          var doneBtn = document.createElement('button');
          doneBtn.textContent = 'Пометить пройдено';
          doneBtn.addEventListener('click', function () {
            if (window.markDone) { window.markDone(slug); }
            renderList();
          });
          controls.appendChild(doneBtn);
          contentEl.prepend(controls);
        } catch (e) {
          contentEl.textContent = 'Не найдено';
        }
      } else {
        contentEl.textContent = 'Не найдено';
      }
    } else if (parts[0] === 'scene' && parts[1]) {
      var slugScene = parts[1];
      var itemScene = glitches.find(function (g) { return g.slug === slugScene; });
      if (itemScene && itemScene.paths.scene) {
        try {
          var html = await fetch(itemScene.paths.scene).then(function (r) { return r.text(); });
          contentEl.innerHTML = html;
          if (typeof window.__initScene === 'function') { window.__initScene(); }
          if (typeof window.__applyParams === 'function') { window.__applyParams(params); }
        } catch (e) {
          contentEl.textContent = 'Не найдено';
        }
      } else {
        contentEl.textContent = 'Не найдено';
      }
    } else if (parts[0] === 'overview') {
      try {
        var mdOverview = await fetch('content/overview.md').then(function (r) { return r.text(); });
        await window.renderMarkdown(mdOverview, contentEl);
      } catch (e) {
        contentEl.textContent = 'Не найдено';
      }
    } else {
      contentEl.innerHTML = '<p>Выберите глитч</p>';
    }
  }

  searchInput.addEventListener('input', renderList);
  categorySelect.addEventListener('change', renderList);
  window.addEventListener('hashchange', load);
  window.addEventListener('DOMContentLoaded', function () {
    renderList();
    load();
  });
})();
