import { z } from 'zod';
import { FacultySchema } from './faculty';
import { IdSchema, WithTimestampsSchema } from './common';

export const DepartmentSchema = WithTimestampsSchema.extend({
  id: IdSchema,
  ad: z.string().min(1).max(150),
  kod: z.string().min(1).max(50),
  fakulteId: IdSchema,
  fakulte: FacultySchema.optional(),
});

export type Department = z.infer<typeof DepartmentSchema>;

