import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    fullName: z.string().trim().min(2, 'Full name is required.'),
    email: z.string().trim().email('A valid email address is required.').toLowerCase(),
    password: z.string().min(8, 'Password must be at least 8 characters.')
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().email('A valid email address is required.').toLowerCase(),
    password: z.string().min(1, 'Password is required.')
  })
});
