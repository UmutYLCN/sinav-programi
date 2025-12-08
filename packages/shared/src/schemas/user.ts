import { z } from 'zod';
import { KULLANICI_ROLLERI } from '../enums';
import { InstructorSchema } from './instructor';
import { IdSchema, WithTimestampsSchema } from './common';

export const UserSchema = WithTimestampsSchema.extend({
  id: IdSchema,
  email: z.string().email().max(200),
  rol: z.enum(KULLANICI_ROLLERI),
  aktif: z.boolean(),
  ogretimUyesiId: IdSchema.nullable().optional(),
  ogretimUyesi: InstructorSchema.nullable().optional(),
});

export type User = z.infer<typeof UserSchema>;

