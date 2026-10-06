# Eventide: Event Management System (EMS)

MERN web app: hosts create and track events; attendees discover, register and review them.
Auth data in **SQLite**, application data in **MongoDB**, sessions via **JWT**. Payments are **simulated**.

Docs: SRS, SAD, STP (see `/docs`). Traceability: `docs/RTM.md`. Decisions: `docs/adr/`.

## Prerequisites
- Node.js 18+ (`node -v`)
- MongoDB running locally (`mongodb://127.0.0.1:27017`) **or** a free MongoDB Atlas URI

## Run (two terminals)
**Terminal 1: API**
```bash
cd backend
cp .env.example .env        # then edit JWT_SECRET (see comment inside the file)
npm install
npm run dev                 # http://localhost:5000/api/health
```
**Terminal 2: UI**
```bash
cd frontend
npm install
npm run dev                 # http://localhost:5173
```

## Tests
```bash
cd backend && npm test
```

## Project layout
```
backend/   Express API (routes -> services -> models), SQLite auth, Mongo app data
frontend/  React (Vite) SPA
docs/      ADRs, RTM, test reports
```

## Workflow
Branch per requirement (`feature/EMS-FR-xx-...`), Conventional Commits, PR with review, squash-merge to `main`.
See `.github/PULL_REQUEST_TEMPLATE.md`.
