"use client";

import { useState } from "react";
import Link from "next/link";

// ── Design tokens ────────────────────────────────────────────────
const T = {
  green: "#00A651",
  greenDeep: "#006D35",
  greenSoft: "#E6F5EC",
  greenInk: "#006D35",
  ink: "#0A1F14",
  ink2: "#2E3D34",
  ink3: "#6B7770",
  ink4: "#9FAF9C",
  line: "#E8EAE2",
  lineSoft: "#F0F2EB",
  bgTint: "#F7F8F3",
  amber: "#E8A93B",
  amberSoft: "#FFF6E2",
  sky: "#2A5C86",
  skySoft: "#EAF3FB",
  violet: "#7A5FBF",
  violetSoft: "#F1ECFB",
  bad: "#C23B3B",
  warn: "#D49419",
};

// ── Mock data (from KUru.zip design) ─────────────────────────────
const PORTFOLIO = {
  fileName: "Portfolio_ไพฑูรย์_Kamolwan_2568.pdf",
  size: "4.2 MB",
  pages: "28 หน้า",
  profile: {
    name: "ไพฑูรย์ กมลวรรณ",
    school: "โรงเรียนสาธิตมหาวิทยาลัยเกษตรศาสตร์",
    grade: "ม.6/2",
    track: "วิทย์–คณิต",
    contact: "paitoon.k@gmail.com · 089-xxx-xxxx",
  },
  achievements: [
    { title: "รางวัลชนะเลิศ โครงงานวิทย์ สมาคมวิทย์แห่งประเทศไทย", tag: "Academic", year: "2567", strength: 0.92 },
    { title: "ผู้แทนประเทศ ISEF — International Science Fair", tag: "Academic", year: "2566", strength: 0.88 },
    { title: "หัวหน้าชมรม AI & Robotics ม.ปลาย", tag: "Leadership", year: "2566–68", strength: 0.75 },
    { title: "อาสาสมัคร สอน Coding ศูนย์เด็กชุมชน", tag: "Volunteer", year: "2567", strength: 0.62 },
  ],
  works: [
    { name: "AI Plant Disease Detector", desc: "ตรวจโรคพืชด้วย YOLOv8 + Raspberry Pi", type: "Project" },
    { name: "KU Hackathon — 1st Place", desc: "ระบบ Smart Irrigation สำหรับเกษตรกรรายย่อย", type: "Competition" },
    { name: "Medium Blog — 12 บทความ", desc: "เทคโนโลยีเกษตร, AI, และการเรียน", type: "Content" },
  ],
  skills: ["Python", "Machine Learning", "Arduino", "Figma", "Git", "Thai / English"],
  languages: [
    { name: "ภาษาไทย", level: "เจ้าของภาษา" },
    { name: "ภาษาอังกฤษ", level: "B2 (IELTS 6.5)" },
  ],
};

const STRENGTHS = [
  { title: "ผลงานวิทยาศาสตร์ระดับนานาชาติ", detail: "ISEF เป็นที่รู้จักในกลุ่มกรรมการวิศวฯ สคส." },
  { title: "AI + เกษตร = ตรงกับ SKE มาก", detail: "โปรเจกต์คุณตรงกับ PLO ข้อ 2, 4, 5 ของ SKE" },
  { title: "ภาวะผู้นำชัดเจน", detail: "หัวหน้าชมรมต่อเนื่อง 2 ปี — กรรมการรอบ 1 ให้น้ำหนักเรื่องนี้" },
];

const GAPS = [
  {
    id: "G1", severity: "high" as const,
    title: "ขาดบทความหรือบล็อกเชิงลึกเกี่ยวกับ AI",
    why: "คณะต้องการเห็นความสามารถสื่อสารความรู้เชิงเทคนิค",
    how: ["เขียน Medium 2–3 บทความอธิบาย AI Plant Detector", "อธิบาย methodology + ผลลัพธ์เป็นภาษาง่าย"],
    time: "3 สัปดาห์",
  },
  {
    id: "G2", severity: "med" as const,
    title: "ยังไม่มีกิจกรรมบริการสังคมที่ต่อเนื่อง",
    why: "รอบ 1 วัดความมุ่งมั่นระยะยาว ไม่ใช่แค่ครั้งเดียว",
    how: ["ลงทะเบียนสอน Coding ศูนย์เด็กอีกรอบ (ต.ค.–ธ.ค.)", "บันทึก impact: จำนวนเด็ก, ผลการเรียน"],
    time: "8 สัปดาห์",
  },
  {
    id: "G3", severity: "low" as const,
    title: "รูปภาพในพอร์ตไม่สม่ำเสมอ",
    why: "Visual consistency ส่งผลต่อความน่าเชื่อถือของพอร์ต",
    how: ["ถ่ายภาพโปรเจกต์ใหม่บนพื้นหลังสีขาว", "ใช้ฟอนต์และโทนสีเดียวกันทั้งเล่ม"],
    time: "2 วัน",
  },
];

