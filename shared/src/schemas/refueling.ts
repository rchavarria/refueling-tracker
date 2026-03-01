import { z } from "zod";

/** Shape used when creating a refueling (no id, no vehicleId — extracted from route) */
export const createRefuelingSchema = z.object({
  date: z.string()
    .date("Date must be a valid date string"),
  liters: z.number().positive("Liters must be a positive number"),
  totalPrice: z.number().positive("Total price must be a positive number"),
  mileage: z.number().int().positive("Mileage must be a positive integer"),
  station: z.string().optional(),
});

/** Partial version for PATCH requests */
export const updateRefuelingSchema = createRefuelingSchema.partial();

/** Full refueling as returned by the API (includes id and vehicleId) */
export const refuelingSchema = createRefuelingSchema.extend({
  id: z.number().int(),
  vehicleId: z.number().int(),
});

/** Minimal shape needed to calculate consumption statistics */
export const refuelingForStatsSchema = z.object({
  mileage: z.number().int().positive(),
  liters: z.number().positive(),
  totalPrice: z.number().positive(),
});

export type CreateRefueling = z.infer<typeof createRefuelingSchema>;
export type UpdateRefueling = z.infer<typeof updateRefuelingSchema>;
export type Refueling = z.infer<typeof refuelingSchema>;
export type RefuelingForStats = z.infer<typeof refuelingForStatsSchema>;

