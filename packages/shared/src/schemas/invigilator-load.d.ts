import { z } from 'zod';
export declare const InvigilatorLoadItemSchema: z.ZodObject<{
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
export declare const InvigilatorLoadExamSchema: z.ZodObject<{
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
export declare const InvigilatorLoadDetailSchema: z.ZodObject<{
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
export type InvigilatorLoadItem = z.infer<typeof InvigilatorLoadItemSchema>;
export type InvigilatorLoadDetail = z.infer<typeof InvigilatorLoadDetailSchema>;
