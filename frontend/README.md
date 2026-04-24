# KUru Frontend

Next.js App Router UI for KUru — Thai-first bilingual chat interface, RIASEC adaptive test, Program Explorer, Portfolio Coach, and all user-facing components.

## Quick Start

### Prerequisites
- Node.js 18+ and npm/pnpm
- Backend API running at `http://localhost:8000/api/v1`

### First Time Setup

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Set the backend API base URL in .env.local
# NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
```

### Development

```bash
# Start dev server on http://localhost:3000
npm run dev

# Run all quality checks
npm run typecheck   # TypeScript strict mode
npm run lint        # ESLint
npm run test        # Vitest unit tests
npm run test:watch  # Watch mode for tests

# Build for production
npm run build
npm run start        # Start production server
```

## Testing

```bash
# Unit tests (Vitest + jsdom)
npm run test
npm run test:watch

# E2E tests (Playwright)
# Set PLAYWRIGHT_BASE_URL before running if not using default http://127.0.0.1:3000
npm run test:e2e

# Test with specific viewport
# - Mobile: 375px (iPhone 12)
# - Desktop: 1440px
```

## Architecture

### Tech Stack
- **Framework:** Next.js 16+ with App Router (server components by default)
- **UI:** Shadcn/UI + Tailwind CSS v4 with CSS variables
- **State:** Zustand for cross-component state (chat, RIASEC session)
- **Data Fetching:** `fetch` in server components; React Query for polling (Portfolio Coach)
- **Forms:** React Hook Form + Zod validation
- **i18n:** next-intl with Thai as default locale
- **Testing:** Vitest (unit), Playwright (E2E)
- **TypeScript:** Strict mode (`"strict": true, "noImplicitAny": true`)

### Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── (chat)/page.tsx              ← RAG Chatbot
│   │   ├── (explore)/                   ← Program Explorer
│   │   ├── (riasec)/page.tsx            ← RIASEC adaptive test
│   │   ├── (portfolio)/page.tsx         ← Portfolio Coach
│   │   ├── layout.tsx                   ← Root layout (Thai-first)
│   │   ├── providers.tsx                ← Query + i18n providers
│   │   └── globals.css                  ← CSS variables and base styles
│   ├── components/
│   │   ├── layout/                      ← AppShell, TopNavBar, MainNav
│   │   ├── chat/                        ← Chat UI components
│   │   ├── riasec/                      ← RIASEC test UI
│   │   ├── programs/                    ← Program Explorer UI
│   │   ├── portfolio/                   ← Portfolio Coach UI
│   │   └── ui/                          ← Shadcn components
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.ts                ← Typed fetch wrapper (7 endpoints)
│   │   │   ├── types.ts                 ← KuruResponse envelope schemas
│   │   │   └── schemas.generated.ts     ← Endpoint-specific Zod schemas
│   │   ├── env.ts                       ← Lazy env validation
│   │   ├── store.ts                     ← Zustand store (chat + RIASEC slices)
│   │   └── cn.ts                        ← Classname utility
│   ├── i18n/
│   │   ├── routing.ts                   ← Locale config (Thai default)
│   │   └── request.ts                   ← Message loader (server-side)
│   ├── messages/
│   │   ├── th.json                      ← Thai UI strings
│   │   └── en.json                      ← English UI strings
│   └── test/
│       ├── setup.ts                     ← Vitest setup (jest-dom)
│       └── render-utils.tsx             ← renderWithProviders helper
├── public/                              ← Static assets
├── playwright.config.ts                 ← E2E config (375px + 1440px)
├── vitest.config.ts                     ← Unit test config
├── tsconfig.json                        ← Strict TypeScript
├── next.config.mjs                      ← Next.js + i18n plugin
├── tailwind.config.ts                   ← Tailwind with theme tokens
└── package.json                         ← Dependencies and scripts
```

## API Integration

### Typed API Client

