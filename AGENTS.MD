# Project Agent Guide — Glitch Registry

## Goals
- Убрать привязку к числу 8. Ввести реестр открытого размера: "Glitch Registry".
- Привести структуру к:
  /scenes/*.html (фрагменты сцен)
  /content/glitches/*.md (лор по шаблону)
  /legacy/ (архив старых страниц)
  /assets/js/{router.js,progress.js,lexicon.js}

## Naming
- Файлы сцен: scenes/glitch-<slug>.html (латиница, дефисы).
- Markdown-карточки: content/glitches/<slug>.md
- Старые reality_bug_* → перенос в /legacy/ c сохранением ссылок в README.

## Markdown rules
- Всегда есть секции: TL;DR / Научная опора / Парадокс / Дневник Дивайпера / Юнг / Сенека / Рик / Сцена / Ссылки.
- Заголовки до H3, абзацы короткие, без «стен текста».

## Lint & CI
- Добавить markdownlint (npm), скрипт "lint:md".
- Добавить .github/workflows/ci.yml: npm ci → npm run lint:md.

## Commands to run
- npx markdownlint-cli '**/*.md' --ignore node_modules --ignore legacy
- htmlhint **/*.html  (если есть конфиг)
- Отчёт: список изменённых/переименованных файлов, сводка нарушений markdownlint.

## PR policy
- Работать прямо из основной ветки песочницы Codex, но результат — Pull Request в GitHub.
- В PR приложить summary: что перенесено в legacy, что создано, что удалить навсегда (если согласовано).
