import type { RiasecDim } from "./riasec";

export type YearVibeItem = {
  year: number;
  mood: string;
  moodEn: string;
  desc: string;
  kw: string[];
  heat: number;
  season: "spring" | "summer" | "autumn" | "winter";
};

export type PloRich = {
  name: string;
  score: number;
};

export type RichProgram = {
  id: string;
  riasec: RiasecDim[];
  /** base match score (0-100) — used when no RIASEC scores available */
  baseFit: number;
  seats: number;
  /** formatted cost string e.g. "17,300 ฿/เทอม" */
  cost: string;
  salary: string;
  careers: string[];
  yearVibe: YearVibeItem[];
  plosRich: PloRich[];
  why: string;
  colorHex: string;
};

export const RICH_PROGRAMS: Record<string, RichProgram> = {
  cpe: {
    id: "cpe",
    riasec: ["I", "R", "C"],
    baseFit: 92,
    seats: 120,
    cost: "17,300 ฿/เทอม",
    salary: "32,000 – 65,000 ฿",
    careers: ["Software Engineer", "Data Engineer", "AI Engineer", "Solutions Architect", "Cybersecurity"],
    yearVibe: [
      { year: 1, mood: "ปูพื้น", moodEn: "foundation", desc: "แคลคูลัส ฟิสิกส์ และ Programming เบื้องต้น เริ่มเขียน Python กับ C", kw: ["Calculus", "Physics", "Python"], heat: 0.6, season: "spring" },
      { year: 2, mood: "ลึกขึ้น", moodEn: "dive", desc: "Data Structures, Digital Logic, Computer Architecture สนุกกับการแก้โจทย์", kw: ["Data Structures", "Logic Design", "OS"], heat: 0.85, season: "summer" },
      { year: 3, mood: "ลงสนาม", moodEn: "apply", desc: "AI, Networks, Software Engineering — เริ่มทำโปรเจกต์จริงกับเพื่อน ฝึกงานช่วงปิดเทอม", kw: ["AI", "Networks", "Internship"], heat: 1.0, season: "autumn" },
      { year: 4, mood: "ปลดปล่อย", moodEn: "release", desc: "Capstone Project, สหกิจหรือทำธีสิส และเตรียมตัวเข้าสู่อุตสาหกรรม", kw: ["Capstone", "Co-op", "Career"], heat: 0.75, season: "winter" },
    ],
    plosRich: [
      { name: "คิดเชิงตรรกะและแก้ปัญหา", score: 92 },
      { name: "ออกแบบและพัฒนาซอฟต์แวร์", score: 88 },
      { name: "ทำงานเป็นทีม", score: 80 },
      { name: "สื่อสารทางวิชาการ", score: 72 },
    ],
    why: "คะแนน I (นักค้นคว้า) สูง + ผลงานเขียนโค้ดในแฟ้มของคุณ ตรงกับธรรมชาติของหลักสูตร",
    colorHex: "#7BB7E8",
  },
  ske: {
    id: "ske",
    riasec: ["I", "A", "E"],
    baseFit: 86,
    seats: 80,
    cost: "16,500 ฿/เทอม",
    salary: "30,000 – 60,000 ฿",
    careers: ["Full-Stack Developer", "UX Engineer", "Product Manager", "ML Engineer", "Tech Lead"],
    yearVibe: [
      { year: 1, mood: "เริ่มต้น", moodEn: "start", desc: "Programming พื้นฐาน คณิตศาสตร์ดิสครีต และ UX เบื้องต้น", kw: ["OOP", "Discrete Math", "UX 101"], heat: 0.6, season: "spring" },
      { year: 2, mood: "Agile", moodEn: "agile", desc: "Software Process, Database Design, Web Dev ทำงานเป็นทีมจริง", kw: ["Agile", "Database", "Web"], heat: 0.85, season: "summer" },
      { year: 3, mood: "ML + UX", moodEn: "innovate", desc: "Machine Learning, HCI และ Software Testing — ฝึกงานบริษัทเทคโนโลยี", kw: ["ML", "HCI", "Testing"], heat: 1.0, season: "autumn" },
      { year: 4, mood: "โปรเจกต์จริง", moodEn: "capstone", desc: "Senior Project กับลูกค้าจริง + สหกิจสถาน หรือธีสิส", kw: ["Client", "Co-op", "Thesis"], heat: 0.75, season: "winter" },
    ],
    plosRich: [
      { name: "พัฒนาซอฟต์แวร์คุณภาพสูง", score: 90 },
      { name: "ประยุกต์ใช้ ML/AI", score: 82 },
      { name: "ออกแบบ UX/UI", score: 86 },
      { name: "ทำงานข้ามสายงาน", score: 78 },
    ],
    why: "มี I + A ร่วมกัน — เหมาะกับสายวิศวกรที่ชอบสร้างสรรค์และคิดวิเคราะห์",
    colorHex: "#D88BB0",
  },
  "agri-econ": {
    id: "agri-econ",
    riasec: ["I", "E", "C"],
    baseFit: 74,
    seats: 110,
    cost: "13,500 ฿/เทอม",
    salary: "22,000 – 45,000 ฿",
    careers: ["Policy Analyst", "Agricultural Officer", "Commodity Trader", "Data Analyst", "Consultant"],
    yearVibe: [
      { year: 1, mood: "เปิดโลก", moodEn: "open", desc: "Micro/Macro 101, Statistics, เกษตรเบื้องต้น เริ่มเห็นว่าเศรษฐศาสตร์อยู่ทุกที่", kw: ["Micro", "Macro", "Agri"], heat: 0.5, season: "spring" },
      { year: 2, mood: "เข้มข้น", moodEn: "rigor", desc: "Econometrics, ตลาดสินค้าเกษตร ออกพื้นที่จริง", kw: ["Econometrics", "Markets"], heat: 0.85, season: "summer" },
      { year: 3, mood: "เลือกทาง", moodEn: "specialize", desc: "วิเคราะห์นโยบายการเกษตร + ฝึกงานหน่วยงานรัฐหรือเอกชน", kw: ["Policy", "Internship"], heat: 0.9, season: "autumn" },
      { year: 4, mood: "ออกตลาด", moodEn: "market", desc: "Senior Thesis + เริ่มยื่นงาน ธนาคาร/ราชการ/NGO", kw: ["Thesis", "Recruit", "Career"], heat: 0.7, season: "winter" },
    ],
    plosRich: [
      { name: "วิเคราะห์ระบบเศรษฐกิจเกษตร", score: 82 },
      { name: "ประเมินผลนโยบาย", score: 78 },
      { name: "ใช้เครื่องมือเชิงปริมาณ", score: 80 },
      { name: "สื่อสารและนำเสนอ", score: 74 },
    ],
    why: "คุณวิเคราะห์เก่ง (I) + มีทักษะด้านการจัดการ (E, C)",
    colorHex: "#E8A93B",
  },
  "bio-tech": {
    id: "bio-tech",
    riasec: ["I", "R", "C"],
    baseFit: 78,
    seats: 70,
    cost: "16,800 ฿/เทอม",
    salary: "24,000 – 48,000 ฿",
    careers: ["Biotech Researcher", "QA Scientist", "Lab Manager", "R&D Specialist", "Regulatory Affairs"],
    yearVibe: [
      { year: 1, mood: "Lab แรก", moodEn: "discovery", desc: "เคมี ชีววิทยา และปฏิบัติการ Lab พื้นฐาน — ตื่นเต้นกับโลกเซลล์", kw: ["Chem", "Bio", "Lab"], heat: 0.6, season: "spring" },
      { year: 2, mood: "ลงลึก", moodEn: "molecules", desc: "Molecular Biology, Microbiology, Analytical Chemistry — ปริมาณเนื้อหาเยอะมาก", kw: ["Molecular Bio", "Micro", "Analytical"], heat: 0.9, season: "summer" },
      { year: 3, mood: "วิจัย", moodEn: "research", desc: "Genetic Engineering, Cell Culture, Bioprocess Engineering", kw: ["Genetic Eng", "Cell Culture"], heat: 1.0, season: "autumn" },
      { year: 4, mood: "อุตสาหกรรม", moodEn: "industry", desc: "Senior Research + สหกิจโรงงาน/ห้องแล็บอุตสาหกรรม", kw: ["Research", "Co-op", "Industry"], heat: 0.7, season: "winter" },
    ],
    plosRich: [
      { name: "ทดลองและวิเคราะห์ข้อมูลชีววิทยา", score: 86 },
      { name: "ประยุกต์เทคนิค Recombinant DNA", score: 80 },
      { name: "ควบคุมคุณภาพและความปลอดภัย", score: 82 },
      { name: "จริยธรรมชีวเทคโนโลยี", score: 76 },
    ],
    why: "I สูง + ชอบปฏิบัติ (R) + ใส่ใจระบบ (C) — เหมาะกับสายวิทยาศาสตร์ชีวภาพ",
    colorHex: "#7A9E7E",
  },
  arch: {
    id: "arch",
    riasec: ["A", "I", "R"],
    baseFit: 82,
    seats: 90,
    cost: "19,500 ฿/เทอม",
    salary: "20,000 – 50,000 ฿",
    careers: ["Architect", "Urban Designer", "Interior Designer", "Sustainability Consultant", "BIM Specialist"],
    yearVibe: [
      { year: 1, mood: "สเก็ตช์", moodEn: "sketch", desc: "Drawing, Composition, History พื้นฐานความงามและการมองเห็น", kw: ["Drawing", "Comp", "History"], heat: 0.6, season: "spring" },
      { year: 2, mood: "สตูดิโอ", moodEn: "studio", desc: "Design Studio + Tech ลองออกแบบบ้านจริง คืนนอนน้อย", kw: ["Studio", "CAD", "Critique"], heat: 1.0, season: "summer" },
      { year: 3, mood: "ใหญ่ขึ้น", moodEn: "urban", desc: "อาคารสาธารณะ ผังเมือง ความยั่งยืน — ทีมเริ่มใหญ่", kw: ["Urban", "Sustainability"], heat: 0.95, season: "autumn" },
      { year: 4, mood: "ฝึกงาน", moodEn: "practice", desc: "ฝึกงาน 1 ปีเต็มที่บริษัทออกแบบ — ได้ลงสนามจริง", kw: ["Internship", "Office"], heat: 0.65, season: "winter" },
    ],
    plosRich: [
      { name: "ความคิดสร้างสรรค์", score: 90 },
      { name: "ทักษะการออกแบบ", score: 86 },
      { name: "เข้าใจบริบทและสังคม", score: 78 },
      { name: "นำเสนอผลงาน", score: 82 },
    ],
    why: "A สูง + ต้องการวิเคราะห์ (I) และลงมือสร้าง (R) — ตรงกับสถาปัตย์เลย",
    colorHex: "#D88BB0",
  },
  vet: {
    id: "vet",
    riasec: ["I", "S", "R"],
    baseFit: 76,
    seats: 80,
    cost: "22,500 ฿/เทอม",
    salary: "28,000 – 80,000 ฿",
    careers: ["สัตวแพทย์คลินิก", "นักวิจัย", "ปศุสัตว์/ฟาร์ม", "Public Health", "Food Safety"],
    yearVibe: [
      { year: 1, mood: "ตื่นเต้น", moodEn: "wonder", desc: "ชีววิทยา เคมีเข้มข้น เริ่มเข้า Lab ครั้งแรก", kw: ["Bio", "Chem", "Lab"], heat: 0.7, season: "spring" },
      { year: 2, mood: "จดจ่อ", moodEn: "focus", desc: "กายวิภาค สรีรวิทยา เภสัชศาสตร์สัตว์ — ปริมาณเนื้อหาเยอะมาก", kw: ["Anatomy", "Physio", "Pharma"], heat: 1.0, season: "summer" },
      { year: 3, mood: "คลินิก", moodEn: "clinic", desc: "เริ่มเข้าคลินิก ดูเคสจริง อ่อนโยนกับสัตว์เป็นทักษะหลัก", kw: ["Clinic", "Cases", "Ethics"], heat: 0.9, season: "autumn" },
      { year: 4, mood: "แพทย์", moodEn: "doctor", desc: "Internship เต็มเวลาในโรงพยาบาลสัตว์ ใกล้ฝันแล้ว", kw: ["Internship", "Surgery", "Care"], heat: 0.85, season: "winter" },
    ],
    plosRich: [
      { name: "ความรู้วิทยาศาสตร์ชีวภาพ", score: 88 },
      { name: "จริยธรรมและการดูแลสัตว์", score: 92 },
      { name: "ทักษะคลินิก", score: 72 },
      { name: "สื่อสารกับเจ้าของสัตว์", score: 76 },
    ],
    why: "S (ช่วยเหลือ) + I (ค้นคว้า) สูง และมี volunteer ที่สถานสงเคราะห์",
    colorHex: "#FFB088",
  },
  "food-sci": {
    id: "food-sci",
    riasec: ["I", "R", "C"],
    baseFit: 71,
    seats: 100,
    cost: "15,500 ฿/เทอม",
    salary: "22,000 – 42,000 ฿",
    careers: ["Food R&D", "QA/QC", "Production Engineer", "Product Developer", "Regulatory Specialist"],
    yearVibe: [
      { year: 1, mood: "รู้จัก", moodEn: "taste", desc: "เคมีและจุลชีววิทยาอาหาร เข้า Lab สนุก ได้ชิม", kw: ["Chem", "Micro", "Lab"], heat: 0.55, season: "spring" },
      { year: 2, mood: "แปรรูป", moodEn: "process", desc: "Food Processing, Engineering Unit Operations", kw: ["Processing", "Unit Ops"], heat: 0.8, season: "summer" },
      { year: 3, mood: "นวัตกรรม", moodEn: "innovate", desc: "R&D ผลิตภัณฑ์ใหม่ + ความปลอดภัยอาหาร", kw: ["R&D", "Food Safety"], heat: 0.95, season: "autumn" },
      { year: 4, mood: "โรงงาน", moodEn: "industry", desc: "สหกิจในโรงงาน + Senior Project", kw: ["Co-op", "Plant", "Project"], heat: 0.7, season: "winter" },
    ],
    plosRich: [
      { name: "วิทยาศาสตร์อาหาร", score: 80 },
      { name: "การควบคุมคุณภาพ", score: 78 },
      { name: "นวัตกรรมผลิตภัณฑ์", score: 72 },
      { name: "ความปลอดภัยอาหาร", score: 82 },
    ],
    why: "ชอบวิทยาศาสตร์ (I) + มือถนัด (R) + ชอบระบบ (C)",
    colorHex: "#E8A93B",
  },
  finance: {
    id: "finance",
    riasec: ["I", "E", "C"],
    baseFit: 78,
    seats: 200,
    cost: "14,800 ฿/เทอม",
    salary: "28,000 – 65,000 ฿",
    careers: ["Financial Analyst", "Investment Banking", "Asset Management", "FinTech", "Risk Manager"],
    yearVibe: [
      { year: 1, mood: "รากฐาน", moodEn: "foundation", desc: "บัญชี เศรษฐศาสตร์ สถิติธุรกิจ — ทุกอย่างหมุนรอบตัวเลข", kw: ["Accounting", "Stats", "Econ"], heat: 0.55, season: "spring" },
      { year: 2, mood: "วิเคราะห์", moodEn: "analyze", desc: "การเงินองค์กร การลงทุน ตลาดเงินตลาดทุน", kw: ["Corporate Fin", "Investment"], heat: 0.85, season: "summer" },
      { year: 3, mood: "เลือกสาย", moodEn: "specialize", desc: "Derivatives, RM, FinTech Track — เริ่มสอบใบอนุญาตผู้แนะนำ", kw: ["Derivatives", "FinTech", "License"], heat: 1.0, season: "autumn" },
      { year: 4, mood: "โปรเจกต์", moodEn: "project", desc: "Senior Thesis + สหกิจสถาบันการเงิน", kw: ["Thesis", "Bank", "Co-op"], heat: 0.7, season: "winter" },
    ],
    plosRich: [
      { name: "วิเคราะห์งบการเงิน", score: 86 },
      { name: "บริหารพอร์ตลงทุน", score: 82 },
      { name: "ประยุกต์ FinTech", score: 78 },
      { name: "จริยธรรมทางการเงิน", score: 80 },
    ],
    why: "I + E + C — เหมาะกับคนชอบวิเคราะห์ข้อมูลและมีทักษะโน้มน้าว",
    colorHex: "#E8A93B",
  },
  "env-eng": {
    id: "env-eng",
    riasec: ["I", "R", "S"],
    baseFit: 68,
    seats: 80,
    cost: "16,200 ฿/เทอม",
    salary: "22,000 – 45,000 ฿",
    careers: ["Environmental Engineer", "EIA Consultant", "Water Treatment", "Sustainability Manager", "NGO"],
    yearVibe: [
      { year: 1, mood: "รากฐาน", moodEn: "foundation", desc: "เคมี ชีววิทยา และวิศวกรรมพื้นฐาน มองเห็นโลกต่างออกไป", kw: ["Chem", "Bio", "Civil 101"], heat: 0.55, season: "spring" },
      { year: 2, mood: "ระบบ", moodEn: "systems", desc: "Fluid Mechanics, Mass Transfer, หลักการบำบัดน้ำเสียเบื้องต้น", kw: ["Fluids", "Mass Transfer"], heat: 0.85, season: "summer" },
      { year: 3, mood: "ลงพื้นที่", moodEn: "field", desc: "ระบบบำบัดน้ำเสีย GIS ผลกระทบสิ่งแวดล้อม — ออก field trip", kw: ["Treatment", "GIS", "EIA"], heat: 1.0, season: "autumn" },
      { year: 4, mood: "โปรเจกต์", moodEn: "project", desc: "ออกแบบระบบสิ่งแวดล้อมจริงกับชุมชน + สหกิจ", kw: ["Design", "Community", "Co-op"], heat: 0.7, season: "winter" },
    ],
    plosRich: [
      { name: "ออกแบบระบบบำบัดน้ำเสีย", score: 82 },
      { name: "ประเมินผลกระทบสิ่งแวดล้อม", score: 80 },
      { name: "จัดการมลพิษ", score: 76 },
      { name: "ทำงานกับชุมชน", score: 74 },
    ],
    why: "I (วิเคราะห์) + R (ลงมือ) + S (ช่วยสังคม) — เหมาะคนอยากแก้ปัญหาสิ่งแวดล้อม",
    colorHex: "#7A9E7E",
  },
  psychology: {
    id: "psychology",
    riasec: ["S", "I", "A"],
    baseFit: 74,
    seats: 65,
    cost: "12,800 ฿/เทอม",
    salary: "18,000 – 42,000 ฿",
    careers: ["นักจิตวิทยาคลินิก", "HR/I-O Psychologist", "Counselor", "UX Researcher", "Educator"],
    yearVibe: [
      { year: 1, mood: "สังเกต", moodEn: "observe", desc: "จิตวิทยาทั่วไป สถิติพื้นฐาน วิธีวิจัยเบื้องต้น — เริ่มอ่านคน", kw: ["Psych 101", "Stats", "Research"], heat: 0.55, season: "spring" },
      { year: 2, mood: "วิเคราะห์", moodEn: "analyze", desc: "Personality Theory, Abnormal Psych, Developmental Psych", kw: ["Personality", "Abnormal", "Dev"], heat: 0.85, season: "summer" },
      { year: 3, mood: "เลือกแขนง", moodEn: "branch", desc: "คลินิก / อุตสาหกรรม / การศึกษา — ฝึกงานจริง", kw: ["Clinical", "I-O", "Edu"], heat: 0.95, season: "autumn" },
      { year: 4, mood: "ปฏิบัติ", moodEn: "practice", desc: "ฝึกปฏิบัติกับผู้รับบริการจริงภายใต้การดูแลอาจารย์", kw: ["Practicum", "Ethics", "Report"], heat: 0.85, season: "winter" },
    ],
    plosRich: [
      { name: "ประเมินและช่วยเหลือด้านสุขภาพจิต", score: 84 },
      { name: "ออกแบบวิจัยทางจิตวิทยา", score: 80 },
      { name: "จริยธรรมวิชาชีพ", score: 88 },
      { name: "ให้คำปรึกษา", score: 82 },
    ],
    why: "S สูง (ชอบช่วยคน) + I (ค้นคว้า) + A (เข้าใจอารมณ์) — แมตช์กับจิตวิทยาเลย",
    colorHex: "#FFB088",
  },
};

export function getRichProgram(id: string): RichProgram | undefined {
  return RICH_PROGRAMS[id];
}
