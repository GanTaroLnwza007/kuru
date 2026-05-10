import type { ChatSourceChunk, ProgramDetail, ProgramSummary, SourceChunk } from "./schemas.generated";

export const MOCK_PROGRAMS: ProgramDetail[] = [
  {
    id: "bangkhen_ddf705a9",
    slug: "computer-eng",
    name_th: "วิศวกรรมคอมพิวเตอร์",
    name_en: "Computer Engineering",
    faculty_th: "คณะวิศวกรรมศาสตร์",
    faculty_en: "Faculty of Engineering",
    degree: "ปริญญาตรี",
    campus: "บางเขน",
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
    id: "bangkhen_1ca687c1",
    slug: "ske-intl",
    name_th: "วิศวกรรมซอฟต์แวร์และความรู้ (หลักสูตรนานาชาติ)",
    name_en: "Software and Knowledge Engineering (International Program)",
    faculty_th: "คณะวิศวกรรมศาสตร์",
    faculty_en: "Faculty of Engineering",
    degree: "ปริญญาตรี",
    campus: "บางเขน",
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
    id: "bangkhen_45012e1a",
    slug: "law",
    name_th: "นิติศาสตร์",
    name_en: "Law",
    faculty_th: "คณะนิติศาสตร์",
    faculty_en: "Faculty of Law",
    degree: "ปริญญาตรี",
    campus: "บางเขน",
    match_score: 1.0,
    year_by_year_vibe:
      "ปี 1-2 ศึกษากฎหมายพื้นฐาน นิติทั่วไป และระบบยุติธรรมไทย ปี 3 ว่าความ กฎหมายพาณิชย์ สัมมนากฎหมาย ปี 4 ฝึกงานสำนักงานกฎหมายหรือหน่วยงานรัฐ",
    plos: [
      { code: "PLO1", description_th: "วิเคราะห์และตีความกฎหมายเพื่อแก้ปัญหาทางนิติศาสตร์ได้อย่างถูกต้อง" },
      { code: "PLO2", description_th: "ว่าความและโต้แย้งในกระบวนการยุติธรรมได้อย่างมีประสิทธิภาพ" },
    ],
    tcas_rounds: [
      { round: "รอบ 1 Portfolio", quota: 40, min_score: null },
      { round: "รอบ 3 Admission", quota: 110, min_score: 52.0 },
    ],
  },
  {
    id: "bangkhen_ef87a252",
    slug: "earth-science",
    name_th: "วิทยาศาสตร์โลก",
    name_en: "Earth Science",
    faculty_th: "คณะวิทยาศาสตร์",
    faculty_en: "Faculty of Science",
    degree: "ปริญญาตรี",
    campus: "บางเขน",
    match_score: 1.0,
    year_by_year_vibe:
      "ปี 1-2 ธรณีวิทยาพื้นฐาน เคมี ฟิสิกส์ ออกสำรวจหินและแร่ธาตุ ปี 3 GIS Remote Sensing ธรณีฟิสิกส์ประยุกต์ ปี 4 วิทยานิพนธ์และฝึกงานหน่วยสำรวจ",
    plos: [
      { code: "PLO1", description_th: "วิเคราะห์และแปลความหมายข้อมูลทางธรณีวิทยาและธรณีฟิสิกส์ได้" },
      { code: "PLO2", description_th: "ประยุกต์ใช้ GIS และ Remote Sensing เพื่อจัดการข้อมูลเชิงพื้นที่" },
    ],
    tcas_rounds: [
      { round: "รอบ 1 Portfolio", quota: 15, min_score: null },
      { round: "รอบ 3 Admission", quota: 45, min_score: 48.0 },
    ],
  },
  {
    id: "bangkhen_df395fd7",
    slug: "aerospace-eng",
    name_th: "วิศวกรรมการบินและอวกาศ",
    name_en: "Aerospace Engineering",
    faculty_th: "คณะวิศวกรรมศาสตร์",
    faculty_en: "Faculty of Engineering",
    degree: "ปริญญาตรี",
    campus: "บางเขน",
    match_score: 1.0,
    year_by_year_vibe:
      "ปี 1-2 คณิตศาสตร์ ฟิสิกส์ และ Aerodynamics พื้นฐาน ปี 3 Propulsion Flight Mechanics Control Systems ปี 4 Capstone Aircraft Design และฝึกงานอุตสาหกรรมการบิน",
    plos: [
      { code: "PLO1", description_th: "วิเคราะห์ Aerodynamics และออกแบบโครงสร้างอากาศยานได้" },
      { code: "PLO2", description_th: "ออกแบบระบบควบคุมการบินและ Propulsion ตามมาตรฐานความปลอดภัย" },
    ],
    tcas_rounds: [
      { round: "รอบ 1 Portfolio", quota: 15, min_score: null },
      { round: "รอบ 3 Admission", quota: 45, min_score: 65.0 },
    ],
  },
  {
    id: "bangkhen_5b6f81ed",
    slug: "vet-tech",
    name_th: "เทคนิคการสัตวแพทย์",
    name_en: "Veterinary Technology",
    faculty_th: "คณะสัตวแพทยศาสตร์",
    faculty_en: "Faculty of Veterinary Medicine",
    degree: "ปริญญาตรี",
    campus: "บางเขน",
    match_score: 1.0,
    year_by_year_vibe:
      "ปี 1-3 วิทยาศาสตร์พื้นฐานและกายวิภาคสัตว์ ปี 4 คลินิกจริงกับสัตว์ป่วย ปี 5-6 ฝึกปฏิบัติงานสนาม — หนักมากแต่คุ้มค่า",
    plos: [
      { code: "PLO1", description_th: "วินิจฉัยโรคและรักษาสัตว์ได้อย่างถูกต้องตามมาตรฐานวิชาชีพ" },
      { code: "PLO2", description_th: "ส่งเสริมสุขภาพและป้องกันโรคระบาดในสัตว์และชุมชน" },
    ],
    tcas_rounds: [
      { round: "รอบ 1 Portfolio", quota: 10, min_score: null },
      { round: "รอบ 3 Admission", quota: 30, min_score: 62.0 },
    ],
  },
  {
    id: "bangkhen_a612dbb4",
    slug: "chemical-eng",
    name_th: "วิศวกรรมเคมี",
    name_en: "Chemical Engineering",
    faculty_th: "คณะวิศวกรรมศาสตร์",
    faculty_en: "Faculty of Engineering",
    degree: "ปริญญาตรี",
    campus: "บางเขน",
    match_score: 1.0,
    year_by_year_vibe:
      "ปี 1 เคมีทั่วไป คณิตศาสตร์วิศวกรรม ปี 2-3 Mass Balance Thermodynamics Reactor Design ปี 4 Plant Design Project และสหกิจในโรงงาน",
    plos: [
      { code: "PLO1", description_th: "ออกแบบและปรับปรุงกระบวนการทางเคมีอย่างมีประสิทธิภาพ" },
      { code: "PLO2", description_th: "ควบคุมคุณภาพและจัดการความปลอดภัยในกระบวนการผลิต" },
    ],
    tcas_rounds: [
      { round: "รอบ 1 Portfolio", quota: 20, min_score: null },
      { round: "รอบ 3 Admission", quota: 70, min_score: 58.0 },
    ],
  },
  {
    id: "bangkhen_6471b30d",
    slug: "political-science",
    name_th: "รัฐศาสตร์และรัฐประศาสนศาสตร์",
    name_en: "Political Science",
    faculty_th: "คณะสังคมศาสตร์",
    faculty_en: "Faculty of Social Sciences",
    degree: "ปริญญาตรี",
    campus: "บางเขน",
    match_score: 1.0,
    year_by_year_vibe:
      "ปี 1-2 รัฐศาสตร์ทั่วไป ระบบการเมือง ความสัมพันธ์ระหว่างประเทศ ปี 3 วิเคราะห์นโยบายและฝึกงานหน่วยงานรัฐ ปี 4 ธีสิสและฝึกงาน NGO หรือสถานทูต",
    plos: [
      { code: "PLO1", description_th: "วิเคราะห์ระบบการเมืองและนโยบายสาธารณะในบริบทไทยและสากล" },
      { code: "PLO2", description_th: "สื่อสาร โน้มน้าว และเจรจาอย่างมีประสิทธิภาพในเวทีสาธารณะ" },
    ],
    tcas_rounds: [
      { round: "รอบ 1 Portfolio", quota: 30, min_score: null },
      { round: "รอบ 3 Admission", quota: 90, min_score: 50.0 },
    ],
  },
  {
    id: "bangkhen_11a20d3f",
    slug: "environmental-eng",
    name_th: "วิศวกรรมสิ่งแวดล้อม",
    name_en: "Environmental Engineering",
    faculty_th: "คณะวิศวกรรมศาสตร์",
    faculty_en: "Faculty of Engineering",
    degree: "ปริญญาตรี",
    campus: "บางเขน",
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
    id: "bangkhen_f59cc529",
    slug: "psychology",
    name_th: "จิตวิทยา",
    name_en: "Psychology",
    faculty_th: "คณะสังคมศาสตร์",
    faculty_en: "Faculty of Social Sciences",
    degree: "ปริญญาตรี",
    campus: "บางเขน",
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

export const MOCK_CHAT_SOURCES: ChatSourceChunk[] = [
  { source_file: "CPE-69-TCAS3.pdf", section_type: "tcas", similarity: 0.82 },
  { source_file: "SKE-curriculum-2567.pdf", section_type: "overview", similarity: 0.71 },
];

export function getMockProgramById(id: string): ProgramDetail | undefined {
  return MOCK_PROGRAMS.find((p) => p.slug === id || p.id === id);
}

export const MOCK_PROGRAM_NAMES: Record<string, { name_th: string; faculty_th: string }> =
  Object.fromEntries(
    MOCK_PROGRAMS.map((p) => [p.slug, { name_th: p.name_th, faculty_th: p.faculty_th }]),
  );

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
    slug: p.slug,
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
