from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse

from core.supabase import get_supabase
from models.schemas import (
    ApiResponse,
    PloItem,
    ProgramDetail,
    ProgramSearchResult,
    ProgramSummary,
    SourceChunk,
    TcasRound,
)

router = APIRouter()

# Maps keyword in name_en → (faculty_th, faculty_en)
_FACULTY_MAP: list[tuple[str, str, str]] = [
    ("Engineering", "คณะวิศวกรรมศาสตร์", "Faculty of Engineering"),
    ("Veterinary", "คณะสัตวแพทยศาสตร์", "Faculty of Veterinary Medicine"),
    ("Animal Nursing", "คณะสัตวแพทยศาสตร์", "Faculty of Veterinary Medicine"),
    ("Nursing Science", "คณะพยาบาลศาสตร์", "Faculty of Nursing Science"),
    ("Agronomy", "คณะเกษตร", "Faculty of Agriculture"),
    ("Horticulture", "คณะเกษตร", "Faculty of Agriculture"),
    ("Agriculture", "คณะเกษตร", "Faculty of Agriculture"),
    ("Fisheries", "คณะประมง", "Faculty of Fisheries"),
    ("Forestry", "คณะวนศาสตร์", "Faculty of Forestry"),
    ("Earth Science", "คณะวิทยาศาสตร์", "Faculty of Science"),
    ("Science of the Land", "คณะวิทยาศาสตร์", "Faculty of Science"),
    ("Bioscience", "คณะวิทยาศาสตร์", "Faculty of Science"),
    ("Physics", "คณะวิทยาศาสตร์", "Faculty of Science"),
    ("Geography", "คณะสังคมศาสตร์", "Faculty of Social Sciences"),
    ("Psychology", "คณะสังคมศาสตร์", "Faculty of Social Sciences"),
    ("Sociology", "คณะสังคมศาสตร์", "Faculty of Social Sciences"),
    ("Southeast Asian", "คณะสังคมศาสตร์", "Faculty of Social Sciences"),
    ("Political Science", "คณะสังคมศาสตร์", "Faculty of Social Sciences"),
    ("Public Administration", "คณะสังคมศาสตร์", "Faculty of Social Sciences"),
    ("History", "คณะสังคมศาสตร์", "Faculty of Social Sciences"),
    ("Law", "คณะนิติศาสตร์", "Faculty of Law"),
    ("Aviation", "คณะอุตสาหกรรมการบิน", "Faculty of Aviation Industry"),
    ("Management", "คณะบริหารธุรกิจ", "Faculty of Business Administration"),
    ("Finance", "คณะบริหารธุรกิจ", "Faculty of Business Administration"),
    ("Economics", "คณะเศรษฐศาสตร์", "Faculty of Economics"),
    ("French", "คณะมนุษยศาสตร์", "Faculty of Humanities"),
    ("English", "คณะมนุษยศาสตร์", "Faculty of Humanities"),
    ("Architecture", "คณะสถาปัตยกรรมศาสตร์", "Faculty of Architecture"),
]

# Overrides for programs whose name_th in the DB is a document artifact
_NAME_TH_OVERRIDES: dict[str, str] = {
    "earth-science": "วิทยาศาสตร์พื้นพิภพ",
    "nursing": "พยาบาลศาสตร์",
    "law": "นิติศาสตร์",
    "ske-intl": "วิศวกรรมซอฟต์แวร์และความรู้ (นานาชาติ)",
}

_DEGREE_MAP: dict[str, str] = {
    "bachelor": "ปริญญาตรี",
    "master": "ปริญญาโท",
    "doctoral": "ปริญญาเอก",
    "doctor": "ปริญญาเอก",
}


def _derive_faculty(name_en: str) -> tuple[str, str]:
    for keyword, th, en in _FACULTY_MAP:
        if keyword.lower() in name_en.lower():
            return th, en
    return "มหาวิทยาลัยเกษตรศาสตร์", "Kasetsart University"


