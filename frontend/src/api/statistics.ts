import type {
  MonthlyConsumptionPerVehicleResponse,
  MonthlyKmPerVehicleResponse,
  PerRefuelingConsumptionResponse,
} from "@shared/schemas/statistics.js";

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

export async function fetchPerRefuelingConsumption(): Promise<PerRefuelingConsumptionResponse> {
  const res = await fetch("/api/statistics/per-refueling-consumption");
  if (!res.ok) throw new Error("Failed to load consumption per refueling");
  return res.json() as Promise<PerRefuelingConsumptionResponse>;
}
