import { z } from "zod";
import { getApiBaseUrl } from "@/lib/env";
import {
  chatRequestSchema,
  chatResponseSchema,
  programDetailResponseSchema,
  programSearchResponseSchema,
  type ChatData,
  type ChatRequest,
  type ProgramDetail,
  type ProgramSearchResult,
} from "./schemas.generated";
import type { KuruApiError, KuruResponseEnvelope } from "./types";
import type { SearchProgramsParams } from "./mock-client";

type HttpMethod = "GET" | "POST";

type RequestConfig<TRequest, TResponse> = {
  path: string;
  method: HttpMethod;
  requestSchema?: z.ZodType<TRequest>;
  responseSchema: z.ZodType<KuruResponseEnvelope<TResponse>>;
  body?: TRequest;
};

export class ApiClientError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly details?: unknown;

  constructor(
    message: string,
    options?: {
      status?: number;
      code?: string;
      details?: unknown;
    }
  ) {
    super(message);
    this.name = "ApiClientError";
    this.status = options?.status ?? 500;
    this.code = options?.code;
    this.details = options?.details;
  }
}

function createAbsoluteUrl(path: string): string {
  const normalizedBase = getApiBaseUrl().replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
  return `${normalizedBase}/${normalizedPath}`;
}

function normalizeEnvelopeError(
  fallbackStatus: number,
  error: KuruApiError | null,
  details?: unknown
): ApiClientError {
  if (!error) {
    return new ApiClientError("Request failed", { status: fallbackStatus, details });
  }
  return new ApiClientError(error.message, {
    status: fallbackStatus,
    code: error.code,
    details: error.details,
  });
}

async function apiRequest<TRequest, TResponse>(
  config: RequestConfig<TRequest, TResponse>
): Promise<TResponse> {
  const validatedBody = config.requestSchema
    ? config.requestSchema.parse(config.body)
    : config.body;

  const init: RequestInit = {
    method: config.method,
    headers: { "Content-Type": "application/json" },
  };

  if (config.method !== "GET" && validatedBody !== undefined) {
    init.body = JSON.stringify(validatedBody);
  }

  let response: Response;

  try {
    response = await fetch(createAbsoluteUrl(config.path), init);
  } catch (error) {
    throw new ApiClientError("Network error while contacting API", { status: 0, details: error });
  }

  let payload: unknown;

  try {
    payload = await response.json();
  } catch (error) {
    throw new ApiClientError("API returned invalid JSON", {
      status: response.status,
      details: error,
    });
  }

  const parsedEnvelope = config.responseSchema.safeParse(payload);

  if (!parsedEnvelope.success) {
    throw new ApiClientError("API response envelope validation failed", {
      status: response.status,
      details: parsedEnvelope.error.issues,
    });
  }

  const envelope = parsedEnvelope.data;

  if (!response.ok || envelope.error) {
    throw normalizeEnvelopeError(response.status, envelope.error, payload);
  }

  if (envelope.data === null) {
    throw new ApiClientError("API returned empty data", {
      status: response.status,
      details: payload,
    });
  }

  return envelope.data;
}

export const realApiClient = {
  searchPrograms({ q = "", faculty, limit = 20 }: SearchProgramsParams): Promise<ProgramSearchResult> {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (faculty) params.set("faculty", faculty);
    params.set("limit", String(limit));

    return apiRequest({
      path: `/programs/search?${params.toString()}`,
      method: "GET",
      responseSchema: programSearchResponseSchema,
    });
  },

  getProgramDetail(programId: string): Promise<ProgramDetail> {
    return apiRequest({
      path: `/programs/${encodeURIComponent(programId)}`,
      method: "GET",
      responseSchema: programDetailResponseSchema,
    });
  },

  chat(payload: ChatRequest): Promise<ChatData> {
    return apiRequest({
      path: "/chat",
      method: "POST",
      requestSchema: chatRequestSchema,
      responseSchema: chatResponseSchema,
      body: payload,
    });
  },

  async chatFeedback(payload: {
    session_id: string;
    question: string;
    answer: string;
    rating: number;
  }): Promise<void> {
    const base = getApiBaseUrl().replace(/\/$/, "");
    await fetch(`${base}/chat/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  },
};
