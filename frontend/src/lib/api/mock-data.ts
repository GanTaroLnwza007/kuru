import type { ProgramDetail, ProgramSummary, SourceChunk } from "./schemas.generated";

export const MOCK_PROGRAMS: ProgramDetail[] = [
  {
    id: "cpe",
    name_th: "วิศวกรรมคอมพิวเตอร์",
    name_en: "Computer Engineering",
    faculty_th: "คณะวิศวกรรมศาสตร์",
    faculty_en: "Faculty of Engineering",
    degree: "ปริญญาตรี",
    campus: "Bang Khen",
    match_score: 1.0,
    year_by_year_vibe:
      "ปี 1 วางฐานแคลคูลัส-ฟิสิกส์และเขียนโค้ดครั้งแรก ปี 2-3 ดำดิ่งสู่ Data Structures, OS และ Software Engineering ปี 4 ทำ Senior Project และเลือกวิชาเอก AI/Cloud ที่ชอบ",
    plos: [
      { code: "PLO1", description_th: "สามารถออกแบบและพัฒนาซอฟต์แวร์เพื่อแก้ปัญหาทางวิศวกรรมได้" },
      { code: "PLO2", description_th: "มีความรู้ด้านสถาปัตยกรรมคอมพิวเตอร์และระบบปฏิบัติการ" },
      { code: "PLO3", description_th: "สามารถวิเคราะห์และออกแบบระบบเครือข่ายและความปลอดภัย" },
    ],
    tcas_rounds: [
      { round: "รอบ 1 Portfolio", quota: 30, min_score: null },
      { round: "รอบ 2 Quota", quota: 50, min_score: 3.0 },
      { round: "รอบ 3 Admission", quota: 80, min_score: 60.0 },
    ],
  },
  {
    id: "ske",
    name_th: "วิศวกรรมซอฟต์แวร์และความรู้",
    name_en: "Software and Knowledge Engineering",
    faculty_th: "คณะวิศวกรรมศาสตร์",
    faculty_en: "Faculty of Engineering",
    degree: "ปริญญาตรี",
    campus: "Bang Khen",
    match_score: 1.0,
    year_by_year_vibe:
      "ปี 1 เริ่มต้นกับการเขียนโปรแกรมและคณิตศาสตร์ ปี 2-3 เจาะลึก Agile, UX/UI และ Machine Learning ปี 4 ฝึกงานบริษัทจริงและทำโปรเจกต์กับลูกค้า",
    plos: [
      { code: "PLO1", description_th: "ออกแบบและพัฒนาซอฟต์แวร์คุณภาพสูงโดยใช้กระบวนการ Agile" },
      { code: "PLO2", description_th: "ประยุกต์ใช้ Machine Learning และ AI ในการแก้ปัญหาทางธุรกิจ" },
      { code: "PLO3", description_th: "สื่อสารและทำงานร่วมกับทีมข้ามสายงานได้อย่างมีประสิทธิภาพ" },
    ],
    tcas_rounds: [
      { round: "รอบ 1 Portfolio", quota: 20, min_score: null },
      { round: "รอบ 3 Admission", quota: 60, min_score: 58.0 },
    ],
  },
  {
    id: "agri-econ",
    name_th: "เศรษฐศาสตร์เกษตร",
    name_en: "Agricultural Economics",
    faculty_th: "คณะเศรษฐศาสตร์",
    faculty_en: "Faculty of Economics",
    degree: "ปริญญาตรี",
    campus: "Bang Khen",
    match_score: 1.0,
    year_by_year_vibe:
      "ปี 1-2 ศึกษาพื้นฐานเศรษฐศาสตร์จุลภาคและมหภาค ปี 3 วิเคราะห์นโยบายการเกษตรและตลาดสินค้าโภคภัณฑ์ ปี 4 ทำวิจัยและฝึกงานกับหน่วยงานรัฐหรือธุรกิจเกษตร",
    plos: [
      { code: "PLO1", description_th: "วิเคราะห์ระบบเศรษฐกิจการเกษตรโดยใช้เครื่องมือเชิงปริมาณ" },
      { code: "PLO2", description_th: "ประเมินผลกระทบของนโยบายต่อภาคเกษตรและชุมชนชนบท" },
    ],
    tcas_rounds: [
      { round: "รอบ 2 Quota", quota: 40, min_score: 2.75 },
      { round: "รอบ 3 Admission", quota: 70, min_score: 50.0 },
    ],
  },
  {
    id: "bio-tech",
    name_th: "เทคโนโลยีชีวภาพ",
    name_en: "Biotechnology",
    faculty_th: "คณะวิทยาศาสตร์",
    faculty_en: "Faculty of Science",
    degree: "ปริญญาตรี",
    campus: "Bang Khen",
    match_score: 1.0,
    year_by_year_vibe:
      "ปี 1-2 เรียนเคมี ชีววิทยา และปฏิบัติการ Lab พื้นฐาน ปี 3 เจาะวิชา Molecular Biology และ Genetic Engineering ปี 4 ทำวิจัยในห้องปฏิบัติการจริงหรือภาคอุตสาหกรรม",
    plos: [
      { code: "PLO1", description_th: "ทดลองและวิเคราะห์ข้อมูลทางชีวเทคโนโลยีอย่างเป็นระบบ" },
      { code: "PLO2", description_th: "ประยุกต์เทคนิค Recombinant DNA และ Cell Culture เพื่อผลิตสารชีวภาพ" },
      { code: "PLO3", description_th: "ประเมินความปลอดภัยและจริยธรรมของผลิตภัณฑ์ชีวเทคโนโลยี" },
    ],
    tcas_rounds: [
      { round: "รอบ 1 Portfolio", quota: 15, min_score: null },
      { round: "รอบ 3 Admission", quota: 55, min_score: 55.0 },
    ],
  },
  {
    id: "arch",
    name_th: "สถาปัตยกรรมศาสตร์",
    name_en: "Architecture",
    faculty_th: "คณะสถาปัตยกรรมศาสตร์",
    faculty_en: "Faculty of Architecture",
    degree: "ปริญญาตรี",
    campus: "Bang Khen",
    match_score: 1.0,
    year_by_year_vibe:
      "ปี 1-2 วาดและออกแบบขั้นพื้นฐาน ปี 3-4 สตูดิโอออกแบบขนาดกลางถึงใหญ่พร้อม Critic ปี 5 วิทยานิพนธ์สถาปัตยกรรม — เหนื่อยแต่ภาคภูมิใจ",
    plos: [
      { code: "PLO1", description_th: "ออกแบบอาคารที่ตอบโจทย์ทั้งด้านฟังก์ชัน สุนทรียะ และความยั่งยืน" },
      { code: "PLO2", description_th: "ใช้โปรแกรม BIM และ Parametric Design ในกระบวนการออกแบบ" },
    ],
    tcas_rounds: [
      { round: "รอบ 1 Portfolio", quota: 25, min_score: null },
      { round: "รอบ 3 Admission", quota: 45, min_score: 62.0 },
    ],
  },
  {
    id: "vet",
    name_th: "สัตวแพทยศาสตร์",
    name_en: "Veterinary Medicine",
    faculty_th: "คณะสัตวแพทยศาสตร์",
    faculty_en: "Faculty of Veterinary Medicine",
    degree: "ปริญญาตรี",
    campus: "Bang Khen",
    match_score: 1.0,
    year_by_year_vibe:
      "ปี 1-3 วิทยาศาสตร์พื้นฐานและกายวิภาคสัตว์ ปี 4-5 คลินิกจริงกับสัตว์ป่วย ปี 6 ฝึกปฏิบัติงานสนาม — หนักมากแต่คุ้มค่า",
    plos: [
      { code: "PLO1", description_th: "วินิจฉัยโรคและรักษาสัตว์ได้อย่างถูกต้องตามมาตรฐานวิชาชีพ" },
      { code: "PLO2", description_th: "ส่งเสริมสุขภาพและป้องกันโรคระบาดในสัตว์และชุมชน" },
    ],
    tcas_rounds: [
      { round: "รอบ 1 Portfolio", quota: 10, min_score: null },
      { round: "รอบ 3 Admission", quota: 30, min_score: 75.0 },
    ],
  },
  {
    id: "food-sci",
    name_th: "วิทยาศาสตร์และเทคโนโลยีการอาหาร",
    name_en: "Food Science and Technology",
    faculty_th: "คณะอุตสาหกรรมเกษตร",
    faculty_en: "Faculty of Agro-Industry",
    degree: "ปริญญาตรี",
    campus: "Bang Khen",
    match_score: 1.0,
    year_by_year_vibe:
      "ปี 1 เคมีและชีววิทยาทั่วไป ปี 2-3 แปรรูปอาหาร การถนอมอาหาร และการควบคุมคุณภาพ ปี 4 โปรเจกต์พัฒนาผลิตภัณฑ์ใหม่และฝึกงานโรงงาน",
    plos: [
      { code: "PLO1", description_th: "วิเคราะห์คุณสมบัติทางกายภาพ เคมี และจุลชีววิทยาของอาหาร" },
      { code: "PLO2", description_th: "ออกแบบกระบวนการผลิตอาหารที่ปลอดภัยและได้มาตรฐาน GMP/HACCP" },
    ],
    tcas_rounds: [
      { round: "รอบ 2 Quota", quota: 35, min_score: 2.5 },
      { round: "รอบ 3 Admission", quota: 60, min_score: 48.0 },
    ],
  },
  {
    id: "finance",
    name_th: "การเงิน",
    name_en: "Finance",
    faculty_th: "คณะบริหารธุรกิจ",
    faculty_en: "Faculty of Business Administration",
    degree: "ปริญญาตรี",
    campus: "Bang Khen",
    match_score: 1.0,
    year_by_year_vibe:
      "ปี 1-2 บัญชี เศรษฐศาสตร์ และสถิติธุรกิจ ปี 3 วิเคราะห์การลงทุนและบริหารความเสี่ยง ปี 4 สอบใบอนุญาตผู้แนะนำการลงทุนและฝึกงานสถาบันการเงิน",
    plos: [
      { code: "PLO1", description_th: "วิเคราะห์งบการเงินและประเมินมูลค่าหลักทรัพย์ได้" },
      { code: "PLO2", description_th: "บริหารพอร์ตการลงทุนโดยใช้หลักการกระจายความเสี่ยง" },
      { code: "PLO3", description_th: "ประยุกต์เทคโนโลยี FinTech ในการวิเคราะห์ข้อมูลทางการเงิน" },
    ],
    tcas_rounds: [
      { round: "รอบ 1 Portfolio", quota: 20, min_score: null },
      { round: "รอบ 3 Admission", quota: 80, min_score: 52.0 },
    ],
  },
  {
    id: "env-eng",
    name_th: "วิศวกรรมสิ่งแวดล้อม",
    name_en: "Environmental Engineering",
    faculty_th: "คณะวิศวกรรมศาสตร์",
    faculty_en: "Faculty of Engineering",
    degree: "ปริญญาตรี",
    campus: "Bang Khen",
    match_score: 1.0,
    year_by_year_vibe:
      "ปี 1-2 เคมี ชีววิทยา และวิศวกรรมพื้นฐาน ปี 3 ระบบบำบัดน้ำเสีย การจัดการขยะ และมลพิษอากาศ ปี 4 โปรเจกต์ออกแบบระบบสิ่งแวดล้อมจริงกับชุมชน",
    plos: [
      { code: "PLO1", description_th: "ออกแบบระบบบำบัดน้ำเสียและจัดการของแข็งตามมาตรฐาน" },
      { code: "PLO2", description_th: "ประเมินผลกระทบสิ่งแวดล้อม (EIA) สำหรับโครงการขนาดใหญ่" },
    ],
    tcas_rounds: [
      { round: "รอบ 2 Quota", quota: 30, min_score: 2.75 },
      { round: "รอบ 3 Admission", quota: 50, min_score: 55.0 },
    ],
  },
  {
    id: "psychology",
    name_th: "จิตวิทยา",
    name_en: "Psychology",
    faculty_th: "คณะสังคมศาสตร์",
    faculty_en: "Faculty of Social Sciences",
    degree: "ปริญญาตรี",
    campus: "Bang Khen",
    match_score: 1.0,
    year_by_year_vibe:
      "ปี 1-2 จิตวิทยาทั่วไป สถิติ และวิธีวิจัย ปี 3 เลือกแขนงคลินิก อุตสาหกรรม หรือการศึกษา ปี 4 ฝึกปฏิบัติกับผู้รับบริการจริงภายใต้การดูแลอาจารย์",
    plos: [
      { code: "PLO1", description_th: "ประเมินและช่วยเหลือบุคคลด้านสุขภาพจิตโดยใช้หลักจริยธรรม" },
      { code: "PLO2", description_th: "ออกแบบการวิจัยทางจิตวิทยาและวิเคราะห์ข้อมูลเชิงปริมาณ" },
    ],
    tcas_rounds: [
      { round: "รอบ 1 Portfolio", quota: 15, min_score: null },
      { round: "รอบ 3 Admission", quota: 50, min_score: 53.0 },
    ],
  },
];

