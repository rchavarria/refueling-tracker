import type { RefuelingForStats } from "@shared/schemas/refueling.js";

/** Result of consumption calculation for a single refueling.
 *  All fields are null for the first refueling or when two consecutive
 *  refuelings share the same mileage value.
 */
export interface ConsumptionResult {
  kmTraveled: number | null;
  litersPer100km: number | null;
  costPerKm: number | null;
}

/**
 * Calculates consumption statistics between consecutive refuelings.
 *
 * @param refuelings - Array of refuelings ordered by date ASC (or mileage ASC).
 * @returns An array of `ConsumptionResult` with the same length as the input.
 *          The first entry always has all-null fields. Subsequent entries are
 *          null when two consecutive refuelings share the same mileage.
 */
export function calculateConsumption(refuelings: RefuelingForStats[]): ConsumptionResult[] {
  return refuelings.map((current, index) => {
    // First refueling — no previous reference point
    if (index === 0) {
      return { kmTraveled: null, litersPer100km: null, costPerKm: null };
    }

    const previous = refuelings[index - 1];
    const kmTraveled = current.mileage - previous.mileage;

    // Guard against equal or inverted mileage (should not happen with the
    // validateMileage middleware, but we handle it defensively)
    if (kmTraveled <= 0) {
      return { kmTraveled: null, litersPer100km: null, costPerKm: null };
    }

    const litersPer100km = round2((current.liters / kmTraveled) * 100);
    const costPerKm = round2(current.totalPrice / kmTraveled);

    return { kmTraveled, litersPer100km, costPerKm };
  });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

