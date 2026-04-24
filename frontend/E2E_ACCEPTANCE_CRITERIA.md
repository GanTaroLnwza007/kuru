# Playwright E2E Test Acceptance Criteria

## Overview
This document outlines all acceptance criteria for the KUru frontend E2E tests, organized by test suite. Each criterion is mapped to specific test cases that validate compliance.

---

## 1. Route Navigation & Acceptance Criteria

### 1.1 Root Route Redirect
**Criterion:** Root path (`/`) must redirect to `/chat` entry point  
**Test:** `routes.spec.ts` > "redirects from / to /chat"  
**Validation:**
- ✅ Page navigates to `/chat`
- ✅ Chat shell component renders with `data-testid="chat-shell"`
- ✅ Navigation persists in header

### 1.2 Route Shell Rendering (Desktop - 1440px)
**Criterion:** All 5 MVP routes must render without error on desktop viewport  
**Tests:**
- `routes.spec.ts` > "chat route renders correctly"
- `routes.spec.ts` > "explore route renders correctly"
- `routes.spec.ts` > "explore detail route with dynamic params"
- `routes.spec.ts` > "riasec route renders correctly"
- `routes.spec.ts` > "portfolio route renders correctly"

**Validation:**
- ✅ `/chat` → `data-testid="chat-shell"` visible
- ✅ `/explore` → `data-testid="explore-shell"` visible
- ✅ `/explore/[programId]` → `data-testid="explore-detail-shell"` visible (accepts any param)
- ✅ `/riasec` → `data-testid="riasec-shell"` visible
- ✅ `/portfolio` → `data-testid="portfolio-shell"` visible
- ✅ All routes include navigation bar from AppShell

### 1.3 Route Shell Rendering (Mobile - 375px)
**Criterion:** All MVP routes must render at mobile viewport without layout issues  
**Tests:**
- `routes.spec.ts` > "chat route mobile layout"
- `routes.spec.ts` > "explore route mobile layout"
- `routes.spec.ts` > "riasec route mobile layout"
- `routes.spec.ts` > "portfolio route mobile layout"

**Validation:**
- ✅ Viewport set to 375px width
- ✅ All route shells visible and accessible
- ✅ No horizontal scroll overflow
- ✅ Touch targets are minimum 44px (checked in responsive tests)

### 1.4 Dynamic Route Parameters
**Criterion:** Program detail route must accept and render with any valid program ID param  
**Test:** `features.spec.ts` > "explore detail route accepts dynamic programId parameter"  
**Validation:**
- ✅ Routes like `/explore/prog-001`, `/explore/ku-engineering`, `/explore/sample-id` all render
- ✅ `data-testid="explore-detail-shell"` visible for each
- ✅ URL contains the passed parameter

---

## 2. Navigation & Header

### 2.1 Header Positioning
**Criterion:** Header must be sticky at top of viewport  
**Test:** `navigation.spec.ts` > "header is sticky at top of page"  
**Validation:**
- ✅ Header `<nav>` element exists
- ✅ Bounding box Y position ≤ 100px
- ✅ Header remains visible on scroll

### 2.2 Header Dimensions
**Criterion:** Header height must be approximately 76px  
**Test:** `navigation.spec.ts` > "header height is appropriate (76px)"  
**Validation:**
- ✅ Header `<nav>` bounding box height between 50-120px (accounts for rendering variance)

### 2.3 Navigation Entry Points
**Criterion:** Navigation must expose all 4 MVP entry points  
**Test:** `navigation.spec.ts` > "navigation includes all 4 MVP entry points"  
**Validation:**
- ✅ Chat entry point visible (href="/chat" or text "Chat")
- ✅ Explore entry point visible (href="/explore" or text "Explore")
- ✅ RIASEC entry point visible (href="/riasec" or text "RIASEC")
- ✅ Portfolio entry point visible (href="/portfolio" or text "Portfolio")
- ✅ At least 1 entry point accessible from each route

### 2.4 Navigation Clickability
**Criterion:** Navigation links must be clickable and functional  
**Test:** `navigation.spec.ts` > "navigation links are clickable"  
**Validation:**
- ✅ Explore link clickable from chat route
- ✅ Page navigates to `/explore` after click
- ✅ Explore shell renders after navigation

