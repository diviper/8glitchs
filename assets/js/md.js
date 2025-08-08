(function () {
  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  var ready = Promise.all([
    loadScript('https://cdn.jsdelivr.net/npm/marked/marked.min.js'),
    loadScript('https://cdn.jsdelivr.net/npm/dompurify@3.0.3/dist/purify.min.js')
  ]);

  function stripFrontMatter(src) {
    if (!src) return '';
    src = src.replace(/^\uFEFF/, '');
    var m = src.match(/^---\s*[\s\S]*?\n---\s*\n?/);
    return m ? src.slice(m[0].length) : src;
  }

  window.renderMarkdown = async function (markdown, target) {
    await ready;
    var html = marked.parse(stripFrontMatter(markdown));
    var safe = DOMPurify.sanitize(html, { ADD_ATTR: ['target', 'rel'] });
    var container = target;
    if (container && !container.classList.contains('md-body')) {
      container = container.querySelector('.md-body') || container;
    }
    container.innerHTML = safe;
    container.querySelectorAll('a[target="_blank"]').forEach(function (a) {
      a.setAttribute('rel', 'noopener noreferrer');
    });
    container.querySelectorAll('h3').forEach(function (h) {
      var id = h.textContent.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      h.id = id;
      var a = document.createElement('a');
      a.href = '#' + id;
      a.textContent = '¶';
      a.className = 'anchor';
      h.prepend(a);
    });
  };
})();