The `apiClient` in [src/lib/api/client.ts](src/lib/api/client.ts) provides typed methods for all backend endpoints:

```typescript
import { apiClient } from "@/lib/api/client";

// Chat
const chatResponse = await apiClient.chat({ message: "...", session_id: "..." });

// RIASEC
const session = await apiClient.startRiasec();
const answer = await apiClient.answerRiasec({ step: 1, answer: "A" });

// Programs
const results = await apiClient.searchPrograms({ query: "..." });
const detail = await apiClient.getProgramDetail({ programId: "..." });

// Portfolio
const analysis = await apiClient.analyzePortfolio({ portfolio: "..." });
const status = await apiClient.getPortfolioStatus({ job_id: "..." });
```

All responses are typed and validated against Zod schemas. Errors are normalized into `ApiClientError` with status, code, and details.

### Response Envelope

All API responses follow the KUru envelope pattern:

```typescript
type KuruResponse<T> = {
  data: T | null;
  sources: SourceReference[];  // For citation rendering
  error: ApiError | null;
};
```

## Internationalization (i18n)

- **Default locale:** Thai (th)
- **Supported locales:** Thai, English (en)
- **Locale detection:** Cookie-based (not in URL)
- **UI strings:** Next-intl message catalogs in [src/messages/](src/messages/)
- **Language toggle:** Top navigation bar

**Adding new strings:**
1. Add key to [src/messages/th.json](src/messages/th.json)
2. Add English equivalent to [src/messages/en.json](src/messages/en.json)
3. Import and use with `useTranslations()` in client components or `getTranslations()` in server components

## State Management (Zustand)

Global app state is in [src/lib/store.ts](src/lib/store.ts):

```typescript
import { useAppStore } from "@/lib/store";

// Chat slice
const { messages, addMessage, clearMessages } = useAppStore();

// RIASEC slice
const { sessionId, currentStep, answers, result, setStep, setAnswer } = useAppStore();
```

## Design System

### CSS Variables
Colors, spacing, typography, and status states are defined in [src/app/globals.css](src/app/globals.css) as CSS variables:

```css
--kuru-primary: #2563eb;
--kuru-secondary: #1e40af;
--kuru-status-success: #10b981;
--kuru-status-warning: #f59e0b;
--kuru-status-danger: #ef4444;
--navbar-height: 76px;
```

### Tailwind
[tailwind.config.ts](tailwind.config.ts) extends the base theme with KUru tokens. Use Tailwind utilities with semantic class names:

```html
<button class="bg-primary text-inverse px-4 py-touch rounded-lg">Click me</button>
```

## Git Workflow

Follow commit message conventions from [../../git-conventions.md](../../git-conventions.md):

```bash
git commit -m "feat(frontend): chat bubble with citation footnotes

- Implement ChatBubble component with typed message rendering
- Add CitationFootnote expandable component for sources[]
- Render footnote numbers inline, full references in expandable panel

See specs/tasks/tasks-frontend-setup.md TASK-022"
```

## Known Issues

- **next-intl middleware deprecation:** Warning "Please use 'proxy' instead" (non-blocking, future migration path)
- **TASK-032 blocked:** OpenAPI schema generation awaits stable backend contract (BACKEND-CONTRACT-001)

## Useful Commands

```bash
# Generate new Shadcn component
npx shadcn-ui@latest add button

# Check unused dependencies
npm ls --depth=0

# Update all dependencies safely
npm update

# Audit for security issues
npm audit
npm audit fix

# Type-check without emitting
npm run typecheck

# Format code (ESLint)
npm run lint -- --fix
```

## Support & Documentation

- [Architecture Specification](../../specs/context/architecture.md)
- [Personas & UX Guidelines](../../specs/context/personas.md)
- [Task Breakdown](../../specs/tasks/tasks-frontend-setup.md)
- [RIASEC Logic](../../specs/context/riasec-logic.md)

---

**Frontend Dev Mode:** See `/memories/repo/` for codebase patterns and conventions.
