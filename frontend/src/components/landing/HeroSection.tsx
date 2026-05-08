import Link from "next/link";
import HeroComposer from "./HeroComposer";
import HeroCollage from "./HeroCollage";
import MarqueeBar from "./MarqueeBar";

export default function HeroSection() {
  return (
    <section
      style={{ position: "relative", padding: "56px 0 32px", overflow: "hidden", background: "var(--paper, #FAFAF6)" }}
    >
      {/* Background mesh */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none",
          background: `
            radial-gradient(ellipse 700px 500px at 88% 18%, rgba(0,166,81,.18) 0%, transparent 60%),
            radial-gradient(ellipse 500px 500px at 12% 80%, rgba(244,182,140,.18) 0%, transparent 60%),
            radial-gradient(ellipse 800px 400px at 50% 110%, rgba(123,183,232,.10) 0%, transparent 60%)
          `,
        }}
      />
      {/* Subtle diagonal lines */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
          background: "repeating-linear-gradient(135deg, transparent 0 80px, rgba(10,31,20,.022) 80px 81px)",
        }}
      />

      {/* Content */}
      <div
        style={{ position: "relative", zIndex: 2, maxWidth: 1320, margin: "0 auto", padding: "0 clamp(1rem, 2.4vw, 2rem)" }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.05fr) minmax(0, .95fr)",
            gap: 56,
            alignItems: "center",
            minHeight: "calc(100vh - 200px)",
            padding: "24px 0",
          }}
          className="hero-grid"
        >
          {/* LEFT */}
          <div>
            {/* Eyebrow badge */}
            <div
              className="reveal"
              style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                padding: "7px 14px 7px 8px", borderRadius: 999,
                background: "#fff", border: "1px solid var(--line-soft, #F0F2EB)",
                boxShadow: "0 1px 2px rgba(15,27,20,.04), 0 8px 20px -8px rgba(15,27,20,.08)",
                fontFamily: "var(--font-display, 'Plus Jakarta Sans', sans-serif)",
                fontSize: 12.5, fontWeight: 600, color: "var(--ink-2, #2E3D34)",
              }}
            >
              <span
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "4px 9px", borderRadius: 999,
                  background: "var(--d-green-soft, #E6F5EC)", color: "var(--d-green-deep, #006D35)",
                  fontSize: 10.5, fontWeight: 800, letterSpacing: ".08em",
                }}
              >
                <span
                  style={{
                    width: 6, height: 6, borderRadius: "50%",
                    background: "var(--d-green, #00A651)",
                    animation: "pulse-dot 1.6s ease-in-out infinite",
                    display: "inline-block",
                  }}
                />
                LIVE
              </span>
              TCAS68 · พร้อมใช้สำหรับ ม.6 ปีนี้
            </div>

            {/* H1 */}
            <h1
              className="reveal"
              style={{
                fontFamily: "var(--font-display, 'Plus Jakarta Sans', sans-serif)",
                fontWeight: 800,
                fontSize: "clamp(52px, 7.5vw, 96px)",
                lineHeight: 0.94,
                letterSpacing: "-0.04em",
                marginTop: 22,
                color: "var(--ink, #0A1F14)",
                textWrap: "balance",
                transitionDelay: "80ms",
              }}
            >
              เลือกคณะ
              <br />
              <em
                style={{
                  fontFamily: "var(--font-serif, 'Source Serif 4', Georgia, serif)",
                  fontStyle: "italic",
                  fontWeight: 400,
                  color: "var(--d-green, #00A651)",
                  display: "inline-block",
                }}
              >
                อย่างมั่นใจ
              </em>
              <br />
              ด้วย AI
            </h1>

            {/* Lead */}
            <p
              className="reveal"
              style={{
                fontSize: 19, lineHeight: 1.55, color: "var(--ink-2, #2E3D34)",
                marginTop: 26, maxWidth: 500, fontWeight: 400,
                transitionDelay: "160ms",
              }}
            >
              KUru คือเพื่อนคู่คิด AI ที่อ่าน{" "}
              <em
                style={{
                  fontFamily: "var(--font-serif, Georgia, serif)",
                  fontStyle: "italic",
                  color: "var(--ink, #0A1F14)",
                  fontWeight: 400,
                }}
              >
                มคอ.2 และ TCAS
              </em>{" "}
              มาแล้ว — ช่วยให้นักเรียน ม.ปลาย เลือกคณะที่ ม.เกษตรศาสตร์ ได้แบบไม่ต้องเดา
            </p>

            {/* Chat composer */}
            <div className="reveal" style={{ transitionDelay: "240ms" }}>
              <HeroComposer />
            </div>

            {/* CTA row */}
            <div
              className="reveal"
              style={{
                marginTop: 26, display: "flex", gap: 14,
                alignItems: "center", flexWrap: "wrap",
                transitionDelay: "320ms",
              }}
            >
              <Link
                href="/riasec"
                className="hero-cta-primary"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 10,
                  height: 60, padding: "0 28px", borderRadius: 999,
                  fontFamily: "var(--font-display, sans-serif)", fontSize: 16, fontWeight: 700,
                  background: "var(--ink, #0A1F14)", color: "#fff",
                  boxShadow: "0 8px 24px -8px rgba(10,31,20,.5)",
                  transition: "transform 220ms, box-shadow 220ms",
                  textDecoration: "none",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                เริ่มทดสอบ RIASEC · ฟรี
              </Link>
              <Link
                href="/explore"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  height: 60, padding: "0 8px",
                  fontFamily: "var(--font-display, sans-serif)", fontSize: 15, fontWeight: 700,
                  color: "var(--ink, #0A1F14)", textDecoration: "none",
                  transition: "gap 220ms",
                }}
              >
                ดูคณะทั้งหมด 47 หลักสูตร
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M7 17 17 7M9 7h8v8"/>
                </svg>
              </Link>
            </div>

            {/* Social proof */}
            <div
              className="reveal"
              style={{
                marginTop: 36, display: "flex", alignItems: "center",
                gap: 14, flexWrap: "wrap", transitionDelay: "400ms",
              }}
            >
              {/* Avatars */}
              <div style={{ display: "flex" }}>
                {[
                  { bg: "#E6F5EC", emoji: "🌱" },
                  { bg: "#FFF1E6", emoji: "📚" },
                  { bg: "#EAF3FB", emoji: "🎯" },
                  { bg: "#F1ECFB", emoji: "💡" },
                ].map(({ bg, emoji }, i) => (
                  <div
                    key={i}
                    style={{
                      width: 36, height: 36, borderRadius: "50%",
                      border: "2.5px solid var(--paper, #FAFAF6)",
                      display: "grid", placeItems: "center", fontSize: 16,
                      background: bg,
                      marginLeft: i === 0 ? 0 : -10,
                    }}
                  >
                    {emoji}
                  </div>
                ))}
              </div>
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-display, sans-serif)",
                    fontSize: 14, fontWeight: 700, color: "var(--ink, #0A1F14)",
                  }}
                >
                  12,400+ นักเรียน ม.6 ใช้แล้ว
                </div>
                <div style={{ fontSize: 12, color: "var(--ink-3, #6B7770)", marginTop: 2 }}>
                  <span style={{ color: "#E8A93B" }}>★★★★★</span> 4.9/5 · จาก 2,143 รีวิว
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT — collage */}
          <div className="reveal" style={{ transitionDelay: "200ms" }}>
            <HeroCollage />
          </div>
        </div>

        {/* Marquee */}
        <MarqueeBar />
      </div>

      <style>{`
        @media (max-width: 1040px) {
          .hero-grid { grid-template-columns: 1fr !important; min-height: 0 !important; gap: 40px !important; }
        }
        .hero-cta-primary:hover { transform: translateY(-2px) !important; box-shadow: 0 14px 32px -10px rgba(10,31,20,.6) !important; }
      `}</style>
    </section>
  );
}
