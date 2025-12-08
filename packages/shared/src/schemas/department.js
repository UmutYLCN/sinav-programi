"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepartmentSchema = void 0;
const zod_1 = require("zod");
const faculty_1 = require("./faculty");
const common_1 = require("./common");
exports.DepartmentSchema = common_1.WithTimestampsSchema.extend({
    id: common_1.IdSchema,
    ad: zod_1.z.string().min(1).max(150),
    kod: zod_1.z.string().min(1).max(50),
    fakulteId: common_1.IdSchema,
    fakulte: faculty_1.FacultySchema.optional(),
});
//# sourceMappingURL=department.js.map