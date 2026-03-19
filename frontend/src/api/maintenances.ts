import type { CreateMaintenance, Maintenance, UpdateMaintenance } from "@shared/schemas/maintenance.js";

export async function fetchVehicleMaintenances(vehicleId: number): Promise<Maintenance[]> {
  const res = await fetch(`/api/vehicles/${vehicleId}/maintenances`);
  if (!res.ok) throw new Error(`Failed to fetch maintenances for vehicle ${vehicleId}`);
  return res.json() as Promise<Maintenance[]>;
}

export async function createMaintenance(
  vehicleId: number,
  data: CreateMaintenance,
): Promise<Maintenance> {
  const res = await fetch(`/api/vehicles/${vehicleId}/maintenances`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = (await res.json()) as { error: unknown };
    throw new Error(JSON.stringify(body.error));
  }
  return res.json() as Promise<Maintenance>;
}

export async function updateMaintenance(
  id: number,
  data: UpdateMaintenance,
): Promise<Maintenance> {
  const res = await fetch(`/api/maintenances/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = (await res.json()) as { error: unknown };
    throw new Error(JSON.stringify(body.error));
  }
  return res.json() as Promise<Maintenance>;
}

export async function deleteMaintenance(id: number): Promise<void> {
  const res = await fetch(`/api/maintenances/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Failed to delete maintenance ${id}`);
}

