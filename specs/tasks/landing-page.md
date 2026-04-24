# Tasks: Landing Page, Logo, Navbar & Footer

## Overview

Implements the public-facing landing page at `/` together with the KUru logo component, the updated top navbar, and the global footer. The landing page is the first screen prospective M6 students see; it must immediately communicate the product value proposition, surface the RIASEC CTA, and link to all core features. Visual spec is the attached design mockup (5 sections: Hero, Features, Popular Programs, How It Works, CTA Banner). Stack constraints are governed by `specs/context/architecture.md §2` (Next.js App Router, Shadcn/UI + Tailwind, no extra component libraries) and UX requirements by `specs/context/personas.md §1–2` (Thai-first, mobile-first, 375 px baseline, 44 px touch targets). The root `frontend/src/app/page.tsx` currently performs a `redirect("/chat")`; TASK-011 replaces it with the real landing page.

## Dependencies

- `specs/tasks/tasks-frontend-setup.md` TASK-001 through TASK-034 — all complete (verified in `specs/summary/COMPLETION_SUMMARY.md`).
- No backend API calls are required; all program card data on the landing page is static stub data.

---

## Task list

### TASK-001: KuruLogo component
**Agent:** frontend-dev  
**File(s):** `frontend/src/components/ui/KuruLogo.tsx`  
**Spec ref:** `specs/context/architecture.md §2` (Shadcn/UI + Tailwind only; no external icon libraries)  
**Description:** Create a React Server Component that renders the KUru brand mark. The mark consists of an inline SVG graduation-cap (mortarboard) icon rendered in `var(--color-primary)`, immediately followed by the logotype: **KU** in bold dark-green (`font-extrabold text-primary`) and **ru** in a slightly lighter weight (`font-bold text-primary/80`). Accept a `size` prop (`"sm" | "md" | "lg"`) defaulting to `"md"` that scales icon (`sm`=20 px, `md`=28 px, `lg`=36 px) and text (`sm`=`text-lg`, `md`=`text-2xl`, `lg`=`text-3xl`) uniformly. Accept an optional `iconOnly?: boolean` (default `false`) that hides the text while keeping `aria-label="KUru"` on the root element. The SVG is entirely inlined — do **not** reference any file in `public/` or use `<Image>`.

**Acceptance criteria:**
- [ ] Renders graduation-cap SVG + "KUru" logotype at all three sizes without distortion.
- [ ] `iconOnly={true}` hides the text; root element carries `aria-label="KUru"`.
- [ ] No `"use client"` directive (Server Component).
- [ ] `npm run typecheck` and `npm run lint` pass with zero issues.

**Blocked by:** None

---

### TASK-002: Add landing page and nav i18n strings
**Agent:** frontend-dev  
**File(s):** `frontend/src/messages/th.json`, `frontend/src/messages/en.json`  
**Spec ref:** `specs/context/personas.md §1` (Thai-first, warm exploratory tone), `specs/context/personas.md §2 Persona A`  
**Description:** Make two sets of changes to both locale files.

**Change 1 — update the existing `nav` namespace** (do not remove existing keys; update values and add `home`):

| Key | Thai | English |
|---|---|---|
| `nav.home` *(new)* | `หน้าแรก` | `Home` |
| `nav.chat` | `แชทกับ KUru` | `Chat with KUru` |
| `nav.explore` | `ค้นหา` | `Find` |
| `nav.riasec` | `สำรวจ` | `Explore` |
| `nav.portfolio` | `Portfolio Coach` | `Portfolio Coach` |

**Change 2 — add a new top-level `landing` namespace** with these keys (Thai values shown; provide English equivalents in `en.json`):

