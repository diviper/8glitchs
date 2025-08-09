Project Agent Guide — Glitch Registry (Парадоксы реальности)
Внутренний регламент для меня и бота. Внешние контрибьюторы отключены.
Бренд: Glitch Registry — подзаголовок Парадоксы реальности.

Миссия
Курируемый архив парадоксов (квант, космос, логика, информация).
Карточки (Markdown) + мини-сцены (HTML) + микро-виджеты (чистый JS).
Точность важнее хайпа. Никаких социальных кнопок.

Архитектура
Статический сайт: index.html + assets/ + content/ + scenes/.

Маршруты (hash):

#/overview — обзор (content/overview.md).

#/glitch/<slug> — карточка (content/glitches/<slug>.md, путь из манифеста).

#/scene/<slug> — сцена (scenes/glitch-<slug>.html, из манифеста).

#/map — mind-map; D3 подгружается лениво.

#/show/intro — полноэкранное интро (канвас + тихий WebAudio).

Манифест: content/glitches.json — единственный источник истины для путей/категорий/тегов/статуса.

Ключевые скрипты:

assets/js/router.js — парсинг hash, handleRoute() с единым try/catch, безопасные ветки overview|glitch|scene|map|show.

assets/js/md.js — загрузка markdown (marked@pin + DOMPurify), widgets.mountAll(target) после рендера.

assets/js/widgets.js — мини-демо: landauer|goodhart|zeno|arrow|chsh|twoslit.

assets/js/intro.js — интро-оверлей (канвас-анимация, gain ≈ 0.05, mute M, window.intro.show/hide/mute).

assets/js/progress.js — markDone/isDone/getProgress() (localStorage).

assets/js/theme.js — бренд-токены (название, цвета категорий, хэлперы).

assets/js/map.js — визуализация карты (фолбэк-список, если D3 нет).

scripts/doctor-manifest.mjs — валидация/починка манифеста (--write, --stubs).

Без коллизий имён: screen-shader.js и night-mode.js обёрнуты в IIFE и экспортируют initScreenShader/initNightMode. Инициализация один раз на DOMContentLoaded.

Контент-модель (карточки)
Файл: content/glitches/<slug>.md
Перед телом — YAML:


id: glitch-<slug>
title: Заголовок
category: Квант | Время | Космос | Информация | Логика | Идентичность | Наблюдатель
tags: [тег_1, тег_2]
status: draft | published
Обязательные секции (H3):

### TL;DR — 1–3 предложения.

### Научная опора — что это и на каких работах/экспериментах стоит.

### Парадокс — где ломается интуиция.

### Дневник Дивайпера — заметка автора.

### Юнг — 1–3 строки про архетип/психику.

### Сенека — 1–3 строки «что в нашей власти».

### Рик — ироничная ремарка.

### Сцена/механика — как устроена интерактивная демонстрация.

### Ссылки — 3–7 источников с короткими пояснениями.

Правила копирайта: без сенсационщины; никаких «Faster-than-light». Внешние ссылки — rel="noopener noreferrer"; markdown чистится.

Манифест
Файл: content/glitches.json — массив объектов:


{
  "slug": "quantum-superposition",
  "title": "Суперпозиция",
  "category": "Квант",
  "tags": ["интерференция"],
  "status": "sceneExists",           // or "cardOnly"
  "paths": {
    "card": "content/glitches/quantum-superposition.md",
    "scene": "scenes/glitch-quantum-superposition.html"
  },
  "quest": { "intro": "…", "riddle": "…", "answer": "…" }  // опционально
}
Требования:

Все заявленные slug уникальны и соответствуют файлам.

paths.card/scene указывают на существующие файлы; иначе показываем callout.warn + “Открыть сцену”.

Для сцен — status: "sceneExists".

Роутинг (обязательные инварианты)
handleRoute() — полный if/else if/else + один общий catch; без “dangling else”.

Markdown грузим по пути из манифеста; фолбэк на content/glitches/<slug>.md — только если в манифесте нет paths.card.

На ошибке загрузки — аккуратный .callout.warn (без пустых панелей).

#/map:

если !window.d3 → loadScript('https://cdn.jsdelivr.net/npm/d3-force@3/dist/d3-force.min.js');

если !window.renderMindMap → loadScript('assets/js/map.js');

офлайн-фолбэк: список категорий без ошибок.

Интро управляет стартовым потоком (#/show/intro), кнопка “Главная” всегда вызывает intro.show().

Доступность и UX
Клавиатурная навигация в сайдбаре: role="listbox" / элементы role="option" + aria-selected.

Видимые :focus-visible.

Нет кнопок Share (удалены и из сцен, и из карточек).

Ховеры без “прыжков” — фиксированные высоты/паддинги, анимации только opacity/transform.

Безопасность/перф
marked@12.0.2 (pin); DOMPurify для HTML; внешние ссылки с rel=noopener.

Скрипты карты и тяжёлые вещи — лениво.

Без изображений/бинарников в интро/виджетах.

Скрипты и проверки
Локальные проверки:

node --check assets/js/router.js

npm run lint:md

npm run lint:html

npm run check:manifest

npm run doctor:manifest (--write, --stubs при необходимости)

(опц.) npm run doctor:dead — отчёт по неиспользуемым ассетам; npm run prune:dead — интерактивное удаление.

DoD для любых задач
Карточки/сцены открываются без 404.

“Главная” открывает интро; звук тихий (gain ≈ 0.05), M — mute; при входе звук плавно гасится.

#/map грузит D3 только при заходе; офлайн-фолбэк без ошибок.

В консоли нет already been declared, Missing catch or finally, Unexpected token else.

Виджеты монтируются после рендера markdown; ошибки виджетов не ломают страницу.

Бренд/цвета категорий — через theme.js; шапки карточек и сцен визуально ровные.

Нет кнопок Share и связанных обработчиков.

Типовые поломки → быстрые фиксы
“Карточка не найдена”: проверь glitches.json → paths.card, запусти npm run doctor:manifest -- --write --stubs.

Чёрная половина сцены / пустой фон: проверь, что сцена встраивается через единый scene-frame, фон рендерится на canvas, контейнер full-bleed; без фикс-высот.

Jitter в сайдбаре: у кнопок чипов фикс-высоты/паддинги, hover только на opacity/transform.

Интро орёт / не мьютится: стартовый gain=0.05, window.intro.mute(true), обработчик keydown (M), при hide — setTargetAtTime(0, t, 0.05) и/или audioCtx.close().

Нота бене
Внешние PR/issue выключены по смыслу проекта.

SPA-404 для GitHub Pages присутствует; прямые ссылки вида #/glitch/* и #/scene/* работают после перезагрузки.

Favicon — data-URL, чтобы не ловить 404.
