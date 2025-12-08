import { z } from 'zod';
export declare const RoomSchema: z.ZodObject<{
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
export type Room = z.infer<typeof RoomSchema>;
