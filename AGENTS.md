# AGENTS.md

Guidance for AI coding agents working on **refueling-tracker**, a full-stack TypeScript
application to track car fuel consumption, maintenances and reminders.

## Project layout

npm workspaces monorepo:

| Workspace   | Purpose                                                              |
| ----------- | -------------------------------------------------------------------- |
| `shared/`   | Zod schemas and types shared by frontend and backend                  |
| `backend/`  | Express 5 API, Prisma ORM over SQLite, Vitest tests                   |
| `frontend/` | React 19 SPA, Vite, Tailwind CSS v4, Chart.js, React Router v7        |

Supporting folders: `docs/plans` (implementation plans), `docs/backlog.md` (pending and
completed work), `requests/` (`.http` files for manual API calls), `tmp/data` (sample CSV data).

## Commands

Always run scripts from the repository root:

```bash
npm run dev        # backend (3003) + frontend (5173)
npm run lint       # Biome check
npm run lint:fix   # Biome check --write
npm run build      # builds shared, then backend, then frontend
npm test           # Vitest suites in shared and backend
npm run db:reset   # reset SQLite DB, run migrations and seed
```

Before finishing a task, run the verification commands in this order:

1. `npm run lint` — no new lint errors may be introduced
2. `npm run build` — must compile all three workspaces
3. `npm test` — all suites must pass

## Architecture rules

- **`shared` is the single source of truth for contracts.** Define Zod schemas there and
  import them from both sides. Do not duplicate types.
- **Backend layering**: `routes/` wires endpoints, `controllers/` parses input and shapes
  responses, `services/` holds pure business logic, `lib/` holds the Prisma client and
  helpers. Keep calculation logic in `services/` so it can be unit tested without a database.
- **Prisma client is generated** into `backend/src/generated/prisma`. Never edit it by hand;
  run `npm run prisma:generate --workspace=backend` after changing `schema.prisma`.
- **Schema changes require a migration** in `backend/prisma/migrations` via
  `npm run db:migrate --workspace=backend`.
- **Validate every request body** with the shared Zod schema and return `400` with
  `error: parsed.error.flatten().fieldErrors` on failure.
- **`currentMileage` is derived**, not stored: it is the maximum refueling mileage of a
  vehicle. Use `enrichVehicleWithMileage` from `backend/src/lib/vehicles.ts`.
- **Frontend API calls** live in `frontend/src/api/`; components must not call `fetch` directly.

## Code style

- Biome enforces the style: 2-space indentation, double quotes, semicolons, 100-column lines,
  CRLF endings. Run `npm run lint:fix` instead of hand-formatting.
- TypeScript strict mode. Avoid `any`; if unavoidable, add a `biome-ignore` comment with a reason.
- Prefer explicit, descriptive names, and document exported functions with a short JSDoc.
- Every `<label>` needs `htmlFor` matching the control `id`.

## Testing

- Vitest with `environment: "node"`. Tests live next to the code as `*.test.ts`.
- Mock Prisma with `vi.mock("../lib/prisma.js", ...)` rather than hitting a real database.
- Freeze time with `vi.useFakeTimers()` and `vi.setSystemTime()` for any date-dependent logic.
- Add regression tests for every bug fix.

## Workflow conventions

- Non-trivial features and bug fixes get a plan in `docs/plans/plan-YYYY-MM-DD-<slug>.prompt.md`,
  written in English, stating **why** the change is made, the decision taken, rejected
  alternatives, and what is out of scope.
- `docs/backlog.md` holds pending items at the top and a dated "Already implemented" list below.
  Move entries there when the work is done.
- Documentation, code, comments and commit messages are written in English.

## Gotchas

- Dates are stored as `DateTime` but exchanged as `YYYY-MM-DD` strings; convert explicitly
  and be careful with time zones when comparing against "today".
- Prisma date filters apply to the record's own field, not to the current date — an
  overly narrow window silently hides records.
- Vitest also picks up compiled tests under `dist/`; a stale `dist/` may run outdated copies.
- The Docker production entrypoint runs `prisma migrate deploy` and `prisma db seed` on every
  start, which resets the database.

