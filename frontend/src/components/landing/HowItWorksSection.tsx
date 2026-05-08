import Link from "next/link";

const ArrowIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M7 17 17 7M9 7h8v8"/>
  </svg>
);

const FEATURES = [
  {
    num: "01",
    kicker: "Self-discover",
    kickerColor: "var(--d-green, #00A651)",
    washBg: "var(--d-green-soft, #E6F5EC)",
    hoverNumColor: "var(--d-green, #00A651)",
    title: <>รู้จักตัวเองด้วย <em style={{ fontFamily: "var(--font-serif, Georgia, serif)", fontStyle: "italic", color: "var(--d-green, #00A651)" }}>RIASEC</em></>,
    body: "ตอบ 24 คำถามใน 3-5 นาที ผสมแบบสบาย ๆ ทั้ง likert, ภาพ, และสถานการณ์ — ออกมาเป็น personality 6 มิติ + คำแนะนำคณะ",
    cta: "เริ่มเลย",
    href: "/riasec",
  },
  {
    num: "02",
    kicker: "Explore",
    kickerColor: "var(--d-sky, #2A5C86)",
    washBg: "var(--d-sky-soft, #EAF3FB)",
    hoverNumColor: "var(--d-sky, #2A5C86)",
    title: <>ค้นหาคณะแบบ<em style={{ fontFamily: "var(--font-serif, Georgia, serif)", fontStyle: "italic", color: "var(--d-sky, #2A5C86)" }}> ภาษาคน</em></>,
    body: "พิมพ์เป็นภาษาธรรมชาติ — \"อยากเรียนเทคกับเกษตร\" — KUru เข้าใจ semantic แล้วเรียงคณะที่เหมาะที่สุดตามค่ามคอ.2 จริง",
    cta: "ลองค้นหา",
    href: "/explore",
  },
  {
    num: "03",
    kicker: "Prepare",
    kickerColor: "var(--d-rust, #B85B2E)",
    washBg: "var(--d-peach-soft, #FFF1E6)",
    hoverNumColor: "var(--d-rust, #B85B2E)",
    title: <>ปั้น<em style={{ fontFamily: "var(--font-serif, Georgia, serif)", fontStyle: "italic", color: "var(--d-rust, #B85B2E)" }}> Portfolio</em> ก่อนยื่น</>,
    body: "อัปโหลดพอร์ต PDF ระบบจะแยก achievements, ประเมินช่องว่าง, แล้วทำ roadmap 12 สัปดาห์ให้ก่อนยื่น TCAS รอบ 1",
    cta: "อัปโหลดพอร์ต",
    href: "/portfolio",
  },
] as const;

