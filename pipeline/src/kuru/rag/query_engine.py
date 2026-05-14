"""RAG query engine — local embed query → pgvector retrieval → Gemini generation."""

from __future__ import annotations

import re
from dataclasses import dataclass

from sentence_transformers import SentenceTransformer  # used by _get_embed_model return type
from tenacity import retry, retry_if_exception, stop_after_attempt, wait_exponential

from kuru.db import supabase_client as db
from kuru.llm import GENERATION_MODEL, get_openrouter_client, session_usage

EMBED_MODEL_NAME = "intfloat/multilingual-e5-base"
TOP_K = 5
MIN_SIMILARITY = 0.35   # chunks below this are too weak to be useful


def _get_embed_model() -> SentenceTransformer:
    # Delegate to embedder's singleton so the model is loaded exactly once
    # regardless of whether demo_rag pre-loads it or the first query triggers it.
    from kuru.ingestion.embedder import _get_model
    return _get_model()


from kuru.ingestion.utils import is_transient_error

# Thai + English keywords that signal a TCAS admission question
TCAS_KEYWORDS = re.compile(
    r"TCAS|GPAX|เกรด|รับ|สมัคร|คะแนน|รอบ|TGAT|TPAT|A-Level|quota|โควตา|วันรับ|ประกาศ|admission|score|portfolio"
    r"|enroll|apply|applying|application|qualify|qualification|requirement|สอบ|ข้อสอบ|เข้าเรียน|เข้าศึกษา|รับสมัคร|คุณสมบัติ"
    r"|อยากเข้า|จะเข้า|วิธีเข้า|ต้องทำไง|ต้องทำอะไร|ขั้นตอนการสมัคร|วิธีสมัคร"
    r"|เข้ายังไง|เข้าอย่างไร|เกณฑ์เข้า|สอบเข้า",
    re.IGNORECASE,
)

# Strong TCAS signals — scores, rounds, grades, application process
_STRONG_TCAS_RE = re.compile(
    r"TCAS|GPAX|เกรด|คะแนน|สมัคร|รอบ|quota|โควตา|TGAT|TPAT|A-Level|score|admission"
    r"|enroll|apply|applying|application|qualify|qualification|requirement|สอบ|ข้อสอบ"
    r"|เข้าเรียน|เข้าศึกษา|รับสมัคร|คุณสมบัติ|อยากเข้า|จะเข้า|วิธีเข้า|ต้องทำไง"
    r"|ขั้นตอนการสมัคร|วิธีสมัคร|วันรับ|ประกาศ"
    r"|เข้ายังไง|เข้าอย่างไร|เกณฑ์เข้า|สอบเข้า",
    re.IGNORECASE,
)

# Signals that the question is about curriculum-level policy (nationality, language), not TCAS scores
_CURRICULUM_POLICY_RE = re.compile(
    r"ต่างชาติ|ต่างประเทศ|foreign.student|international.student|นิสิตต่าง|นักศึกษาต่าง|นิสิตไทย|นักศึกษาไทย|เฉพาะนิสิตไทย|เฉพาะนักศึกษาไทย",
    re.IGNORECASE,
)

# Signals that the user is asking about curriculum structure, not TCAS admission.
_CURRICULUM_STRUCTURE_RE = re.compile(
    r"credit|credits|หน่วยกิต|หมวดวิชา|กลุ่มสาระ|โครงสร้างหลักสูตร|วิชาเฉพาะ|วิชาแกน"
    r"|general.education|languages?.and.communication|curriculum.structure|specialized.course",
    re.IGNORECASE,
)

# Explicit admission signals. Deliberately excludes broad words such as "requirement"
# because curriculum questions often ask about credit requirements.
_EXPLICIT_TCAS_RE = re.compile(
    r"TCAS|GPAX|TGAT|TPAT|A-Level|admission|portfolio|quota|apply|applying|application"
    r"|สมัคร|รับสมัคร|รอบ|คะแนน|โควตา|สอบ|ข้อสอบ|เข้าศึกษา|เข้าเรียน"
    r"|เข้ายังไง|เข้าอย่างไร|เกณฑ์เข้า|สอบเข้า",
    re.IGNORECASE,
)

FEES_KEYWORDS = re.compile(
    r"ค่าเทอม|ค่าเล่าเรียน|ค่าธรรมเนียม|ค่าใช้จ่าย|tuition|fees?|cost",
    re.IGNORECASE,
)

# Keywords that signal a broad "list all programs" type question.
# Deliberately narrow — "what courses will I take in X" must NOT match here.
LISTING_KEYWORDS = re.compile(
    r"what programs are|what programs does|which programs|what majors|what faculties"
    r"|available programs|list.*program|programs.*available"
    r"|หลักสูตรอะไรบ้าง|มีหลักสูตรอะไร|สาขาวิชาอะไรบ้าง|คณะอะไรบ้าง|มีคณะอะไร|เรียนอะไรได้บ้าง"
    r"|มีสาขาอะไร|สาขาใดบ้าง|มีอะไรบ้าง",
    re.IGNORECASE,
)

# Common program abbreviations → canonical English name (must match name_en in DB exactly)
# NOTE: "cs" maps to "computer engineering" because KU's Computer Science (Faculty of Science)
# is not ingested — CPE is the closest available engineering equivalent.
_PROGRAM_ABBREVS: dict[str, str] = {
    "cs":  "computer engineering",
    "cpe": "computer engineering",
    "ske": "software and knowledge engineering",
    "ee":  "electrical engineering",
    "me":  "mechanical engineering",
    "ce":  "civil engineering",
    "ie":  "industrial engineering",
    "che": "chemical engineering",
}

