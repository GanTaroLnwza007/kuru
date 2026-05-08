import { z } from "zod";

export function isUsingMock(): boolean {
  return process.env.NEXT_PUBLIC_USE_MOCK === "true";
}

const runtimeEnvSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z
    .string()
    .refine((value) => { try { new URL(value); return true; } catch { return false; } }, {
      message: "NEXT_PUBLIC_API_BASE_URL must be a valid URL",
    })
    .refine((value) => value.includes("/api"), {
      message: "NEXT_PUBLIC_API_BASE_URL must include an API path such as /api/v1",
    }),
});

export type RuntimeEnv = z.infer<typeof runtimeEnvSchema>;

function parseRuntimeEnv(): RuntimeEnv | null {
  if (isUsingMock()) return null;

  const result = runtimeEnvSchema.safeParse({
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  });

  if (!result.success) {
    if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
      return null;
    }

    const issues = result.error.issues
      .map((issue) => `- ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");

    throw new Error(
      "Invalid frontend runtime environment. Set NEXT_PUBLIC_API_BASE_URL in .env.local (see .env.example).\n" +
        issues
    );
  }

  return {
    NEXT_PUBLIC_API_BASE_URL: result.data.NEXT_PUBLIC_API_BASE_URL.replace(/\/$/, ""),
  };
}

let cachedEnv: RuntimeEnv | null | undefined;

export function getEnv(): RuntimeEnv {
  if (cachedEnv !== undefined) {
    if (cachedEnv === null) {
      throw new Error(
        "NEXT_PUBLIC_API_BASE_URL is not set. Add it to your .env.local file (see .env.example)."
      );
    }
    return cachedEnv;
  }

  const parsed = parseRuntimeEnv();

  if (parsed === null) {
    cachedEnv = null;
    if (!isUsingMock()) {
      throw new Error(
        "NEXT_PUBLIC_API_BASE_URL is not set. Add it to your .env.local file (see .env.example)."
      );
    }
    // In mock mode, env is intentionally null — callers should not reach getApiBaseUrl()
    return null as unknown as RuntimeEnv;
  }

  cachedEnv = parsed;
  return cachedEnv;
}

export function getApiBaseUrl(): string {
  return getEnv().NEXT_PUBLIC_API_BASE_URL;
}

Object.defineProperty(globalThis, "API_BASE_URL", {
  get: () => (isUsingMock() ? "mock" : getApiBaseUrl()),
  configurable: true,
});
