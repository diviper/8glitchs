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
    loadScript('https://cdn.jsdelivr.net/npm/marked@12.0.2/marked.min.js'),
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

  window.renderMarkdown = async function (markdown, container, opts) {
    if (!container) return;
    await ready;
    var html = marked.parse(stripFrontMatter(markdown));
    var safe = DOMPurify.sanitize(html, { ADD_ATTR: ['target', 'rel'] });
    if (opts && opts.slug) { container.dataset.slug = opts.slug; }
    var cardHTML = safe;
    try {
      if (window.quest && opts && opts.slug && opts.title) {
        window.quest.mount(container, cardHTML, {
          slug: opts.slug,
          title: opts.title,
          intro: opts && opts.item && opts.item.quest ? opts.item.quest.intro : undefined,
          riddleAnswer: opts && opts.item && opts.item.quest ? opts.item.quest.answer : undefined
        });
      } else {
        container.innerHTML = cardHTML;
      }
    } catch (e) {
      container.innerHTML = cardHTML;
    }
    try { if (window.quiz && window.quiz.mountAll) window.quiz.mountAll(container); } catch (e) {}
    try { window.widgets?.mountAll(container); } catch (e) { console.warn('[widgets]', e); }
    container.querySelectorAll('.legacy-banner,.banner,.badges,.g-universe,.btns-legacy,[data-legacy]').forEach(function(n){ n.remove(); });
    var head = document.createElement('div');
    head.className = 'head';
    head.innerHTML = '<h1 class="title"></h1><span class="chip cat"></span><div class="tags"></div>';
    var mdH1 = container.querySelector('h1');
    var titleText = opts && opts.item && opts.item.title ? opts.item.title : (mdH1 ? mdH1.textContent : '');
    if (mdH1) mdH1.remove();
    head.querySelector('.title').textContent = titleText;
    var cat = opts && opts.item && opts.item.category ? opts.item.category : '';
    var catEl = head.querySelector('.chip.cat');
    catEl.textContent = cat;
    try {
      var th = window.theme || window.THEME;
      catEl.style.color = th.catColor ? th.catColor(cat) : th.categoryColor?.(cat);
    } catch(e){}
    var tags = (opts && opts.item && opts.item.tags) ? opts.item.tags : [];
    var maxTags = 6;
    var tagBox = head.querySelector('.tags');
    tags.slice(0, maxTags).forEach(function(t){
      var s = document.createElement('span');
      s.className = 'chip';
      s.textContent = t;
      tagBox.appendChild(s);
    });
    if (tags.length > maxTags) {
      var more = document.createElement('span');
      more.className = 'chip';
      more.textContent = '+' + (tags.length - maxTags);
      more.title = tags.slice(maxTags).join(', ');
      tagBox.appendChild(more);
    }
    container.prepend(head);
    window.currentMarkdownContainer = container;
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
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url).then(function () {
            if (window.showToast) window.showToast('Ссылка скопирована');
          });
        } else {
          prompt('Ссылка:', url);
        }
      });
      h.appendChild(btn);
    });
    if (!window.__lexiconPromise) {
      window.__lexiconPromise = fetch('assets/data/lexicon.json')
        .then(function (r) { return r.json(); })
        .catch(function () { return {}; });
    }
    try {
      var dict = await window.__lexiconPromise;
      var enabled = true;
      try { if (window.isLexiconEnabled) enabled = window.isLexiconEnabled(); } catch (e) {}
      if (enabled && window.attachLexicon) {
        attachLexicon(container, dict);
      }
    } catch (e) {}

    if (opts && opts.slug && Array.isArray(opts.manifest) && window.renderRelated) {
      var box = document.createElement('div');
      box.className = 'endmap';
      box.innerHTML = '<h3>Связанные</h3><div class="rel-list"></div>';
      container.appendChild(box);
      try {
        window.renderRelated(box.querySelector('.rel-list'), opts.slug, opts.manifest, opts);
      } catch (e) {}
    }
  };
})();
