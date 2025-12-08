import { z } from 'zod';
import { KULLANICI_ROLLERI } from '../enums';
import { DepartmentSchema } from './department';
import { IdSchema, WithTimestampsSchema } from './common';

export const InstructorSchema = WithTimestampsSchema.extend({
  id: IdSchema,
  ad: z.string().min(1).max(150),
  email: z.string().email().max(200),
  aktif: z.boolean(),
  roller: z.array(z.enum(KULLANICI_ROLLERI)).default([]),
  bolumId: IdSchema,
  bolum: DepartmentSchema.optional(),
});

export type Instructor = z.infer<typeof InstructorSchema>;

