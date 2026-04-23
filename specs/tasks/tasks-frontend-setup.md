# Tasks: Frontend Setup Foundation

## Overview
Set up a production-ready Next.js frontend foundation for KUru with a strong design system, bilingual support, API integration scaffolding, and fast developer workflows. This plan is governed primarily by architecture.md for stack and API constraints, personas.md for mobile-first Thai-first UX direction, KUru.md for feature scope, and specs/context/system_architecture.md for MVP stack consistency.

## Dependencies
- External dependency for final typed API generation: stable backend OpenAPI contract for /api/v1.
- Internal sequencing dependency: TASK-001 must complete before all frontend file-level setup tasks.

## Task list

### TASK-001: Initialize Next.js Frontend Workspace
**Agent:** frontend-dev  
**File(s):** frontend/package.json  
**Spec ref:** architecture.md §2, KUru.md §9  
**Description:** Scaffold frontend workspace using Next.js App Router with TypeScript and Tailwind; ensure package scripts support dev, build, lint, typecheck, and test workflows.  
**Acceptance criteria:**
- [ ] Frontend workspace boots with Next.js App Router and TypeScript.
- [ ] Script set includes dev/build/start/lint/typecheck/test.
**Blocked by:** None

### TASK-002: Configure TypeScript Strictness and Aliases
**Agent:** frontend-dev  
**File(s):** frontend/tsconfig.json  
**Spec ref:** architecture.md §2  
**Description:** Enable strict TypeScript settings and stable import aliases for scalable development.  
**Acceptance criteria:**
- [ ] Strict mode and no-implicit-any style checks are active.
- [ ] Path aliases are defined and used consistently.
**Blocked by:** TASK-001

### TASK-003: Configure Next.js Runtime Settings
**Agent:** frontend-dev  
**File(s):** frontend/next.config.mjs  
**Spec ref:** architecture.md §2, architecture.md §5  
**Description:** Add baseline Next.js config for App Router behavior and environment-aware API communication.  
**Acceptance criteria:**
- [ ] Runtime config supports App Router defaults without pages directory usage.
- [ ] Config allows environment-driven API base usage pattern.
**Blocked by:** TASK-001

### TASK-004: Add Environment Template
**Agent:** frontend-dev  
**File(s):** frontend/.env.example  
**Spec ref:** architecture.md §6  
**Description:** Define frontend environment variables template including public API base URL and local development notes.  
**Acceptance criteria:**
- [ ] Template includes NEXT_PUBLIC_API_BASE_URL.
- [ ] No secrets or private keys are included.
**Blocked by:** TASK-001

### TASK-005: Add Runtime Env Validation Module
**Agent:** frontend-dev  
**File(s):** frontend/src/lib/env.ts  
**Spec ref:** architecture.md §6, architecture.md §5  
**Description:** Implement typed env parsing and validation to fail fast when required frontend env vars are missing.  
**Acceptance criteria:**
- [ ] Missing required env vars fail at startup with clear error messages.
- [ ] API base URL is exported in typed form for app-wide usage.
**Blocked by:** TASK-004

### TASK-006: Configure Tailwind Theme Foundation
**Agent:** frontend-dev  
**File(s):** frontend/tailwind.config.ts  
**Spec ref:** architecture.md §2, personas.md §1  
**Description:** Set Tailwind content paths and extensible design tokens for color, spacing, typography, and states.  
**Acceptance criteria:**
- [ ] Tailwind scans all app/components/lib directories.
- [ ] Theme extension includes reusable semantic tokens for KUru UI.
**Blocked by:** TASK-001

### TASK-007: Define Global Design Tokens and Base Styles
**Agent:** frontend-dev  
**File(s):** frontend/src/app/globals.css  
**Spec ref:** personas.md §1, personas.md §5  
**Description:** Add CSS variables, baseline typography, spacing scale, and accessibility-friendly defaults for mobile-first UI, including navbar-specific tokens derived from the approved design.  
**Acceptance criteria:**
- [ ] Global token variables exist for primary, secondary, surface, text, and status colors.
- [ ] Navbar tokens exist for header height, translucent background, blur strength, and shadow.
- [ ] Base styles support readable typography and touch-friendly spacing on 375px width.
**Blocked by:** TASK-006

### TASK-008: Set Root Layout for Thai-First UX
**Agent:** frontend-dev  
**File(s):** frontend/src/app/layout.tsx  
**Spec ref:** personas.md §1, architecture.md §2  
**Description:** Configure root layout metadata, language baseline, and foundational app shell mounting points.  
**Acceptance criteria:**
- [ ] Layout defaults to Thai-first user experience with bilingual readiness.
- [ ] Root structure supports shared header/navigation and provider mounting.
**Blocked by:** TASK-007

