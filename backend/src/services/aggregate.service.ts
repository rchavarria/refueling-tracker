import type {
  MonthlyKmPerVehicleResponse,
  PerRefuelingConsumptionPoint,
  PerRefuelingConsumptionResponse,
} from "@shared/schemas/statistics.js";
import prisma from "../lib/prisma.js";
import { calculateConsumption } from "./statistics.service.js";

// ---------------------------------------------------------------------------
// Shared helper: fetches per-vehicle refueling consumption data for the last 12 months
// ---------------------------------------------------------------------------

interface VehicleRefuelingEntry {
  /** Month of the refueling (YYYY-MM, local time) */
  monthKey: string;
  /** ISO date (YYYY-MM-DD) of the refueling */
  date: string;
  kmTraveled: number | null;
  litersPer100km: number | null;
  liters: number;
}

interface VehicleRefuelingData {
  vehicleName: string;
  entries: VehicleRefuelingEntry[];
}

interface VehicleRefuelingDataResult {
  months: string[];
  vehicleData: VehicleRefuelingData[];
}

/**
 * Returns the list of 12 month keys and, for each vehicle that has refuelings,
 * the per-refueling consumption entries of the last 12 months.
 * This is the shared foundation used by `getMonthlyKmPerVehicle`
 * and `getPerRefuelingConsumption`.
 */
async function getVehicleRefuelingData(): Promise<VehicleRefuelingDataResult> {
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

  const vehicleData: VehicleRefuelingData[] = [];

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
    const forStats = reference ? [reference, ...refuelingsInRange] : refuelingsInRange;

    const statsInput = forStats.map((r) => ({
      mileage: r.mileage,
      liters: r.liters,
      totalPrice: r.totalPrice,
    }));

    const consumptionResults = calculateConsumption(statsInput);

    // Skip the reference result (index 0) if we had a reference
    const startIndex = reference ? 1 : 0;

    const entries: VehicleRefuelingEntry[] = [];
    for (let i = startIndex; i < consumptionResults.length; i++) {
      const refueling = forStats[i];
      const result = consumptionResults[i];

      const refDate = new Date(refueling.date);
      const monthKey = `${refDate.getFullYear()}-${String(refDate.getMonth() + 1).padStart(2, "0")}`;

      entries.push({
        monthKey,
        date: refDate.toISOString().slice(0, 10),
        kmTraveled: result.kmTraveled,
        litersPer100km: result.litersPer100km,
        liters: refueling.liters,
      });
    }

    vehicleData.push({
      vehicleName: vehicle.name,
      entries,
    });
  }

  return { months, vehicleData };
}

// ---------------------------------------------------------------------------
// getMonthlyKmPerVehicle — km traveled per month broken down by vehicle
// ---------------------------------------------------------------------------

/**
 * Returns km traveled per month for the last 12 months, broken down per vehicle.
 */
export async function getMonthlyKmPerVehicle(): Promise<MonthlyKmPerVehicleResponse> {
  const { months, vehicleData } = await getVehicleRefuelingData();

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

  const rows = months.map((month) => ({
    month,
    vehicleKm: acc[month].map((km) => round2(km)),
  }));

  return { vehicles: vehicleNames, rows };
}

// ---------------------------------------------------------------------------
// getPerRefuelingConsumption — L/100km for each individual refueling
// ---------------------------------------------------------------------------

/**
 * Returns L/100km for every refueling in the last 12 months (no aggregation),
 * one point per refueling, ordered by date ASC. Refuelings without a computable
 * consumption (first refueling ever or equal consecutive mileages) are omitted.
 */
export async function getPerRefuelingConsumption(): Promise<PerRefuelingConsumptionResponse> {
  const { vehicleData } = await getVehicleRefuelingData();

  const vehicles = vehicleData.map((v) => v.vehicleName);
  const points: PerRefuelingConsumptionPoint[] = [];

  vehicleData.forEach((vehicle, vehicleIndex) => {
    for (const entry of vehicle.entries) {
      if (entry.litersPer100km === null || entry.kmTraveled === null) continue;
      points.push({
        date: entry.date,
        vehicleIndex,
        litersPer100km: entry.litersPer100km,
        liters: entry.liters,
        kmTraveled: entry.kmTraveled,
      });
    }
  });

  points.sort((a, b) => a.date.localeCompare(b.date) || a.vehicleIndex - b.vehicleIndex);

  return { vehicles, points };
}

// ---------------------------------------------------------------------------

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
