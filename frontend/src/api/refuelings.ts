import type { CreateRefueling, Refueling } from "@shared/schemas/refueling.js";

export async function fetchVehicleRefuelings(vehicleId: number): Promise<Refueling[]> {
  const res = await fetch(`/api/vehicles/${vehicleId}/refuelings`);
  if (!res.ok) throw new Error(`Failed to fetch refuelings for vehicle ${vehicleId}`);
  return res.json() as Promise<Refueling[]>;
}

export async function createRefueling(
  vehicleId: number,
  data: CreateRefueling,
): Promise<Refueling> {
  const res = await fetch(`/api/vehicles/${vehicleId}/refuelings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = (await res.json()) as { error: unknown };
    throw new Error(JSON.stringify(body.error));
  }
  return res.json() as Promise<Refueling>;
}

