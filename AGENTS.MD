# Project Agent Guide — Glitch Registry (Парадоксы реальности)

## Mission
Интерактивный архив парадоксов (квант, космос, логика, информация). Не игра и не новостной сайт — нейтрально, проверяемо, без хайпа. Карточки = канон (Markdown+виджеты). Сцены = мини-демо.

## Routes (hash)
- `#/overview` — обзор архива.
- `#/glitch/<slug>` — карточка из `content/glitches/<slug>.md` (путь берём из `glitches.json`).
- `#/scene/<slug>` — сцена из `scenes/glitch-<slug>.html`.
- `#/map` — mind-map, D3 грузится лениво.
- `#/show/intro` — полноэкранное вступление (Canvas+WebAudio).
- SPA-404 (`/404.html`) редиректит на `#/overview`.

## Architecture
- `assets/js/router.js` — `parseHash()`+единое `handleRoute()` (полные `if/else if/else`, общий `try/catch`), ленивые загрузки D3/map.
- `assets/js/md.js` — рендер Markdown (marked@12, DOMPurify), **после** вставки вызывает `widgets.mountAll(container)`.
- `assets/js/widgets.js` — мини-виджеты: `landauer`, `goodhart`, `zeno`, `arrow`, `chsh`, `twoslit`.
- `assets/js/scene-frame.js` — full-bleed сцены: фон-canvas, интро-текст как фолбэк.
- `assets/js/intro.js` — вступление: `window.intro.show()/hide()/mute()`, звук по жесту, тихий по умолчанию, `M` — mute.
- `assets/js/theme.js` — бренд-токены (имена, цвета категорий, чипы), хедеры карточек/сцен.
- `scripts/doctor-manifest.mjs` — проверка `glitches.json`: пути, категории, стабы; флаги `--write`, `--stubs`.

## Structure