const ROADMAP_WEEKS = [
  {
    week: "สัปดาห์ที่ 1–2", month: "พ.ค. 2569",
    items: [
      { id: 1, t: "อัปโหลดผลคะแนน TGAT-1 และ TPAT-3", tag: "Quick win", time: "15 นาที" },
      { id: 2, t: "ถ่ายภาพประกอบโครงงานใหม่ — สีโทนเดียวกัน", tag: "Polish", time: "2 ชั่วโมง" },
    ],
  },
  {
    week: "สัปดาห์ที่ 3–6", month: "พ.ค.–มิ.ย. 2569",
    items: [
      { id: 3, t: "เขียนบทความ Medium #1 — เรื่องเทคโนโลยี+ชุมชน", tag: "Content", time: "1 สัปดาห์" },
      { id: 4, t: "ลงทะเบียนเป็นพี่เลี้ยงค่ายโครงงานวิทย์ ธ.ค.", tag: "Activity", time: "30 นาที" },
      { id: 5, t: "เขียนบทความ Medium #2", tag: "Content", time: "1 สัปดาห์" },
    ],
  },
  {
    week: "สัปดาห์ที่ 7–10", month: "มิ.ย.–ก.ค. 2569",
    items: [
      { id: 6, t: "อาสาสอน Coding ที่ศูนย์เด็ก (8 สัปดาห์)", tag: "Volunteer", time: "ต่อเนื่อง" },
      { id: 7, t: "เขียนบทความ Medium #3", tag: "Content", time: "1 สัปดาห์" },
    ],
  },
  {
    week: "สัปดาห์ที่ 11–12", month: "ก.ค. 2569",
    items: [
      { id: 8, t: "ปรับโครงสร้างพอร์ตใหม่ + Cover letter", tag: "Polish", time: "3 วัน" },
      { id: 9, t: "ตรวจทาน + ขอ feedback จากครู", tag: "Review", time: "1 สัปดาห์" },
    ],
  },
];

// ── Shared primitives ─────────────────────────────────────────────
function Card({ children, padding = 24, style }: { children: React.ReactNode; padding?: number; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: "#fff",
      borderRadius: 20,
      border: `1px solid ${T.lineSoft}`,
      boxShadow: "0 1px 3px rgba(15,27,20,.05)",
      padding,
      ...style,
    }}>
      {children}
    </div>
  );
}

function Bar({ value, color = T.green, height = 6 }: { value: number; color?: string; height?: number }) {
  return (
    <div style={{ height, background: color + "22", borderRadius: height, overflow: "hidden" }}>
      <div style={{ width: `${value}%`, height: "100%", background: color, borderRadius: height, transition: "width 600ms ease-out" }} />
    </div>
  );
}

function Tag({ children, color }: { children: React.ReactNode; color: string }) {
  const map: Record<string, [string, string]> = {
    Academic: [T.skySoft, T.sky],
    Leadership: [T.amberSoft, T.amber],
    Volunteer: [T.greenSoft, T.green],
    Certificate: [T.violetSoft, T.violet],
    "Quick win": [T.greenSoft, T.green],
    Content: [T.skySoft, T.sky],
    Activity: [T.amberSoft, T.amber],
    Volunteer2: [T.greenSoft, T.green],
    Polish: [T.violetSoft, T.violet],
    Review: [T.bgTint, T.ink3],
    high: ["#FCE9E8", T.bad],
    med: [T.amberSoft, T.warn],
    low: [T.bgTint, T.ink3],
    green: [T.greenSoft, T.green],
    sky: [T.skySoft, T.sky],
    amber: [T.amberSoft, T.amber],
    rose: ["#FCE9E8", T.bad],
    violet: [T.violetSoft, T.violet],
    gray: [T.bgTint, T.ink3],
  };
  const [bg, fg] = map[color] ?? [T.bgTint, T.ink3];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      height: 22, padding: "0 8px", borderRadius: 999,
      background: bg, color: fg, fontSize: 11, fontWeight: 700,
    }}>
      {children}
    </span>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 18,
      background: "transparent", border: "none", color: T.ink3,
      fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
    }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
      กลับ
    </button>
  );
}

