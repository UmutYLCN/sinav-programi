"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseSchema = void 0;
const zod_1 = require("zod");
const enums_1 = require("../enums");
const department_1 = require("./department");
const common_1 = require("./common");
exports.CourseSchema = common_1.WithTimestampsSchema.extend({
    id: common_1.IdSchema,
    kod: zod_1.z.string().min(1).max(20),
    ad: zod_1.z.string().min(1).max(200),
    sinif: zod_1.z.number().int().min(1).max(6),
    donem: enums_1.DonemEnum,
    kredi: zod_1.z.number().int().positive().nullable().optional(),
    bolumId: common_1.IdSchema,
    bolum: department_1.DepartmentSchema.optional(),
});
//# sourceMappingURL=course.js.map