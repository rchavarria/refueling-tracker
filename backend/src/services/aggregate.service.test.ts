import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

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

import { getMonthlyConsumptionPerVehicle, getMonthlyKmPerVehicle } from "./aggregate.service.js";

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


// ---------------------------------------------------------------------------
// getMonthlyKmPerVehicle
// ---------------------------------------------------------------------------

describe("getMonthlyKmPerVehicle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fixDate();
  });

  afterEach(() => {
    restoreDate();
  });

  it("returns empty vehicles array and 12 rows when there are no vehicles", async () => {
    mockFindMany.mockResolvedValue([]);

    const result = await getMonthlyKmPerVehicle();

    expect(result.vehicles).toEqual([]);
    expect(result.rows).toHaveLength(12);
    expect(result.rows[0].month).toBe("2025-04");
    expect(result.rows[11].month).toBe("2026-03");

    for (const row of result.rows) {
      expect(row.vehicleKm).toEqual([]);
      expect(row.totalKm).toBe(0);
    }
  });

  it("returns km per vehicle broken down by month for a single vehicle", async () => {
    mockFindMany.mockResolvedValue([{ id: 1, name: "Honda" }]);

    mockRefuelingFindMany.mockResolvedValue([
      refueling("2025-05-10", 11000, 40, 60),
      refueling("2025-06-15", 11500, 35, 52.5),
    ]);
    mockFindFirst.mockResolvedValue(refueling("2025-03-20", 10500, 38, 57));

    const result = await getMonthlyKmPerVehicle();

    expect(result.vehicles).toEqual(["Honda"]);

    const may = result.rows.find((r) => r.month === "2025-05")!;
    expect(may.vehicleKm).toEqual([500]);
    expect(may.totalKm).toBe(500);

    const june = result.rows.find((r) => r.month === "2025-06")!;
    expect(june.vehicleKm).toEqual([500]);
    expect(june.totalKm).toBe(500);

    // A month with no data should have 0
    const july = result.rows.find((r) => r.month === "2025-07")!;
    expect(july.vehicleKm).toEqual([0]);
    expect(july.totalKm).toBe(0);
  });

  it("returns per-vehicle breakdown for multiple vehicles", async () => {
    mockFindMany.mockResolvedValue([{ id: 1, name: "Honda" }, { id: 2, name: "Toyota" }]);

    // Vehicle 1
    mockRefuelingFindMany
      .mockResolvedValueOnce([refueling("2025-05-10", 11000, 40, 60)])
      .mockResolvedValueOnce([refueling("2025-05-12", 21000, 30, 45)]);

    mockFindFirst
      .mockResolvedValueOnce(refueling("2025-03-20", 10500, 38, 57))
      .mockResolvedValueOnce(refueling("2025-03-25", 20600, 32, 48));

    const result = await getMonthlyKmPerVehicle();

    expect(result.vehicles).toEqual(["Honda", "Toyota"]);

    const may = result.rows.find((r) => r.month === "2025-05")!;
    // Honda: 11000 - 10500 = 500, Toyota: 21000 - 20600 = 400
    expect(may.vehicleKm).toEqual([500, 400]);
    expect(may.totalKm).toBe(900);
  });

  it("shows 0 km for a vehicle with no refuelings in a given month", async () => {
    mockFindMany.mockResolvedValue([{ id: 1, name: "Honda" }, { id: 2, name: "Toyota" }]);

    // Honda has refueling in May, Toyota has refueling in June
    mockRefuelingFindMany
      .mockResolvedValueOnce([refueling("2025-05-10", 11000, 40, 60)])
      .mockResolvedValueOnce([refueling("2025-06-12", 21000, 30, 45)]);

    mockFindFirst
      .mockResolvedValueOnce(refueling("2025-03-20", 10500, 38, 57))
      .mockResolvedValueOnce(refueling("2025-03-25", 20600, 32, 48));

    const result = await getMonthlyKmPerVehicle();

    const may = result.rows.find((r) => r.month === "2025-05")!;
    // Honda: 500, Toyota: 0 (no refueling that month)
    expect(may.vehicleKm).toEqual([500, 0]);
    expect(may.totalKm).toBe(500);

    const june = result.rows.find((r) => r.month === "2025-06")!;
    // Honda: 0, Toyota: 400
    expect(june.vehicleKm).toEqual([0, 400]);
    expect(june.totalKm).toBe(400);
  });
});

// ---------------------------------------------------------------------------
// getMonthlyConsumptionPerVehicle
// ---------------------------------------------------------------------------

describe("getMonthlyConsumptionPerVehicle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fixDate();
  });

  afterEach(() => {
    restoreDate();
  });

  it("returns empty vehicles and 12 rows with empty arrays when there are no vehicles", async () => {
    mockFindMany.mockResolvedValue([]);

    const result = await getMonthlyConsumptionPerVehicle();

    expect(result.vehicles).toEqual([]);
    expect(result.rows).toHaveLength(12);
    expect(result.rows[0].month).toBe("2025-04");
    expect(result.rows[11].month).toBe("2026-03");

    for (const row of result.rows) {
      expect(row.vehicleLitersPer100km).toEqual([]);
    }
  });

  it("returns L/100km per vehicle for a single vehicle with data", async () => {
    mockFindMany.mockResolvedValue([{ id: 1, name: "Honda" }]);

    // Two refuelings in May: reference at 10500, then 11000 (500km, 40L) and 11500 (500km, 35L)
    mockRefuelingFindMany.mockResolvedValue([
      refueling("2025-05-10", 11000, 40, 60),
      refueling("2025-05-25", 11500, 35, 52.5),
    ]);
    mockFindFirst.mockResolvedValue(refueling("2025-03-20", 10500, 38, 57));

    const result = await getMonthlyConsumptionPerVehicle();

    expect(result.vehicles).toEqual(["Honda"]);

    const may = result.rows.find((r) => r.month === "2025-05")!;
    // totalKm = 500 + 500 = 1000, totalLiters = 40 + 35 = 75
    // L/100km = (75 / 1000) * 100 = 7.5
    expect(may.vehicleLitersPer100km).toEqual([7.5]);

    // Month with no data → null
    const july = result.rows.find((r) => r.month === "2025-07")!;
    expect(july.vehicleLitersPer100km).toEqual([null]);
  });

  it("returns per-vehicle L/100km for two vehicles with data in different months", async () => {
    mockFindMany.mockResolvedValue([{ id: 1, name: "Honda" }, { id: 2, name: "Toyota" }]);

    // Honda: refueling in May
    mockRefuelingFindMany
      .mockResolvedValueOnce([refueling("2025-05-10", 11000, 40, 60)])
      .mockResolvedValueOnce([refueling("2025-06-12", 21000, 30, 45)]);

    mockFindFirst
      .mockResolvedValueOnce(refueling("2025-03-20", 10500, 38, 57))
      .mockResolvedValueOnce(refueling("2025-03-25", 20600, 32, 48));

    const result = await getMonthlyConsumptionPerVehicle();

    expect(result.vehicles).toEqual(["Honda", "Toyota"]);

    const may = result.rows.find((r) => r.month === "2025-05")!;
    // Honda: km=500, liters=40 → 8.0 L/100km. Toyota: no data → null
    expect(may.vehicleLitersPer100km).toEqual([8, null]);

    const june = result.rows.find((r) => r.month === "2025-06")!;
    // Honda: no data → null. Toyota: km=400, liters=30 → 7.5 L/100km
    expect(june.vehicleLitersPer100km).toEqual([null, 7.5]);
  });
});

