import { z } from 'zod';
import { InstructorSchema } from './instructor';
import { IdSchema, WithTimestampsSchema } from './common';

export const ExamInvigilatorRoleEnum = z.enum(['birincil', 'ikincil']);

export const ExamInvigilatorSchema = WithTimestampsSchema.extend({
  id: IdSchema,
  sinavId: IdSchema,
  ogretimUyesiId: IdSchema,
  rol: ExamInvigilatorRoleEnum,
  gozetmen: InstructorSchema.optional(),
});

export type ExamInvigilator = z.infer<typeof ExamInvigilatorSchema>;

