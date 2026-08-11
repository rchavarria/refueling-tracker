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