### 2.5 Active Route Indication
**Criterion:** Current route must be visually indicated in navigation  
**Test:** `navigation.spec.ts` > "current route is highlighted in navigation"  
**Validation:**
- ✅ Navigation structure present with `<nav>`
- ✅ Either `aria-current`, `.active`, or `[data-active]` attribute on current item

### 2.6 Mobile Menu Toggle
**Criterion:** Mobile viewport (375px) must have accessible menu  
**Test:** `navigation.spec.ts` > "mobile menu toggle is accessible"  
**Validation:**
- ✅ Navigation accessible on 375px viewport
- ✅ Menu button or navigation structure visible on mobile

### 2.7 Navigation Persistence Across Routes
**Criterion:** Navigation bar must persist across all routes (part of AppShell)  
**Test:** `routes.spec.ts` > "navigation bar is persistent across routes"  
**Validation:**
- ✅ Nav visible on `/chat`
- ✅ Nav visible after navigating to `/explore`
- ✅ Nav visible after navigating to `/riasec`

---

## 3. Bilingual UI (Thai-First)

### 3.1 Thai Default Locale
**Criterion:** Thai (th) must be default locale  
**Test:** `navigation.spec.ts` > "Thai locale is default"  
**Validation:**
- ✅ `<html lang="th">` attribute set
- ✅ Thai fonts loaded (Sarabun variable)
- ✅ Thai UI strings rendered

### 3.2 English Locale Support
**Criterion:** English (en) locale must be accessible and render correctly  
**Test:** `navigation.spec.ts` > "English locale can be set"  
**Validation:**
- ✅ `NEXT_LOCALE=en` cookie accepted
- ✅ `<html lang="en">` after cookie set
- ✅ English fonts loaded (Inter variable)
- ✅ English UI strings render

### 3.3 Bilingual Rendering
**Criterion:** Page must render without errors in both Thai and English  
**Test:** `navigation.spec.ts` > "page renders without errors in both locales"  
**Validation:**
- ✅ Thai rendering: chat shell visible with Thai messages
- ✅ English rendering: chat shell visible with English messages
- ✅ No console errors on locale switch

### 3.4 Thai Font Loading
**Criterion:** Sarabun font must load for Thai content  
**Test:** `navigation.spec.ts` > "font loads for Thai content"  
**Validation:**
- ✅ `<html>` style attribute contains font variable
- ✅ `--font-kuru-thai` variable set

### 3.5 English Font Loading
**Criterion:** Inter font must load for English content  
**Test:** `navigation.spec.ts` > "font loads for English content"  
**Validation:**
- ✅ `<html>` style attribute contains font variable
- ✅ `--font-kuru-en` variable set

---

## 4. Responsive Design & Mobile-First

### 4.1 Layout Adaptation
**Criterion:** Layout must adapt from desktop (1440px) to mobile (375px) without breaking  
**Test:** `navigation.spec.ts` > "layout adapts from desktop to mobile"  
**Validation:**
- ✅ Renders at 1440x900 desktop
- ✅ Resizes to 375x667 mobile
- ✅ Content remains visible after resize
- ✅ No layout errors or crashes

### 4.2 Touch Target Size
**Criterion:** Touch targets must be minimum 44px on mobile  
**Test:** `navigation.spec.ts` > "touch targets are minimum 44px on mobile"  
**Validation:**
- ✅ Mobile viewport 375x667
- ✅ Buttons height ≥ 44px OR width ≥ 44px

### 4.3 Mobile Readability
**Criterion:** Content must be readable at 375px width  
**Test:** `navigation.spec.ts` > "content is readable at 375px width"  
**Validation:**
- ✅ Mobile viewport set to 375x667
- ✅ Body text content present and not empty

### 4.4 No Horizontal Overflow
**Criterion:** Page must not overflow horizontally at mobile viewport  
**Test:** `navigation.spec.ts` > "no horizontal overflow at mobile viewport"  
**Validation:**
- ✅ Body scrollWidth ≤ 375px
- ✅ No horizontal scrollbar