_PROGRAM_ALIASES: dict[str, str] = {
    "software engineering": "software and knowledge engineering",
    "software engineer": "software and knowledge engineering",
    "วิศวกรรมซอฟต์แวร์": "software and knowledge engineering",
    "วิศวกรรมซอฟต์เเวร์": "software and knowledge engineering",
    "ซอฟต์แวร์": "software and knowledge engineering",
    "ซอฟต์เเวร์": "software and knowledge engineering",
}


def _normalize_thai_text(value: str) -> str:
    """Normalize Thai text for conservative substring matching."""
    value = (value or "").replace("เเ", "แ")
    value = re.sub(r"\([^)]*\)", "", value)
    value = re.sub(r"[\s_\-–—()/.,:;]+", "", value)
    return value


def _normalize_thai_exact_text(value: str) -> str:
    """Normalize Thai text while preserving parenthetical words."""
    value = (value or "").replace("เเ", "แ")
    value = re.sub(r"[\s_\-–—()/.,:;]+", "", value)
    return value


def _english_program_aliases(name_en: str) -> list[str]:
    """Return searchable English aliases for an official program name."""
    base = re.sub(r"\s*\([^)]+\)\s*$", "", (name_en or "")).strip().lower()
    if not base:
        return []

    aliases = {base}
    simplified = base
    simplified = re.sub(r"^bachelor of (?:engineering|science|arts|education|laws|nursing science) program (?:in|for)\s+", "", simplified)
    simplified = re.sub(r"^master of (?:science|engineering|arts) program (?:in|for)\s+", "", simplified)
    simplified = re.sub(r"^doctor of (?:philosophy|veterinary medicine) program (?:in|for)?\s*", "", simplified)
    simplified = re.sub(r"^bachelor of engineering in\s+", "", simplified)
    simplified = re.sub(r"^bachelor of accountancy program$", "accountancy", simplified)
    simplified = re.sub(r"^bachelor of business administration program$", "business administration", simplified)
    simplified = simplified.strip()
    if simplified and len(simplified) >= 4:
        aliases.add(simplified)

    return sorted(aliases, key=len, reverse=True)


def _resolve_program_from_query(question: str, programs: list[dict]) -> str | None:
    """Return program_id if the question mentions a specific program by name (Thai or English).

    English: substring match on name_en (longest wins). Abbreviations (CS, CPE, SKE…)
             are expanded before matching so "CS" resolves to "computer science".
    Thai: token match on name_th — count how many ≥4-char Thai tokens from the query
          appear in the program's name_th; pick the program with the most hits (min 1).
    """
    q_lower = question.lower()
    q_alias = q_lower.replace("เเ", "แ")
    # Expand abbreviations so "CS" → "computer science" is found by substring match
    for abbr, full in _PROGRAM_ABBREVS.items():
        if re.search(r"\b" + abbr + r"\b", q_lower):
            q_lower = q_lower + " " + full

    for alias, canonical in _PROGRAM_ALIASES.items():
        if alias in q_alias:
            for p in programs:
                name_en = re.sub(r"\s*\([^)]+\)\s*$", "", (p.get("name_en") or "")).strip().lower()
                if canonical == name_en:
                    return p["id"]

    # English match — longest alias substring wins. Aliases include official names
    # and shortened names like "electrical engineering".
    best_len = 0
    best_id: str | None = None
    for p in programs:
        for alias in _english_program_aliases(p.get("name_en") or ""):
            if len(alias) < 8:
                continue
            if alias in q_lower and len(alias) > best_len:
                best_len = len(alias)
                best_id = p["id"]
    if best_id:
        return best_id

    # Thai exact-name match with parenthetical labels preserved first. This keeps
    # bachelor/graduate or regular/international variants distinct when named.
    q_th_exact = _normalize_thai_exact_text(question)
    best_th_exact_len = 0
    best_th_exact_id: str | None = None
    for p in programs:
        name_th_exact = _normalize_thai_exact_text(p.get("name_th") or "")
        if len(name_th_exact) < 5:
            continue
        if name_th_exact in q_th_exact and len(name_th_exact) > best_th_exact_len:
            best_th_exact_len = len(name_th_exact)
            best_th_exact_id = p["id"]
    if best_th_exact_id:
        return best_th_exact_id

    # Thai exact-name match — normalized names catch parenthetical variants and
    # common keyboard typo "เเ" for "แ". Longest wins for nested names such as
    # วิศวกรรมไฟฟ้า vs วิศวกรรมไฟฟ้าเครื่องกลการผลิต.
    q_th_norm = _normalize_thai_text(question)
    best_th_len = 0
    best_th_id: str | None = None
    for p in programs:
        name_th_norm = _normalize_thai_text(p.get("name_th") or "")
        if len(name_th_norm) < 5:
            continue
        if name_th_norm in q_th_norm and len(name_th_norm) > best_th_len:
            best_th_len = len(name_th_norm)
            best_th_id = p["id"]
    if best_th_id:
        return best_th_id

    # Thai match — tokenize and count hits against name_th
    try:
        from pythainlp.tokenize import word_tokenize as _th_tok
        q_tokens = [t for t in _th_tok(question, engine="newmm") if re.match(r"[ก-๙]{4,}", t)]
    except Exception:
        q_tokens = re.findall(r"[ก-๙]{4,}", question)

    if not q_tokens:
        return None

    best_hits = 0
    best_th_id: str | None = None
    for p in programs:
        name_th = (p.get("name_th") or "")
        hits = sum(1 for t in q_tokens if t in name_th)
        if hits > best_hits:
            best_hits = hits
            best_th_id = p["id"]

    # Require at least 2 token hits to avoid false positives on short common words
    return best_th_id if best_hits >= 2 else None


