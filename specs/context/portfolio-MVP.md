

## Why "all programs" is feasible for this specific feature

The portfolio checker is different from other features in one important way. The AI work is the same regardless of how many programs you support — you are always doing the same thing: extract student portfolio content, extract faculty criteria, compare them, generate gap analysis. The only variable is having criteria data for each program.

The scoping to "top 10 programs" was a data collection constraint, not a technical constraint. If you can get criteria data for all KU programs that have Round 1 and Round 2 portfolio requirements, you can support all of them with the same pipeline.

---

## What the full pipeline looks like

### Layer 1 — Student uploads their portfolio PDF

The student uploads a PDF — their portfolio document, activity record, academic transcript, or any combination. This is the input.

PyMuPDF extracts the text. Gemini then performs structured extraction over the extracted text, producing a normalised portfolio profile:

```
{
  "gpax": 3.4,
  "activities": [
    {
      "type": "competition",
      "name": "Science Olympiad",
      "level": "national",
      "result": "2nd place",
      "year": 2567,
      "riasec_signal": "I"
    },
    {
      "type": "leadership",
      "name": "Student Council President",
      "level": "school",
      "duration_years": 1,
      "riasec_signal": "E"
    },
    {
      "type": "volunteer",
      "name": "Hospital volunteer",
      "hours": 80,
      "riasec_signal": "S"
    }
  ],
  "certificates": [...],
  "personal_statement_present": true,
  "language_scores": {...}
}
```

This structured extraction is the technically interesting step. Real portfolios are messy — activities are described inconsistently, dates are in Thai Buddhist calendar format, levels use non-standard terminology. Gemini needs to normalise all of this into a consistent schema regardless of how the student wrote it.

This is genuinely non-trivial and worth describing carefully in your SRS as a structured extraction task, not just PDF reading.

---

### Layer 2 — Faculty criteria extraction pipeline (offline, runs once per TCAS cycle)

This runs in the background as a data pipeline, not at query time. For each KU program that accepts Round 1 or Round 2 portfolio applications, you extract the faculty's published criteria into a structured schema.

KU faculty criteria documents typically contain:

- Required items with minimum thresholds (GPAX ≥ 2.75, at least one activity certificate)
- Preferred items that strengthen the application (national level awards, relevant work experience)
- Qualitative criteria (demonstrates leadership, shows genuine interest in field)
- Disqualifying criteria (certain health conditions for medicine, specific school types for some quota programs)
- Portfolio format requirements (page limits, required sections, file format)

Gemini extracts these into a structured schema:

```
{
  "faculty": "SKE",
  "round": 1,
  "required": [
    {"item": "gpax", "minimum": 2.75, "hard_threshold": true},
    {"item": "activity_certificate", "minimum_count": 1, "hard_threshold": false}
  ],
  "preferred": [
    {"item": "tech_competition", "level": "national", "weight": "high"},
    {"item": "programming_project", "weight": "medium"}
  ],
  "qualitative": [
    {"criterion": "analytical thinking", "evidence_types": ["competition", "research", "project"]},
    {"criterion": "genuine interest in technology", "evidence_types": ["personal_statement", "self_study", "project"]}
  ],
  "format": {
    "max_pages": 10,
    "required_sections": ["personal_statement", "activity_record", "gpax_transcript"]
  }
}
```

This data is stored in Supabase alongside your TCAS admission data. It is updated at the start of each TCAS cycle when criteria are published.

The challenge is that not all KU faculties publish criteria in the same format or level of detail. Some faculties publish detailed rubrics. Others publish vague guidance. The extraction quality depends on source document quality. This is an honest limitation worth acknowledging in Section 7.2.

---

### Layer 3 — Gap analysis at query time

When the student selects a target faculty and requests analysis, the system pulls their structured portfolio profile from Layer 1 and the faculty's structured criteria from Layer 2, then runs a multi-step gap analysis.

The analysis has four parts:

**Part A — Hard threshold check**

Binary pass/fail on non-negotiable requirements. GPAX below the minimum is an immediate flag regardless of everything else. This is rule-based, not AI. Fast and certain.

**Part B — Required items coverage**

For each required item in the faculty criteria, does the student have it? This produces a simple checklist:

```
✓ GPAX ≥ 2.75 — คุณมี 3.4
✓ Activity certificate — คุณมี 3 ใบ
✗ Personal statement — ไม่พบใน portfolio ที่อัพโหลด
```

**Part C — Preferred items strength assessment**

This is the nuanced part. The student may have relevant activities but at insufficient level, or in adjacent but not directly relevant areas. Gemini reasons over the gap:

```
⚠ Tech competition — คุณมีรางวัลระดับภาค (2nd place, Provincial Science Olympiad)
   Faculty prefers national level. Regional awards are considered but 
   carry less weight than national. This is a moderate gap — not disqualifying 
   but worth addressing if possible before the deadline.

✓ Programming project — พบ project ใน portfolio
   Your Python data management project demonstrates relevant technical skills.
   
✗ Leadership in tech context — ไม่พบ
   You have Student Council leadership but no technology-specific leadership.
   Faculty criteria specifically mentions leadership in relevant field.
```

**Part D — Qualitative criteria assessment**

This is the hardest and most interesting part. Qualitative criteria like "demonstrates genuine interest in technology" cannot be checked with a rule. Gemini needs to look across the entire portfolio and assess whether the evidence, taken together, makes a coherent case for each qualitative criterion.

The output is honest about uncertainty:

