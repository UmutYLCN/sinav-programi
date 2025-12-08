import { z } from 'zod';

export const ExamConflictTurEnum = z.enum([
  'derslik',
  'ogretim-uyesi',
  'gozetmen',
  'musait-degil',
]);

export const ExamConflictSeviyeEnum = z.enum(['kritik', 'uyari']);

export const ExamConflictSchema = z.object({
  tur: ExamConflictTurEnum,
  mesaj: z.string(),
  seviye: ExamConflictSeviyeEnum,
  ilgiliId: z.string().optional(),
});

export type ExamConflict = z.infer<typeof ExamConflictSchema>;

