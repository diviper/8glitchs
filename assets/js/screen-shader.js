(() => {
  function initScreenShader() {
    const overlay = document.querySelector('[data-screen-shader]');
    if (!overlay) return;
    overlay.style.pointerEvents = 'none';
  }
  window.initScreenShader = initScreenShader;
})();