```
landing.hero.headline         "ค้นหาคณะที่ใช่สำหรับคุณที่ ม.เกษตรศาสตร์ ได้ง่ายๆ ใน 3 นาที"
landing.hero.searchPlaceholder "⭐ อยากเข้าคณะอะไร? หรือลองถามว่า 'ขอแนะนำโปรแกรมและคณะ'"
landing.hero.cta               "✨ เริ่มทดสอบ RIASEC ฟรี"
landing.features.heading       "ทำไมนักเรียน ม.6 จึงชอบใช้ KUru"
landing.features.card1.title   "ง่ายมาก"
landing.features.card1.body    "ไม่ต้องกรอกข้อมูลซ้ำซ้อน แค่ทำแบบทดสอบสั้นๆ ระบบ AI จะวิเคราะห์ให้อัตโนมัติ"
landing.features.card2.title   "ข้อมูลจริง"
landing.features.card2.body    "ดึงข้อมูลหลักสูตรและเงื่อนไขการรับสมัครจาก ม.เกษตรศาสตร์ โดยตรง มั่นใจได้ 100%"
landing.features.card3.title   "ช่วยได้จริง"
landing.features.card3.body    "ให้คำแนะนำที่เหมาะกับคุณลักษณะและความสนใจของคุณ ช่วยตอบความกังวลใจในการเลือกคณะ"
landing.programs.heading       "โปรแกรมที่กำลังได้รับความนิยมสำหรับนักเรียนแบบคุณ"
landing.programs.subheading    "จากการวิเคราะห์ความสนใจล่าสุดของคุณ"
landing.programs.viewAll       "ดูทั้งหมด"
landing.programs.match         "{pct}% Match"
landing.howItWorks.heading     "ขั้นตอนการทำงานของ KUru"
landing.howItWorks.subheading  "เพียงไม่กี่ขั้นตอนง่ายๆ เพื่อค้นพบเส้นทางของคุณ"
landing.howItWorks.step1.title "บอกความสนใจ"
landing.howItWorks.step1.body  "ทำแบบทดสอบ RIASEC แสดงความสนใจและบุคลิกภาพของคุณ"
landing.howItWorks.step2.title "วิเคราะห์ AI"
landing.howItWorks.step2.body  "ระบบ AI จัดกลุ่มและจับคู่กับข้อมูลหลักสูตรที่เหมาะสม"
landing.howItWorks.step3.title "ได้คำแนะนำ"
landing.howItWorks.step3.body  "รับรายการคณะ/สาขาที่เหมาะสมกับคุณที่สุด"
landing.howItWorks.step4.title "เตรียมตัวสมัคร"
landing.howItWorks.step4.body  "รวบรวมข้อมูล TCAS ล่าสุด พร้อมช่วยเตรียมพอร์ตโฟลิโอ"
landing.cta.headline           "พร้อมเริ่มต้นเส้นทางมหาวิทยาลัย แล้วหรือยัง"
landing.cta.button             "เริ่มใช้งาน KUru ฟรีตอนนี้"
```

**Acceptance criteria:**
- [ ] All `nav.*` keys are updated in both locale files; no existing keys deleted.
- [ ] `landing` namespace present with all keys above in both `th.json` and `en.json`.
- [ ] `npm run typecheck` passes (next-intl infers catalog completeness at build time).

**Blocked by:** None

---

### TASK-003: Update MainNav — home link, updated labels, KuruLogo
**Agent:** frontend-dev  
**File(s):** `frontend/src/components/layout/MainNav.tsx`  
**Spec ref:** `specs/context/architecture.md §2`, `specs/context/personas.md §1`  
**Description:** Apply three targeted changes to the existing `MainNav` component:

1. **Add `home` nav item** — insert `{ href: "/", label: t("nav.home") }` as the **first** item in `navItems`. Patch `isActivePath` so `/` is active only when `pathname === "/"` exactly, preventing it from matching `/chat`, `/explore`, etc.

2. **Update translation key references** — existing keys (`t("chat")`, `t("explore")`, `t("riasec")`, `t("portfolio")`) must be updated to the namespaced forms (`t("nav.chat")` etc.) if the catalog structure has changed. Verify the call sites match the new key structure from TASK-002.

3. **Replace the text-only "KUru" brand link** in the left column with `<KuruLogo size="md" />` wrapped in `<Link href="/" aria-label="KUru Home">`. Import `KuruLogo` from `"@/components/ui/KuruLogo"`.

Make no other changes (mobile menu, locale toggle, profile button, and CSS classes are untouched).

**Acceptance criteria:**
- [ ] Nav renders 5 items in order: หน้าแรก, ค้นหา, สำรวจ, Portfolio Coach, แชทกับ KUru.
- [ ] Active underline on หน้าแรก only when `pathname === "/"`.
- [ ] KuruLogo visible in the left brand area at `md` size.
- [ ] `npm run typecheck` and `npm run lint` pass.

