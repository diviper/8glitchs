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

  // Создаем глобальное "обещание", которое разрешится, когда все библиотеки будут готовы
  window.libsReady = Promise.all([
    loadScript('https://cdn.jsdelivr.net/npm/marked@4.3.0/marked.min.js'),
    // Загружаем специальную браузерную версию gray-matter
    loadScript('https://cdn.jsdelivr.net/npm/gray-matter@4.0.3/browser.js')
  ]).then(() => {
    // После загрузки, создаем удобные псевдонимы в window
    if (window.marked) {
      window.md = window.marked; // marked_api.parse -> md.render
    }
    if (window.matter) {
      // Браузерная версия gray-matter называется `matter`
      window.grayMatter = window.matter;
    }
    console.log('Markdown & gray-matter libraries are ready.');
  }).catch(error => {
    console.error('Failed to load critical libraries:', error);
  });

})();
