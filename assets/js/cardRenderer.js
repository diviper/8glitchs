import { getManifestItem } from './paths.js';
import { setTitle } from './utils.js';

const contentEl = document.getElementById('content');

/**
 * Внутренний парсер, заменяющий gray-matter.
 * Извлекает данные из YAML Front-Matter и основной контент.
 * @param {string} rawContent - Полное содержимое .md файла.
 * @returns {{data: object, content: string}}
 */
function internalParseFrontmatter(rawContent) {
  const frontmatterRegex = /^---\r?\n([\s\S]+?)\r?\n---\r?\n/;
  const match = rawContent.match(frontmatterRegex);

  const data = {};
  let content = rawContent;

  if (match) {
    content = rawContent.slice(match[0].length);
    const frontmatterStr = match[1];

    frontmatterStr.split(/\r?\n/).forEach(line => {
      const parts = line.match(/^([^:]+):\s*(.*)$/);
      if (parts) {
        const key = parts[1].trim();
        let value = parts[2].trim();
        // Простое преобразование для тегов-массивов
        if (key === 'tags' && value.startsWith('[') && value.endsWith(']')) {
            value = value.substring(1, value.length - 1).split(',').map(tag => tag.trim());
        }
        data[key] = value;
      }
    });
  }

  return { data, content };
}


function groupRenderedHtml(html) {
    const container = document.createElement('div');
    container.innerHTML = html;
    const newContent = document.createDocumentFragment();
    let currentSection = null;
    Array.from(container.childNodes).forEach(node => {
        if (node.nodeName === 'H3') {
            if (currentSection) newContent.appendChild(currentSection);
            const sectionName = node.textContent.toLowerCase().trim();
            currentSection = document.createElement('div');
            currentSection.className = 'md-section';
            currentSection.dataset.section = sectionName;
            currentSection.appendChild(node);
        } else if (currentSection && (node.nodeType === 1 || (node.nodeType === 3 && node.textContent.trim() !== ''))) {
            currentSection.appendChild(node);
        } else if (node.nodeType === 1) {
            newContent.appendChild(node);
        }
    });
    if (currentSection) newContent.appendChild(currentSection);
    return newContent;
}

export async function renderCard(slug, anchor) {
    try {
        // Убедимся, что marked.js загружен (он грузится из index.html)
        if (typeof window.marked !== 'object') {
            throw new Error('Markdown parser (marked.js) is not loaded.');
        }

        const item = await getManifestItem(slug);
        if (!item) throw new Error('ItemNotFound');

        const response = await fetch(item.paths.card);
        if (!response.ok) throw new Error('NetworkError');

        const rawContent = await response.text();

        // Используем наш новый внутренний парсер
        const { content: markdown, data: frontmatter } = internalParseFrontmatter(rawContent);

        setTitle(frontmatter.title || 'Глитч');

        const html = window.marked.parse(markdown);
        const groupedContent = groupRenderedHtml(html);

        const cardContainer = document.createElement('div');
        cardContainer.className = 'markdown-body';
        cardContainer.appendChild(groupedContent);

        contentEl.innerHTML = '';
        contentEl.appendChild(cardContainer);

        if (anchor) {
            const el = document.getElementById(anchor);
            if (el) el.scrollIntoView({ behavior: 'smooth' });
        }

    } catch (error) {
        console.error(`[cardRenderer] Failed to render ${slug}:`, error);
        throw error;
    }
}
