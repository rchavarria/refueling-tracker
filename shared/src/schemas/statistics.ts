import { z } from "zod";

/** Schema for the km-per-vehicle-per-month response */
export const monthlyKmPerVehicleResponseSchema = z.object({
  vehicles: z.array(z.string()),
  rows: z.array(
    z.object({
      month: z.string(),
      vehicleKm: z.array(z.number()),
      totalKm: z.number(),
    }),
  ),
});

export type MonthlyKmPerVehicleResponse = z.infer<typeof monthlyKmPerVehicleResponseSchema>;
export type MonthlyKmPerVehicleRow = MonthlyKmPerVehicleResponse["rows"][number];

/** Schema for the L/100km-per-vehicle-per-month response */
export const monthlyConsumptionPerVehicleResponseSchema = z.object({
  vehicles: z.array(z.string()),
  rows: z.array(
    z.object({
      month: z.string(),
      vehicleLitersPer100km: z.array(z.number().nullable()),
    }),
  ),
});

export type MonthlyConsumptionPerVehicleResponse = z.infer<
  typeof monthlyConsumptionPerVehicleResponseSchema
>;

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
