"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  CourseSchema: () => CourseSchema,
  DERSLIK_TIPLERI: () => DERSLIK_TIPLERI,
  DERSLIK_TIP_LISTESI: () => DERSLIK_TIP_LISTESI,
  DONEMLER: () => DONEMLER,
  DONEMLER_LIST: () => DONEMLER_LIST,
  DepartmentSchema: () => DepartmentSchema,
  DerslikTipEnum: () => DerslikTipEnum,
  DonemEnum: () => DonemEnum,
  EXAM_DURUMLARI: () => EXAM_DURUMLARI,
  EXAM_DURUM_LISTESI: () => EXAM_DURUM_LISTESI,
  EXAM_TURLERI: () => EXAM_TURLERI,
  EXAM_TUR_LISTESI: () => EXAM_TUR_LISTESI,
  ExamConflictSchema: () => ExamConflictSchema,
  ExamConflictSeviyeEnum: () => ExamConflictSeviyeEnum,
  ExamConflictTurEnum: () => ExamConflictTurEnum,
  ExamDurumEnum: () => ExamDurumEnum,
  ExamGroupSchema: () => ExamGroupSchema,
  ExamInvigilatorRoleEnum: () => ExamInvigilatorRoleEnum,
  ExamInvigilatorSchema: () => ExamInvigilatorSchema,
  ExamSchema: () => ExamSchema,
  ExamTurEnum: () => ExamTurEnum,
  FacultySchema: () => FacultySchema,
  GUNLER: () => GUNLER,
  GUN_LISTESI: () => GUN_LISTESI,
  GunEnum: () => GunEnum,
  IdSchema: () => IdSchema,
  InstructorSchema: () => InstructorSchema,
  InstructorUnavailabilitySchema: () => InstructorUnavailabilitySchema,
  InvigilatorLoadDetailSchema: () => InvigilatorLoadDetailSchema,
  InvigilatorLoadExamSchema: () => InvigilatorLoadExamSchema,
  InvigilatorLoadItemSchema: () => InvigilatorLoadItemSchema,
  KULLANICI_ROLLERI: () => KULLANICI_ROLLERI,
  KULLANICI_ROL_LISTESI: () => KULLANICI_ROL_LISTESI,
  KullaniciRolEnum: () => KullaniciRolEnum,
  RoomSchema: () => RoomSchema,
  TimestampSchema: () => TimestampSchema,
  UnavailabilitySourceEnum: () => UnavailabilitySourceEnum,
  UserSchema: () => UserSchema,
  WithTimestampsSchema: () => WithTimestampsSchema
});
module.exports = __toCommonJS(index_exports);