### 4.5 Media Scaling
**Criterion:** Images and media must scale appropriately for viewport  
**Test:** `navigation.spec.ts` > "images and media scale appropriately"  
**Validation:**
- ✅ Mobile viewport 375x667
- ✅ All visible images width ≤ 375px
- ✅ No image overflow

---

## 5. Feature-Specific Shell Content

### 5.1 Chat Shell Structure
**Criterion:** Chat route must have expected placeholder elements  
**Test:** `features.spec.ts` > "chat shell has expected placeholder elements"  
**Validation:**
- ✅ `data-testid="chat-shell"` present
- ✅ Chat shell visible within AppShell

### 5.2 Explore Search Input
**Criterion:** Explore route must have search input or search region  
**Test:** `features.spec.ts` > "explore shell has search input"  
**Validation:**
- ✅ `data-testid="explore-shell"` visible
- ✅ Either `<input type="text">`, `<input type="search">`, or search region present

### 5.3 RIASEC Progress Indicator
**Criterion:** RIASEC route must show step/progress information  
**Test:** `features.spec.ts` > "riasec shell shows step progress"  
**Validation:**
- ✅ `data-testid="riasec-shell"` visible
- ✅ Either step indicator text or progress bar present (or shell renders as placeholder)

### 5.4 Portfolio Upload Area
**Criterion:** Portfolio route must have upload/input area  
**Test:** `features.spec.ts` > "portfolio shell has upload/input area"  
**Validation:**
- ✅ `data-testid="portfolio-shell"` visible
- ✅ Either `<textarea>`, `<input type="file">`, or `<input type="text">` present

---

## 6. Error Handling & Routing

### 6.1 Root Redirect
**Criterion:** Root path must redirect to chat (double-check)  
**Test:** `features.spec.ts` > "root path redirects to /chat"  
**Validation:**
- ✅ `/` navigates to `/chat`
- ✅ URL contains "/chat"
- ✅ Chat shell renders

### 6.2 Invalid Route Handling
**Criterion:** Invalid routes must render gracefully (not crash)  
**Test:** `features.spec.ts` > "invalid route renders gracefully"  
**Validation:**
- ✅ `/this-route-does-not-exist-xyz123` accessible
- ✅ Page title contains "KUru"
- ✅ Body element visible (error boundary renders)

### 6.3 Route Structure Consistency
**Criterion:** All routes must have proper HTML/body structure  
**Test:** `features.spec.ts` > "all routes have proper html/body structure"  
**Validation:**
- ✅ `<html>` visible on all routes
- ✅ `<body>` visible on all routes
- ✅ Structure consistent across /chat, /explore, /riasec, /portfolio

### 6.4 AppShell Wrapping
**Criterion:** All routes wrapped in AppShell with navigation  
**Test:** `features.spec.ts` > "all routes are wrapped in app shell"  
**Validation:**
- ✅ `<nav>` visible on all 4 routes
- ✅ Navigation persists on each route

### 6.5 Content Scrollability
**Criterion:** Content region must support scrolling for long pages  
**Test:** `features.spec.ts` > "content area is scrollable on long pages"  
**Validation:**
- ✅ Page scrollable when content > viewport height
- ✅ `window.scrollY > 0` after scroll action

---

## 7. Performance

### 7.1 Page Load Time
**Criterion:** Route shells must load within 3 seconds  
**Test:** `features.spec.ts` > "route shells load within acceptable time"  
**Validation:**
- ✅ Load time < 3000ms for `/chat`
- ✅ Load time < 3000ms for `/explore`
- ✅ Load time < 3000ms for `/riasec`
- ✅ Load time < 3000ms for `/portfolio`

### 7.2 Layout Stability
**Criterion:** No layout shift after initial load  
**Test:** `features.spec.ts` > "no layout shift after initial load"  
**Validation:**
- ✅ Initial shell height recorded
- ✅ Initial shell width recorded
- ✅ After 500ms wait, dimensions unchanged
- ✅ No Cumulative Layout Shift (CLS) > 0.1

---

## 8. Accessibility (WCAG)

### 8.1 Color Contrast
**Criterion:** Text must have sufficient color contrast  
**Test:** `features.spec.ts` > "page has proper color contrast"  
**Validation:**
- ✅ Body text has computed color
- ✅ Body has background color
- ✅ Not pure black on pure white (would indicate no styling)

