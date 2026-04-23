
### The Full Skill Cluster List

Here's a defensible set of **12 skill clusters** — enough to cover all KU faculty types without being so granular that Gemini gets confused assigning them.

| ID | Cluster Label | RIASEC Dimension(s) | What it covers |
|---|---|---|---|
| SC01 | Analytical Reasoning | I | Problem solving, logical thinking, data interpretation, algorithm design |
| SC02 | Systems Thinking | R, I | Engineering systems, architecture, process design, integration |
| SC03 | Creative Problem Solving | A, I | Design thinking, innovation, non-standard solutions, prototyping |
| SC04 | Technical Craft | R | Hands-on skills, lab work, physical construction, instrumentation |
| SC05 | Leadership & Persuasion | E | Leading teams, negotiating, presenting, entrepreneurship |
| SC06 | Communication | S, E | Writing, speaking, interpersonal, cross-cultural, bilingual |
| SC07 | Social & Human Insight | S | Counseling, teaching, empathy, community work, social awareness |
| SC08 | Organizational Planning | C, E | Project management, scheduling, financial planning, compliance |
| SC09 | Data & Digital Literacy | I, C | Data modeling, software tools, digital systems, quantitative analysis |
| SC10 | Scientific Inquiry | I | Research methods, hypothesis testing, experimental design, evidence-based reasoning |
| SC11 | Ethics & Professionalism | C, S | Professional standards, integrity, accountability, regulatory compliance |
| SC12 | Self-Directed Learning | I, A | Lifelong learning, adaptability, independent study, growth mindset |

---

### Why 12 and not more or fewer

**Too few (e.g. 6)** — one cluster per RIASEC dimension — means you lose resolution. Two very different programs like Computer Engineering and Statistics would both score high on "Investigative" with no way to distinguish them.

**Too many (e.g. 25+)** — Gemini starts making inconsistent assignments because the boundaries between clusters get blurry. You also get sparse edges in the graph, making cosine similarity less meaningful.

**12 is the sweet spot** for a two-person team. It gives you enough coverage across Engineering, Science, Business, Humanities, and Agriculture faculties without becoming unmanageable.

---

### How to validate these 12 cover all KU faculties

Quick sanity check against the major faculty groups:

| Faculty Type | Dominant Clusters | RIASEC Signal |
|---|---|---|
| Engineering (CPE, EE, IE) | SC01, SC02, SC04, SC09 | R, I |
| Science (Math, Stats, Chemistry) | SC01, SC09, SC10 | I |
| Business (Accounting, Marketing, Finance) | SC05, SC08, SC09, SC11 | E, C |
| Architecture / Design | SC03, SC04, SC06 | A, R |
| Education / Psychology | SC06, SC07, SC11, SC12 | S |
| Agriculture / Agro-Industry | SC04, SC10, SC08 | R, I |
| Humanities / Liberal Arts | SC06, SC07, SC12 | A, S |
| Veterinary / Medicine-adjacent | SC04, SC10, SC11 | R, I |

Every faculty type gets covered by at least 2–3 clusters. No faculty is left without a signal.

---

### How to put this in a slide

**Option 1 — Simple reference table (for a technical slide)**

Just show the table above with ID, Label, and RIASEC column. Clean, scannable, easy to reference during Q&A.

**Option 2 — The bridge diagram (more visual, better for explaining the concept)**

This is the more powerful option for a presentation. It shows *why* the clusters exist — as the translation layer between two worlds.

```
KU PLO World          SkillCluster Bridge        O*NET Career World
─────────────         ─────────────────────      ─────────────────────
"ออกแบบและวิเคราะห    →  SC01 Analytical      ←   Software Developer
ขั้นตอนวิธี"              Reasoning               (I=0.85 in O*NET)

"ปฏิบัติงานร่วมกับ    →  SC05 Leadership &    ←   Management Consultant
ผู้อื่น มีความเป็น        Persuasion               (E=0.80 in O*NET)
ผู้นำ"

"จัดทำงบการเงิน       →  SC08 Organizational  ←   Financial Manager
ได้อย่างถูกต้อง"           Planning                 (C=0.78 in O*NET)
```

One slide, three columns. The middle column is your 12 clusters. This visually answers the hardest question a professor will ask: *"How do you connect Thai PLO language to O*NET career data?"*

**Option 3 — Radar/spider showing cluster profile per program**

Show two programs side by side as radar charts across the 12 clusters. This is what the PLO Explorer spider chart actually displays — so the slide doubles as a product preview.

---

### My recommendation

**Use Option 2 as your main slide** with the title:

> *"SkillCluster: The Bridge Between Curriculum and Career"*

Then have the full table from Option 1 as a backup slide labeled "Appendix" — so if a professor asks "what are all the clusters?" you can flip to it instantly without it cluttering your main flow.

One sentence to say when presenting it:

> *"Both sides — KU's PLOs and O*NET's careers — speak completely different languages. SkillClusters are the neutral middle ground we define once, and Gemini maps both sides to it automatically during ingestion."*