```
"แสดงความสนใจด้านเทคโนโลยีอย่างแท้จริง"

Based on your portfolio: Science Olympiad participation (I signal), 
Python project (I + R signal), and hospital volunteering (S signal).

Strength: Moderate. The technical activities are relevant but the 
hospital volunteering, while valuable, dilutes the technology focus 
of your portfolio for this specific faculty. Your personal statement 
(not yet reviewed — not found in upload) will be critical for 
demonstrating genuine motivation.

Recommendation: Your portfolio tells a science + helping people story. 
For SKE specifically, you need it to tell a technology + problem solving story. 
Consider reframing your activities around technical outcomes rather than 
social outcomes in your personal statement.
```

This kind of reasoning — connecting portfolio content to faculty narrative expectations — is what no other tool does and what no rule-based system can do. It requires genuine multi-step reasoning over domain knowledge.

---

### Layer 4 — Actionable output

The final output is a structured report with four sections:

**Section 1 — Eligibility summary**
Quick green/amber/red status per hard threshold. Can the student apply at all?

**Section 2 — Portfolio strength profile**
A radar chart showing strength across the dimensions the faculty evaluates: academic achievement, extracurricular depth, leadership, technical relevance, personal statement quality (if uploaded). This mirrors the PLO spider chart design language — familiar to the student by this point.

**Section 3 — Gap list with priority ranking**
Each gap ranked by: how easy it is to address before the deadline, how much it matters to this faculty's criteria, and whether it is addressable at all. A gap that can be closed in two weeks ranks higher than one that requires a national award the student will never win.

**Section 4 — Specific action recommendations**
Not generic advice. Specific actions grounded in the student's actual situation and the remaining time before the deadline — pulled from the TCAS deadline data already in Supabase.

> "คุณมี 23 วันก่อนเปิดรับสมัคร SKE รอบ 1 สิ่งที่ทำได้ตอนนี้:
> 1. เพิ่ม personal statement (ไม่พบในไฟล์ที่อัพโหลด) — สำคัญที่สุด
> 2. ขอใบรับรองกิจกรรม Student Council จากโรงเรียน — ยังไม่มีในเอกสาร
> 3. เพิ่มโปรเจกต์ Python ของคุณเป็น exhibit — มีอยู่แล้ว แค่ต้องจัดรูปแบบให้ชัดเจนขึ้น"

---

## The one technical concern to address honestly

**What Gemini can and cannot do with uploaded portfolio PDFs**

Gemini can reliably extract: text content, activity names, dates, scores, award levels, certificate types, GPAX values, structured tables.

Gemini cannot reliably evaluate: creative work quality (design portfolios, art samples, writing samples), the strength of argument in a personal statement beyond structural assessment, visual elements in scanned documents with poor OCR quality.

This means the feature works well for activity-record style portfolios and structured documents. It works less well for creative portfolios where the actual work samples are the evaluation criteria.

The SRS should acknowledge this honestly and scope the feature accordingly:

> "The portfolio readiness checker evaluates structured portfolio content — activity records, certificates, academic transcripts, and personal statement presence and structure. It does not evaluate the quality of creative work samples, visual design portfolios, or the persuasiveness of personal statement arguments beyond structural completeness. Programs requiring creative work evaluation — Fine Arts, Architecture, Music — are out of scope for this feature."

---

## What changes in the SRS

**Section 1.3.1 Feature 7 — update:**

> "Portfolio Readiness Checker: The student uploads their portfolio document as a PDF. Gemini performs structured extraction over the document content, normalising activities, certificates, academic records, and personal statement presence into a standardised portfolio profile. Faculty portfolio criteria for all KU programs accepting Round 1 and Round 2 applications are pre-extracted into structured criteria schemas during a background ingestion pipeline that runs at the start of each TCAS cycle. At query time, the system performs a four-part gap analysis: hard threshold eligibility check, required item coverage, preferred item strength assessment with level-aware scoring, and qualitative criteria assessment using multi-step reasoning over the full portfolio. Output is a structured report with eligibility status, portfolio strength profile, prioritised gap list, and deadline-aware action recommendations. Scope excludes programs requiring evaluation of creative work samples."

**Section 4.3.1 — add to data sources:**

> "Faculty portfolio criteria documents: Published by KU faculties for TCAS Round 1 and Round 2 programs. Ingested via the same PDF extraction pipeline used for มคอ.2 documents. Gemini used in structured extraction mode to produce a per-faculty per-round criteria schema. Stored in Supabase alongside TCAS admission data. Updated manually at the start of each TCAS cycle."

**Section 7.2 — add limitation:**

> "Portfolio criteria coverage and quality: The portfolio readiness checker depends on the completeness and clarity of faculty-published criteria documents. Faculties that publish vague or informal criteria produce lower-quality structured schemas, reducing the reliability of gap analysis for those programs. Creative work evaluation is out of scope. The system provides preparation guidance, not admission probability prediction."

---

## The academic framing for your professor

The portfolio checker is interesting to your professor for a reason that goes beyond usefulness. It demonstrates something specific about AI system design that RAG does not demonstrate.

RAG is retrieval plus generation. The AI retrieves relevant passages and generates an answer. The intelligence is mostly in the retrieval quality.

The portfolio checker is structured extraction plus multi-criteria reasoning plus grounded generation. Three distinct operations, each requiring different prompting strategies and different output schemas. The extraction step produces structured data from unstructured input. The reasoning step compares two structured objects with partial satisfaction logic. The generation step produces actionable advice grounded in real constraints — time remaining, specific gaps, achievable actions.

This is a more sophisticated AI pipeline than RAG. It is also more directly useful. And it uses data — faculty criteria documents and TCAS deadlines — that no other tool has in structured form.

That combination of technical sophistication and unique data is exactly what a strong final year project looks like.