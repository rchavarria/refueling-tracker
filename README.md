# Refueling Tracker

A full-stack TypeScript web application to track car fuel consumption, calculate L/100km and €/km statistics, and visualize consumption trends with charts. It also keeps maintenance records and reminders per vehicle.

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Chart.js, React Router v7, Zod
- **Backend**: Node.js, Express 5, TypeScript, Prisma ORM, SQLite, Zod, Vitest
- **DevOps**: Docker Compose, Biome (linting/formatting), shared Zod schemas

---

## Getting Started

### Prerequisites

- Node.js 22+
- npm 10+

### Local Development (without Docker)

```bash
# Install all dependencies
npm install

# Reset database, run migrations and seed
npm run db:reset

# Start backend (port 3003) and frontend (port 5173) concurrently
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

The Vite dev server proxies `/api` to `http://backend:3003`, which is the Docker service
name. When running outside Docker, point it at localhost:

```bash
VITE_API_TARGET=http://localhost:3003 npm run dev
```

### Run Tests

```bash
npm test
```

### Lint and Format

```bash
npm run lint       # report issues
npm run lint:fix   # apply safe fixes
```

---

## Docker

A single `docker-compose.yml` builds and runs both services. The backend listens on port
3003 and exposes `/api/health`, used as the healthcheck; the frontend waits until the
backend is healthy and serves the app on port 5173 through the Vite dev server. Both
services bind-mount `./backend`, `./frontend` and `./shared`, so the SQLite database in
`backend/prisma/prod.sqlite` persists on the host.

```bash
# Build and start all services
npm run docker:up

# Stop all services and remove images
npm run docker:down
```

Open [http://localhost:5173](http://localhost:5173).

`docker-compose.yml` also contains a commented-out `sqliteweb` service to browse the
database at [http://localhost:8080](http://localhost:8080). See `docs/database/sqliteweb.md`.

### Environment Variables

There is no `.env` file: values are set in `docker-compose.yml` and in the Dockerfiles.

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | Prisma SQLite connection string | `file:./prisma/prod.sqlite` |
| `NODE_ENV` | Runtime environment | `production` in Docker |
| `PORT` | Backend HTTP port | `3003` |
| `VITE_API_TARGET` | Proxy target of the Vite dev server | `http://backend:3003` |

---

## Project Structure

```
refueling-tracker/
├── backend/          # Express API, Prisma ORM, Vitest tests
├── frontend/         # React SPA, Tailwind CSS, Chart.js
├── shared/           # Zod schemas shared between frontend and backend
├── docs/             # Backlog, implementation plans and database notes
├── requests/         # .http files for manual API calls
├── docker-compose.yml
├── biome.json        # Linting and formatting configuration
└── AGENTS.md         # Conventions for AI coding agents
```

## Available Scripts

Run from the repository root:

| Script | Description |
|---|---|
| `npm run dev` | Start backend and frontend in development mode |
| `npm run dev:backend` | Start only the backend (`tsx watch`) |
| `npm run dev:frontend` | Start only the frontend (Vite) |
| `npm run build` | Build shared, backend and frontend |
| `npm test` | Run Vitest tests in shared and backend |
| `npm run db:seed` | Seed the database |
| `npm run db:reset` | Reset DB, run migrations and seed |
| `npm run lint` | Run Biome linter |
| `npm run lint:fix` | Fix linting issues automatically |
| `npm run format` | Format code with Biome |
| `npm run docker:up` | Build and start Docker Compose |
| `npm run docker:down` | Stop Docker Compose and remove images |

Backend-only scripts (`npm run <script> --workspace=backend`): `prisma:generate`,
`db:migrate`, `db:seed`, `db:reset`.
