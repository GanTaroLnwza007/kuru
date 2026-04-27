import { z } from "zod";
import { getApiBaseUrl } from "@/lib/env";
import {
  chatRequestSchema,
  chatResponseSchema,
  type ChatData,
  type ChatRequest,
  portfolioAnalyzeRequestSchema,
  portfolioAnalyzeResponseSchema,
  portfolioStatusRequestSchema,
  portfolioStatusResponseSchema,
  programDetailRequestSchema,
  programDetailResponseSchema,
  programsSearchRequestSchema,
  programsSearchResponseSchema,
  riasecAnswerRequestSchema,
  riasecAnswerResponseSchema,
  riasecStartRequestSchema,
  riasecStartResponseSchema,
  type PortfolioAnalyzeData,
  type PortfolioAnalyzeRequest,
  type PortfolioStatusData,
  type PortfolioStatusRequest,
  type ProgramDetailData,
  type ProgramDetailRequest,
  type ProgramsSearchData,
  type ProgramsSearchRequest,
  type RiasecAnswerData,
  type RiasecAnswerRequest,
  type RiasecStartData,
  type RiasecStartRequest,
} from "./schemas.generated";
import type { KuruApiError, KuruResponseEnvelope } from "./types";

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
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (config.method !== "GET" && validatedBody !== undefined) {
    init.body = JSON.stringify(validatedBody);
  }

  let response: Response;

  try {
    response = await fetch(createAbsoluteUrl(config.path), init);
  } catch (error) {
    throw new ApiClientError("Network error while contacting API", {
      status: 0,
      details: error,
    });
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
      details: parsedEnvelope.error.flatten(),
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

export const apiClient = {
  chat(payload: ChatRequest): Promise<ChatData> {
    return apiRequest({
      path: "/chat",
      method: "POST",
      requestSchema: chatRequestSchema,
      responseSchema: chatResponseSchema,
      body: payload,
    });
  },

  startRiasec(payload: RiasecStartRequest = {}): Promise<RiasecStartData> {
    return apiRequest({
      path: "/riasec/start",
      method: "POST",
      requestSchema: riasecStartRequestSchema,
      responseSchema: riasecStartResponseSchema,
      body: payload,
    });
  },

  answerRiasec(payload: RiasecAnswerRequest): Promise<RiasecAnswerData> {
    return apiRequest({
      path: "/riasec/answer",
      method: "POST",
      requestSchema: riasecAnswerRequestSchema,
      responseSchema: riasecAnswerResponseSchema,
      body: payload,
    });
  },

  searchPrograms(payload: ProgramsSearchRequest): Promise<ProgramsSearchData> {
    return apiRequest({
      path: "/programs/search",
      method: "POST",
      requestSchema: programsSearchRequestSchema,
      responseSchema: programsSearchResponseSchema,
      body: payload,
    });
  },

  getProgramDetail(payload: ProgramDetailRequest): Promise<ProgramDetailData> {
    const validated = programDetailRequestSchema.parse(payload);

    return apiRequest({
      path: `/programs/${encodeURIComponent(validated.programId)}`,
      method: "GET",
      responseSchema: programDetailResponseSchema,
    });
  },

  analyzePortfolio(payload: PortfolioAnalyzeRequest): Promise<PortfolioAnalyzeData> {
    return apiRequest({
      path: "/portfolio/analyze",
      method: "POST",
      requestSchema: portfolioAnalyzeRequestSchema,
      responseSchema: portfolioAnalyzeResponseSchema,
      body: payload,
    });
  },

  getPortfolioStatus(payload: PortfolioStatusRequest): Promise<PortfolioStatusData> {
    const validated = portfolioStatusRequestSchema.parse(payload);

    return apiRequest({
      path: `/portfolio/status?job_id=${encodeURIComponent(validated.job_id)}`,
      method: "GET",
      responseSchema: portfolioStatusResponseSchema,
    });
  },
};