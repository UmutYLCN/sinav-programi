"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstructorUnavailabilitySchema = exports.UnavailabilitySourceEnum = void 0;
const zod_1 = require("zod");
const instructor_1 = require("./instructor");
const common_1 = require("./common");
exports.UnavailabilitySourceEnum = zod_1.z.enum(['manuel', 'csv', 'kural']);
exports.InstructorUnavailabilitySchema = common_1.WithTimestampsSchema.extend({
    id: common_1.IdSchema,
    ogretimUyesiId: common_1.IdSchema,
    baslangic: zod_1.z.string().datetime(),
    bitis: zod_1.z.string().datetime(),
    neden: zod_1.z.string().min(1).max(200),
    kaynak: exports.UnavailabilitySourceEnum.default('manuel'),
    overrideEdildi: zod_1.z.boolean().default(false),
    ogretimUyesi: instructor_1.InstructorSchema.optional(),
});
//# sourceMappingURL=unavailability.js.map