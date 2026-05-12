"use client";

import type React from "react";

// Mock chat preview panel — matches KUru.zip HeroChatVisual design
export default function HeroCollage() {
  const GRN = "#00A651";
  const GRN_DEEP = "#006D35";
  const GRN_SOFT = "#E6F5EC";
  const GRN_INK = "#006D35";
  const INK = "#0A1F14";
  const INK_3 = "#6B7770";
  const LINE_SOFT = "#F0F2EB";
  const BG_TINT = "#F7F8F3";

  const programs = [
    { name: "วิศวกรรมเกษตรอัจฉริยะ", match: 94 },
    { name: "วิทยาศาสตร์ข้อมูลเกษตร", match: 89 },
    { name: "เกษตรกลวิธาน", match: 82 },
  ];

  return (
    <div className="relative hidden h-[540px] sm:block" aria-hidden="true">
      {/* Decorative gradient background card */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(160deg, ${GRN_SOFT} 0%, #FFF1E699 60%, #EAF3FB 100%)`,
          borderRadius: 32,
          transform: "rotate(-2deg) scale(0.96)",
          filter: "blur(0.5px)",
          opacity: 0.85,
        }}
      />

      {/* Main chat panel */}
      <div
        style={{
          position: "relative",
          background: "#fff",
          borderRadius: 28,
          boxShadow: "0 24px 60px -20px rgba(15,27,20,.22), 0 4px 12px rgba(15,27,20,.05)",
          border: `1px solid ${LINE_SOFT}`,
          padding: 22,
          margin: "20px 12px",
        }}
      >
        {/* Chat header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            paddingBottom: 14,
            borderBottom: `1px solid ${LINE_SOFT}`,
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              background: `linear-gradient(135deg, ${GRN}, ${GRN_DEEP})`,
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              flexShrink: 0,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />
            </svg>
            <span
              style={{
                position: "absolute",
                bottom: -2,
                right: -2,
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: "#3DCC74",
                border: "2px solid #fff",
              }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: INK }}>KUru</div>
            <div style={{ fontSize: 11, color: GRN, fontWeight: 600 }}>● ออนไลน์ · อ่าน มคอ.2 มาแล้ว</div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {["#FFB088", "#E8A93B", GRN].map((c, i) => (
              <span key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: c }} />
            ))}
          </div>
        </div>

        {/* Messages */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "16px 0 8px" }}>
          {/* User message */}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <div
              style={{
                maxWidth: "78%",
                padding: "10px 14px",
                borderRadius: "18px 18px 6px 18px",
                background: GRN,
                color: "#fff",
                fontSize: 13.5,
                lineHeight: 1.5,
              }}
            >
              อยากเรียนเทคโนโลยีและเกษตรไปด้วยกัน มีคณะอะไรบ้าง?
            </div>
          </div>

          {/* AI reply */}
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div
              style={{
                maxWidth: "88%",
                padding: "12px 14px",
                borderRadius: "18px 18px 18px 6px",
                background: BG_TINT,
                color: INK,
                fontSize: 13.5,
                lineHeight: 1.55,
                border: `1px solid ${LINE_SOFT}`,
              }}
            >
              <div style={{ marginBottom: 8 }}>มี 3 คณะที่ตรงเลยครับ ✨</div>
              {programs.map((p) => (
                <div
                  key={p.name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "7px 10px",
                    background: "#fff",
                    borderRadius: 10,
                    marginTop: 6,
                    border: `1px solid ${LINE_SOFT}`,
                  }}
                >
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: INK }}>{p.name}</span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: GRN_INK,
                      background: GRN_SOFT,
                      padding: "3px 8px",
                      borderRadius: 999,
                    }}
                  >
                    {p.match}%
                  </span>
                </div>
              ))}
              <div
                style={{
                  marginTop: 10,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 11,
                  color: INK_3,
                }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14,2 14,8 20,8" />
                </svg>{" "}
                มคอ.2 · TCAS68 · KU Catalog
              </div>
            </div>
          </div>

          {/* Typing indicator */}
          <div style={{ display: "flex", justifyContent: "flex-start", paddingLeft: 4 }}>
            <div
              style={{
                padding: "10px 16px",
                borderRadius: "18px 18px 18px 6px",
                background: "#fff",
                border: `1px solid ${LINE_SOFT}`,
                boxShadow: "0 1px 3px rgba(15,27,20,.06)",
                display: "flex",
                gap: 4,
                alignItems: "center",
              }}
            >
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: INK_3,
                    opacity: 0.5,
                    animation: `kuru-typing-dot 1.2s ease-in-out ${i * 0.2}s infinite`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating badges */}
      <FloatingBadge
        icon="star"
        text="RIASEC คุณตรง 4 คณะ"
        iconBg="#FFF6E2"
        iconColor="#E8A93B"
        posStyle={{ position: "absolute", top: 0, left: -10, zIndex: 2 }}
        delay={0}
      />
      <FloatingBadge
        icon="check"
        text="TCAS รอบ 1 เปิดแล้ว"
        iconBg={GRN_SOFT}
        iconColor={GRN}
        posStyle={{ position: "absolute", bottom: 40, right: -8, zIndex: 2 }}
        delay={0.6}
      />
      <FloatingBadge
        icon="compass"
        text="92% match"
        iconBg="#EAF3FB"
        iconColor="#2A5C86"
        posStyle={{ position: "absolute", top: "38%", right: -20, zIndex: 2 }}
        delay={1.2}
      />

      <style>{`
        @keyframes kuru-typing-dot {
          0%, 60%, 100% { transform: translateY(0); opacity: .5; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
        @keyframes kuru-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}

const ICONS: Record<string, React.ReactNode> = {
  star: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
    </svg>
  ),
  check: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  compass: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88" />
    </svg>
  ),
};

function FloatingBadge({
  icon,
  text,
  iconBg,
  iconColor,
  posStyle,
  delay,
}: {
  icon: keyof typeof ICONS;
  text: string;
  iconBg: string;
  iconColor: string;
  posStyle?: React.CSSProperties;
  delay: number;
}) {
  return (
    <div
      style={{
        ...posStyle,
        background: "#fff",
        borderRadius: 14,
        padding: "8px 12px",
        boxShadow: "0 8px 24px -6px rgba(15,27,20,.18), 0 2px 4px rgba(15,27,20,.04)",
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        fontSize: 12.5,
        fontWeight: 700,
        color: "#0A1F14",
        animation: `kuru-float 4s ease-in-out ${delay}s infinite`,
      }}
    >
      <div
        style={{
          width: 26,
          height: 26,
          borderRadius: 8,
          background: iconBg,
          color: iconColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {ICONS[icon]}
      </div>
      {text}
    </div>
  );
}
