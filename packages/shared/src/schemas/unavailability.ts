import { z } from 'zod';
import { InstructorSchema } from './instructor';
import { IdSchema, WithTimestampsSchema } from './common';

export const UnavailabilitySourceEnum = z.enum(['manuel', 'csv', 'kural']);

export const InstructorUnavailabilitySchema = WithTimestampsSchema.extend({
  id: IdSchema,
  ogretimUyesiId: IdSchema,
  baslangic: z.string().datetime(),
  bitis: z.string().datetime(),
  neden: z.string().min(1).max(200),
  kaynak: UnavailabilitySourceEnum.default('manuel'),
  overrideEdildi: z.boolean().default(false),
  ogretimUyesi: InstructorSchema.optional(),
});

export type InstructorUnavailability = z.infer<
  typeof InstructorUnavailabilitySchema
>;

