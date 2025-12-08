"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExamSchema = void 0;
const zod_1 = require("zod");
const enums_1 = require("../enums");
const course_1 = require("./course");
const room_1 = require("./room");
const instructor_1 = require("./instructor");
const exam_invigilator_1 = require("./exam-invigilator");
const common_1 = require("./common");
const exam_group_1 = require("./exam-group");
exports.ExamSchema = common_1.WithTimestampsSchema.extend({
    id: common_1.IdSchema,
    dersId: common_1.IdSchema,
    ders: course_1.CourseSchema.optional(),
    donem: zod_1.z.enum(enums_1.DONEMLER),
    sinif: zod_1.z.number().int().min(1).max(6),
    tur: zod_1.z.enum(enums_1.EXAM_TURLERI),
    durum: zod_1.z.enum(enums_1.EXAM_DURUMLARI),
    tarih: zod_1.z.string().nullable().optional(),
    baslangic: zod_1.z.string().nullable().optional(),
    bitis: zod_1.z.string().nullable().optional(),
    derslikId: common_1.IdSchema.nullable().optional(),
    derslik: room_1.RoomSchema.nullable().optional(),
    ogretimUyesiId: common_1.IdSchema.nullable().optional(),
    ogretimUyesi: instructor_1.InstructorSchema.nullable().optional(),
    ortakGrupId: common_1.IdSchema.nullable().optional(),
    ortakGrup: exam_group_1.ExamGroupSchema.nullable().optional(),
    gozetmenler: zod_1.z.array(exam_invigilator_1.ExamInvigilatorSchema).optional(),
    onayli: zod_1.z.boolean().default(false),
    notlar: zod_1.z.string().nullable().optional(),
    teslimLinki: zod_1.z.string().url().nullable().optional(),
    teslimTarihi: zod_1.z.string().datetime().nullable().optional(),
});
//# sourceMappingURL=exam.js.map