"use client";

import { useState } from "react";
import Link from "next/link";

// ── Exact design tokens from kuru-system.css ────────────────────
const C = {
  ink: "#0A1F14",
  ink2: "#2E3D34",
  ink3: "#6B7770",
  ink4: "#9CA59F",
  paper: "#FAFAF6",
  line: "#E8EAE2",
  lineSoft: "#F0F2EB",
  green: "#00A651",
  greenDeep: "#006D35",
  greenSoft: "#E6F5EC",
  greenPop: "#3DDC84",
  peachSoft: "#FFF1E6",
  rust: "#B85B2E",
  sky: "#2A5C86",
  skySoft: "#EAF3FB",
  amber: "#E8A93B",
  amberSoft: "#FFF6E2",
  violet: "#7A5FBF",
  violetSoft: "#F1ECFB",
  roseSoft: "#FCEBEE",
};

// ── Mock data ────────────────────────────────────────────────────
const PORTFOLIO = {
  fileName: "Portfolio_Aim_M6.pdf",
  size: "12.4 MB",
  pages: "14 หน้า",
  profile: { name: "ไพฑูรย์ กมลวรรณ", school: "สาธิตมหาวิทยาลัยเกษตรศาสตร์", grade: "ม.6/2", track: "วิทย์–คณิต", contact: "paitoon.k@gmail.com · 089-xxx-xxxx" },
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
  languages: [{ name: "ภาษาไทย", level: "เจ้าของภาษา" }, { name: "ภาษาอังกฤษ", level: "B2 (IELTS 6.5)" }],
};

const STRENGTHS = [
  { title: "ผลงานวิทยาศาสตร์ระดับนานาชาติ", detail: "ISEF เป็นที่รู้จักในกลุ่มกรรมการวิศวฯ สคส." },
  { title: "AI + เกษตร = ตรงกับ SKE มาก", detail: "โปรเจกต์คุณตรงกับ PLO ข้อ 2, 4, 5 ของ SKE" },
  { title: "ภาวะผู้นำชัดเจน", detail: "หัวหน้าชมรมต่อเนื่อง 2 ปี — กรรมการรอบ 1 ให้น้ำหนักเรื่องนี้" },
];

const GAPS = [
  { id: "G1", sev: "high", title: "ขาดบทความหรือบล็อกเชิงลึกเกี่ยวกับ AI", why: "คณะต้องการเห็นความสามารถสื่อสารความรู้เชิงเทคนิค", how: ["เขียน Medium 2–3 บทความอธิบาย AI Plant Detector", "อธิบาย methodology + ผลลัพธ์เป็นภาษาง่าย"], time: "3 สัปดาห์" },
  { id: "G2", sev: "med", title: "ยังไม่มีกิจกรรมบริการสังคมที่ต่อเนื่อง", why: "รอบ 1 วัดความมุ่งมั่นระยะยาว ไม่ใช่แค่ครั้งเดียว", how: ["ลงทะเบียนสอน Coding ศูนย์เด็กอีกรอบ (ต.ค.–ธ.ค.)", "บันทึก impact: จำนวนเด็ก, ผลการเรียน"], time: "8 สัปดาห์" },
  { id: "G3", sev: "low", title: "รูปภาพในพอร์ตไม่สม่ำเสมอ", why: "Visual consistency ส่งผลต่อความน่าเชื่อถือของพอร์ต", how: ["ถ่ายภาพโปรเจกต์ใหม่บนพื้นหลังสีขาว", "ใช้ฟอนต์และโทนสีเดียวกันทั้งเล่ม"], time: "2 วัน" },
];

