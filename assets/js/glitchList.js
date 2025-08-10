import { getManifest } from './paths.js';
import { debounce } from './utils.js';

const listEl = document.getElementById('glitch-list');
const searchInput = document.getElementById('search');
const categorySelect = document.getElementById('category-filter');

let navIndex = -1;

// --- Helper functions for fuzzy search and highlighting ---

function isDistOne(a, b) {
  if (a === b) return true;
  const la = a.length, lb = b.length;
  if (Math.abs(la - lb) > 1) return false;
  let i = 0, j = 0, mism = 0;
  while (i < la && j < lb) {
    if (a[i] === b[j]) { i++; j++; }
    else {
      mism++;
      if (mism > 1) return false;
      if (la > lb) i++;
      else if (lb > la) j++;
      else { i++; j++; }
    }
  }
  if (i < la || j < lb) mism++;
  return mism <= 1;
}

function findApproxIndex(text, word) {
  const len = word.length;
  for (let i = 0; i <= text.length - len; i++) {
    const sub = text.slice(i, i + len);
    if (isDistOne(sub, word)) return i;
  }
  return -1;
}

function highlightText(el, text, query) {
  const words = (query || '').toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) {
    el.textContent = text;
    return;
  }
  const lower = text.toLowerCase();
  const ranges = [];
  words.forEach(w => {
    let idx = lower.indexOf(w);
    if (idx === -1) idx = findApproxIndex(lower, w);
    if (idx !== -1) ranges.push([idx, idx + w.length]);
  });

  if (!ranges.length) {
    el.textContent = text;
    return;
  }

  ranges.sort((a, b) => a[0] - b[0]);
  let pos = 0;
  ranges.forEach(r => {
    if (r[0] > pos) el.appendChild(document.createTextNode(text.slice(pos, r[0])));
    const mark = document.createElement('mark');
    mark.textContent = text.slice(r[0], r[1]);
    el.appendChild(mark);
    pos = r[1];
  });
  if (pos < text.length) el.appendChild(document.createTextNode(text.slice(pos)));
}

function fuzzyMatch(str, word) {
  const lower = str.toLowerCase();
  const w = word.toLowerCase();
  if (lower.includes(w)) return true;
  const tokens = lower.split(/[^a-zа-я0-9ё]+/);
  return tokens.some(token => isDistOne(token, w));
}

// --- List Rendering ---

async function renderList(activeSlug) {
  const glitches = await getManifest();
  const rawSearch = (searchInput.value || '').trim();
  const words = rawSearch.toLowerCase().split(/\s+/).filter(Boolean);
  const category = categorySelect.value;

  listEl.innerHTML = '';

  const results = glitches
    .map(g => {
      let score = 0;
      if (words.length) {
        words.forEach(w => {
          if (fuzzyMatch(g.title, w)) score += 3;
          if (g.tags && g.tags.some(t => fuzzyMatch(t, w))) score += 2;
          if (fuzzyMatch(g.category, w)) score += 1;
        });
      }
      return { g, score };
    })
    .filter(({ g, score }) => {
      const categoryMatch = !category || g.category === category;
      const searchMatch = !words.length || score > 0;
      return categoryMatch && searchMatch;
    });

  results.sort((a, b) => b.score - a.score);

  results.forEach(({ g }) => {
    const a = document.createElement('a');
    a.className = 'gl-item item';
    a.href = `#/glitch/${g.slug}${getFilterQuery()}`;
    a.dataset.slug = g.slug;
    a.setAttribute('role', 'option');

    const title = document.createElement('b');
    highlightText(title, g.title, rawSearch);
    a.appendChild(title);

    const catBadge = document.createElement('span');
    catBadge.className = 'badge';
    catBadge.textContent = g.category;
    a.appendChild(catBadge);

    listEl.appendChild(a);
  });

  setActive(activeSlug);
}

// --- Navigation and State ---

function updateFocused() {
  const items = listEl.querySelectorAll('.gl-item');
  items.forEach((el, i) => {
    el.classList.toggle('focused', i === navIndex);
    if (i === navIndex) {
      el.scrollIntoView({ block: 'nearest' });
    }
  });
}

function moveSelection(dir) {
  const items = listEl.querySelectorAll('.gl-item');
  if (!items.length) return;
  navIndex = (navIndex + dir + items.length) % items.length;
  updateFocused();
}

function getFilterQuery() {
    const params = new URLSearchParams();
    if (searchInput.value) params.set('q', searchInput.value);
    if (categorySelect.value) {
        // This needs to be a slug, not the full category name.
        // This logic needs to be centralized. For now, just use the value.
        params.set('cat', categorySelect.value);
    }
    const search = params.toString();
    return search ? `?${search}` : '';
}

function updateHashQuery() {
    const base = location.hash.split('?')[0];
    const newHash = base + getFilterQuery();
    history.replaceState(null, '', newHash);
}

function applyFiltersFromHash(params) {
    searchInput.value = params.q || '';
    // This needs to map slug back to category name.
    // For now, just set the value.
    categorySelect.value = params.cat || '';
}

function setActive(slug) {
  let activeItemIndex = -1;
  document.querySelectorAll('.sidebar .item').forEach((el, i) => {
    const isSelected = el.dataset.slug === slug;
    el.classList.toggle('active', isSelected);
    el.setAttribute('aria-selected', String(isSelected));
    if (isSelected) {
      activeItemIndex = i;
    }
  });
  navIndex = activeItemIndex;
  updateFocused();
}

// --- Event Handlers ---

function setupEventListeners() {
  const debouncedRender = debounce(() => {
    navIndex = -1;
    const currentSlug = location.hash.split('/')[2]?.split('?')[0];
    renderList(currentSlug);
    updateHashQuery();
  }, 300);

  searchInput.addEventListener('input', debouncedRender);
  categorySelect.addEventListener('change', debouncedRender);

  listEl.addEventListener('click', e => {
      const link = e.target.closest('a.gl-item');
      if (link) {
          e.preventDefault();
          location.hash = link.getAttribute('href');
      }
  });

  document.addEventListener('keydown', e => {
    if (e.target === searchInput || e.target === categorySelect) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      moveSelection(1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      moveSelection(-1);
    } else if (e.key === 'Enter') {
      const focusedItem = listEl.querySelector('.focused');
      if (focusedItem) {
        e.preventDefault();
        focusedItem.click();
      }
    }
  });
}

export { renderList, applyFiltersFromHash, setupEventListeners, setActive };
