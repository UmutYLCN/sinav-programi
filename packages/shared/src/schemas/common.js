"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WithTimestampsSchema = exports.TimestampSchema = exports.IdSchema = void 0;
const zod_1 = require("zod");
exports.IdSchema = zod_1.z.string().uuid();
exports.TimestampSchema = zod_1.z.string().datetime({ offset: true });
exports.WithTimestampsSchema = zod_1.z.object({
    createdAt: exports.TimestampSchema,
    updatedAt: exports.TimestampSchema,
});
//# sourceMappingURL=common.js.map