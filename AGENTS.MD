# Project Agent Guide — Glitch Registry (Archive Spec)

## Mission
Интерактивный **архив парадоксов**: квантовых, космологических, логических и информационных. Не игра. Нейтральный тон, корректность выше хайпа. Архив = канон. Сцены = интерактивные иллюстрации.

---

## Architecture
- **Hub**: `index.html` — список/поиск/фильтры, панель контента.
- **Routes (hash)**:
  - `#/glitch/<slug>` → рендер Markdown карточки из `/content/glitches/<slug>.md`.
  - `#/scene/<slug>` → подгрузка HTML-сцены из `/scenes/glitch-<slug>.html`.
  - `#/overview` → рендер `content/overview.md`.
- **Scripts**:
  - `assets/js/router.js` — hash-роутинг + подгрузка контента.
  - `assets/js/md.js` — безопасный рендер Markdown (marked.js через CDN, sanitize).
  - `assets/js/progress.js` — `markDone(slug) | isDone(slug) | getProgress()` → `localStorage`.
  - `assets/js/lexicon.js` — глоссарий (≈40 терминов), подсветка тултипами.
- **Manifest**: `content/glitches.json` — единый список глитчей с путями и статусами.

---

## Structure
/assets/
js/{router.js, md.js, progress.js, lexicon.js}
css/styles.css
/content/
glitches/ # .md карточки
glitches.json # манифест (см. формат ниже)
overview.md # обзор архива
/scenes/ # HTML сцены
/legacy/ # архив старых страниц
.github/workflows/ci.yml
AGENTS.md
README.md

yaml
Копировать
Редактировать

---

## Naming
- Сцены: `scenes/glitch-<slug>.html` (латиница, дефисы, нижний регистр).
- Карточки: `content/glitches/<slug>.md`.
- Slug — уникальный, стабильный. Никаких префиксов с цифрами.

---

## Content model (Markdown карточки)
Каждая карточка **обязана** иметь секции:

1. `### TL;DR` — 1–3 предложения.
2. `### Научная опора` — кратко что это и на каких работах/экспериментах стоит.
3. `### Парадокс` — где ломается интуиция.
4. `### Дневник Дивайпера` — короткая заметка от автора.
5. `### Юнг` — архетип/психика (1–3 строки).
6. `### Сенека` — что в нашей власти (1–3 строки).
7. `### Рик` — ироничная ремарка (1–2 строки).
8. `### Сцена/механика` — как устроена интерактивная демонстрация.
9. `### Ссылки` — 3–7 источников с короткими пояснениями.

Правила: заголовки ≤ H3, короткие абзацы, никакой «мгновенной передачи информации быстрее света» и прочих анти-научных формулировок.

---

## UI Spec (Hub)
- Шапка: **Реестр** | **Сцены** | **Обзор**. (Без «8 глюков».)
- Левая колонка: список из `glitches.json` + поиск + фильтры по `category`.
- Центральная панель: рендер карточки/сцены.
- Шаблон карточки в Hub: заголовок, категория/статус, оглавление секций, кнопки **Открыть сцену** (если есть) и **Пометить пройдено**.
- Визуал: меньше glow (умеренный `text-shadow/box-shadow`), `max-width: 1080px`, `line-height: 1.6`, шрифты через `clamp()`.

---

