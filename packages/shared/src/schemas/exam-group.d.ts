import { z } from 'zod';
export declare const ExamGroupSchema: z.ZodObject<{
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
export type ExamGroup = z.infer<typeof ExamGroupSchema>;
