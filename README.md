# ✈️ Healthcare AI App

A security-first, production-oriented **Healthcare AI ingestion platform** built with modern full-stack architecture.

This project demonstrates how to build an AI-enabled health data workflow with:
- strong authentication and authorization
- structured audit trails
- secure upload + async parsing
- observability and rate limiting
- CI/CD quality gates
- clean modular architecture for long-term maintainability

> **Status:** MVP complete, production baseline hardened.

---

## 🌟 What We Accomplished

- ✅ Built secure auth flows (register/login) with validation and password hashing
- ✅ Implemented modular domain architecture (schema/repo/service/controller separation)
- ✅ Added health-data ingestion APIs with strict validation
- ✅ Added async parsing pipeline with Trigger.dev task orchestration
- ✅ Added status lifecycle: `PENDING → PARSING → COMPLETED/FAILED`
- ✅ Implemented structured audit logging with request correlation IDs
- ✅ Added Redis-backed distributed rate limiting (with in-memory fallback)
- ✅ Added secure API headers + CORS policies
- ✅ Added OpenAPI spec + Swagger docs
- ✅ Added unit + service + integration test scaffolding
- ✅ Added CI pipeline with typecheck, tests, build, Prisma validation
- ✅ Added secret scanning (Gitleaks) and dependency checks baseline
- ✅ Added Dockerfile and deployment-ready structure

---

## 🧱 Tech Stack

- **Framework:** Next.js (App Router, TypeScript)
- **DB:** PostgreSQL + Prisma ORM
- **Auth:** NextAuth (Credentials)
- **Async Jobs:** Trigger.dev
- **Cache / Rate Limit:** Redis (ioredis)
- **Validation:** Zod
- **Logging:** Pino (redaction enabled)
- **Testing:** Vitest
- **Docs:** OpenAPI + Swagger UI
- **CI:** GitHub Actions

---

## 📂 Project Structure

