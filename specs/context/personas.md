# personas.md
> Defines the target user archetypes for KUru. Every agent task generating user-facing copy, UI flows, or feature logic should reference these personas to calibrate tone, complexity, and emphasis.

---

## 1. Who KUru Serves

KUru's primary users are **Grade 12 (M6) Thai students** in the pre-admission window — typically September through March of the academic year preceding TCAS admission. They are 17–18 years old, navigating a high-stakes decision with limited structured guidance.

**Common characteristics across all personas:**
- Mobile-first: most students will access KUru on a smartphone
- Thai is the primary language; English comprehension varies
- High anxiety about making the "wrong" choice
- Limited understanding of what PLOs or credit systems mean in practice
- Influenced by parents, peers, and perceived job market signals
- Familiar with LINE, TikTok, and short-form content — expect fast, scannable answers

---

## 2. The Five Archetypes

---

### Persona A — "The Undecided"
**Thai archetype name:** น้องยังไม่รู้เลย (Nong Yang Mai Roo Loei)

**Profile:**
- Has no strong preference for any field
- Chose their M6 science/arts track based on peer or parent pressure, not genuine interest
- Worried they're "supposed to know by now"
- Likely to start with the RIASEC test before anything else

**Primary goals:**
- Discover what they're actually interested in
- Get a shortlist of programs that feel right for them
- Understand what each program leads to career-wise

**Pain points:**
- Generic advice ("study what you love") feels useless
- Overwhelmed by the number of KU programs
- Afraid of locking into the wrong path

**KUru touchpoints:**
- **Entry:** RIASEC test (step 1 for this persona)
- **Key feature:** Cluster-based explanation of why programs fit them
- **Tone:** Warm, exploratory, non-judgmental — avoid "you should" language

**Design implications:**
- RIASEC must feel like discovery, not a test
- Results must explain *why* before listing program names
- Show "year-by-year vibe" to make abstract programs feel real

---

### Persona B — "The Focused One"
**Thai archetype name:** น้องรู้แล้ว (Nong Roo Laew)

**Profile:**
- Has 1–2 target programs already in mind (e.g. "I want CS or Stats")
- Comes to KUru to validate their decision and understand requirements
- Will use Program Explorer and RAG Chatbot primarily
- High motivation; low tolerance for irrelevant content

**Primary goals:**
- Confirm their target programs' PLOs and career outcomes
- Understand TCAS requirements precisely (scores, rounds, quotas)
- Compare 2 programs side-by-side

**Pain points:**
- Official KU websites are hard to navigate and often outdated
- Can't find a plain-language explanation of what they'll actually study
- Worried about making a mistake in TCAS round selection

**KUru touchpoints:**
- **Entry:** Program Explorer search or direct RAG question
- **Key feature:** Accurate, cited TCAS data; program comparison
- **Tone:** Efficient, precise, information-dense — this persona reads everything

**Design implications:**
- Search results must be fast and relevant
- TCAS data must be prominently dated (academic year visible always)
- Comparison UI should support side-by-side of 2 programs at minimum

---

### Persona C — "The Portfolio Stressor"
**Thai archetype name:** น้องกังวลพอร์ต (Nong Kangwon Port)

**Profile:**
- Applying via TCAS Round 1 (Portfolio round)
- Has already assembled some portfolio materials but isn't sure if they're strong enough
- Comes specifically for Portfolio Coach
- High anxiety; detail-oriented; needs reassurance as much as information

**Primary goals:**
- Know exactly what each program's portfolio criteria require
- Identify specific gaps in their current portfolio
- Understand what "good" looks like for each criterion

**Pain points:**
- Official portfolio requirements are vague ("show leadership")
- No benchmark to know if their portfolio is competitive
- Fear of rejection is very salient

**KUru touchpoints:**
- **Entry:** Portfolio Coach (directly, after selecting a program)
- **Key feature:** Criterion-by-criterion gap report with specific, actionable suggestions
- **Tone:** Supportive, specific, structured — avoid vague encouragement

**Design implications:**
- Gap report must use a clear visual status per criterion (met / partial / not met)
- Suggestions must be concrete: "Add a letter of recommendation from a science teacher" not "show academic ability"
- Never use language that implies certain rejection — focus on what can be improved
- Response time for portfolio analysis must feel fast (< 5 seconds perceived, even if async)

---

