# Healthcare AI App

A self-hostable healthcare data platform for secure document ingestion, structured medical data extraction, and AI-assisted health conversations.

## Vision

This project aims to provide:
- Secure upload and parsing of health documents (PDF/images)
- Structured extraction of medical test values
- Context-aware AI chat based on uploaded records
- Privacy-first local deployment option
- Optional cloud deployment with scalable background jobs

## Core Architecture (Target)

- **Frontend / App**: Next.js 15 + TypeScript (App Router)
- **Auth**: NextAuth credentials flow
- **Database**: PostgreSQL + Prisma ORM
- **Cache (optional)**: Redis
- **Document/Vision parsing**: OCR + vision model adapters
- **LLM providers**: Local Ollama and cloud providers (OpenAI/Anthropic/Gemini)
- **Background jobs (cloud mode)**: Trigger.dev

## Engineering Principles

- SOLID, GRASP, and 12-Factor principles
- Strong input validation and sanitization
- Structured logging and audit trails
- Secure secret management via environment variables
- High test coverage (unit tests for all core modules)

## Compliance & Security Targets

- OWASP Top 10 secure coding controls
- GDPR-aligned data handling
- PCI DSS principles for sensitive workflows
- ISO 27001 / SOC 2-oriented operational controls
- Auditability for critical events (auth, upload, data access, chat interactions)

## Planned Repository Structure

```text
Healthcare-AI-app/
├── docs/
├── messages/
├── prisma/
├── public/
│   └── uploads/
├── src/
│   ├── actions/
│   ├── app/
│   ├── components/
│   ├── context/
│   ├── hooks/
│   ├── lib/
│   │   ├── api/
│   │   ├── config/
│   │   ├── encryption/
│   │   ├── errors/
│   │   ├── health-data/
│   │   │   └── parser/
│   │   ├── logger/
│   │   └── redis/
│   ├── trigger/
│   ├── auth.ts
│   └── instrumentation.ts
├── docker-compose.yaml
├── Containerfile
└── vitest.config.ts
```

## Quickstart (Planned)

```bash
# 1) Install dependencies
npm install

# 2) Setup environment
cp .env.example .env

# 3) Start infra
docker compose up -d database redis docling-serve

# 4) Run DB setup
npx prisma db push
npx prisma generate

# 5) Start app
npm run dev
```

## Current Status

- [x] Repository created
- [x] Initial README scaffold
- [ ] App bootstrap
- [ ] Auth implementation
- [ ] DB schema and migrations
- [ ] Document parser pipeline
- [ ] Chat integration
- [ ] Test suite and CI pipelines

## Contribution

- Branch naming: `feat/*`, `fix/*`, `docs/*`, `test/*`, `refactor/*`, `chore/*`
- Commit style: Conventional Commits (`feat:`, `fix:`, etc.)
- Run validation before PR: `npm run validate`
