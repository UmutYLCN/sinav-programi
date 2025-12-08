import { z } from 'zod';
export declare const IdSchema: z.ZodString;
export type EntityId = z.infer<typeof IdSchema>;
export declare const TimestampSchema: z.ZodString;
export declare const WithTimestampsSchema: z.ZodObject<{
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    createdAt: string;
    updatedAt: string;
}, {
    createdAt: string;
    updatedAt: string;
}>;
export type WithTimestamps = z.infer<typeof WithTimestampsSchema>;
