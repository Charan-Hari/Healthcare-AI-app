# Healthcare AI App

Secure healthcare ingestion and parsing platform (Next.js + Prisma + PostgreSQL + Redis + NextAuth + Trigger.dev).

## Quick Start

1. Copy env:
   cp .env.example .env

2. Start infra:
   docker compose up -d database redis

3. Prisma:
   npx prisma generate
   npx prisma db push

4. Run:
   npm run dev

Health check:
- GET /api/health

API docs:
- GET /api/openapi.json
- GET /api/docs

## Security Notes
- Structured logging with sensitive-field redaction
- Audit trail for auth/data access/upload flows
- Rate limiting (Redis-backed with in-memory fallback)
- Security headers + CORS enforcement

## Quality Gate
- npm run typecheck
- npm run lint
- npm run test
- npm run build

## Deployment
- Build image: docker build -t healthcare-ai-app:latest .
- Run container with production env variables and managed Postgres/Redis.

## Rollback
- Revert to previous stable commit:
  git log --oneline
  git checkout <stable_commit_sha>
- Or revert problematic commit:
  git revert <commit_sha>
