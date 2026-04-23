# riasec-logic.md
> Defines the RIASEC adaptive personality test for KUru — question design philosophy, scoring mechanics, and how results map to SkillClusters and KU programs. All agent tasks touching the RIASEC feature must align with this document.

---

## 1. What is RIASEC?

RIASEC (Holland Codes) classifies personality/interest types along 6 dimensions:

| Code | Name | Core Orientation |
|---|---|---|
| **R** | Realistic | Hands-on, physical, mechanical, outdoors |
| **I** | Investigative | Research, analysis, intellectual curiosity |
| **A** | Artistic | Creative, expressive, aesthetic, unstructured |
| **S** | Social | Helping, teaching, interpersonal, community |
| **E** | Enterprising | Leading, persuading, selling, managing |
| **C** | Conventional | Organizing, detail-oriented, structured, data |

A student's result is typically a **3-letter code** (e.g. `IAS`, `RIC`) representing their top three dimensions in order.

---

## 2. Why Adaptive? The Problem with Simple Questionnaires

Standard RIASEC tests present Likert-scale questions per dimension. This has known validity problems:
- **Social desirability bias:** Students over-report "S" (Social) because it sounds positive.
- **Acquiescence bias:** Students agree with most statements if they're positive.
- **Low discrimination:** Students with similar scores across dimensions get poor recommendations.

**KUru's solution:** A 5-step adaptive test mixing three question formats to maximize discrimination and validity.

---

## 3. The 5-Step Adaptive Test Flow

### Step 1 — Warm-up: Scenario Selection (2 questions)
**Format:** Present a short real-world scenario. Student picks the role they most identify with.

> *"Imagine your school is organizing a science fair. Which role fits you best?"*
> - A) Designing the booth layout and decorations *(→ A)*
> - B) Running experiments and presenting findings *(→ I)*
> - C) Coordinating volunteers and managing the schedule *(→ E/C)*
> - D) Helping younger students understand the projects *(→ S)*

**Purpose:** Low-stakes entry; establishes early signal on 2–3 dominant dimensions.
**Scoring:** Each choice adds +2 to the indicated dimension(s).

---

### Step 2 — Pairwise Forced Choice (6 questions)
**Format:** Present two activities. Student must choose one — no neutral option.

> *"Which would you rather spend a Saturday doing?"*
> - A) Repairing a motorcycle engine *(→ R)*
> - B) Writing a short story *(→ A)*

**Purpose:** Forced-choice eliminates acquiescence bias; directly measures relative preference between dimensions.
**Scoring:** Each choice adds +3 to the chosen dimension; −1 to the rejected dimension.
**Adaptive rule:** The engine selects pairs that pit the current top-2 dimensions against each other to maximize discrimination. If after Step 1 top-2 are `I` and `S`, Step 2 should include at least 2 `I vs S` pairs.

---

### Step 3 — Scenario-Based Deep Dive (3 questions)
**Format:** A richer scenario (2–3 sentences) with 4 response options, each mapping to a different dimension.

> *"You join a startup that is struggling. The team needs help. What do you naturally do first?"*
> - A) Analyze the data to find where the business is losing money *(→ I/C)*
> - B) Redesign the product to be more appealing *(→ A)*
> - C) Motivate the team and rebuild morale *(→ S/E)*
> - D) Build a new tool to automate a broken process *(→ R/C)*

**Purpose:** Tests behavior under realistic pressure; surfaces secondary dimensions not captured by pairwise.
**Scoring:** Primary dimension +4; secondary dimension (if applicable) +2.
**Adaptive rule:** Scenarios are selected from a tagged pool based on the student's school background (science/arts/general) if known. This is optional metadata.

---

### Step 4 — Rapid Interest Scan (8 questions)
**Format:** Binary like/dislike on activity thumbnails or short phrases.

> *"Would you enjoy: Debugging code for hours to fix one elusive error?"*
> - 👍 Yes / 👎 No

**Purpose:** Quickly fills gaps in dimensions not yet well-sampled. Covers all 6 dimensions at least once.
**Scoring:** Yes = +2 to dimension; No = 0 (no penalty — dislike is ambiguous).
**Adaptive rule:** Prioritize questions for dimensions with fewer data points after Steps 1–3.

---

### Step 5 — Confirmation Tie-Breaker (1–2 questions, conditional)
**Triggered only if:** Two dimensions are within 3 points of each other in the top-3 after Step 4.

**Format:** A direct value-ranking question.

> *"When choosing a future career, which matters most to you?"*
> Drag to rank: Stability / Creativity / Impact on others / Intellectual challenge / Independence / Prestige

**Purpose:** Resolve ties using stated values rather than behaviors.
**Scoring:** Top-ranked value = +5 to corresponding dimension; 2nd = +3; 3rd = +1.

**Value-to-dimension mapping:**

| Value | Primary dimension |
|---|---|
| Stability | C |
| Creativity | A |
| Impact on others | S |
| Intellectual challenge | I |
| Independence | R |
| Prestige | E |

---

