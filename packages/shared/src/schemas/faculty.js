"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FacultySchema = void 0;
const zod_1 = require("zod");
const common_1 = require("./common");
exports.FacultySchema = common_1.WithTimestampsSchema.extend({
    id: common_1.IdSchema,
    ad: zod_1.z.string().min(1).max(150),
    kod: zod_1.z.string().min(1).max(50),
});
//# sourceMappingURL=faculty.js.map