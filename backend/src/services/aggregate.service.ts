import type { MonthlyAggregateRow } from "@shared/schemas/statistics.js";
import { calculateConsumption } from "./statistics.service.js";
import prisma from "../lib/prisma.js";

/**
 * Returns monthly aggregate statistics for the last 12 months across all vehicles.
 * Each row contains totals and averages for one month.
 */
export async function getMonthlyAggregate(): Promise<MonthlyAggregateRow[]> {
  const now = new Date();
  const cutoffDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);

  // Generate the list of 12 months (YYYY-MM) from cutoff to current month
  const months: string[] = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(cutoffDate.getFullYear(), cutoffDate.getMonth() + i, 1);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    months.push(`${yyyy}-${mm}`);
  }

  // Get all vehicles with at least one refueling
  const vehicles = await prisma.vehicle.findMany({
    where: { refuelings: { some: {} } },
    select: { id: true },
  });

  // Accumulator: month → { totalKm, totalLiters, totalCost }
  const acc: Record<string, { totalKm: number; totalLiters: number; totalCost: number }> = {};
  for (const month of months) {
    acc[month] = { totalKm: 0, totalLiters: 0, totalCost: 0 };
  }

  for (const vehicle of vehicles) {
    // Refuelings within the range
    const refuelingsInRange = await prisma.refueling.findMany({
      where: { vehicleId: vehicle.id, date: { gte: cutoffDate } },
      orderBy: { date: "asc" },
    });

    if (refuelingsInRange.length === 0) continue;

    // Reference refueling: last one before the cutoff date
    const reference = await prisma.refueling.findFirst({
      where: { vehicleId: vehicle.id, date: { lt: cutoffDate } },
      orderBy: { date: "desc" },
    });

    // Build the input for calculateConsumption
    const forStats = reference
      ? [reference, ...refuelingsInRange]
      : refuelingsInRange;

    const statsInput = forStats.map((r) => ({
      mileage: r.mileage,
      liters: r.liters,
      totalPrice: r.totalPrice,
    }));

    const consumptionResults = calculateConsumption(statsInput);

    // Skip the reference result (index 0) if we had a reference
    const startIndex = reference ? 1 : 0;

    for (let i = startIndex; i < consumptionResults.length; i++) {
      const refueling = forStats[i];
      const result = consumptionResults[i];

      const refDate = new Date(refueling.date);
      const monthKey = `${refDate.getFullYear()}-${String(refDate.getMonth() + 1).padStart(2, "0")}`;

      if (!(monthKey in acc)) continue; // outside our 12-month window

      if (result.kmTraveled !== null) {
        acc[monthKey].totalKm += result.kmTraveled;
      }
      acc[monthKey].totalLiters += refueling.liters;
      acc[monthKey].totalCost += refueling.totalPrice;
    }
  }

  // Build the response array
  return months.map((month) => {
    const data = acc[month];
    const totalKm = round2(data.totalKm);
    const totalLiters = round2(data.totalLiters);
    const totalCost = round2(data.totalCost);

    return {
      month,
      totalKm,
      totalLiters,
      totalCost,
      avgLitersPer100km: totalKm > 0 ? round2((totalLiters / totalKm) * 100) : null,
      avgCostPerKm: totalKm > 0 ? round2(totalCost / totalKm) : null,
    };
  });
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