**Blocked by:** TASK-001 (KuruLogo component), TASK-002 (i18n keys)

---

### TASK-004: Footer component
**Agent:** frontend-dev  
**File(s):** `frontend/src/components/layout/Footer.tsx`  
**Spec ref:** `specs/context/architecture.md §2`, `specs/context/personas.md §1`  
**Description:** Create a Server Component that renders the global footer. Use `getTranslations` (server-side) for any translated strings, or inline Thai strings directly if translation keys are not needed.

**Structure:**
```
<footer bg-surface-subtle border-t py-10 px-4>
  <div max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-8>
    [Left]   KuruLogo (size="sm") + tagline paragraph
    [Center] "ลิ้งค์ที่เป็นประโยชน์" heading + 3 placeholder labels
    [Right]  "ติดตามข่าวสาร" heading + 3 icon buttons
  </div>
  <div border-t mt-8 pt-4 text-center text-sm text-text-secondary>
    © 2026 KUru Academic Advisor - Senior Project
  </div>
</footer>
```

**Column details:**
- **Left:** `<KuruLogo size="sm" />` (shows icon + text). Below it: tagline `<p className="text-sm text-text-secondary mt-2">เครื่องมือแนะแนวการศึกษาอัจฉริยะ…</p>` (full Thai tagline from the design).
- **Center:** `<h3 className="font-bold mb-3">ลิ้งค์ที่เป็นประโยชน์</h3>` followed by `<ul>` with three `<li>` items as plain `<span>` (non-interactive placeholders): "Team Members & IDs", "Advisor Information", "Faculty of Engineering".
- **Right:** `<h3 className="font-bold mb-3">ติดตามข่าวสาร</h3>` followed by a flex row of three `<button type="button">` elements with `aria-label` values "รางวัล", "แชร์", "อีเมล" and Unicode icon content `🏆`, `↗`, `✉`. Style as ghost icon buttons with a hover ring.

Do **not** add any new npm package for icons.

**Acceptance criteria:**
- [ ] Three-column grid on `md:` and above; single column on mobile.
- [ ] Left column: KuruLogo + tagline.
- [ ] Center column: heading + three placeholder labels.
- [ ] Right column: heading + three accessible icon buttons.
- [ ] Bottom copyright bar renders below the grid.
- [ ] No new packages added to `package.json`.
- [ ] `npm run typecheck` and `npm run lint` pass.

**Blocked by:** TASK-001 (KuruLogo)

---

### TASK-005: Wire Footer into AppShell
**Agent:** frontend-dev  
**File(s):** `frontend/src/components/layout/AppShell.tsx`  
**Spec ref:** `specs/context/architecture.md §2`  
**Description:** Import `Footer` from `"@/components/layout/Footer"` and render it as a direct child after `</main>` inside the flex container. The final structure must be:

```tsx
<div className="flex min-h-full flex-col bg-background">
  <TopNavBar><MainNav /></TopNavBar>
  <main id="app-content-region" className="flex-1 pb-8 pt-4 sm:pt-6">
    {children}
  </main>
  <Footer />
</div>
```

No other changes.

**Acceptance criteria:**
- [ ] `Footer` renders below page content on every route.
- [ ] `flex-1` on `<main>` still pushes the footer to the page bottom when content is short (sticky footer behaviour).
- [ ] `npm run typecheck` and `npm run lint` pass.

**Blocked by:** TASK-004 (Footer component)

---

### TASK-006: HeroSection component
**Agent:** frontend-dev  
**File(s):** `frontend/src/components/landing/HeroSection.tsx`  
**Spec ref:** `specs/context/personas.md §2 Persona A` (low-stakes entry, non-judgmental)  
**Description:** Create a Server Component for the hero. Use `getTranslations("landing")` for strings.

**Layout** (`grid grid-cols-1 md:grid-cols-2 gap-8 items-center`):

