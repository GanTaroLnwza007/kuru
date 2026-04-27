import { z } from "zod";

export const sourceReferenceSchema = z
  .object({
    id: z.string().optional(),
    table: z.string().optional(),
    row_id: z.union([z.string(), z.number()]).optional(),
    title: z.string().optional(),
    snippet: z.string().optional(),
    url: z.string().url().optional(),
  })
  .passthrough();

export const apiErrorSchema = z
  .object({
    code: z.string().optional(),
    message: z.string(),
    details: z.unknown().optional(),
  })
  .passthrough();

export const createKuruResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: dataSchema.nullable(),
    sources: z.array(sourceReferenceSchema).default([]),
    error: apiErrorSchema.nullable(),
  });

export type KuruSourceReference = z.infer<typeof sourceReferenceSchema>;
export type KuruApiError = z.infer<typeof apiErrorSchema>;

export type KuruResponseEnvelope<T> = {
  data: T | null;
  sources: KuruSourceReference[];
  error: KuruApiError | null;
};