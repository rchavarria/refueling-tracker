import type { MonthlyAggregateResponse } from "@shared/schemas/statistics.js";

export async function fetchMonthlyAggregate(): Promise<MonthlyAggregateResponse> {
  const res = await fetch("/api/statistics/monthly-aggregate");
  if (!res.ok) throw new Error("Failed to load monthly statistics");
  return res.json() as Promise<MonthlyAggregateResponse>;
}

