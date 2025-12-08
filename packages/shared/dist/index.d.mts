import { z } from 'zod';

declare const DONEMLER: readonly ["guz", "bahar"];
declare const DONEMLER_LIST: typeof DONEMLER;
declare const DonemEnum: z.ZodEnum<["guz", "bahar"]>;
declare const EXAM_DURUMLARI: readonly ["planlanmadi", "taslak", "yayinlandi"];
declare const EXAM_DURUM_LISTESI: typeof EXAM_DURUMLARI;
declare const ExamDurumEnum: z.ZodEnum<["planlanmadi", "taslak", "yayinlandi"]>;
declare const EXAM_TURLERI: readonly ["sinav", "odev", "proje"];
declare const EXAM_TUR_LISTESI: typeof EXAM_TURLERI;
declare const ExamTurEnum: z.ZodEnum<["sinav", "odev", "proje"]>;
declare const KULLANICI_ROLLERI: readonly ["YONETICI", "BOLUM_SORUMLUSU", "OGRETIM_UYESI"];
declare const KULLANICI_ROL_LISTESI: typeof KULLANICI_ROLLERI;
declare const KullaniciRolEnum: z.ZodEnum<["YONETICI", "BOLUM_SORUMLUSU", "OGRETIM_UYESI"]>;
declare const GUNLER: readonly ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];
declare const GUN_LISTESI: typeof GUNLER;
declare const GunEnum: z.ZodEnum<["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"]>;
declare const DERSLIK_TIPLERI: readonly ["amfi", "laboratuvar", "sinif", "toplanti", "diger"];
declare const DERSLIK_TIP_LISTESI: typeof DERSLIK_TIPLERI;
declare const DerslikTipEnum: z.ZodEnum<["amfi", "laboratuvar", "sinif", "toplanti", "diger"]>;
type Donem = z.infer<typeof DonemEnum>;
type ExamDurum = z.infer<typeof ExamDurumEnum>;
type ExamTur = z.infer<typeof ExamTurEnum>;
type KullaniciRol = z.infer<typeof KullaniciRolEnum>;
type Gun = z.infer<typeof GunEnum>;
type DerslikTip = z.infer<typeof DerslikTipEnum>;

declare const IdSchema: z.ZodString;
type EntityId = z.infer<typeof IdSchema>;
declare const TimestampSchema: z.ZodString;
declare const WithTimestampsSchema: z.ZodObject<{
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    createdAt: string;
    updatedAt: string;
}, {
    createdAt: string;
    updatedAt: string;
}>;
type WithTimestamps = z.infer<typeof WithTimestampsSchema>;

declare const FacultySchema: z.ZodObject<{
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
} & {
    id: z.ZodString;
    ad: z.ZodString;
    kod: z.ZodString;
}, "strip", z.ZodTypeAny, {
    createdAt: string;
    updatedAt: string;
    id: string;
    ad: string;
    kod: string;
}, {
    createdAt: string;
    updatedAt: string;
    id: string;
    ad: string;
    kod: string;
}>;
type Faculty = z.infer<typeof FacultySchema>;

declare const DepartmentSchema: z.ZodObject<{
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
} & {
    id: z.ZodString;
    ad: z.ZodString;
    kod: z.ZodString;
    fakulteId: z.ZodString;
    fakulte: z.ZodOptional<z.ZodObject<{
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    } & {
        id: z.ZodString;
        ad: z.ZodString;
        kod: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        createdAt: string;
        updatedAt: string;
        id: string;
        ad: string;
        kod: string;
    }, {
        createdAt: string;
        updatedAt: string;
        id: string;
        ad: string;
        kod: string;
    }>>;
}, "strip", z.ZodTypeAny, {
    createdAt: string;
    updatedAt: string;
    id: string;
    ad: string;
    kod: string;
    fakulteId: string;
    fakulte?: {
        createdAt: string;
        updatedAt: string;
        id: string;
        ad: string;
        kod: string;
    } | undefined;
}, {
    createdAt: string;
    updatedAt: string;
    id: string;
    ad: string;
    kod: string;
    fakulteId: string;
    fakulte?: {
        createdAt: string;
        updatedAt: string;
        id: string;
        ad: string;
        kod: string;
    } | undefined;
}>;
type Department = z.infer<typeof DepartmentSchema>;