### TASK-009: Initialize Shadcn Registry Configuration
**Agent:** frontend-dev  
**File(s):** frontend/components.json  
**Spec ref:** architecture.md §2, specs/context/system_architecture.md §Technology Stack  
**Description:** Configure Shadcn generation paths and styling integration to keep components consistent and scalable.  
**Acceptance criteria:**
- [ ] Component generation paths match frontend folder architecture.
- [ ] Tailwind and alias settings align with existing config.
**Blocked by:** TASK-006

### TASK-010: Add Shared Classname Utility
**Agent:** frontend-dev  
**File(s):** frontend/src/lib/cn.ts  
**Spec ref:** architecture.md §2  
**Description:** Add utility for class composition to standardize style composition across components.  
**Acceptance criteria:**
- [ ] Utility handles conditional class merging.
- [ ] Utility is imported by at least one layout or UI component.
**Blocked by:** TASK-009

### TASK-033: Implement TopNavBar Container Component
**Agent:** frontend-dev  
**File(s):** frontend/src/components/layout/TopNavBar.tsx  
**Spec ref:** architecture.md §2, personas.md §1  
**Description:** Create a dedicated TopNavBar wrapper component matching the design structure: relative container, vertical flex alignment, centered content region, and mount point for navigation content.  
**Acceptance criteria:**
- [ ] Container uses a top header height of 76px.
- [ ] Desktop layout supports a centered content region with 1280px max width.
- [ ] Mobile behavior remains full-width and touch-friendly.
**Blocked by:** TASK-007

### TASK-034: Add TopNavBar Visual Style Layer with Blur Fallback
**Agent:** frontend-dev  
**File(s):** frontend/src/components/layout/TopNavBar.module.css  
**Spec ref:** architecture.md §2, personas.md §1  
**Description:** Implement the exact visual treatment for the header: semi-transparent white surface, soft shadow, and blur background, with graceful fallback for limited backdrop-filter support.  
**Acceptance criteria:**
- [ ] Background is rgba(255, 255, 255, 0.8).
- [ ] Shadow is 0px 12px 32px rgba(25, 28, 27, 0.04).
- [ ] Backdrop blur uses 6px with fallback behavior when unsupported.
**Blocked by:** TASK-033

### TASK-011: Integrate TopNavBar into App Shell
**Agent:** frontend-dev  
**File(s):** frontend/src/components/layout/AppShell.tsx  
**Spec ref:** KUru.md §4, personas.md §1  
**Description:** Mount TopNavBar once at the top of the shared shell and wire layout slots so all route pages inherit the same header structure.  
**Acceptance criteria:**
- [ ] App shell renders TopNavBar consistently across route groups.
- [ ] Header area preserves desktop and mobile spacing without duplicated layout logic.
**Blocked by:** TASK-008, TASK-034

### TASK-012: Create Shared Navigation Component
**Agent:** frontend-dev  
**File(s):** frontend/src/components/layout/MainNav.tsx  
**Spec ref:** KUru.md §4, personas.md §1  
**Description:** Implement navigation content to match the approved header composition: left brand area, centered primary links, and right utility actions (language, profile, menu).  
**Acceptance criteria:**
- [ ] Navigation exposes all MVP entry points: Chat, Explore, RIASEC, and Portfolio.
- [ ] Desktop presents left/center/right grouping consistent with the design.
- [ ] Active item state includes a clear underline indicator.
- [ ] Mobile keeps utility actions accessible and supports menu-first navigation behavior.
**Blocked by:** TASK-011

### TASK-013: Configure i18n Routing
**Agent:** frontend-dev  
**File(s):** frontend/src/i18n/routing.ts  
**Spec ref:** architecture.md §5, personas.md §1  
**Description:** Define locale routing strategy with Thai as default and English as secondary locale.  
**Acceptance criteria:**
- [ ] Locale config includes Thai default and English fallback.
- [ ] Routing config is reusable by middleware and i18n requests.
**Blocked by:** TASK-001

### TASK-014: Configure i18n Request Loader
**Agent:** frontend-dev  
**File(s):** frontend/src/i18n/request.ts  
**Spec ref:** architecture.md §5  
**Description:** Implement message loading strategy per locale for App Router pages and components.  
**Acceptance criteria:**
- [ ] Locale message files are loaded based on active locale.
- [ ] Missing locale falls back safely without runtime crash.
**Blocked by:** TASK-013

