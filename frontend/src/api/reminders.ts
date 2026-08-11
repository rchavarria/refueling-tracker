import type { CreateReminder, Reminder, UpdateReminder } from "@shared/schemas/reminder.js";
import type { Vehicle } from "@shared/schemas/vehicle.js";

export async function fetchVehicleReminders(vehicleId: number): Promise<Reminder[]> {
  const res = await fetch(`/api/vehicles/${vehicleId}/reminders`);
  if (!res.ok) throw new Error(`Failed to fetch reminders for vehicle ${vehicleId}`);
  return res.json() as Promise<Reminder[]>;
}

export async function fetchUpcomingReminders(): Promise<(Reminder & { vehicle: Vehicle })[]> {
  const res = await fetch("/api/reminders/upcoming");
  if (!res.ok) throw new Error("Failed to fetch upcoming reminders");
  return res.json() as Promise<(Reminder & { vehicle: Vehicle })[]>;
}

export async function createReminder(vehicleId: number, data: CreateReminder): Promise<Reminder> {
  const res = await fetch(`/api/vehicles/${vehicleId}/reminders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = (await res.json()) as { error: unknown };
    throw new Error(JSON.stringify(body.error));
  }
  return res.json() as Promise<Reminder>;
}

export async function updateReminder(id: number, data: UpdateReminder): Promise<Reminder> {
  const res = await fetch(`/api/reminders/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = (await res.json()) as { error: unknown };
    throw new Error(JSON.stringify(body.error));
  }
  return res.json() as Promise<Reminder>;
}

export async function deleteReminder(id: number): Promise<void> {
  const res = await fetch(`/api/reminders/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Failed to delete reminder ${id}`);
}
