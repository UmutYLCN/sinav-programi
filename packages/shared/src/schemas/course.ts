import { z } from 'zod';
import { DonemEnum } from '../enums';
import { DepartmentSchema } from './department';
import { IdSchema, WithTimestampsSchema } from './common';

export const CourseSchema = WithTimestampsSchema.extend({
  id: IdSchema,
  kod: z.string().min(1).max(20),
  ad: z.string().min(1).max(200),
  sinif: z.number().int().min(1).max(6),
  donem: DonemEnum,
  kredi: z.number().int().positive().nullable().optional(),
  ogrenciKapasitesi: z.number().int().positive().nullable().optional(),
  bolumId: IdSchema,
  bolum: DepartmentSchema.optional(),
});

export type Course = z.infer<typeof CourseSchema>;

