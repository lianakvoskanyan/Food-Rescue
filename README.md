# Food Rescue Marketplace

Дипломный проект: маркетплейс излишков еды от пекарен, кафе и магазинов (концепция близка к Too Good To Go, с собственным дизайном).

## Стек

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Sanity.io + GROQ (`next-sanity`, встроенная Studio на `/studio`)

## Запуск

```bash
npm install
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000).

## Переменные окружения

Скопируйте `.env.example` в `.env.local` и укажите:

- `NEXT_PUBLIC_SANITY_PROJECT_ID` — ID проекта из [sanity.io/manage](https://www.sanity.io/manage)
- `NEXT_PUBLIC_SANITY_DATASET` — обычно `production`
- `SANITY_API_READ_TOKEN` — только на сервере, если dataset приватный (Viewer token)

Токены с правами записи не добавляйте в `NEXT_PUBLIC_*`.

## Demo seed (Sanity)

Просмотр плана без записи:

```bash
npm run seed:sanity:dry-run
```

Запись (нужен `SANITY_API_WRITE_TOKEN` в `.env.local`, Editor token):

```bash
npm run seed:sanity
```

Скрипт создаёт документы с префиксом `_id` `demo-seed.*` и **не перезаписывает** уже существующие. Изображения не загружаются — добавьте их в Studio при необходимости.

## Sanity Studio

- В dev: [http://localhost:3000/studio](http://localhost:3000/studio)
- Схемы: `sanity/schemaTypes/` (`store`, `foodOffer`, `category`, `booking`)
- GROQ-запросы: `lib/sanity/queries.ts`, загрузка данных: `lib/sanity/fetch.ts`

## Скрипты

- `npm run dev` — режим разработки
- `npm run build` — production-сборка
- `npm run start` — запуск собранного приложения
- `npm run lint` — ESLint

## Deploy on Vercel

Production example: [food-rescue-tau-three.vercel.app](https://food-rescue-tau-three.vercel.app/)

In **Vercel → Project → Settings → Environment Variables**, set the same keys as in `.env.example` for **Production** (and Preview if needed):

| Variable | Notes |
|----------|--------|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Public |
| `NEXT_PUBLIC_SANITY_DATASET` | Usually `production` |
| `NEXT_PUBLIC_SANITY_API_VERSION` | Optional |
| `SANITY_API_READ_TOKEN` | Server only; Viewer if dataset is private |
| `SANITY_API_WRITE_TOKEN` | Server only; **required** for register, bookings, seller store/offers |
| `AUTH_SECRET` | Server only; random string |
| `AUTH_URL` | e.g. `https://food-rescue-tau-three.vercel.app` (your canonical URL) |

After changing env vars, **redeploy** the project.

In [Sanity manage](https://www.sanity.io/manage) → API → CORS origins, add your Vercel URL (e.g. `https://food-rescue-tau-three.vercel.app`) if Studio or API calls fail from the browser.

Deploy schema changes with `npx sanity schema deploy` (or publish from Studio) so fields like `store.location` exist in production dataset.

**Map on homepage:** markers appear only for stores with valid `location` (geopoint) and bookable offers. Add coordinates in seller dashboard or Studio.
