import { z } from 'zod';
import { RoomSchema } from './room';
import { IdSchema, WithTimestampsSchema } from './common';

export const ExamRoomSchema = WithTimestampsSchema.extend({
  id: IdSchema,
  sinavId: IdSchema,
  derslikId: IdSchema,
  derslik: RoomSchema.optional(),
});

export type ExamRoom = z.infer<typeof ExamRoomSchema>;

