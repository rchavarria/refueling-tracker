import { describe, expect, it } from "vitest";
import { calculateConsumption } from "./statistics.service.js";
import type { RefuelingForStats } from "@shared/schemas/refueling.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function r(mileage: number, liters: number, totalPrice: number): RefuelingForStats {
  return { mileage, liters, totalPrice };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("calculateConsumption", () => {
  describe("empty array", () => {
    it("returns an empty array", () => {
      expect(calculateConsumption([])).toEqual([]);
    });
  });

  describe("single refueling", () => {
    it("returns null for all fields — no previous reference point", () => {
      const result = calculateConsumption([r(10000, 40, 60)]);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ kmTraveled: null, litersPer100km: null, costPerKm: null });
    });
  });

  describe("two refuelings — normal case", () => {
    it("calculates km traveled, L/100km and €/km correctly", () => {
      // 500 km traveled, 35 L, 56 €
      // L/100km = 35/500*100 = 7.00
      // €/km    = 56/500     = 0.11 (rounded from 0.112)
      const result = calculateConsumption([r(1000, 40, 60), r(1500, 35, 56)]);

      expect(result[0]).toEqual({ kmTraveled: null, litersPer100km: null, costPerKm: null });
      expect(result[1]).toEqual({ kmTraveled: 500, litersPer100km: 7, costPerKm: 0.11 });
    });
  });

  describe("consecutive equal mileage", () => {
    it("returns null when two consecutive refuelings have the same mileage", () => {
      const result = calculateConsumption([r(1000, 40, 60), r(1000, 35, 56)]);

      expect(result[0]).toEqual({ kmTraveled: null, litersPer100km: null, costPerKm: null });
      expect(result[1]).toEqual({ kmTraveled: null, litersPer100km: null, costPerKm: null });
    });

    it("returns null only for the repeated pair, not subsequent valid entries", () => {
      // refueling[1] has same mileage as refueling[0] → null
      // refueling[2] has higher mileage than refueling[1] → calculated normally
      const result = calculateConsumption([r(1000, 40, 60), r(1000, 35, 56), r(1400, 30, 48)]);

      expect(result[1]).toEqual({ kmTraveled: null, litersPer100km: null, costPerKm: null });
      // 400 km traveled, 30 L, 48 €
      // L/100km = 30/400*100 = 7.50
      // €/km    = 48/400     = 0.12
      expect(result[2]).toEqual({ kmTraveled: 400, litersPer100km: 7.5, costPerKm: 0.12 });
    });
  });

  describe("rounding to 2 decimals", () => {
    it("rounds L/100km to 2 decimal places", () => {
      // 300 km, 40 L → 40/300*100 = 13.333... → 13.33
      const result = calculateConsumption([r(1000, 40, 60), r(1300, 40, 60)]);

      expect(result[1].litersPer100km).toBe(13.33);
    });

    it("rounds €/km to 2 decimal places", () => {
      // 300 km, 50 € → 50/300 = 0.1666... → 0.17
      const result = calculateConsumption([r(1000, 40, 50), r(1300, 40, 50)]);

      expect(result[1].costPerKm).toBe(0.17);
    });
  });

  describe("multiple refuelings", () => {
    it("returns results with correct length equal to input length", () => {
      const refuelings = [r(1000, 40, 60), r(1350, 35, 52.5), r(1700, 38, 57), r(2100, 42, 63)];
      const result = calculateConsumption(refuelings);

      expect(result).toHaveLength(4);
    });

    it("first entry is always null", () => {
      const refuelings = [r(1000, 40, 60), r(1350, 35, 52.5), r(1700, 38, 57)];
      const result = calculateConsumption(refuelings);

      expect(result[0]).toEqual({ kmTraveled: null, litersPer100km: null, costPerKm: null });
    });

    it("calculates each segment independently from its predecessor", () => {
      // Segment 1→2: 350 km, 35 L, 52.50 € → 10 L/100km, 0.15 €/km
      // Segment 2→3: 350 km, 38 L, 57.00 € → 10.86 L/100km, 0.16 €/km
      const result = calculateConsumption([r(1000, 40, 60), r(1350, 35, 52.5), r(1700, 38, 57)]);

      expect(result[1]).toEqual({ kmTraveled: 350, litersPer100km: 10, costPerKm: 0.15 });
      expect(result[2]).toEqual({ kmTraveled: 350, litersPer100km: 10.86, costPerKm: 0.16 });
    });
  });
});

