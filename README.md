# Inkwell — customizable invoice generator

A browser-based invoicing app for a small business. Fill in the form, watch the invoice come together in a live preview, then save it, print it to PDF or email it to the client.

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · SQLite via libSQL + Drizzle · Zod · React Hook Form · Resend / Nodemailer

## Quick start

Requires Node.js 22.12+.

```bash
npm install
npm run dev        # runs migrations, then serves http://localhost:3000
npm run db:seed    # optional: adds three fictional invoices
```

No accounts or API keys are needed locally. The database is a file in `data/`, and emails go to a free Ethereal test inbox; the app links to each captured message.

## What it does

- **Invoice editor** — business and client details, invoice number, issue and due dates (with 7/14/30-day shortcuts), notes, and line items you can add, edit and remove.
- **USD totals** — line totals, subtotal, fixed discount, percentage tax and grand total, all in integer cents.
- **Custom fields** — add, edit, show/hide and remove. Hidden fields are saved for you but never appear on the invoice, the PDF or the email.
- **Live preview** — updates as you type; side by side on desktop, an Edit/Preview switch on phones.
- **Print / Save as PDF** — print styles output only the invoice, and the suggested file name is the invoice number and client.
- **Save and reload** — a new invoice gets its permanent URL on first save; the next invoice suggests the following number and reuses your business details.
- **Email** — sends the full invoice as HTML plus plain text, with replies going to the business email.
- **Accent colour** — six curated colours, each passing WCAG AA contrast.

Shortcuts: `⌘S` / `Ctrl+S` saves; `Enter` in the last unit price adds a line.

## Environment variables

All optional locally — copy `.env.example` to `.env` to change them.

| Variable              | Default                  | Purpose                                                 |
| --------------------- | ------------------------ | ------------------------------------------------------- |
| `DATABASE_URL`        | `file:./data/inkwell.db` | Local file, or a `libsql://` URL for Turso              |
| `DATABASE_AUTH_TOKEN` | —                        | Turso token (remote database only)                      |
| `EMAIL_PROVIDER`      | `ethereal`               | `ethereal` (test inbox) or `resend` (real delivery)     |
| `RESEND_API_KEY`      | —                        | Required when `EMAIL_PROVIDER=resend`                   |
| `EMAIL_FROM_ADDRESS`  | `onboarding@resend.dev`  | Sender address used with Resend                         |
| `SITE_URL`            | `http://localhost:3000`  | Absolute URL for metadata, `robots.txt` and the sitemap |

Credentials are only read on the server (`src/server/config.ts`, guarded by `server-only`) and validated on first use, so a misconfigured key fails with a readable error in the server log.

## Email setup

**Default: Ethereal, no signup.** On the first send the server creates a throwaway Ethereal SMTP account. Nothing is delivered; the success message links to the captured email.

**Real delivery: Resend.**

