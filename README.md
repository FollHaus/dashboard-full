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
- `NODE_ENV` – `development` enables model sync; `production` requires migrations.
- `DB_HOST` – database host (default `127.0.0.1`).
- `DB_PORT` – database port (default `5432`).
- `DB_DATABASE` – database name.
- `DB_USERNAME` – database user.
- `DB_PASSWORD` – database password.
- `JWT_SECRET` – secret key for signing JWT tokens.

### Database migrations

The backend uses **Sequelize CLI** for explicit migrations.

Generate a migration:

```bash
npm run db:migrate:generate --prefix server -- --name <migration-name>
```

Run migrations (required in production):

```bash
npm run db:migrate --prefix server
```

To undo the last migration:

```bash
npm run db:migrate:undo --prefix server
```

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

### Integration points

Each UI action results in a REST call:

| Module      | Frontend sends                               | Backend responds with            |
|-------------|----------------------------------------------|----------------------------------|
| Auth        | `POST /auth/login` `{ email, password }`     | user data + JWT tokens           |
| Products    | `GET/POST/PUT/DELETE /products`              | list of products / updated item  |
| Tasks       | `GET/POST/PUT/DELETE /task`                  | task entities                    |
| Reports     | `POST /reports/generate` report params       | generated report, history list   |

Errors returned by the API are converted to human readable messages inside
`app/api/interceptor.ts`. For example, a 401 response clears stored tokens so the
user can re-authenticate.

UI components update their state after successful requests. Examples:

```tsx
// delete a task and refresh table
await TaskService.delete(id)
setTasks(prev => prev.filter(t => t.id !== id))

// create product and reload list
await ProductService.create(data)
ProductService.getAll().then(setProducts)
```

Configuration values such as API base URL and allowed CORS origin are supplied
via `.env` files. Changing `NEXT_PUBLIC_API_URL` or `CLIENT_URL` is enough to point
the apps to a different backend or frontend without touching the code.
