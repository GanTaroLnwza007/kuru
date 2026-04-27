import { z } from "zod";
import { createKuruResponseSchema } from "./types";

// Generated from the current API contract assumptions.
// Replace with OpenAPI-derived generation once /api/v1 contract is published.

export const chatRequestSchema = z.object({
  message: z.string().min(1),
  session_id: z.string().optional(),
  locale: z.enum(["th", "en"]).optional(),
});

export const chatDataSchema = z
  .object({
    answer: z.string(),
    fallback_used: z.boolean().default(false),
  })
  .passthrough();

export const chatResponseSchema = createKuruResponseSchema(chatDataSchema);

const riasecOptionSchema = z
  .object({
    id: z.string().optional(),
    text: z.string(),
    value: z.union([z.string(), z.number()]).optional(),
  })
  .passthrough();

const riasecQuestionSchema = z
  .object({
    id: z.string(),
    step: z.number().int().min(1).max(5).optional(),
    format: z.string().optional(),
    prompt: z.string().optional(),
    question: z.string().optional(),
    options: z.array(riasecOptionSchema).default([]),
  })
  .passthrough();

export const riasecStartRequestSchema = z.object({
  session_id: z.string().optional(),
});

export const riasecStartDataSchema = z
  .object({
    session_id: z.string(),
    step: z.number().int().min(1).max(5),
    total_steps: z.number().int().min(1).default(5),
    question: riasecQuestionSchema.optional(),
  })
  .passthrough();

export const riasecStartResponseSchema = createKuruResponseSchema(riasecStartDataSchema);

export const riasecAnswerRequestSchema = z.object({
  session_id: z.string(),
  question_id: z.string(),
  answer: z.union([z.string(), z.number(), z.array(z.string())]),
});

const riasecProgramMatchSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    score: z.number().optional(),
  })
  .passthrough();

const riasecResultSchema = z
  .object({
    holland_code: z.string(),
    confidence: z.enum(["low", "medium", "high"]).optional(),
    matched_skill_clusters: z.array(z.string()).default([]),
    programs: z.array(riasecProgramMatchSchema).default([]),
  })
  .passthrough();

export const riasecAnswerDataSchema = z
  .object({
    step: z.number().int().min(1).max(5).optional(),
    question: riasecQuestionSchema.optional(),
    result: riasecResultSchema.optional(),
  })
  .passthrough();

export const riasecAnswerResponseSchema = createKuruResponseSchema(riasecAnswerDataSchema);

export const programsSearchRequestSchema = z.object({
  query: z.string().min(1),
  limit: z.number().int().min(1).max(20).optional(),
});

export const programSummarySchema = z
  .object({
    id: z.string(),
    name: z.string(),
    faculty: z.string().optional(),
    similarity: z.number().min(0).max(1).optional(),
    year_by_year_vibe: z.string().optional(),
    skills_developed: z.array(z.string()).default([]),
  })
  .passthrough();

export const programsSearchDataSchema = z
  .object({
    items: z.array(programSummarySchema).default([]),
    total: z.number().int().nonnegative().optional(),
  })
  .passthrough();

export const programsSearchResponseSchema = createKuruResponseSchema(programsSearchDataSchema);

export const programDetailRequestSchema = z.object({
  programId: z.string().min(1),
});

export const programDetailDataSchema = programSummarySchema
  .extend({
    description: z.string().optional(),
    tcas_requirements: z.array(z.string()).default([]),
  })
  .passthrough();

export const programDetailResponseSchema = createKuruResponseSchema(programDetailDataSchema);

export const portfolioAnalyzeRequestSchema = z
  .object({
    program_id: z.string().min(1),
    portfolio_text: z.string().min(1),
    student_profile: z.record(z.string(), z.unknown()).optional(),
  })
  .passthrough();

export const portfolioAnalyzeDataSchema = z
  .object({
    job_id: z.string(),
    status: z.enum(["queued", "in_progress", "completed", "failed"]).default("queued"),
  })
  .passthrough();

export const portfolioAnalyzeResponseSchema = createKuruResponseSchema(portfolioAnalyzeDataSchema);

export const portfolioStatusRequestSchema = z.object({
  job_id: z.string().min(1),
});

const criterionStatusSchema = z
  .object({
    criterion: z.string(),
    weight: z.number().optional(),
    status: z.enum(["met", "partial", "unmet"]),
    suggestion: z.string(),
  })
  .passthrough();

export const portfolioStatusDataSchema = z
  .object({
    job_id: z.string(),
    status: z.enum(["queued", "in_progress", "completed", "failed"]),
    report: z
      .object({
        summary: z.string().optional(),
        criteria: z.array(criterionStatusSchema).default([]),
      })
      .optional(),
  })
  .passthrough();

export const portfolioStatusResponseSchema = createKuruResponseSchema(portfolioStatusDataSchema);

export type ChatRequest = z.infer<typeof chatRequestSchema>;
export type ChatData = z.infer<typeof chatDataSchema>;

export type RiasecStartRequest = z.infer<typeof riasecStartRequestSchema>;
export type RiasecStartData = z.infer<typeof riasecStartDataSchema>;

export type RiasecAnswerRequest = z.infer<typeof riasecAnswerRequestSchema>;
export type RiasecAnswerData = z.infer<typeof riasecAnswerDataSchema>;

export type ProgramsSearchRequest = z.infer<typeof programsSearchRequestSchema>;
export type ProgramsSearchData = z.infer<typeof programsSearchDataSchema>;

export type ProgramDetailRequest = z.infer<typeof programDetailRequestSchema>;
export type ProgramDetailData = z.infer<typeof programDetailDataSchema>;

export type PortfolioAnalyzeRequest = z.infer<typeof portfolioAnalyzeRequestSchema>;
export type PortfolioAnalyzeData = z.infer<typeof portfolioAnalyzeDataSchema>;

export type PortfolioStatusRequest = z.infer<typeof portfolioStatusRequestSchema>;
export type PortfolioStatusData = z.infer<typeof portfolioStatusDataSchema>;