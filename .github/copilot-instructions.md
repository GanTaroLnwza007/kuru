# KUru — global Copilot instructions

You are working on **KUru**, an AI-powered PLO-to-career navigator for Thai Grade 12 (M6) students exploring Kasetsart University programs. This is a senior project.

## Always read before acting

Before generating any code or plan, load the relevant context files:

- Architecture and tech stack → `specs/context/architecture.md`
- SkillCluster definitions (SC-01–SC-12) → `specs/context/skill-clusters.md`
- RIASEC test logic and scoring → `specs/context/riasec-logic.md`
- Database schema (Supabase + Neo4j) → `specs/context/data-schema.md`
- RAG grounding rules and citation format → `specs/context/rag-guardrails.md`
- User personas and tone → `specs/context/personas.md`

## Hard rules — never violate

1. **Stack is fixed.** Frontend: Next.js App Router + Shadcn/UI. Backend: FastAPI (Python). AI: Gemini 2.5 Flash + gemini-embedding-001. DB: Supabase (pgvector) + Neo4j. Do not introduce other frameworks or models.
2. **All vector columns are `vector(768)`** — gemini-embedding-001 output dimension. Never change this.
3. **Neo4j is read-only at runtime.** Only the offline admin pipeline writes to it.
4. **Every chatbot response must include a non-empty `sources[]` array.** If no grounding chunks are found, return the fallback response — never hallucinate an answer.
5. **All user data writes require a valid Supabase JWT.** Enable RLS on every table.
6. **KU data only.** Never reference programs, requirements, or career data from other universities.
7. **Thai and English both supported.** Responses match the user's input language.

## Code style

- Python: `black` formatting, type hints on all function signatures, `pydantic` models for all request/response shapes.
- TypeScript: strict mode, no `any`, `zod` for runtime validation, `server components` by default.
- All API endpoints: use the response envelope `{ data, sources, error }`.
- Commit messages: conventional commits (`feat:`, `fix:`, `chore:`, `test:`).

## Project structure (do not deviate)

```
kuru/
├── .github/
│   ├── copilot-instructions.md
│   └── agents/
├── specs/
│   ├── context/       ← source of truth (read-only for agents)
│   ├── plan/          ← phased roadmap
│   ├── tasks/         ← atomic task files
│   └── summary/       ← RAGAS scores, progress notes
├── frontend/          ← Next.js app
├── backend/           ← FastAPI app
└── scripts/           ← admin data pipeline scripts
```