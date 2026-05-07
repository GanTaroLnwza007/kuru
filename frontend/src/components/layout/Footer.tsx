import Link from "next/link";

export default function Footer() {
  return (
    <footer
      id="about"
      style={{ background: "var(--ink)", color: "rgba(255,255,255,.7)" }}
      className="pt-16 pb-8"
    >
      <div className="mx-auto max-w-[1320px] px-4 sm:px-8">
        {/* Grid */}
        <div className="mb-14 grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div
              className="mb-4 font-display text-2xl font-extrabold tracking-tight text-white"
            >
              KUru
            </div>
            <p className="max-w-[280px] text-sm leading-relaxed">
              AI-powered academic pathway advisor for Kasetsart University.
              Built with ❤️ for Thai high schoolers.
            </p>
          </div>

          {/* Product */}
          <div>
            <h5 className="mb-4 font-display text-xs font-extrabold uppercase tracking-widest text-white/50">
              Product
            </h5>
            <ul className="flex flex-col gap-2.5 text-sm">
              <li><Link href="/riasec"    className="hover:text-white transition-colors">RIASEC Test</Link></li>
              <li><Link href="/explore"   className="hover:text-white transition-colors">Program Explorer</Link></li>
              <li><Link href="/portfolio" className="hover:text-white transition-colors">Portfolio Coach</Link></li>
              <li><Link href="/chat"      className="hover:text-white transition-colors">Chatbot</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h5 className="mb-4 font-display text-xs font-extrabold uppercase tracking-widest text-white/50">
              Resources
            </h5>
            <ul className="flex flex-col gap-2.5 text-sm">
              <li><span className="cursor-default">TCAS68 Guide</span></li>
              <li><span className="cursor-default">Reviews นักศึกษาปัจจุบัน</span></li>
              <li><span className="cursor-default">Blog</span></li>
              <li><span className="cursor-default">FAQ</span></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h5 className="mb-4 font-display text-xs font-extrabold uppercase tracking-widest text-white/50">
              Contact
            </h5>
            <ul className="flex flex-col gap-2.5 text-sm">
              <li><span className="cursor-default">contact@kuru.ku.ac.th</span></li>
              <li><span className="cursor-default">Line @kuru-ku</span></li>
              <li><span className="cursor-default">Facebook</span></li>
              <li><span className="cursor-default">Privacy Policy</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="flex flex-wrap items-center justify-between gap-3 border-t pt-7 text-xs"
          style={{ borderColor: "rgba(255,255,255,.12)" }}
        >
          <span>© 2026 KUru · Kasetsart University</span>
          <span>Made with care in Bangkok 🇹🇭</span>
        </div>
      </div>
    </footer>
  );
}