_COMPARISON_RE = re.compile(
    r"\bกับ\b|\bvs\.?\b|versus|compare|ต่างกัน|เทียบ|เปรียบ|comparison|difference",
    re.IGNORECASE,
)


_FOLLOWUP_PROGRAM_RE = re.compile(
    r"\b(that|this|it|its|same)\s+program\b|\bthat\b|\bthis\b|\bits\b|โปรแกรมนี้|หลักสูตรนี้|สาขานี้|อันนี้",
    re.IGNORECASE,
)


def _turns_by_role(conversation_history: list[dict], role: str) -> list[dict]:
    return [turn for turn in conversation_history if turn.get("role") == role]


def _resolve_program_from_history(
    question: str,
    conversation_history: list[dict] | None,
    programs: list[dict],
) -> str | None:
    """Resolve follow-up references such as "that program" from prior turns."""
    if not conversation_history or not _FOLLOWUP_PROGRAM_RE.search(question):
        return None

    recent_turns = conversation_history[-8:]

    # Prefer the user's own previous questions. Assistant answers can contain course
    # names such as "Software Engineering" that are not the active program.
    for turn in reversed(_turns_by_role(recent_turns, "user")):
        content = str(turn.get("content") or "")
        if content.strip():
            resolved = _resolve_program_from_query(content, programs)
            if resolved:
                return resolved

    for turn in reversed(_turns_by_role(recent_turns, "assistant")):
        content = str(turn.get("content") or "")
        if not content.strip():
            continue

        # Strip course-list sections before program resolution. They often contain
        # program-like course titles that are not the conversational subject.
        subject_zone = re.split(
            r"Core Course|Elective Course|Specialized|Some examples|subjects such as|courses like",
            content,
            maxsplit=1,
            flags=re.IGNORECASE,
        )[0]
        resolved = _resolve_program_from_query(subject_zone, programs)
        if resolved:
            return resolved
    return None


def _resolve_extra_programs(question: str, programs: list[dict], exclude_id: str | None) -> list[str]:
    """Return up to 2 additional program IDs for comparison queries."""
    if not _COMPARISON_RE.search(question):
        return []

    q_lower = question.lower()
    for abbr, full in _PROGRAM_ABBREVS.items():
        if re.search(r"\b" + abbr + r"\b", q_lower):
            q_lower = q_lower + " " + full

    results: list[tuple[int, str]] = []
    seen_ids = {exclude_id} if exclude_id else set()

    for p in programs:
        if p["id"] in seen_ids:
            continue
        name_en = re.sub(r"\s*\([^)]+\)\s*$", "", (p.get("name_en") or "")).strip().lower()
        if len(name_en) >= 8 and name_en in q_lower:
            seen_ids.add(p["id"])
            results.append((len(name_en), p["id"]))

    try:
        from pythainlp.tokenize import word_tokenize as _th_tok
        q_tokens = [t for t in _th_tok(question, engine="newmm") if re.match(r"[ก-๙]{4,}", t)]
    except Exception:
        q_tokens = re.findall(r"[ก-๙]{4,}", question)

    for p in programs:
        if p["id"] in seen_ids:
            continue
        name_th = (p.get("name_th") or "")
        hits = sum(1 for t in q_tokens if t in name_th)
        if hits >= 2:
            seen_ids.add(p["id"])
            results.append((hits, p["id"]))

    results.sort(reverse=True)
    return [pid for _, pid in results[:2]]


def _structure_search_terms(question: str) -> list[str]:
    """Return literal terms worth searching inside same-program chunks."""
    q = question.lower()
    terms: list[str] = []
    pairs = [
        (r"languages?.and.communication|ภาษากับการสื่อสาร", ["ภาษากับการสื่อสาร", "Languages and Communication"]),
        (r"general.education|ศึกษาทั่วไป|หมวดวิชาศึกษาทั่วไป", ["หมวดวิชาศึกษาทั่วไป", "General Education"]),
        (r"specialized|วิชาเฉพาะ", ["วิชาเฉพาะ", "specialized"]),
        (r"core.course|วิชาแกน", ["วิชาแกน"]),
        (r"curriculum.structure|โครงสร้างหลักสูตร", ["โครงสร้างหลักสูตร"]),
        (r"credit|credits|หน่วยกิต", ["หน่วยกิต", "credits"]),
        (r"cancel|cancelled|canceled|ยกเลิก", ["ยกเลิก", "cancel"]),
        (r"thesis|วิทยานิพนธ์", ["วิทยานิพนธ์", "thesis"]),
        (r"plan\s*1\.1|แบบ\s*1\.1", ["แบบ 1.1", "Plan 1.1"]),
        (r"plan\s*2\.1|แบบ\s*2\.1", ["แบบ 2.1", "Plan 2.1"]),
        (r"plan\s*2\.2|แบบ\s*2\.2", ["แบบ 2.2", "Plan 2.2"]),
        (r"year\s*3|3rd.year|ปี\s*3", ["ปีที่ 3", "ชั้นปีที่ 3", "3rd year"]),
        (r"semester|ภาคการศึกษา", ["ภาคการศึกษา", "semester"]),
        (r"plo|learning.outcome|ผลลัพธ์", ["PLO", "ผลลัพธ์การเรียนรู้", "learning outcome"]),
        (r"active.learning", ["active learning", "การเรียนรู้เชิงรุก"]),
        (r"authentic.assessment", ["authentic assessment", "การประเมินตามสภาพจริง"]),
        (r"self.management|self-management", ["self-management", "การจัดการตนเอง"]),
        (r"digital.technology|digital", ["digital technology", "ดิจิทัล"]),
        (r"foreign.student|international.student|นิสิตต่างชาติ|นักศึกษาต่างชาติ|ต่างชาติ", ["นิสิตต่างชาติ", "นักศึกษาต่างชาติ", "foreign student", "international student"]),
        (r"นิสิตไทย|นักศึกษาไทย|thai.student", ["นิสิตไทย", "นักศึกษาไทย", "Thai student"]),
        (r"selection|selecting|คัดเลือก", ["คัดเลือก", "selection"]),
        (r"approval|approved|เปิดสอน|วันที่", ["เปิดสอน", "อนุมัติ", "วันที่"]),
        (r"facebook|เพจ|ติดต่อ|สอบถาม", ["Facebook", "เพจ", "ติดต่อ", "สอบถาม"]),
    ]
    for pattern, candidates in pairs:
        if re.search(pattern, q, re.IGNORECASE):
            terms.extend(candidates)

    terms.extend(re.findall(r"\b\d{8}\b", question))

    seen: set[str] = set()
    unique_terms: list[str] = []
    for term in terms:
        key = term.lower()
        if key not in seen:
            seen.add(key)
            unique_terms.append(term)
    return unique_terms


