"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstructorSchema = void 0;
const zod_1 = require("zod");
const enums_1 = require("../enums");
const department_1 = require("./department");
const common_1 = require("./common");
exports.InstructorSchema = common_1.WithTimestampsSchema.extend({
    id: common_1.IdSchema,
    ad: zod_1.z.string().min(1).max(150),
    email: zod_1.z.string().email().max(200),
    aktif: zod_1.z.boolean(),
    roller: zod_1.z.array(zod_1.z.enum(enums_1.KULLANICI_ROLLERI)).default([]),
    bolumId: common_1.IdSchema,
    bolum: department_1.DepartmentSchema.optional(),
});
//# sourceMappingURL=instructor.js.map