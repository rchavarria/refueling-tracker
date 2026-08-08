# SQLite Web

A lightweight, browser-based database browser and query editor for SQLite.

**Home page:** https://github.com/coleifer/sqlite-web
**Docker image:** https://hub.docker.com/r/coleifer/sqlite-web
**Author:** Charles Leifer (also the author of the `peewee` ORM)
**License:** MIT

---

## 1. What it is

`sqlite-web` is a Flask application that exposes a single SQLite database file
through a web UI. It is the SQLite equivalent of phpMyAdmin or Adminer, but
purpose-built for one engine, which makes it far simpler to run.

## 2. Running it

### 2.1 With Docker (recommended for this project)

Add the service to `docker-compose.yml`:

```yaml
  sqliteweb:
    image: coleifer/sqlite-web
    ports:
      - "8080:8080"
    volumes:
      - ./backend/prisma:/data
    command: sqlite_web -H 0.0.0.0 -x /data/prod.sqlite
    restart: unless-stopped
```

Start it:

```bash
docker compose up -d sqliteweb
```

Then open http://localhost:8080.

Mount the **directory**, never the individual `.sqlite` file. SQLite needs to
create `-wal` and `-shm` siblings next to the database, and a file-level bind
mount breaks as soon as the inode is replaced.

## 3. Security

`sqlite-web` has **no authentication by default** and grants full read/write
access, including `DROP TABLE` and downloading the database file. Treat it as a
local development tool.

If you must expose it beyond localhost:

```yaml
    environment:
      - SQLITE_WEB_PASSWORD=change-me
    command: sqlite_web -H 0.0.0.0 -x -P /data/prod.sqlite
```

For inspecting production snapshots, add `-r` so nothing can be modified:

```yaml
    command: sqlite_web -H 0.0.0.0 -x -r /data/prod.2026-07-02.sqlite
```

---

## 4. Notes for this project

- Database files live in `backend/prisma/`. The active production file is
  `prod.sqlite`; `dev.db` is the development database; the dated
  `prod.YYYY-MM-DD.sqlite` files are snapshots.
- The `backend` service uses the same file via `DATABASE_URL=file:./prisma/prod.sqlite`.
  Both containers reach the same inode through the host bind mount, so SQLite's
  locking behaves correctly — unlike accessing the file from Windows over the
  9P/`\\wsl.localhost` share.
- Schema changes belong in Prisma migrations under `backend/prisma/migrations/`.
  Editing the schema through `sqlite-web` will leave your migration history out
  of sync with the actual database.
- To point the tool at a different file, change the path in `command:` — the
  whole `prisma/` directory is already mounted at `/data`.