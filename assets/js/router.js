import { getManifest, getManifestItem, loadScript } from './paths.js';
import { setTitle } from './utils.js';
import { renderList, applyFiltersFromHash, setupEventListeners, setActive } from './glitchList.js';
import { renderCard } from './cardRenderer.js';
import { renderScene } from './sceneRenderer.js';
import { renderOverview } from './overviewRenderer.js';

const contentEl = document.getElementById('content');

function parseHash(hash) {
  const url = new URL(hash.replace(/^#/, ''), location.origin); // Use URL for robust parsing
  const parts = url.pathname.split('/').filter(Boolean);
  return {
    route: parts[0] || 'overview',
    slug: parts[1] || null,
    params: Object.fromEntries(url.searchParams),
    anchor: url.hash.slice(1) || null,
  };
}

function renderNotFound(slug) {
    setTitle('Не найдено');
    contentEl.innerHTML = `
        <div class="not-found">
            <h1>404</h1>
            <p>Глитч с идентификатором "<strong>${slug}</strong>" не найден.</p>
            <a href="#/overview" class="btn-link">Вернуться к обзору</a>
        </div>
    `;
}

async function renderMap() {
    setTitle('Карта');
    try {
      // Lazy-load D3 and the map renderer script as per AGENTS.MD
      if (!window.d3) await loadScript('https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js');
      if (!window.renderMindMap) await loadScript('assets/js/map.js');

      if (window.renderMindMap) {
        contentEl.innerHTML = '<div id="map-container"></div>';
        await window.renderMindMap(contentEl.firstChild);
      } else {
        throw new Error('renderMindMap function not found after loading script.');
      }
    } catch (e) {
      console.warn('[map] fallback:', e);
      contentEl.innerHTML = '<div class="callout warn">Не удалось загрузить карту.</div>';
    }
}

async function handleRoute() {
  const { route, slug, params, anchor } = parseHash(location.hash);

  // Always render the list and apply filters from the URL
  await renderList(slug);
  applyFiltersFromHash(params);
  setActive(slug);

  contentEl.innerHTML = '<div class="empty">Загрузка…</div>';
  document.body.classList.toggle('map-active', route === 'map');

  try {
    switch (route) {
      case 'glitch':
        if (slug) await renderCard(slug, anchor);
        else location.hash = '#/overview';
        break;
      case 'scene':
        if (slug) await renderScene(slug);
        else location.hash = '#/overview';
        break;
      case 'map':
        await renderMap();
        break;
      case 'overview':
      default:
        await renderOverview();
        break;
    }
  } catch (error) {
    if (error.message.startsWith('ItemNotFound')) {
        renderNotFound(slug);
    } else {
        console.error(`[Router] Failed to handle route ${location.hash}:`, error);
        contentEl.innerHTML = '<div class="callout warn">Произошла ошибка при навигации.</div>';
    }
  }
}

function init() {
  // Setup all event listeners (sidebar, keyboard nav, etc.)
  setupEventListeners();

  // Initial route handling
  window.addEventListener('DOMContentLoaded', handleRoute);
  // Handle subsequent route changes
  window.addEventListener('hashchange', handleRoute);
}

// Start the app
init();