**Left column:**
- `<h1 className="text-4xl md:text-5xl font-bold leading-tight">{t("hero.headline")}</h1>` — the headline spans multiple lines on mobile; ensure Thai word-break is natural.
- Search form: `<form action="/explore" method="GET" className="mt-6 relative">`. Inside: `<input name="q" type="search" placeholder={t("hero.searchPlaceholder")} className="w-full rounded-full border ... pl-10 pr-4 py-3" />` with a search icon (`🔍`) positioned absolutely on the left. No `onChange` handler — pure HTML form submission navigates to `/explore?q=…`.
- CTA: `<Link href="/riasec" className="mt-4 inline-flex ...">` styled as a filled dark-green button (use Tailwind `bg-primary text-white` or Shadcn `Button variant="default"`). Label: `{t("hero.cta")}`. Minimum touch target: 44 px height.

**Right column:**
- `<div className="w-full aspect-[4/3] rounded-2xl bg-surface-subtle flex items-center justify-center" aria-hidden="true"><span className="text-8xl">🎓</span></div>` — decorative placeholder for a future mascot illustration.

**Acceptance criteria:**
- [ ] `<h1>` renders the correct Thai headline.
- [ ] Form `action="/explore"` with `<input name="q">`.
- [ ] CTA `<Link>` points to `/riasec`, minimum 44 px height.
- [ ] Right column decorative placeholder renders without errors.
- [ ] Server Component (no `"use client"`).
- [ ] `npm run typecheck` and `npm run lint` pass.

**Blocked by:** TASK-002 (i18n strings)

---

### TASK-007: FeaturesSection component
**Agent:** frontend-dev  
**File(s):** `frontend/src/components/landing/FeaturesSection.tsx`  
**Spec ref:** `specs/context/personas.md §2 Persona A`  
**Description:** Create a Server Component for the "Why M6 students love KUru" section. Use `getTranslations("landing")`.

**Layout:**
- `<section>` with `<h2 className="text-2xl font-bold text-center mb-10">{t("features.heading")}</h2>`.
- `<div className="grid grid-cols-1 md:grid-cols-3 gap-6">` with three cards.

Each card (`<div className="rounded-2xl border border-surface-subtle p-6 flex flex-col gap-3">`):
- Icon badge: `<div className="w-10 h-10 rounded-full flex items-center justify-center text-xl {bgColor}">EMOJI</div>`.
  - Card 1: `bg-yellow-100` + `⚡`
  - Card 2: `bg-gray-100` + `⚙️`
  - Card 3: `bg-pink-100` + `💗`
- `<h3 className="font-bold text-lg">{t("features.card{N}.title")}</h3>`
- `<p className="text-sm text-text-secondary">{t("features.card{N}.body")}</p>`

**Acceptance criteria:**
- [ ] Section `<h2>` present with correct translation.
- [ ] Three cards render in a 3-column grid on desktop.
- [ ] Each card has icon badge, `<h3>` title, `<p>` body.
- [ ] Server Component (no `"use client"`).
- [ ] `npm run typecheck` and `npm run lint` pass.

**Blocked by:** TASK-002 (i18n strings)

---

### TASK-008: PopularProgramsSection component
**Agent:** frontend-dev  
**File(s):** `frontend/src/components/landing/PopularProgramsSection.tsx`  
**Spec ref:** `specs/context/architecture.md §2`, `specs/context/personas.md §2 Persona B`  
**Description:** Create a Server Component. **No API call** — data is a hardcoded constant. Use `getTranslations("landing")`.

Define this constant at the top of the file:
```ts
const STUB_PROGRAMS = [
  { id: "ske",  name: "วิศวกรรมคอมพิวเตอร์", faculty: "FACULTY OF ENGINEERING",
    description: "นักศึกษาเขียนโปรแกรมและทำความเข้าใจเกี่ยวกับวิศวกรรมไฟฟ้า", match: 98 },
  { id: "dmd",  name: "ดิจิทัลมีเดีย",        faculty: "ARCHITECTURE",
    description: "สร้างสรรค์และออกแบบสื่อดิจิทัลและแอนิเมชันขั้นสูง",          match: 92 },
  { id: "ba",   name: "บริหารธุรกิจ",          faculty: "BUSINESS ADMIN",
    description: "การบริหารองค์กรและความสัมพันธ์ทางธุรกิจเพื่อความสำเร็จ",       match: 85 },
  { id: "hum",  name: "อักษรศาสตร์",           faculty: "HUMANITIES",
    description: "งานค้นคว้าด้านภาษา วรรณกรรม และการสื่อสารข้ามวัฒนธรรม",       match: 79 },
] as const;
```

