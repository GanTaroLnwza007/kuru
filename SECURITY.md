# Security Policy

## Supported Versions

KUru is currently in active development. Security fixes are applied to the **latest commit on `main`** only.

| Version | Supported |
|---------|-----------|
| `main` (latest) | ✅ |
| Older commits | ❌ |

## Reporting a Vulnerability

**Please do not open a public GitHub issue for security vulnerabilities.**

Report vulnerabilities privately via **GitHub's private vulnerability reporting**:

1. Go to the [Security tab](../../security) of this repository.
2. Click **"Report a vulnerability"**.
3. Fill in the details — include steps to reproduce, impact, and any suggested fix.

We aim to acknowledge reports within **48 hours** and provide a resolution timeline within **7 days**.

## Scope

The following are in scope for security reports:

- **Backend API** (`backend/`) — FastAPI endpoints, authentication, Supabase RLS bypass, prompt injection
- **Frontend** (`frontend/`) — XSS, CSRF, insecure data exposure, auth token leakage
- **Data pipeline** (`scripts/`) — Neo4j injection, embedding pipeline data poisoning
- **CI/CD** (`.github/workflows/`) — workflow injection, secret exposure

The following are **out of scope**:

- Vulnerabilities in third-party services (Supabase, Google Gemini, Neo4j Aura) — report those to the respective vendors
- Theoretical vulnerabilities without a working proof-of-concept
- Issues in branches other than `main`

## Security Practices

- All user data writes require a valid **Supabase JWT**; Row-Level Security (RLS) is enabled on every table.
- Secrets (API keys, DB credentials) are stored in **GitHub Actions secrets** and **never committed**.
- The Neo4j graph database is **read-only at runtime** — only the offline admin pipeline writes to it.
- Dependencies are monitored via **Dependabot** and **GitHub secret scanning**.
- Code is scanned on every PR with **CodeQL** (JavaScript/TypeScript + Python).

## Disclosure Policy

We follow **coordinated disclosure**. Once a fix is merged to `main`, we will publish a brief advisory in the repository's Security Advisories section.
