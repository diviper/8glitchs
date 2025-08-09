# Technical Audit — Glitch Registry

## Console
- `#/overview` and `#/glitch/nonlocality` load without console errors or warnings (checked via JSDOM).

## Routing
- Direct links `#/glitch/<slug>` and `#/scene/<slug>` resolve correctly.
- `404.html` redirects back to the hub.

## Performance
- First render of `index.html` takes ~0.002s (`curl` on local server).
- Initial network requests:
  - `styles.css`
  - `assets/js/lexicon.js`
  - `assets/js/related.js`
  - `assets/js/md.js` → `marked.min.js`, `dompurify@3.0.3`
  - `assets/js/progress.js`
  - `assets/js/screen-shader.js`
  - `assets/js/night-mode.js`
  - `https://cdn.jsdelivr.net/npm/d3-force@3/dist/d3-force.min.js`
  - `assets/js/map.js`
  - `assets/js/router.js`
  - `content/glitches.json`
  - route content (`content/overview.md` or `content/glitches/<slug>.md`)

## Accessibility
- Focus-visible styles defined in `styles.css`.
- Toast notifications use `role="status"` and do not grab focus.
- **Issue**: sidebar toggle button lacks `aria-expanded` state.

## Security
- Markdown is sanitized via DOMPurify; external links receive `rel="noopener noreferrer"`.
- **Issue**: `marked` is loaded from an unpinned CDN URL (supply‑chain risk).

## Content model
- Manifest contains 35 slugs; YAML front matter valid; `check:manifest` green.

## CI status
- `npm run lint:md`
- `npm run lint:html`
- `npm run check:manifest`
- `npm test`

## Risks and quick fixes
| Problem | Steps to reproduce | Risk | Priority | Quick fix & estimate |
| --- | --- | --- | --- | --- |
| CDN `marked` not version-pinned | Open site offline or after upstream compromise | Unexpected or malicious code execution | P0 | Bundle a fixed `marked` version locally and update loader — 2h |
| Sidebar toggle lacks `aria-expanded` | Toggle sidebar with screen reader | Screen readers cannot report state | P1 | Update button to toggle `aria-expanded` — 1h |
| Non-critical scripts (`map.js`, `d3-force`) load on first render | Load `index.html` and inspect network | Extra bytes delay first render | P2 | Lazy-load map resources after `#/map` route — 2h |