**Layout:**
```
<section>
  <div flex justify-between items-center mb-6>
    <div>
      <h2>{t("programs.heading")}</h2>
      <p text-sm text-text-secondary>{t("programs.subheading")}</p>
    </div>
    <Link href="/explore">{t("programs.viewAll")}</Link>
  </div>
  <div flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory>
    {STUB_PROGRAMS.map(p => <ProgramCard key={p.id} {...p} />)}
  </div>
</section>
```

Each card is an inner function `ProgramCard` (same file, not exported). Card structure:
```
<Link href={`/explore/${p.id}`} className="relative min-w-[240px] snap-start rounded-2xl border ...">
  <div className="relative">
    <!-- placeholder image area -->
    <div h-36 bg-surface-subtle rounded-t-2xl flex items-center justify-center text-4xl aria-hidden>📚</div>
    <!-- match badge -->
    <span absolute top-2 left-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded-full>
      {t("programs.match", { pct: p.match })}
    </span>
    <!-- heart button (non-functional placeholder) -->
    <button type="button" aria-label="บันทึก" onClick stopPropagation
      className="absolute top-2 right-2 ...">🤍</button>
  </div>
  <div p-4>
    <h3 font-bold>{p.name}</h3>
    <p text-sm text-text-secondary line-clamp-2>{p.description}</p>
    <p text-xs text-text-secondary mt-2>{p.faculty}</p>
  </div>
</Link>
```

Note: the heart `<button>` is a non-functional placeholder. Since the parent is a `<Link>`, nest the button inside using `e.preventDefault()` / `e.stopPropagation()` if needed — but since this section is a Server Component, the heart button itself must be a separate `"use client"` sub-component (`HeartButton.tsx` inline in the same file or as a named export). Keep the rest of the section as a Server Component.

**Acceptance criteria:**
- [ ] Four cards render from `STUB_PROGRAMS` with no fetch call.
- [ ] Horizontal scroll works on 375 px without clipping.
- [ ] Each card links to `/explore/{id}`.
- [ ] Match badge shows percentage.
- [ ] Heart button renders with `aria-label="บันทึก"` and does not trigger navigation.
- [ ] `npm run typecheck` and `npm run lint` pass.

**Blocked by:** TASK-002 (i18n strings)

---

### TASK-009: HowItWorksSection component
**Agent:** frontend-dev  
**File(s):** `frontend/src/components/landing/HowItWorksSection.tsx`  
**Spec ref:** `specs/context/personas.md §2 Persona A`  
**Description:** Create a Server Component for the four-step process. Use `getTranslations("landing")`.

Define steps as a constant:
```ts
const STEPS = [
  { n: 1, icon: "🎯", titleKey: "howItWorks.step1.title", bodyKey: "howItWorks.step1.body" },
  { n: 2, icon: "🤖", titleKey: "howItWorks.step2.title", bodyKey: "howItWorks.step2.body" },
  { n: 3, icon: "💡", titleKey: "howItWorks.step3.title", bodyKey: "howItWorks.step3.body" },
  { n: 4, icon: "✅", titleKey: "howItWorks.step4.title", bodyKey: "howItWorks.step4.body" },
] as const;
```

**Layout:**
```
<section text-center>
  <h2 text-2xl font-bold mb-2>{t("howItWorks.heading")}</h2>
  <p text-sm text-text-secondary mb-10>{t("howItWorks.subheading")}</p>
  <div className="flex flex-col md:flex-row items-start md:items-center justify-center gap-0 md:gap-0">
    {STEPS.map((step, i) => (
      <Fragment key={step.n}>
        <div className="flex flex-col items-center text-center max-w-[180px] mx-auto md:mx-0">
          <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg mb-3">
            {step.n}
          </div>
          <h3 className="font-bold text-sm mb-1">{t(step.titleKey)}</h3>
          <p className="text-xs text-text-secondary">{t(step.bodyKey)}</p>
        </div>
        {i < 3 && (
          <div className="hidden md:block h-0.5 w-12 bg-primary/20 flex-shrink-0" />
        )}
      </Fragment>
    ))}
  </div>
</section>
```

