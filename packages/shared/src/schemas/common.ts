import { z } from 'zod';

export const IdSchema = z.string().uuid();
export type EntityId = z.infer<typeof IdSchema>;

export const TimestampSchema = z.string().datetime({ offset: true });

export const WithTimestampsSchema = z.object({
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
});

export type WithTimestamps = z.infer<typeof WithTimestampsSchema>;

