"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DerslikTipEnum = exports.DERSLIK_TIP_LISTESI = exports.DERSLIK_TIPLERI = exports.GunEnum = exports.GUN_LISTESI = exports.GUNLER = exports.KullaniciRolEnum = exports.KULLANICI_ROL_LISTESI = exports.KULLANICI_ROLLERI = exports.ExamTurEnum = exports.EXAM_TUR_LISTESI = exports.EXAM_TURLERI = exports.ExamDurumEnum = exports.EXAM_DURUM_LISTESI = exports.EXAM_DURUMLARI = exports.DonemEnum = exports.DONEMLER_LIST = exports.DONEMLER = void 0;
const zod_1 = require("zod");
exports.DONEMLER = ['guz', 'bahar'];
exports.DONEMLER_LIST = exports.DONEMLER;
exports.DonemEnum = zod_1.z.enum(exports.DONEMLER, {
    errorMap: () => ({ message: 'Dönem yalnızca güz veya bahar olabilir.' }),
});
exports.EXAM_DURUMLARI = ['planlanmadi', 'taslak', 'yayinlandi'];
exports.EXAM_DURUM_LISTESI = exports.EXAM_DURUMLARI;
exports.ExamDurumEnum = zod_1.z.enum(exports.EXAM_DURUMLARI, {
    errorMap: () => ({
        message: 'Durum yalnızca planlanmadı, taslak veya yayınlandı olabilir.',
    }),
});
exports.EXAM_TURLERI = ['sinav', 'odev', 'proje'];
exports.EXAM_TUR_LISTESI = exports.EXAM_TURLERI;
exports.ExamTurEnum = zod_1.z.enum(exports.EXAM_TURLERI, {
    errorMap: () => ({
        message: 'Tür yalnızca sınav, ödev veya proje olabilir.',
    }),
});
exports.KULLANICI_ROLLERI = [
    'YONETICI',
    'BOLUM_SORUMLUSU',
    'OGRETIM_UYESI',
];
exports.KULLANICI_ROL_LISTESI = exports.KULLANICI_ROLLERI;
exports.KullaniciRolEnum = zod_1.z.enum(exports.KULLANICI_ROLLERI);
exports.GUNLER = [
    'Pazartesi',
    'Salı',
    'Çarşamba',
    'Perşembe',
    'Cuma',
    'Cumartesi',
    'Pazar',
];
exports.GUN_LISTESI = exports.GUNLER;
exports.GunEnum = zod_1.z.enum(exports.GUNLER);
exports.DERSLIK_TIPLERI = [
    'amfi',
    'laboratuvar',
    'sinif',
    'toplanti',
    'diger',
];
exports.DERSLIK_TIP_LISTESI = exports.DERSLIK_TIPLERI;
exports.DerslikTipEnum = zod_1.z.enum(exports.DERSLIK_TIPLERI, {
    errorMap: () => ({
        message: 'Derslik tipi amfi, laboratuvar, sınıf, toplantı veya diğer olabilir.',
    }),
});
//# sourceMappingURL=enums.js.map