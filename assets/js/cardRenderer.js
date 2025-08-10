import { fetchText, getManifestItem } from './paths.js';
import { setTitle } from './utils.js';

// Assuming a global `renderMarkdown` function for now, as per the original code.
// This should be refactored to be imported if it becomes a module.
// declare const renderMarkdown: (md: string, target: HTMLElement, options: object) => Promise<void>;

const contentEl = document.getElementById('content');
let scrollHandler = null;
let lastSlug = null;

function saveScrollPosition(slug) {
  if (!slug) return;
  try {
    sessionStorage.setItem(`scroll:${slug}`, String(window.scrollY));
  } catch (e) {
    console.warn('Could not save scroll position:', e);
  }
}

function createToc(target) {
  const headings = target.querySelectorAll('h3');
  if (headings.length < 2) return;

  const toc = document.createElement('div');
  toc.className = 'toc';

  headings.forEach(h => {
    if (!h.id) {
        // Simple slugify for ID
        h.id = h.textContent.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
    }
    const link = document.createElement('a');
    link.href = `#${h.id}`;
    link.textContent = h.textContent;
    link.addEventListener('click', e => {
      e.preventDefault();
      h.scrollIntoView({ behavior: 'smooth' });
    });
    toc.appendChild(link);
  });

  target.insertBefore(toc, target.firstChild);
}

export async function renderCard(slug, anchor) {
  // Clean up previous listeners and state
  if (scrollHandler) window.removeEventListener('scroll', scrollHandler);
  saveScrollPosition(lastSlug);

  const item = await getManifestItem(slug);
  if (!item) {
    // Throw an error that the router can catch to display a proper 404 page.
    throw new Error(`ItemNotFound: Glitch with slug '${slug}' not found in manifest.`);
  }

  const cardPath = item.paths?.card;
  if (!cardPath) {
      contentEl.innerHTML = '<div class="callout warn">Путь к карточке не указан.</div>';
      setTitle(item.title);
      return;
  }

  try {
    const markdown = await fetchText(cardPath);
    contentEl.innerHTML = '<div class="card-wrap"><div class="md-body"></div></div>';
    const target = contentEl.querySelector('.md-body');

    // The `renderMarkdown` function is expected to be on the global scope for now
    if (typeof window.renderMarkdown !== 'function') {
        throw new Error('Global `renderMarkdown` function not found.');
    }
    await window.renderMarkdown(markdown, target, { slug, item });

    createToc(target);
    setTitle(item.title);

    // Restore scroll position or scroll to anchor
    const savedScrollY = sessionStorage.getItem(`scroll:${slug}`);
    if (anchor) {
      const el = document.getElementById(anchor);
      if (el) el.scrollIntoView();
    } else if (savedScrollY) {
      window.scrollTo(0, parseInt(savedScrollY, 10));
    }

    // Set up new scroll listener
    scrollHandler = () => saveScrollPosition(slug);
    window.addEventListener('scroll', scrollHandler, { passive: true });
    lastSlug = slug;

  } catch (error) {
    console.error(`[cardRenderer] Failed to render card for ${slug}:`, error);
    const scenePath = item.paths?.scene;
    contentEl.innerHTML = `
      <div class="callout warn">
        <b>Карточка временно недоступна.</b>
        ${scenePath ? `<a class="btn-link" href="#/scene/${slug}">Открыть сцену</a>` : ''}
      </div>`;
    setTitle(item.title);
  }
}
