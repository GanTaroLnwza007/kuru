import Link from "next/link";

const HERO_PROGRAM = {
  rank: 1,
  faculty: "คณะวิศวกรรมศาสตร์",
  name: "วิศวกรรมเกษตรอัจฉริยะ",
  desc: "ผสานวิศวกรรม IoT ระบบควบคุมอัตโนมัติ และเซ็นเซอร์ — เพื่อเปลี่ยนเกษตรกรรมไทยให้ขับเคลื่อนด้วยข้อมูล",
  tags: ["Investigative", "Realistic", "Conventional"],
  match: 94,
  href: "/explore/ske",
};

const TREND_CARDS = [
  { rank: 2, faculty: "คณะวิทยาศาสตร์",      name: "วิทยาศาสตร์ข้อมูลเกษตร",       tags: ["Investigative", "Conventional"],  match: 89, href: "/explore/ds" },
  { rank: 3, faculty: "คณะเศรษฐศาสตร์",      name: "เศรษฐศาสตร์เกษตร และทรัพยากร",  tags: ["Enterprising", "Conventional"],   match: 87, href: "/explore/agri-econ" },
  { rank: 4, faculty: "คณะสิ่งแวดล้อม",       name: "การจัดการสิ่งแวดล้อม",            tags: ["Investigative", "Social"],        match: 85, href: "/explore/env" },
  { rank: 5, faculty: "คณะอุตสาหกรรมเกษตร",  name: "เทคโนโลยีอาหารและนวัตกรรม",     tags: ["Investigative", "Realistic"],     match: 82, href: "/explore/food" },
];

const ArrowIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M7 17 17 7M9 7h8v8"/>
  </svg>
);

