import { getManifest } from './paths.js';
import { setTitle } from './utils.js';

const contentEl = document.getElementById('content');

// A map for category slugs, could be moved to a shared config file later.
const categorySlugMap = {
  'Квант': 'quant',
  'Время': 'time',
  'Космос': 'cosmos',
  'Идентичность': 'id',
  'Информация': 'info',
  'Логика': 'logic'
};

export async function renderOverview() {
  setTitle('Обзор');
  contentEl.innerHTML = '<div class="empty">Загрузка…</div>';

  try {
    const glitches = await getManifest();
    const categoryCounts = glitches.reduce((acc, g) => {
      acc[g.category] = (acc[g.category] || 0) + 1;
      return acc;
    }, {});

    const grid = document.createElement('div');
    grid.className = 'tiles'; // A class for the overview grid

    Object.entries(categoryCounts).forEach(([category, count]) => {
      const slug = categorySlugMap[category] || '';
      const tile = document.createElement('div');
      tile.className = 'tile'; // A general tile style
      tile.dataset.cat = slug;
      tile.setAttribute('tabindex', '0');
      tile.setAttribute('role', 'button');

      const title = document.createElement('h3');
      title.textContent = category;
      tile.appendChild(title);

      const countEl = document.createElement('p');
      countEl.textContent = `Доступно: ${count}`;
      tile.appendChild(countEl);

      tile.addEventListener('click', () => {
        // Navigate to the list, filtered by this category
        location.hash = `#/glitch?cat=${category}`;
      });

      tile.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          tile.click();
        }
      });

      grid.appendChild(tile);
    });

    contentEl.innerHTML = ''; // Clear loading message

    const heading = document.createElement('h1');
    heading.textContent = 'Реестр Глитчей Реальности';
    contentEl.appendChild(heading);

    contentEl.appendChild(grid);

  } catch (error) {
    console.error('Failed to render overview:', error);
    contentEl.innerHTML = '<div class="callout warn">Не удалось загрузить обзор.</div>';
  }
}

// Add some basic styling for the new tiles to the stylesheet
const style = document.createElement('style');
style.textContent = `
  .tiles {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
    margin: 2rem 0;
  }
  .tile {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    padding: 1rem 1.5rem;
    cursor: pointer;
    transition: all var(--transition-speed) ease;
  }
  .tile:hover {
    transform: translateY(-5px);
    background: var(--color-surface-hover);
    box-shadow: 0 5px 15px rgba(0, 255, 127, 0.1);
  }
  .tile h3 {
    margin-bottom: 0.5rem;
    color: var(--color-accent);
  }
  .tile p {
    color: var(--color-text-muted);
  }
`;
document.head.appendChild(style);
