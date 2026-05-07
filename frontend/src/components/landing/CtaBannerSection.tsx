import Link from "next/link";

export default function CtaBannerSection() {
  return (
    <section style={{ padding: "120px 0" }}>
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "0 clamp(1rem, 2.4vw, 2rem)" }}>
        <div
          className="reveal"
          style={{
            position: "relative", overflow: "hidden", padding: "72px",
            background: "linear-gradient(135deg, var(--d-peach-soft, #FFF1E6) 0%, var(--d-green-soft, #E6F5EC) 100%)",
            borderRadius: 40, textAlign: "center",
          }}
        >
          {/* Ring decorations */}
          <svg
            aria-hidden="true"
            style={{ position: "absolute", top: -80, right: -80, opacity: .4, pointerEvents: "none" }}
            width="320" height="320" viewBox="0 0 320 320"
          >
            {[40, 80, 120, 160].map((r) => (
              <circle key={r} cx="160" cy="160" r={r} fill="none" stroke="var(--d-green, #00A651)" strokeWidth=".5" strokeDasharray="3 6"/>
            ))}
          </svg>
          <svg
            aria-hidden="true"
            style={{ position: "absolute", bottom: -60, left: -60, opacity: .3, pointerEvents: "none" }}
            width="240" height="240" viewBox="0 0 240 240"
          >
            {[30, 60, 90, 120].map((r) => (
              <circle key={r} cx="120" cy="120" r={r} fill="none" stroke="var(--d-rust, #B85B2E)" strokeWidth=".5" strokeDasharray="3 6"/>
            ))}
          </svg>

          {/* Kicker */}
          <div
            style={{
              fontFamily: "var(--font-display, sans-serif)", fontSize: 12, fontWeight: 800,
              letterSpacing: ".18em", color: "var(--d-green-deep, #006D35)", textTransform: "uppercase",
              position: "relative",
            }}
          >
            Ready when you are
          </div>

          {/* H2 */}
          <h2
            style={{
              fontFamily: "var(--font-display, sans-serif)", fontWeight: 800,
              fontSize: "clamp(36px, 4.6vw, 64px)", lineHeight: .98, letterSpacing: "-.03em",
              color: "var(--ink, #0A1F14)", margin: "14px auto 20px", textWrap: "balance",
              maxWidth: 640, position: "relative",
            }}
          >
            เริ่มหา{" "}
            <em style={{ fontFamily: "var(--font-serif, Georgia, serif)", fontStyle: "italic", fontWeight: 400, color: "var(--d-green, #00A651)" }}>
              คณะที่ใช่
            </em>
            <br />
            ใน 5 นาที
          </h2>

          {/* Lead */}
          <p style={{ fontSize: 18, lineHeight: 1.55, color: "var(--ink-2, #2E3D34)", maxWidth: 540, margin: "0 auto 36px", position: "relative" }}>
            ฟรี · ไม่ต้องสมัคร · ใช้ได้ทันที
          </p>

          {/* CTA buttons */}
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", position: "relative" }}>
            <Link
              href="/riasec"
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
              เริ่มทดสอบ RIASEC
            </Link>
            <Link
              href="/chat"
              style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                height: 60, padding: "0 28px", borderRadius: 999,
                fontFamily: "var(--font-display, sans-serif)", fontSize: 16, fontWeight: 700,
                background: "rgba(255,255,255,.7)", color: "var(--ink, #0A1F14)",
                border: "1px solid var(--line, #E8EAE2)", backdropFilter: "blur(8px)",
                transition: "background 220ms, border-color 220ms",
                textDecoration: "none",
              }}
            >
              ถาม KUru เลย
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M7 17 17 7M9 7h8v8"/>
              </svg>
            </Link>
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .cta-inner { padding: 40px 24px !important; border-radius: 28px !important; }
        }
      `}</style>
    </section>
  );
}
