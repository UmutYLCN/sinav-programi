import { z } from 'zod';
import { DERSLIK_TIPLERI } from '../enums';
import { IdSchema, WithTimestampsSchema } from './common';

export const RoomSchema = WithTimestampsSchema.extend({
  id: IdSchema,
  ad: z.string().min(1).max(150),
  bina: z.string().min(1).max(150),
  tip: z.enum(DERSLIK_TIPLERI),
  kapasite: z.number().int().positive(),
});

export type Room = z.infer<typeof RoomSchema>;

