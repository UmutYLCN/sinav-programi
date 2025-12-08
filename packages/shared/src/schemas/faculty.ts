import { z } from 'zod';
import { IdSchema, WithTimestampsSchema } from './common';

export const FacultySchema = WithTimestampsSchema.extend({
  id: IdSchema,
  ad: z.string().min(1).max(150),
  kod: z.string().min(1).max(50),
});

export type Faculty = z.infer<typeof FacultySchema>;

