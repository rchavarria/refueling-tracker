import { z } from "zod";

/** Shape used when creating a vehicle (no id) */
export const createVehicleSchema = z.object({
  name: z.string().min(1, "Vehicle name is required"),
  brand: z.string().min(1, "Brand is required"),
  model: z.string().min(1, "Model is required"),
  licensePlate: z.string().min(1, "License plate is required"),
  year: z.number().int().min(1886, "Year must be a valid year"),
});

/** Partial version for PATCH requests */
export const updateVehicleSchema = createVehicleSchema.partial();

/** Full vehicle as returned by the API (includes id) */
export const vehicleSchema = createVehicleSchema.extend({
  id: z.number().int(),
});

export type CreateVehicle = z.infer<typeof createVehicleSchema>;
export type UpdateVehicle = z.infer<typeof updateVehicleSchema>;
export type Vehicle = z.infer<typeof vehicleSchema>;

