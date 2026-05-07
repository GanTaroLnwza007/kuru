const PROGRAMS = [
  "วิศวกรรมเกษตรอัจฉริยะ",
  "วิทยาศาสตร์ข้อมูล",
  "เศรษฐศาสตร์เกษตร",
  "การจัดการสิ่งแวดล้อม",
  "เทคโนโลยีอาหาร",
  "วิศวกรรมคอมพิวเตอร์",
  "สถาปัตยกรรม",
  "นิติศาสตร์",
  "จิตวิทยา",
  "ภาษาอังกฤษ",
];

const SparkIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ color: "var(--d-green, #00A651)", flexShrink: 0 }}>
    <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/>
  </svg>
);

export default function MarqueeBar() {
  const doubled = [...PROGRAMS, ...PROGRAMS];

  return (
    <div
      style={{
        marginTop: 48,
        padding: "14px 0",
        overflow: "hidden",
        borderTop: "1px solid rgba(15,27,20,.08)",
        borderBottom: "1px solid rgba(15,27,20,.08)",
        background: "rgba(255,255,255,.4)",
        backdropFilter: "blur(10px)",
        position: "relative",
        zIndex: 2,
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 36,
          whiteSpace: "nowrap",
          animation: "marquee 38s linear infinite",
          width: "max-content",
        }}
      >
        {doubled.map((name, i) => (
          <span
            key={i}
            style={{
              fontFamily: "var(--font-display, 'Plus Jakarta Sans', sans-serif)",
              fontSize: 14,
              fontWeight: 600,
              color: "var(--ink-3, #6B7770)",
              display: "inline-flex",
              alignItems: "center",
              gap: 36,
              flexShrink: 0,
            }}
          >
            <SparkIcon />
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}