1. Create a free account at [resend.com](https://resend.com) and an API key.
2. In `.env`, set `EMAIL_PROVIDER=resend` and `RESEND_API_KEY=re_…`.
3. Without a verified domain, Resend only delivers from `onboarding@resend.dev` to the address you signed up with, so send test invoices there.

**Why Resend:** a free tier with no credit card, an HTTP API with an official TypeScript SDK, and you can send a real test email with just an API key — no sender or domain verification. Because it's HTTP rather than SMTP, it also works on hosts that block outbound SMTP. Ethereal stays the default so anyone can try sending without an account. Both sit behind a one-method `EmailProvider` interface, so adding another provider is one file.

## Storage

SQLite through [libSQL](https://github.com/tursodatabase/libsql), with Drizzle as the typed query layer. There are three tables — `invoices`, `invoice_line_items` and `invoice_custom_fields` — with cascade deletes and a case-insensitive unique index on the invoice number. Money is stored as integer cents, and totals are stored as calculated at save time.

Migrations live in `drizzle/` and run before `npm run dev` and `npm start` (or by hand with `npm run db:migrate`).

**Why SQLite / libSQL:**

|                            | SQLite / libSQL (chosen)          | Postgres (Neon, Supabase) | MongoDB Atlas               |
| -------------------------- | --------------------------------- | ------------------------- | --------------------------- |
| Setup to run locally       | None — a file                     | Account or Docker         | Account                     |
| Invoice → items, fields    | Relational, foreign keys          | Relational, foreign keys  | Embedded docs, fewer checks |
| Unique number, atomic save | Unique index, transactional batch | Same                      | Unique index, transactions  |
| Hosting                    | Turso, same driver                | Native                    | Native                      |
| Write concurrency          | Single writer                     | High                      | High                        |

A small business writes a handful of invoices a day, so write concurrency doesn't matter here. What does matter is that the project runs with `npm install && npm run dev`, invoice numbers stay unique, and an invoice saves atomically with its line items. libSQL covers all three locally, and the same code runs against Turso's hosted free tier by changing `DATABASE_URL`. If the app grows into many users or reporting, the Drizzle schema moves to Postgres with mostly mechanical changes.

**Deploying:** serverless hosts don't keep local files, so use a Turso database (`DATABASE_URL=libsql://…` plus `DATABASE_AUTH_TOKEN`) and set `SITE_URL`.

## Why there is no separate backend

The API is six endpoints over one database and one email provider. Next.js Route Handlers run on Node, keep secrets on the server, and let Server Components read through the same service layer without an HTTP round trip. A separate Fastify or Nest service would have added a second process, CORS or a proxy, a shared-types package and a second deployment — roughly 40 minutes of a 3-hour budget for no user-facing gain.

The backend is still its own layer. `src/server` has its own handlers, service, repository, DTO validation and error classes, and only the thin route and page adapters import Next.js. Splitting it into a standalone service later means moving folders, not rewriting logic.

## Project structure

```
src/
├── app/                   Routes only: pages and thin API route files
│   ├── page.tsx           Landing page (static, indexable)
│   ├── invoices/          List, new and edit pages (noindex)
│   └── api/invoices/      REST endpoints → server handlers
├── server/                Backend, server-only
│   ├── invoices/          handlers/ (one per endpoint), service, repository, mapper
│   ├── email/             Provider interface, Resend and Ethereal adapters, email template
│   ├── errors/            AppError plus one file per error type
│   ├── http/              Route wrapper, JSON body validation, error → response
│   ├── db/                Drizzle schema, client, seed
│   └── config.ts          Validated environment variables
├── shared/                Runs in both browser and server
│   ├── dto/               Zod request schemas and response types
│   └── invoice/           Totals maths, limits, accent colours, client-facing document
├── features/              Invoice editor, invoice sheet, invoice list
└── components/            Design-system primitives
```

### API

| Method   | Path                     | Result                              |
| -------- | ------------------------ | ----------------------------------- |
| `GET`    | `/api/invoices`          | Invoice summaries, newest first     |
| `POST`   | `/api/invoices`          | Create → `201`                      |
| `GET`    | `/api/invoices/:id`      | One invoice                         |
| `PUT`    | `/api/invoices/:id`      | Replace                             |
| `DELETE` | `/api/invoices/:id`      | Delete → `204`                      |
| `POST`   | `/api/invoices/:id/send` | Email it → `{ sentAt, previewUrl }` |

Every error has the same shape: `{ "error": { "code", "message", "fieldErrors": [{ "path", "message" }] } }`. The status is `400` for invalid input, `404` for a missing invoice, `409` for a duplicate number and `502` when the email provider fails. Anything unexpected returns a generic `500`; the details are logged on the server and never sent to the client. The editor puts each `fieldErrors` entry back on its input.

## Decisions

- **One schema validates both sides.** The same Zod DTO checks the form in the browser and the request body on the server. The form keeps values in the API's shape (cents, not strings), so server errors land on the matching field.
- **Money is integer cents end to end.** Each line is rounded half-up to the cent, the lines are summed, the discount comes off, then tax is calculated and rounded once — the order in the brief. BigInt holds the intermediate products, so large quantities can't drift. The brief's check (2 × $50 − $10 + 10% = $99.00) is a unit test.
- **The server recalculates totals.** Totals from the browser are only for display. What gets stored and emailed is calculated by the server, using the same code.
- **One model for everything the client sees.** The preview, the print view and the email all render from `toInvoiceDocument()`, the one place hidden custom fields are filtered out.
- **A discount over the subtotal is capped in the preview and rejected on save.** The preview stays coherent at $0.00 while the field shows the error and saving is blocked.
- **Validation that explains the fix.** Errors appear once you leave a field and say what to change ("Discount can't exceed the $100.00 subtotal"). A failed save moves focus to the first problem. Negative numbers get a specific message instead of being silently stripped.
- **SEO only where it belongs.** The landing page is prerendered with full metadata, a sitemap and `robots.txt`. Invoice pages hold client data, so they are `noindex` and disallowed in `robots.txt`.
- **Accessibility.** Every input has a visible label, errors are linked to their inputs with `aria-describedby`, and focus rings are always visible. Dialogs use native `<dialog>`, which traps focus and closes on Escape. There's a skip link, inputs and primary buttons are 44px tall on phones, and the colour palette meets WCAG AA contrast.

## Scripts

| Command                              | What it does                                               |
| ------------------------------------ | ---------------------------------------------------------- |
| `npm run dev`                        | Migrate, then start the dev server                         |
| `npm run build` / `npm start`        | Production build / serve (`start` migrates first)          |
| `npm test`                           | Vitest: totals maths, validation, service and API routes   |
| `npm run lint` / `npm run typecheck` | ESLint / TypeScript                                        |
| `npm run db:seed`                    | Add the sample invoices to an empty database               |
| `npm run db:generate`                | Create a migration after editing `src/server/db/schema.ts` |

## Not done yet, and why

Scoped to about three hours, so these were consciously left out:

- **PDF attachment on emails.** It needs server-side rendering — headless Chrome, or a second PDF template that would drift from the preview. The email carries the full invoice as HTML, and Print → Save as PDF covers downloads.
- **Authentication and multiple businesses.** Not required by the brief. Every invoice belongs to the one business using the app.
- **Paid and overdue status.** "Sent" is recorded, but without tracking payments an "overdue" badge would be wrong, so there isn't one.
- **Logo upload.** It needs file storage and image validation. A monogram in the accent colour stands in.
- **Reordering line items, duplicating invoices, search and pagination.** These start to matter once there are many invoices.
- **Rate limiting on sending.** Email quotas are finite. Before going public I'd add a shared limiter (e.g. Upstash Redis); an in-memory one doesn't hold up on serverless.
- **Simultaneous edits of one invoice.** The last save wins; an `updatedAt` precondition would turn this into a `409`.
- **Browser tests in CI.** The main flows were checked in a real browser during development, but those scripts aren't in the repo yet.

## AI tools used

Claude Code (Anthropic) helped with scaffolding, drafting components and tests, and checking layouts in a headless browser. All code was reviewed and run locally.

## Time spent

About 3 hours:

| Part                                     | Time   |
| ---------------------------------------- | ------ |
| Planning, stack choice and data model    | 15 min |
| Totals maths, DTOs and their tests       | 25 min |
| API, database, errors and email          | 45 min |
| Editor, live preview and validation      | 60 min |
| Print, responsive and accessibility pass | 20 min |
| README                                   | 15 min |

All business names, people, email addresses and amounts in the app and seed data are fictional.
