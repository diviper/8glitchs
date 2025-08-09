(function () {
  function getSlug(el) {
    var root = el.closest('.md-body');
    if (root && root.dataset.slug) return root.dataset.slug;
    return null;
  }

  function disable(el) {
    el.querySelectorAll('input,button').forEach(function (i) {
      i.disabled = true;
    });
  }

  function clearLabels(el) {
    el.querySelectorAll('label').forEach(function (l) {
      l.classList.remove('correct');
      l.classList.remove('wrong');
    });
  }

  function markLabels(el, correctVals, checkedVals) {
    el.querySelectorAll('label').forEach(function (l) {
      var inp = l.querySelector('input');
      if (!inp) return;
      var v = inp.value;
      if (correctVals.indexOf(v) !== -1) l.classList.add('correct');
      if (checkedVals && checkedVals.indexOf(v) !== -1 && correctVals.indexOf(v) === -1) {
        l.classList.add('wrong');
      }
    });
  }

  function checkSingle(el, correctVals) {
    var sel = el.querySelector('input[type="radio"]:checked');
    var val = sel ? sel.value : null;
    clearLabels(el);
    markLabels(el, correctVals, val ? [val] : []);
    return val && correctVals.indexOf(val) !== -1;
  }

  function checkMulti(el, correctVals) {
    var checked = Array.from(el.querySelectorAll('input[type="checkbox"]:checked')).map(function (i) { return i.value; });
    clearLabels(el);
    markLabels(el, correctVals, checked);
    if (checked.length !== correctVals.length) return false;
    return checked.every(function (v) { return correctVals.indexOf(v) !== -1; });
  }

  function checkNumeric(el, correctVal) {
    var eps = parseFloat(el.dataset.eps || '0');
    var inp = el.querySelector('input[type="number"]');
    var val = parseFloat(inp.value);
    if (isNaN(val)) return false;
    return Math.abs(val - correctVal) <= eps;
  }

  function handleCheck(e) {
    var el = this.closest('.quiz');
    var type = el.dataset.type || 'single';
    var explain = el.querySelector('.explain');
    var correctAttr = explain ? explain.getAttribute('data-correct') || '' : '';
    var correctVals = correctAttr.split(',').map(function (s) { return s.trim(); }).filter(Boolean);
    var ok = false;
    if (type === 'single') ok = checkSingle(el, correctVals);
    else if (type === 'multi') ok = checkMulti(el, correctVals);
    else if (type === 'numeric') ok = checkNumeric(el, parseFloat(correctVals[0]));
    var result = el.querySelector('.quiz-result');
    if (ok) {
      el.classList.remove('wrong');
      el.classList.add('correct');
      if (explain) result.innerHTML = explain.innerHTML;
      disable(el);
      var slug = getSlug(el);
      if (slug && window.progress && typeof window.progress.setQuizPassed === 'function') {
        window.progress.setQuizPassed(slug, el.dataset.id);
      }
      window.showToast && window.showToast('\u2714 \u0421\u043e\u0445\u0440\u0430\u043d\u0435\u043d\u043e');
      window.dispatchEvent(new Event('quiz-passed'));
    } else {
      el.classList.remove('correct');
      el.classList.add('wrong');
      result.textContent = 'Неверно';
    }
  }

  function mount(el) {
    var btn = el.querySelector('[data-check]');
    if (!btn) return;
    btn.addEventListener('click', handleCheck);
    var slug = getSlug(el);
    if (slug && window.progress && typeof window.progress.isQuizPassed === 'function') {
      if (window.progress.isQuizPassed(slug, el.dataset.id)) {
        var explain = el.querySelector('.explain');
        if (explain) el.querySelector('.quiz-result').innerHTML = explain.innerHTML;
        el.classList.add('correct');
        disable(el);
      }
    }
  }

  function mountAll(root) {
    (root || document).querySelectorAll('.quiz').forEach(mount);
  }

  window.quiz = { mountAll: mountAll };
})();