export default function HowItWorksSection() {
  return (
    <section id="how" style={{ padding: "120px 0 72px", position: "relative" }}>
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "0 clamp(1rem, 2.4vw, 2rem)" }}>
        {/* Section head */}
        <div className="reveal" style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 12, flexWrap: "wrap" }}>
          <span style={{ fontFamily: "var(--font-display, sans-serif)", fontSize: 12, fontWeight: 800, letterSpacing: ".18em", color: "var(--d-green, #00A651)", textTransform: "uppercase" }}>
            How it works
          </span>
          <span style={{ flex: 1, height: 1, background: "var(--line, #E8EAE2)", minWidth: 40 }} />
          <span style={{ fontFamily: "var(--font-display, sans-serif)", fontSize: 13, fontWeight: 600, color: "var(--ink-3, #6B7770)" }}>
            3 ขั้น · ใช้ทีละอันก็ได้
          </span>
        </div>

        <h2
          className="reveal"
          style={{
            fontFamily: "var(--font-display, sans-serif)", fontWeight: 800,
            fontSize: "clamp(36px, 4.6vw, 64px)", lineHeight: .98, letterSpacing: "-.03em",
            color: "var(--ink, #0A1F14)", margin: "0 0 56px", textWrap: "balance",
            maxWidth: 900, transitionDelay: "80ms",
          }}
        >
          จากคำถาม{" "}
          <em style={{ fontFamily: "var(--font-serif, Georgia, serif)", fontStyle: "italic", fontWeight: 400, color: "var(--d-green, #00A651)" }}>
            &ldquo;จะเรียนอะไรดี?&rdquo;
          </em>
          <br />
          ไปสู่แผนที่ทำตามได้จริง
        </h2>

        {/* Feature cards */}
        <div className="features-grid" style={{ display: "grid", gap: 24, gridTemplateColumns: "repeat(3, 1fr)" }}>
          {FEATURES.map((f, i) => (
            <div
              key={f.num}
              className={`reveal feature-card fc-${f.num}`}
              style={{
                position: "relative", overflow: "hidden", cursor: "pointer",
                background: "#fff", borderRadius: 28, padding: "32px 28px 28px",
                border: "1px solid var(--line-soft, #F0F2EB)",
                boxShadow: "0 1px 2px rgba(15,27,20,.04)",
                transition: "all 360ms cubic-bezier(.2,.7,.2,1)",
                transitionDelay: `${120 + i * 100}ms`,
              }}
            >
              {/* Wash background */}
              <div
                className="wash"
                style={{
                  position: "absolute", top: -80, right: -80,
                  width: 220, height: 220, borderRadius: "50%",
                  background: f.washBg, opacity: .5, filter: "blur(8px)",
                  transition: "opacity 360ms", pointerEvents: "none",
                }}
              />
              {/* Big italic number */}
              <div
                className="feat-num"
                style={{
                  fontFamily: "var(--font-serif, Georgia, serif)",
                  fontStyle: "italic", fontSize: 76, fontWeight: 400,
                  color: "var(--line, #E8EAE2)", lineHeight: .9, letterSpacing: "-.03em",
                  transition: "color 360ms", position: "relative",
                }}
              >
                {f.num}
              </div>
              {/* Kicker */}
              <div style={{ fontFamily: "var(--font-display, sans-serif)", fontSize: 11, fontWeight: 800, letterSpacing: ".16em", textTransform: "uppercase", marginTop: 14, marginBottom: 10, color: f.kickerColor, position: "relative" }}>
                {f.kicker}
              </div>
              {/* Title */}
              <h3 style={{ fontFamily: "var(--font-display, sans-serif)", fontSize: 26, fontWeight: 800, lineHeight: 1.15, letterSpacing: "-.02em", margin: "0 0 14px", position: "relative" }}>
                {f.title}
              </h3>
              {/* Body */}
              <p style={{ fontSize: 14.5, color: "var(--ink-2, #2E3D34)", lineHeight: 1.6, margin: "0 0 28px", position: "relative" }}>
                {f.body}
              </p>
              {/* Footer */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 16, borderTop: "1px solid var(--line-soft, #F0F2EB)", position: "relative" }}>
                <Link
                  href={f.href}
                  style={{ fontFamily: "var(--font-display, sans-serif)", fontSize: 13.5, fontWeight: 700, color: "var(--ink, #0A1F14)", textDecoration: "none" }}
                >
                  {f.cta}
                </Link>
                <div
                  className="feat-arrow"
                  style={{ width: 40, height: 40, borderRadius: "50%", background: "#fff", border: "1px solid var(--line, #E8EAE2)", display: "grid", placeItems: "center", transition: "all 240ms" }}
                >
                  <ArrowIcon />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @media (max-width: 900px) { .features-grid { grid-template-columns: 1fr !important; gap: 14px !important; } }
        .feature-card:hover { transform: translateY(-6px) !important; box-shadow: 0 24px 48px -16px rgba(15,27,20,.18) !important; }
        .feature-card:hover .wash { opacity: .9 !important; }
        .feature-card:hover .feat-arrow { background: var(--ink, #0A1F14) !important; color: #fff !important; border-color: var(--ink, #0A1F14) !important; }
        .fc-01:hover .feat-num { color: var(--d-green, #00A651) !important; }
        .fc-02:hover .feat-num { color: var(--d-sky, #2A5C86) !important; }
        .fc-03:hover .feat-num { color: var(--d-rust, #B85B2E) !important; }
      `}</style>
    </section>
  );
}
