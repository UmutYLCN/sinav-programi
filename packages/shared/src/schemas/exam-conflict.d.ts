import { z } from 'zod';
export declare const ExamConflictTurEnum: z.ZodEnum<["derslik", "ogretim-uyesi", "gozetmen", "musait-degil"]>;
export declare const ExamConflictSeviyeEnum: z.ZodEnum<["kritik", "uyari"]>;
export declare const ExamConflictSchema: z.ZodObject<{
    tur: z.ZodEnum<["derslik", "ogretim-uyesi", "gozetmen", "musait-degil"]>;
    mesaj: z.ZodString;
    seviye: z.ZodEnum<["kritik", "uyari"]>;
    ilgiliId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    tur: "gozetmen" | "derslik" | "ogretim-uyesi" | "musait-degil";
    mesaj: string;
    seviye: "kritik" | "uyari";
    ilgiliId?: string | undefined;
}, {
    tur: "gozetmen" | "derslik" | "ogretim-uyesi" | "musait-degil";
    mesaj: string;
    seviye: "kritik" | "uyari";
    ilgiliId?: string | undefined;
}>;
export type ExamConflict = z.infer<typeof ExamConflictSchema>;
