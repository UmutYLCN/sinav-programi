"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvigilatorLoadDetailSchema = exports.InvigilatorLoadExamSchema = exports.InvigilatorLoadItemSchema = void 0;
const zod_1 = require("zod");
const instructor_1 = require("./instructor");
const common_1 = require("./common");
const exam_invigilator_1 = require("./exam-invigilator");
exports.InvigilatorLoadItemSchema = zod_1.z.object({
    ogretimUyesiId: common_1.IdSchema,
    ad: zod_1.z.string(),
    email: zod_1.z.string().email().optional(),
    bolum: zod_1.z.string().optional(),
    fakulte: zod_1.z.string().optional(),
    toplamDakika: zod_1.z.number(),
    toplamSaat: zod_1.z.number(),
    sinavSayisi: zod_1.z.number(),
});
exports.InvigilatorLoadExamSchema = zod_1.z.object({
    sinavId: common_1.IdSchema,
    tarih: zod_1.z.string().nullable(),
    baslangic: zod_1.z.string().nullable(),
    bitis: zod_1.z.string().nullable(),
    ders: zod_1.z.string().nullable(),
    dersKod: zod_1.z.string().nullable(),
    bolum: zod_1.z.string().nullable(),
    derslik: zod_1.z.string().nullable(),
    sureDakika: zod_1.z.number(),
    gozetmenRol: exam_invigilator_1.ExamInvigilatorRoleEnum,
    ortakGrupEtiketi: zod_1.z.string().optional(),
});
exports.InvigilatorLoadDetailSchema = zod_1.z.object({
    ogretimUyesi: instructor_1.InstructorSchema,
    toplamDakika: zod_1.z.number(),
    toplamSaat: zod_1.z.number(),
    sinavSayisi: zod_1.z.number(),
    cakismalar: zod_1.z.array(zod_1.z.string()),
    zamanDilimi: zod_1.z.string(),
    sinavlar: zod_1.z.array(exports.InvigilatorLoadExamSchema),
});
//# sourceMappingURL=invigilator-load.js.map