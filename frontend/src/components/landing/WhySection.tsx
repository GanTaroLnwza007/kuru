const STATS = [
  { key: "Sources", value: "มคอ.2", desc: "อ่านเอกสารหลักสูตรจริงทุกฉบับ — ไม่ใช่ Google ทั่วไป" },
  { key: "Updates", value: "TCAS68", desc: "อัปเดตเงื่อนไขรับสมัครและคะแนนปีล่าสุดทุกสัปดาห์" },
  { key: "Privacy", value: "100%", desc: "พอร์ตของคุณอยู่บนเครื่องของคุณ — ไม่อัปโหลดที่ไหน" },
  { key: "Free", value: "ฟรี", desc: "KU เป็นมหาวิทยาลัยรัฐ — ทำเพื่อนักเรียนทุกคน" },
];

export default function WhySection() {
  return (
    <section
      id="why"
      style={{
        background: "var(--ink, #0A1F14)",
        color: "#fff",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Radial glows */}
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse 800px 400px at 80% 20%, rgba(0,166,81,.25) 0%, transparent 60%), radial-gradient(ellipse 600px 400px at 10% 80%, rgba(61,220,132,.15) 0%, transparent 60%)" }} />

      <div style={{ position: "relative", maxWidth: 1320, margin: "0 auto", padding: "120px clamp(1rem, 2.4vw, 2rem) 72px" }}>
        {/* Kicker */}
        <div className="reveal" style={{ fontFamily: "var(--font-display, sans-serif)", fontSize: 12, fontWeight: 800, letterSpacing: ".18em", color: "var(--d-green-pop, #3DDC84)", textTransform: "uppercase" }}>
          Why KUru
        </div>

        {/* H2 */}
        <h2
          className="reveal"
          style={{
            fontFamily: "var(--font-display, sans-serif)", fontWeight: 800,
            fontSize: "clamp(36px, 4.6vw, 64px)", lineHeight: .98, letterSpacing: "-.03em",
            color: "#fff", marginTop: 14, marginBottom: 0, textWrap: "balance",
            maxWidth: 1000, transitionDelay: "80ms",
          }}
        >
          ไม่ต้องเดาอีกต่อไป
          <br />
          <em style={{ fontFamily: "var(--font-serif, Georgia, serif)", fontStyle: "italic", fontWeight: 400, color: "var(--d-green-pop, #3DDC84)" }}>
            ตัดสินใจด้วยข้อมูลจริง
          </em>
        </h2>

        {/* Stats grid */}
        <div className="stats-grid" style={{ display: "grid", gap: 28, gridTemplateColumns: "repeat(4, 1fr)", marginTop: 56 }}>
          {STATS.map(({ key, value, desc }, i) => (
            <div
              key={key}
              className="reveal"
              style={{ padding: "24px 4px", borderTop: "1px solid rgba(255,255,255,.18)", transitionDelay: `${120 + i * 80}ms` }}
            >
              <div style={{ fontFamily: "var(--font-display, sans-serif)", fontSize: 11, fontWeight: 800, letterSpacing: ".16em", color: "rgba(255,255,255,.5)", textTransform: "uppercase" }}>
                {key}
              </div>
              <div style={{ fontFamily: "var(--font-display, sans-serif)", fontSize: "clamp(40px, 5vw, 64px)", fontWeight: 800, lineHeight: 1, letterSpacing: "-.03em", margin: "12px 0 16px" }}>
                {value}
              </div>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,.7)", lineHeight: 1.55 }}>
                {desc}
              </div>
            </div>
          ))}
        </div>

        {/* Testimonial */}
        <div
          className="reveal testimonial-card"
          style={{
            marginTop: 88, padding: 40,
            background: "rgba(255,255,255,.05)", borderRadius: 28,
            border: "1px solid rgba(255,255,255,.1)", backdropFilter: "blur(20px)",
            display: "grid", gap: 24, gridTemplateColumns: "auto 1fr auto", alignItems: "center",
            transitionDelay: "440ms",
          }}
        >
          <div style={{ fontFamily: "var(--font-serif, Georgia, serif)", fontSize: 88, fontStyle: "italic", color: "var(--d-green-pop, #3DDC84)", lineHeight: .7 }}>
            &ldquo;
          </div>
          <div>
            <p style={{ fontFamily: "var(--font-serif, Georgia, serif)", fontSize: "clamp(18px, 2vw, 26px)", fontStyle: "italic", lineHeight: 1.45, margin: 0, textWrap: "balance" }}>
              ตอน ม.6 หนูเครียดมากเรื่องเลือกคณะ — KUru ช่วยให้หนูเห็นว่าตัวเองเหมาะกับวิศวกรรมเกษตรอัจฉริยะจริง ๆ ตอนนี้เรียนปี 1 แล้วและ{" "}
              <em style={{ color: "var(--d-green-pop, #3DDC84)" }}>ชอบมาก</em>
            </p>
            <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg, #F4B68C, #E8A93B)", display: "grid", placeItems: "center", fontWeight: 800, color: "var(--ink)" }}>
                ภ
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-display, sans-serif)", fontSize: 14, fontWeight: 700 }}>ภัทรนันท์ ส.</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,.55)" }}>วิศวกรรมเกษตรอัจฉริยะ KU · TCAS67</div>
              </div>
            </div>
          </div>
          <div className="testimonial-stars" style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
            <div style={{ color: "#E8A93B", fontSize: 18, letterSpacing: 2 }}>★★★★★</div>
            <div style={{ fontFamily: "var(--font-display, sans-serif)", fontSize: 11, color: "rgba(255,255,255,.5)", letterSpacing: ".08em" }}>VERIFIED USER</div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) { .stats-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 540px) { .stats-grid { grid-template-columns: 1fr !important; } }
        @media (max-width: 768px) { .testimonial-card { grid-template-columns: 1fr !important; padding: 28px !important; margin-top: 56px !important; } .testimonial-stars { display: none !important; } }
      `}</style>
    </section>
  );
}
