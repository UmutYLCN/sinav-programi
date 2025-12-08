import { z } from 'zod';

export const DONEMLER = ['guz', 'bahar'] as const;
export const DONEMLER_LIST: typeof DONEMLER = DONEMLER;
export const DonemEnum = z.enum(DONEMLER, {
  errorMap: () => ({ message: 'Dönem yalnızca güz veya bahar olabilir.' }),
});

export const EXAM_DURUMLARI = ['planlanmadi', 'taslak', 'yayinlandi'] as const;
export const EXAM_DURUM_LISTESI: typeof EXAM_DURUMLARI = EXAM_DURUMLARI;
export const ExamDurumEnum = z.enum(EXAM_DURUMLARI, {
  errorMap: () => ({
    message: 'Durum yalnızca planlanmadı, taslak veya yayınlandı olabilir.',
  }),
});

export const EXAM_TURLERI = ['sinav', 'odev', 'proje'] as const;
export const EXAM_TUR_LISTESI: typeof EXAM_TURLERI = EXAM_TURLERI;
export const ExamTurEnum = z.enum(EXAM_TURLERI, {
  errorMap: () => ({
    message: 'Tür yalnızca sınav, ödev veya proje olabilir.',
  }),
});

export const KULLANICI_ROLLERI = [
  'YONETICI',
  'BOLUM_SORUMLUSU',
  'OGRETIM_UYESI',
] as const;
export const KULLANICI_ROL_LISTESI: typeof KULLANICI_ROLLERI = KULLANICI_ROLLERI;
export const KullaniciRolEnum = z.enum(KULLANICI_ROLLERI);

export const GUNLER = [
  'Pazartesi',
  'Salı',
  'Çarşamba',
  'Perşembe',
  'Cuma',
  'Cumartesi',
  'Pazar',
] as const;
export const GUN_LISTESI: typeof GUNLER = GUNLER;
export const GunEnum = z.enum(GUNLER);

export const DERSLIK_TIPLERI = [
  'amfi',
  'laboratuvar',
  'sinif',
  'toplanti',
  'diger',
] as const;
export const DERSLIK_TIP_LISTESI: typeof DERSLIK_TIPLERI = DERSLIK_TIPLERI;
export const DerslikTipEnum = z.enum(DERSLIK_TIPLERI, {
  errorMap: () => ({
    message:
      'Derslik tipi amfi, laboratuvar, sınıf, toplantı veya diğer olabilir.',
  }),
});

export type Donem = z.infer<typeof DonemEnum>;
export type ExamDurum = z.infer<typeof ExamDurumEnum>;
export type ExamTur = z.infer<typeof ExamTurEnum>;
export type KullaniciRol = z.infer<typeof KullaniciRolEnum>;
export type Gun = z.infer<typeof GunEnum>;
export type DerslikTip = z.infer<typeof DerslikTipEnum>;