## 4. Scoring Model

### Raw score accumulation
Each dimension (`R`, `I`, `A`, `S`, `E`, `C`) accumulates points across all steps.

### Normalization
After all steps, normalize scores to a 0–100 scale:
```
normalized[d] = (raw[d] / max_possible_raw) × 100
```

### Final Holland Code
Take the top 3 dimensions by normalized score. Order matters — `IAS` ≠ `SAI`.

### Confidence flag
If the 3rd dimension score is within 5 points of the 4th dimension, flag the result as **low confidence** and surface this to the student: *"Your results show strong I and A traits, but your third dimension is less clear — explore both S and C programs."*

---

## 5. Holland Code → SkillCluster → KU Program Mapping

### Step 1: Code to SkillCluster affinity

Each Holland dimension has a primary affinity with 2–3 SkillClusters:

| Holland Code | Primary SkillClusters | Secondary SkillClusters |
|---|---|---|
| R (Realistic) | SC-03 (Engineering & Systems Design), SC-07 (Agricultural & Environmental) | SC-04 (Biological) |
| I (Investigative) | SC-01 (Analytical Reasoning), SC-09 (Research & Scientific Method) | SC-02 (Data Literacy), SC-04 (Biological) |
| A (Artistic) | SC-06 (Creative & Design Thinking), SC-05 (Communication) | SC-11 (Social & Ethical) |
| S (Social) | SC-11 (Social & Ethical), SC-05 (Communication) | SC-12 (Leadership & Collaboration) |
| E (Enterprising) | SC-08 (Business & Economic), SC-12 (Leadership & Collaboration) | SC-05 (Communication) |
| C (Conventional) | SC-02 (Data Literacy), SC-08 (Business & Economic) | SC-01 (Analytical Reasoning) |

### Step 2: Combine top-3 code clusters

For code `IAS`:
- I → SC-01, SC-09 (primary), SC-02, SC-04 (secondary)
- A → SC-06, SC-05 (primary), SC-11 (secondary)
- S → SC-11, SC-05 (primary), SC-12 (secondary)

Deduplicate and rank by frequency of appearance. In this case: SC-05, SC-11 appear twice → elevated rank.

Final cluster priority: `[SC-01, SC-09, SC-05, SC-11, SC-06, SC-02, SC-04, SC-12]`

### Step 3: Match clusters to programs

Query Neo4j:
```cypher
MATCH (p:Program)-[:HAS_PLO]->(plo:PLO)-[:MAPS_TO]->(sc:SkillCluster)
WHERE sc.id IN $cluster_ids
RETURN p.name, count(sc) as cluster_match_count, collect(sc.id) as matched_clusters
ORDER BY cluster_match_count DESC
LIMIT 10
```

Return top 5 programs with matched clusters listed for explainability.

---

## 6. Explainability Requirements

Every RIASEC recommendation must be accompanied by a human-readable explanation. Format:

```
"Based on your [IAS] profile:

Your strong Investigative trait points toward programs that develop SC-01 (Analytical Reasoning) 
and SC-09 (Research). Your Artistic side aligns with SC-06 (Creative Design). Together, these 
suggest programs like [Program Name], where you'll spend time on [brief year-by-year vibe].

This path commonly leads to careers like [Career 1] and [Career 2]."
```

**Rules:**
- Always name the Holland Code letters with their full names on first mention.
- Always cite at least 2 SkillClusters in the explanation.
- Never say "the algorithm matched you" — always frame as interest and skill alignment.
- If confidence is low, explicitly tell the student and suggest exploring 2 adjacent programs.

---

## 7. Question Bank Requirements

The question bank (stored in Supabase `riasec_questions` table) must include:

| Field | Type | Description |
|---|---|---|
| `id` | UUID | Primary key |
| `step` | int (1–5) | Which step this question belongs to |
| `format` | enum | `scenario`, `pairwise`, `binary`, `ranking` |
| `question_text` | text | The question or scenario body |
| `options` | jsonb | Array of `{text, dimensions: [{code, weight}]}` |
| `tags` | text[] | Optional: `science-background`, `arts-background`, `general` |
| `validated` | bool | Has this question been reviewed by a counselor? |

**Minimum bank size at launch:** 40 questions (across all steps, all dimensions covered at least 3× each).

---

## 8. Evaluation Targets

| Metric | Target | Measurement method |
|---|---|---|
| MRR (Mean Reciprocal Rank) | > 0.60 | Does the student's self-identified ideal program appear in top-5 results? |
| NDCG@5 | > 0.60 | Graded relevance of top-5 ranked programs vs. student ground truth |
| Test completion rate | > 80% | Students who start the test and complete all 5 steps |
| Avg. time to complete | < 8 minutes | Measured from start to final result screen |

---

## 9. Out of Scope (for MVP)

- Multi-session test resumption (complete in one session only for MVP)
- Parent or counselor dashboards
- Integration with external RIASEC validated instruments (e.g., O*NET)
- Thai-language psychometric validation study (planned for post-MVP research phase)