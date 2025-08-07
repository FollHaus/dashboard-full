# Dashboard Full

Monorepo containing:
- `dashboard-ui` – Next.js frontend
- `server` – NestJS backend

## Development

1. Copy `.env.example` files to `.env` and adjust values.
2. Install dependencies in all packages (run `npm install` in repository root).
3. Start both apps together:

```bash
npm run dev
```

This runs `server` in watch mode and `dashboard-ui` with `next dev` using `concurrently`.

## Environment variables

Frontend (`dashboard-ui/.env`):
- `NEXT_PUBLIC_API_URL` – base URL of the backend (e.g. `http://localhost:4000`).

Backend (`server/.env`):
- `CLIENT_URL` – allowed origin for CORS (e.g. `http://localhost:3000`).
- `DATABASE_URL` – connection string to PostgreSQL.
- `JWT_SECRET` – secret key for signing JWT tokens.

## API

Main modules exposed by the server:
- `auth` – login/register endpoints.
- `products` – warehouse management (CRUD and stock updates).
- `task` – task management.
- `reports` – generating and exporting reports.

The frontend services in `dashboard-ui/app/services/*` use Axios to interact with these endpoints.
