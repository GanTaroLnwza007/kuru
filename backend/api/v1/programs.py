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
    limit: int = Query(default=20, ge=1, le=100),
) -> ApiResponse[ProgramSearchResult]:
    sb = get_supabase()
    query = sb.table("programs").select("*").eq("campus", "Bang Khen")

    if q:
        query = query.or_(f"name_th.ilike.%{q}%,name_en.ilike.%{q}%,faculty_th.ilike.%{q}%")

    if faculty:
        query = query.eq("faculty_en", faculty)

    response = query.order("name_th").limit(limit).execute()
    rows = response.data or []

    results = [
        ProgramSummary(
            **{
                k: v
                for k, v in row.items()
                if k in ProgramSummary.model_fields and k not in ("match_score", "year_by_year_vibe")
            },
            year_by_year_vibe=row.get("year_by_year_vibe") or "",
            match_score=1.0,
        )
        for row in rows
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

    # TODO: replace with Supabase join
    plos = [PloItem(**p) for p in stub["plos"]]  # type: ignore[arg-type]
    tcas_rounds = [TcasRound(**t) for t in stub["tcas_rounds"]]  # type: ignore[arg-type]

    detail = ProgramDetail(
        **{
            k: v
            for k, v in row.items()
            if k in ProgramSummary.model_fields and k not in ("match_score", "year_by_year_vibe")
        },
        year_by_year_vibe=row.get("year_by_year_vibe") or "",
        match_score=1.0,
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
                    excerpt=f"{row.get('name_th', '')} — {row.get('faculty_th', '')}",
                )
            ],
        ).model_dump()
    )
