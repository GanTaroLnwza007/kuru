export type RiasecDim = "R" | "I" | "A" | "S" | "E" | "C";

export type RiasecDimInfo = {
  key: RiasecDim;
  name: string;
  th: string;
  desc: string;
  color: string;
  icon: string;
};

export type RiasecScores = Record<RiasecDim, number>;

export type QuestionFormat = "agree" | "choice" | "slider";

export type ChoiceOption = {
  label: string;
  dim: RiasecDim;
};

export type RiasecQuestion = {
  id: number;
  dim: RiasecDim;
  format: QuestionFormat;
  text: string;
  options?: ChoiceOption[];
};

export const RIASEC_DIMS: Record<RiasecDim, RiasecDimInfo> = {
  R: {
    key: "R",
    name: "Realistic",
    th: "นักลงมือทำ",
    desc: "ชอบงานที่ใช้มือ เครื่องมือ เครื่องจักร และทำงานกลางแจ้ง",
    color: "#7A9E7E",
    icon: "flag",
  },
  I: {
    key: "I",
    name: "Investigative",
    th: "นักค้นคว้า",
    desc: "ชอบคิด วิเคราะห์ ตั้งคำถาม และค้นคว้าหาคำตอบ",
    color: "#7BB7E8",
    icon: "brain",
  },
  A: {
    key: "A",
    name: "Artistic",
    th: "นักสร้างสรรค์",
    desc: "ชอบงานที่มีอิสระ คิดต่าง และแสดงออกผ่านศิลปะ",
    color: "#D88BB0",
    icon: "palette",
  },
  S: {
    key: "S",
    name: "Social",
    th: "นักช่วยเหลือ",
    desc: "ชอบช่วยเหลือผู้อื่น สอน ดูแล และทำงานกับคน",
    color: "#FFB088",
    icon: "heart",
  },
  E: {
    key: "E",
    name: "Enterprising",
    th: "นักนำ",
    desc: "ชอบโน้มน้าว นำทีม ตัดสินใจ และเริ่มต้นสิ่งใหม่",
    color: "#E8A93B",
    icon: "rocket",
  },
  C: {
    key: "C",
    name: "Conventional",
    th: "นักจัดระเบียบ",
    desc: "ชอบความชัดเจน เป็นระบบ ใส่ใจรายละเอียด",
    color: "#9A87D6",
    icon: "list",
  },
};

