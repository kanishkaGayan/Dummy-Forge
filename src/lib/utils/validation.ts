import { z } from 'zod';

export const fieldNameSchema = z
  .string()
  .min(1, 'Field name is required')
  .regex(/^[a-zA-Z][a-zA-Z0-9_]*$/, 'Use letters, numbers, and underscores');

export const recordCountSchema = z.number().min(1).max(10000);
