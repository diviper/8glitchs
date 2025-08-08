(function () {
  var contentEl = document.getElementById('content');

  async function load() {
    if (!contentEl) return;
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
      var mdPath = 'content/glitches/' + parts[1] + '.md';
      try {
        var md = await fetch(mdPath).then(function (r) { return r.text(); });
        await window.renderMarkdown(md, contentEl);
      } catch (e) {
        contentEl.textContent = 'Не найдено';
      }
    } else if (parts[0] === 'scene' && parts[1]) {
      var htmlPath = 'scenes/glitch-' + parts[1] + '.html';
      try {
        var html = await fetch(htmlPath).then(function (r) { return r.text(); });
        contentEl.innerHTML = html;
        if (typeof window.__applyParams === 'function') {
          window.__applyParams(params);
        }
      } catch (e) {
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

  window.addEventListener('hashchange', load);
  window.addEventListener('DOMContentLoaded', load);
})();
