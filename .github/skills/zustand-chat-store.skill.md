---
description: How to read from and write to the KUru Zustand store, add actions to an existing slice, or add a new slice. Use this skill whenever a task touches `useAppStore`, `chatSlice`, `riasecSlice`, or requires new global client state.
---

# Skill: Zustand chat store

KUru uses a single `useAppStore` with **namespaced slices** — each feature owns its own sub-object inside the store. The store lives at `frontend/src/lib/store.ts`. Never create a second store.

## Store shape

```ts
// frontend/src/lib/store.ts (authoritative — always import from here)
import { useAppStore } from "@/lib/store"

// Top-level shape:
// useAppStore().chat    → ChatSlice
// useAppStore().riasec  → RiasecSlice
```

---

## Reading state — always use selectors

Read one field at a time. This prevents unnecessary re-renders when unrelated state changes.

```tsx
"use client"

import { useAppStore } from "@/lib/store"

export default function ChatPage() {
  // ✅ Correct — granular selectors
  const messages  = useAppStore((s) => s.chat.messages)
  const isLoading = useAppStore((s) => s.chat.isLoading)
  const sessionId = useAppStore((s) => s.chat.sessionId)

  // ❌ Wrong — subscribes to the entire chat slice; re-renders on every action
  const chat = useAppStore((s) => s.chat)
}
```

---

## Calling actions

Actions live **inside the slice**, not at the store root. Always select them the same way as state.

```tsx
const addMessage  = useAppStore((s) => s.chat.addMessage)
const setLoading  = useAppStore((s) => s.chat.setLoading)
const setSessionId = useAppStore((s) => s.chat.setSessionId)
const clearMessages = useAppStore((s) => s.chat.clearMessages)

// Usage
addMessage({
  id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
  role: "user",                        // "user" | "assistant"
  content: "ช่วยแนะนำโปรแกรม...",
  createdAt: new Date().toISOString(),
})

setLoading(true)
setSessionId(data.session_id)
clearMessages()  // also resets sessionId to null
```

---

## ChatMessage type (already exported — import, don't redefine)

```ts
import type { ChatMessage, ChatRole } from "@/lib/store"
import type { SourceChunk } from "@/lib/api/schemas.generated"

// ChatMessage shape:
// {
//   id: string
//   role: "user" | "assistant"
//   content: string
//   createdAt: string          // ISO 8601
//   sources?: SourceChunk[]   // only on assistant messages
//   isMock?: boolean           // true when X-Mock-Response header present
// }
```

---

## Complete send-message pattern (Chat page)

```tsx
"use client"

import { useCallback } from "react"
import { useAppStore } from "@/lib/store"
import { apiClient } from "@/lib/api"

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export default function ChatPage() {
  const isLoading  = useAppStore((s) => s.chat.isLoading)
  const sessionId  = useAppStore((s) => s.chat.sessionId)
  const addMessage = useAppStore((s) => s.chat.addMessage)
  const setSessionId = useAppStore((s) => s.chat.setSessionId)
  const setLoading   = useAppStore((s) => s.chat.setLoading)

  const sendMessage = useCallback(async (text: string) => {
    if (isLoading) return

    // 1. Append user bubble immediately
    addMessage({ id: generateId(), role: "user", content: text, createdAt: new Date().toISOString() })
    setLoading(true)

    try {
      const response = await apiClient.chat({
        message: text,
        session_id: sessionId ?? undefined,
        program_context_id: undefined,
      })

      const isMock = "isMock" in response && response.isMock === true
      setSessionId(response.data.session_id)

      // 2. Append assistant bubble with sources
      addMessage({
        id: generateId(),
        role: "assistant",
        content: response.data.answer,
        createdAt: new Date().toISOString(),
        sources: response.sources,
        isMock,
      })
    } catch {
      addMessage({ id: generateId(), role: "assistant", content: "เกิดข้อผิดพลาด กรุณาลองใหม่", createdAt: new Date().toISOString() })
    } finally {
      setLoading(false)
    }
  }, [isLoading, sessionId, addMessage, setSessionId, setLoading])
}
```

---

## Adding a new action to an existing slice

Edit `frontend/src/lib/store.ts`. Follow the spread pattern — never mutate state directly.

```ts
// Example: adding resetChat to ChatSlice

// 1. Add to the type
type ChatSlice = {
  // ... existing fields ...
  resetChat: () => void  // ← add here
}

// 2. Add the implementation inside create()
chat: {
  // ... existing actions ...
  resetChat: () =>
    set((state) => ({
      chat: { ...state.chat, messages: [], sessionId: null, isLoading: false },
    })),
}
```

---

## Adding a new slice

Add the type, initial state, and implementation alongside the existing slices. Follow the exact same namespace pattern.

```ts
// 1. Define the slice type
type PortfolioSlice = {
  sessionId: string | null
  isAnalyzing: boolean
  setSessionId: (id: string | null) => void
  setAnalyzing: (v: boolean) => void
}

// 2. Add to AppStore
type AppStore = {
  chat: ChatSlice
  riasec: RiasecSlice
  portfolio: PortfolioSlice  // ← new
}

// 3. Add inside create()
portfolio: {
  sessionId: null,
  isAnalyzing: false,
  setSessionId: (sessionId) =>
    set((state) => ({ portfolio: { ...state.portfolio, sessionId } })),
  setAnalyzing: (isAnalyzing) =>
    set((state) => ({ portfolio: { ...state.portfolio, isAnalyzing } })),
},
```

---

## Rules — never violate

- Never call `useAppStore` in a Server Component — store is client-only.
- Never import the store in `lib/api/` or any service module — keep state in components/pages.
- Never spread the entire slice into a component (`const { messages, isLoading } = useAppStore((s) => s.chat)`) — always use one selector per field.
- Always use the spread-and-override pattern (`{ ...state.chat, field: value }`) inside `set()` — never mutate the slice object directly.
- Never create a second Zustand store — all global client state belongs in `useAppStore`.
