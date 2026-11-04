# Vercel deployment

Import this repository as one Vercel project. Keep the project Root Directory at
the repository root so Vercel reads `vercel.json` and builds both services.

## Services and public routing

- `frontend`: Vite in `frontend/`, serving `/` and all non-API paths.
- `backend`: Express in `backend/server.js`, serving `/api` and `/api/*`.
- The API prefix is preserved when requests reach Express.
- The frontend service falls back to `index.html` for SPA routes, including direct
  visits to `/login` and dashboard URLs. Existing assets use filesystem routing.
- No internal-only services or bindings are needed. Axios runs in the browser and
  requests public `/api` URLs. The static frontend has no runtime function that
  could consume a binding. Atlas is an external database, not a declared service.

## Environment variables

Set `MONGO_URI` (your Atlas connection string) and `JWT_SECRET` in Vercel for each
environment you deploy. Never prefix these secrets with `VITE_` or commit values.
Ensure Atlas permits connections from the deployment network.

`CLIENT_ORIGIN` is optional for clients on another origin. The deployed frontend
uses same-origin `/api` requests, so a cross-origin frontend URL is unnecessary.

## Local development

From the repository root, with the current Vercel CLI installed:

```sh
vercel dev
```

This runs both services with shared routing. Configure database and JWT variables
locally or through the linked Vercel project.

Alternatively, run `npm run dev` in `backend/` and `frontend/` in separate terminals.
Vite proxies `/api` to `http://localhost:5000`. If using a different backend port,
update the proxy target accordingly.

## Smoke checks

- `/` loads the landing page and its assets.
- Direct visits and refreshes on `/login` and dashboard paths load the SPA.
- `/api/health` returns JSON from Express.
- Login and a protected API request work with the configured Atlas database.
- Unknown `/api/*` paths return a backend response, not frontend HTML.
