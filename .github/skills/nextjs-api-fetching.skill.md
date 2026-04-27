---
description: How to fetch KUru API data in a Next.js App Router server component or client component. Use this skill whenever a task requires wiring a route page or component to a backend endpoint.
---

# Skill: Next.js API data fetching

KUru's frontend uses different fetching patterns depending on whether the component is a server component or a client component. Choose the right pattern before writing any code.

## Decision rule

| Situation | Pattern |
|---|---|
| Page-level data, no interactivity needed | Server component fetch |
| Needs user interaction before fetching (e.g. search box, form submit) | Client component + React Query |
| Long-running async job (portfolio analysis) | Client component + polling |
| Zustand state needs to update after fetch | Client component + React Query |

---

## Pattern 1: Server component fetch (preferred for page-level data)

```tsx
// frontend/src/app/(explore)/[programId]/page.tsx
import { apiGet } from "@/lib/api/client"
import { KUruResponse } from "@/lib/api/types"

interface ProgramDetail {
  id: string
  name_en: string
  name_th: string
  year_by_year_vibe: string
  faculty_en: string
}

// Server component — no 'use client' directive
export default async function ProgramDetailPage({
  params,
}: {
  params: { programId: string }
}) {
  // Fetch happens on the server — no loading state needed
  const response = await apiGet<ProgramDetail>(`/programs/${params.programId}`)

  if (response.error || !response.data) {
    // Use Next.js error.tsx or notFound() for clean error handling
    return <ProgramNotFound />
  }

  return (
    <main>
      <h1>{response.data.name_th}</h1>
      <YearByYearVibe vibe={response.data.year_by_year_vibe} />
    </main>
  )
}
```

---

## Pattern 2: Client component with React Query (for interactive fetching)

```tsx
// frontend/src/app/(explore)/page.tsx  ← Program Explorer search
"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { apiGet } from "@/lib/api/client"

interface ProgramSearchResult {
  id: string
  name_en: string
  name_th: string
  similarity: number
}

export default function ExplorerPage() {
  const [query, setQuery] = useState("")
  const [submitted, setSubmitted] = useState("")

  const { data, isLoading, error } = useQuery({
    queryKey: ["programs", "search", submitted],
    queryFn: () => apiGet<ProgramSearchResult[]>(`/programs/search?q=${submitted}`),
    enabled: submitted.length >= 2,   // only fetch when query is long enough
    staleTime: 1000 * 60 * 5,         // cache for 5 minutes
  })

  return (
    <main>
      <SearchInput
        value={query}
        onChange={setQuery}
        onSubmit={() => setSubmitted(query)}
      />
      {isLoading && <SearchSkeleton />}
      {data?.data?.map((program) => (
        <ProgramCard key={program.id} program={program} />
      ))}
      {data?.sources && <CitationFootnote sources={data.sources} />}
    </main>
  )
}
```

---

## Pattern 3: Polling for async jobs (Portfolio Coach)

```tsx
// frontend/src/app/(portfolio)/page.tsx
"use client"

import { useQuery } from "@tanstack/react-query"
import { apiGet, apiPost } from "@/lib/api/client"

export default function PortfolioPage() {
  const [sessionId, setSessionId] = useState<string | null>(null)

  // Submit job
  const handleSubmit = async (formData: PortfolioInput) => {
    const res = await apiPost<{ session_id: string }>("/portfolio/analyze", formData)
    if (res.data) setSessionId(res.data.session_id)
  }

  // Poll for result — enabled only once sessionId exists
  const { data: statusData } = useQuery({
    queryKey: ["portfolio", "status", sessionId],
    queryFn: () => apiGet<GapReport>(`/portfolio/status/${sessionId}`),
    enabled: !!sessionId,
    refetchInterval: (data) =>
      // Stop polling once complete or errored
      data?.data?.status === "complete" || data?.data?.status === "error"
        ? false
        : 2000,  // poll every 2 seconds while in_progress
  })

  return (
    <main>
      {!sessionId && <PortfolioForm onSubmit={handleSubmit} />}
      {sessionId && statusData?.data?.status === "in_progress" && <AnalysisLoader />}
      {statusData?.data?.status === "complete" && (
        <GapReport report={statusData.data} />
      )}
    </main>
  )
}
```

---

## The API client (lib/api/client.ts — already implemented)

```ts
// You don't need to re-implement this — import from here
import { apiGet, apiPost } from "@/lib/api/client"

// GET request
const response = await apiGet<YourType>("/endpoint")
// response.data — the typed payload
// response.sources — citation refs
// response.error — error string or null

// POST request
const response = await apiPost<YourType>("/endpoint", bodyObject)
```

## Citation rendering rule

Whenever `response.sources` is non-empty, always render `<CitationFootnote sources={response.sources} />` below the content. Never skip this — it is required by rag-guardrails.md §4.

```tsx
import { CitationFootnote } from "@/components/chat/CitationFootnote"

// Always after content that came from the API:
{response.sources.length > 0 && (
  <CitationFootnote sources={response.sources} />
)}
```

## Rules — never violate

- Never use `fetch()` directly in a component — always use `apiGet` / `apiPost` from the client module.
- Never render raw bracket citation markers `[PLO3, CS มคอ.2]` in the UI — strip them and pass to `CitationFootnote`.
- Never show `response.error` as a raw string — wrap in a styled error component.
- Never hardcode the API base URL — it comes from env via the client module.
- Always handle `isLoading` with a skeleton component — never leave the user staring at blank space.