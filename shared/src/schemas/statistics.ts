import { z } from "zod";

/** Schema for the km-per-vehicle-per-month response */
export const monthlyKmPerVehicleResponseSchema = z.object({
  vehicles: z.array(z.string()),
  rows: z.array(
    z.object({
      month: z.string(),
      vehicleKm: z.array(z.number()),
    }),
  ),
});

export type MonthlyKmPerVehicleResponse = z.infer<typeof monthlyKmPerVehicleResponseSchema>;

/** Schema for the L/100km-per-refueling response (last 12 months, no aggregation) */
export const perRefuelingConsumptionResponseSchema = z.object({
  vehicles: z.array(z.string()),
  points: z.array(
    z.object({
      /** ISO date (YYYY-MM-DD) */
      date: z.string(),
      /** Index into `vehicles` */
      vehicleIndex: z.number().int().nonnegative(),
      litersPer100km: z.number(),
      liters: z.number(),
      kmTraveled: z.number(),
    }),
  ),
});

export type PerRefuelingConsumptionResponse = z.infer<typeof perRefuelingConsumptionResponseSchema>;
export type PerRefuelingConsumptionPoint = PerRefuelingConsumptionResponse["points"][number];