// src/enums.ts
var import_zod = require("zod");
var DONEMLER = ["guz", "bahar"];
var DONEMLER_LIST = DONEMLER;
var DonemEnum = import_zod.z.enum(DONEMLER, {
  errorMap: () => ({ message: "D\xF6nem yaln\u0131zca g\xFCz veya bahar olabilir." })
});
var EXAM_DURUMLARI = ["planlanmadi", "taslak", "yayinlandi"];
var EXAM_DURUM_LISTESI = EXAM_DURUMLARI;
var ExamDurumEnum = import_zod.z.enum(EXAM_DURUMLARI, {
  errorMap: () => ({
    message: "Durum yaln\u0131zca planlanmad\u0131, taslak veya yay\u0131nland\u0131 olabilir."
  })
});
var EXAM_TURLERI = ["sinav", "odev", "proje"];
var EXAM_TUR_LISTESI = EXAM_TURLERI;
var ExamTurEnum = import_zod.z.enum(EXAM_TURLERI, {
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
var KullaniciRolEnum = import_zod.z.enum(KULLANICI_ROLLERI);
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
var GunEnum = import_zod.z.enum(GUNLER);
var DERSLIK_TIPLERI = [
  "amfi",
  "laboratuvar",
  "sinif",
  "toplanti",
  "diger"
];
var DERSLIK_TIP_LISTESI = DERSLIK_TIPLERI;
var DerslikTipEnum = import_zod.z.enum(DERSLIK_TIPLERI, {
  errorMap: () => ({
    message: "Derslik tipi amfi, laboratuvar, s\u0131n\u0131f, toplant\u0131 veya di\u011Fer olabilir."
  })
});

// src/schemas/common.ts
var import_zod2 = require("zod");
var IdSchema = import_zod2.z.string().uuid();
var TimestampSchema = import_zod2.z.string().datetime({ offset: true });
var WithTimestampsSchema = import_zod2.z.object({
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema
});

// src/schemas/faculty.ts
var import_zod3 = require("zod");
var FacultySchema = WithTimestampsSchema.extend({
  id: IdSchema,
  ad: import_zod3.z.string().min(1).max(150),
  kod: import_zod3.z.string().min(1).max(50)
});

// src/schemas/department.ts
var import_zod4 = require("zod");
var DepartmentSchema = WithTimestampsSchema.extend({
  id: IdSchema,
  ad: import_zod4.z.string().min(1).max(150),
  kod: import_zod4.z.string().min(1).max(50),
  fakulteId: IdSchema,
  fakulte: FacultySchema.optional()
});

// src/schemas/course.ts
var import_zod5 = require("zod");
var CourseSchema = WithTimestampsSchema.extend({
  id: IdSchema,
  kod: import_zod5.z.string().min(1).max(20),
  ad: import_zod5.z.string().min(1).max(200),
  sinif: import_zod5.z.number().int().min(1).max(6),
  donem: DonemEnum,
  kredi: import_zod5.z.number().int().positive().nullable().optional(),
  bolumId: IdSchema,
  bolum: DepartmentSchema.optional()
});

// src/schemas/room.ts
var import_zod6 = require("zod");
var RoomSchema = WithTimestampsSchema.extend({
  id: IdSchema,
  ad: import_zod6.z.string().min(1).max(150),
  bina: import_zod6.z.string().min(1).max(150),
  tip: import_zod6.z.enum(DERSLIK_TIPLERI),
  kapasite: import_zod6.z.number().int().positive(),
  fakulteId: IdSchema,
  fakulte: FacultySchema.optional()
});

// src/schemas/instructor.ts
var import_zod7 = require("zod");
var InstructorSchema = WithTimestampsSchema.extend({
  id: IdSchema,
  ad: import_zod7.z.string().min(1).max(150),
  email: import_zod7.z.string().email().max(200),
  aktif: import_zod7.z.boolean(),
  roller: import_zod7.z.array(import_zod7.z.enum(KULLANICI_ROLLERI)).default([]),
  bolumId: IdSchema,
  bolum: DepartmentSchema.optional()
});

// src/schemas/exam-group.ts
var import_zod8 = require("zod");
var ExamGroupSchema = WithTimestampsSchema.extend({
  id: IdSchema,
  ad: import_zod8.z.string().min(1).max(150),
  aciklama: import_zod8.z.string().max(500).nullable().optional()
});

// src/schemas/exam-invigilator.ts
var import_zod9 = require("zod");
var ExamInvigilatorRoleEnum = import_zod9.z.enum(["birincil", "ikincil"]);
var ExamInvigilatorSchema = WithTimestampsSchema.extend({
  id: IdSchema,
  sinavId: IdSchema,
  ogretimUyesiId: IdSchema,
  rol: ExamInvigilatorRoleEnum,
  gozetmen: InstructorSchema.optional()
});

// src/schemas/exam-conflict.ts
var import_zod10 = require("zod");
var ExamConflictTurEnum = import_zod10.z.enum([
  "derslik",
  "ogretim-uyesi",
  "gozetmen",
  "musait-degil"
]);
var ExamConflictSeviyeEnum = import_zod10.z.enum(["kritik", "uyari"]);
var ExamConflictSchema = import_zod10.z.object({
  tur: ExamConflictTurEnum,
  mesaj: import_zod10.z.string(),
  seviye: ExamConflictSeviyeEnum,
  ilgiliId: import_zod10.z.string().optional()
});

// src/schemas/exam.ts
var import_zod11 = require("zod");
var ExamSchema = WithTimestampsSchema.extend({
  id: IdSchema,
  dersId: IdSchema,
  ders: CourseSchema.optional(),
  donem: import_zod11.z.enum(DONEMLER),
  sinif: import_zod11.z.number().int().min(1).max(6),
  tur: import_zod11.z.enum(EXAM_TURLERI),
  durum: import_zod11.z.enum(EXAM_DURUMLARI),
  tarih: import_zod11.z.string().nullable().optional(),
  baslangic: import_zod11.z.string().nullable().optional(),
  bitis: import_zod11.z.string().nullable().optional(),
  derslikId: IdSchema.nullable().optional(),
  derslik: RoomSchema.nullable().optional(),
  ogretimUyesiId: IdSchema.nullable().optional(),
  ogretimUyesi: InstructorSchema.nullable().optional(),
  ortakGrupId: IdSchema.nullable().optional(),
  ortakGrup: ExamGroupSchema.nullable().optional(),
  gozetmenler: import_zod11.z.array(ExamInvigilatorSchema).optional(),
  onayli: import_zod11.z.boolean().default(false),
  notlar: import_zod11.z.string().nullable().optional(),
  teslimLinki: import_zod11.z.string().url().nullable().optional(),
  teslimTarihi: import_zod11.z.string().datetime().nullable().optional()
});

// src/schemas/unavailability.ts
var import_zod12 = require("zod");
var UnavailabilitySourceEnum = import_zod12.z.enum(["manuel", "csv", "kural"]);
var InstructorUnavailabilitySchema = WithTimestampsSchema.extend({
  id: IdSchema,
  ogretimUyesiId: IdSchema,
  baslangic: import_zod12.z.string().datetime(),
  bitis: import_zod12.z.string().datetime(),
  neden: import_zod12.z.string().min(1).max(200),
  kaynak: UnavailabilitySourceEnum.default("manuel"),
  overrideEdildi: import_zod12.z.boolean().default(false),
  ogretimUyesi: InstructorSchema.optional()
});

// src/schemas/user.ts
var import_zod13 = require("zod");
var UserSchema = WithTimestampsSchema.extend({
  id: IdSchema,
  email: import_zod13.z.string().email().max(200),
  rol: import_zod13.z.enum(KULLANICI_ROLLERI),
  aktif: import_zod13.z.boolean(),
  ogretimUyesiId: IdSchema.nullable().optional(),
  ogretimUyesi: InstructorSchema.nullable().optional()
});

// src/schemas/invigilator-load.ts
var import_zod14 = require("zod");
var InvigilatorLoadItemSchema = import_zod14.z.object({
  ogretimUyesiId: IdSchema,
  ad: import_zod14.z.string(),
  email: import_zod14.z.string().email().optional(),
  bolum: import_zod14.z.string().optional(),
  fakulte: import_zod14.z.string().optional(),
  toplamDakika: import_zod14.z.number(),
  toplamSaat: import_zod14.z.number(),
  sinavSayisi: import_zod14.z.number()
});
var InvigilatorLoadExamSchema = import_zod14.z.object({
  sinavId: IdSchema,
  tarih: import_zod14.z.string().nullable(),
  baslangic: import_zod14.z.string().nullable(),
  bitis: import_zod14.z.string().nullable(),
  ders: import_zod14.z.string().nullable(),
  dersKod: import_zod14.z.string().nullable(),
  bolum: import_zod14.z.string().nullable(),
  derslik: import_zod14.z.string().nullable(),
  sureDakika: import_zod14.z.number(),
  gozetmenRol: ExamInvigilatorRoleEnum,
  ortakGrupEtiketi: import_zod14.z.string().optional()
});
var InvigilatorLoadDetailSchema = import_zod14.z.object({
  ogretimUyesi: InstructorSchema,
  toplamDakika: import_zod14.z.number(),
  toplamSaat: import_zod14.z.number(),
  sinavSayisi: import_zod14.z.number(),
  cakismalar: import_zod14.z.array(import_zod14.z.string()),
  zamanDilimi: import_zod14.z.string(),
  sinavlar: import_zod14.z.array(InvigilatorLoadExamSchema)
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
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
});
