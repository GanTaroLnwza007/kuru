const SOURCES = [
  { icon: "🌾", name: "Kasetsart University" },
  { icon: "📊", name: "ทปอ." },
  { icon: "🎓", name: "MyTCAS" },
  { icon: "📚", name: "มคอ.2 Repository" },
];

export default function TrustedBar() {
  return (
    <section style={{ padding: "64px 0", borderTop: "1px solid var(--line, #E8EAE2)", borderBottom: "1px solid var(--line, #E8EAE2)", background: "var(--cream, #F5F0E6)" }}>
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "0 clamp(1rem, 2.4vw, 2rem)" }}>
        <div className="trusted-inner" style={{ display: "grid", gap: 32, gridTemplateColumns: "1fr 2fr", alignItems: "center" }}>
          <p style={{ fontFamily: "var(--font-display, sans-serif)", fontSize: 13, fontWeight: 700, color: "var(--ink-2, #2E3D34)", maxWidth: 280 }}>
            ใช้{" "}
            <em style={{ fontFamily: "var(--font-serif, Georgia, serif)", fontSize: 16, color: "var(--ink, #0A1F14)" }}>
              มคอ.2
            </em>{" "}
            และข้อมูล TCAS อย่างเป็นทางการจาก
          </p>
          <div style={{ display: "flex", gap: 28, alignItems: "center", flexWrap: "wrap", opacity: .7 }}>
            {SOURCES.map(({ icon, name }) => (
              <span
                key={name}
                style={{
                  fontFamily: "var(--font-display, sans-serif)",
                  fontWeight: 800, fontSize: 18, letterSpacing: "-.01em",
                  color: "var(--ink, #0A1F14)",
                  display: "inline-flex", alignItems: "center", gap: 8,
                }}
              >
                {icon} {name}
              </span>
            ))}
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 900px) { .trusted-inner { grid-template-columns: 1fr !important; gap: 24px !important; } }
      `}</style>
    </section>
  );
}