const ROADMAP = [
  { week: "สัปดาห์ที่ 1–2", month: "พ.ค. 2569", items: [{ id: 1, t: "อัปโหลดผลคะแนน TGAT-1 และ TPAT-3", tag: "Quick win", time: "15 นาที" }, { id: 2, t: "ถ่ายภาพประกอบโครงงานใหม่ — สีโทนเดียวกัน", tag: "Polish", time: "2 ชั่วโมง" }] },
  { week: "สัปดาห์ที่ 3–6", month: "พ.ค.–มิ.ย. 2569", items: [{ id: 3, t: "เขียนบทความ Medium #1 — เรื่องเทคโนโลยี+ชุมชน", tag: "Content", time: "1 สัปดาห์" }, { id: 4, t: "ลงทะเบียนเป็นพี่เลี้ยงค่ายโครงงานวิทย์ ธ.ค.", tag: "Activity", time: "30 นาที" }, { id: 5, t: "เขียนบทความ Medium #2", tag: "Content", time: "1 สัปดาห์" }] },
  { week: "สัปดาห์ที่ 7–10", month: "มิ.ย.–ก.ค. 2569", items: [{ id: 6, t: "อาสาสอน Coding ที่ศูนย์เด็ก (8 สัปดาห์)", tag: "Volunteer", time: "ต่อเนื่อง" }, { id: 7, t: "เขียนบทความ Medium #3", tag: "Content", time: "1 สัปดาห์" }] },
  { week: "สัปดาห์ที่ 11–12", month: "ก.ค. 2569", items: [{ id: 8, t: "ปรับโครงสร้างพอร์ตใหม่ + Cover letter", tag: "Polish", time: "3 วัน" }, { id: 9, t: "ตรวจทาน + ขอ feedback จากครู", tag: "Review", time: "1 สัปดาห์" }] },
];

// ── Icons (SVG, stroke-based, 24px viewBox) ──────────────────────
function Icon({ name, size = 22, color = "currentColor", sw = 1.7 }: { name: string; size?: number; color?: string; sw?: number }) {
  const p = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: sw, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (name) {
    case "upload":      return <svg {...p}><path d="M12 15V3M7 8l5-5 5 5M5 20h14"/></svg>;
    case "file":        return <svg {...p}><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/></svg>;
    case "arrow-left":  return <svg {...p}><path d="M19 12H5M11 18l-6-6 6-6"/></svg>;
    case "arrow-right": return <svg {...p}><path d="M5 12h14M13 6l6 6-6 6"/></svg>;
    case "check":       return <svg {...p}><path d="m5 12 5 5L20 7"/></svg>;
    case "check-circ":  return <svg {...p}><circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/></svg>;
    case "star":        return <svg {...p}><path d="m12 3 2.7 5.7 6.3.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.2l1.1-6.2L3 9.6l6.3-.9z"/></svg>;
    case "briefcase":   return <svg {...p}><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/></svg>;
    case "flag":        return <svg {...p}><path d="M5 21V4M5 4h12l-2 4 2 4H5"/></svg>;
    case "shield":      return <svg {...p}><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/></svg>;
    case "globe":       return <svg {...p}><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>;
    case "sparkles":    return <svg {...p}><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/></svg>;
    case "chat":        return <svg {...p}><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.5A8 8 0 1 1 21 12z"/></svg>;
    case "download":    return <svg {...p}><path d="M12 4v12M7 11l5 5 5-5M5 20h14"/></svg>;
    case "calendar":    return <svg {...p}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>;
    default:            return <svg {...p}><circle cx="12" cy="12" r="3"/></svg>;
  }
}

// ── Tag pill ─────────────────────────────────────────────────────
const TAG_PALETTE: Record<string, [string, string]> = {
  Academic:   [C.skySoft, C.sky],
  Leadership: [C.amberSoft, "#8a6510"],
  Volunteer:  [C.greenSoft, C.greenDeep],
  Content:    [C.skySoft, C.sky],
  "Quick win":[C.greenSoft, C.greenDeep],
  Activity:   [C.amberSoft, "#8a6510"],
  Polish:     [C.violetSoft, C.violet],
  Review:     [C.paper, C.ink3],
};
function Tag({ label, size = "md" }: { label: string; size?: "sm" | "md" }) {
  const [bg, fg] = TAG_PALETTE[label] ?? [C.lineSoft, C.ink3];
  const h = size === "sm" ? 22 : 26;
  const px = size === "sm" ? 8 : 10;
  const fs = size === "sm" ? 11 : 12;
  return <span style={{ display: "inline-flex", alignItems: "center", height: h, padding: `0 ${px}px`, borderRadius: 999, background: bg, color: fg, fontSize: fs, fontWeight: 700 }}>{label}</span>;
}

// ── Back button ──────────────────────────────────────────────────
function BackBtn({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "none", border: "none", color: C.ink3, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", marginBottom: 20 }}>
      <Icon name="arrow-left" size={16} /> กลับ
    </button>
  );
}

