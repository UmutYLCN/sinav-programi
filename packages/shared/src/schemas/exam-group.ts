import { z } from 'zod';
import { IdSchema, WithTimestampsSchema } from './common';

export const ExamGroupSchema = WithTimestampsSchema.extend({
  id: IdSchema,
  ad: z.string().min(1).max(150),
  aciklama: z.string().max(500).nullable().optional(),
});

export type ExamGroup = z.infer<typeof ExamGroupSchema>;

