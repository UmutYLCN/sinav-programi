import { z } from 'zod';
export declare const ExamInvigilatorRoleEnum: z.ZodEnum<["birincil", "ikincil"]>;
export declare const ExamInvigilatorSchema: z.ZodObject<{
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
export type ExamInvigilator = z.infer<typeof ExamInvigilatorSchema>;
