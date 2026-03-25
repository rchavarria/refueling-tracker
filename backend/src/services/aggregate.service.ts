import type { MonthlyAggregateRow, MonthlyConsumptionPerVehicleResponse, MonthlyKmPerVehicleResponse } from "@shared/schemas/statistics.js";
import { calculateConsumption } from "./statistics.service.js";
import prisma from "../lib/prisma.js";

// ---------------------------------------------------------------------------
// Shared helper: fetches per-vehicle monthly consumption data for the last 12 months
// ---------------------------------------------------------------------------

interface VehicleMonthlyEntry {
  monthKey: string;
  kmTraveled: number | null;
  liters: number;
  cost: number;
}

interface VehicleMonthlyData {
  vehicleId: number;
  vehicleName: string;
  entries: VehicleMonthlyEntry[];
}

export interface MonthlyDataResult {
  months: string[];
  vehicleData: VehicleMonthlyData[];
}

/**
 * Returns the list of 12 month keys and, for each vehicle that has refuelings,
 * the per-refueling consumption entries bucketed by month.
 * This is the shared foundation used by both `getMonthlyAggregate` and
 * `getMonthlyKmPerVehicle`.
 */
export async function getVehicleMonthlyData(): Promise<MonthlyDataResult> {
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
    select: { id: true, name: true },
  });

  const vehicleData: VehicleMonthlyData[] = [];

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

    const entries: VehicleMonthlyEntry[] = [];
    for (let i = startIndex; i < consumptionResults.length; i++) {
      const refueling = forStats[i];
      const result = consumptionResults[i];

      const refDate = new Date(refueling.date);
      const monthKey = `${refDate.getFullYear()}-${String(refDate.getMonth() + 1).padStart(2, "0")}`;

      entries.push({
        monthKey,
        kmTraveled: result.kmTraveled,
        liters: refueling.liters,
        cost: refueling.totalPrice,
      });
    }

    vehicleData.push({
      vehicleId: vehicle.id,
      vehicleName: vehicle.name,
      entries,
    });
  }

  return { months, vehicleData };
}

// ---------------------------------------------------------------------------
// getMonthlyAggregate — same behaviour as before, now uses shared helper
// ---------------------------------------------------------------------------

/**
 * Returns monthly aggregate statistics for the last 12 months across all vehicles.
 * Each row contains totals and averages for one month.
 */
export async function getMonthlyAggregate(): Promise<MonthlyAggregateRow[]> {
  const { months, vehicleData } = await getVehicleMonthlyData();

  // Accumulator: month → { totalKm, totalLiters, totalCost }
  const acc: Record<string, { totalKm: number; totalLiters: number; totalCost: number }> = {};
  for (const month of months) {
    acc[month] = { totalKm: 0, totalLiters: 0, totalCost: 0 };
  }

  for (const vehicle of vehicleData) {
    for (const entry of vehicle.entries) {
      if (!(entry.monthKey in acc)) continue;

      if (entry.kmTraveled !== null) {
        acc[entry.monthKey].totalKm += entry.kmTraveled;
      }
      acc[entry.monthKey].totalLiters += entry.liters;
      acc[entry.monthKey].totalCost += entry.cost;
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

// ---------------------------------------------------------------------------
// getMonthlyKmPerVehicle — km traveled per month broken down by vehicle
// ---------------------------------------------------------------------------

/**
 * Returns km traveled per month for the last 12 months, broken down per vehicle,
 * plus a total across all vehicles.
 */
export async function getMonthlyKmPerVehicle(): Promise<MonthlyKmPerVehicleResponse> {
  const { months, vehicleData } = await getVehicleMonthlyData();

  const vehicleNames = vehicleData.map((v) => v.vehicleName);

  // Accumulator: month → per-vehicle km (parallel array with vehicleData)
  const acc: Record<string, number[]> = {};
  for (const month of months) {
    acc[month] = new Array(vehicleData.length).fill(0);
  }

  for (let vIdx = 0; vIdx < vehicleData.length; vIdx++) {
    for (const entry of vehicleData[vIdx].entries) {
      if (!(entry.monthKey in acc)) continue;
      if (entry.kmTraveled !== null) {
        acc[entry.monthKey][vIdx] += entry.kmTraveled;
      }
    }
  }

  const rows = months.map((month) => {
    const vehicleKm = acc[month].map((km) => round2(km));
    const totalKm = round2(vehicleKm.reduce((sum, km) => sum + km, 0));
    return { month, vehicleKm, totalKm };
  });

  return { vehicles: vehicleNames, rows };
}

// ---------------------------------------------------------------------------
// getMonthlyConsumptionPerVehicle — L/100km per month broken down by vehicle
// ---------------------------------------------------------------------------

/**
 * Returns L/100km per month for the last 12 months, broken down per vehicle.
 * Months where a vehicle has no km data produce `null`.
 */
export async function getMonthlyConsumptionPerVehicle(): Promise<MonthlyConsumptionPerVehicleResponse> {
  const { months, vehicleData } = await getVehicleMonthlyData();

  const vehicleNames = vehicleData.map((v) => v.vehicleName);

  // Accumulator: month → per-vehicle { totalKm, totalLiters }
  const acc: Record<string, { totalKm: number; totalLiters: number }[]> = {};
  for (const month of months) {
    acc[month] = vehicleData.map(() => ({ totalKm: 0, totalLiters: 0 }));
  }

  for (let vIdx = 0; vIdx < vehicleData.length; vIdx++) {
    for (const entry of vehicleData[vIdx].entries) {
      if (!(entry.monthKey in acc)) continue;
      if (entry.kmTraveled !== null) {
        acc[entry.monthKey][vIdx].totalKm += entry.kmTraveled;
      }
      acc[entry.monthKey][vIdx].totalLiters += entry.liters;
    }
  }

  const rows = months.map((month) => {
    const vehicleLitersPer100km = acc[month].map((data) =>
      data.totalKm > 0 ? round2((data.totalLiters / data.totalKm) * 100) : null,
    );
    return { month, vehicleLitersPer100km };
  });

  return { vehicles: vehicleNames, rows };
}

// ---------------------------------------------------------------------------

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

