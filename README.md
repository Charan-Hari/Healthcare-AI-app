# Healthcare AI App

A secure, production-oriented healthcare data ingestion platform built with Next.js, Prisma, PostgreSQL, Redis, and Trigger.dev.

## Status
MVP complete with production baseline hardening.

## Key Features
- Secure registration and login with strict validation
- Password hashing with bcrypt
- Health record ingestion API with validation and queueing
- Async parsing lifecycle: PENDING, PARSING, COMPLETED, FAILED
- Structured audit logging with request IDs
- Redis-backed rate limiting (with fallback)
- Security headers and CORS allowlist
- OpenAPI spec and Swagger docs
- Unit and integration test scaffolding
- CI pipeline for typecheck, test, build

## Tech Stack
- Next.js (App Router, TypeScript)
- PostgreSQL + Prisma
- NextAuth (Credentials)
- Trigger.dev
- Redis (ioredis)
- Zod
- Pino
- Vitest
- OpenAPI + Swagger UI
- GitHub Actions

## Project Structure
- src/app/api/ (route handlers)
- src/lib/ (shared infra: auth, db, logging, security, http)
- src/modules/auth/ (schema, repo, service)
- src/modules/health-data/ (schema, repo, service)
- src/trigger/ (background jobs)
- tests/unit/
- tests/integration/
- prisma/
- .github/workflows/

## Security Practices
- Sensitive log redaction
- Audit logs for auth and data operations
- CORS allowlist
- Security headers (CSP, HSTS, X-Frame-Options, etc.)
- Request correlation with X-Request-Id
- Input validation and sanitization
- OWASP-aware secure coding baseline

Note: Full compliance (ISO 27001, SOC2, GDPR, PCI DSS) also requires organizational and infrastructure controls.

## Getting Started

1) Clone
git clone https://github.com/<your-username>/Healthcare-AI-app.git
cd Healthcare-AI-app

2) Install
npm ci

3) Configure env
cp .env.example .env

4) Start dependencies
docker compose up -d database redis

5) Prisma
npx prisma generate
npx prisma migrate dev

6) Run app
npm run dev

App URL:
http://localhost:3000

## Environment Variables (.env.example)

```env
NODE_ENV=development
NEXTAUTH_URL=http://localhost:3000
AUTH_SECRET=replace_with_strong_secret
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/healthcare_ai_app
REDIS_ENABLED=true
REDIS_URL=redis://localhost:6379
ALLOWED_ORIGINS=http://localhost:3000
LOG_LEVEL=info
```

## Secret Safety
- Never commit .env files
- Never hardcode keys or passwords
- Use GitHub Secrets in CI
- Use a secret manager in production

## API Documentation
- /api/openapi.json
- /api/docs

## Core Endpoints
- GET /api/health
- POST /api/auth/register
- POST /api/auth/login
- POST /api/health-data
- GET /api/health-data

## Quality Gates
npm run typecheck
npm run test
npm run build

Optional:
npm run lint
npm audit --audit-level=high

## Docker
Build:
docker build -t healthcare-ai-app:latest .

Run:
docker run -p 3000:3000 --env-file .env healthcare-ai-app:latest

## CI Pipeline
- Secret scan (Gitleaks)
- Install dependencies
- Prisma generate/migrate
- Typecheck
- Lint (if enabled)
- Test
- Build

## Contributing
- Create branch: git checkout -b feat/your-feature
- Use conventional commits: feat, fix, refactor, test, docs
- Open PR with summary, test evidence, and security impact

## Roadmap
- Production OCR/LLM parser
- RBAC
- Expanded integration/e2e tests
- OpenTelemetry/Sentry
- Encrypted object storage
- Data retention/redaction policies

## Disclaimer
This repository is for engineering demonstration and education.
Not medical advice software.
Do not process real patient data without full compliance and legal approval.

## Author
Haricharan
