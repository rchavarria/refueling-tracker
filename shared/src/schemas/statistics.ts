import { z } from "zod";

/** Schema for a single row of monthly aggregate statistics */
export const monthlyAggregateRowSchema = z.object({
  month: z.string(),
  totalKm: z.number(),
  totalLiters: z.number(),
  totalCost: z.number(),
  avgLitersPer100km: z.number().nullable(),
  avgCostPerKm: z.number().nullable(),
});

/** Response schema: array of monthly aggregate rows */
export const monthlyAggregateResponseSchema = z.array(monthlyAggregateRowSchema);

export type MonthlyAggregateRow = z.infer<typeof monthlyAggregateRowSchema>;
export type MonthlyAggregateResponse = z.infer<typeof monthlyAggregateResponseSchema>;

