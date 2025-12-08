import { z } from 'zod';
export declare const UserSchema: z.ZodObject<{
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
export type User = z.infer<typeof UserSchema>;