export default function TrendingSection() {
  return (
    <section id="trending" style={{ padding: "120px 0 72px" }}>
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "0 clamp(1rem, 2.4vw, 2rem)" }}>
        {/* Header */}
        <div className="reveal" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, marginBottom: 32, flexWrap: "wrap" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10, flexWrap: "wrap" }}>
              <span style={{ fontFamily: "var(--font-display, sans-serif)", fontSize: 12, fontWeight: 800, letterSpacing: ".18em", color: "var(--d-green, #00A651)", textTransform: "uppercase" }}>
                Trending now
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 9px", borderRadius: 999, background: "var(--d-peach-soft, #FFF1E6)", color: "var(--d-rust, #B85B2E)", fontFamily: "var(--font-display, sans-serif)", fontSize: 10.5, fontWeight: 800, letterSpacing: ".08em" }}>
                🔥 HOT WEEK
              </span>
            </div>
            <h2 style={{ fontFamily: "var(--font-display, sans-serif)", fontWeight: 800, fontSize: "clamp(36px, 4.6vw, 64px)", lineHeight: .98, letterSpacing: "-.03em", color: "var(--ink, #0A1F14)", margin: 0, textWrap: "balance" }}>
              คณะที่เพื่อน ม.6
              <br />
              <em style={{ fontFamily: "var(--font-serif, Georgia, serif)", fontStyle: "italic", fontWeight: 400, color: "var(--d-green, #00A651)" }}>กำลังพูดถึง</em>
            </h2>
          </div>
          <Link
            href="/explore"
            style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              height: 50, padding: "0 22px", borderRadius: 999,
              fontFamily: "var(--font-display, sans-serif)", fontSize: 15, fontWeight: 700,
              background: "rgba(255,255,255,.7)", color: "var(--ink, #0A1F14)",
              border: "1px solid var(--ink, #0A1F14)", textDecoration: "none",
              transition: "background 220ms",
            }}
          >
            ดูทั้งหมด 47 หลักสูตร <ArrowIcon />
          </Link>
        </div>

        {/* Grid */}
        <div className="trend-grid" style={{ display: "grid", gap: 20, gridTemplateColumns: "1.4fr 1fr 1fr" }}>
          {/* Hero card */}
          <Link
            href={HERO_PROGRAM.href}
            className="reveal trend-hero"
            style={{
              gridRow: "span 2", position: "relative", overflow: "hidden",
              borderRadius: 32, minHeight: 480, background: "var(--ink, #0A1F14)",
              boxShadow: "0 16px 40px -16px rgba(10,31,20,.25)",
              transition: "all 400ms cubic-bezier(.2,.7,.2,1)",
              color: "#fff", textDecoration: "none",
              display: "block",
            }}
          >
            {/* Gradient overlay */}
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 20% 30%, rgba(0,166,81,.55) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(61,220,132,.4) 0%, transparent 50%), radial-gradient(circle at 50% 100%, rgba(0,109,53,.7) 0%, transparent 60%)" }} />
            {/* Big number watermark */}
            <div aria-hidden="true" style={{ position: "absolute", top: -28, right: -20, fontFamily: "var(--font-serif, Georgia, serif)", fontStyle: "italic", fontSize: 320, fontWeight: 400, color: "rgba(255,255,255,.06)", lineHeight: .8, letterSpacing: "-.05em", pointerEvents: "none", userSelect: "none" }}>
              1
            </div>
            <div style={{ position: "relative", height: "100%", padding: 36, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
                  <span style={{ fontFamily: "var(--font-display, sans-serif)", fontSize: 11, fontWeight: 800, letterSpacing: ".18em", color: "var(--d-green-pop, #3DDC84)", textTransform: "uppercase" }}>#1 most viewed</span>
                  <span style={{ width: 4, height: 4, borderRadius: "50%", background: "rgba(255,255,255,.3)" }} />
                  <span style={{ fontFamily: "var(--font-display, sans-serif)", fontSize: 12, color: "rgba(255,255,255,.6)" }}>{HERO_PROGRAM.faculty}</span>
                </div>
                <h3 style={{ fontFamily: "var(--font-display, sans-serif)", fontSize: "clamp(28px, 3vw, 40px)", fontWeight: 800, lineHeight: 1.05, letterSpacing: "-.025em", margin: 0, maxWidth: 380, textWrap: "balance" }}>
                  {HERO_PROGRAM.name}
                </h3>
                <p style={{ fontSize: 15, color: "rgba(255,255,255,.7)", lineHeight: 1.55, marginTop: 16, maxWidth: 360 }}>
                  {HERO_PROGRAM.desc}
                </p>
              </div>
              <div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
                  {HERO_PROGRAM.tags.map((tag) => (
                    <span key={tag} style={{ fontFamily: "var(--font-display, sans-serif)", fontSize: 11.5, fontWeight: 700, padding: "5px 11px", borderRadius: 999, background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.18)", color: "#fff" }}>
                      {tag}
                    </span>
                  ))}
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 20, borderTop: "1px solid rgba(255,255,255,.12)" }}>
                  <div>
                    <div style={{ fontFamily: "var(--font-display, sans-serif)", fontSize: 11, fontWeight: 800, letterSpacing: ".12em", color: "var(--d-green-pop, #3DDC84)" }}>MATCH</div>
                    <div style={{ fontFamily: "var(--font-display, sans-serif)", fontSize: 36, fontWeight: 800, lineHeight: 1, marginTop: 4 }}>
                      {HERO_PROGRAM.match}<span style={{ fontSize: 18, opacity: .6 }}>%</span>
                    </div>
                  </div>
                  <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.2)", display: "grid", placeItems: "center", transition: "all 240ms", color: "#fff" }}>
                    <ArrowIcon size={22} />
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* Smaller cards */}
          {TREND_CARDS.map((p, i) => (
            <Link
              key={p.rank}
              href={p.href}
              className="reveal"
              style={{
                position: "relative", overflow: "hidden", borderRadius: 24,
                background: "#fff", border: "1px solid var(--line-soft, #F0F2EB)",
                boxShadow: "0 1px 2px rgba(15,27,20,.04)",
                transition: "all 320ms cubic-bezier(.2,.7,.2,1)",
                padding: 22, display: "flex", flexDirection: "column", minHeight: 230,
                textDecoration: "none", color: "inherit",
                transitionDelay: `${i * 60 + 120}ms`,
              }}
            >
              {/* Rank watermark */}
              <div aria-hidden="true" style={{ position: "absolute", top: 14, right: 18, fontFamily: "var(--font-serif, Georgia, serif)", fontStyle: "italic", fontSize: 56, fontWeight: 400, color: "var(--line-soft, #F0F2EB)", lineHeight: .85, letterSpacing: "-.03em", userSelect: "none" }}>
                #{p.rank}
              </div>
              <div style={{ fontFamily: "var(--font-display, sans-serif)", fontSize: 10.5, fontWeight: 800, letterSpacing: ".12em", color: "var(--ink-3, #6B7770)", textTransform: "uppercase", marginBottom: 12 }}>
                {p.faculty}
              </div>
              <h4 style={{ fontFamily: "var(--font-display, sans-serif)", fontSize: 19, fontWeight: 700, lineHeight: 1.2, letterSpacing: "-.01em", margin: "0 0 12px", textWrap: "balance", maxWidth: "80%" }}>
                {p.name}
              </h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: "auto" }}>
                {p.tags.map((tag) => (
                  <span key={tag} style={{ fontFamily: "var(--font-display, sans-serif)", fontSize: 10.5, fontWeight: 700, padding: "3px 8px", borderRadius: 999, background: "var(--d-green-soft, #E6F5EC)", color: "var(--ink-2, #2E3D34)" }}>
                    {tag}
                  </span>
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16, paddingTop: 12, borderTop: "1px solid var(--line-soft, #F0F2EB)" }}>
                <span style={{ fontFamily: "var(--font-display, sans-serif)", fontSize: 16, fontWeight: 800, color: "var(--d-green-deep, #006D35)" }}>
                  {p.match}<span style={{ fontSize: 11, color: "var(--ink-3)", fontWeight: 600 }}>% match</span>
                </span>
                <span style={{ width: 28, height: 28, borderRadius: "50%", display: "grid", placeItems: "center", color: "var(--ink-3)" }}>
                  <ArrowIcon size={14} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <style>{`
        @media (max-width: 1040px) {
          .trend-grid { grid-template-columns: 1fr 1fr !important; }
          .trend-grid .trend-hero { grid-column: 1 / -1 !important; grid-row: auto !important; }
        }
        @media (max-width: 640px) {
          .trend-grid { grid-template-columns: 1fr !important; gap: 14px !important; }
        }
        .trend-hero:hover { transform: translateY(-4px) !important; box-shadow: 0 32px 64px -16px rgba(10,31,20,.4) !important; }
      `}</style>
    </section>
  );
}
