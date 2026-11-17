# Thesis Repository Search Engine

CSAPPD1 Final Project, University of Baguio, School of Information Technology.

A web app where students, thesis advisers and library admins can search, view, add, edit and delete thesis records, with a thesis status summary and a "needs review" flag.

## Team

- Andrada, Jim Magnus C.
- Gomez, December Rain
- Onos, Jezreel

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
backend/models/        Mongoose Thesis schema
backend/seeds/         seed script (10 sample theses)
server/src/server.js   Express server
server/src/routes/     /api/theses routes
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
   ```

   `.env` is git-ignored. Never commit it.

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

| Method | Endpoint | Success | Errors |
|---|---|---|---|
| GET | `/api/theses` | 200, list of theses | 500 |
| GET | `/api/theses/:id` | 200, one thesis | 400 (invalid id), 404, 500 |
| POST | `/api/theses` | 201, the new thesis | 400, 500 |
| PUT | `/api/theses/:id` | 200, the updated thesis | 400, 404, 500 |
| DELETE | `/api/theses/:id` | 200, confirmation message | 400 (invalid id), 404, 500 |
