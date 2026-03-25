import type { MonthlyConsumptionPerVehicleResponse, MonthlyKmPerVehicleResponse } from "@shared/schemas/statistics.js";

export async function fetchMonthlyKmPerVehicle(): Promise<MonthlyKmPerVehicleResponse> {
  const res = await fetch("/api/statistics/monthly-km-per-vehicle");
  if (!res.ok) throw new Error("Failed to load monthly km per vehicle");
  return res.json() as Promise<MonthlyKmPerVehicleResponse>;
}

export async function fetchMonthlyConsumptionPerVehicle(): Promise<MonthlyConsumptionPerVehicleResponse> {
  const res = await fetch("/api/statistics/monthly-consumption-per-vehicle");
  if (!res.ok) throw new Error("Failed to load monthly consumption per vehicle");
  return res.json() as Promise<MonthlyConsumptionPerVehicleResponse>;
}

