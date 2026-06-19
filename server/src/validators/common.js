import { z } from 'zod';

export const idParamSchema = z.object({
  params: z.object({
    id: z.string().min(1)
  })
});

export const optionalDate = z.preprocess(
  (value) => {
    if (value === undefined) return undefined;
    if (value === null) return null;
    if (value instanceof Date) return value;
    if (typeof value === 'string' && value.trim() === '') return null;
    return new Date(value);
  },
  z
    .union([z.date(), z.null(), z.undefined()])
    .refine((value) => value === undefined || value === null || !Number.isNaN(value.getTime()), 'Invalid date value.')
);

export const paginationQuery = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});
