# skill-clusters.md
> Defines the SkillCluster semantic bridge — the core translation layer between KU Program Learning Outcomes (PLOs) and career profiles. Every agent task involving recommendations, matching, or explanation must reference this file.

---

## 1. What is a SkillCluster?

A **SkillCluster** is a named, abstract competency group that unifies the language of:
- **PLOs** (academic, formal Thai language from มคอ.2 documents)
- **Career profiles** (industry skill terminology)

The mapping direction is always:

```
(KU Program) → (PLO) → [SkillCluster] → (Career Profile)
```

This allows KUru to answer questions like:
- "What careers does studying Agricultural Economics lead to?" (Program → Cluster → Career)
- "Which KU programs develop data skills?" (Career → Cluster → Program)
- "Why is this career recommended for me?" (Cluster = explainability layer)

---

## 2. The 12 SkillClusters

---

### SC-01 · Analytical Reasoning
**Core idea:** Structured thinking, logical deduction, problem decomposition.

**Absorbs PLO language like:**
- "วิเคราะห์ปัญหาอย่างเป็นระบบ" (systematic problem analysis)
- "ประยุกต์หลักการทางวิทยาศาสตร์" (applying scientific principles)
- "การใช้เหตุผล" (use of reasoning)

**Career profiles that require this cluster:**
- Systems Analyst, Operations Research Analyst, Policy Analyst, Risk Analyst, Actuary

**Example programs with strong SC-01 PLOs:**
- Computer Science, Statistics, Mathematics, Industrial Engineering

---

### SC-02 · Data Literacy
**Core idea:** Working with quantitative data — collection, cleaning, analysis, interpretation.

**Absorbs PLO language like:**
- "รวบรวมและวิเคราะห์ข้อมูล" (collect and analyze data)
- "การใช้สถิติ" (use of statistics)
- "แปลผลการทดลอง" (interpret experimental results)

**Career profiles that require this cluster:**
- Data Analyst, Business Intelligence Analyst, Research Scientist, Epidemiologist, Market Researcher

**Example programs with strong SC-02 PLOs:**
- Statistics, Agro-Industrial Technology, Environmental Science, Economics

---

### SC-03 · Engineering & Systems Design
**Core idea:** Designing, building, and optimizing physical or digital systems.

**Absorbs PLO language like:**
- "ออกแบบระบบ" (system design)
- "แก้ปัญหาทางวิศวกรรม" (solving engineering problems)
- "การประยุกต์ใช้เทคโนโลยี" (technology application)

**Career profiles that require this cluster:**
- Software Engineer, Mechanical Engineer, Civil Engineer, Electrical Engineer, DevOps Engineer

**Example programs with strong SC-03 PLOs:**
- Computer Engineering, Mechanical Engineering, Electrical Engineering, Civil Engineering

---

### SC-04 · Biological & Life Sciences Thinking
**Core idea:** Understanding living systems — from molecular biology to ecosystems.

**Absorbs PLO language like:**
- "ความรู้ด้านชีววิทยา" (biology knowledge)
- "กระบวนการทางชีวภาพ" (biological processes)
- "นิเวศวิทยา" (ecology)

**Career profiles that require this cluster:**
- Biologist, Veterinarian, Agricultural Scientist, Biomedical Researcher, Conservation Officer

**Example programs with strong SC-04 PLOs:**
- Biology, Veterinary Science, Agriculture, Fisheries, Biotechnology

---

### SC-05 · Communication & Presentation
**Core idea:** Conveying ideas clearly in written, oral, or visual form to diverse audiences.

**Absorbs PLO language like:**
- "สื่อสารอย่างมีประสิทธิภาพ" (effective communication)
- "นำเสนองาน" (presenting work)
- "เขียนรายงานวิชาการ" (writing academic reports)

**Career profiles that require this cluster:**
- Journalist, Content Strategist, PR Specialist, Educator, UX Writer, Corporate Trainer

**Example programs with strong SC-05 PLOs:**
- Mass Communication, Thai Language, Education, Liberal Arts, Business Administration

---

### SC-06 · Creative & Design Thinking
**Core idea:** Generating novel ideas, aesthetic sensibility, user-centered problem solving.

**Absorbs PLO language like:**
- "ความคิดสร้างสรรค์" (creative thinking)
- "ออกแบบ" (design)
- "นวัตกรรม" (innovation)

**Career profiles that require this cluster:**
- UX/UI Designer, Architect, Product Designer, Brand Strategist, Industrial Designer

**Example programs with strong SC-06 PLOs:**
- Architecture, Industrial Design, Landscape Architecture, Fashion Design

---

### SC-07 · Agricultural & Environmental Science
**Core idea:** Applying science to food systems, land use, and environmental management.

**Absorbs PLO language like:**
- "การเกษตร" (agriculture)
- "การจัดการทรัพยากร" (resource management)
- "ความยั่งยืน" (sustainability)

