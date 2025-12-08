// src/enums.ts
import { z } from "zod";
var DONEMLER = ["guz", "bahar"];
var DONEMLER_LIST = DONEMLER;
var DonemEnum = z.enum(DONEMLER, {
  errorMap: () => ({ message: "D\xF6nem yaln\u0131zca g\xFCz veya bahar olabilir." })
});
var EXAM_DURUMLARI = ["planlanmadi", "taslak", "yayinlandi"];
var EXAM_DURUM_LISTESI = EXAM_DURUMLARI;
var ExamDurumEnum = z.enum(EXAM_DURUMLARI, {
  errorMap: () => ({
    message: "Durum yaln\u0131zca planlanmad\u0131, taslak veya yay\u0131nland\u0131 olabilir."
  })
});
var EXAM_TURLERI = ["sinav", "odev", "proje"];
var EXAM_TUR_LISTESI = EXAM_TURLERI;
var ExamTurEnum = z.enum(EXAM_TURLERI, {
  errorMap: () => ({
    message: "T\xFCr yaln\u0131zca s\u0131nav, \xF6dev veya proje olabilir."
  })
});
var KULLANICI_ROLLERI = [
  "YONETICI",
  "BOLUM_SORUMLUSU",
  "OGRETIM_UYESI"
];
var KULLANICI_ROL_LISTESI = KULLANICI_ROLLERI;
var KullaniciRolEnum = z.enum(KULLANICI_ROLLERI);
var GUNLER = [
  "Pazartesi",
  "Sal\u0131",
  "\xC7ar\u015Famba",
  "Per\u015Fembe",
  "Cuma",
  "Cumartesi",
  "Pazar"
];
var GUN_LISTESI = GUNLER;
var GunEnum = z.enum(GUNLER);
var DERSLIK_TIPLERI = [
  "amfi",
  "laboratuvar",
  "sinif",
  "toplanti",
  "diger"
];
var DERSLIK_TIP_LISTESI = DERSLIK_TIPLERI;
var DerslikTipEnum = z.enum(DERSLIK_TIPLERI, {
  errorMap: () => ({
    message: "Derslik tipi amfi, laboratuvar, s\u0131n\u0131f, toplant\u0131 veya di\u011Fer olabilir."
  })
});

// src/schemas/common.ts
import { z as z2 } from "zod";
var IdSchema = z2.string().uuid();
var TimestampSchema = z2.string().datetime({ offset: true });
var WithTimestampsSchema = z2.object({
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema
});

// src/schemas/faculty.ts
import { z as z3 } from "zod";
var FacultySchema = WithTimestampsSchema.extend({
  id: IdSchema,
  ad: z3.string().min(1).max(150),
  kod: z3.string().min(1).max(50)
});

// src/schemas/department.ts
import { z as z4 } from "zod";
var DepartmentSchema = WithTimestampsSchema.extend({
  id: IdSchema,
  ad: z4.string().min(1).max(150),
  kod: z4.string().min(1).max(50),
  fakulteId: IdSchema,
  fakulte: FacultySchema.optional()
});

// src/schemas/course.ts
import { z as z5 } from "zod";
var CourseSchema = WithTimestampsSchema.extend({
  id: IdSchema,
  kod: z5.string().min(1).max(20),
  ad: z5.string().min(1).max(200),
  sinif: z5.number().int().min(1).max(6),
  donem: DonemEnum,
  kredi: z5.number().int().positive().nullable().optional(),
  bolumId: IdSchema,
  bolum: DepartmentSchema.optional()
});

// src/schemas/room.ts
import { z as z6 } from "zod";
var RoomSchema = WithTimestampsSchema.extend({
  id: IdSchema,
  ad: z6.string().min(1).max(150),
  bina: z6.string().min(1).max(150),
  tip: z6.enum(DERSLIK_TIPLERI),
  kapasite: z6.number().int().positive(),
  fakulteId: IdSchema,
  fakulte: FacultySchema.optional()
});

// src/schemas/instructor.ts
import { z as z7 } from "zod";
var InstructorSchema = WithTimestampsSchema.extend({
  id: IdSchema,
  ad: z7.string().min(1).max(150),
  email: z7.string().email().max(200),
  aktif: z7.boolean(),
  roller: z7.array(z7.enum(KULLANICI_ROLLERI)).default([]),
  bolumId: IdSchema,
  bolum: DepartmentSchema.optional()
});

// src/schemas/exam-group.ts
import { z as z8 } from "zod";
var ExamGroupSchema = WithTimestampsSchema.extend({
  id: IdSchema,
  ad: z8.string().min(1).max(150),
  aciklama: z8.string().max(500).nullable().optional()
});

// src/schemas/exam-invigilator.ts
import { z as z9 } from "zod";
var ExamInvigilatorRoleEnum = z9.enum(["birincil", "ikincil"]);
var ExamInvigilatorSchema = WithTimestampsSchema.extend({
  id: IdSchema,
  sinavId: IdSchema,
  ogretimUyesiId: IdSchema,
  rol: ExamInvigilatorRoleEnum,
  gozetmen: InstructorSchema.optional()
});

