Project Agent Guide — Glitch Registry (Парадоксы реальности)
Внутренний регламент. Внешние контрибьюторы отключены.
Бренд: Glitch Registry — Парадоксы реальности.

1) Директории и нейминг

/assets/js/      router.js, md.js, scene-frame.js, widgets.js, progress.js,
                 intro.js, map.js, theme.js, paths.js, (опц.) night-mode.js, screen-shader.js
/assets/css/     styles.css (или styles.css в корне)
/content/        glitches.json, glitches/*.md, overview.md
/scenes/         glitch-<slug>.html
/legacy/         старые страницы (не используются)
/404.html        SPA-редирект
/index.html      хаб
slug — латиница, нижний регистр, дефисы.

Карточка: content/glitches/<slug>.md

Сцена: scenes/glitch-<slug>.html

2) Роуты (hash)
#/overview — обзор (content/overview.md)

#/glitch/<slug> — карточка (путь берём из манифеста)

#/scene/<slug> — сцена (путь из манифеста)

#/map — mind-map (D3 лениво)

#/show/intro — полноэкранное интро

SPA-404 для GitHub Pages (обязательно):


<!doctype html><meta charset="utf-8">
<script>
  var base = location.pathname.split('/')[1]; // "8glitchs"
  location.replace('/'+base+'/#/overview'+location.search);
</script>
3) Манифест (content/glitches.json)
Схема:


{
  "slug": "quantum-superposition",
  "title": "Суперпозиция",
  "category": "Квант",
  "tags": ["интерференция"],
  "status": "sceneExists",               // или "cardOnly"
  "paths": {
    "card": "content/glitches/quantum-superposition.md",
    "scene": "scenes/glitch-quantum-superposition.html"
  },
  "quest": { "intro": "...", "riddle": "...", "answer": "..." } // опц.
}
Требования:

Уникальные slug.

paths.card/scene указывают на существующие файлы (или показываем callout.warn).

Категории (жёсткий список):
Квант, Время, Космос, Информация, Логика, Идентичность.
(Антропный принцип закреплён за Космос.)

4) Контент-модель .md (обязательно)
Фронт-маттер YAML (в начале файла):


id: glitch-<slug>
title: <Заголовок>
category: <Квант|Время|Космос|Информация|Логика|Идентичность>
tags: [тег1, тег2]
status: draft | published
Секции (H3):

### TL;DR

### Научная опора

### Парадокс

### Дневник Дивайпера

### Юнг

### Сенека

### Рик

### Сцена/механика

### Ссылки

Безопасность markdown:

marked@12.0.2 (pin) + DOMPurify.

Внешние ссылки: rel="noopener noreferrer".

Запрещено: <script> в .md, загрузка .md через <script>.

5) Базовые утилиты путей (repo-aware, обязательно)
assets/js/paths.js предоставляет единственную точку построения URL:


(() => {
  const base = (function() {
    // базовая папка репозитория, например "/8glitchs/"
    const seg = location.pathname.split('/')[1] || '';
    return '/' + seg + '/';
  })();

  function toRepoURL(p) {
    if (!p) throw new Error('toRepoURL: empty path');
    const clean = String(p).replace(/^\/+/, '');
    return new URL(base + clean, location.origin).toString();
  }

  async function fetchText(p, init) {
    const url = toRepoURL(p);
    const res = await fetch(url, init);
    if (!res.ok) throw new Error(`fetchText ${p} ${res.status}`);
    return res.text();
  }

  async function loadScript(url) {
    return new Promise((ok, err) => {
      const s = document.createElement('script');
      s.src = url; s.async = true;
      s.onload = ok; s.onerror = () => err(new Error('script load: '+url));
      document.head.appendChild(s);
    });
  }

  let _manifest;
  async function getManifest() {
    if (_manifest) return _manifest;
    const txt = await fetchText('content/glitches.json');
    _manifest = JSON.parse(txt);
    return _manifest;
  }
  async function getManifestItem(slug) {
    const list = await getManifest();
    return list.find(x => x.slug === slug) || null;
  }

  window.repoPaths = { base, toRepoURL, fetchText, loadScript, getManifest, getManifestItem };
})();
Правило: никакого new URL(...) и конкатенаций путей — только через repoPaths.

6) Роутер (assets/js/router.js)
parseHash() → { route, slug }.

handleRoute() — единый try/catch. Полные ветки:

overview → рендер markdown content/overview.md.

glitch/<slug> → путь только из манифеста (item.paths.card);
если нет файла — показываем .callout.warn + кнопку «Открыть сцену» при наличии paths.scene.

scene/<slug> → загружаем scene-frame + item.paths.scene.

map → лениво грузит D3, фолбэк без ошибок.

show/intro → window.intro.show().

Проверка синтаксиса: node --check assets/js/router.js

7) Markdown рендер (assets/js/md.js)
Загружает текст через repoPaths.fetchText.

Парсинг через marked@12.0.2, очистка DOMPurify.

После вставки HTML вызывает widgets.mountAll(container).
Любая ошибка виджета — молчаливо пропускается.

8) Сцены (assets/js/scene-frame.js)
Единый фрейм: full-bleed фон (canvas) + контейнер .scene-content.

Кнопок Share нет.

Никаких фикс-высот, вёрстка тянется на весь вьюпорт.

9) Карта (assets/js/map.js)
В роутере #/map:


if (!window.d3) await repoPaths.loadScript('https://cdn.jsdelivr.net/npm/d3-force@3/dist/d3-force.min.js');
if (!window.renderMindMap) await repoPaths.loadScript('assets/js/map.js');
window.renderMindMap?.();
Офлайн/ошибка — показываем список категорий, без ошибок в консоли.

10) Интро-аудио (assets/js/intro.js)
Экспорт:


window.intro = { show(), hide(), mute(on) };
Один AudioContext, старт только после жеста (клик «Войти»).

Стартовый gain ≈ 0.05, верхняя граница ≤ 0.2.

На hide() — плавное затухание, контекст не закрываем.

Горячая клавиша M — mute/unmute.

Настройки (localStorage): gr:intro:skip, gr:intro:muted, gr:intro:lastSeen (TTL 7 дней).

11) Прогресс (assets/js/progress.js)
API: markDone(slug), isDone(slug), getProgress().

Запрещено массово фетчить все .md ради прогресса. Источник — localStorage.

Любые данные карточки, если нужны, подгружаются лениво по manifest.paths.card.

12) Виджеты (assets/js/widgets.js)
Мини-демо: landauer, goodhart, zeno, arrow, chsh, twoslit.

widgets.mountAll(root) безопасно игнорирует пустые контейнеры/ошибки.

13) Тема (assets/js/theme.js)
Бренд-имена, цвета категорий, хэлперы для чипов и шапок.

Карточки и сцены используют единый заголовок (title + category chip + tags).

Никаких Share-кнопок.

14) Безопасность/перф
marked@12.0.2 (pin), DOMPurify, внешние ссылки — rel="noopener noreferrer".

D3 грузится только на #/map.

Favicon — data:, чтобы не было 404.

night-mode.js, screen-shader.js — IIFE + экспорт initNightMode/initScreenShader, инициализация в DOMContentLoaded один раз.

15) Скрипты и проверки (обязательно)

node --check assets/js/router.js
node --check assets/js/scene-frame.js

npm run lint:md
npm run lint:html
npm run check:manifest
npm run doctor:manifest -- --write --stubs
npm run audit:routes       # генерит REPORT.routes.md
npm test                   # (когда появятся тесты)
16) Аудит маршрутов (scripts/audit-routes.mjs)
Проверяет:

Уникальные slug, валидные категории.

Наличие paths.card/scene и существование файлов.

В .md — YAML с id,title,category,tags,status и все обязательные секции.
Выводит: REPORT.routes.md (матрица маршрутов + список проблем).

17) DoD (Definition of Done)
Карточки/сцены открываются без 404.

#/map грузит D3 только при заходе, офлайн-фолбэк работает.

Интро: тихий звук, M — mute, затухание на выходе, нет InvalidStateError.

В консоли нет: Invalid base URL, already been declared, Missing catch..., Unexpected token else.

Markdown рендерится, виджеты монтируются, ошибки виджетов не ломают страницу.

Единый заголовок для карточек/сцен, чипы категорий/тегов из theme.js.

Share-UI отсутствует.

REPORT.routes.md собран, проблем — 0.

18) Типовые поломки → быстрые фиксы
404 по карточке: проверь glitches.json → paths.card, запусти
npm run doctor:manifest -- --write --stubs.

Invalid base URL / 404 при fetch: любой путь перевести на repoPaths.toRepoURL / fetchText.

Черная половина сцены: сцена должна встраиваться через scene-frame (full-bleed, canvas-фон).

Jitter в сайдбаре: фикс-паддинги/высоты, анимации только opacity/transform.

Интро аудио орёт/ломается: один контекст, старт после жеста, gain=0.05, на hide — плавный fade, контекст не закрывать.