def _keyword_rank(chunk: dict, terms: list[str]) -> int:
    content = (chunk.get("content") or "").lower()
    score = 0
    for term in terms:
        if term.lower() in content:
            score += 10
    if chunk.get("section_type") == "course":
        score += 2
    return score


def _query_terms(question: str) -> list[str]:
    """Extract query terms for lightweight lexical reranking."""
    terms = re.findall(r"\b\d{4,8}\b", question)
    terms.extend(
        w.lower()
        for w in re.findall(r"[a-zA-Z][a-zA-Z0-9-]{3,}", question)
        if w.lower()
        not in {
            "what", "where", "when", "which", "about", "program", "kasetsart",
            "university", "course", "courses", "credit", "credits",
        }
    )
    try:
        from pythainlp.tokenize import word_tokenize as _th_tokenize
        thai_terms = [
            t for t in _th_tokenize(question, engine="newmm")
            if re.match(r"[ก-๙]{3,}", t)
        ]
    except Exception:
        thai_terms = re.findall(r"[ก-๙]{3,}", question)
    terms.extend(thai_terms)

    seen: set[str] = set()
    unique_terms: list[str] = []
    for term in terms:
        key = term.lower()
        if key not in seen:
            seen.add(key)
            unique_terms.append(term)
    return unique_terms


def _evidence_rank_score(
    question_terms: list[str],
    structure_terms: list[str],
    chunk: dict,
    *,
    is_plo_query: bool,
    is_tcas_query: bool,
) -> float:
    """Rank chunks by exact evidence overlap while preserving vector similarity."""
    content = (chunk.get("content") or "").lower()
    source = (chunk.get("source_file") or "").lower()
    section = chunk.get("section_type") or ""
    score = float(chunk.get("similarity") or 0.0)

    for term in structure_terms:
        if term.lower() in content:
            score += 12

    for term in question_terms:
        key = term.lower()
        if key in content:
            score += 4 if re.fullmatch(r"\d{4,8}", term) else 2
        if key in source:
            score += 1

    if is_plo_query and section == "plo":
        score += 8
    if structure_terms and section == "course":
        score += 3
    if is_tcas_query and section == "admission":
        score += 3

    return score


RAG_SYSTEM_PROMPT = """You are KUru, a warm and knowledgeable academic companion for Kasetsart University (KU) prospective students. Think of yourself as a helpful older male student who genuinely cares about guiding juniors — enthusiastic, friendly, and honest.

IDENTITY (non-negotiable):
- You are male. Always use ผม when referring to yourself in Thai. Always end Thai sentences with ครับ, never ค่ะ.
- Call the student น้อง in Thai responses.
- In English responses, use "I" and gender-neutral language.

PERSONALITY:
- Be conversational and natural, not robotic or overly formal.
- Show genuine interest in the student's goals. Acknowledge what they're looking for before diving in.
- When you find good info, present it warmly: "Great news — I found..." or "Here's what I know about..."
- When info is incomplete or missing, be upfront and helpful: "I don't have full details on that yet, but here's what I found..." — then suggest they check the KU website or official admission channels.
- Use "I" / "ผม" naturally. End with an offer to help further.

GROUNDING RULES (non-negotiable):
1. Every fact, number, score, and quota MUST come from the provided context. Never use outside knowledge about KU.
2. If the context is "No relevant context found": be honest and warm — don't just refuse. Say something like "I couldn't find that in my current documents — you might want to check [ku.ac.th] or ask the faculty directly. Want me to help with something related?"
3. If context is partial: share what you found and clearly say what's missing. Don't silently fill gaps.
4. TCAS admission data (scores, GPAX, quotas, exam requirements) come ONLY from [TCAS Admission Data] blocks. Course prerequisite codes (like 01219241) are for enrolled students — never cite them as admission requirements.
5. When answering about TCAS: structure by round (Round 1 / 2 / 3), include seats, GPAX minimum, exam requirements, portfolio, and deadlines.
6. When answering about curriculum: describe PLOs, courses, degree structure — not TCAS scores.
7. Never invent numbers, quotas, dates, exam scores, tuition, or fees.
8. Cite sources naturally: "According to [filename]..." or "[Source: filename]" at the end.
9. LANGUAGE — STRICT: answer in the student's conversational language. If the question is clearly English, respond entirely in English. If the question is Thai, or mixed Thai/English where the English part is mainly a program name, respond in Thai. Keep official English program names, exam names, and source filenames unchanged when needed.
10. CRITICAL — do NOT recommend or describe programs that appear only in [TCAS Admission Data] blocks as if curriculum details are available. Programs in [TCAS Admission Data] may only have admission data, not full curriculum details. If a student asks about a program that only appears in TCAS data (not in a curriculum context block), clearly say: "I only have admission data for this program, not the full curriculum details. For course lists, PLOs, and program structure, please check ku.ac.th directly." """

