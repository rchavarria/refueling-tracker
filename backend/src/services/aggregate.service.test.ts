import { describe, expect, it, vi, beforeEach } from "vitest";
import type { MonthlyAggregateRow } from "@shared/schemas/statistics.js";

// ---------------------------------------------------------------------------
// Mock Prisma
// ---------------------------------------------------------------------------

const mockFindMany = vi.fn();
const mockFindFirst = vi.fn();
const mockRefuelingFindMany = vi.fn();

vi.mock("../lib/prisma.js", () => ({
  default: {
    vehicle: { findMany: (...args: unknown[]) => mockFindMany(...args) },
    refueling: {
      findMany: (...args: unknown[]) => mockRefuelingFindMany(...args),
      findFirst: (...args: unknown[]) => mockFindFirst(...args),
    },
  },
}));

import { getMonthlyAggregate } from "./aggregate.service.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Creates a refueling record for testing */
function refueling(date: string, mileage: number, liters: number, totalPrice: number) {
  return { id: 1, vehicleId: 1, date: new Date(date), mileage, liters, totalPrice, station: "" };
}

/** Fix "now" to 2026-03-15 for deterministic tests */
function fixDate() {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-03-15"));
}

function restoreDate() {
  vi.useRealTimers();
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("getMonthlyAggregate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fixDate();
  });

  afterEach(() => {
    restoreDate();
  });

  it("returns 12 rows with zeros and null averages when there are no vehicles", async () => {
    mockFindMany.mockResolvedValue([]);

    const result = await getMonthlyAggregate();

    expect(result).toHaveLength(12);
    expect(result[0].month).toBe("2025-04");
    expect(result[11].month).toBe("2026-03");

    for (const row of result) {
      expect(row.totalKm).toBe(0);
      expect(row.totalLiters).toBe(0);
      expect(row.totalCost).toBe(0);
      expect(row.avgLitersPer100km).toBeNull();
      expect(row.avgCostPerKm).toBeNull();
    }
  });

  it("calculates aggregates for one vehicle with refuelings across months", async () => {
    mockFindMany.mockResolvedValue([{ id: 1 }]);

    // Refuelings in range (cutoff = 2025-04-01)
    mockRefuelingFindMany.mockResolvedValue([
      refueling("2025-05-10", 11000, 40, 60),
      refueling("2025-06-15", 11500, 35, 52.5),
    ]);

    // Reference refueling before cutoff
    mockFindFirst.mockResolvedValue(refueling("2025-03-20", 10500, 38, 57));

    const result = await getMonthlyAggregate();

    // May: ref → 11000, previous (reference) → 10500, km = 500, liters = 40, cost = 60
    const may = result.find((r) => r.month === "2025-05")!;
    expect(may.totalKm).toBe(500);
    expect(may.totalLiters).toBe(40);
    expect(may.totalCost).toBe(60);
    expect(may.avgLitersPer100km).toBe(8); // (40/500)*100
    expect(may.avgCostPerKm).toBe(0.12); // 60/500

    // June: previous → 11000, current → 11500, km = 500, liters = 35, cost = 52.5
    const june = result.find((r) => r.month === "2025-06")!;
    expect(june.totalKm).toBe(500);
    expect(june.totalLiters).toBe(35);
    expect(june.totalCost).toBe(52.5);
    expect(june.avgLitersPer100km).toBe(7); // (35/500)*100
    expect(june.avgCostPerKm).toBe(0.11); // 52.5/500 = 0.105 → 0.11
  });

  it("aggregates data from multiple vehicles in the same month", async () => {
    mockFindMany.mockResolvedValue([{ id: 1 }, { id: 2 }]);

    // Vehicle 1: refueling in May
    mockRefuelingFindMany
      .mockResolvedValueOnce([refueling("2025-05-10", 11000, 40, 60)])
      .mockResolvedValueOnce([refueling("2025-05-12", 21000, 30, 45)]);

    // References
    mockFindFirst
      .mockResolvedValueOnce(refueling("2025-03-20", 10500, 38, 57))  // vehicle 1
      .mockResolvedValueOnce(refueling("2025-03-25", 20600, 32, 48)); // vehicle 2

    const result = await getMonthlyAggregate();

    const may = result.find((r) => r.month === "2025-05")!;
    // Vehicle 1: km = 500, liters = 40, cost = 60
    // Vehicle 2: km = 400, liters = 30, cost = 45
    // Total: km = 900, liters = 70, cost = 105
    expect(may.totalKm).toBe(900);
    expect(may.totalLiters).toBe(70);
    expect(may.totalCost).toBe(105);
    expect(may.avgLitersPer100km).toBe(7.78); // (70/900)*100 = 7.777... → 7.78
    expect(may.avgCostPerKm).toBe(0.12); // 105/900 = 0.1166... → 0.12
  });

  it("returns null averages for months with totalKm === 0", async () => {
    mockFindMany.mockResolvedValue([{ id: 1 }]);

    // No refuelings in range
    mockRefuelingFindMany.mockResolvedValue([]);
    mockFindFirst.mockResolvedValue(null);

    const result = await getMonthlyAggregate();

    for (const row of result) {
      expect(row.avgLitersPer100km).toBeNull();
      expect(row.avgCostPerKm).toBeNull();
    }
  });

  it("uses reference refueling before range for first in-range km calculation", async () => {
    mockFindMany.mockResolvedValue([{ id: 1 }]);

    // Only one refueling in range — needs reference to calculate km
    mockRefuelingFindMany.mockResolvedValue([
      refueling("2025-05-10", 10800, 35, 52.5),
    ]);
    mockFindFirst.mockResolvedValue(refueling("2025-03-01", 10500, 40, 60));

    const result = await getMonthlyAggregate();

    const may = result.find((r) => r.month === "2025-05")!;
    // km = 10800 - 10500 = 300
    expect(may.totalKm).toBe(300);
    expect(may.totalLiters).toBe(35);
    expect(may.totalCost).toBe(52.5);
    expect(may.avgLitersPer100km).toBe(11.67); // (35/300)*100 = 11.666... → 11.67
    expect(may.avgCostPerKm).toBe(0.18); // 52.5/300 = 0.175 → 0.18
  });

  it("handles first in-range refueling without reference (null km for first entry)", async () => {
    mockFindMany.mockResolvedValue([{ id: 1 }]);

    // No reference before cutoff
    mockFindFirst.mockResolvedValue(null);

    // Two refuelings: first has null km, second is calculated
    mockRefuelingFindMany.mockResolvedValue([
      refueling("2025-05-10", 10500, 40, 60),
      refueling("2025-06-15", 11000, 35, 52.5),
    ]);

    const result = await getMonthlyAggregate();

    // May: first refueling with no reference → kmTraveled = null, but liters/cost still added
    const may = result.find((r) => r.month === "2025-05")!;
    expect(may.totalKm).toBe(0); // no km could be calculated
    expect(may.totalLiters).toBe(40);
    expect(may.totalCost).toBe(60);
    expect(may.avgLitersPer100km).toBeNull();
    expect(may.avgCostPerKm).toBeNull();

    // June: km = 500
    const june = result.find((r) => r.month === "2025-06")!;
    expect(june.totalKm).toBe(500);
  });

  it("returns months ordered ASC from oldest to newest", async () => {
    mockFindMany.mockResolvedValue([]);

    const result = await getMonthlyAggregate();

    const monthsInOrder = result.map((r) => r.month);
    const sorted = [...monthsInOrder].sort();
    expect(monthsInOrder).toEqual(sorted);
  });
});

// Need afterEach import
import { afterEach } from "vitest";

