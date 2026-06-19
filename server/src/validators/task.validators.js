import { z } from 'zod';
import { optionalDate, paginationQuery } from './common.js';

const status = z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']);
const priority = z.enum(['LOW', 'MEDIUM', 'HIGH']);

export const taskListSchema = z.object({
  query: paginationQuery.extend({
    search: z.string().trim().optional(),
    status: status.optional(),
    priority: priority.optional(),
    projectId: z.string().optional(),
    sortBy: z.enum(['name', 'status', 'priority', 'dueDate', 'createdAt']).default('createdAt')
  })
});

export const createTaskSchema = z.object({
  body: z.object({
    projectId: z.string().min(1, 'Project is required.'),
    name: z.string().trim().min(1, 'Task name is required.'),
    description: z.string().trim().optional().nullable(),
    priority: priority.default('MEDIUM'),
    status: status.default('PENDING'),
    dueDate: optionalDate
  })
});

export const updateTaskSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    projectId: z.string().min(1).optional(),
    name: z.string().trim().min(1).optional(),
    description: z.string().trim().optional().nullable(),
    priority: priority.optional(),
    status: status.optional(),
    dueDate: optionalDate
  })
});