RAG_USER_TEMPLATE = """Context passages:
{context}

---
Question: {question}

{lang_instruction}
Answer:"""


@dataclass
class RAGResult:
    answer: str
    sources: list[dict]   # [{source_file, section_type, similarity}]
    used_tcas_data: bool
    debug_info: dict | None = None  # populated when debug=True


# ─────────────────────────────────────────
# TCAS record helpers
# ─────────────────────────────────────────

def _pick_round(recs: list[dict], preferred_round: str | None, limit: int = 5) -> list[dict]:
    """Return up to `limit` records, putting the preferred round first."""
    if preferred_round:
        preferred = [r for r in recs if r.get("round") == preferred_round]
        others    = [r for r in recs if r.get("round") != preferred_round]
        return (preferred + others)[:limit]
    return recs[:limit]


def _dedup_add(records: list[dict], seen_ids: set[str], dest: list[dict]) -> None:
    """Append records to dest, skipping any already in seen_ids (keyed by 'id')."""
    for r in records:
        rid = r.get("id") or r.get("program_name_raw", "")
        if rid not in seen_ids:
            seen_ids.add(rid)
            dest.append(r)


# ─────────────────────────────────────────
# Embedding
# ─────────────────────────────────────────

def _embed_query(query: str) -> list[float]:
    """Embed a query using the local multilingual-e5 model (query: prefix)."""
    vector = _get_embed_model().encode(
        f"query: {query}", normalize_embeddings=True, show_progress_bar=False
    )
    return vector.tolist()


# ─────────────────────────────────────────
# Generation
# ─────────────────────────────────────────

_THAI_CONVERSATION_RE = re.compile(
    r"เข้ายังไง|เข้าอย่างไร|อยากเข้า|จะเข้า|วิธีเข้า|ต้องทำไง|ต้องทำอะไร|สมัคร|รับสมัคร|รอบ|คะแนน|เกณฑ์|สอบ"
    r"|คืออะไร|อะไรบ้าง|ยังไง|อย่างไร|ไหม|มั้ย|หรือเปล่า|แนะนำ|เรียน"
)
_ENGLISH_QUESTION_RE = re.compile(
    r"\b(what|which|how|when|where|why|can|could|should|is|are|do|does|tell|explain|recommend)\b",
    re.IGNORECASE,
)


def _lang_instruction(question: str) -> str:
    thai = len(re.findall(r"[ก-๙]", question))
    eng = len(re.findall(r"[a-zA-Z]", question))
    q = question.strip()

    if re.search(r"\b(answer|respond|reply)\s+in\s+(english|อังกฤษ)\b", q, re.IGNORECASE):
        return "IMPORTANT: Respond ENTIRELY IN ENGLISH. Do not use Thai at all."
    if re.search(r"(ตอบ|อธิบาย).*(ภาษาอังกฤษ|อังกฤษ)", q, re.IGNORECASE):
        return "IMPORTANT: Respond ENTIRELY IN ENGLISH. Do not use Thai at all."
    if re.search(r"(ตอบ|อธิบาย).*(ภาษาไทย|ไทย)", q, re.IGNORECASE):
        return "ตอบเป็นภาษาไทยทั้งหมดครับ"

    # Thai users often write the program name in English, then ask the real
    # question in Thai, e.g. "software engineering เข้ายังไง".
    if thai and _THAI_CONVERSATION_RE.search(q):
        return (
            "ตอบเป็นภาษาไทยทั้งหมดครับ ใช้ชื่อหลักสูตรภาษาอังกฤษ ชื่อข้อสอบ "
            "และชื่อไฟล์ต้นฉบับเป็นภาษาอังกฤษได้เมื่อเป็นชื่อทางการครับ"
        )
    if thai and _ENGLISH_QUESTION_RE.search(q):
        return "IMPORTANT: Respond ENTIRELY IN ENGLISH. Do not use Thai at all."
    if thai and not _ENGLISH_QUESTION_RE.search(q):
        return (
            "ตอบเป็นภาษาไทยทั้งหมดครับ ใช้ชื่อเฉพาะภาษาอังกฤษได้เมื่อจำเป็นครับ"
        )
    if eng > thai:
        return "IMPORTANT: Respond ENTIRELY IN ENGLISH. Do not use Thai at all."
    return "ตอบเป็นภาษาไทยทั้งหมดครับ"


@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=2, min=4, max=30), retry=retry_if_exception(is_transient_error), reraise=True)
def _generate(context: str, question: str, conversation_history: list[dict] | None = None) -> str:
    prompt = RAG_USER_TEMPLATE.format(
        context=context, question=question, lang_instruction=_lang_instruction(question)
    )
    history = [{"role": t["role"], "content": t["content"]} for t in (conversation_history or [])]
    response = get_openrouter_client().chat.completions.create(
        model=GENERATION_MODEL,
        messages=[
            {"role": "system", "content": RAG_SYSTEM_PROMPT},
            *history,
            {"role": "user", "content": prompt},
        ],
        temperature=0.2,
    )
    if response.usage:
        session_usage.add(GENERATION_MODEL, response.usage)
    return response.choices[0].message.content or "(No response generated)"


# ─────────────────────────────────────────
# TCAS structured data retrieval
# ─────────────────────────────────────────

