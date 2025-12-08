import { z } from 'zod';
export declare const DepartmentSchema: z.ZodObject<{
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
export type Department = z.infer<typeof DepartmentSchema>;
