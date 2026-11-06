# Allverze Company Profile

Website and contact API for **Allverze Corporation** — [www.allverze.com](https://www.allverze.com).

Two deployables in one npm-workspaces monorepo:

- **`client/`** — the public marketing site: a React 19 single-page app (Vite 8 + TypeScript + Tailwind 4) with light/dark theming, client-side routing, and a contact form whose state survives navigation.
- **`server/`** — a small Express 5 API that validates the contact form, sends two transactional emails through **Resend** (a lead notification to the team, a confirmation to the visitor), and appends every submission — successful, rejected, throttled, or bot — to a tagged audit log.

---

## Tech stack

Versions below are what is declared in each `package.json` and what is actually installed in this checkout.

### Frontend — `client/`

| Package | Declared | Installed | Role |
|---|---|---|---|
| `react` | `^19.2.8` | 19.2.8 | UI runtime |
| `react-dom` | `^19.2.8` | 19.2.8 | DOM renderer |
| `react-router-dom` | `^7.18.3` | 7.18.3 | SPA routing (`BrowserRouter`) |
| `vite` | `^8.2.2` | 8.2.2 | Dev server + production build |
| `@vitejs/plugin-react` | `^6.1.0` | 6.1.1 | React Fast Refresh / JSX transform |
| `typescript` | `~6.0.2` | 6.0.3 | Type checking (`tsc -b`) |
| `tailwindcss` | `^4.3.3` | 4.3.3 | Utility CSS (CSS-first config) |
| `@tailwindcss/vite` | `^4.3.3` | 4.3.3 | Tailwind v4 Vite plugin |
| `eslint` | `^10.9.0` | 10.10.0 | Linting |
| `typescript-eslint` | `^8.67.0` | 8.69.0 | TS rules |
| `eslint-plugin-react-hooks` | `^7.1.1` | 7.1.1 | Hooks rules |
| `eslint-plugin-react-refresh` | `^0.5.4` | 0.5.6 | HMR-safety rules |
| `@eslint/js` | `^10.0.1` | 10.0.1 | Base recommended rules |
| `globals` | `^17.11.0` | 17.12.0 | Browser/Node globals |
| `@types/react` | `^19.2.18` | 19.2.18 | React types |
| `@types/react-dom` | `^19.2.4` | 19.2.7 | React DOM types |
| `@types/node` | `^24.13.3` | 24.13.3 | Node types for config files |

### Backend — `server/`

| Package | Declared | Installed | Role |
|---|---|---|---|
| `express` | `^5.2.1` | 5.2.1 | HTTP server / routing |
| `helmet` | `^8.3.0` | 8.3.0 | Security headers |
| `cors` | `^2.8.6` | 2.8.6 | Single-origin CORS allowlist |
| `express-rate-limit` | `^8.7.0` | 8.7.0 | 20 requests / 15 min on `/api/contact` |
| `dotenv` | `^17.4.2` | 17.4.2 | Loads the root `.env` in local/Docker runs |
| `eslint` / `@eslint/js` / `globals` | — | 10.10.0 / 10.0.1 / 17.12.0 | Server lint (flat config, no TypeScript) |

There is **no HTTP client dependency**: `server/src/lib/resend.js` uses Node's built-in `fetch` (global since Node 18) against `https://api.resend.com`. SMTP was retired deliberately — the nodemailer handshake dominated contact-form latency.

### Tooling — repo root

| Package | Declared | Installed | Role |
|---|---|---|---|
| `concurrently` | `^10.0.5` | 10.0.5 | Runs Vite and the API in one terminal |

### External services

| Service | Used for |
|---|---|
| **Resend** | Transactional email over HTTPS (`api.resend.com`); expects a `re_…` API key |
| **Zoho Mail** | Receives leads at `hello@allverze.com` (inbox only on the free plan) |
| **Vercel** (Hobby) | Production host for the API |
| **Cloudflare Pages + DNS** | Production host for the site (`www.allverze.com` is canonical) |
| **Cloudflare Tunnel** | Optional live preview from this machine (`preview.allverze.com`) |

---

## Requirements

- **Node.js 22.x** — pinned by `server/package.json` → `"engines": { "node": "22.x" }` and by the Docker image (`node:22-alpine`). Vite 8 itself requires Node ≥ 20.19 or ≥ 22.12. This checkout was verified on **Node 24.20.0**; npm prints an `EBADENGINE` warning, which is harmless locally.
- **npm 10+** — verified on npm 12.0.2. The repo is driven by npm workspaces, so use npm rather than yarn/pnpm.
- A **Resend API key** and a verified sending domain — only needed to send real email. The verification harnesses stub `fetch`, so they send nothing.

---

## Repository layout

```
.
├── package.json                workspaces + one-command scripts
├── package-lock.json           single lockfile for both workspaces
├── .env.example                the env contract (copy to .env)
├── .gitignore                  logs, .env, dist, AGENTS.md, design/
├── railway.json                dormant Railway config (Dockerfile deploy)
├── README.md
├── AGENTS.md                   session memory (gitignored, local only)
├── scripts/
│   └── contact-log.mjs         readable viewer for the submission log
│
├── client/                     React 19 SPA
│   ├── index.html              SEO meta, Open Graph, favicons
│   ├── vite.config.ts          React + Tailwind plugins, /api proxy, :5173
│   ├── tsconfig*.json          app / node / root project references
│   ├── eslint.config.js
│   ├── public/                 favicons, og-image, robots.txt, sitemap.xml, _redirects
│   └── src/
│       ├── main.tsx            BrowserRouter + ThemeProvider + ContactFormProvider
│       ├── App.tsx             routes: / /about /services /contact, * → home
│       ├── config.ts           VITE_* driven config (WhatsApp, API base, public email)
│       ├── index.css           Tailwind import + design tokens + keyframes
│       ├── api/contact.ts      submitContact() + ContactSubmissionError
│       ├── components/         Header, Footer, WhatsAppWidget, OrbitalRing,
│       │                       LogoShimmer, ProcessFlow, SelectField, PerfHud, ShieldIcon
│       ├── contact/            ContactFormContext + Provider (state survives navigation)
│       ├── data/contact.ts     CONTACT_INTENTS + PROJECT_STAGES
│       ├── imports/            logo.webp (white), logo-full.png (silhouette),
│       │                       Allverze Logo Only.png (colour master)
│       ├── lib/                browser, contactNav, reveal, statusDot, constellations
│       ├── pages/              Home, About, Services, Contact
│       ├── theme/              ThemeContext, ThemeProvider, useThemeColors
│       └── types/contact.ts    form / payload / response shapes
│
├── server/                     Express 5 email API
│   ├── server.mjs              local + Docker entry (dotenv → config → app → listen)
│   ├── vercel.mjs              serverless entry (exports the app, no listen)
│   ├── vercel.json             @vercel/node build + catch-all route
│   ├── Dockerfile              node:22-alpine, production deps only
│   ├── .dockerignore           keeps .env out of the image
│   ├── eslint.config.js
│   ├── assets/email-logo.png   kept for a future hosted/CID email logo
│   └── src/
│       ├── app.js              helmet, cors, json limit, rate limit, routes, errors
│       ├── config.js           env → config object, fail-fast on missing secrets
│       ├── validation.js       field validation + normalisation
│       ├── routes/             health.js, contact.js
│       ├── services/           emailService.js (send orchestration, budget, retries)
│       ├── templates/          inbound.js, confirmation.js (HTML + text)
│       └── lib/                intents, leadRef, whatsapp, format, resend,
│                               submissionLog
│
└── logs/                       created at runtime, gitignored
    └── contact.jsonl           the submission audit log
```

---

## Getting started

### 1. Install

```bash
npm install
```

Installs both workspaces and links them. Run it from the repo root — running it inside `client/` or `server/` makes npm walk up and treat the folder as part of the monorepo.

### 2. Configure the environment

```bash
cp .env.example .env      # PowerShell: Copy-Item .env.example .env
```

Then fill in `SMTP_PASS` with your Resend API key. That is the **only** required value — `server/src/config.js` exits at startup without it. Everything else has a sensible default; see the [environment variables](#environment-variables) table.

The server reads `.env` from the **repo root**, which is why it must be started as `node server/server.mjs` from the root (the `npm run dev` / `npm run server` scripts already do this).

### 3. Run

**One terminal — both processes:**

```bash
npm run dev
```

Starts Vite on **http://localhost:5173** and the API on **http://localhost:3001**. Vite proxies `/api → http://localhost:3001`, so the browser only ever talks to `:5173` in development.

**Two terminals — separate logs:**

```bash
npm run dev:client      # Vite, :5173
npm run dev:server      # API, :3001
```

> **The API has no file watcher.** After editing anything in `server/`, restart the process (or stop and re-run `npm run dev`). Client edits hot-reload as usual.

---

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Vite (`:5173`) + API (`:3001`) together, with prefixed logs |
| `npm run dev:client` | Vite only |
| `npm run dev:server` | API only (`node server/server.mjs`) |
| `npm run build` | `tsc -b && vite build` in `client/` → `client/dist/` |
| `npm run preview` | Serve the production build — **on `:5173`**, see the note below |
| `npm run lint` | ESLint over `client/` **and** `server/`; must be 0 errors |
| `npm run server` / `npm start` | API only, same as `dev:server` |
| `npm run logs:contact` | Read/format `logs/contact.jsonl` (see [Submission log](#submission-log)) |

> `client/vite.config.ts` sets `preview: { port: 5173 }`, so `npm run preview` **collides with a running `npm run dev`**. Stop the dev server first, or change the preview port if you need both.

---

## Environment variables

All server variables are optional except `SMTP_PASS`. `VITE_*` variables are **inlined at build time**, so changing one requires a rebuild (and a new deploy on Cloudflare Pages).

### Backend

| Variable | Default | Notes |
|---|---|---|
| `SMTP_PASS` | — | **Required.** The Resend API key (`re_…`). The name is kept purely to avoid a dashboard change on the already-deployed host; the server exposes it internally as `resendApiKey`. |
| `SMTP_FROM` | `PUBLIC_EMAIL` → `hello@allverze.com` | `From` address; must be on the Resend-verified domain. |
| `CONTACT_EMAIL` | `hello@allverze.com` | Where lead notifications are delivered. |
| `PUBLIC_EMAIL` | `hello@allverze.com` | Branding address in email footers and (via the client) on the site. |
| `WHATSAPP_NUMBER` | `6281283812336` | Company WhatsApp used in the confirmation email's CTA. No `+`, country code first. |
| `FRONTEND_URL` | `http://localhost:5173` | **The CORS origin.** Must exactly match the browsing origin in production (`https://www.allverze.com`) — the API allows one origin only. |
| `PORT` | `3001` | Local/Docker only. Serverless hosts invoke the exported app and ignore it. |
| `TIMEZONE` | `Asia/Jakarta` | IANA zone used for email timestamps and the lead reference. |
| `TIMEZONE_LABEL` | `WIB` | Abbreviation shown next to the primary timestamp. |
| `CONTACT_LOG_PATH` | `logs/contact.jsonl` | Submission log location. Ignored on Vercel, where records go to stdout. |

**Retired, no longer read:** `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`. They existed only for the nodemailer handshake — safe to delete from any host.

### Frontend

| Variable | Default | Notes |
|---|---|---|
| `VITE_API_URL` | empty | Empty in development (the Vite proxy handles `/api`). Production: `https://api.allverze.com`. |
| `VITE_WHATSAPP_NUMBER` | `6281283812336` | Drives the floating widget and every WhatsApp deep link. |
| `VITE_PUBLIC_EMAIL` | `hello@allverze.com` | Address shown on the Contact page / footer. |

---

## API

Base URL: `http://localhost:3001` in development, `https://api.allverze.com` in production.

### `GET /api/health`

Always `200`, used by uptime monitors (Vercel has no platform healthcheck).

```json
{ "status": "ok" }
```

### `POST /api/contact`

`Content-Type: application/json`, body limited to **10 kb**.

**Request body**

| Field | Required | Notes |
|---|---|---|
| `name` | yes | Trimmed. |
| `email` | yes | Validated against an RFC-style pattern. |
| `phone` | yes | 7–20 characters of digits, spaces, `-`, `()`, optional leading `+`. |
| `message` | yes | Free text. The client prefixes it with `[Intent: <label>]\n\n`; the server strips that prefix before sending and logging. |
| `botcheck` | no | Honeypot. Any truthy value gets a fake `200` success and sends nothing. |
| `timezone` | no | IANA zone from the browser (`Europe/Paris`). Sanitised and validated; an invalid value is dropped, never rejected. |
| `stage` | no | Project stage, free text, capped at 80 characters. Deliberately **no server allowlist**, so stages can be renamed client-side without a server deploy. |
| `clickedAt` | no | Epoch ms of the "Send Message" click. Kept only within ±10 minutes of server time (used to measure click → both emails settled); otherwise dropped with a warning. |

**Success — `200`**

```json
{
  "success": true,
  "confirmation": "sent",
  "leadRef": "AVZ-CSW-261106-215953-d382795e849c63a6"
}
```

`confirmation` is one of:

| Value | Meaning |
|---|---|
| `sent` | The visitor's confirmation email was accepted by Resend before the response. |
| `failed` | The confirmation could not be sent. **The lead was still delivered**, so this is not an error. |
| `pending` | The lead was delivered, but the confirmation was still in flight when the 2.7 s budget ran out. It normally arrives a moment later. |
| `skipped` | Honeypot — no email was sent. |

`leadRef` format: `AVZ-{intentCode}-{YYMMDD}-{HHmmss}-{16 hex}`, timestamped in the configured `TIMEZONE`.

| Intent label | Code |
|---|---|
| Custom Software Engineering | `CSW` |
| Mobile Application Development | `MAD` |
| Application Performance Monitoring | `APM` |
| Performance & Automation Testing | `PAT` |
| Discovery & Advisory | `DAV` |
| Something else | `OTH` |
| _(no prefix)_ | `GEN` |

**Errors**

| Status | Body | Cause |
|---|---|---|
| `400` | `{ "success": false, "message": "Please provide a valid name, email address, phone number, and message." }` | Validation failed. |
| `429` | `{ "success": false, "message": "Too many requests. Please try again later." }` | More than 20 requests in 15 minutes from one IP. |
| `500` | `{ "success": false, "message": … }` | The **lead** email could not be sent. Deliberate: the visitor must not be told "sent" when no record exists. |

**Response headers.** `Server-Timing` reports the real cost of each phase:

```
Server-Timing: validate;dur=29, inbound;dur=1065, confirmation;dur=1037,
               confirm-wait;dur=12, overlap;dur=1038, total;dur=1108
```

`confirm-wait` is the part of the response spent waiting on the customer confirmation; `overlap` is the wall-clock time the concurrent dispatch saved.

### Response-time budget

The response waits for the **lead only**. The customer confirmation is bounded by a **2700 ms** wall-clock budget measured from the start of the request — past that the response returns with `confirmation: "pending"` and the send continues in the background (it is never cancelled).

The lead send is **never** capped: a slow response is recoverable, a silently lost lead is not. If the lead email fails, the API returns `500`.

### Security

Helmet security headers, a single-origin CORS allowlist (`FRONTEND_URL`), a 10 kb JSON body limit, the 20/15 min rate limit, honeypot detection, and HTML escaping of every user-supplied value inside the email templates.

---

## Submission log

Every submission event is appended to `logs/contact.jsonl` — one JSON object per line, with **`tag` as the first key**, so problems can be grepped without parsing:

```bash
# PowerShell
Select-String logs\contact.jsonl -Pattern '^\{"tag":"BOT"'
Select-String logs\contact.jsonl -Pattern '^\{"tag":"FAIL"'

# bash
grep '^{"tag":"BOT"' logs/contact.jsonl
```

**Timeline.** A normal submission writes three records:

1. `submission.received` — written **before** any email is sent, and the only record carrying the message body. A lead that never reaches Resend is therefore still on record.
2. `submission.response` — what the visitor actually waited on (`responseMs`, `clickedToResponseMs`, `slaMet`, per-send timings).
3. `submission.complete` — fires when **both** emails have settled. Can land after the response when the confirmation was deferred.

Record types for other outcomes: `submission.bot`, `submission.rejected`, `submission.throttled`, `submission.error`.

Records for one submission share an `id` (`sub_xxxxxxxx`) and, once minted, a `leadRef`.

**Tags**

| Tag | Level | Meaning |
|---|---|---|
| `OK` | info | Normal. |
| `BOT` | warn | Honeypot triggered. |
| `FAIL` | warn | Rejected input, or a confirmation that was never delivered. |
| `THROTTLED` | warn | Rate limit hit (logged by a custom limiter handler, because that middleware runs before the route). |
| `ERROR` | error | Unexpected exception. |

Every non-`OK` record also carries `problem: true` and a `reason`. The same records are mirrored to the console with a coloured `[TAG]` prefix.

**Reading it**

```bash
npm run logs:contact                   # last 20, rendered
npm run logs:contact -- --tail 5       # last 5
npm run logs:contact -- --all          # everything
npm run logs:contact -- --problems     # BOT + FAIL + ERROR + THROTTLED only
npm run logs:contact -- --bots         # honeypot hits only
npm run logs:contact -- --failures     # rejected submissions + hard errors
npm run logs:contact -- --json         # raw JSONL, no rendering
npm run logs:contact -- --path <file>  # a different log file
```

**Notes.** The file holds real customer data, so it is gitignored and rotates to a single `.1` file at **5 MB**. Logging is fire-and-forget and chained — it adds no latency to a response and never interleaves half-written lines. On Vercel the filesystem is read-only and background work can be frozen once the response returns, so the server emits the same JSON to **stdout** (the platform log stream) instead of attempting a file.

---

## Theming and brand

- Light/dark theme via `ThemeProvider`; stored under the `allverze-theme` key in `localStorage`, **default dark** (the base CSS is dark so there is no white flash before hydration). A global reduced-motion rule disables non-essential animation.
- Colours, spacing and typography must come from `client/src/theme/useThemeColors.ts` — pages should not hardcode palette values.
- Copy follows the brand canon: tagline **Connecting Possibilities**, slogan **We Solve — Not Just Sell**, philosophy **Better Every Day**, six core values. See `AGENTS.md` for the full record.

---

## Local preview via Cloudflare Tunnel

Share the dev server on a real phone without deploying.

1. **Terminal 1** — `npm run dev:client` (Vite, `:5173`)
2. **Terminal 2** — `npm run dev:server` (API, `:3001`)
   - or one terminal with `npm run dev`
3. **Terminal 3** — expose it (cloudflared lives at `C:\Program Files (x86)\cloudflared\cloudflared.exe`):

   ```bash
   cloudflared tunnel --url http://localhost:5173 run preview
   ```

   → live at `https://preview.allverze.com/`.

**Gotchas**

- `run` takes exactly **one** positional argument (the tunnel name) — `--url` must come **before** `run`.
- `code:1003` from `route dns` means the `preview.allverze.com` record already exists: delete it in the Cloudflare dashboard, or hand-edit the CNAME to `92555de8-6212-448c-af64-6b09a91e65d4.cfargotunnel.com`, then retry.
- Error `1033` (HTTP 530) means the hostname points at a tunnel with **no active connector** — make sure Terminal 3 is still running.
- `vite.config.ts` allows the `.allverze.com` host, so the tunnel hostname is accepted out of the box.

---

## Deployment

### 1. API — Vercel (Hobby)

1. **Add New → Project**, import this repository.
2. **Root Directory: `server`.** Framework preset **Other**; leave build/output/install commands blank. `server/vercel.json` builds `server/vercel.mjs` with `@vercel/node` and routes every path to it.
3. Add the environment variables: `SMTP_PASS` (mark **Sensitive** — the only required one), `SMTP_FROM`, `CONTACT_EMAIL`, `PUBLIC_EMAIL`, `WHATSAPP_NUMBER`, `FRONTEND_URL=https://www.allverze.com`, and optionally `TIMEZONE` / `TIMEZONE_LABEL`.
4. Deploy, then confirm `GET https://<deployment>/api/health` returns `{"status":"ok"}`.

Node is pinned to `22.x` via `engines`, and `server/package-lock.json` is committed so Vercel runs `npm ci` (reproducible) rather than resolving latest semver.

### 2. Site — Cloudflare Pages

1. Connect the repository.
2. **Root directory: `.`** (the repo root) — this is what makes Pages use the committed root `package-lock.json` and the npm workspaces. Pointing it at `client` would install without a lockfile and allow dependency drift.
3. Build command `npm run build`, output directory `client/dist`.
4. Add `NODE_VERSION=22`, `VITE_API_URL=https://api.allverze.com`, `VITE_WHATSAPP_NUMBER`, `VITE_PUBLIC_EMAIL`.
5. Custom domains: **`www.allverze.com` is the canonical primary**; attach `allverze.com` and let Pages redirect it to `www`. That redirect is what keeps CORS valid for visitors arriving on either hostname — `FRONTEND_URL` must match the canonical origin exactly.

### 3. DNS

`api.allverze.com` ← Cloudflare CNAME `api → cname.vercel-dns.com` (proxied is fine). Vercel issues the certificate automatically.

### Verifying after deploy

- Submit the form from **both** `allverze.com` and `www.allverze.com` (proves the CORS canonical).
- Check the lead notification and the confirmation both arrive in `hello@allverze.com` / the visitor's inbox.
- `GET https://api.allverze.com/api/health` → `200`.
- Theme toggle, WhatsApp widget and deep links.
- Add a free uptime monitor for `/api/health` — Vercel has no platform healthcheck.

### Docker / Railway (fallback, dormant)

`server/Dockerfile` builds a `node:22-alpine` image with production dependencies only; `railway.json` in the repo root points at it with a `/api/health` healthcheck and `npm start`. `server/.dockerignore` keeps `.env` out of the build context. This path is kept working but is not the current production host.

```bash
docker build -t allverze-api ./server
docker run --rm -p 3001:3001 --env-file .env allverze-api
```

---

## Linting, building, verifying

```bash
npm run lint     # ESLint over client + server — must be 0 errors
npm run build    # tsc -b && vite build → client/dist/
```

Both must pass before a deploy. `npm run build` is also the only real type check, since Vite does not type check during `dev`.

Manual smoke pass after a change to the contact flow:

1. Submit the form with a real address → success card, `leadRef` shown, both emails delivered.
2. `npm run logs:contact -- --tail 3` → `received`, `response`, `complete` for that submission.
3. Submit with `botcheck` filled (or any truthy value) → fake success, and `npm run logs:contact -- --bots` shows a `BOT` record.
4. Submit an invalid email → `400`, and `--failures` shows a `FAIL` record.

---

## Troubleshooting

| Symptom | Cause / fix |
|---|---|
| `npm run dev` starts but the form fails with "Unable to reach the server" | The API is not on `:3001`, or it exited at startup. Check the `[dev:server]` log — a missing `SMTP_PASS` aborts immediately. |
| Server changes have no effect | The API has **no watcher**. Restart it. |
| `npm run preview` refuses to bind | It uses `:5173` (from `vite.config.ts`), which `npm run dev` already holds. Stop dev first. |
| `EBADENGINE` warning on install | Local Node is newer than the pinned `22.x`. Harmless locally; Vercel and Docker use 22. |
| Contact form returns `500` | The lead email failed (bad Resend key, unverified domain, or Resend outage). Expected behaviour — never a silent success. |
| Confirmation never arrives | Check the log for `confirmation: "failed"`; `"pending"` means it was deferred by the budget and usually lands seconds later. |
| `npm install` inside `client/` or `server/` behaves oddly | npm walks up and detects the monorepo. Always install from the repo root. |
| Emails land in spam | Resend's shared IP reputation and domain age dominate; SPF/DKIM/DMARC are already live for `allverze.com`. |

---

## Notes

- `.env`, `logs/`, `dist/`, `node_modules/`, `design/` and `AGENTS.md` are gitignored. `AGENTS.md` is local-only session memory and is never committed.
- The logo assets: `logo.webp` is the white lockup used in the header and footer, `logo-full.png` is the full-size asset used for the 7% silhouette watermark, and `Allverze Logo Only.png` is the colour master. No vector source is tracked in this repo.
- Contact: **hello@allverze.com** — `contact`, `info`, `support` and `team` are aliases of that mailbox.
