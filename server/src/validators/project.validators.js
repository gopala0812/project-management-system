import { z } from 'zod';
import { optionalDate, paginationQuery } from './common.js';

const status = z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED']);

export const projectListSchema = z.object({
  query: paginationQuery.extend({
    search: z.string().trim().optional(),
    status: status.optional(),
    sortBy: z.enum(['name', 'status', 'startDate', 'endDate', 'createdAt']).default('createdAt')
  })
});

export const createProjectSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, 'Project name is required.'),
    description: z.string().trim().optional().nullable(),
    status: status.default('NOT_STARTED'),
    startDate: optionalDate,
    endDate: optionalDate
  })
});

export const updateProjectSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    name: z.string().trim().min(1).optional(),
    description: z.string().trim().optional().nullable(),
    status: status.optional(),
    startDate: optionalDate,
    endDate: optionalDate
  })
});
