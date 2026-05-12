"""Idempotent seed script for the programs table. Safe to run multiple times."""

from __future__ import annotations

import os

from supabase import Client, create_client

from _env import load_project_env

load_project_env(__file__)

PROGRAMS: list[dict[str, str]] = [
    {
        "id": "ske",
        "name_th": "วิศวกรรมซอฟต์แวร์และความรู้",
        "name_en": "Software and Knowledge Engineering",
        "faculty_th": "คณะวิศวกรรมศาสตร์",
        "faculty_en": "Engineering",
        "degree": "ปริญญาตรี",
        "campus": "Bang Khen",
        "year_by_year_vibe": (
            "ปี 1-2 วางรากฐาน CS และ Math อย่างหนัก "
            "ปี 3-4 เน้น project จริงกับ industry partner และ senior project ด้าน AI หรือ software engineering"
        ),
    },
    {
        "id": "cpe",
        "name_th": "วิศวกรรมคอมพิวเตอร์",
        "name_en": "Computer Engineering",
        "faculty_th": "คณะวิศวกรรมศาสตร์",
        "faculty_en": "Engineering",
        "degree": "ปริญญาตรี",
        "campus": "Bang Khen",
        "year_by_year_vibe": (
            "ปี 1-2 เรียน hardware และ software ควบคู่กัน "
            "ปี 3-4 เลือก track ได้ระหว่าง embedded systems, networks, หรือ AI"
        ),
    },
    {
        "id": "cs",
        "name_th": "วิทยาการคอมพิวเตอร์",
        "name_en": "Computer Science",
        "faculty_th": "คณะวิทยาศาสตร์",
        "faculty_en": "Science",
        "degree": "ปริญญาตรี",
        "campus": "Bang Khen",
        "year_by_year_vibe": (
            "ปี 1-2 เน้นคณิตศาสตร์เชิงวิทยาการคอมพิวเตอร์และการเขียนโปรแกรมเชิงทฤษฎี "
            "ปี 3-4 เลือกเจาะลึก data science, security, หรือ software systems ตามความถนัด"
        ),
    },
    {
        "id": "env_sci",
        "name_th": "วิทยาศาสตร์และเทคโนโลยีสิ่งแวดล้อม",
        "name_en": "Environmental Science and Technology",
        "faculty_th": "คณะวิทยาศาสตร์",
        "faculty_en": "Science",
        "degree": "ปริญญาตรี",
        "campus": "Bang Khen",
        "year_by_year_vibe": (
            "ปี 1-2 เรียนพื้นฐานเคมี ชีววิทยา และนิเวศวิทยา พร้อมออกภาคสนามในพื้นที่จริง "
            "ปี 3-4 ทำวิจัยด้านมลพิษหรือการจัดการทรัพยากรธรรมชาติร่วมกับหน่วยงานภาครัฐ"
        ),
    },
    {
        "id": "agronomy",
        "name_th": "เกษตรศาสตร์",
        "name_en": "Agronomy",
        "faculty_th": "คณะเกษตร",
        "faculty_en": "Agriculture",
        "degree": "ปริญญาตรี",
        "campus": "Bang Khen",
        "year_by_year_vibe": (
            "ปี 1-2 เรียนรู้วิทยาศาสตร์พืช ดิน และการจัดการฟาร์มในแปลงทดลองของมหาวิทยาลัย "
            "ปี 3-4 ฝึกงานกับเกษตรกรรายใหญ่และบริษัทเกษตรเทคโนโลยี พร้อมทำวิจัยพืชไร่"
        ),
    },
    {
        "id": "horticulture",
        "name_th": "พืชสวน",
        "name_en": "Horticulture",
        "faculty_th": "คณะเกษตร",
        "faculty_en": "Agriculture",
        "degree": "ปริญญาตรี",
        "campus": "Bang Khen",
        "year_by_year_vibe": (
            "ปี 1-2 เรียนรู้วิทยาศาสตร์พืชสวนและการจัดการไม้ผล ผัก ไม้ดอกในสวนทดลอง "
            "ปี 3-4 ต่อยอดสู่ธุรกิจเกษตรและ smart farming ผ่านโครงงานร่วมกับผู้ประกอบการ"
        ),
    },
    {
        "id": "bus_mgmt",
        "name_th": "การจัดการ",
        "name_en": "Business Management",
        "faculty_th": "คณะบริหารธุรกิจ",
        "faculty_en": "Business Administration",
        "degree": "ปริญญาตรี",
        "campus": "Bang Khen",
        "year_by_year_vibe": (
            "ปี 1-2 ปูพื้นฐานการบัญชี เศรษฐศาสตร์ และหลักการจัดการองค์กร "
            "ปี 3-4 เรียนรู้กลยุทธ์ธุรกิจผ่าน case study บริษัทไทยและ startup และฝึกงานในองค์กรชั้นนำ"
        ),
    },
    {
        "id": "bus_fin",
        "name_th": "การเงิน",
        "name_en": "Finance",
        "faculty_th": "คณะบริหารธุรกิจ",
        "faculty_en": "Business Administration",
        "degree": "ปริญญาตรี",
        "campus": "Bang Khen",
        "year_by_year_vibe": (
            "ปี 1-2 เรียนคณิตการเงิน การบัญชี และหลักตลาดทุนเบื้องต้น "
            "ปี 3-4 วิเคราะห์หลักทรัพย์จริงผ่าน investment portfolio project และฝึกงานกับสถาบันการเงิน"
        ),
    },
    {
        "id": "english",
        "name_th": "ภาษาอังกฤษ",
        "name_en": "English",
        "faculty_th": "คณะมนุษยศาสตร์",
        "faculty_en": "Humanities",
        "degree": "ปริญญาตรี",
        "campus": "Bang Khen",
        "year_by_year_vibe": (
            "ปี 1-2 เสริมทักษะภาษาอังกฤษทุกด้านและเรียนวรรณคดีอังกฤษ-อเมริกัน "
            "ปี 3-4 เลือกเส้นทางล่ามและนักแปล หรือการสอนภาษาอังกฤษ พร้อมฝึกงานในองค์กรนานาชาติ"
        ),
    },
    {
        "id": "sociology",
        "name_th": "สังคมวิทยาและมานุษยวิทยา",
        "name_en": "Sociology and Anthropology",
        "faculty_th": "คณะสังคมศาสตร์",
        "faculty_en": "Social Sciences",
        "degree": "ปริญญาตรี",
        "campus": "Bang Khen",
        "year_by_year_vibe": (
            "ปี 1-2 เรียนทฤษฎีสังคมวิทยาและมานุษยวิทยาควบคู่กับระเบียบวิธีวิจัยเชิงคุณภาพ "
            "ปี 3-4 ลงพื้นที่วิจัยชุมชนและเลือก track ได้ระหว่างการพัฒนาชุมชนหรือมานุษยวิทยาดิจิทัล"
        ),
    },
]


def main() -> None:
    url = os.environ.get("SUPABASE_URL", "")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")

    if not url or not key:
        raise SystemExit(
            "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set. "
            "Copy backend/.env.example to backend/.env and fill in the values."
        )

    client: Client = create_client(url, key)
    client.table("programs").upsert(PROGRAMS).execute()
    print(f"✓ Seeded {len(PROGRAMS)} programs successfully")


if __name__ == "__main__":
    main()
