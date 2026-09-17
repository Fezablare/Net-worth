# Net worth tracker

A personal net worth tracker in **AUD** for cash, super, three properties with mortgages, other debts, and ASX share holdings. Phone and laptop stay in sync through one server-side dataset — not browser localStorage.

## Features

- **PIN gate** — simple env-based PIN so a shared URL is not enough to see your numbers
- **This month editor** — update balances, ownership %, property values, and share tickers
- **Live ASX quotes** — Yahoo Finance via `/api/quotes`, with stale last-good-price fallback and manual override
- **Monthly snapshots** — one frozen copy per calendar month (confirm before replacing)
- **Dashboard** — net worth, month-over-month change, history chart, allocation breakdown
- **History & backup** — snapshot table with delete, JSON export/import

## Quick start (local / WSL)

```bash
npm install
npm run dev        # local development with hot reload
# or
npm run preview    # production build — use if dev hot-reload is unavailable
```

Open [http://localhost:4343](http://localhost:4343). Default PIN: **1234**.

If buttons or forms appear frozen in dev (hot-reload websocket blocked), run `npm run preview` instead.

Set a production PIN locally:

```bash
cp .env.example .env.local
# edit NET_WORTH_PIN
```

### Local data storage

Without `BLOB_READ_WRITE_TOKEN`, portfolio data and snapshots are stored in `data/net-worth.json` on disk. Every device hitting the same running instance sees the same numbers. Export JSON from History as a backup before migrating to Vercel.

## Deploy to Vercel (phone + laptop sync)

Vercel serverless functions do not keep a writable filesystem between requests. On Vercel the app stores the same JSON document (portfolio + snapshots + quote cache) in **Vercel Blob** so all devices share one dataset.

### Prerequisites

- [Node.js](https://nodejs.org/) and npm
- A [Vercel account](https://vercel.com/)
- The repo cloned locally (Windows, WSL, or macOS). From WSL:

```bash
origin repo clone felix-lau/genesis
cd genesis
npm install
```

### Environment variables

| Variable | Required | Where | Purpose |
| --- | --- | --- | --- |
| `NET_WORTH_PIN` | **Yes** (production) | Vercel project → Settings → Environment Variables | PIN to unlock the app. Do not use the default `1234` in production. |
| `BLOB_READ_WRITE_TOKEN` | **Yes** on Vercel | Set automatically when you add a Blob store (see below) | Read/write the shared `net-worth.json` blob. Leave unset for local dev (uses `data/net-worth.json` instead). |

Optional local-only file: copy `.env.example` to `.env.local` and set `NET_WORTH_PIN`. Do not commit `.env.local`.

### Deploy commands (Windows / WSL)

From the project root:

```bash
# First deploy (links the folder to a Vercel project)
npx vercel

# Production deploy
npx vercel --prod
```

During `npx vercel`, log in if prompted and accept the defaults for a Next.js app.

### Create the Blob store

After the project exists on Vercel:

1. Open the project in the [Vercel dashboard](https://vercel.com/dashboard).
2. Go to **Storage** → **Create Database** → **Blob** (or **Add** → **Blob**).
3. Connect the Blob store to this project. Vercel adds `BLOB_READ_WRITE_TOKEN` to the project environment.
4. In **Settings** → **Environment Variables**, set `NET_WORTH_PIN` for Production (and Preview if you use preview URLs).
5. Redeploy if you added variables after the first deploy: `npx vercel --prod`.

Open your `*.vercel.app` URL, enter your PIN, and use the app from phone or laptop — both read and write the same blob.

### Migrating local data to Vercel

1. Run locally and export JSON from **History**, or copy `data/net-worth.json`.
2. Deploy to Vercel with Blob + PIN configured.
3. Unlock the app and use **Import backup** on History to load your file.

## Out of scope

No multi-user auth, database, FX conversion, tax/CGT, or bank feeds. Property values are entered manually.
