# Docker To-Do App (learning project)

A small full-stack app that runs as three containers with Docker Compose:

| Service  | Tech                | Role                                   |
|----------|---------------------|----------------------------------------|
| frontend | Nginx + plain HTML  | Serves the UI, proxies `/api` to backend |
| backend  | Node.js + Express   | REST API for to-dos                    |
| db       | PostgreSQL 16       | Stores data in a named volume          |

## Run it

```bash
docker compose up --build
```

Then open http://localhost:8080

Stop it with `Ctrl+C`, or `docker compose down`.
Add `-v` to also delete the database volume: `docker compose down -v`.

## Project layout

```
todo-docker/
├── docker-compose.yml
├── .env                  # DB credentials (change the password!)
├── backend/
│   ├── Dockerfile        # multi-stage build
│   ├── .dockerignore
│   ├── package.json
│   └── server.js
└── frontend/
    ├── Dockerfile
    ├── nginx.conf
    └── index.html
```

## Docker concepts this covers

- **Dockerfile**: one per service; the backend uses a multi-stage build.
- **Compose**: starts all services with one command.
- **Network (`appnet`)**: containers reach each other by service name (`db`, `backend`).
- **Volume (`pgdata`)**: data survives container restarts.
- **Environment variables / `.env`**: config kept out of the code.
- **Healthcheck + `depends_on`**: backend waits until Postgres is ready.
- **Restart policy**: `unless-stopped`.
- **Reverse proxy**: Nginx forwards `/api/*` to the backend.

## Useful commands

```bash
docker compose ps              # running services
docker compose logs -f backend # follow backend logs
docker compose exec db psql -U todo_user -d tododb   # open a DB shell
docker compose build --no-cache
```

## Ideas to extend it

1. Push images to Docker Hub.
2. Add a GitHub Actions workflow that builds and pushes images.
3. Deploy on a free-tier cloud VM.
4. Swap the plain HTML frontend for React.
5. Add tests and run them in CI.

> For education only. Change the default password in `.env` before using it anywhere real.
