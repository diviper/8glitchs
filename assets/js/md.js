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

  function applyLexicon(root) {
    if (!window.LEXICON) return;
    var terms = Object.keys(window.LEXICON).sort(function (a, b) { return b.length - a.length; });
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
    var nodes = [];
    while (walker.nextNode()) {
      var n = walker.currentNode;
      if (!n.nodeValue.trim()) continue;
      var skip = false;
      var p = n.parentNode;
      while (p && p !== root) {
        var tag = p.tagName;
        if (tag === 'A' || tag === 'CODE' || tag === 'PRE' || tag === 'ABBR') { skip = true; break; }
        p = p.parentNode;
      }
      if (!skip) nodes.push(n);
    }
    function esc(str) { return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
    var boundary = 'A-Za-zА-Яа-яЁё';
    nodes.forEach(function (node) {
      var text = node.nodeValue;
      var replaced = false;
      terms.forEach(function (term) {
        var re = new RegExp('(^|[^' + boundary + '])(' + esc(term) + ')(?=[^' + boundary + ']|$)', 'gi');
        text = text.replace(re, function (match, p1, p2) {
          replaced = true;
          return p1 + '<abbr class="lex" title="' + window.LEXICON[term] + '">' + p2 + '</abbr>';
        });
      });
      if (replaced) {
        var span = document.createElement('span');
        span.innerHTML = text;
        node.parentNode.replaceChild(span, node);
      }
    });
  }

  window.renderMarkdown = async function (markdown, container) {
    await ready;
    var html = marked.parse(stripFrontMatter(markdown));
    var safe = DOMPurify.sanitize(html, { ADD_ATTR: ['target', 'rel'] });
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
    applyLexicon(container);
  };
})();