**Career profiles that require this cluster:**
- Agronomist, Environmental Consultant, Food Safety Officer, Soil Scientist, Forestry Officer

**Example programs with strong SC-07 PLOs:**
- Agronomy, Soil Science, Forestry, Environmental Science, Agricultural Economics

---

### SC-08 · Business & Economic Reasoning
**Core idea:** Understanding markets, organizations, financial systems, and decision-making under uncertainty.

**Absorbs PLO language like:**
- "การบริหารจัดการ" (management)
- "เศรษฐศาสตร์" (economics)
- "การตลาด" (marketing)
- "การเงิน" (finance)

**Career profiles that require this cluster:**
- Business Analyst, Financial Advisor, Marketing Manager, Entrepreneur, Supply Chain Manager

**Example programs with strong SC-08 PLOs:**
- Business Administration, Economics, Accounting, Agricultural Economics, Finance

---

### SC-09 · Research & Scientific Method
**Core idea:** Designing and conducting rigorous research — hypothesis, methodology, evidence, conclusion.

**Absorbs PLO language like:**
- "ระเบียบวิธีวิจัย" (research methodology)
- "ตั้งสมมติฐาน" (hypothesis formation)
- "ทบทวนวรรณกรรม" (literature review)

**Career profiles that require this cluster:**
- Academic Researcher, R&D Scientist, Clinical Researcher, Policy Researcher, Lab Technician

**Example programs with strong SC-09 PLOs:**
- All science-track programs; especially Biology, Chemistry, Veterinary Science, Statistics

---

### SC-10 · Technology & Computing
**Core idea:** Writing, understanding, and deploying software; working with digital infrastructure.

**Absorbs PLO language like:**
- "การเขียนโปรแกรม" (programming)
- "พัฒนาซอฟต์แวร์" (software development)
- "เทคโนโลยีสารสนเทศ" (information technology)

**Career profiles that require this cluster:**
- Software Developer, Data Engineer, Cybersecurity Analyst, Cloud Architect, AI/ML Engineer

**Example programs with strong SC-10 PLOs:**
- Computer Science, Computer Engineering, Information Technology, Software Engineering

---

### SC-11 · Social & Ethical Awareness
**Core idea:** Understanding society, culture, ethics, and responsibilities of professional practice.

**Absorbs PLO language like:**
- "จริยธรรมวิชาชีพ" (professional ethics)
- "ความรับผิดชอบต่อสังคม" (social responsibility)
- "ความเข้าใจทางวัฒนธรรม" (cultural understanding)

**Career profiles that require this cluster:**
- Social Worker, NGO Program Officer, Public Health Officer, Ethicist, Community Developer

**Example programs with strong SC-11 PLOs:**
- Social Sciences, Law, Education, Public Health, Sociology

---

### SC-12 · Leadership & Collaboration
**Core idea:** Working in and leading teams; project coordination; interpersonal effectiveness.

**Absorbs PLO language like:**
- "การทำงานเป็นทีม" (teamwork)
- "ภาวะผู้นำ" (leadership)
- "การจัดการโครงการ" (project management)

**Career profiles that require this cluster:**
- Project Manager, Team Lead, Operations Manager, Startup Founder, Department Head

**Example programs with strong SC-12 PLOs:**
- Business Administration, Engineering programs, Education, Veterinary Science

---

## 3. Cluster Combination Patterns

Most careers require 2–4 clusters. Common patterns:

| Career Area | Primary Clusters | Secondary Clusters |
|---|---|---|
| Data Science / AI | SC-02, SC-10 | SC-01, SC-09 |
| Agricultural Research | SC-07, SC-09 | SC-04, SC-02 |
| Product Management | SC-08, SC-12 | SC-06, SC-05 |
| Software Engineering | SC-10, SC-03 | SC-01, SC-12 |
| Environmental Policy | SC-07, SC-11 | SC-09, SC-05 |
| Veterinary Practice | SC-04, SC-09 | SC-11, SC-12 |
| Marketing & Brand | SC-08, SC-05 | SC-06, SC-12 |
| Academic / Research | SC-09, SC-05 | SC-01, SC-11 |

---

## 4. Usage Rules for AI Agents

1. **Always cite the cluster(s)** when explaining a program-to-career recommendation. e.g. *"This program develops SC-02 and SC-09, which align with careers in research and data analysis."*
2. **Never invent a cluster.** Only the 12 defined above are valid. If a PLO doesn't map clearly, flag it for human review.
3. **Use cluster IDs (SC-01 through SC-12)** in all internal logic and prompt chains for consistency.
4. **Cluster names are human-facing.** Use full names in UI-facing text; use IDs in database queries and graph traversals.
5. **PLO-to-cluster mapping is many-to-many.** A single PLO can contribute to multiple clusters; a cluster is typically fed by 3–10 PLOs across programs.