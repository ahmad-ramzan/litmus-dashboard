# Litmus Platform

Full-stack shift-staffing marketplace. NestJS + Supabase backend, Next.js frontend.

## Structure

```
litmus/
├── api/          NestJS backend  (port 4000)
└── web/          Next.js frontend (port 3000)
```

## Quick Start

### 1. Run the Supabase SQL migration

Open your Supabase dashboard → SQL Editor → paste and run:
```
api/supabase/migrations/001_initial_schema.sql
```

### 2. Configure the backend

```bash
cd api
cp .env.example .env
# Edit .env with your Supabase credentials and JWT secrets
npm install
npm run start:dev

cd /Users/mac/Desktop/dashboard/litmus/api
npm run start:dev
```

### 3. Configure the frontend

```bash
cd web
cp .env.local.example .env.local
# NEXT_PUBLIC_API_URL=http://localhost:4000/api (already set)
npm install
npm run dev

cd /Users/mac/Desktop/dashboard/litmus/web
npm run dev -- --port 3000

```

Open http://localhost:3000

## API Endpoints

| Module | Endpoints |
|--------|-----------|
| Auth | POST /auth/login, /auth/refresh, /auth/logout, GET /auth/me |
| Users | GET/PATCH/DELETE /users/:id, POST /users/:id/ban|unban |
| Professionals | GET/PATCH /professionals/:id, POST /professionals/:id/verify |
| Businesses | GET/POST/PATCH/DELETE /businesses/:id, POST /businesses/:id/verify |
| Shifts | GET/POST/PATCH/DELETE /shifts/:id, POST /shifts/:id/accept|complete|cancel|boost |
| Verifications | GET/POST /verifications, PATCH /verifications/:id/approve|reject|request-more |
| Reviews | GET/POST /reviews, PATCH /reviews/:id/approve|reject, DELETE /reviews/:id |
| Admin | GET/POST/PATCH/DELETE /admin/:id |
| Dashboard | GET /dashboard/metrics|revenue-chart|activity|recent-shifts |

## Tech Stack

- **Backend**: NestJS 10, Supabase JS v2, Passport JWT, bcrypt, class-validator
- **Frontend**: Next.js 14 (App Router), Tailwind CSS, Recharts, SWR, Zustand
- **Database**: Supabase (PostgreSQL)
