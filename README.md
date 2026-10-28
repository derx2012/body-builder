# Тренировка — личное PWA для домашних тренировок

Программа на 3 дня в неделю по 10–15 минут: гантели 5 кг, резинки, коврик, упоры для отжиманий. Без рекламы и без сервера — данные хранятся только на устройстве.

React + TypeScript + Vite, PWA через vite-plugin-pwa.

## Команды

- `npm run typecheck` — проверка типов
- `npm test` — unit-тесты (vitest): прогрессия, ротация, бюджет времени
- `npm run build` — сборка в `dist/`
- `npm run dev` — dev-сервер (открыть с телефона по IP компьютера в той же сети)
- `npm run fetch-images` — скачать фото из free-exercise-db в `public/exercises/` по `imageId`

## Публикация

GitHub Actions ([.github/workflows/pages.yml](.github/workflows/pages.yml)) на каждый push в `main` прогоняет тесты, собирает и публикует `dist/` на GitHub Pages. В настройках репозитория: Settings → Pages → Source: **GitHub Actions**. На телефоне открыть адрес в Chrome → меню → «Установить приложение».

## Где что

- `src/data/exercises.ts` — справочник упражнений: название, подсказки техники, `imageId`
- `src/data/program.ts` — программа A/B/C, диапазоны, отдых, число кругов
- `src/lib/progression.ts` — автопрогрессия по оценке «легко / норм / тяжело» и ступени темпа
- `src/lib/plan.ts` — разворот тренировки в шаги плеера и оценка длительности

## Фото упражнений

[free-exercise-db](https://github.com/yuhonas/free-exercise-db), Unlicense (public domain). Упражнение без фото показывается с заглушкой.
