import type { Vehicle } from "../generated/prisma/client.js";
import prisma from "./prisma.js";

/**
 * Enriches a Prisma Vehicle record with `currentMileage`:
 * the maximum mileage registered across all refuelings for that vehicle,
 * or null if the vehicle has no refuelings yet.
 */
export async function enrichVehicleWithMileage(
  vehicle: Vehicle,
): Promise<Vehicle & { currentMileage: number | null }> {
  const result = await prisma.refueling.aggregate({
    where: { vehicleId: vehicle.id },
    _max: { mileage: true },
  });

  return { ...vehicle, currentMileage: result._max.mileage ?? null };
}