// ── Animated ring ────────────────────────────────────────────────
function Ring({ value, size = 140, dark = false }: { value: number; size?: number; dark?: boolean }) {
  const sw = size * 0.073;
  const r = (size - sw) / 2;
  const c = 2 * Math.PI * r;
  const trackColor = dark ? "rgba(255,255,255,.12)" : C.greenSoft;
  const fillColor = dark ? C.greenPop : C.green;
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)", display: "block" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={trackColor} strokeWidth={sw} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={fillColor} strokeWidth={sw}
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c - (value / 100) * c} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontWeight: 800, fontSize: size * 0.26, lineHeight: 1, color: dark ? "#fff" : C.ink, fontVariantNumeric: "tabular-nums" }}>{value}</span>
        <span style={{ fontSize: size * 0.09, color: dark ? "rgba(255,255,255,.6)" : C.ink3, marginTop: 4, fontFamily: "Georgia, serif", fontStyle: "italic" }}>ความพร้อม</span>
      </div>
    </div>
  );
}

// ── Step indicator ───────────────────────────────────────────────
const STEP_LABELS = ["อัปโหลด", "ตรวจสอบ", "ช่องว่าง", "Roadmap"];
function StepBar({ step, onStep }: { step: number; onStep: (i: number) => void }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", marginBottom: 48 }}>
      {STEP_LABELS.map((label, i) => {
        const done = i < step;
        const active = i === step;
        const isLast = i === STEP_LABELS.length - 1;
        return (
          <div key={i} onClick={() => onStep(i)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, cursor: "pointer", position: "relative" }}>
            {/* Connector line — spans from center to right edge */}
            {!isLast && (
              <div style={{
                position: "absolute", top: 18, left: "50%", right: "-50%", height: 2,
                background: done ? C.green : C.line, zIndex: 0, transition: "background 240ms",
              }} />
            )}
            {/* Circle */}
            <div style={{
              width: 36, height: 36, borderRadius: "50%", display: "grid", placeItems: "center",
              fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 14,
              position: "relative", zIndex: 1, transition: "all 240ms",
              background: done ? C.green : active ? C.ink : "#fff",
              color: done || active ? "#fff" : C.ink3,
              border: done ? `2px solid ${C.green}` : active ? `2px solid ${C.ink}` : `2px solid ${C.line}`,
              boxShadow: active ? "0 4px 12px -4px rgba(10,31,20,.4)" : "none",
            }}>
              {done ? <Icon name="check" size={16} color="#fff" sw={2.5} /> : i + 1}
            </div>
            <span style={{
              fontSize: 11, fontWeight: 700, letterSpacing: ".06em",
              color: done || active ? C.ink : C.ink4, whiteSpace: "nowrap",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}>
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── Step 1 — Upload ──────────────────────────────────────────────
function Step1Upload({ onNext }: { onNext: () => void }) {
  const [hover, setHover] = useState(false);
  const [drag, setDrag] = useState(false);
  const active = hover || drag;

  const FEATURES = [
    { icon: "star", color: [C.amberSoft, "#8a6510"], title: "รางวัลและความสำเร็จ", sub: "ระดับ ความใหม่ ความเกี่ยวข้อง" },
    { icon: "briefcase", color: [C.greenSoft, C.green], title: "ผลงานและโปรเจกต์", sub: "ความซับซ้อน บทบาท ผลลัพธ์" },
    { icon: "flag", color: [C.skySoft, C.sky], title: "กิจกรรมและภาวะผู้นำ", sub: "ความต่อเนื่อง ผลกระทบ" },
    { icon: "shield", color: [C.violetSoft, C.violet], title: "ความสอดคล้องกับคณะ", sub: "PLO ของหลักสูตรที่คุณสนใจ" },
  ];

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: C.green, letterSpacing: ".18em", textTransform: "uppercase", marginBottom: 12 }}>
          ★ Portfolio Coach · ขั้นตอน 1 จาก 4
        </div>
        <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: "clamp(36px,5vw,60px)", lineHeight: .96, letterSpacing: "-.04em", color: C.ink }}>
          ส่งพอร์ตของคุณ<br />
          <em style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontStyle: "italic", fontWeight: 400, color: C.green }}>มาดูกัน</em>
        </h1>
        <p style={{ fontSize: 17, lineHeight: 1.6, color: C.ink2, marginTop: 14, maxWidth: 560 }}>
          KUru จะอ่านพอร์ตของคุณ แยกข้อมูล แล้วบอกว่าต้องเสริมอะไร<br />
          ก่อนยื่น <em style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontStyle: "italic", color: C.ink }}>TCAS รอบ 1</em>
        </p>
      </div>

      {/* Upload zone */}
      <div
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); onNext(); }}
        onClick={onNext}
        style={{
          border: `2px dashed ${active ? C.green : C.line}`,
          borderRadius: 28, padding: "60px 32px", textAlign: "center",
          cursor: "pointer", transition: "all 240ms",
          background: active ? C.greenSoft : "#fff",
          position: "relative", overflow: "hidden",
        }}
      >
        {/* Upload icon */}
        <div style={{
          width: 80, height: 80, borderRadius: 24, margin: "0 auto 20px",
          background: active ? C.green : C.greenSoft,
          color: active ? "#fff" : C.green,
          display: "grid", placeItems: "center",
          transition: "all 240ms",
          transform: active ? "translateY(-2px)" : "translateY(0)",
          boxShadow: active ? "0 12px 28px -8px rgba(0,166,81,.4)" : "none",
        }}>
          <Icon name="upload" size={36} sw={1.8} />
        </div>

        <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 22, fontWeight: 800, letterSpacing: "-.01em", color: C.ink, marginBottom: 8 }}>
          ลากไฟล์มาวางที่นี่ หรือกดเพื่อเลือก
        </div>
        <div style={{ fontSize: 15, color: C.ink3, marginBottom: 24 }}>รองรับ PDF · ไม่เกิน 25 MB</div>

        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            height: 60, padding: "0 28px", borderRadius: 999,
            background: C.ink, color: "#fff",
            fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 16, fontWeight: 700,
            border: "none", cursor: "pointer",
            boxShadow: "0 8px 24px -8px rgba(10,31,20,.5)",
          }}
        >
          <Icon name="file" size={18} color="#fff" />
          เลือกพอร์ตจากเครื่อง
        </button>

        <div style={{ marginTop: 20, fontSize: 14, color: C.ink3 }}>
          🔒 ไฟล์ของคุณจะอยู่บนเครื่องของคุณเท่านั้น — ไม่อัปโหลดที่ไหนเด็ดขาด
        </div>
      </div>

      {/* Feature rows */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 28 }}>
        {FEATURES.map((f) => (
          <div key={f.title} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: C.paper, borderRadius: 16, border: `1px solid ${C.lineSoft}` }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: f.color[0], color: f.color[1], display: "grid", placeItems: "center", flexShrink: 0 }}>
              <Icon name={f.icon} size={18} color={f.color[1]} sw={1.6} />
            </div>
            <div>
              <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13.5, fontWeight: 700, color: C.ink }}>{f.title}</div>
              <div style={{ fontSize: 11.5, color: C.ink3, marginTop: 1 }}>{f.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Step 2 — Review ──────────────────────────────────────────────
function Step2Review({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  return (
    <div>
      <BackBtn onClick={onBack} />
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: C.green, letterSpacing: ".18em", textTransform: "uppercase", marginBottom: 12 }}>
          ★ Portfolio Coach · ขั้นตอน 2 จาก 4
        </div>
        <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: "clamp(30px,4.5vw,52px)", lineHeight: .96, letterSpacing: "-.04em", color: C.ink }}>
          ข้อมูลที่ดึงออกมาได้<br />
          <em style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontStyle: "italic", fontWeight: 400, color: C.green }}>ตรวจสอบได้เลย</em>
        </h1>
        <p style={{ fontSize: 17, color: C.ink2, marginTop: 14, lineHeight: 1.6 }}>ดูแล้วแก้ไขได้เสมอ — ความถูกต้องของข้อมูลส่งผลต่อการวิเคราะห์</p>
      </div>

      {/* Review grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        {/* Profile — full width */}
        <div style={{ gridColumn: "span 2", background: "#fff", border: `1px solid ${C.lineSoft}`, borderRadius: 24, padding: 26 }}>
          <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 16, fontWeight: 800, color: C.ink, display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <Icon name="check-circ" size={20} color={C.green} /> ข้อมูลส่วนตัว
          </h3>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, background: `linear-gradient(135deg, ${C.green}, ${C.greenDeep})`, color: "#fff", display: "grid", placeItems: "center", fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 28, fontWeight: 600, flexShrink: 0 }}>ไ</div>
            <div>
              <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: "-.02em", color: C.ink }}>{PORTFOLIO.profile.name}</div>
              <div style={{ fontSize: 14, color: C.ink3, marginTop: 4 }}>{PORTFOLIO.profile.school} · {PORTFOLIO.profile.grade} · {PORTFOLIO.profile.track}</div>
              <div style={{ fontSize: 13, color: C.ink3, marginTop: 2 }}>{PORTFOLIO.profile.contact}</div>
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div style={{ background: "#fff", border: `1px solid ${C.lineSoft}`, borderRadius: 24, padding: 26 }}>
          <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 16, fontWeight: 800, color: C.ink, display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <Icon name="star" size={18} color={C.amber} /> รางวัลและความสำเร็จ
          </h3>
          {PORTFOLIO.achievements.map((a, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: C.paper, borderRadius: 14, marginBottom: i < PORTFOLIO.achievements.length - 1 ? 8 : 0 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: C.ink }}>{a.title}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                  <Tag label={a.tag} size="sm" />
                  <span style={{ fontSize: 11.5, color: C.ink3 }}>{a.year}</span>
                </div>
              </div>
              <div style={{ width: 60, flexShrink: 0 }}>
                <div style={{ height: 4, background: C.lineSoft, borderRadius: 999, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${a.strength * 100}%`, background: `linear-gradient(90deg, ${C.amber}, ${C.green})`, borderRadius: 999 }} />
                </div>
                <div style={{ fontSize: 10, color: C.ink3, marginTop: 3, textAlign: "right" }}>ความแข็งแรง</div>
              </div>
            </div>
          ))}
        </div>

        {/* Works */}
        <div style={{ background: "#fff", border: `1px solid ${C.lineSoft}`, borderRadius: 24, padding: 26 }}>
          <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 16, fontWeight: 800, color: C.ink, display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <Icon name="briefcase" size={18} color={C.green} /> ผลงานและโปรเจกต์
          </h3>
          {PORTFOLIO.works.map((w, i) => (
            <div key={i} style={{ display: "flex", gap: 12, padding: "12px 14px", background: C.paper, borderRadius: 14, alignItems: "center", marginBottom: i < PORTFOLIO.works.length - 1 ? 8 : 0 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: C.ink }}>{w.name}</div>
                <div style={{ fontSize: 12.5, color: C.ink3, marginTop: 2 }}>{w.desc}</div>
              </div>
              <Tag label={w.type === "Project" ? "Content" : w.type === "Competition" ? "Quick win" : "Content"} size="sm" />
            </div>
          ))}

          {/* Skills */}
          <div style={{ marginTop: 18, paddingTop: 16, borderTop: `1px solid ${C.lineSoft}` }}>
            <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14, fontWeight: 800, color: C.ink, display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <Icon name="shield" size={16} color={C.violet} /> ทักษะ
            </h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {PORTFOLIO.skills.map((s) => (
                <span key={s} style={{ height: 30, padding: "0 12px", borderRadius: 999, background: C.paper, border: `1px solid ${C.line}`, fontSize: 12, fontWeight: 700, color: C.ink2, display: "inline-flex", alignItems: "center" }}>{s}</span>
              ))}
            </div>
            <div style={{ marginTop: 14 }}>
              {PORTFOLIO.languages.map((l, i) => (
                <div key={l.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < PORTFOLIO.languages.length - 1 ? `1px dashed ${C.line}` : "none" }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>{l.name}</span>
                  <Tag label="Academic" size="sm" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Continue CTA */}
      <div style={{ marginTop: 24, background: `linear-gradient(135deg, ${C.peachSoft} 0%, ${C.greenSoft} 100%)`, borderRadius: 28, padding: "32px 36px", display: "grid", gridTemplateColumns: "1fr auto", gap: 24, alignItems: "center" }}>
        <div>
          <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: "-.02em", marginBottom: 6 }}>ดูดีแล้ว ทุกข้อมูล<em style={{ fontFamily: "Georgia, serif", fontStyle: "italic", color: C.greenDeep }}> ถูกต้อง</em>ไหม?</h3>
          <p style={{ fontSize: 14, color: C.ink2, lineHeight: 1.55 }}>ยืนยันเพื่อไปขั้นตอนวิเคราะห์ช่องว่าง</p>
        </div>
        <button onClick={onNext} style={{ display: "inline-flex", alignItems: "center", gap: 8, height: 52, padding: "0 22px", borderRadius: 999, background: C.greenDeep, color: "#fff", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 15, fontWeight: 700, border: "none", cursor: "pointer", whiteSpace: "nowrap" }}>
          ยืนยันและไปต่อ <Icon name="arrow-right" size={18} color="#fff" />
        </button>
      </div>
    </div>
  );
}

// ── Step 3 — Gap Analysis ────────────────────────────────────────
function Step3Gap({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const SEV: Record<string, { bg: string; color: string; label: string }> = {
    high: { bg: "#FCE9E8", color: "#C0392B", label: "ต้องเสริม" },
    med:  { bg: C.amberSoft, color: "#8a6510", label: "ควรเสริม" },
    low:  { bg: C.paper,     color: C.ink3,    label: "แต่งเล็ก ๆ" },
  };

  return (
    <div>
      <BackBtn onClick={onBack} />
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: C.green, letterSpacing: ".18em", textTransform: "uppercase", marginBottom: 12 }}>
          ★ Portfolio Coach · ขั้นตอน 3 จาก 4
        </div>
        <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: "clamp(30px,4.5vw,52px)", lineHeight: .96, letterSpacing: "-.04em", color: C.ink }}>
          ภาพรวม<em style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontStyle: "italic", fontWeight: 400, color: C.green }}>ความพร้อม</em>
        </h1>
      </div>

      {/* Readiness card (dark) */}
      <div style={{
        background: C.ink, color: "#fff", borderRadius: 28, padding: 36,
        display: "grid", gridTemplateColumns: "1fr auto", gap: 28, alignItems: "center",
        position: "relative", overflow: "hidden", marginBottom: 28,
      }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 90% 10%, rgba(0,166,81,.4), transparent 55%), radial-gradient(circle at 0% 100%, rgba(61,220,132,.15), transparent 60%)" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 26, letterSpacing: "-.02em", marginBottom: 8 }}>ดี! ยังเสริมได้อีก 3 จุด</div>
          <div style={{ fontSize: 15, color: "rgba(255,255,255,.75)", lineHeight: 1.55, maxWidth: 420 }}>พอร์ตของคุณมีฐานที่ดีมาก — เพิ่มอีกนิดเดียวก็พร้อมยื่น TCAS รอบ 1</div>
          {/* Strengths */}
          <div style={{ marginTop: 20, display: "grid", gap: 10 }}>
            {STRENGTHS.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 16px", background: "rgba(255,255,255,.06)", borderRadius: 16, border: "1px solid rgba(255,255,255,.08)" }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: C.green, display: "grid", placeItems: "center", flexShrink: 0 }}>
                  <Icon name="check" size={14} color="#fff" sw={2.5} />
                </div>
                <div>
                  <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 14, color: C.greenPop }}>{s.title}</div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,.65)", marginTop: 2 }}>{s.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ position: "relative", zIndex: 1 }}>
          <Ring value={68} size={140} dark />
        </div>
      </div>

      {/* Gaps */}
      <div style={{ fontSize: 12, fontWeight: 800, color: C.ink3, letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 16 }}>ช่องว่างที่ต้องเสริม</div>
      {GAPS.map((g) => {
        const s = SEV[g.sev];
        return (
          <div key={g.id} style={{ background: "#fff", border: `1px solid ${C.lineSoft}`, borderRadius: 22, padding: 22, marginBottom: 14, display: "flex", gap: 16, alignItems: "flex-start", transition: "all 240ms", cursor: "default" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = C.ink; (e.currentTarget as HTMLElement).style.transform = "translateX(4px)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = C.lineSoft; (e.currentTarget as HTMLElement).style.transform = "translateX(0)"; }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: s.bg, color: s.color, display: "grid", placeItems: "center", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 13, flexShrink: 0 }}>{g.id}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                <span style={{ height: 24, padding: "0 9px", borderRadius: 999, background: s.bg, color: s.color, fontSize: 11, fontWeight: 700, display: "inline-flex", alignItems: "center" }}>{s.label}</span>
                <span style={{ height: 24, padding: "0 8px", borderRadius: 999, background: C.paper, border: `1px solid ${C.line}`, fontSize: 11, fontWeight: 700, color: C.ink3, display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <Icon name="calendar" size={11} color={C.ink3} /> {g.time}
                </span>
              </div>
              <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 15, color: C.ink, marginBottom: 6 }}>{g.title}</div>
              <div style={{ fontSize: 13, color: C.ink3, lineHeight: 1.5, marginBottom: 10 }}>{g.why}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {g.how.map((h, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13.5, color: C.ink2 }}>
                    <Icon name="arrow-right" size={14} color={C.green} sw={2} />
                    {h}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}

      <button onClick={onNext} style={{ display: "inline-flex", alignItems: "center", gap: 10, height: 52, padding: "0 24px", borderRadius: 999, background: C.green, color: "#fff", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 16, fontWeight: 700, border: "none", cursor: "pointer", boxShadow: "0 8px 24px -8px rgba(0,166,81,.5)", marginTop: 8 }}>
        สร้าง Roadmap จากช่องว่างเหล่านี้ <Icon name="arrow-right" size={18} color="#fff" />
      </button>
    </div>
  );
}

// ── Step 4 — Roadmap ─────────────────────────────────────────────
function Step4Roadmap({ onBack }: { onBack: () => void }) {
  const [done, setDone] = useState(new Set([1]));
  const allItems = ROADMAP.flatMap((w) => w.items);
  const pct = Math.round((done.size / allItems.length) * 100);
  const toggle = (id: number) => setDone((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const TAG_COLOR: Record<string, [string, string]> = {
    "Quick win": [C.greenSoft, C.greenDeep],
    Content:    [C.skySoft, C.sky],
    Activity:   [C.amberSoft, "#8a6510"],
    Volunteer:  [C.roseSoft, "#8C2A3A"],
    Polish:     [C.violetSoft, C.violet],
    Review:     [C.paper, C.ink3],
  };

  return (
    <div>
      <BackBtn onClick={onBack} />
      {/* Roadmap dark header */}
      <div style={{
        background: C.ink, color: "#fff", borderRadius: 28, padding: 36, marginBottom: 32,
        display: "grid", gridTemplateColumns: "1fr auto", gap: 24, alignItems: "center",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 80% 20%, rgba(61,220,132,.25), transparent 55%)" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: C.greenPop, letterSpacing: ".18em", textTransform: "uppercase", marginBottom: 10 }}>
            ★ Portfolio Coach · ขั้นตอน 4 จาก 4
          </div>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: "clamp(28px,4vw,44px)", letterSpacing: "-.03em", marginBottom: 8, lineHeight: 1 }}>
            แผน 12 สัปดาห์<br /><em style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontWeight: 400, color: C.greenPop }}>ของคุณ</em>
          </h1>
          <div style={{ fontSize: 15, color: "rgba(255,255,255,.7)", marginBottom: 16 }}>
            ทำไปแล้ว {done.size}/{allItems.length} รายการ
          </div>
          <div style={{ height: 8, borderRadius: 999, background: "rgba(255,255,255,.1)", overflow: "hidden", maxWidth: 360 }}>
            <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg, ${C.green}, ${C.greenPop})`, borderRadius: 999, transition: "width 600ms cubic-bezier(.2,.7,.2,1)" }} />
          </div>
        </div>
        {/* Progress ring */}
        <div style={{ position: "relative", zIndex: 1, width: 120, height: 120, flexShrink: 0 }}>
          <svg width={120} height={120} style={{ transform: "rotate(-90deg)" }}>
            <circle cx={60} cy={60} r={50} fill="none" stroke="rgba(255,255,255,.12)" strokeWidth={10} />
            <circle cx={60} cy={60} r={50} fill="none" stroke={C.greenPop} strokeWidth={10}
              strokeLinecap="round" strokeDasharray={2 * Math.PI * 50}
              strokeDashoffset={2 * Math.PI * 50 - (pct / 100) * 2 * Math.PI * 50}
              style={{ transition: "stroke-dashoffset 600ms cubic-bezier(.2,.7,.2,1)" }} />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 30, color: "#fff", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{pct}%</span>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,.55)", fontWeight: 600, marginTop: 2 }}>{done.size}/{allItems.length}</span>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div style={{ position: "relative", paddingLeft: 36 }}>
        <div style={{ position: "absolute", left: 9, top: 6, bottom: 6, width: 2, background: `linear-gradient(180deg, ${C.green} 0%, ${C.lineSoft} 100%)` }} />
        {ROADMAP.map((week, wi) => (
          <div key={wi} style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 14, position: "relative" }}>
              <div style={{ position: "absolute", left: -27, top: 1, width: 20, height: 20, borderRadius: "50%", background: "#fff", border: `3px solid ${C.green}`, zIndex: 1 }} />
              <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 16, color: C.ink }}>{week.week}</span>
              <span style={{ fontSize: 12.5, color: C.ink3 }}>{week.month}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {week.items.map((it) => {
                const checked = done.has(it.id);
                const [tagBg, tagFg] = TAG_COLOR[it.tag] ?? [C.paper, C.ink3];
                return (
                  <div key={it.id} onClick={() => toggle(it.id)} style={{
                    display: "flex", alignItems: "center", gap: 12, padding: "14px 18px",
                    background: checked ? C.greenSoft : "#fff",
                    border: `1px solid ${checked ? C.greenSoft : C.lineSoft}`,
                    borderRadius: 16, cursor: "pointer", transition: "all 200ms",
                  }}
                    onMouseEnter={(e) => { if (!checked) (e.currentTarget as HTMLElement).style.borderColor = C.ink3; }}
                    onMouseLeave={(e) => { if (!checked) (e.currentTarget as HTMLElement).style.borderColor = C.lineSoft; }}>
                    <div style={{ width: 22, height: 22, borderRadius: 7, border: `2px solid ${checked ? C.green : C.line}`, background: checked ? C.green : "#fff", display: "grid", placeItems: "center", flexShrink: 0, transition: "all 180ms" }}>
                      {checked && <Icon name="check" size={13} color="#fff" sw={3} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14.5, fontWeight: 600, color: checked ? C.ink3 : C.ink, textDecoration: checked ? "line-through" : "none" }}>{it.t}</div>
                      <div style={{ display: "flex", gap: 8, marginTop: 4, alignItems: "center" }}>
                        <span style={{ height: 24, padding: "0 9px", borderRadius: 999, background: tagBg, color: tagFg, fontSize: 11, fontWeight: 700, display: "inline-flex", alignItems: "center" }}>{it.tag}</span>
                        <span style={{ fontSize: 11.5, color: C.ink3 }}>{it.time}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Ask KUru CTA */}
      <div style={{ background: `linear-gradient(135deg, ${C.peachSoft} 0%, ${C.greenSoft} 100%)`, borderRadius: 28, padding: 36, display: "grid", gridTemplateColumns: "1fr auto", gap: 24, alignItems: "center", marginTop: 12 }}>
        <div>
          <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: "-.02em", marginBottom: 6 }}>
            ติดขัดตรงไหน ถาม <em style={{ fontFamily: "Georgia, serif", fontStyle: "italic", color: C.greenDeep, fontWeight: 400 }}>KUru</em> ได้
          </h3>
          <p style={{ fontSize: 14, color: C.ink2, lineHeight: 1.55 }}>เช่น &quot;เขียนบทความ Medium ยังไงให้น่าสนใจ?&quot;</p>
        </div>
        <Link href="/chat" style={{ display: "inline-flex", alignItems: "center", gap: 10, height: 52, padding: "0 22px", borderRadius: 999, background: C.greenDeep, color: "#fff", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 15, fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap" }}>
          <Icon name="chat" size={18} color="#fff" /> ถาม KUru
        </Link>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────
export default function PortfolioPage() {
  const [step, setStep] = useState(0);

  return (
    <div data-testid="portfolio-shell" style={{ position: "relative", minHeight: "calc(100vh - 72px)", padding: "48px 0 80px", overflow: "hidden" }}>
      {/* bg-mesh: same radial gradients as the rest of the site */}
      <div aria-hidden="true" style={{
        position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none",
        background: `
          radial-gradient(ellipse 700px 500px at 88% 18%, rgba(0,166,81,.18) 0%, transparent 60%),
          radial-gradient(ellipse 500px 500px at 12% 80%, rgba(244,182,140,.18) 0%, transparent 60%)
        `,
      }} />
      {/* bg-lines */}
      <div aria-hidden="true" style={{
        position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
        background: "repeating-linear-gradient(135deg, transparent 0 80px, rgba(10,31,20,.022) 80px 81px)",
      }} />

      {/* coach-inner */}
      <div style={{ maxWidth: 880, margin: "0 auto", padding: "0 clamp(18px,3vw,32px)", position: "relative", zIndex: 2 }}>
        <StepBar step={step} onStep={(i) => i <= step && setStep(i)} />
        {step === 0 && <Step1Upload onNext={() => setStep(1)} />}
        {step === 1 && <Step2Review onNext={() => setStep(2)} onBack={() => setStep(0)} />}
        {step === 2 && <Step3Gap onNext={() => setStep(3)} onBack={() => setStep(1)} />}
        {step === 3 && <Step4Roadmap onBack={() => setStep(2)} />}
      </div>

      <style>{`
        @media (max-width: 560px) {
          .step-label-hide { display: none !important; }
        }
        @media (max-width: 640px) {
          .review-grid-resp { grid-template-columns: 1fr !important; }
          .cta-grid-resp { grid-template-columns: 1fr !important; }
          .readiness-grid-resp { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
