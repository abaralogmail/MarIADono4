# Copilot Instructions for MarIADono Monorepo

> Keep this document concise (< ~50 lines). Add new discoveries as they appear in the codebase.

## 1. Repo Overview
- **Three workspaces**
  1. **Backend**: Node 18+ ESM (root). Multi-bot WhatsApp system (`app.js`) built with `@builderbot/bot` + Baileys/Meta providers. Uses Sequelize 6 over **SQLite** (file db, path defined in env `SQLITE_DB_PATH`).
  2. **React dashboard**: [Frontend_MarIADono](Frontend_MarIADono). Vite + React 19 + Tailwind.
  3. **Angular CRM prototype**: [Frontend_MarIADono_SQL](Frontend_MarIADono_SQL). Stand-alone components, Angular 21, `sql.js` in-browser DB.

## 2. Critical Rules
- **DO NOT alter database schemas** – enforced in `.cursorrules` + `AGENTS.md` (Angular project).
- Default language is **Spanish** for UI strings and docs.
- Maintain ESM imports; no `require()` in new files.
- Respect multi-bot port map **6001-6009** when adding endpoints.

## 3. Daily Commands
Backend (root):
```bash
pnpm dev          # lint + nodemon reload
pnpm start        # production run
pnpm test         # jest
pnpm codemod:cjs-to-esm  # automated CJS→ESM migration helpers
```
React UI:
```bash
cd Frontend_MarIADono && pnpm dev | build | preview
```
Angular CRM:
```bash
cd Frontend_MarIADono_SQL && pnpm start   # serves @ :4200 by default
```
Docker stack (bot + dashboard):
```bash
docker compose up -d   # exposes 3000, 4152 and 6001-6009
```

## 4. Key Folders / Patterns
- `src/flows/**/*.js` – finite-state flows; export **functions named `flowX()`** that BuilderBot auto-loads.
- `src/database/models/*.js` – Sequelize models; keep **snake_case table names** and **timestamps:false**.
- `src/services/*.js` – stateless singletons (instantiate once in `initServices.js`).
- `Frontend_MarIADono/src/components/**` – prefer functional components + hooks; global constants live in `constants.tsx`.
- `Frontend_MarIADono_SQL/src/services/db.service.ts` – single source of truth for in-browser SQLite; never migrate schema.

## 5. Integration Points
- **n8n** webhooks (`/webhook/:id/:token`) called from flows; env `N8N_*` controls credentials.
- **OpenAI/Ollama**: calls via `openai` SDK helpers in `src/ai/` (models, embeddings, etc.).
- **Express web UI** at `/dashboard` served by `WebServerService`; static assets in `src/public`.

## 6. Testing & Linting
- Jest tests live in `tests/**`. Keep each test file alongside source when possible.
- ESLint config: shared root `.eslintrc.js` + `eslint-plugin-bot-whatsapp`. Run `pnpm prestart` or `pnpm lint` before pushing.

## 7. Contributing Tips
- Follow existing **`SqliteManager`** wrapper when adding new tables/metrics.
- When a change touches multiple bots, update `config/botConfigManager.js` once – flows read from there at runtime.
- Add React UI routes via `vite-plugin-pages` (auto-imports) and Angular routes in `app.routes.ts` (stand-alone).

---

