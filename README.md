# Glitch Registry

Открытый реестр глитчей реальности: интерактивные сцены и карточки. Список глитчей берётся из `content/glitches.json`.

## Структура

- `scenes/` — интерактивы
- `content/glitches/` — карточки глитчей
- `legacy/` — архив старых страниц
- `assets/` — статические ресурсы

## Безопасность

- Статический проект, без серверной части и сбора данных.
- Markdown рендерится через `marked` + `DOMPurify` и очищается от небезопасного HTML.
- Прогресс прохождения сохраняется локально в `localStorage`.
- Нет аналитики, трекеров и сторонних сетевых запросов.

## Запуск

Откройте `index.html` в современном браузере.

## Линт и тесты

```bash
npm run lint:md
npm run lint:html
npm run check:manifest
npm test
```

## Лицензия

MIT

## Скриншоты

![glitch view](https://raw.githubusercontent.com/diviper/8glitchs/main/docs/glitch.svg)
![scene view](https://raw.githubusercontent.com/diviper/8glitchs/main/docs/scene.svg)

## Как добавить карточку/сцену

1. Создайте Markdown `content/glitches/<slug>.md` по шаблону.
2. При наличии интерактива добавьте `scenes/glitch-<slug>.html` с API `__initScene/__applyParams/__getShareParams`.
3. Добавьте запись в `content/glitches.json` с путями и статусом.
4. Запустите `npm run check:manifest` и линтеры перед PR.