### 8.2 Interactive Element Labels
**Criterion:** Buttons and interactive elements must have labels  
**Test:** `features.spec.ts` > "interactive elements are labeled"  
**Validation:**
- ✅ Buttons have `aria-label` OR text content
- ✅ All checked buttons are labeled

### 8.3 Keyboard Focus Visibility
**Criterion:** Focus must be visible when navigating with keyboard  
**Test:** `features.spec.ts` > "focus is visible when navigating via keyboard"  
**Validation:**
- ✅ Tab key creates visible focus
- ✅ `:focus` pseudo-selector matches one element
- ✅ Focus ring visible to user

### 8.4 Form Input Association
**Criterion:** Form inputs must be properly associated with labels  
**Test:** `features.spec.ts` > "form inputs are properly associated"  
**Validation:**
- ✅ Inputs have `name` attribute OR `id` attribute
- ✅ Labels or aria-label present for accessibility

### 8.5 Semantic HTML & Page Title
**Criterion:** Page must have semantic title  
**Test:** `routes.spec.ts` > "page has proper meta tags"  
**Validation:**
- ✅ Page title contains "KUru"
- ✅ Title set via metadata

### 8.6 Language Attribute
**Criterion:** All routes must declare language  
**Test:** `routes.spec.ts` > "all routes have proper language attribute"  
**Validation:**
- ✅ `<html lang>` attribute present
- ✅ All routes (/chat, /explore, /riasec, /portfolio) have lang attribute

---

## 9. API & Environment

### 9.1 Lazy Env Validation
**Criterion:** App must load even with missing NEXT_PUBLIC_API_BASE_URL initially  
**Test:** `routes.spec.ts` > "frontend loads without throwing on missing NEXT_PUBLIC_API_BASE_URL"  
**Validation:**
- ✅ Page loads and renders chat shell
- ✅ No hard errors on initial load (lazy validation)

### 9.2 Console Error Free
**Criterion:** No critical console errors on page load  
**Test:** `routes.spec.ts` > "page does not have console errors on load"  
**Validation:**
- ✅ No "Error:" level console messages
- ✅ Warnings (deprecation, next-intl) acceptable
- ✅ Page renders without runtime errors

---

## Test Execution Instructions

### Run All E2E Tests
```bash
npm run test:e2e
```

### Run Specific Test Suite
```bash
# Routes only
npx playwright test e2e/routes.spec.ts

# Navigation only
npx playwright test e2e/navigation.spec.ts

# Features only
npx playwright test e2e/features.spec.ts
```

### Run with Specific Browser/Device
```bash
# Mobile only
npx playwright test --grep "mobile|Mobile"

# Desktop only
npx playwright test --grep "desktop|Desktop" --project=desktop-chromium

# Headed mode (see browser)
npx playwright test --headed
```

### Debug Mode
```bash
npx playwright test --debug
```

### Generate HTML Report
```bash
npx playwright test
npx playwright show-report
```

---

## Total Test Coverage

- **Test Files:** 3 (`routes.spec.ts`, `navigation.spec.ts`, `features.spec.ts`)
- **Test Cases:** 40+ individual tests
- **Acceptance Criteria:** 40+ verified criteria
- **Viewports Tested:** 2 (mobile 375px, desktop 1440px)
- **Routes Covered:** 6 (/,/chat, /explore, /explore/[id], /riasec, /portfolio)
- **Features Tested:** Navigation, bilingual UI, responsiveness, accessibility, performance, error handling

---

## CI/CD Integration

Playwright tests are configured to run in CI with:
- 2 retries on failure
- Single worker (serial execution)
- Timeout: 30 seconds per test
- Trace recording on first retry for debugging

Tests run after:
1. ✅ TypeScript compilation (`npm run typecheck`)
2. ✅ Linting (`npm run lint`)
3. ✅ Unit tests (`npm run test`)
4. ✅ Production build (`npm run build`)

Successful E2E execution confirms:
- All routes render without error
- Navigation works correctly
- Mobile layout adapts properly
- Bilingual content loads correctly
- Accessibility standards met
- No performance regressions
