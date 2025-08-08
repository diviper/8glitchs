# Glitch Registry

Открытый реестр глитчей реальности: интерактивные сцены и карточки.

Список глитчей берётся из `content/glitches.json`.

## Структура

- `scenes/` — интерактивы
- `content/glitches/` — карточки глитчей
- `legacy/` — архив старых страниц
- `assets/` — статические ресурсы

Сцены рендерятся в шапку + `.scene-frame`; старые элементы «БАГ #n / серия» скрываются стилями. Для шаринга сцена может отдавать параметры через `__getShareParams()`.

## Безопасность

- Статический проект, без серверной части и сбора данных.
- Markdown рендерится через `marked` + `DOMPurify` и очищается от небезопасного HTML.
- Прогресс прохождения сохраняется локально в `localStorage`.
- Нет аналитики, трекеров и сторонних сетевых запросов.

## Запуск

Откройте `index.html` в современном браузере.

## Landing

Интро-страница `landing.html` загружает манифест `content/landing.json` с ссылками на видео и аудио.
Замените URL в этом файле, чтобы обновить медиа.

Редирект на лендинг отключается параметром `?hub=1` в `index.html`.

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

![glitch view](https://raw.githubusercontent.com/diviper/8glitchs/3841247b83a55794d5cd3736cb682a304b744412/screenshots/card.png)
![scene view](https://placehold.co/600x400?text=Scene%20View)

## Как добавить карточку/сцену

1. Создайте Markdown `content/glitches/<slug>.md` по шаблону.
2. При наличии интерактива добавьте `scenes/glitch-<slug>.html` с API `__initScene/__applyParams/__getShareParams`.
3. Добавьте запись в `content/glitches.json` с путями и статусом.
4. Запустите `npm run check:manifest` и линтеры перед PR.
