"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomSchema = void 0;
const zod_1 = require("zod");
const enums_1 = require("../enums");
const faculty_1 = require("./faculty");
const common_1 = require("./common");
exports.RoomSchema = common_1.WithTimestampsSchema.extend({
    id: common_1.IdSchema,
    ad: zod_1.z.string().min(1).max(150),
    bina: zod_1.z.string().min(1).max(150),
    tip: zod_1.z.enum(enums_1.DERSLIK_TIPLERI),
    kapasite: zod_1.z.number().int().positive(),
    fakulteId: common_1.IdSchema,
    fakulte: faculty_1.FacultySchema.optional(),
});
//# sourceMappingURL=room.js.map