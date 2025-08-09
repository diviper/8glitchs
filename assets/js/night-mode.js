(() => {
  function initNightMode() {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      document.documentElement.classList.add('night-mode');
    }
  }
  window.initNightMode = initNightMode;
})();
