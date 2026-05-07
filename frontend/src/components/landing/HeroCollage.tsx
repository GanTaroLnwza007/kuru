"use client";

import { useRef } from "react";

export default function HeroCollage() {
  const collageRef = useRef<HTMLDivElement>(null);
  const discRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = collageRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    if (discRef.current) discRef.current.style.transform = `rotate(${x * 4}deg)`;
    collageRef.current?.querySelectorAll<HTMLElement>("[data-depth]").forEach((card) => {
      const d = parseFloat(card.dataset.depth ?? "1");
      const base = card.dataset.baseRotate ?? "0";
      card.style.transform = `translate3d(${x * d * 14}px,${y * d * 10}px,0) rotate(${base}deg)`;
    });
  };

  const handleMouseLeave = () => {
    if (discRef.current) discRef.current.style.transform = "";
    collageRef.current?.querySelectorAll<HTMLElement>("[data-depth]").forEach((card) => {
      card.style.transform = `rotate(${card.dataset.baseRotate ?? "0"}deg)`;
    });
  };

  return (
    <div
      ref={collageRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative hidden h-[560px] sm:block"
      style={{ perspective: 1400 }}
      aria-hidden="true"
    >
      {/* Rotating disc */}
      <div
        ref={discRef}
        style={{
          position: "absolute", top: 30, right: 0,
          width: 440, height: 440, borderRadius: "50%",
          background: "conic-gradient(from 220deg, var(--d-green) 0%, var(--d-green-deep) 25%, var(--ink) 50%, var(--d-green) 100%)",
          transition: "transform 600ms cubic-bezier(.2,.7,.2,1)",
        }}
      >
        {/* Inner paper circle */}
        <div style={{ position: "absolute", inset: 8, borderRadius: "50%", background: "rgba(250,250,246,.92)", backdropFilter: "blur(20px)" }} />
      </div>

      {/* Dashed rings */}
      <svg
        style={{ position: "absolute", top: 70, right: 40, opacity: 0.4 }}
        width="360" height="360" viewBox="0 0 380 380"
      >
        {[60, 100, 140, 180].map((r) => (
          <circle key={r} cx="190" cy="190" r={r} fill="none" stroke="var(--ink)" strokeWidth=".5" strokeDasharray="2 6"/>
        ))}
      </svg>

      {/* Chat card */}
      <div
        className="float-card"
        data-depth="1.2"
        data-base-rotate="-3"
        style={{ position: "absolute", top: 90, right: 30, transform: "rotate(-3deg)", transition: "transform 500ms cubic-bezier(.2,.7,.2,1)" }}
      >
        <div style={{
          width: 340, padding: 18,
          background: "rgba(255,255,255,.86)",
          backdropFilter: "blur(24px) saturate(180%)",
          borderRadius: 24, border: "1px solid rgba(255,255,255,.7)",
          boxShadow: "0 30px 80px -20px rgba(10,31,20,.32), 0 8px 16px rgba(10,31,20,.06)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, paddingBottom: 12, borderBottom: "1px solid var(--line-soft)" }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg, var(--d-green), var(--d-green-deep))", color: "#fff", display: "grid", placeItems: "center" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 800 }}>KUru AI</div>
              <div style={{ fontSize: 10.5, color: "var(--d-green)", fontWeight: 700 }}>● กำลังคิด...</div>
            </div>
          </div>
          <div style={{ paddingTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ alignSelf: "flex-end", maxWidth: "78%", padding: "8px 12px", borderRadius: "14px 14px 4px 14px", background: "var(--ink)", color: "#fff", fontSize: 12.5, lineHeight: 1.45 }}>
              อยากทำงานกับธรรมชาติ + เทคโนโลยี
            </div>
            <div style={{ maxWidth: "92%", padding: 12, borderRadius: "14px 14px 14px 4px", background: "rgba(230,245,236,.7)", border: "1px solid var(--line-soft)", fontSize: 12, lineHeight: 1.5 }}>
              <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 12 }}>เจอ 3 หลักสูตรที่ตรงเลย ✨</div>
              {[["วิศวกรรมเกษตรอัจฉริยะ", "94%"], ["วิทยาศาสตร์ข้อมูลเกษตร", "89%"], ["เกษตรกลวิธาน", "82%"]].map(([name, pct]) => (
                <div key={name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 9px", background: "#fff", borderRadius: 9, marginTop: 4, border: "1px solid var(--line-soft)" }}>
                  <span style={{ fontSize: 11.5, fontWeight: 600 }}>{name}</span>
                  <span style={{ fontSize: 10.5, fontWeight: 800, color: "var(--d-green-deep)", background: "var(--d-green-soft)", padding: "2px 7px", borderRadius: 999 }}>{pct}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Match pill */}
      <div
        className="float-anim"
        data-depth="1.8"
        data-base-rotate="4"
        style={{ position: "absolute", top: 20, left: 0, transform: "rotate(4deg)", transition: "transform 500ms cubic-bezier(.2,.7,.2,1)", animationDelay: "0s" }}
      >
        <div style={{ background: "#fff", borderRadius: 18, padding: "10px 14px", boxShadow: "0 12px 32px -8px rgba(10,31,20,.22), 0 2px 4px rgba(10,31,20,.04)", border: "1px solid rgba(15,27,20,.06)", display: "inline-flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 12, background: "conic-gradient(var(--d-green) 0deg, var(--d-green) 338deg, var(--d-green-soft) 338deg)", display: "grid", placeItems: "center", position: "relative" }}>
            <div style={{ position: "absolute", inset: 4, borderRadius: "50%", background: "#fff", display: "grid", placeItems: "center", fontSize: 10, fontWeight: 800, color: "var(--d-green-deep)" }}>94</div>
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 800, color: "var(--ink)" }}>Match สูง</div>
            <div style={{ fontSize: 10.5, color: "var(--ink-3)" }}>วิศวกรรมเกษตรอัจฉริยะ</div>
          </div>
        </div>
      </div>

      {/* Roadmap card */}
      <div
        className="float-anim"
        data-depth="2.2"
        data-base-rotate="-5"
        style={{ position: "absolute", bottom: 80, left: 10, transform: "rotate(-5deg)", transition: "transform 500ms cubic-bezier(.2,.7,.2,1)", animationDelay: ".8s" }}
      >
        <div style={{ background: "var(--ink)", color: "#fff", borderRadius: 18, padding: 14, minWidth: 220, boxShadow: "0 16px 40px -10px rgba(10,31,20,.5)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, fontFamily: "var(--font-display)", fontSize: 11, fontWeight: 800, letterSpacing: ".08em", color: "var(--d-green-pop)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>
            12-WEEK ROADMAP
          </div>
          {[
            { done: true, text: "อัปโหลด TGAT-1 + TPAT-3" },
            { done: true, text: "เขียน Medium #1" },
            { done: false, text: "อาสาสอน Coding 8 wk" },
          ].map(({ done, text }) => (
            <div key={text} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 11.5, padding: "4px 0" }}>
              <span style={{ width: 14, height: 14, borderRadius: 4, flexShrink: 0, display: "grid", placeItems: "center", background: done ? "var(--d-green-pop)" : "transparent", border: done ? "none" : "1.5px solid rgba(255,255,255,.3)" }}>
                {done && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#0A1F14" strokeWidth="3" strokeLinecap="round"><path d="m5 12 5 5L20 7"/></svg>}
              </span>
              <span style={done ? { opacity: .6, textDecoration: "line-through" } : {}}>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Radar card */}
      <div
        className="float-anim"
        data-depth="1.4"
        data-base-rotate="3"
        style={{ position: "absolute", bottom: 20, right: 0, transform: "rotate(3deg)", transition: "transform 500ms cubic-bezier(.2,.7,.2,1)", animationDelay: "1.4s" }}
      >
        <div style={{ background: "#fff", borderRadius: 18, padding: 12, boxShadow: "0 16px 40px -8px rgba(10,31,20,.22)", border: "1px solid rgba(15,27,20,.06)", display: "flex", alignItems: "center", gap: 10 }}>
          <svg width="100" height="100" viewBox="0 0 120 120">
            <polygon points="60,20 95,40 95,80 60,100 25,80 25,40" fill="none" stroke="#E8EBE7" strokeWidth=".6"/>
            <polygon points="60,33 86,46 86,74 60,87 34,74 34,46" fill="none" stroke="#E8EBE7" strokeWidth=".6"/>
            <polygon points="60,46 78,52 78,68 60,74 42,68 42,52" fill="none" stroke="#E8EBE7" strokeWidth=".6"/>
            <polygon points="60,32.7 100.5,47.5 85.5,79.6 60,89.2 39.6,76.8 19.5,40.3" fill="rgba(0,166,81,.18)" stroke="var(--d-green)" strokeWidth="1.5"/>
          </svg>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 11, fontWeight: 800, letterSpacing: ".08em", color: "var(--ink-3)" }}>YOUR RIASEC</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 800, color: "var(--ink)", marginTop: 2 }}>Investigative</div>
            <div style={{ fontSize: 10.5, color: "var(--ink-3)" }}>+ Conventional</div>
          </div>
        </div>
      </div>
    </div>
  );
}
