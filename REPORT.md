# REPORT

## Summary
- Added `audit:routes` script validating manifest entries, paths, and required markdown sections.
- Stabilized intro audio: single `AudioContext` starts on user gesture, fades out on hide, and toggles mute with `M`.
- Router loads D3 lazily for `#/map` and falls back gracefully offline.
- Removed all Share buttons; cards and scenes use unified header markup.

## Route matrix
Всего записей: 35. Проблемных: 0.

| slug | category | card | scene | issues |
|---|---|---:|---:|---|
| observer-problem | Квант | OK | OK | — |
| nonlocality | Квант | OK | OK | — |
| quantum-superposition | Квант | OK | OK | — |
| quantum-decoherence | Квант | OK | OK | — |
| quantum-tunneling | Квант | OK | OK | — |
| quantum-teleportation | Квант | OK | OK | — |
| quantum-zeno | Квант | OK | — | — |
| delayed-choice | Квант | OK | — | — |
| quantum-darwinism | Квант | OK | — | — |
| collapse-problem | Квант | OK | — | — |
| arrow-of-time | Время | OK | OK | — |
| retrocausality | Время | OK | — | — |
| block-universe | Время | OK | — | — |
| invisible-universe | Космос | OK | OK | — |
| fine-tuning | Космос | OK | OK | — |
| cosmic-loneliness | Космос | OK | OK | — |
| multiverse-inflation | Космос | OK | — | — |
| heat-death | Космос | OK | — | — |
| big-crunch-rip | Космос | OK | — | — |
| consciousness-problem | Идентичность | OK | OK | — |
| ship-of-theseus | Идентичность | OK | — | — |
| mind-uploading | Идентичность | OK | — | — |
| chinese-room | Идентичность | OK | — | — |
| free-will-illusion | Идентичность | OK | OK | — |
| belief-power | Информация | OK | OK | — |
| landauer | Информация | OK | — | — |
| bekenstein-bound | Информация | OK | — | — |
| goodhart-law | Информация | OK | — | — |
| simulation | Информация | OK | OK | — |
| map-territory | Информация | OK | — | — |
| zeno | Логика | OK | — | — |
| banach-tarski | Логика | OK | OK | — |
| godel | Логика | OK | — | — |
| liar | Логика | OK | — | — |
| anthropic | Космос | OK | — | — |

## Console audit
- `node --check assets/js/router.js`
- `npm run lint:md`
- `npm run lint:html`
- `npm run check:manifest`
- `npm run doctor:manifest -- --write --stubs`
- `npm run audit:routes`

No errors reported.

## Perf (first screen)
D3 and map scripts load only when visiting `#/map`, keeping initial load light.

## A11y
Intro controls are focusable; hotkey `M` toggles audio mute.

## Next steps
1. Mobile polish for sidebar and scene layouts.
2. Map: add panning/zooming and offline caching.
3. Expand content stubs into full articles.
4. Improve automated tests for audio and routing.
5. Investigate service worker for assets.
