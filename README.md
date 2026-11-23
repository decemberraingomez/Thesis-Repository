# Thesis Repository Search Engine

CSAPPD1 Final Project, University of Baguio, School of Information Technology.

A web app where students, thesis advisers and library admins can search, view, add, edit and delete thesis records, with a thesis status summary and a "needs review" flag.

## Team

- Andrada, Jim Magnus C.
- Gomez, December Rain
- Onos, Jezreel

## Roles and permissions

| Capability | Public User | Admin |
|---|---|---|
| View landing page and stakeholder lifecycle summary (FR7) | Yes | Yes |
| Browse, search, filter, and sort theses (FR3) | Yes | Yes |
| View full thesis details and metadata (FR3) | Yes | Yes |
| Use optional Crossref citation lookup | Yes | Yes |
| Create thesis records (FR2) | No, `401` | Yes |
| Edit/update thesis records (FR4) | No, `401` | Yes |
| Delete thesis records (FR5) | No, `401` | Yes |
| Login/logout and admin session controls | No | Yes |
| Change the admin password at runtime | No | Yes |

Public Users see a read-only interface. Create/Edit routes are protected by an Angular
functional guard, and every mutating API request is protected by the Express
`requireAdmin` middleware.

### Database-backed admin account

Administrators are stored in the MongoDB `AdminUser` collection with a per-user salt and
a `crypto.scrypt` password hash. The `.env` administrator values are a **one-time bootstrap
only**: on startup, if no `AdminUser` exists, the server seeds one from `ADMIN_EMAIL`,
`ADMIN_PASSWORD`, and `ADMIN_NAME`. If an administrator already exists, `.env` credentials
are ignored and MongoDB remains the only login source.

Bootstrap credentials come only from your local, git-ignored `.env`:

```
ADMIN_EMAIL=admin@example.edu
ADMIN_PASSWORD=replace-with-strong-bootstrap-password
ADMIN_NAME=Library Administrator
```

If `ADMIN_EMAIL` or `ADMIN_PASSWORD` is missing, the server skips the bootstrap seed and logs
a clear message instead of creating a default account. No working administrator credentials
are stored in this repository.

Admins can change their password at runtime from the navbar or through
`PUT /api/auth/password`. Changing the password increments the account's `tokenVersion`, so
every previously issued session token is rejected with `401` immediately. For institutional
turnover or a forgotten password, recover the account from the project root:

```bash
npm run admin:reset -- <email> <newPassword>
```

`AUTH_SECRET` is required and signs the HMAC-SHA256 session tokens; the API fails fast on
startup if it is missing or empty. Rotating it in `.env` or the deployment secret manager
immediately invalidates existing sessions.

## Tech stack

| Tier | Technology |
|---|---|
| Frontend | Angular (standalone components, signals, reactive forms, HttpClient) |
| Backend | Node.js + Express REST API |
| Database | MongoDB Atlas through Mongoose |

```
Angular (port 4200)  --HTTP/JSON-->  Express API (port 3000)  --Mongoose-->  MongoDB Atlas
```

## Project structure

```
src/app/models/        Thesis interface
src/app/services/      ThesisService (all HTTP calls)
src/app/pages/         page components
backend/models/        Mongoose Thesis and AdminUser schemas
backend/seeds/         seed script (10 sample theses)
server/src/auth/       token signing, scrypt password hashing, bootstrap seed
server/src/scripts/    admin password recovery CLI
server/src/server.js   Express server
server/src/routes/     /api/auth and /api/theses routes
```

## Getting started

Run every command from the **project root**, not from inside `server/`.

1. Install the packages:

   ```bash
   npm install
   ```

2. Create your environment file. Copy `.env.example` to `.env` and put your MongoDB Atlas connection string in it:

   ```
   MONGODB_URI=your-mongodb-atlas-connection-string
   PORT=3000
   ADMIN_EMAIL=admin@example.edu
   ADMIN_PASSWORD=replace-with-strong-bootstrap-password
   ADMIN_NAME=Library Administrator
   AUTH_SECRET=replace-with-a-strong-random-secret
   ```

   `.env` is git-ignored. Never commit it. Replace every placeholder with your own values;
   the admin values are used only for the one-time MongoDB bootstrap, and `AUTH_SECRET` is
   mandatory. After the first startup, manage the admin through the app or
   `npm run admin:reset -- <email> <newPassword>`.

3. (Optional) Load the 10 sample theses. **This deletes all existing theses first.**

   ```bash
   npm run seed
   ```

4. Start the API (restarts automatically when you save):

   ```bash
   npm run api:dev
   ```

   The API runs at `http://localhost:3000/api/theses`.

5. In a second terminal, start the Angular app:

   ```bash
   npx ng serve
   ```

   Open `http://localhost:4200/`.

## API endpoints

| Method | Endpoint | Access | Success | Errors |
|---|---|---|---|---|
| POST | `/api/auth/login` | Public | 200, token + admin profile | 401, 403 (disabled) |
| GET | `/api/auth/me` | Admin | 200, current DB admin profile | 401, 403 |
| PUT | `/api/auth/password` | Admin | 200, password updated in MongoDB | 400, 401, 403 |
| GET | `/api/theses` | Public | 200, list of theses | 500 |
| GET | `/api/theses/:id` | Public | 200, one thesis | 400 (invalid id), 404, 500 |
| POST | `/api/theses` | Admin | 201, the new thesis | 401, 403, 400, 500 |
| PUT | `/api/theses/:id` | Admin | 200, the updated thesis | 401, 403, 400, 404, 500 |
| PATCH | `/api/theses/:id` | Admin | 200, the updated thesis | 401, 403, 400, 404, 500 |
| DELETE | `/api/theses/:id` | Admin | 200, confirmation message | 401, 403, 400 (invalid id), 404, 500 |

Mutating requests must include `Authorization: Bearer <token>` from the login response.