function Btn({ children, onClick, kind = "primary", icon }: {
  children: React.ReactNode; onClick?: () => void;
  kind?: "primary" | "ghost" | "white" | "primaryDeep";
  icon?: "arrow-right" | "download" | "chat" | "file" | "check";
}) {
  const styles: Record<string, React.CSSProperties> = {
    primary: { background: T.green, color: "#fff", border: "none" },
    ghost: { background: "transparent", color: T.ink2, border: `1px solid ${T.line}` },
    white: { background: "#fff", color: T.ink, border: `1px solid ${T.line}` },
    primaryDeep: { background: T.greenDeep, color: "#fff", border: "none" },
  };
  const icons: Record<string, React.ReactNode> = {
    "arrow-right": <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>,
    download: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>,
    chat: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
    file: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>,
    check: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>,
  };
  return (
    <button onClick={onClick} style={{
      display: "inline-flex", alignItems: "center", gap: 8,
      height: 42, padding: "0 18px", borderRadius: 999,
      fontSize: 14, fontWeight: 700, cursor: "pointer",
      fontFamily: "inherit", transition: "opacity 180ms",
      ...styles[kind],
    }}>
      {icon && icons[icon]}
      {children}
    </button>
  );
}

// ── Ring (readiness score) ────────────────────────────────────────
function Ring({ value, size = 160 }: { value: number; size?: number }) {
  const sw = size * 0.07;
  const r = (size - sw) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={T.greenSoft} strokeWidth={sw} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={T.green} strokeWidth={sw}
          strokeLinecap="round" strokeDasharray={circ}
          strokeDashoffset={circ - (value / 100) * circ} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: size * 0.22, fontWeight: 800, color: T.ink, lineHeight: 1 }}>{value}</span>
        <span style={{ fontSize: size * 0.1, color: T.ink3, marginTop: 4 }}>ความพร้อมรอบ 1</span>
      </div>
    </div>
  );
}