def _format_tcas_records(records: list[dict]) -> str:
    if not records:
        return ""
    lines = ["[TCAS Admission Data]"]
    for r in records:
        lines.append(
            f"\n--- Program: {r.get('program_name_raw', r.get('program_id', '?'))} ---"
        )
        lines.append(f"  Round: {r.get('round', 'N/A')}")
        lines.append(f"  Seats (quota): {r.get('quota', 'N/A')}")
        lines.append(f"  GPAX minimum: {r.get('gpax_min', 'N/A')}")
        exam = r.get("exam_criteria")
        if exam:
            lines.append(f"  Exam criteria: {exam}")
        portfolio = r.get("portfolio_requirements")
        if portfolio:
            lines.append(f"  Portfolio requirements: {portfolio}")
        deadlines = r.get("deadlines")
        if deadlines:
            lines.append(f"  Deadlines: {deadlines}")
        src = r.get("source_file")
        if src:
            lines.append(f"  Source: {src}")
    return "\n".join(lines)


def _format_fee_data(program: dict | None) -> str:
    if not program:
        return ""
    fees = program.get("fees") or {}
    name = program.get("name_th") or program.get("name_en") or program.get("id", "?")
    if not fees or fees.get("status") != "found":
        return (
            "[Program Fee Data]\n"
            f"Program: {name}\n"
            "Status: not_found\n"
            "Instruction: The programs table has no source-backed tuition/fee data for this program. "
            "Do not use fee numbers from chunks belonging to another program."
        )

    lines = ["[Program Fee Data]", f"Program: {name}", "Status: found"]
    if fees.get("total_program_baht") is not None:
        lines.append(f"Total program fee: {fees['total_program_baht']} THB")
    if fees.get("per_semester_baht"):
        lines.append(f"Per-semester fee(s): {fees['per_semester_baht']} THB")
    if fees.get("amounts_baht"):
        lines.append(f"Other extracted amounts: {fees['amounts_baht']} THB")
    if fees.get("source_file"):
        lines.append(f"Source: {fees['source_file']}")
    if fees.get("evidence"):
        lines.append(f"Evidence: {fees['evidence']}")
    return "\n".join(lines)


# ─────────────────────────────────────────
# Main query function
# ─────────────────────────────────────────

