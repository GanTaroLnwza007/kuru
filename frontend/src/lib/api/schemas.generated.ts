import { z } from "zod";
import { createKuruResponseSchema } from "./types";

// Schemas aligned with M1 backend contract (backend/models/schemas.py)

// ---------- Shared ----------

export const sourceChunkSchema = z.object({
  table: z.string(),
  row_id: z.string(),
  excerpt: z.string(),
});

// ---------- Programs ----------

export const ploItemSchema = z.object({
  code: z.string(),
  description_th: z.string(),
});

export const tcasRoundSchema = z.object({
  round: z.string(),
  track_name: z.string().nullable().optional(),
  quota: z.number().int().nonnegative(),
  min_score: z.number().nonnegative().nullable(),
  exam_criteria: z.record(z.string(), z.unknown()).nullable().optional(),
  portfolio_requirements: z.record(z.string(), z.unknown()).nullable().optional(),
  deadlines: z.record(z.string(), z.string()).nullable().optional(),
});

export const programSummarySchema = z.object({
  id: z.string(),
  slug: z.string(),
  name_th: z.string(),
  name_en: z.string(),
  faculty_th: z.string(),
  faculty_en: z.string(),
  degree: z.string(),
  campus: z.string(),
  match_score: z.number().default(1.0),
  year_by_year_vibe: z.string().nullable().optional(),
});

export const programSearchResultSchema = z.object({
  results: z.array(programSummarySchema),
  total: z.number().int().nonnegative(),
});

export const programDetailSchema = programSummarySchema.extend({
  plos: z.array(ploItemSchema),
  tcas_rounds: z.array(tcasRoundSchema),
});

export const programSearchResponseSchema = createKuruResponseSchema(programSearchResultSchema);
export const programDetailResponseSchema = createKuruResponseSchema(programDetailSchema);

// ---------- Chat ----------

export const conversationTurnSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
});

export const chatRequestSchema = z.object({
  message: z.string().min(1),
  program_context_id: z.string().nullable().optional(),
  session_id: z.string().nullable().optional(),
  conversation_history: z.array(conversationTurnSchema).default([]),
});

export const chatSourceChunkSchema = z.object({
  source_file: z.string(),
  section_type: z.string(),
  similarity: z.number(),
});

export const chatDataSchema = z.object({
  answer: z.string(),
  session_id: z.string(),
  confidence_level: z.enum(["high", "medium", "low"]).default("low"),
  sources: z.array(chatSourceChunkSchema).default([]),
  used_tcas_data: z.boolean().default(false),
});

export const chatResponseSchema = createKuruResponseSchema(chatDataSchema);

// ---------- Inferred types ----------

export type SourceChunk = z.infer<typeof sourceChunkSchema>;
export type PloItem = z.infer<typeof ploItemSchema>;
export type TcasRound = z.infer<typeof tcasRoundSchema>;
export type ProgramSummary = z.infer<typeof programSummarySchema>;
export type ProgramSearchResult = z.infer<typeof programSearchResultSchema>;
export type ProgramDetail = z.infer<typeof programDetailSchema>;
export type ConversationTurn = z.infer<typeof conversationTurnSchema>;
export type ChatSourceChunk = z.infer<typeof chatSourceChunkSchema>;
export type ChatRequest = z.infer<typeof chatRequestSchema>;
export type ChatData = z.infer<typeof chatDataSchema>;
