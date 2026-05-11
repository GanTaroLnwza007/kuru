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
  "computer-eng": {
    id: "computer-eng",
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
  "ske-intl": {
    id: "ske-intl",
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
  "vet-tech": {
    id: "vet-tech",
    riasec: ["I", "S", "R"],
    baseFit: 76,
    seats: 80,
    cost: "22,500 ฿/เทอม",
    salary: "28,000 – 80,000 ฿",
    careers: ["สัตวแพทย์คลินิก", "นักวิจัยสัตวแพทย์", "ปศุสัตว์/ฟาร์ม", "Public Health", "Food Safety"],
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
  "environmental-eng": {
    id: "environmental-eng",
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
  law: {
    id: "law",
    riasec: ["E", "S", "C"],
    baseFit: 76,
    seats: 150,
    cost: "13,500 ฿/เทอม",
    salary: "20,000 – 70,000 ฿",
    careers: ["Lawyer", "Legal Consultant", "Judicial Officer", "Corporate Counsel", "Policy Analyst"],
    yearVibe: [
      { year: 1, mood: "เข้าใจระบบ", moodEn: "system", desc: "กฎหมายพื้นฐาน นิติทั่วไป ระบบยุติธรรมไทย — เรียนรู้การอ่านตัวบทกฎหมาย", kw: ["Law 101", "Justice", "Thai Law"], heat: 0.55, season: "spring" },
      { year: 2, mood: "แพ่ง/อาญา", moodEn: "civil-criminal", desc: "กฎหมายแพ่ง กฎหมายอาญา กฎหมายมหาชน ฝึกตีความ", kw: ["Civil", "Criminal", "Public Law"], heat: 0.85, season: "summer" },
      { year: 3, mood: "ว่าความ", moodEn: "advocacy", desc: "กฎหมายพาณิชย์ สัมมนากฎหมาย ฝึกเขียนคำฟ้องและโต้แย้ง", kw: ["Commercial", "Seminar", "Pleading"], heat: 1.0, season: "autumn" },
      { year: 4, mood: "ฝึกงาน", moodEn: "practice", desc: "ฝึกงานสำนักงานกฎหมายหรือหน่วยงานรัฐ เตรียมสอบเนติบัณฑิต", kw: ["Internship", "Bar Exam", "Career"], heat: 0.75, season: "winter" },
    ],
    plosRich: [
      { name: "วิเคราะห์และตีความกฎหมาย", score: 88 },
      { name: "ว่าความและโต้แย้ง", score: 82 },
      { name: "จริยธรรมทางกฎหมาย", score: 86 },
      { name: "เขียนเชิงกฎหมาย", score: 80 },
    ],
    why: "E (โน้มน้าว) + S (ช่วยเหลือสังคม) + C (ใส่ใจรายละเอียด) — โครงสร้างกฎหมายเหมาะกับคุณ",
    colorHex: "#8B6F9F",
  },
  "earth-science": {
    id: "earth-science",
    riasec: ["I", "R", "S"],
    baseFit: 70,
    seats: 60,
    cost: "14,200 ฿/เทอม",
    salary: "20,000 – 45,000 ฿",
    careers: ["Geologist", "GIS Specialist", "Environmental Consultant", "Seismologist", "Mining Engineer"],
    yearVibe: [
      { year: 1, mood: "สำรวจโลก", moodEn: "explore", desc: "ธรณีวิทยาพื้นฐาน เคมี ฟิสิกส์ ออกสำรวจหินและแร่ธาตุ", kw: ["Geology", "Minerals", "Field"], heat: 0.6, season: "spring" },
      { year: 2, mood: "วิเคราะห์", moodEn: "analyze", desc: "ธรณีสัณฐาน ธรณีเคมี แผ่นดินไหว ลงพื้นที่จริง", kw: ["Geomorphology", "Geochemistry", "Seismic"], heat: 0.85, season: "summer" },
      { year: 3, mood: "เทคโนโลยี", moodEn: "tech", desc: "GIS, Remote Sensing, ธรณีฟิสิกส์ประยุกต์", kw: ["GIS", "Remote Sensing", "Geophysics"], heat: 1.0, season: "autumn" },
      { year: 4, mood: "วิจัย", moodEn: "research", desc: "วิทยานิพนธ์ + ฝึกงานหน่วยงานสำรวจหรือเหมืองแร่", kw: ["Thesis", "Survey", "Mining"], heat: 0.7, season: "winter" },
    ],
    plosRich: [
      { name: "วิเคราะห์ธรณีวิทยา", score: 84 },
      { name: "ใช้ GIS และ Remote Sensing", score: 80 },
      { name: "ประเมินความเสี่ยงทางธรรมชาติ", score: 76 },
      { name: "วิจัยสิ่งแวดล้อม", score: 78 },
    ],
    why: "I (ค้นคว้า) + R (ลงมือสำรวจ) + S (อนุรักษ์สิ่งแวดล้อม) — เหมาะกับคนรักธรรมชาติและชอบออกภาคสนาม",
    colorHex: "#8B7355",
  },
  "aerospace-eng": {
    id: "aerospace-eng",
    riasec: ["I", "R", "C"],
    baseFit: 88,
    seats: 60,
    cost: "18,000 ฿/เทอม",
    salary: "30,000 – 70,000 ฿",
    careers: ["Aerospace Engineer", "Drone Engineer", "Aviation Technical Officer", "Defense Researcher", "Systems Engineer"],
    yearVibe: [
      { year: 1, mood: "ทะยาน", moodEn: "launch", desc: "คณิตศาสตร์ ฟิสิกส์ และพื้นฐานวิศวกรรม เริ่มเรียนรู้ Aerodynamics", kw: ["Calculus", "Physics", "Aero 101"], heat: 0.65, season: "spring" },
      { year: 2, mood: "กลศาสตร์", moodEn: "mechanics", desc: "Aerodynamics, Thermodynamics, Structural Analysis เนื้อหาหนักแต่ตื่นเต้น", kw: ["Aero", "Thermo", "Structures"], heat: 0.9, season: "summer" },
      { year: 3, mood: "ระบบ", moodEn: "systems", desc: "Propulsion, Flight Mechanics, Control Systems และ CAD/CAE", kw: ["Propulsion", "Flight", "Control"], heat: 1.0, season: "autumn" },
      { year: 4, mood: "ออกแบบ", moodEn: "design", desc: "Capstone Aircraft Design + ฝึกงานอุตสาหกรรมการบิน/กลาโหม", kw: ["Design", "Internship", "Industry"], heat: 0.75, season: "winter" },
    ],
    plosRich: [
      { name: "วิเคราะห์ Aerodynamics", score: 90 },
      { name: "ออกแบบโครงสร้างอากาศยาน", score: 86 },
      { name: "ระบบควบคุมการบิน", score: 82 },
      { name: "แก้ปัญหาเชิงวิศวกรรม", score: 88 },
    ],
    why: "I (วิเคราะห์เชิงลึก) + R (สร้างและทดสอบ) + C (ใส่ใจความปลอดภัย) — เหมาะกับคนฝันอยากบิน",
    colorHex: "#4A90D9",
  },
  "chemical-eng": {
    id: "chemical-eng",
    riasec: ["I", "R", "C"],
    baseFit: 80,
    seats: 90,
    cost: "17,000 ฿/เทอม",
    salary: "25,000 – 55,000 ฿",
    careers: ["Chemical Engineer", "Process Engineer", "R&D Engineer", "Environmental Engineer", "Petrochemical Specialist"],
    yearVibe: [
      { year: 1, mood: "สูตรและสมการ", moodEn: "equations", desc: "เคมีทั่วไป คณิตศาสตร์วิศวกรรม ฟิสิกส์ และ Lab เคมีพื้นฐาน", kw: ["Chem", "Math", "Lab"], heat: 0.6, season: "spring" },
      { year: 2, mood: "กระบวนการ", moodEn: "process", desc: "Mass & Energy Balance, Thermodynamics, Fluid Mechanics", kw: ["Mass Balance", "Thermo", "Fluids"], heat: 0.85, season: "summer" },
      { year: 3, mood: "โรงงาน", moodEn: "plant", desc: "Reactor Design, Process Control, Heat Transfer, Safety Engineering", kw: ["Reactor", "Control", "Safety"], heat: 1.0, season: "autumn" },
      { year: 4, mood: "อุตสาหกรรม", moodEn: "industry", desc: "Plant Design Project + สหกิจในโรงงานปิโตรเคมีหรือเคมีภัณฑ์", kw: ["Plant Design", "Co-op", "Petrochem"], heat: 0.75, season: "winter" },
    ],
    plosRich: [
      { name: "ออกแบบกระบวนการทางเคมี", score: 86 },
      { name: "ควบคุมคุณภาพและความปลอดภัย", score: 84 },
      { name: "แก้ปัญหาเชิงวิศวกรรม", score: 82 },
      { name: "อนุรักษ์สิ่งแวดล้อม", score: 76 },
    ],
    why: "I (วิเคราะห์) + R (สร้างระบบ) + C (ใส่ใจความปลอดภัย) — เหมาะกับคนรักเคมีและการออกแบบ",
    colorHex: "#7BA05B",
  },
  "industrial-eng": {
    id: "industrial-eng",
    riasec: ["I", "R", "C"],
    baseFit: 82,
    seats: 100,
    cost: "17,000 ฿/เทอม",
    salary: "25,000 – 55,000 ฿",
    careers: ["Industrial Engineer", "Production Manager", "Quality Engineer", "Logistics Analyst", "Systems Consultant"],
    yearVibe: [
      { year: 1, mood: "ปูรากฐาน", moodEn: "foundation", desc: "คณิตศาสตร์ ฟิสิกส์ เคมี และวิศวกรรมพื้นฐาน — เตรียมพร้อมสำหรับสายการผลิต", kw: ["Math", "Physics", "Intro Eng"], heat: 0.6, season: "spring" },
      { year: 2, mood: "กระบวนการ", moodEn: "process", desc: "Probability & Statistics, Operations Research, Manufacturing Processes", kw: ["OR", "Stats", "Manufacturing"], heat: 0.85, season: "summer" },
      { year: 3, mood: "ระบบโรงงาน", moodEn: "systems", desc: "Facility Layout, Quality Management, Supply Chain, Ergonomics", kw: ["Layout", "QM", "Supply Chain"], heat: 1.0, season: "autumn" },
      { year: 4, mood: "โปรเจกต์จริง", moodEn: "project", desc: "Senior Project ปรับปรุงสายการผลิตจริง + สหกิจในโรงงานอุตสาหกรรม", kw: ["Project", "Co-op", "Industry"], heat: 0.75, season: "winter" },
    ],
    plosRich: [
      { name: "วิเคราะห์และออกแบบระบบการผลิต", score: 88 },
      { name: "บริหารคุณภาพและ Lean Manufacturing", score: 84 },
      { name: "จัดการโลจิสติกส์และห่วงโซ่อุปทาน", score: 80 },
      { name: "แก้ปัญหาด้วยข้อมูล (Data-driven)", score: 82 },
    ],
    why: "I (วิเคราะห์ระบบ) + R (ปรับปรุงกระบวนการจริง) + C (ใส่ใจความแม่นยำ) — เหมาะคนอยากทำให้โรงงานทำงานได้ดีขึ้น",
    colorHex: "#5B8A6E",
  },
  "political-science": {
    id: "political-science",
    riasec: ["S", "E", "I"],
    baseFit: 72,
    seats: 120,
    cost: "12,500 ฿/เทอม",
    salary: "18,000 – 50,000 ฿",
    careers: ["Government Official", "Diplomat", "Policy Analyst", "Journalist", "NGO Worker"],
    yearVibe: [
      { year: 1, mood: "ทฤษฎีรัฐ", moodEn: "theory", desc: "รัฐศาสตร์ทั่วไป ระบบการเมือง ประวัติศาสตร์การเมืองไทย", kw: ["Politics 101", "Thai Politics", "Systems"], heat: 0.55, season: "spring" },
      { year: 2, mood: "ความสัมพันธ์", moodEn: "relations", desc: "ความสัมพันธ์ระหว่างประเทศ รัฐประศาสนศาสตร์ นโยบายสาธารณะ", kw: ["IR", "Public Admin", "Policy"], heat: 0.85, season: "summer" },
      { year: 3, mood: "วิเคราะห์", moodEn: "analyze", desc: "วิเคราะห์นโยบาย การเมืองเปรียบเทียบ ฝึกงานหน่วยงานภาครัฐ", kw: ["Policy Analysis", "Comparative", "Internship"], heat: 0.95, season: "autumn" },
      { year: 4, mood: "นักวิชาชีพ", moodEn: "professional", desc: "ธีสิส + ฝึกงานกระทรวง สถานทูต หรือ NGO ระหว่างประเทศ", kw: ["Thesis", "Ministry", "NGO"], heat: 0.7, season: "winter" },
    ],
    plosRich: [
      { name: "วิเคราะห์นโยบายสาธารณะ", score: 84 },
      { name: "ความสัมพันธ์ระหว่างประเทศ", score: 80 },
      { name: "การสื่อสารและโน้มน้าว", score: 86 },
      { name: "จริยธรรมทางการเมือง", score: 82 },
    ],
    why: "S (ช่วยสังคม) + E (ผู้นำ) + I (วิเคราะห์ระบบ) — เหมาะกับคนอยากเปลี่ยนแปลงสังคม",
    colorHex: "#C0584A",
  },
};

export function getRichProgram(id: string): RichProgram | undefined {
  return RICH_PROGRAMS[id];
}
