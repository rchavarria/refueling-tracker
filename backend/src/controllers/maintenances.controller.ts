import { createMaintenanceSchema, updateMaintenanceSchema } from "@shared/schemas/maintenance.js";
import type { Request, Response } from "express";
import prisma from "../lib/prisma.js";

/** GET /api/vehicles/:id/maintenances — list all maintenances for a vehicle */
export async function listVehicleMaintenances(req: Request, res: Response): Promise<void> {
  const vehicleId = Number(req.params.id);

  if (Number.isNaN(vehicleId)) {
    res.status(400).json({ error: "Invalid vehicle ID" });
    return;
  }

  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });

  if (!vehicle) {
    res.status(404).json({ error: "Vehicle not found" });
    return;
  }

  const maintenances = await prisma.maintenance.findMany({
    where: { vehicleId },
    orderBy: { date: "desc" },
  });

  res.json(maintenances);
}

/** POST /api/vehicles/:id/maintenances — create a maintenance for a vehicle */
export async function createVehicleMaintenance(req: Request, res: Response): Promise<void> {
  const vehicleId = Number(req.params.id);

  if (Number.isNaN(vehicleId)) {
    res.status(400).json({ error: "Invalid vehicle ID" });
    return;
  }

  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });

  if (!vehicle) {
    res.status(404).json({ error: "Vehicle not found" });
    return;
  }

  const parsed = createMaintenanceSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    return;
  }

  const maintenance = await prisma.maintenance.create({
    data: {
      vehicleId,
      type: parsed.data.type,
      date: new Date(parsed.data.date),
      mileage: parsed.data.mileage,
      description: parsed.data.description,
      cost: parsed.data.cost,
    },
  });

  res.status(201).json(maintenance);
}

/** PUT /api/maintenances/:id — update a maintenance */
export async function updateMaintenance(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    res.status(400).json({ error: "Invalid maintenance ID" });
    return;
  }

  const parsed = updateMaintenanceSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    return;
  }

  const data: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.date !== undefined) {
    data.date = new Date(parsed.data.date);
  }

  try {
    const maintenance = await prisma.maintenance.update({
      where: { id },
      data,
    });
    res.json(maintenance);
  } catch (err: unknown) {
    if (isPrismaRecordNotFoundError(err)) {
      res.status(404).json({ error: "Maintenance not found" });
      return;
    }
    throw err;
  }
}

/** DELETE /api/maintenances/:id — delete a maintenance */
export async function deleteMaintenance(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    res.status(400).json({ error: "Invalid maintenance ID" });
    return;
  }

  try {
    await prisma.maintenance.delete({ where: { id } });
    res.status(204).send();
  } catch (err: unknown) {
    if (isPrismaRecordNotFoundError(err)) {
      res.status(404).json({ error: "Maintenance not found" });
      return;
    }
    throw err;
  }
}

// --- Prisma error helpers ---

function isPrismaRecordNotFoundError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code: string }).code === "P2025"
  );
}
