# Refueling Tracker

A full-stack TypeScript web application to track car fuel consumption, calculate L/100km and €/km statistics, and visualize consumption trends with charts.

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
npm run db:reset --workspace=backend

# Start backend (port 3000) and frontend (port 5173) concurrently
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Run Tests

```bash
npm test
```

---

## Docker

### Production

Builds optimised multi-stage images. The frontend is served by nginx on port 5173 (mapped to internal port 80). The backend runs on port 3000. The SQLite database is persisted in a named Docker volume.

```bash
# Build and start all services
npm run docker:up -- --build

# Stop all services
npm run docker:down
```

Open [http://localhost:5173](http://localhost:5173).

**Note**: On every container start, the backend runs `prisma migrate deploy` and `prisma db seed`, which resets the database to the seed data.

### Development (with hot reload)

Uses bind mounts so changes to source files are reflected immediately without rebuilding images. The Vite dev server proxies `/api` requests to the backend container.

```bash
npm run docker:dev
```

Open [http://localhost:5173](http://localhost:5173). Both `tsx watch` (backend) and `vite` (frontend) reload automatically on file changes.

### Environment Variables

Copy `.env.example` and adjust as needed:

```bash
cp .env.example .env
```

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | Prisma SQLite connection string | `file:./prisma/dev.db` |
| `NODE_ENV` | Runtime environment | `development` |
| `PORT` | Backend HTTP port | `3000` |
| `VITE_API_URL` | Backend URL baked into the frontend bundle (production) | `http://localhost:3000` |
| `VITE_API_TARGET` | Proxy target for Vite dev server (dev Docker only) | `http://backend:3000` |

---

## Project Structure

```
refueling-tracker/
├── backend/          # Express API, Prisma ORM, Vitest tests
├── frontend/         # React SPA, Tailwind CSS, Chart.js
├── shared/           # Zod schemas shared between frontend and backend
├── docker-compose.yml        # Production setup
├── docker-compose.dev.yml    # Development setup with hot reload
└── biome.json        # Linting and formatting configuration
```

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start backend and frontend in development mode |
| `npm run build` | Build all packages |
| `npm test` | Run backend Vitest tests |
| `npm run db:reset` | Reset DB, run migrations and seed |
| `npm run docker:build` | Build Docker images |
| `npm run docker:up` | Start production Docker Compose |
| `npm run docker:down` | Stop Docker Compose |
| `npm run docker:dev` | Start development Docker Compose with hot reload |
| `npm run lint` | Run Biome linter |
| `npm run lint:fix` | Fix linting issues automatically |
| `npm run format` | Format code with Biome |
