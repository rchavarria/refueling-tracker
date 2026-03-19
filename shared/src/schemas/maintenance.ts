import { z } from "zod";

/** Allowed maintenance types */
export const maintenanceTypeEnum = z.enum([
  "ITV",
  "AdBlue",
  "Wheels",
  "Oil",
  "Lights",
  "Brakes",
  "Repair",
  "Others",
]);

/** Human-readable labels for each maintenance type */
export const MAINTENANCE_TYPE_LABELS: Record<MaintenanceType, string> = {
  ITV: "ITV",
  AdBlue: "AdBlue",
  Wheels: "Wheels",
  Oil: "Oil",
  Lights: "Lights",
  Brakes: "Brakes",
  Repair: "Repair",
  Others: "Others",
};

/** Shape used when creating a maintenance record (no id, no vehicleId — extracted from route) */
export const createMaintenanceSchema = z.object({
  type: maintenanceTypeEnum,
  date: z.string().date("Date must be a valid date string"),
  mileage: z.number().int().positive("Mileage must be a positive integer"),
  description: z.string().min(1, "Description is required"),
  cost: z.number().nonnegative("Cost must be zero or a positive number"),
});

/** Partial version for PUT requests */
export const updateMaintenanceSchema = createMaintenanceSchema.partial();

/** Full maintenance as returned by the API (includes id and vehicleId) */
export const maintenanceSchema = createMaintenanceSchema.extend({
  id: z.number().int(),
  vehicleId: z.number().int(),
});

export type MaintenanceType = z.infer<typeof maintenanceTypeEnum>;
export type CreateMaintenance = z.infer<typeof createMaintenanceSchema>;
export type UpdateMaintenance = z.infer<typeof updateMaintenanceSchema>;
export type Maintenance = z.infer<typeof maintenanceSchema>;