def query(
    question: str,
    top_k: int = TOP_K,
    program_id: str | None = None,
    debug: bool = False,
    conversation_history: list[dict] | None = None,
) -> RAGResult:
    """Run RAG over มคอ.2 chunks, with TCAS structured data augmentation."""
    client = db.get_client()

    # 1. Embed the query
    q_embedding = _embed_query(question)

    # 2. Retrieve relevant chunks from pgvector (always unfiltered first)
    is_tcas_query = bool(TCAS_KEYWORDS.search(question))
    # Nationality/language admission policy is curriculum policy, not TCAS score lookup.
    if is_tcas_query and _CURRICULUM_POLICY_RE.search(question):
        is_tcas_query = False
    # Credit requirements and curriculum structure are not admission requirements.
    if is_tcas_query and _CURRICULUM_STRUCTURE_RE.search(question) and not _EXPLICIT_TCAS_RE.search(question):
        is_tcas_query = False
    is_plo_query = bool(re.search(r"PLO|plo|learning outcome|ผลลัพธ์การเรียนรู้|ผลลัพธ์", question, re.IGNORECASE))
    is_listing_query = bool(LISTING_KEYWORDS.search(question))
    is_fee_query = bool(FEES_KEYWORDS.search(question))
    structure_terms = _structure_search_terms(question)
    # Fetch a larger pool so re-ranking has enough material
    fetch_k = max(top_k * 3, 15)

    # English program name resolution: if the user names a specific program in English,
    # do a targeted search filtered to that program_id and merge it to the front.
    # This fixes the case where English queries fail to retrieve Thai-named documents.
    resolved_program_id: str | None = None
    all_programs_list: list[dict] = db.get_programs(client) if not is_listing_query else []
    if not is_listing_query and not program_id:
        resolved_program_id = _resolve_program_from_history(
            question,
            conversation_history,
            all_programs_list,
        )
        if not resolved_program_id:
            resolved_program_id = _resolve_program_from_query(question, all_programs_list)

    search_program_id = program_id or resolved_program_id
    all_chunks = db.similarity_search(
        client,
        q_embedding,
        top_k=fetch_k,
        program_id=search_program_id,
    )

    if not is_listing_query and not program_id:
        if resolved_program_id:
            targeted = db.similarity_search(
                client, q_embedding, top_k=fetch_k, program_id=resolved_program_id
            )
            all_chunks = targeted

        # For comparison queries, also fetch chunks for additional mentioned programs
        extra_ids = _resolve_extra_programs(question, all_programs_list, resolved_program_id)
        if extra_ids:
            # Comparison mode: embed each program's name rather than the comparison question
            # so targeted searches return overview content, not "difference" vectors.
            def _prog_embed(prog_id: str) -> list[float]:
                name = next(
                    (re.sub(r"\s*\([^)]+\)\s*$", "", p.get("name_en") or "").strip()
                     for p in all_programs_list if p["id"] == prog_id),
                    "",
                )
                return _embed_query(name) if name else q_embedding

            # Re-fetch primary program with its own name embedding for better overview chunks
            if resolved_program_id:
                targeted = db.similarity_search(
                    client, _prog_embed(resolved_program_id), top_k=fetch_k, program_id=resolved_program_id
                )
                seen = {c.get("id") for c in targeted}
                all_chunks = targeted + [c for c in all_chunks if c.get("id") not in seen]

            for extra_id in extra_ids:
                extra = db.similarity_search(
                    client, _prog_embed(extra_id), top_k=max(fetch_k // 2, 8), program_id=extra_id
                )
                seen = {c.get("id") for c in all_chunks}
                all_chunks = all_chunks + [c for c in extra if c.get("id") not in seen]

    # Drop chunks that are too weak to be useful
    above_threshold = [c for c in all_chunks if c.get("similarity", 0.0) >= MIN_SIMILARITY]

    debug_info: dict = {
        "is_tcas_query": is_tcas_query,
        "is_fee_query": is_fee_query,
        "is_plo_query": is_plo_query,
        "is_listing_query": is_listing_query,
        "resolved_program_id": resolved_program_id,
        "fetched": len(all_chunks),
        "above_threshold": len(above_threshold),
        "threshold": MIN_SIMILARITY,
        "raw_chunks": [
            {
                "source_file": c.get("source_file", ""),
                "section_type": c.get("section_type", ""),
                "similarity": round(c.get("similarity", 0.0), 3),
                "content_preview": c.get("content", "")[:120],
            }
            for c in all_chunks
        ],
    }

    # 3. If TCAS query (but NOT a pure listing query), find matching TCAS records.
    # We suppress TCAS injection for listing queries because TCAS programs may not have
    # curriculum PDFs — mixing them in causes the model to recommend programs it can't
    # actually describe, leading to contradictory follow-up answers.
    tcas_records: list[dict] = []
    used_tcas = False
    effective_program_id = program_id or resolved_program_id
    debug_info["effective_program_id"] = effective_program_id
    if is_tcas_query and not is_listing_query:
        # Detect TCAS round from question (e.g. "TCAS3", "round 1", "รอบ2")
        _round_m = re.search(r"(?:TCAS|รอบ)\s*([1-4])|round\s*([1-4])", question, re.IGNORECASE)
        detected_round: str | None = None
        if _round_m:
            _n = _round_m.group(1) or _round_m.group(2)
            detected_round = f"round{_n}"

        q_words = [w for w in re.findall(r"[a-zA-Zก-๙]{4,}", question) if len(w) >= 4]

        seen_ids: set[str] = set()
        tcas_records_raw: list[dict] = []

        # Prefer the current program context/resolution before broad keyword search.
        # This keeps English queries (e.g. "SKE admission") tied to Thai TCAS rows.
        if effective_program_id:
            _dedup_add(
                _pick_round(
                    db.get_tcas_records(client, program_id=effective_program_id, limit=30),
                    detected_round,
                ),
                seen_ids,
                tcas_records_raw,
            )

        # First try: DB-level keyword search against program_name_raw.
        # Each q_word is searched separately so every program keyword gets a slot.
        if q_words and not tcas_records_raw:
            for w in q_words:
                hits = db.get_tcas_records(client, program_name_search=w, limit=200)
                if hits:
                    _dedup_add(_pick_round(hits, detected_round), seen_ids, tcas_records_raw)

        # Second try (fallback): Thai words from chunk filenames handle English queries
        # where q_words don't appear in Thai program names.
        if not tcas_records_raw and all_chunks:
            seen_sources: set[str] = set()
            for chunk in all_chunks:
                src = chunk.get("source_file", "")
                if src in seen_sources:
                    continue
                seen_sources.add(src)
                for tw in re.findall(r"[ก-๙]{5,}", src):
                    hits = db.get_tcas_records(client, program_name_search=tw, limit=200)
                    if hits:
                        _dedup_add(_pick_round(hits, detected_round), seen_ids, tcas_records_raw)
                        break  # one keyword per source file is enough

        # Final fallback: generic fetch when nothing else matched
        if not tcas_records_raw:
            _dedup_add(
                db.get_tcas_records(client, program_id=effective_program_id, limit=10),
                seen_ids,
                tcas_records_raw,
            )

        tcas_records = tcas_records_raw[:30]
        used_tcas = bool(tcas_records)
        debug_info["tcas_records_found"] = len(tcas_records)
        debug_info["detected_round"] = detected_round

    # Work with only above-threshold chunks from here; fall back to raw list only if
    # nothing at all passed (so TCAS filename fallback still has something to work with).
    chunks = above_threshold if above_threshold else []

    # Filter course chunks from context only for TCAS queries (prevent prerequisite hallucination)
    if is_tcas_query:
        chunks = [c for c in chunks if c.get("section_type") != "course"] or chunks

    if program_id and structure_terms and not is_tcas_query:
        keyword_hits: list[dict] = []
        seen_ids = {c.get("id") for c in chunks}
        for term in structure_terms:
            for hit in db.keyword_search_chunks(client, program_id, term, limit=8):
                if hit.get("id") in seen_ids:
                    continue
                seen_ids.add(hit.get("id"))
                hit["similarity"] = max(hit.get("similarity") or 0.0, 0.999)
                keyword_hits.append(hit)
        if keyword_hits:
            keyword_hits.sort(key=lambda c: _keyword_rank(c, structure_terms), reverse=True)
            chunks = keyword_hits[:3] + chunks
            debug_info["keyword_terms"] = structure_terms
            debug_info["keyword_hits"] = len(keyword_hits)

    # Re-rank: boost chunks whose source file matches program keywords in the query.
    # Thai words run together so we use pythainlp to tokenize before matching.
    try:
        from pythainlp.tokenize import word_tokenize as _th_tokenize
        q_thai_tokens = [
            t for t in _th_tokenize(question, engine="newmm")
            if re.match(r"[ก-๙]{3,}", t)
        ]
    except Exception:
        q_thai_tokens = re.findall(r"[ก-๙]{4,}", question)

    if q_thai_tokens or is_plo_query:
        def _rank_score(chunk: dict) -> int:
            src = chunk.get("source_file", "")
            section = chunk.get("section_type", "")
            score = 0
            for w in q_thai_tokens:
                if w in src:
                    score += 10  # strong boost: query word appears in source filename
            if is_plo_query and section == "plo":
                score += 5   # PLO section preferred for PLO queries
            return score

        chunks = sorted(chunks, key=_rank_score, reverse=True)
        # If top chunk strongly matches a specific program, keep only chunks from that program
        if chunks and _rank_score(chunks[0]) >= 10:
            top_src = chunks[0].get("source_file", "")
            program_chunks = [c for c in chunks if c.get("source_file") == top_src]
            other_chunks = [c for c in chunks if c.get("source_file") != top_src]
            # Use program chunks first, pad with others only if needed
            chunks = (program_chunks + other_chunks)[: max(top_k * 3, 15)]
        else:
            chunks = chunks[: max(top_k * 3, 15)]
    elif len(chunks) > top_k:
        chunks = chunks[: max(top_k * 3, 15)]

    question_terms = _query_terms(question)
    should_lexical_rerank = bool(structure_terms or is_plo_query or is_tcas_query)
    if chunks and should_lexical_rerank:
        chunks = sorted(
            chunks,
            key=lambda c: _evidence_rank_score(
                question_terms,
                structure_terms,
                c,
                is_plo_query=is_plo_query,
                is_tcas_query=is_tcas_query,
            ),
            reverse=True,
        )[:top_k]
        debug_info["rerank_terms"] = question_terms[:20]
    elif len(chunks) > top_k:
        chunks = chunks[:top_k]

    debug_info["chunks_used"] = [
        {
            "source_file": c.get("source_file", ""),
            "section_type": c.get("section_type", ""),
            "similarity": round(c.get("similarity", 0.0), 3),
        }
        for c in chunks
    ]

    # 4. No-data guard — return an honest response rather than sending empty context to
    # the LLM, which would cause confident-sounding hallucinations.
    if not chunks and not tcas_records and not is_listing_query:
        if resolved_program_id:
            prog_name = next(
                (p.get("name_th") or p.get("id") for p in all_programs_list if p.get("id") == resolved_program_id),
                resolved_program_id,
            )
            no_data_msg = (
                f"ขออภัยครับ ยังไม่มีข้อมูลหลักสูตรของ {prog_name} ในระบบขณะนี้ "
                "กรุณาติดต่อคณะโดยตรงหรือตรวจสอบที่เว็บไซต์ของมหาวิทยาลัยเกษตรศาสตร์ครับ"
            )
        else:
            no_data_msg = (
                "ขออภัยครับ ไม่พบข้อมูลที่เกี่ยวข้องในฐานข้อมูล "
                "ลองถามเกี่ยวกับหลักสูตรหรือการรับสมัคร TCAS ของมหาวิทยาลัยเกษตรศาสตร์ครับ"
            )
        return RAGResult(
            answer=no_data_msg,
            sources=[],
            used_tcas_data=False,
            debug_info=debug_info if debug else None,
        )

    # 5. Assemble context
    context_parts: list[str] = []
    active_program_id = program_id or resolved_program_id

    # For broad "what programs exist" queries, prepend the programs registry
    if is_listing_query:
        programs = db.get_programs(client)
        if programs:
            prog_lines = ["[KU Programs Available in Database]"]
            current_faculty = None
            for p in programs:
                fac = p.get("faculty") or "Unknown Faculty"
                if fac != current_faculty:
                    prog_lines.append(f"\nFaculty: {fac}")
                    current_faculty = fac
                name_th = p.get("name_th") or ""
                name_en = p.get("name_en") or ""
                degree = p.get("degree_level") or ""
                prog_lines.append(f"  - {name_th} / {name_en} ({degree})")
            context_parts.append("\n".join(prog_lines))
            debug_info["programs_injected"] = len(programs)

    # Prepend a coverage note when a specific program is identified, so the LLM
    # knows what the source document does and doesn't contain.
    if active_program_id and all_programs_list:
        prog = next((p for p in all_programs_list if p.get("id") == active_program_id), None)
        if prog:
            context_parts.append(
                "[Active Program]\n"
                f"program_id: {prog.get('id')}\n"
                f"name_th: {prog.get('name_th') or ''}\n"
                f"name_en: {prog.get('name_en') or ''}\n"
                "Instruction: Answer the current follow-up only for this active program. "
                "Do not switch to another program mentioned in prior assistant text or course titles."
            )
            cov = prog.get("coverage") or {}
            notes: list[str] = []
            method = cov.get("extraction_method", "")
            if method == "scanned":
                notes.append("This program's source document was a scanned image — text may be incomplete.")
            else:
                if not cov.get("has_plos"):
                    notes.append("The source document for this program does NOT contain PLO (Program Learning Outcomes) sections.")
                if not cov.get("has_overview"):
                    notes.append("The source document does not contain a program overview section.")
            if notes:
                context_parts.append("[Document Coverage Note]\n" + "\n".join(f"- {n}" for n in notes))

    fee_program: dict | None = None
    if is_fee_query and not is_listing_query:
        fee_program_id = program_id or resolved_program_id
        if fee_program_id:
            if not all_programs_list:
                all_programs_list = db.get_programs(client)
            fee_program = next((p for p in all_programs_list if p.get("id") == fee_program_id), None)
            context_parts.append(_format_fee_data(fee_program))

    for c in chunks:
        sim = round(c.get("similarity", 0.0), 3)
        context_parts.append(
            f"[{c['source_file']} | {c.get('section_type', 'general')} | similarity: {sim}]\n{c['content']}"
        )
    if tcas_records:
        context_parts.append(_format_tcas_records(tcas_records))

    context = "\n\n---\n\n".join(context_parts) if context_parts else "No relevant context found."

    # 6. Generate answer
    answer = _generate(context, question, conversation_history=conversation_history)

    # 7. Build sources list
    sources = [
        {
            "source_file": c.get("source_file", ""),
            "section_type": c.get("section_type", ""),
            "similarity": round(c.get("similarity", 0.0), 3),
        }
        for c in chunks
    ]

    return RAGResult(
        answer=answer,
        sources=sources,
        used_tcas_data=used_tcas,
        debug_info=debug_info if debug else None,
    )