### TASK-015: Add Locale Middleware
**Agent:** frontend-dev  
**File(s):** frontend/src/middleware.ts  
**Spec ref:** architecture.md §5, personas.md §1  
**Description:** Add middleware to negotiate locale and enforce route consistency for bilingual UX.  
**Acceptance criteria:**
- [ ] Default locale behavior is deterministic and Thai-first.
- [ ] Middleware does not interfere with API route handling.
**Blocked by:** TASK-013

### TASK-016: Seed Thai Message Catalog
**Agent:** frontend-dev  
**File(s):** frontend/src/messages/th.json  
**Spec ref:** personas.md §1, personas.md §3  
**Description:** Add initial Thai UI strings for global navigation, loading, and empty states.  
**Acceptance criteria:**
- [ ] Core shell and feature-entry labels are present in Thai.
- [ ] Tone aligns with student-friendly language guidance.
**Blocked by:** TASK-014

### TASK-017: Seed English Message Catalog
**Agent:** frontend-dev  
**File(s):** frontend/src/messages/en.json  
**Spec ref:** architecture.md §5, personas.md §3  
**Description:** Add English equivalents for initial UI strings used in shell and feature-entry screens.  
**Acceptance criteria:**
- [ ] English catalog mirrors Thai key structure.
- [ ] Missing keys are tracked and fail gracefully.
**Blocked by:** TASK-014

### TASK-018: Define API Envelope Types
**Agent:** frontend-dev  
**File(s):** frontend/src/lib/api/types.ts  
**Spec ref:** architecture.md §5  
**Description:** Create typed response envelope models for data, sources, and error as frontend contract baseline.  
**Acceptance criteria:**
- [ ] Types represent KUru response envelope with sources and error.
- [ ] Types are imported by API client module.
**Blocked by:** TASK-005

### TASK-019: Implement API Client Wrapper
**Agent:** frontend-dev  
**File(s):** frontend/src/lib/api/client.ts  
**Spec ref:** architecture.md §5, architecture.md §6  
**Description:** Build centralized fetch wrapper for API base URL, envelope parsing, and error normalization.  
**Acceptance criteria:**
- [ ] Wrapper reads API base URL from validated env module.
- [ ] Wrapper normalizes network and API envelope errors.
**Blocked by:** TASK-018

### TASK-020: Initialize Zustand Store
**Agent:** frontend-dev  
**File(s):** frontend/src/lib/store.ts  
**Spec ref:** architecture.md §2, KUru.md §4  
**Description:** Create initial store slices for chat history and RIASEC in-progress session state.  
**Acceptance criteria:**
- [ ] Store contains isolated slices for chat and RIASEC data.
- [ ] Store is type-safe and importable by client components.
**Blocked by:** TASK-002

### TASK-021: Compose App Providers
**Agent:** frontend-dev  
**File(s):** frontend/src/app/providers.tsx  
**Spec ref:** architecture.md §4, architecture.md §5  
**Description:** Add centralized providers for query/state/i18n usage needed by asynchronous frontend flows.  
**Acceptance criteria:**
- [ ] Providers support async polling flows for long-running analysis jobs.
- [ ] Providers can be mounted once at app root.
**Blocked by:** TASK-019

### TASK-022: Scaffold Chat Route Shell
**Agent:** frontend-dev  
**File(s):** frontend/src/app/(chat)/page.tsx  
**Spec ref:** KUru.md §4.1, architecture.md §4  
**Description:** Create route-level shell page for chatbot feature with placeholder states and integration hooks.  
**Acceptance criteria:**
- [ ] Chat route renders within shared app shell.
- [ ] Placeholder UI includes loading and empty-state sections.
**Blocked by:** TASK-012

### TASK-023: Scaffold Program Explorer Route Shell
**Agent:** frontend-dev  
**File(s):** frontend/src/app/(explore)/page.tsx  
**Spec ref:** KUru.md §4.3, architecture.md §4  
**Description:** Create route shell for program search and listing with placeholders for semantic results.  
**Acceptance criteria:**
- [ ] Explorer route renders search input and result container placeholders.
- [ ] Layout supports fast-scanning list behavior for mobile users.
**Blocked by:** TASK-012

### TASK-024: Scaffold Program Detail Route Shell
**Agent:** frontend-dev  
**File(s):** frontend/src/app/(explore)/[programId]/page.tsx  
**Spec ref:** KUru.md §4.3, architecture.md §4  
**Description:** Create dynamic program detail route shell including placeholders for vibe timeline and related sections.  
**Acceptance criteria:**
- [ ] Dynamic route resolves programId parameter.
- [ ] Placeholder sections exist for detail overview and year-by-year vibe.
**Blocked by:** TASK-023

