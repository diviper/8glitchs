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

  window.renderMarkdown = async function (markdown, target) {
    await ready;
    if (markdown.startsWith('---')) {
      markdown = markdown.replace(/^---[\s\S]*?\n---\n?/, '');
    }
    var html = marked.parse(markdown);
    var safe = DOMPurify.sanitize(html);
    target.innerHTML = safe;
    target.querySelectorAll('h3').forEach(function (h) {
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
