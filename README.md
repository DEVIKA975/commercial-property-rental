# Commercial Property Rental — Full Stack Boilerplate

This repository contains a minimal but functional full-stack boilerplate for a commercial property rental platform (React + Vite frontend, Node + Express backend, PostgreSQL via Prisma, Docker Compose).

## What is included
- `frontend/` — Vite + React + TypeScript app (minimal pages)
- `backend/` — Express + TypeScript backend with Prisma schema and basic routes
- `docker-compose.yml` — DB + backend + frontend for local development
- `.env.example` — env variables
- `README` with quickstart instructions

## Quickstart (local)
1. Copy `.env.example` to `.env` and fill values.
2. Start containers:
   ```bash
   docker compose up --build
   ```
3. Inside the backend container or locally, run:
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   npm run seed
   ```
4. Frontend: http://localhost:5173
   Backend API: http://localhost:4000/api

This is a starter. Customize routes, styles, and integrations (Cloudinary, S3, etc.) as needed.
