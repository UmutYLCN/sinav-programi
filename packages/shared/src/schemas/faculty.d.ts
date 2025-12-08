import { z } from 'zod';
export declare const FacultySchema: z.ZodObject<{
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
export type Faculty = z.infer<typeof FacultySchema>;
