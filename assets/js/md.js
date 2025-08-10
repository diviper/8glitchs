// assets/js/md.js
(function () {
  'use strict';

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  // Загружаем скрипты из локальной папки /assets/js/libs/
  window.libsReady = Promise.all([
    loadScript('assets/js/libs/marked.min.js'),
    loadScript('assets/js/libs/gray-matter.js')
  ]).then(() => {
    if (window.marked) {
      window.md = window.marked;
    }
    if (window.matter) {
      window.grayMatter = window.matter;
    }
    console.log('Markdown & gray-matter libraries loaded locally.');
  }).catch(error => {
    console.error('Failed to load local libraries:', error);
  });

})();
