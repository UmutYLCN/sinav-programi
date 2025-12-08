"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExamGroupSchema = void 0;
const zod_1 = require("zod");
const common_1 = require("./common");
exports.ExamGroupSchema = common_1.WithTimestampsSchema.extend({
    id: common_1.IdSchema,
    ad: zod_1.z.string().min(1).max(150),
    aciklama: zod_1.z.string().max(500).nullable().optional(),
});
//# sourceMappingURL=exam-group.js.map