declare const CourseSchema: z.ZodObject<{
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
} & {
    id: z.ZodString;
    kod: z.ZodString;
    ad: z.ZodString;
    sinif: z.ZodNumber;
    donem: z.ZodEnum<["guz", "bahar"]>;
    kredi: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    bolumId: z.ZodString;
    bolum: z.ZodOptional<z.ZodObject<{
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    } & {
        id: z.ZodString;
        ad: z.ZodString;
        kod: z.ZodString;
        fakulteId: z.ZodString;
        fakulte: z.ZodOptional<z.ZodObject<{
            createdAt: z.ZodString;
            updatedAt: z.ZodString;
        } & {
            id: z.ZodString;
            ad: z.ZodString;
            kod: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            createdAt: string;
            updatedAt: string;
            id: string;
            ad: string;
            kod: string;
        }, {
            createdAt: string;
            updatedAt: string;
            id: string;
            ad: string;
            kod: string;
        }>>;
    }, "strip", z.ZodTypeAny, {
        createdAt: string;
        updatedAt: string;
        id: string;
        ad: string;
        kod: string;
        fakulteId: string;
        fakulte?: {
            createdAt: string;
            updatedAt: string;
            id: string;
            ad: string;
            kod: string;
        } | undefined;
    }, {
        createdAt: string;
        updatedAt: string;
        id: string;
        ad: string;
        kod: string;
        fakulteId: string;
        fakulte?: {
            createdAt: string;
            updatedAt: string;
            id: string;
            ad: string;
            kod: string;
        } | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    sinif: number;
    createdAt: string;
    updatedAt: string;
    id: string;
    ad: string;
    kod: string;
    donem: "guz" | "bahar";
    bolumId: string;
    kredi?: number | null | undefined;
    bolum?: {
        createdAt: string;
        updatedAt: string;
        id: string;
        ad: string;
        kod: string;
        fakulteId: string;
        fakulte?: {
            createdAt: string;
            updatedAt: string;
            id: string;
            ad: string;
            kod: string;
        } | undefined;
    } | undefined;
}, {
    sinif: number;
    createdAt: string;
    updatedAt: string;
    id: string;
    ad: string;
    kod: string;
    donem: "guz" | "bahar";
    bolumId: string;
    kredi?: number | null | undefined;
    bolum?: {
        createdAt: string;
        updatedAt: string;
        id: string;
        ad: string;
        kod: string;
        fakulteId: string;
        fakulte?: {
            createdAt: string;
            updatedAt: string;
            id: string;
            ad: string;
            kod: string;
        } | undefined;
    } | undefined;
}>;
type Course = z.infer<typeof CourseSchema>;

declare const RoomSchema: z.ZodObject<{
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
} & {
    id: z.ZodString;
    ad: z.ZodString;
    bina: z.ZodString;
    tip: z.ZodEnum<["amfi", "laboratuvar", "sinif", "toplanti", "diger"]>;
    kapasite: z.ZodNumber;
    fakulteId: z.ZodString;
    fakulte: z.ZodOptional<z.ZodObject<{
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    } & {
        id: z.ZodString;
        ad: z.ZodString;
        kod: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        createdAt: string;
        updatedAt: string;
        id: string;
        ad: string;
        kod: string;
    }, {
        createdAt: string;
        updatedAt: string;
        id: string;
        ad: string;
        kod: string;
    }>>;
}, "strip", z.ZodTypeAny, {
    createdAt: string;
    updatedAt: string;
    id: string;
    ad: string;
    fakulteId: string;
    bina: string;
    tip: "amfi" | "laboratuvar" | "sinif" | "toplanti" | "diger";
    kapasite: number;
    fakulte?: {
        createdAt: string;
        updatedAt: string;
        id: string;
        ad: string;
        kod: string;
    } | undefined;
}, {
    createdAt: string;
    updatedAt: string;
    id: string;
    ad: string;
    fakulteId: string;
    bina: string;
    tip: "amfi" | "laboratuvar" | "sinif" | "toplanti" | "diger";
    kapasite: number;
    fakulte?: {
        createdAt: string;
        updatedAt: string;
        id: string;
        ad: string;
        kod: string;
    } | undefined;
}>;
type Room = z.infer<typeof RoomSchema>;

declare const InstructorSchema: z.ZodObject<{
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
} & {
    id: z.ZodString;
    ad: z.ZodString;
    email: z.ZodString;
    aktif: z.ZodBoolean;
    roller: z.ZodDefault<z.ZodArray<z.ZodEnum<["YONETICI", "BOLUM_SORUMLUSU", "OGRETIM_UYESI"]>, "many">>;
    bolumId: z.ZodString;
    bolum: z.ZodOptional<z.ZodObject<{
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    } & {
        id: z.ZodString;
        ad: z.ZodString;
        kod: z.ZodString;
        fakulteId: z.ZodString;
        fakulte: z.ZodOptional<z.ZodObject<{
            createdAt: z.ZodString;
            updatedAt: z.ZodString;
        } & {
            id: z.ZodString;
            ad: z.ZodString;
            kod: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            createdAt: string;
            updatedAt: string;
            id: string;
            ad: string;
            kod: string;
        }, {
            createdAt: string;
            updatedAt: string;
            id: string;
            ad: string;
            kod: string;
        }>>;
    }, "strip", z.ZodTypeAny, {
        createdAt: string;
        updatedAt: string;
        id: string;
        ad: string;
        kod: string;
        fakulteId: string;
        fakulte?: {
            createdAt: string;
            updatedAt: string;
            id: string;
            ad: string;
            kod: string;
        } | undefined;
    }, {
        createdAt: string;
        updatedAt: string;
        id: string;
        ad: string;
        kod: string;
        fakulteId: string;
        fakulte?: {
            createdAt: string;
            updatedAt: string;
            id: string;
            ad: string;
            kod: string;
        } | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    createdAt: string;
    updatedAt: string;
    id: string;
    ad: string;
    bolumId: string;
    email: string;
    aktif: boolean;
    roller: ("YONETICI" | "BOLUM_SORUMLUSU" | "OGRETIM_UYESI")[];
    bolum?: {
        createdAt: string;
        updatedAt: string;
        id: string;
        ad: string;
        kod: string;
        fakulteId: string;
        fakulte?: {
            createdAt: string;
            updatedAt: string;
            id: string;
            ad: string;
            kod: string;
        } | undefined;
    } | undefined;
}, {
    createdAt: string;
    updatedAt: string;
    id: string;
    ad: string;
    bolumId: string;
    email: string;
    aktif: boolean;
    bolum?: {
        createdAt: string;
        updatedAt: string;
        id: string;
        ad: string;
        kod: string;
        fakulteId: string;
        fakulte?: {
            createdAt: string;
            updatedAt: string;
            id: string;
            ad: string;
            kod: string;
        } | undefined;
    } | undefined;
    roller?: ("YONETICI" | "BOLUM_SORUMLUSU" | "OGRETIM_UYESI")[] | undefined;
}>;
type Instructor = z.infer<typeof InstructorSchema>;

declare const ExamGroupSchema: z.ZodObject<{
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
} & {
    id: z.ZodString;
    ad: z.ZodString;
    aciklama: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    createdAt: string;
    updatedAt: string;
    id: string;
    ad: string;
    aciklama?: string | null | undefined;
}, {
    createdAt: string;
    updatedAt: string;
    id: string;
    ad: string;
    aciklama?: string | null | undefined;
}>;
type ExamGroup = z.infer<typeof ExamGroupSchema>;

declare const ExamInvigilatorRoleEnum: z.ZodEnum<["birincil", "ikincil"]>;
declare const ExamInvigilatorSchema: z.ZodObject<{
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
} & {
    id: z.ZodString;
    sinavId: z.ZodString;
    ogretimUyesiId: z.ZodString;
    rol: z.ZodEnum<["birincil", "ikincil"]>;
    gozetmen: z.ZodOptional<z.ZodObject<{
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    } & {
        id: z.ZodString;
        ad: z.ZodString;
        email: z.ZodString;
        aktif: z.ZodBoolean;
        roller: z.ZodDefault<z.ZodArray<z.ZodEnum<["YONETICI", "BOLUM_SORUMLUSU", "OGRETIM_UYESI"]>, "many">>;
        bolumId: z.ZodString;
        bolum: z.ZodOptional<z.ZodObject<{
            createdAt: z.ZodString;
            updatedAt: z.ZodString;
        } & {
            id: z.ZodString;
            ad: z.ZodString;
            kod: z.ZodString;
            fakulteId: z.ZodString;
            fakulte: z.ZodOptional<z.ZodObject<{
                createdAt: z.ZodString;
                updatedAt: z.ZodString;
            } & {
                id: z.ZodString;
                ad: z.ZodString;
                kod: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                createdAt: string;
                updatedAt: string;
                id: string;
                ad: string;
                kod: string;
            }, {
                createdAt: string;
                updatedAt: string;
                id: string;
                ad: string;
                kod: string;
            }>>;
        }, "strip", z.ZodTypeAny, {
            createdAt: string;
            updatedAt: string;
            id: string;
            ad: string;
            kod: string;
            fakulteId: string;
            fakulte?: {
                createdAt: string;
                updatedAt: string;
                id: string;
                ad: string;
                kod: string;
            } | undefined;
        }, {
            createdAt: string;
            updatedAt: string;
            id: string;
            ad: string;
            kod: string;
            fakulteId: string;
            fakulte?: {
                createdAt: string;
                updatedAt: string;
                id: string;
                ad: string;
                kod: string;
            } | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        createdAt: string;
        updatedAt: string;
        id: string;
        ad: string;
        bolumId: string;
        email: string;
        aktif: boolean;
        roller: ("YONETICI" | "BOLUM_SORUMLUSU" | "OGRETIM_UYESI")[];
        bolum?: {
            createdAt: string;
            updatedAt: string;
            id: string;
            ad: string;
            kod: string;
            fakulteId: string;
            fakulte?: {
                createdAt: string;
                updatedAt: string;
                id: string;
                ad: string;
                kod: string;
            } | undefined;
        } | undefined;
    }, {
        createdAt: string;
        updatedAt: string;
        id: string;
        ad: string;
        bolumId: string;
        email: string;
        aktif: boolean;
        bolum?: {
            createdAt: string;
            updatedAt: string;
            id: string;
            ad: string;
            kod: string;
            fakulteId: string;
            fakulte?: {
                createdAt: string;
                updatedAt: string;
                id: string;
                ad: string;
                kod: string;
            } | undefined;
        } | undefined;
        roller?: ("YONETICI" | "BOLUM_SORUMLUSU" | "OGRETIM_UYESI")[] | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    createdAt: string;
    updatedAt: string;
    id: string;
    sinavId: string;
    ogretimUyesiId: string;
    rol: "birincil" | "ikincil";
    gozetmen?: {
        createdAt: string;
        updatedAt: string;
        id: string;
        ad: string;
        bolumId: string;
        email: string;
        aktif: boolean;
        roller: ("YONETICI" | "BOLUM_SORUMLUSU" | "OGRETIM_UYESI")[];
        bolum?: {
            createdAt: string;
            updatedAt: string;
            id: string;
            ad: string;
            kod: string;
            fakulteId: string;
            fakulte?: {
                createdAt: string;
                updatedAt: string;
                id: string;
                ad: string;
                kod: string;
            } | undefined;
        } | undefined;
    } | undefined;
}, {
    createdAt: string;
    updatedAt: string;
    id: string;
    sinavId: string;
    ogretimUyesiId: string;
    rol: "birincil" | "ikincil";
    gozetmen?: {
        createdAt: string;
        updatedAt: string;
        id: string;
        ad: string;
        bolumId: string;
        email: string;
        aktif: boolean;
        bolum?: {
            createdAt: string;
            updatedAt: string;
            id: string;
            ad: string;
            kod: string;
            fakulteId: string;
            fakulte?: {
                createdAt: string;
                updatedAt: string;
                id: string;
                ad: string;
                kod: string;
            } | undefined;
        } | undefined;
        roller?: ("YONETICI" | "BOLUM_SORUMLUSU" | "OGRETIM_UYESI")[] | undefined;
    } | undefined;
}>;
type ExamInvigilator = z.infer<typeof ExamInvigilatorSchema>;

declare const ExamConflictTurEnum: z.ZodEnum<["derslik", "ogretim-uyesi", "gozetmen", "musait-degil"]>;
declare const ExamConflictSeviyeEnum: z.ZodEnum<["kritik", "uyari"]>;
declare const ExamConflictSchema: z.ZodObject<{
    tur: z.ZodEnum<["derslik", "ogretim-uyesi", "gozetmen", "musait-degil"]>;
    mesaj: z.ZodString;
    seviye: z.ZodEnum<["kritik", "uyari"]>;
    ilgiliId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    tur: "gozetmen" | "derslik" | "ogretim-uyesi" | "musait-degil";
    mesaj: string;
    seviye: "kritik" | "uyari";
    ilgiliId?: string | undefined;
}, {
    tur: "gozetmen" | "derslik" | "ogretim-uyesi" | "musait-degil";
    mesaj: string;
    seviye: "kritik" | "uyari";
    ilgiliId?: string | undefined;
}>;
type ExamConflict = z.infer<typeof ExamConflictSchema>;

declare const ExamSchema: z.ZodObject<{
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
} & {
    id: z.ZodString;
    dersId: z.ZodString;
    ders: z.ZodOptional<z.ZodObject<{
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    } & {
        id: z.ZodString;
        kod: z.ZodString;
        ad: z.ZodString;
        sinif: z.ZodNumber;
        donem: z.ZodEnum<["guz", "bahar"]>;
        kredi: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        bolumId: z.ZodString;
        bolum: z.ZodOptional<z.ZodObject<{
            createdAt: z.ZodString;
            updatedAt: z.ZodString;
        } & {
            id: z.ZodString;
            ad: z.ZodString;
            kod: z.ZodString;
            fakulteId: z.ZodString;
            fakulte: z.ZodOptional<z.ZodObject<{
                createdAt: z.ZodString;
                updatedAt: z.ZodString;
            } & {
                id: z.ZodString;
                ad: z.ZodString;
                kod: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                createdAt: string;
                updatedAt: string;
                id: string;
                ad: string;
                kod: string;
            }, {
                createdAt: string;
                updatedAt: string;
                id: string;
                ad: string;
                kod: string;
            }>>;
        }, "strip", z.ZodTypeAny, {
            createdAt: string;
            updatedAt: string;
            id: string;
            ad: string;
            kod: string;
            fakulteId: string;
            fakulte?: {
                createdAt: string;
                updatedAt: string;
                id: string;
                ad: string;
                kod: string;
            } | undefined;
        }, {
            createdAt: string;
            updatedAt: string;
            id: string;
            ad: string;
            kod: string;
            fakulteId: string;
            fakulte?: {
                createdAt: string;
                updatedAt: string;
                id: string;
                ad: string;
                kod: string;
            } | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        sinif: number;
        createdAt: string;
        updatedAt: string;
        id: string;
        ad: string;
        kod: string;
        donem: "guz" | "bahar";
        bolumId: string;
        kredi?: number | null | undefined;
        bolum?: {
            createdAt: string;
            updatedAt: string;
            id: string;
            ad: string;
            kod: string;
            fakulteId: string;
            fakulte?: {
                createdAt: string;
                updatedAt: string;
                id: string;
                ad: string;
                kod: string;
            } | undefined;
        } | undefined;
    }, {
        sinif: number;
        createdAt: string;
        updatedAt: string;
        id: string;
        ad: string;
        kod: string;
        donem: "guz" | "bahar";
        bolumId: string;
        kredi?: number | null | undefined;
        bolum?: {
            createdAt: string;
            updatedAt: string;
            id: string;
            ad: string;
            kod: string;
            fakulteId: string;
            fakulte?: {
                createdAt: string;
                updatedAt: string;
                id: string;
                ad: string;
                kod: string;
            } | undefined;
        } | undefined;
    }>>;
    donem: z.ZodEnum<["guz", "bahar"]>;
    sinif: z.ZodNumber;
    tur: z.ZodEnum<["sinav", "odev", "proje"]>;
    durum: z.ZodEnum<["planlanmadi", "taslak", "yayinlandi"]>;
    tarih: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    baslangic: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    bitis: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    derslikId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    derslik: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    } & {
        id: z.ZodString;
        ad: z.ZodString;
        bina: z.ZodString;
        tip: z.ZodEnum<["amfi", "laboratuvar", "sinif", "toplanti", "diger"]>;
        kapasite: z.ZodNumber;
        fakulteId: z.ZodString;
        fakulte: z.ZodOptional<z.ZodObject<{
            createdAt: z.ZodString;
            updatedAt: z.ZodString;
        } & {
            id: z.ZodString;
            ad: z.ZodString;
            kod: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            createdAt: string;
            updatedAt: string;
            id: string;
            ad: string;
            kod: string;
        }, {
            createdAt: string;
            updatedAt: string;
            id: string;
            ad: string;
            kod: string;
        }>>;
    }, "strip", z.ZodTypeAny, {
        createdAt: string;
        updatedAt: string;
        id: string;
        ad: string;
        fakulteId: string;
        bina: string;
        tip: "amfi" | "laboratuvar" | "sinif" | "toplanti" | "diger";
        kapasite: number;
        fakulte?: {
            createdAt: string;
            updatedAt: string;
            id: string;
            ad: string;
            kod: string;
        } | undefined;
    }, {
        createdAt: string;
        updatedAt: string;
        id: string;
        ad: string;
        fakulteId: string;
        bina: string;
        tip: "amfi" | "laboratuvar" | "sinif" | "toplanti" | "diger";
        kapasite: number;
        fakulte?: {
            createdAt: string;
            updatedAt: string;
            id: string;
            ad: string;
            kod: string;
        } | undefined;
    }>>>;
    ogretimUyesiId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    ogretimUyesi: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    } & {
        id: z.ZodString;
        ad: z.ZodString;
        email: z.ZodString;
        aktif: z.ZodBoolean;
        roller: z.ZodDefault<z.ZodArray<z.ZodEnum<["YONETICI", "BOLUM_SORUMLUSU", "OGRETIM_UYESI"]>, "many">>;
        bolumId: z.ZodString;
        bolum: z.ZodOptional<z.ZodObject<{
            createdAt: z.ZodString;
            updatedAt: z.ZodString;
        } & {
            id: z.ZodString;
            ad: z.ZodString;
            kod: z.ZodString;
            fakulteId: z.ZodString;
            fakulte: z.ZodOptional<z.ZodObject<{
                createdAt: z.ZodString;
                updatedAt: z.ZodString;
            } & {
                id: z.ZodString;
                ad: z.ZodString;
                kod: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                createdAt: string;
                updatedAt: string;
                id: string;
                ad: string;
                kod: string;
            }, {
                createdAt: string;
                updatedAt: string;
                id: string;
                ad: string;
                kod: string;
            }>>;
        }, "strip", z.ZodTypeAny, {
            createdAt: string;
            updatedAt: string;
            id: string;
            ad: string;
            kod: string;
            fakulteId: string;
            fakulte?: {
                createdAt: string;
                updatedAt: string;
                id: string;
                ad: string;
                kod: string;
            } | undefined;
        }, {
            createdAt: string;
            updatedAt: string;
            id: string;
            ad: string;
            kod: string;
            fakulteId: string;
            fakulte?: {
                createdAt: string;
                updatedAt: string;
                id: string;
                ad: string;
                kod: string;
            } | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        createdAt: string;
        updatedAt: string;
        id: string;
        ad: string;
        bolumId: string;
        email: string;
        aktif: boolean;
        roller: ("YONETICI" | "BOLUM_SORUMLUSU" | "OGRETIM_UYESI")[];
        bolum?: {
            createdAt: string;
            updatedAt: string;
            id: string;
            ad: string;
            kod: string;
            fakulteId: string;
            fakulte?: {
                createdAt: string;
                updatedAt: string;
                id: string;
                ad: string;
                kod: string;
            } | undefined;
        } | undefined;
    }, {
        createdAt: string;
        updatedAt: string;
        id: string;
        ad: string;
        bolumId: string;
        email: string;
        aktif: boolean;
        bolum?: {
            createdAt: string;
            updatedAt: string;
            id: string;
            ad: string;
            kod: string;
            fakulteId: string;
            fakulte?: {
                createdAt: string;
                updatedAt: string;
                id: string;
                ad: string;
                kod: string;
            } | undefined;
        } | undefined;
        roller?: ("YONETICI" | "BOLUM_SORUMLUSU" | "OGRETIM_UYESI")[] | undefined;
    }>>>;
    ortakGrupId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    ortakGrup: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    } & {
        id: z.ZodString;
        ad: z.ZodString;
        aciklama: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        createdAt: string;
        updatedAt: string;
        id: string;
        ad: string;
        aciklama?: string | null | undefined;
    }, {
        createdAt: string;
        updatedAt: string;
        id: string;
        ad: string;
        aciklama?: string | null | undefined;
    }>>>;
    gozetmenler: z.ZodOptional<z.ZodArray<z.ZodObject<{
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    } & {
        id: z.ZodString;
        sinavId: z.ZodString;
        ogretimUyesiId: z.ZodString;
        rol: z.ZodEnum<["birincil", "ikincil"]>;
        gozetmen: z.ZodOptional<z.ZodObject<{
            createdAt: z.ZodString;
            updatedAt: z.ZodString;
        } & {
            id: z.ZodString;
            ad: z.ZodString;
            email: z.ZodString;
            aktif: z.ZodBoolean;
            roller: z.ZodDefault<z.ZodArray<z.ZodEnum<["YONETICI", "BOLUM_SORUMLUSU", "OGRETIM_UYESI"]>, "many">>;
            bolumId: z.ZodString;
            bolum: z.ZodOptional<z.ZodObject<{
                createdAt: z.ZodString;
                updatedAt: z.ZodString;
            } & {
                id: z.ZodString;
                ad: z.ZodString;
                kod: z.ZodString;
                fakulteId: z.ZodString;
                fakulte: z.ZodOptional<z.ZodObject<{
                    createdAt: z.ZodString;
                    updatedAt: z.ZodString;
                } & {
                    id: z.ZodString;
                    ad: z.ZodString;
                    kod: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    createdAt: string;
                    updatedAt: string;
                    id: string;
                    ad: string;
                    kod: string;
                }, {
                    createdAt: string;
                    updatedAt: string;
                    id: string;
                    ad: string;
                    kod: string;
                }>>;
            }, "strip", z.ZodTypeAny, {
                createdAt: string;
                updatedAt: string;
                id: string;
                ad: string;
                kod: string;
                fakulteId: string;
                fakulte?: {
                    createdAt: string;
                    updatedAt: string;
                    id: string;
                    ad: string;
                    kod: string;
                } | undefined;
            }, {
                createdAt: string;
                updatedAt: string;
                id: string;
                ad: string;
                kod: string;
                fakulteId: string;
                fakulte?: {
                    createdAt: string;
                    updatedAt: string;
                    id: string;
                    ad: string;
                    kod: string;
                } | undefined;
            }>>;
        }, "strip", z.ZodTypeAny, {
            createdAt: string;
            updatedAt: string;
            id: string;
            ad: string;
            bolumId: string;
            email: string;
            aktif: boolean;
            roller: ("YONETICI" | "BOLUM_SORUMLUSU" | "OGRETIM_UYESI")[];
            bolum?: {
                createdAt: string;
                updatedAt: string;
                id: string;
                ad: string;
                kod: string;
                fakulteId: string;
                fakulte?: {
                    createdAt: string;
                    updatedAt: string;
                    id: string;
                    ad: string;
                    kod: string;
                } | undefined;
            } | undefined;
        }, {
            createdAt: string;
            updatedAt: string;
            id: string;
            ad: string;
            bolumId: string;
            email: string;
            aktif: boolean;
            bolum?: {
                createdAt: string;
                updatedAt: string;
                id: string;
                ad: string;
                kod: string;
                fakulteId: string;
                fakulte?: {
                    createdAt: string;
                    updatedAt: string;
                    id: string;
                    ad: string;
                    kod: string;
                } | undefined;
            } | undefined;
            roller?: ("YONETICI" | "BOLUM_SORUMLUSU" | "OGRETIM_UYESI")[] | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        createdAt: string;
        updatedAt: string;
        id: string;
        sinavId: string;
        ogretimUyesiId: string;
        rol: "birincil" | "ikincil";
        gozetmen?: {
            createdAt: string;
            updatedAt: string;
            id: string;
            ad: string;
            bolumId: string;
            email: string;
            aktif: boolean;
            roller: ("YONETICI" | "BOLUM_SORUMLUSU" | "OGRETIM_UYESI")[];
            bolum?: {
                createdAt: string;
                updatedAt: string;
                id: string;
                ad: string;
                kod: string;
                fakulteId: string;
                fakulte?: {
                    createdAt: string;
                    updatedAt: string;
                    id: string;
                    ad: string;
                    kod: string;
                } | undefined;
            } | undefined;
        } | undefined;
    }, {
        createdAt: string;
        updatedAt: string;
        id: string;
        sinavId: string;
        ogretimUyesiId: string;
        rol: "birincil" | "ikincil";
        gozetmen?: {
            createdAt: string;
            updatedAt: string;
            id: string;
            ad: string;
            bolumId: string;
            email: string;
            aktif: boolean;
            bolum?: {
                createdAt: string;
                updatedAt: string;
                id: string;
                ad: string;
                kod: string;
                fakulteId: string;
                fakulte?: {
                    createdAt: string;
                    updatedAt: string;
                    id: string;
                    ad: string;
                    kod: string;
                } | undefined;
            } | undefined;
            roller?: ("YONETICI" | "BOLUM_SORUMLUSU" | "OGRETIM_UYESI")[] | undefined;
        } | undefined;
    }>, "many">>;
    onayli: z.ZodDefault<z.ZodBoolean>;
    notlar: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    teslimLinki: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    teslimTarihi: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    sinif: number;
    createdAt: string;
    updatedAt: string;
    id: string;
    donem: "guz" | "bahar";
    tur: "sinav" | "odev" | "proje";
    dersId: string;
    durum: "planlanmadi" | "taslak" | "yayinlandi";
    onayli: boolean;
    ogretimUyesiId?: string | null | undefined;
    derslik?: {
        createdAt: string;
        updatedAt: string;
        id: string;
        ad: string;
        fakulteId: string;
        bina: string;
        tip: "amfi" | "laboratuvar" | "sinif" | "toplanti" | "diger";
        kapasite: number;
        fakulte?: {
            createdAt: string;
            updatedAt: string;
            id: string;
            ad: string;
            kod: string;
        } | undefined;
    } | null | undefined;
    ders?: {
        sinif: number;
        createdAt: string;
        updatedAt: string;
        id: string;
        ad: string;
        kod: string;
        donem: "guz" | "bahar";
        bolumId: string;
        kredi?: number | null | undefined;
        bolum?: {
            createdAt: string;
            updatedAt: string;
            id: string;
            ad: string;
            kod: string;
            fakulteId: string;
            fakulte?: {
                createdAt: string;
                updatedAt: string;
                id: string;
                ad: string;
                kod: string;
            } | undefined;
        } | undefined;
    } | undefined;
    tarih?: string | null | undefined;
    baslangic?: string | null | undefined;
    bitis?: string | null | undefined;
    derslikId?: string | null | undefined;
    ogretimUyesi?: {
        createdAt: string;
        updatedAt: string;
        id: string;
        ad: string;
        bolumId: string;
        email: string;
        aktif: boolean;
        roller: ("YONETICI" | "BOLUM_SORUMLUSU" | "OGRETIM_UYESI")[];
        bolum?: {
            createdAt: string;
            updatedAt: string;
            id: string;
            ad: string;
            kod: string;
            fakulteId: string;
            fakulte?: {
                createdAt: string;
                updatedAt: string;
                id: string;
                ad: string;
                kod: string;
            } | undefined;
        } | undefined;
    } | null | undefined;
    ortakGrupId?: string | null | undefined;
    ortakGrup?: {
        createdAt: string;
        updatedAt: string;
        id: string;
        ad: string;
        aciklama?: string | null | undefined;
    } | null | undefined;
    gozetmenler?: {
        createdAt: string;
        updatedAt: string;
        id: string;
        sinavId: string;
        ogretimUyesiId: string;
        rol: "birincil" | "ikincil";
        gozetmen?: {
            createdAt: string;
            updatedAt: string;
            id: string;
            ad: string;
            bolumId: string;
            email: string;
            aktif: boolean;
            roller: ("YONETICI" | "BOLUM_SORUMLUSU" | "OGRETIM_UYESI")[];
            bolum?: {
                createdAt: string;
                updatedAt: string;
                id: string;
                ad: string;
                kod: string;
                fakulteId: string;
                fakulte?: {
                    createdAt: string;
                    updatedAt: string;
                    id: string;
                    ad: string;
                    kod: string;
                } | undefined;
            } | undefined;
        } | undefined;
    }[] | undefined;
    notlar?: string | null | undefined;
    teslimLinki?: string | null | undefined;
    teslimTarihi?: string | null | undefined;
}, {
    sinif: number;
    createdAt: string;
    updatedAt: string;
    id: string;
    donem: "guz" | "bahar";
    tur: "sinav" | "odev" | "proje";
    dersId: string;
    durum: "planlanmadi" | "taslak" | "yayinlandi";
    ogretimUyesiId?: string | null | undefined;
    derslik?: {
        createdAt: string;
        updatedAt: string;
        id: string;
        ad: string;
        fakulteId: string;
        bina: string;
        tip: "amfi" | "laboratuvar" | "sinif" | "toplanti" | "diger";
        kapasite: number;
        fakulte?: {
            createdAt: string;
            updatedAt: string;
            id: string;
            ad: string;
            kod: string;
        } | undefined;
    } | null | undefined;
    ders?: {
        sinif: number;
        createdAt: string;
        updatedAt: string;
        id: string;
        ad: string;
        kod: string;
        donem: "guz" | "bahar";
        bolumId: string;
        kredi?: number | null | undefined;
        bolum?: {
            createdAt: string;
            updatedAt: string;
            id: string;
            ad: string;
            kod: string;
            fakulteId: string;
            fakulte?: {
                createdAt: string;
                updatedAt: string;
                id: string;
                ad: string;
                kod: string;
            } | undefined;
        } | undefined;
    } | undefined;
    tarih?: string | null | undefined;
    baslangic?: string | null | undefined;
    bitis?: string | null | undefined;
    derslikId?: string | null | undefined;
    ogretimUyesi?: {
        createdAt: string;
        updatedAt: string;
        id: string;
        ad: string;
        bolumId: string;
        email: string;
        aktif: boolean;
        bolum?: {
            createdAt: string;
            updatedAt: string;
            id: string;
            ad: string;
            kod: string;
            fakulteId: string;
            fakulte?: {
                createdAt: string;
                updatedAt: string;
                id: string;
                ad: string;
                kod: string;
            } | undefined;
        } | undefined;
        roller?: ("YONETICI" | "BOLUM_SORUMLUSU" | "OGRETIM_UYESI")[] | undefined;
    } | null | undefined;
    ortakGrupId?: string | null | undefined;
    ortakGrup?: {
        createdAt: string;
        updatedAt: string;
        id: string;
        ad: string;
        aciklama?: string | null | undefined;
    } | null | undefined;
    gozetmenler?: {
        createdAt: string;
        updatedAt: string;
        id: string;
        sinavId: string;
        ogretimUyesiId: string;
        rol: "birincil" | "ikincil";
        gozetmen?: {
            createdAt: string;
            updatedAt: string;
            id: string;
            ad: string;
            bolumId: string;
            email: string;
            aktif: boolean;
            bolum?: {
                createdAt: string;
                updatedAt: string;
                id: string;
                ad: string;
                kod: string;
                fakulteId: string;
                fakulte?: {
                    createdAt: string;
                    updatedAt: string;
                    id: string;
                    ad: string;
                    kod: string;
                } | undefined;
            } | undefined;
            roller?: ("YONETICI" | "BOLUM_SORUMLUSU" | "OGRETIM_UYESI")[] | undefined;
        } | undefined;
    }[] | undefined;
    onayli?: boolean | undefined;
    notlar?: string | null | undefined;
    teslimLinki?: string | null | undefined;
    teslimTarihi?: string | null | undefined;
}>;
type Exam = z.infer<typeof ExamSchema>;

declare const UnavailabilitySourceEnum: z.ZodEnum<["manuel", "csv", "kural"]>;
declare const InstructorUnavailabilitySchema: z.ZodObject<{
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
} & {
    id: z.ZodString;
    ogretimUyesiId: z.ZodString;
    baslangic: z.ZodString;
    bitis: z.ZodString;
    neden: z.ZodString;
    kaynak: z.ZodDefault<z.ZodEnum<["manuel", "csv", "kural"]>>;
    overrideEdildi: z.ZodDefault<z.ZodBoolean>;
    ogretimUyesi: z.ZodOptional<z.ZodObject<{
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    } & {
        id: z.ZodString;
        ad: z.ZodString;
        email: z.ZodString;
        aktif: z.ZodBoolean;
        roller: z.ZodDefault<z.ZodArray<z.ZodEnum<["YONETICI", "BOLUM_SORUMLUSU", "OGRETIM_UYESI"]>, "many">>;
        bolumId: z.ZodString;
        bolum: z.ZodOptional<z.ZodObject<{
            createdAt: z.ZodString;
            updatedAt: z.ZodString;
        } & {
            id: z.ZodString;
            ad: z.ZodString;
            kod: z.ZodString;
            fakulteId: z.ZodString;
            fakulte: z.ZodOptional<z.ZodObject<{
                createdAt: z.ZodString;
                updatedAt: z.ZodString;
            } & {
                id: z.ZodString;
                ad: z.ZodString;
                kod: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                createdAt: string;
                updatedAt: string;
                id: string;
                ad: string;
                kod: string;
            }, {
                createdAt: string;
                updatedAt: string;
                id: string;
                ad: string;
                kod: string;
            }>>;
        }, "strip", z.ZodTypeAny, {
            createdAt: string;
            updatedAt: string;
            id: string;
            ad: string;
            kod: string;
            fakulteId: string;
            fakulte?: {
                createdAt: string;
                updatedAt: string;
                id: string;
                ad: string;
                kod: string;
            } | undefined;
        }, {
            createdAt: string;
            updatedAt: string;
            id: string;
            ad: string;
            kod: string;
            fakulteId: string;
            fakulte?: {
                createdAt: string;
                updatedAt: string;
                id: string;
                ad: string;
                kod: string;
            } | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        createdAt: string;
        updatedAt: string;
        id: string;
        ad: string;
        bolumId: string;
        email: string;
        aktif: boolean;
        roller: ("YONETICI" | "BOLUM_SORUMLUSU" | "OGRETIM_UYESI")[];
        bolum?: {
            createdAt: string;
            updatedAt: string;
            id: string;
            ad: string;
            kod: string;
            fakulteId: string;
            fakulte?: {
                createdAt: string;
                updatedAt: string;
                id: string;
                ad: string;
                kod: string;
            } | undefined;
        } | undefined;
    }, {
        createdAt: string;
        updatedAt: string;
        id: string;
        ad: string;
        bolumId: string;
        email: string;
        aktif: boolean;
        bolum?: {
            createdAt: string;
            updatedAt: string;
            id: string;
            ad: string;
            kod: string;
            fakulteId: string;
            fakulte?: {
                createdAt: string;
                updatedAt: string;
                id: string;
                ad: string;
                kod: string;
            } | undefined;
        } | undefined;
        roller?: ("YONETICI" | "BOLUM_SORUMLUSU" | "OGRETIM_UYESI")[] | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    createdAt: string;
    updatedAt: string;
    id: string;
    ogretimUyesiId: string;
    baslangic: string;
    bitis: string;
    neden: string;
    kaynak: "manuel" | "csv" | "kural";
    overrideEdildi: boolean;
    ogretimUyesi?: {
        createdAt: string;
        updatedAt: string;
        id: string;
        ad: string;
        bolumId: string;
        email: string;
        aktif: boolean;
        roller: ("YONETICI" | "BOLUM_SORUMLUSU" | "OGRETIM_UYESI")[];
        bolum?: {
            createdAt: string;
            updatedAt: string;
            id: string;
            ad: string;
            kod: string;
            fakulteId: string;
            fakulte?: {
                createdAt: string;
                updatedAt: string;
                id: string;
                ad: string;
                kod: string;
            } | undefined;
        } | undefined;
    } | undefined;
}, {
    createdAt: string;
    updatedAt: string;
    id: string;
    ogretimUyesiId: string;
    baslangic: string;
    bitis: string;
    neden: string;
    ogretimUyesi?: {
        createdAt: string;
        updatedAt: string;
        id: string;
        ad: string;
        bolumId: string;
        email: string;
        aktif: boolean;
        bolum?: {
            createdAt: string;
            updatedAt: string;
            id: string;
            ad: string;
            kod: string;
            fakulteId: string;
            fakulte?: {
                createdAt: string;
                updatedAt: string;
                id: string;
                ad: string;
                kod: string;
            } | undefined;
        } | undefined;
        roller?: ("YONETICI" | "BOLUM_SORUMLUSU" | "OGRETIM_UYESI")[] | undefined;
    } | undefined;
    kaynak?: "manuel" | "csv" | "kural" | undefined;
    overrideEdildi?: boolean | undefined;
}>;
type InstructorUnavailability = z.infer<typeof InstructorUnavailabilitySchema>;

declare const UserSchema: z.ZodObject<{
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
} & {
    id: z.ZodString;
    email: z.ZodString;
    rol: z.ZodEnum<["YONETICI", "BOLUM_SORUMLUSU", "OGRETIM_UYESI"]>;
    aktif: z.ZodBoolean;
    ogretimUyesiId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    ogretimUyesi: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    } & {
        id: z.ZodString;
        ad: z.ZodString;
        email: z.ZodString;
        aktif: z.ZodBoolean;
        roller: z.ZodDefault<z.ZodArray<z.ZodEnum<["YONETICI", "BOLUM_SORUMLUSU", "OGRETIM_UYESI"]>, "many">>;
        bolumId: z.ZodString;
        bolum: z.ZodOptional<z.ZodObject<{
            createdAt: z.ZodString;
            updatedAt: z.ZodString;
        } & {
            id: z.ZodString;
            ad: z.ZodString;
            kod: z.ZodString;
            fakulteId: z.ZodString;
            fakulte: z.ZodOptional<z.ZodObject<{
                createdAt: z.ZodString;
                updatedAt: z.ZodString;
            } & {
                id: z.ZodString;
                ad: z.ZodString;
                kod: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                createdAt: string;
                updatedAt: string;
                id: string;
                ad: string;
                kod: string;
            }, {
                createdAt: string;
                updatedAt: string;
                id: string;
                ad: string;
                kod: string;
            }>>;
        }, "strip", z.ZodTypeAny, {
            createdAt: string;
            updatedAt: string;
            id: string;
            ad: string;
            kod: string;
            fakulteId: string;
            fakulte?: {
                createdAt: string;
                updatedAt: string;
                id: string;
                ad: string;
                kod: string;
            } | undefined;
        }, {
            createdAt: string;
            updatedAt: string;
            id: string;
            ad: string;
            kod: string;
            fakulteId: string;
            fakulte?: {
                createdAt: string;
                updatedAt: string;
                id: string;
                ad: string;
                kod: string;
            } | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        createdAt: string;
        updatedAt: string;
        id: string;
        ad: string;
        bolumId: string;
        email: string;
        aktif: boolean;
        roller: ("YONETICI" | "BOLUM_SORUMLUSU" | "OGRETIM_UYESI")[];
        bolum?: {
            createdAt: string;
            updatedAt: string;
            id: string;
            ad: string;
            kod: string;
            fakulteId: string;
            fakulte?: {
                createdAt: string;
                updatedAt: string;
                id: string;
                ad: string;
                kod: string;
            } | undefined;
        } | undefined;
    }, {
        createdAt: string;
        updatedAt: string;
        id: string;
        ad: string;
        bolumId: string;
        email: string;
        aktif: boolean;
        bolum?: {
            createdAt: string;
            updatedAt: string;
            id: string;
            ad: string;
            kod: string;
            fakulteId: string;
            fakulte?: {
                createdAt: string;
                updatedAt: string;
                id: string;
                ad: string;
                kod: string;
            } | undefined;
        } | undefined;
        roller?: ("YONETICI" | "BOLUM_SORUMLUSU" | "OGRETIM_UYESI")[] | undefined;
    }>>>;
}, "strip", z.ZodTypeAny, {
    createdAt: string;
    updatedAt: string;
    id: string;
    email: string;
    aktif: boolean;
    rol: "YONETICI" | "BOLUM_SORUMLUSU" | "OGRETIM_UYESI";
    ogretimUyesiId?: string | null | undefined;
    ogretimUyesi?: {
        createdAt: string;
        updatedAt: string;
        id: string;
        ad: string;
        bolumId: string;
        email: string;
        aktif: boolean;
        roller: ("YONETICI" | "BOLUM_SORUMLUSU" | "OGRETIM_UYESI")[];
        bolum?: {
            createdAt: string;
            updatedAt: string;
            id: string;
            ad: string;
            kod: string;
            fakulteId: string;
            fakulte?: {
                createdAt: string;
                updatedAt: string;
                id: string;
                ad: string;
                kod: string;
            } | undefined;
        } | undefined;
    } | null | undefined;
}, {
    createdAt: string;
    updatedAt: string;
    id: string;
    email: string;
    aktif: boolean;
    rol: "YONETICI" | "BOLUM_SORUMLUSU" | "OGRETIM_UYESI";
    ogretimUyesiId?: string | null | undefined;
    ogretimUyesi?: {
        createdAt: string;
        updatedAt: string;
        id: string;
        ad: string;
        bolumId: string;
        email: string;
        aktif: boolean;
        bolum?: {
            createdAt: string;
            updatedAt: string;
            id: string;
            ad: string;
            kod: string;
            fakulteId: string;
            fakulte?: {
                createdAt: string;
                updatedAt: string;
                id: string;
                ad: string;
                kod: string;
            } | undefined;
        } | undefined;
        roller?: ("YONETICI" | "BOLUM_SORUMLUSU" | "OGRETIM_UYESI")[] | undefined;
    } | null | undefined;
}>;
type User = z.infer<typeof UserSchema>;

declare const InvigilatorLoadItemSchema: z.ZodObject<{
    ogretimUyesiId: z.ZodString;
    ad: z.ZodString;
    email: z.ZodOptional<z.ZodString>;
    bolum: z.ZodOptional<z.ZodString>;
    fakulte: z.ZodOptional<z.ZodString>;
    toplamDakika: z.ZodNumber;
    toplamSaat: z.ZodNumber;
    sinavSayisi: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    ad: string;
    ogretimUyesiId: string;
    toplamDakika: number;
    toplamSaat: number;
    sinavSayisi: number;
    fakulte?: string | undefined;
    bolum?: string | undefined;
    email?: string | undefined;
}, {
    ad: string;
    ogretimUyesiId: string;
    toplamDakika: number;
    toplamSaat: number;
    sinavSayisi: number;
    fakulte?: string | undefined;
    bolum?: string | undefined;
    email?: string | undefined;
}>;
declare const InvigilatorLoadExamSchema: z.ZodObject<{
    sinavId: z.ZodString;
    tarih: z.ZodNullable<z.ZodString>;
    baslangic: z.ZodNullable<z.ZodString>;
    bitis: z.ZodNullable<z.ZodString>;
    ders: z.ZodNullable<z.ZodString>;
    dersKod: z.ZodNullable<z.ZodString>;
    bolum: z.ZodNullable<z.ZodString>;
    derslik: z.ZodNullable<z.ZodString>;
    sureDakika: z.ZodNumber;
    gozetmenRol: z.ZodEnum<["birincil", "ikincil"]>;
    ortakGrupEtiketi: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    bolum: string | null;
    sinavId: string;
    derslik: string | null;
    ders: string | null;
    tarih: string | null;
    baslangic: string | null;
    bitis: string | null;
    dersKod: string | null;
    sureDakika: number;
    gozetmenRol: "birincil" | "ikincil";
    ortakGrupEtiketi?: string | undefined;
}, {
    bolum: string | null;
    sinavId: string;
    derslik: string | null;
    ders: string | null;
    tarih: string | null;
    baslangic: string | null;
    bitis: string | null;
    dersKod: string | null;
    sureDakika: number;
    gozetmenRol: "birincil" | "ikincil";
    ortakGrupEtiketi?: string | undefined;
}>;
declare const InvigilatorLoadDetailSchema: z.ZodObject<{
    ogretimUyesi: z.ZodObject<{
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    } & {
        id: z.ZodString;
        ad: z.ZodString;
        email: z.ZodString;
        aktif: z.ZodBoolean;
        roller: z.ZodDefault<z.ZodArray<z.ZodEnum<["YONETICI", "BOLUM_SORUMLUSU", "OGRETIM_UYESI"]>, "many">>;
        bolumId: z.ZodString;
        bolum: z.ZodOptional<z.ZodObject<{
            createdAt: z.ZodString;
            updatedAt: z.ZodString;
        } & {
            id: z.ZodString;
            ad: z.ZodString;
            kod: z.ZodString;
            fakulteId: z.ZodString;
            fakulte: z.ZodOptional<z.ZodObject<{
                createdAt: z.ZodString;
                updatedAt: z.ZodString;
            } & {
                id: z.ZodString;
                ad: z.ZodString;
                kod: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                createdAt: string;
                updatedAt: string;
                id: string;
                ad: string;
                kod: string;
            }, {
                createdAt: string;
                updatedAt: string;
                id: string;
                ad: string;
                kod: string;
            }>>;
        }, "strip", z.ZodTypeAny, {
            createdAt: string;
            updatedAt: string;
            id: string;
            ad: string;
            kod: string;
            fakulteId: string;
            fakulte?: {
                createdAt: string;
                updatedAt: string;
                id: string;
                ad: string;
                kod: string;
            } | undefined;
        }, {
            createdAt: string;
            updatedAt: string;
            id: string;
            ad: string;
            kod: string;
            fakulteId: string;
            fakulte?: {
                createdAt: string;
                updatedAt: string;
                id: string;
                ad: string;
                kod: string;
            } | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        createdAt: string;
        updatedAt: string;
        id: string;
        ad: string;
        bolumId: string;
        email: string;
        aktif: boolean;
        roller: ("YONETICI" | "BOLUM_SORUMLUSU" | "OGRETIM_UYESI")[];
        bolum?: {
            createdAt: string;
            updatedAt: string;
            id: string;
            ad: string;
            kod: string;
            fakulteId: string;
            fakulte?: {
                createdAt: string;
                updatedAt: string;
                id: string;
                ad: string;
                kod: string;
            } | undefined;
        } | undefined;
    }, {
        createdAt: string;
        updatedAt: string;
        id: string;
        ad: string;
        bolumId: string;
        email: string;
        aktif: boolean;
        bolum?: {
            createdAt: string;
            updatedAt: string;
            id: string;
            ad: string;
            kod: string;
            fakulteId: string;
            fakulte?: {
                createdAt: string;
                updatedAt: string;
                id: string;
                ad: string;
                kod: string;
            } | undefined;
        } | undefined;
        roller?: ("YONETICI" | "BOLUM_SORUMLUSU" | "OGRETIM_UYESI")[] | undefined;
    }>;
    toplamDakika: z.ZodNumber;
    toplamSaat: z.ZodNumber;
    sinavSayisi: z.ZodNumber;
    cakismalar: z.ZodArray<z.ZodString, "many">;
    zamanDilimi: z.ZodString;
    sinavlar: z.ZodArray<z.ZodObject<{
        sinavId: z.ZodString;
        tarih: z.ZodNullable<z.ZodString>;
        baslangic: z.ZodNullable<z.ZodString>;
        bitis: z.ZodNullable<z.ZodString>;
        ders: z.ZodNullable<z.ZodString>;
        dersKod: z.ZodNullable<z.ZodString>;
        bolum: z.ZodNullable<z.ZodString>;
        derslik: z.ZodNullable<z.ZodString>;
        sureDakika: z.ZodNumber;
        gozetmenRol: z.ZodEnum<["birincil", "ikincil"]>;
        ortakGrupEtiketi: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        bolum: string | null;
        sinavId: string;
        derslik: string | null;
        ders: string | null;
        tarih: string | null;
        baslangic: string | null;
        bitis: string | null;
        dersKod: string | null;
        sureDakika: number;
        gozetmenRol: "birincil" | "ikincil";
        ortakGrupEtiketi?: string | undefined;
    }, {
        bolum: string | null;
        sinavId: string;
        derslik: string | null;
        ders: string | null;
        tarih: string | null;
        baslangic: string | null;
        bitis: string | null;
        dersKod: string | null;
        sureDakika: number;
        gozetmenRol: "birincil" | "ikincil";
        ortakGrupEtiketi?: string | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    ogretimUyesi: {
        createdAt: string;
        updatedAt: string;
        id: string;
        ad: string;
        bolumId: string;
        email: string;
        aktif: boolean;
        roller: ("YONETICI" | "BOLUM_SORUMLUSU" | "OGRETIM_UYESI")[];
        bolum?: {
            createdAt: string;
            updatedAt: string;
            id: string;
            ad: string;
            kod: string;
            fakulteId: string;
            fakulte?: {
                createdAt: string;
                updatedAt: string;
                id: string;
                ad: string;
                kod: string;
            } | undefined;
        } | undefined;
    };
    toplamDakika: number;
    toplamSaat: number;
    sinavSayisi: number;
    cakismalar: string[];
    zamanDilimi: string;
    sinavlar: {
        bolum: string | null;
        sinavId: string;
        derslik: string | null;
        ders: string | null;
        tarih: string | null;
        baslangic: string | null;
        bitis: string | null;
        dersKod: string | null;
        sureDakika: number;
        gozetmenRol: "birincil" | "ikincil";
        ortakGrupEtiketi?: string | undefined;
    }[];
}, {
    ogretimUyesi: {
        createdAt: string;
        updatedAt: string;
        id: string;
        ad: string;
        bolumId: string;
        email: string;
        aktif: boolean;
        bolum?: {
            createdAt: string;
            updatedAt: string;
            id: string;
            ad: string;
            kod: string;
            fakulteId: string;
            fakulte?: {
                createdAt: string;
                updatedAt: string;
                id: string;
                ad: string;
                kod: string;
            } | undefined;
        } | undefined;
        roller?: ("YONETICI" | "BOLUM_SORUMLUSU" | "OGRETIM_UYESI")[] | undefined;
    };
    toplamDakika: number;
    toplamSaat: number;
    sinavSayisi: number;
    cakismalar: string[];
    zamanDilimi: string;
    sinavlar: {
        bolum: string | null;
        sinavId: string;
        derslik: string | null;
        ders: string | null;
        tarih: string | null;
        baslangic: string | null;
        bitis: string | null;
        dersKod: string | null;
        sureDakika: number;
        gozetmenRol: "birincil" | "ikincil";
        ortakGrupEtiketi?: string | undefined;
    }[];
}>;
type InvigilatorLoadItem = z.infer<typeof InvigilatorLoadItemSchema>;
type InvigilatorLoadDetail = z.infer<typeof InvigilatorLoadDetailSchema>;

export { type Course, CourseSchema, DERSLIK_TIPLERI, DERSLIK_TIP_LISTESI, DONEMLER, DONEMLER_LIST, type Department, DepartmentSchema, type DerslikTip, DerslikTipEnum, type Donem, DonemEnum, EXAM_DURUMLARI, EXAM_DURUM_LISTESI, EXAM_TURLERI, EXAM_TUR_LISTESI, type EntityId, type Exam, type ExamConflict, ExamConflictSchema, ExamConflictSeviyeEnum, ExamConflictTurEnum, type ExamDurum, ExamDurumEnum, type ExamGroup, ExamGroupSchema, type ExamInvigilator, ExamInvigilatorRoleEnum, ExamInvigilatorSchema, ExamSchema, type ExamTur, ExamTurEnum, type Faculty, FacultySchema, GUNLER, GUN_LISTESI, type Gun, GunEnum, IdSchema, type Instructor, InstructorSchema, type InstructorUnavailability, InstructorUnavailabilitySchema, type InvigilatorLoadDetail, InvigilatorLoadDetailSchema, InvigilatorLoadExamSchema, type InvigilatorLoadItem, InvigilatorLoadItemSchema, KULLANICI_ROLLERI, KULLANICI_ROL_LISTESI, type KullaniciRol, KullaniciRolEnum, type Room, RoomSchema, TimestampSchema, UnavailabilitySourceEnum, type User, UserSchema, type WithTimestamps, WithTimestampsSchema };
