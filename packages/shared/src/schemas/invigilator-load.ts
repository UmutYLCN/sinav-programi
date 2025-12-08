import { z } from 'zod';
import { InstructorSchema } from './instructor';
import { IdSchema } from './common';
import { ExamInvigilatorRoleEnum } from './exam-invigilator';

export const InvigilatorLoadItemSchema = z.object({
  ogretimUyesiId: IdSchema,
  ad: z.string(),
  email: z.string().email().optional(),
  bolum: z.string().optional(),
  fakulte: z.string().optional(),
  toplamDakika: z.number(),
  toplamSaat: z.number(),
  sinavSayisi: z.number(),
});

export const InvigilatorLoadExamSchema = z.object({
  sinavId: IdSchema,
  tarih: z.string().nullable(),
  baslangic: z.string().nullable(),
  bitis: z.string().nullable(),
  ders: z.string().nullable(),
  dersKod: z.string().nullable(),
  bolum: z.string().nullable(),
  derslik: z.string().nullable(),
  sureDakika: z.number(),
  gozetmenRol: ExamInvigilatorRoleEnum,
  ortakGrupEtiketi: z.string().optional(),
});

export const InvigilatorLoadDetailSchema = z.object({
  ogretimUyesi: InstructorSchema,
  toplamDakika: z.number(),
  toplamSaat: z.number(),
  sinavSayisi: z.number(),
  cakismalar: z.array(z.string()),
  zamanDilimi: z.string(),
  sinavlar: z.array(InvigilatorLoadExamSchema),
});

export type InvigilatorLoadItem = z.infer<typeof InvigilatorLoadItemSchema>;
export type InvigilatorLoadDetail = z.infer<typeof InvigilatorLoadDetailSchema>;