\`\`\`text
src/
  app/api/                     # Next.js route handlers (thin controllers)
  lib/                         # Shared infrastructure (db, logger, security, http, auth)
  modules/
    auth/                      # Auth domain (schema/repo/service)
    health-data/               # Health-data domain (schema/repo/service)
  trigger/                     # Background task handlers
tests/
  unit/                        # Unit tests (validation, services, utils)
  integration/                 # Integration tests (route-level)
prisma/
  schema.prisma
  migrations/
.github/workflows/
  ci.yml
\`\`\`

---

## 🔐 Security & Compliance Posture

This project follows security-first engineering principles aligned with:
- OWASP Top 10 mitigation baseline
- ISO 27001 / SOC2-oriented controls mindset
- GDPR/PCI-conscious data handling patterns

Implemented safeguards include:
- sensitive-field log redaction
- rate limiting on auth endpoints
- strong password rules and bcrypt hashing
- CORS restrictions via allowlist
- security headers (CSP, HSTS, X-Frame-Options, etc.)
- auditable event trails for auth/data operations

> ⚠️ **Important:** This is a reference implementation. Regulatory compliance in production requires legal, security, and infra validation specific to your organization.

---

## 🚀 Getting Started

## 1) Clone

\`\`\`bash
git clone https://github.com/<your-username>/Healthcare-AI-app.git
cd Healthcare-AI-app
\`\`\`

## 2) Install dependencies

\`\`\`bash
npm ci
\`\`\`

## 3) Configure environment

Create \`.env\` from \`.env.example\`:

\`\`\`bash
cp .env.example .env
\`\`\`

Set values safely (do **not** commit secrets).

## 4) Start local infrastructure

\`\`\`bash
docker compose up -d database redis
\`\`\`

## 5) Prisma setup

\`\`\`bash
npx prisma generate
npx prisma migrate dev
\`\`\`

## 6) Run app

\`\`\`bash
npm run dev
\`\`\`

App: \`http://localhost:3000\`

---

## ⚙️ Environment Variables

Use \`.env.example\` as template:

\`\`\`env
NODE_ENV=development
NEXTAUTH_URL=http://localhost:3000
AUTH_SECRET=replace_with_strong_secret

DATABASE_URL=postgresql://postgres:postgres@localhost:5432/healthcare_ai_app

REDIS_ENABLED=true
REDIS_URL=redis://localhost:6379

ALLOWED_ORIGINS=http://localhost:3000
LOG_LEVEL=info
\`\`\`

### 🔒 Secret Safety Rules
- Never commit \`.env\`
- Never hardcode API keys/tokens/passwords
- Rotate credentials before public release
- Use GitHub Secrets for CI and cloud secret manager in production

---

## 🧪 Quality Gates

\`\`\`bash
npm run typecheck
npm run test
npm run build
\`\`\`

Optional:
\`\`\`bash
npm run lint
npm audit --audit-level=high
\`\`\`

---

## 📘 API Documentation

- OpenAPI JSON: \`GET /api/openapi.json\`
- Swagger UI: \`GET /api/docs\`

---

## 🩺 Key API Endpoints

- \`GET /api/health\` — service health check
- \`POST /api/auth/register\` — register account
- \`POST /api/auth/login\` — login
- \`POST /api/health-data\` — upload data + queue parsing
- \`GET /api/health-data\` — list user records

---

## 🔄 Async Parsing Flow

1. User uploads health data
2. Record created in DB as \`PENDING\`
3. Trigger.dev task starts parsing (\`PARSING\`)
4. Parsed payload stored in JSON (\`COMPLETED\`)
5. Failures stored with \`FAILED\` + error message
6. Audit logs written for each critical transition

---

## 🧾 Auditability

Critical actions are logged with:
- action type
- resource/resourceId
- requestId correlation
- user context (when available)
- IP/user-agent metadata (when available)

This enables forensic tracing and operational observability.

---

## 🐳 Docker

Build:

\`\`\`bash
docker build -t healthcare-ai-app:latest .
\`\`\`

Run (example):

\`\`\`bash
docker run -p 3000:3000 --env-file .env healthcare-ai-app:latest
\`\`\`

---

## ✅ CI Pipeline

GitHub Actions CI performs:
- secret scan (Gitleaks)
- dependency install
- Prisma generate/migrate
- typecheck
- lint (if configured)
- tests
- production build

---

## 📸 Suggested Screenshots for GitHub Showcase

Add these images under \`docs/images/\` and reference them below:

1. \`docs/images/swagger-ui.png\` – Swagger docs page  
2. \`docs/images/ci-passing.png\` – successful GitHub Actions run  
3. \`docs/images/health-data-flow.png\` – record status transitions in UI/logs  
4. \`docs/images/audit-log-sample.png\` – audit trail sample (redacted)  

Example markdown usage:

\`\`\`markdown
![Swagger UI](docs/images/swagger-ui.png)
![CI Passing](docs/images/ci-passing.png)
\`\`\`

> Ensure screenshots contain **no personal data**, tokens, cookies, or internal URLs.

---

## 🤝 Contributing

1. Fork repository
2. Create feature branch:
   \`\`\`bash
   git checkout -b feat/your-feature-name
   \`\`\`
3. Commit using conventional commits:
   - \`feat: ...\`
   - \`fix: ...\`
   - \`refactor: ...\`
   - \`test: ...\`
   - \`docs: ...\`
4. Open PR with:
   - summary
   - security impact
   - test evidence
   - rollback notes (if applicable)

---

## 🛣️ Roadmap

- [ ] Replace parser stub with production OCR/LLM extraction pipeline
- [ ] Add role-based access control (RBAC)
- [ ] Add full route integration and e2e test coverage
- [ ] Add OpenTelemetry tracing + Sentry
- [ ] Add encrypted object storage for uploaded artifacts
- [ ] Add PHI redaction and data retention policies

---

## ⚠️ Disclaimer

This repository is for educational and engineering demonstration purposes.
It is **not** medical advice software.  
Do not process real patient data without full legal/compliance approval and secure infrastructure.

---

## 👨‍💻 Author

Built by **Haricharan** as a production-grade portfolio project focusing on secure AI backend architecture.
