/* SceneFrame: минимальный оверлей для сцен
 * BOM-free UTF-8, no exports — только window.SceneFrame
 */
(function () {
  'use strict';

  var LAYER_ID = 'scene-layer';
  var state = null;

  function ensureLayer() {
    var el = document.getElementById(LAYER_ID);
    if (!el) {
      el = document.createElement('div');
      el.id = LAYER_ID;
      // полноэкранный слой над приложением
      el.style.position = 'fixed';
      el.style.inset = '0';
      el.style.zIndex = '9999';
      el.style.display = 'none';
      el.setAttribute('aria-hidden', 'true');
      document.body.appendChild(el);
    }
    return el;
  }

  function open(html) {
    var layer = ensureLayer();
    // очистка прошлого
    layer.innerHTML = '';

    // фон + хост
    var host = document.createElement('div');
    host.className = 'scene-host';
    host.style.position = 'absolute';
    host.style.inset = '0';
    host.style.overflow = 'hidden';
    host.style.background =
      'radial-gradient(1200px 600px at 70% -10%, rgba(255,255,255,0.06), transparent 60%), #050a12';
    layer.appendChild(host);

    // вставляем сцену как есть (section[data-scene=...])
    host.insertAdjacentHTML('afterbegin', html);

    layer.style.display = 'block';
    layer.removeAttribute('aria-hidden');

    var root = host.querySelector('[data-scene]') || host.firstElementChild;
    state = { layer: layer, host: host, root: root, handlers: null };
  }

  function register(root, handlers) {
    // принимаем только актуально вставленный корень
    if (!state || (root && state.root !== root)) return;
    state.handlers = handlers || {};
    try { handlers && handlers.onMount && handlers.onMount(); }
    catch (e) { console.error('[scene] onMount error:', e); }
  }

  function close() {
    if (!state) return;
    try { state.handlers && state.handlers.onUnmount && state.handlers.onUnmount(); }
    catch (e) { console.warn('[scene] onUnmount error:', e); }

    var layer = ensureLayer();
    layer.style.display = 'none';
    layer.setAttribute('aria-hidden', 'true');
    layer.innerHTML = '';
    state = null;
  }

  // Escape = закрыть сцену
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && state) close();
  });

  window.SceneFrame = { open: open, close: close, register: register };
})();
