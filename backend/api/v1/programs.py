import re

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

# Maps keywords in name_en → (faculty_th, faculty_en)
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
]

def _clean_name_th(raw: str, name_en: str) -> str:
    """Fall back to name_en when name_th contains no Thai characters (e.g. English-only PDF stems)."""
    if not re.search(r"[ก-๙]", raw):
        return name_en
    return raw


def _derive_faculty(name_en: str) -> tuple[str, str]:
    """Return (faculty_th, faculty_en) derived from the English program name."""
    for keyword, th, en in _FACULTY_MAP:
        if keyword.lower() in name_en.lower():
            return th, en
    return "มหาวิทยาลัยเกษตรศาสตร์", "Kasetsart University"


def _row_to_summary(row: dict) -> ProgramSummary:
    name_en = row.get("name_en") or ""
    name_th = _clean_name_th(row.get("name_th") or "", name_en)
    faculty_th, faculty_en = _derive_faculty(name_en)
    return ProgramSummary(
        id=row["id"],
        name_th=name_th,
        name_en=name_en,
        faculty_th=faculty_th,
        faculty_en=faculty_en,
        degree=row.get("degree_level") or "ปริญญาตรี",
        campus="บางเขน",
        match_score=1.0,
        year_by_year_vibe=row.get("year_by_year_vibe") or "",
    )

# TODO: replace with Supabase join
PROGRAM_STUBS: dict[str, dict[str, list[dict[str, object]]]] = {
    "ske": {
        "plos": [
            {
                "code": "PLO1",
                "description_th": "สามารถออกแบบและพัฒนาซอฟต์แวร์คุณภาพสูงโดยใช้กระบวนการวิศวกรรมซอฟต์แวร์ที่ทันสมัย",
            },
            {
                "code": "PLO2",
                "description_th": "สามารถประยุกต์ใช้เทคนิคปัญญาประดิษฐ์และการเรียนรู้ของเครื่องในการแก้ปัญหาทางวิศวกรรม",
            },
        ],
        "tcas_rounds": [
            {"round": "Portfolio", "quota": 40, "min_score": None},
            {"round": "Admission", "quota": 80, "min_score": 70.0},
        ],
    },
    "cpe": {
        "plos": [
            {
                "code": "PLO1",
                "description_th": "สามารถออกแบบและวิเคราะห์ระบบคอมพิวเตอร์ทั้งด้าน hardware และ software ได้อย่างบูรณาการ",
            },
            {
                "code": "PLO2",
                "description_th": "สามารถพัฒนาระบบฝังตัวและ IoT ที่ตอบสนองความต้องการในภาคอุตสาหกรรม",
            },
        ],
        "tcas_rounds": [
            {"round": "Portfolio", "quota": 30, "min_score": None},
            {"round": "Admission", "quota": 90, "min_score": 72.0},
        ],
    },
    "cs": {
        "plos": [
            {
                "code": "PLO1",
                "description_th": "สามารถวิเคราะห์อัลกอริทึมและโครงสร้างข้อมูลเพื่อแก้ปัญหาเชิงคำนวณที่ซับซ้อน",
            },
            {
                "code": "PLO2",
                "description_th": "สามารถพัฒนาซอฟต์แวร์และระบบสารสนเทศโดยใช้หลักการทางวิทยาการคอมพิวเตอร์",
            },
        ],
        "tcas_rounds": [
            {"round": "Portfolio", "quota": 25, "min_score": None},
            {"round": "Admission", "quota": 75, "min_score": 68.0},
        ],
    },
    "env_sci": {
        "plos": [
            {
                "code": "PLO1",
                "description_th": "สามารถวิเคราะห์และประเมินผลกระทบสิ่งแวดล้อมโดยใช้เครื่องมือทางวิทยาศาสตร์และเทคโนโลยี",
            },
            {
                "code": "PLO2",
                "description_th": "สามารถออกแบบแนวทางแก้ไขปัญหาสิ่งแวดล้อมอย่างยั่งยืนในบริบทของประเทศไทย",
            },
        ],
        "tcas_rounds": [
            {"round": "Portfolio", "quota": 20, "min_score": None},
            {"round": "Admission", "quota": 60, "min_score": 55.0},
        ],
    },
    "agronomy": {
        "plos": [
            {
                "code": "PLO1",
                "description_th": "สามารถจัดการระบบการผลิตพืชไร่อย่างมีประสิทธิภาพโดยคำนึงถึงความยั่งยืนทางการเกษตร",
            },
            {
                "code": "PLO2",
                "description_th": "สามารถประยุกต์ใช้เทคโนโลยีสมัยใหม่เพื่อเพิ่มผลผลิตและลดต้นทุนการเกษตร",
            },
        ],
        "tcas_rounds": [
            {"round": "Portfolio", "quota": 30, "min_score": None},
            {"round": "Admission", "quota": 70, "min_score": 45.0},
        ],
    },
    "horticulture": {
        "plos": [
            {
                "code": "PLO1",
                "description_th": "สามารถวางแผนและจัดการการผลิตพืชสวนทั้งไม้ผล ผัก และไม้ประดับอย่างมีคุณภาพ",
            },
            {
                "code": "PLO2",
                "description_th": "สามารถพัฒนาผลิตภัณฑ์จากพืชสวนและต่อยอดสู่ธุรกิจเกษตรอย่างสร้างสรรค์",
            },
        ],
        "tcas_rounds": [
            {"round": "Portfolio", "quota": 25, "min_score": None},
            {"round": "Admission", "quota": 55, "min_score": 43.0},
        ],
    },
    "bus_mgmt": {
        "plos": [
            {
                "code": "PLO1",
                "description_th": "สามารถวิเคราะห์สภาพแวดล้อมธุรกิจและกำหนดกลยุทธ์องค์กรในยุคดิจิทัลได้อย่างมีประสิทธิผล",
            },
            {
                "code": "PLO2",
                "description_th": "สามารถนำหลักการบริหารจัดการสมัยใหม่มาประยุกต์ใช้กับธุรกิจขนาดกลางและขนาดย่อมของไทย",
            },
        ],
        "tcas_rounds": [
            {"round": "Portfolio", "quota": 50, "min_score": None},
            {"round": "Admission", "quota": 120, "min_score": 60.0},
        ],
    },
    "bus_fin": {
        "plos": [
            {
                "code": "PLO1",
                "description_th": "สามารถวิเคราะห์และบริหารความเสี่ยงทางการเงินโดยใช้เครื่องมือเชิงปริมาณและแบบจำลองทางการเงิน",
            },
            {
                "code": "PLO2",
                "description_th": "สามารถประเมินมูลค่าสินทรัพย์และวางแผนการลงทุนในตลาดทุนไทยและตลาดโลกได้",
            },
        ],
        "tcas_rounds": [
            {"round": "Portfolio", "quota": 40, "min_score": None},
            {"round": "Admission", "quota": 100, "min_score": 63.0},
        ],
    },
    "english": {
        "plos": [
            {
                "code": "PLO1",
                "description_th": "สามารถใช้ภาษาอังกฤษในการสื่อสารระดับวิชาชีพทั้งการพูด การเขียน และการนำเสนอได้อย่างมีประสิทธิภาพ",
            },
            {
                "code": "PLO2",
                "description_th": "สามารถวิเคราะห์วรรณกรรมและสื่อภาษาอังกฤษในบริบทข้ามวัฒนธรรมได้อย่างลึกซึ้ง",
            },
        ],
        "tcas_rounds": [
            {"round": "Portfolio", "quota": 35, "min_score": None},
            {"round": "Admission", "quota": 65, "min_score": 58.0},
        ],
    },
    "sociology": {
        "plos": [
            {
                "code": "PLO1",
                "description_th": "สามารถวิเคราะห์ปรากฏการณ์สังคมและวัฒนธรรมไทยโดยใช้ทฤษฎีสังคมวิทยาและมานุษยวิทยา",
            },
            {
                "code": "PLO2",
                "description_th": "สามารถออกแบบและดำเนินการวิจัยทางสังคมศาสตร์ทั้งเชิงปริมาณและเชิงคุณภาพได้",
            },
        ],
        "tcas_rounds": [
            {"round": "Portfolio", "quota": 20, "min_score": None},
            {"round": "Admission", "quota": 50, "min_score": 48.0},
        ],
    },
}


