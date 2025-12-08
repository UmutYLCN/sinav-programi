import { z } from 'zod';
export declare const CourseSchema: z.ZodObject<{
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
export type Course = z.infer<typeof CourseSchema>;
