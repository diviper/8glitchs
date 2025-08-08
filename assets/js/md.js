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

  function slugify(str) {
    var map = {
      'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'e','ж':'zh','з':'z','и':'i','й':'y','к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r','с':'s','т':'t','у':'u','ф':'f','х':'h','ц':'c','ч':'ch','ш':'sh','щ':'sch','ь':'','ы':'y','ъ':'','э':'e','ю':'yu','я':'ya'
    };
    return str.toLowerCase().split('').map(function (ch) {
      return map[ch] || ch;
    }).join('').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  window.renderMarkdown = async function (markdown, container) {
    await ready;
    var html = marked.parse(stripFrontMatter(markdown));
    var safe = DOMPurify.sanitize(html, { ADD_ATTR: ['target', 'rel'] });
    container.innerHTML = safe;
    container.querySelectorAll('a[target="_blank"]').forEach(function (a) {
      a.setAttribute('rel', 'noopener noreferrer');
    });
    container.querySelectorAll('h3').forEach(function (h, i) {
      var id = slugify(h.textContent);
      if (!id) id = 'sec-' + i;
      h.id = id;
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'anchor';
      btn.textContent = '#';
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var hash = location.hash;
        var second = hash.indexOf('#', 1);
        var base = second === -1 ? hash : hash.slice(0, second);
        var url = location.origin + location.pathname + base + '#' + id;
        if (navigator.share) {
          navigator.share({ url: url }).catch(function () {});
        } else if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url).then(function () {
            if (window.showToast) window.showToast('Ссылка скопирована');
          });
        } else {
          prompt('Ссылка:', url);
        }
      });
      h.appendChild(btn);
    });
    if (window.lexiconReady) {
      try { await window.lexiconReady; } catch (e) {}
    }
    if (window.attachLexicon && window.LEXICON) {
      attachLexicon(container, window.LEXICON);
    }
  };
})();
