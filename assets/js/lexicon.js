(function () {
  function escapeReg(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  var lexiconPromise = fetch('assets/data/lexicon.json')
    .then(function (r) { return r.json(); })
    .then(function (data) {
      window.LEXICON = data;
      return data;
    })
    .catch(function () {
      window.LEXICON = {};
      return {};
    });

  function attachLexicon(root, dict) {
    if (!root || !dict) return;
    var skipTags = ['A', 'CODE', 'PRE', 'H1', 'H2', 'H3', 'BUTTON'];
    var defs = {};
    var entries = [];
    Object.keys(dict).forEach(function (k) {
      var def = dict[k];
      var terms = k.split('|').map(function (t) { return t.trim(); });
      var base = terms[0];
      defs[base] = def;
      terms.forEach(function (t) {
        entries.push({ term: t, key: base });
      });
    });
    entries.sort(function (a, b) { return b.term.length - a.term.length; });
    entries.forEach(function (e) {
      e.regex = new RegExp('(^|[^A-Za-zА-Яа-яЁё0-9-])(' + escapeReg(e.term) + ')(?=[^A-Za-zА-Яа-яЁё0-9-]|$)', 'i');
    });

    Array.prototype.forEach.call(root.children, function (block) {
      if (skipTags.indexOf(block.tagName) !== -1) return;
      var replaced = new Set();
      entries.forEach(function (entry) {
        if (replaced.has(entry.key)) return;
        var walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT, null, false);
        var node;
        while ((node = walker.nextNode())) {
          if (!node.nodeValue.trim()) continue;
          var p = node.parentNode;
          var skip = false;
          while (p && p !== block) {
            if (skipTags.indexOf(p.tagName) !== -1) { skip = true; break; }
            p = p.parentNode;
            }
          if (skip) continue;
          var m = entry.regex.exec(node.nodeValue);
          if (m) {
            var before = node.nodeValue.slice(0, m.index + m[1].length);
            var word = m[2];
            var after = node.nodeValue.slice(m.index + m[0].length);
            var parent = node.parentNode;
            if (before) parent.insertBefore(document.createTextNode(before), node);
            var span = document.createElement('span');
            span.className = 'lex';
            span.setAttribute('data-lex', entry.key);
            span.setAttribute('tabindex', '0');
            span.textContent = word;
            parent.insertBefore(span, node);
            if (after) parent.insertBefore(document.createTextNode(after), node);
            parent.removeChild(node);
            replaced.add(entry.key);
            break;
          }
        }
      });
    });

    var current;
    function close() {
      if (current) {
        current.pop.remove();
        document.removeEventListener('click', outside);
        document.removeEventListener('keydown', onKey);
        current = null;
      }
    }
    function outside(e) {
      if (current && !e.target.closest('.lex-pop') && !e.target.closest('.lex')) {
        close();
      }
    }
    function onKey(e) { if (e.key === 'Escape') close(); }
    function open(el) {
      close();
      var key = el.getAttribute('data-lex');
      var text = defs[key];
      if (!text) return;
      var rect = el.getBoundingClientRect();
      var pop = document.createElement('div');
      pop.className = 'lex-pop';
      pop.setAttribute('role', 'tooltip');
      pop.setAttribute('aria-live', 'polite');
      pop.textContent = text;
      document.body.appendChild(pop);
      var top = window.scrollY + rect.bottom + 6;
      var left = window.scrollX + rect.left;
      if (left + pop.offsetWidth > window.scrollX + document.documentElement.clientWidth) {
        left = window.scrollX + document.documentElement.clientWidth - pop.offsetWidth - 10;
      }
      pop.style.top = top + 'px';
      pop.style.left = left + 'px';
      current = { pop: pop, trigger: el };
      document.addEventListener('click', outside);
      document.addEventListener('keydown', onKey);
    }

    root.addEventListener('click', function (e) {
      var el = e.target.closest('.lex');
      if (!el) return;
      e.preventDefault();
      e.stopPropagation();
      if (current && current.trigger === el) { close(); } else { open(el); }
    });
    root.addEventListener('mouseover', function (e) {
      var el = e.target.closest('.lex');
      if (!el) return;
      if (current && current.trigger === el) return;
      open(el);
    });
    root.addEventListener('mouseout', function (e) {
      if (!current) return;
      var el = e.target.closest('.lex');
      if (el && !el.contains(e.relatedTarget)) close();
    });
    root.addEventListener('focusin', function (e) {
      var el = e.target.closest('.lex');
      if (el) open(el);
    });
    root.addEventListener('focusout', function (e) {
      if (current && (!e.relatedTarget || !e.relatedTarget.closest('.lex'))) close();
    });
  }

  window.attachLexicon = attachLexicon;
  window.lexiconReady = lexiconPromise;
})();
