import type { CreateVehicle, Vehicle } from "@shared/schemas/vehicle.js";

const BASE = "/api/vehicles";

export async function fetchVehicles(): Promise<Vehicle[]> {
  const res = await fetch(BASE);
  if (!res.ok) throw new Error("Failed to fetch vehicles");
  return res.json() as Promise<Vehicle[]>;
}

export async function fetchVehicle(id: number): Promise<Vehicle> {
  const res = await fetch(`${BASE}/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch vehicle ${id}`);
  return res.json() as Promise<Vehicle>;
}

export async function createVehicle(data: CreateVehicle): Promise<Vehicle> {
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = (await res.json()) as { error: unknown };
    throw new Error(JSON.stringify(body.error));
  }
  return res.json() as Promise<Vehicle>;
}

