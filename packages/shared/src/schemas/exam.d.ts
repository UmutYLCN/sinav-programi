import { z } from 'zod';
export declare const ExamSchema: z.ZodObject<{
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
export type Exam = z.infer<typeof ExamSchema>;