// ── Step 1: Upload ────────────────────────────────────────────────
function CoachUpload({ onNext }: { onNext: () => void }) {
  const [drag, setDrag] = useState(false);
  const items = [
    { icon: "⭐", title: "รางวัลและความสำเร็จ", desc: "ระดับ ความใหม่ ความเกี่ยวข้อง" },
    { icon: "💼", title: "ผลงานและโปรเจกต์", desc: "ความซับซ้อน บทบาท ผลลัพธ์" },
    { icon: "🚩", title: "กิจกรรมและภาวะผู้นำ", desc: "ความต่อเนื่อง ผลกระทบ" },
    { icon: "🛡️", title: "ความสอดคล้องกับคณะ", desc: "PLO ของหลักสูตรที่คุณสนใจ" },
  ];
  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "40px 24px 80px" }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: T.green, letterSpacing: "0.1em", marginBottom: 8 }}>
        Portfolio Coach · ขั้นตอนที่ 1 จาก 4
      </div>
      <h1 style={{ fontSize: "clamp(28px,5vw,42px)", fontWeight: 800, color: T.ink, lineHeight: 1.15, margin: "0 0 12px", letterSpacing: "-0.02em" }}>
        ส่งพอร์ตของคุณมาดูกัน
      </h1>
      <p style={{ fontSize: 16, color: T.ink2, lineHeight: 1.6, marginBottom: 28 }}>
        KUru จะอ่านพอร์ตของคุณ แยกข้อมูลออกมา แล้วบอกว่าต้องเสริมตรงไหนเพื่อยื่น TCAS รอบ 1
        <br />
        <span style={{ fontSize: 13, color: T.ink3 }}>🔒 ไฟล์ของคุณจะอยู่บนเครื่องของคุณเท่านั้น</span>
      </p>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); }}
        style={{
          border: `2px dashed ${drag ? T.green : T.line}`,
          background: drag ? T.greenSoft + "60" : "#fff",
          borderRadius: 24, padding: "64px 32px",
          textAlign: "center", cursor: "pointer",
          transition: "all 200ms ease-out",
        }}
      >
        <div style={{
          width: 72, height: 72, borderRadius: 20, margin: "0 auto 16px",
          background: T.greenSoft, color: T.green,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 12px -4px rgba(0,166,81,0.3)",
          transform: drag ? "scale(1.06)" : "scale(1)", transition: "transform 200ms",
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>
        <div style={{ fontSize: 19, fontWeight: 700, color: T.ink, marginBottom: 6 }}>
          ลากไฟล์มาวางที่นี่ หรือกดเพื่อเลือก
        </div>
        <div style={{ fontSize: 13.5, color: T.ink3, marginBottom: 24 }}>รองรับ PDF · ไม่เกิน 25 MB</div>
        {/* Demo button — jumps to step 2 to preview the UI */}
        <Btn kind="primary" icon="file" onClick={onNext}>เลือกพอร์ตจากเครื่อง</Btn>
        <div style={{ marginTop: 12, fontSize: 12, color: T.ink4 }}>หรือ</div>
        <button
          onClick={onNext}
          style={{ marginTop: 8, background: "none", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, color: T.ink3, textDecoration: "underline", fontFamily: "inherit" }}
        >
          ดูตัวอย่างผลลัพธ์ (demo)
        </button>
      </div>

      <div style={{ marginTop: 28 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: T.ink, marginBottom: 12 }}>เราจะดูอะไรในพอร์ตของคุณบ้าง?</div>
        <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(2,1fr)" }}>
          {items.map((it) => (
            <div key={it.title} style={{ display: "flex", gap: 10, padding: 14, background: "#fff", borderRadius: 14, border: `1px solid ${T.lineSoft}` }}>
              <span style={{ fontSize: 20 }}>{it.icon}</span>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: T.ink }}>{it.title}</div>
                <div style={{ fontSize: 12, color: T.ink3, marginTop: 2 }}>{it.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Step 2: Review ────────────────────────────────────────────────
function CoachReview({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  return (
    <div style={{ maxWidth: 920, margin: "0 auto", padding: "40px 24px 80px" }}>
      <BackButton onClick={onBack} />
      <div style={{ fontSize: 12, fontWeight: 700, color: T.green, letterSpacing: "0.1em", marginBottom: 8 }}>
        Portfolio Coach · ขั้นตอนที่ 2 จาก 4
      </div>
      <h1 style={{ fontSize: "clamp(24px,4vw,38px)", fontWeight: 800, color: T.ink, lineHeight: 1.15, margin: "0 0 8px", letterSpacing: "-0.02em" }}>
        ข้อมูลที่ระบบดึงออกมาได้จากแฟ้มสะสมผลงานของคุณ
      </h1>
      <p style={{ fontSize: 15, color: T.ink2, marginBottom: 28, lineHeight: 1.6 }}>
        ตรวจดูแล้วแก้ไขได้เสมอ — ความถูกต้องของข้อมูลส่งผลต่อการวิเคราะห์
      </p>

      {/* Profile */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{
            width: 64, height: 64, borderRadius: 20,
            background: `linear-gradient(135deg, ${T.green}, ${T.greenDeep})`,
            color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28, fontWeight: 800, flexShrink: 0,
          }}>ไ</div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: T.ink }}>{PORTFOLIO.profile.name}</div>
            <div style={{ fontSize: 14, color: T.ink2, marginTop: 4 }}>
              {PORTFOLIO.profile.school} · {PORTFOLIO.profile.grade} · {PORTFOLIO.profile.track}
            </div>
            <div style={{ fontSize: 13, color: T.ink3, marginTop: 2 }}>{PORTFOLIO.profile.contact}</div>
          </div>
        </div>
      </Card>

      {/* Achievements */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: T.ink }}>
            รางวัลและความสำเร็จ{" "}
            <span style={{ color: T.ink3, fontWeight: 500 }}>· {PORTFOLIO.achievements.length} รายการ</span>
          </div>
        </div>
        <div style={{ display: "grid", gap: 10 }}>
          {PORTFOLIO.achievements.map((a, i) => (
            <div key={i} style={{ display: "flex", gap: 12, padding: 14, borderRadius: 14, background: T.bgTint, alignItems: "center" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14.5, fontWeight: 700, color: T.ink, marginBottom: 4 }}>{a.title}</div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <Tag color={a.tag}>{a.tag}</Tag>
                  <span style={{ fontSize: 12, color: T.ink3 }}>{a.year}</span>
                </div>
              </div>
              <div style={{ width: 60, flexShrink: 0 }}>
                <Bar value={a.strength * 100} color={T.amber} />
                <div style={{ fontSize: 10, color: T.ink3, marginTop: 4, textAlign: "right" }}>ความแข็งแรง</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Works */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: T.ink, marginBottom: 14 }}>ผลงานและโปรเจกต์</div>
        <div style={{ display: "grid", gap: 10 }}>
          {PORTFOLIO.works.map((w, i) => (
            <div key={i} style={{ display: "flex", gap: 12, padding: 14, borderRadius: 14, background: T.bgTint, alignItems: "center" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14.5, fontWeight: 700, color: T.ink, marginBottom: 2 }}>{w.name}</div>
                <div style={{ fontSize: 12.5, color: T.ink3 }}>{w.desc}</div>
              </div>
              <Tag color="green">{w.type}</Tag>
            </div>
          ))}
        </div>
      </Card>

      {/* Skills + Languages */}
      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "1fr 1fr", marginBottom: 24 }}>
        <Card>
          <div style={{ fontSize: 16, fontWeight: 700, color: T.ink, marginBottom: 14 }}>ทักษะ</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {PORTFOLIO.skills.map((s) => (
              <span key={s} style={{ fontSize: 13, fontWeight: 600, padding: "6px 12px", borderRadius: 999, background: T.violetSoft, color: T.violet }}>{s}</span>
            ))}
          </div>
        </Card>
        <Card>
          <div style={{ fontSize: 16, fontWeight: 700, color: T.ink, marginBottom: 14 }}>ภาษา</div>
          <div style={{ display: "grid", gap: 8 }}>
            {PORTFOLIO.languages.map((l) => (
              <div key={l.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: T.ink }}>{l.name}</span>
                <Tag color="sky">{l.level}</Tag>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Continue */}
      <Card style={{ background: T.greenSoft, border: "none", display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={T.green} strokeWidth="2" strokeLinecap="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
        </svg>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 14.5, fontWeight: 700, color: T.greenInk }}>ดูดีแล้ว ทุกข้อมูลถูกต้องไหม?</div>
          <div style={{ fontSize: 13, color: T.greenInk, opacity: 0.8 }}>ยืนยันเพื่อไปขั้นตอนวิเคราะห์ช่องว่าง</div>
        </div>
        <Btn kind="primaryDeep" icon="arrow-right" onClick={onNext}>ยืนยันและไปต่อ</Btn>
      </Card>
    </div>
  );
}

// ── Step 3: Gap Analysis ──────────────────────────────────────────
function CoachGap({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const readiness = 68;
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px 80px" }}>
      <BackButton onClick={onBack} />
      <div style={{ fontSize: 12, fontWeight: 700, color: T.green, letterSpacing: "0.1em", marginBottom: 8 }}>
        Portfolio Coach · ขั้นตอนที่ 3 จาก 4
      </div>
      <h1 style={{ fontSize: "clamp(24px,4vw,38px)", fontWeight: 800, color: T.ink, margin: "0 0 28px", letterSpacing: "-0.02em" }}>
        ภาพรวมความพร้อม
      </h1>

      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "320px 1fr", marginBottom: 24 }}>
        <Card style={{ textAlign: "center", background: `linear-gradient(180deg, ${T.greenSoft} 0%, #fff 100%)`, border: "none" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: T.greenInk, letterSpacing: "0.1em", marginBottom: 14 }}>
            READINESS SCORE
          </div>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
            <Ring value={readiness} size={200} />
          </div>
          <div style={{ fontSize: 13.5, color: T.greenInk, lineHeight: 1.5 }}>
            ดี! แต่ยังเสริมได้อีก 4 จุด ก่อนยื่น TCAS รอบ 1
          </div>
        </Card>
        <Card>
          <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>จุดแข็งที่ควรเน้นในพอร์ต</div>
          <div style={{ fontSize: 13, color: T.ink3, marginBottom: 16 }}>เอาให้กรรมการเห็นชัด ๆ — เริ่มเล่าจากตรงนี้</div>
          <div style={{ display: "grid", gap: 10 }}>
            {STRENGTHS.map((s, i) => (
              <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: 14, borderRadius: 14, background: T.greenSoft }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: "#fff", color: T.green, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <div>
                  <div style={{ fontSize: 14.5, fontWeight: 700, color: T.greenInk, marginBottom: 2 }}>{s.title}</div>
                  <div style={{ fontSize: 13, color: T.greenInk, opacity: 0.85 }}>{s.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div style={{ fontSize: 18, fontWeight: 700, color: T.ink, marginBottom: 4 }}>ช่องว่างที่ต้องเสริม</div>
      <div style={{ fontSize: 13, color: T.ink3, marginBottom: 16 }}>เรียงตามความสำคัญ — เริ่มจากบนสุด</div>
      <div style={{ display: "grid", gap: 12, marginBottom: 24 }}>
        {GAPS.map((g) => {
          const sevColor = { high: T.bad, med: T.warn, low: T.ink3 };
          const sevLabel = { high: "ต้องเสริม", med: "ควรเสริม", low: "แต่งเล็ก ๆ" };
          const sevBg = { high: "#FCE9E8", med: T.amberSoft, low: T.bgTint };
          return (
            <Card key={g.id}>
              <div style={{ display: "flex", gap: 14, alignItems: "flex-start", flexWrap: "wrap" }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: sevBg[g.severity], color: sevColor[g.severity], display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 14, fontWeight: 800 }}>
                  {g.id}
                </div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }}>
                    <Tag color={g.severity === "high" ? "rose" : g.severity === "med" ? "amber" : "gray"}>{sevLabel[g.severity]}</Tag>
                    <span style={{ fontSize: 12, color: T.ink3 }}>เวลา {g.time}</span>
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: T.ink, marginBottom: 4 }}>{g.title}</div>
                  <div style={{ fontSize: 13.5, color: T.ink2, lineHeight: 1.55, marginBottom: 10 }}>
                    <span style={{ color: T.ink3, fontWeight: 600 }}>ทำไม:</span> {g.why}
                  </div>
                  <div style={{ fontSize: 12, color: T.ink3, fontWeight: 700, marginBottom: 6, letterSpacing: "0.06em" }}>วิธีทำ</div>
                  <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 6 }}>
                    {g.how.map((h, i) => (
                      <li key={i} style={{ display: "flex", gap: 8, fontSize: 13.5, color: T.ink2 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.green} strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 3 }}><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Btn kind="primary" icon="arrow-right" onClick={onNext}>สร้าง Roadmap จากช่องว่างเหล่านี้</Btn>
    </div>
  );
}

// ── Step 4: Roadmap ───────────────────────────────────────────────
function CoachRoadmap({ onBack }: { onBack: () => void }) {
  const [done, setDone] = useState(new Set([1]));
  const allItems = ROADMAP_WEEKS.flatMap((w) => w.items);
  const pct = Math.round((done.size / allItems.length) * 100);

  const toggle = (id: number) =>
    setDone((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const tagColor: Record<string, string> = {
    "Quick win": "green", Content: "sky", Activity: "amber", Volunteer: "rose", Polish: "violet", Review: "gray",
  };

  return (
    <div style={{ maxWidth: 920, margin: "0 auto", padding: "40px 24px 80px" }}>
      <BackButton onClick={onBack} />
      <div style={{ fontSize: 12, fontWeight: 700, color: T.green, letterSpacing: "0.1em", marginBottom: 8 }}>
        Portfolio Coach · ขั้นตอนที่ 4 จาก 4
      </div>
      <h1 style={{ fontSize: "clamp(24px,4vw,38px)", fontWeight: 800, color: T.ink, margin: "0 0 16px", letterSpacing: "-0.02em" }}>
        แผน 12 สัปดาห์ของคุณ
      </h1>

      {/* Progress */}
      <Card style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={T.green} strokeWidth="2" strokeLinecap="round">
          <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 14.5, fontWeight: 700, marginBottom: 6 }}>
            ทำไปแล้ว {done.size}/{allItems.length} รายการ ·{" "}
            <span style={{ color: T.green }}>{pct}%</span>
          </div>
          <Bar value={pct} />
        </div>
        <Btn kind="ghost" icon="download">PDF</Btn>
      </Card>

      {/* Timeline */}
      <div style={{ position: "relative", paddingLeft: 28 }}>
        <div style={{ position: "absolute", top: 6, bottom: 6, left: 9, width: 2, background: `linear-gradient(180deg, ${T.green}, ${T.greenSoft})` }} />
        {ROADMAP_WEEKS.map((week, wi) => (
          <div key={wi} style={{ marginBottom: 24 }}>
            <div style={{ position: "absolute", left: 0, marginTop: 6 }}>
              <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#fff", border: `3px solid ${T.green}`, boxShadow: "0 1px 4px rgba(0,166,81,.2)" }} />
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: 16, fontWeight: 800, color: T.ink }}>{week.week}</span>
              <span style={{ fontSize: 12, color: T.ink3 }}>{week.month}</span>
            </div>
            <div style={{ display: "grid", gap: 8 }}>
              {week.items.map((it) => {
                const checked = done.has(it.id);
                return (
                  <div
                    key={it.id}
                    onClick={() => toggle(it.id)}
                    style={{
                      display: "flex", gap: 12, padding: 14, borderRadius: 14, cursor: "pointer",
                      background: checked ? T.greenSoft : "#fff",
                      border: `1px solid ${checked ? T.greenSoft : T.lineSoft}`,
                      alignItems: "center", transition: "all 200ms ease-out",
                    }}
                  >
                    <div style={{
                      width: 24, height: 24, borderRadius: 8, flexShrink: 0,
                      border: `2px solid ${checked ? T.green : T.line}`,
                      background: checked ? T.green : "#fff",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all 180ms",
                    }}>
                      {checked && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14.5, fontWeight: 600, color: checked ? T.ink3 : T.ink, textDecoration: checked ? "line-through" : "none" }}>
                        {it.t}
                      </div>
                      <div style={{ display: "flex", gap: 8, marginTop: 4, alignItems: "center" }}>
                        <Tag color={tagColor[it.tag] ?? "gray"}>{it.tag}</Tag>
                        <span style={{ fontSize: 12, color: T.ink3 }}>{it.time}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Ask KUru */}
      <Card style={{ background: T.greenSoft, border: "none", marginTop: 12, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={T.green} strokeWidth="1.8" strokeLinecap="round">
          <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />
        </svg>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 14.5, fontWeight: 700, color: T.greenInk }}>ติดขัดตรงไหน ถาม KUru ได้</div>
          <div style={{ fontSize: 12.5, color: T.greenInk, opacity: 0.8 }}>เช่น &quot;เขียนบทความ Medium ยังไงให้น่าสนใจ?&quot;</div>
        </div>
        <Link href="/chat" style={{ display: "inline-flex", alignItems: "center", gap: 8, height: 42, padding: "0 18px", borderRadius: 999, background: T.greenDeep, color: "#fff", fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          ถาม KUru
        </Link>
      </Card>
    </div>
  );
}

// ── Step progress bar ─────────────────────────────────────────────
function StepBar({ step }: { step: number }) {
  const steps = ["อัปโหลดพอร์ต", "ตรวจสอบข้อมูล", "วิเคราะห์ช่องว่าง", "Roadmap 12 สัปดาห์"];
  return (
    <div style={{ borderBottom: `1px solid ${T.lineSoft}`, padding: "12px 24px", display: "flex", alignItems: "center", gap: 0, overflowX: "auto" }}>
      {steps.map((s, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            opacity: i > step ? 0.35 : 1,
          }}>
            <div style={{
              width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
              background: i < step ? T.green : i === step ? T.ink : T.lineSoft,
              color: i <= step ? "#fff" : T.ink3,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 800,
            }}>
              {i < step ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              ) : i + 1}
            </div>
            <span style={{ fontSize: 12, fontWeight: i === step ? 700 : 500, color: i === step ? T.ink : T.ink3, whiteSpace: "nowrap" }}>{s}</span>
          </div>
          {i < steps.length - 1 && (
            <div style={{ width: 24, height: 1, background: i < step ? T.green : T.lineSoft, margin: "0 6px", flexShrink: 0 }} />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────
export default function PortfolioPage() {
  const [step, setStep] = useState(0);

  return (
    <div>
      <StepBar step={step} />
      {step === 0 && <CoachUpload onNext={() => setStep(1)} />}
      {step === 1 && <CoachReview onNext={() => setStep(2)} onBack={() => setStep(0)} />}
      {step === 2 && <CoachGap onNext={() => setStep(3)} onBack={() => setStep(1)} />}
      {step === 3 && <CoachRoadmap onBack={() => setStep(2)} />}
    </div>
  );
}
