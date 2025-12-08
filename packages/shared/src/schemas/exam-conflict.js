"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExamConflictSchema = exports.ExamConflictSeviyeEnum = exports.ExamConflictTurEnum = void 0;
const zod_1 = require("zod");
exports.ExamConflictTurEnum = zod_1.z.enum([
    'derslik',
    'ogretim-uyesi',
    'gozetmen',
    'musait-degil',
]);
exports.ExamConflictSeviyeEnum = zod_1.z.enum(['kritik', 'uyari']);
exports.ExamConflictSchema = zod_1.z.object({
    tur: exports.ExamConflictTurEnum,
    mesaj: zod_1.z.string(),
    seviye: exports.ExamConflictSeviyeEnum,
    ilgiliId: zod_1.z.string().optional(),
});
//# sourceMappingURL=exam-conflict.js.map