def _row_to_summary(row: dict) -> ProgramSummary:
    name_en = row.get("name_en") or ""
    slug = row.get("slug") or ""
    name_th = _NAME_TH_OVERRIDES.get(slug) or row.get("name_th") or name_en
    faculty_th, faculty_en = _derive_faculty(name_en)
    degree_raw = (row.get("degree_level") or "bachelor").lower()
    degree = _DEGREE_MAP.get(degree_raw, degree_raw)
    return ProgramSummary(
        id=row["id"],
        slug=slug or row["id"],
        name_th=name_th,
        name_en=name_en,
        faculty_th=faculty_th,
        faculty_en=faculty_en,
        degree=degree,
        campus="บางเขน",
        match_score=1.0,
        year_by_year_vibe=row.get("year_by_year_vibe") or "",
    )


def _row_to_plo(p: dict) -> PloItem | None:
    desc = p.get("description") or p.get("description_th") or ""
    if not desc:
        return None
    return PloItem(
        code=str(p.get("id") or p.get("code") or "PLO"),
        description_th=desc,
    )


@router.get("/search", response_model=ApiResponse[ProgramSearchResult])
async def search_programs(
    q: str = Query(default=""),
    faculty: str | None = Query(default=None),
    limit: int = Query(default=100, ge=1, le=200),
) -> ApiResponse[ProgramSearchResult]:
    sb = get_supabase()
    db_query = sb.table("programs").select(
        "id,name_th,name_en,degree_level,slug,year_by_year_vibe"
    )

    if q:
        db_query = db_query.or_(f"name_th.ilike.%{q}%,name_en.ilike.%{q}%")

    # Fetch more than `limit` so the slug post-filter doesn't starve results
    response = db_query.order("name_th").limit(500).execute()
    rows = response.data or []
    # Restrict to the 20 curated programs (those with a slug assigned)
    rows = [r for r in rows if r.get("slug") and (r.get("name_th") or r.get("name_en"))]

    results = [_row_to_summary(row) for row in rows[:limit]]

    if faculty:
        fl = faculty.lower()
        results = [
            r for r in results
            if fl in r.faculty_en.lower() or fl in r.faculty_th.lower()
        ]

    return ApiResponse[ProgramSearchResult](
        data=ProgramSearchResult(results=results, total=len(results)),
        sources=[
            SourceChunk(
                table="programs",
                row_id="*",
                excerpt="text search over programs table",
            )
        ],
    )


@router.get("/{identifier}")
async def get_program(identifier: str) -> JSONResponse:
    sb = get_supabase()

    # Try slug first, fall back to hash ID
    response = sb.table("programs").select("*").eq("slug", identifier).execute()
    if not response.data:
        response = sb.table("programs").select("*").eq("id", identifier).execute()

    if not response.data:
        return JSONResponse(
            status_code=404,
            content={"data": None, "sources": [], "error": "Program not found"},
        )

    row = response.data[0]
    program_id: str = row["id"]

    # PLOs from programs.plos JSONB — shape: [{id, category, description}, ...]
    plo_raw: list[dict] = row.get("plos") or []
    plos = [p for p in (_row_to_plo(item) for item in plo_raw if isinstance(item, dict)) if p]

    # TCAS from tcas_records table
    tcas_resp = (
        sb.table("tcas_records")
        .select("round,quota,gpax_min")
        .eq("program_id", program_id)
        .execute()
    )
    tcas_rounds = [
        TcasRound(
            round=t["round"],
            quota=t["quota"] or 0,
            min_score=t.get("gpax_min"),
        )
        for t in (tcas_resp.data or [])
    ]

    summary = _row_to_summary(row)
    detail = ProgramDetail(**summary.model_dump(), plos=plos, tcas_rounds=tcas_rounds)

    return JSONResponse(
        content=ApiResponse[ProgramDetail](
            data=detail,
            sources=[
                SourceChunk(
                    table="programs",
                    row_id=program_id,
                    excerpt=f"{row.get('name_th', '')} — {summary.faculty_th}",
                )
            ],
        ).model_dump()
    )
