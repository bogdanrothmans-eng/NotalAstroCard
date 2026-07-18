# Натальная карта — Telegram Mini App

Mobile-first Telegram Mini App. Next.js (App Router) + TypeScript + Tailwind + Zustand
(state persisted to `localStorage`). Payments for the full report are via **Telegram Stars**.

## Stack & layout

- `src/app/*` — routes: `/`, `/start`, `/enter-name`, `/birthday`, `/time-birth`, `/check`,
  `/loading`, `/report/[id]/short`, `/report/[id]/full`, `/paywall/[id]`, `/history`, `/settings`
- `src/types` — domain types
- `src/store/useAppStore.ts` — Zustand store (persist → localStorage)
- `src/lib/astro/mockNatalEngine.ts` — `generateShortNatalReport` / `generateFullNatalReport` /
  `generateNatalReport` / `generateTodayInsight` (respect `birthTimeAccuracy`)
- `src/lib/tokens.ts` — design tokens verified against Figma (Kids-app)
- `src/server/*` — payment backend (initData verification, libSQL store, grammY bot)
- `src/app/api/*` — `invoice`, `telegram/webhook`, `purchase-status`

The original clickable prototype lives in `reference/natal-app-prototype.jsx`.

## Local development

```bash
npm install
npm run dev          # http://localhost:3000
```

The UI runs in any browser. The **payment flow only works inside Telegram** (it needs real
`initData`); outside Telegram the paywall shows "Оплата доступна только внутри Telegram".

## Payments (Telegram Stars only)

Digital goods inside a Mini App must be sold via Telegram Stars — currency `XTR`,
`provider_token` empty. Third-party acquiring (card/СБП) is not allowed, so the paywall
offers a single method: **150 ⭐**.

Flow:
1. Frontend → `POST /api/invoice` with verified `initData` → backend `createInvoiceLink` (XTR).
2. Frontend opens `tg.openInvoice(link)`.
3. Bot answers `pre_checkout_query`, then on `successful_payment` writes the paid status to the
   DB (keyed by verified `telegram_user_id` + `report_id`) — **not** localStorage.
4. Frontend confirms against `GET /api/purchase-status` and unlocks the full report.

### Configuration

Copy `.env.example` → `.env.local` and fill in:

| var | meaning |
| --- | --- |
| `BOT_TOKEN` | bot token from @BotFather |
| `TELEGRAM_WEBHOOK_SECRET` | long random string; used to authenticate webhook calls |
| `PUBLIC_BASE_URL` | deployed URL, e.g. `https://your-app.vercel.app` |
| `TURSO_DATABASE_URL` | `file:./local.db` locally; `libsql://…` (Turso) in production |
| `TURSO_AUTH_TOKEN` | Turso auth token (production only) |

Register the webhook after deploy:

```bash
npm run set-webhook            # uses PUBLIC_BASE_URL → /api/telegram/webhook
npm run set-webhook -- --delete
```

In @BotFather: set the Mini App URL, and the bot is automatically eligible to receive Stars.

### Deployment notes (Vercel)

- API routes run on the Node runtime (`runtime = "nodejs"`).
- Use **Turso** for the DB — Vercel's filesystem is ephemeral, so a local `better-sqlite3`
  file would not persist. libSQL (`@libsql/client`) keeps SQLite semantics and works on
  serverless via Turso, with the same code as the local `file:` database.