## Manifest: `content/glitches.json`
Массив объектов:
```json
{
  "slug": "quantum-entanglement",
  "title": "Запутанность (нелокальные корреляции)",
  "category": "Квант",
  "status": "sceneExists",        // "sceneExists" | "cardOnly"
  "paths": {
    "card": "content/glitches/quantum-entanglement.md",
    "scene": "scenes/glitch-quantum-entanglement.html"
  }
}
Требования:

Все 35 элементов присутствуют.

Для 13 текущих сцен — status: "sceneExists" и валидный paths.scene.

npm run check:manifest проверяет уникальность slug и существование файлов.

Catalogue (35) — slug → title → category → status
status помечен исходя из текущего репозитория: что есть как сцена (13) и что пока карточка (22).

Квант
observer-problem — Проблема наблюдателя — Квант — sceneExists

nonlocality — Нелокальность (ЭПР/Белл) — Квант — sceneExists

quantum-superposition — Суперпозиция — Квант — sceneExists

quantum-decoherence — Декогеренция — Квант — sceneExists

quantum-tunneling — Туннелирование — Квант — sceneExists

quantum-teleportation — Квантовая телепортация — Квант — sceneExists

quantum-zeno — Квантовый парадокс Зенона — Квант — cardOnly

delayed-choice — Задержанный выбор (Уилер) — Квант — cardOnly

quantum-darwinism — Квантовый дарвинизм — Квант — cardOnly

collapse-problem — Проблема коллапса — Квант — cardOnly

Время
arrow-of-time — Стрела времени — Время — sceneExists

retrocausality — Ретро-причинность — Время — cardOnly

block-universe — Блок-вселенная (вечное настоящее) — Время — cardOnly

Космос
invisible-universe — Невидимая вселенная (тёмные сектора) — Космос — sceneExists

fine-tuning — Точная настройка — Космос — sceneExists

cosmic-loneliness — Парадокс Ферми — Космос — sceneExists

multiverse-inflation — Инфляция и мультивселенные — Космос — cardOnly

heat-death — Тепловая смерть вселенной — Космос — cardOnly

big-crunch-rip — Большое сжатие / Большой разрыв — Космос — cardOnly

Идентичность/сознание
consciousness-problem — Проблема сознания (hard problem) — Идентичность — sceneExists

ship-of-theseus — Корабль Тесея — Идентичность — cardOnly

mind-uploading — Загрузка разума / копирование личности — Идентичность — cardOnly

chinese-room — Китайская комната (Сёрл) — Идентичность — cardOnly

free-will-illusion — Иллюзия свободы воли — Идентичность — cardOnly

Информация/симуляция
belief-power — Сила веры/ожиданий (метрики и симуляция) — Информация — sceneExists

landauer — Принцип Ландауэра — Информация — cardOnly

bekenstein-bound — Предел Бекенштейна — Информация — cardOnly

goodhart-law — Закон Гудхарта — Информация — cardOnly

simulation — Симуляционный аргумент — Информация — cardOnly

map-territory — Карта и территория — Информация — cardOnly

Логика/бесконечности
zeno — Парадоксы Зенона — Логика — cardOnly

banach-tarski — Банах–Тарский — Логика — cardOnly

godel — Неполнота Гёделя — Логика — cardOnly

liar — Парадокс лжеца — Логика — cardOnly

Наблюдатель/смысл
anthropic — Антропный принцип — Наблюдатель — cardOnly

Modules (вспомогательное, не каталог):
dark-matter-visualization.html, entanglement-visualization.html.

Copy rules (точность формулировок)
ЭПР/запутанность: корреляции без передачи сигнала быстрее света.

Наблюдатель: речь об измерении/взаимодействии/декогеренции, не «мысли создают материю».

Точная настройка: избегать «доказательств замысла» — давать антропный/мультивселенский контекст.

Плацебо/ожидания: эффект реален, гетерогенен, зависит от протоколов.

CI / QA
markdownlint (уже настроен).

Link-checker (lychee или аналог) для всех .md/.html.

(Опц.) htmlhint по конфигу.

Pull Request summary: список добавленных/переименованных файлов + результаты линтов.

Definition of Done (для задач по этому AGENTS.md)
Обновлены: glitches.json, соответствующие .md/сцены, ссылки в README и Hub.

Линтеры зелёные. Нет битых ссылок.

Навигация #/glitch/<slug> и #/scene/<slug> работает, 404.html редиректит на Hub.

Тексты соответствуют Copy rules.

Contribution workflow (для будущих авторов)
Добавить новый глитч = PR с:

content/glitches/<slug>.md по модели.

записью в content/glitches.json.

(опц.) сценой scenes/glitch-<slug>.html.
CI должен быть зелёным.

TODO Roadmap (сверху вниз)
Перебрендинг лендинга и исправление текстов ЭПР.

Hub + router + md renderer + progress.

content/glitches.json + npm run check:manifest.

lexicon.js и тултипы.

Link-check в CI.

Полировка UI (контейнер, типографика, мобильная адаптация).