### TASK-025: Scaffold RIASEC Route Shell
**Agent:** frontend-dev  
**File(s):** frontend/src/app/(riasec)/page.tsx  
**Spec ref:** KUru.md §4.2, architecture.md §4  
**Description:** Create route shell for adaptive RIASEC flow with step container and progress placeholder.  
**Acceptance criteria:**
- [ ] Route includes clear step-based scaffold structure.
- [ ] Shell supports state-driven question rendering in later tasks.
**Blocked by:** TASK-020

### TASK-026: Scaffold Portfolio Route Shell
**Agent:** frontend-dev  
**File(s):** frontend/src/app/(portfolio)/page.tsx  
**Spec ref:** architecture.md §4, personas.md §2 Persona C  
**Description:** Create route shell for portfolio analysis flow with submit and status placeholders.  
**Acceptance criteria:**
- [ ] Route includes form placeholder and async status region.
- [ ] Shell is compatible with polling-based result updates.
**Blocked by:** TASK-021

### TASK-027: Configure Vitest
**Agent:** frontend-dev  
**File(s):** frontend/vitest.config.ts  
**Spec ref:** KUru.md §10  
**Description:** Add unit test runner config for frontend with jsdom environment and path alias support.  
**Acceptance criteria:**
- [ ] Test runner executes app/component tests locally.
- [ ] Alias resolution works in tests.
**Blocked by:** TASK-002

### TASK-028: Add Frontend Test Setup
**Agent:** frontend-dev  
**File(s):** frontend/src/test/setup.ts  
**Spec ref:** KUru.md §10, personas.md §1  
**Description:** Add shared test setup for DOM matchers and common render wrappers.  
**Acceptance criteria:**
- [ ] Setup file is auto-loaded by test runner.
- [ ] Shared wrappers are available for route/component smoke tests.
**Blocked by:** TASK-027

### TASK-029: Add Route Shell Smoke Test Suite
**Agent:** qa  
**File(s):** frontend/src/app/__tests__/route-shells.test.tsx  
**Spec ref:** KUru.md §4, KUru.md §10  
**Description:** Validate all MVP route shells render and expose expected baseline UI regions.  
**Acceptance criteria:**
- [ ] Test covers chat, explore, riasec, and portfolio route shells.
- [ ] Test suite passes in local CI command path.
**Blocked by:** TASK-022, TASK-023, TASK-025, TASK-026, TASK-028

### TASK-030: Configure Playwright for Mobile-First E2E
**Agent:** qa  
**File(s):** frontend/playwright.config.ts  
**Spec ref:** personas.md §1, KUru.md §10  
**Description:** Configure E2E runner with 375px baseline and desktop secondary profile for layout regression coverage.  
**Acceptance criteria:**
- [ ] Config includes at least one 375px viewport project.
- [ ] Config supports local and CI execution.
**Blocked by:** TASK-001

### TASK-031: Add Frontend Onboarding Guide
**Agent:** frontend-dev  
**File(s):** frontend/README.md  
**Spec ref:** architecture.md §2, architecture.md §6, git-conventions.md §Branch naming  
**Description:** Document project structure, local setup commands, environment setup, and daily development flow.  
**Acceptance criteria:**
- [ ] Guide includes first-run instructions and troubleshooting checklist.
- [ ] Guide includes branch naming and commit linkage to task IDs.
**Blocked by:** TASK-001, TASK-004

### TASK-032: Generate Endpoint-Specific API Schemas from OpenAPI
**Agent:** frontend-dev  
**File(s):** frontend/src/lib/api/schemas.generated.ts  
**Spec ref:** architecture.md §5  
**Description:** Generate typed endpoint schemas based on backend OpenAPI so feature modules can avoid hand-written request/response drift.  
**Acceptance criteria:**
- [ ] Generated schemas cover chat, riasec, programs, and portfolio endpoints.
- [ ] API client uses generated endpoint types in method signatures.
**Blocked by:** BACKEND-CONTRACT-001 (stable OpenAPI for /api/v1 not yet published)

Natural next steps:
1. Confirm this task breakdown and I will adapt it into a shorter MVP-first subset (first 10 tasks) for immediate execution.
2. Confirm whether Storybook should be included as an additional setup track; if yes, I will append atomic Storybook tasks as TASK-033 onward.