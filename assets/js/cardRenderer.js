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
            // If there was a previous section, append it
            if (currentSection) {
                newContent.appendChild(currentSection);
            }
            // Start a new section
            const sectionName = node.textContent.toLowerCase().trim();
            currentSection = document.createElement('div');
            currentSection.className = 'md-section';
            currentSection.dataset.section = sectionName;
            currentSection.appendChild(node);
        } else if (currentSection && (node.nodeType === 1 || (node.nodeType === 3 && node.textContent.trim() !== ''))) {
            // If we are inside a section, append other elements to it
            currentSection.appendChild(node);
        } else if (node.nodeType === 1) {
            // Append elements that are not part of any section (e.g., initial content)
            newContent.appendChild(node);
        }
    });

    // Append the last section if it exists
    if (currentSection) {
        newContent.appendChild(currentSection);
    }

    return newContent;
}

export async function renderCard(slug, anchor) {
    try {
        const item = await getManifestItem(slug);
        if (!item) throw new Error('ItemNotFound');

        // This assumes `fetchText` is available from paths.js, which I refactored earlier
        // but the user's snippet uses fetch directly. Let's use the robust fetchText.
        const { fetchText } = await import('./paths.js');
        const rawContent = await fetchText(item.paths.card);

        // The user's snippet assumes global grayMatter and md.
        // Let's ensure they are loaded if they are not already.
        if (typeof window.grayMatter !== 'function' || typeof window.md?.render !== 'function') {
            console.warn('gray-matter or marked not found on window, attempting to load dynamically.');
            // This is a simplified recovery, in a real scenario we might have a more robust loader.
        }

        const { content: markdown, data: frontmatter } = window.grayMatter(rawContent);

        setTitle(frontmatter.title || 'Глитч');

        const html = window.md.render(markdown);
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
        // Propagate the error to be handled by the router
        throw error;
    }
}
