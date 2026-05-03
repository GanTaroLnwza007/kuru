import uuid

from fastapi import APIRouter
from fastapi.responses import JSONResponse

from models.schemas import ApiResponse, ChatRequest, ChatResponse, SourceChunk

router = APIRouter()

_PROGRAM_NAMES: dict[str, str] = {
    "ske": "วิศวกรรมซอฟต์แวร์และความรู้",
    "cpe": "วิศวกรรมคอมพิวเตอร์",
    "cs": "วิทยาการคอมพิวเตอร์",
    "env_sci": "วิทยาศาสตร์และเทคโนโลยีสิ่งแวดล้อม",
    "agronomy": "เกษตรศาสตร์",
    "horticulture": "พืชสวน",
    "bus_mgmt": "การจัดการ",
    "bus_fin": "การเงิน",
    "english": "ภาษาอังกฤษ",
    "sociology": "สังคมวิทยาและมานุษยวิทยา",
}


@router.post("/chat")
async def chat(request: ChatRequest) -> JSONResponse:
    session_id = request.session_id or str(uuid.uuid4())

    if request.program_context_id:
        name = _PROGRAM_NAMES.get(
            request.program_context_id, request.program_context_id
        )
        answer = (
            f"โปรแกรม{name}มุ่งเน้นการพัฒนาทักษะที่ตอบโจทย์ตลาดงานในปัจจุบัน "
            f"นักศึกษาจะได้เรียนรู้ทั้งภาคทฤษฎีและปฏิบัติผ่านโครงงานจริงร่วมกับภาคอุตสาหกรรม "
            f"(โหมดทดสอบ)"
        )
    else:
        answer = (
            "มหาวิทยาลัยเกษตรศาสตร์มีหลักสูตรที่หลากหลายครอบคลุมทั้งสายวิทยาศาสตร์ "
            "วิศวกรรมศาสตร์ บริหารธุรกิจ และมนุษยศาสตร์ "
            "คุณสามารถใช้ระบบนี้เพื่อค้นหาหลักสูตรที่เหมาะกับความสนใจและเป้าหมายอาชีพของคุณ "
            "(โหมดทดสอบ)"
        )

    sources = [
        SourceChunk(
            table="programs",
            row_id=request.program_context_id or "*",
            excerpt="ข้อมูลหลักสูตรจากฐานข้อมูลมหาวิทยาลัยเกษตรศาสตร์",
        ),
        SourceChunk(
            table="plos",
            row_id=request.program_context_id or "*",
            excerpt="ผลลัพธ์การเรียนรู้ที่คาดหวัง (PLO) ของหลักสูตร",
        ),
    ]

    payload = ApiResponse[ChatResponse](
        data=ChatResponse(answer=answer, session_id=session_id),
        sources=sources,
    ).model_dump()

    return JSONResponse(content=payload, headers={"X-Mock-Response": "true"})
