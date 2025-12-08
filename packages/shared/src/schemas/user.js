"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSchema = void 0;
const zod_1 = require("zod");
const enums_1 = require("../enums");
const instructor_1 = require("./instructor");
const common_1 = require("./common");
exports.UserSchema = common_1.WithTimestampsSchema.extend({
    id: common_1.IdSchema,
    email: zod_1.z.string().email().max(200),
    rol: zod_1.z.enum(enums_1.KULLANICI_ROLLERI),
    aktif: zod_1.z.boolean(),
    ogretimUyesiId: common_1.IdSchema.nullable().optional(),
    ogretimUyesi: instructor_1.InstructorSchema.nullable().optional(),
});
//# sourceMappingURL=user.js.map