### Persona D — "The Parent Proxy"
**Thai archetype name:** ผู้ปกครองที่กังวล (Phukhrongkan Thi Kangwon)

**Profile:**
- Parent or guardian exploring KU programs on behalf of their child
- May be using KUru alongside or instead of the student
- Career outcome and stability are the top concern ("จบแล้วทำงานอะไร")
- Less interested in year-by-year vibe; more interested in job market data

**Primary goals:**
- Understand career outcomes and salary expectations per program
- Know if the program is "worth it" (job market demand, graduate employment rate)
- Understand TCAS requirements so they can guide their child

**Pain points:**
- Don't understand academic terminology (PLOs, TQF, etc.)
- Distrust AI systems — need citations and official sources to feel confident
- May be pushing their child toward a program the child doesn't want

**KUru touchpoints:**
- **Entry:** RAG Chatbot with career/salary/outcome questions
- **Key feature:** Career alignment with salary ranges; grounded citations
- **Tone:** Formal, factual, respectful of their concern — avoid jargon

**Design implications:**
- Career cards should prominently show salary ranges and growth outlook
- Every claim must have a visible source citation (parents will scrutinize)
- Avoid framing that sounds dismissive of parental concern
- Consider a "Share with parent" feature for RIASEC results

---

### Persona E — "The Last-Minute Scrambler"
**Thai archetype name:** น้องรีบ (Nong Reep)

**Profile:**
- TCAS deadline is imminent (days away)
- Has a list of programs to apply to but hasn't verified requirements
- Stressed, moving fast, needs answers immediately
- Will not read long explanations

**Primary goals:**
- Quickly confirm TCAS requirements for 3–5 programs
- Find out if they meet minimum criteria
- Know which rounds to apply to

**Pain points:**
- Can't afford time to explore — needs direct answers
- Worried they've missed something critical
- Official sources are slow to navigate

**KUru touchpoints:**
- **Entry:** RAG Chatbot with rapid-fire specific questions
- **Key feature:** Fast, direct, bulleted TCAS data retrieval
- **Tone:** Urgent, concise, no fluff — this persona will abandon a slow or verbose response

**Design implications:**
- Chat responses for TCAS questions should lead with the key fact, not context
- Consider a "Quick Check" mode: select 3 programs, get a requirements summary card
- Loading states must be fast or feel fast — skeleton screens, immediate partial responses
- Never lead with caveats when a direct answer is available

---

## 3. Tone & Language Guidelines by Persona

| Persona | Thai register | English level | Response length | Key avoid |
|---|---|---|---|---|
| A — Undecided | ภาษาพูด (conversational) | Basic | Medium (150–250 words) | Jargon, pressure |
| B — Focused | กึ่งทางการ (semi-formal) | Intermediate | Dense, structured | Fluff, vagueness |
| C — Portfolio | กึ่งทางการ | Basic–Intermediate | Structured, visual | Vague praise, rejection framing |
| D — Parent | ทางการ (formal) | N/A (Thai preferred) | Medium, cited | Jargon, dismissiveness |
| E — Scrambler | ภาษาพูด | Basic | Short (< 100 words) | Long preambles, caveats first |

---

## 4. Persona Detection Signals

KUru does not ask users which persona they are. Instead, infer from behaviour:

| Signal | Likely persona |
|---|---|
| Starts with RIASEC test | A — Undecided |
| Searches a specific program name immediately | B — Focused |
| Navigates directly to Portfolio Coach | C — Portfolio Stressor |
| First question is "จบแล้วเงินเดือนเท่าไร" / "what salary" | D — Parent Proxy |
| First question is about a TCAS deadline or round | E — Scrambler |
| Multiple rapid-fire questions in < 2 minutes | E — Scrambler |

These signals can be used to adapt response verbosity and tone within the RAG prompt (pass inferred persona as a context variable).

---

## 5. Shared Emotional Design Principles

Regardless of persona, KUru must always:

1. **Reduce anxiety, not amplify it.** Never phrase responses in a way that makes the student feel behind, inadequate, or out of options.
2. **Be honest about uncertainty.** If data is incomplete or unverified, say so clearly. False confidence is worse than admitted uncertainty.
3. **Respect their autonomy.** Recommendations are offered as options, not prescriptions. The student decides.
4. **Acknowledge the stakes.** TCAS is a high-stakes decision. KUru should feel like a knowledgeable friend, not a cold search engine.