**Acceptance criteria:**
- [ ] All four steps render with correct translated title and body.
- [ ] Numbered circles use primary color.
- [ ] Connector lines visible on `md:` breakpoint between steps, hidden on mobile.
- [ ] Steps stack vertically on mobile.
- [ ] Server Component (no `"use client"`).
- [ ] `npm run typecheck` and `npm run lint` pass.

**Blocked by:** TASK-002 (i18n strings)

---

### TASK-010: CtaBannerSection component
**Agent:** frontend-dev  
**File(s):** `frontend/src/components/landing/CtaBannerSection.tsx`  
**Spec ref:** `specs/context/personas.md §2 Persona A`  
**Description:** Create a Server Component for the full-width dark-green CTA banner. Use `getTranslations("landing")`.

```tsx
<section className="rounded-2xl bg-primary px-6 py-16 text-center text-white">
  <h2 className="text-2xl md:text-3xl font-bold mb-6 leading-snug">
    {t("cta.headline")}
  </h2>
  <Link
    href="/riasec"
    className="inline-flex items-center rounded-full bg-white px-8 py-3 text-sm font-bold text-primary hover:bg-white/90 transition-colors min-h-[44px]"
  >
    {t("cta.button")}
  </Link>
</section>
```

The button uses a white background with `text-primary` to produce the white-pill-on-green look from the design. Do **not** use Shadcn `Button` here to avoid variant override complexity — use plain Tailwind classes as shown.

**Acceptance criteria:**
- [ ] Banner uses `bg-primary` background.
- [ ] Headline and button text are white and primary-on-white respectively.
- [ ] Button links to `/riasec`.
- [ ] Button minimum height 44 px (touch target).
- [ ] Renders full container width on mobile and desktop.
- [ ] Server Component (no `"use client"`).
- [ ] `npm run typecheck` and `npm run lint` pass.

**Blocked by:** TASK-002 (i18n strings)

---

### TASK-011: Landing page — replace redirect with composed page
**Agent:** frontend-dev  
**File(s):** page.tsx  
**Spec ref:** `specs/context/architecture.md §2` (server components by default)  
**Description:** Replace the current `redirect("/chat")` stub entirely. The file becomes an `async` Server Component that composes all five sections.

```tsx
import { Metadata } from "next";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import PopularProgramsSection from "@/components/landing/PopularProgramsSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import CtaBannerSection from "@/components/landing/CtaBannerSection";

export const metadata: Metadata = {
  title: "KUru - ค้นหาคณะที่ใช่สำหรับคุณ",
  description:
    "เครื่องมือแนะแนวการศึกษา AI สำหรับนักเรียน ม.6 ค้นหาคณะ KU ที่เหมาะกับคุณโดยอิงจาก RIASEC และข้อมูล มคอ.2 จริง",
};

export default async function LandingPage() {
  return (
    <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
      <div className="flex flex-col gap-20 md:gap-28 py-8">
        <HeroSection />
        <FeaturesSection />
        <PopularProgramsSection />
        <HowItWorksSection />
        <CtaBannerSection />
      </div>
    </div>
  );
}
```

Remove the `redirect` import entirely.

**Acceptance criteria:**
- [ ] `GET /` returns the landing page (HTTP 200, no redirect).
- [ ] All five sections appear in DOM order: Hero → Features → Programs → HowItWorks → CTA.
- [ ] `export const metadata` sets `title` and `description`.
- [ ] No `redirect` import remains.
- [ ] `npm run build` completes without errors.
- [ ] `npm run typecheck` passes.
- [ ] `npm run lint` passes (0 issues).

**Blocked by:** TASK-003 (MainNav home active state), TASK-005 (Footer wired in AppShell), TASK-006, TASK-007, TASK-008, TASK-009, TASK-010

---

> **Suggested branch name:** `feat/frontend/landing-page-navbar-footer`  
> **Commit prefix:** `feat(frontend): `  
> Per `specs/context/git-conventions.md §Branch naming` and `§Commit messages`.