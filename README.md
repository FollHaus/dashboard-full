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

### Example integration

Frontend services in `dashboard-ui/app/services/*` call the backend with Axios.
Each method corresponds to a REST endpoint and returns data or throws an error
that UI components can handle.

```ts
// login example
AuthService.login(email, password)
  .then(data => setUser(data.user))
  .catch(err => setError(err.message))

// fetch products
ProductService.getAll().then(setProducts)
```

See the service files for full CRUD examples:

- `auth` – `POST /auth/login`, `POST /auth/register`.
- `products` – `GET /products`, `POST /products`, `PUT /products/:id`, `DELETE /products/:id`.
- `task` – `GET /task`, `POST /task`, `PUT /task/:id`, `DELETE /task/:id`.
- `reports` – `POST /reports/generate`, `GET /reports/history`, `GET /reports/:id/export/:format`.

Because CORS is enabled in the backend (`server/src/main.ts`), the frontend can
access the API at `NEXT_PUBLIC_API_URL` without cross-origin issues.

The root `npm run dev` command launches both the NestJS server and the Next.js
frontend in watch mode for development.
