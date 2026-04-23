# Git conventions

Version control guidelines for the KUru project. All contributors (human and AI agent) must follow these rules. Consistency here makes `specs/summary/progress.md` easier to maintain and RAGAS evaluation runs easier to trace.

---

## Branch naming

### Format

```
<type>/<frontend|backend>/<short-description>
```

All lowercase. Hyphens to separate words. No underscores, no slashes within segments.

### Types

| Type | When to use |
|---|---|
| `feat` | New user-facing feature or capability |
| `fix` | Bug fix |
| `chore` | Tooling, config, dependency updates — no production logic |
| `data` | Schema migrations, pipeline scripts, Neo4j sync |
| `eval` | RAGAS runs, RIASEC evaluation, metric tracking |
| `docs` | specs/, README, agent files, context files |
| `test` | Adding or fixing tests only (no feature code) |
| `refactor` | Code restructuring with no behaviour change |

### Layer segment

The second segment must identify which application layer is being changed:

| Segment | Covers |
|---|---|
| `frontend` | Next.js UI, pages, components, client state, styling, i18n |
| `backend` | FastAPI APIs, business logic, RAG, RIASEC engine, DB, pipelines |

### Examples

```
feat/backend/rag-streaming-response
feat/frontend/program-explorer-card-redesign
fix/backend/riasec-tie-breaker-logic
fix/frontend/riasec-step-navigation
data/backend/add-request-logs-table
data/backend/embedding-batch-script
eval/backend/ragas-baseline-run
docs/frontend/update-chat-copy
test/backend/gap-analysis-accuracy
refactor/backend/response-envelope-consistency
chore/backend/upgrade-langchain
```

### Rules

- Branch names must be **under 60 characters** total.
- The middle segment must be exactly `frontend` or `backend`.
- Always branch from `main` (or the current sprint branch if one exists).
- One feature or fix per branch. Do not bundle unrelated changes.
- Delete branches after merging — keep the remote clean.

---

## Commit messages

### Format

Follows [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short summary>

[optional body]

[optional footer]
```

### Rules for the summary line

- **Imperative mood:** "add fallback handler" not "added" or "adds"
- **Lowercase** after the colon
- **No period** at the end
- **Under 72 characters** for the full first line
- **Must be specific** — "update backend" is not a valid summary

### Types (same as branch types)

`feat` · `fix` · `chore` · `data` · `test` · `docs` · `eval` · `refactor`

Add `!` after the type for breaking changes: `feat!(db): rename embedding column`

### Body (optional but encouraged for non-trivial changes)

- Wrap at 72 characters
- Explain *why*, not just *what* — the diff shows what changed
- Reference the task file if applicable: `See specs/tasks/rag-chatbot.md TASK-003`

### Footer (optional)

- Breaking change note: `BREAKING CHANGE: vector column renamed from embed to embedding`
- Issue/task reference: `Closes TASK-007`

### Examples

```
feat(rag): add pgvector similarity search with 0.72 threshold

Implements retriever.py using Supabase pgvector cosine similarity.
Excludes rows where embedding IS NULL. Returns top-5 chunks above
the 0.72 threshold defined in rag-guardrails.md §5.

See specs/tasks/rag-chatbot.md TASK-002
```

```
fix(riasec): trigger tie-breaker only when gap ≤ 3 points

Previous implementation triggered Step 5 on any tied score.
Corrected to match riasec-logic.md §4 — gap must be ≤ 3 between
the 3rd and 4th dimension scores.
```

```
data(db): add ivfflat index on plos.embedding

Required before pgvector search goes live. lists=100 per
data-schema.md §2.2.
```

```
eval(rag): record RAGAS baseline — faithfulness 0.81

All 4 metrics pass thresholds. Results saved to
specs/summary/ragas-2025-06-01.json.
```

```
docs(specs): confirm 10 in-scope programs for portfolio coach

Replaced placeholders in rag-guardrails.md §3 with confirmed
program list from advisor meeting 2025-05-30.
```

```
chore(pipeline): upgrade langchain to 0.3.x

No logic changes. Verified embedding pipeline output unchanged
after upgrade.
```

### Anti-patterns — never do these

```
fix: stuff                          ← not specific
feat: update things                 ← meaningless
WIP: half done                      ← don't commit WIP; use a draft PR
feat(rag): Added the new feature.   ← past tense + period
fix(db): fixed                      ← no summary of what was fixed
```

---

## Workflow summary

```
main
 └── feat/backend/rag-streaming-response  ← branch from main
      ├── feat(rag): scaffold /chat endpoint
      ├── feat(rag): add pgvector retriever
      ├── feat(rag): wire grounding prompt template
      ├── test(rag): add pytest suite for retriever
      └── eval(rag): ragas baseline run — all metrics pass
                                      ← squash or merge PR → main
```

For AI agent commits: the agent must include the relevant `specs/tasks/` task ID in the commit body whenever it implements a planned task. This keeps `specs/summary/progress.md` traceable.