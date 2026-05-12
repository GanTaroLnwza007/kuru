import Link from "next/link";

export default function PortfolioPage() {
  return (
    <div
      style={{
        minHeight: "calc(100vh - 160px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
      }}
    >
      <div style={{ maxWidth: 520, width: "100%", textAlign: "center" }}>
        {/* Phase badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            height: 28,
            padding: "0 12px",
            borderRadius: 999,
            background: "var(--d-peach-soft, #FFF1E6)",
            color: "var(--d-rust, #B85B2E)",
            fontSize: 11.5,
            fontWeight: 700,
            letterSpacing: ".06em",
            marginBottom: 24,
          }}
        >
          PHASE 2 · COMING SOON
        </div>

        {/* Icon */}
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 22,
            background: "var(--d-peach-soft, #FFF1E6)",
            color: "var(--d-rust, #B85B2E)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
            boxShadow: "0 8px 24px -8px rgba(184,91,46,.25)",
          }}
        >
          <svg
            width="34"
            height="34"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14,2 14,8 20,8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10,9 9,9 8,9" />
          </svg>
        </div>

        <h1
          style={{
            fontSize: "clamp(28px,5vw,40px)",
            fontWeight: 800,
            color: "var(--ink, #0A1F14)",
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
            margin: 0,
            marginBottom: 14,
          }}
        >
          Portfolio Coach
        </h1>

        <p
          style={{
            fontSize: 16,
            color: "var(--ink-2, #2E3D34)",
            lineHeight: 1.65,
            margin: 0,
            marginBottom: 32,
          }}
        >
          อัปโหลดพอร์ต PDF แล้วให้ KUru วิเคราะห์ช่องว่าง และทำแผน 12 สัปดาห์ก่อนยื่น TCAS รอบ 1
          — ฟีเจอร์นี้อยู่ระหว่างพัฒนา จะเปิดใช้ใน Phase 2
        </p>

        {/* What's coming */}
        <div
          style={{
            background: "#fff",
            borderRadius: 20,
            border: "1px solid var(--line-soft, #F0F2EB)",
            padding: "20px 24px",
            marginBottom: 28,
            textAlign: "left",
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              color: "var(--ink-3, #6B7770)",
              letterSpacing: ".1em",
              marginBottom: 14,
              textTransform: "uppercase",
            }}
          >
            ที่จะมีใน Phase 2
          </div>
          {[
            "อัปโหลด PDF พอร์ตและให้ KUru อ่านให้",
            "วิเคราะห์ช่องว่างระหว่างพอร์ตกับเกณฑ์คณะที่สนใจ",
            "สร้างแผนเตรียมตัว 12 สัปดาห์ก่อน TCAS รอบ 1",
            "ประเมิน match score พอร์ต × RIASEC ร่วมกัน",
          ].map((item, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                padding: "8px 0",
                borderBottom: i < 3 ? "1px solid var(--line-soft, #F0F2EB)" : "none",
              }}
            >
              <div
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 6,
                  background: "var(--d-peach-soft, #FFF1E6)",
                  color: "var(--d-rust, #B85B2E)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginTop: 1,
                }}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <span style={{ fontSize: 13.5, color: "var(--ink-2, #2E3D34)", lineHeight: 1.55 }}>
                {item}
              </span>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            href="/riasec"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              height: 44,
              padding: "0 20px",
              borderRadius: 999,
              background: "var(--ink, #0A1F14)",
              color: "#fff",
              fontSize: 14,
              fontWeight: 700,
              textDecoration: "none",
              transition: "opacity 200ms",
            }}
          >
            ทำ RIASEC ก่อน
          </Link>
          <Link
            href="/explore"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              height: 44,
              padding: "0 20px",
              borderRadius: 999,
              background: "#fff",
              color: "var(--ink, #0A1F14)",
              border: "1px solid var(--line, #E8EAE2)",
              fontSize: 14,
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            ดูคณะที่สนใจก่อน
          </Link>
        </div>
      </div>
    </div>
  );
}
