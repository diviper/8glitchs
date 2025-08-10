import { getManifestItem } from './paths.js';
import { setTitle } from './utils.js';

const contentEl = document.getElementById('content');

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
        // ЭТА СТРОКА - КЛЮЧЕВОЕ ИСПРАВЛЕНИЕ
        // Ждем, пока window.libsReady (из md.js) не завершится успешно
        await window.libsReady;

        const item = await getManifestItem(slug);
        if (!item) throw new Error('ItemNotFound');

        // The user's code used fetch(), but my paths.js provides a more robust fetchText()
        // that handles base paths correctly. I will use that.
        const { fetchText } = await import('./paths.js');
        const rawContent = await fetchText(item.paths.card);

        // Теперь мы на 100% уверены, что window.grayMatter и window.md существуют
        const { content: markdown, data: frontmatter } = window.grayMatter(rawContent);

        setTitle(frontmatter.title || 'Глитч');

        const html = window.md.parse(markdown); // Используем md.parse() как рекомендовано marked v4+
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
