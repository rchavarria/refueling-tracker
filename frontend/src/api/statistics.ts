import type { MonthlyAggregateResponse, MonthlyKmPerVehicleResponse } from "@shared/schemas/statistics.js";

export async function fetchMonthlyAggregate(): Promise<MonthlyAggregateResponse> {
  const res = await fetch("/api/statistics/monthly-aggregate");
  if (!res.ok) throw new Error("Failed to load monthly statistics");
  return res.json() as Promise<MonthlyAggregateResponse>;
}

export async function fetchMonthlyKmPerVehicle(): Promise<MonthlyKmPerVehicleResponse> {
  const res = await fetch("/api/statistics/monthly-km-per-vehicle");
  if (!res.ok) throw new Error("Failed to load monthly km per vehicle");
  return res.json() as Promise<MonthlyKmPerVehicleResponse>;
}

