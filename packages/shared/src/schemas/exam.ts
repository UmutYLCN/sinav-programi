import { z } from 'zod';
import { DONEMLER, EXAM_DURUMLARI, EXAM_TURLERI } from '../enums';
import { CourseSchema } from './course';
import { RoomSchema } from './room';
import { InstructorSchema } from './instructor';
import { ExamInvigilatorSchema } from './exam-invigilator';
import { ExamRoomSchema } from './exam-room';
import { IdSchema, WithTimestampsSchema } from './common';
import { ExamGroupSchema } from './exam-group';

export const ExamSchema = WithTimestampsSchema.extend({
  id: IdSchema,
  dersId: IdSchema,
  ders: CourseSchema.optional(),
  donem: z.enum(DONEMLER),
  sinif: z.number().int().min(1).max(6),
  tur: z.enum(EXAM_TURLERI),
  durum: z.enum(EXAM_DURUMLARI),
  tarih: z.string().nullable().optional(),
  baslangic: z.string().nullable().optional(),
  bitis: z.string().nullable().optional(),
  derslikId: IdSchema.nullable().optional(), // Deprecated: Use derslikler instead
  derslik: RoomSchema.nullable().optional(), // Deprecated: Use derslikler instead
  derslikler: z.array(ExamRoomSchema).optional(),
  ogretimUyesiId: IdSchema.nullable().optional(),
  ogretimUyesi: InstructorSchema.nullable().optional(),
  ortakGrupId: IdSchema.nullable().optional(),
  ortakGrup: ExamGroupSchema.nullable().optional(),
  gozetmenler: z.array(ExamInvigilatorSchema).optional(),
  onayli: z.boolean().default(false),
  cakismaOnayli: z.boolean().default(false), // Kontrollü çakışma onayı
  notlar: z.string().nullable().optional(),
  teslimLinki: z.string().url().nullable().optional(),
  teslimTarihi: z.string().datetime().nullable().optional(),
});

export type Exam = z.infer<typeof ExamSchema>;