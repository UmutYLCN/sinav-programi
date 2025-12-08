"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExamInvigilatorSchema = exports.ExamInvigilatorRoleEnum = void 0;
const zod_1 = require("zod");
const instructor_1 = require("./instructor");
const common_1 = require("./common");
exports.ExamInvigilatorRoleEnum = zod_1.z.enum(['birincil', 'ikincil']);
exports.ExamInvigilatorSchema = common_1.WithTimestampsSchema.extend({
    id: common_1.IdSchema,
    sinavId: common_1.IdSchema,
    ogretimUyesiId: common_1.IdSchema,
    rol: exports.ExamInvigilatorRoleEnum,
    gozetmen: instructor_1.InstructorSchema.optional(),
});
//# sourceMappingURL=exam-invigilator.js.map