export const MOCK_SOURCES: SourceChunk[] = [
  { table: "programs", row_id: "*", excerpt: "ข้อมูลจากฐานข้อมูลหลักสูตรมหาวิทยาลัยเกษตรศาสตร์" },
  { table: "tcas_requirements", row_id: "*", excerpt: "เกณฑ์การรับสมัคร TCAS ปีการศึกษา 2568" },
];

export const MOCK_SEARCH_SOURCES: SourceChunk[] = [
  { table: "programs", row_id: "*", excerpt: "text search over programs table" },
];

export const MOCK_CHAT_SOURCES: SourceChunk[] = [
  {
    table: "programs",
    row_id: "cpe",
    excerpt: "วิศวกรรมคอมพิวเตอร์ คณะวิศวกรรมศาสตร์ มหาวิทยาลัยเกษตรศาสตร์",
  },
  {
    table: "tcas_requirements",
    row_id: "cpe-round3",
    excerpt: "รอบ 3 Admission รับ 80 คน คะแนน TGAT/TPAT ขั้นต่ำ 60%",
  },
];

export function getMockProgramById(id: string): ProgramDetail | undefined {
  return MOCK_PROGRAMS.find((p) => p.id === id);
}

export function searchMockPrograms(q: string, faculty?: string): ProgramSummary[] {
  const query = q.trim().toLowerCase();
  let results: ProgramDetail[] = MOCK_PROGRAMS;

  if (query) {
    results = results.filter(
      (p) =>
        p.name_th.toLowerCase().includes(query) ||
        p.name_en.toLowerCase().includes(query) ||
        p.faculty_th.toLowerCase().includes(query) ||
        p.faculty_en.toLowerCase().includes(query)
    );
  }

  if (faculty) {
    results = results.filter(
      (p) =>
        p.faculty_th.toLowerCase().includes(faculty.toLowerCase()) ||
        p.faculty_en.toLowerCase().includes(faculty.toLowerCase())
    );
  }

  return results.map((p): ProgramSummary => ({
    id: p.id,
    name_th: p.name_th,
    name_en: p.name_en,
    faculty_th: p.faculty_th,
    faculty_en: p.faculty_en,
    degree: p.degree,
    campus: p.campus,
    match_score: p.match_score,
    year_by_year_vibe: p.year_by_year_vibe,
  }));
}