export const RIASEC_QUESTIONS: RiasecQuestion[] = [
  // Realistic
  {
    id: 1,
    dim: "R",
    format: "agree",
    text: "ฉันชอบลงมือซ่อมหรือประกอบสิ่งของด้วยตัวเอง",
  },
  {
    id: 2,
    dim: "R",
    format: "choice",
    text: "ถ้ามีเวลาว่างทั้งวัน ฉันอยากใช้เวลากับ…",
    options: [
      { label: "ทำสวน เลี้ยงสัตว์ หรืออยู่กลางแจ้ง", dim: "R" },
      { label: "อ่านหนังสือ ดูสารคดี ค้นคว้าเรื่องที่สนใจ", dim: "I" },
      { label: "วาดรูป แต่งเพลง หรือทำงานสร้างสรรค์", dim: "A" },
      { label: "นัดเพื่อน ทำกิจกรรมเป็นกลุ่ม", dim: "S" },
    ],
  },
  {
    id: 3,
    dim: "R",
    format: "slider",
    text: "งานที่ใช้แรงกาย เครื่องมือ หรือเทคโนโลยีในมือ ทำให้ฉันรู้สึกมีความสุข",
  },
  {
    id: 4,
    dim: "R",
    format: "agree",
    text: "ฉันสนใจวิธีการทำงานของเครื่องจักร อุปกรณ์ หรือระบบในชีวิตประจำวัน",
  },
  // Investigative
  {
    id: 5,
    dim: "I",
    format: "agree",
    text: "ฉันชอบตั้งคำถามว่า 'ทำไม' และค้นหาคำตอบเองจนกว่าจะเข้าใจ",
  },
  {
    id: 6,
    dim: "I",
    format: "slider",
    text: "ฉันเพลิดเพลินกับการแก้โจทย์ที่ซับซ้อนเป็นเวลานาน ๆ",
  },
  {
    id: 7,
    dim: "I",
    format: "choice",
    text: "เวลาเจอข้อมูลใหม่ ฉันมักจะ…",
    options: [
      { label: "ลองนำไปใช้จริงทันที", dim: "R" },
      { label: "ค้นต่อ อ่านเพิ่ม และเปรียบเทียบแหล่งข้อมูล", dim: "I" },
      { label: "นำมาตีความและสร้างเป็นงานของตัวเอง", dim: "A" },
      { label: "แชร์ให้เพื่อนแล้วชวนคุย", dim: "S" },
    ],
  },
  {
    id: 8,
    dim: "I",
    format: "agree",
    text: "ฉันสนุกกับวิทยาศาสตร์ คณิตศาสตร์ หรือการวิเคราะห์ข้อมูล",
  },
  // Artistic
  {
    id: 9,
    dim: "A",
    format: "agree",
    text: "ฉันมักมีไอเดียใหม่ ๆ ผุดขึ้นมาในหัวอยู่เสมอ",
  },
  {
    id: 10,
    dim: "A",
    format: "slider",
    text: "ฉันรู้สึกอิสระเมื่อได้แสดงออกผ่านงานสร้างสรรค์ (ดนตรี ศิลปะ การเขียน ฯลฯ)",
  },
  {
    id: 11,
    dim: "A",
    format: "choice",
    text: "งานในฝันของฉันคือ…",
    options: [
      { label: "งานออกแบบ งานสร้างสรรค์ที่ไม่มีกรอบมาก", dim: "A" },
      { label: "งานวิจัย ห้องทดลอง คิดวิเคราะห์", dim: "I" },
      { label: "งานที่ได้พบผู้คน ดูแล แนะนำ", dim: "S" },
      { label: "งานบริหาร นำทีม สร้างธุรกิจ", dim: "E" },
    ],
  },
  {
    id: 12,
    dim: "A",
    format: "agree",
    text: "ฉันให้ความสำคัญกับความสวยงาม รสนิยม และดีไซน์",
  },
  // Social
  {
    id: 13,
    dim: "S",
    format: "agree",
    text: "ฉันรู้สึกพอใจเมื่อได้ช่วยเหลือคนอื่นจริง ๆ",
  },
  {
    id: 14,
    dim: "S",
    format: "slider",
    text: "ฉันเป็นคนที่เพื่อน ๆ มักมาปรึกษาเรื่องส่วนตัว",
  },
  {
    id: 15,
    dim: "S",
    format: "agree",
    text: "การได้สอนหรืออธิบายเรื่องยาก ๆ ให้คนอื่นเข้าใจคือสิ่งที่ฉันทำได้ดี",
  },
  {
    id: 16,
    dim: "S",
    format: "choice",
    text: "ฉันเลือกอาชีพในอนาคตจาก…",
    options: [
      { label: "ผลกระทบทางสังคม ได้ช่วยคน", dim: "S" },
      { label: "รายได้ โอกาสเติบโต", dim: "E" },
      { label: "ความน่าสนใจของเนื้องาน", dim: "I" },
      { label: "อิสระและพื้นที่สร้างสรรค์", dim: "A" },
    ],
  },
  // Enterprising
  {
    id: 17,
    dim: "E",
    format: "agree",
    text: "ฉันมั่นใจเวลาต้องพูดหน้าชั้นหรือนำเสนองาน",
  },
  {
    id: 18,
    dim: "E",
    format: "slider",
    text: "ฉันชอบรับบทบาทเป็นหัวหน้ากลุ่มหรือผู้นำกิจกรรม",
  },
  {
    id: 19,
    dim: "E",
    format: "agree",
    text: "ฉันสนุกกับการเจรจา ต่อรอง หรือโน้มน้าวคนอื่น",
  },
  {
    id: 20,
    dim: "E",
    format: "choice",
    text: "ในกลุ่ม ฉันมักเป็น…",
    options: [
      { label: "คนที่ตัดสินใจและพาทีมไปข้างหน้า", dim: "E" },
      { label: "คนที่ช่วยให้ทุกคนเข้าใจกัน", dim: "S" },
      { label: "คนที่คิดวิเคราะห์ก่อนตัดสินใจ", dim: "I" },
      { label: "คนที่จัดการรายละเอียดให้เรียบร้อย", dim: "C" },
    ],
  },
  // Conventional
  {
    id: 21,
    dim: "C",
    format: "agree",
    text: "ฉันชอบทำงานที่มีขั้นตอนชัดเจนและตรวจสอบได้",
  },
  {
    id: 22,
    dim: "C",
    format: "slider",
    text: "การจัดเอกสาร ตารางเวลา หรือบัญชีให้เป็นระเบียบ ทำให้ฉันรู้สึกดี",
  },
  {
    id: 23,
    dim: "C",
    format: "agree",
    text: "ฉันใส่ใจรายละเอียดเล็ก ๆ มากกว่าคนทั่วไป",
  },
  {
    id: 24,
    dim: "C",
    format: "choice",
    text: "เวลาทำงานกลุ่ม ฉันถนัดที่สุดในเรื่อง…",
    options: [
      { label: "จัดการตาราง ติดตามทุกอย่างให้ครบ", dim: "C" },
      { label: "คิดไอเดียและทำให้สวยงาม", dim: "A" },
      { label: "พรีเซนต์ พูดให้กรรมการประทับใจ", dim: "E" },
      { label: "ค้นหาข้อมูลและตรวจสอบความถูกต้อง", dim: "I" },
    ],
  },
];

export type AnswerRecord = {
  dim: RiasecDim;
  val: number;
};

export function computeRiasecScores(answers: AnswerRecord[]): RiasecScores {
  const scores: RiasecScores = { R: 50, I: 50, A: 50, S: 50, E: 50, C: 50 };
  answers.forEach((a) => {
    scores[a.dim] += a.val * 5;
  });
  (Object.keys(scores) as RiasecDim[]).forEach((k) => {
    scores[k] = Math.max(15, Math.min(98, Math.round(scores[k])));
  });
  return scores;
}

export function getTop3Code(scores: RiasecScores): string {
  return (Object.entries(scores) as [RiasecDim, number][])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([k]) => k)
    .join("");
}

export function computeProgramMatch(
  programRiasec: RiasecDim[],
  scores: RiasecScores,
  baseFit: number,
): number {
  const fit = programRiasec.reduce(
    (acc, k, i) => acc + scores[k] * (3 - i) / 6,
    0,
  );
  return Math.round(Math.max(40, Math.min(98, fit + (baseFit - 70) * 0.4 + 30)));
}
