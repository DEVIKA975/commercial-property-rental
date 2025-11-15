# Commercial Property Rental — Full Version

This is a full-stack starter for a commercial property rental platform.

## What's inside
- frontend/ — Vite + React + TypeScript + Tailwind CSS
- backend/ — Express + TypeScript + Prisma + PostgreSQL
- docker-compose.yml for local development
- GitHub Actions workflow for CI/CD
- Scripts for seeding and basic setup

## Quickstart (local)
1. Copy `.env.example` to `.env` and fill values.
2. Run: `docker compose up --build`
3. Enter backend container or run locally:
   - `npm install` (inside backend)
   - `npx prisma generate`
   - `npx prisma migrate dev --name init`
   - `npm run seed`
4. Open frontend: http://localhost:5173