@router.get("/search", response_model=ApiResponse[ProgramSearchResult])
async def search_programs(
    q: str = Query(default=""),
    faculty: str | None = Query(default=None),
    limit: int = Query(default=100, ge=1, le=200),
) -> ApiResponse[ProgramSearchResult]:
    sb = get_supabase()
    # The DB programs table uses actual columns: id, name_th, name_en, faculty, degree_level
    # "faculty" stores the campus name (e.g. "บางเขน"), not the faculty.
    db_query = sb.table("programs").select("id,name_th,name_en,degree_level,coverage")

    if q:
        db_query = db_query.or_(f"name_th.ilike.%{q}%,name_en.ilike.%{q}%")

    response = db_query.order("name_th").limit(limit).execute()
    rows = response.data or []

    # Filter out rows without any meaningful name (placeholder entries)
    rows = [r for r in rows if r.get("name_th") or r.get("name_en")]

    results = [_row_to_summary(row) for row in rows]

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


@router.get("/{program_id}")
async def get_program(program_id: str) -> JSONResponse:
    sb = get_supabase()
    response = sb.table("programs").select("*").eq("id", program_id).execute()
    rows = response.data or []

    if not rows:
        return JSONResponse(
            status_code=404,
            content={"data": None, "sources": [], "error": "Program not found"},
        )

    row = rows[0]
    stub = PROGRAM_STUBS.get(program_id, {"plos": [], "tcas_rounds": []})

    # TODO: replace with Supabase join for PLOs and TCAS
    plos = [PloItem(**p) for p in stub["plos"]]  # type: ignore[arg-type]
    tcas_rounds = [TcasRound(**t) for t in stub["tcas_rounds"]]  # type: ignore[arg-type]

    summary = _row_to_summary(row)
    detail = ProgramDetail(
        **summary.model_dump(),
        plos=plos,
        tcas_rounds=tcas_rounds,
    )

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