// src/schemas/exam-conflict.ts
import { z as z10 } from "zod";
var ExamConflictTurEnum = z10.enum([
  "derslik",
  "ogretim-uyesi",
  "gozetmen",
  "musait-degil"
]);
var ExamConflictSeviyeEnum = z10.enum(["kritik", "uyari"]);
var ExamConflictSchema = z10.object({
  tur: ExamConflictTurEnum,
  mesaj: z10.string(),
  seviye: ExamConflictSeviyeEnum,
  ilgiliId: z10.string().optional()
});

// src/schemas/exam.ts
import { z as z11 } from "zod";
var ExamSchema = WithTimestampsSchema.extend({
  id: IdSchema,
  dersId: IdSchema,
  ders: CourseSchema.optional(),
  donem: z11.enum(DONEMLER),
  sinif: z11.number().int().min(1).max(6),
  tur: z11.enum(EXAM_TURLERI),
  durum: z11.enum(EXAM_DURUMLARI),
  tarih: z11.string().nullable().optional(),
  baslangic: z11.string().nullable().optional(),
  bitis: z11.string().nullable().optional(),
  derslikId: IdSchema.nullable().optional(),
  derslik: RoomSchema.nullable().optional(),
  ogretimUyesiId: IdSchema.nullable().optional(),
  ogretimUyesi: InstructorSchema.nullable().optional(),
  ortakGrupId: IdSchema.nullable().optional(),
  ortakGrup: ExamGroupSchema.nullable().optional(),
  gozetmenler: z11.array(ExamInvigilatorSchema).optional(),
  onayli: z11.boolean().default(false),
  notlar: z11.string().nullable().optional(),
  teslimLinki: z11.string().url().nullable().optional(),
  teslimTarihi: z11.string().datetime().nullable().optional()
});

// src/schemas/unavailability.ts
import { z as z12 } from "zod";
var UnavailabilitySourceEnum = z12.enum(["manuel", "csv", "kural"]);
var InstructorUnavailabilitySchema = WithTimestampsSchema.extend({
  id: IdSchema,
  ogretimUyesiId: IdSchema,
  baslangic: z12.string().datetime(),
  bitis: z12.string().datetime(),
  neden: z12.string().min(1).max(200),
  kaynak: UnavailabilitySourceEnum.default("manuel"),
  overrideEdildi: z12.boolean().default(false),
  ogretimUyesi: InstructorSchema.optional()
});

// src/schemas/user.ts
import { z as z13 } from "zod";
var UserSchema = WithTimestampsSchema.extend({
  id: IdSchema,
  email: z13.string().email().max(200),
  rol: z13.enum(KULLANICI_ROLLERI),
  aktif: z13.boolean(),
  ogretimUyesiId: IdSchema.nullable().optional(),
  ogretimUyesi: InstructorSchema.nullable().optional()
});

// src/schemas/invigilator-load.ts
import { z as z14 } from "zod";
var InvigilatorLoadItemSchema = z14.object({
  ogretimUyesiId: IdSchema,
  ad: z14.string(),
  email: z14.string().email().optional(),
  bolum: z14.string().optional(),
  fakulte: z14.string().optional(),
  toplamDakika: z14.number(),
  toplamSaat: z14.number(),
  sinavSayisi: z14.number()
});
var InvigilatorLoadExamSchema = z14.object({
  sinavId: IdSchema,
  tarih: z14.string().nullable(),
  baslangic: z14.string().nullable(),
  bitis: z14.string().nullable(),
  ders: z14.string().nullable(),
  dersKod: z14.string().nullable(),
  bolum: z14.string().nullable(),
  derslik: z14.string().nullable(),
  sureDakika: z14.number(),
  gozetmenRol: ExamInvigilatorRoleEnum,
  ortakGrupEtiketi: z14.string().optional()
});
var InvigilatorLoadDetailSchema = z14.object({
  ogretimUyesi: InstructorSchema,
  toplamDakika: z14.number(),
  toplamSaat: z14.number(),
  sinavSayisi: z14.number(),
  cakismalar: z14.array(z14.string()),
  zamanDilimi: z14.string(),
  sinavlar: z14.array(InvigilatorLoadExamSchema)
});
export {
  CourseSchema,
  DERSLIK_TIPLERI,
  DERSLIK_TIP_LISTESI,
  DONEMLER,
  DONEMLER_LIST,
  DepartmentSchema,
  DerslikTipEnum,
  DonemEnum,
  EXAM_DURUMLARI,
  EXAM_DURUM_LISTESI,
  EXAM_TURLERI,
  EXAM_TUR_LISTESI,
  ExamConflictSchema,
  ExamConflictSeviyeEnum,
  ExamConflictTurEnum,
  ExamDurumEnum,
  ExamGroupSchema,
  ExamInvigilatorRoleEnum,
  ExamInvigilatorSchema,
  ExamSchema,
  ExamTurEnum,
  FacultySchema,
  GUNLER,
  GUN_LISTESI,
  GunEnum,
  IdSchema,
  InstructorSchema,
  InstructorUnavailabilitySchema,
  InvigilatorLoadDetailSchema,
  InvigilatorLoadExamSchema,
  InvigilatorLoadItemSchema,
  KULLANICI_ROLLERI,
  KULLANICI_ROL_LISTESI,
  KullaniciRolEnum,
  RoomSchema,
  TimestampSchema,
  UnavailabilitySourceEnum,
  UserSchema,
  WithTimestampsSchema
};
